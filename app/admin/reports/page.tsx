import type { Metadata } from "next";
import { ReportsPage } from "@/components/admin/pages";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Reports · Admin · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <ReportsPage />;
}
