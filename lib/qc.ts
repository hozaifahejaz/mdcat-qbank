/* The question quality check (docs/plan.md), shared by the admin panel and the API so both apply the same rules.
   No imports: the API (functions/) compiles this file too. */

export const roles = ["student", "writer", "reviewer", "admin"] as const;
export type Role = (typeof roles)[number];
export const roleNames: Record<Role, string> = { student: "Student", writer: "Writer", reviewer: "Reviewer", admin: "Admin" };
export const isStaff = (r: Role | undefined) => !!r && r !== "student";

export const stages = [
  { id: "draft", label: "Draft", step: "Written to the template" },
  { id: "auto", label: "Auto checks", step: "Every field filled, not a duplicate of another question" },
  { id: "blind", label: "Blind solve", step: "Someone other than the writer answers without seeing the key" },
  { id: "review", label: "Checklist", step: "A reviewer checks it against the textbook" },
  { id: "signoff", label: "Sign-off", step: "An admin approves it" },
  { id: "beta", label: "Beta", step: "Live to beta and free users, stats watched" },
  { id: "live", label: "Live", step: "In the full bank" },
] as const;
export type StageId = (typeof stages)[number]["id"];
export const stageIds = stages.map((s) => s.id) as StageId[];
export const stageLabel = (s: StageId) => stages.find((x) => x.id === s)!.label;

export const checklist = [
  "Facts and numbers match the textbook",
  "Exactly one option is correct",
  "Explanation is accurate and covers every option",
  "On the PMDC syllabus, tagged to the right topic",
  "Original wording, not copied from a book or another bank",
  "Clear, correct English",
  "Difficulty label is sensible",
];

/* Question IDs start with the subject's code: BIO-0001. */
export const subjectCodes: Record<string, string> = {
  Biology: "BIO",
  Chemistry: "CHE",
  Physics: "PHY",
  English: "ENG",
  "Logical Reasoning": "LR",
};

/* Above this word overlap with another question, a new one counts as a duplicate and goes back to its writer. */
export const DUPLICATE_LIMIT = 80;

export type QuestionFields = {
  subject: string;
  chapter: string;
  topic: string;
  difficulty: "easy" | "moderate" | "hard";
  source: string;
  stem: string;
  options: string[];
  answer: number;
  why: string;
  wrong: Record<number, string>;
};

/* Template fields still empty, in words for the writer. Empty list means the question is complete. */
export function missingFields(q: QuestionFields): string[] {
  return [
    !q.stem.trim() && "the stem",
    q.options.some((o) => !o.trim()) && "an option",
    new Set(q.options.map((o) => o.trim().toLowerCase())).size < q.options.length && "four different options",
    !q.why.trim() && "why the key is right",
    q.options.some((_, i) => i !== q.answer && !q.wrong[i]?.trim()) && "why each wrong option is wrong",
    !q.source.trim() && "the source",
    !q.topic.trim() && "the topic",
  ].filter(Boolean) as string[];
}

const words = (s: string) => new Set(s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length > 2));

/* Word overlap (Jaccard) between two questions' stems and options, 0 to 100. */
export function similarity(a: Pick<QuestionFields, "stem" | "options">, b: Pick<QuestionFields, "stem" | "options">): number {
  const x = words(`${a.stem} ${a.options.join(" ")}`), y = words(`${b.stem} ${b.options.join(" ")}`);
  if (!x.size || !y.size) return 0;
  let both = 0;
  x.forEach((w) => { if (y.has(w)) both++; });
  return Math.round((both / (x.size + y.size - both)) * 100);
}
