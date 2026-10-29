import { randomToken, sha256 } from "./crypto";
import { fail, json, body, readCookie, str } from "./http";
import { rateLimit } from "./ratelimit";
import { SESSION_COOKIE } from "./session";
import { requireRole } from "./admin";

/* Site visits: the page beacon (/api/visit, from components/Track.tsx) and the admin Visitors page
   (/api/admin/visitors). Privacy-light on purpose: no IP, no cookie, no ID that lasts beyond the day
   (migrations/0003_visits.sql). Staff and the admin panel aren't counted, so the numbers are students. */

type Ctx = { db: D1Database; request: Request; ip: string };

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const PKT = 5 * HOUR;
const KEEP = 400 * DAY;
const RANGES = [7, 30, 90];

/* The Pakistan date of a moment, as YYYY-MM-DD. */
export const pkDay = (ms: number) => new Date(ms + PKT).toISOString().slice(0, 10);
const dayStart = (day: string) => Date.parse(`${day}T00:00:00+05:00`);

const BOTS = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|java\/|okhttp|go-http/i;

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
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
  if (/UCBrowser/i.test(ua)) return "UC Browser";
  if (/FBAN|FBAV|Instagram/i.test(ua)) return "Facebook or Instagram app";
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

/* Today's salt. A new day gets a new one and the old ones are deleted, along with views older than KEEP. */
let cached: { day: string; salt: string } | null = null;
async function daySalt(db: D1Database, day: string, now: number) {
  if (cached?.day === day) return cached.salt;
  const made = await db.prepare("INSERT OR IGNORE INTO visit_salts (day, salt) VALUES (?, ?)").bind(day, randomToken(16)).run();
  if (made.meta.changes) {
    await db.batch([
      db.prepare("DELETE FROM visit_salts WHERE day < ?").bind(day),
      db.prepare("DELETE FROM page_views WHERE created_at < ?").bind(now - KEEP),
    ]);
  }
  const row = await db.prepare("SELECT salt FROM visit_salts WHERE day = ?").bind(day).first<{ salt: string }>();
  cached = { day, salt: row!.salt };
  return cached.salt;
}

const noContent = () => new Response(null, { status: 204, headers: { "cache-control": "no-store" } });

