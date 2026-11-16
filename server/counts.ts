/* How many questions each bank, subject and chapter holds, and which past papers exist. These are the same for every
   student and only change when the bank does, so they're counted once and kept in site_cache; bank_version (bumped
   by triggers, migrations/0042) says when the kept copy is out of date. Counting them live reads every question,
   which is what every practice and dashboard load used to do. */

/* Open reports that hide a question from new tests until a reviewer looks. */
export const REPORT_HIDE = 3;

export type ChapterCount = { bank: string; subject: string; chapter: string; total: number; free: number };
export type Counts = {
  chapters: ChapterCount[];
  papers: { year: number; n: number }[];
  /* Every question a student can be served, whichever bank it's in. */
  questions: number;
};

const KEY = "counts";
/* A copy is trusted this long without looking at the database at all. */
const MEMORY_MS = 30 * 1000;
/* And a stored copy is rebuilt after this long whatever the version says, in case a change slipped past the triggers. */
const STALE_MS = 12 * 60 * 60 * 1000;

let mem: { at: number; data: Counts } | null = null;

async function count(db: D1Database): Promise<Counts> {
  const [chapters, papers, all] = await db.batch([
    db.prepare(`SELECT bank, subject, chapter, count(*) AS total, sum(free) AS free FROM bank_served WHERE open_reports < ${REPORT_HIDE} GROUP BY bank, subject, chapter`),
    db.prepare(`SELECT paper AS year, count(*) AS n FROM served WHERE paper IS NOT NULL AND open_reports < ${REPORT_HIDE} GROUP BY paper ORDER BY paper DESC`),
    db.prepare(`SELECT count(*) AS n FROM served WHERE open_reports < ${REPORT_HIDE}`),
  ]);
  return {
    chapters: (chapters!.results as ChapterCount[]).map((r) => ({ ...r, free: r.free ?? 0 })),
    papers: papers!.results as { year: number; n: number }[],
    questions: (all!.results[0] as { n: number } | undefined)?.n ?? 0,
  };
}

export async function bankCounts(db: D1Database): Promise<Counts> {
  const now = Date.now();
  if (mem && now - mem.at < MEMORY_MS) return mem.data;
  let version: number | null = null;
  try {
    const row = await db
      .prepare("SELECT b.v AS v, c.v AS kept, c.value, c.at FROM bank_version b LEFT JOIN site_cache c ON c.key = ?1 WHERE b.id = 1")
      .bind(KEY)
      .first<{ v: number; kept: number | null; value: string | null; at: number | null }>();
    if (row) {
      version = row.v;
      if (row.value && row.kept === row.v && now - (row.at ?? 0) < STALE_MS) {
        const data = JSON.parse(row.value) as Counts;
        mem = { at: now, data };
        return data;
      }
    }
  } catch {
    // The tables aren't there yet (the migration hasn't run): count live, as before.
  }
  const data = await count(db);
  if (version !== null) {
    try {
      await db.prepare("INSERT INTO site_cache (key, v, value, at) VALUES (?1, ?2, ?3, ?4) ON CONFLICT (key) DO UPDATE SET v = ?2, value = ?3, at = ?4")
        .bind(KEY, version, JSON.stringify(data), now).run();
      mem = { at: now, data };
    } catch {}
  }
  return data;
}

/* A bank's chapters, and the MDCAT bank's questions per subject. */
export const chaptersOf = (c: Counts, bank: string) => c.chapters.filter((x) => x.bank === bank);
export function subjectTotals(c: Counts, bank = "mdcat") {
  const out = new Map<string, { total: number; free: number }>();
  for (const x of chaptersOf(c, bank)) {
    const t = out.get(x.subject) ?? { total: 0, free: 0 };
    t.total += x.total; t.free += x.free;
    out.set(x.subject, t);
  }
  return out;
}

/* Anything kept under a key for a while: numbers that are slow to work out and fine to show a little old. */
export async function kept<T>(db: D1Database, key: string, maxAgeMs: number, work: () => Promise<T>): Promise<T> {
  const now = Date.now();
  let canStore = true;
  try {
    const row = await db.prepare("SELECT value, at FROM site_cache WHERE key = ?").bind(key).first<{ value: string; at: number }>();
    if (row && now - row.at < maxAgeMs) return JSON.parse(row.value) as T;
  } catch {
    canStore = false;
  }
  const data = await work();
  if (canStore) {
    try {
      await db.prepare("INSERT INTO site_cache (key, v, value, at) VALUES (?1, 0, ?2, ?3) ON CONFLICT (key) DO UPDATE SET v = 0, value = ?2, at = ?3").bind(key, JSON.stringify(data), now).run();
    } catch {}
  }
  return data;
}
