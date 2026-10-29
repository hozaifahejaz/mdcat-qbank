import { DUPLICATE_LIMIT, type QuestionFields, type Role, type StageId, checklist, missingFields, roles, similarity, stageIds, stageLabel, subjectCodes } from "../lib/qc";
import { fail, json, body, str } from "./http";
import { requireSession } from "./session";
import { visitSummary } from "./visits";

/* The admin panel's API (/api/admin/*). Every route checks the caller's role here, on the server; the panel hiding
   buttons is only for convenience. Writers add and edit their own drafts, reviewers run the blind solve and the
   checklist, admins do everything else. Each change is written to admin_log. */

type Ctx = { db: D1Database; request: Request };
type Staff = { id: string; name: string; role: Role };

const DAY = 24 * 60 * 60 * 1000;
const PLANS = ["free", "season", "bundle", "monthly"] as const;

export async function requireRole(c: Ctx, allowed: Role[]): Promise<Staff> {
  const s = await requireSession(c.db, c.request);
  const u = await c.db.prepare("SELECT id, name, role FROM users WHERE id = ?").bind(s.user_id).first<Staff>();
  if (!u || u.role === "student") throw fail(403, "forbidden", "This is for Examwise staff only.");
  if (!allowed.includes(u.role)) throw fail(403, "forbidden", "Only admins can do this.");
  return u;
}
const staff = (c: Ctx) => requireRole(c, ["writer", "reviewer", "admin"]);
const reviewer = (c: Ctx) => requireRole(c, ["reviewer", "admin"]);
const admin = (c: Ctx) => requireRole(c, ["admin"]);

const log = (db: D1Database, actor: Staff, action: string, target: string, detail = "") =>
  db.prepare("INSERT INTO admin_log (actor_id, action, target, detail, created_at) VALUES (?, ?, ?, ?, ?)").bind(actor.id, action, target, detail, Date.now());

/* ---------- Questions ---------- */

type QRow = {
  id: string; subject: string; chapter: string; topic: string; difficulty: QuestionFields["difficulty"]; source: string;
  stem: string; options: string; answer: number; why: string; wrong: string; stage: StageId; checks: string;
  duplicate: number | null; duplicate_of: string | null; blind_by: string | null; blind_answer: number | null;
  reviewed_by: string | null; signed_off_by: string | null; sent_back: string | null; writer_id: string;
  created_at: number; updated_at: number; free: number; paper: number | null; live_copy: string | null; live_stage: StageId | null;
  writer_name: string; blind_name: string | null; reviewer_name: string | null; signoff_name: string | null;
};

const Q_SELECT = `SELECT q.*, w.name AS writer_name, b.name AS blind_name, r.name AS reviewer_name, s.name AS signoff_name
  FROM questions q JOIN users w ON w.id = q.writer_id
  LEFT JOIN users b ON b.id = q.blind_by LEFT JOIN users r ON r.id = q.reviewed_by LEFT JOIN users s ON s.id = q.signed_off_by`;

const parse = <T>(s: string, fallback: T): T => { try { return JSON.parse(s) as T; } catch { return fallback; } };

/* A question as the panel sees it. While it waits for its blind solve, only its writer sees the key and explanations,
   so whoever solves it really is solving blind. */
function present(r: QRow, viewer: Staff) {
  const hidden = r.stage === "blind" && r.blind_answer === null && r.writer_id !== viewer.id;
  return {
    id: r.id, subject: r.subject, chapter: r.chapter, topic: r.topic, difficulty: r.difficulty, source: r.source,
    stem: r.stem, options: parse<string[]>(r.options, ["", "", "", ""]),
    answer: hidden ? null : r.answer, why: hidden ? "" : r.why, wrong: hidden ? {} : parse<Record<number, string>>(r.wrong, {}),
    keyHidden: hidden,
    stage: r.stage, checks: parse<boolean[]>(r.checks, []),
    duplicate: r.duplicate, duplicateOf: r.duplicate_of,
    blind: r.blind_by ? { by: r.blind_name ?? "", answer: r.blind_answer } : null,
    reviewedBy: r.reviewer_name, signedOffBy: r.signoff_name, sentBack: r.sent_back,
    writerId: r.writer_id, writer: r.writer_name,
    createdAt: new Date(r.created_at).toISOString(), updatedAt: new Date(r.updated_at).toISOString(),
    free: !!r.free, paper: r.paper, liveCopy: r.live_copy ? r.live_stage : null,
  };
}

