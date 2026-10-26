import type { Metadata } from "next";
import Callback from "@/components/auth/Callback";
import "../../auth.css";

export const metadata: Metadata = { title: "Signing in…", robots: { index: false } };

export default function CallbackPage() {
  return <Callback />;
}
