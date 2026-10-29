import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import Showcase from "@/components/experiment1/Showcase";
import TryIt from "@/components/experiment1/TryIt";
import Rise from "@/components/experiment1/Rise";
import { paper, prices, site } from "@/lib/site";
import "./experiment.css";

/* An experimental landing page in a different style: Inter, near-monochrome, a tabbed product frame under a big centred
   headline, alternating feature rows, numbered subject cards and a comparison table. The live page at / is untouched. */
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter" });

export const metadata: Metadata = { title: `Experiment 1 · ${site.name}`, robots: { index: false } };

const I = {
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  x: <path d="M7 7l10 10M17 7 7 17" />,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  bulb: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></>,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  bookmark: <path d="M6 3h12v18l-6-4-6 4z" />,
  shield: <><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  phone: <><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></>,
  repeat: <><path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5" /><path d="M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5" /></>,
  paper: <><path d="M14 3H6v18h12V7z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>,
  flag: <path d="M5 21V4h11l-1.5 4L16 12H5" />,
  sparkle: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />,
};

function Icon({ name, size = 18 }: { name: keyof typeof I; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {I[name]}
    </svg>
  );
}

const subjects = [
  { ...paper[0], line: "Cells to genetics, every chapter." },
  { ...paper[1], line: "Organic, inorganic and physical." },
  { ...paper[2], line: "Numericals worked step by step." },
  { ...paper[3], line: "Grammar and vocabulary." },
  { ...paper[4], line: "Patterns, logic and sequences." },
];

const tiles: { icon: keyof typeof I; title: string; text: string }[] = [
  { icon: "book", title: "By chapter", text: "Every PMDC topic." },
  { icon: "bulb", title: "Explained", text: "Why each option is right or wrong." },
  { icon: "clock", title: "Timed mocks", text: "180 MCQs, 3 hours." },
  { icon: "paper", title: "Past papers", text: "Sorted by year." },
  { icon: "chart", title: "Dashboard", text: "Scores by chapter." },
  { icon: "repeat", title: "My mistakes", text: "Retry what you missed." },
  { icon: "bookmark", title: "Bookmarks", text: "Save for later." },
  { icon: "flag", title: "Report", text: "Answered in 48 hours." },
];

const compare: [string, boolean, boolean][] = [
  ["Explanation for every option", true, false],
  ["Checked by two experts", true, false],
  ["Mocks timed like the real paper", true, false],
  ["Shows your weak chapters", true, false],
  ["Works on phone and laptop", true, true],
];

const faqs = [
  { q: "Is this a coaching course?", a: "No. It's a practice tool you use alongside your academy or self-study." },
  { q: "Where do the questions come from?", a: "Our own subject experts write them from the PMDC syllabus. Nothing is copied." },
  { q: "How do I pay?", a: "JazzCash, Easypaisa, card or bank transfer. One payment, no renewal." },
  { q: "Is there an app?", a: "iOS and Android apps are coming soon. The website works on any phone today." },
];

