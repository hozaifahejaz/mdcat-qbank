import { fail } from "./http";

/* Fixed-window counter in D1. Throws a 429 once `key` has been hit more than `limit` times in `windowMs`. */
export async function rateLimit(db: D1Database, key: string, limit: number, windowMs: number): Promise<void> {
  const now = Date.now();
  const cutoff = now - windowMs;
  const row = await db
    .prepare(
      `INSERT INTO rate_limits (key, count, window_start) VALUES (?1, 1, ?2)
       ON CONFLICT (key) DO UPDATE SET
         count = CASE WHEN window_start < ?3 THEN 1 ELSE count + 1 END,
         window_start = CASE WHEN window_start < ?3 THEN ?2 ELSE window_start END
       RETURNING count, window_start`,
    )
    .bind(key, now, cutoff)
    .first<{ count: number; window_start: number }>();
  if (row && row.count > limit) {
    const wait = Math.max(1, Math.ceil((row.window_start + windowMs - now) / 1000));
    throw fail(429, "rate_limited", "Too many tries. Please wait a little and try again.", { retry_after: wait });
  }
}

/* The same check without counting this try: throws once `key` has already been hit `limit` times in the window. */
export async function rateLimitPeek(db: D1Database, key: string, limit: number, windowMs: number): Promise<void> {
  const now = Date.now();
  const row = await db.prepare("SELECT count, window_start FROM rate_limits WHERE key = ?").bind(key).first<{ count: number; window_start: number }>();
  if (row && row.window_start >= now - windowMs && row.count >= limit) {
    const wait = Math.max(1, Math.ceil((row.window_start + windowMs - now) / 1000));
    throw fail(429, "rate_limited", "Too many tries. Please wait a little and try again.", { retry_after: wait });
  }
}

/* How much of a counted allowance `key` has used in the current window. */
export async function used(db: D1Database, key: string, windowMs: number): Promise<number> {
  const row = await db.prepare("SELECT count, window_start FROM rate_limits WHERE key = ?").bind(key).first<{ count: number; window_start: number }>();
  return row && row.window_start >= Date.now() - windowMs ? row.count : 0;
}

/* Adds `n` to a counted allowance, starting a new window if the old one has run out. */
export async function spend(db: D1Database, key: string, n: number, windowMs: number): Promise<void> {
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO rate_limits (key, count, window_start) VALUES (?1, ?4, ?2)
       ON CONFLICT (key) DO UPDATE SET
         count = CASE WHEN window_start < ?3 THEN ?4 ELSE count + ?4 END,
         window_start = CASE WHEN window_start < ?3 THEN ?2 ELSE window_start END`,
    )
    .bind(key, now, now - windowMs, n)
    .run();
}
