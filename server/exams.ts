import { type Bank, banks } from "../lib/banks";
import { bankAmong, banksFor } from "../lib/exams";
import { chosen } from "./users";

/* Which banks an account may be served from: the banks of the exams it chose (lib/exams.ts). Staff get every bank.
   An account that has not chosen yet gets what every account had before the choice existed, so nothing breaks for
   a browser still running an older copy of the site; the pages send it to the welcome screen. */
type Who = { role: string; area?: string | null; exams?: string | null };

export function allowedBanks(who: Who): Bank[] {
  if (who.role !== "student") return banks;
  const mine = banksFor(chosen(who).exams);
  return mine.length ? mine : banksFor(chosen({}).exams);
}

/* The bank to serve when `asked` comes from the request: never one outside the account's exams. */
export const bankFor = (allowed: Bank[], asked: unknown, fallback?: string | null): Bank =>
  bankAmong(allowed, typeof asked === "string" ? asked : null, fallback) ?? banks.find((b) => b.id === "mdcat")!;

export const mayUse = (allowed: Bank[], bank: string) => allowed.some((b) => b.id === bank);
