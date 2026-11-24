import Ahead, { AheadReading } from "@/components/Ahead";
import { PublicFooter, PublicNav } from "@/components/public/Frame";
import { type Crumb, crumbData, ld } from "@/lib/public";
import { signupHref } from "@/lib/exams";

export { PublicFooter, PublicNav };

/* The frame of a public study page: the landing page's bar, a trail of links, the page, a closing invitation and
   the shared footer. Plain HTML with no script of its own, so it reads the same to a person and a crawler; the build
   then ships it without the framework's script (scripts/build-light.mjs). A page with a live part passes plain={false}. */
export default function Shell({ trail, children, cta = true, article = false, plain = true }: { trail: Crumb[]; children: React.ReactNode; cta?: boolean; article?: boolean; plain?: boolean }) {
  // A page about one test sends its visitor into sign-up with that test already picked (lib/exams.ts).
  const here = trail.at(-1)?.href ?? "";
  const exam = /^\/mdcat(\/|$)/.test(here) ? "mdcat" : here.startsWith("/nums-mdcat") ? "nums" : here.startsWith("/aku-test") ? "aku" : undefined;
  const start = exam ? signupHref({ area: "medical", exam }) : "/signup";
  return (
    <div className={`x3 pub${article ? " pub-article" : ""}`} id="top" data-plain={plain ? "1" : undefined}>
      <PublicNav start={start} />
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
            <a className="x3-btn x3-blue x3-big" href={start}>Start free</a>
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
