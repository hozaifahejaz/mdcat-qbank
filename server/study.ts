import { normalisePhone } from "../lib/phone";
import { bankById } from "../lib/banks";
import { paper } from "../lib/site";
import { REPORT_HIDE, bankCounts, chaptersOf, subjectTotals } from "./counts";
import { uuid } from "./crypto";
import { requireActiveSession } from "./devices";
import { body, fail, json, str } from "./http";
import { prefsStmt, readPrefs } from "./prefs";
import { hit, overLimit, rateLimit, spend, usedOf, usedStmt } from "./ratelimit";
import { note, requireSession } from "./session";
import { effectivePlan } from "./users";

/* The student side of the bank (/api/study/*): which questions a student can practise, their tests, answers,
   bookmarks and reports, and the dashboard numbers. Questions only ever reach the browser from here, a test's worth
   at a time and only on the account's active device. Keys and explanations go out once an answer is checked or a
   timed test is submitted, never before. Questions come from the `served` view (migrations/0004_study.sql). */

type Ctx = { db: D1Database; request: Request; ip: string };

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const PKT = 5 * HOUR;
/* Answers sent a little after the clock runs out still count: the request was on its way. */
const GRACE = 30 * 1000;
export const MOCKS = 12;
/* New questions an account can be given in 24 hours: a full mock and a long day's practice, with room to spare. */
export const DAILY_QUESTIONS = 500;
const STARTS_PER_HOUR = 15;
const MINI_SPLIT = [13, 8, 6, 2, 1]; // 30 questions in the paper's proportions
const subjects = paper.map((p) => p.subject);

type Kind = "practice" | "timed" | "mock" | "mini-mock" | "past-paper";
type Mode = "tutor" | "timed" | "mock";
const modeOf: Record<Kind, Mode> = { practice: "tutor", timed: "timed", mock: "mock", "mini-mock": "mock", "past-paper": "mock" };

export type Served = {
  id: string; subject: string; chapter: string; topic: string; difficulty: string; source: string; stem: string;
  options: string; answer: number; why: string; wrong: string; free: number; paper: number | null; open_reports: number;
};
export type AttemptRow = {
  id: string; user_id: string; kind: Kind; mode: Mode; title: string; question_ids: string; mock_no: number | null;
  paper: number | null; started_at: number; deadline_at: number | null; finished_at: number | null; seconds: number | null;
  score: number | null; total: number;
};
type AnswerRow = { idx: number; question_id: string; answer: number | null; flagged: number; checked: number; seconds: number | null };

const parse = <T>(s: string, fallback: T): T => { try { return JSON.parse(s) as T; } catch { return fallback; } };

/* What a student sees while answering, and what they see once the answer is out. */
const ask = (r: Served) => ({ id: r.id, subject: r.subject, chapter: r.chapter, topic: r.topic, stem: r.stem, options: parse<string[]>(r.options, []) });
export const full = (r: Served) => ({ ...ask(r), difficulty: r.difficulty, source: r.source, answer: r.answer, why: r.why, wrong: parse<Record<number, string>>(r.wrong, {}) });

/* Who's asking, and which questions their plan opens: everything for a pass, the free set otherwise. */
async function student(c: Ctx, active: boolean) {
  // The session query already carries the account's role and plan, so this is one trip to the database.
  const s = active ? await requireActiveSession(c.db, c.request) : await requireSession(c.db, c.request);
  const paid = effectivePlan(s) !== "free";
  return { id: s.user_id, paid, staff: s.role !== "student", pool: paid ? "" : " AND free = 1" };
}

async function servedByIds(db: D1Database, ids: string[]): Promise<Map<string, Served>> {
  if (!ids.length) return new Map();
  const { results } = await db.prepare("SELECT * FROM served WHERE id IN (SELECT value FROM json_each(?))").bind(JSON.stringify(ids)).all<Served>();
  return new Map(results.map((r) => [r.id, r]));
}

/* The same mock always holds the same questions, so two students' "Full mock 3" can be compared. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(list: T[], rand: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

/* Leaves out questions that are only for other banks, e.g. FSc chapters not on the MDCAT syllabus (questions.mdcat). */
const ON_MDCAT = " AND id NOT IN (SELECT id FROM questions WHERE mdcat = 0)";

const idsBySubjectStmt = (db: D1Database, pool: string) =>
  db.prepare(`SELECT id, subject FROM served WHERE open_reports < ${REPORT_HIDE}${pool}${ON_MDCAT} ORDER BY id`);
const bySubject = (results: unknown[]) => {
  const rows = results as { id: string; subject: string }[];
  return new Map(subjects.map((s) => [s, rows.filter((r) => r.subject === s).map((r) => r.id)]));
};

/* Questions sitting in one of the student's open timed tests or mocks. Their keys stay shut everywhere else
   (practice, bookmarks, mistakes) until that test is submitted. Binds the user id once. */
export const IN_OPEN_TEST = `SELECT x.question_id FROM answers x JOIN attempts t ON t.id = x.attempt_id
  WHERE t.user_id = ? AND t.finished_at IS NULL AND t.mode != 'tutor'`;
/* Practice sets left open this long are closed as they stand. */
const STALE_PRACTICE = 7 * DAY;

/* ---------- Finishing a test ---------- */

/* Marks a test done: every unanswered timed question counts as skipped, and the score is read against the keys. */
export async function finish(db: D1Database, a: AttemptRow, at: number) {
  const end = a.deadline_at ? Math.min(at, a.deadline_at) : at;
  const marks = db
    .prepare(`SELECT count(*) AS asked, sum(CASE WHEN a.answer = s.answer THEN 1 ELSE 0 END) AS right
      FROM answers a JOIN served s ON s.id = a.question_id WHERE a.attempt_id = ? ${a.mode === "tutor" ? "AND a.checked = 1" : ""}`)
    .bind(a.id);
  type Marks = { asked: number; right: number | null };
  const r = a.mode === "tutor" ? await marks.first<Marks>()
    : (await db.batch<Marks>([db.prepare("UPDATE answers SET counted_at = ? WHERE attempt_id = ? AND counted_at IS NULL").bind(end, a.id), marks]))[1]!.results[0];
  const total = a.mode === "tutor" ? r?.asked ?? 0 : a.total;
  // A practice set closed with nothing checked isn't a result: it goes, instead of showing as 0/0.
  if (a.mode === "tutor" && total === 0) {
    await db.batch([
      db.prepare("DELETE FROM answers WHERE attempt_id = ?").bind(a.id),
      db.prepare("DELETE FROM attempts WHERE id = ? AND finished_at IS NULL").bind(a.id),
    ]);
    return false;
  }
  await db.prepare("UPDATE attempts SET finished_at = ?, seconds = ?, score = ?, total = ? WHERE id = ? AND finished_at IS NULL")
    .bind(end, Math.round((end - a.started_at) / 1000), r?.right ?? 0, total, a.id).run();
  return true;
}

/* Timed tests left open past their clock are submitted as they stood, the next time the student loads anything.
   Practice sets nobody came back to for a week are closed the same way, at their last checked answer. */
type Stale = AttemptRow & { last_at: number | null };
/* The two lookups, as statements a caller puts at the front of its own batch (so the check costs no extra trip),
   and the closing itself, which says whether anything was closed. Almost always nothing is. */
