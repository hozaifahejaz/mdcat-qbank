import type { Metadata } from "next";
import { HistoryScreen } from "@/components/screens/MockScreens";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Test history · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <HistoryScreen />;
}
