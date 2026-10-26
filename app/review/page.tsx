import type { Metadata } from "next";
import ReviewScreen from "@/components/screens/ReviewScreen";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Review · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <ReviewScreen />;
}
