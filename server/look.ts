import { type Look, defaultLook, isLook, looks } from "../lib/look";
import { body, fail, json } from "./http";
import { requireRole } from "./admin";

/* Which look the public pages use (lib/look.ts). Kept in site_cache under one key, so no new table is needed, and
   remembered in each server copy for half a minute, so the landing page costs at most one database read per copy per
   half minute. After a switch, other copies catch up within that half minute. */
const KEY = "setting:look";
const KEEP_MS = 30_000;
let kept: { look: Look; at: number } | null = null;

export async function currentLook(db: D1Database): Promise<Look> {
  if (kept && Date.now() - kept.at < KEEP_MS) return kept.look;
  let look = defaultLook;
  try {
    const row = await db.prepare("SELECT value FROM site_cache WHERE key = ?").bind(KEY).first<{ value: string }>();
    const v = row ? JSON.parse(row.value) : null;
    if (isLook(v)) look = v;
  } catch {
    // A database hiccup shouldn't take the landing page down: show the default look.
  }
  kept = { look, at: Date.now() };
  return look;
}

/* The look for this page view: the saved one, unless the address asks for one to preview (?look=classic). */
export async function pageLook(db: D1Database, request: Request): Promise<Look> {
  const asked = new URL(request.url).searchParams.get("look");
  return isLook(asked) ? asked : currentLook(db);
}

/* Marks the page with its look (<html data-look="...">), which the sign-in styles key on (app/auth.css). The page is
   rewritten as it streams, so this adds no wait. */
export function markLook(res: Response, look: Look): Response {
  if (!(res.headers.get("content-type") ?? "").includes("text/html")) return res;
  const out = new HTMLRewriter().on("html", { element: (e) => { e.setAttribute("data-look", look); } }).transform(res);
  const headers = new Headers(out.headers);
  // The same address now has two possible bodies, so the browser must not reuse one for the other.
  headers.delete("etag");
  headers.set("cache-control", "no-cache");
  return new Response(out.body, { status: out.status, statusText: out.statusText, headers });
}

type Ctx = { db: D1Database; request: Request };
export const lookRoutes: Record<string, (c: Ctx) => Promise<Response>> = {
  "GET /api/admin/look": async (c) => {
    await requireRole(c, ["admin"]);
    kept = null;
    return json({ look: await currentLook(c.db), looks });
  },
  "POST /api/admin/look": async (c) => {
    const me = await requireRole(c, ["admin"]);
    const b = await body(c.request);
    if (!isLook(b.look)) throw fail(400, "bad_look", "Pick a theme.");
    const before = await currentLook(c.db);
    await c.db.batch([
      c.db.prepare("INSERT INTO site_cache (key, v, value, at) VALUES (?1, 0, ?2, ?3) ON CONFLICT (key) DO UPDATE SET value = ?2, at = ?3").bind(KEY, JSON.stringify(b.look), Date.now()),
      c.db.prepare("INSERT INTO admin_log (actor_id, action, target, detail, created_at) VALUES (?, 'site.look', 'site', ?, ?)").bind(me.id, `${before} → ${b.look}`, Date.now()),
    ]);
    kept = { look: b.look, at: Date.now() };
    return json({ look: b.look });
  },
};

/* A public page that comes in two looks, served as it is but marked with the look (functions/signin.ts and friends). */
export const servePage = async ({ request, env, next }: { request: Request; env: { DB: D1Database }; next: () => Promise<Response> }) => {
  if (request.method !== "GET" && request.method !== "HEAD") return next();
  const [look, res] = await Promise.all([pageLook(env.DB, request), next()]);
  return markLook(res, look);
};
