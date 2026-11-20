import Ahead, { AheadReading } from "@/components/Ahead";
import { PublicFooter, PublicNav } from "@/components/public/Frame";
import { type Crumb, crumbData, ld } from "@/lib/public";

export { PublicFooter, PublicNav };

/* The frame of a public study page: the landing page's bar, a trail of links, the page, a closing invitation and
   the shared footer. Plain HTML with no script of its own, so it reads the same to a person and a crawler; the build
   then ships it without the framework's script (scripts/build-light.mjs). A page with a live part passes plain={false}. */
export default function Shell({ trail, children, cta = true, article = false, plain = true }: { trail: Crumb[]; children: React.ReactNode; cta?: boolean; article?: boolean; plain?: boolean }) {
  return (
    <div className={`x3 pub${article ? " pub-article" : ""}`} id="top" data-plain={plain ? "1" : undefined}>
      <PublicNav />
      <main className="x3-wrap pub-main">
        {trail.length > 1 && (
          <nav className="crumbs" aria-label="You are here">
            {trail.map((c, i) => (i < trail.length - 1 ? <span key={c.href}><a href={c.href}>{c.name}</a><i aria-hidden="true">/</i></span> : <span key={c.href} aria-current="page">{c.name}</span>))}
          </nav>
        )}
        {children}
        {cta && (
          <aside className="pub-cta x3-card">
            <div>
              <h2>Practice the rest in the app</h2>
              <p>100 questions are free, each with a full explanation. No card needed.</p>
            </div>
            <a className="x3-btn x3-blue x3-big" href="/signup">Start free</a>
          </aside>
        )}
      </main>
      <PublicFooter />
      <Ahead />
      <AheadReading />
      {trail.length > 1 && <script type="application/ld+json" dangerouslySetInnerHTML={ld(crumbData(trail))} />}
    </div>
  );
}
