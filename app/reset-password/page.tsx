import type { Metadata } from "next";
import ResetPassword from "@/components/auth/ResetPassword";
import { site } from "@/lib/site";
import "../auth.css";

export const metadata: Metadata = { title: `Choose a new password · ${site.name}`, robots: { index: false } };

export default function ResetPasswordPage() {
  return <ResetPassword />;
}
