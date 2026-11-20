import type { Metadata } from "next";
import { TicketsPage } from "@/components/admin/pages";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Support tickets · Admin · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <TicketsPage />;
}
