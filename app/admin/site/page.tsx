import type { Metadata } from "next";
import { SiteThemePage } from "@/components/admin/pages";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Site theme · Admin · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <SiteThemePage />;
}
