/* The browser side of the admin API (server/admin.ts). The server checks every role; these calls just fetch. */
import { api } from "@/lib/api";
import type { QuestionFields, Role, StageId } from "@/lib/qc";

export type AdminQuestion = Omit<QuestionFields, "answer"> & {
  id: string;
  /* null while the question waits for its blind solve and you aren't its writer. */
  answer: number | null;
  keyHidden: boolean;
  stage: StageId;
  checks: boolean[];
  duplicate: number | null;
  duplicateOf: string | null;
  blind: { by: string; answer: number | null } | null;
  reviewedBy: string | null;
  signedOffBy: string | null;
  sentBack: string | null;
  writerId: string;
  writer: string;
  createdAt: string;
  updatedAt: string;
};

export type LogEntry = { action: string; target?: string; detail: string; created_at: number; actor: string | null };

export type Overview = {
  byStage: Record<StageId, number>;
  liveBySubject: Record<string, number>;
  sentBackToMe: number;
  waitingBlind: number;
  users: { total: number; newThisWeek: number; staff: number; paid: Record<string, number> } | null;
  visits: { today: number; week: number; now: number } | null;
  activity: LogEntry[];
};

export type AdminUser = {
  id: string; name: string; email: string | null; phone: string | null; plan: "free" | "season" | "bundle" | "monthly"; role: Role;
  planExpiresAt: string | null; createdAt: string; emailVerified: boolean; devices: number; lastSeen: string | null;
};

export type UserDetail = {
  user: AdminUser;
  devices: { id: string; label: string; created_at: number; last_seen_at: number; active: boolean }[];
  methods: string[];
  takeoversToday: number;
  log: LogEntry[];
};

export const getOverview = () => api<Overview>("/api/admin/overview");

/* Visitors are counted once a day (server/visits.ts), so a total over a range adds up each day's visitors. */
export type VisitRow = { key: string; visitors: number; views: number };
export type Visits = {
  days: number;
  now: number;
  totals: { visitors: number; views: number; signedIn: number; signups: number };
  previous: { visitors: number; views: number };
  daily: { date: string; visitors: number; views: number; signedIn: number }[];
  pages: VisitRow[]; referrers: VisitRow[]; campaigns: VisitRow[]; countries: VisitRow[];
  devices: VisitRow[]; os: VisitRow[]; browsers: VisitRow[];
};
export const getVisits = (days: number) => api<Visits>(`/api/admin/visitors?days=${days}`);

export const listQuestions = () => api<{ questions: AdminQuestion[] }>("/api/admin/questions").then((r) => r.questions);
export const saveQuestion = (q: Partial<QuestionFields> & { id?: string }) => api<{ question: AdminQuestion }>("/api/admin/questions/save", { body: q }).then((r) => r.question);
export const advanceQuestion = (id: string, checks?: boolean[]) => api<{ question: AdminQuestion }>("/api/admin/questions/advance", { body: { id, checks } }).then((r) => r.question);
export const blindSolve = (id: string, answer: number) => api<{ match: boolean; answer: number; question: AdminQuestion }>("/api/admin/questions/blind", { body: { id, answer } });
export const sendBack = (id: string, note: string) => api<{ question: AdminQuestion }>("/api/admin/questions/send-back", { body: { id, note } }).then((r) => r.question);
export const deleteQuestion = (id: string) => api("/api/admin/questions/delete", { body: { id } });
export const questionLog = (id: string) => api<{ log: LogEntry[] }>(`/api/admin/questions/log?id=${encodeURIComponent(id)}`).then((r) => r.log);

export const listUsers = (q: string, filter: string) => api<{ users: AdminUser[] }>(`/api/admin/users?q=${encodeURIComponent(q)}&filter=${filter}`).then((r) => r.users);
export const getUser = (id: string) => api<UserDetail>(`/api/admin/users/one?id=${encodeURIComponent(id)}`);
export const setRole = (id: string, role: Role) => api<{ user: AdminUser }>("/api/admin/users/role", { body: { id, role } });
export const setPlan = (id: string, plan: AdminUser["plan"], expiresAt: string | null) => api<{ user: AdminUser }>("/api/admin/users/plan", { body: { id, plan, expiresAt } });
export const resetDevices = (id: string) => api<{ user: AdminUser }>("/api/admin/users/reset-devices", { body: { id } });
export const signOutUser = (id: string) => api<{ user: AdminUser }>("/api/admin/users/signout", { body: { id } });

/* Share of keys on A, B, C and D across the bank. A letter far from a quarter means the writers lean on it. */
export function keySpread(qs: { answer: number | null }[]) {
  const c = [0, 0, 0, 0];
  const known = qs.filter((q) => q.answer !== null);
  known.forEach((q) => { c[q.answer!]! += 1; });
  return c.map((n) => Math.round((n / Math.max(1, known.length)) * 100));
}

/* Log actions in words. */
export const actionNames: Record<string, string> = {
  "question.create": "Created",
  "question.edit": "Edited",
  "question.submit": "Passed the auto checks",
  "question.auto_fail": "Failed the auto checks",
  "question.blind": "Blind solve",
  "question.review": "Checklist passed",
  "question.beta": "Signed off to beta",
  "question.live": "Made live",
  "question.send_back": "Sent back",
  "question.delete": "Deleted",
  "user.role": "Role changed",
  "user.plan": "Plan changed",
  "user.reset_devices": "Devices reset",
  "user.signout": "Signed out everywhere",
};
