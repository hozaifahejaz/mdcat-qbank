import type { Env } from "../../server/env";
import { handle } from "../../server/routes";

/* Every /api/* request: sign-in, sessions and the device rule (server/routes.ts). */
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  // Temporary, preview only: how far each region is from where this code runs.
  if (new URL(request.url).pathname === "/api/net-check" && !new URL(request.url).hostname.endsWith("markhorprep.com")) {
    const regions = ["ap-northeast-1", "ap-southeast-1", "ap-south-1", "me-central-1", "me-south-1", "eu-central-1", "eu-west-3", "eu-south-1", "us-east-1", "ap-east-1"];
    const out: Record<string, unknown> = {};
    const d: number[] = [];
    for (let i = 0; i < 4; i++) { const a = Date.now(); await env.DB.prepare("SELECT 1").first(); d.push(Date.now() - a); }
    out.d1 = d;
    for (const k of ["T_WEUR", "T_EEUR"] as const) {
      const db = (env as unknown as Record<string, D1Database>)[k];
      const t: number[] = [];
      for (let i = 0; i < 6; i++) { const a = Date.now(); await db.prepare("SELECT 1").first(); t.push(Date.now() - a); }
      out[k] = t;
    }
    out.colo = (request as unknown as { cf?: { colo?: string } }).cf?.colo;
    return new Response(JSON.stringify(out), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
  }
  return handle(request, env);
};
