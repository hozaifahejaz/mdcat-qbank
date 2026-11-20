import type { Metadata } from "next";
import NotFoundLazy from "@/components/NotFoundLazy";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Page not found · ${site.name}`, robots: { index: false } };

/* Any address that doesn't exist (out/404.html, which Cloudflare Pages serves for unknown paths).
   The page itself is components/NotFoundPage.tsx, loaded only here (see components/NotFoundLazy.tsx). */
export default function NotFound() {
  return <NotFoundLazy />;
}
