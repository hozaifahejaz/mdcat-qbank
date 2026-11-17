import type { Metadata } from "next";
import BillingScreen from "@/components/screens/BillingScreen";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Billing · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <BillingScreen />;
}
