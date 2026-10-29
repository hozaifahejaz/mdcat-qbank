import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { site } from "@/lib/site";

/* The frame for /terms, /privacy and /refunds: the public header, a readable column, and links between the three. */
export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="dash">
      <header className="dnav-wrap">
        <div className="dwrap">
          <div className="dnav">
            <Logo href="/" />
            <div className="dnav-end">
              <ThemeToggle />
              <a className="dpill light small" href="/signin">Sign in</a>
            </div>
          </div>
        </div>
      </header>
      <main className="dwrap">
        <article className="dcard legal">
          <h1>{title}</h1>
          <p className="muted small">Last updated {updated}</p>
          {children}
          <hr />
          <p className="muted small">
            Questions about this page? Email <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
            {" "}See also our <a href="/terms">Terms</a>, <a href="/privacy">Privacy policy</a> and <a href="/refunds">Refund policy</a>.
          </p>
        </article>
      </main>
    </div>
  );
}
