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
import { abs, bankSize, faqData, ld, subjects as subjectPages } from "@/lib/public";
import { site } from "@/lib/site";
import "./landing-new.css";
import "./experiments/4/exp4.css";
import "./experiments/7/exp7.css";
import "./experiments/8/exp8.css";

/* The landing page (from experiment 8): the "I'm preparing for ___" hero with the area's tests as admit tickets, the
   subjects orbit, pricing and the app walkthrough, each following the area picked in the hero, then the FAQ. Anything
   not open yet (tests, and every area but pre-medical) says "Coming soon". */
export const metadata: Metadata = { alternates: { canonical: "/" } };

const faqs = [
  { q: "Is this a coaching course?", a: "No. It's a practice tool: MCQs, explanations, timed mocks and past papers, for a fraction of a course." },
  { q: "Is it free?", a: "100 questions are free with a full explanation on each, plus one mini mock. No card is needed. A paid plan opens the whole bank." },
  { q: "How many questions are there?", a: `${bankSize} original MCQs across Biology, Chemistry, Physics, English and Logical Reasoning, sorted by chapter for the PMDC MDCAT, NUMS and AKU syllabi.` },
  { q: "Where do the questions come from?", a: "Every question is written for this bank from the syllabus and its textbooks, then checked against the textbook." },
  { q: "Which tests do you cover?", a: "PMDC MDCAT, NUMS and the AKU test, plus FSc chapter practice. Engineering and law come later." },
  { q: "Does it follow the current syllabus?", a: "Yes. Questions are filed under the chapters of the PMDC MDCAT syllabus, with separate chapter lists for NUMS and AKU." },
  { q: "How do I pay?", a: site.payments ? "JazzCash, Easypaisa, card or bank transfer. Renewing costs less than your first plan." : "Payments open soon: JazzCash, Easypaisa, card or bank transfer. Renewing costs less than your first plan. The free questions are open now." },
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

      <Experience soon />

      <main>
        <section id="subjects" className="x3-sec x3-grid">
          <div className="x3-wrap">
            <div className="x3-head">
              <h2>Every subject.<br />One bank.</h2>
            </div>
            <Orbit soon links={
              <p className="x3-links">
                {subjectPages.map((x) => <a key={x.slug} href={`/mdcat/${x.slug}`}>{x.name} MCQs</a>)}
                <a href="/mdcat/syllabus">Syllabus</a>
              </p>
            } />
          </div>
        </section>

        <Pricing payments={site.payments} soon />

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
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(faqData(faqs))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(who)} />
      <Ahead />
      <AheadReading />
    </div>
  );
}