const overdue = (db: D1Database, userId: string, now: number) => [
  db.prepare("SELECT * FROM attempts WHERE user_id = ? AND finished_at IS NULL AND deadline_at < ?").bind(userId, now - GRACE),
  db.prepare(`SELECT a.*, (SELECT max(x.counted_at) FROM answers x WHERE x.attempt_id = a.id) AS last_at
      FROM attempts a WHERE a.user_id = ? AND a.finished_at IS NULL AND a.mode = 'tutor' AND a.started_at < ?`).bind(userId, now - STALE_PRACTICE),
];
async function closeOverdue(db: D1Database, expired: AttemptRow[], stale: Stale[], now: number) {
  let closed = false;
  for (const a of expired) { await finish(db, a, a.deadline_at!); closed = true; }
  for (const a of stale) {
    if (expired.some((e) => e.id === a.id) || (a.last_at ?? a.started_at) >= now - STALE_PRACTICE) continue;
    await finish(db, a, a.last_at ?? a.started_at);
    closed = true;
  }
  return closed;
}
/* Runs a batch that starts with the overdue lookups. If any test had to be closed, the batch is read again so
   the caller's numbers include it. Returns the caller's own results. */
async function afterClosing(db: D1Database, userId: string, own: (now: number) => D1PreparedStatement[]) {
  for (let pass = 0; ; pass++) {
    const now = Date.now();
    const res = await db.batch([...overdue(db, userId, now), ...own(now)]);
    if (pass || !(await closeOverdue(db, res[0]!.results as AttemptRow[], res[1]!.results as Stale[], now))) return res.slice(2);
  }
}

async function ownAttempt(db: D1Database, userId: string, id: unknown): Promise<AttemptRow> {
  const a = await db.prepare("SELECT * FROM attempts WHERE id = ? AND user_id = ?").bind(str(id, 64), userId).first<AttemptRow>();
  if (!a) throw fail(404, "not_found", "We couldn't find that test.");
  return a;
}

/* An open test that can still take answers. Past its clock, it's submitted and the student is told. */
async function stillOpen(db: D1Database, a: AttemptRow | undefined): Promise<AttemptRow> {
  if (!a) throw fail(404, "not_found", "We couldn't find that test.");
  if (a.finished_at) throw fail(409, "finished", "This test is already submitted.", { attempt: a.id });
  if (pastClock(a)) {
    await finish(db, a, a.deadline_at!);
    throw fail(409, "time_up", "Time's up. Your test was submitted.", { attempt: a.id });
  }
  return a;
}

/* ---------- Results in the dashboard's shape (lib/dashboard-data.ts) ---------- */

const result = (a: AttemptRow) => ({
  id: a.id, kind: a.kind, title: a.title, date: new Date(a.finished_at ?? a.started_at).toISOString(),
  score: a.score ?? 0, total: a.total, minutes: Math.max(1, Math.round((a.seconds ?? 0) / 60)),
});

/* The latest counted answer to each question the student has answered, with whether it was right. */
const LATEST = `SELECT l.question_id, l.answer, l.at, s.answer AS key, s.subject, s.chapter, s.topic FROM (
    SELECT question_id, answer, max(counted_at) AS at FROM answers
     WHERE user_id = ?1 AND counted_at IS NOT NULL AND answer IS NOT NULL GROUP BY question_id
  ) l JOIN served s ON s.id = l.question_id`;

/* The same, counting a question left blank in a submitted test: its answer is NULL. */
const LATEST_ANY = `SELECT question_id, answer, max(counted_at) AS at FROM answers WHERE user_id = ? AND counted_at IS NOT NULL GROUP BY question_id`;

/* The student's latest answers placed in a bank's own subjects and chapters. ?1 is the student. Bank ids come from
   lib/banks.ts, never from the request, so they are safe to write into the statement. */
const latestIn = (bank: string) => bank === "mdcat"
  ? `SELECT l.question_id, l.answer, l.key, l.subject, l.chapter, l.topic FROM (${LATEST}) l
      WHERE NOT EXISTS (SELECT 1 FROM questions m WHERE m.id = l.question_id AND m.mdcat = 0)`
  : `SELECT l.question_id, l.answer, l.key, b.subject, b.chapter, l.topic FROM (${LATEST}) l
      JOIN bank_questions b ON b.question_id = l.question_id AND b.bank = '${bank}'`;

/* Where a question stands for a student, which the practice screen filters by (any mix of them). */
const FILTERS = ["unused", "incorrect", "marked", "omitted", "correct"] as const;
type Filter = (typeof FILTERS)[number];

/* Which questions a practice set draws from: a bank, then subjects, chapters or a topic of it. */
export function scope(b: Record<string, unknown>, pool: string) {
  const bank = bankById(str(b.bank, 10)) ?? bankById("mdcat")!;
  const where: string[] = ["bank = ?", `open_reports < ${REPORT_HIDE}${pool}`];
  const args: unknown[] = [bank.id];
  const list = (v: unknown, max: number) => (Array.isArray(v) ? v : typeof v === "string" && v ? v.split("|") : []).filter((x): x is string => typeof x === "string").slice(0, max);
  const subject = str(b.subject, 40);
  // Several whole subjects (books) at once, or one subject and some of its chapters.
  const several = list(b.subjects, 10);
  const chapters = list(b.chapters, 40);
  if (subject) { where.push("subject = ?"); args.push(subject); }
  else if (several.length) { where.push("subject IN (SELECT value FROM json_each(?))"); args.push(JSON.stringify(several)); }
  if (chapters.length) { where.push("chapter IN (SELECT value FROM json_each(?))"); args.push(JSON.stringify(chapters)); }
  const topic = str(b.topic, 120);
  if (topic) { where.push("topic = ?"); args.push(topic); }
  return { bank, where, args, subject, several, chapters, topic };
}

/* The same selection, as a test on one question a student already has (an answer or a bookmark), so their own
   numbers can be counted from their own rows instead of by reading the whole bank. `col` is the question id. */
function membership(sc: ReturnType<typeof scope>, pool: string) {
  const mdcat = sc.bank.id === "mdcat";
  const t = mdcat ? "s" : "b";
  const where = [`s.open_reports < ${REPORT_HIDE}`];
  const args: unknown[] = [];
  if (pool) where.push("s.free = 1");
  if (mdcat) where.push("NOT EXISTS (SELECT 1 FROM questions m WHERE m.id = s.id AND m.mdcat = 0)");
  if (sc.subject) { where.push(`${t}.subject = ?`); args.push(sc.subject); }
  else if (sc.several.length) { where.push(`${t}.subject IN (SELECT value FROM json_each(?))`); args.push(JSON.stringify(sc.several)); }
  if (sc.chapters.length) { where.push(`${t}.chapter IN (SELECT value FROM json_each(?))`); args.push(JSON.stringify(sc.chapters)); }
  if (sc.topic) { where.push("s.topic = ?"); args.push(sc.topic); }
  const join = (col: string) => `JOIN served s ON s.id = ${col}${mdcat ? "" : ` JOIN bank_questions b ON b.question_id = ${col} AND b.bank = '${sc.bank.id}'`}`;
  return { join, where: where.join(" AND "), args };
}

/* How everyone answered these questions: picks per option, once enough students have answered to mean something. */
const MIN_STATS = 20;
type Stats = { n: number; picks: number[] };
/* `which` is a subquery giving the question ids. */
const statsSql = (which: string) => `SELECT question_id, answer, count(*) AS n FROM answers
    WHERE question_id IN (${which}) AND counted_at IS NOT NULL AND answer IS NOT NULL GROUP BY question_id, answer`;
