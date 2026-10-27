import type { Metadata } from "next";
import { OverviewPage } from "@/components/admin/pages";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Admin · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <OverviewPage />;
}
