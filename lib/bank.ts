/* Question types and the syllabus. The questions themselves never ship in the page code: students get them from the
   API a test at a time (server/study.ts, lib/study.ts), and staff from the admin API. Every question follows the
   writing template in docs/plan.md (stem, four options, key, syllabus tag, difficulty, source chapter, and an
   explanation saying why the key is right and why each other option is wrong). */
import { akuMathematics, fscMaths11, fscMaths12, latSyllabus, mdcatSyllabus } from "@/lib/banks";
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

/* Chapters per subject, in syllabus order: the MDCAT subjects, Mathematics (AKU reasoning, then the FSc Maths textbook
   units for engineering), and the LAT subjects written for law.
   A question's own chapter comes from here; every bank's chapters are in lib/banks.ts. */
const { "General Knowledge": gk, "Pakistan Studies": pst, Islamiat: isl, Urdu: urd } = latSyllabus;
export const syllabus: Record<Subject, string[]> = {
  ...mdcatSyllabus, Mathematics: [...akuMathematics, ...fscMaths11, ...fscMaths12], "General Knowledge": gk, "Pakistan Studies": pst, Islamiat: isl, Urdu: urd,
};

export const subjects = Object.keys(syllabus) as Subject[];

/* A question while it's being answered: no key, no explanations. Those come from the API once the answer is out. */
export type Asked = Pick<Question, "id" | "subject" | "chapter" | "topic" | "stem" | "options">;
