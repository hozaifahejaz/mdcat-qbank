/* The question banks a student can practice from: one per exam or textbook part. Each bank has its own subjects (for
   FSc, the textbooks of that part) and each subject its chapters, in book order.

   A question can sit in more than one bank. Its own subject and chapter (questions table) place it in the MDCAT bank;
   every other bank lists its questions in the bank_questions table with that bank's subject and chapter
   (migrations/0008_banks.sql). So a Biology question can be "Enzymes" in MDCAT and "Chapter 3: Enzymes" in FSc
   Part 1 at the same time. Which questions go in which bank gets filled in as questions are added. */
export type BankId = "fsc1" | "fsc2" | "mdcat" | "nums" | "aku" | "lat";

export type BankSubject = { name: string; chapters: string[] };
export type Bank = { id: BankId; name: string; short: string; blurb: string; subjects: BankSubject[] };

/* The PMDC MDCAT syllabus, chapters per subject in syllabus order (lib/bank.ts re-exports it as syllabus). */
export const mdcatSyllabus = {
  Biology: [
    "Cell structure and function",
    "Biological molecules",
    "Enzymes",
    "Bioenergetics",
    "Acellular life",
    "Human physiology",
    "Homeostasis",
    "Coordination and control",
    "Reproduction",
    "Immunity",
    "Inheritance",
    "Chromosomes and DNA",
    "Biotechnology",
    "Evolution",
  ],
  Chemistry: [
    "Fundamental concepts",
    "Atomic structure",
    "Periodic table and periodicity",
    "States of matter",
    "Chemical equilibrium",
    "Reaction kinetics",
    "Thermochemistry",
    "Electrochemistry",
    "Chemical bonding",
    "s-block elements",
    "p-block elements",
    "Transition elements",
    "Fundamental principles of organic chemistry",
    "Organic chemistry",
    "Alkyl halides",
    "Alcohols and phenols",
    "Aldehydes, ketones and carboxylic acids",
    "Macromolecules",
    "Industrial chemistry",
  ],
  Physics: [
    "Vectors and equilibrium",
    "Force and motion",
    "Work and energy",
    "Circular motion",
    "Fluid dynamics",
    "Waves",
    "Thermodynamics",
    "Electrostatics",
    "Current electricity",
    "Electromagnetism",
    "Electromagnetic induction",
    "Alternating current",
    "Electronics",
    "Modern and nuclear physics",
  ],
  // One chapter per topic of the PMDC MDCAT 2025 English curriculum (reading, formal and lexical aspects, writing).
  English: [
    "Vocabulary in context",
    "Synonyms and antonyms",
    "Reading and figurative language",
    "Pronoun-antecedent agreement",
    "Tenses",
    "Infinitives and gerunds",
    "Adverbs",
    "Prepositions",
    "Transitional devices",
    "Punctuation",
    "Phrases, clauses and inversion",
    "Active and passive voice",
    "Direct and indirect speech",
    "Subject-verb agreement",
    "Sentence correction and spelling",
  ],
  "Logical Reasoning": [
    "Critical thinking",
    "Patterns and sequences",
    "Logical deductions",
    "Logical problems",
    "Course of action",
    "Cause and effect",
  ],
};

const mdcatSubject = (name: keyof typeof mdcatSyllabus): BankSubject => ({ name, chapters: mdcatSyllabus[name] });

