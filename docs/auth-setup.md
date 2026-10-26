# Accounts and sign-in: how it works and how to switch it on

## How it works

Everything runs on Cloudflare. The site is still a static export on Cloudflare Pages. The sign-in API is a set of **Pages Functions** in the same project (`functions/api/[[route]].ts`, with the code in `server/`), and accounts live in a **D1** database called `mdcat-qbank` (`migrations/`). Nothing runs anywhere else, except for the two things Cloudflare can't do itself: delivering SMS and talking to Google and Apple.

| Method | How |
| --- | --- |
| Email and password | Works now, with no setup. For the time being sign-up signs straight in without a confirmation email, and there's no "Forgot password". Once email sending is switched on (step 3), sign-up sends a confirmation link and "Forgot password" appears. Passwords are stored as PBKDF2-SHA256 hashes. |
| Phone | A 6-digit code by SMS through Twilio Verify. Pakistani numbers can be typed any usual way (`0300 1234567`, `300-1234567`, `+92 300...`) and are saved as `+923001234567`. The same screen signs in an existing number or creates an account. |
| Google | Our API does the OAuth exchange with Google directly. |
| Apple | Same, with Apple. The API signs Apple's client secret itself on every sign-in, so there's no 6-month secret to renew by hand. |

A signed-in browser holds a random session id in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie. D1 stores only its SHA-256, so even a copy of the database can't be used to sign in. Sessions last 60 days and extend while in use.

Pages: `/signup`, `/signin`, `/forgot-password`, `/reset-password`, `/auth/callback` (where Google, Apple and email links land) and `/account` (name, sign-in methods, devices, sign out). After signing in, students go to `/dashboard`, or to the page in `?next=`. Every method shows on the pages from day one. Until its settings below are in place, a method says "coming soon" and points students to email, so you can switch them on one at a time.

### The device rule

From the plan: two registered devices per account, one active at a time, and swaps limited. It's enforced by the API (`server/devices.ts`), not the browser:

- Each browser makes a random device id once and keeps it.
- Signing in claims the device. A known device becomes the active one, and a new one is registered if there's a free slot. A third device gets the "This account already has two devices" screen and has to remove one first.
- Becoming active **locks the other device**. Pages wrapped in `components/auth/DeviceGate.tsx` check in every 30 seconds and whenever the tab comes back into view, and a locked device sees "Your account is active on another device. Use it here?"
- A device can be removed **once every 30 days**. Removing it also signs it out. After that, removals go through support.
- Every takeover is logged in `device_events`, so the plan's "more than 6 takeovers in a day" strike can be added later.
- Question and test endpoints added later should start with `requireActiveSession()` from `server/routes.ts`. That way a locked device gets no questions even if someone tampers with the page.

Any signed-in page only needs to wrap its content in `<DeviceGate>...</DeviceGate>`. It also sends signed-out visitors to `/signin?next=<that page>`.

### Abuse protection

Rate limits are stored in D1. Phone codes are limited to 1 a minute and 5 an hour per number, and 10 an hour per IP. Sign-in, sign-up and password reset have limits per IP and per email. Every POST must come from the site's own origin. Sign-up and "forgot password" give the same reply whether or not the email has an account. Cloudflare Turnstile (step 6) adds a bot check on top.

## What's already done

- I created the D1 database **`mdcat-qbank`** in your Cloudflare account (Asia-Pacific) and created its tables. `wrangler.toml` binds it to the Pages project as `DB`.
- On every push to `main`, the deploy workflow applies any new files in `migrations/`.

## What you need to set up

Every value below goes in the Cloudflare dashboard: **Workers & Pages > mdcat-qbank > Settings > Variables and Secrets > Add**, type **Secret**, environment **Production** (add them to **Preview** too if you want branch previews to work). Redeploy afterwards: re-run the latest GitHub Actions deploy, or push.

Wherever a step asks for the site address, use `https://mdcat-qbank.pages.dev` until there's a real domain, then add the domain as well.

### 1. Let the deploy run database migrations

