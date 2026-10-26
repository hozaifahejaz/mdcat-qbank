/* The question-review tool's data: each question's place in the six-stage quality check from docs/plan.md,
   with its automatic checks, blind solve, live statistics and student reports. Sample data for now. */
import { bank, type Question } from "@/lib/bank";

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

const at = (h: number) => new Date(Date.UTC(2026, 9, 26, 14) - h * 3600_000).toISOString();

const plan: Record<string, Partial<AdminQuestion>> = {
  "q-bio-101": { stage: "live", writer: "Ayesha K.", reviewer: "Dr. Imran S.", stats: { attempts: 1840, dist: [11, 21, 61, 7], topDist: [3, 9, 86, 2] }, reports: [] },
  "q-chem-101": { stage: "live", writer: "Bilal R.", reviewer: "Sana M.", stats: { attempts: 2210, dist: [74, 17, 7, 2], topDist: [95, 4, 1, 0] }, reports: [] },
  "q-phy-101": { stage: "beta", writer: "Usman T.", reviewer: "Hamza A.", stats: { attempts: 312, dist: [22, 58, 9, 11], topDist: [8, 88, 1, 3] }, reports: [] },
  "q-bio-105": {
    stage: "live", writer: "Ayesha K.", reviewer: "Dr. Imran S.", stats: { attempts: 960, dist: [41, 12, 40, 7], topDist: [79, 3, 17, 1] },
    reports: [
      { id: "r1", reason: "The answer key is wrong", text: "Shouldn't half the sons be colour-blind?", date: at(5), by: "Student 48213" },
      { id: "r2", reason: "The answer key is wrong", text: "Sons get X from the mother, so isn't it 50%?", date: at(20), by: "Student 11902" },
    ],
  },
  "q-chem-103": { stage: "signoff", writer: "Bilal R.", reviewer: "Sana M.", blind: { by: "Sana M.", answer: 3 } },
  "q-bio-103": { stage: "review", writer: "Fatima Z.", blind: { by: "Dr. Imran S.", answer: 1 }, checks: [true, true, false, false, false, false] },
  "q-phy-103": { stage: "review", writer: "Usman T.", blind: { by: "Hamza A.", answer: 0 }, checks: [true, false, false, false, false, false] },
  "q-bio-104": { stage: "blind", writer: "Fatima Z.", blind: { by: "Dr. Imran S.", answer: 1 } },
  "q-chem-104": { stage: "blind", writer: "Bilal R." },
  "q-eng-101": { stage: "auto", writer: "Maryam N.", auto: { duplicate: 41, plagiarism: 6 } },
  "q-lr-101": { stage: "auto", writer: "Maryam N.", auto: { duplicate: 88, plagiarism: 12 } },
  "q-chem-105": { stage: "draft", writer: "Bilal R.", sentBack: "Blind solver also argued for 2,4-DNPH. Make clear why it can't tell them apart." },
  "q-phy-104": { stage: "draft", writer: "Usman T." },
};

export async function getAdminQueue(): Promise<AdminQuestion[]> {
  return bank.map((q, k) => {
    const p = plan[q.id] ?? { stage: "draft", writer: "Hamza A." };
    const past = stages.findIndex((s) => s.id === p.stage) > 3;
    return {
      ...q,
      stage: p.stage!,
      writer: p.writer!,
      reviewer: p.reviewer,
      updated: at(k * 3 + 1),
      sentBack: p.sentBack,
      auto: p.auto ?? { duplicate: 18 + ((k * 7) % 20), plagiarism: 3 + (k % 5) },
      blind: p.blind ?? (past ? { by: p.reviewer ?? "Reviewer", answer: q.answer } : undefined),
      checks: p.checks ?? checklist.map(() => past),
      stats: p.stats,
      reports: p.reports ?? [],
    };
  });
}

/* Share of keys on A, B, C and D across the bank. The auto check warns when one letter is far from a quarter. */
export function keySpread(qs: Question[]) {
  const c = [0, 0, 0, 0];
  qs.forEach((q) => { c[q.answer]! += 1; });
  return c.map((n) => Math.round((n / Math.max(1, qs.length)) * 100));
}
