"use client";
import { useLayoutEffect, useState } from "react";
import { type Bank, banks } from "@/lib/banks";
import { LEGACY, bankAmong, banksFor } from "@/lib/exams";
import { lastUser } from "@/lib/user";

/* The banks this browser's account may see: the banks of the exams it chose (lib/exams.ts), every bank for staff.
   Only for drawing: the server makes the same check on every request (server/exams.ts). */
const before = banksFor(LEGACY.exams);
export function myBanks(): Bank[] {
  const u = lastUser();
  if (!u) return before;
  if (u.role !== "student") return banks;
  const mine = banksFor(u.exams ?? LEGACY.exams);
  return mine.length ? mine : before;
}

/* One of the account's banks by id, or undefined when it isn't theirs. */
export const myBank = (id: string | null | undefined) => myBanks().find((b) => b.id === id);
/* The bank to open on when none is asked for: MDCAT if it is theirs, else their first exam's. */
export const myFirstBank = () => bankAmong(myBanks(), null)!;

/* As a hook: the first paint matches the page file the server built (every pre-medical bank), and the account's own
   list is in place before the browser draws. */
export function useMyBanks(): Bank[] {
  const [list, setList] = useState(before);
  useLayoutEffect(() => { setList(myBanks()); }, []);
  return list;
}
