"use client";

import { useEffect, useState } from "react";

const still = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* The sticky note types a few revision reminders in turn. */
const notes = ["Revise Krebs cycle", "Redo mole concept", "Mock on Saturday", "Retry my mistakes"];
export function NoteTyping() {
  const [text, setText] = useState(notes[0]);
  useEffect(() => {
    if (still()) return;
    let n = 0, i = notes[0].length, erasing = true;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += erasing ? -1 : 1;
      setText(notes[n].slice(0, i));
      if (erasing && i === 0) { erasing = false; n = (n + 1) % notes.length; t = setTimeout(tick, 300); return; }
      if (!erasing && i === notes[n].length) { erasing = true; t = setTimeout(tick, 2200); return; }
      t = setTimeout(tick, erasing ? 35 : 75);
    };
    t = setTimeout(tick, 4000);
    return () => clearTimeout(t);
  }, []);
  return <span className="note-t">{text}<b className="caret" /></span>;
}

/* Turn subjects on or off and the test size follows. */
const pool = [
  { name: "Biology", n: 27, c: "#11804a" },
  { name: "Chemistry", n: 15, c: "#2445ff" },
  { name: "Physics", n: 12, c: "#b06a00" },
];
export function BuildTest() {
  const [on, setOn] = useState([true, false, true]);
  const total = pool.reduce((s, p, i) => s + (on[i] ? p.n : 0), 0);
  return (
    <div className="build">
      {pool.map((p, i) => (
        <label key={p.name} className="tog">
          <i style={{ background: p.c }}>{p.name.slice(0, 2)}</i>
          <span><b>{p.name}</b><small>{on[i] ? `${p.n} questions` : "Off"}</small></span>
          <input type="checkbox" role="switch" checked={on[i]} onChange={() => setOn(on.map((v, j) => (j === i ? !v : v)))} aria-label={p.name} />
          <u aria-hidden="true" />
        </label>
      ))}
      <div className="build-total"><b>{total}</b> questions ready</div>
    </div>
  );
}

/* A dark mock window: the clock counts down and answers tick in. */
const lines = [
  ["Q12", "Biology", true],
  ["Q13", "Biology", true],
  ["Q14", "Chemistry", false],
  ["Q15", "Chemistry", true],
  ["Q16", "Physics", true],
  ["Q17", "English", true],
  ["Q18", "Physics", false],
  ["Q19", "Logical Reasoning", true],
] as const;
export function MockLog() {
  const [sec, setSec] = useState(3 * 3600 - 19);
  const [shown, setShown] = useState(4);
  useEffect(() => {
    if (still()) return;
    const a = setInterval(() => setSec((s) => (s > 0 ? s - 1 : 3 * 3600)), 1000);
    const b = setInterval(() => setShown((n) => (n >= lines.length ? 4 : n + 1)), 1600);
    return () => { clearInterval(a); clearInterval(b); };
  }, []);
  const hh = String(Math.floor(sec / 3600)).padStart(2, "0");
  const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");
  const rows = lines.slice(Math.max(0, shown - 4), shown);
  return (
    <div className="term" aria-hidden="true">
      <div className="term-top"><i /><i /><i /><span>{hh}:{mm}:{ss}</span></div>
      <div className="term-body">
        {rows.map(([q, s, ok]) => (
          <p key={q}><span className="q">[{q}]</span> {s}: <span className={ok ? "g" : "r"}>{ok ? "correct" : "review later"}</span></p>
        ))}
        <p><span className="q">[Q{Number(rows[rows.length - 1][0].slice(1)) + 1}]</span> Waiting for answer<b className="caret" /></p>
      </div>
    </div>
  );
}
