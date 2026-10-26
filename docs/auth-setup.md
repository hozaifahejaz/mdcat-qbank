# Accounts and sign-in: how it works and how to switch it on

## How it works

Sign-in uses **Supabase Auth**. The site stays a static export on Cloudflare Pages: the browser talks to Supabase directly, so there is no server of our own to run, and Supabase also gives us the Postgres database the plan calls for.

| Method | How |
| --- | --- |
| Email and password | Sign up sends a confirmation link. "Forgot password" emails a reset link. |
| Phone | A 6-digit code by SMS. Pakistani numbers can be typed any usual way (`0300 1234567`, `300-1234567`, `+92 300...`) and are saved as `+923001234567`. Other countries work if typed with `+` and the country code. The same screen signs in an existing number or creates an account. |
| Google | OAuth through Supabase. |
| Apple | OAuth through Supabase. Apple doesn't share the name on the web, so those students fill it in on the account page. |

Pages: `/signup`, `/signin`, `/forgot-password`, `/reset-password`, `/auth/callback` (where Google, Apple and email links land) and `/account` (name, sign-in methods, devices, sign out). After signing in, students go to `/dashboard`, or to the page in `?next=`.

### The device rule

From the plan: two registered devices per account, one active at a time, swaps limited. It's enforced in Postgres (`supabase/migrations/20261026000000_auth_and_devices.sql`), not in the browser:

- Each browser makes a random device id once and keeps it.
- Signing in calls `claim_device`. A known device becomes the active one; a new device is registered if the account has a free slot. A third device gets the "This account already has two devices" screen and must remove one first.
- Becoming active **locks the other device**. Pages wrapped in `components/auth/DeviceGate.tsx` check in every 30 seconds and whenever the tab comes back into view. A locked device sees "Your account is active on another device. Use it here?"; tapping it takes the account back.
- Removing a device is allowed **once every 30 days** (`remove_device`). After that it's a support request.
- Every takeover is logged in `device_events`, so "more than 6 takeovers in a day" can become a strike later. `claim_device` already returns `takeovers_today`.
- `public.is_active_session()` is true only for the account's active session. When the question tables are added, their read policies should require it, so a locked device can't fetch questions even if someone tampers with the page.
- Signing out frees the active slot, so the other device can carry on without a prompt.

Any signed-in page just wraps its content: `<DeviceGate>...</DeviceGate>`. It also sends signed-out visitors to `/signin?next=<that page>`.

## What you need to set up

Do these in order. Steps 1 to 3 are enough for email sign-in; add the others when you're ready. Wherever a step asks for the site address, use `https://mdcat-qbank.pages.dev` until there's a real domain, then add the domain too.

### 1. Supabase project (free to start)

