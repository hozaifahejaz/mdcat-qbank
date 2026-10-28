import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { paper, prices, site } from "@/lib/site";
import { ExplainCard, MistakesCard, MockCard, PassCard, QuestionCard, ScoreCard, TimerCard } from "./Mockups";

/* Experiment 2: a landing page after acctual.com. Announcement bar, centred hero over a stage of stacked product cards,
   a "the old way is slow" row, a checklist, alternating feature rows on pastel panels, and a closing call to action. */

const Check = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m8.5 12.2 2.4 2.4 4.6-4.8" /></svg>
);

const problems = [
  { t: "Slow", d: "Hours lost hunting for practice in books.", c: "var(--peach)" },
  { t: "Unchecked", d: "Answer keys nobody verified.", c: "var(--rose)" },
  { t: "Silent", d: "A wrong answer, and no reason why.", c: "var(--lilac)" },
];

const checks = ["Solved blind by a second expert", "Checked against the textbook", "Every option explained", "Mistakes fixed within 48 hours"];

const features = [
  { h: "Know why, not just what", d: "Every option explained, with a textbook reference.", tone: "var(--mint)", art: <ExplainCard /> },
  { h: "Mocks built like the real paper", d: "180 MCQs, 3 hours, the PMDC subject split.", tone: "var(--sky)", art: <MockCard /> },
  { h: "Your mistakes, in one place", d: "Redo every question you got wrong until it sticks.", tone: "var(--peach)", art: <MistakesCard /> },
];

const faqs = [
  { q: "Is this a coaching course?", a: "No. It's a practice tool: MCQs, explanations, timed mocks and past papers." },
  { q: "Where do the questions come from?", a: "Our own subject experts write them from the PMDC syllabus. Nothing is copied." },
  { q: "Can I use it on my phone and laptop?", a: "Yes. Your progress syncs between them." },
  { q: "How do I pay?", a: `JazzCash, Easypaisa, card or bank transfer. Rs. ${prices.seasonPass} once for the season.` },
];

const Phone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M11 18.5h2" /></svg>
);

function Stores() {
  return (
    <div className="x2-stores">
      <span className="x2-store"><Phone />iOS</span>
      <span className="x2-store"><Phone />Android</span>
      <span className="x2-soon">apps coming soon</span>
    </div>
  );
}

export default function Experiment2() {
  return (
    <div className="x2" id="top">
      <a className="x2-announce" href="#apps">iOS and Android apps coming soon <span aria-hidden="true">→</span></a>

      <nav className="x2-nav x2-wrap">
        <Logo />
        <ul>
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <div className="x2-nav-end">
          <ThemeToggle />
          <a className="x2-signin" href="/signin">Log in</a>
          <a className="x2-btn" href="/signup">Start free</a>
        </div>
      </nav>

      <header className="x2-hero x2-wrap">
        <span className="x2-proof">PMDC MDCAT · {site.season} season</span>
        <h1>Walk into MDCAT ready</h1>
        <p className="x2-sub">Chapter-wise MCQs, timed mocks and an explanation for every answer.</p>
        <a className="x2-btn big" href="/signup">Solve my first question</a>
        <ul className="x2-facts">
          <li><b>Rs. {prices.seasonPass}</b> per season</li>
          <li><b>No</b> renewal</li>
          <li><b>2</b> devices</li>
        </ul>

        <div className="x2-stage">
          <QuestionCard />
          <ScoreCard />
          <TimerCard />
        </div>
      </header>

      <section className="x2-strip x2-wrap" aria-label="Every subject on the paper">
        <span>Every subject on the paper</span>
        <ul>{paper.map((p) => <li key={p.subject}>{p.subject} <b>{p.count}</b></li>)}</ul>
      </section>

      <section className="x2-wrap x2-sec">
        <h2>Academy notes are a slow way to prepare</h2>
        <div className="x2-problems">
          {problems.map((p) => (
            <div key={p.t} className="x2-problem" style={{ background: p.c }}>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="x2-wrap x2-sec x2-value">
        <h2>Every question checked. One payment.</h2>
        <ul className="x2-checks">{checks.map((c) => <li key={c}><Check />{c}</li>)}</ul>
        <a className="x2-btn" href="/signup">Start free</a>
      </section>

      <section id="features" className="x2-wrap x2-sec x2-features">
        {features.map((f, i) => (
          <div key={f.h} className={`x2-row${i % 2 ? " flip" : ""}`}>
            <div className="x2-row-copy">
              <h3>{f.h}</h3>
              <p>{f.d}</p>
            </div>
            <div className="x2-panel" style={{ background: f.tone }}>{f.art}</div>
          </div>
        ))}
      </section>

      <section id="pricing" className="x2-wrap x2-sec x2-close">
        <h2>Start practising in seconds</h2>
        <p className="x2-sub">Free questions first. Pay once when you're ready.</p>
        <div className="x2-panel wide" style={{ background: "var(--lemon)" }}><PassCard /></div>
      </section>

      <section id="faq" className="x2-wrap x2-sec x2-faq">
        <h2>FAQs</h2>
        <div>
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}<span aria-hidden="true">+</span></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="apps" className="x2-wrap x2-sec">
        <div className="x2-banner">
          <h2>Your seat is 180 questions away</h2>
          <a className="x2-btn light big" href="/signup">Start free</a>
          <Stores />
        </div>
      </section>

      <footer className="x2-wrap x2-foot">
        <div><Logo /><span>Made in Pakistan</span></div>
        <ul>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/signin">Log in</a></li>
          <li><a href={`mailto:${site.supportEmail}`}>Contact</a></li>
        </ul>
        <small>© {site.season} {site.name}. Not affiliated with PMDC.</small>
      </footer>
    </div>
  );
}
