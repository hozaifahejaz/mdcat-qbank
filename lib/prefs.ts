/* What a student chose on the welcome screen: their test, exam year and daily goal (server/prefs.ts). */
import { api } from "@/lib/api";
import { site } from "@/lib/site";
import { forgetAll } from "@/lib/cache";
import { type AccountUser, knowUser } from "@/lib/user";

export type Prefs = { bank: string; examYear: number | null; dailyGoal: number; welcomed: boolean };

export const getPrefs = () => api<Prefs>("/api/account/prefs");
export const savePrefs = (p: Partial<Prefs>) => api<Prefs>("/api/account/prefs", { body: p });

/* Saves the area and exams an account is preparing for (the welcome screen and My exams). `main` is the exam the
   app opens on. Answers with the account as it now stands. */
export const saveExams = (p: { area: string; exams: string[]; main?: string; examYear?: number | null }) =>
  api<{ user: AccountUser; prefs: Prefs }>("/api/account/exams", { body: p });

/* After the exams are saved: numbers kept for the old choice are dropped (other banks, other counts), the account
   as it now stands is remembered, and practice opens on the exam they start with. */
export function examsSaved(user: AccountUser, bank: string) {
  forgetAll();
  knowUser(user);
  try { localStorage.setItem("practice-bank", bank); } catch {}
}

export const goalChoices = [
  { n: 20, name: "Light", hint: "About 20 minutes" },
  { n: 40, name: "Steady", hint: "About 40 minutes" },
  { n: 80, name: "Serious", hint: "About 80 minutes" },
];

/* The years a student can be sitting the test in: this season and the next. */
export const examYears = [Number(site.season), Number(site.season) + 1];

/* The expected exam day for a student's year: the site's date, moved to their year. */
export const examDateFor = (year: number | null | undefined) => (year && year !== Number(site.examDate.slice(0, 4)) ? `${year}${site.examDate.slice(4)}` : site.examDate);
