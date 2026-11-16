/* The student's study stats on the dashboard, in the shape /api/study/dashboard returns. */
import { api } from "@/lib/api";
import type { StudentUser } from "@/lib/user";

export type Subject = "Biology" | "Chemistry" | "Physics" | "English" | "Logical Reasoning" | "Mathematics";


export type ChapterStat = { chapter: string; answered: number; available: number; correct: number };
export type SubjectStat = { subject: Subject; chapters: ChapterStat[] };

export type WeakTopic = { subject: Subject; chapter: string; topic: string; answered: number; correct: number };

export type TestResult = {
  id: string;
  kind: "mock" | "mini-mock" | "timed" | "practice" | "past-paper";
  title: string;
  date: string; // ISO
  score: number;
  total: number;
  minutes: number;
};

/* Questions answered (and how many were right) on one day, Pakistan time. Oldest first, ending today. */
export type DayActivity = { date: string; answered: number; correct: number };

export type Dashboard = {
  /* Whose subjects and chapters the numbers are laid out in (lib/banks.ts). */
  bank?: string;
  /* False until the student has been through the welcome screen. Missing on copies kept from before it existed. */
  welcomed?: boolean;
  examYear?: number | null;
  /* Questions answered ever, in any bank. */
  answeredEver?: number;
  /* Average seconds a question over the last 30 days, once there are enough timed answers to mean something. */
  secondsPerQuestion?: number | null;
  streakDays: number;
  dailyGoal: number;
  daily: DayActivity[];
  bookmarks: number;
  mistakesToRetry: number;
  /* The mock this student can start now: a full one, the mini mock, or none yet. */
  nextMock: "full" | "mini" | null;
  resume?: { title: string; done: number; total: number; href: string };
  subjects: SubjectStat[];
  weakTopics: WeakTopic[];
  recent: TestResult[];
};

/* The student's numbers, worked out on the server from their own answers (server/study.ts). */
export const getDashboard = (_user?: StudentUser, bank?: string | null) => api<Dashboard>(`/api/study/dashboard${bank ? `?bank=${encodeURIComponent(bank)}` : ""}`);

/* A rough MDCAT score out of 180 from the latest answer to each question: each subject's accuracy times its share of
   the paper. Needs enough answers overall and in the three big subjects; a subject with very few borrows the overall
   accuracy. Null until then. */
export const ESTIMATE_AFTER = 200;
export function estimateScore(d: Dashboard, paper: { subject: string; count: number }[]): number | null {
  const by = new Map(d.subjects.map((s) => [s.subject as string, s.chapters.reduce((t, c) => ({ a: t.a + c.answered, c: t.c + c.correct }), { a: 0, c: 0 })]));
  const all = [...by.values()].reduce((t, x) => ({ a: t.a + x.a, c: t.c + x.c }), { a: 0, c: 0 });
  if (all.a < ESTIMATE_AFTER) return null;
  if (paper.slice(0, 3).some((p) => (by.get(p.subject)?.a ?? 0) < 30)) return null;
  const overall = all.c / all.a;
  return Math.round(paper.reduce((n, p) => { const x = by.get(p.subject); return n + p.count * (x && x.a >= 10 ? x.c / x.a : overall); }, 0));
}