export default function Experiment() {
  return (
    <div className={`bx ${inter.variable}`} id="top">
      <nav className="bx-nav">
        <div className="bx-wrap bx-navbar">
          <Logo href="#top" />
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#subjects">Subjects</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <div className="bx-nav-end">
            <ThemeToggle />
            <a className="bx-link" href="/signin">Sign in</a>
            <a className="bx-btn bx-btn-sm" href="/signup">Get started</a>
          </div>
        </div>
      </nav>

      <header className="bx-wrap bx-hero">
        <span className="bx-eyebrow"><Icon name="sparkle" size={15} />MDCAT {site.season}</span>
        <h1>Every MCQ explained.{" "}<br />Every mark earned.</h1>
        <p className="bx-sub">Practise, test and fix your weak chapters, all in one place.</p>
        <div className="bx-ctas">
          <a className="bx-btn" href="/signup">Start free</a>
          <a className="bx-btn bx-btn-ghost" href="#try">Try a question</a>
        </div>
        <p className="bx-proof">{paper.reduce((n, p) => n + p.count, 0)} MCQs · 5 subjects · the full PMDC syllabus</p>
      </header>

      <section className="bx-wrap bx-show">
        <Showcase />
      </section>

      <section className="bx-wrap bx-sec bx-steps-sec">
        <Rise><h2 className="bx-h2">Three steps stand between you and your seat.</h2></Rise>
        <ol className="bx-steps">
          {["Learn the chapter", "Practise until it sticks", "Sit the mock", "Your seat"].map((s, i) => (
            <Rise as="li" key={s} className={i === 3 ? "is-you" : ""} delay={i * 80}>
              <span className="n">{i === 3 ? <Icon name="check" size={16} /> : i + 1}</span>
              {s}
            </Rise>
          ))}
        </ol>
      </section>

      <section id="features" className="bx-wrap bx-sec">
        <Feature
          eyebrow="Practise"
          title="Know why, not just what."
          text="Every question explains the right answer and every wrong one."
          points={[["book", "Chapter-wise, on the PMDC syllabus"], ["bulb", "Instant explanations"], ["bookmark", "Bookmark anything"]]}
          art={<ArtExplain />}
        />
        <Feature
          flip
          eyebrow="Test"
          title="The real paper, before the real day."
          text="Full-length mocks with the exact subject split."
          points={[["clock", "180 MCQs in 3 hours"], ["paper", "Past papers by year"], ["target", "Easy, moderate and hard mix"]]}
          art={<ArtMock />}
        />
        <Feature
          eyebrow="Fix"
          title="Weak chapters, found and fixed."
          text="Your dashboard shows exactly where marks are slipping."
          points={[["chart", "Scores by chapter"], ["repeat", "Retry every mistake"], ["shield", "Checked by two experts"]]}
          art={<ArtChapters />}
        />
      </section>

      <section id="subjects" className="bx-sec">
        <div className="bx-wrap">
          <Rise><h2 className="bx-h2">Every subject on the paper.</h2></Rise>
        </div>
        <div className="bx-cards">
          {subjects.map((s, i) => (
            <Rise className="bx-card" key={s.subject} delay={i * 60} style={{ ["--tone" as string]: s.tone, ["--solid" as string]: s.solid }}>
              <span className="num">0{i + 1}</span>
              <b className="big">{s.count}</b>
              <span className="mcq">MCQs</span>
              <div className="foot">
                <h3>{s.subject}</h3>
                <p>{s.line}</p>
              </div>
            </Rise>
          ))}
        </div>
      </section>

      <section className="bx-wrap bx-sec">
        <Rise><h2 className="bx-h2">Everything you need. Nothing you don&apos;t.</h2></Rise>
        <div className="bx-tiles">
          {tiles.map((t, i) => (
            <Rise className="bx-tile" key={t.title} delay={(i % 4) * 60}>
              <span className="ic"><Icon name={t.icon} size={20} /></span>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
            </Rise>
          ))}
        </div>
      </section>

      <section className="bx-wrap bx-sec">
        <Rise><h2 className="bx-h2">Other books give you answers. {site.name} explains them.</h2></Rise>
        <Rise className="bx-table">
          <div className="row head"><span /><b>{site.name}</b><b>PDFs and notes</b></div>
          {compare.map(([label, a, b]) => (
            <div className="row" key={label}>
              <span>{label}</span>
              <i className={a ? "yes" : "no"} aria-label={a ? "Yes" : "No"}><Icon name={a ? "check" : "x"} size={16} /></i>
              <i className={b ? "yes" : "no"} aria-label={b ? "Yes" : "No"}><Icon name={b ? "check" : "x"} size={16} /></i>
            </div>
          ))}
        </Rise>
      </section>

      <section id="try" className="bx-dark">
        <div className="bx-wrap bx-try">
          <Rise className="bx-try-copy">
            <span className="bx-eyebrow on-dark"><span className="dot" />Live</span>
            <h2 className="bx-h2">Try one now.</h2>
            <p>Free. No sign-up.</p>
          </Rise>
          <TryIt />
        </div>
      </section>

      <section className="bx-wrap bx-sec bx-apps">
        <Rise className="bx-apps-copy">
          <span className="bx-eyebrow"><Icon name="phone" size={15} />Mobile</span>
          <h2 className="bx-h2">iOS and Android apps coming soon.</h2>
          <div className="bx-stores">
            <span className="bx-store"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.1zM13.9 4.9c.7-.9 1.2-2 1.1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.3-.6 3-1.5z" /></svg>App Store</span>
            <span className="bx-store"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 2.5v19c0 .5.5.8 1 .6l11-9.4c.4-.3.4-.9 0-1.2L5 1.9c-.5-.2-1 .1-1 .6z" /></svg>Google Play</span>
          </div>
        </Rise>
        <Rise className="bx-phone" delay={120}>
          <div className="scr">
            <span className="bar" />
            <span className="t">Biology · Q 14</span>
            <span className="q" /><span className="q short" />
            {["A", "B", "C", "D"].map((l) => <span key={l} className={l === "C" ? "o on" : "o"}><b>{l}</b><i /></span>)}
          </div>
        </Rise>
      </section>

      <section id="pricing" className="bx-wrap bx-sec">
        <Rise className="bx-price">
          <div>
            <h2 className="bx-h2">One payment. The whole season.</h2>
            <p className="bx-sub">Free to start. No renewal.</p>
          </div>
          <div className="bx-price-box">
            <span className="lbl">Season pass</span>
            <b><small>Rs.</small>{prices.seasonPass}</b>
            <span className="early">Rs. {prices.earlyBird} until {prices.earlyBirdUntil}</span>
            <a className="bx-btn" href="/signup">Get started</a>
          </div>
        </Rise>
      </section>

      <section id="faq" className="bx-wrap bx-sec bx-faq">
        <Rise><h2 className="bx-h2">Questions.</h2></Rise>
        <div>
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}<span aria-hidden="true" /></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bx-wrap bx-final">
        <Rise className="bx-final-in">
          <h2>Your seat starts with one question.</h2>
          <a className="bx-btn bx-btn-inv" href="/signup">Start free</a>
        </Rise>
      </section>

      <footer className="bx-wrap bx-foot">
        <Logo size={22} href="#top" />
        <p>Not affiliated with PMDC or any university. © {new Date().getFullYear()} {site.name}</p>
      </footer>
    </div>
  );
}

