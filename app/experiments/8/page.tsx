import type { Metadata } from "next";
import Logo, { Markhor } from "@/components/Logo";
import Ahead, { AheadReading } from "@/components/Ahead";
import ThemeToggle from "@/components/ThemeToggle";
import { BuildTest, MockLog } from "@/components/landing/Live";
import { ExamMark, SubjectMark } from "@/components/Marks";
import { PublicFooter } from "@/components/public/Frame";
import Experience from "@/components/experiment4/Experience";
import { ExamProvider } from "@/components/experiment4/ExamState";
import Pricing from "@/components/experiment8/Pricing";
import { bankSize, subjects as subjectPages } from "@/lib/public";
import { site } from "@/lib/site";
import "../../landing-new.css";
import "../4/exp4.css";
import "./exp8.css";

/* Landing page experiment 8: the live landing page with two parts swapped in from earlier experiments. The hero is
   experiment 4's "I'm preparing for ___" with the area's tests as admit tickets, and the pricing is experiment 7's,
   with area chips over the plans (it follows the area picked in the hero). Every other section is the live landing
   page's, unchanged. The live landing page at / is untouched. Noindex. */
export const metadata: Metadata = { title: `Experiment 8 · ${site.name}`, robots: { index: false, follow: false } };

const subjects = [
  { name: "Biology", c: "#11804a" },
  { name: "Chemistry", c: "#2445ff" },
  { name: "Physics", c: "#b06a00" },
  { name: "English", c: "#8a63ff" },
  { name: "Logical Reasoning", c: "#c9a400" },
];
const outer = [
  { name: "PMDC MDCAT", id: "mdcat" }, { name: "NUMS", id: "nums" }, { name: "AKU", id: "aku" }, { name: "Past papers" },
  { name: "FSc Part 1", id: "fsc1" }, { name: "FSc Part 2", id: "fsc2" }, { name: "Timed mocks" }, { name: "My mistakes" },
];

const tests = [
  { name: "PMDC MDCAT", id: "mdcat", c: "#2f55f0", field: "Medical", live: true },
  { name: "NUMS MDCAT", id: "nums", c: "#b06a00", field: "Medical", live: true },
  { name: "AKU test", id: "aku", c: "#8a63ff", field: "Medical", live: true },
  { name: "ECAT", id: "ecat", field: "Engineering" },
  { name: "NUST NET", id: "net", field: "Engineering" },
  { name: "LAT", id: "lat", field: "Law" },
];

const faqs = [
  { q: "Is this a coaching course?", a: "No. It's a practice tool: MCQs, explanations, timed mocks and past papers, for a fraction of a course." },
  { q: "Is it free?", a: "100 questions are free with a full explanation on each, plus one mini mock. No card is needed. A paid plan opens the whole bank." },
  { q: "How many questions are there?", a: `${bankSize} original MCQs across Biology, Chemistry, Physics, English and Logical Reasoning, sorted by chapter for the PMDC MDCAT, NUMS and AKU syllabi.` },
  { q: "Where do the questions come from?", a: "Every question is written for this bank from the syllabus and its textbooks, then checked against the textbook." },
  { q: "Which tests do you cover?", a: "PMDC MDCAT, NUMS and the AKU test, plus FSc chapter practice. Engineering and law come later." },
  { q: "Does it follow the current syllabus?", a: "Yes. Questions are filed under the chapters of the PMDC MDCAT syllabus, with separate chapter lists for NUMS and AKU." },
  { q: "How do I pay?", a: site.payments ? "JazzCash, Easypaisa, card or bank transfer. One payment, no renewal." : "Payments open soon: JazzCash, Easypaisa, card or bank transfer, as one payment with no renewal. The free questions are open now." },
  { q: "Does it work on a phone?", a: "Yes. The site is built for phones first and works in any browser. iOS and Android apps are coming soon." },
];

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

