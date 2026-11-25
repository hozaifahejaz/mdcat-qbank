# Experiments site

experiments.markhorprep.com is a full copy of the site for trying things before they go to markhorprep.com.

## How it works

- It is the `experiments` branch. Every push to it deploys to experiments.markhorprep.com (the branch's Pages
  preview, also at experiments.mdcat-qbank.pages.dev). Only `main` deploys to markhorprep.com.
- It has its own database, `mdcat-qbank-experiments` (wrangler.toml `[env.preview]`). Every deploy that is not `main`
  uses it, so nothing tried there can touch real accounts, answers or questions.
- Database changes in `migrations/` on the experiments branch go to the experiments database when it deploys.
- To refresh it with the live questions and accounts: Actions > "Copy live database to experiments" > Run workflow,
  branch `experiments`. It replaces the whole experiments database, then applies the branch's own migrations. Everyone
  signs in again there afterwards.
- Search engines are kept out: robots.txt disallows everything, there is no sitemap, every page sends
  `X-Robots-Tag: noindex`, IndexNow only runs for `main`, and canonical tags point at markhorprep.com.
- Sign-in cookies belong to each address on its own, so signing in or out on one site does not affect the other.

## Trying something, then shipping it

1. Bring experiments up to date: merge `main` into `experiments` (or reset it to `main` if nothing there is worth keeping).
2. Make the change on a branch from `experiments` and merge it into `experiments`, or push straight to it.
3. Check it on experiments.markhorprep.com.
4. When it's right, open a pull request from the same change into `main` (or from `experiments` into `main` if
   everything on experiments should ship). Merging deploys it to markhorprep.com.

## Settings that live in the Cloudflare dashboard

Workers & Pages > mdcat-qbank > Settings > Variables and Secrets has separate Production and Preview lists. The
experiments site reads the Preview list. Features whose settings are missing there are simply off:

- Google sign-in: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and in Google Cloud Console add the redirect URI
  `https://experiments.markhorprep.com/api/auth/oauth/google/callback` and the origin
  `https://experiments.markhorprep.com`.
- Email (confirmation, password reset): `CF_ACCOUNT_ID`, `CF_EMAIL_API_TOKEN`, `EMAIL_FROM`.

Optional lock: Zero Trust > Access > Applications > Add a self-hosted application for experiments.markhorprep.com,
with a policy that allows only the owner's email, so nobody else can open it.
