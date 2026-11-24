import { type Bank, type BankId, banks } from "./banks";

/* Every area the site covers and the exams inside each, in one place. An account remembers its area and the exams
   it is preparing for (users.area and users.exams, migrations/0064); the welcome screen, the My exams page and the
   server all read this list.

   An exam opens its own bank and the textbook banks under it, so picking MDCAT gives the MDCAT bank and both FSc
   parts. Two exams that share a textbook bank share it: the questions exist once (lib/banks.ts). */
export type AreaId = "medical" | "engineering" | "doctors" | "law" | "jobs";
export type Area = { id: AreaId; name: string; blurb: string; open: boolean };

export const areas: Area[] = [
  { id: "medical", name: "Medical college entry", blurb: "MDCAT, NUMS, AKU", open: true },
  { id: "engineering", name: "Engineering entry", blurb: "ECAT, NET, GIKI, PIEAS", open: false },
  { id: "doctors", name: "Doctors", blurb: "FCPS Part 1, PGET", open: false },
  { id: "law", name: "Law", blurb: "LAT, LAW-GAT", open: false },
  { id: "jobs", name: "Government jobs", blurb: "CSS MPT, PPSC, FPSC", open: false },
];

/* bank: the bank the app opens on for this exam. banks: everything the exam opens.
   group: exams shown together under one choice (the two FSc parts under "FSc only"). */
export type Exam = { id: string; area: AreaId; name: string; short: string; blurb: string; bank: BankId; banks: BankId[]; group?: string };

export const exams: Exam[] = [
  { id: "mdcat", area: "medical", name: "MDCAT", short: "MDCAT", blurb: "Medical and dental colleges", bank: "mdcat", banks: ["mdcat", "fsc1", "fsc2"] },
  { id: "nums", area: "medical", name: "NUMS", short: "NUMS", blurb: "Army medical colleges", bank: "nums", banks: ["nums", "fsc1", "fsc2"] },
  { id: "aku", area: "medical", name: "AKU Test", short: "AKU", blurb: "Aga Khan University", bank: "aku", banks: ["aku", "fsc1", "fsc2"] },
  { id: "fsc1", area: "medical", name: "FSc Part 1", short: "FSc 1", blurb: "First-year textbooks", bank: "fsc1", banks: ["fsc1"], group: "fsc" },
  { id: "fsc2", area: "medical", name: "FSc Part 2", short: "FSc 2", blurb: "Second-year textbooks", bank: "fsc2", banks: ["fsc2"], group: "fsc" },
  // Engineering opens to students when the area does (areas above); until then only staff see its banks. GIKI and
  // PIEAS are mocks on the ECAT bank, not exams of their own.
  { id: "ecat", area: "engineering", name: "ECAT", short: "ECAT", blurb: "UET engineering entry test", bank: "ecat", banks: ["ecat", "eng1", "eng2"] },
  { id: "net", area: "engineering", name: "NUST NET", short: "NET", blurb: "NUST entry test", bank: "net", banks: ["net", "eng1", "eng2"] },
  { id: "eng1", area: "engineering", name: "FSc Pre-Engineering Part 1", short: "Pre-Eng 1", blurb: "First-year textbooks", bank: "eng1", banks: ["eng1"], group: "fsc" },
  { id: "eng2", area: "engineering", name: "FSc Pre-Engineering Part 2", short: "Pre-Eng 2", blurb: "Second-year textbooks", bank: "eng2", banks: ["eng2"], group: "fsc" },
  // Law opens to students when the area does (areas above); until then only staff see the LAT bank.
  { id: "lat", area: "law", name: "LAT", short: "LAT", blurb: "HEC Law Admission Test, for LLB", bank: "lat", banks: ["lat"] },
];

/* What a student who isn't sure yet starts with: the test most students in the area sit. */
export const startingExam: Record<AreaId, string | undefined> = { medical: "mdcat", engineering: "ecat", doctors: undefined, law: "lat", jobs: undefined };

/* What every account had before exams were chosen, and what an account reads as if its choice can't be read. */
export const LEGACY = { area: "medical" as AreaId, exams: ["mdcat", "nums", "aku"] };

export const areaById = (id: string | null | undefined) => areas.find((a) => a.id === id);
export const examById = (id: string | null | undefined) => exams.find((e) => e.id === id);
export const examsIn = (area: AreaId) => exams.filter((e) => e.area === area);

/* A saved or sent list of exams, cleaned: known exams of the one area, no repeats, in the list's own order. */
export function cleanExams(area: string | null | undefined, list: unknown): string[] {
  const a = areaById(area);
  if (!a) return [];
  const raw = Array.isArray(list) ? list : typeof list === "string" ? list.split(",") : [];
  const picked = new Set(raw.filter((x): x is string => typeof x === "string"));
  return examsIn(a.id).filter((e) => picked.has(e.id)).map((e) => e.id);
}

/* The banks a set of exams opens, in the order the app lists banks (lib/banks.ts). */
export function banksFor(examIds: string[]): Bank[] {
  const open = new Set(examIds.flatMap((id) => examById(id)?.banks ?? []));
  return banks.filter((b) => open.has(b.id));
}

/* The bank to use when a student asks for one: the one asked for if their exams open it, else the bank of their
   first exam. Never a bank outside their exams. Undefined only when they have no bank at all. */
export function bankAmong(allowed: Bank[], asked: string | null | undefined, fallback?: string | null): Bank | undefined {
  return allowed.find((b) => b.id === asked) ?? allowed.find((b) => b.id === fallback) ?? allowed.find((b) => b.id === "mdcat") ?? firstExamBank(allowed) ?? allowed[0];
}
/* An exam's own bank comes before a textbook bank. */
const firstExamBank = (allowed: Bank[]) => allowed.find((b) => exams.some((e) => e.bank === b.id && !e.group));

/* The exams among a student's that the dashboard label can show, each with the bank it opens on. */
export const myExams = (examIds: string[]) => examIds.map(examById).filter((e): e is Exam => !!e);

/* The address a "Start free" link uses so the area (and exam) a visitor was looking at arrives at the welcome screen
   after sign-up. It rides in `next`, which already survives email confirmation and Google sign-in. `then` is where
   to go after the welcome screen (e.g. the checkout). */
export function signupHref(pick: { area?: string; exam?: string; then?: string } = {}): string {
  const q = new URLSearchParams();
  if (pick.area) q.set("area", pick.area);
  if (pick.exam) q.set("exam", pick.exam);
  if (pick.then) q.set("next", pick.then);
  const s = q.toString();
  return s ? `/signup?next=${encodeURIComponent(`/welcome?${s}`)}` : "/signup";
}

/* The same for a landing section that follows the area picked in the hero: an area that isn't open yet carries
   nothing, so its visitor chooses on the welcome screen. */
export const startHref = (area: string, then?: string) => (areaById(area)?.open ? signupHref({ area, then }) : then ? `/signup?next=${encodeURIComponent(then)}` : "/signup");
