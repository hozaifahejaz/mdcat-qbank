import type { Metadata } from "next";
import { WaitlistPage } from "@/components/admin/pages";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Waitlist · Admin · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <WaitlistPage />;
}
