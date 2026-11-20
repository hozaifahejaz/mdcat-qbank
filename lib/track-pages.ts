import type { TrackId } from "@/lib/catalogue";

/* What landing experiment 4 says about each area (track) once a visitor picks it: the phrase in the headline, its
   subjects (for the account preview and the orbit), a full-mock line, its 1-month and 3-month prices and what a paid
   plan includes, and a few FAQ answers. Pre-medical 1 month is today's real monthly price; every 3-month price and
   every other area's price is a PROPOSED placeholder for the experiment. Set the real ones before launch. */

export type Subject = { name: string; n: number; c: string };
export type TrackPage = {
  phrase: string;                 // "I'm preparing for ___"
  subjects: Subject[];
  mock: { line: string; secs: number };
  price: { month: number; three: number };
  perks: string[];                // what a paid plan includes
  faqs: { q: string; a: string }[];
};

const G = "#11804a", B = "#2445ff", A = "#b06a00", V = "#8a63ff", Y = "#c9a400", T = "#0f9fb5", R = "#d4483b";

export const trackPages: Record<TrackId, TrackPage> = {
  medical: {
    phrase: "medical college",
    subjects: [{ name: "Biology", n: 27, c: G }, { name: "Chemistry", n: 15, c: B }, { name: "Physics", n: 12, c: A }, { name: "English", n: 3, c: V }, { name: "Logical Reasoning", n: 3, c: Y }],
    mock: { line: "180 MCQs in 3 hours, like the real paper.", secs: 3 * 3600 },
    price: { month: 799, three: 1999 },
    perks: ["PMDC MDCAT, NUMS and AKU banks", "FSc Part 1 and Part 2 chapters", "Full-length timed mocks", "Past papers", "My mistakes and bookmarks"],
    faqs: [
      { q: "Which tests does it cover?", a: "PMDC MDCAT, NUMS MDCAT and the AKU test, plus FSc pre-medical chapter practice. ETEA medical comes next." },
      { q: "Does it follow the current syllabus?", a: "Yes. Questions are filed under the chapters of the PMDC MDCAT syllabus, with separate chapter lists for NUMS and AKU." },
    ],
  },
  engineering: {
    phrase: "engineering university",
    subjects: [{ name: "Maths", n: 30, c: A }, { name: "Physics", n: 30, c: B }, { name: "Chemistry", n: 20, c: G }, { name: "Computer Science", n: 10, c: T }, { name: "English", n: 10, c: V }],
    mock: { line: "100 MCQs in 100 minutes, like ECAT.", secs: 100 * 60 },
    price: { month: 799, three: 1999 },
    perks: ["ECAT, NUST NET, GIKI, FAST and PIEAS banks", "FSc pre-engineering and ICS chapters", "Timed mocks for each test", "My mistakes and bookmarks"],
    faqs: [
      { q: "Which tests will it cover?", a: "ECAT, NUST NET, GIKI, FAST, PIEAS and ETEA engineering, plus FSc pre-engineering chapters. ICS students get Computer Science in place of Chemistry." },
      { q: "Is Maths included?", a: "Yes. Maths is the biggest part of most engineering tests, so it gets the most questions, chapter by chapter from FSc." },
    ],
  },
  doctors: {
    phrase: "residency",
    subjects: [{ name: "Anatomy", n: 20, c: R }, { name: "Physiology", n: 20, c: B }, { name: "Biochemistry", n: 10, c: G }, { name: "Pathology", n: 20, c: V }, { name: "Pharmacology", n: 15, c: A }, { name: "Clinical", n: 15, c: T }],
    mock: { line: "Full papers with the real count and clock.", secs: 3 * 3600 },
    price: { month: 1499, three: 3999 },
    perks: ["FCPS Part 1, JCAT, MD/MS and NLE banks", "Basic sciences by system", "Clinical cases for JCAT", "Timed mocks for each exam"],
    faqs: [
      { q: "Which exams will it cover?", a: "FCPS Part 1, JCAT for MS, MD and MDS induction, university MD and MS tests, and the NLE. They share one basic sciences bank." },
      { q: "Who checks the questions?", a: "Every question will be checked by doctors who have passed that exam before it goes live." },
    ],
  },
  law: {
    phrase: "law and university",
    subjects: [{ name: "English", n: 20, c: V }, { name: "General knowledge", n: 20, c: B }, { name: "Islamic Studies", n: 10, c: G }, { name: "Pakistan Studies", n: 10, c: A }, { name: "Urdu", n: 10, c: R }, { name: "Maths", n: 5, c: T }],
    mock: { line: "75 MCQs and an essay in 140 minutes, like LAT.", secs: 140 * 60 },
    price: { month: 599, three: 1499 },
    perks: ["LAT, USAT and NAT banks", "Essay prompts with model answers", "Timed mocks for each test", "My mistakes and bookmarks"],
    faqs: [
      { q: "Which tests will it cover?", a: "The HEC LAT for LLB, the HEC USAT and the NTS NAT for undergraduate admissions." },
      { q: "Does it help with the LAT essay?", a: "Yes. Essay prompts in the LAT style come with a model answer and what examiners look for." },
    ],
  },
  postgrad: {
    phrase: "a master's or PhD",
    subjects: [{ name: "Verbal", n: 30, c: V }, { name: "Analytical", n: 30, c: B }, { name: "Quantitative", n: 40, c: A }],
    mock: { line: "100 MCQs in 2 hours, like HAT.", secs: 2 * 3600 },
    price: { month: 599, three: 1499 },
    perks: ["HAT and GAT General banks", "Verbal, analytical and quantitative sets", "Timed mocks for each test", "My mistakes and bookmarks"],
    faqs: [
      { q: "Which tests will it cover?", a: "The HEC HAT and the NTS GAT General, the tests most universities ask for at MS, MPhil and PhD admission." },
      { q: "Does it cover subject GAT?", a: "Not at first. The general sections come first because every applicant sits them." },
    ],
  },
  jobs: {
    phrase: "a government job",
    subjects: [{ name: "English", n: 25, c: V }, { name: "General ability", n: 30, c: B }, { name: "General knowledge", n: 25, c: A }, { name: "Current affairs", n: 10, c: R }, { name: "Islamiat", n: 10, c: G }, { name: "Pakistan Affairs", n: 10, c: T }],
    mock: { line: "200 MCQs in about 3 hours, like the CSS MPT.", secs: 3 * 3600 },
    price: { month: 799, three: 2499 },
    perks: ["CSS MPT, PMS, FPSC and PPSC banks", "ISSB and forces initial tests", "Current affairs updated each month", "Timed mocks for each test"],
    faqs: [
      { q: "Which tests will it cover?", a: "The CSS MPT, provincial PMS, FPSC and PPSC tests, ISSB, and the Army, Navy and PAF initial tests." },
      { q: "How do you keep current affairs fresh?", a: "Current affairs questions are added every month and older ones are retired when they go out of date." },
    ],
  },
  cambridge: {
    phrase: "O and A Levels",
    subjects: [{ name: "Maths", n: 20, c: A }, { name: "Physics", n: 20, c: B }, { name: "Chemistry", n: 20, c: G }, { name: "Biology", n: 20, c: R }, { name: "Economics", n: 10, c: T }],
    mock: { line: "Topical papers timed like the real ones.", secs: 75 * 60 },
    price: { month: 899, three: 2499 },
    perks: ["O Level and AS and A Level subjects", "Questions by syllabus topic", "Timed multiple-choice papers", "My mistakes and bookmarks"],
    faqs: [
      { q: "Which subjects will it cover?", a: "The multiple-choice papers of O Level and AS and A Level sciences, Maths and Economics first." },
      { q: "Is it the Cambridge past papers?", a: "No. Every question is written for this bank in the same style, sorted by syllabus topic." },
    ],
  },
  abroad: {
    phrase: "studying abroad",
    subjects: [{ name: "SAT Reading and Writing", n: 27, c: V }, { name: "SAT Maths", n: 22, c: A }, { name: "IELTS Reading", n: 20, c: B }, { name: "IELTS Listening", n: 20, c: G }],
    mock: { line: "Full SAT sections with the real clock.", secs: 2 * 3600 + 14 * 60 },
    price: { month: 999, three: 2999 },
    perks: ["SAT Reading, Writing and Maths", "IELTS Reading and Listening", "Timed section tests", "My mistakes and bookmarks"],
    faqs: [
      { q: "Which tests will it cover?", a: "The digital SAT and IELTS Academic, starting with the parts you can practice as questions: SAT sections, IELTS Reading and Listening." },
      { q: "Is it the official test?", a: "No. It's practice in the same style. You still register and sit the official test with College Board or IELTS." },
    ],
  },
};
