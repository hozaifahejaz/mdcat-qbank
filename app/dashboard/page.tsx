import type { Metadata } from "next";
import Dashboard from "@/components/dashboard/Dashboard";
import { site } from "@/lib/site";
import "./dashboard.css";

export const metadata: Metadata = {
  title: `Dashboard · ${site.name}`,
  robots: { index: false },
};

/* The student's home after sign-in. The site is a static export, so the page shell is static and the student's data
   loads in the browser (components/dashboard/Dashboard.tsx). */
export default function DashboardPage() {
  return <Dashboard />;
}
