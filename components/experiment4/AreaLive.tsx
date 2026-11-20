"use client";

import { useEffect, useState } from "react";
import type { Subject } from "@/lib/track-pages";
import { still } from "./ExamState";

/* The main landing page's live widgets, fed with the chosen area's subjects. Same classes (.build, .term), so they
   look exactly like the ones on /. */

const short = (name: string) => name.replace(/^(SAT|IELTS) /, "").slice(0, 2);

export function BuildTest({ pool }: { pool: Subject[] }) {
  const list = pool.slice(0, 3);
  const [on, setOn] = useState(list.map((_, i) => i !== 1));
  const total = list.reduce((s, p, i) => s + (on[i] ? p.n : 0), 0);
  return (
    <div className="build">
      {list.map((p, i) => (
        <label key={p.name} className="tog">
          <i style={{ background: p.c }}>{short(p.name)}</i>
          <span><b>{p.name}</b><small>{on[i] ? `${p.n} questions` : "Off"}</small></span>
          <input type="checkbox" role="switch" checked={on[i]} onChange={() => setOn(on.map((v, j) => (j === i ? !v : v)))} aria-label={p.name} />
          <u aria-hidden="true" />
        </label>
      ))}
      <div className="build-total"><b>{total}</b> questions ready</div>
    </div>
  );
}

const pattern = [true, true, false, true, true, true, false, true];
export function MockLog({ pool, secs }: { pool: Subject[]; secs: number }) {
  const lines = pattern.map((ok, i) => [`Q${12 + i}`, pool[Math.min(pool.length - 1, Math.floor(i / 2))].name, ok] as const);
  const [sec, setSec] = useState(secs - 19);
  const [shown, setShown] = useState(4);
  useEffect(() => {
    if (still()) return;
    const a = setInterval(() => setSec((s) => (s > 0 ? s - 1 : secs)), 1000);
    const b = setInterval(() => setShown((n) => (n >= lines.length ? 4 : n + 1)), 1600);
    return () => { clearInterval(a); clearInterval(b); };
  }, [secs, lines.length]);
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

/* My mistakes: wrong answers waiting per subject; tapping Retry clears one. */
export function Mistakes({ pool }: { pool: Subject[] }) {
  const start = pool.slice(0, 3).map((p, i) => ({ ...p, left: [7, 4, 2][i] }));
  const [rows, setRows] = useState(start);
  return (
    <div className="x4-miss">
      {rows.map((r, i) => (
        <div key={r.name}>
          <i style={{ background: r.c }}>{short(r.name)}</i>
          <span><b>{r.name}</b><small>{r.left ? `${r.left} to retry` : "All cleared"}</small></span>
          <button type="button" disabled={!r.left} onClick={() => setRows(rows.map((x, j) => (j === i ? { ...x, left: x.left - 1 } : x)))}>Retry</button>
        </div>
      ))}
    </div>
  );
}