function readStats(results: unknown[]): Map<string, Stats> {
  const out = new Map<string, Stats>();
  for (const r of results as { question_id: string; answer: number; n: number }[]) {
    const s = out.get(r.question_id) ?? { n: 0, picks: [0, 0, 0, 0] };
    if (r.answer >= 0 && r.answer <= 3) { s.picks[r.answer]! += r.n; s.n += r.n; }
    out.set(r.question_id, s);
  }
  for (const [id, s] of out) if (s.n < MIN_STATS) out.delete(id);
  return out;
}
/* An open test as the player gets it: questions without keys, answers so far, and the server's clock. */
function sitting(a: AttemptRow, rows: AnswerRow[], qs: Map<string, Served>, saved: Set<string>, stats: Map<string, Stats>) {
  return {
    id: a.id, kind: a.kind, mode: a.mode, title: a.title, startedAt: a.started_at, deadlineAt: a.deadline_at, now: Date.now(),
    items: rows.filter((r) => qs.has(r.question_id)).map((r) => {
      const q = qs.get(r.question_id)!;
      return { idx: r.idx, q: ask(q), answer: r.answer, flagged: !!r.flagged, checked: !!r.checked, bookmarked: saved.has(q.id), seconds: r.seconds, reveal: a.mode === "tutor" && r.checked ? full(q) : null, stats: (a.mode === "tutor" && r.checked && stats.get(q.id)) || null };
    }),
  };
}
const byId = (results: unknown[]) => new Map((results as Served[]).map((r) => [r.id, r]));
const idSet = (results: unknown[]) => new Set((results as { question_id: string }[]).map((m) => m.question_id));
/* Only this student's own test: every statement about a test's answers is tied to it. ?1 is the test, ?2 the student. */
const OWN = "(SELECT id FROM attempts WHERE id = ?1 AND user_id = ?2)";
const pastClock = (a: AttemptRow) => !!a.deadline_at && Date.now() > a.deadline_at + GRACE;

const secs = (v: unknown) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.min(3600, Math.round(Number(v))) : null);

/* A submitted test as the results page shows it. The key and explanations are read only for a test that is already
   submitted. Null from readReview when the test isn't there or isn't submitted. */
function reviewStmts(db: D1Database, id: string, userId: string) {
  const DONE = "(SELECT id FROM attempts WHERE id = ?1 AND user_id = ?2 AND finished_at IS NOT NULL)";
  const shown = `SELECT question_id FROM answers x WHERE x.attempt_id = ${DONE} AND (x.checked = 1 OR (SELECT mode FROM attempts WHERE id = ?1) != 'tutor')`;
  return [
    db.prepare("SELECT * FROM attempts WHERE id = ?1 AND user_id = ?2").bind(id, userId),
    db.prepare(`SELECT idx, question_id, answer, flagged, checked, seconds FROM answers WHERE question_id IN (${shown}) AND attempt_id = ?1 ORDER BY idx`).bind(id, userId),
    db.prepare("SELECT question_id FROM bookmarks WHERE user_id = ?").bind(userId),
    db.prepare(`SELECT * FROM served WHERE id IN (${shown})`).bind(id, userId),
    db.prepare(statsSql(shown)).bind(id, userId),
  ];
}
function readReview(res: D1Result[]) {
  const a = res[0]!.results[0] as AttemptRow | undefined;
  if (!a?.finished_at) return null;
  const rows = res[1]!.results as AnswerRow[];
  const qs = byId(res[3]!.results);
  const saved = idSet(res[2]!.results);
  const stats = readStats(res[4]!.results);
  return {
    attempt: { ...result(a), mode: a.mode, seconds: a.seconds ?? 0 },
    // Questions taken down since the test was sat. They still count in the saved score but can't be shown.
    withdrawn: rows.filter((r) => !qs.has(r.question_id)).length,
    items: rows.filter((r) => qs.has(r.question_id)).map((r) => ({ q: full(qs.get(r.question_id)!), chosen: r.answer, flagged: !!r.flagged, bookmarked: saved.has(r.question_id), seconds: r.seconds, stats: stats.get(r.question_id) ?? null })),
  };
}

const pkDate = (ms: number) => new Date(ms + PKT).toISOString().slice(0, 10);

/* ---------- Routes ---------- */

