import { randomToken, sha256 } from "./crypto";
import { clientIp, cookie, fail, readCookie } from "./http";

/* Sessions: a random secret in an HttpOnly cookie, stored in D1 only as its SHA-256.
   Each signed-in browser has its own session; which one may use the account is decided in devices.ts. */
export const SESSION_COOKIE = "__Host-sid";
const DAY_MS = 24 * 60 * 60 * 1000;
const LIFETIME_MS = 60 * DAY_MS; // 60 days, extended while in use
const STAFF_LIFETIME_MS = 7 * DAY_MS; // writers, reviewers and admins sign in again every week, used or not
const TOUCH_EVERY_MS = DAY_MS;
/* A session used from this many different addresses inside the window is noted for an admin to look at. */
const IP_WINDOW_MS = 30 * 60 * 1000;
const IP_CHANGES_NOTED = 8;

export type Session = {
  id: string; user_id: string; device_id: string | null; expires_at: number; last_seen_at: number; created_at: number;
  user_agent: string | null; ip: string | null; ip_changes: number; ip_window: number; role: string;
  /* From the account's row, read in the same query so most requests need no second look at it. */
  active_session_id: string | null; plan: string; plan_expires_at: number | null;
};

const lifetime = (role: string) => (role === "student" ? LIFETIME_MS : STAFF_LIFETIME_MS);
const agent = (request: Request) => (request.headers.get("user-agent") ?? "").slice(0, 300);
/* A browser's name and system without version numbers, so an update doesn't look like a different browser. */
const family = (ua: string | null) => (ua ?? "").replace(/[\d._]+/g, "").replace(/\s+/g, " ").trim();

export const note = (db: D1Database, userId: string, kind: string, detail = "") =>
  db.prepare("INSERT INTO security_events (user_id, kind, detail, created_at) VALUES (?, ?, ?, ?)").bind(userId, kind, detail.slice(0, 300), Date.now());

/* A new or replaced session: the secret itself (the app keeps it and sends it as a Bearer token), the cookie that carries
   it for the website, and when it ends. */
export type NewSession = { token: string; cookie: string; expiresAt: number };

/* Requests from the Android app say so in a header. They carry the session as "Authorization: Bearer", not a cookie. */
export const isApp = (request: Request) => request.headers.get("x-client") === "android";
export const appVersion = (request: Request) => {
  const v = Number(request.headers.get("x-app-version"));
  return Number.isInteger(v) && v > 0 ? v : null;
};
export function bearer(request: Request): string | null {
  const m = /^Bearer\s+([A-Za-z0-9_-]{16,200})$/.exec(request.headers.get("authorization") ?? "");
  return m ? m[1]! : null;
}

/* A new session, not yet saved: the statement that saves it (so a caller can send it along with its own in one trip),
   what the browser or app gets, and the row as later requests will read it. */
