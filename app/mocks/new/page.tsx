import type { Metadata } from "next";
import { MockIntroScreen } from "@/components/screens/MockScreens";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Start a mock · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <MockIntroScreen />;
}
