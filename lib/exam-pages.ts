/* The exam pages: one page per exam (/mdcat, /nums-mdcat, /aku-test, /ecat, /fcps/surgery ...), all drawn by the same
   template (components/exam/ExamPage.tsx) from the entries here. An exam page talks about its own exam only: its
   paper, a question to try, its subjects, its price and its FAQ. The one exception is the "Add to your plan" row in
   its pricing, which offers the other exams of its group (MDCAT, NUMS and AKU offer each other; FCPS, PGET and the
   MD/MS tests of one speciality offer each other).

   Paper facts are as each body last published them; `source` says where from. Prices: the medical exams use today's
   prices; every add-on price and every other exam's price is a placeholder until set. An exam with no price shows
   "Tell me when it opens" in place of its plans. */

import { bankById } from "@/lib/banks";
import { data, mdcat, nums, round, subjects as mdcatSubjects, type PublicQuestion } from "@/lib/public";
import { tracks } from "@/lib/catalogue";
import { site } from "@/lib/site";

export type Part = { name: string; n: number };
export type Topic = { name: string; line: string; href?: string; chapters?: string[] };
export type ExamPage = {
  id: string;                 // the exam id the sign-up ticks (lib/exams.ts), or a planned one
  area: string;               // the area id the welcome screen opens on
  path: string;
  name: string;               // "PMDC MDCAT"
  short: string;              // "MDCAT", shown beside the logo
  body: string;               // who sets it
  colour: string;
  open: boolean;              // false: coming soon, with the "tell me" box instead of pricing
  meta: { title: string; description: string };
  h1: string;
  lede: string;
  stats: [string, string][];
  paper: { summary: string; parts: Part[]; notes: string[]; source: string };
  sample: PublicQuestion;
  topics: Topic[];
  topicsHead?: string;
  price?: { month: number; three: number };
  perks: string[];
  group?: string;             // exams in one group offer each other as add-ons
  faqs: { q: string; a: string }[];
  /* The exam's own extra pages, for its header and footer. */
  links: { name: string; href: string }[];
};

/* What each extra exam in a group adds to a plan. Placeholder until the real prices are set. */
export const addOn = { month: 200, three: 500 };

const fromBank = (id: string): PublicQuestion => {
  for (const subj of Object.values(data.chapters)) for (const ch of Object.values(subj)) {
    const q = ch.samples.find((s) => s.id === id);
    if (q) return q;
  }
  throw new Error(`Sample ${id} is not in lib/public-data.json`);
};
const fromTrack = (track: string): PublicQuestion => {
  const s = tracks.find((t) => t.id === track)!.sample;
  return { id: `${track}-sample`, topic: s.tag, stem: s.stem, options: s.options, answer: s.answer, why: s.why, wrong: Object.fromEntries(Object.entries(s.wrong).map(([k, v]) => [k, v])) };
};
const bankTopics = (bank: string): Topic[] =>
  bankById(bank)!.subjects.map((s) => ({ name: s.name, line: `${s.chapters.length} ${s.chapters.length === 1 ? "chapter" : "chapters"}`, chapters: s.chapters }));

const medicalPerks = (bank: string) => [`The whole ${bank} bank, chapter by chapter`, "FSc Part 1 and Part 2 chapters", "Full-length timed mocks", "Past papers", "My mistakes and bookmarks"];
const medicalPrice = { month: 799, three: 1999 };
const free = "100 questions are free";

const mdcatLinks = [
  { name: "Syllabus", href: "/mdcat/syllabus" },
  { name: "2026 paper", href: "/mdcat/past-paper-2026" },
  { name: "Aggregate calculator", href: "/mdcat/aggregate-calculator" },
  { name: "Guides", href: "/guides" },
];

