/* The student's study stats on the dashboard, in the shape the backend will return it.
   Mock data for now: getDashboard() is the one place to swap for real queries over attempts, answers and tests. */
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

const ch = (chapter: string, answered: number, available: number, correct: number): ChapterStat => ({ chapter, answered, available, correct });

/* 12 weeks of made-up daily practice: weekday sessions, lighter weekends, a few days off, rising slowly. */
function sampleDaily(days = 84): DayActivity[] {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const dow = d.getDay();
    const off = rand() < 0.12 && i < days - 7;
    const base = (dow === 0 || dow === 6 ? 14 : 24) + i * 0.25;
    const answered = off ? 0 : Math.round(base * (0.45 + rand() * 1.1));
    const correct = Math.round(answered * (0.6 + rand() * 0.2 + i * 0.0012));
    return { date: d.toISOString().slice(0, 10), answered, correct };
  });
}

const mock: Dashboard = {
  streakDays: 6,
  dailyGoal: 40,
  daily: sampleDaily(),
  bookmarks: 23,
  mistakesToRetry: 148,
  resume: { title: "Chemistry · Chemical equilibrium", done: 14, total: 25, href: "/practice" },
  subjects: [
    {
      subject: "Biology",
      chapters: [
        ch("Cell structure and function", 96, 180, 81),
        ch("Biological molecules", 74, 160, 55),
        ch("Enzymes", 40, 90, 35),
        ch("Bioenergetics", 38, 120, 22),
        ch("Acellular life", 30, 70, 26),
        ch("Human physiology", 160, 420, 118),
        ch("Inheritance", 52, 150, 30),
        ch("Biotechnology", 12, 80, 9),
        ch("Evolution", 0, 60, 0),
      ],
    },
    {
      subject: "Chemistry",
      chapters: [
        ch("Fundamental concepts", 60, 110, 51),
        ch("Atomic structure", 44, 100, 33),
        ch("States of matter", 38, 120, 27),
        ch("Chemical equilibrium", 39, 90, 21),
        ch("Reaction kinetics", 20, 70, 15),
        ch("Thermochemistry", 18, 70, 10),
        ch("Electrochemistry", 0, 80, 0),
        ch("Chemical bonding", 55, 110, 44),
        ch("Organic chemistry", 70, 300, 47),
      ],
    },
    {
      subject: "Physics",
      chapters: [
        ch("Vectors and equilibrium", 30, 80, 24),
        ch("Force and motion", 48, 120, 33),
        ch("Work and energy", 26, 80, 19),
        ch("Circular motion", 22, 70, 13),
        ch("Waves", 18, 90, 11),
        ch("Thermodynamics", 10, 80, 5),
        ch("Electrostatics", 34, 100, 18),
        ch("Current electricity", 15, 90, 10),
        ch("Modern and nuclear physics", 0, 110, 0),
      ],
    },
    {
      subject: "English",
      chapters: [
        ch("Grammar and sentence correction", 60, 200, 49),
        ch("Vocabulary in context", 30, 150, 25),
      ],
    },
    {
      subject: "Logical Reasoning",
      chapters: [
        ch("Critical thinking", 24, 100, 15),
        ch("Patterns and sequences", 20, 80, 16),
        ch("Cause and effect", 10, 60, 6),
      ],
    },
  ],
  weakTopics: [
    { subject: "Physics", chapter: "Thermodynamics", topic: "First law and heat engines", answered: 10, correct: 5 },
    { subject: "Chemistry", chapter: "Thermochemistry", topic: "Hess's law", answered: 12, correct: 6 },
    { subject: "Biology", chapter: "Bioenergetics", topic: "Krebs cycle", answered: 18, correct: 9 },
    { subject: "Physics", chapter: "Electrostatics", topic: "Capacitors", answered: 16, correct: 8 },
    { subject: "Biology", chapter: "Inheritance", topic: "Sex-linked inheritance", answered: 20, correct: 11 },
    { subject: "Chemistry", chapter: "Chemical equilibrium", topic: "Le Chatelier's principle", answered: 19, correct: 10 },
  ],
  recent: [
    { id: "t9", kind: "practice", title: "Chemistry · Chemical equilibrium", date: "2026-10-26T18:40:00+05:00", score: 9, total: 14, minutes: 17 },
    { id: "t8", kind: "mock", title: "Full mock 5", date: "2026-10-25T10:00:00+05:00", score: 131, total: 180, minutes: 176 },
    { id: "t7", kind: "timed", title: "Physics · Electrostatics", date: "2026-10-23T20:15:00+05:00", score: 13, total: 25, minutes: 24 },
    { id: "t6", kind: "past-paper", title: "PMDC MDCAT 2025", date: "2026-10-20T09:30:00+05:00", score: 127, total: 180, minutes: 179 },
    { id: "t5", kind: "mock", title: "Full mock 4", date: "2026-10-18T10:00:00+05:00", score: 124, total: 180, minutes: 180 },
    { id: "t4", kind: "mock", title: "Full mock 3", date: "2026-10-11T10:00:00+05:00", score: 118, total: 180, minutes: 172 },
    { id: "t3", kind: "mock", title: "Full mock 2", date: "2026-10-04T10:00:00+05:00", score: 112, total: 180, minutes: 180 },
    { id: "t2", kind: "mock", title: "Full mock 1", date: "2026-09-27T10:00:00+05:00", score: 104, total: 180, minutes: 178 },
  ],
};

export async function getDashboard(_user: StudentUser): Promise<Dashboard> {
  return mock;
}
