"use client";

import { useEffect, useState } from "react";
import { paper } from "@/lib/site";

const TABS = ["Practice", "Mock test", "Mistakes", "Dashboard"] as const;

/* The big tabbed product frame under the hero. It steps through the tabs on its own until someone picks one. */
export default function Showcase() {
  const [tab, setTab] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setTab((n) => (n + 1) % TABS.length), 4200);
    return () => clearInterval(t);
  }, [auto]);

  return (
    <div className="bx-frame">
      <div className="bx-tabs" role="tablist" aria-label="Product screens">
        {TABS.map((t, i) => (
          <button key={t} type="button" role="tab" aria-selected={i === tab} onClick={() => { setTab(i); setAuto(false); }}>{t}</button>
        ))}
      </div>
      <div className="bx-screen" key={tab}>
        {tab === 0 && <Practice />}
        {tab === 1 && <Mock />}
        {tab === 2 && <Mistakes />}
        {tab === 3 && <Dashboard />}
      </div>
    </div>
  );
}

function Practice() {
  return (
    <div className="sc sc-practice">
      <aside>
        {["Cell structure", "Biomolecules", "Enzymes", "Bioenergetics", "Excretion"].map((c, i) => (
          <span key={c} className={i === 4 ? "on" : ""}>{c}<i>{[92, 80, 74, 66, 58][i]}%</i></span>
        ))}
      </aside>
      <div className="q">
        <span className="meta">Biology · Excretion · Q 7 of 25</span>
        <p>Which part of the human nephron is impermeable to water?</p>
        {["Proximal convoluted tubule", "Descending limb of the loop of Henle", "Ascending limb of the loop of Henle", "Collecting duct"].map((o, i) => (
          <span key={o} className={i === 2 ? "o good" : "o"}><b>{"ABCD"[i]}</b>{o}</span>
        ))}
        <div className="exp"><b>Why C is right</b> Na⁺ and Cl⁻ are pumped out, but water cannot follow.</div>
      </div>
    </div>
  );
}

function Mock() {
  return (
    <div className="sc sc-mock">
      <div className="top"><b>Full-length mock 3</b><span className="timer">2:14:08</span></div>
      <div className="body">
        <div className="q">
          <span className="meta">Chemistry · Q 84 of 180</span>
          <p>Which of these has the highest boiling point?</p>
          {["CH₄", "NH₃", "H₂O", "HF"].map((o, i) => <span key={o} className={i === 2 ? "o pick" : "o"}><b>{"ABCD"[i]}</b>{o}</span>)}
        </div>
        <div className="nav">
          {Array.from({ length: 48 }, (_, i) => <i key={i} className={i < 35 ? "done" : i === 35 ? "now" : i === 12 || i === 27 ? "flag" : ""} />)}
        </div>
      </div>
    </div>
  );
}

function Mistakes() {
  const rows = [
    ["Physics", "A ball is thrown vertically upward at 20 m/s…", "Kinematics"],
    ["Chemistry", "The hybridisation of carbon in ethyne is…", "Bonding"],
    ["Biology", "Which enzyme is inhibited by cyanide?", "Respiration"],
    ["Physics", "Two resistors of 6 Ω in parallel give…", "Current electricity"],
  ];
  return (
    <div className="sc sc-list">
      <div className="top"><b>My mistakes</b><span className="pill">Retry all 4</span></div>
      {rows.map(([s, q, c]) => (
        <div className="li" key={q}><span className="chip">{s}</span><p>{q}</p><span className="ch">{c}</span></div>
      ))}
    </div>
  );
}

function Dashboard() {
  return (
    <div className="sc sc-dash">
      <div className="kpis">
        <div><span>Questions done</span><b>1,284</b></div>
        <div><span>Accuracy</span><b>71%</b></div>
        <div><span>Mocks taken</span><b>4</b></div>
      </div>
      <div className="bars">
        {paper.map((p, i) => (
          <div key={p.subject} className="b">
            <span>{p.subject}</span>
            <span className="track"><i style={{ width: `${[78, 66, 52, 84, 70][i]}%`, background: p.solid }} /></span>
            <b>{[78, 66, 52, 84, 70][i]}%</b>
          </div>
        ))}
      </div>
    </div>
  );
}
