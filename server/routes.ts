import { hashPassword, randomToken, sha256, verifyPassword } from "./crypto";
import { claimDevice, checkDevice, listDevices, releaseDevice, removeDevice } from "./devices";
import type { Env } from "./env";
import { HttpError, assertJson, assertSameOrigin, body, clientIp, fail, json, redirect, safeNext, str } from "./http";
import { linkEmail, mailConfigured, sendMail } from "./mail";
import { type Provider, appleConfigured, clearStateCookie, finishOAuth, googleConfigured, startOAuth, verifyGoogleIdToken } from "./oauth";
import { hit, overLimit, peeked, rateLimit, usedStmt } from "./ratelimit";
import { type NewSession, type Session, appVersion, bearer, clearSessionCookie, createSession, forgetReusedSessions, getSession, isApp, newSession, note, requireSession, reuseSession, rotateSession } from "./session";
import { adminRoutes } from "./admin";
import { currentLook, lookRoutes } from "./look";
import { visitRoutes } from "./visits";
import { studyRoutes } from "./study";
import { prefRoutes } from "./prefs";
import { insightRoutes } from "./insights";
import { appRoutes } from "./app";
import { supportRoutes } from "./support";
import { offlineRoutes, revokeDevicePacks, revokeUserPacks } from "./offline";
import { checkCode, sendCode, smsConfigured } from "./sms";
import { checkCaptcha } from "./turnstile";
import { checkIntegrity } from "./integrity";
import { type UserRow, USER_COLUMNS, createUser, publicUser, publicUserById, userByEmail, userById, userByPhone, userForOAuth } from "./users";
import { normalisePhone } from "../lib/phone";

const HOUR = 60 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Ctx = { env: Env; request: Request; db: D1Database; ip: string; origin: string; fresh?: Session };

/* A sign-in's answer. The website gets the session as a cookie; the app gets the secret in the body and keeps it itself. */
const signedIn = (request: Request, s: NewSession, extra: Record<string, unknown> = {}) =>
  isApp(request)
    ? json({ ok: true, ...extra, token: s.token, expiresAt: s.expiresAt })
    : json({ ok: true, ...extra }, { headers: { "set-cookie": s.cookie } });

/* Proof that a person, not a script, is signing in: Turnstile on the website; in the app, which can't show Turnstile,
   Google's Play Integrity check (server/integrity.ts). */
async function humanCheck(c: Ctx, b: Record<string, unknown>): Promise<void> {
  if (isApp(c.request)) await checkIntegrity(c.env, { action: "auth", deviceKey: str(b.deviceKey, 64), token: b.integrity });
  else await checkCaptcha(c.env, b.captcha, c.ip);
}

function password(v: unknown): string {
  const p = typeof v === "string" ? v : "";
  if (p.length < 8) throw fail(400, "weak_password", "Use at least 8 characters for your password.");
  if (p.length > 200) throw fail(400, "weak_password", "That password is too long.");
  return p;
}

function email(v: unknown): string {
  const e = str(v, 254).toLowerCase();
  if (!EMAIL_RE.test(e)) throw fail(400, "bad_email", "Please enter a valid email address.");
  return e;
}

function name(v: unknown, required: boolean): string {
  const n = str(v, 80).replace(/\s+/g, " ");
  if (required && n.length < 2) throw fail(400, "bad_name", "Please enter your name.");
  return n;
}

/* The end of every sign-in on the website. The browser sends its device id along, so the same request that signs it in
   also makes it the account's active device (what /api/device/claim does), and the answer carries the account for the
   pages to draw with: one request instead of three before the dashboard can open. The app claims its device itself. */
