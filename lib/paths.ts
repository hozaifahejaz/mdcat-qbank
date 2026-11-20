/* Which addresses the app opens in place (components/Nav.tsx). The landing and sign-in pages have their own styles,
   so going to them is a normal page load. Kept apart from Nav so the sign-in page can ask without loading the app. */
export const OUTSIDE = /^\/($|signin|signup|forgot-password|reset-password|auth\/|api\/)/;

export function inAppPath(href: string) {
  const url = new URL(href, window.location.href);
  return url.origin === window.location.origin && !OUTSIDE.test(url.pathname) && !/\.[a-z0-9]+$/i.test(url.pathname);
}

/* Runs `f` once the page is really on screen. A page the browser builds ahead of a click (components/Ahead.tsx) must
   not act for the student, such as moving their account to this device, until they have actually opened it. */
export function whenShown(f: () => void) {
  const d = document as Document & { prerendering?: boolean };
  if (d.prerendering) document.addEventListener("prerenderingchange", f, { once: true });
  else f();
}
