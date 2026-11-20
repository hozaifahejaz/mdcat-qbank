import { site } from "@/lib/site";
import { outdated } from "@/lib/cache";

/* The browser side of the sign-in API (functions/api, server/). Cookies carry the session, so there is no
   token handling here: every call is a same-origin fetch. */
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public extra: Record<string, unknown> = {}) {
    super(message);
  }
}

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: init.method ?? (init.body === undefined ? "GET" : "POST"),
      credentials: "same-origin",
      headers: init.body === undefined ? undefined : { "content-type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new ApiError(0, "offline", "You seem to be offline. Check your connection and try again.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const e = (data as { error?: { code?: string; message?: string } } | null)?.error;
    throw new ApiError(res.status, e?.code ?? "server_error", e?.message ?? "Something went wrong. Please try again.", (e ?? {}) as Record<string, unknown>);
  }
  // Anything the student does (answering, finishing, bookmarking, settings) changes what pages show, so kept copies
  // are asked for again on the next look. The device check-in and page counts change nothing shown.
  if ((init.method ?? (init.body === undefined ? "GET" : "POST")) !== "GET" && !/^\/api\/(device\/|visit$)/.test(path)) outdated();
  return data as T;
}

export type AuthConfig = {
  email: boolean; emailVerification: boolean; passwordReset: boolean;
  phone: boolean; google: boolean; apple: boolean; turnstileSiteKey: string;
};

/* Which sign-in methods are switched on. Null when the API isn't there at all (for example under `next dev`,
   which serves pages only; use `npm run preview` for the full site). */
let configPromise: Promise<AuthConfig | null> | null = null;
export function getAuthConfig(): Promise<AuthConfig | null> {
  configPromise ??= api<AuthConfig>("/api/auth/config").then((c) => {
    try { localStorage.setItem(CONFIG_KEY, JSON.stringify(c)); } catch {}
    return c;
  }, () => null);
  return configPromise;
}

/* What to draw before the server answers: its last answer in this browser, otherwise the settings the site was
   built with (lib/site.ts). The form is on the page at once instead of after a round trip. */
const CONFIG_KEY = "auth:config";
export function lastAuthConfig(): AuthConfig {
  try {
    const c = JSON.parse(localStorage.getItem(CONFIG_KEY) ?? "null");
    if (c && typeof c.email === "boolean" && typeof c.turnstileSiteKey === "string") return { ...site.signIn, ...c };
  } catch {}
  return site.signIn;
}