async function enter(c: Ctx, b: Record<string, unknown>, who: string | { user: UserRow; linked: { provider: string }[] }, extra: Record<string, unknown> = {}): Promise<Response> {
  const deviceKey = str(b.deviceKey, 64);
  const userId = typeof who === "string" ? who : who.user.id;
  if (isApp(c.request) || !/^[0-9a-f-]{36}$/i.test(deviceKey)) return signedIn(c.request, await createSession(c.db, userId, c.request), extra);
  let known = typeof who === "string" ? null : who;
  if (!known) {
    const [user, linked] = await c.db.batch([
      c.db.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`).bind(userId),
      c.db.prepare("SELECT provider FROM identities WHERE user_id = ?").bind(userId),
    ]);
    const u = user!.results[0] as UserRow | undefined;
    if (!u) throw fail(401, "signed_out", "Please sign in.");
    known = { user: u, linked: linked!.results as { provider: string }[] };
  }
  const made = await newSession(c.db, known.user, c.request);
  // The session is new, so there is no older cookie to replace when this takes the account over from another device.
  const claim = await claimDevice(c.db, made.session, deviceKey, str(b.label, 80), { platform: "web", appVersion: null }, [made.save]);
  const device = claim.status === "active" ? { status: claim.status, takeovers_today: claim.takeovers_today } : claim;
  // As the next request would read it from the database: on its device, and holding the account.
  if (claim.status === "active") c.fresh = { ...made.session, device_id: claim.device_id, active_session_id: made.session.id };
  return signedIn(c.request, made.out, { ...extra, user: await publicUser(c.db, known.user, known.linked), device });
}

async function newToken(db: D1Database, userId: string, kind: "verify_email" | "reset_password", ttl: number): Promise<string> {
  const token = randomToken();
  await db.batch([
    db.prepare("UPDATE tokens SET used_at = ? WHERE user_id = ? AND kind = ? AND used_at IS NULL").bind(Date.now(), userId, kind),
    db.prepare("INSERT INTO tokens (id, user_id, kind, expires_at) VALUES (?, ?, ?, ?)").bind(await sha256(token), userId, kind, Date.now() + ttl),
  ]);
  return token;
}

async function useToken(db: D1Database, token: unknown, kind: "verify_email" | "reset_password"): Promise<string> {
  const id = await sha256(str(token, 200));
  const row = await db
    .prepare("UPDATE tokens SET used_at = ?1 WHERE id = ?2 AND kind = ?3 AND used_at IS NULL AND expires_at > ?1 RETURNING user_id")
    .bind(Date.now(), id, kind)
    .first<{ user_id: string }>();
  if (!row) throw fail(400, "link_expired", kind === "verify_email" ? "This confirmation link has expired or was already used." : "This reset link has expired or was already used.");
  return row.user_id;
}

async function sendVerifyEmail(c: Ctx, userId: string, to: string, next: string) {
  const token = await newToken(c.db, userId, "verify_email", 24 * HOUR);
  const url = `${c.origin}/auth/callback?verify=${encodeURIComponent(token)}&next=${encodeURIComponent(next)}`;
  const m = linkEmail("Confirm your email", "Tap the button to confirm your email and finish creating your account. The link works for 24 hours.", "Confirm my email", url);
  await sendMail(c.env, to, "Confirm your email", m.text, m.html);
}

/* ---------- Routes ---------- */

const routes: Record<string, (c: Ctx) => Promise<Response>> = {
  /* The same for everyone and rarely changed, so browsers keep it for a few minutes instead of asking on every visit
     to the sign-in page. */
  "GET /api/auth/config": async ({ env }) =>
    new Response(JSON.stringify({
      // Email + password always works. Confirmation emails and password reset switch on with email sending.
      email: true,
      emailVerification: mailConfigured(env),
      passwordReset: mailConfigured(env),
      phone: smsConfigured(env),
      google: googleConfigured(env),
      apple: appleConfigured(env),
      turnstileSiteKey: env.TURNSTILE_SECRET_KEY ? env.TURNSTILE_SITE_KEY ?? "" : "",
    }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=300", "x-content-type-options": "nosniff" } }),

  "GET /api/auth/me": async ({ db, request }) => {
    const s = await getSession(db, request);
    // The site's look rides along, so open app pages pick up a switch made in the admin panel (lib/look.ts).
    const [user, look] = await Promise.all([s ? publicUserById(db, s.user_id) : null, currentLook(db)]);
    return json({ user, look });
  },

  "PATCH /api/auth/me": async ({ db, request }) => {
    const s = await requireSession(db, request);
    const b = await body(request);
    await db.prepare("UPDATE users SET name = ? WHERE id = ?").bind(name(b.name, true), s.user_id).run();
    return json({ user: await publicUser(db, (await userById(db, s.user_id))!) });
  },

  "POST /api/auth/signup": async (c) => {
    const b = await body(c.request);
    const fullName = name(b.name, true);
    const addr = email(b.email);
    const pw = password(b.password);
    const next = safeNext(b.next);
    await rateLimit(c.db, `signup:ip:${c.ip}`, 10, HOUR);
    await rateLimit(c.db, `signup:email:${addr}`, 3, HOUR);
    await humanCheck(c, b);

    const existing = await userByEmail(c.db, addr);
    if (!mailConfigured(c.env)) {
      // No email sending yet, so no confirmation step: the account works straight away.
      if (existing) throw fail(409, "user_already_exists", "An account with this email already exists. Sign in instead.");
      const userId = await createUser(c.db, { name: fullName, email: addr, passwordHash: await hashPassword(pw) });
      return enter(c, b, userId, { status: "signed_in" });
    }
    if (existing?.email_verified_at) {
      // Same answer as a new sign-up, so this can't be used to check who has an account. The owner gets a heads-up.
      const m = linkEmail("You already have an account", "Someone (hopefully you) tried to sign up with this email. You can sign in, or reset your password if you've forgotten it.", "Sign in", `${c.origin}/signin?method=email`);
      await sendMail(c.env, addr, "You already have an account", m.text, m.html);
      return json({ status: "check_email" });
    }
    const hash = await hashPassword(pw);
    let userId: string;
    if (existing) {
      userId = existing.id;
      // Nobody confirmed this address yet, so whoever signed up with it before loses their way in, sessions included.
      await c.db.batch([
        c.db.prepare("UPDATE users SET name = ?, password_hash = ?, active_session_id = NULL, active_device_id = NULL WHERE id = ?").bind(fullName, hash, userId),
        c.db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId),
      ]);
    } else {
      userId = await createUser(c.db, { name: fullName, email: addr, passwordHash: hash });
    }
    await sendVerifyEmail(c, userId, addr, next);
    return json({ status: "check_email" });
  },

  "POST /api/auth/resend-verification": async (c) => {
    const b = await body(c.request);
    const addr = email(b.email);
    await rateLimit(c.db, `resend:ip:${c.ip}`, 10, HOUR);
    await rateLimit(c.db, `resend:email:${addr}`, 3, HOUR);
    await humanCheck(c, b);
    const u = await userByEmail(c.db, addr);
    if (u && !u.email_verified_at && mailConfigured(c.env)) await sendVerifyEmail(c, u.id, addr, safeNext(b.next));
    return json({ status: "check_email" });
  },

  "POST /api/auth/verify-email": async (c) => {
    const b = await body(c.request);
    await rateLimit(c.db, `verify:ip:${c.ip}`, 30, HOUR);
    const userId = await useToken(c.db, b.token, "verify_email");
    await c.db.prepare("UPDATE users SET email_verified_at = coalesce(email_verified_at, ?) WHERE id = ?").bind(Date.now(), userId).run();
    return enter(c, b, userId);
  },

  "POST /api/auth/signin": async (c) => {
    const b = await body(c.request);
    const addr = email(b.email);
    // Only wrong tries count. The tight limit is per address and email together, so someone guessing at an account
    // from elsewhere can't lock its owner out; the wider ones bound guessing from many addresses.
    const limits: [string, number, number][] = [[`signin:ip:${c.ip}`, 30, HOUR], [`signin:pair:${addr}:${c.ip}`, 5, HOUR / 4], [`signin:email:${addr}`, 40, HOUR]];
    // One trip reads the three counters and the account, while the person-not-a-script check runs beside it.
    const [rows, human] = await Promise.all([
      c.db.batch([
        ...limits.map(([key]) => usedStmt(c.db, key)),
        c.db.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE email = ?`).bind(addr),
        c.db.prepare("SELECT provider FROM identities WHERE user_id = (SELECT id FROM users WHERE email = ?)").bind(addr),
      ]),
      // Its failure is reported after the counters have had their say, as before.
      humanCheck(c, b).then(() => null, (e: unknown) => e),
    ]);
    limits.forEach(([, limit, window], k) => peeked(rows[k]!.results[0] as { count: number; window_start: number } | undefined, limit, window));
    if (human) throw human;
    const u = rows[3]!.results[0] as UserRow | undefined;
    const ok = await verifyPassword(typeof b.password === "string" ? b.password : "", u?.password_hash ?? null);
    if (!u || !ok) {
      const counted = await c.db.batch(limits.map(([key, , window]) => hit(c.db, key, window)));
      limits.forEach(([, limit, window], k) => overLimit(counted[k]!.results[0] as { count: number; window_start: number } | undefined, limit + 1, window));
      throw fail(401, "invalid_credentials", "That email and password don't match. Check them, or reset your password.");
    }
    if (!u.email_verified_at && mailConfigured(c.env)) throw fail(403, "email_not_confirmed", "Please confirm your email first. We sent you a link when you signed up.");
    return enter(c, b, { user: u, linked: rows[4]!.results as { provider: string }[] });
  },

  "POST /api/auth/forgot": async (c) => {
    const b = await body(c.request);
    const addr = email(b.email);
    await rateLimit(c.db, `forgot:ip:${c.ip}`, 10, HOUR);
    await rateLimit(c.db, `forgot:email:${addr}`, 3, HOUR);
    await humanCheck(c, b);
    if (!mailConfigured(c.env)) throw fail(503, "email_off", "Password reset by email isn't switched on yet. Please contact support.");
    const u = await userByEmail(c.db, addr);
    if (u) {
      const token = await newToken(c.db, u.id, "reset_password", HOUR);
      const m = linkEmail("Choose a new password", "Tap the button to choose a new password. The link works for 1 hour.", "Choose a new password", `${c.origin}/reset-password?token=${encodeURIComponent(token)}`);
      await sendMail(c.env, addr, "Reset your password", m.text, m.html);
    }
    return json({ status: "check_email" });
  },

  "POST /api/auth/reset": async (c) => {
    const b = await body(c.request);
    const pw = password(b.password);
    await rateLimit(c.db, `reset:ip:${c.ip}`, 20, HOUR);
    const userId = await useToken(c.db, b.token, "reset_password");
    // A new password signs out every other session.
    await c.db.batch([
      c.db.prepare("UPDATE users SET password_hash = ?, email_verified_at = coalesce(email_verified_at, ?), active_session_id = NULL, active_device_id = NULL WHERE id = ?").bind(await hashPassword(pw), Date.now(), userId),
      c.db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId),
      revokeUserPacks(c.db, userId),
    ]);
    return signedIn(c.request, await createSession(c.db, userId, c.request));
  },

  "POST /api/auth/phone/start": async (c) => {
    const b = await body(c.request);
    const phone = normalisePhone(str(b.phone, 40));
    if (!phone) throw fail(400, "bad_phone", "Enter a mobile number like 0300 1234567.");
    await rateLimit(c.db, `otp:ip:${c.ip}`, 10, HOUR);
    await rateLimit(c.db, `otp:gap:${phone}`, 1, 55 * 1000);
    await rateLimit(c.db, `otp:phone:${phone}`, 5, HOUR);
    await humanCheck(c, b);
    await sendCode(c.env, phone);
    return json({ status: "sent", phone });
  },

  "POST /api/auth/phone/verify": async (c) => {
    const b = await body(c.request);
    const phone = normalisePhone(str(b.phone, 40));
    const code = str(b.code, 10).replace(/\D/g, "");
    if (!phone || code.length !== 6) throw fail(400, "bad_code", "Enter the 6-digit code from the SMS.");
    await rateLimit(c.db, `otpcheck:ip:${c.ip}`, 30, HOUR);
    await rateLimit(c.db, `otpcheck:phone:${phone}`, 10, HOUR);
    if (!(await checkCode(c.env, phone, code))) throw fail(400, "bad_code", "That code is wrong or has expired. Request a new one.");
    const u = await userByPhone(c.db, phone);
    const userId = u?.id ?? (await createUser(c.db, { name: name(b.name, false), phone }));
    return enter(c, b, userId, { created: !u });
  },

  /* Google sign-in from the Android app: the phone sends the ID token it got from Google. */
  "POST /api/auth/google/native": async (c) => {
    if (!googleConfigured(c.env)) throw fail(503, "provider_off", "Google sign-in isn't switched on yet.");
    const b = await body(c.request);
    await rateLimit(c.db, `gnative:ip:${c.ip}`, 30, HOUR);
    await humanCheck(c, b);
    const profile = await verifyGoogleIdToken(c.env, str(b.idToken, 4096));
    const userId = await userForOAuth(c.db, "google", profile);
    return signedIn(c.request, await createSession(c.db, userId, c.request));
  },

  /* Delete the account and everything tied to it (answers, tests, bookmarks, devices, sessions: the tables cascade).
     Someone holding only a stolen session can't do it: a password account must type its password, and an account
     without one must have signed in within the last 10 minutes. Staff accounts are removed by an admin instead. */
  "POST /api/auth/delete-account": async (c) => {
    const s = await requireSession(c.db, c.request);
    const b = await body(c.request);
    await rateLimit(c.db, `delete:${s.user_id}`, 10, HOUR);
    const u = await userById(c.db, s.user_id);
    if (!u) throw fail(401, "signed_out", "Please sign in.");
    if (u.role !== "student") throw fail(403, "staff_account", "Staff accounts can't be deleted here. Ask an admin.");
    if (u.password_hash) {
      if (!(await verifyPassword(typeof b.password === "string" ? b.password : "", u.password_hash))) {
        throw fail(401, "wrong_password", "That password isn't right.");
      }
    } else if (Date.now() - s.created_at > 10 * 60 * 1000) {
      throw fail(401, "reauth_required", "For your safety, please sign in again, then delete your account.");
    }
    await c.db.batch([
      // Reports stay for the reviewers without a name on them; the rest goes with the account.
      c.db.prepare("UPDATE reports SET user_id = NULL WHERE user_id = ?").bind(u.id),
      c.db.prepare("DELETE FROM users WHERE id = ?").bind(u.id),
    ]);
    return json({ ok: true }, { headers: { "set-cookie": clearSessionCookie() } });
  },

  "POST /api/auth/signout": async ({ db, request }) => {
    const s = await getSession(db, request);
    if (s) {
      await db.batch([
        releaseDevice(db, s),
        ...(s.device_id ? [revokeDevicePacks(db, s.device_id)] : []),
        db.prepare("DELETE FROM sessions WHERE id = ?").bind(s.id),
      ]);
    }
    return json({ ok: true }, { headers: { "set-cookie": clearSessionCookie() } });
  },

  "POST /api/device/claim": async ({ db, request, env }) => {
    const s = await requireSession(db, request);
    const b = await body(request);
    const app = isApp(request);
    const trusted = app && await checkIntegrity(env, {
      action: "claim", deviceKey: str(b.deviceKey, 64), token: b.integrity,
      noteFailure: (why) => note(db, s.user_id, "integrity", why).run(),
    });
    const res = await claimDevice(db, s, str(b.deviceKey, 64), str(b.label, 80), { platform: isApp(request) ? "android" : "web", appVersion: appVersion(request) });
    if (res.status !== "active") return json(res);
    if (trusted) await db.prepare("UPDATE devices SET integrity_at = ? WHERE user_id = ? AND device_key = ? AND removed_at IS NULL").bind(Date.now(), s.user_id, str(b.deviceKey, 64).toLowerCase()).run();
    const { took_over, device_id: _device, ...out } = res;
    // Taking the account over from another device gives this browser a new cookie (the app a new secret), so a copy
    // of the old one is dead.
    if (!took_over) return json(out);
    const fresh = await rotateSession(db, s);
    return isApp(request) ? json({ ...out, token: fresh.token, expiresAt: fresh.expiresAt }) : json(out, { headers: { "set-cookie": fresh.cookie } });
  },

  "POST /api/device/check": async ({ db, request }) => {
    const s = await requireSession(db, request);
    const b = await body(request);
    return json(await checkDevice(db, s, str(b.deviceKey, 64)));
  },

  "GET /api/device/list": async ({ db, request }) => json(await listDevices(db, (await requireSession(db, request)).user_id)),

  "POST /api/device/remove": async ({ db, request }) => {
    const s = await requireSession(db, request);
    const b = await body(request);
    return json(await removeDevice(db, s, str(b.id, 64)));
  },
};

