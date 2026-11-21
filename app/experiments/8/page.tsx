import type { Metadata } from "next";
import Logo from "@/components/Logo";
import Ahead, { AheadReading } from "@/components/Ahead";
import ThemeToggle from "@/components/ThemeToggle";
import { PublicFooter } from "@/components/public/Frame";
import Experience from "@/components/experiment4/Experience";
import { ExamProvider } from "@/components/experiment4/ExamState";
import Pricing from "@/components/experiment8/Pricing";
import AppStory from "@/components/experiment8/AppStory";
import Orbit from "@/components/experiment8/Orbit";
import HeroIcons from "@/components/experiment8/HeroIcons";
import { bankSize, subjects as subjectPages } from "@/lib/public";
import { site } from "@/lib/site";
import "../../landing-new.css";
import "../4/exp4.css";
import "../7/exp7.css";
import "./exp8.css";

/* Landing page experiment 8: the live landing page with two parts swapped in from earlier experiments. The hero is
   experiment 4's "I'm preparing for ___" with the area's tests as admit tickets, and the pricing is experiment 7's,
   priced for the area picked in the hero, then its app walkthrough. Every other section is the live landing
   page's, unchanged. The live landing page at / is untouched. Noindex. */
export const metadata: Metadata = { title: `Experiment 8 · ${site.name}`, robots: { index: false, follow: false } };

const faqs = [
  { q: "Is this a coaching course?", a: "No. It's a practice tool: MCQs, explanations, timed mocks and past papers, for a fraction of a course." },
  { q: "Is it free?", a: "100 questions are free with a full explanation on each, plus one mini mock. No card is needed. A paid plan opens the whole bank." },
  { q: "How many questions are there?", a: `${bankSize} original MCQs across Biology, Chemistry, Physics, English and Logical Reasoning, sorted by chapter for the PMDC MDCAT, NUMS and AKU syllabi.` },
  { q: "Where do the questions come from?", a: "Every question is written for this bank from the syllabus and its textbooks, then checked against the textbook." },
  { q: "Which tests do you cover?", a: "PMDC MDCAT, NUMS and the AKU test, plus FSc chapter practice. Engineering and law come later." },
  { q: "Does it follow the current syllabus?", a: "Yes. Questions are filed under the chapters of the PMDC MDCAT syllabus, with separate chapter lists for NUMS and AKU." },
  { q: "How do I pay?", a: site.payments ? "JazzCash, Easypaisa, card or bank transfer. The 3-month plan renews for less." : "Payments open soon: JazzCash, Easypaisa, card or bank transfer. The 3-month plan renews for less. The free questions are open now." },
  { q: "Does it work on a phone?", a: "Yes. The site is built for phones first and works in any browser. iOS and Android apps are coming soon." },
];

export default function Experiment8() {
  return (
    <div className="x3 x4 x8" id="top">
      <ExamProvider>
      <nav className="x3-nav">
        <div className="x3-wrap x3-navin">
          <Logo href="#top" size={22} />
          <ul>
            <li><a href="#subjects">Subjects</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#app">App</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <div className="x3-navend">
            <ThemeToggle />
            <a className="x3-signin" href="/signin">Sign in</a>
            <a className="x3-btn x3-dark" href="/signup">Start free</a>
          </div>
        </div>
      </nav>

      <div className="x8-herowrap">
        <HeroIcons />
        <Experience />
      </div>

      <main>
        <section id="subjects" className="x3-sec x3-grid">
          <div className="x3-wrap">
            <div className="x3-head">
              <h2>Every subject.<br />One bank.</h2>
            </div>
            <Orbit links={
              <p className="x3-links">
                {subjectPages.map((x) => <a key={x.slug} href={`/mdcat/${x.slug}`}>{x.name} MCQs</a>)}
                <a href="/mdcat/syllabus">Syllabus</a>
              </p>
            } />
          </div>
        </section>

        <Pricing payments={site.payments} />

        <AppStory />

        <section id="faq" className="x3-sec">
          <div className="x3-wrap x3-faqwrap">
            <div className="x3-head">
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
      </main>

      </ExamProvider>
      <PublicFooter home="#top" />
      <Ahead />
      <AheadReading />
    </div>
  );
}
