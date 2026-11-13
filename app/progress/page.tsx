import type { Metadata } from "next";
import ProgressScreen from "@/components/screens/ProgressScreen";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Progress · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <ProgressScreen />;
}