async function oauth(c: Ctx, provider: Provider, step: "start" | "callback"): Promise<Response> {
  // Only a code goes in the address; the sign-in page words it (lib/auth.ts signInErrors), so a link can't put
  // made-up text on our page.
  const toSignIn = (code: string) => redirect(`/signin?error=${encodeURIComponent(code)}`, [clearStateCookie()]);
  try {
    if (step === "start") {
      const { url, cookie } = await startOAuth(c.env, c.request, provider, safeNext(new URL(c.request.url).searchParams.get("next")));
      return redirect(url, [cookie]);
    }
    const { profile, next } = await finishOAuth(c.env, c.request, provider);
    const userId = await userForOAuth(c.db, provider, profile);
    const session = await createSession(c.db, userId, c.request);
    // Seen from the browser this is a top-level navigation back to our site, so the Lax session cookie sticks.
    return redirect(`/auth/callback?next=${encodeURIComponent(safeNext(next))}`, [session.cookie, clearStateCookie()]);
  } catch (e) {
    if (e instanceof HttpError) return toSignIn(e.code);
    console.error(e);
    return toSignIn("oauth_failed");
  }
}

/* Counts a request's trips to the database and the time they took, for the Server-Timing header: the browser's
   network panel then shows where a slow answer spent its time. */
