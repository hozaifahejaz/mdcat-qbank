# MDCAT Question Bank: Business & Build Plan

Last updated: October 2026

## Summary

Build a focused, practice-first question bank for PMDC MDCAT first, sold as a seasonal pass priced well below full coaching courses, then add NUMS and other university tests once the core bank and the analytics are working. The market is crowded with coaching brands selling live classes for Rs. 20,000 to 30,000+, so the opening is a cheaper, faster, better-explained MCQ tool that students use alongside their academy, not instead of it.

- **Launch exam:** PMDC MDCAT (180 MCQs, held once a year in August). It decides admission to almost every public and private medical college.
- **Positioning:** "The best place to practise MDCAT MCQs", with an explanation on every question, chapter-wise drills tied to the PMDC syllabus, and full-length timed mocks. No live classes at launch.
- **Content:** Original questions written and reviewed by paid subject experts, plus past-paper questions reconstructed and re-explained. No copying from academy books or competitor apps.
- **Price:** Around Rs. 2,500 to 4,000 for a season pass, with a free tier of a few hundred questions.
- **Payments:** A Pakistani payment aggregator covering JazzCash, Easypaisa and cards in one integration, with manual transfer as a launch fallback.
- **Timeline:** About 3 to 4 months to an MVP. Live by March 2027 for the August 2027 exam.
- **Budget:** Roughly Rs. 1 to 3.5 million for year one, mostly content writing.

## Exams covered

| Exam | Who sits it | Format | Subjects | 2026 date | Priority |
| --- | --- | --- | --- | --- | --- |
| PMDC MDCAT | Nearly all MBBS/BDS applicants | 180 MCQs, 3 hours, paper (OMR), no negative marking; 15% easy, 70% moderate, 15% hard | Biology 81, Chemistry 45, Physics 36, English 9, Logical Reasoning 9 | 16 Aug 2026 | Phase 1 |
| NUMS MDCAT | Army Medical College and NUMS-affiliated colleges | Paper-based MCQs; own table of specifications | Biology, Chemistry, Physics, English | 13 Sep 2026 | Phase 2 |
| AKU admission test | Aga Khan University MBBS | 100 MCQs, 2 hours, five sections of 20; -0.25 for wrong answers in science sections; interview after | Biology, Chemistry, Physics, Science Reasoning, Maths Reasoning | Usually July | Phase 3 |
| Private university tests (Shifa, Riphah, Ziauddin, etc.) | Specific private colleges | Varies | Varies | Varies | Later |

The PMDC syllabus for 2026 was unchanged from 2025 and is the same in every province. Tag every question by exam, subject, chapter and topic so it can be reused across exams.

## Competitors and positioning

| Player | Model | Price signal | Where we can beat them |
| --- | --- | --- | --- |
| Maqsad | Online live classes, MCQs, weekly mocks, app | Rs. 30,000 for the 2027 batch | Price; practice-only product for academy students |
| KIPS, STEP (PGC) | Physical academies, printed books, weekly tests | Course fees | Online, on-demand practice and analytics |
| Nearpeer, TopGrade, Premed | Recorded lectures plus practice MCQs | Course pricing | Explanation quality; exam-accurate mocks |
| Free apps and PDFs | Unverified, often copied MCQs | Free | Accuracy, explanations, coverage, analytics |

## Content sourcing, quality and copyright

Target 8,000 to 10,000 reviewed MCQs at launch (about 45% Biology), growing to 20,000+ by year two.

1. **Original questions by paid writers** (MBBS students, graduates, FSc teachers), paid per approved question, with a written work-for-hire agreement.
2. **Past papers** reconstructed in our own words with our own explanations.
3. **Textbook-aligned drills** with fresh wording; facts are free, a publisher's wording and diagrams are not.
4. **AI-assisted drafting, human-verified** before anything goes live.

Do not scrape or copy from KIPS, STEP, Maqsad or other apps and books.

Quality pipeline: writer drafts, second expert reviews, question goes live, then a "report this question" button and per-question accuracy stats flag bad items.

## Product features

| Feature | MVP? |
| --- | --- |
| Chapter and topic practice with instant explanations | Yes |
| Timed test mode | Yes |
| Full-length mocks (180 MCQs, real split and difficulty mix) | Yes |
| Past papers by year | Yes |
| Bookmarks and "my mistakes" | Yes |
| Progress dashboard by subject and chapter | Yes |
| Report a question | Yes |
| Mobile-first, lightweight pages | Yes |
| National leaderboard and live mock days | Phase 2 |
| Spaced repetition | Phase 2 |
| Android app with offline packs | Phase 2 |
| Urdu explanations | Phase 2 |
| AI tutor | Phase 3 |
| Teacher and academy accounts | Phase 3 |

## Anti-piracy and account sharing

A website cannot reliably detect screenshots, so enforcement rests on tracing leaks back to an account and stopping one paid account being shared.

### Devices: two registered, one active at a time