export const examPages: ExamPage[] = [
  {
    id: "mdcat", area: "medical", path: "/mdcat", name: "PMDC MDCAT", short: "MDCAT", body: "PMDC", colour: "#2445ff", open: true,
    meta: {
      title: "MDCAT MCQs 2027: Chapter-wise Practice for PMDC MDCAT",
      description: "Chapter-wise MDCAT MCQs for all 5 subjects on the PMDC syllabus, each with the answer and a full explanation. Free sample questions for every chapter.",
    },
    h1: "MDCAT MCQs with a full explanation on each",
    lede: `${round(data.banks.mdcat ?? 0)} original MCQs on the PMDC syllabus, chapter by chapter. ${free}, no card needed.`,
    stats: [[String(mdcat.mcqs), "MCQs in the paper"], [`${mdcat.hours} hours`, "to finish it"], ["5", "subjects"], ["None", "negative marking"]],
    paper: {
      summary: `${mdcat.mcqs} MCQs · ${mdcat.hours} hours`,
      parts: mdcatSubjects.map((s) => ({ name: s.name, n: s.count })),
      notes: ["One mark each, no negative marking", "About 15% easy, 70% moderate, 15% hard"],
      source: "PMDC's notice for MDCAT 2026",
    },
    sample: fromTrack("medical"),
    topics: mdcatSubjects.map((s) => ({ name: s.name, line: `${s.count} questions in the paper · ${s.chapters.length} chapters`, href: `/mdcat/${s.slug}` })),
    topicsHead: "Free MCQs for every chapter",
    price: medicalPrice, perks: medicalPerks("MDCAT"), group: "medical",
    faqs: [
      { q: "How many MCQs are in the MDCAT?", a: `The PMDC MDCAT has ${mdcat.mcqs} MCQs in ${mdcat.hours} hours: ${mdcatSubjects.map((s) => `${s.name} ${s.count}`).join(", ")}. Each question carries one mark and there is no negative marking.` },
      { q: "Does it follow the current syllabus?", a: "Yes. Every question is filed under a chapter of the PMDC MDCAT syllabus, and the chapter pages here list them in the same order." },
      { q: "Are these MCQs free?", a: "The sample questions on the chapter pages are free to read. A free account opens 100 questions in the app with timed practice, and a paid plan opens the whole bank." },
      { q: "Where do the questions come from?", a: "Every question is written for this bank from the PMDC syllabus and the FSc textbooks, then checked against the textbook. None are copied from other books or banks." },
      { q: "How do I pay?", a: site.payments ? "JazzCash, Easypaisa, card or bank transfer. Nothing is charged automatically." : "Payments open soon: JazzCash, Easypaisa, card or bank transfer. The free questions are open now." },
    ],
    links: mdcatLinks,
  },
  {
    id: "nums", area: "medical", path: "/nums-mdcat", name: "NUMS MDCAT", short: "NUMS", body: "NUMS", colour: "#b06a00", open: true,
    meta: {
      title: "NUMS MDCAT MCQs: Practice by NUMS Syllabus Chapter",
      description: `Practice for the NUMS MDCAT with ${round(data.banks.nums ?? 0)} MCQs sorted by the NUMS syllabus, each with a full explanation. Paper pattern: ${nums.mcqs} MCQs in ${nums.time}.`,
    },
    h1: "NUMS MDCAT MCQs, sorted by the NUMS syllabus",
    lede: `${round(data.banks.nums ?? 0)} MCQs arranged under NUMS's own chapter list, each with a full explanation. ${free}, no card needed.`,
    stats: [[String(nums.mcqs), "MCQs in the paper"], ["2 h 45 min", "to finish it"], ["4", "subjects"], ["None", "negative marking"]],
    paper: {
      summary: `${nums.mcqs} MCQs · ${nums.time}`,
      parts: nums.split.map(([name, n]) => ({ name, n })),
      notes: ["No negative marking", "A separate 50-item psychological test follows the paper"],
      source: `NUMS's announcement for its 2026 test, held on ${nums.held2026}`,
    },
    sample: fromBank("CHE-0060"),
    topics: bankTopics("nums"), topicsHead: "The NUMS syllabus",
    price: medicalPrice, perks: medicalPerks("NUMS"), group: "medical",
    faqs: [
      { q: "How many MCQs are in the NUMS MDCAT?", a: `The subject paper has ${nums.mcqs} MCQs in ${nums.time}: ${nums.split.map(([s, n]) => `${s} ${n}`).join(", ")}. A separate psychological test of 50 items follows it. There is no negative marking.` },
      { q: "Is the bank sorted by the NUMS syllabus?", a: "Yes. The NUMS bank uses NUMS's own list of units, so you can practice exactly what its syllabus names." },
      { q: "Does it cover the psychological test?", a: "No. The bank covers the subject paper. The psychological test has no right answers to practice." },
      { q: "Where do the questions come from?", a: "Every question is written for this bank from the syllabus and the FSc textbooks, then checked against the textbook." },
    ],
    links: [],
  },
  {
    id: "aku", area: "medical", path: "/aku-test", name: "AKU test", short: "AKU", body: "Aga Khan University", colour: "#8a63ff", open: true,
    meta: {
      title: "AKU Test Preparation: MCQs for the Aga Khan University MBBS Test",
      description: `Practice MCQs for the Aga Khan University admission test: ${round(data.banks.aku ?? 0)} questions in Biology, Chemistry, Physics and Mathematics reasoning, each with a full explanation.`,
    },
    h1: "AKU test preparation with MCQs and explanations",
    lede: `${round(data.banks.aku ?? 0)} MCQs for Aga Khan University's MBBS test, in science and mathematics reasoning, each with a full explanation. ${free}.`,
    stats: [["100", "MCQs in the paper"], ["2 hours", "to finish it"], ["2", "sections"], ["0.25", "off a wrong answer in section 1"]],
    paper: {
      summary: "100 MCQs · 2 hours",
      parts: [{ name: "Science Achievement", n: 40 }, { name: "Science and Mathematics Reasoning", n: 60 }],
      notes: ["Science Achievement takes 0.25 off a wrong answer", "Science and Mathematics Reasoning has no negative marking"],
      source: "AKU's MBBS admission information for 2026-27",
    },
    sample: fromBank("PHY-0575"),
    topics: bankTopics("aku"), topicsHead: "The AKU bank",
    price: medicalPrice, perks: medicalPerks("AKU"), group: "medical",
    faqs: [
      { q: "Is there negative marking in the AKU test?", a: "In AKU's admission information for 2026-27, the Science Achievement section deducts 0.25 marks for a wrong answer and the Science and Mathematics Reasoning section has no negative marking." },
      { q: "What should I practice for the AKU test?", a: "Science MCQs in Biology, Chemistry and Physics at FSc and A level standard, plus mathematics reasoning. The AKU bank here is arranged the same way." },
      { q: "Does AKU take another test's score?", a: "Aga Khan University runs its own admission test for MBBS. Check AKU's admission information for your year, since the university sets the rules and can change them." },
      { q: "Where do the questions come from?", a: "Every question is written for this bank from the syllabus and its textbooks, then checked against the textbook." },
    ],
    links: [],
  },
  {
    id: "ecat", area: "engineering", path: "/ecat", name: "ECAT", short: "ECAT", body: "UET", colour: "#b06a00", open: false,
    meta: {
      title: "ECAT MCQs: Practice for the UET Engineering Entry Test",
      description: "ECAT practice MCQs in Maths, Physics, Chemistry and English, chapter by chapter from FSc pre-engineering, each with a full explanation. Opening soon.",
    },
    h1: "ECAT MCQs with a full explanation on each",
    lede: "Maths, Physics, Chemistry and English for UET's engineering entry test, chapter by chapter from FSc pre-engineering. Opening soon.",
    stats: [["100", "MCQs in the paper"], ["100 min", "to finish it"], ["4", "subjects"], ["Maths", "the biggest part"]],
    paper: {
      summary: "100 MCQs · 100 minutes",
      parts: [{ name: "Maths", n: 30 }, { name: "Physics", n: 30 }, { name: "Chemistry or Computer Science", n: 30 }, { name: "English", n: 10 }],
      notes: ["Chemistry for pre-engineering, Computer Science for ICS"],
      source: "UET's ECAT pattern as last published",
    },
    sample: fromTrack("engineering"),
    topics: [
      { name: "Maths", line: "FSc Part 1 and Part 2, every chapter" },
      { name: "Physics", line: "FSc Part 1 and Part 2, every chapter" },
      { name: "Chemistry", line: "FSc Part 1 and Part 2, every chapter" },
      { name: "English", line: "Vocabulary, grammar and reading" },
    ],
    topicsHead: "Subjects",
    perks: [],
    faqs: [
      { q: "When does ECAT practice open?", a: "Soon. Leave your email above and we'll write once, when it opens." },
      { q: "Is Maths included?", a: "Yes. Maths is the biggest part of the ECAT, so it gets the most questions, chapter by chapter from FSc." },
      { q: "Can I practice for ICS?", a: "The ECAT paper for ICS students swaps Chemistry for Computer Science. Maths, Physics and English are the same." },
      { q: "Where do the questions come from?", a: "Every question is written for this bank from the FSc textbooks, then checked against the textbook." },
    ],
    links: [],
  },
  {
    id: "fcps1-surgery", area: "doctors", path: "/fcps/surgery", name: "FCPS Part 1 Surgery", short: "FCPS Surgery", body: "CPSP", colour: "#2f55f0", open: false,
    meta: {
      title: "FCPS Part 1 Surgery MCQs: Basic Sciences Practice",
      description: "Practice MCQs for FCPS Part 1 in Surgery and allied: anatomy, physiology, pathology and pharmacology, each with a full explanation. Opening soon.",
    },
    h1: "FCPS Part 1 Surgery MCQs, explained",
    lede: "Basic sciences for the Surgery and allied paper of FCPS Part 1, written for doctors, each with a full explanation. Opening soon.",
    stats: [["4", "sittings in 2027"], ["CPSP", "sets the paper"], ["Surgery", "and allied group"], ["Every", "answer explained"]],
    paper: {
      summary: "MCQ paper · Surgery and allied",
      parts: [],
      notes: ["2027 sittings: 5 January, 6 April, 6 July and 5 October", "Set by CPSP for each speciality group"],
      source: "CPSP's examination schedule for 2027",
    },
    sample: fromTrack("doctors"),
    topics: [
      { name: "Anatomy", line: "Gross anatomy, embryology and histology" },
      { name: "Physiology", line: "Systems, from cells to organs" },
      { name: "Pathology", line: "General and systemic" },
      { name: "Pharmacology", line: "Drugs and how they act" },
    ],
    topicsHead: "Subjects",
    perks: [], group: "surgery",
    faqs: [
      { q: "When does FCPS Surgery practice open?", a: "Soon. Leave your email above and we'll write once, when it opens." },
      { q: "Is it only for Surgery?", a: "This page is the Surgery and allied paper. Each FCPS Part 1 speciality group has its own paper and its own page." },
      { q: "Who writes the questions?", a: "Every question is written for this bank from standard basic science textbooks and checked against them." },
    ],
    links: [{ name: "All FCPS specialities", href: "/fcps" }],
  },
];

export const examPage = (id: string) => examPages.find((e) => e.id === id)!;
/* The other exams a page's pricing can add, in page order. */
export const groupOf = (e: ExamPage) => (e.group ? examPages.filter((x) => x.group === e.group && x.id !== e.id && x.open) : []);

/* FCPS Part 1 specialities: a page each, opening one by one. */
export const fcpsSpecialities = [
  { slug: "surgery", name: "Surgery and allied", page: true },
  { slug: "medicine", name: "Medicine and allied", page: false },
  { slug: "gynae", name: "Gynaecology and obstetrics", page: false },
  { slug: "paeds", name: "Paediatrics", page: false },
];
