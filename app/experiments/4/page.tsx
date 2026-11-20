import type { Metadata } from "next";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { PublicFooter } from "@/components/public/Frame";
import Experience from "@/components/experiment4/Experience";
import { ExamProvider } from "@/components/experiment4/ExamState";
import Climb from "@/components/experiment4/Climb";
import { Features, Pricing, Faq, End } from "@/components/experiment4/Sections";
import { site } from "@/lib/site";
import "../../landing-new.css";
import "./exp4.css";

/* Landing page experiment 4: "I'm preparing for ___". The visitor names their area (medical college, engineering,
   residency...) in the headline and the whole page then speaks to that area alone, using the main landing page's
   sections: its tests (hero cards), a look inside the account, the climb, its own prices and FAQ, each said once. The live landing page at / is unchanged. Noindex. */
export const metadata: Metadata = { title: `Experiment 4 · ${site.name}`, robots: { index: false, follow: false } };

export default function Experiment4() {
  return (
    <div className="x3 x4" id="top">
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
      </nav>

        <main>
          <Experience />
          <Features />
          <Climb />
          <Pricing payments={site.payments} />
          <Faq />
          <End />
        </main>

      </ExamProvider>
      <PublicFooter home="#top" />
    </div>
  );
}
