/* The sample question bank behind the practice, mock, review and admin screens until the real bank is in D1.
   Every question follows the writing template in docs/plan.md: stem, four options, key, syllabus tag, difficulty,
   source chapter, and an explanation saying why the key is right and why each other option is wrong.
   Swap getQuestions() and friends for API calls when the backend lands; the screens only use the types. */
import type { Subject } from "@/lib/dashboard-data";
import { samples } from "@/lib/sample-questions";

export type Difficulty = "easy" | "moderate" | "hard";

export type Question = {
  id: string;
  subject: Subject;
  chapter: string;
  topic: string;
  difficulty: Difficulty;
  source: string;
  stem: string;
  options: string[];
  answer: number;
  why: string;
  wrong: Record<number, string>;
};

/* Chapters per subject, in syllabus order, with how many questions each holds in the full bank. */
export const syllabus: Record<Subject, { chapter: string; available: number }[]> = {
  Biology: [
    { chapter: "Cell structure and function", available: 180 },
    { chapter: "Biological molecules", available: 160 },
    { chapter: "Enzymes", available: 90 },
    { chapter: "Bioenergetics", available: 120 },
    { chapter: "Acellular life", available: 70 },
    { chapter: "Human physiology", available: 420 },
    { chapter: "Inheritance", available: 150 },
    { chapter: "Biotechnology", available: 80 },
    { chapter: "Evolution", available: 60 },
  ],
  Chemistry: [
    { chapter: "Fundamental concepts", available: 110 },
    { chapter: "Atomic structure", available: 100 },
    { chapter: "States of matter", available: 120 },
    { chapter: "Chemical equilibrium", available: 90 },
    { chapter: "Reaction kinetics", available: 70 },
    { chapter: "Thermochemistry", available: 70 },
    { chapter: "Electrochemistry", available: 80 },
    { chapter: "Chemical bonding", available: 110 },
    { chapter: "Organic chemistry", available: 300 },
  ],
  Physics: [
    { chapter: "Vectors and equilibrium", available: 80 },
    { chapter: "Force and motion", available: 120 },
    { chapter: "Work and energy", available: 80 },
    { chapter: "Circular motion", available: 70 },
    { chapter: "Waves", available: 90 },
    { chapter: "Thermodynamics", available: 80 },
    { chapter: "Electrostatics", available: 100 },
    { chapter: "Current electricity", available: 90 },
    { chapter: "Modern and nuclear physics", available: 110 },
  ],
  English: [
    { chapter: "Grammar and sentence correction", available: 200 },
    { chapter: "Vocabulary in context", available: 150 },
  ],
  "Logical Reasoning": [
    { chapter: "Critical thinking", available: 100 },
    { chapter: "Patterns and sequences", available: 80 },
    { chapter: "Cause and effect", available: 60 },
  ],
};

export const subjects = Object.keys(syllabus) as Subject[];

const fromLanding: Question[] = ([
  { id: "q-bio-101", chapter: "Human physiology", topic: "Excretion in humans", difficulty: "moderate", source: "FSc Biology Part II · Homeostasis" },
  { id: "q-chem-101", chapter: "Chemical bonding", topic: "Hybridisation", difficulty: "easy", source: "FSc Chemistry Part I · Chemical bonding" },
  { id: "q-phy-101", chapter: "Circular motion", topic: "Centripetal acceleration", difficulty: "easy", source: "FSc Physics Part I · Circular motion" },
] as const).map((meta, i) => {
  const s = samples[i]!;
  return { ...meta, subject: s.subject, stem: s.stem, options: s.options, answer: s.answer, why: s.why, wrong: s.wrong };
});

