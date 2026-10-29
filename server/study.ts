import { normalisePhone } from "../lib/phone";
import { paper } from "../lib/site";
import { uuid } from "./crypto";
import { requireActiveSession } from "./devices";
import { body, fail, json, str } from "./http";
import { rateLimit } from "./ratelimit";
import { requireSession } from "./session";
import { effectivePlan, userById } from "./users";

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
/* Open reports that hide a question from new tests until a reviewer looks. */
const REPORT_HIDE = 3;
export const MOCKS = 12;
const MINI_SPLIT = [13, 8, 6, 2, 1]; // 30 questions in the paper's proportions
const subjects = paper.map((p) => p.subject);

type Kind = "practice" | "timed" | "mock" | "mini-mock" | "past-paper";
type Mode = "tutor" | "timed" | "mock";
const modeOf: Record<Kind, Mode> = { practice: "tutor", timed: "timed", mock: "mock", "mini-mock": "mock", "past-paper": "mock" };

type Served = {
  id: string; subject: string; chapter: string; topic: string; difficulty: string; source: string; stem: string;
  options: string; answer: number; why: string; wrong: string; free: number; paper: number | null; open_reports: number;
};
type AttemptRow = {
  id: string; user_id: string; kind: Kind; mode: Mode; title: string; question_ids: string; mock_no: number | null;
  paper: number | null; started_at: number; deadline_at: number | null; finished_at: number | null; seconds: number | null;
  score: number | null; total: number;
};
type AnswerRow = { idx: number; question_id: string; answer: number | null; flagged: number; checked: number };

const parse = <T>(s: string, fallback: T): T => { try { return JSON.parse(s) as T; } catch { return fallback; } };

/* What a student sees while answering, and what they see once the answer is out. */
const ask = (r: Served) => ({ id: r.id, subject: r.subject, chapter: r.chapter, topic: r.topic, stem: r.stem, options: parse<string[]>(r.options, []) });
const full = (r: Served) => ({ ...ask(r), difficulty: r.difficulty, source: r.source, answer: r.answer, why: r.why, wrong: parse<Record<number, string>>(r.wrong, {}) });

