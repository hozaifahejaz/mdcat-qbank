import type { Metadata } from "next";
import Logo from "@/components/Logo";
import Ahead, { AheadReading } from "@/components/Ahead";
import ThemeToggle from "@/components/ThemeToggle";
import { PublicFooter } from "@/components/public/Frame";
import AppStory from "@/components/experiment8/AppStory";
import Range from "@/components/home/Range";
import Route, { Summit } from "@/components/home/Route";
import { abs, bankSize, faqData, ld } from "@/lib/public";
import { prices, site } from "@/lib/site";
import "./landing-new.css";
import "./landing-hero.css";
import "./landing-story.css";
import "./landing-areas.css";
import "./exam-page.css";
import "./home-range.css";

/* The home page: "Which exam are you climbing?" answered by a range of peaks, one per area, with the picked area's
   exams on the trail below; then how practicing works as a climb, the app walkthrough, the FAQ and a summit to start
   from. It sells nothing itself: each exam opens its own page (lib/exam-pages.ts) with its paper, a question to try
   and its price. */
export const metadata: Metadata = { alternates: { canonical: "/" } };

const faqs = [
  { q: "Is this a coaching course?", a: "No. It's a practice tool: MCQs, explanations, timed mocks and past papers, for a fraction of a course." },
  { q: "Is it free?", a: "100 questions are free with a full explanation on each, plus one mini mock. No card is needed. A paid plan opens the whole bank." },
  { q: "How many questions are there?", a: `${bankSize} original MCQs across Biology, Chemistry, Physics, English, Logical Reasoning and Mathematics, sorted by chapter for the PMDC MDCAT, NUMS and AKU syllabi.` },
  { q: "Where do the questions come from?", a: "Every question is written for this bank from the syllabus and its textbooks, then checked against the textbook." },
  { q: "Which tests do you cover?", a: "PMDC MDCAT, NUMS and the AKU test, plus FSc chapter practice. Engineering and law come later." },
  { q: "Does it follow the current syllabus?", a: "Yes. Questions are filed under the chapters of the PMDC MDCAT syllabus, with separate chapter lists for NUMS and AKU." },
  { q: "How do I pay?", a: site.payments ? `JazzCash, Easypaisa, card or bank transfer. Nothing is charged automatically, and renewing costs ${prices.renewOff}% less.` : `Payments open soon: JazzCash, Easypaisa, card or bank transfer. Nothing is charged automatically, and renewing costs ${prices.renewOff}% less. The free questions are open now.` },
  { q: "Does it work on a phone?", a: "Yes. The site is built for phones first and works in any browser. iOS and Android apps are coming soon." },
];

/* Who the site is, in the form search engines read: the organisation and the website. */
const who = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization", "@id": `${site.url}/#org`, name: site.name, url: site.url, logo: abs("/icons/icon-512.png"), email: site.supportEmail, areaServed: "PK",
      description: `${site.name} is an online question bank for Pakistani medical entry tests, with ${bankSize} original MCQs for the PMDC MDCAT, NUMS MDCAT and AKU test, a full explanation on every question, timed mocks and past papers.`,
    },
    { "@type": "WebSite", "@id": `${site.url}/#site`, name: site.name, url: site.url, inLanguage: "en", publisher: { "@id": `${site.url}/#org` } },
  ],
};

export default function Home() {
  return (
    <div className="x3 x4 x8 xr" id="top">
      <nav className="x3-nav">
        <div className="x3-wrap x3-navin">
          <Logo href="#top" size={22} />
          <ul>
            <li><a href="#top">Exams</a></li>
            <li><a href="#how">How it works</a></li>
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

      <Range />

      <main>
        <Route />

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
        <Summit line="Start with 100 free questions." button="Start free" href="/signup" note="No card needed." />
      </main>

      <PublicFooter home="#top" />
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(faqData(faqs))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(who)} />
      <Ahead />
      <AheadReading />
    </div>
  );
}
