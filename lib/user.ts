import { api } from "@/lib/api";
import { applyLook } from "@/lib/look-client";
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

/* role is "student" for everyone except Markhor Prep staff (lib/qc.ts). */
export type AccountUser = StudentUser & { methods: ("email" | "phone" | "google" | "apple")[]; role: Role };

const KEY = "me";
/* The account as this browser last saw it, so pages can draw their frame before the server answers.
   Only for drawing: the server decides what the account may load. */
export const lastUser = () => seen<AccountUser>(KEY, true) ?? null;
export function rememberUser(u: AccountUser | null) {
  if (u && lastUser()?.id === u.id) keep(KEY, u, true);
  else { forgetAll(); if (u) keep(KEY, u, true); }
}

/* The signed-in student, or null when signed out (or when the API can't be reached).
   Accounts made with a phone number have no email. Every page asks, and moving between pages shouldn't mean asking
   the server again each time, so an answer is shared for half a minute. The server checks the session on every data
   request anyway; this only decides what the frame draws and whether to send a signed-out visitor to sign in. */
const SHARE_MS = 30_000;
let asking: Promise<AccountUser | null> | null = null;
let askedAt = 0;
export function getCurrentUser(): Promise<AccountUser | null> {
  if (asking && Date.now() - askedAt > SHARE_MS) asking = null;
  if (!asking) {
    askedAt = Date.now();
    const p: Promise<AccountUser | null> = api<{ user: AccountUser | null; look?: string }>("/api/auth/me")
      .then(({ user, look }) => {
        applyLook(look);
        rememberUser(user);
        // Only a signed-in answer is shared; signed out, the next page asks again (it may be just after signing in).
        if (!user && asking === p) asking = null;
        return user;
      }, () => {
        // A failed ask isn't shared: the next page asks again.
        if (asking === p) asking = null;
        return null;
      });
    asking = p;
  }
  return asking;
}

/* After the account itself changes here (a new name): the next ask gets this copy. */
export function knowUser(u: AccountUser) {
  rememberUser(u);
  asking = Promise.resolve(u);
  askedAt = Date.now();
}

/* On sign-out: the next ask goes to the server. */
export function forgetUser() {
  asking = null;
}
