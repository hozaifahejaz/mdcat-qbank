import { OFFLINE_LEASE_DAYS, OFFLINE_MAX, offlineEnabled } from "./app";
import { uuid } from "./crypto";
import { requireActiveSession } from "./devices";
import type { Env } from "./env";
import { body, fail, json, str } from "./http";
import { checkIntegrity } from "./integrity";
import { spend, usedOf, usedStmt } from "./ratelimit";
import { type Session, isApp, note, requireSession } from "./session";
import { type AttemptRow, type Served, DAILY_QUESTIONS, IN_OPEN_TEST, finish, full, scope } from "./study";
import { effectivePlan } from "./users";

/* Offline packs for the Android app. A pack is a set of questions, keys and explanations included, that one phone may
   keep for a few days so a student with a pass can practice without a connection. Limits:
   - app only, on a registered Android device of the account, for accounts with a pass;
   - at most OFFLINE_MAX questions in live packs per account (all its phones together);
   - a pack lasts OFFLINE_LEASE_DAYS and is extended whenever the phone checks in (renew);
   - downloads count toward the same 500-new-questions-a-day allowance as tests.
   Answers given offline come back through /api/study/sync and are filed as ordinary practice sets. */

type Ctx = { env: Env; db: D1Database; request: Request; ip: string };
const DAY = 24 * 60 * 60 * 1000;
const LEASE = OFFLINE_LEASE_DAYS * DAY;
const MAX_SESSIONS = 20;
const MAX_ANSWERS = 300;

type Device = { id: string; user_id: string };
type PackRow = { id: string; user_id: string; device_id: string; title: string; question_count: number; created_at: number; expires_at: number; revoked_at: number | null };

/* The account's registered Android device this request comes from. */
async function appDevice(c: Ctx, s: Session, rawKey: unknown): Promise<Device> {
  if (!offlineEnabled(c.env)) throw fail(404, "offline_off", "Offline practice isn't available yet.");
  if (!isApp(c.request)) throw fail(400, "app_only", "Offline practice is in the Android app.");
  const key = str(rawKey, 64).toLowerCase();
  const d = await c.db
    .prepare("SELECT id, user_id FROM devices WHERE user_id = ? AND device_key = ? AND removed_at IS NULL AND platform = 'android'")
    .bind(s.user_id, key).first<Device>();
  if (!d) throw fail(400, "bad_device", "This phone isn't one of your devices. Sign in again.");
  return d;
}

const LIVE = "revoked_at IS NULL AND expires_at > ?";
const heldStmt = (db: D1Database, userId: string, now: number) =>
  db.prepare(`SELECT coalesce(sum(question_count), 0) AS n FROM packs WHERE user_id = ? AND ${LIVE}`).bind(userId, now);

/* Packs stop working: on sign-out from the phone, removal of the device, a new password, or the end of a pass. */
export const revokeDevicePacks = (db: D1Database, deviceId: string) =>
  db.prepare("UPDATE packs SET revoked_at = ? WHERE device_id = ? AND revoked_at IS NULL").bind(Date.now(), deviceId);
export const revokeUserPacks = (db: D1Database, userId: string) =>
  db.prepare("UPDATE packs SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL").bind(Date.now(), userId);

function packTitle(sc: ReturnType<typeof scope>): string {
  const t = sc.subject ? `${sc.subject}${sc.chapters.length === 1 ? ` · ${sc.chapters[0]}` : ""}` : sc.several.length ? sc.several.join(" + ") : "Mixed practice";
  return (sc.bank.id === "mdcat" ? t : `${sc.bank.name} · ${t}`).slice(0, 120);
}

const uuidOk = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

