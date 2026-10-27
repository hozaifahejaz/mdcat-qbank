/* The student's study stats on the dashboard, in the shape the backend will return it.
   Nothing is recorded yet, so every count starts at zero: getDashboard() is the one place to swap for real queries
   over attempts, answers and tests. */
import { available, syllabus } from "@/lib/bank";
import type { StudentUser } from "@/lib/user";

export type Subject = "Biology" | "Chemistry" | "Physics" | "English" | "Logical Reasoning";

export type ChapterStat = { chapter: string; answered: number; available: number; correct: number };
export type SubjectStat = { subject: Subject; chapters: ChapterStat[] };

export type WeakTopic = { subject: Subject; chapter: string; topic: string; answered: number; correct: number };

export type TestResult = {
  id: string;
  kind: "mock" | "timed" | "practice" | "past-paper";
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

/* The last 12 weeks, oldest first, with nothing answered. */
function emptyDaily(days = 84): DayActivity[] {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    return { date: d.toISOString().slice(0, 10), answered: 0, correct: 0 };
  });
}

export async function getDashboard(_user: StudentUser): Promise<Dashboard> {
  return {
    streakDays: 0,
    dailyGoal: 40,
    daily: emptyDaily(),
    bookmarks: 0,
    mistakesToRetry: 0,
    subjects: (Object.keys(syllabus) as Subject[]).map((subject) => ({
      subject,
      chapters: syllabus[subject].map((chapter) => ({ chapter, answered: 0, available: available(subject, [chapter]), correct: 0 })),
    })),
    weakTopics: [],
    recent: [],
  };
}
