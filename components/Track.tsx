"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/* Counts a page view for the admin Visitors page (server/visits.ts). Sends the path, where the visitor came from
   and any ?utm_source= or ?ref= tag; no cookie, nothing stored in the browser. The admin panel isn't counted. */
// document.referrer doesn't change on in-app navigation, so only the first view of a page load sends it.
let first = true;

export default function Track() {
  const path = usePathname();
  useEffect(() => {
    if (!path || path.startsWith("/admin")) return;
    const q = new URLSearchParams(window.location.search);
    const data = { path, referrer: first ? document.referrer : "", campaign: q.get("utm_source") ?? q.get("ref") ?? "" };
    fetch("/api/visit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data), keepalive: true, credentials: "same-origin" }).catch(() => {});
    first = false;
  }, [path]);
  return null;
}
