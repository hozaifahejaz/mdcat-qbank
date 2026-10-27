/* A student's finished tests, mistakes and bookmarks, in the shape the backend will store them (attempts and answers
   in the data model). Nothing is saved on the server yet: a just-finished test is kept in sessionStorage so its review
   page works, and mistakes and bookmarks are empty. Swap these functions for API calls later. */
import { byId, type Question } from "@/lib/bank";
import type { TestResult } from "@/lib/dashboard-data";

export type Mode = "tutor" | "timed" | "mock";

export type Attempt = {
  id: string;
  kind: TestResult["kind"];
  mode: Mode;
  title: string;
  date: string; // ISO
  seconds: number; // time used
  questionIds: string[];
  answers: (number | null)[];
  flagged: boolean[];
};

const LAST = "examwise:last-attempt";

export function saveAttempt(a: Attempt) {
  try { sessionStorage.setItem(LAST, JSON.stringify(a)); } catch {}
}

export function getAttempt(id: string): Attempt | null {
  if (id !== "last") return null;
  try {
    const raw = sessionStorage.getItem(LAST);
    return raw ? (JSON.parse(raw) as Attempt) : null;
  } catch {
    return null;
  }
}

export type Scored = { q: Question; chosen: number | null; flagged: boolean; status: "correct" | "wrong" | "skipped" };

export function score(a: Attempt): Scored[] {
  return a.questionIds.flatMap((id, i) => {
    const q = byId(id);
    if (!q) return [];
    const chosen = a.answers[i] ?? null;
    const status = chosen === null ? "skipped" : chosen === q.answer ? "correct" : "wrong";
    return [{ q, chosen, flagged: !!a.flagged[i], status } as Scored];
  });
}

/* My mistakes: the latest wrong answer to each question, and bookmarked questions. */
export type Mistake = { q: Question; chosen: number; date: string; tries: number };

export async function getMistakes(): Promise<Mistake[]> {
  return [];
}

export async function getBookmarks(): Promise<Question[]> {
  return [];
}
