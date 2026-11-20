import type { Metadata } from "next";
import { BankPage } from "@/components/admin/pages";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Bank health · Admin · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <BankPage />;
}
