import type { Metadata } from "next";
import { HistoryScreen } from "@/components/screens/MockScreens";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Results · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <HistoryScreen />;
}
