/* Made by scripts/build-sw.mjs at build time; see that file for what is kept and why. */
const VERSION = __VERSION__;
const PAGES = new Set(__PAGES__);
const FILES = __FILES__;
const PREFIX = "app-";
const CACHE = PREFIX + VERSION;

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // A few at a time, so a phone on a slow connection isn't flooded while the student is using the page.
    for (let i = 0; i < FILES.length; i += 4) {
      await Promise.all(FILES.slice(i, i + 4).map(async (u) => {
        // Hashed files never change, so the browser's own copy will do; pages are always asked for afresh.
        const res = await fetch(u, { credentials: "same-origin", cache: u.startsWith("/_next/static/") ? "default" : "no-cache" });
        if (!res.ok || res.redirected) throw new Error(`could not keep ${u}`);
        await cache.put(u, res);
      }));
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // This set and the one before it stay (a tab may still be open on the older one); the rest go.
    const sets = (await caches.keys()).filter((k) => k.startsWith(PREFIX)).sort();
    await Promise.all(sets.slice(0, -2).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function page(key, request) {
  const hit = await (await caches.open(CACHE)).match(key, { ignoreSearch: true, ignoreVary: true });
  return hit ?? fetch(request);
}

async function asset(request) {
  const hit = await caches.match(request, { ignoreVary: true });
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok && res.type === "basic") {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
  }
  return res;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  // The router checks a page is there (a HEAD request) before moving to it: answered from the kept copy, without its body.
  if (request.method === "HEAD" && url.origin === self.location.origin && PAGES.has(url.pathname.replace(/(.)\/+$/, "$1"))) {
    return event.respondWith(page(url.pathname.replace(/(.)\/+$/, "$1"), request).then((res) => new Response(null, { status: res.status, statusText: res.statusText, headers: res.headers })));
  }
  if (request.method !== "GET") return;
  // Data always comes from the server, and so does everything that isn't ours.
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/_next/static/")) return event.respondWith(asset(request));
  const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
  // A signed-in page: opening it, and the look the router takes at it before moving there.
  if (PAGES.has(path)) return event.respondWith(page(path, request));
  if (request.mode === "navigate") return;
  // The page files the router asks for when moving between pages.
  if (path.endsWith(".txt")) {
    const owner = [...PAGES].some((p) => path === `${p}.txt` || path.startsWith(`${p}/`));
    if (owner) event.respondWith(page(path, request));
  }
});
