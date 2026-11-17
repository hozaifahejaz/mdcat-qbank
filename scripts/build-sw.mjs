/* Writes out/sw.js after `next build`: the service worker that keeps the signed-in app on the student's device.

   What it keeps: the signed-in pages (their HTML and the page files the router asks for) and the script, style and
   font files those pages use. Nothing from /api is ever kept or answered by it, and the admin panel, the landing
   page and the sign-in pages are left to the network as before.

   Why a list made at build time: Cloudflare Pages only serves the files of the newest deploy, so a page kept from an
   older deploy must have every file it needs kept with it. Each deploy gets its own named set; the one before it is
   kept a while for tabs that are still open on it, older ones are deleted.

   To switch it off for everyone: deploy with `self.registration.unregister()` as the whole of out/sw.js. */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";
const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const url = (file) => "/" + relative(OUT, file).split(sep).map(encodeURIComponent).join("/");

/* The signed-in pages are the ones under app/(app). */
const routes = walk(join("app", "(app)")).filter((f) => f.endsWith("page.tsx"))
  .map((f) => "/" + relative(join("app", "(app)"), f).split(sep).slice(0, -1).join("/"));

const pages = [];
const pageFiles = [];
for (const r of routes) {
  const html = join(OUT, `${r}.html`);
  if (!existsSync(html)) throw new Error(`build-sw: ${html} is missing`);
  pages.push(r);
  pageFiles.push(html);
  if (existsSync(join(OUT, `${r}.txt`))) pageFiles.push(join(OUT, `${r}.txt`));
  const dir = join(OUT, r);
  if (existsSync(dir)) for (const f of readdirSync(dir)) if (f.endsWith(".txt")) pageFiles.push(join(dir, f));
}

/* Static files: everything the signed-in pages name, plus script and style files no page names at all (loaded on
   demand). Left out: files only other pages use, the old-browser fallback script, and fonts for other alphabets. */
const refs = (file) => new Set(readFileSync(file, "utf8").match(/\/_next\/static\/[A-Za-z0-9_\-./~!()%]+/g) ?? []);
const named = new Set(pageFiles.flatMap((f) => [...refs(f)]));
const others = new Set(walk(OUT).filter((f) => /\.(html|txt)$/.test(f) && !pageFiles.includes(f)).flatMap((f) => [...refs(f)]));
const legacy = new Set(pageFiles.filter((f) => f.endsWith(".html")).flatMap((f) => [...readFileSync(f, "utf8").matchAll(/<script src="([^"]+)" noModule/gi)].map((m) => m[1])));
const assets = walk(join(OUT, "_next", "static")).map(url).filter((u) => !legacy.has(u) && (named.has(u) || (!others.has(u) && /\.(js|css)$/.test(u))));

const files = [...pages, ...pageFiles.filter((f) => f.endsWith(".txt")).map(url), ...assets].sort();
const hash = createHash("sha256");
for (const f of [...pageFiles, ...assets.map((u) => join(OUT, decodeURIComponent(u)))]) hash.update(f).update(readFileSync(f));
/* Names sort by time, so the worker can tell which sets are the newest two. */
const version = `${Date.now().toString(36).padStart(9, "0")}-${hash.digest("hex").slice(0, 10)}`;

const worker = readFileSync(join("scripts", "sw-template.js"), "utf8")
  .replace("__VERSION__", JSON.stringify(version))
  .replace("__PAGES__", JSON.stringify(pages))
  .replace("__FILES__", JSON.stringify(files));
writeFileSync(join(OUT, "sw.js"), worker);
const bytes = [...pageFiles, ...assets.map((u) => join(OUT, decodeURIComponent(u)))].reduce((n, f) => n + statSync(f).size, 0);
console.log(`sw.js: ${files.length} files kept on the device (${Math.round(bytes / 1024)} KB before compression), version ${version}`);
