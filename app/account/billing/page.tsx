import type { Metadata } from "next";
import BillingScreen from "@/components/screens/BillingScreen";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Billing · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <BillingScreen />;
}
