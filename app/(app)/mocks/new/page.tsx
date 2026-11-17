import type { Metadata } from "next";
import { MockIntroScreen } from "@/components/screens/MockScreens";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Start a mock · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <MockIntroScreen />;
}
