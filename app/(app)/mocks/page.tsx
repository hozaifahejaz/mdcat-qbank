import type { Metadata } from "next";
import { MocksScreen } from "@/components/screens/MockScreens";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Full mocks · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <MocksScreen />;
}
