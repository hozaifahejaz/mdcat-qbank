import type { Metadata } from "next";
import CheckoutScreen from "@/components/screens/CheckoutScreen";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Checkout · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <CheckoutScreen />;
}
