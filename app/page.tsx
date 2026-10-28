import Logo from "@/components/Logo";
import Reveal from "@/components/Reveal";
import SampleQuestion from "@/components/SampleQuestion";
import ThemeToggle from "@/components/ThemeToggle";
import { paper, prices, site } from "@/lib/site";
import "./landing.css";

/* Every test on the roadmap (docs/plan.md, "Phased roadmap"). Only MDCAT is live; the rest are labelled coming soon. */
const tests = [
  { name: "PMDC MDCAT", field: "Medical", live: true },
  { name: "NUMS MDCAT", field: "Medical" },
  { name: "AKU test", field: "Medical" },
  { name: "ECAT", field: "Engineering" },
  { name: "NUST NET", field: "Engineering" },
  { name: "LAT", field: "Law" },
];

const faqs = [
  { q: "Is this a coaching course?", a: "No. It's a practice tool: MCQs, explanations, timed mocks and past papers. Most students use it alongside their academy or self-study, and it costs a fraction of a course." },
  { q: "Where do the questions come from?", a: "Our own subject experts write them from the PMDC syllabus and the textbooks it's based on. Past-paper questions are rebuilt in our own words with our own explanations. Nothing is copied from academy books or other apps." },
  { q: "What if I find a mistake?", a: "Tap \"Report\" on the question. We answer every report within 48 hours, and if we were wrong we fix the question for everyone and correct your stats." },
  { q: "Can I use it on my phone and laptop?", a: "Yes. You can register two devices and use one at a time. Switching takes one tap, and an unfinished test picks up where you left off." },
  { q: "How do I pay?", a: "JazzCash, Easypaisa, debit or credit card, or bank transfer. It's a one-time payment for the season, with no renewal." },
  { q: "Do you cover NUMS, AKU or other tests?", a: "PMDC MDCAT first. NUMS is next, and we'll add other university tests after that." },
  { q: "Are you affiliated with PMDC?", a: `No. ${site.name} is independent and not affiliated with PMDC, NUMS or any university.` },
];

