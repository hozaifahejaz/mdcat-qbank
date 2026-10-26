import { IBM_Plex_Mono, Schibsted_Grotesk } from "next/font/google";
import AnswerSheet from "@/components/landing/AnswerSheet";
import ThemeToggle from "@/components/ThemeToggle";
import { prices, site } from "@/lib/site";
import "./landing.css";

const display = Schibsted_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-display" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-mono" });

/* The site launches with MDCAT. The brand covers every entry test, so the others are listed as coming. */
const tests = [
  { name: "MDCAT", live: true },
  { name: "NUMS", live: false },
  { name: "ECAT", live: false },
  { name: "NET", live: false },
  { name: "LAT", live: false },
];

const features = [
  { title: "By chapter", text: "Every chapter of the PMDC syllabus." },
  { title: "Full mocks", text: "180 MCQs in 3 hours, like the real paper." },
  { title: "Weak spots", text: "See which chapters to fix next." },
];

const faqs = [
  { q: "Is this a coaching course?", a: "No. It's practice: MCQs, explanations, mocks and past papers, to use alongside your academy or self-study." },
  { q: "Where do the questions come from?", a: "Our subject experts write them from the PMDC syllabus. Nothing is copied from academy books or other apps." },
  { q: "How do I pay?", a: "JazzCash, Easypaisa, card or bank transfer. One payment covers the season." },
  { q: "Can I use it on two devices?", a: "Yes. Register two and use one at a time." },
];

const LETTERS = ["A", "B", "C", "D"];

/* Brand mark: a filled answer bubble */
function Mark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="6.5" fill="var(--green)" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className={`lp ${display.variable} ${mono.variable}`}>
      <header className="lp-head">
        <div className="lp-wrap lp-bar">
          <a className="brand" href="#top"><Mark />{site.name}</a>
          <nav aria-label="Sections">
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="lp-bar-end">
            <ThemeToggle />
            <a className="lp-signin" href="/signin">Sign in</a>
            <a className="btn btn-green small" href="/signup">Start free</a>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="lp-wrap hero-grid">
            <div className="hero-copy">
              <div className="hero-row" aria-hidden="true">
                {LETTERS.map((l) => <span key={l} className={l === "C" ? "fill" : ""}>{l}</span>)}
              </div>
              <h1>Fill the right bubble.</h1>
              <p>MDCAT MCQs with an explanation on every question.</p>
              <div className="hero-ctas">
                <a className="btn btn-green" href="/signup">Start free</a>
                <a className="btn btn-line" href="#pricing">See pricing</a>
              </div>
            </div>
            <AnswerSheet />
          </div>
        </section>

        <section className="tests" aria-label="Entry tests">
          <div className="lp-wrap tests-row">
            {tests.map((t) => (
              <span key={t.name} className={t.live ? "live" : ""}>
                {t.name}<small>{t.live ? "Live" : "Soon"}</small>
              </span>
            ))}
          </div>
        </section>

        <section className="feats">
          <div className="lp-wrap feats-grid">
            {features.map((f) => (
              <div key={f.title} className="feat">
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="price">
          <div className="lp-wrap">
            <h2>One payment for the season.</h2>
            <div className="price-grid">
              <div className="pass">
                <div className="pass-head">
                  <h3>Season pass</h3>
                  <span className="early">Rs. {prices.earlyBird} until {prices.earlyBirdUntil}</span>
                </div>
                <p className="amount"><small>Rs.</small>{prices.seasonPass}</p>
                <ul>
                  <li>Full question bank</li>
                  <li>Timed full-length mocks</li>
                  <li>Past papers</li>
                  <li>Progress by chapter</li>
                </ul>
                <a className="btn btn-green" href="/signup">Get the pass</a>
                <p className="monthly">Or Rs. {prices.monthly} a month.</p>
              </div>
              <div className="free">
                <h3>Free</h3>
                <p className="amount"><small>Rs.</small>0</p>
                <p className="free-what">300 questions and a mini mock.</p>
                <a className="btn btn-line" href="/signup">Start free</a>
              </div>
            </div>
          </div>
        </section>

        <section className="apps" aria-labelledby="apps-h">
          <div className="lp-wrap apps-row">
            <h2 id="apps-h">iOS and Android apps coming soon.</h2>
            <div className="stores">
              <span><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.5-1-2.5-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z"/></svg>iOS<small>Soon</small></span>
              <span><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 9.4 19.3 6.3a.4.4 0 0 0-.7-.4l-1.8 3.2A11 11 0 0 0 12 8a11 11 0 0 0-4.8 1.1L5.4 5.9a.4.4 0 1 0-.7.4l1.8 3.1A9.6 9.6 0 0 0 1.5 17h21a9.6 9.6 0 0 0-5-7.6zM7 14.3a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm10 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>Android<small>Soon</small></span>
            </div>
          </div>
        </section>

        <section id="faq" className="faq">
          <div className="lp-wrap">
            <h2>Questions</h2>
            <div className="faq-list">
              {faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-foot">
        <div className="lp-wrap foot-row">
          <a className="brand" href="#top"><Mark />{site.name}</a>
          <nav aria-label="Footer">
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </nav>
          <p>Not affiliated with PMDC or any university. © {new Date().getFullYear()} {site.name}</p>
        </div>
      </footer>
    </div>
  );
}
