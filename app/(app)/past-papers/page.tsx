import type { Metadata } from "next";
import { PastPapersScreen } from "@/components/screens/MockScreens";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Past papers · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <PastPapersScreen />;
}