- Each account can register at most 2 devices. Logging in on a third device asks the student to remove one first. A removed device can be replaced at most once every 30 days; further swaps go through support.
- Only one device can use the account at any moment. Opening the app on device B shows "Your account is active on another device. Use it here?" Confirming makes B active, and device A is locked within about 30 seconds with the same prompt.
- A test in progress is saved when its device is locked and can be resumed on the active device.
- Frequent switching (for example, more than 6 takeovers in a day) signals sharing and counts as a strike.
- Implementation: each device gets a stored device ID at login. The server keeps the account's registered devices and its single active session. Clients check in every 30 seconds and on every question load; a check-in from a non-active device receives a "locked" response.

### Screenshots and leaks

| Where | What we do | Phase |
| --- | --- | --- |
| All platforms | Faint watermark on every question with the student's phone number or account ID | MVP |
| Website | Blur questions on focus loss; block copy, right-click and selection; detect PrintScreen on Windows | MVP |
| Website | Rate-limit question loading to prevent scraping | MVP |
| Android app | Block screenshots and screen recording (FLAG_SECURE) | Phase 2 |
| iPhone app | Hide questions during screen recording; strike on each screenshot | Phase 2 |

### Strike policy (in the Terms accepted at sign-up)

1. First strike: on-screen warning and email.
2. Second strike: account restricted for 7 days.
3. Third strike: account banned, no refund.

A leaked screenshot traced by its watermark is an immediate ban. Website detections (PrintScreen, focus loss) only show a warning, never a strike, because switching tabs looks the same.

## Pricing and payments

| Plan | Price (PKR) | Includes |
| --- | --- | --- |
| Free | 0 | ~300 questions, 1 mini-mock, basic stats |
| MDCAT Season Pass | 2,999 (early bird 1,999 before March) | Full bank, mocks, past papers, analytics until the exam |
| MDCAT + NUMS Bundle | 3,999 | Both exams |
| Monthly | 799 | Full access, monthly |
| Academy seats | ~1,200 per student, min. 30 | Bulk licences (Phase 3) |

- One aggregator (Safepay, PayFast or Simpaisa) for JazzCash, Easypaisa, cards and bank transfer.
- Expect roughly 2 to 3.5% fees per transaction (confirm with providers).
- Onboarding needs a registered business (sole proprietorship with NTN), business bank account, and terms, refund and privacy pages.
- Launch fallback: manual JazzCash, Easypaisa or Raast transfer with screenshot upload.

## Tech stack

| Layer | Choice |
| --- | --- |
| Web app | Next.js (React, TypeScript) |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Supabase or Neon) |
| Auth | Supabase Auth or Auth.js (email, Google, phone OTP) |
| Storage | Cloudflare R2 or Supabase Storage |
| Formulas | KaTeX |
| Hosting | Vercel or Render |
| Payments | Safepay / PayFast / Simpaisa |
| Email | Resend; local SMS provider for OTP |
| Product analytics | PostHog |
| Admin | Built-in admin screens with bulk CSV import |

Core data model: exams, subjects, chapters, topics, questions (stem, options, answer, explanation, difficulty, source, status), tests, attempts, answers, users, plans, payments.

## Roadmap

1. **Phase 0, setup (Nov 2026):** business registration and NTN, bank account, gateway application, name and domain, hire 3 to 5 writers, style guide.
2. **Phase 1, MVP build (Nov 2026 to Feb 2027):** auth, tagged question bank, practice and timed modes, mocks, past papers, dashboard, writer admin, payments; 8,000 reviewed MCQs.
   - Gate: 50 beta students for two weeks, under 1% valid error reports.
3. **Phase 2, launch season (Mar to Aug 2027):** public launch, weekly national mocks, Android app, Urdu explanations, NUMS mocks.
   - Gate: 1,000 paying students by the August exam.
4. **Phase 3, expand (Sep 2027 onward):** AKU and private tests, academy seats, AI tutor, 2028 season.

## Rough costs (year one)

| Item | Low (PKR) | High (PKR) |
| --- | --- | --- |
| Question writing (8,000 MCQs) | 400,000 | 800,000 |
| Expert review | 160,000 | 320,000 |
| Development | 0 | 1,200,000 |
| Hosting, database, email, domain | 60,000 | 250,000 |
| Business setup and legal | 30,000 | 80,000 |
| Marketing | 300,000 | 800,000 |
| **Total** | **~950,000** | **~3,450,000** |

Break-even at Rs. 2,999 per pass: about 330 paying students (low case) to 1,200 (high case).

## Risks

- Wrong answer keys: two-person review and the report button.
- Piracy: watermarks, device limits, steady new content.
- Seasonality: revenue concentrated March to August.
- PMDC format changes: topic-level tagging for quick re-mapping.
- Copyright complaints: plagiarism checks and originality clauses for writers.

## Open questions

- Build in-house or hire a developer?
- MDCAT only at launch, or MDCAT plus NUMS?
- Subject writers: existing contacts or recruit?
- Brand name and domain?
- Business registration, NTN and bank account status?
