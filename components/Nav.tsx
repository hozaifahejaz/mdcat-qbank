"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/* Moves between signed-in pages without reloading the site: a click on an ordinary link swaps the page in place,
   and pointing at (or touching) a link fetches that page ahead of the click. Links stay plain <a> everywhere.
   The landing and sign-in pages have their own styles, so going to or from them is still a normal page load. */
const OUTSIDE = /^\/($|signin|signup|forgot-password|reset-password|auth\/|api\/)/;

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
    const fetched = new Set<string>();
    const warm = (e: Event) => {
      const l = linkOf(e);
      if (!l || fetched.has(l.url.pathname)) return;
      fetched.add(l.url.pathname);
      r.prefetch(l.url.pathname + l.url.search);
    };
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
      document.removeEventListener("pointerover", warm);
      document.removeEventListener("touchstart", warm);
      document.removeEventListener("focusin", warm);
      document.removeEventListener("click", click);
    };
  }, [r]);
  return null;
}
