import type { Metadata } from "next";
import PracticeScreen from "@/components/screens/PracticeScreen";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Practice · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <PracticeScreen />;
}