function Feature({ eyebrow, title, text, points, art, flip }: {
  eyebrow: string; title: string; text: string; points: [keyof typeof I, string][]; art: React.ReactNode; flip?: boolean;
}) {
  return (
    <div className={`bx-feat${flip ? " flip" : ""}`}>
      <Rise className="bx-feat-copy">
        <span className="bx-label">{eyebrow}</span>
        <h2 className="bx-h2">{title}</h2>
        <p className="bx-sub">{text}</p>
        <ul>
          {points.map(([icon, t]) => <li key={t}><span className="ic"><Icon name={icon} size={16} /></span>{t}</li>)}
        </ul>
      </Rise>
      <Rise className="bx-feat-art" delay={100}>{art}</Rise>
    </div>
  );
}

function ArtExplain() {
  return (
    <div className="art">
      <div className="mini">
        <span className="tag">Biology · Excretion</span>
        <p className="stem">Which part of the nephron is impermeable to water?</p>
        <span className="opt">A <i>Proximal tubule</i></span>
        <span className="opt good">C <i>Ascending limb</i><Icon name="check" size={15} /></span>
      </div>
      <div className="mini float">
        <b>Why C</b>
        <p>Salt is pumped out, but water can&apos;t follow.</p>
      </div>
    </div>
  );
}

function ArtMock() {
  return (
    <div className="art">
      <div className="mini">
        <div className="mock-top"><b>Full mock 3</b><span className="timer"><Icon name="clock" size={14} />2:14:08</span></div>
        <div className="grid">{Array.from({ length: 40 }, (_, i) => <i key={i} className={i < 23 ? "done" : i === 23 ? "now" : ""} />)}</div>
      </div>
      <div className="mini float split">
        {paper.map((p) => <i key={p.subject} style={{ flexGrow: p.count, background: p.solid }} />)}
      </div>
    </div>
  );
}

function ArtChapters() {
  const rows: [string, number][] = [["Cell structure", 88], ["Enzymes", 74], ["Chemical bonding", 61], ["Kinematics", 42]];
  return (
    <div className="art">
      <div className="mini">
        <b className="mini-h">By chapter</b>
        {rows.map(([n, v]) => (
          <div className="bar-row" key={n}>
            <span>{n}</span>
            <span className="track"><i style={{ width: `${v}%`, background: v < 50 ? "var(--bad)" : v < 70 ? "var(--warn)" : "var(--good)" }} /></span>
            <b>{v}%</b>
          </div>
        ))}
      </div>
      <div className="mini float warn"><Icon name="target" size={15} />Kinematics needs work</div>
    </div>
  );
}
