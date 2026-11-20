import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { type Crumb, crumbData, ld } from "@/lib/public";
import { site } from "@/lib/site";

/* The footer every public page shares: the links here are how search engines and students find the study pages. */
export function PublicFooter({ home = "/" }: { home?: string }) {
  return (
    <footer className="x3-foot">
      <div className="x3-wrap">
        <div className="x3-footin wide">
          <div>
            <Logo href={home} size={22} />
            <p>Start practicing before<br />MDCAT {site.season}.</p>
          </div>
          <ul>
            <li><b>Prepare</b></li>
            <li><a href="/mdcat">MDCAT MCQs</a></li>
            <li><a href="/nums-mdcat">NUMS MDCAT</a></li>
            <li><a href="/aku-test">AKU test</a></li>
            <li><a href="/mdcat/syllabus">Syllabus</a></li>
            <li><a href="/mdcat/past-paper-2026">2026 paper</a></li>
          </ul>
          <ul>
            <li><b>Tools and guides</b></li>
            <li><a href="/mdcat/aggregate-calculator">Aggregate calculator</a></li>
            <li><a href="/guides">Guides</a></li>
            <li><a href="/pricing">Pricing</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/signin">Sign in</a></li>
          </ul>
          <ul>
            <li><b>Legal</b></li>
            <li><a href="/privacy">Privacy</a></li>
            <li><a href="/terms">Terms</a></li>
            <li><a href="/refunds">Refunds</a></li>
          </ul>
        </div>
        <p className="x3-fine">Not affiliated with PMDC, NUMS or any university. © {new Date().getFullYear()} {site.name}</p>
      </div>
    </footer>
  );
}

/* The bar at the top of every public page. A visitor this browser knows is signed in gets a way back to the app. */
export function PublicNav({ inside = false }: { inside?: boolean }) {
  return (
    <nav className="x3-nav">
      <div className="x3-wrap x3-navin">
        <Logo href="/" size={22} />
        <ul>
          <li><a href="/mdcat">MDCAT</a></li>
          <li><a href="/nums-mdcat">NUMS</a></li>
          <li><a href="/aku-test">AKU</a></li>
          <li><a href="/guides">Guides</a></li>
          <li><a href="/pricing">Pricing</a></li>
        </ul>
        <div className="x3-navend">
          <ThemeToggle />
          {inside ? <a className="x3-btn x3-dark" href="/dashboard">Dashboard</a> : <>
            <a className="x3-signin" href="/signin">Sign in</a>
            <a className="x3-btn x3-dark" href="/signup">Start free</a>
          </>}
        </div>
      </div>
    </nav>
  );
}

/* The frame of a public study page: the landing page's bar, a trail of links, the page, a closing invitation and
   the shared footer. Plain HTML with no script of its own, so it reads the same to a person and a crawler. */
export default function Shell({ trail, children, cta = true, article = false }: { trail: Crumb[]; children: React.ReactNode; cta?: boolean; article?: boolean }) {
  return (
    <div className={`x3 pub${article ? " pub-article" : ""}`} id="top">
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
      {trail.length > 1 && <script type="application/ld+json" dangerouslySetInnerHTML={ld(crumbData(trail))} />}
    </div>
  );
}