async function getQuestion(db: D1Database, id: string): Promise<QRow> {
  const r = await db.prepare(`${Q_SELECT} WHERE q.id = ?`).bind(id).first<QRow>();
  if (!r) throw fail(404, "not_found", "That question doesn't exist.");
  return r;
}

const fieldsOf = (r: QRow): QuestionFields => ({
  subject: r.subject, chapter: r.chapter, topic: r.topic, difficulty: r.difficulty, source: r.source, stem: r.stem,
  options: parse(r.options, ["", "", "", ""]), answer: r.answer, why: r.why, wrong: parse(r.wrong, {}),
});

/* The question fields from a request, cleaned. Only the fields the template has; nothing about stage or reviewers. */
function readFields(b: Record<string, unknown>): QuestionFields {
  const subject = str(b.subject, 40);
  if (!subjectCodes[subject]) throw fail(400, "bad_subject", "Pick a subject.");
  const chapter = str(b.chapter, 120);
  if (!chapter) throw fail(400, "bad_chapter", "Pick a chapter.");
  const difficulty = (["easy", "moderate", "hard"] as const).find((d) => d === b.difficulty) ?? "moderate";
  const raw = Array.isArray(b.options) ? b.options : [];
  const options = [0, 1, 2, 3].map((i) => str(raw[i], 1000));
  const answer = typeof b.answer === "number" && Number.isInteger(b.answer) && b.answer >= 0 && b.answer <= 3 ? b.answer : 0;
  const w = b.wrong && typeof b.wrong === "object" ? (b.wrong as Record<string, unknown>) : {};
  const wrong: Record<number, string> = {};
  for (let i = 0; i < 4; i++) if (i !== answer && str(w[i], 3000)) wrong[i] = str(w[i], 3000);
  return { subject, chapter, topic: str(b.topic, 120), difficulty, source: str(b.source, 300), stem: str(b.stem, 4000), options, answer, why: str(b.why, 4000), wrong };
}

const sameContent = (a: QuestionFields, b: QuestionFields) => JSON.stringify(a) === JSON.stringify(b);

async function nextId(db: D1Database, subject: string): Promise<string> {
  const prefix = subjectCodes[subject]!;
  const row = await db
    .prepare("INSERT INTO question_counters (prefix, n) VALUES (?, 1) ON CONFLICT (prefix) DO UPDATE SET n = n + 1 RETURNING n")
    .bind(prefix)
    .first<{ n: number }>();
  return `${prefix}-${String(row!.n).padStart(4, "0")}`;
}

/* Back to the writer: clears everything the later stages recorded, so the question goes through every check again. */
const backToDraft = (db: D1Database, id: string, note: string) =>
  db.prepare(
    `UPDATE questions SET stage = 'draft', sent_back = ?, checks = '[]', duplicate = NULL, duplicate_of = NULL,
       blind_by = NULL, blind_answer = NULL, reviewed_by = NULL, signed_off_by = NULL, updated_at = ? WHERE id = ?`,
  ).bind(note, Date.now(), id);

async function closestMatch(db: D1Database, q: QuestionFields & { id: string }) {
  const { results } = await db.prepare("SELECT id, stem, options FROM questions WHERE subject = ? AND id != ?").bind(q.subject, q.id).all<{ id: string; stem: string; options: string }>();
  let best = { id: null as string | null, pct: 0 };
  for (const r of results) {
    const p = similarity(q, { stem: r.stem, options: parse(r.options, []) });
    if (p > best.pct) best = { id: r.id, pct: p };
  }
  return best;
}

/* What a writer may see: their own questions, and others' only while waiting for a blind solve (key hidden).
   Reviewers and admins see the whole bank. */
const scopeFor = (me: Staff) => (me.role === "writer" ? { sql: "(q.writer_id = ? OR (q.stage = 'blind' AND q.blind_answer IS NULL))", args: [me.id] } : { sql: "1 = 1", args: [] as unknown[] });
const PAGE = 50;

