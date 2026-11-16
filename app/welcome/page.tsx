import type { Metadata } from "next";
import WelcomeScreen from "@/components/screens/WelcomeScreen";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Welcome · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <WelcomeScreen />;
}
