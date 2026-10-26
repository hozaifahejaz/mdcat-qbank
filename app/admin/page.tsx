import type { Metadata } from "next";
import AdminScreen from "@/components/screens/AdminScreen";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Question review · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <AdminScreen />;
}
