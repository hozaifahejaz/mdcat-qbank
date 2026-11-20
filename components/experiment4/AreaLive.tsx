"use client";

import { useEffect, useState } from "react";
import type { Area } from "./ExamState";
import { still } from "./ExamState";
import TrackMark from "./TrackMark";

/* "Inside your account": one app window, filled with the chosen area, in place of a row of feature cards. Three tabs
   (Practice, Mocks, My mistakes) turn on their own until the visitor clicks one. Sample numbers only. */

const tabs = ["Practice", "Mocks", "My mistakes"] as const;
type Tab = (typeof tabs)[number];
const done = [72, 58, 45, 81, 34, 63];
const left = [6, 3, 2, 4, 1, 2];
const short = (name: string) => name.replace(/^(SAT|IELTS) /, "").slice(0, 2);

export function Inside({ area }: { area: Area }) {
  const [tab, setTab] = useState<Tab>("Practice");
  const [auto, setAuto] = useState(true);
  const [cleared, setCleared] = useState<number[]>([]);
  useEffect(() => { setCleared([]); }, [area.id]);
  useEffect(() => {
    if (!auto || still()) return;
    const t = setTimeout(() => setTab(tabs[(tabs.indexOf(tab) + 1) % tabs.length]), 4200);
    return () => clearTimeout(t);
  }, [tab, auto]);
  const pick = (t: Tab) => { setAuto(false); setTab(t); };

  const subjects = area.page.subjects.slice(0, 5);
  const lead = area.exams.find((e) => e.pattern) ?? area.exams[0];
  const total = lead.pattern ? lead.pattern.parts.reduce((s, p) => s + p.n, 0) : 100;
  const score = Math.round(total * 0.78);

  return (
    <div className="x4-app" style={{ ["--x4-c" as string]: area.colour }}>
      <div className="x4-appbar"><i /><i /><i /><span>markhorprep.com/app</span></div>
      <div className="x4-appin">
        <aside>
          <div className="x4-appme">
            <span className="x4-tile" style={{ color: area.colour }}><TrackMark id={area.id} size={18} /></span>
            <b>{area.name}</b>
          </div>
          <nav role="tablist" aria-label="Inside your account">
            {tabs.map((t) => (
              <button key={t} type="button" role="tab" aria-selected={t === tab} className={t === tab ? "on" : ""} onClick={() => pick(t)}>{t}</button>
            ))}
          </nav>
          <small>Your tests</small>
          <ul>{area.exams.slice(0, 5).map((e) => <li key={e.id}>{e.name}</li>)}</ul>
        </aside>

        <div className="x4-pane" key={tab + area.id}>
          {tab === "Practice" && (
            <>
              <h4>Pick up where you left off</h4>
              {subjects.map((s, i) => (
                <div key={s.name} className="x4-row">
                  <i style={{ background: s.c }}>{short(s.name)}</i>
                  <span><b>{s.name}</b><u><s style={{ ["--w" as string]: done[i] / 100, background: s.c }} /></u></span>
                  <em>{done[i]}%</em>
                </div>
              ))}
            </>
          )}
          {tab === "Mocks" && (
            <>
              <h4>Full mocks</h4>
              <div className="x4-mock">
                <div className="x4-ring" style={{ ["--p" as string]: `${(score / total) * 100}%` }}><b>{score}</b><small>of {total}</small></div>
                <div>
                  <b>Last mock: {lead.name}</b>
                  <p>{area.page.mock.line}</p>
                  <span className="x4-chip">Next mock ready</span>
                </div>
              </div>
              {lead.pattern && (
                <div className="x4-split">
                  {lead.pattern.parts.slice(0, 5).map((p, i) => (
                    <span key={p.name}><small>{p.name}</small><b>{Math.round(p.n * [0.82, 0.74, 0.69, 0.9, 0.8][i])}/{p.n}</b></span>
                  ))}
                </div>
              )}
            </>
          )}
          {tab === "My mistakes" && (
            <>
              <h4>Waiting for another try</h4>
              {subjects.slice(0, 4).map((s, i) => {
                const n = cleared.includes(i) ? 0 : left[i];
                return (
                  <div key={s.name} className="x4-row">
                    <i style={{ background: s.c }}>{short(s.name)}</i>
                    <span><b>{s.name}</b><small>{n ? `${n} to retry` : "All cleared"}</small></span>
                    <button type="button" disabled={!n} onClick={() => { setAuto(false); setCleared([...cleared, i]); }}>{n ? "Retry" : "Done"}</button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
