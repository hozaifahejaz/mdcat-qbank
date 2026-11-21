import type { Metadata } from "next";
import Ascent from "@/components/auth/Ascent";
import { site } from "@/lib/site";
import "../auth.css";
import "../ascent.css";

export const metadata: Metadata = {
  title: `Create your account · ${site.name}`,
  description: "Make a free account and practice 100 MDCAT questions, each with a full explanation. No card needed.",
  alternates: { canonical: "/signup" },
};

export default function SignUpPage() {
  return <Ascent mode="signup" />;
}