function counted(db: D1Database) {
  const tally = { trips: 0, ms: 0 };
  const real = new WeakMap<object, D1PreparedStatement>();
  const timed = async <T>(run: () => Promise<T>): Promise<T> => {
    const t = Date.now();
    tally.trips++;
    try { return await run(); } finally { tally.ms += Date.now() - t; }
  };
  const wrap = (st: D1PreparedStatement): D1PreparedStatement => {
    const w = {
      bind: (...v: unknown[]) => wrap(st.bind(...v)),
      first: (...a: [string?]) => timed(() => (st.first as (...x: unknown[]) => Promise<unknown>)(...a)),
      all: () => timed(() => st.all()),
      run: () => timed(() => st.run()),
      raw: (...a: unknown[]) => timed(() => (st.raw as (...x: unknown[]) => Promise<unknown>)(...a)),
    } as unknown as D1PreparedStatement;
    real.set(w, st);
    return w;
  };
  const out = {
    prepare: (sql: string) => wrap(db.prepare(sql)),
    batch: (list: D1PreparedStatement[]) => timed(() => db.batch(list.map((x) => real.get(x) ?? x))),
    exec: (sql: string) => timed(() => db.exec(sql)),
  } as unknown as D1Database;
  return { db: out, tally };
}

export async function handle(request: Request, env: Env): Promise<Response> {
  const began = Date.now();
  const { db, tally } = counted(env.DB);
  const res = await answer(request, env, db);
  try { res.headers.set("server-timing", `db;dur=${tally.ms};desc="${tally.trips} trips", all;dur=${Date.now() - began}`); } catch {}
  return res;
}