export default function Experiment8() {
  return (
    <div className="x3 x4 x8" id="top">
      <ExamProvider>
      <nav className="x3-nav">
        <div className="x3-wrap x3-navin">
          <Logo href="#top" size={22} />
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#subjects">Subjects</a></li>
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

      <Experience />

      <main>
        <section id="features" className="x3-sec">
          <div className="x3-wrap">
            <div className="x3-head">
              <span className="x3-tag">Features</span>
              <h2>Practice the way <span className="hl">the paper asks.</span></h2>
            </div>
            <div className="x3-cards">
              <article className="x3-card">
                <h3>Every answer explained</h3>
                <p>Not just the key. The reason.</p>
                <div className="qmini" aria-hidden="true">
                  <b>Which organelle makes most of a cell&apos;s ATP?</b>
                  <span>Ribosome</span>
                  <span className="ok">Mitochondrion <Check /></span>
                  <span>Golgi body</span>
                  <span>Lysosome</span>
                </div>
              </article>
              <article className="x3-card">
                <h3>Build a test</h3>
                <p>Try it: turn subjects on or off.</p>
                <BuildTest />
              </article>
              <article className="x3-card">
                <h3>Timed mocks</h3>
                <p>180 MCQs in 3 hours, like the real paper.</p>
                <MockLog />
              </article>
            </div>
          </div>
        </section>

        <section id="subjects" className="x3-sec x3-grid">
          <div className="x3-wrap">
            <div className="x3-head">
              <h2>Every subject.<br />One bank.</h2>
            </div>
            <div className="orbit" aria-label="Subjects and banks">
              <div className="orb r2">
                {outer.map((o, i) => (
                  <span key={o.name} className="sat" style={{ ["--a" as string]: `${(360 / outer.length) * i}deg` }}><i>{o.id && <ExamMark id={o.id} size={16} />}{o.name}</i></span>
                ))}
              </div>
              <div className="orb r1">
                {subjects.map((s, i) => (
                  <span key={s.name} className="sat" style={{ ["--a" as string]: `${(360 / subjects.length) * i + 20}deg` }}><i><em style={{ color: s.c }}><SubjectMark subject={s.name} size={16} /></em>{s.name}</i></span>
                ))}
              </div>
              <div className="core"><Markhor height={52} /></div>
            </div>
            <p className="x3-links">
              {subjectPages.map((x) => <a key={x.slug} href={`/mdcat/${x.slug}`}>{x.name} MCQs</a>)}
              <a href="/mdcat/syllabus">Syllabus</a>
            </p>
          </div>
        </section>

        <section className="x3-sec" aria-labelledby="tests-h">
          <div className="x3-wrap">
            <div className="x3-head">
              <span className="x3-tag">Tests</span>
              <h2 id="tests-h">Three tests now.<br /><span className="mute">More every season.</span></h2>
            </div>
          </div>
          <div className="x3-marquee">
            <ul>
              {[0, 1].map((copy) => tests.map((t) => (
                <li key={copy + t.name} aria-hidden={copy === 1 || undefined} className="x3-card tcard">
                  <span className="thead">
                    <span className="tmark" style={t.c ? { color: t.c } : undefined}><ExamMark id={t.id} size={24} /></span>
                    <span className={t.live ? "st live" : "st"}>{t.live ? "Live" : "Coming soon"}</span>
                  </span>
                  <b>{t.name}</b>
                  <small>{t.field}</small>
                </li>
              )))}
            </ul>
          </div>
        </section>

        <Pricing payments={site.payments} />

        <section className="x3-sec">
          <div className="x3-wrap">
            <div className="x3-apps x3-card">
              <div>
                <span className="x3-tag">Apps</span>
                <h2>iOS and Android apps<br /><span className="mute">coming soon.</span></h2>
              </div>
              <div className="stores" aria-hidden="true">
                <span><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.4 2-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.6zM14.1 5.5c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.7-1.3z" /></svg>iOS<em>Soon</em></span>
                <span><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 9.5H6.5a1 1 0 0 0-1 1V17a1 1 0 0 0 1 1h1v2.5a1.25 1.25 0 0 0 2.5 0V18h4v2.5a1.25 1.25 0 0 0 2.5 0V18h1a1 1 0 0 0 1-1v-6.5a1 1 0 0 0-1-1zM4 9.5a1.25 1.25 0 0 0-1.25 1.25v5a1.25 1.25 0 0 0 2.5 0v-5A1.25 1.25 0 0 0 4 9.5zm16 0a1.25 1.25 0 0 0-1.25 1.25v5a1.25 1.25 0 0 0 2.5 0v-5A1.25 1.25 0 0 0 20 9.5zM15.2 4.6l1-1.6a.3.3 0 0 0-.5-.3l-1 1.6a6.2 6.2 0 0 0-5.4 0l-1-1.6a.3.3 0 0 0-.5.3l1 1.6A5.3 5.3 0 0 0 6.5 8.7h11a5.3 5.3 0 0 0-2.3-4.1zM9.5 7a.6.6 0 1 1 0-1.2.6.6 0 0 1 0 1.2zm5 0a.6.6 0 1 1 0-1.2.6.6 0 0 1 0 1.2z" /></svg>Android<em>Soon</em></span>
              </div>
            </div>
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
      </main>

      </ExamProvider>
      <PublicFooter home="#top" />
      <Ahead />
      <AheadReading />
    </div>
  );
}
