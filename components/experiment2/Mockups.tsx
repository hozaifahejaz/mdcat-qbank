import { paper, prices, site } from "@/lib/site";

/* Product sketches for experiment 2. Static pictures of the app, built from the same tokens, so they follow the theme. */

const Dot = ({ c }: { c: string }) => <i className="x2-dot" style={{ background: c }} />;

export function QuestionCard() {
  const options = ["Proximal convoluted tubule", "Descending limb of the loop of Henle", "Ascending limb of the loop of Henle", "Collecting duct"];
  return (
    <div className="x2-card x2-q">
      <div className="x2-q-top">
        <span className="x2-chip" style={{ background: "var(--mint)" }}><Dot c="var(--good)" />Biology</span>
        <span className="x2-faint">Q 14 of 40</span>
      </div>
      <p className="x2-q-stem">Which part of the human nephron is impermeable to water?</p>
      <ol className="x2-opts">
        {options.map((o, i) => (
          <li key={o} className={i === 2 ? "right" : i === 1 ? "wrong" : ""}>
            <b>{"ABCD"[i]}</b>{o}
          </li>
        ))}
      </ol>
      <div className="x2-q-foot">
        <span className="x2-faint">Explanation for every option</span>
        <span className="x2-mini-pill">Next</span>
      </div>
    </div>
  );
}

export function ScoreCard() {
  return (
    <div className="x2-card x2-float x2-score">
      <span className="x2-faint">Mock 3 score</span>
      <strong>164<small>/180</small></strong>
      <div className="x2-bar"><i style={{ width: "91%" }} /></div>
      <span className="x2-up">+18 since Mock 1</span>
    </div>
  );
}

export function TimerCard() {
  return (
    <div className="x2-card x2-float x2-timer">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="13" r="7" /><path d="M12 9.5V13l2.5 1.5M10 3h4" /></svg>
      <span>2:41:08</span>
    </div>
  );
}

export function ExplainCard() {
  return (
    <div className="x2-card x2-explain">
      <div className="x2-ex-row right"><b>C</b><div><strong>Correct.</strong> Na⁺ and Cl⁻ leave the ascending limb, but water can't follow.</div></div>
      <div className="x2-ex-row"><b>A</b><div>The PCT reabsorbs about two-thirds of filtered water.</div></div>
      <div className="x2-ex-row"><b>B</b><div>The descending limb lets water out into the salty medulla.</div></div>
      <div className="x2-ex-row"><b>D</b><div>The collecting duct's permeability is set by ADH.</div></div>
      <span className="x2-ref">Ref: Biology XII, Homeostasis</span>
    </div>
  );
}

export function MockCard() {
  const total = paper.reduce((n, p) => n + p.count, 0);
  return (
    <div className="x2-card x2-mock">
      <div className="x2-q-top">
        <strong>Full mock</strong>
        <span className="x2-faint">{total} MCQs · 3 hours</span>
      </div>
      <div className="x2-split">
        {paper.map((p) => <i key={p.subject} style={{ flex: p.count, background: p.solid }} />)}
      </div>
      <ul className="x2-legend">
        {paper.map((p) => <li key={p.subject}><Dot c={p.solid} />{p.subject}<b>{p.count}</b></li>)}
      </ul>
      <span className="x2-mini-pill dark">Start mock</span>
    </div>
  );
}

export function MistakesCard() {
  const rows = [
    { s: "Chemistry", t: "Hybridisation in ethyne", c: "var(--sky)" },
    { s: "Physics", t: "Work done by a variable force", c: "var(--peach)" },
    { s: "Biology", t: "Role of ADH in the nephron", c: "var(--mint)" },
  ];
  return (
    <div className="x2-card x2-mistakes">
      <div className="x2-q-top"><strong>Mistakes</strong><span className="x2-faint">23 to redo</span></div>
      {rows.map((r) => (
        <div key={r.t} className="x2-m-row">
          <span className="x2-chip" style={{ background: r.c }}>{r.s}</span>
          <span>{r.t}</span>
          <span className="x2-mini-pill">Redo</span>
        </div>
      ))}
    </div>
  );
}

export function PassCard() {
  return (
    <div className="x2-card x2-pass">
      <div className="x2-q-top"><strong>{site.name} season pass</strong><span className="x2-chip" style={{ background: "var(--lemon)" }}>{site.season}</span></div>
      <div className="x2-price">Rs. {prices.seasonPass}</div>
      <span className="x2-faint">One payment, no renewal</span>
      <div className="x2-pay">
        <span>JazzCash</span><span>Easypaisa</span><span>Card</span><span>Bank</span>
      </div>
      <span className="x2-mini-pill dark wide">Start with {site.name}</span>
    </div>
  );
}
