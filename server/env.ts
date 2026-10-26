/* Bindings and settings for the API. DB comes from wrangler.toml; everything else is a secret or variable
   set on the Cloudflare Pages project (docs/auth-setup.md). A feature whose settings are missing is simply
   switched off, and /api/auth/config tells the pages which ones are on. */
export interface Env {
  DB: D1Database;

  /* Local development only (.dev.vars): prints SMS codes and emails to the terminal instead of sending them. */
  DEV_MODE?: string;

  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;

  APPLE_SERVICES_ID?: string;
  APPLE_TEAM_ID?: string;
  APPLE_KEY_ID?: string;
  APPLE_PRIVATE_KEY?: string; // contents of the .p8 file

  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_VERIFY_SERVICE_SID?: string;

  CF_ACCOUNT_ID?: string;
  CF_EMAIL_API_TOKEN?: string; // Cloudflare API token with "Email Sending: Edit"
  EMAIL_FROM?: string; // e.g. "MDCAT Pilot <no-reply@yourdomain.com>"

  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
}

export const isDev = (env: Env) => env.DEV_MODE === "1";
