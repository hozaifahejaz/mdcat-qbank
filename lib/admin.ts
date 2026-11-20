/* The browser side of the admin API (server/admin.ts). The server checks every role; these calls just fetch. */
import { api } from "@/lib/api";
import type { QuestionFields, Role, StageId } from "@/lib/qc";
import type { Look } from "@/lib/look";
import type { TicketDetail, TicketRow } from "@/lib/support";

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
  /* In the free set, and the past-paper year it was rebuilt from. */
  free: boolean;
  paper: number | null;
  /* Set while an edit is being re-checked: the stage of the version students still see. */
  liveCopy: StageId | null;
  createdAt: string;
  updatedAt: string;
};

export type LogEntry = { action: string; target?: string; detail: string; created_at: number; actor: string | null };

export type Overview = {
  byStage: Record<StageId, number>;
  liveBySubject: Record<string, number>;
  sentBackToMe: number;
  waitingBlind: number;
  openReports: number;
  waitlist: number;
  /* Open support tickets whose last message is from the person (admins only). */
  tickets?: number;
  users: { total: number; newThisWeek: number; staff: number; paid: Record<string, number> } | null;
  visits: { today: number; week: number; now: number } | null;
  activity: LogEntry[];
  watch: { id: string; name: string; email: string | null; phone: string | null; kind: string; detail: string; at: number }[];
  /* The last thirty days, oldest first (admins only). */
  growth?: GrowthDay[] | null;
};

/* Notes the site makes on an account by itself (server/session.ts, devices.ts, study.ts). */
export const noteNames: Record<string, string> = {
  session_moved: "Sign-in used from a different browser",
  many_places: "Used from many places at once",
  takeover_limit: "Too many device switches",
  daily_limit: "Daily question limit reached",
};

export type AdminUser = {
  id: string; name: string; email: string | null; phone: string | null; plan: "free" | "season" | "bundle" | "monthly"; role: Role;
  planExpiresAt: string | null; createdAt: string; emailVerified: boolean; devices: number; lastSeen: string | null;
  /* The site owner's account: only the owner can change it, or add and remove admins. */
  owner: boolean;
};

export type UserDetail = {
  user: AdminUser;
  devices: { id: string; label: string; created_at: number; last_seen_at: number; active: boolean }[];
  methods: string[];
  takeoversToday: number;
  questionsToday: number;
  study?: { answered: number; correct: number; tests: number; lastAnswer: string | null };
  notes: { kind: string; detail: string; created_at: number }[];
  log: LogEntry[];
};

/* The last answer to each of the admin panel's page reads, held in memory while the tab is open. A page opens with
   its last copy at once (`last`) and the fresh one replaces it, so moving around the panel doesn't blink a loading
   placeholder each time. Nothing is written to the browser's storage. */
const kept = new Map<string, unknown>();
const keep = <T>(key: string, p: Promise<T>) => p.then((v) => { kept.set(key, v); return v; });
export const last = <T>(key: string) => (kept.get(key) as T | undefined) ?? null;
export const questionsKey = (p: { view: string; subject: string; q: string; chapter?: string; free?: string; paper?: string }) => `questions:${p.view}|${p.subject}|${p.q}|${p.chapter ?? ""}|${p.free ?? ""}|${p.paper ?? ""}`;

export const getOverview = () => keep("overview", api<Overview>("/api/admin/overview"));

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
export const getVisits = (days: number) => keep(`visits:${days}`, api<Visits>(`/api/admin/visitors?days=${days}`));

export type QuestionPage = {
  questions: AdminQuestion[];
  total: number;
  hasMore: boolean;
  /* Questions at each stage, plus "all" and "mine", in what you can see. */
  counts: Record<string, number>;
  /* Share of keys on A to D across the questions whose key you can see. */
  spread: { known: number; pct: number[] };
};
export const listQuestions = (p: { view: string; subject: string; q: string; offset: number; chapter?: string; free?: string; paper?: string }) =>
  ((get) => (p.offset === 0 ? keep(questionsKey(p), get) : get))(api<QuestionPage>(`/api/admin/questions?${new URLSearchParams({ view: p.view, subject: p.subject, q: p.q, offset: String(p.offset), chapter: p.chapter ?? "", free: p.free ?? "", paper: p.paper ?? "" })}`));
/* The publishing switches for many questions at once. Only what's given is changed. */
export const bulkQuestions = (ids: string[], change: { free?: boolean; mdcat?: boolean; paper?: number | null }) =>
  api<{ changed: number }>("/api/admin/questions/bulk", { body: { ids, ...change } });

/* How students are answering: the questions worth a second look (server/insights.ts). */
export type QualityRow = { id: string; subject: string; chapter: string; stem: string; key: number; n: number; pct: number; picks: number[]; reports: number; why: "wrong_pick" | "low" };
export type Quality = { at: number; minAnswers: number; measured: number; average: number | null; look: QualityRow[] };
export const getQuality = (fresh = false) => keep("quality", api<Quality>(`/api/admin/quality${fresh ? "?fresh=1" : ""}`));

