import { banks } from "../lib/banks";
import { requireRole } from "./admin";
import { bankCounts, kept } from "./counts";
import { json } from "./http";

/* The admin panel's read-only numbers (/api/admin/quality, coverage, activity, users/export): how students are
   answering each question, how full each chapter is, how the site is growing, and the accounts as a spreadsheet.
   The slow ones are worked out at most once in a while and kept (server/counts.ts), because they read every answer. */

type Ctx = { db: D1Database; request: Request };

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const PKT = 5 * HOUR;
const pkDay = (ms: number) => new Date(ms + PKT).toISOString().slice(0, 10);

/* A question needs this many answers before its numbers mean anything. */
const MIN_ANSWERS = 10;
/* Four options, so a quarter right is what guessing gets. */
const GUESSING = 30;

type QualityRow = { id: string; subject: string; chapter: string; stem: string; key: number; n: number; right: number; p0: number; p1: number; p2: number; p3: number; reports: number };

async function quality(db: D1Database) {
  const { results } = await db
    .prepare(`SELECT q.id, q.subject, q.chapter, substr(q.stem, 1, 160) AS stem, q.answer AS key, count(*) AS n,
        sum(CASE WHEN a.answer = q.answer THEN 1 ELSE 0 END) AS right,
        sum(CASE WHEN a.answer = 0 THEN 1 ELSE 0 END) AS p0, sum(CASE WHEN a.answer = 1 THEN 1 ELSE 0 END) AS p1,
        sum(CASE WHEN a.answer = 2 THEN 1 ELSE 0 END) AS p2, sum(CASE WHEN a.answer = 3 THEN 1 ELSE 0 END) AS p3,
        (SELECT count(*) FROM reports r WHERE r.question_id = q.id AND r.status = 'open') AS reports
      FROM answers a JOIN questions q ON q.id = a.question_id
      WHERE a.counted_at IS NOT NULL AND a.answer IS NOT NULL
      GROUP BY a.question_id HAVING count(*) >= ${MIN_ANSWERS}`)
    .all<QualityRow>();
  const rows = results.map((r) => {
    const picks = [r.p0, r.p1, r.p2, r.p3];
    const pct = Math.round((r.right / r.n) * 100);
    const top = picks.indexOf(Math.max(...picks));
    // Worth a look: most students miss it, or one wrong option beats the key (the usual sign of a wrong key).
    const why = top !== r.key && picks[top]! > picks[r.key]! ? "wrong_pick" : pct < GUESSING ? "low" : null;
    return { id: r.id, subject: r.subject, chapter: r.chapter, stem: r.stem, key: r.key, n: r.n, pct, picks, reports: r.reports, why };
  });
  const answered = rows.length;
  return {
    at: Date.now(),
    minAnswers: MIN_ANSWERS,
    measured: answered,
    average: answered ? Math.round(rows.reduce((n, r) => n + r.pct, 0) / answered) : null,
    look: rows.filter((r) => r.why).sort((a, b) => (a.why === b.why ? a.pct - b.pct : a.why === "wrong_pick" ? -1 : 1)).slice(0, 200),
  };
}

async function activity(db: D1Database) {
  const now = Date.now();
  const days = 30;
  const since = Date.parse(`${pkDay(now - (days - 1) * DAY)}T00:00:00+05:00`);
  const [signups, answers] = await db.batch([
    db.prepare(`SELECT date((created_at + ${PKT}) / 1000, 'unixepoch') AS d, count(*) AS n FROM users WHERE created_at >= ? GROUP BY d`).bind(since),
    db.prepare(`SELECT date((counted_at + ${PKT}) / 1000, 'unixepoch') AS d, count(*) AS n, count(DISTINCT user_id) AS u
      FROM answers WHERE counted_at >= ? AND answer IS NOT NULL GROUP BY d`).bind(since),
  ]);
  const s = new Map((signups!.results as { d: string; n: number }[]).map((r) => [r.d, r.n]));
  const a = new Map((answers!.results as { d: string; n: number; u: number }[]).map((r) => [r.d, r]));
  return {
    at: now,
    days: Array.from({ length: days }, (_, i) => {
      const d = pkDay(now - (days - 1 - i) * DAY);
      return { date: d, signups: s.get(d) ?? 0, answers: a.get(d)?.n ?? 0, active: a.get(d)?.u ?? 0 };
    }),
  };
}
/* Shared with the overview, which shows the same thirty days. */
export const keptActivity = (db: D1Database) => kept(db, "admin:activity", 30 * 60 * 1000, () => activity(db));

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  // A leading =, +, - or @ would run as a formula in a spreadsheet.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};
const csv = (name: string, head: string[], rows: unknown[][]) =>
  new Response([head, ...rows].map((r) => r.map(csvCell).join(",")).join("\n") + "\n", {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${name}"`, "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });
