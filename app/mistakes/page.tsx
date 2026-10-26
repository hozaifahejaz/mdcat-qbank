import type { Metadata } from "next";
import MistakesScreen from "@/components/screens/MistakesScreen";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `My mistakes · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <MistakesScreen />;
}
