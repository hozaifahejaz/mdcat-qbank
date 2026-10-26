/* A student's finished tests, mistakes and bookmarks, in the shape the backend will store them (attempts and answers
   in the data model). Sample data for now: a just-finished test is kept in sessionStorage so its review page works,
   and older tests are rebuilt from the sample bank. Swap these functions for API calls later. */
import { bank, byId, paperOrder, type Question } from "@/lib/bank";
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

/* Sample answers for the older tests on the dashboard: roughly the student's real accuracy, with a few skipped and flagged. */
function sampleAttempt(t: TestResult): Attempt {
  const { id, title, kind, date } = t;
  const qs = paperOrder(bank);
  let seed = [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) % 1000) / 1000;
  const answers = qs.map((q) => {
    const r = rnd();
    if (r < 0.07) return null;
    if (r < 0.72) return q.answer;
    return (q.answer + 1 + Math.floor(rnd() * 3)) % 4;
  });
  return {
    id, kind, title, date,
    mode: kind === "practice" ? "tutor" : kind === "timed" ? "timed" : "mock",
    seconds: Math.round((t.minutes * 60 * qs.length) / t.total), // same pace as the real test
    questionIds: qs.map((q) => q.id),
    answers,
    flagged: qs.map(() => rnd() < 0.12),
  };
}

export function getAttempt(id: string, recent: TestResult[]): Attempt | null {
  if (id === "last") {
    try {
      const raw = sessionStorage.getItem(LAST);
      return raw ? (JSON.parse(raw) as Attempt) : null;
    } catch {
      return null;
    }
  }
  const t = recent.find((r) => r.id === id);
  return t ? sampleAttempt(t) : null;
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
  const rows: [string, number, string, number][] = [
    ["q-bio-104", 1, "2026-10-26T18:20:00+05:00", 2],
    ["q-chem-103", 0, "2026-10-26T18:35:00+05:00", 1],
    ["q-phy-103", 2, "2026-10-23T20:30:00+05:00", 1],
    ["q-bio-105", 2, "2026-10-25T11:10:00+05:00", 3],
    ["q-chem-105", 1, "2026-10-25T12:02:00+05:00", 1],
    ["q-eng-101", 0, "2026-10-20T10:40:00+05:00", 1],
    ["q-bio-103", 0, "2026-10-18T10:55:00+05:00", 2],
  ];
  return rows.map(([id, chosen, date, tries]) => ({ q: byId(id)!, chosen, date, tries }));
}

export async function getBookmarks(): Promise<Question[]> {
  return ["q-bio-101", "q-chem-101", "q-bio-107", "q-phy-101", "q-lr-101"].map((id) => byId(id)!);
}
