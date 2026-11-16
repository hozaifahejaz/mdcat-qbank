import { bankById } from "../lib/banks";
import { body, json } from "./http";
import { requireSession } from "./session";

/* What a student picked on the welcome screen (and can change later): which test they're preparing for, the year
   they sit it and how many questions a day they aim for. Kept in user_prefs (migrations/0042). */

export const DEFAULT_GOAL = 40;
export const GOALS = { min: 5, max: 300 };

type Row = { bank: string | null; exam_year: number | null; daily_goal: number | null; welcomed_at: number | null };
export type Prefs = { bank: string; examYear: number | null; dailyGoal: number; welcomed: boolean };

/* Before the table exists everyone counts as welcomed, so nobody is sent to a screen that can't save. */
const NONE: Prefs = { bank: "mdcat", examYear: null, dailyGoal: DEFAULT_GOAL, welcomed: true };

export const prefsStmt = (db: D1Database, userId: string) => db.prepare("SELECT bank, exam_year, daily_goal, welcomed_at FROM user_prefs WHERE user_id = ?").bind(userId);
export const readPrefs = (row: Row | null | undefined): Prefs => ({
  bank: bankById(row?.bank)?.id ?? "mdcat",
  examYear: row?.exam_year ?? null,
  dailyGoal: row?.daily_goal ?? DEFAULT_GOAL,
  welcomed: !!row?.welcomed_at,
});

export async function getPrefs(db: D1Database, userId: string): Promise<Prefs> {
  try {
    return readPrefs(await prefsStmt(db, userId).first<Row>());
  } catch {
    return NONE;
  }
}

type Ctx = { db: D1Database; request: Request };

export const prefRoutes: Record<string, (c: Ctx) => Promise<Response>> = {
  "GET /api/account/prefs": async (c) => {
    const s = await requireSession(c.db, c.request);
    return json(await getPrefs(c.db, s.user_id));
  },

  /* Saves whichever of the three are sent; `welcomed` marks the welcome screen as seen. */
  "POST /api/account/prefs": async (c) => {
    const s = await requireSession(c.db, c.request);
    const b = await body(c.request);
    const bank = typeof b.bank === "string" ? bankById(b.bank)?.id ?? null : null;
    const year = Number.isInteger(b.examYear) && (b.examYear as number) >= 2026 && (b.examYear as number) <= 2035 ? (b.examYear as number) : null;
    const goal = Number.isFinite(Number(b.dailyGoal)) && b.dailyGoal !== null && b.dailyGoal !== undefined
      ? Math.min(GOALS.max, Math.max(GOALS.min, Math.round(Number(b.dailyGoal)))) : null;
    const now = Date.now();
    await c.db
      .prepare(`INSERT INTO user_prefs (user_id, bank, exam_year, daily_goal, welcomed_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        ON CONFLICT (user_id) DO UPDATE SET
          bank = coalesce(?2, bank), exam_year = coalesce(?3, exam_year), daily_goal = coalesce(?4, daily_goal),
          welcomed_at = coalesce(welcomed_at, ?5), updated_at = ?6`)
      .bind(s.user_id, bank, year, goal, b.welcomed ? now : null, now)
      .run();
    return json(await getPrefs(c.db, s.user_id));
  },
};
