# MDCAT Question Bank

A paid, practice-first question bank for Pakistani medical college entrance exams, starting with PMDC MDCAT and expanding to NUMS, AKU and private university tests.

Students buy a season pass per exam and get chapter-wise practice, timed tests, full-length mocks that match the real paper, past papers, and analytics that show which chapters to fix next.

## Status

Planning. See [docs/plan.md](docs/plan.md) for the full business and build plan.

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
- Hosting on Vercel or Render
