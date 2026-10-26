import Logo from "@/components/Logo";
import Reveal from "@/components/Reveal";
import ThemeToggle from "@/components/ThemeToggle";
import { prices, site } from "@/lib/site";
import "./landing.css";

/* MDCAT launches first. The others are listed as coming. */
const tests = [
  { name: "MDCAT", for: "PMDC", live: true, tone: "var(--sky)" },
  { name: "NUMS", for: "Medical", live: false, tone: "var(--mint)" },
  { name: "AKU", for: "Aga Khan University", live: false, tone: "var(--peach)" },
  { name: "ECAT", for: "Engineering", live: false, tone: "var(--lemon)" },
];

const faqs = [
  { q: "Is this a coaching course?", a: "No. It's practice: MCQs, explanations, mocks and past papers, to use alongside your academy or self-study." },
  { q: "Where do the questions come from?", a: "Our subject experts write them from the PMDC syllabus. Nothing is copied from academy books or other apps." },
  { q: "How do I pay?", a: "JazzCash, Easypaisa, card or bank transfer. One payment covers the season." },
  { q: "How many devices can I use?", a: "Two, one at a time." },
];

/* Illustrations below are sketches of the product, not real student data. */
const subjects = [
  { name: "Biology", v: 82, t: "var(--good)" },
  { name: "Chemistry", v: 64, t: "var(--blue)" },
  { name: "Physics", v: 47, t: "var(--warn)" },
];

