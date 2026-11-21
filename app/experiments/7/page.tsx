import type { Metadata } from "next";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { PublicFooter } from "@/components/public/Frame";
import Story from "@/components/experiment7/Story";
import { AreaProvider } from "@/components/experiment7/State";
import { Seen, Areas, Pricing, Faq, End } from "@/components/experiment7/Sections";
import { site } from "@/lib/site";
import "../../landing-new.css";
import "./exp7.css";

/* Landing page experiment 7, in the site's own look (the .x3 landing style, markhor, area colours). The page opens
   with one phone beside the headline that stays with the visitor as they scroll and shows each step of practicing
   in turn (open a chapter, answer and see why, sit a mock, clear mistakes, watch progress), so the product explains
   itself. Then every area as a tile, prices by area (tapping a tile opens its prices), the FAQ and a short close.
   The live landing page at / and the other experiments are unchanged. Noindex. */
export const metadata: Metadata = { title: `Experiment 7 · ${site.name}`, robots: { index: false, follow: false } };

export default function Experiment7() {
  return (
    <div className="x3 x7" id="top">
      <AreaProvider>
        <nav className="x3-nav">
          <div className="x3-wrap x3-navin">
            <Logo href="#top" size={22} />
            <ul>
              <li><a href="#how">How it works</a></li>
              <li><a href="#areas">Areas</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
            <div className="x3-navend">
              <ThemeToggle />
              <a className="x3-signin" href="/signin">Sign in</a>
              <a className="x3-btn x3-dark" href="/signup">Start free</a>
            </div>
          </div>
        </nav>
        <main>
          <Story />
          <Areas />
          <Pricing payments={site.payments} />
          <Faq payments={site.payments} />
          <End />
        </main>
        <Seen />
      </AreaProvider>
      <PublicFooter home="#top" />
    </div>
  );
}
