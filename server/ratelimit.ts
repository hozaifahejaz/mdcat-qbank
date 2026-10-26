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
