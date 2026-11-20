/* Bindings and settings for the API. DB comes from wrangler.toml; everything else is a secret or variable
   set on the Cloudflare Pages project (docs/auth-setup.md). A feature whose settings are missing is simply
   switched off, and /api/auth/config tells the pages which ones are on. */
export interface Env {
  DB: D1Database;
  /* The static site (out/), for pages served through a function (functions/index.ts). */
  ASSETS: Fetcher;

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
  EMAIL_FROM?: string; // e.g. "Markhor Prep <no-reply@yourdomain.com>"
  SUPPORT_EMAIL?: string; // where support replies come from and tickets are announced; defaults to lib/site.ts supportEmail

  /* Android app. APP_MIN_VERSION: older app versions are told to update (426). APP_LATEST_VERSION: the newest on Play.
     OFFLINE_ENABLED: "1" switches offline packs on. PLAY_CLOUD_PROJECT_NUMBER: the Google Cloud project linked to Play,
     which the app needs to ask for integrity tokens. */
  APP_MIN_VERSION?: string;
  APP_LATEST_VERSION?: string;
  OFFLINE_ENABLED?: string;
  PLAY_CLOUD_PROJECT_NUMBER?: string;

  /* Play Integrity (server/integrity.ts). Mode: "off" (default), "log" (note failures, let them through) or "enforce". */
  ANDROID_PACKAGE?: string;
  PLAY_INTEGRITY_MODE?: string;
  PLAY_INTEGRITY_SA_EMAIL?: string;
  PLAY_INTEGRITY_SA_KEY?: string; // the service account's private key (PEM)

  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
}

export const isDev = (env: Env) => env.DEV_MODE === "1";
