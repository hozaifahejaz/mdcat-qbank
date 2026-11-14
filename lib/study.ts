/* The browser side of the study API (server/study.ts): starting and sitting tests, results, mistakes, bookmarks and
   reports. Everything is saved on the server, so a test started on the phone can be finished on the laptop. */
import { api } from "@/lib/api";
import type { Asked, Question } from "@/lib/bank";
import type { TestResult } from "@/lib/dashboard-data";

export type Mode = "tutor" | "timed" | "mock";
export type Kind = TestResult["kind"] | "mini-mock";

export type Catalog = {
  paid: boolean;
  bank: string;
  /* answered and correct: this student's latest answer to each question of the chapter. */
  chapters: { subject: string; chapter: string; total: number; open: number; answered: number; correct: number }[];
  papers: { year: number; count: number }[];
  mocks: number;
  mockReady: boolean;
  miniReady: boolean;
  miniUsed: boolean;
  miniOpen: string | null;
};

/* Where a question stands for the student. A practice set can draw from any mix of them. */
export const filters = ["unused", "incorrect", "marked", "omitted", "correct"] as const;
export type Filter = (typeof filters)[number];
export type Pool = Record<Filter, number> & { total: number; markedIn: Record<Exclude<Filter, "marked">, number> };
/* How many questions a mix of filters matches. None picked means every question. */
export function poolMatch(p: Pool, picked: Filter[]) {
  if (!picked.length) return p.total;
  const states = (["unused", "incorrect", "omitted", "correct"] as const);
  return states.reduce((n, s) => n + (picked.includes(s) ? p[s] : picked.includes("marked") ? p.markedIn[s] : 0), 0);
}
/* How everyone answered a question: picks per option. Null until enough students have answered it. */
export type Stats = { n: number; picks: number[] };

export type StartOptions = {
  kind: Kind; bank?: string; subject?: string; subjects?: string[]; chapters?: string[]; topic?: string; count?: number; from?: "all" | "unseen" | "wrong";
  /* Practice sets: which questions to draw from, and the two switches (explanations as you go, and a clock). */
  filters?: Filter[]; tutor?: boolean; timed?: boolean;
  ids?: string[]; mock?: number; paper?: number; title?: string;
};

export type Item = { idx: number; q: Asked; answer: number | null; flagged: boolean; checked: boolean; bookmarked: boolean; seconds: number | null; reveal: Question | null; stats: Stats | null };
export type OpenAttempt = { id: string; kind: Kind; mode: Mode; title: string; startedAt: number; deadlineAt: number | null; now: number; items: Item[] };

export type Scored = { q: Question; chosen: number | null; flagged: boolean; bookmarked: boolean; seconds: number | null; stats: Stats | null };
export type Review = { attempt: TestResult & { mode: Mode; seconds: number }; withdrawn: number; items: Scored[] };
export type Mistake = { q: Question; chosen: number; date: string; tries: number };

/* Questions available for a chapter (or a subject, several subjects, or the whole bank) to this student. */
const pick = (c: Catalog | null, subject?: string | string[], chapters?: string[]) =>
  (c?.chapters ?? []).filter((x) => (!subject || (Array.isArray(subject) ? !subject.length || subject.includes(x.subject) : x.subject === subject)) && (!chapters?.length || chapters.includes(x.chapter)));
export const openCount = (c: Catalog | null, subject?: string | string[], chapters?: string[]) => pick(c, subject, chapters).reduce((n, x) => n + x.open, 0);
export const totalCount = (c: Catalog | null, subject?: string | string[], chapters?: string[]) => pick(c, subject, chapters).reduce((n, x) => n + x.total, 0);
export const doneCount = (c: Catalog | null, subject?: string | string[], chapters?: string[]) =>
  pick(c, subject, chapters).reduce((t, x) => ({ answered: t.answered + x.answered, correct: t.correct + x.correct }), { answered: 0, correct: 0 });

/* One catalog per bank (lib/banks.ts); no bank is MDCAT. */
const catalogs = new Map<string, Promise<Catalog>>();
export const getCatalog = (bank = "mdcat") => {
  let p = catalogs.get(bank);
  if (!p) {
    p = api<Catalog>(`/api/study/catalog?bank=${encodeURIComponent(bank)}`).catch((e) => { catalogs.delete(bank); throw e; });
    catalogs.set(bank, p);
  }
  return p;
};

