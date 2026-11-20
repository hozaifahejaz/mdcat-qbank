import type { Metadata } from "next";
import ProgressScreen from "@/components/screens/ProgressScreen";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Progress · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <ProgressScreen />;
}
