/* The browser side of the study API (server/study.ts): starting and sitting tests, results, mistakes, bookmarks and
   reports. Everything is saved on the server, so a test started on the phone can be finished on the laptop. */
import { api } from "@/lib/api";
import type { Asked, Question } from "@/lib/bank";
import type { TestResult } from "@/lib/dashboard-data";

export type Mode = "tutor" | "timed" | "mock";
export type Kind = TestResult["kind"] | "mini-mock";

export type Catalog = {
  paid: boolean;
  chapters: { subject: string; chapter: string; total: number; open: number }[];
  papers: { year: number; count: number }[];
  mocks: number;
  mockReady: boolean;
  miniReady: boolean;
  miniUsed: boolean;
  miniOpen: string | null;
};

export type StartOptions = {
  kind: Kind; subject?: string; chapters?: string[]; topic?: string; count?: number; from?: "all" | "unseen" | "wrong";
  ids?: string[]; mock?: number; paper?: number; title?: string;
};

export type Item = { idx: number; q: Asked; answer: number | null; flagged: boolean; checked: boolean; bookmarked: boolean; reveal: Question | null };
export type OpenAttempt = { id: string; kind: Kind; mode: Mode; title: string; startedAt: number; deadlineAt: number | null; now: number; items: Item[] };

export type Scored = { q: Question; chosen: number | null; flagged: boolean; bookmarked: boolean };
export type Review = { attempt: TestResult & { mode: Mode; seconds: number }; items: Scored[] };
export type Mistake = { q: Question; chosen: number; date: string; tries: number };

/* Questions available for a chapter (or a subject, or the whole bank) to this student. */
export const openCount = (c: Catalog | null, subject?: string, chapters?: string[]) =>
  (c?.chapters ?? []).filter((x) => (!subject || x.subject === subject) && (!chapters?.length || chapters.includes(x.chapter))).reduce((n, x) => n + x.open, 0);
export const totalCount = (c: Catalog | null, subject?: string, chapters?: string[]) =>
  (c?.chapters ?? []).filter((x) => (!subject || x.subject === subject) && (!chapters?.length || chapters.includes(x.chapter))).reduce((n, x) => n + x.total, 0);

let catalog: Promise<Catalog> | null = null;
export const getCatalog = () => (catalog ??= api<Catalog>("/api/study/catalog").catch((e) => { catalog = null; throw e; }));

export const startTest = (o: StartOptions) => api<{ id: string; count: number; short: boolean }>("/api/study/start", { body: o });
export const getOpenAttempt = (id: string) => api<OpenAttempt | { finished: true; id: string }>(`/api/study/attempt?id=${encodeURIComponent(id)}`);
export const saveAnswer = (id: string, idx: number, answer: number | null, flagged: boolean) => api("/api/study/answer", { body: { id, idx, answer, flagged } });
export const checkAnswer = (id: string, idx: number, answer: number) => api<{ answer: number; reveal: Question }>("/api/study/check", { body: { id, idx, answer } });
export const finishTest = (id: string) => api<{ id: string }>("/api/study/finish", { body: { id } });
export const getReview = (id: string) => api<Review>(`/api/study/review?id=${encodeURIComponent(id)}`);
export const getHistory = () => api<{ tests: TestResult[] }>("/api/study/history").then((r) => r.tests);
export const getMistakes = () => api<{ mistakes: Mistake[] }>("/api/study/mistakes").then((r) => r.mistakes);
export const getBookmarks = () => api<{ bookmarks: Question[] }>("/api/study/bookmarks").then((r) => r.bookmarks);
export const setBookmark = (questionId: string, on: boolean) => api("/api/study/bookmark", { body: { questionId, on } });
export const reportQuestion = (questionId: string, reason: string, details: string) => api("/api/study/report", { body: { questionId, reason, details } });

/* Where a test link goes: /test with what to ask, which the test screen turns into a saved test. */
export function testHref(o: StartOptions): string {
  const p = new URLSearchParams({ kind: o.kind });
  if (o.subject) p.set("subject", o.subject);
  if (o.chapters?.length) p.set("chapters", o.chapters.join("|"));
  if (o.topic) p.set("topic", o.topic);
  if (o.count) p.set("count", String(o.count));
  if (o.from && o.from !== "all") p.set("from", o.from);
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
    subject: p.get("subject") ?? undefined,
    chapters: list("chapters", "|"),
    topic: p.get("topic") ?? undefined,
    count: Number(p.get("count")) || undefined,
    from: (p.get("from") as StartOptions["from"]) ?? undefined,
    ids: list("ids", ","),
    mock: Number(p.get("mock")) || undefined,
    paper: Number(p.get("paper")) || undefined,
    title: p.get("title") ?? undefined,
  };
}
