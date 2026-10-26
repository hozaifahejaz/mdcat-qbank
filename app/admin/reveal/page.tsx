import type { Metadata } from "next";
import RevealScreen from "@/components/screens/RevealScreen";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Reveal watermark · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <RevealScreen />;
}