/* FSc pre-medical textbooks (Punjab board order). Placeholder chapter lists until the bank's real map is decided. */
const fsc1: BankSubject[] = [
  {
    name: "Biology",
    // The PECTAA Biology 11 textbook (National Curriculum 2023), chapters 1 to 12 in book order.
    chapters: [
      "Biodiversity and classification", "Bacteria and viruses", "Cells and subcellular organelles", "Biomolecules",
      "Enzymes", "Bioenergetics", "Structural and computational biology", "Plant physiology", "Human digestive system",
      "Human respiratory system", "Human circulatory system", "Human skeletal and muscular systems",
    ],
  },
  {
    name: "Chemistry",
    // The PECTAA Chemistry 11 textbook (National Curriculum 2023), in book order.
    chapters: [
      "Periodic table and periodic properties", "Atomic structure", "Chemical bonding", "Stoichiometry",
      "States and phases of matter", "Chemical energetics", "Reaction kinetics", "Chemical equilibrium",
      "Acid-base chemistry", "Electrochemistry", "Hydrocarbons", "Nitrogen and sulfur", "Halogens", "Atmosphere",
      "Basic separation techniques", "Lab safety and practical skills",
    ],
  },
  {
    name: "Physics",
    // The PECTAA Physics 11 textbook (National Curriculum 2023), chapters 1 to 12 in book order.
    chapters: [
      "Measurements", "Force and motion", "Circular and rotational motion", "Work, energy and power",
      "Solids and fluid dynamics", "Heat and thermodynamics", "Waves and vibrations",
      "Physical optics and gravitational waves", "Electrostatics and current electricity", "Electromagnetism",
      "Special theory of relativity", "Nuclear and particle physics",
    ],
  },
  { name: "English", chapters: ["Grammar", "Vocabulary", "Reading comprehension"] },
];

const fsc2: BankSubject[] = [
  {
    name: "Biology",
    // The PECTAA Biology 12 textbook (National Curriculum 2023), chapters 13 to 25 in book order.
    chapters: [
      "Homeostasis", "Human urinary system", "Human nervous system", "Human endocrine system",
      "Human reproductive systems", "Inheritance", "Chromosome and DNA", "Biotechnology", "Immunity", "Biostatistics",
      "Pharmacology", "Evolution", "Ecology",
    ],
  },
  {
    name: "Chemistry",
    // The PECTAA Chemistry 12 textbook (National Curriculum 2023), chapters 17 to 33 in book order.
    chapters: [
      "Group 2 elements", "Transition metals", "Basics of organic chemistry", "Aromatic hydrocarbons",
      "Halogenoalkanes", "Hydroxy compounds", "Carbonyl compounds and carboxylic acids", "Organic nitrogen compounds",
      "Organic synthesis", "Polymers", "Biochemistry", "Chromatography", "Spectroscopy 1", "Spectroscopy 2 (NMR)",
      "Materials and energy", "Medicine, agriculture and industry", "Water",
    ],
  },
  {
    name: "Physics",
    // The PECTAA Physics 12 textbook (National Curriculum 2023), chapters 13 to 21 in book order.
    chapters: [
      "Thermal physics", "Simple harmonic motion", "Physical optics", "Electrostatics", "Alternating current",
      "Quantum physics", "Nuclear and particle physics", "Medical physics", "Space and environment",
    ],
  },
  { name: "English", chapters: ["Grammar", "Vocabulary", "Reading comprehension"] },
];

/* NUMS MDCAT 2026 Biology: its own 13 units, in the syllabus order. It has no excretion or homeostasis, chromosomes and
   DNA, biotechnology, biostatistics, pharmacology or ecology unit; the immune and lymphatic systems sit in "Life
   processes in animals and plants", and "Inheritance" is its variation and genetics unit. */
const numsBiology = [
  "Acellular life",
  "Bioenergetics",
  "Biological molecules",
  "Cell structure and function",
  "Coordination and control",
  "Diversity among animals",
  "Enzymes",
  "Evolution",
  "Life processes in animals and plants",
  "Prokaryotes",
  "Reproduction",
  "Support and movement",
  "Inheritance",
];

/* NUMS MDCAT 2026 Chemistry: its 19 units in syllabus order. Units that match an MDCAT chapter keep the MDCAT name;
   NUMS splits states of matter into gases, liquids and solids, aldehydes and ketones from carboxylic acids, and joins
   the s- and p-block. NUMS has no periodic table, spectroscopy, environmental, industrial or lab-techniques unit, and
   its macromolecules unit is proteins and enzymes only, so those questions are not in the NUMS bank
   (migrations/0023_chemistry_gaps.sql). */
