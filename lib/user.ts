/* The signed-in student. Sign-in fills this from the session and the student's profile.
   Email is missing for accounts made with a phone number. */
export type Plan = "free" | "season" | "bundle" | "monthly";

export type StudentUser = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  plan: Plan;
  planExpiresAt?: string; // ISO date
};

/* Mock until sign-in lands: returns a sample student. Returning null means "not signed in"; callers send them to /signin. */
export async function getCurrentUser(): Promise<StudentUser | null> {
  return {
    id: "demo-0001",
    name: "Ayesha Khan",
    email: "ayesha@example.com",
    phone: "+923001234567",
    plan: "season",
    planExpiresAt: "2027-08-31T23:59:59+05:00",
  };
}