export const bank: Question[] = [
  ...fromLanding,
  {
    id: "q-bio-102",
    subject: "Biology",
    chapter: "Cell structure and function",
    topic: "Prokaryotic and eukaryotic cells",
    difficulty: "easy",
    source: "FSc Biology Part I · Cell structure and function",
    stem: "Which of these structures is found in eukaryotic cells but not in prokaryotic cells?",
    options: ["Ribosome", "Cell membrane", "Mitochondrion", "Cytoplasm"],
    answer: 2,
    why: "Mitochondria are membrane-bound organelles, and prokaryotes have no membrane-bound organelles. A bacterium carries out respiration on its cell membrane instead.",
    wrong: {
      0: "Prokaryotes do have ribosomes. Theirs are the smaller 70S type; eukaryotic cytoplasmic ribosomes are 80S.",
      1: "Every cell, prokaryotic or eukaryotic, is bounded by a cell membrane.",
      3: "Prokaryotes have cytoplasm. Their DNA lies in a region of it called the nucleoid, since there is no nucleus.",
    },
  },
  {
    id: "q-bio-103",
    subject: "Biology",
    chapter: "Enzymes",
    topic: "Enzyme inhibition",
    difficulty: "moderate",
    source: "FSc Biology Part I · Enzymes",
    stem: "Which statement about competitive inhibition of an enzyme is correct?",
    options: [
      "The inhibitor binds to a site other than the active site",
      "Its effect can be overcome by raising the substrate concentration",
      "It always destroys the enzyme permanently",
      "The inhibitor's shape is unlike that of the substrate",
    ],
    answer: 1,
    why: "A competitive inhibitor competes with the substrate for the active site. Adding more substrate makes it more likely that substrate, not inhibitor, occupies the site, so the inhibition can be overcome.",
    wrong: {
      0: "Binding away from the active site describes non-competitive inhibition, which changes the enzyme's shape and is not overcome by more substrate.",
      2: "Competitive inhibition is reversible: the inhibitor leaves the active site again. Permanent damage is irreversible inhibition.",
      3: "A competitive inhibitor resembles the substrate. That is why it fits the active site.",
    },
  },
  {
    id: "q-bio-104",
    subject: "Biology",
    chapter: "Bioenergetics",
    topic: "Glycolysis",
    difficulty: "moderate",
    source: "FSc Biology Part I · Bioenergetics",
    stem: "What is the net gain of ATP from glycolysis of one glucose molecule?",
    options: ["2 ATP", "4 ATP", "36 ATP", "38 ATP"],
    answer: 0,
    why: "Glycolysis makes 4 ATP by substrate-level phosphorylation but uses 2 ATP in its first steps to phosphorylate glucose and fructose-6-phosphate. The net gain is 4 − 2 = 2 ATP per glucose.",
    wrong: {
      1: "4 ATP is the gross yield. It ignores the 2 ATP invested at the start of glycolysis.",
      2: "36 ATP is a textbook estimate for complete aerobic respiration of glucose, not for glycolysis alone.",
      3: "38 ATP is the theoretical maximum for complete aerobic respiration, including the Krebs cycle and electron transport chain.",
    },
  },
  {
    id: "q-bio-105",
    subject: "Biology",
    chapter: "Inheritance",
    topic: "Sex-linked inheritance",
    difficulty: "moderate",
    source: "FSc Biology Part II · Inheritance",
    stem: "A colour-blind man marries a woman who is homozygous for normal colour vision. What proportion of their sons will be colour-blind?",
    options: ["0%", "25%", "50%", "100%"],
    answer: 0,
    why: "Red-green colour blindness is X-linked recessive. A son gets his X chromosome from his mother and his Y from his father. The mother here has only normal X chromosomes, so every son has normal vision. All the daughters will be carriers.",
    wrong: {
      1: "25% would be the chance for any child of a carrier mother and a normal father. Here the mother is not a carrier.",
      2: "50% of sons would be affected if the mother were a carrier. She is homozygous normal.",
      3: "100% of sons would be affected only if the mother were colour-blind herself. The father's X never passes to his sons.",
    },
  },
  {
    id: "q-bio-106",
    subject: "Biology",
    chapter: "Human physiology",
    topic: "Immunity",
    difficulty: "easy",
    source: "FSc Biology Part II · Immunity",
    stem: "Which cells secrete antibodies?",
    options: ["T lymphocytes", "Neutrophils", "Erythrocytes", "Plasma cells"],
    answer: 3,
    why: "When a B lymphocyte meets its antigen it divides and its daughter cells mature into plasma cells, which secrete large amounts of antibody. This is humoral immunity.",
    wrong: {
      0: "T lymphocytes carry out cell-mediated immunity. They kill infected cells or help other cells, but they do not secrete antibodies.",
      1: "Neutrophils are phagocytes. They engulf and digest microbes.",
      2: "Erythrocytes carry oxygen and have no role in making antibodies.",
    },
  },
  {
    id: "q-bio-107",
    subject: "Biology",
    chapter: "Acellular life",
    topic: "Viruses",
    difficulty: "moderate",
    source: "FSc Biology Part I · Acellular life",
    stem: "What is the genetic material of HIV?",
    options: ["Double-stranded DNA", "Single-stranded RNA", "Double-stranded RNA", "Single-stranded DNA"],
    answer: 1,
    why: "HIV is a retrovirus. Its genome is single-stranded RNA, and its enzyme reverse transcriptase copies that RNA into DNA, which is then inserted into the host cell's DNA.",
    wrong: {
      0: "Double-stranded DNA is the genome of viruses such as herpes viruses and the T4 bacteriophage.",
      2: "Double-stranded RNA is found in viruses such as rotavirus, not HIV.",
      3: "Single-stranded DNA is found in a few small viruses such as parvoviruses.",
    },
  },
  {
    id: "q-chem-102",
    subject: "Chemistry",
    chapter: "Fundamental concepts",
    topic: "The mole",
    difficulty: "easy",
    source: "FSc Chemistry Part I · Stoichiometry",
    stem: "How many moles of water are there in 9 g of water? (H = 1, O = 16)",
    options: ["0.5 mol", "1 mol", "2 mol", "9 mol"],
    answer: 0,
    why: "The molar mass of H₂O is 2(1) + 16 = 18 g/mol. Moles = mass ÷ molar mass = 9 ÷ 18 = 0.5 mol.",
    wrong: {
      1: "1 mol of water has a mass of 18 g, twice the mass given.",
      2: "2 comes from dividing 18 by 9, which is molar mass ÷ mass, the wrong way round.",
      3: "9 is the mass in grams, not the number of moles.",
    },
  },
  {
    id: "q-chem-103",
    subject: "Chemistry",
    chapter: "Chemical equilibrium",
    topic: "Le Chatelier's principle",
    difficulty: "moderate",
    source: "FSc Chemistry Part I · Chemical equilibrium",
    stem: "For N₂(g) + 3H₂(g) ⇌ 2NH₃(g), ΔH = −92 kJ/mol, which change increases the yield of ammonia at equilibrium?",
    options: ["Raising the temperature", "Adding an iron catalyst", "Removing some nitrogen", "Increasing the pressure"],
    answer: 3,
    why: "There are 4 moles of gas on the left and 2 on the right. Raising the pressure shifts the equilibrium towards fewer gas moles, to the right, so more ammonia forms.",
    wrong: {
      0: "The forward reaction is exothermic, so raising the temperature shifts the equilibrium to the left and lowers the yield.",
      1: "A catalyst speeds up the forward and backward reactions equally. Equilibrium is reached sooner but its position does not change.",
      2: "Removing a reactant shifts the equilibrium to the left, forming less ammonia.",
    },
  },
  {
    id: "q-chem-104",
    subject: "Chemistry",
    chapter: "Atomic structure",
    topic: "Quantum numbers",
    difficulty: "easy",
    source: "FSc Chemistry Part I · Atomic structure",
    stem: "What is the maximum number of electrons in a subshell with azimuthal quantum number l = 2?",
    options: ["2", "6", "10", "14"],
    answer: 2,
    why: "l = 2 is a d subshell. It has 2l + 1 = 5 orbitals, each holding 2 electrons, so 10 electrons in all.",
    wrong: {
      0: "2 electrons fill an s subshell (l = 0), which has one orbital.",
      1: "6 electrons fill a p subshell (l = 1), which has three orbitals.",
      3: "14 electrons fill an f subshell (l = 3), which has seven orbitals.",
    },
  },
  {
    id: "q-chem-105",
    subject: "Chemistry",
    chapter: "Organic chemistry",
    topic: "Aldehydes and ketones",
    difficulty: "moderate",
    source: "FSc Chemistry Part II · Aldehydes and ketones",
    stem: "Which reagent can be used to tell an aldehyde from a ketone?",
    options: ["Tollens' reagent", "2,4-Dinitrophenylhydrazine", "Sodium metal", "Lucas reagent"],
    answer: 0,
    why: "Aldehydes are easily oxidised. They reduce Tollens' reagent (ammoniacal silver nitrate), giving a silver mirror. Ketones are not oxidised by it, so nothing happens.",
    wrong: {
      1: "2,4-DNPH gives an orange-yellow precipitate with both aldehydes and ketones, since both have a carbonyl group. It cannot tell them apart.",
      2: "Sodium metal reacts with compounds that have an –OH group, such as alcohols. Neither simple aldehydes nor ketones react with it.",
      3: "Lucas reagent (ZnCl₂ in conc. HCl) tells primary, secondary and tertiary alcohols apart.",
    },
  },
  {
    id: "q-phy-102",
    subject: "Physics",
    chapter: "Force and motion",
    topic: "Newton's second law",
    difficulty: "easy",
    source: "FSc Physics Part I · Force and motion",
    stem: "A net force gives a 2 kg body an acceleration of 3 m/s². What is the size of the force?",
    options: ["1.5 N", "0.67 N", "6 N", "5 N"],
    answer: 2,
    why: "Newton's second law: F = ma = 2 kg × 3 m/s² = 6 N.",
    wrong: {
      0: "1.5 comes from a ÷ m (3 ÷ 2). Force is mass times acceleration.",
      1: "0.67 comes from m ÷ a (2 ÷ 3).",
      3: "5 comes from adding mass and acceleration, which have different units and cannot be added.",
    },
  },
  {
    id: "q-phy-103",
    subject: "Physics",
    chapter: "Electrostatics",
    topic: "Capacitors",
    difficulty: "easy",
    source: "FSc Physics Part II · Electrostatics",
    stem: "Two 4 μF capacitors are connected in series. What is their equivalent capacitance?",
    options: ["2 μF", "4 μF", "8 μF", "16 μF"],
    answer: 0,
    why: "In series, 1/C = 1/4 + 1/4 = 1/2, so C = 2 μF. Capacitors in series always give less than the smallest one.",
    wrong: {
      1: "4 μF is the value of one capacitor on its own.",
      2: "8 μF is the parallel combination, where capacitances add.",
      3: "16 μF is the product of the two values, not a combination rule.",
    },
  },
  {
    id: "q-phy-104",
    subject: "Physics",
    chapter: "Waves",
    topic: "Wave equation",
    difficulty: "easy",
    source: "FSc Physics Part I · Waves",
    stem: "A wave has a frequency of 50 Hz and a wavelength of 4 m. What is its speed?",
    options: ["12.5 m/s", "54 m/s", "0.08 m/s", "200 m/s"],
    answer: 3,
    why: "v = fλ = 50 Hz × 4 m = 200 m/s.",
    wrong: {
      0: "12.5 comes from f ÷ λ (50 ÷ 4).",
      1: "54 comes from adding f and λ, which have different units.",
      2: "0.08 comes from λ ÷ f (4 ÷ 50). That has units of seconds, not metres per second.",
    },
  },
  {
    id: "q-eng-101",
    subject: "English",
    chapter: "Grammar and sentence correction",
    topic: "Subject-verb agreement",
    difficulty: "moderate",
    source: "MDCAT English syllabus · Grammar",
    stem: "Choose the word that correctly completes the sentence: “Neither the teacher nor the students ___ ready for the test.”",
    options: ["was", "is", "has been", "were"],
    answer: 3,
    why: "With “neither … nor”, the verb agrees with the subject nearer to it. That subject is “the students”, which is plural, so the verb is the plural “were”.",
    wrong: {
      0: "“Was” is singular. It would be right only if the nearer subject were singular, as in “Neither the students nor the teacher was ready”.",
      2: "“Has been” is singular, so it does not agree with “the students”.",
      1: "“Is” is singular, so it does not agree with “the students”.",
    },
  },
  {
    id: "q-lr-101",
    subject: "Logical Reasoning",
    chapter: "Patterns and sequences",
    topic: "Number series",
    difficulty: "easy",
    source: "MDCAT Logical Reasoning syllabus · Patterns",
    stem: "What comes next in the series 2, 6, 12, 20, 30, …?",
    options: ["36", "40", "42", "44"],
    answer: 2,
    why: "The gaps are 4, 6, 8, 10, rising by 2 each time, so the next gap is 12 and 30 + 12 = 42. Each term is also n(n + 1): 1×2, 2×3, 3×4, 4×5, 5×6, then 6×7 = 42.",
    wrong: {
      0: "36 adds 6, repeating an early gap instead of continuing the pattern.",
      1: "40 adds 10 again. The gap grows by 2 each step, so it should be 12.",
      3: "44 adds 14, skipping a step in the pattern.",
    },
  },
];

export const byId = (id: string) => bank.find((q) => q.id === id);

/* Questions for a practice set or test. Filters by subject and chapters when given; with too few matches it falls back
   to the whole subject, then the whole bank, so the sample screens always have something to show. */
export function pickQuestions(opts: { subject?: string | null; chapters?: string[]; ids?: string[]; count?: number }): Question[] {
  if (opts.ids?.length) return opts.ids.map(byId).filter((q): q is Question => !!q);
  const chapters = opts.chapters?.filter(Boolean) ?? [];
  let set = bank.filter((q) => (!opts.subject || q.subject === opts.subject) && (!chapters.length || chapters.includes(q.chapter)));
  if (set.length < 3 && opts.subject) set = bank.filter((q) => q.subject === opts.subject);
  if (set.length < 3) set = bank;
  return set.slice(0, opts.count ?? set.length);
}

/* The order a full paper uses: Biology first, then Chemistry, Physics, English, Logical Reasoning. */
export function paperOrder(qs: Question[]): Question[] {
  return [...qs].sort((a, b) => subjects.indexOf(a.subject) - subjects.indexOf(b.subject));
}
