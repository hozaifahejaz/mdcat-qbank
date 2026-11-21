import type { Metadata } from "next";
import Ascent from "@/components/auth/Ascent";
import { site } from "@/lib/site";
import "../auth.css";
import "../ascent.css";

export const metadata: Metadata = { title: `Sign in · ${site.name}`, robots: { index: false } };

export default function SignInPage() {
  return <Ascent mode="signin" />;
}
