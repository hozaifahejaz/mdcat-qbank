/* Question types and the syllabus. The questions themselves never ship in the page code: students get them from the
   API a test at a time (server/study.ts, lib/study.ts), and staff from the admin API. Every question follows the
   writing template in docs/plan.md (stem, four options, key, syllabus tag, difficulty, source chapter, and an
   explanation saying why the key is right and why each other option is wrong). */
import { mdcatSyllabus } from "@/lib/banks";
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

/* Chapters per MDCAT subject, in syllabus order. Every bank's chapters are in lib/banks.ts. */
export const syllabus: Record<Subject, string[]> = mdcatSyllabus;

export const subjects = Object.keys(syllabus) as Subject[];

/* A question while it's being answered: no key, no explanations. Those come from the API once the answer is out. */
export type Asked = Pick<Question, "id" | "subject" | "chapter" | "topic" | "stem" | "options">;
