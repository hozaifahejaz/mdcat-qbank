import type { Env } from "../server/env";
import { markLook, pageLook } from "../server/look";

/* The landing page. The new look is app/page.tsx; the classic look is kept at app/classic/page.tsx. Which one / shows
   is set in the admin panel (Admin > Site theme), and ?look=new or ?look=classic previews either one. */
export const onRequest: PagesFunction<Env> = async ({ request, env, next }) => {
  if (request.method !== "GET" && request.method !== "HEAD") return next();
  const look = await pageLook(env.DB, request);
  const res = look === "classic" ? await env.ASSETS.fetch(new URL("/classic", request.url)) : await next();
  return markLook(res, look);
};
