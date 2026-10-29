import { uuid } from "./crypto";
import { fail } from "./http";
import { type Session, requireSession } from "./session";

/* The device rule (docs/plan.md): at most 2 registered devices per account, one active at a time,
   and one device removal every 30 days. "Active" means the account's active_session_id is this session. */
const MAX_DEVICES = 2;
const SWAP_EVERY_MS = 30 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export type DeviceRow = { id: string; label: string; created_at: number; last_seen_at: number; active: boolean };

export async function listDevices(db: D1Database, userId: string): Promise<DeviceRow[]> {
  const { results } = await db
    .prepare(
      `SELECT d.id, d.label, d.created_at, d.last_seen_at, (d.id = u.active_device_id) AS active
         FROM devices d JOIN users u ON u.id = d.user_id
        WHERE d.user_id = ? AND d.removed_at IS NULL ORDER BY d.created_at`,
    )
    .bind(userId)
    .all<Omit<DeviceRow, "active"> & { active: number | null }>();
  return results.map((d) => ({ ...d, active: d.active === 1 }));
}

const cleanLabel = (label: string) => label.replace(/[^\p{L}\p{N} ._-]/gu, "").slice(0, 60) || "Unknown device";
const cleanKey = (key: string) => {
  if (!/^[0-9a-f-]{36}$/i.test(key)) throw fail(400, "bad_device", "Unrecognised device.");
  return key.toLowerCase();
};

/* Make this browser the active device, registering it first if there's a free slot.
   Signing in on one device therefore locks the other one at its next check-in. */
export async function claimDevice(db: D1Database, session: Session, rawKey: string, rawLabel: string) {
  const key = cleanKey(rawKey);
  const label = cleanLabel(rawLabel);
  const uid = session.user_id;
  const now = Date.now();

  let device = await db
    .prepare("SELECT id FROM devices WHERE user_id = ? AND device_key = ? AND removed_at IS NULL")
    .bind(uid, key)
    .first<{ id: string }>();

  if (!device) {
    const id = uuid();
    // The count check and the insert are one statement, so two sign-ins at once can't both take the last slot.
    const res = await db
      .prepare(
        `INSERT INTO devices (id, user_id, device_key, label, created_at, last_seen_at)
         SELECT ?1, ?2, ?3, ?4, ?5, ?5
          WHERE (SELECT count(*) FROM devices WHERE user_id = ?2 AND removed_at IS NULL) < ?6`,
      )
      .bind(id, uid, key, label, now, MAX_DEVICES)
      .run();
    if (!res.meta.changes) return { status: "device_limit" as const, devices: await listDevices(db, uid) };
    await db.prepare("INSERT INTO device_events (user_id, device_id, kind, created_at) VALUES (?, ?, 'register', ?)").bind(uid, id, now).run();
    device = { id };
  }

  const user = await db.prepare("SELECT active_device_id FROM users WHERE id = ?").bind(uid).first<{ active_device_id: string | null }>();
  const statements = [
    db.prepare("UPDATE users SET active_session_id = ?, active_device_id = ? WHERE id = ?").bind(session.id, device.id, uid),
    db.prepare("UPDATE sessions SET device_id = ? WHERE id = ?").bind(device.id, session.id),
    db.prepare("UPDATE devices SET last_seen_at = ?, label = ? WHERE id = ?").bind(now, label, device.id),
  ];
  if (user?.active_device_id && user.active_device_id !== device.id) {
    statements.push(db.prepare("INSERT INTO device_events (user_id, device_id, kind, created_at) VALUES (?, ?, 'takeover', ?)").bind(uid, device.id, now));
  }
  await db.batch(statements);

  const takeovers = await db
    .prepare("SELECT count(*) AS n FROM device_events WHERE user_id = ? AND kind = 'takeover' AND created_at > ?")
    .bind(uid, now - DAY_MS)
    .first<{ n: number }>();
  return { status: "active" as const, takeovers_today: takeovers?.n ?? 0 };
}

/* The 30-second check-in. */
export async function checkDevice(db: D1Database, session: Session, rawKey: string) {
  const key = cleanKey(rawKey);
  await db.prepare("UPDATE devices SET last_seen_at = ? WHERE user_id = ? AND device_key = ? AND removed_at IS NULL").bind(Date.now(), session.user_id, key).run();
  const u = await db
    .prepare("SELECT u.active_session_id, u.active_device_id, d.label FROM users u LEFT JOIN devices d ON d.id = u.active_device_id WHERE u.id = ?")
    .bind(session.user_id)
    .first<{ active_session_id: string | null; active_device_id: string | null; label: string | null }>();
  if (u?.active_session_id === session.id) return { status: "active" as const };
  if (!u?.active_device_id) return { status: "idle" as const };
  return { status: "locked" as const, active_label: u.label };
}

/* Question content calls this: signed in, and on the account's active device. */
export async function requireActiveSession(db: D1Database, request: Request): Promise<Session> {
  const s = await requireSession(db, request);
  if (!(await isActiveSession(db, s))) throw fail(423, "device_locked", "Your account is active on another device.");
  return s;
}

/* True only for the account's active session. Every paid-content endpoint should require it. */
export async function isActiveSession(db: D1Database, session: Session): Promise<boolean> {
  const u = await db.prepare("SELECT active_session_id FROM users WHERE id = ?").bind(session.user_id).first<{ active_session_id: string | null }>();
  return u?.active_session_id === session.id;
}

export async function removeDevice(db: D1Database, session: Session, deviceId: string) {
  const uid = session.user_id;
  const now = Date.now();
  const found = await db.prepare("SELECT id FROM devices WHERE id = ? AND user_id = ? AND removed_at IS NULL").bind(deviceId, uid).first();
  if (!found) return { status: "not_found" as const };

  const last = await db
    .prepare("SELECT max(created_at) AS at FROM device_events WHERE user_id = ? AND kind = 'remove'")
    .bind(uid)
    .first<{ at: number | null }>();
  if (last?.at && last.at > now - SWAP_EVERY_MS) {
    return { status: "swap_limit" as const, next_allowed_at: new Date(last.at + SWAP_EVERY_MS).toISOString() };
  }

  await db.batch([
    db.prepare("UPDATE devices SET removed_at = ? WHERE id = ?").bind(now, deviceId),
    db.prepare("UPDATE users SET active_session_id = NULL, active_device_id = NULL WHERE id = ? AND active_device_id = ?").bind(uid, deviceId),
    // A removed device is signed out everywhere it was signed in.
    db.prepare("DELETE FROM sessions WHERE user_id = ? AND device_id = ?").bind(uid, deviceId),
    db.prepare("INSERT INTO device_events (user_id, device_id, kind, created_at) VALUES (?, ?, 'remove', ?)").bind(uid, deviceId, now),
  ]);
  return { status: "removed" as const, devices: await listDevices(db, uid) };
}

/* On sign-out, give up the active slot so the other device carries on without a prompt. */
export async function releaseDevice(db: D1Database, session: Session) {
  await db.prepare("UPDATE users SET active_session_id = NULL, active_device_id = NULL WHERE id = ? AND active_session_id = ?").bind(session.user_id, session.id).run();
}
