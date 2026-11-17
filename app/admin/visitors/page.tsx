import type { Metadata } from "next";
import { VisitorsPage } from "@/components/admin/pages";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Visitors · Admin · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <VisitorsPage />;
}
