import type { Metadata } from "next";
import MistakesScreen from "@/components/screens/MistakesScreen";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `My mistakes · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <MistakesScreen />;
}
