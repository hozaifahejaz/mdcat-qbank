/* The bar and footer every public page shares. Kept apart from Shell.tsx so pages that run in the browser
   (pricing) can use them without carrying the study pages' data. */
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { site } from "@/lib/site";

/* The footer every public page shares: the links here are how search engines and students find the study pages. */
export function PublicFooter({ home = "/" }: { home?: string }) {
  return (
    <footer className="x3-foot">
      <div className="x3-wrap">
        <div className="x3-footin wide">
          <div>
            <Logo href={home} size={22} />
            <p>Start practicing<br />today.</p>
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
            <li><a href="/contact">Contact</a></li>
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
export function PublicNav({ inside = false, start = "/signup" }: { inside?: boolean; start?: string }) {
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
            <a className="x3-btn x3-dark" href={start}>Start free</a>
          </>}
        </div>
      </div>
    </nav>
  );
}
