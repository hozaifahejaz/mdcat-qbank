import type { Metadata } from "next";
import { checked } from "@/lib/public";
import { site } from "@/lib/site";

/* The search details of a public page: its own title and description, its address, how it looks when shared, and
   the date its facts were last checked (scripts/build-seo.mjs reads that for the sitemap). */
export function pageMeta({ title, description, path, updated = checked }: { title: string; description: string; path: string; updated?: string }): Metadata {
  const full = `${title} | ${site.name}`;
  return {
    title: full,
    description,
    alternates: { canonical: path },
    openGraph: { type: "article", siteName: site.name, title: full, description, url: path, images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }] },
    other: { "last-modified": updated },
  };
}
