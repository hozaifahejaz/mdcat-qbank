"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { seen } from "@/lib/cache";
import { lastUser } from "@/lib/user";
import { warmCatalog, warmHistory } from "@/lib/study";
import { warmPage } from "@/lib/warm";
import { OUTSIDE } from "@/lib/paths";

/* Moves between signed-in pages without reloading the site: a click on an ordinary link swaps the page in place,
   and pointing at (or touching) a link fetches that page ahead of the click. Links stay plain <a> everywhere.
   The landing and sign-in pages have their own styles, so going to or from them is still a normal page load. */

/* The signed-in pages. Their page files are fetched in a quiet moment after the first page shows, so a click swaps the
   page at once instead of waiting on the network first (on a phone, a touch comes only a moment before the tap).
   Fetched again every few minutes while the tab is open, since the router only trusts its copies for five. */
const PAGES = ["/dashboard", "/practice", "/mocks", "/past-papers", "/progress", "/mistakes", "/history", "/test", "/review", "/account", "/account/billing", "/pricing"];
const REFETCH_MS = 4 * 60 * 1000;

const idle = (f: () => void) => {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(f, { timeout: 2000 });
  else setTimeout(f, 300);
};

let registered = false;

type Router = ReturnType<typeof useRouter>;
let router: Router | null = null;

function inApp(url: URL) {
  return url.origin === window.location.origin && !OUTSIDE.test(url.pathname) && !OUTSIDE.test(window.location.pathname) && !/\.[a-z0-9]+$/i.test(url.pathname);
}

/* For code that used to set window.location: the same move, without the reload when both ends are in the app. */
export function go(href: string, replace = false) {
  const url = new URL(href, window.location.href);
  if (router && inApp(url) && url.pathname !== window.location.pathname) {
    if (replace) router.replace(url.pathname + url.search + url.hash);
    else router.push(url.pathname + url.search + url.hash);
  } else if (replace) window.location.replace(href);
  else window.location.assign(href);
}

function linkOf(e: Event): { a: HTMLAnchorElement; url: URL } | null {
  const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!a || a.target || a.hasAttribute("download") || a.getAttribute("rel")?.includes("external")) return null;
  const url = new URL(a.href, window.location.href);
  // The same page with another query still reloads: screens read their address once, when they open.
  if (!inApp(url) || url.pathname === window.location.pathname) return null;
  return { a, url };
}

export default function Nav() {
  const r = useRouter();
  useEffect(() => {
    router = r;
    const warm = (e: Event) => {
      const l = linkOf(e);
      if (!l) return;
      // The page itself is usually fetched already (below), in which case this costs nothing. Its numbers are fetched
      // now, unless they were a moment ago.
      r.prefetch(l.url.pathname + l.url.search);
      warmPage(l.url.pathname, l.url.search);
    };
    // Only on signed-in pages: the landing and sign-in pages don't need the app.
    let last = 0;
    const ahead = () => {
      if (OUTSIDE.test(window.location.pathname) || !lastUser() || document.visibilityState !== "visible") return;
      if (Date.now() - last < REFETCH_MS) return;
      last = Date.now();
      idle(() => {
        for (const p of PAGES) r.prefetch(p);
        // The numbers most pages open with, once a session, if this tab has never had them.
        if (seen("history", true) === undefined) warmHistory();
        if (seen("catalog:mdcat", true) === undefined) warmCatalog("mdcat");
        if (seen("dashboard", true) === undefined) warmPage("/dashboard");
        // Keeps the app's own files on this device (out/sw.js, made by scripts/build-sw.mjs), so the next visit opens
        // from the device and only the student's numbers cross the network. Signed-in pages only.
        if (!registered && "serviceWorker" in navigator) {
          registered = true;
          navigator.serviceWorker.register("/sw.js").catch(() => {});
        }
      });
    };
    ahead();
    // Checked often so a tab that has only just learnt who is signed in starts soon; it does nothing until it's due.
    const timer = setInterval(ahead, 2000);
    document.addEventListener("visibilitychange", ahead);
    const click = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const l = linkOf(e);
      if (!l) return;
      e.preventDefault();
      r.push(l.url.pathname + l.url.search + l.url.hash);
    };
    document.addEventListener("pointerover", warm, { passive: true });
    document.addEventListener("touchstart", warm, { passive: true });
    document.addEventListener("focusin", warm);
    document.addEventListener("click", click);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", ahead);
      document.removeEventListener("pointerover", warm);
      document.removeEventListener("touchstart", warm);
      document.removeEventListener("focusin", warm);
      document.removeEventListener("click", click);
    };
  }, [r]);
  return null;
}
