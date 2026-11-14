/* The question banks a student can practise from: one per exam or textbook part. Each bank has its own subjects (for
   FSc, the textbooks of that part) and each subject its chapters, in book order.

   A question can sit in more than one bank. Its own subject and chapter (questions table) place it in the MDCAT bank;
   every other bank lists its questions in the bank_questions table with that bank's subject and chapter
   (migrations/0008_banks.sql). So a Biology question can be "Enzymes" in MDCAT and "Chapter 3: Enzymes" in FSc
   Part 1 at the same time. Which questions go in which bank gets filled in as questions are added. */
export type BankId = "fsc1" | "fsc2" | "mdcat" | "nums" | "aku";

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
    "Inheritance",
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
    "Spectroscopy",
    "Industrial chemistry",
    "Environmental chemistry",
    "Experimental techniques and lab safety",
  ],
  Physics: [
    "Vectors and equilibrium",
    "Force and motion",
    "Work and energy",
    "Circular motion",
    "Waves",
    "Thermodynamics",
    "Electrostatics",
    "Current electricity",
    "Modern and nuclear physics",
  ],
  English: [
    "Grammar and sentence correction",
    "Vocabulary in context",
  ],
  "Logical Reasoning": [
    "Critical thinking",
    "Patterns and sequences",
    "Cause and effect",
  ],
};

const mdcatSubject = (name: keyof typeof mdcatSyllabus): BankSubject => ({ name, chapters: mdcatSyllabus[name] });

/* FSc pre-medical textbooks (Punjab board order). Placeholder chapter lists until the bank's real map is decided. */
const fsc1: BankSubject[] = [
  {
    name: "Biology",
    chapters: [
      "Introduction", "Biological molecules", "Enzymes", "The cell", "Variety of life", "Kingdom Prokaryotae",
      "Kingdom Protoctista", "Kingdom Fungi", "Kingdom Plantae", "Kingdom Animalia", "Bioenergetics", "Nutrition",
      "Gaseous exchange", "Transport",
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
    chapters: [
      "Measurements", "Vectors and equilibrium", "Motion and force", "Work and energy", "Circular motion",
      "Fluid dynamics", "Oscillations", "Waves", "Physical optics", "Optical instruments", "Heat and thermodynamics",
    ],
  },
  { name: "English", chapters: ["Grammar", "Vocabulary", "Reading comprehension"] },
];

const fsc2: BankSubject[] = [
  {
    name: "Biology",
    chapters: [
      "Homeostasis", "Support and movement", "Coordination and control", "Reproduction", "Growth and development",
      "Chromosomes and DNA", "Cell cycle", "Variation and genetics", "Biotechnology", "Evolution", "Ecosystem",
      "Some major ecosystems", "Man and his environment",
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
    chapters: [
      "Electrostatics", "Current electricity", "Electromagnetism", "Electromagnetic induction", "Alternating current",
      "Physics of solids", "Electronics", "Dawn of modern physics", "Atomic spectra", "Nuclear physics",
    ],
  },
  { name: "English", chapters: ["Grammar", "Vocabulary", "Reading comprehension"] },
];

export const banks: Bank[] = [
  { id: "fsc1", name: "FSc Part 1", short: "FSc 1", blurb: "First-year textbooks", subjects: fsc1 },
  { id: "fsc2", name: "FSc Part 2", short: "FSc 2", blurb: "Second-year textbooks", subjects: fsc2 },
  {
    id: "mdcat", name: "MDCAT", short: "MDCAT", blurb: "PMDC syllabus",
    subjects: (["Biology", "Chemistry", "Physics", "English", "Logical Reasoning"] as const).map(mdcatSubject),
  },
  {
    id: "nums", name: "NUMS MDCAT", short: "NUMS", blurb: "NUMS entry test",
    subjects: (["Biology", "Chemistry", "Physics", "English"] as const).map(mdcatSubject),
  },
  {
    id: "aku", name: "AKU Admission Test", short: "AKU", blurb: "Aga Khan University",
    subjects: [
      ...(["Biology", "Chemistry", "Physics", "English"] as const).map(mdcatSubject),
      { name: "Mathematics", chapters: ["Algebra", "Functions and graphs", "Trigonometry", "Statistics"] },
    ],
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
};
export const toneOf = (subject: string) => subjectTone[subject] ?? { tone: "var(--bg)", solid: "var(--muted)" };