Edit the `CLOUDFLARE_API_TOKEN` the GitHub workflow uses (Cloudflare dashboard > My Profile > API Tokens) and add the permission **Account > D1 > Edit**. Without it, the site still deploys but new tables won't be created.

### 2. Phone sign-in (Twilio Verify)

Cloudflare doesn't send SMS, so this goes through Twilio. Twilio Verify uses senders registered with Pakistani networks.

1. Create a [Twilio](https://www.twilio.com) account and upgrade it from trial (trial accounts can only text numbers you've verified).
2. **Verify > Services > Create**: name it after the site, code length 6.
3. Under **Verify > Geo permissions**, allow Pakistan and only the other countries you need. This limits SMS fraud.
4. Add the secrets `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` and `TWILIO_VERIFY_SERVICE_SID` (it starts with `VA`).
5. Check Twilio's current per-message price for Pakistan. If a local Pakistani gateway works out cheaper later, only `server/sms.ts` changes.

### 3. Email sign-in (Cloudflare Email Service)

Email Sending needs the **Workers Paid** plan (USD 5 a month) and a domain whose DNS is on Cloudflare. Until then email sign-up still works, just without the confirmation email and password reset.

When you switch this on, accounts made before then are unconfirmed. They'll be asked to confirm their email (with a link sent automatically) the next time they sign in. Also note that if someone later uses Google or Apple with the same email as an unconfirmed account, that account's password is removed, so nobody can hold on to an address that isn't theirs. They then sign in with Google or Apple instead.

1. Add your domain to Cloudflare, then go to **Compute > Email Service > Email Sending > Onboard Domain**.
2. Create an API token with **Account > Email Sending > Edit**.
3. Add the secrets `CF_ACCOUNT_ID` (your account id), `CF_EMAIL_API_TOKEN` (that token) and `EMAIL_FROM`, e.g. `MDCAT Pilot <no-reply@yourdomain.com>`.

### 4. Google

1. In the [Google Cloud console](https://console.cloud.google.com), create a project. Then go to **Google Auth Platform > Branding** and add the app name, support email, logo, and the site's domain under authorised domains. Set the audience to **External** and publish.
2. **Clients > Create client > Web application**:
   - Authorised JavaScript origins: `https://mdcat-qbank.pages.dev`
   - Authorised redirect URI: `https://mdcat-qbank.pages.dev/api/auth/oauth/google/callback`
3. Add the secrets `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### 5. Apple

You need an [Apple Developer](https://developer.apple.com) membership, which costs USD 99 a year.

1. **Certificates, Identifiers & Profiles > Identifiers**: create an **App ID** with "Sign in with Apple" ticked.
2. Create a **Services ID**, e.g. `com.yourbrand.web`, and enable Sign in with Apple on it. Configure it with the domain `mdcat-qbank.pages.dev` and the return URL `https://mdcat-qbank.pages.dev/api/auth/oauth/apple/callback`. Apple wants a real domain you control, so this step may have to wait for the custom domain.
3. **Keys**: create a key with Sign in with Apple enabled and download the `.p8` file. You can only download it once.
4. Add the secrets `APPLE_SERVICES_ID` (the Services ID), `APPLE_TEAM_ID`, `APPLE_KEY_ID` and `APPLE_PRIVATE_KEY` (paste the whole contents of the `.p8` file).

### 6. Bot check with Cloudflare Turnstile (recommended before phone sign-in goes public)

Bots requesting codes for random numbers ("SMS pumping") is the usual way an SMS bill gets run up.

1. Go to Cloudflare dashboard > **Turnstile** and add a widget for `mdcat-qbank.pages.dev`.
2. Add the secrets `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. The pages pick the widget up automatically.

## Running it locally

```sh
npm install
cp .dev.vars.example .dev.vars   # DEV_MODE=1 prints SMS codes and emails in the terminal
npm run preview                  # builds, sets up a local D1 database, serves http://localhost:8788
```

`npm run dev` still works for page design, but it doesn't run the API, so the sign-in pages show "Accounts open soon" there.
