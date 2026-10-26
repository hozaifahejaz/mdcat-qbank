import type { Metadata } from "next";
import Account from "@/components/auth/Account";
import { site } from "@/lib/site";
import "../auth.css";

export const metadata: Metadata = { title: `Your account · ${site.name}`, robots: { index: false } };

export default function AccountPage() {
  return <Account />;
}
