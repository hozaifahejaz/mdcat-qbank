import type { Metadata } from "next";
import Logo, { Markhor } from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { BuildTest, MockLog, NoteTyping } from "@/components/experiment3/Live";
import { money, plans } from "@/lib/billing";
import { prices, site } from "@/lib/site";
import "./exp3.css";

/* Experiment 3: a calm, light product page with floating cards around a big two-tone headline, live mini-widgets,
   an orbit of subjects and a highlighted middle plan. The live landing page at / is not touched by it. */
export const metadata: Metadata = { title: `Experiment 3 · ${site.name}`, robots: { index: false, follow: false } };

const buy = (plan: string) => `/signup?next=${encodeURIComponent(`/checkout?plan=${plan}`)}`;

const subjects = [
  { name: "Biology", c: "#11804a" },
  { name: "Chemistry", c: "#2445ff" },
  { name: "Physics", c: "#b06a00" },
  { name: "English", c: "#8a63ff" },
  { name: "Logical Reasoning", c: "#c9a400" },
];
const outer = ["PMDC MDCAT", "NUMS", "AKU", "Past papers", "FSc Part 1", "FSc Part 2", "Timed mocks", "My mistakes"];

const tests = [
  { name: "PMDC MDCAT", field: "Medical", live: true },
  { name: "NUMS MDCAT", field: "Medical", live: true },
  { name: "AKU test", field: "Medical", live: true },
  { name: "ECAT", field: "Engineering" },
  { name: "NUST NET", field: "Engineering" },
  { name: "LAT", field: "Law" },
];

const faqs = [
  { q: "Is this a coaching course?", a: "No. It's a practice tool: MCQs, explanations, timed mocks and past papers, for a fraction of a course." },
  { q: "Where do the questions come from?", a: "Every question is written for this bank from the syllabus and its textbooks, then checked against the textbook." },
  { q: "How do I pay?", a: site.payments ? "JazzCash, Easypaisa, card or bank transfer. One payment for the season, no renewal." : "Payments open soon: JazzCash, Easypaisa, card or bank transfer, as one payment with no renewal. The free questions are open now." },
  { q: "Which tests do you cover?", a: "PMDC MDCAT, NUMS and the AKU test, plus FSc chapter practice. Engineering and law come later." },
];

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

