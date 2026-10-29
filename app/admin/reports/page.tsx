import type { Metadata } from "next";
import { ReportsPage } from "@/components/admin/pages";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Reports · Admin · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <ReportsPage />;
}
