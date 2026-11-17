import type { Metadata } from "next";
import Dashboard from "@/components/dashboard/Dashboard";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Dashboard · ${site.name}`,
  robots: { index: false },
};

/* The student's home after sign-in. The site is a static export, so the page shell is static and the student's data
   loads in the browser (components/dashboard/Dashboard.tsx). The frame and the sign-in check are the layout's. */
export default function DashboardPage() {
  return <Dashboard />;
}
