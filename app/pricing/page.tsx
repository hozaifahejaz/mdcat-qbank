import type { Metadata } from "next";
import PricingScreen from "@/components/screens/PricingScreen";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Pricing · ${site.name}` };

export default function Page() {
  return <PricingScreen />;
}