export default function Home() {
  const total = paper.reduce((n, p) => n + p.count, 0);
  return (
    <>
      <nav>
        <div className="wrap">
          <div className="navbar">
            <Logo />
            <ul>
              <li><a href="#how">How it works</a></li>
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
              <span className="tag"><i />PMDC MDCAT · {site.season} season</span>
              <h1>Practise the MCQs that <span>decide your seat.</span></h1>
              <p className="sub muted">
                Chapter-wise MDCAT questions with a full explanation on every one, plus timed mocks built like the real paper. One payment covers the whole season.
              </p>
              <div className="ctas">
                <a className="pill pill-dark" href="#try">Try a question</a>
                <a className="pill pill-light" href="#pricing">See pricing</a>
              </div>
              <div className="who" aria-label="Every subject on the paper">
                {paper.map((p) => (
                  <span key={p.subject} style={{ background: p.tone }}><b>{p.count}</b>{p.subject}</span>
                ))}
              </div>
            </div>
            <SampleQuestion />
          </header>

          <section className="tests" aria-labelledby="tests-h">
            <p className="tests-h muted" id="tests-h">MDCAT now. More tests every season.</p>
            <div className="marquee">
              <ul className="marquee-track">
                {[0, 1].map((copy) => tests.map((t) => (
                  <li key={copy + t.name} aria-hidden={copy === 1 || undefined} data-field={t.field}>
                    <b>{t.name}</b>
                    <span>{t.field}</span>
                    <em className={t.live ? "is-live" : undefined}>{t.live ? "Live" : "Coming soon"}</em>
                  </li>
                )))}
              </ul>
            </div>
          </section>

          <section id="how">
            <div className="center rv">
              <span className="tag"><i />How it works</span>
              <h2>Practise, test, fix. Repeat until August.</h2>
            </div>
            <div className="steps">
              <div className="step rv" style={{ background: "var(--sky)" }}>
                <span className="n">1</span>
                <h3>Practise by chapter</h3>
                <p>Pick a subject, chapter or topic from the PMDC syllabus and get instant explanations as you go. Bookmark anything you want to see again.</p>
              </div>
              <div className="step rv" style={{ background: "var(--mint)" }}>
                <span className="n">2</span>
                <h3>Sit full-length mocks</h3>
                <p>180 MCQs in 3 hours, with the real paper's subject split and mix of easy, moderate and hard questions. Past papers by year too.</p>
              </div>
              <div className="step rv" style={{ background: "var(--lemon)" }}>
                <span className="n">3</span>
                <h3>Fix your weak chapters</h3>
                <p>Your dashboard shows your score by subject and chapter, and "My mistakes" collects every question you got wrong to retry.</p>
              </div>
            </div>
            <div className="card split rv">
              <div className="split-head"><b>Mocks match the real paper</b><span>{total} MCQs · 3 hours · no negative marking</span></div>
              <div className="split-bar" aria-hidden="true">
                {paper.map((p) => <i key={p.subject} style={{ flexGrow: p.count, background: p.solid }} />)}
              </div>
              <div className="split-key">
                {paper.map((p) => <span key={p.subject} style={{ ["--c" as string]: p.solid }}>{p.subject} <b>{p.count}</b></span>)}
              </div>
            </div>
          </section>

          <section id="pricing">
            <div className="center rv">
              <span className="tag"><i />Pricing</span>
              <h2>One payment. The whole season.</h2>
              <p className="muted">No subscription and no add-ons. A season pass covers you from the day you join until the {site.examMonth} MDCAT.</p>
            </div>
            <div className="plans">
              <div className="card plan rv">
                <h3>Free</h3>
                <p className="for">Try the questions and explanations before you pay anything.</p>
                <div className="price"><small>Rs.</small><b>0</b></div>
                <ul>
                  <li>About 300 questions across all subjects</li>
                  <li>One mini mock</li>
                  <li>Basic progress stats</li>
                </ul>
                <a className="pill pill-light" href="/signup">Start free</a>
              </div>
              <div className="card plan best rv">
                <span className="badge">Best for most</span>
                <h3>MDCAT season pass</h3>
                <p className="for">Everything you need to practise for MDCAT, until exam day.</p>
                <div className="price"><small>Rs.</small><b>{prices.seasonPass}</b><span>per season</span></div>
                <span className="early">Early bird Rs. {prices.earlyBird} until {prices.earlyBirdUntil}</span>
                <ul>
                  <li className="plus">Everything in Free, plus</li>
                  <li>The full question bank, every chapter</li>
                  <li>Full-length timed mocks</li>
                  <li>Past papers by year</li>
                  <li>Chapter-by-chapter dashboard</li>
                  <li>Bookmarks and "My mistakes"</li>
                </ul>
                <a className="pill" href="/signup">Get the season pass</a>
              </div>
              <div className="card plan rv">
                <h3>Monthly</h3>
                <p className="for">For students who want to start small or only need a few weeks.</p>
                <div className="price"><small>Rs.</small><b>{prices.monthly}</b><span>per month</span></div>
                <ul>
                  <li className="plus">Everything in the season pass</li>
                  <li>Pay one month at a time</li>
                  <li>Switch to the season pass any time</li>
                </ul>
                <a className="pill pill-dark" href="/signup">Go monthly</a>
              </div>
            </div>
            <div className="price-notes rv">
              <span>JazzCash, Easypaisa or card</span>
              <span>Pay once, no renewal</span>
              <span>Free questions, no card needed</span>
            </div>
          </section>

          <section id="devices" aria-labelledby="devices-h">
            <div className="card apps rv">
              <div className="apps-copy">
                <span className="tag"><i />Your devices</span>
                <h2 id="devices-h">Your pass, on your phone and laptop.</h2>
                <p className="muted">One pass is for one student. That is how we keep it at Rs.&nbsp;{prices.seasonPass}.</p>
                <ul>
                  <li>Register two devices, use one at a time</li>
                  <li>Switch in one tap, and unfinished tests carry over</li>
                  <li>A faint personal watermark stops screenshot sharing</li>
                </ul>
              </div>
              <div className="devices" aria-hidden="true">
                <div className="laptop">
                  <div className="lt-screen">
                    <div className="lt-sketch">
                      <span className="lt-bar" />
                      <span className="ph-q"><i /><i /><i /></span>
                      <span className="lt-opts"><i /><i /><i /><i /></span>
                    </div>
                    <div className="lt-paused">
                      <b>Paused here</b>
                      <span>Switch here</span>
                    </div>
                  </div>
                  <span className="lt-base" />
                </div>
                <div className="phone">
                  <span className="notch" />
                  <span className="ph-title">Biology</span>
                  <span className="ph-alert">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></svg>
                    Active on this phone
                  </span>
                  <span className="ph-q"><i /><i /><i /></span>
                  <span className="ph-opt"><b>A</b><i /></span>
                  <span className="ph-opt"><b>B</b><i /></span>
                  <span className="ph-opt on"><b>C</b><i /></span>
                  <span className="ph-opt"><b>D</b><i /></span>
                </div>
              </div>
            </div>
          </section>

          <section id="faq">
            <div className="center rv"><h2>Questions, answered.</h2></div>
            <div className="faq">
              {faqs.map((f, i) => (
                <details className="rv" key={f.q} open={i === 0}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="final rv" id="join">
            <h2>Start practising before MDCAT {site.season}.</h2>
            <p>Make a free account and try the questions. Upgrade when you're ready, and your progress carries over.</p>
            <div className="ctas">
              <a className="pill pill-dark" href="/signup">Start free</a>
              <a className="pill pill-light" href="#try">Try a question</a>
            </div>
          </div>
        </div>
      </main>

      <footer>
        <div className="wrap">
          <div className="foot">
            <Logo size={22} />
            <ul>
              <li><a href="#how">How it works</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="/privacy">Privacy</a></li>
              <li><a href="/terms">Terms</a></li>
            </ul>
          </div>
          <p className="legal">Not affiliated with PMDC, NUMS or any university. MDCAT is administered by PMDC. © {new Date().getFullYear()} {site.name}</p>
        </div>
      </footer>
      <Reveal />
    </>
  );
}
