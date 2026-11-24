"use client";
import { useEffect, useState } from "react";
import { type Bank, visibleBank, visibleBanks } from "@/lib/banks";
import { lastUser } from "@/lib/user";

/* The banks this browser's account may see (lib/banks.ts visibleBanks): engineering only for staff until it opens.
   Only for drawing: the server makes the same check on every request. */
const isStaff = () => {
  const r = lastUser()?.role;
  return !!r && r !== "student";
};
export const myBank = (id: string | null | undefined) => visibleBank(id, isStaff());

/* As a hook, so the first paint matches the server-built page (pre-medical banks) and staff get the rest after it. */
export function useMyBanks(): Bank[] {
  const [list, setList] = useState(() => visibleBanks(false));
  useEffect(() => { if (isStaff()) setList(visibleBanks(true)); }, []);
  return list;
}
