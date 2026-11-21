import type { Metadata } from "next";
import Logo, { Markhor } from "@/components/Logo";
import Ahead, { AheadReading } from "@/components/Ahead";
import ThemeToggle from "@/components/ThemeToggle";
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

        <Pricing payments={site.payments} />

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
        <section className="x3-sec x8-end">
          <div className="x3-wrap">
            <div className="x3-card x8-endcard">
              <span className="x8-endmark" aria-hidden="true"><Markhor height={56} /></span>
              <h2>Start where you are.<br /><span className="mute">The first 100 questions are free.</span></h2>
              <a className="x3-btn x3-blue x3-big" href="/signup">Start free</a>
              <small>iOS and Android apps coming soon.</small>
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
