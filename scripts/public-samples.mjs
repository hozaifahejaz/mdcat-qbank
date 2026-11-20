/* Writes lib/public-data.json: the questions shown on the public study pages (/mdcat/...), and the counts beside them.

   Run it after the bank changes:  npx wrangler d1 migrations apply mdcat-qbank-eu --local && node scripts/public-samples.mjs
   It reads the local copy of the database that wrangler keeps, so what it writes is what the migrations hold. The
   file is committed, which keeps the site build free of any database.

   What goes public: for each MDCAT chapter, its free-set questions (up to five), topped up to three with the
   chapter's first easy or moderate questions. For the 2026 paper, ten questions spread across the subjects and
   the count of questions per chapter. Everything else stays behind sign-in. */
import { DatabaseSync } from "node:sqlite";
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(".wrangler", "state", "v3", "d1", "miniflare-D1DatabaseObject");
const file = readdirSync(dir).filter((f) => f.endsWith(".sqlite") && f !== "metadata.sqlite")
  .map((f) => join(dir, f)).sort((a, b) => statSync(b).size - statSync(a).size)[0];
if (!file) throw new Error("public-samples: no local database. Run the migrations with --local first.");
const db = new DatabaseSync(file, { readOnly: true });
const all = (sql, ...args) => db.prepare(sql).all(...args);

const shape = (r) => ({ id: r.id, topic: r.topic, stem: r.stem, options: JSON.parse(r.options), answer: r.answer, why: r.why, wrong: JSON.parse(r.wrong || "{}") });
const cols = "s.id, s.topic, s.stem, s.options, s.answer, s.why, s.wrong";
const inMdcat = "s.paper IS NULL AND s.open_reports < 3 AND s.id NOT IN (SELECT id FROM questions WHERE mdcat = 0)";

const chapters = {};
for (const c of all(`SELECT s.subject, s.chapter, count(*) AS total FROM served s WHERE ${inMdcat} GROUP BY 1, 2 ORDER BY 1, 2`)) {
  const free = all(`SELECT ${cols} FROM served s WHERE ${inMdcat} AND s.subject = ? AND s.chapter = ? AND s.free = 1 ORDER BY s.id LIMIT 5`, c.subject, c.chapter);
  const more = free.length >= 3 ? [] : all(
    `SELECT ${cols} FROM served s WHERE ${inMdcat} AND s.subject = ? AND s.chapter = ? AND s.free = 0 AND s.difficulty IN ('easy', 'moderate') AND length(s.why) > 150 ORDER BY s.id LIMIT ?`,
    c.subject, c.chapter, 3 - free.length);
  (chapters[c.subject] ??= {})[c.chapter] = { total: c.total, samples: [...free, ...more].map(shape) };
}

const split = { Biology: 4, Chemistry: 2, Physics: 2, English: 1, "Logical Reasoning": 1 };
const paper = { year: 2026, total: 0, chapters: {}, samples: [] };
for (const c of all("SELECT s.subject, s.chapter, count(*) AS n FROM served s WHERE s.paper = 2026 GROUP BY 1, 2 ORDER BY 1, n DESC, 2")) {
  (paper.chapters[c.subject] ??= []).push({ chapter: c.chapter, n: c.n });
  paper.total += c.n;
}
for (const [subject, n] of Object.entries(split)) {
  // Spread through the paper, not the first few: every k-th question of the subject.
  const rows = all(`SELECT ${cols} FROM served s WHERE s.paper = 2026 AND s.subject = ? AND length(s.why) > 150 ORDER BY s.id`, subject);
  const step = Math.max(1, Math.floor(rows.length / n));
  for (let i = 0; i < n && i * step < rows.length; i++) paper.samples.push({ subject, ...shape(rows[i * step]) });
}

const totals = Object.fromEntries(all(`SELECT s.subject, count(*) AS n FROM served s WHERE ${inMdcat} GROUP BY 1`).map((r) => [r.subject, r.n]));
const bank = all("SELECT count(*) AS n FROM served")[0].n;
const banks = Object.fromEntries(all("SELECT bank, count(*) AS n FROM bank_served GROUP BY 1").map((r) => [r.bank, r.n]));
const data = { made: new Date().toISOString().slice(0, 10), bank, banks, totals, chapters, paper };
writeFileSync(join("lib", "public-data.json"), JSON.stringify(data, null, 1) + "\n");
const shown = Object.values(chapters).flatMap((s) => Object.values(s)).reduce((n, c) => n + c.samples.length, 0);
console.log(`public-data.json: ${shown} chapter questions and ${paper.samples.length} paper questions out of ${bank}`);
