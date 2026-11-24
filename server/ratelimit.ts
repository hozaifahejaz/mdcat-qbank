import { fail } from "./http";

/* Fixed-window counter in D1. Throws a 429 once `key` has been hit more than `limit` times in `windowMs`. */
export async function rateLimit(db: D1Database, key: string, limit: number, windowMs: number): Promise<void> {
  overLimit(await hit(db, key, windowMs).first<Counter>(), limit, windowMs);
}

type Counter = { count: number; window_start: number };

/* The two halves of rateLimit, for callers that send the count along with other statements in one batch. */
export function hit(db: D1Database, key: string, windowMs: number) {
  const now = Date.now();
  return db
    .prepare(
      `INSERT INTO rate_limits (key, count, window_start) VALUES (?1, 1, ?2)
       ON CONFLICT (key) DO UPDATE SET
         count = CASE WHEN window_start < ?3 THEN 1 ELSE count + 1 END,
         window_start = CASE WHEN window_start < ?3 THEN ?2 ELSE window_start END
       RETURNING count, window_start`,
    )
    .bind(key, now, now - windowMs);
}
export function overLimit(row: Counter | null | undefined, limit: number, windowMs: number): void {
  if (row && row.count > limit) {
    const wait = Math.max(1, Math.ceil((row.window_start + windowMs - Date.now()) / 1000));
    throw fail(429, "rate_limited", "Too many tries. Please wait a little and try again.", { retry_after: wait });
  }
}

/* The same check without counting this try: throws once `key` has already been hit `limit` times in the window. */
export async function rateLimitPeek(db: D1Database, key: string, limit: number, windowMs: number): Promise<void> {
  peeked(await usedStmt(db, key).first<Counter>(), limit, windowMs);
}
/* Its second half, for a row read with usedStmt in a caller's own batch. */
export function peeked(row: Counter | null | undefined, limit: number, windowMs: number): void {
  const now = Date.now();
  if (row && row.window_start >= now - windowMs && row.count >= limit) {
    const wait = Math.max(1, Math.ceil((row.window_start + windowMs - now) / 1000));
    throw fail(429, "rate_limited", "Too many tries. Please wait a little and try again.", { retry_after: wait });
  }
}

/* Takes `n` from an allowance of `limit` per window, in one statement, so requests arriving at the same moment can't
   each read the old count and all get through. It returns a row when the `n` were taken and none when they would go
   past the limit (nothing is counted then). Read it with `took`. */
export function reserve(db: D1Database, key: string, n: number, limit: number, windowMs: number) {
  const now = Date.now();
  return db
    .prepare(
      `INSERT INTO rate_limits (key, count, window_start) SELECT ?1, ?4, ?2 WHERE ?4 <= ?5
       ON CONFLICT (key) DO UPDATE SET
         count = CASE WHEN window_start < ?3 THEN ?4 ELSE count + ?4 END,
         window_start = CASE WHEN window_start < ?3 THEN ?2 ELSE window_start END
       WHERE (window_start < ?3 AND ?4 <= ?5) OR (window_start >= ?3 AND count + ?4 <= ?5)
       RETURNING count`,
    )
    .bind(key, now, now - windowMs, n, limit);
}
export const took = (res: D1Result | undefined) => !!res?.results.length;
/* Gives back what a reserve took, when the thing it was taken for didn't happen after all. */
export const giveBack = (db: D1Database, key: string, n: number) =>
  db.prepare("UPDATE rate_limits SET count = max(0, count - ?2) WHERE key = ?1").bind(key, n);

/* How much of a counted allowance `key` has used in the current window. */
export const usedStmt = (db: D1Database, key: string) => db.prepare("SELECT count, window_start FROM rate_limits WHERE key = ?").bind(key);
export const usedOf = (row: Counter | null | undefined, windowMs: number) => (row && row.window_start >= Date.now() - windowMs ? row.count : 0);

/* Adds `n` to a counted allowance, starting a new window if the old one has run out. */
export function spend(db: D1Database, key: string, n: number, windowMs: number) {
  const now = Date.now();
  return db
    .prepare(
      `INSERT INTO rate_limits (key, count, window_start) VALUES (?1, ?4, ?2)
       ON CONFLICT (key) DO UPDATE SET
         count = CASE WHEN window_start < ?3 THEN ?4 ELSE count + ?4 END,
         window_start = CASE WHEN window_start < ?3 THEN ?2 ELSE window_start END`,
    )
    .bind(key, now, now - windowMs, n);
}