export async function newSession(db: D1Database, user: { id: string; role: string; plan: string; plan_expires_at: number | null }, request: Request) {
  const token = randomToken();
  const now = Date.now();
  const life = lifetime(user.role);
  const id = await sha256(token);
  const ua = agent(request);
  const ip = clientIp(request);
  const save = db
    .prepare("INSERT INTO sessions (id, user_id, created_at, last_seen_at, expires_at, user_agent, ip, ip_window) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(id, user.id, now, now, now + life, ua, ip, now);
  const session: Session = {
    id, user_id: user.id, device_id: null, expires_at: now + life, last_seen_at: now, created_at: now, user_agent: ua, ip, ip_changes: 0, ip_window: now,
    role: user.role, active_session_id: null, plan: user.plan, plan_expires_at: user.plan_expires_at,
  };
  const out: NewSession = { token, cookie: cookie(SESSION_COOKIE, token, { maxAge: life / 1000 }), expiresAt: now + life };
  return { save, session, out };
}

export async function createSession(db: D1Database, userId: string, request: Request): Promise<NewSession> {
  const u = await db.prepare("SELECT role, plan, plan_expires_at FROM users WHERE id = ?").bind(userId).first<{ role: string; plan: string; plan_expires_at: number | null }>();
  const made = await newSession(db, { id: userId, role: u?.role ?? "student", plan: u?.plan ?? "free", plan_expires_at: u?.plan_expires_at ?? null }, request);
  await made.save.run();
  return made.out;
}

export const clearSessionCookie = () => cookie(SESSION_COOKIE, "", { maxAge: 0 });

/* Study requests come in bursts (a page asks for two or three things, a test saves an answer every few seconds), and
   each one used to look the session up in the database first: a whole trip, about a third of the request's time.
   So a session looked up for a study request is reused by the next ones for a few seconds, in this server instance
   only. Sign-in, devices, accounts and the admin panel always look it up afresh, and any change through them wipes
   every reused copy here; elsewhere a copy is at most REUSE_MS old. The device check runs every 30 seconds anyway. */
const REUSE_MS = 10_000;
const reused = new Map<string, { s: Session; at: number }>();
function reusable(request: Request): boolean {
  const path = new URL(request.url).pathname;
  return path.startsWith("/api/study/") || (request.method === "GET" && (path === "/api/auth/me" || path === "/api/account/prefs"));
}
export function forgetReusedSessions() {
  reused.clear();
}
/* A session made by this very request (a sign-in): the dashboard's requests that follow in the next moments use this
   copy instead of each looking it up. */
export function reuseSession(s: Session) {
  reused.set(s.id, { s, at: Date.now() });
}

export async function getSession(db: D1Database, request: Request): Promise<Session | null> {
  // The app sends its secret as a Bearer token; the website's is in the cookie. Both are stored the same way.
  const token = bearer(request) ?? readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const id = await sha256(token);
  const reuse = reusable(request);
  if (reuse) {
    const hit = reused.get(id);
    if (hit && Date.now() - hit.at < REUSE_MS && hit.s.expires_at > Date.now()) return hit.s;
  }
  const s = await db
    .prepare(`SELECT s.id, s.user_id, s.device_id, s.expires_at, s.last_seen_at, s.created_at, s.user_agent, s.ip, s.ip_changes, s.ip_window,
        u.role, u.active_session_id, u.plan, u.plan_expires_at
      FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?`)
    .bind(id)
    .first<Session>();
  const now = Date.now();
  if (!s) return null;
  // Staff sign in again a week after signing in, however much the session was used.
  const staff = s.role !== "student";
  if (s.expires_at < now || (staff && now > s.created_at + STAFF_LIFETIME_MS)) {
    await db.prepare("DELETE FROM sessions WHERE id = ?").bind(id).run();
    return null;
  }
  if (now - s.last_seen_at > TOUCH_EVERY_MS) {
    await db.prepare("UPDATE sessions SET last_seen_at = ?, expires_at = ? WHERE id = ?").bind(now, staff ? s.created_at + STAFF_LIFETIME_MS : now + LIFETIME_MS, id).run();
  }
  if (reuse) {
    if (reused.size > 2000) reused.clear();
    reused.set(id, { s, at: now });
  }
  return s;
}

export async function requireSession(db: D1Database, request: Request): Promise<Session> {
  const s = await getSession(db, request);
  if (!s) throw fail(401, "signed_out", "Please sign in.");
  return s;
}

/* A session belongs to the browser it was made in. Used from a different kind of browser, it is ended and noted.
   Used from many addresses in a short time, it is noted (phones change address often, so that alone ends nothing). */
export async function watchSession(db: D1Database, s: Session, request: Request): Promise<void> {
  if (family(s.user_agent) !== family(agent(request))) {
    reused.delete(s.id);
    await db.batch([
      db.prepare("DELETE FROM sessions WHERE id = ?").bind(s.id),
      db.prepare("UPDATE users SET active_session_id = NULL, active_device_id = NULL WHERE id = ? AND active_session_id = ?").bind(s.user_id, s.id),
      note(db, s.user_id, "session_moved", `Signed in on "${family(s.user_agent).slice(0, 110)}", then used from "${family(agent(request)).slice(0, 110)}"`),
    ]);
    throw fail(401, "signed_out", "Please sign in again.");
  }
  const ip = clientIp(request);
  if (s.ip === ip) return;
  const now = Date.now();
  const fresh = now - s.ip_window > IP_WINDOW_MS;
  const changes = fresh ? 1 : s.ip_changes + 1;
  const ops = [db.prepare("UPDATE sessions SET ip = ?, ip_changes = ?, ip_window = ? WHERE id = ?").bind(ip, changes, fresh ? now : s.ip_window, s.id)];
  if (changes === IP_CHANGES_NOTED) ops.push(note(db, s.user_id, "many_places", `One sign-in used from ${IP_CHANGES_NOTED} different network addresses in 30 minutes`));
  await db.batch(ops);
  // A reused copy of this session carries the new address too, so the next request doesn't count the change again.
  Object.assign(s, { ip, ip_changes: changes, ip_window: fresh ? now : s.ip_window });
}

/* Swap the session's secret for a new one. Any copy of the old cookie stops working. */
export async function rotateSession(db: D1Database, s: Session): Promise<NewSession> {
  const token = randomToken();
  const id = await sha256(token);
  await db.batch([
    db.prepare("UPDATE sessions SET id = ? WHERE id = ?").bind(id, s.id),
    db.prepare("UPDATE users SET active_session_id = ? WHERE id = ? AND active_session_id = ?").bind(id, s.user_id, s.id),
  ]);
  return { token, cookie: cookie(SESSION_COOKIE, token, { maxAge: Math.max(60, Math.round((s.expires_at - Date.now()) / 1000)) }), expiresAt: s.expires_at };
}
