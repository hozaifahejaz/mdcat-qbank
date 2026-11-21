import type { Metadata } from "next";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { PublicFooter } from "@/components/public/Frame";
import Experience from "@/components/experiment7/Experience";
import { ExamProvider } from "@/components/experiment7/ExamState";
import Climb from "@/components/experiment7/Climb";
import Motion from "@/components/experiment7/Motion";
import { Features, Pricing, Faq, End } from "@/components/experiment7/Sections";
import { site } from "@/lib/site";
import "../../landing-new.css";
import "./exp7.css";

/* Landing page experiment 7: experiment 4's page ("I'm preparing for ___", the whole page following the chosen area)
   in the same look, refined: a plain line under the headline saying what the area gets, a compact climb with a rail
   that fills as the markhor goes up, the nav marking the section on screen, a per-month figure on 3 months and a
   payment answer in the FAQ. The live landing page at / and experiment 4 are unchanged. Noindex. */
export const metadata: Metadata = { title: `Experiment 7 · ${site.name}`, robots: { index: false, follow: false } };

export default function Experiment7() {
  return (
    <div className="x3 x7" id="top">
      <ExamProvider>
      <nav className="x3-nav">
        <div className="x3-wrap x3-navin">
          <Logo href="#top" size={22} />
          <ul>
            <li><a href="#features">Inside</a></li>
            <li><a href="#how">How it works</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <div className="x3-navend">
            <ThemeToggle />
            <a className="x3-signin" href="/signin">Sign in</a>
            <a className="x3-btn x3-dark" href="/signup">Start free</a>
          </div>
        </div>
        <Motion />
      </nav>

        <main>
          <Experience />
          <Features />
          <Climb />
          <Pricing payments={site.payments} />
          <Faq payments={site.payments} />
          <End />
        </main>

      </ExamProvider>
      <PublicFooter home="#top" />
    </div>
  );
}