const numsChemistry = [
  "Fundamental concepts",
  "Atomic structure",
  "Gases",
  "Liquids",
  "Solids",
  "Chemical equilibrium",
  "Reaction kinetics",
  "Thermochemistry",
  "Electrochemistry",
  "Chemical bonding",
  "s- and p-block elements",
  "Transition elements",
  "Fundamental principles of organic chemistry",
  "Hydrocarbons",
  "Alkyl halides",
  "Alcohols and phenols",
  "Aldehydes and ketones",
  "Carboxylic acids",
  "Macromolecules",
];

/* NUMS MDCAT 2026 Physics: its 13 units, named like the MDCAT chapters so a question keeps one name across banks
   (Dawn of modern physics, Atomic spectra and Nuclear physics share "Modern and nuclear physics"). NUMS has no
   vectors and equilibrium, fluid dynamics or alternating current unit. */
const numsPhysics = [
  "Force and motion",
  "Work and energy",
  "Circular motion",
  "Waves",
  "Thermodynamics",
  "Electrostatics",
  "Current electricity",
  "Electromagnetism",
  "Electromagnetic induction",
  "Electronics",
  "Modern and nuclear physics",
];

/* The AKU test's second section is Science and Mathematics Reasoning. Its science questions (a short account of an
   experiment, a table of results or a described circuit or mechanism, then a question on it) sit in this chapter of
   each science in the AKU bank, and fill the science half of that section in the AKU mock. */
export const REASONING = "Science reasoning";

/* AKU Mathematics. AKU publishes no maths syllabus: its MBBS test has a "Science and Mathematics Reasoning" section,
   and its only official maths material is the Mathematics Reasoning practice set on aku.edu. These chapters follow the
   question types in that set (quantity comparisons, data sufficiency, percentages, ratios and rates, data and box plots,
   probability and counting, sequences, geometry), plus HSSC algebra. Mathematics is only in the AKU bank. */
export const akuMathematics = [
  "Arithmetic and number",
  "Percentages",
  "Ratio, rates and proportion",
  "Algebra",
  "Geometry and measurement",
  "Data interpretation and statistics",
  "Probability and counting",
  "Sequences and patterns",
  "Quantitative comparison",
  "Data sufficiency",
];

/* HEC Law Admission Test (LAT), Part I: 75 MCQs in 100 minutes. English 20, General Knowledge 20, Pakistan Studies
   10, Islamiat 10, Urdu 10, Mathematics 5 (HEC ETC content weightages). Part II, an essay and a personal statement,
   is practiced on the writing screen, not in the bank. English and Mathematics are the questions already written
   (MDCAT English, AKU Mathematics, migrations/0070); the other four subjects are written for LAT and later shared with
   the government jobs tests. Chapters follow the topics LAT prep guides group the subjects into. */
export const latSyllabus = {
  English: mdcatSyllabus.English,
  "General Knowledge": [
    "Everyday science",
    "World geography and countries",
    "International organisations and treaties",
    "Law, courts and the Constitution",
    "Famous people, books and firsts",
    "Sports, awards and days",
    "Current affairs",
  ],
  "Pakistan Studies": [
    "Ancient and Muslim rule in South Asia",
    "After 1857 and the Pakistan Movement",
    "Pakistan since 1947",
    "Constitutions of Pakistan",
    "Geography of Pakistan",
    "Economy, resources and culture",
    "Foreign relations",
  ],
  Islamiat: [
    "The Quran",
    "Hadith and Sunnah",
    "Life of the Holy Prophet",
    "Beliefs and worship",
    "The Rightly Guided Caliphs",
    "Prophets and companions",
    "Islamic law and society",
  ],
  Urdu: ["Word meanings", "Synonyms and antonyms", "Idioms and proverbs", "Grammar", "Poets and writers"],
  // LAT's five maths questions are basic: the arithmetic, algebra, geometry and data chapters of AKU Mathematics.
  Mathematics: [
    "Arithmetic and number",
    "Percentages",
    "Ratio, rates and proportion",
    "Algebra",
    "Geometry and measurement",
    "Data interpretation and statistics",
  ],
};

