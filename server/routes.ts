import { hashPassword, randomToken, sha256, verifyPassword } from "./crypto";
import { claimDevice, checkDevice, isActiveSession, listDevices, releaseDevice, removeDevice } from "./devices";
import type { Env } from "./env";
import { HttpError, assertSameOrigin, body, clientIp, fail, json, redirect, safeNext, str } from "./http";
import { linkEmail, mailConfigured, sendMail } from "./mail";
import { type Provider, appleConfigured, clearStateCookie, finishOAuth, googleConfigured, startOAuth } from "./oauth";
import { rateLimit } from "./ratelimit";
import { type Session, clearSessionCookie, createSession, getSession, requireSession } from "./session";
import { adminRoutes } from "./admin";
import { checkCode, sendCode, smsConfigured } from "./sms";
import { checkCaptcha } from "./turnstile";
import { createUser, publicUser, userByEmail, userById, userByPhone, userForOAuth } from "./users";
import { normalisePhone } from "../lib/phone";

const HOUR = 60 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Ctx = { env: Env; request: Request; db: D1Database; ip: string; origin: string };

const signedIn = (cookie: string, extra: Record<string, unknown> = {}) => json({ ok: true, ...extra }, { headers: { "set-cookie": cookie } });

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
  "GET /api/auth/config": async ({ env }) =>
    json({
      // Email + password always works. Confirmation emails and password reset switch on with email sending.
      email: true,
      emailVerification: mailConfigured(env),
      passwordReset: mailConfigured(env),
      phone: smsConfigured(env),
      google: googleConfigured(env),
      apple: appleConfigured(env),
      turnstileSiteKey: env.TURNSTILE_SECRET_KEY ? env.TURNSTILE_SITE_KEY ?? "" : "",
    }),

  "GET /api/auth/me": async ({ db, request }) => {
    const s = await getSession(db, request);
    const u = s && (await userById(db, s.user_id));
    return json({ user: u ? await publicUser(db, u) : null });
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
    await checkCaptcha(c.env, b.captcha, c.ip);

    const existing = await userByEmail(c.db, addr);
    if (!mailConfigured(c.env)) {
      // No email sending yet, so no confirmation step: the account works straight away.
      if (existing) throw fail(409, "user_already_exists", "An account with this email already exists. Sign in instead.");
      const userId = await createUser(c.db, { name: fullName, email: addr, passwordHash: await hashPassword(pw) });
      return signedIn(await createSession(c.db, userId, c.request), { status: "signed_in" });
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
      await c.db.prepare("UPDATE users SET name = ?, password_hash = ? WHERE id = ?").bind(fullName, hash, userId).run();
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
    await checkCaptcha(c.env, b.captcha, c.ip);
    const u = await userByEmail(c.db, addr);
    if (u && !u.email_verified_at && mailConfigured(c.env)) await sendVerifyEmail(c, u.id, addr, safeNext(b.next));
    return json({ status: "check_email" });
  },

  "POST /api/auth/verify-email": async (c) => {
    const b = await body(c.request);
    await rateLimit(c.db, `verify:ip:${c.ip}`, 30, HOUR);
    const userId = await useToken(c.db, b.token, "verify_email");
    await c.db.prepare("UPDATE users SET email_verified_at = coalesce(email_verified_at, ?) WHERE id = ?").bind(Date.now(), userId).run();
    return signedIn(await createSession(c.db, userId, c.request));
  },

  "POST /api/auth/signin": async (c) => {
    const b = await body(c.request);
    const addr = email(b.email);
    await rateLimit(c.db, `signin:ip:${c.ip}`, 30, HOUR);
    await rateLimit(c.db, `signin:email:${addr}`, 10, HOUR / 4);
    await checkCaptcha(c.env, b.captcha, c.ip);
    const u = await userByEmail(c.db, addr);
    const ok = await verifyPassword(typeof b.password === "string" ? b.password : "", u?.password_hash ?? null);
    if (!u || !ok) throw fail(401, "invalid_credentials", "That email and password don't match. Check them, or reset your password.");
    if (!u.email_verified_at && mailConfigured(c.env)) throw fail(403, "email_not_confirmed", "Please confirm your email first. We sent you a link when you signed up.");
    return signedIn(await createSession(c.db, u.id, c.request));
  },

  "POST /api/auth/forgot": async (c) => {
    const b = await body(c.request);
    const addr = email(b.email);
    await rateLimit(c.db, `forgot:ip:${c.ip}`, 10, HOUR);
    await rateLimit(c.db, `forgot:email:${addr}`, 3, HOUR);
    await checkCaptcha(c.env, b.captcha, c.ip);
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
    ]);
    return signedIn(await createSession(c.db, userId, c.request));
  },

  "POST /api/auth/phone/start": async (c) => {
    const b = await body(c.request);
    const phone = normalisePhone(str(b.phone, 40));
    if (!phone) throw fail(400, "bad_phone", "Enter a mobile number like 0300 1234567.");
    await rateLimit(c.db, `otp:ip:${c.ip}`, 10, HOUR);
    await rateLimit(c.db, `otp:gap:${phone}`, 1, 55 * 1000);
    await rateLimit(c.db, `otp:phone:${phone}`, 5, HOUR);
    await checkCaptcha(c.env, b.captcha, c.ip);
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
    return signedIn(await createSession(c.db, userId, c.request), { created: !u });
  },

  "POST /api/auth/signout": async ({ db, request }) => {
    const s = await getSession(db, request);
    if (s) {
      await releaseDevice(db, s);
      await db.prepare("DELETE FROM sessions WHERE id = ?").bind(s.id).run();
    }
    return json({ ok: true }, { headers: { "set-cookie": clearSessionCookie() } });
  },

  "POST /api/device/claim": async ({ db, request }) => {
    const s = await requireSession(db, request);
    const b = await body(request);
    return json(await claimDevice(db, s, str(b.deviceKey, 64), str(b.label, 80)));
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
  const toSignIn = (msg: string) => redirect(`/signin?error=${encodeURIComponent(msg)}`, [clearStateCookie()]);
  try {
    if (step === "start") {
      const { url, cookie } = await startOAuth(c.env, c.request, provider, safeNext(new URL(c.request.url).searchParams.get("next")));
      return redirect(url, [cookie]);
    }
    const { profile, next } = await finishOAuth(c.env, c.request, provider);
    const userId = await userForOAuth(c.db, provider, profile);
    const session = await createSession(c.db, userId, c.request);
    // Seen from the browser this is a top-level navigation back to our site, so the Lax session cookie sticks.
    return redirect(`/auth/callback?next=${encodeURIComponent(safeNext(next))}`, [session, clearStateCookie()]);
  } catch (e) {
    if (e instanceof HttpError) return toSignIn(e.message);
    console.error(e);
    return toSignIn("Sign-in didn't complete. Please try again.");
  }
}

