import type { Metadata } from "next";
import AuthPage from "@/components/auth/AuthPage";
import { site } from "@/lib/site";
import "../auth.css";

export const metadata: Metadata = { title: `Sign in · ${site.name}`, robots: { index: false } };

export default function SignInPage() {
  return <AuthPage mode="signin" />;
}