1. At [supabase.com/dashboard](https://supabase.com/dashboard), create a new project named `mdcat-qbank` in your organisation. Pick the **Mumbai (ap-south-1)** region, which is closest to Pakistan, and save the database password somewhere safe. The free plan allows 2 active projects and you already have `closer` running, so you may need to pause it or upgrade.
2. Open **SQL Editor**, paste the whole of `supabase/migrations/20261026000000_auth_and_devices.sql`, and run it.
3. **Authentication > URL Configuration**:
   - Site URL: `https://mdcat-qbank.pages.dev`
   - Redirect URLs: add `https://mdcat-qbank.pages.dev/**`, `https://*.mdcat-qbank.pages.dev/**` (branch previews) and `http://localhost:3000/**`.
4. **Project Settings > API Keys**: copy the **Project URL** and the **publishable key** (`sb_publishable_...`). Never use the secret key in this repo.

### 2. Put the keys in the build

The two values are public by design (row level security protects the data), so they go in as GitHub **variables**, not secrets.

- GitHub repo > Settings > Secrets and variables > Actions > **Variables** tab:
  - `NEXT_PUBLIC_SUPABASE_URL` = the Project URL
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = the publishable key
- For local work, copy `.env.example` to `.env.local` and fill in the same two.

Until these exist, the sign-in pages show "Accounts open soon" instead of breaking.

### 3. Email (needed before real students sign up)

Supabase's built-in email only delivers to your own team's addresses and is heavily rate limited, so connect a real sender. The plan already picks Resend:

1. At [resend.com](https://resend.com), add and verify your sending domain (needs the real domain; until then you can only test).
2. Create an API key.
3. Supabase > **Authentication > Emails > SMTP Settings**: enable custom SMTP. Host `smtp.resend.com`, port `465`, user `resend`, password = the API key, sender e.g. `no-reply@yourdomain`.
4. In **Authentication > Emails > Templates**, change the links so they work even when a student opens the email on a different phone or browser:
   - **Confirm signup**: `<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email">Confirm your email</a>`
   - **Reset password**: `<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery">Choose a new password</a>`

### 4. Google

1. [Google Cloud console](https://console.cloud.google.com): create a project, then **Google Auth Platform > Branding**: app name, support email, your logo, and the site domain under authorised domains. Set the audience to **External** and publish the app.
2. **Clients > Create client > Web application**.
   - Authorised JavaScript origins: `https://mdcat-qbank.pages.dev`
   - Authorised redirect URIs: `https://<your-project-ref>.supabase.co/auth/v1/callback` (shown on Supabase's Google provider page).
3. Supabase > **Authentication > Sign In / Providers > Google**: enable it and paste the Client ID and Client secret.

### 5. Phone (SMS codes)

Supabase sends the code through an SMS provider you connect. The simplest that reliably reaches Pakistani networks is **Twilio Verify**:

1. Create a [Twilio](https://www.twilio.com) account and upgrade it from trial (trial accounts only text numbers you've verified).
2. In **Verify > Services**, create a service. Under Geo permissions, allow **Pakistan** and any other countries you want; leave the rest off to limit fraud.
3. Supabase > **Authentication > Sign In / Providers > Phone**: enable it, choose **Twilio Verify**, and paste the Account SID, Auth Token and Verify Service SID.
4. Check Twilio's current per-message price for Pakistan before launch; international SMS to Pakistan costs noticeably more than a local gateway. Once you have volume, a Pakistani SMS gateway can be plugged in later through Supabase's "Send SMS" auth hook without touching the site.

Turn on the bot check in step 7 before phone sign-in goes public: bots requesting codes to random numbers ("SMS pumping") is the main way an SMS bill gets run up.

### 6. Apple

Needs an [Apple Developer](https://developer.apple.com) membership (USD 99 a year).

1. **Certificates, Identifiers & Profiles > Identifiers**: create an **App ID** with "Sign in with Apple" ticked.
2. Create a **Services ID** (for example `com.yourbrand.web`) and enable Sign in with Apple on it. Configure it with domain `<your-project-ref>.supabase.co` and return URL `https://<your-project-ref>.supabase.co/auth/v1/callback`.
3. **Keys**: create a key with Sign in with Apple enabled and download the `.p8` file (you can only download it once).
4. Supabase > **Authentication > Sign In / Providers > Apple**: enable it, enter the Services ID as the client ID, and generate the secret from your Team ID, Key ID and the `.p8` file using the tool on that page.
5. **Calendar reminder**: Apple's secret expires every 6 months. Generate a new one and paste it in before then, or Apple sign-in stops working.

### 7. Bot check with Cloudflare Turnstile (recommended)

1. Cloudflare dashboard > **Turnstile** > add a widget for `mdcat-qbank.pages.dev` (and `localhost` for testing). Copy the site key and secret key.
2. Add the GitHub variable `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = the site key, and let the site redeploy.
3. Then Supabase > **Authentication > Attack Protection**: enable CAPTCHA, provider Turnstile, paste the **secret** key.

Do step 3 only after the site is showing the widget, or every sign-in will fail with a captcha error.

### 8. Sensible settings

- **Authentication > Sign In / Providers > Email**: keep "Confirm email" on, and set the minimum password length to 8.
- **Authentication > Rate Limits**: lower the SMS limit to what you expect (for example 30 an hour at launch) so a mistake can't cost much.

## Running it locally

```sh
cp .env.example .env.local   # fill in the Supabase URL and publishable key
npm run dev
```

Google and Apple need `http://localhost:3000/**` in the Supabase redirect URLs (step 1.3).
