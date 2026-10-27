import { api } from "@/lib/api";
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

/* The signed-in student, or null when signed out (or when the API can't be reached).
   Accounts made with a phone number have no email. */
export async function getCurrentUser(): Promise<AccountUser | null> {
  try {
    const { user } = await api<{ user: AccountUser | null }>("/api/auth/me");
    return user;
  } catch {
    return null;
  }
}