export const banks: Bank[] = [
  { id: "fsc1", name: "FSc Part 1", short: "FSc 1", blurb: "First-year textbooks", subjects: fsc1 },
  { id: "fsc2", name: "FSc Part 2", short: "FSc 2", blurb: "Second-year textbooks", subjects: fsc2 },
  {
    id: "mdcat", name: "MDCAT", short: "MDCAT", blurb: "PMDC syllabus",
    subjects: (["Biology", "Chemistry", "Physics", "English", "Logical Reasoning"] as const).map(mdcatSubject),
  },
  {
    id: "nums", name: "NUMS MDCAT", short: "NUMS", blurb: "NUMS entry test",
    subjects: (["Biology", "Chemistry", "Physics", "English"] as const).map((s) =>
      s === "Physics" ? { name: "Physics", chapters: numsPhysics }
        : s === "Chemistry" ? { name: "Chemistry", chapters: numsChemistry }
        : s === "Biology" ? { name: "Biology", chapters: numsBiology }
        : mdcatSubject(s),
    ),
  },
  {
    id: "aku", name: "AKU Admission Test", short: "AKU", blurb: "Aga Khan University",
    subjects: [
      // AKU tests the HSSC curriculum, which also has ecosystems (not on the PMDC MDCAT syllabus).
      // It also has physical optics (light), which is not on the PMDC MDCAT syllabus either.
      // Its first-year Biology also covers classification, bacteria and plant physiology (Biology 11 chapters 1, 2 and 8).
      {
        name: "Biology",
        chapters: [...mdcatSyllabus.Biology, "Biodiversity and classification", "Bacteria", "Plant physiology", "Ecology", REASONING],
      },
      // Spectroscopy, environmental chemistry and lab techniques are off the PMDC syllabus but stay in AKU for now.
      {
        name: "Chemistry",
        chapters: [...mdcatSyllabus.Chemistry, "Spectroscopy", "Environmental chemistry", "Experimental techniques and lab safety", REASONING],
      },
      // AKU's Physics syllabus also has measurements and physics of solids (not on the PMDC MDCAT syllabus).
      { name: "Physics", chapters: ["Measurements", ...mdcatSyllabus.Physics, "Physics of solids", "Physical optics", REASONING] },
      // No English: the AKU MBBS test (2026-27) has only Science Achievement and Science & Mathematics Reasoning.
      { name: "Mathematics", chapters: akuMathematics },
    ],
  },
  {
    id: "lat", name: "LAT", short: "LAT", blurb: "HEC Law Admission Test",
    subjects: (Object.keys(latSyllabus) as (keyof typeof latSyllabus)[]).map((name) => ({ name, chapters: latSyllabus[name] })),
  },
];

export const bankIds = banks.map((b) => b.id);
export const bankById = (id: string | null | undefined) => banks.find((b) => b.id === id);

/* Colour per subject, matching the MDCAT paper split; subjects outside the paper get a neutral one. */
export const subjectTone: Record<string, { tone: string; solid: string }> = {
  Biology: { tone: "var(--mint)", solid: "var(--good)" },
  Chemistry: { tone: "var(--sky)", solid: "var(--blue)" },
  Physics: { tone: "var(--peach)", solid: "var(--warn)" },
  English: { tone: "var(--lilac)", solid: "#8a63ff" },
  "Logical Reasoning": { tone: "var(--lemon)", solid: "#c9a400" },
  Mathematics: { tone: "var(--sky)", solid: "#0f9fb5" },
  "General Knowledge": { tone: "var(--mint)", solid: "#1f9d6b" },
  "Pakistan Studies": { tone: "var(--peach)", solid: "#d9822b" },
  Islamiat: { tone: "var(--lemon)", solid: "#b08d00" },
  Urdu: { tone: "var(--lilac)", solid: "#a05acb" },
};
export const toneOf = (subject: string) => subjectTone[subject] ?? { tone: "var(--bg)", solid: "var(--muted)" };
