import type { Metadata } from "next";
import { Markhor } from "@/components/Logo";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Page not found · ${site.name}`, robots: { index: false } };

/* Any address that doesn't exist (out/404.html, which Cloudflare Pages serves for unknown paths).
   Styled here, with no stylesheet of its own: Next adds this page's styles to every other page as well, so importing
   the app's stylesheets here made the landing and sign-in pages download them too. */
const pill: React.CSSProperties = { display: "inline-flex", alignItems: "center", height: 40, padding: "0 18px", borderRadius: "var(--r-btn, 999px)", fontSize: ".9375rem", fontWeight: 600, textDecoration: "none" };

export default function NotFound() {
  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeContent: "center", justifyItems: "center", gap: 14, textAlign: "center", padding: "24px 16px" }}>
      <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, fontWeight: 700, fontSize: "1.0625rem", letterSpacing: "-0.02em", color: "var(--ink)", textDecoration: "none" }}>
        <Markhor height={31} />
        {site.name}
      </a>
      <h1 style={{ fontSize: "clamp(2.25rem, 1.5rem + 3vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1.1, margin: "18px 0 0" }}>Page not found</h1>
      <p style={{ maxWidth: "34ch", margin: 0, color: "var(--muted)" }}>There&apos;s nothing at this address. It may have moved, or the link may be wrong.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        <a href="/" style={{ ...pill, background: "var(--cta, var(--ink))", color: "var(--on-cta, var(--bg))" }}>Go home</a>
        <a href="/dashboard" style={{ ...pill, background: "var(--card)", color: "var(--ink)", boxShadow: "inset 0 0 0 1px var(--line)" }}>Your dashboard</a>
      </div>
    </main>
  );
}
