import { randomToken, sha256 } from "./crypto";
import { fail, json, body, readCookie, str } from "./http";
import { SESSION_COOKIE } from "./session";
import { requireRole } from "./admin";

/* Site visits: the page beacon (/api/visit, from components/Track.tsx) and the admin Visitors page
   (/api/admin/visitors). Privacy-light on purpose: no IP, no cookie, no ID that lasts beyond the day
   (migrations/0003_visits.sql). Staff and the admin panel aren't counted, so the numbers are students.

   Kept light on the database (migrations/0057_visit_rollups.sql):
   - A page view is one insert. The abuse cap is a per-visitor daily count read from the same index the insert uses,
     plus a per-address count held in memory, so a view writes no counter rows.
   - Once a day the finished days are summed into visit_days and visit_stats, reading each raw view once, and raw views
     older than a week are deleted. The Visitors page reads those small daily rows plus today's raw views, and keeps
     the finished-day sums in memory, since they never change. */

type Ctx = { db: D1Database; request: Request; ip: string };

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const PKT = 5 * HOUR;
const RAW_DAYS = 8;
const KEEP_DAYS = 400;
const RANGES = [1, 7, 30, 90];
const PER_VISITOR_DAY = 300;
const PER_ADDRESS_MINUTE = 60;
const LIST = 50;

/* The Pakistan date of a moment, as YYYY-MM-DD, and the Pakistan hour as "00" to "23". */
export const pkDay = (ms: number) => new Date(ms + PKT).toISOString().slice(0, 10);
const pkHour = (ms: number) => new Date(ms + PKT).toISOString().slice(11, 13);
const dayStart = (day: string) => Date.parse(`${day}T00:00:00+05:00`);
const addDays = (day: string, n: number) => pkDay(dayStart(day) + n * DAY + HOUR);

const BOTS = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|java\/|okhttp|go-http|axios|node-fetch|scrapy|httpclient|phantom|selenium|puppeteer|playwright/i;

