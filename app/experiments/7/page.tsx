import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { PublicFooter } from "@/components/public/Frame";
import { AreaProvider } from "@/components/experiment7/State";
import TopoMap from "@/components/experiment7/TopoMap";
import Range from "@/components/experiment7/Range";
import { Seen, Route, Pricing, Faq, End } from "@/components/experiment7/Sections";
import { site } from "@/lib/site";
import "./exp7.css";

/* Landing page experiment 7: "The range". The page reads like a plate from a survey atlas. Every area the site covers
   (pre-medical, engineering, residency, law, postgraduate, government jobs, O and A Levels, study abroad) is a peak on
   a contour map; the headline, the route, the prices and the FAQ all follow the peak you pick, and the markhor hops
   to it. A serif for the headings, survey lines for the art, the brand blue for action. The live landing page at / and
   the other experiments are unchanged. Noindex. */
export const metadata: Metadata = { title: `Experiment 7 · ${site.name}`, robots: { index: false, follow: false } };

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--x7-serif" });

export default function Experiment7() {
  return (
    <div className={serif.variable}>
      <AreaProvider>
        <nav className="x7-nav">
          <div className="x7-wrap x7-navin">
            <Logo href="#top" size={22} />
            <ul>
              <li><a href="#range">The range</a></li>
              <li><a href="#route">How it works</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
            <div className="x7-navend">
              <ThemeToggle />
              <a className="x7-signin" href="/signin">Sign in</a>
              <a className="x7-btn x7-ink" href="/signup">Start free</a>
            </div>
          </div>
        </nav>
        <main>
          <Range map={<TopoMap />} />
          <Route />
          <Pricing payments={site.payments} />
          <Faq payments={site.payments} />
          <End />
        </main>
        <Seen />
        <PublicFooter home="#top" />
      </AreaProvider>
    </div>
  );
}
