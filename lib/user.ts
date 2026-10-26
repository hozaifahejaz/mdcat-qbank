import { supabase } from "@/lib/supabase";

export type StudentUser = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  plan: "free" | "season" | "bundle" | "monthly";
  planExpiresAt?: string /* ISO */;
};

/* The signed-in student, from the Supabase session and their row in public.profiles. Null when signed out.
   Accounts made with a phone number have no email. */
export async function getCurrentUser(): Promise<StudentUser | null> {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const user = session.user;
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, plan, plan_expires_at")
    .eq("id", user.id)
    .maybeSingle();
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    name: profile?.full_name || meta.full_name || meta.name || "",
    email: user.email || undefined,
    phone: profile?.phone || (user.phone ? `+${user.phone.replace(/^\+/, "")}` : undefined),
    plan: profile?.plan ?? "free",
    planExpiresAt: profile?.plan_expires_at ?? undefined,
  };
}
