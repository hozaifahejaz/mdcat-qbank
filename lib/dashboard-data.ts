/* The student's study stats on the dashboard, in the shape /api/study/dashboard returns. */
import { api } from "@/lib/api";
import type { StudentUser } from "@/lib/user";

export type Subject = "Biology" | "Chemistry" | "Physics" | "English" | "Logical Reasoning";

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
  streakDays: number;
  dailyGoal: number;
  daily: DayActivity[];
  bookmarks: number;
  mistakesToRetry: number;
  resume?: { title: string; done: number; total: number; href: string };
  subjects: SubjectStat[];
  weakTopics: WeakTopic[];
  recent: TestResult[];
};

/* The student's numbers, worked out on the server from their own answers (server/study.ts). */
export const getDashboard = (_user?: StudentUser) => api<Dashboard>("/api/study/dashboard");
