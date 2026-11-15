import { api } from "@/lib/api";
import { forgetAll, keep, seen } from "@/lib/cache";
import type { Role } from "@/lib/qc";

export type StudentUser = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  plan: "free" | "season" | "bundle" | "monthly";
  planExpiresAt?: string /* ISO */;
};

/* role is "student" for everyone except Examwise staff (lib/qc.ts). */
export type AccountUser = StudentUser & { methods: ("email" | "phone" | "google" | "apple")[]; role: Role };

const KEY = "me";
/* The account as this tab last saw it, so pages can draw their frame before the server answers.
   Only for drawing: the server decides what the account may load. */
export const lastUser = () => seen<AccountUser>(KEY, true) ?? null;
export function rememberUser(u: AccountUser | null) {
  if (u && lastUser()?.id === u.id) keep(KEY, u, true);
  else { forgetAll(); if (u) keep(KEY, u, true); }
}

/* The signed-in student, or null when signed out (or when the API can't be reached).
   Accounts made with a phone number have no email. Several parts of a page ask at once; they share one request. */
let asking: Promise<AccountUser | null> | null = null;
export function getCurrentUser(): Promise<AccountUser | null> {
  asking ??= api<{ user: AccountUser | null }>("/api/auth/me")
    .then(({ user }) => { rememberUser(user); return user; }, () => null)
    .finally(() => { setTimeout(() => { asking = null; }, 2000); });
  return asking;
}