export const visitRoutes: Record<string, (c: Ctx) => Promise<Response>> = {
  "POST /api/visit": async (c) => {
    const b = await body(c.request);
    const path = cleanPath(b.path);
    const ua = c.request.headers.get("user-agent") ?? "";
    if (!path || path.startsWith("/admin") || !ua || BOTS.test(ua)) return noContent();

    // Signed in? Staff are skipped. The session isn't touched, so a page view never extends a sign-in.
    let signedIn = 0;
    const token = readCookie(c.request, SESSION_COOKIE);
    if (token) {
      const now = Date.now();
      const u = await c.db
        .prepare("SELECT u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > ?")
        .bind(await sha256(token), now)
        .first<{ role: string }>();
      if (u && u.role !== "student") return noContent();
      signedIn = u ? 1 : 0;
    }

    const now = Date.now();
    const day = pkDay(now);
    const visitor = (await sha256(`${await daySalt(c.db, day, now)}|${c.ip}|${ua}`)).slice(0, 16);
    await rateLimit(c.db, `visit:${visitor}`, 300, HOUR);

    const cf = (c.request as Request & { cf?: { country?: string } }).cf;
    const campaign = str(b.campaign, 60).toLowerCase().replace(/[^\w\-. ]/g, "");
    await c.db
      .prepare(`INSERT INTO page_views (created_at, day, visitor, path, referrer, campaign, country, device, os, browser, signed_in)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(now, day, visitor, path, referrerHost(b.referrer, new URL(c.request.url).hostname), campaign,
        (cf?.country ?? "").slice(0, 2).toUpperCase(), device(ua), os(ua), browser(ua), signedIn)
      .run();
    return noContent();
  },

  "GET /api/admin/visitors": async (c) => {
    await requireRole(c, ["admin"]);
    const asked = Number(new URL(c.request.url).searchParams.get("days"));
    const days = RANGES.includes(asked) ? asked : 30;
    const now = Date.now();
    const from = pkDay(now - (days - 1) * DAY);
    const prevFrom = pkDay(now - (2 * days - 1) * DAY);

    // Visitors are counted once per day (the hash changes at midnight), so over a range it's visitor-days.
    const top = (col: string, extra = "") =>
      c.db.prepare(`SELECT ${col} AS k, count(DISTINCT day || visitor) AS v, count(*) AS n FROM page_views
        WHERE day >= ? ${extra} GROUP BY ${col} ORDER BY v DESC, n DESC LIMIT 10`).bind(from);

    const [series, prev, live, signups, pages, referrers, campaigns, countries, devices, oses, browsers] = await c.db.batch([
      c.db.prepare("SELECT day, count(DISTINCT visitor) AS v, count(*) AS n, count(DISTINCT CASE WHEN signed_in = 1 THEN visitor END) AS s FROM page_views WHERE day >= ? GROUP BY day").bind(from),
      c.db.prepare("SELECT day, count(DISTINCT visitor) AS v, count(*) AS n FROM page_views WHERE day >= ? AND day < ? GROUP BY day").bind(prevFrom, from),
      c.db.prepare("SELECT count(DISTINCT visitor) AS n FROM page_views WHERE created_at > ?").bind(now - 5 * 60 * 1000),
      c.db.prepare("SELECT count(*) AS n FROM users WHERE created_at >= ? AND role = 'student'").bind(dayStart(from)),
      top("path"),
      top("referrer"),
      top("campaign", "AND campaign != ''"),
      top("country"),
      top("device"),
      top("os"),
      top("browser"),
    ]);

    type Day = { day: string; v: number; n: number; s: number };
    const byDay = new Map((series!.results as Day[]).map((r) => [r.day, r]));
    const daily = Array.from({ length: days }, (_, i) => {
      const day = pkDay(now - (days - 1 - i) * DAY);
      const r = byDay.get(day);
      return { date: day, visitors: r?.v ?? 0, views: r?.n ?? 0, signedIn: r?.s ?? 0 };
    });
    const sum = (rows: { v: number; n: number }[]) => rows.reduce((a, r) => ({ visitors: a.visitors + r.v, views: a.views + r.n }), { visitors: 0, views: 0 });
    const list = (r: D1Result) => (r.results as { k: string; v: number; n: number }[]).map((x) => ({ key: x.k, visitors: x.v, views: x.n }));

    return json({
      days,
      now: (live!.results[0] as { n: number }).n,
      totals: { ...sum(series!.results as Day[]), signedIn: daily.reduce((a, d) => a + d.signedIn, 0), signups: (signups!.results[0] as { n: number }).n },
      previous: sum(prev!.results as Day[]),
      daily,
      pages: list(pages!), referrers: list(referrers!), campaigns: list(campaigns!), countries: list(countries!),
      devices: list(devices!), os: list(oses!), browsers: list(browsers!),
    });
  },
};

/* Today and this week, for the overview page. */
export async function visitSummary(db: D1Database) {
  const now = Date.now();
  const r = await db
    .prepare(`SELECT count(DISTINCT CASE WHEN day = ?1 THEN visitor END) AS today, count(DISTINCT day || visitor) AS week,
      count(DISTINCT CASE WHEN created_at > ?3 THEN visitor END) AS now FROM page_views WHERE day >= ?2`)
    .bind(pkDay(now), pkDay(now - 6 * DAY), now - 5 * 60 * 1000)
    .first<{ today: number; week: number; now: number }>();
  if (!r) throw fail(500, "server_error", "Couldn't read visits.");
  return { today: r.today ?? 0, week: r.week ?? 0, now: r.now ?? 0 };
}
