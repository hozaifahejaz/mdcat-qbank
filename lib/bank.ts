/* The question bank behind the practice, mock, review and admin screens. Empty until approved questions are loaded
   from D1: every question follows the writing template in docs/plan.md (stem, four options, key, syllabus tag,
   difficulty, source chapter, and an explanation saying why the key is right and why each other option is wrong).
   Swap `bank` for an API call when the backend lands; the screens only use the types and helpers. */
import type { Subject } from "@/lib/dashboard-data";

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

/* Chapters per subject, in syllabus order. */
export const syllabus: Record<Subject, string[]> = {
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
    "States of matter",
    "Chemical equilibrium",
    "Reaction kinetics",
    "Thermochemistry",
    "Electrochemistry",
    "Chemical bonding",
    "Organic chemistry",
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

export const subjects = Object.keys(syllabus) as Subject[];

export const bank: Question[] = [];

export const byId = (id: string) => bank.find((q) => q.id === id);

/* How many questions the bank holds for a subject, optionally limited to some chapters. */
export const available = (subject: Subject, chapters?: string[]) =>
  bank.filter((q) => q.subject === subject && (!chapters?.length || chapters.includes(q.chapter))).length;

/* Questions for a practice set or test. Filters by subject and chapters when given; with too few matches it falls back
   to the whole subject. Returns an empty list while the bank is empty. */
export function pickQuestions(opts: { subject?: string | null; chapters?: string[]; ids?: string[]; count?: number }): Question[] {
  if (opts.ids?.length) return opts.ids.map(byId).filter((q): q is Question => !!q);
  const chapters = opts.chapters?.filter(Boolean) ?? [];
  let set = bank.filter((q) => (!opts.subject || q.subject === opts.subject) && (!chapters.length || chapters.includes(q.chapter)));
  if (set.length < 3 && opts.subject) set = bank.filter((q) => q.subject === opts.subject);
  return set.slice(0, opts.count ?? set.length);
}

/* The order a full paper uses: Biology first, then Chemistry, Physics, English, Logical Reasoning. */
export function paperOrder(qs: Question[]): Question[] {
  return [...qs].sort((a, b) => subjects.indexOf(a.subject) - subjects.indexOf(b.subject));
}