export const offlineRoutes: Record<string, (c: Ctx) => Promise<Response>> = {
  /* Download a pack. Needs the active session: downloading is using the bank, like starting a test. */
  "POST /api/study/pack": async (c) => {
    const s = await requireActiveSession(c.db, c.request);
    const b = await body(c.request);
    if (effectivePlan(s) === "free") throw fail(402, "needs_pass", "Offline practice comes with a paid plan.");
    const device = await appDevice(c, s, b.deviceKey);
    await checkIntegrity(c.env, {
      action: "pack", deviceKey: str(b.deviceKey, 64), token: b.integrity,
      noteFailure: (why) => note(c.db, s.user_id, "integrity", why).run(),
    });
    const now = Date.now();
    const want = Math.min(100, Math.max(1, Number(b.count) || 25));
    const [heldRes, usedRes] = await c.db.batch([heldStmt(c.db, s.user_id, now), usedStmt(c.db, `given:${s.user_id}`)]);
    const held = (heldRes!.results[0] as { n: number }).n;
    const room = OFFLINE_MAX - held;
    if (room <= 0 || want > room) {
      throw fail(409, "pack_full", room > 0
        ? `You have room for ${room} more offline question${room === 1 ? "" : "s"}. Pick fewer, or delete a download.`
        : `You already have ${OFFLINE_MAX} questions saved for offline. Delete a download to make room.`, { held, cap: OFFLINE_MAX });
    }
    const staff = s.role !== "student";
    if (!staff) {
      const left = DAILY_QUESTIONS - usedOf(usedRes!.results[0] as { count: number; window_start: number } | undefined, DAY);
      if (want > left) {
        throw fail(429, "daily_limit", left > 0 ? `You can take ${left} more new question${left === 1 ? "" : "s"} today. Pick fewer.` : "That's the most new questions for one day. Download more tomorrow.");
      }
    }
    const sc = scope(b, "", staff);
    const where = [...sc.where, `id NOT IN (${IN_OPEN_TEST})`, `id NOT IN (SELECT q.question_id FROM pack_questions q JOIN packs p ON p.id = q.pack_id WHERE p.user_id = ? AND p.${LIVE})`];
    const args = [...sc.args, s.user_id, s.user_id, now];
    // Questions the student hasn't answered yet come first.
    const { results } = await c.db
      .prepare(`SELECT DISTINCT id FROM bank_served WHERE ${where.join(" AND ")}
        ORDER BY (id IN (SELECT question_id FROM answers WHERE user_id = ? AND counted_at IS NOT NULL)), random() LIMIT ${want}`)
      .bind(...args, s.user_id).all<{ id: string }>();
    const ids = results.map((r) => r.id);
    if (!ids.length) throw fail(409, "empty", "No questions match that. Try other chapters.");
    const id = uuid();
    const title = packTitle(sc);
    const made = await c.db.batch([
      c.db.prepare("INSERT INTO packs (id, user_id, device_id, title, question_count, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(id, s.user_id, device.id, title, ids.length, now, now + LEASE),
      c.db.prepare("INSERT INTO pack_questions (pack_id, question_id) SELECT ?, value FROM json_each(?)").bind(id, JSON.stringify(ids)),
      c.db.prepare("SELECT * FROM served WHERE id IN (SELECT value FROM json_each(?))").bind(JSON.stringify(ids)),
      ...(staff ? [] : [spend(c.db, `given:${s.user_id}`, ids.length, DAY)]),
    ]);
    const qs = new Map((made[2]!.results as Served[]).map((q) => [q.id, q]));
    return json({
      pack: { id, title, expiresAt: now + LEASE, items: ids.filter((q) => qs.has(q)).map((q) => full(qs.get(q)!)) },
      held: held + ids.length, cap: OFFLINE_MAX, now,
    });
  },

  /* The phone checks in: its packs are extended while the pass lasts. Any signed-in session will do (not only the
     active one), so a phone checking in never takes the account away from the student's laptop. */
  "POST /api/study/pack/renew": async (c) => {
    const s = await requireSession(c.db, c.request);
    const b = await body(c.request);
    const device = await appDevice(c, s, b.deviceKey);
    const now = Date.now();
    if (effectivePlan(s) === "free") {
      await revokeUserPacks(c.db, s.user_id).run();
      return json({ packs: [], held: 0, cap: OFFLINE_MAX, now });
    }
    const [, live, held] = await c.db.batch([
      c.db.prepare("UPDATE packs SET expires_at = ? WHERE device_id = ? AND user_id = ? AND revoked_at IS NULL").bind(now + LEASE, device.id, s.user_id),
      c.db.prepare("SELECT id, expires_at FROM packs WHERE device_id = ? AND user_id = ? AND revoked_at IS NULL").bind(device.id, s.user_id),
      heldStmt(c.db, s.user_id, now),
    ]);
    return json({
      packs: (live!.results as { id: string; expires_at: number }[]).map((p) => ({ id: p.id, expiresAt: p.expires_at })),
      held: (held!.results[0] as { n: number }).n, cap: OFFLINE_MAX, now,
    });
  },

  /* The student deleted a download: it stops counting toward the limit. */
  "POST /api/study/pack/release": async (c) => {
    const s = await requireSession(c.db, c.request);
    const b = await body(c.request);
    const device = await appDevice(c, s, b.deviceKey);
    await c.db.prepare("UPDATE packs SET revoked_at = ? WHERE id = ? AND user_id = ? AND device_id = ? AND revoked_at IS NULL")
      .bind(Date.now(), str(b.id, 64), s.user_id, device.id).run();
    return json({ ok: true });
  },

  /* Answers given offline. Each session the phone sends becomes a finished practice set with the phone's own id, so
     sending the same session twice changes nothing. Only questions from the student's own packs are taken. */
  "POST /api/study/sync": async (c) => {
    const s = await requireSession(c.db, c.request);
    const b = await body(c.request);
    await appDevice(c, s, b.deviceKey);
    const sessions = (Array.isArray(b.sessions) ? b.sessions : []).slice(0, MAX_SESSIONS) as Record<string, unknown>[];
    const accepted: string[] = [];
    let budget = MAX_ANSWERS;
    const now = Date.now();
    for (const ses of sessions) {
      if (!uuidOk(ses.id) || !uuidOk(ses.packId)) continue;
      const sid = ses.id.toLowerCase();
      const pack = await c.db.prepare("SELECT * FROM packs WHERE id = ? AND user_id = ?").bind(ses.packId.toLowerCase(), s.user_id).first<PackRow>();
      if (!pack) continue;
      const existing = await c.db.prepare("SELECT * FROM attempts WHERE id = ?").bind(sid).first<AttemptRow>();
      if (existing) {
        if (existing.user_id === s.user_id) accepted.push(ses.id);
        continue;
      }
      const inPack = new Set((await c.db.prepare("SELECT question_id FROM pack_questions WHERE pack_id = ?").bind(pack.id).all<{ question_id: string }>()).results.map((r) => r.question_id));
      const clamp = (v: unknown) => Math.min(now, Math.max(pack.created_at, Number(v) || 0));
      const seen = new Set<string>();
      const answers = (Array.isArray(ses.answers) ? ses.answers : [])
        .map((a) => a as Record<string, unknown>)
        .filter((a) => {
          const q = str(a.questionId, 20);
          const ok = inPack.has(q) && !seen.has(q) && Number.isInteger(a.answer) && (a.answer as number) >= 0 && (a.answer as number) <= 3;
          if (ok) seen.add(q);
          return ok;
        })
        .slice(0, budget)
        .map((a, idx) => ({ idx, q: str(a.questionId, 20), answer: a.answer as number, seconds: Number(a.seconds) > 0 ? Math.min(3600, Math.round(Number(a.seconds))) : null, at: clamp(a.at) }));
      if (!answers.length) { accepted.push(ses.id); continue; }
      budget -= answers.length;
      const started = Math.min(clamp(ses.startedAt), ...answers.map((a) => a.at));
      const ended = Math.max(clamp(ses.finishedAt), ...answers.map((a) => a.at));
      const ids = answers.map((a) => a.q);
      await c.db.batch([
        c.db.prepare(`INSERT OR IGNORE INTO attempts (id, user_id, kind, mode, title, question_ids, started_at, total)
            VALUES (?, ?, 'practice', 'tutor', ?, ?, ?, ?)`).bind(sid, s.user_id, `Offline · ${pack.title}`.slice(0, 120), JSON.stringify(ids), started, ids.length),
        c.db.prepare(`INSERT OR IGNORE INTO answers (attempt_id, idx, user_id, question_id, answer, checked, counted_at, seconds)
            SELECT ?1, json_extract(value, '$.idx'), ?2, json_extract(value, '$.q'), json_extract(value, '$.answer'), 1, json_extract(value, '$.at'), json_extract(value, '$.seconds')
            FROM json_each(?3) WHERE EXISTS (SELECT 1 FROM attempts WHERE id = ?1 AND user_id = ?2)`).bind(sid, s.user_id, JSON.stringify(answers)),
      ]);
      const a = await c.db.prepare("SELECT * FROM attempts WHERE id = ? AND user_id = ?").bind(sid, s.user_id).first<AttemptRow>();
      if (!a) continue;
      if (!a.finished_at) await finish(c.db, a, ended);
      accepted.push(ses.id);
      if (budget <= 0) break;
    }
    return json({ accepted });
  },
};
