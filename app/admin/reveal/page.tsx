import type { Metadata } from "next";
import { RevealPage } from "@/components/admin/pages";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Reveal watermark · Admin · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <RevealPage />;
}