const questionRoutes: Record<string, (c: Ctx) => Promise<Response>> = {
  /* One page of the queue, filtered on the server: view (a stage, "mine" or "all"), subject and search. */
  "GET /api/admin/questions": async (c) => {
    const me = await staff(c);
    const p = new URL(c.request.url).searchParams;
    const scope = scopeFor(me);
    const where = [scope.sql];
    const args = [...scope.args];
    const view = str(p.get("view"), 20);
    if (view === "mine") { where.push("q.writer_id = ?"); args.push(me.id); }
    else if (stageIds.includes(view as StageId)) { where.push("q.stage = ?"); args.push(view); }
    const subject = str(p.get("subject"), 40);
    if (subjectCodes[subject]) { where.push("q.subject = ?"); args.push(subject); }
    const search = str(p.get("q"), 100).replace(/[%_]/g, "");
    if (search) { where.push("(q.id LIKE ? OR q.stem LIKE ? OR q.topic LIKE ? OR w.name LIKE ?)"); args.push(...Array(4).fill(`%${search}%`)); }
    const offset = Math.max(0, Number(p.get("offset")) || 0);
    const filtered = where.join(" AND ");
    const [rows, total, stagesRes, mine, keys] = await c.db.batch([
      c.db.prepare(`${Q_SELECT} WHERE ${filtered} ORDER BY q.updated_at DESC LIMIT ${PAGE + 1} OFFSET ${offset}`).bind(...args),
      c.db.prepare(`SELECT count(*) AS n FROM questions q JOIN users w ON w.id = q.writer_id WHERE ${filtered}`).bind(...args),
      c.db.prepare(`SELECT q.stage, count(*) AS n FROM questions q WHERE ${scope.sql} GROUP BY q.stage`).bind(...scope.args),
      c.db.prepare("SELECT count(*) AS n FROM questions WHERE writer_id = ?").bind(me.id),
      c.db.prepare(`SELECT answer, count(*) AS n FROM questions q WHERE ${scope.sql} AND NOT (q.stage = 'blind' AND q.blind_answer IS NULL AND q.writer_id != ?) GROUP BY answer`).bind(...scope.args, me.id),
    ]);
    const list = rows!.results as QRow[];
    const counts: Record<string, number> = { all: 0, mine: (mine!.results[0] as { n: number }).n };
    (stagesRes!.results as { stage: string; n: number }[]).forEach((r) => { counts[r.stage] = r.n; counts.all! += r.n; });
    const keyCounts = [0, 1, 2, 3].map((k) => (keys!.results as { answer: number; n: number }[]).find((r) => r.answer === k)?.n ?? 0);
    const known = keyCounts.reduce((a, b) => a + b, 0);
    return json({
      questions: list.slice(0, PAGE).map((r) => present(r, me)),
      total: (total!.results[0] as { n: number }).n,
      hasMore: list.length > PAGE,
      counts,
      spread: { known, pct: keyCounts.map((n) => Math.round((n / Math.max(1, known)) * 100)) },
    });
  },

  "GET /api/admin/questions/one": async (c) => {
    const me = await staff(c);
    const r = await getQuestion(c.db, str(new URL(c.request.url).searchParams.get("id"), 20));
    if (me.role === "writer" && r.writer_id !== me.id && !(r.stage === "blind" && r.blind_answer === null)) throw fail(403, "forbidden", "Writers can only open their own questions.");
    return json({ question: present(r, me) });
  },

  /* Create (no id) or edit. Writers can only touch their own drafts. Editing a question that's past the draft stage
     sends it back to draft, since a changed question has to be checked again from the start. */
  "POST /api/admin/questions/save": async (c) => {
    const me = await staff(c);
    const b = await body(c.request);
    const f = readFields(b);
    const now = Date.now();
    if (!b.id) {
      const id = await nextId(c.db, f.subject);
      await c.db.batch([
        c.db.prepare(
          `INSERT INTO questions (id, subject, chapter, topic, difficulty, source, stem, options, answer, why, wrong, writer_id, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).bind(id, f.subject, f.chapter, f.topic, f.difficulty, f.source, f.stem, JSON.stringify(f.options), f.answer, f.why, JSON.stringify(f.wrong), me.id, now, now),
        log(c.db, me, "question.create", id),
      ]);
      return json({ question: present(await getQuestion(c.db, id), me) });
    }
    const r = await getQuestion(c.db, str(b.id, 20));
    if (me.role === "writer" && (r.writer_id !== me.id || r.stage !== "draft")) throw fail(403, "forbidden", "Writers can only edit their own drafts.");
    if (r.stage === "blind" && r.blind_answer === null && r.writer_id !== me.id) throw fail(403, "blind", "Solve it blind first, then you can edit it.");
    if (sameContent(fieldsOf(r), f)) return json({ question: present(r, me) });
    const ops = [
      c.db.prepare(
        `UPDATE questions SET subject = ?, chapter = ?, topic = ?, difficulty = ?, source = ?, stem = ?, options = ?, answer = ?, why = ?, wrong = ?, updated_at = ? WHERE id = ?`,
      ).bind(f.subject, f.chapter, f.topic, f.difficulty, f.source, f.stem, JSON.stringify(f.options), f.answer, f.why, JSON.stringify(f.wrong), now, r.id),
      log(c.db, me, "question.edit", r.id, r.stage === "draft" ? "" : `Edited at ${stageLabel(r.stage)}, back to draft`),
    ];
    if (r.stage !== "draft") {
      // A question students already see stays up, as it was, until the edit passes every check.
      if ((r.stage === "beta" || r.stage === "live") && !r.live_copy) {
        ops.push(c.db.prepare("UPDATE questions SET live_copy = ?, live_stage = ? WHERE id = ?").bind(JSON.stringify(fieldsOf(r)), r.stage, r.id));
      }
      ops.push(backToDraft(c.db, r.id, `Edited by ${me.name} at ${stageLabel(r.stage)}. It needs every check again.${r.stage === "beta" || r.stage === "live" || r.live_copy ? " Students keep seeing the checked version until then." : ""}`));
    }
    await c.db.batch(ops);
    return json({ question: present(await getQuestion(c.db, r.id), me) });
  },

  /* Moves a question one stage on, if that stage's rule is met. Draft runs the automatic checks and goes straight to
     the blind solve if they pass; the blind solve has its own route. */
  "POST /api/admin/questions/advance": async (c) => {
    const me = await staff(c);
    const b = await body(c.request);
    const r = await getQuestion(c.db, str(b.id, 20));
    const f = fieldsOf(r);
    const now = Date.now();

    if (r.stage === "draft" || r.stage === "auto") {
      if (me.role === "writer" && r.writer_id !== me.id) throw fail(403, "forbidden", "Writers can only submit their own questions.");
      const missing = missingFields(f);
      if (missing.length) throw fail(400, "incomplete", `Fill in ${missing.join(", ")} first.`);
      const dup = await closestMatch(c.db, { ...f, id: r.id });
      if (dup.pct >= DUPLICATE_LIMIT) {
        await c.db.batch([
          backToDraft(c.db, r.id, `Auto check: ${dup.pct}% the same as ${dup.id}. Rewrite it or delete it.`),
          c.db.prepare("UPDATE questions SET duplicate = ?, duplicate_of = ? WHERE id = ?").bind(dup.pct, dup.id, r.id),
          log(c.db, me, "question.auto_fail", r.id, `${dup.pct}% match with ${dup.id}`),
        ]);
      } else {
        await c.db.batch([
          c.db.prepare("UPDATE questions SET stage = 'blind', sent_back = NULL, duplicate = ?, duplicate_of = ?, updated_at = ? WHERE id = ?").bind(dup.pct, dup.id, now, r.id),
          log(c.db, me, "question.submit", r.id, `closest match ${dup.pct}%`),
        ]);
      }
    } else if (r.stage === "blind") {
      throw fail(400, "blind", "This stage moves on when someone other than the writer solves it blind.");
    } else if (r.stage === "review") {
      if (me.role === "writer") throw fail(403, "forbidden", "Only reviewers and admins can tick the checklist.");
      if (r.writer_id === me.id) throw fail(403, "own_question", "Someone other than the writer has to check it.");
      const checks = Array.isArray(b.checks) ? b.checks : [];
      if (checks.length !== checklist.length || !checks.every((x) => x === true)) throw fail(400, "checklist", "Tick every item on the checklist first.");
      await c.db.batch([
        c.db.prepare("UPDATE questions SET stage = 'signoff', checks = ?, reviewed_by = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify(checks), me.id, now, r.id),
        log(c.db, me, "question.review", r.id),
      ]);
    } else if (r.stage === "signoff" || r.stage === "beta") {
      if (me.role !== "admin") throw fail(403, "forbidden", "Only an admin can do this.");
      const to = r.stage === "signoff" ? "beta" : "live";
      await c.db.batch([
        // From beta on, the new version is the one students see, so any kept copy of the old one goes.
        c.db.prepare(`UPDATE questions SET stage = ?, ${to === "beta" ? "signed_off_by = ?," : ""} live_copy = NULL, live_stage = NULL, updated_at = ? WHERE id = ?`)
          .bind(...(to === "beta" ? [to, me.id, now, r.id] : [to, now, r.id])),
        log(c.db, me, `question.${to}`, r.id),
      ]);
    } else {
      throw fail(400, "live", "This question is already live.");
    }
    return json({ question: present(await getQuestion(c.db, r.id), me) });
  },

  /* The blind solve: someone who isn't the writer picks an answer without seeing the key. A match moves the question
     to the checklist; a mismatch sends it back, since either the key or the question is unclear. */
  "POST /api/admin/questions/blind": async (c) => {
    const me = await staff(c);
    const b = await body(c.request);
    const r = await getQuestion(c.db, str(b.id, 20));
    if (r.stage !== "blind" || r.blind_answer !== null) throw fail(400, "stage", "This question isn't waiting for a blind solve.");
    if (r.writer_id === me.id) throw fail(403, "own_question", "Someone other than the writer has to solve it.");
    const pick = typeof b.answer === "number" && Number.isInteger(b.answer) && b.answer >= 0 && b.answer <= 3 ? b.answer : -1;
    if (pick < 0) throw fail(400, "bad_answer", "Pick an answer.");
    const L = "ABCD";
    const ops = [
      c.db.prepare("UPDATE questions SET blind_by = ?, blind_answer = ?, updated_at = ? WHERE id = ?").bind(me.id, pick, Date.now(), r.id),
      log(c.db, me, "question.blind", r.id, `Picked ${L[pick]}, key ${L[r.answer]}`),
    ];
    if (pick === r.answer) ops.push(c.db.prepare("UPDATE questions SET stage = 'review' WHERE id = ?").bind(r.id));
    await c.db.batch(ops);
    if (pick !== r.answer) {
      await backToDraft(c.db, r.id, `Blind solve: ${me.name} picked ${L[pick]} but the key is ${L[r.answer]}. Check the key, or make the question clearer.`).run();
    }
    return json({ match: pick === r.answer, answer: r.answer, question: present(await getQuestion(c.db, r.id), me) });
  },

  "POST /api/admin/questions/send-back": async (c) => {
    const me = await reviewer(c);
    const b = await body(c.request);
    const r = await getQuestion(c.db, str(b.id, 20));
    if (r.stage === "draft") throw fail(400, "stage", "It's already a draft.");
    const note = str(b.note, 1000) || "Sent back for changes.";
    await c.db.batch([backToDraft(c.db, r.id, `${me.name}: ${note}`), log(c.db, me, "question.send_back", r.id, note)]);
    return json({ question: present(await getQuestion(c.db, r.id), me) });
  },

  /* Drafts can be deleted by their writer or an admin. Anything further along is sent back first. */
  "POST /api/admin/questions/delete": async (c) => {
    const me = await staff(c);
    const b = await body(c.request);
    const r = await getQuestion(c.db, str(b.id, 20));
    if (r.stage !== "draft") throw fail(400, "stage", "Only drafts can be deleted. Send it back first.");
    if (r.live_copy) throw fail(400, "live_copy", "Students still see the checked version of this question. Use \"Discard edit\" to go back to it instead.");
    if (me.role !== "admin" && r.writer_id !== me.id) throw fail(403, "forbidden", "Only the writer or an admin can delete it.");
    await c.db.batch([c.db.prepare("DELETE FROM questions WHERE id = ?").bind(r.id), log(c.db, me, "question.delete", r.id, r.stem.slice(0, 80))]);
    return json({ ok: true });
  },

  /* Drops an edit to a live question and puts back the version that passed, at the stage it was. */
  "POST /api/admin/questions/discard": async (c) => {
    const me = await reviewer(c);
    const b = await body(c.request);
    const r = await getQuestion(c.db, str(b.id, 20));
    if (!r.live_copy || !r.live_stage) throw fail(400, "no_copy", "There's no earlier version of this question to go back to.");
    const f = JSON.parse(r.live_copy) as QuestionFields;
    await c.db.batch([
      c.db.prepare(`UPDATE questions SET subject = ?, chapter = ?, topic = ?, difficulty = ?, source = ?, stem = ?, options = ?, answer = ?, why = ?, wrong = ?,
          stage = ?, live_copy = NULL, live_stage = NULL, sent_back = NULL, updated_at = ? WHERE id = ?`)
        .bind(f.subject, f.chapter, f.topic, f.difficulty, f.source, f.stem, JSON.stringify(f.options), f.answer, f.why, JSON.stringify(f.wrong), r.live_stage, Date.now(), r.id),
      log(c.db, me, "question.discard", r.id, `Back to the ${stageLabel(r.live_stage)} version`),
    ]);
    return json({ question: present(await getQuestion(c.db, r.id), me) });
  },

  /* Publishing details that aren't part of the question, so changing them needs no re-check: whether it's in the
     free set, and which past paper it was rebuilt from. */
  "POST /api/admin/questions/meta": async (c) => {
    const me = await admin(c);
    const b = await body(c.request);
    const r = await getQuestion(c.db, str(b.id, 20));
    const year = b.paper === null || b.paper === "" ? null : Number(b.paper);
    if (year !== null && !(Number.isInteger(year) && year >= 2000 && year <= 2100)) throw fail(400, "bad_year", "Pick a past-paper year, or none.");
    await c.db.batch([
      c.db.prepare("UPDATE questions SET free = ?, paper = ? WHERE id = ?").bind(b.free ? 1 : 0, year, r.id),
      log(c.db, me, "question.meta", r.id, `${b.free ? "In" : "Not in"} the free set${year ? `, past paper ${year}` : ""}`),
    ]);
    return json({ question: present(await getQuestion(c.db, r.id), me) });
  },

  "GET /api/admin/questions/log": async (c) => {
    await staff(c);
    const id = str(new URL(c.request.url).searchParams.get("id"), 20);
    const { results } = await c.db
      .prepare("SELECT l.action, l.detail, l.created_at, u.name AS actor FROM admin_log l LEFT JOIN users u ON u.id = l.actor_id WHERE l.target = ? ORDER BY l.id DESC LIMIT 50")
      .bind(id)
      .all();
    return json({ log: results });
  },
};

/* ---------- Students' reports ---------- */

const reportRoutes: Record<string, (c: Ctx) => Promise<Response>> = {
  /* Reports grouped by question, open ones first. A question with three open reports is hidden from new tests. */
  "GET /api/admin/reports": async (c) => {
    await reviewer(c);
    const status = new URL(c.request.url).searchParams.get("status") === "closed" ? "closed" : "open";
    const { results } = await c.db
      .prepare(`SELECT r.id, r.question_id, r.reason, r.details, r.status, r.note, r.created_at, r.resolved_at,
          u.name AS student, x.name AS resolver, q.stem, q.stage, q.subject
        FROM reports r LEFT JOIN users u ON u.id = r.user_id LEFT JOIN users x ON x.id = r.resolved_by LEFT JOIN questions q ON q.id = r.question_id
        WHERE ${status === "open" ? "r.status = 'open'" : "r.status != 'open'"}
        ORDER BY ${status === "open" ? "r.created_at ASC" : "r.resolved_at DESC"} LIMIT 200`)
      .all();
    return json({ reports: results });
  },

  /* Closes every open report on a question at once: fixed (the question was changed) or dismissed (it was right). */
  "POST /api/admin/reports/resolve": async (c) => {
    const me = await reviewer(c);
    const b = await body(c.request);
    const id = str(b.questionId, 20);
    const status = b.status === "fixed" ? "fixed" : b.status === "dismissed" ? "dismissed" : "";
    if (!status) throw fail(400, "bad_status", "Pick fixed or dismissed.");
    const note = str(b.note, 500);
    const res = await c.db.prepare("UPDATE reports SET status = ?, note = ?, resolved_by = ?, resolved_at = ? WHERE question_id = ? AND status = 'open'")
      .bind(status, note, me.id, Date.now(), id).run();
    if (!res.meta.changes) throw fail(404, "not_found", "There are no open reports on that question.");
    await log(c.db, me, `report.${status}`, id, note).run();
    return json({ ok: true, closed: res.meta.changes });
  },

  /* People who asked to hear when Examwise opens. */
  "GET /api/admin/waitlist": async (c) => {
    await admin(c);
    const { results } = await c.db.prepare("SELECT contact, kind, created_at FROM waitlist ORDER BY created_at DESC LIMIT 2000").all();
    return json({ waitlist: results });
  },
};

/* ---------- Users and plans ---------- */

type UserListRow = {
  id: string; name: string; email: string | null; phone: string | null; plan: string; plan_expires_at: number | null;
  role: Role; created_at: number; email_verified_at: number | null; devices: number; last_seen: number | null;
};

const presentUser = (u: UserListRow) => ({
  id: u.id, name: u.name, email: u.email, phone: u.phone, plan: u.plan, role: u.role,
  planExpiresAt: u.plan_expires_at ? new Date(u.plan_expires_at).toISOString() : null,
  createdAt: new Date(u.created_at).toISOString(), emailVerified: !!u.email_verified_at,
  devices: u.devices, lastSeen: u.last_seen ? new Date(u.last_seen).toISOString() : null,
});

const USER_SELECT = `SELECT u.id, u.name, u.email, u.phone, u.plan, u.plan_expires_at, u.role, u.created_at, u.email_verified_at,
  (SELECT count(*) FROM devices d WHERE d.user_id = u.id AND d.removed_at IS NULL) AS devices,
  (SELECT max(last_seen_at) FROM sessions s WHERE s.user_id = u.id) AS last_seen
  FROM users u`;

async function targetUser(db: D1Database, id: string): Promise<UserListRow> {
  const u = await db.prepare(`${USER_SELECT} WHERE u.id = ?`).bind(id).first<UserListRow>();
  if (!u) throw fail(404, "not_found", "That account doesn't exist.");
  return u;
}

const userRoutes: Record<string, (c: Ctx) => Promise<Response>> = {
  "GET /api/admin/users": async (c) => {
    await admin(c);
    const p = new URL(c.request.url).searchParams;
    const q = str(p.get("q"), 100);
    const filter = str(p.get("filter"), 20);
    const where: string[] = [];
    const args: unknown[] = [];
    if (q) {
      where.push("(u.name LIKE ?1 OR u.email LIKE ?1 OR u.phone LIKE ?1 OR u.id LIKE ?1)");
      args.push(`%${q.replace(/[%_]/g, "")}%`);
    }
    if (filter === "paid") where.push(`u.plan != 'free' AND (u.plan_expires_at IS NULL OR u.plan_expires_at > ${Date.now()})`);
    else if (filter === "staff") where.push("u.role != 'student'");
    else if (filter === "free") where.push("u.plan = 'free'");
    const sql = `${USER_SELECT}${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY u.created_at DESC LIMIT 200`;
    const { results } = await c.db.prepare(sql).bind(...args).all<UserListRow>();
    return json({ users: results.map(presentUser) });
  },

  "GET /api/admin/users/one": async (c) => {
    await admin(c);
    const id = str(new URL(c.request.url).searchParams.get("id"), 64);
    const u = await targetUser(c.db, id);
    const [devices, identities, logRows, takeovers] = await c.db.batch([
      c.db.prepare("SELECT d.id, d.label, d.created_at, d.last_seen_at, (d.id = u.active_device_id) AS active FROM devices d JOIN users u ON u.id = d.user_id WHERE d.user_id = ? AND d.removed_at IS NULL ORDER BY d.created_at").bind(id),
      c.db.prepare("SELECT provider FROM identities WHERE user_id = ?").bind(id),
      c.db.prepare("SELECT l.action, l.detail, l.created_at, a.name AS actor FROM admin_log l LEFT JOIN users a ON a.id = l.actor_id WHERE l.target = ? ORDER BY l.id DESC LIMIT 30").bind(id),
      c.db.prepare("SELECT count(*) AS n FROM device_events WHERE user_id = ? AND kind = 'takeover' AND created_at > ?").bind(id, Date.now() - DAY),
    ]);
    return json({
      user: presentUser(u),
      devices: (devices!.results as { active: number | null }[]).map((d) => ({ ...d, active: d.active === 1 })),
      methods: [...new Set((identities!.results as { provider: string }[]).map((r) => r.provider))],
      takeoversToday: (takeovers!.results[0] as { n: number }).n,
      log: logRows!.results,
    });
  },

  "POST /api/admin/users/role": async (c) => {
    const me = await admin(c);
    const b = await body(c.request);
    const u = await targetUser(c.db, str(b.id, 64));
    const role = roles.find((r) => r === b.role);
    if (!role) throw fail(400, "bad_role", "Pick a role.");
    if (u.id === me.id && role !== "admin") throw fail(400, "self", "You can't remove your own admin access. Ask another admin.");
    await c.db.batch([
      c.db.prepare("UPDATE users SET role = ? WHERE id = ?").bind(role, u.id),
      log(c.db, me, "user.role", u.id, `${u.role} → ${role}`),
    ]);
    return json({ user: presentUser(await targetUser(c.db, u.id)) });
  },

  /* Give or change a plan by hand (payments aren't live yet, and for refunds or support later). */
  "POST /api/admin/users/plan": async (c) => {
    const me = await admin(c);
    const b = await body(c.request);
    const u = await targetUser(c.db, str(b.id, 64));
    const plan = PLANS.find((p) => p === b.plan);
    if (!plan) throw fail(400, "bad_plan", "Pick a plan.");
    let expires: number | null = null;
    if (plan !== "free") {
      expires = Date.parse(str(b.expiresAt, 40));
      if (!Number.isFinite(expires)) throw fail(400, "bad_date", "Pick an end date for the plan.");
      if (expires < Date.now()) throw fail(400, "bad_date", "The end date has to be in the future.");
    }
    await c.db.batch([
      c.db.prepare("UPDATE users SET plan = ?, plan_expires_at = ? WHERE id = ?").bind(plan, expires, u.id),
      log(c.db, me, "user.plan", u.id, `${u.plan} → ${plan}${expires ? ` until ${new Date(expires).toISOString().slice(0, 10)}` : ""}`),
    ]);
    return json({ user: presentUser(await targetUser(c.db, u.id)) });
  },

  /* Clears both device slots and signs the account out everywhere, for a student who lost a phone or hit the
     30-day swap limit. It isn't counted as one of their own swaps. */
  "POST /api/admin/users/reset-devices": async (c) => {
    const me = await admin(c);
    const b = await body(c.request);
    const u = await targetUser(c.db, str(b.id, 64));
    await c.db.batch([
      c.db.prepare("UPDATE devices SET removed_at = ? WHERE user_id = ? AND removed_at IS NULL").bind(Date.now(), u.id),
      c.db.prepare("UPDATE users SET active_session_id = NULL, active_device_id = NULL WHERE id = ?").bind(u.id),
      c.db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(u.id),
      log(c.db, me, "user.reset_devices", u.id, `${u.devices} device${u.devices === 1 ? "" : "s"} cleared`),
    ]);
    return json({ user: presentUser(await targetUser(c.db, u.id)) });
  },

  "POST /api/admin/users/signout": async (c) => {
    const me = await admin(c);
    const b = await body(c.request);
    const u = await targetUser(c.db, str(b.id, 64));
    if (u.id === me.id) throw fail(400, "self", "Use Sign out on your own account page instead.");
    await c.db.batch([
      c.db.prepare("UPDATE users SET active_session_id = NULL, active_device_id = NULL WHERE id = ?").bind(u.id),
      c.db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(u.id),
      log(c.db, me, "user.signout", u.id),
    ]);
    return json({ user: presentUser(await targetUser(c.db, u.id)) });
  },
};

/* ---------- Overview ---------- */

const overviewRoutes: Record<string, (c: Ctx) => Promise<Response>> = {
  "GET /api/admin/overview": async (c) => {
    const me = await staff(c);
    const now = Date.now();
    const [stagesRes, subjRes] = await c.db.batch([
      c.db.prepare("SELECT stage, count(*) AS n FROM questions GROUP BY stage"),
      c.db.prepare("SELECT subject, count(*) AS n FROM questions WHERE stage = 'live' GROUP BY subject"),
    ]);
    const byStage = Object.fromEntries(stageIds.map((s) => [s, 0])) as Record<StageId, number>;
    (stagesRes!.results as { stage: StageId; n: number }[]).forEach((r) => { byStage[r.stage] = r.n; });
    const liveBySubject = Object.fromEntries((subjRes!.results as { subject: string; n: number }[]).map((r) => [r.subject, r.n]));

    const mine = await c.db.prepare("SELECT count(*) AS n FROM questions WHERE writer_id = ? AND stage = 'draft' AND sent_back IS NOT NULL").bind(me.id).first<{ n: number }>();
    const waitingBlind = await c.db.prepare("SELECT count(*) AS n FROM questions WHERE stage = 'blind' AND blind_answer IS NULL AND writer_id != ?").bind(me.id).first<{ n: number }>();

    const openReports = me.role === "writer" ? 0 : (await c.db.prepare("SELECT count(DISTINCT question_id) AS n FROM reports WHERE status = 'open'").first<{ n: number }>())?.n ?? 0;

    let users = null;
    let visits = null;
    let waitlist = 0;
    let activity: unknown[] = [];
    if (me.role === "admin") {
      const [u, plans, act] = await c.db.batch([
        c.db.prepare("SELECT count(*) AS total, sum(created_at > ?) AS week, sum(role != 'student') AS staff FROM users").bind(now - 7 * DAY),
        c.db.prepare("SELECT plan, count(*) AS n FROM users WHERE plan != 'free' AND (plan_expires_at IS NULL OR plan_expires_at > ?) GROUP BY plan").bind(now),
        c.db.prepare("SELECT l.action, l.target, l.detail, l.created_at, a.name AS actor FROM admin_log l LEFT JOIN users a ON a.id = l.actor_id ORDER BY l.id DESC LIMIT 15"),
      ]);
      const t = u!.results[0] as { total: number; week: number | null; staff: number | null };
      users = {
        total: t.total, newThisWeek: t.week ?? 0, staff: t.staff ?? 0,
        paid: Object.fromEntries((plans!.results as { plan: string; n: number }[]).map((r) => [r.plan, r.n])),
      };
      activity = act!.results;
      visits = await visitSummary(c.db);
      waitlist = (await c.db.prepare("SELECT count(*) AS n FROM waitlist").first<{ n: number }>())?.n ?? 0;
    }
    return json({ byStage, liveBySubject, sentBackToMe: mine?.n ?? 0, waitingBlind: waitingBlind?.n ?? 0, openReports, waitlist, users, visits, activity });
  },
};

export const adminRoutes = { ...overviewRoutes, ...questionRoutes, ...reportRoutes, ...userRoutes };
