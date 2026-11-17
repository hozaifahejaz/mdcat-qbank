import type { Metadata } from "next";
import CheckoutScreen from "@/components/screens/CheckoutScreen";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Checkout · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <CheckoutScreen />;
}
