import type { Metadata } from "next";
import Account from "@/components/auth/Account";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Your account · ${site.name}`, robots: { index: false } };

export default function AccountPage() {
  return <Account />;
}
