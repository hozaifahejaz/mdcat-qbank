/* Question types and the syllabus. The questions themselves never ship in the page code: students get them from the
   API a test at a time (server/study.ts, lib/study.ts), and staff from the admin API. Every question follows the
   writing template in docs/plan.md (stem, four options, key, syllabus tag, difficulty, source chapter, and an
   explanation saying why the key is right and why each other option is wrong). */
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

/* A question while it's being answered: no key, no explanations. Those come from the API once the answer is out. */
export type Asked = Pick<Question, "id" | "subject" | "chapter" | "topic" | "stem" | "options">;
