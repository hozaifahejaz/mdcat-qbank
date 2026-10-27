import type { Metadata } from "next";
import { RevealPage } from "@/components/admin/pages";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Reveal watermark · Admin · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <RevealPage />;
}