export const studyRoutes: Record<string, (c: Ctx) => Promise<Response>> = {
  /* How many questions each chapter has for this student, which tests are open to them, and their past papers. */
  "GET /api/study/catalog": async (c) => {
    const me = await student(c, false);
    // ?bank= picks whose chapters to count (lib/banks.ts); mocks and past papers are always MDCAT.
    const bank = bankById(new URL(c.request.url).searchParams.get("bank"))?.id ?? "mdcat";
    // The bank's own numbers come from the kept counts; only this student's rows are read here.
    const [counts, [mini, mine]] = await Promise.all([
      bankCounts(c.db),
      c.db.batch([
        c.db.prepare("SELECT id, finished_at FROM attempts WHERE user_id = ? AND kind = 'mini-mock' ORDER BY started_at DESC LIMIT 1").bind(me.id),
        // This student's latest answer to each question in the bank, by the bank's subject and chapter.
        c.db.prepare(`SELECT x.subject, x.chapter, count(*) AS answered, sum(CASE WHEN x.answer = x.key THEN 1 ELSE 0 END) AS correct
          FROM (${latestIn(bank)}) x GROUP BY x.subject, x.chapter`).bind(me.id),
      ]),
    ]);
    const lastMini = mini!.results[0] as { id: string; finished_at: number | null } | undefined;
    const done = mine!.results as { subject: string; chapter: string; answered: number; correct: number }[];
    const rows = chaptersOf(counts, bank).map((r) => {
      const d = done.find((x) => x.subject === r.subject && x.chapter === r.chapter);
      return { subject: r.subject, chapter: r.chapter, total: r.total, open: me.paid ? r.total : r.free, answered: d?.answered ?? 0, correct: d?.correct ?? 0 };
    });
    const totals = subjectTotals(counts);
    const bySubject = (s: string, k: "total" | "open") => {
      const t = totals.get(s);
      return !t ? 0 : k === "total" || me.paid ? t.total : t.free;
    };
    return json({
      paid: me.paid,
      bank,
      chapters: rows,
      papers: counts.papers.map((p) => ({ year: p.year, count: p.n })),
      mocks: MOCKS,
      mockReady: paper.every((p) => bySubject(p.subject, "total") >= p.count),
      miniReady: subjects.reduce((n, s) => n + bySubject(s, "open"), 0) >= 10,
      miniUsed: !!lastMini,
      // A started mini mock that isn't finished yet, to resume.
      miniOpen: lastMini && !lastMini.finished_at ? lastMini.id : null,
    });
  },

  /* For the practice screen: how many of the picked questions are unused, incorrect, marked, omitted or correct. */
  "GET /api/study/pool": async (c) => {
    const me = await student(c, false);
    const p = new URL(c.request.url).searchParams;
    const sc = scope(Object.fromEntries(p), me.pool);
    const m = membership(sc, me.pool);
    const state = `sum(CASE WHEN l.question_id IS NOT NULL AND l.answer IS NULL THEN 1 ELSE 0 END) AS omitted,
        sum(CASE WHEN l.answer = s.answer THEN 1 ELSE 0 END) AS correct,
        sum(CASE WHEN l.answer IS NOT NULL AND l.answer != s.answer THEN 1 ELSE 0 END) AS incorrect`;
    type Row = Record<string, number | null>;
    // ?by=chapter: the same counts for every chapter of the bank at once, so the practice screen can add up any
    // selection itself instead of asking again each time a box is ticked.
    if (p.get("by") === "chapter") {
      const all = scope({ bank: p.get("bank") ?? "" }, me.pool);
      const am = membership(all, me.pool);
      const t = all.bank.id === "mdcat" ? "s" : "b";
      type ChRow = Row & { subject: string; chapter: string };
      const [counts, [seenRes, markedRes]] = await Promise.all([
        bankCounts(c.db),
        c.db.batch<ChRow>([
          c.db.prepare(`SELECT ${t}.subject AS subject, ${t}.chapter AS chapter, count(*) AS seen, ${state} FROM (${LATEST_ANY}) l ${am.join("l.question_id")} WHERE ${am.where} GROUP BY 1, 2`).bind(me.id, ...am.args),
          c.db.prepare(`SELECT ${t}.subject AS subject, ${t}.chapter AS chapter, count(*) AS marked, sum(CASE WHEN l.question_id IS NULL THEN 1 ELSE 0 END) AS unused, ${state}
            FROM bookmarks k ${am.join("k.question_id")} LEFT JOIN (${LATEST_ANY}) l ON l.question_id = k.question_id
            WHERE k.user_id = ? AND ${am.where} GROUP BY 1, 2`).bind(me.id, me.id, ...am.args),
        ]),
      ]);
      const find = (rows: ChRow[], x: { subject: string; chapter: string }) => rows.find((r) => r.subject === x.subject && r.chapter === x.chapter) ?? ({} as Partial<ChRow>);
      return json({
        bank: all.bank.id,
        chapters: chaptersOf(counts, all.bank.id).map((x) => {
          const r = find(seenRes!.results, x);
          const k = find(markedRes!.results, x);
          const total = me.paid ? x.total : x.free;
          return {
            subject: x.subject, chapter: x.chapter,
            total, unused: Math.max(0, total - (r.seen ?? 0)), incorrect: r.incorrect ?? 0, marked: k.marked ?? 0, omitted: r.omitted ?? 0, correct: r.correct ?? 0,
            markedIn: { unused: k.unused ?? 0, incorrect: k.incorrect ?? 0, omitted: k.omitted ?? 0, correct: k.correct ?? 0 },
          };
        }),
      });
    }
    // What the student has answered or bookmarked in the selection, from their own rows. How many questions the
    // selection holds comes from the kept counts (a topic isn't in those, so that one is counted).
    const [counts, [seenRes, markedRes, topicRes]] = await Promise.all([
      bankCounts(c.db),
      c.db.batch<Row>([
        c.db.prepare(`SELECT count(*) AS seen, ${state} FROM (${LATEST_ANY}) l ${m.join("l.question_id")} WHERE ${m.where}`).bind(me.id, ...m.args),
        c.db.prepare(`SELECT count(*) AS marked, sum(CASE WHEN l.question_id IS NULL THEN 1 ELSE 0 END) AS unused, ${state}
          FROM bookmarks k ${m.join("k.question_id")} LEFT JOIN (${LATEST_ANY}) l ON l.question_id = k.question_id
          WHERE k.user_id = ? AND ${m.where}`).bind(me.id, me.id, ...m.args),
        ...(sc.topic ? [c.db.prepare(`SELECT count(DISTINCT id) AS n FROM bank_served WHERE ${sc.where.join(" AND ")}`).bind(...sc.args)] : []),
      ]),
    ]);
    const total = sc.topic ? (topicRes!.results[0]?.n ?? 0) : chaptersOf(counts, sc.bank.id)
      .filter((r) => (sc.subject ? r.subject === sc.subject : !sc.several.length || sc.several.includes(r.subject)) && (!sc.chapters.length || sc.chapters.includes(r.chapter)))
      .reduce((n, r) => n + (me.paid ? r.total : r.free), 0);
    const r = seenRes!.results[0] ?? {};
    const k = markedRes!.results[0] ?? {};
    // markedIn: the marked ones by where they stand, so the screen can count a mix of filters without counting any twice.
    return json({
      total, unused: Math.max(0, total - (r.seen ?? 0)), incorrect: r.incorrect ?? 0, marked: k.marked ?? 0, omitted: r.omitted ?? 0, correct: r.correct ?? 0,
      markedIn: { unused: k.unused ?? 0, incorrect: k.incorrect ?? 0, omitted: k.omitted ?? 0, correct: k.correct ?? 0 },
    });
  },

  /* Start a test. The server picks the questions, so the browser never holds more than the test it's sitting. */
  "POST /api/study/start": async (c) => {
    const me = await student(c, true);
    const b = await body(c.request);
    let kind: Kind = (["practice", "timed", "mock", "mini-mock", "past-paper"] as const).find((k) => k === b.kind) ?? "practice";
    // A practice set has two switches: tutor (the explanation after each answer) and timed (a minute a question).
    // Older links only say practice (tutor, no clock) or timed (answers at the end, on the clock).
    const custom = kind === "practice" || kind === "timed";
    const tutor = custom && (typeof b.tutor === "boolean" ? b.tutor : kind === "practice");
    const clock = !custom || (typeof b.timed === "boolean" ? b.timed : kind === "timed");
    if (custom) kind = tutor ? "practice" : "timed";
    const mode = modeOf[kind];
    let ids: string[] = [];
    let title = str(b.title, 120);
    let mockNo: number | null = null;
    let year: number | null = null;
    const asked = custom && Array.isArray(b.ids) ? b.ids.filter((x): x is string => typeof x === "string").slice(0, 200) : [];

    // Which questions the test will hold depends only on what was asked, so that lookup rides in the first trip too.
    const picks: D1PreparedStatement[] = [];
    if (kind === "mock") {
      mockNo = Math.min(MOCKS, Math.max(1, Number(b.mock) || 1));
      title = `Full mock ${mockNo}`;
      if (me.paid) picks.push(idsBySubjectStmt(c.db, ""));
    } else if (kind === "mini-mock") {
      title = "Mini mock";
      picks.push(idsBySubjectStmt(c.db, me.pool));
      if (!me.paid) picks.push(c.db.prepare("SELECT 1 FROM attempts WHERE user_id = ? AND kind = 'mini-mock'").bind(me.id));
    } else if (kind === "past-paper") {
      year = Number(b.paper) || 0;
      title = `PMDC MDCAT ${year}`;
      if (me.paid) picks.push(c.db.prepare(`SELECT id, subject FROM served WHERE paper = ? AND open_reports < ${REPORT_HIDE} ORDER BY id`).bind(year));
    } else {
      const count = Math.min(100, Math.max(1, Number(b.count) || 25));
      const sc = scope(asked.length ? { bank: b.bank } : b, me.pool);
      const { bank, where, args } = sc;
      where.push(`id NOT IN (${IN_OPEN_TEST})`);
      args.push(me.id);
      if (asked.length) {
        where.push("id IN (SELECT value FROM json_each(?))");
        args.push(JSON.stringify(asked));
      } else {
        const { subject, several, chapters, topic } = sc;
        // Older links say from=unseen or from=wrong; the practice screen sends the list.
        const picked = Array.isArray(b.filters) ? FILTERS.filter((f) => (b.filters as unknown[]).includes(f))
          : b.from === "unseen" ? (["unused"] as Filter[]) : b.from === "wrong" ? (["incorrect"] as Filter[]) : [];
        if (picked.length) {
          const any: string[] = [];
          for (const f of picked) {
            if (f === "unused") { any.push("id NOT IN (SELECT question_id FROM answers WHERE user_id = ? AND counted_at IS NOT NULL)"); args.push(me.id); }
            else if (f === "marked") { any.push("id IN (SELECT question_id FROM bookmarks WHERE user_id = ?)"); args.push(me.id); }
            else {
              const test = f === "omitted" ? "l.answer IS NULL" : f === "correct" ? "l.answer = s.answer" : "l.answer IS NOT NULL AND l.answer != s.answer";
              any.push(`id IN (SELECT l.question_id FROM (${LATEST_ANY}) l JOIN served s ON s.id = l.question_id WHERE ${test})`);
              args.push(me.id);
            }
          }
          where.push(`(${any.join(" OR ")})`);
        }
        title ||= subject ? `${subject}${topic ? ` · ${topic}` : chapters.length === 1 ? ` · ${chapters[0]}` : ""}`
          : several.length ? several.join(" + ") : "Mixed practice";
        if (bank.id !== "mdcat") title = `${bank.name} · ${title}`.slice(0, 120);
      }
      picks.push(c.db.prepare(`SELECT DISTINCT id, subject FROM bank_served WHERE ${where.join(" AND ")} ORDER BY random() LIMIT ${asked.length ? 200 : count}`).bind(...args));
      title ||= "Practice";
    }

    // One trip: tests past their clock, a timed test still running, today's question count, this start counted, and
    // the questions for the new test.
    const t0 = Date.now();
    const lead = [
      ...overdue(c.db, me.id, t0),
      c.db.prepare("SELECT id, title FROM attempts WHERE user_id = ? AND finished_at IS NULL AND mode != 'tutor' ORDER BY started_at DESC").bind(me.id),
      usedStmt(c.db, `given:${me.id}`),
      ...(me.staff ? [] : [hit(c.db, `start:${me.id}`, HOUR)]),
    ];
    const pre = await c.db.batch([...lead, ...picks]);
    const found = pre.slice(lead.length).map((r) => r.results);
    if (!me.staff) overLimit(pre[4]!.results[0] as { count: number; window_start: number }, STARTS_PER_HOUR, HOUR);
    const expired = pre[0]!.results as AttemptRow[];
    const stale = pre[1]!.results as Stale[];
    // A test closed just now frees its questions, so a practice set is picked again without them shut out. Rare.
    const closed = await closeOverdue(c.db, expired, stale, t0);
    if (closed && custom) found[0] = (await picks[0]!.all()).results;
    // One timed test or mock at a time: a second one could share questions with the first and open their answers early.
    if (mode !== "tutor") {
      const running = (pre[2]!.results as { id: string; title: string }[]).find((r) => !expired.some((e) => e.id === r.id));
      if (running) throw fail(409, "open_test", `You still have ${running.title} running. Finish or submit it before starting another timed test.`, { attempt: running.id });
    }
    if ((kind === "mock" || kind === "past-paper") && !me.paid) {
      throw fail(402, "needs_pass", kind === "mock" ? "Full mocks come with a pass. Your free mini mock is on the Mocks page." : "Past papers come with a pass.");
    }

    if (kind === "mock") {
      const by = bySubject(found[0]!);
      if (paper.some((p) => (by.get(p.subject)?.length ?? 0) < p.count)) throw fail(409, "not_ready", "Full mocks open once the bank has enough questions in every subject.");
      ids = paper.flatMap((p, k) => shuffle(by.get(p.subject)!, seeded(mockNo! * 101 + k)).slice(0, p.count));
    } else if (kind === "mini-mock") {
      if (!me.paid && found[1]!.length) throw fail(402, "needs_pass", "You've used your free mini mock. A pass opens every full mock.");
      const by = bySubject(found[0]!);
      ids = paper.flatMap((p, k) => shuffle(by.get(p.subject)!, seeded(7 + k)).slice(0, MINI_SPLIT[k]));
      if (ids.length < 10) throw fail(409, "not_ready", "The mini mock opens once the free set has a few more questions.");
    } else if (kind === "past-paper") {
      const results = found[0] as { id: string; subject: string }[];
      ids = [...results].sort((x, y) => subjects.indexOf(x.subject) - subjects.indexOf(y.subject)).map((r) => r.id);
    } else {
      const results = found[0] as { id: string; subject: string }[];
      ids = asked.length ? asked.filter((id) => results.some((r) => r.id === id)) : results.map((r) => r.id);
    }
    if (!ids.length) throw fail(409, "empty", me.paid ? "No questions match that yet. Try more chapters, or All questions." : "No free questions match that yet. Try more chapters, or get a pass for the whole bank.");

    const id = uuid();
    const now = Date.now();
    if (!me.staff) {
      // Counted when the questions are handed out, so a set that is opened and thrown away still counts.
      const left = DAILY_QUESTIONS - usedOf(pre[3]!.results[0] as { count: number; window_start: number } | undefined, DAY);
      if (ids.length > left) {
        const noted = await c.db.prepare("SELECT 1 FROM security_events WHERE user_id = ? AND kind = 'daily_limit' AND created_at > ?").bind(me.id, now - DAY).first();
        if (!noted) await note(c.db, me.id, "daily_limit", `Reached ${DAILY_QUESTIONS} new questions in a day`).run();
        throw fail(429, "daily_limit", left > 0 ? `You can start ${left} more question${left === 1 ? "" : "s"} today. Pick a shorter set, or carry on with a test you already have open.` : "That's the most new questions for one day. Review what you've done today, and start new sets tomorrow.");
      }
    }
    // Timed tests get a minute a question; the mock is the real paper's 3 hours for 180.
    const deadline = clock ? now + ids.length * 60 * 1000 : null;
    // The same trip that saves the test also reads its questions, so the player opens without asking again.
    const made = await c.db.batch([
      c.db.prepare(`INSERT INTO attempts (id, user_id, kind, mode, title, question_ids, mock_no, paper, started_at, deadline_at, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, me.id, kind, mode, title, JSON.stringify(ids), mockNo, year, now, deadline, ids.length),
      c.db.prepare("INSERT INTO answers (attempt_id, idx, user_id, question_id) SELECT ?1, key, ?2, value FROM json_each(?3)").bind(id, me.id, JSON.stringify(ids)),
      c.db.prepare("SELECT * FROM served WHERE id IN (SELECT value FROM json_each(?))").bind(JSON.stringify(ids)),
      c.db.prepare("SELECT question_id FROM bookmarks WHERE user_id = ?").bind(me.id),
      ...(me.staff ? [] : [spend(c.db, `given:${me.id}`, ids.length, DAY)]),
    ]);
    const wanted = Number(b.count) || 0;
    const a: AttemptRow = { id, user_id: me.id, kind, mode, title, question_ids: "", mock_no: mockNo, paper: year, started_at: now, deadline_at: deadline, finished_at: null, seconds: null, score: null, total: ids.length };
    const rows: AnswerRow[] = ids.map((q, idx) => ({ idx, question_id: q, answer: null, flagged: 0, checked: 0, seconds: null }));
    return json({
      id, count: ids.length, short: kind !== "mock" && kind !== "past-paper" && kind !== "mini-mock" && !b.ids && wanted > ids.length,
      attempt: sitting(a, rows, byId(made[2]!.results), idSet(made[3]!.results), new Map()),
    });
  },

  /* An open test to sit or resume: questions without keys, answers so far, and the server's clock. */
  "GET /api/study/attempt": async (c) => {
    const me = await student(c, true);
    const id = str(new URL(c.request.url).searchParams.get("id"), 64);
    const [own, rowsRes, marks, served, picks] = await c.db.batch([
      c.db.prepare("SELECT * FROM attempts WHERE id = ?1 AND user_id = ?2").bind(id, me.id),
      c.db.prepare(`SELECT idx, question_id, answer, flagged, checked, seconds FROM answers WHERE attempt_id = ${OWN} ORDER BY idx`).bind(id, me.id),
      c.db.prepare("SELECT question_id FROM bookmarks WHERE user_id = ?").bind(me.id),
      c.db.prepare(`SELECT * FROM served WHERE id IN (SELECT question_id FROM answers WHERE attempt_id = ${OWN})`).bind(id, me.id),
      c.db.prepare(statsSql(`SELECT question_id FROM answers WHERE attempt_id = ${OWN} AND checked = 1`)).bind(id, me.id),
    ]);
    const a = own!.results[0] as AttemptRow | undefined;
    if (!a) throw fail(404, "not_found", "We couldn't find that test.");
    if (!a.finished_at && pastClock(a) && !(await finish(c.db, a, a.deadline_at!))) throw fail(404, "not_found", "We couldn't find that test.");
    if (a.finished_at || pastClock(a)) return json({ finished: true, id: a.id });
    return json(sitting(a, rowsRes!.results as AnswerRow[], byId(served!.results), idSet(marks!.results), readStats(picks!.results)));
  },

  "POST /api/study/answer": async (c) => {
    const me = await student(c, true);
    const b = await body(c.request);
    const id = str(b.id, 64);
    const idx = Number(b.idx);
    const answer = b.answer === null ? null : Number.isInteger(b.answer) && (b.answer as number) >= 0 && (b.answer as number) <= 3 ? (b.answer as number) : undefined;
    // The save only lands on this student's own open test that is still inside its clock; the same trip reads the test.
    const [own, saved] = await c.db.batch([
      c.db.prepare("SELECT * FROM attempts WHERE id = ?1 AND user_id = ?2").bind(id, me.id),
      c.db.prepare(`UPDATE answers SET answer = ?3, flagged = ?4, seconds = coalesce(?5, seconds) WHERE idx = ?6 AND checked = 0 AND ?7 = 1
          AND attempt_id = (SELECT id FROM attempts WHERE id = ?1 AND user_id = ?2 AND finished_at IS NULL AND (deadline_at IS NULL OR deadline_at + ${GRACE} >= ?8))`)
        .bind(id, me.id, answer ?? null, b.flagged ? 1 : 0, secs(b.seconds), Number.isInteger(idx) ? idx : -1, Number.isInteger(idx) && answer !== undefined ? 1 : 0, Date.now()),
    ]);
    await stillOpen(c.db, own!.results[0] as AttemptRow | undefined);
    if (!Number.isInteger(idx) || answer === undefined) throw fail(400, "bad_answer", "That answer didn't save. Please try again.");
    if (!saved!.meta.changes) throw fail(409, "locked", "This answer is already checked.");
    return json({ ok: true });
  },

  /* Practice mode: lock in an answer and get the key and explanation. */
  "POST /api/study/check": async (c) => {
    const me = await student(c, true);
    const b = await body(c.request);
    const id = str(b.id, 64);
    const idx = Number(b.idx);
    const answer = Number(b.answer);
    const ok = Number.isInteger(idx) && Number.isInteger(answer) && answer >= 0 && answer <= 3;
    // The website has usually fetched the explanation already (peek, below) and only needs the answer locked in.
    const quiet = b.quiet === true;
    // One trip: the answer is locked in only on this student's own open practice set, then the question is read back.
    const [own, , rowRes, served, picks] = await c.db.batch([
      c.db.prepare("SELECT * FROM attempts WHERE id = ?1 AND user_id = ?2").bind(id, me.id),
      c.db.prepare(`UPDATE answers SET answer = ?3, checked = 1, counted_at = ?4, seconds = coalesce(?5, seconds) WHERE idx = ?6 AND checked = 0 AND ?7 = 1
          AND attempt_id = (SELECT id FROM attempts WHERE id = ?1 AND user_id = ?2 AND finished_at IS NULL AND mode = 'tutor' AND (deadline_at IS NULL OR deadline_at + ${GRACE} >= ?4))`)
        .bind(id, me.id, ok ? answer : null, Date.now(), secs(b.seconds), ok ? idx : -1, ok ? 1 : 0),
      c.db.prepare(`SELECT question_id, checked, answer FROM answers WHERE attempt_id = ${OWN} AND idx = ?3`).bind(id, me.id, ok ? idx : -1),
      ...(quiet ? [] : [
        c.db.prepare(`SELECT * FROM served WHERE id = (SELECT question_id FROM answers WHERE attempt_id = ${OWN} AND idx = ?3)`).bind(id, me.id, ok ? idx : -1),
        c.db.prepare(statsSql(`SELECT question_id FROM answers WHERE attempt_id = ${OWN} AND idx = ?3`)).bind(id, me.id, ok ? idx : -1),
      ]),
    ]);
    const a = await stillOpen(c.db, own!.results[0] as AttemptRow | undefined);
    if (a.mode !== "tutor") throw fail(400, "timed", "Answers in a timed test open when you submit it.");
    if (!ok) throw fail(400, "bad_answer", "Pick an answer first.");
    const row = rowRes!.results[0] as { question_id: string; checked: number; answer: number | null } | undefined;
    if (!row) throw fail(404, "not_found", "That question isn't in this test.");
    if (quiet) {
      if (!row.checked) throw fail(409, "not_saved", "That answer didn't save. Please try again.");
      return json({ answer: row.answer });
    }
    const q = served!.results[0] as Served | undefined;
    // The key only ever goes out for an answer that is locked in.
    if (!q || !row.checked) throw fail(404, "not_found", "This question was taken down for a fix.");
    return json({ answer: row.answer, reveal: full(q), stats: readStats(picks!.results).get(q.id) ?? null });
  },
  /* The answer and explanation of the question on screen, fetched while the student reads it so Submit shows the
     result without a wait. Only for a question of the student's own open practice set with explanations on; timed
     tests and mocks never get one. */
  "GET /api/study/peek": async (c) => {
    const me = await student(c, true);
    const p = new URL(c.request.url).searchParams;
    const id = str(p.get("id"), 64);
    const idx = Number(p.get("idx") ?? "x");
    const mine = `SELECT question_id FROM answers WHERE idx = ?3 AND attempt_id = (SELECT id FROM attempts WHERE id = ?1 AND user_id = ?2
        AND finished_at IS NULL AND mode = 'tutor' AND (deadline_at IS NULL OR deadline_at + ${GRACE} >= ?4))`;
    const args = [id, me.id, Number.isInteger(idx) ? idx : -1, Date.now()];
    const [served, picks] = await c.db.batch([
      c.db.prepare(`SELECT * FROM served WHERE id = (${mine})`).bind(...args),
      c.db.prepare(statsSql(mine)).bind(...args),
    ]);
    const q = served!.results[0] as Served | undefined;
    if (!q) throw fail(404, "not_found", "That question isn't open.");
    return json({ reveal: full(q), stats: readStats(picks!.results).get(q.id) ?? null });
  },
  /* Submit a test. Marking it and reading its results back are one trip, so the results page opens with them in hand. */
  "POST /api/study/finish": async (c) => {
    const me = await student(c, true);
    const b = await body(c.request);
    const id = str(b.id, 64);
    const now = Date.now();
    // The same marking as finish() above, written as two statements so nothing has to come back before the next goes.
    const end = "min(?3, coalesce(deadline_at, ?3))";
    const counts = "FROM answers a JOIN served s ON s.id = a.question_id WHERE a.attempt_id = attempts.id AND (attempts.mode != 'tutor' OR a.checked = 1)";
    const res = await c.db.batch([
      c.db.prepare("SELECT * FROM attempts WHERE id = ?1 AND user_id = ?2").bind(id, me.id),
      c.db.prepare(`UPDATE answers SET counted_at = (SELECT ${end} FROM attempts WHERE id = ?1) WHERE counted_at IS NULL
          AND attempt_id = (SELECT id FROM attempts WHERE id = ?1 AND user_id = ?2 AND finished_at IS NULL AND mode != 'tutor')`).bind(id, me.id, now),
      // A practice set with nothing checked isn't a result, so it is left for the clean-up below.
      c.db.prepare(`UPDATE attempts SET finished_at = ${end}, seconds = CAST(round((${end} - started_at) / 1000.0) AS INTEGER),
          score = coalesce((SELECT sum(CASE WHEN a.answer = s.answer THEN 1 ELSE 0 END) ${counts}), 0),
          total = CASE WHEN mode = 'tutor' THEN (SELECT count(*) ${counts}) ELSE total END
        WHERE id = ?1 AND user_id = ?2 AND finished_at IS NULL AND (mode != 'tutor' OR EXISTS (SELECT 1 ${counts}))`).bind(id, me.id, now),
      ...reviewStmts(c.db, id, me.id),
    ]);
    const before = res[0]!.results[0] as AttemptRow | undefined;
    if (!before) throw fail(404, "not_found", "We couldn't find that test.");
    const review = readReview(res.slice(3));
    // empty: a practice set closed before any answer was checked. There's nothing to review, so it isn't kept.
    if (!review) {
      await c.db.batch([
        c.db.prepare("DELETE FROM answers WHERE attempt_id = (SELECT id FROM attempts WHERE id = ?1 AND user_id = ?2 AND finished_at IS NULL)").bind(id, me.id),
        c.db.prepare("DELETE FROM attempts WHERE id = ?1 AND user_id = ?2 AND finished_at IS NULL").bind(id, me.id),
      ]);
      return json({ id, empty: true });
    }
    return json({ id, empty: false, review });
  },

  /* A submitted test with every question's key and explanation. */
  "GET /api/study/review": async (c) => {
    const me = await student(c, true);
    const id = str(new URL(c.request.url).searchParams.get("id"), 64);
    const res = await c.db.batch(reviewStmts(c.db, id, me.id));
    const a = res[0]!.results[0] as AttemptRow | undefined;
    if (!a) throw fail(404, "not_found", "We couldn't find that test.");
    if (!a.finished_at) throw fail(409, "open", "Finish this test to see the answers.", { attempt: a.id });
    return json(readReview(res));
  },

  "GET /api/study/history": async (c) => {
    const me = await student(c, false);
    const [tests] = await afterClosing(c.db, me.id, () => [
      c.db.prepare("SELECT * FROM attempts WHERE user_id = ? AND finished_at IS NOT NULL AND total > 0 ORDER BY finished_at DESC LIMIT 300").bind(me.id),
    ]);
    return json({ tests: (tests!.results as AttemptRow[]).map(result) });
  },

  /* Everything on the dashboard (lib/dashboard-data.ts), from the student's own answers. */
  "GET /api/study/dashboard": async (c) => {
    const me = await student(c, false);
    const now = Date.now();
    const days = 84;
    const since = Date.parse(`${pkDate(now - (days - 1) * DAY)}T00:00:00+05:00`);
    // ?bank= picks whose subjects and chapters the numbers are laid out in; without it, the one the student chose.
    const asked = bankById(new URL(c.request.url).searchParams.get("bank"))?.id;
    const own = (bank: string | null, withPrefs: boolean) => afterClosing(c.db, me.id, () => [
      c.db.prepare(`SELECT date((a.counted_at + ${PKT}) / 1000, 'unixepoch') AS d, count(*) AS n, sum(CASE WHEN a.answer = s.answer THEN 1 ELSE 0 END) AS c
        FROM answers a JOIN served s ON s.id = a.question_id WHERE a.user_id = ? AND a.counted_at >= ? AND a.answer IS NOT NULL GROUP BY d`).bind(me.id, since),
      c.db.prepare("SELECT * FROM attempts WHERE user_id = ? AND finished_at IS NOT NULL AND total > 0 ORDER BY finished_at DESC LIMIT 10").bind(me.id),
      c.db.prepare(`SELECT a.*, (SELECT count(*) FROM answers x WHERE x.attempt_id = a.id AND x.answer IS NOT NULL) AS done
        FROM attempts a WHERE a.user_id = ? AND a.finished_at IS NULL ORDER BY a.started_at DESC LIMIT 1`).bind(me.id),
      c.db.prepare("SELECT count(*) AS n FROM bookmarks WHERE user_id = ?").bind(me.id),
      c.db.prepare("SELECT 1 FROM attempts WHERE user_id = ? AND kind = 'mini-mock' LIMIT 1").bind(me.id),
      // Everything the student has ever answered, and how long a question takes them lately.
      c.db.prepare(`SELECT count(DISTINCT question_id) AS n, sum(CASE WHEN counted_at >= ?2 AND seconds IS NOT NULL THEN seconds ELSE 0 END) AS secs,
          sum(CASE WHEN counted_at >= ?2 AND seconds IS NOT NULL THEN 1 ELSE 0 END) AS timed
        FROM answers WHERE user_id = ?1 AND counted_at IS NOT NULL AND answer IS NOT NULL`).bind(me.id, now - 30 * DAY),
      // Mistakes are counted across every bank, as the My mistakes page lists them.
      c.db.prepare(`SELECT count(*) AS n FROM (${LATEST}) l WHERE l.answer != l.key`).bind(me.id),
      ...(bank ? [c.db.prepare(latestIn(bank)).bind(me.id)] : []),
      ...(withPrefs ? [prefsStmt(c.db, me.id)] : []),
    ]);
    // With a bank in the address everything is one trip. Without one, the student's choice has to be read first;
    // their saved choice rides along with the first trip so the second only fetches their answers in that bank.
    let hasPrefs = true;
    const first = (bank: string | null) => own(bank, true).catch(() => { hasPrefs = false; return own(bank, false); });
    // Their answers are read for the bank they most likely chose (the one this browser saw last, else MDCAT), so the
    // second trip is only needed when that guess is wrong.
    const guess = asked ?? bankById(new URL(c.request.url).searchParams.get("hint"))?.id ?? "mdcat";
    const [counts, res] = await Promise.all([bankCounts(c.db), first(guess)]);
    const [daily, recent, open, marks, miniUsed, ever, wrong] = res;
    const prefs = readPrefs(hasPrefs ? (res[8]!.results[0] as Parameters<typeof readPrefs>[0]) : null);
    if (!hasPrefs) prefs.welcomed = true;
    const bankId = asked ?? prefs.bank;
    const bank = bankById(bankId)!;
    const latest = bankId === guess ? res[7]! : await c.db.prepare(latestIn(bankId)).bind(me.id).all();

    // Which mock the dashboard should offer: a full one once the bank can fill it, else the mini mock if it's open to them.
    const mdcat = subjectTotals(counts);
    const fullReady = me.paid && paper.every((p) => (mdcat.get(p.subject)?.total ?? 0) >= p.count);
    const miniPool = [...mdcat.values()].reduce((n, x) => n + (me.paid ? x.total : x.free), 0);
    const nextMock = fullReady ? "full" : miniPool >= 10 && (me.paid || !miniUsed!.results.length) ? "mini" : null;
    const byDay = new Map((daily!.results as { d: string; n: number; c: number }[]).map((r) => [r.d, r]));
    const series = Array.from({ length: days }, (_, i) => {
      const d = pkDate(now - (days - 1 - i) * DAY);
      return { date: d, answered: byDay.get(d)?.n ?? 0, correct: byDay.get(d)?.c ?? 0 };
    });
    // The streak can end yesterday: today isn't over yet.
    let streak = 0;
    for (let i = series.length - 1; i >= 0; i--) {
      if (series[i]!.answered > 0) streak++;
      else if (i < series.length - 1) break;
    }
    type Latest = { question_id: string; answer: number; key: number; subject: string; chapter: string; topic: string };
    const answered = latest.results as Latest[];
    const sub = (s: string) => answered.filter((r) => r.subject === s);
    const avail = chaptersOf(counts, bankId).map((x) => ({ subject: x.subject, chapter: x.chapter, n: me.paid ? x.total : x.free })).filter((x) => x.n > 0);
    const topics = new Map<string, { subject: string; chapter: string; topic: string; answered: number; correct: number }>();
    for (const r of answered) {
      if (!r.topic) continue;
      const k = `${r.subject}|${r.topic}`;
      const t = topics.get(k) ?? { subject: r.subject, chapter: r.chapter, topic: r.topic, answered: 0, correct: 0 };
      t.answered++; if (r.answer === r.key) t.correct++;
      topics.set(k, t);
    }
    const o = open!.results[0] as (AttemptRow & { done: number }) | undefined;
    const e = ever!.results[0] as { n: number; secs: number | null; timed: number | null } | undefined;
    return json({
      bank: bankId,
      welcomed: prefs.welcomed,
      examYear: prefs.examYear,
      answeredEver: e?.n ?? 0,
      secondsPerQuestion: e?.timed && e.timed >= 20 ? Math.round((e.secs ?? 0) / e.timed) : null,
      streakDays: streak,
      nextMock,
      dailyGoal: prefs.dailyGoal,
      daily: series,
      bookmarks: (marks!.results[0] as { n: number }).n,
      mistakesToRetry: (wrong!.results[0] as { n: number } | undefined)?.n ?? 0,
      resume: o ? { title: o.title, done: o.done, total: o.total, href: `/test?id=${o.id}` } : undefined,
      subjects: bank.subjects.map(({ name: s, chapters: order }) => {
        const names = [...new Set([...avail.filter((x) => x.subject === s).map((x) => x.chapter), ...sub(s).map((x) => x.chapter)])]
          .sort((x, y) => (order.indexOf(x) + 1 || 999) - (order.indexOf(y) + 1 || 999));
        return {
          subject: s,
          chapters: names.map((ch) => {
            const mine = sub(s).filter((x) => x.chapter === ch);
            return { chapter: ch, answered: mine.length, correct: mine.filter((x) => x.answer === x.key).length, available: avail.find((x) => x.subject === s && x.chapter === ch)?.n ?? 0 };
          }),
        };
      }),
      weakTopics: [...topics.values()].filter((t) => t.answered >= 5 && t.correct / t.answered < 0.7),
      recent: (recent!.results as AttemptRow[]).map(result),
    });
  },

  /* My mistakes: questions whose latest answer was wrong, with how many times. Get it right once and it drops off. */
  "GET /api/study/mistakes": async (c) => {
    const me = await student(c, true);
    const wrong = `SELECT l.question_id, l.answer, l.at FROM (${LATEST}) l WHERE l.answer != l.key AND l.question_id NOT IN (${IN_OPEN_TEST.replace("?", "?1")}) ORDER BY l.at DESC LIMIT 300`;
    // The list and its questions in one trip.
    const [list, served] = await c.db.batch([
      c.db.prepare(`SELECT m.question_id, m.answer, m.at, (SELECT count(*) FROM answers w JOIN served s2 ON s2.id = w.question_id
          WHERE w.user_id = ?1 AND w.question_id = m.question_id AND w.counted_at IS NOT NULL AND w.answer IS NOT NULL AND w.answer != s2.answer) AS tries
        FROM (${wrong}) m ORDER BY m.at DESC`).bind(me.id),
      c.db.prepare(`SELECT * FROM served WHERE id IN (SELECT question_id FROM (${wrong}))`).bind(me.id),
    ]);
    const results = list!.results as { question_id: string; answer: number; at: number; tries: number }[];
    const qs = byId(served!.results);
    return json({
      mistakes: results.filter((r) => qs.has(r.question_id) && (me.paid || qs.get(r.question_id)!.free))
        .map((r) => ({ q: full(qs.get(r.question_id)!), chosen: r.answer, date: new Date(r.at).toISOString(), tries: r.tries })),
    });
  },

  "GET /api/study/bookmarks": async (c) => {
    const me = await student(c, true);
    const mine = `SELECT question_id, created_at FROM bookmarks WHERE user_id = ?1 AND question_id NOT IN (${IN_OPEN_TEST.replace("?", "?1")}) ORDER BY created_at DESC LIMIT 500`;
    const [list, served] = await c.db.batch([
      c.db.prepare(mine).bind(me.id),
      c.db.prepare(`SELECT * FROM served WHERE id IN (SELECT question_id FROM (${mine}))`).bind(me.id),
    ]);
    const qs = byId(served!.results);
    return json({ bookmarks: (list!.results as { question_id: string }[]).map((r) => qs.get(r.question_id)).filter((q): q is Served => !!q && (me.paid || !!q.free)).map(full) });
  },

  "POST /api/study/bookmark": async (c) => {
    const me = await student(c, false);
    const b = await body(c.request);
    const id = str(b.questionId, 20);
    if (b.on) {
      // Only a question this student was given, so bookmarking can't be used to probe the bank.
      const [q] = await c.db.batch([
        c.db.prepare("SELECT s.id FROM served s WHERE s.id = ?1 AND EXISTS (SELECT 1 FROM answers a WHERE a.user_id = ?2 AND a.question_id = ?1)").bind(id, me.id),
        c.db.prepare(`INSERT OR IGNORE INTO bookmarks (user_id, question_id, created_at) SELECT ?2, s.id, ?3 FROM served s
          WHERE s.id = ?1 AND EXISTS (SELECT 1 FROM answers a WHERE a.user_id = ?2 AND a.question_id = ?1)`).bind(id, me.id, Date.now()),
      ]);
      if (!q!.results.length) throw fail(404, "not_found", "That question isn't available.");
    } else {
      await c.db.prepare("DELETE FROM bookmarks WHERE user_id = ? AND question_id = ?").bind(me.id, id).run();
    }
    return json({ ok: true, on: !!b.on });
  },

  /* A student's report on a question. It goes to the reviewers' queue (/admin/reports). */
  "POST /api/study/report": async (c) => {
    const me = await student(c, false);
    await rateLimit(c.db, `report:${me.id}`, 20, HOUR);
    const b = await body(c.request);
    const id = str(b.questionId, 20);
    const reason = str(b.reason, 120);
    if (!reason) throw fail(400, "bad_reason", "Pick what's wrong first.");
    // Only someone who was actually given the question can report it, so reports can't be used to take questions down.
    const q = await c.db.prepare("SELECT s.id FROM served s WHERE s.id = ?1 AND EXISTS (SELECT 1 FROM answers a WHERE a.user_id = ?2 AND a.question_id = ?1)").bind(id, me.id).first();
    if (!q) throw fail(404, "not_found", "That question isn't available.");
    const dup = await c.db.prepare("SELECT 1 FROM reports WHERE question_id = ? AND user_id = ? AND status = 'open'").bind(id, me.id).first();
    if (!dup) {
      await c.db.prepare("INSERT INTO reports (question_id, user_id, reason, details, created_at) VALUES (?, ?, ?, ?, ?)").bind(id, me.id, reason, str(b.details, 2000), Date.now()).run();
    }
    return json({ ok: true });
  },

  /* How big the bank is, for the landing page. Open to everyone and the same for everyone, so browsers and
     Cloudflare may keep it for an hour. */
  "GET /api/stats": async (c) => {
    const counts = await bankCounts(c.db);
    return new Response(JSON.stringify({ questions: counts.questions, papers: counts.papers.map((p) => p.year) }), {
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=3600", "x-content-type-options": "nosniff" },
    });
  },

  /* The launch waitlist from the landing page. Signed out, so it's rate limited by address. */
  "POST /api/waitlist": async (c) => {
    await rateLimit(c.db, `waitlist:${c.ip}`, 10, HOUR);
    const b = await body(c.request);
    const raw = str(b.contact, 254);
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw) ? raw.toLowerCase() : null;
    const phone = email ? null : normalisePhone(raw);
    if (!email && !phone) throw fail(400, "bad_contact", "Enter an email address or a mobile number like 0300 1234567.");
    await c.db.prepare("INSERT OR IGNORE INTO waitlist (contact, kind, created_at) VALUES (?, ?, ?)").bind(email ?? phone, email ? "email" : "phone", Date.now()).run();
    return json({ ok: true });
  },
};

