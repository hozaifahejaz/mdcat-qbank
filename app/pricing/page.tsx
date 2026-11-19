import type { Metadata } from "next";
import PricingScreen from "@/components/screens/PricingScreen";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = {
  title: `Pricing · ${site.name}`,
  description: "Start free with 100 MDCAT questions. One Season Pass opens the full question bank, timed mocks and past papers until the exam, with no renewal.",
  alternates: { canonical: "/pricing" },
};

export default function Page() {
  return <PricingScreen />;
}
