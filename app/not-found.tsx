import type { Metadata } from "next";
import Logo from "@/components/Logo";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Page not found · ${site.name}`, robots: { index: false } };

/* Any address that doesn't exist (out/404.html, which Cloudflare Pages serves for unknown paths). */
export default function NotFound() {
  return (
    <div className="dash">
      <main className="dwrap lost">
        <Logo href="/" />
        <h1>Page not found</h1>
        <p className="muted">There&apos;s nothing at this address. It may have moved, or the link may be wrong.</p>
        <div className="hello-ctas">
          <a className="dpill dark small" href="/">Go home</a>
          <a className="dpill light small" href="/dashboard">Your dashboard</a>
        </div>
      </main>
    </div>
  );
}
