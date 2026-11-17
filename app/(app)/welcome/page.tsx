import type { Metadata } from "next";
import WelcomeScreen from "@/components/screens/WelcomeScreen";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Welcome · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <WelcomeScreen />;
}
