import type { Metadata } from "next";
import { WaitlistPage } from "@/components/admin/pages";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Waitlist · Admin · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <WaitlistPage />;
}
