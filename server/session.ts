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
};

const lifetime = (role: string) => (role === "student" ? LIFETIME_MS : STAFF_LIFETIME_MS);
const agent = (request: Request) => (request.headers.get("user-agent") ?? "").slice(0, 300);
/* A browser's name and system without version numbers, so an update doesn't look like a different browser. */
const family = (ua: string | null) => (ua ?? "").replace(/[\d._]+/g, "").replace(/\s+/g, " ").trim();

export const note = (db: D1Database, userId: string, kind: string, detail = "") =>
  db.prepare("INSERT INTO security_events (user_id, kind, detail, created_at) VALUES (?, ?, ?, ?)").bind(userId, kind, detail.slice(0, 300), Date.now());

export async function createSession(db: D1Database, userId: string, request: Request): Promise<string> {
  const token = randomToken();
  const now = Date.now();
  const u = await db.prepare("SELECT role FROM users WHERE id = ?").bind(userId).first<{ role: string }>();
  const life = lifetime(u?.role ?? "student");
  await db
    .prepare("INSERT INTO sessions (id, user_id, created_at, last_seen_at, expires_at, user_agent, ip, ip_window) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(await sha256(token), userId, now, now, now + life, agent(request), clientIp(request), now)
    .run();
  return cookie(SESSION_COOKIE, token, { maxAge: life / 1000 });
}

export const clearSessionCookie = () => cookie(SESSION_COOKIE, "", { maxAge: 0 });

export async function getSession(db: D1Database, request: Request): Promise<Session | null> {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const id = await sha256(token);
  const s = await db
    .prepare(`SELECT s.id, s.user_id, s.device_id, s.expires_at, s.last_seen_at, s.created_at, s.user_agent, s.ip, s.ip_changes, s.ip_window, u.role
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
}

/* Swap the session's secret for a new one. Any copy of the old cookie stops working. */
export async function rotateSession(db: D1Database, s: Session): Promise<string> {
  const token = randomToken();
  const id = await sha256(token);
  await db.batch([
    db.prepare("UPDATE sessions SET id = ? WHERE id = ?").bind(id, s.id),
    db.prepare("UPDATE users SET active_session_id = ? WHERE id = ? AND active_session_id = ?").bind(id, s.user_id, s.id),
  ]);
  return cookie(SESSION_COOKIE, token, { maxAge: Math.max(60, Math.round((s.expires_at - Date.now()) / 1000)) });
}
