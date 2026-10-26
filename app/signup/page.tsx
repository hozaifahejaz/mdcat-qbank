import type { Metadata } from "next";
import AuthPage from "@/components/auth/AuthPage";
import { site } from "@/lib/site";
import "../auth.css";

export const metadata: Metadata = { title: `Create your account · ${site.name}` };

export default function SignUpPage() {
  return <AuthPage mode="signup" />;
}