/* Questions students can be served, per bank, subject and chapter. listed: the chapter is on that bank's syllabus. */
export type Coverage = { questions: number; banks: { id: string; name: string; subjects: { subject: string; chapters: { chapter: string; total: number; free: number; listed: boolean }[] }[] }[] };
export const getCoverage = () => keep("coverage", api<Coverage>("/api/admin/coverage"));
export type GrowthDay = { date: string; signups: number; answers: number; active: number };
export const getQuestion = (id: string) => api<{ question: AdminQuestion }>(`/api/admin/questions/one?id=${encodeURIComponent(id)}`).then((r) => r.question);
export const discardEdit = (id: string) => api<{ question: AdminQuestion }>("/api/admin/questions/discard", { body: { id } }).then((r) => r.question);
export const setQuestionMeta = (id: string, free: boolean, paper: number | null) => api<{ question: AdminQuestion }>("/api/admin/questions/meta", { body: { id, free, paper } }).then((r) => r.question);
export const saveQuestion = (q: Partial<QuestionFields> & { id?: string }) => api<{ question: AdminQuestion }>("/api/admin/questions/save", { body: q }).then((r) => r.question);
export const advanceQuestion = (id: string, checks?: boolean[]) => api<{ question: AdminQuestion }>("/api/admin/questions/advance", { body: { id, checks } }).then((r) => r.question);
export const blindSolve = (id: string, answer: number) => api<{ match: boolean; answer: number; question: AdminQuestion }>("/api/admin/questions/blind", { body: { id, answer } });
export const sendBack = (id: string, note: string) => api<{ question: AdminQuestion }>("/api/admin/questions/send-back", { body: { id, note } }).then((r) => r.question);
export const deleteQuestion = (id: string) => api("/api/admin/questions/delete", { body: { id } });
export const questionLog = (id: string) => api<{ log: LogEntry[] }>(`/api/admin/questions/log?id=${encodeURIComponent(id)}`).then((r) => r.log);

export type Report = {
  id: number; question_id: string; reason: string; details: string; status: "open" | "fixed" | "dismissed"; note: string;
  created_at: number; resolved_at: number | null; student: string | null; resolver: string | null;
  stem: string | null; stage: StageId | null; subject: string | null;
};
export const listReports = (status: "open" | "closed") => keep(`reports:${status}`, api<{ reports: Report[] }>(`/api/admin/reports?status=${status}`).then((r) => r.reports));
export const resolveReports = (questionId: string, status: "fixed" | "dismissed", note: string) => api("/api/admin/reports/resolve", { body: { questionId, status, note } });
export type TicketView = "waiting" | "open" | "closed" | "all";
export type TicketList = { tickets: TicketRow[]; counts: Record<TicketView, number> };
export const ticketsKey = (view: TicketView, q: string) => `tickets:${view}|${q}`;
export const listTickets = (view: TicketView, q: string) => keep(ticketsKey(view, q), api<TicketList>(`/api/admin/tickets?view=${view}&q=${encodeURIComponent(q)}`));
export const getTicket = (id: number) => keep(`ticket:${id}`, api<TicketDetail>(`/api/admin/tickets/one?id=${id}`));
export const replyTicket = (id: number, message: string, close: boolean) => api("/api/admin/tickets/reply", { body: { id, message, close } });
export const setTicketStatus = (id: number, status: "open" | "closed") => api("/api/admin/tickets/status", { body: { id, status } });
export const deleteTicket = (id: number) => api("/api/admin/tickets/delete", { body: { id } });

export type WaitlistEntry = { contact: string; kind: "email" | "phone"; created_at: number };
export const getWaitlist = () => keep("waitlist", api<{ waitlist: WaitlistEntry[] }>("/api/admin/waitlist").then((r) => r.waitlist));

type UserPage = { users: AdminUser[]; hasMore: boolean; meOwner: boolean };
export const listUsers = (q: string, filter: string, offset = 0) => ((get) => (!q && !filter && !offset ? keep("users", get) : get))(api<UserPage>(`/api/admin/users?q=${encodeURIComponent(q)}&filter=${filter}&offset=${offset}`));
export const lastUsers = () => last<UserPage>("users");
export const getUser = (id: string) => api<UserDetail>(`/api/admin/users/one?id=${encodeURIComponent(id)}`);
export const createAccount = (a: { name: string; email: string; password: string; role: Role }) => api<{ user: AdminUser }>("/api/admin/users/create", { body: a });
export const setRole = (id: string, role: Role) => api<{ user: AdminUser }>("/api/admin/users/role", { body: { id, role } });
export const setPlan = (id: string, plan: AdminUser["plan"], expiresAt: string | null) => api<{ user: AdminUser }>("/api/admin/users/plan", { body: { id, plan, expiresAt } });
export const resetDevices = (id: string) => api<{ user: AdminUser }>("/api/admin/users/reset-devices", { body: { id } });
export const signOutUser = (id: string) => api<{ user: AdminUser }>("/api/admin/users/signout", { body: { id } });

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
  "question.discard": "Edit discarded",
  "question.meta": "Publishing changed",
  "question.bulk": "Publishing changed for several",
  "report.fixed": "Reports closed as fixed",
  "report.dismissed": "Reports dismissed",
  "user.create": "Account created",
  "user.role": "Role changed",
  "user.plan": "Plan changed",
  "user.reset_devices": "Devices reset",
  "user.signout": "Signed out everywhere",
  "ticket.reply": "Answered a support ticket",
  "ticket.reply_close": "Answered and closed a support ticket",
  "ticket.close": "Closed a support ticket",
  "ticket.reopen": "Reopened a support ticket",
  "ticket.delete": "Deleted a support ticket",
};

/* The public pages' look (lib/look.ts, server/look.ts). */
export const getLook = () => api<{ look: Look }>("/api/admin/look").then((r) => r.look);
export const setLook = (look: Look) => api<{ look: Look }>("/api/admin/look", { body: { look } }).then((r) => r.look);
