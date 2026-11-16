/* What a student chose on the welcome screen: their test, exam year and daily goal (server/prefs.ts). */
import { api } from "@/lib/api";
import { site } from "@/lib/site";

export type Prefs = { bank: string; examYear: number | null; dailyGoal: number; welcomed: boolean };

export const getPrefs = () => api<Prefs>("/api/account/prefs");
export const savePrefs = (p: Partial<Prefs>) => api<Prefs>("/api/account/prefs", { body: p });

export const goalChoices = [
  { n: 20, name: "Light", hint: "About 20 minutes" },
  { n: 40, name: "Steady", hint: "About 40 minutes" },
  { n: 80, name: "Serious", hint: "About 80 minutes" },
];

/* The years a student can be sitting the test in: this season and the next. */
export const examYears = [Number(site.season), Number(site.season) + 1];

/* The expected exam day for a student's year: the site's date, moved to their year. */
export const examDateFor = (year: number | null | undefined) => (year && year !== Number(site.examDate.slice(0, 4)) ? `${year}${site.examDate.slice(4)}` : site.examDate);
