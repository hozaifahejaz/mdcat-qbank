/* The question-review tool's data: each question's place in the six-stage quality check from docs/plan.md,
   with its automatic checks, blind solve, live statistics and student reports. Empty until questions are in the bank. */
import type { Question } from "@/lib/bank";

export const stages = [
  { id: "draft", label: "Draft", step: "Written to the template" },
  { id: "auto", label: "Auto checks", step: "Fields, duplicates, key bias, plagiarism" },
  { id: "blind", label: "Blind solve", step: "Second expert answers without the key" },
  { id: "review", label: "Checklist", step: "Checked against the textbook" },
  { id: "signoff", label: "Sign-off", step: "Subject lead approves" },
  { id: "beta", label: "Beta", step: "Live to beta and free users, stats watched" },
  { id: "live", label: "Live", step: "In the full bank" },
] as const;

export type StageId = (typeof stages)[number]["id"];

export const checklist = [
  "Facts and numbers match the textbook",
  "Exactly one option is correct",
  "Explanation is accurate and covers every option",
  "On the PMDC syllabus, tagged to the right topic",
  "Clear, correct English",
  "Difficulty label is sensible",
];

export type Report = { id: string; reason: string; text: string; date: string; by: string };

export type AdminQuestion = Question & {
  stage: StageId;
  writer: string;
  reviewer?: string;
  updated: string;
  sentBack?: string;
  auto?: { duplicate: number; plagiarism: number };
  blind?: { by: string; answer: number };
  checks: boolean[];
  stats?: { attempts: number; dist: number[]; topDist: number[] };
  reports: Report[];
};

export async function getAdminQueue(): Promise<AdminQuestion[]> {
  return [];
}

/* Share of keys on A, B, C and D across the bank. The auto check warns when one letter is far from a quarter. */
export function keySpread(qs: Question[]) {
  const c = [0, 0, 0, 0];
  qs.forEach((q) => { c[q.answer]! += 1; });
  return c.map((n) => Math.round((n / Math.max(1, qs.length)) * 100));
}
