import { isLook } from "@/lib/look";

/* In the browser: put a look on the page now and remember it for the next page's first paint (app/layout.tsx). */
export function applyLook(look: unknown) {
  if (typeof document === "undefined" || !isLook(look)) return;
  if (document.documentElement.getAttribute("data-look") !== look) document.documentElement.setAttribute("data-look", look);
  try { localStorage.setItem("look", look); } catch {}
}
