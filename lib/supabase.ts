import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* The one browser client. The site is a static export, so sign-in runs entirely in the browser against
   Supabase Auth, and the device rule lives in Postgres functions (supabase/migrations).
   Both values are public by design; row level security is what protects the data.
   Without them (a fresh clone, or before the Supabase project exists) this is null and the auth pages say so. */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase: SupabaseClient | null =
  url && key && typeof window !== "undefined"
    ? createClient(url, key, { auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
    : null;

export const authConfigured = Boolean(url && key);

/* Cloudflare Turnstile, to stop bots burning SMS and email credits. Optional: when the key is missing no
   captcha is shown, so leave Supabase's captcha setting off until both are set. */
export const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
