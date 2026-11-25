/* Small display helpers shared by the signed-in screens. Times are shown in Pakistan time whatever the device says. */
import type { TestResult } from "@/lib/dashboard-data";
import type { StudentUser } from "@/lib/user";

export const tz = "Asia/Karachi";

/* Urdu in a question (the LAT Urdu section, Urdu words quoted in an explanation). Text whose first letter is Urdu reads
   right to left; any Urdu gets the taller line the Nastaliq script needs (globals.css, [data-ur]). English text is
   left as it is. */
const URDU = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
const LETTER = /[A-Za-z\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
export function script(s: string | null | undefined): { dir?: "rtl"; lang?: "ur"; "data-ur"?: "" } {
  if (!s || !URDU.test(s)) return {};
  const first = s.match(LETTER)?.[0];
  return first && URDU.test(first) ? { dir: "rtl", lang: "ur", "data-ur": "" } : { "data-ur": "" };
}
export const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: tz });
export const fullDay = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: tz });
export const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

/* Accuracy band, always shown with its words so it never rests on colour alone. */
export function band(p: number) {
  return p >= 75 ? { cls: "good", word: "Strong" } : p >= 60 ? { cls: "warn", word: "Getting there" } : { cls: "bad", word: "Needs work" };
}

/* 4210 seconds → "1:10:10"; under an hour → "12:05". */
export function clock(sec: number) {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const mm = String(m).padStart(h ? 2 : 1, "0"), ss = String(r).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export const kindNames: Record<TestResult["kind"], string> = {
  mock: "Mock",
  "mini-mock": "Mini mock",
  timed: "Timed test",
  practice: "Practice",
  "past-paper": "Past paper",
};

export const planNames: Record<StudentUser["plan"], string> = {
  free: "Free plan",
  season: "3-month plan",
  bundle: "Full access",
  monthly: "1-month plan",
};

export const letters = ["A", "B", "C", "D", "E"];
