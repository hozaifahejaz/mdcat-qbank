"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { whenShown } from "@/lib/paths";

/* Counts a page view for the admin Visitors page (server/visits.ts). Sends the path, where the visitor came from
   and any ?utm_source= or ?ref= tag; no cookie, nothing stored in the browser. The admin panel isn't counted. */
// document.referrer doesn't change on in-app navigation, so only the first view of a page load sends it, marked as
// the page the visit started on.
let first = true;

export default function Track() {
  const path = usePathname();
  useEffect(() => {
    if (!path || path.startsWith("/admin")) return;
    const q = new URLSearchParams(window.location.search);
    const data = { path, entry: first, referrer: first ? document.referrer : "", campaign: q.get("utm_source") ?? q.get("ref") ?? "" };
    // Sent once the page has settled, so the count never competes with the page's own requests.
    const send = () => fetch("/api/visit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data), keepalive: true, credentials: "same-origin" }).catch(() => {});
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const later = () => { if (w.requestIdleCallback) w.requestIdleCallback(send, { timeout: 3000 }); else setTimeout(send, 800); };
    // A page the browser loads ahead of a click (the landing page asks it to) counts once it is actually opened.
    whenShown(later);
    first = false;
  }, [path]);
  return null;
}