export default function Home() {
  return (
    <>
      <nav>
        <div className="wrap">
          <div className="navbar">
            <Logo />
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
            <div className="nav-end">
              <ThemeToggle />
              <a className="signin" href="/signin">Sign in</a>
              <a className="pill pill-dark" href="/signup">Start free</a>
            </div>
          </div>
        </div>
      </nav>

      <main id="top">
        <div className="wrap">
          <header className="hero">
            <div className="hero-copy">
              <h1>Every MCQ, <span>explained.</span></h1>
              <p className="sub muted">Practise for MDCAT with chapter drills, timed mocks and past papers.</p>
              <div className="ctas">
                <a className="pill pill-dark" href="/signup">Start free</a>
                <a className="pill pill-light" href="#pricing">See pricing</a>
              </div>
            </div>

            <div className="stage" aria-hidden="true">
              <div className="card q">
                <div className="q-top"><span className="chip">Biology</span></div>
                <p className="q-stem">Which part of the nephron is impermeable to water?</p>
                <div className="q-opt"><b>A</b>Proximal convoluted tubule</div>
                <div className="q-opt no"><b>B</b>Descending limb of the loop of Henle</div>
                <div className="q-opt yes"><b>C</b>Ascending limb of the loop of Henle</div>
                <div className="q-opt"><b>D</b>Collecting duct</div>
                <div className="q-why"><b>Why C?</b> It pumps salt out of the filtrate, but water can't follow.</div>
              </div>
              <div className="card float score">
                <span className="muted">Mock 3</span>
                <strong>142<small>/180</small></strong>
                <span className="up">+18 since Mock 2</span>
              </div>
              <div className="card float weak">
                <span className="muted">Fix next</span>
                <strong>Thermodynamics</strong>
              </div>
            </div>
          </header>

          <section className="tests" aria-label="Entry tests">
            {tests.map((t) => (
              <div key={t.name} className="test rv" style={{ background: t.tone }}>
                <b>{t.name}</b>
                <span>{t.for}</span>
                <em className={t.live ? "live" : ""}>{t.live ? "Live" : "Soon"}</em>
              </div>
            ))}
          </section>

          <section id="features" className="bento">
            <div className="card tile wide rv">
              <div>
                <h2>Know why, not just what.</h2>
                <p className="muted">Every option explained, right and wrong.</p>
              </div>
              <div className="mini-opts" aria-hidden="true">
                <span className="yes"><b>C</b>Right: salt leaves, water can't follow</span>
                <span><b>A</b>Wrong: reabsorbs most water</span>
                <span><b>B</b>Wrong: permeable to water</span>
              </div>
            </div>
            <div className="tile rv" style={{ background: "var(--mint)" }}>
              <h2>Full mocks</h2>
              <p className="big">180<small> MCQs</small></p>
              <p className="muted">3 hours, real paper split.</p>
            </div>
            <div className="tile rv" style={{ background: "var(--peach)" }}>
              <h2>Weak spots</h2>
              <div className="bars" aria-hidden="true">
                {subjects.map((s) => (
                  <div key={s.name} className="bar">
                    <span>{s.name}</span>
                    <i><i style={{ width: `${s.v}%`, background: s.t }} /></i>
                  </div>
                ))}
              </div>
            </div>
            <div className="card tile wide rv">
              <div>
                <h2>Past papers</h2>
                <p className="muted">Solved, by year.</p>
              </div>
              <div className="years" aria-hidden="true">
                {["2025", "2024", "2023", "2022", "2021"].map((y) => <span key={y}>{y}</span>)}
              </div>
            </div>
          </section>

          <section id="pricing" className="pricing">
            <div className="center rv"><h2>One payment. The whole season.</h2></div>
            <div className="plans">
              <div className="card plan best rv">
                <div className="plan-top">
                  <h3>Season pass</h3>
                  <span className="badge">Early bird Rs. {prices.earlyBird} until {prices.earlyBirdUntil}</span>
                </div>
                <div className="price"><small>Rs.</small><b>{prices.seasonPass}</b></div>
                <ul>
                  <li>Full question bank</li>
                  <li>Timed full-length mocks</li>
                  <li>Past papers</li>
                  <li>Progress by chapter</li>
                </ul>
                <div className="plan-end">
                  <a className="pill" href="/signup">Get the pass</a>
                  <span>or Rs. {prices.monthly} a month</span>
                </div>
              </div>
              <div className="card plan rv">
                <h3>Free</h3>
                <div className="price"><small>Rs.</small><b>0</b></div>
                <ul>
                  <li>300 questions</li>
                  <li>One mini mock</li>
                </ul>
                <div className="plan-end">
                  <a className="pill pill-light" href="/signup">Start free</a>
                </div>
              </div>
            </div>
          </section>

          <section className="apps-wrap" aria-labelledby="apps-h">
            <div className="card apps rv">
              <div className="apps-copy">
                <h2 id="apps-h">iOS and Android apps are coming.</h2>
                <div className="soon">
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></svg>
                    iOS <small>Coming soon</small>
                  </span>
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></svg>
                    Android <small>Coming soon</small>
                  </span>
                </div>
              </div>
              <div className="phone" aria-hidden="true">
                <span className="notch" />
                <span className="ph-title">Today</span>
                <span className="ph-stat"><b>40</b>questions left</span>
                <span className="ph-row"><i /><b style={{ background: "var(--good)" }}>82</b><i /></span>
                <span className="ph-row"><i /><b style={{ background: "var(--blue)" }}>64</b><i /></span>
                <span className="ph-row"><i /><b style={{ background: "var(--warn)" }}>47</b><i /></span>
              </div>
            </div>
          </section>

          <section id="faq" className="faq-sec">
            <h2 className="rv">Questions</h2>
            <div className="faq">
              {faqs.map((f) => (
                <details className="rv" key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="final rv">
            <h2>Start free today.</h2>
            <a className="pill pill-dark" href="/signup">Create an account</a>
          </div>
        </div>
      </main>

      <footer>
        <div className="wrap foot">
          <Logo size={22} />
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="/privacy">Privacy</a></li>
            <li><a href="/terms">Terms</a></li>
          </ul>
          <p className="legal">Not affiliated with PMDC or any university. © {new Date().getFullYear()} {site.name}</p>
        </div>
      </footer>
      <Reveal />
    </>
  );
}
