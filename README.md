# Examwise

A paid, practice-first question bank for Pakistani medical college entrance exams, starting with PMDC MDCAT and expanding to NUMS, AKU and private university tests.

Students buy a season pass per exam and get chapter-wise practice, timed tests, full-length mocks that match the real paper, past papers, and analytics that show which chapters to fix next.

## Status

Planning, with the landing page built. See [docs/plan.md](docs/plan.md) for the full business and build plan.

## Running locally

Needs Node 20.9 or newer.

```sh
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck
```

- `app/page.tsx` and `app/landing.css`: the landing page. Its look matches residencypilot.com (same tokens in `app/globals.css`).
- `components/SampleQuestion.tsx`: the "Try a question" card, with sample questions in `lib/sample-questions.ts`.
- `lib/site.ts`: the brand name (Examwise), prices and the paper's subject split.

## Hosting

Cloudflare Pages, project `mdcat-qbank`. The build is a static export to `out/`. The GitHub Actions workflow in `.github/workflows/deploy.yml` builds and deploys on every push: `main` goes to production, and any other branch gets a preview at `<branch>.mdcat-qbank.pages.dev`.

It needs two repository secrets (Settings > Secrets and variables > Actions):

- `CLOUDFLARE_API_TOKEN`: a token with Cloudflare Pages Edit permission
- `CLOUDFLARE_ACCOUNT_ID`

## Exams

| Exam | Format | Phase |
| --- | --- | --- |
| PMDC MDCAT | 180 MCQs, 3 hours: Biology 81, Chemistry 45, Physics 36, English 9, Logical Reasoning 9 | 1 |
| NUMS MDCAT | Paper-based MCQs, syllabus close to PMDC | 2 |
| AKU admission test | 100 MCQs, 2 hours: Biology, Chemistry, Physics, Science Reasoning, Maths Reasoning | 3 |

## Planned stack

- Next.js (TypeScript) with Tailwind CSS
- PostgreSQL (Supabase or Neon)
- Supabase Auth or Auth.js (email, Google, phone OTP)
- KaTeX for formulas and equations
- Payments via a Pakistani aggregator (Safepay, PayFast or Simpaisa) for JazzCash, Easypaisa and cards
- Hosting on Cloudflare Pages
