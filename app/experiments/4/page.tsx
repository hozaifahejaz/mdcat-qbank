import type { Metadata } from "next";
import Logo, { Markhor } from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { PublicFooter } from "@/components/public/Frame";
import Experience from "@/components/experiment4/Experience";
import Climb from "@/components/experiment4/Climb";
import Tracks from "@/components/experiment4/Tracks";
import { examCount } from "@/lib/catalogue";
import { plans } from "@/lib/billing";
import { site } from "@/lib/site";
import "../../landing-new.css";
import "./exp4.css";

/* Landing page experiment 4: "I'm preparing for ___". The visitor names their exam in the headline and the page
   answers for that exam: its paper, a question to try, and how to start. Then the climb (how it works), every track,
   prices and a short FAQ. The live landing page at / is unchanged. Noindex. */
export const metadata: Metadata = { title: `Experiment 4 · ${site.name}`, robots: { index: false, follow: false } };

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

const faqs = [
  { q: "Which exams are open today?", a: "PMDC MDCAT, NUMS MDCAT, the AKU test and FSc pre-medical. The other exams open track by track; leave your number on any of them and we'll tell you." },
  { q: "Will I see exams I'm not taking?", a: "No. You choose your exam when you sign up, and your account shows only that track." },
  { q: "Where do the questions come from?", a: "Each one is written for this bank from the official syllabus and checked against the textbook before it goes live." },
  { q: "Does it work on my phone?", a: "Yes, in any browser. iOS and Android apps are coming soon." },
];

export default function Experiment4() {
  return (
    <div className="x3 x4" id="top">
      <nav className="x3-nav">
        <div className="x3-wrap x3-navin">
          <Logo href="#top" size={22} />
          <ul>
            <li><a href="#try">Try a question</a></li>
            <li><a href="#how">How it works</a></li>
            <li><a href="#exams">Exams</a></li>
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
        <Climb />

        <section id="exams" className="x3-sec">
          <div className="x3-wrap">
            <div className="x3-head">
              <span className="x3-tag">{examCount} exams</span>
              <h2>Eight tracks.<br /><span className="mute">One account.</span></h2>
            </div>
            <Tracks />
          </div>
        </section>

        <section id="pricing" className="x3-sec">
          <div className="x3-wrap">
            <div className="x3-head">
              <span className="x3-tag">Pricing</span>
              <h2>Pay for your exam.<br /><span className="mute">Not for everyone else&apos;s.</span></h2>
            </div>
            <div className="x3-plans">
              <div className="x3-card plan">
                <h3>Free</h3>
                <p>See if it works for you.</p>
                <div className="price"><small>Rs.</small>0</div>
                <a className="x3-btn x3-blue" href="/signup">Start free</a>
                <ul>
                  <li><Check />100 questions in your track</li>
                  <li><Check />Every answer explained</li>
                  <li><Check />No card needed</li>
                </ul>
              </div>
              <div className="x3-card plan best">
                <span className="bolt" aria-hidden="true"><Markhor height={22} /></span>
                <h3>Season Pass</h3>
                <p>Your whole track until exam day.</p>
                <div className="price"><small>Rs.</small>{plans.season.price.toLocaleString("en-GB")}</div>
                <a className="x3-btn x3-white" href="/signup">Start free</a>
                <ul>
                  <li><Check />Every question in your track</li>
                  <li><Check />Mocks in your exam&apos;s pattern</li>
                  <li><Check />Bundles inside your track</li>
                </ul>
              </div>
              <div className="x3-card plan">
                <h3>One month</h3>
                <p>A last push before the paper.</p>
                <div className="price"><small>Rs.</small>{plans.monthly.price.toLocaleString("en-GB")}</div>
                <a className="x3-btn x3-blue" href="/signup">Start free</a>
                <ul>
                  <li><Check />Everything in the Season Pass</li>
                  <li><Check />30 days, no renewal</li>
                </ul>
              </div>
            </div>
            <p className="x3-note">Prices shown are for the pre-medical track. Each new track gets its own price when it opens.</p>
          </div>
        </section>

        <section id="faq" className="x3-sec">
          <div className="x3-wrap x3-faqwrap">
            <div className="x3-head">
              <span className="x3-tag">FAQ</span>
              <h2>Questions,<br /><span className="mute">answered.</span></h2>
            </div>
            <div className="x3-faq">
              {faqs.map((f, i) => (
                <details key={f.q} className="x3-card" open={i === 0}>
                  <summary>{f.q}<i aria-hidden="true" /></summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="x3-sec x4-end">
          <div className="x3-wrap">
            <h2>Your summit is waiting.</h2>
            <a className="x3-btn x3-blue x3-big" href="#top">Choose your exam</a>
          </div>
        </section>
      </main>

      <PublicFooter home="#top" />
    </div>
  );
}