/* Paid-content endpoints call this: signed in, and on the account's active device. */
export async function requireActiveSession(db: D1Database, request: Request): Promise<Session> {
  const s = await requireSession(db, request);
  if (!(await isActiveSession(db, s))) throw fail(423, "device_locked", "Your account is active on another device.");
  return s;
}

export async function handle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const c: Ctx = { env, request, db: env.DB, ip: clientIp(request), origin: url.origin };
  try {
    const o = /^\/api\/auth\/oauth\/(google|apple)(\/callback)?$/.exec(url.pathname);
    if (o) {
      const step = o[2] ? "callback" : "start";
      if (step === "start" && request.method !== "GET") throw fail(405, "method", "Method not allowed.");
      return await oauth(c, o[1] as Provider, step);
    }
    const key = `${request.method} ${url.pathname}`;
    const route = routes[key] ?? adminRoutes[key];
    if (!route) throw fail(404, "not_found", "Not found.");
    if (request.method !== "GET") assertSameOrigin(request);
    return await route(c);
  } catch (e) {
    if (e instanceof HttpError) return json({ error: { code: e.code, message: e.message, ...e.extra } }, { status: e.status });
    console.error(e);
    return json({ error: { code: "server_error", message: "Something went wrong on our side. Please try again." } }, { status: 500 });
  }
}
