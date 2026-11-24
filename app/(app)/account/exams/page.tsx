import type { Metadata } from "next";
import MyExamsScreen from "@/components/screens/MyExamsScreen";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `My exams · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <MyExamsScreen />;
}
