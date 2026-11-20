import type { Env } from "../../server/env";
import { handle } from "../../server/routes";

/* Every /api/* request: sign-in, sessions and the device rule (server/routes.ts). */
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  // Temporary, preview only: how long a database trip takes from where this code runs.
  if (new URL(request.url).pathname === "/api/net-check" && !new URL(request.url).hostname.endsWith("markhorprep.com")) {
    const out: Record<string, unknown> = {};
    for (const k of ["DB", "T_EEUR", "T_WEUR", "T_APAC", "T_ENAM"]) {
      const db = (env as unknown as Record<string, D1Database>)[k];
      const t: number[] = [];
      let where: unknown = "";
      for (let i = 0; i < 5; i++) { const a = Date.now(); const r = await db.prepare("SELECT 1").all(); where = (r.meta as Record<string, unknown>).served_by_colo ?? (r.meta as Record<string, unknown>).served_by_region; t.push(Date.now() - a); }
      out[k] = t.slice(1).join(",") + " at " + where;
    }
    return new Response(JSON.stringify(out), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
  }
  return handle(request, env);
};
