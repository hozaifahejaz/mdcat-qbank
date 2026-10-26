import { randomToken, sha256 } from "./crypto";
import { cookie, fail, readCookie } from "./http";

/* Sessions: a random secret in an HttpOnly cookie, stored in D1 only as its SHA-256.
   Each signed-in browser has its own session; which one may use the account is decided in devices.ts. */
export const SESSION_COOKIE = "__Host-sid";
const LIFETIME_MS = 60 * 24 * 60 * 60 * 1000; // 60 days, extended while in use
const TOUCH_EVERY_MS = 24 * 60 * 60 * 1000;

export type Session = { id: string; user_id: string; device_id: string | null; expires_at: number; last_seen_at: number };

export async function createSession(db: D1Database, userId: string, request: Request): Promise<string> {
  const token = randomToken();
  const now = Date.now();
  await db
    .prepare("INSERT INTO sessions (id, user_id, created_at, last_seen_at, expires_at, user_agent) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(await sha256(token), userId, now, now, now + LIFETIME_MS, (request.headers.get("user-agent") ?? "").slice(0, 300))
    .run();
  return cookie(SESSION_COOKIE, token, { maxAge: LIFETIME_MS / 1000 });
}

export const clearSessionCookie = () => cookie(SESSION_COOKIE, "", { maxAge: 0 });

export async function getSession(db: D1Database, request: Request): Promise<Session | null> {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const id = await sha256(token);
  const s = await db.prepare("SELECT id, user_id, device_id, expires_at, last_seen_at FROM sessions WHERE id = ?").bind(id).first<Session>();
  const now = Date.now();
  if (!s) return null;
  if (s.expires_at < now) {
    await db.prepare("DELETE FROM sessions WHERE id = ?").bind(id).run();
    return null;
  }
  if (now - s.last_seen_at > TOUCH_EVERY_MS) {
    await db.prepare("UPDATE sessions SET last_seen_at = ?, expires_at = ? WHERE id = ?").bind(now, now + LIFETIME_MS, id).run();
  }
  return s;
}

export async function requireSession(db: D1Database, request: Request): Promise<Session> {
  const s = await getSession(db, request);
  if (!s) throw fail(401, "signed_out", "Please sign in.");
  return s;
}
