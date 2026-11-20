/* Writes out/sitemap.xml after `next build`, from the pages that were actually built.

   A page is listed when it names its own address (a canonical link) and does not ask to be left out of search
   (robots noindex). Its last-changed date is the one the page states (lib/public-meta.ts), so the list never
   drifts from the site: a new chapter or guide appears in it on the next build with nothing to remember. */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? (f === "_next" ? [] : walk(p)) : [p]; });
const pick = (html, re) => html.match(re)?.[1];

const pages = new Map();
for (const file of walk(OUT).filter((f) => f.endsWith(".html"))) {
  const html = readFileSync(file, "utf8");
  if (/<meta name="robots" content="[^"]*noindex/.test(html)) continue;
  const loc = pick(html, /<link rel="canonical" href="([^"]+)"/);
  if (!loc || pages.has(loc)) continue;
  pages.set(loc, pick(html, /<meta name="last-modified" content="([^"]+)"/));
}
if (pages.size < 6) throw new Error(`build-seo: only ${pages.size} pages found, which cannot be right`);

const depth = (u) => new URL(u).pathname.split("/").filter(Boolean).length;
const urls = [...pages.keys()].sort((a, b) => depth(a) - depth(b) || a.localeCompare(b));
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc>${pages.get(u) ? `<lastmod>${pages.get(u)}</lastmod>` : ""}</url>`).join("\n")}
</urlset>
`;
writeFileSync(join(OUT, "sitemap.xml"), xml);
/* The same list as plain lines, for the step that tells search engines what changed (.github/workflows/deploy.yml). */
writeFileSync(join(OUT, "urls.txt"), urls.join("\n") + "\n");
console.log(`sitemap.xml: ${urls.length} pages`);