export default function Experiment3() {
  return (
    <div className="x3" id="top">
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

      <header className="x3-hero">
        <div className="x3-stage">
          <div className="fl fl-note" aria-hidden="true"><i className="pin" /><NoteTyping /></div>
          <div className="fl fl-check" aria-hidden="true"><Check /></div>
          <div className="fl fl-logo" aria-hidden="true"><Markhor height={40} /></div>
          <div className="fl fl-mock" aria-hidden="true">
            <span className="fl-clock"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg></span>
            <div className="mk-head"><b>Next mock</b><small>Full paper</small></div>
            <div className="mk-in">
              <b>Saturday</b>
              <small>180 MCQs · 3 hours</small>
              <em>10:00 – 13:00</em>
            </div>
          </div>

          <div className="x3-copy">
            <h1>Practise, mock and track<span>your way to a seat</span></h1>
            <p>MDCAT MCQs with an explanation on every answer.</p>
            <a className="x3-btn x3-blue x3-big" href="/signup">Start free</a>
          </div>

          <div className="fl fl-today" aria-hidden="true">
            <b>Today&apos;s chapters</b>
            <div className="bar"><span><i style={{ background: "var(--x-peach)", color: "#b06a00" }}>B</i>Cell structure</span><em>65%</em><u><s style={{ ["--w" as string]: ".65" }} /></u></div>
            <div className="bar"><span><i style={{ background: "var(--x-mint)", color: "#11804a" }}>C</i>Chemical bonding</span><em>84%</em><u><s style={{ ["--w" as string]: ".84" }} /></u></div>
          </div>
          <div className="fl fl-subj" aria-hidden="true">
            <b>5 subjects</b>
            <div className="chips">
              {subjects.slice(0, 3).map((s) => <i key={s.name} style={{ color: s.c }}>{s.name.slice(0, 2)}</i>)}
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="features" className="x3-sec">
          <div className="x3-wrap">
            <div className="x3-head">
              <span className="x3-tag">Features</span>
              <h2>Practise the way <span className="hl">the paper asks.</span></h2>
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
                  <span key={o} className="sat" style={{ ["--a" as string]: `${(360 / outer.length) * i}deg` }}><i>{o}</i></span>
                ))}
              </div>
              <div className="orb r1">
                {subjects.map((s, i) => (
                  <span key={s.name} className="sat" style={{ ["--a" as string]: `${(360 / subjects.length) * i + 20}deg` }}><i><em style={{ background: s.c }} />{s.name}</i></span>
                ))}
              </div>
              <div className="core"><Markhor height={52} /></div>
            </div>
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
                  <span className={t.live ? "st live" : "st"}>{t.live ? "Live" : "Coming soon"}</span>
                  <b>{t.name}</b>
                  <small>{t.field}</small>
                </li>
              )))}
            </ul>
          </div>
        </section>

        <section id="pricing" className="x3-sec">
          <div className="x3-wrap">
            <div className="x3-head">
              <span className="x3-tag">Pricing</span>
              <h2>One payment.<br /><span className="mute">The whole season.</span></h2>
            </div>
            <div className="x3-plans">
              <div className="x3-card plan">
                <h3>Free</h3>
                <p>Try it first.</p>
                <div className="price"><small>Rs.</small>0</div>
                <a className="x3-btn x3-blue" href="/signup">Start free</a>
                <ul>
                  <li><Check />100 free questions</li>
                  <li><Check />One mini mock</li>
                  <li><Check />Every answer explained</li>
                </ul>
              </div>
              <div className="x3-card plan best">
                <span className="bolt" aria-hidden="true"><Markhor height={22} /></span>
                <h3>Season Pass</h3>
                <p>Until the {site.examMonth} MDCAT.</p>
                <div className="price"><small>Rs.</small>{plans.season.price.toLocaleString("en-GB")}</div>
                {plans.season.was && <span className="early">Early bird until {prices.earlyBirdUntil}, then {money(plans.season.was)}</span>}
                <a className="x3-btn x3-white" href={buy("season")}>Get the Season Pass</a>
                <ul>
                  <li><Check />The full question bank</li>
                  <li><Check />MDCAT, NUMS and AKU banks</li>
                  <li><Check />Full-length timed mocks</li>
                  <li><Check />Past papers</li>
                  <li><Check />My mistakes and bookmarks</li>
                </ul>
              </div>
              <div className="x3-card plan">
                <h3>One month</h3>
                <p>30 days of full access.</p>
                <div className="price"><small>Rs.</small>{plans.monthly.price.toLocaleString("en-GB")}</div>
                <a className="x3-btn x3-blue" href={buy("monthly")}>Get one month</a>
                <ul>
                  <li><Check />Everything in the Season Pass</li>
                  <li><Check />No renewal</li>
                </ul>
              </div>
            </div>
            {!site.payments && <p className="x3-note">Payments open soon. The free questions are open now.</p>}
          </div>
        </section>

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

      <footer className="x3-foot">
        <div className="x3-wrap">
          <div className="x3-footin">
            <div>
              <Logo href="#top" size={22} />
              <p>Start practising before<br />MDCAT {site.season}.</p>
            </div>
            <ul>
              <li><b>Product</b></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="/signin">Sign in</a></li>
            </ul>
            <ul>
              <li><b>Legal</b></li>
              <li><a href="/privacy">Privacy</a></li>
              <li><a href="/terms">Terms</a></li>
              <li><a href="/refunds">Refunds</a></li>
            </ul>
          </div>
          <p className="legal">Not affiliated with PMDC, NUMS or any university. © {new Date().getFullYear()} {site.name}</p>
        </div>
      </footer>
    </div>
  );
}
