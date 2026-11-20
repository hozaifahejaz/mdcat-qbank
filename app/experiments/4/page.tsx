import type { Metadata } from "next";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { PublicFooter } from "@/components/public/Frame";
import Experience, { Try } from "@/components/experiment4/Experience";
import { ExamProvider } from "@/components/experiment4/ExamState";
import Climb from "@/components/experiment4/Climb";
import Tracks from "@/components/experiment4/Tracks";
import { Pricing, Faq, End } from "@/components/experiment4/Sections";
import { plans } from "@/lib/billing";
import { site } from "@/lib/site";
import "../../landing-new.css";
import "./exp4.css";

/* Landing page experiment 4: "I'm preparing for ___". The visitor names their exam in the headline and the whole page
   then speaks to that exam alone: its paper, a question from it, the climb to its exam day, the related exams in its
   track, its price, its FAQ. The live landing page at / is unchanged. Noindex. */
export const metadata: Metadata = { title: `Experiment 4 · ${site.name}`, robots: { index: false, follow: false } };

export default function Experiment4() {
  return (
    <div className="x3 x4" id="top">
      <ExamProvider>
      <nav className="x3-nav">
        <div className="x3-wrap x3-navin">
          <Logo href="#top" size={22} />
          <ul>
            <li><a href="#try">Try a question</a></li>
            <li><a href="#how">How it works</a></li>
            <li><a href="#exams">Related exams</a></li>
            <li><a href="#pricing">Pricing</a></li>
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
          <Try />
          <Climb />
          <Tracks />
          <Pricing season={plans.season.price} monthly={plans.monthly.price} />
          <Faq />
          <End />
        </main>

      </ExamProvider>
      <PublicFooter home="#top" />
    </div>
  );
}