export const startTest = (o: StartOptions) => api<{ id: string; count: number; short: boolean }>("/api/study/start", { body: o });
export const getOpenAttempt = (id: string) => api<OpenAttempt | { finished: true; id: string }>(`/api/study/attempt?id=${encodeURIComponent(id)}`);
export const saveAnswer = (id: string, idx: number, answer: number | null, flagged: boolean, seconds?: number) => api("/api/study/answer", { body: { id, idx, answer, flagged, seconds } });
export const checkAnswer = (id: string, idx: number, answer: number, seconds?: number) => api<{ answer: number; reveal: Question; stats: Stats | null }>("/api/study/check", { body: { id, idx, answer, seconds } });
/* How many of a selection are unused, incorrect, marked, omitted and correct for this student. */
export const getPool = (o: Pick<StartOptions, "bank" | "subject" | "subjects" | "chapters" | "topic">) => {
  const p = new URLSearchParams();
  if (o.bank) p.set("bank", o.bank);
  if (o.subject) p.set("subject", o.subject);
  if (o.subjects?.length) p.set("subjects", o.subjects.join("|"));
  if (o.chapters?.length) p.set("chapters", o.chapters.join("|"));
  if (o.topic) p.set("topic", o.topic);
  return api<Pool>(`/api/study/pool?${p}`);
};
export const finishTest = (id: string) => api<{ id: string; empty?: boolean }>("/api/study/finish", { body: { id } });
export const getReview = (id: string) => api<Review>(`/api/study/review?id=${encodeURIComponent(id)}`);
export const getHistory = () => api<{ tests: TestResult[] }>("/api/study/history").then((r) => r.tests);
export const getMistakes = () => api<{ mistakes: Mistake[] }>("/api/study/mistakes").then((r) => r.mistakes);
export const getBookmarks = () => api<{ bookmarks: Question[] }>("/api/study/bookmarks").then((r) => r.bookmarks);
export const setBookmark = (questionId: string, on: boolean) => api("/api/study/bookmark", { body: { questionId, on } });
export const reportQuestion = (questionId: string, reason: string, details: string) => api("/api/study/report", { body: { questionId, reason, details } });

/* Where a test link goes: /test with what to ask, which the test screen turns into a saved test. */
export function testHref(o: StartOptions): string {
  const p = new URLSearchParams({ kind: o.kind });
  if (o.bank && o.bank !== "mdcat") p.set("bank", o.bank);
  if (o.subject) p.set("subject", o.subject);
  if (o.subjects?.length) p.set("subjects", o.subjects.join("|"));
  if (o.chapters?.length) p.set("chapters", o.chapters.join("|"));
  if (o.topic) p.set("topic", o.topic);
  if (o.count) p.set("count", String(o.count));
  if (o.from && o.from !== "all") p.set("from", o.from);
  if (o.filters?.length) p.set("filters", o.filters.join("|"));
  if (o.tutor !== undefined) p.set("tutor", o.tutor ? "1" : "0");
  if (o.timed !== undefined) p.set("timed", o.timed ? "1" : "0");
  if (o.ids?.length) p.set("ids", o.ids.join(","));
  if (o.mock) p.set("mock", String(o.mock));
  if (o.paper) p.set("paper", String(o.paper));
  if (o.title) p.set("title", o.title);
  return `/test?${p}`;
}

export function readTestHref(search: string): StartOptions {
  const p = new URLSearchParams(search);
  const kinds: Kind[] = ["practice", "timed", "mock", "mini-mock", "past-paper"];
  const legacy = p.get("mode") === "timed" ? "timed" : p.get("mode") === "mock" ? (p.get("paper") ? "past-paper" : "mock") : "practice";
  const kind = kinds.find((k) => k === p.get("kind")) ?? legacy;
  const list = (k: string, sep: string) => p.get(k)?.split(sep).filter(Boolean);
  return {
    kind,
    bank: p.get("bank") ?? undefined,
    subject: p.get("subject") ?? undefined,
    subjects: list("subjects", "|"),
    chapters: list("chapters", "|"),
    topic: p.get("topic") ?? undefined,
    count: Number(p.get("count")) || undefined,
    from: (p.get("from") as StartOptions["from"]) ?? undefined,
    filters: list("filters", "|")?.filter((f): f is Filter => (filters as readonly string[]).includes(f)),
    tutor: p.has("tutor") ? p.get("tutor") === "1" : undefined,
    timed: p.has("timed") ? p.get("timed") === "1" : undefined,
    ids: list("ids", ","),
    mock: Number(p.get("mock")) || undefined,
    paper: Number(p.get("paper")) || undefined,
    title: p.get("title") ?? undefined,
  };
}
