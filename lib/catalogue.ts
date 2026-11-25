/* Every exam Markhor Prep plans to cover, grouped into tracks (the multi-exam plan). Used by the landing page experiment
   at /experiments/4. "live" means students can practice it today; everything else is coming soon. 9th and 10th class
   are left out on purpose.

   pattern: the paper as its body last published it (count, time, parts), only where we have read it. Recheck each
   against the official notice before a bank for that exam goes live. */

export type TrackId = "medical" | "engineering" | "doctors" | "law" | "postgrad" | "jobs" | "cambridge" | "abroad";

export type Pattern = { summary: string; parts: { name: string; n: number }[] };
export type Exam = { id: string; name: string; body: string; live?: boolean; href?: string; pattern?: Pattern };
export type Sample = { tag: string; stem: string; options: string[]; answer: number; why: string; wrong: Record<number, string> };
export type Track = { id: TrackId; name: string; who: string; colour: string; exams: Exam[]; sample: Sample };

export const tracks: Track[] = [
  {
    id: "medical", name: "Pre-medical", who: "FSc pre-medical and MDCAT", colour: "#11804a",
    exams: [
      {
        id: "mdcat", name: "PMDC MDCAT", body: "PMDC", live: true, href: "/mdcat",
        pattern: { summary: "180 MCQs · 3 hours", parts: [{ name: "Biology", n: 81 }, { name: "Chemistry", n: 45 }, { name: "Physics", n: 36 }, { name: "English", n: 9 }, { name: "Reasoning", n: 9 }] },
      },
      { id: "nums", name: "NUMS MDCAT", body: "NUMS", live: true, href: "/nums-mdcat" },
      { id: "aku", name: "AKU test", body: "Aga Khan University", live: true, href: "/aku-test" },
      { id: "fsc-med", name: "FSc Pre-Medical", body: "Part 1 and Part 2", live: true },
      { id: "etea-med", name: "ETEA medical", body: "ETEA, Khyber Pakhtunkhwa" },
    ],
    sample: {
      tag: "Biology · Excretion",
      stem: "Which part of the human nephron is impermeable to water?",
      options: ["Proximal convoluted tubule", "Descending limb of the loop of Henle", "Ascending limb of the loop of Henle", "Collecting duct"],
      answer: 2,
      why: "The ascending limb pumps Na⁺ and Cl⁻ out into the medulla, but water cannot follow. The filtrate gets more dilute as it rises, and the salty medulla later lets the collecting duct concentrate urine.",
      wrong: {
        0: "The proximal tubule reabsorbs about two-thirds of the filtered water by osmosis.",
        1: "The descending limb lets water out into the salty medulla, so the filtrate gets more concentrated on the way down.",
        3: "The collecting duct's permeability is set by ADH; with ADH it reabsorbs water.",
      },
    },
  },
  {
    id: "engineering", name: "Pre-engineering", who: "FSc pre-engineering and ICS", colour: "#b06a00",
    exams: [
      {
        id: "ecat", name: "ECAT", body: "UET", href: "/ecat",
        pattern: { summary: "100 MCQs · 100 minutes", parts: [{ name: "Maths", n: 30 }, { name: "Physics", n: 30 }, { name: "Chemistry or CS", n: 30 }, { name: "English", n: 10 }] },
      },
      { id: "net", name: "NUST NET", body: "NUST" },
      // GIKI publishes its subjects (Maths, Physics, English) but not the number of questions or the time.
      { id: "giki", name: "GIKI test", body: "GIKI" },
      { id: "fast", name: "FAST test", body: "FAST-NU" },
      {
        // PIEAS written test pattern for BS programmes (entry test 2025), pre-engineering paper; no negative marking.
        id: "pieas", name: "PIEAS test", body: "PIEAS",
        pattern: { summary: "100 MCQs · 3 hours", parts: [{ name: "Maths", n: 30 }, { name: "Physics", n: 30 }, { name: "Chemistry", n: 30 }, { name: "English", n: 10 }] },
      },
      { id: "etea-eng", name: "ETEA engineering", body: "ETEA, Khyber Pakhtunkhwa" },
      { id: "fsc-eng", name: "FSc Pre-Engineering", body: "Part 1 and Part 2" },
    ],
    sample: {
      tag: "Maths · Differentiation",
      stem: "For f(x) = x³ − 3x, at which value of x does f have a local minimum?",
      options: ["x = −1", "x = 1", "x = 0", "x = 3"],
      answer: 1,
      why: "f′(x) = 3x² − 3 = 0 gives x = ±1. f″(x) = 6x, so f″(1) = 6 > 0: a minimum at x = 1.",
      wrong: {
        0: "At x = −1, f″(−1) = −6 < 0, so that point is a local maximum.",
        2: "f′(0) = −3, not zero, so x = 0 is not a turning point.",
        3: "f′(3) = 24, not zero, so x = 3 is not a turning point.",
      },
    },
  },
  {
    id: "doctors", name: "Doctors", who: "Residency and licensing", colour: "#2f55f0",
    exams: [
      { id: "fcps1", name: "FCPS Part 1", body: "CPSP", href: "/fcps" },
      {
        id: "jcat", name: "JCAT", body: "MS, MD and MDS induction",
        pattern: { summary: "100 MCQs + 25 clinical slides", parts: [{ name: "Basic sciences", n: 50 }, { name: "Medicine, surgery or dentistry", n: 35 }, { name: "Specialty", n: 15 }] },
      },
      { id: "mdms", name: "MD and MS tests", body: "Medical universities" },
      { id: "nle", name: "NLE", body: "PMDC" },
    ],
    sample: {
      tag: "Anatomy · Upper limb",
      stem: "Which nerve supplies the deltoid muscle?",
      options: ["Radial nerve", "Axillary nerve", "Musculocutaneous nerve", "Suprascapular nerve"],
      answer: 1,
      why: "The axillary nerve (C5, C6) winds round the surgical neck of the humerus and supplies the deltoid and teres minor. A fracture there can weaken shoulder abduction.",
      wrong: {
        0: "The radial nerve supplies the triceps and the extensors of the forearm.",
        2: "The musculocutaneous nerve supplies the biceps, brachialis and coracobrachialis.",
        3: "The suprascapular nerve supplies the supraspinatus and infraspinatus.",
      },
    },
  },
  {
    id: "law", name: "Law and university", who: "LLB and undergraduate admissions", colour: "#8a63ff",
    exams: [
      {
        id: "lat", name: "LAT", body: "HEC",
        pattern: { summary: "75 MCQs + essay · 140 minutes", parts: [{ name: "English", n: 20 }, { name: "General knowledge", n: 20 }, { name: "Islamic Studies", n: 10 }, { name: "Pakistan Studies", n: 10 }, { name: "Urdu", n: 10 }, { name: "Maths", n: 5 }] },
      },
      { id: "usat", name: "USAT", body: "HEC" },
      { id: "nat", name: "NAT", body: "NTS" },
    ],
    sample: {
      tag: "English · Vocabulary",
      stem: "Choose the word closest in meaning to CANDID.",
      options: ["Secretive", "Frank", "Careful", "Polite"],
      answer: 1,
      why: "Candid means open and honest in what you say, which is what frank means.",
      wrong: {
        0: "Secretive is close to the opposite of candid.",
        2: "Careful means taking care; a candid answer may not be careful at all.",
        3: "Polite is about manners, not honesty.",
      },
    },
  },
  {
    id: "postgrad", name: "Postgraduate", who: "MS, MPhil and PhD admissions", colour: "#0f9fb5",
    exams: [
      {
        id: "hat", name: "HAT", body: "HEC",
        pattern: { summary: "100 MCQs · 2 hours", parts: [{ name: "Verbal", n: 30 }, { name: "Analytical", n: 30 }, { name: "Quantitative", n: 40 }] },
      },
      { id: "gat", name: "GAT General", body: "NTS" },
    ],
    sample: {
      tag: "Quantitative · Percentages",
      stem: "A price rises by 20% and then falls by 20%. How does the final price compare with the start?",
      options: ["The same", "4% lower", "4% higher", "2% lower"],
      answer: 1,
      why: "1.20 × 0.80 = 0.96, so the final price is 96% of the start: 4% lower. The fall is taken on the bigger, raised price.",
      wrong: {
        0: "The two changes don't cancel, because 20% of the raised price is more than 20% of the start.",
        2: "The final price is below the start, not above it.",
        3: "2% would need the fall to be about 18.3%, not 20%.",
      },
    },
  },
  {
    id: "jobs", name: "Jobs and forces", who: "Civil service and armed forces", colour: "#c9a400",
    exams: [
      {
        id: "css", name: "CSS MPT", body: "FPSC",
        pattern: { summary: "200 MCQs · about 3 hours", parts: [{ name: "English", n: 50 }, { name: "General ability", n: 60 }, { name: "General knowledge", n: 50 }, { name: "Islamiat", n: 20 }, { name: "Urdu", n: 20 }] },
      },
      { id: "pms", name: "PMS", body: "Provincial commissions" },
      { id: "fpsc", name: "FPSC tests", body: "FPSC" },
      { id: "ppsc", name: "PPSC tests", body: "PPSC" },
      { id: "issb", name: "ISSB", body: "Inter Services Selection Board" },
      { id: "forces", name: "Army, Navy, PAF tests", body: "Initial tests" },
    ],
    sample: {
      tag: "General knowledge · Literature",
      stem: "Who wrote the poem Tarana-e-Hind, which begins “Saare jahan se accha”?",
      options: ["Faiz Ahmed Faiz", "Mirza Ghalib", "Allama Muhammad Iqbal", "Altaf Hussain Hali"],
      answer: 2,
      why: "Allama Iqbal wrote Tarana-e-Hind in 1904. It was published in his collection Bang-e-Dra.",
      wrong: {
        0: "Faiz Ahmed Faiz was born in 1911, after the poem was written.",
        1: "Mirza Ghalib died in 1869.",
        3: "Hali is known for the Musaddas-e-Hali, not this poem.",
      },
    },
  },
  {
    id: "cambridge", name: "O and A Levels", who: "Cambridge students", colour: "#d4483b",
    exams: [
      { id: "olevel", name: "O Level", body: "Cambridge" },
      { id: "alevel", name: "AS and A Level", body: "Cambridge" },
    ],
    sample: {
      tag: "Physics · Motion",
      stem: "A car accelerates uniformly from rest to 20 m/s in 5 s. How far does it travel?",
      options: ["50 m", "100 m", "20 m", "4 m"],
      answer: 0,
      why: "With uniform acceleration, distance = average speed × time = (0 + 20)/2 × 5 = 50 m.",
      wrong: {
        1: "100 m uses the final speed for the whole 5 s instead of the average speed.",
        2: "20 is the final speed in m/s, not a distance.",
        3: "4 is the acceleration in m/s², not a distance.",
      },
    },
  },
  {
    id: "abroad", name: "Study abroad", who: "SAT and IELTS", colour: "#3a7d6b",
    exams: [
      { id: "sat", name: "SAT", body: "College Board" },
      { id: "ielts", name: "IELTS", body: "British Council and IDP" },
    ],
    sample: {
      tag: "Maths · Linear equations",
      stem: "If 3x + 5 = 20, what is the value of 2x − 1?",
      options: ["9", "10", "4", "15"],
      answer: 0,
      why: "3x = 15, so x = 5, and 2x − 1 = 10 − 1 = 9.",
      wrong: {
        1: "10 is 2x; the question asks for 2x − 1.",
        2: "4 is x − 1, not 2x − 1.",
        3: "15 is 3x.",
      },
    },
  },
];

export const allExams = tracks.flatMap((t) => t.exams.map((e) => ({ ...e, track: t })));
export const examCount = allExams.length;
export const liveCount = allExams.filter((e) => e.live).length;
