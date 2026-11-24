import type { Metadata } from "next";
import { TestPage } from "@/components/admin/pages";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Test as a student · Admin · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <TestPage />;
}
