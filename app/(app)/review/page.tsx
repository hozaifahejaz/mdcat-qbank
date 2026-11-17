import type { Metadata } from "next";
import ReviewScreen from "@/components/screens/ReviewScreen";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Review · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <ReviewScreen />;
}
