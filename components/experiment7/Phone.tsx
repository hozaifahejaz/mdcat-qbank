"use client";

import { useEffect, useState } from "react";
import { Markhor } from "@/components/Logo";

/* The phone at the heart of landing experiment 7. It holds six screens of the app, the steps of practicing in order:
   home, a chapter list, a question with its explanation, a timed mock, My mistakes and progress. The screen for the
   active step sits in the frame; the others wait off to the side and slide across like moving between screens in an
   app (transform only, never a fade). Each screen plays its own small moment once it is on: an option is chosen and
   its explanation rises, the mock clock runs, mistakes get cleared, the week's bars grow. Sample data only. */

export const SCREENS = 6;

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

export default function Phone({ active, only }: { active: number; only?: number }) {
  const list = only === undefined ? Array.from({ length: SCREENS }, (_, i) => i) : [only];
  return (
    <div className="x7-phone" aria-hidden="true">
      <span className="x7-notch" />
      <div className="x7-screen">
        <div className="x7-status"><b>9:41</b><span><i /><i /><i /></span></div>
        <div className="x7-track">
          {list.map((i) => (
            <div key={i} className={i === active ? "x7-scr on" : "x7-scr"} style={{ ["--o" as string]: only === undefined ? i - active : 0 }}>
              {i === 0 && <Home />}
              {i === 1 && <Chapters />}
              {i === 2 && <Question />}
              {i === 3 && <Mock on={i === active} />}
              {i === 4 && <Mistakes />}
              {i === 5 && <Progress />}
            </div>
          ))}
        </div>
        <nav className="x7-tabs">
          {["Home", "Practice", "Mocks", "Mistakes"].map((t, k) => (
            <span key={t} className={[0, 1, 1, 2, 3, 0][only ?? active] === k ? "on" : ""}><i />{t}</span>
          ))}
        </nav>
      </div>
    </div>
  );
}

const subjects = [
  { n: "Biology", s: "Bi", c: "#11804a", p: 72 },
  { n: "Chemistry", s: "Ch", c: "#2445ff", p: 58 },
  { n: "Physics", s: "Ph", c: "#b06a00", p: 45 },
];

function Home() {
  return (
    <>
      <div className="x7-hi"><small>Good evening</small><b>Ready for today?</b></div>
      <div className="x7-today">
        <small>Today&apos;s chapter</small>
        <b>Cell structure</b>
        <span>20 MCQs · about 25 minutes</span>
        <em>Continue</em>
      </div>
      <p className="x7-lbl">Your subjects</p>
      {subjects.map((s, i) => (
        <div key={s.n} className="x7-sub" style={{ ["--d" as string]: `${i * 90}ms` }}>
          <i style={{ background: s.c }}>{s.s}</i>
          <span><b>{s.n}</b><u><s style={{ background: s.c, ["--w" as string]: s.p / 100 }} /></u></span>
          <em>{s.p}%</em>
        </div>
      ))}
      <div className="x7-next"><span><small>Next mock</small><b>Saturday, 10:00</b></span><em>180 MCQs</em></div>
    </>
  );
}

function Chapters() {
  const ch = [["Cell structure", 18], ["Biological molecules", 40], ["Enzymes", 26], ["Bioenergetics", 9], ["Acellular life", 0], ["Variety of life", 0]] as const;
  return (
    <>
      <div className="x7-top"><small>Practice</small><b>Biology</b></div>
      {ch.map(([name, done], i) => (
        <div key={name} className={i === 0 ? "x7-ch tap" : "x7-ch"} style={{ ["--d" as string]: `${i * 70}ms` }}>
          <span><b>{name}</b><small>{done ? `${done} of 40 done` : "Not started"}</small></span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>
        </div>
      ))}
    </>
  );
}

function Question() {
  const opts = ["Ribosome", "Mitochondrion", "Golgi body", "Lysosome"];
  return (
    <>
      <div className="x7-qhead"><small>Biology · Cell structure</small><small>12 of 20</small></div>
      <p className="x7-stem">Which organelle makes most of a cell&apos;s ATP?</p>
      <div className="x7-opts">
        {opts.map((o, i) => (
          <span key={o} className={i === 1 ? "x7-opt ok" : "x7-opt"}><i>{"ABCD"[i]}</i>{o}{i === 1 && <em><Check /></em>}</span>
        ))}
      </div>
      <div className="x7-why">
        <b>Why</b>
        <p>Mitochondria carry out aerobic respiration, where most ATP is made. Ribosomes build proteins, the Golgi packs them, lysosomes digest.</p>
      </div>
    </>
  );
}

function Mock({ on }: { on: boolean }) {
  const [left, setLeft] = useState(2 * 3600 + 41 * 60 + 8);
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [on]);
  const hh = Math.floor(left / 3600), mm = Math.floor((left % 3600) / 60), ss = left % 60;
  return (
    <>
      <div className="x7-top"><small>Full mock</small><b>180 MCQs · 3 hours</b></div>
      <div className="x7-clock">
        <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" /><circle className="arc" cx="60" cy="60" r="52" pathLength={1} /></svg>
        <span><b>{hh}:{String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}</b><small>left</small></span>
      </div>
      <div className="x7-grid">
        {Array.from({ length: 36 }, (_, i) => <i key={i} className={i < 21 ? "done" : i === 21 ? "now" : ""} style={{ ["--d" as string]: `${i * 25}ms` }} />)}
      </div>
      <div className="x7-mockrow"><span>Answered <b>39</b></span><span>Flagged <b>3</b></span></div>
    </>
  );
}

function Mistakes() {
  const rows = [["Biology", "Enzymes", "#11804a"], ["Chemistry", "Gases", "#2445ff"], ["Physics", "Waves", "#b06a00"], ["English", "Tenses", "#8a63ff"]] as const;
  return (
    <>
      <div className="x7-top"><small>My mistakes</small><b>Waiting for another try</b></div>
      {rows.map(([s, ch, c], i) => (
        <div key={s} className="x7-mis" style={{ ["--d" as string]: `${700 + i * 450}ms`, ["--c" as string]: c }}>
          <i style={{ background: c }}>{s.slice(0, 2)}</i>
          <span><b>{s}</b><small>{ch}</small></span>
          <em><Check /></em>
        </div>
      ))}
      <p className="x7-cleared">Right this time. Cleared.</p>
    </>
  );
}

function Progress() {
  const week = [38, 52, 46, 64, 58, 76, 84];
  return (
    <>
      <div className="x7-top"><small>Progress</small><b>This week</b></div>
      <div className="x7-streak"><Markhor height={26} /><span><b>12-day streak</b><small>Keep climbing</small></span></div>
      <div className="x7-bars">
        {week.map((h, i) => <span key={i} style={{ ["--h" as string]: h / 100, ["--d" as string]: `${i * 80}ms` }}><i /><small>{"MTWTFSS"[i]}</small></span>)}
      </div>
      {subjects.map((s) => (
        <div key={s.n} className="x7-gain"><i style={{ background: s.c }} /><span>{s.n}</span><b>+{Math.round(s.p / 8)}%</b></div>
      ))}
    </>
  );
}