const iso = (ms: number | null) => (ms ? new Date(ms).toISOString() : "");

export const insightRoutes: Record<string, (c: Ctx) => Promise<Response>> = {
  /* Questions most students get wrong, or where a wrong option is picked more than the key. ?fresh=1 recounts. */
  "GET /api/admin/quality": async (c) => {
    await requireRole(c, ["reviewer", "admin"]);
    const recount = new URL(c.request.url).searchParams.get("fresh") === "1";
    return json(await kept(c.db, "admin:quality", recount ? 0 : HOUR, () => quality(c.db)));
  },

  /* Questions students can be served per bank, subject and chapter, with every chapter of every syllabus listed so
     the empty and thin ones show. */
  "GET /api/admin/coverage": async (c) => {
    await requireRole(c, ["writer", "reviewer", "admin"]);
    const counts = await bankCounts(c.db);
    return json({
      questions: counts.questions,
      banks: banks.map((b) => ({
        id: b.id, name: b.name,
        subjects: b.subjects.map((s) => {
          const rows = counts.chapters.filter((x) => x.bank === b.id && x.subject === s.name);
          const names = [...s.chapters, ...rows.map((r) => r.chapter).filter((ch) => !s.chapters.includes(ch))];
          return { subject: s.name, chapters: names.map((ch) => { const r = rows.find((x) => x.chapter === ch); return { chapter: ch, total: r?.total ?? 0, free: r?.free ?? 0, listed: s.chapters.includes(ch) }; }) };
        }),
      })),
    });
  },

  "GET /api/admin/activity": async (c) => {
    await requireRole(c, ["admin"]);
    return json(await keptActivity(c.db));
  },

  /* Every account as a CSV file, for a spreadsheet or a mailing tool. */
  "GET /api/admin/users/export": async (c) => {
    await requireRole(c, ["admin"]);
    const { results } = await c.db
      .prepare(`SELECT u.name, u.email, u.phone, u.role, u.plan, u.plan_expires_at, u.created_at,
          (SELECT max(last_seen_at) FROM sessions s WHERE s.user_id = u.id) AS last_seen,
          (SELECT count(DISTINCT question_id) FROM answers a WHERE a.user_id = u.id AND a.counted_at IS NOT NULL AND a.answer IS NOT NULL) AS answered
        FROM users u ORDER BY u.created_at DESC LIMIT 20000`)
      .all<{ name: string; email: string | null; phone: string | null; role: string; plan: string; plan_expires_at: number | null; created_at: number; last_seen: number | null; answered: number }>();
    return csv(`markhor-prep-accounts-${pkDay(Date.now())}.csv`, ["Name", "Email", "Phone", "Role", "Plan", "Plan ends", "Joined", "Last seen", "Questions answered"],
      results.map((u) => [u.name, u.email, u.phone, u.role, u.plan, iso(u.plan_expires_at), iso(u.created_at), iso(u.last_seen), u.answered]));
  },

  "GET /api/admin/waitlist/export": async (c) => {
    await requireRole(c, ["admin"]);
    type Row = { contact: string; kind: string; created_at: number; exams?: string };
    const { results } = await c.db.prepare("SELECT contact, kind, created_at, exams FROM waitlist ORDER BY created_at DESC LIMIT 20000").all<Row>()
      .catch(() => c.db.prepare("SELECT contact, kind, created_at FROM waitlist ORDER BY created_at DESC LIMIT 20000").all<Row>());
    return csv(`markhor-prep-waitlist-${pkDay(Date.now())}.csv`, ["Contact", "Kind", "Exams", "Joined"], results.map((w) => [w.contact, w.kind, w.exams ?? "", iso(w.created_at)]));
  },
};
