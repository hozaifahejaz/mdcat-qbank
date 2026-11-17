import type { Metadata } from "next";
import TestScreen from "@/components/screens/TestScreen";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Test · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <TestScreen />;
}
