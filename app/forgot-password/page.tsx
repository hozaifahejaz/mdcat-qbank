import type { Metadata } from "next";
import ForgotPassword from "@/components/auth/ForgotPassword";
import { site } from "@/lib/site";
import "../auth.css";

export const metadata: Metadata = { title: `Reset your password · ${site.name}`, robots: { index: false } };

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
