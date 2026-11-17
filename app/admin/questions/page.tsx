import type { Metadata } from "next";
import { QuestionsPage } from "@/components/admin/pages";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Questions · Admin · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <QuestionsPage />;
}
