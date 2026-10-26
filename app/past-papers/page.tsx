import type { Metadata } from "next";
import { PastPapersScreen } from "@/components/screens/MockScreens";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Past papers · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <PastPapersScreen />;
}
