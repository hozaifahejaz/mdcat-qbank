import type { Metadata } from "next";
import DeviceGate from "@/components/auth/DeviceGate";
import Dashboard from "@/components/dashboard/Dashboard";
import { site } from "@/lib/site";
import "../auth.css";
import "./dashboard.css";

export const metadata: Metadata = {
  title: `Dashboard · ${site.name}`,
  robots: { index: false },
};

/* The student's home after sign-in. The site is a static export, so the page shell is static and the student's data
   loads in the browser (components/dashboard/Dashboard.tsx). DeviceGate sends signed-out visitors to /signin and
   shows the lock screen when another device is active. */
export default function DashboardPage() {
  return (
    <DeviceGate>
      <Dashboard />
    </DeviceGate>
  );
}