function device(ua: string) {
  if (/iPad|Tablet|Kindle|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablet";
  if (/Mobi|iPhone|iPod|Android/i.test(ua)) return "phone";
  return "desktop";
}
function os(ua: string) {
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Windows/i.test(ua)) return "Windows";
  if (/CrOS/i.test(ua)) return "ChromeOS";
  if (/Mac OS X|Macintosh/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Other";
}
function browser(ua: string) {
  if (/FBAN|FBAV|FB_IAB|Instagram/i.test(ua)) return "Facebook or Instagram app";
  if (/Edg(e|A|iOS)?\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera|OPT\//i.test(ua)) return "Opera";
  if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
  if (/UCBrowser/i.test(ua)) return "UC Browser";
  if (/Firefox|FxiOS/i.test(ua)) return "Firefox";
  if (/Chrome|CriOS/i.test(ua)) return "Chrome";
  if (/Safari/i.test(ua)) return "Safari";
  return "Other";
}

/* Just the other site's host, without www. Our own pages and anything unreadable count as direct. */
function referrerHost(raw: unknown, self: string) {
  try {
    const h = new URL(str(raw, 2000)).hostname.replace(/^www\./, "").toLowerCase();
    return h === self.replace(/^www\./, "") ? "" : h.slice(0, 100);
  } catch {
    return "";
  }
}

/* Paths only, no query string or hash, so nothing typed into a URL ends up here. */
function cleanPath(raw: unknown) {
  const p = str(raw, 200).split(/[?#]/)[0]!;
  return /^\/[\w\-./]*$/.test(p) ? (p.length > 1 ? p.replace(/\/+$/, "") : p) : "";
}
/* Place names from Cloudflare, trimmed to plain text. */
const place = (v: unknown) => (typeof v === "string" ? v.replace(/[|\u0000-\u001f]/g, "").trim().slice(0, 60) : "");

/* A per-address count in this server's memory: the first, free line against someone flooding the counter. Each
   Cloudflare server keeps its own, which is fine for this; the per-visitor daily cap in the database backs it up. */
const seen = new Map<string, { at: number; n: number }>();
function tooFast(key: string, now: number) {
  const s = seen.get(key);
  if (!s || now - s.at > 60_000) {
    if (seen.size > 5000) seen.clear();
    seen.set(key, { at: now, n: 1 });
    return false;
  }
  return ++s.n > PER_ADDRESS_MINUTE;
}

/* Today's salt. A new day gets a new one, the old ones are deleted, and the finished days are summed up. */
let cached: { day: string; salt: string } | null = null;
async function daySalt(db: D1Database, day: string, now: number) {
  if (cached?.day === day) return cached.salt;
  const [made, read] = await db.batch([
    db.prepare("INSERT OR IGNORE INTO visit_salts (day, salt) VALUES (?, ?)").bind(day, randomToken(16)),
    db.prepare("SELECT salt FROM visit_salts WHERE day = ?").bind(day),
  ]);
  if (made!.meta.changes) {
    await db.batch([
      db.prepare("DELETE FROM visit_salts WHERE day < ?").bind(day),
      // Old rate-limit counters (the longest window is an hour) and old account notes go with them.
      db.prepare("DELETE FROM rate_limits WHERE window_start < ?").bind(now - DAY),
      db.prepare("DELETE FROM security_events WHERE created_at < ?").bind(now - 90 * DAY),
    ]);
    await rollUp(db, day).catch((e) => console.error("visit roll-up", e));
  }
  const row = read!.results[0] as { salt: string } | undefined;
  cached = { day, salt: row!.salt };
  return cached.salt;
}

/* ---------- Summing up ---------- */

type Raw = { day: string; created_at: number; visitor: string; path: string; referrer: string; campaign: string; country: string; region: string; city: string; device: string; os: string; browser: string; signed_in: number; entry: number };
type Tally = Map<string, { v: Set<string>; n: number }>;
export type Dim = "page" | "entry" | "referrer" | "campaign" | "country" | "region" | "city" | "device" | "os" | "browser" | "hour";
const DIMS: Dim[] = ["page", "entry", "referrer", "campaign", "country", "region", "city", "device", "os", "browser", "hour"];
type DaySum = { visitors: number; views: number; signedIn: number; single: number; dims: Record<Dim, Map<string, { visitors: number; views: number }>> };

/* Which keys a view counts under, per dim. Empty keys are left out where they mean "none" (campaign, entry). */
function keysOf(r: Raw): [Dim, string][] {
  const cc = r.country || "XX";
  const out: [Dim, string][] = [
    ["page", r.path], ["referrer", r.referrer], ["country", cc], ["device", r.device], ["os", r.os], ["browser", r.browser],
    ["hour", pkHour(r.created_at)],
  ];
  if (r.entry) out.push(["entry", r.path]);
  if (r.campaign) out.push(["campaign", r.campaign]);
  if (r.region) out.push(["region", `${cc}|${r.region}`]);
  if (r.city) out.push(["city", `${cc}|${r.city}`]);
  return out;
}

/* One day's raw views to its sums, in one pass. */
function sumDay(rows: Raw[]): DaySum {
  const t = Object.fromEntries(DIMS.map((d) => [d, new Map()])) as Record<Dim, Tally>;
  const per = new Map<string, { n: number; s: boolean }>();
  for (const r of rows) {
    const p = per.get(r.visitor) ?? { n: 0, s: false };
    p.n++;
    p.s ||= !!r.signed_in;
    per.set(r.visitor, p);
    for (const [d, k] of keysOf(r)) {
      const e = t[d].get(k) ?? { v: new Set<string>(), n: 0 };
      e.v.add(r.visitor);
      e.n++;
      t[d].set(k, e);
    }
  }
  let signedIn = 0, single = 0;
  for (const p of per.values()) { if (p.s) signedIn++; if (p.n === 1) single++; }
  const dims = Object.fromEntries(DIMS.map((d) => [d, new Map([...t[d]].map(([k, e]) => [k, { visitors: e.v.size, views: e.n }]))])) as DaySum["dims"];
  return { visitors: per.size, views: rows.length, signedIn, single, dims };
}

const RAW_COLS = "day, created_at, visitor, path, referrer, campaign, country, region, city, device, os, browser, signed_in, entry";

/* Sums every finished day that hasn't been summed yet (normally just yesterday), then drops raw views more than a
   week old and sums older than KEEP_DAYS. Safe to run twice at once: the writes replace rather than add. */
async function rollUp(db: D1Database, today: string) {
  const pending = await db
    .prepare("SELECT DISTINCT day FROM page_views WHERE day < ? AND day NOT IN (SELECT day FROM visit_days) ORDER BY day LIMIT 120")
    .bind(today).all<{ day: string }>();
  for (const { day } of pending.results) {
    const rows = (await db.prepare(`SELECT ${RAW_COLS} FROM page_views WHERE day = ?`).bind(day).all<Raw>()).results;
    const s = sumDay(rows);
    const stats: (string | number)[][] = [];
    for (const d of DIMS) for (const [k, e] of s.dims[d]) stats.push([day, d, k, e.visitors, e.views]);
    const writes: D1PreparedStatement[] = [db.prepare("DELETE FROM visit_stats WHERE day = ?").bind(day)];
    // D1 takes up to 100 values per statement, so 20 rows of 5 at a time.
    for (let i = 0; i < stats.length; i += 20) {
      const part = stats.slice(i, i + 20);
      writes.push(db.prepare(`INSERT OR REPLACE INTO visit_stats (day, dim, key, visitors, views) VALUES ${part.map(() => "(?, ?, ?, ?, ?)").join(", ")}`).bind(...part.flat()));
    }
    // The day row goes last, so a day only counts as summed once its stats are all in.
    writes.push(db.prepare("INSERT OR REPLACE INTO visit_days (day, visitors, views, signed_in, single) VALUES (?, ?, ?, ?, ?)").bind(day, s.visitors, s.views, s.signedIn, s.single));
    await db.batch(writes);
  }
  await db.batch([
    db.prepare("DELETE FROM page_views WHERE day < ? AND day IN (SELECT day FROM visit_days)").bind(addDays(today, -RAW_DAYS)),
    db.prepare("DELETE FROM visit_stats WHERE day < ?").bind(addDays(today, -KEEP_DAYS)),
    db.prepare("DELETE FROM visit_days WHERE day < ?").bind(addDays(today, -KEEP_DAYS)),
  ]);
  rolled = today;
}
let rolled = "";
async function ensureRolled(db: D1Database, today: string) {
  if (rolled === today) return;
  // Two index lookups: the latest day with raw views before today, and the latest day summed.
  const r = await db.prepare("SELECT (SELECT max(day) FROM page_views WHERE day < ?) AS raw, (SELECT max(day) FROM visit_days) AS done").bind(today).first<{ raw: string | null; done: string | null }>();
  if (r?.raw && (!r.done || r.raw > r.done)) await rollUp(db, today);
  else rolled = today;
}

const noContent = () => new Response(null, { status: 204, headers: { "cache-control": "no-store" } });

/* Sums of finished days never change, so a range's sums are kept here for the day. */
type Past = { days: Map<string, { visitors: number; views: number; signedIn: number; single: number }>; dims: Record<Dim, Map<string, { visitors: number; views: number }>> };
const ranges = new Map<string, Past>();

type Row = { key: string; visitors: number; views: number };

export const visitRoutes: Record<string, (c: Ctx) => Promise<Response>> = {
  "POST /api/visit": async (c) => {
    const b = await body(c.request);
    const path = cleanPath(b.path);
    const ua = c.request.headers.get("user-agent") ?? "";
    if (!path || path.startsWith("/admin") || !ua || BOTS.test(ua)) return noContent();
    const now = Date.now();
    if (tooFast(c.ip, now)) return noContent();

    const token = readCookie(c.request, SESSION_COOKIE);
    const day = pkDay(now);
    const [salt, session] = await Promise.all([daySalt(c.db, day, now), token ? sha256(token) : ""]);
    const visitor = (await sha256(`${salt}|${c.ip}|${ua}`)).slice(0, 16);
    const cf = (c.request as Request & { cf?: { country?: string; city?: string; region?: string } }).cf;
    const campaign = str(b.campaign, 60).toLowerCase().replace(/[^\w\-. ]/g, "");
    // One statement: the view is only written while this visitor is under the daily cap (read from the same index the
    // insert writes) and isn't staff. The session isn't touched, so a page view never extends a sign-in.
    await c.db
      .prepare(`INSERT INTO page_views (created_at, day, visitor, path, referrer, campaign, country, region, city, device, os, browser, signed_in, entry)
        SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, EXISTS (SELECT 1 FROM sessions WHERE id = ?13 AND expires_at > ?1), ?14
        WHERE (SELECT count(*) FROM page_views WHERE day = ?2 AND visitor = ?3) < ${PER_VISITOR_DAY}
          AND NOT EXISTS (SELECT 1 FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?13 AND s.expires_at > ?1 AND u.role != 'student')`)
      .bind(now, day, visitor, path, referrerHost(b.referrer, new URL(c.request.url).hostname), campaign,
        (cf?.country ?? "").slice(0, 2).toUpperCase(), place(cf?.region), place(cf?.city), device(ua), os(ua), browser(ua), session, b.entry ? 1 : 0)
      .run();
    return noContent();
  },

  "GET /api/admin/visitors": async (c) => {
    await requireRole(c, ["admin"]);
    const asked = Number(new URL(c.request.url).searchParams.get("days"));
    const days = RANGES.includes(asked) ? asked : 30;
    const now = Date.now();
    const today = pkDay(now);
    const from = addDays(today, -(days - 1));
    const prevFrom = addDays(today, -(2 * days - 1));
    await ensureRolled(c.db, today);

    // Finished days: from memory if this range was asked for today already, else a single read of the daily sums.
    const key = `${from}|${today}`;
    let past = ranges.get(key);
    const [raw, prevRaw, prevDays, signups] = await c.db.batch([
      c.db.prepare(`SELECT ${RAW_COLS} FROM page_views WHERE day = ?`).bind(today),
      // For "today", the comparison is yesterday up to this time of day.
      days === 1
        ? c.db.prepare("SELECT count(DISTINCT visitor) AS visitors, count(*) AS views FROM page_views WHERE day = ? AND created_at <= ?").bind(addDays(today, -1), now - DAY)
        : c.db.prepare("SELECT 0 AS visitors, 0 AS views"),
      c.db.prepare("SELECT coalesce(sum(visitors), 0) AS visitors, coalesce(sum(views), 0) AS views FROM visit_days WHERE day >= ? AND day < ?").bind(prevFrom, from),
      c.db.prepare("SELECT count(*) AS n FROM users WHERE created_at >= ? AND role = 'student'").bind(dayStart(from)),
    ]);
    if (!past) {
      const pastDays = new Map<string, { visitors: number; views: number; signedIn: number; single: number }>();
      const dims = Object.fromEntries(DIMS.map((d) => [d, new Map()])) as Past["dims"];
      if (days > 1) {
        const [dr, sr] = await c.db.batch([
          c.db.prepare("SELECT day, visitors, views, signed_in, single FROM visit_days WHERE day >= ? AND day < ?").bind(from, today),
          c.db.prepare("SELECT dim, key, sum(visitors) AS v, sum(views) AS n FROM visit_stats WHERE day >= ? AND day < ? GROUP BY dim, key").bind(from, today),
        ]);
        for (const r of dr!.results as { day: string; visitors: number; views: number; signed_in: number; single: number }[]) pastDays.set(r.day, { visitors: r.visitors, views: r.views, signedIn: r.signed_in, single: r.single });
        for (const r of sr!.results as { dim: Dim; key: string; v: number; n: number }[]) dims[r.dim]?.set(r.key, { visitors: r.v, views: r.n });
      }
      past = { days: pastDays, dims };
      if (ranges.size > 12) ranges.clear();
      ranges.set(key, past);
    }

    const rows = raw!.results as Raw[];
    const t = sumDay(rows);
    const nowVisitors = new Set(rows.filter((r) => r.created_at > now - 5 * 60 * 1000).map((r) => r.visitor)).size;

    const daily = Array.from({ length: days }, (_, i) => {
      const date = addDays(from, i);
      const r = date === today ? t : past!.days.get(date);
      return { date, visitors: r?.visitors ?? 0, views: r?.views ?? 0, signedIn: r?.signedIn ?? 0, single: r?.single ?? 0 };
    });
    const totals = daily.reduce((a, d) => ({ visitors: a.visitors + d.visitors, views: a.views + d.views, signedIn: a.signedIn + d.signedIn, single: a.single + d.single }), { visitors: 0, views: 0, signedIn: 0, single: 0 });

    const lists = {} as Record<Dim, Row[]>;
    for (const d of DIMS) {
      const m = new Map(past.dims[d]);
      for (const [k, e] of t.dims[d]) {
        const o = m.get(k);
        m.set(k, o ? { visitors: o.visitors + e.visitors, views: o.views + e.views } : e);
      }
      const all = [...m].map(([key, e]) => ({ key, ...e }));
      lists[d] = d === "hour" ? all.sort((a, b) => a.key.localeCompare(b.key)) : all.sort((a, b) => b.visitors - a.visitors || b.views - a.views).slice(0, LIST);
    }
    // Today, hour by hour, for the "Today" chart.
    const hourly = days === 1 ? Array.from({ length: 24 }, (_, h) => {
      const k = String(h).padStart(2, "0");
      const e = t.dims.hour.get(k);
      return { hour: k, visitors: e?.visitors ?? 0, views: e?.views ?? 0 };
    }) : null;

    const prev = (days === 1 ? prevRaw : prevDays)!.results[0] as { visitors: number; views: number };
    return json({
      days,
      now: nowVisitors,
      totals: { ...totals, signups: (signups!.results[0] as { n: number }).n },
      previous: { visitors: prev.visitors ?? 0, views: prev.views ?? 0 },
      daily,
      hourly,
      lists,
    });
  },
};

/* Today and this week, for the overview page: today's raw views plus six finished days' sums. */
export async function visitSummary(db: D1Database) {
  const now = Date.now();
  const today = pkDay(now);
  await ensureRolled(db, today).catch((e) => console.error("visit roll-up", e));
  const [t, w] = await db.batch([
    db.prepare("SELECT count(DISTINCT visitor) AS today, count(DISTINCT CASE WHEN created_at > ?2 THEN visitor END) AS now FROM page_views WHERE day = ?1").bind(today, now - 5 * 60 * 1000),
    db.prepare("SELECT coalesce(sum(visitors), 0) AS week FROM visit_days WHERE day >= ? AND day < ?").bind(addDays(today, -6), today),
  ]);
  const a = t!.results[0] as { today: number; now: number } | undefined;
  const b = w!.results[0] as { week: number } | undefined;
  if (!a || !b) throw fail(500, "server_error", "Couldn't read visits.");
  return { today: a.today ?? 0, week: (b.week ?? 0) + (a.today ?? 0), now: a.now ?? 0 };
}