async function answer(request: Request, env: Env, db: D1Database): Promise<Response> {
  const url = new URL(request.url);
  const c: Ctx = { env, request, db, ip: clientIp(request), origin: url.origin };
  try {
    const o = /^\/api\/auth\/oauth\/(google|apple)(\/callback)?$/.exec(url.pathname);
    if (o) {
      const step = o[2] ? "callback" : "start";
      if (step === "start" && request.method !== "GET") throw fail(405, "method", "Method not allowed.");
      return await oauth(c, o[1] as Provider, step);
    }
    // An app too old to be safe is asked to update before anything else; the config call says which version is needed.
    const min = Number(env.APP_MIN_VERSION) || 0;
    if (isApp(request) && url.pathname !== "/api/app/config" && (appVersion(request) ?? 0) < min) {
      throw fail(426, "update_required", "Please update Markhor Prep to keep going.");
    }
    const key = `${request.method} ${url.pathname}`;
    const route = routes[key] ?? adminRoutes[key] ?? lookRoutes[key] ?? visitRoutes[key] ?? studyRoutes[key] ?? prefRoutes[key] ?? insightRoutes[key] ?? appRoutes[key] ?? offlineRoutes[key] ?? supportRoutes[key];
    if (!route) throw fail(404, "not_found", "Not found.");
    // Cookies are sent by the browser on their own, so a cookie request must come from our own pages. The app sends no
    // cookies, and marks its requests with headers (X-Client, Authorization) that another site's page can't add without
    // our permission (browsers ask first, and we never say yes), so those can't be forged from elsewhere.
    if (request.method !== "GET") {
      if (!request.headers.get("cookie") && (bearer(request) || isApp(request))) assertJson(request);
      else assertSameOrigin(request);
    }
    try {
      return await route(c);
    } finally {
      // Sign-in, device, account and admin changes can change who may do what, so sessions reused for study requests
      // (server/session.ts) are looked up afresh after one. Study writes, page counts and the device check change none of that.
      if (request.method !== "GET" && !/^\/api\/(study\/|visit$|device\/check$)/.test(url.pathname)) forgetReusedSessions();
      if (c.fresh) reuseSession(c.fresh);
    }
  } catch (e) {
    if (e instanceof HttpError) return json({ error: { code: e.code, message: e.message, ...e.extra } }, { status: e.status });
    console.error(e);
    return json({ error: { code: "server_error", message: "Something went wrong on our side. Please try again." } }, { status: 500 });
  }
}
