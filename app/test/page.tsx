import type { Metadata } from "next";
import TestScreen from "@/components/screens/TestScreen";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Test · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <TestScreen />;
}