/* Who's asking, and which questions their plan opens: everything for a pass, the free set otherwise. */
async function student(c: Ctx, active: boolean) {
  const s = active ? await requireActiveSession(c.db, c.request) : await requireSession(c.db, c.request);
  const u = await userById(c.db, s.user_id);
  if (!u) throw fail(401, "signed_out", "Please sign in.");
  const paid = effectivePlan(u) !== "free";
  return { id: u.id, paid, pool: paid ? "" : " AND free = 1" };
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

async function idsBySubject(db: D1Database, pool: string) {
  const { results } = await db.prepare(`SELECT id, subject FROM served WHERE open_reports < ${REPORT_HIDE}${pool} ORDER BY id`).all<{ id: string; subject: string }>();
  return new Map(subjects.map((s) => [s, results.filter((r) => r.subject === s).map((r) => r.id)]));
}

/* ---------- Finishing a test ---------- */

/* Marks a test done: every unanswered timed question counts as skipped, and the score is read against the keys. */
async function finish(db: D1Database, a: AttemptRow, at: number) {
  const end = a.deadline_at ? Math.min(at, a.deadline_at) : at;
  if (a.mode !== "tutor") await db.prepare("UPDATE answers SET counted_at = ? WHERE attempt_id = ? AND counted_at IS NULL").bind(end, a.id).run();
  const r = await db
    .prepare(`SELECT count(*) AS asked, sum(CASE WHEN a.answer = s.answer THEN 1 ELSE 0 END) AS right
      FROM answers a JOIN served s ON s.id = a.question_id WHERE a.attempt_id = ? ${a.mode === "tutor" ? "AND a.checked = 1" : ""}`)
    .bind(a.id)
    .first<{ asked: number; right: number | null }>();
  const total = a.mode === "tutor" ? r?.asked ?? 0 : a.total;
  await db.prepare("UPDATE attempts SET finished_at = ?, seconds = ?, score = ?, total = ? WHERE id = ? AND finished_at IS NULL")
    .bind(end, Math.round((end - a.started_at) / 1000), r?.right ?? 0, total, a.id).run();
}

/* Timed tests left open past their clock are submitted as they stood, the next time the student loads anything. */
async function finishExpired(db: D1Database, userId: string) {
  const now = Date.now();
  const { results } = await db.prepare("SELECT * FROM attempts WHERE user_id = ? AND finished_at IS NULL AND deadline_at < ?").bind(userId, now - GRACE).all<AttemptRow>();
  for (const a of results) await finish(db, a, a.deadline_at!);
}

async function ownAttempt(db: D1Database, userId: string, id: unknown): Promise<AttemptRow> {
  const a = await db.prepare("SELECT * FROM attempts WHERE id = ? AND user_id = ?").bind(str(id, 64), userId).first<AttemptRow>();
  if (!a) throw fail(404, "not_found", "We couldn't find that test.");
  return a;
}

/* An open test that can still take answers. Past its clock, it's submitted and the student is told. */
async function openAttempt(db: D1Database, userId: string, id: unknown): Promise<AttemptRow> {
  const a = await ownAttempt(db, userId, id);
  if (a.finished_at) throw fail(409, "finished", "This test is already submitted.", { attempt: a.id });
  if (a.deadline_at && Date.now() > a.deadline_at + GRACE) {
    await finish(db, a, a.deadline_at);
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

const pkDate = (ms: number) => new Date(ms + PKT).toISOString().slice(0, 10);

/* ---------- Routes ---------- */

export const studyRoutes: Record<string, (c: Ctx) => Promise<Response>> = {
  /* How many questions each chapter has for this student, which tests are open to them, and their past papers. */
  "GET /api/study/catalog": async (c) => {
    const me = await student(c, false);
    const [chapters, papers, mini] = await c.db.batch([
      c.db.prepare(`SELECT subject, chapter, count(*) AS total, sum(free) AS free FROM served WHERE open_reports < ${REPORT_HIDE} GROUP BY subject, chapter`),
      c.db.prepare(`SELECT paper AS year, count(*) AS n FROM served WHERE paper IS NOT NULL AND open_reports < ${REPORT_HIDE} GROUP BY paper ORDER BY paper DESC`),
      c.db.prepare("SELECT id, finished_at FROM attempts WHERE user_id = ? AND kind = 'mini-mock' ORDER BY started_at DESC LIMIT 1").bind(me.id),
    ]);
    const lastMini = mini!.results[0] as { id: string; finished_at: number | null } | undefined;
    const rows = (chapters!.results as { subject: string; chapter: string; total: number; free: number }[])
      .map((r) => ({ subject: r.subject, chapter: r.chapter, total: r.total, open: me.paid ? r.total : r.free ?? 0 }));
    const bySubject = (s: string, k: "total" | "open") => rows.filter((r) => r.subject === s).reduce((n, r) => n + r[k], 0);
    return json({
      paid: me.paid,
      chapters: rows,
      papers: (papers!.results as { year: number; n: number }[]).map((p) => ({ year: p.year, count: p.n })),
      mocks: MOCKS,
      mockReady: paper.every((p) => bySubject(p.subject, "total") >= p.count),
      miniReady: subjects.reduce((n, s) => n + bySubject(s, "open"), 0) >= 10,
      miniUsed: !!lastMini,
      // A started mini mock that isn't finished yet, to resume.
      miniOpen: lastMini && !lastMini.finished_at ? lastMini.id : null,
    });
  },

  /* Start a test. The server picks the questions, so the browser never holds more than the test it's sitting. */
  "POST /api/study/start": async (c) => {
    const me = await student(c, true);
    await rateLimit(c.db, `start:${me.id}`, 60, HOUR);
    const b = await body(c.request);
    const kind = (["practice", "timed", "mock", "mini-mock", "past-paper"] as const).find((k) => k === b.kind) ?? "practice";
    const mode = modeOf[kind];
    let ids: string[] = [];
    let title = str(b.title, 120);
    let mockNo: number | null = null;
    let year: number | null = null;

    if ((kind === "mock" || kind === "past-paper") && !me.paid) {
      throw fail(402, "needs_pass", kind === "mock" ? "Full mocks come with a pass. Your free mini mock is on the Mocks page." : "Past papers come with a pass.");
    }

    if (kind === "mock") {
      mockNo = Math.min(MOCKS, Math.max(1, Number(b.mock) || 1));
      const by = await idsBySubject(c.db, "");
      if (paper.some((p) => (by.get(p.subject)?.length ?? 0) < p.count)) throw fail(409, "not_ready", "Full mocks open once the bank has enough questions in every subject.");
      ids = paper.flatMap((p, k) => shuffle(by.get(p.subject)!, seeded(mockNo! * 101 + k)).slice(0, p.count));
      title = `Full mock ${mockNo}`;
    } else if (kind === "mini-mock") {
      if (!me.paid) {
        const used = await c.db.prepare("SELECT 1 FROM attempts WHERE user_id = ? AND kind = 'mini-mock'").bind(me.id).first();
        if (used) throw fail(402, "needs_pass", "You've used your free mini mock. A pass opens every full mock.");
      }
      const by = await idsBySubject(c.db, me.pool);
      ids = paper.flatMap((p, k) => shuffle(by.get(p.subject)!, seeded(7 + k)).slice(0, MINI_SPLIT[k]));
      if (ids.length < 10) throw fail(409, "not_ready", "The mini mock opens once the free set has a few more questions.");
      title = "Mini mock";
    } else if (kind === "past-paper") {
      year = Number(b.paper) || 0;
      const { results } = await c.db.prepare(`SELECT id, subject FROM served WHERE paper = ? AND open_reports < ${REPORT_HIDE} ORDER BY id`).bind(year).all<{ id: string; subject: string }>();
      ids = [...results].sort((x, y) => subjects.indexOf(x.subject) - subjects.indexOf(y.subject)).map((r) => r.id);
      title = `PMDC MDCAT ${year}`;
    } else {
      const count = Math.min(100, Math.max(1, Number(b.count) || 25));
      const asked = Array.isArray(b.ids) ? b.ids.filter((x): x is string => typeof x === "string").slice(0, 200) : [];
      const where: string[] = [`open_reports < ${REPORT_HIDE}${me.pool}`];
      const args: unknown[] = [];
      if (asked.length) {
        where.push("id IN (SELECT value FROM json_each(?))");
        args.push(JSON.stringify(asked));
      } else {
        const subject = str(b.subject, 40);
        const chapters = Array.isArray(b.chapters) ? b.chapters.filter((x): x is string => typeof x === "string").slice(0, 40) : [];
        if (subject) { where.push("subject = ?"); args.push(subject); }
        if (chapters.length) { where.push("chapter IN (SELECT value FROM json_each(?))"); args.push(JSON.stringify(chapters)); }
        const topic = str(b.topic, 120);
        if (topic) { where.push("topic = ?"); args.push(topic); }
        if (b.from === "unseen") {
          where.push("id NOT IN (SELECT question_id FROM answers WHERE user_id = ? AND counted_at IS NOT NULL)");
          args.push(me.id);
        } else if (b.from === "wrong") {
          where.push(`id IN (SELECT question_id FROM (${LATEST.replaceAll("?1", "?")}) WHERE answer != key)`);
          args.push(me.id);
        }
        title ||= subject ? `${subject}${topic ? ` · ${topic}` : chapters.length === 1 ? ` · ${chapters[0]}` : ""}` : "Mixed practice";
      }
      const { results } = await c.db.prepare(`SELECT id, subject FROM served WHERE ${where.join(" AND ")} ORDER BY random() LIMIT ${asked.length ? 200 : count}`).bind(...args).all<{ id: string; subject: string }>();
      ids = asked.length ? asked.filter((id) => results.some((r) => r.id === id)) : results.map((r) => r.id);
      title ||= "Practice";
    }
    if (!ids.length) throw fail(409, "empty", me.paid ? "No questions match that yet. Try more chapters, or All questions." : "No free questions match that yet. Try more chapters, or get a pass for the whole bank.");

    const id = uuid();
    const now = Date.now();
    // Timed tests get a minute a question; the mock is the real paper's 3 hours for 180.
    const deadline = mode === "tutor" ? null : now + ids.length * 60 * 1000;
    await c.db.batch([
      c.db.prepare(`INSERT INTO attempts (id, user_id, kind, mode, title, question_ids, mock_no, paper, started_at, deadline_at, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, me.id, kind, mode, title, JSON.stringify(ids), mockNo, year, now, deadline, ids.length),
      c.db.prepare("INSERT INTO answers (attempt_id, idx, user_id, question_id) SELECT ?1, key, ?2, value FROM json_each(?3)").bind(id, me.id, JSON.stringify(ids)),
    ]);
    const asked = Number(b.count) || 0;
    return json({ id, count: ids.length, short: kind !== "mock" && kind !== "past-paper" && kind !== "mini-mock" && !b.ids && asked > ids.length });
  },

  /* An open test to sit or resume: questions without keys, answers so far, and the server's clock. */
  "GET /api/study/attempt": async (c) => {
    const me = await student(c, true);
    const a = await ownAttempt(c.db, me.id, new URL(c.request.url).searchParams.get("id"));
    if (!a.finished_at && a.deadline_at && Date.now() > a.deadline_at + GRACE) await finish(c.db, a, a.deadline_at);
    const fresh = await ownAttempt(c.db, me.id, a.id);
    if (fresh.finished_at) return json({ finished: true, id: a.id });
    const [rowsRes, marks] = await c.db.batch([
      c.db.prepare("SELECT idx, question_id, answer, flagged, checked FROM answers WHERE attempt_id = ? ORDER BY idx").bind(a.id),
      c.db.prepare("SELECT question_id FROM bookmarks WHERE user_id = ?").bind(me.id),
    ]);
    const rows = rowsRes!.results as AnswerRow[];
    const qs = await servedByIds(c.db, rows.map((r) => r.question_id));
    const saved = new Set((marks!.results as { question_id: string }[]).map((m) => m.question_id));
    return json({
      id: a.id, kind: a.kind, mode: a.mode, title: a.title, startedAt: a.started_at, deadlineAt: a.deadline_at, now: Date.now(),
      items: rows.filter((r) => qs.has(r.question_id)).map((r) => {
        const q = qs.get(r.question_id)!;
        return { idx: r.idx, q: ask(q), answer: r.answer, flagged: !!r.flagged, checked: !!r.checked, bookmarked: saved.has(q.id), reveal: a.mode === "tutor" && r.checked ? full(q) : null };
      }),
    });
  },

  "POST /api/study/answer": async (c) => {
    const me = await student(c, true);
    const b = await body(c.request);
    const a = await openAttempt(c.db, me.id, b.id);
    const idx = Number(b.idx);
    const answer = b.answer === null ? null : Number.isInteger(b.answer) && (b.answer as number) >= 0 && (b.answer as number) <= 3 ? (b.answer as number) : undefined;
    if (!Number.isInteger(idx) || answer === undefined) throw fail(400, "bad_answer", "That answer didn't save. Please try again.");
    const res = await c.db.prepare(`UPDATE answers SET answer = ?, flagged = ? WHERE attempt_id = ? AND idx = ? AND checked = 0`)
      .bind(answer, b.flagged ? 1 : 0, a.id, idx).run();
    if (!res.meta.changes) throw fail(409, "locked", "This answer is already checked.");
    return json({ ok: true });
  },

  /* Practice mode: lock in an answer and get the key and explanation. */
  "POST /api/study/check": async (c) => {
    const me = await student(c, true);
    const b = await body(c.request);
    const a = await openAttempt(c.db, me.id, b.id);
    if (a.mode !== "tutor") throw fail(400, "timed", "Answers in a timed test open when you submit it.");
    const idx = Number(b.idx);
    const answer = Number(b.answer);
    if (!Number.isInteger(idx) || !Number.isInteger(answer) || answer < 0 || answer > 3) throw fail(400, "bad_answer", "Pick an answer first.");
    const row = await c.db.prepare("SELECT question_id, checked, answer FROM answers WHERE attempt_id = ? AND idx = ?").bind(a.id, idx).first<{ question_id: string; checked: number; answer: number | null }>();
    if (!row) throw fail(404, "not_found", "That question isn't in this test.");
    if (!row.checked) {
      await c.db.prepare("UPDATE answers SET answer = ?, checked = 1, counted_at = ? WHERE attempt_id = ? AND idx = ? AND checked = 0").bind(answer, Date.now(), a.id, idx).run();
    }
    const q = (await servedByIds(c.db, [row.question_id])).get(row.question_id);
    if (!q) throw fail(404, "not_found", "This question was taken down for a fix.");
    return json({ answer: row.checked ? row.answer : answer, reveal: full(q) });
  },

  "POST /api/study/finish": async (c) => {
    const me = await student(c, true);
    const b = await body(c.request);
    const a = await ownAttempt(c.db, me.id, b.id);
    if (!a.finished_at) await finish(c.db, a, Date.now());
    return json({ id: a.id });
  },

  /* A submitted test with every question's key and explanation. */
  "GET /api/study/review": async (c) => {
    const me = await student(c, true);
    const a = await ownAttempt(c.db, me.id, new URL(c.request.url).searchParams.get("id"));
    if (!a.finished_at) throw fail(409, "open", "Finish this test to see the answers.", { attempt: a.id });
    const [rowsRes, marks] = await c.db.batch([
      c.db.prepare(`SELECT idx, question_id, answer, flagged, checked FROM answers WHERE attempt_id = ? ${a.mode === "tutor" ? "AND checked = 1" : ""} ORDER BY idx`).bind(a.id),
      c.db.prepare("SELECT question_id FROM bookmarks WHERE user_id = ?").bind(me.id),
    ]);
    const rows = rowsRes!.results as AnswerRow[];
    const qs = await servedByIds(c.db, rows.map((r) => r.question_id));
    const saved = new Set((marks!.results as { question_id: string }[]).map((m) => m.question_id));
    return json({
      attempt: { ...result(a), mode: a.mode, seconds: a.seconds ?? 0 },
      items: rows.filter((r) => qs.has(r.question_id)).map((r) => ({ q: full(qs.get(r.question_id)!), chosen: r.answer, flagged: !!r.flagged, bookmarked: saved.has(r.question_id) })),
    });
  },

  "GET /api/study/history": async (c) => {
    const me = await student(c, false);
    await finishExpired(c.db, me.id);
    const { results } = await c.db.prepare("SELECT * FROM attempts WHERE user_id = ? AND finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 300").bind(me.id).all<AttemptRow>();
    return json({ tests: results.map(result) });
  },

  /* Everything on the dashboard (lib/dashboard-data.ts), from the student's own answers. */
  "GET /api/study/dashboard": async (c) => {
    const me = await student(c, false);
    await finishExpired(c.db, me.id);
    const now = Date.now();
    const days = 84;
    const since = Date.parse(`${pkDate(now - (days - 1) * DAY)}T00:00:00+05:00`);
    const [daily, latest, chapters, recent, open, marks] = await c.db.batch([
      c.db.prepare(`SELECT date((a.counted_at + ${PKT}) / 1000, 'unixepoch') AS d, count(*) AS n, sum(CASE WHEN a.answer = s.answer THEN 1 ELSE 0 END) AS c
        FROM answers a JOIN served s ON s.id = a.question_id WHERE a.user_id = ? AND a.counted_at >= ? AND a.answer IS NOT NULL GROUP BY d`).bind(me.id, since),
      c.db.prepare(LATEST).bind(me.id),
      c.db.prepare(`SELECT subject, chapter, count(*) AS n FROM served WHERE open_reports < ${REPORT_HIDE}${me.pool} GROUP BY subject, chapter`),
      c.db.prepare("SELECT * FROM attempts WHERE user_id = ? AND finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 10").bind(me.id),
      c.db.prepare(`SELECT a.*, (SELECT count(*) FROM answers x WHERE x.attempt_id = a.id AND x.answer IS NOT NULL) AS done
        FROM attempts a WHERE a.user_id = ? AND a.finished_at IS NULL ORDER BY a.started_at DESC LIMIT 1`).bind(me.id),
      c.db.prepare("SELECT count(*) AS n FROM bookmarks WHERE user_id = ?").bind(me.id),
    ]);
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
    const answered = latest!.results as Latest[];
    const sub = (s: string) => answered.filter((r) => r.subject === s);
    const avail = chapters!.results as { subject: string; chapter: string; n: number }[];
    const topics = new Map<string, { subject: string; chapter: string; topic: string; answered: number; correct: number }>();
    for (const r of answered) {
      if (!r.topic) continue;
      const k = `${r.subject}|${r.topic}`;
      const t = topics.get(k) ?? { subject: r.subject, chapter: r.chapter, topic: r.topic, answered: 0, correct: 0 };
      t.answered++; if (r.answer === r.key) t.correct++;
      topics.set(k, t);
    }
    const o = open!.results[0] as (AttemptRow & { done: number }) | undefined;
    return json({
      streakDays: streak,
      dailyGoal: 40,
      daily: series,
      bookmarks: (marks!.results[0] as { n: number }).n,
      mistakesToRetry: answered.filter((r) => r.answer !== r.key).length,
      resume: o ? { title: o.title, done: o.done, total: o.total, href: `/test?id=${o.id}` } : undefined,
      subjects: subjects.map((s) => {
        const names = [...new Set([...avail.filter((x) => x.subject === s).map((x) => x.chapter), ...sub(s).map((x) => x.chapter)])];
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
    const { results } = await c.db
      .prepare(`SELECT l.question_id, l.answer, l.at, (SELECT count(*) FROM answers w JOIN served s2 ON s2.id = w.question_id
          WHERE w.user_id = ?1 AND w.question_id = l.question_id AND w.counted_at IS NOT NULL AND w.answer IS NOT NULL AND w.answer != s2.answer) AS tries
        FROM (${LATEST}) l WHERE l.answer != l.key ORDER BY l.at DESC LIMIT 300`)
      .bind(me.id)
      .all<{ question_id: string; answer: number; at: number; tries: number }>();
    const qs = await servedByIds(c.db, results.map((r) => r.question_id));
    return json({
      mistakes: results.filter((r) => qs.has(r.question_id) && (me.paid || qs.get(r.question_id)!.free))
        .map((r) => ({ q: full(qs.get(r.question_id)!), chosen: r.answer, date: new Date(r.at).toISOString(), tries: r.tries })),
    });
  },

  "GET /api/study/bookmarks": async (c) => {
    const me = await student(c, true);
    const { results } = await c.db.prepare("SELECT question_id FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC LIMIT 500").bind(me.id).all<{ question_id: string }>();
    const qs = await servedByIds(c.db, results.map((r) => r.question_id));
    return json({ bookmarks: results.map((r) => qs.get(r.question_id)).filter((q): q is Served => !!q && (me.paid || !!q.free)).map(full) });
  },

  "POST /api/study/bookmark": async (c) => {
    const me = await student(c, false);
    const b = await body(c.request);
    const id = str(b.questionId, 20);
    if (b.on) {
      const q = await c.db.prepare("SELECT id FROM served WHERE id = ?").bind(id).first();
      if (!q) throw fail(404, "not_found", "That question isn't available.");
      await c.db.prepare("INSERT OR IGNORE INTO bookmarks (user_id, question_id, created_at) VALUES (?, ?, ?)").bind(me.id, id, Date.now()).run();
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
    const q = await c.db.prepare("SELECT id FROM served WHERE id = ?").bind(id).first();
    if (!q) throw fail(404, "not_found", "That question isn't available.");
    const dup = await c.db.prepare("SELECT 1 FROM reports WHERE question_id = ? AND user_id = ? AND status = 'open'").bind(id, me.id).first();
    if (!dup) {
      await c.db.prepare("INSERT INTO reports (question_id, user_id, reason, details, created_at) VALUES (?, ?, ?, ?, ?)").bind(id, me.id, reason, str(b.details, 2000), Date.now()).run();
    }
    return json({ ok: true });
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

