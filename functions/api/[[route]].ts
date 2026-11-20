import type { Env } from "../../server/env";
import { handle } from "../../server/routes";

/* Every /api/* request: sign-in, sessions and the device rule (server/routes.ts). */
export const onRequest: PagesFunction<Env> = ({ request, env }) => handle(request, env);
