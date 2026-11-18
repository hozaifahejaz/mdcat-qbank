import type { Metadata } from "next";
import { OverviewPage } from "@/components/admin/pages";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Admin · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <OverviewPage />;
}
