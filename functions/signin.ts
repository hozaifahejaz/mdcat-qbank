import type { Env } from "../server/env";
import { servePage } from "../server/look";

/* Marked with the site's look (server/look.ts). */
export const onRequest: PagesFunction<Env> = (ctx) => servePage(ctx);
