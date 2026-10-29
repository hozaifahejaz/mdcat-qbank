"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell, { PageHead } from "@/components/app/AppShell";
import { subjects, syllabus } from "@/lib/bank";
import { getDashboard, type Subject, type SubjectStat } from "@/lib/dashboard-data";
import { band, pct } from "@/lib/format";
import { paper } from "@/lib/site";
import { type Catalog, getCatalog, openCount, testHref, totalCount } from "@/lib/study";
import type { AccountUser } from "@/lib/user";

const counts = [10, 25, 50, 100];

export default function PracticeScreen() {
  return <AppShell active="/practice">{(user) => <Practice user={user} />}</AppShell>;
}

/* Build a practice set: a subject, some chapters, a mode and a size. Reads ?subject, ?chapter, ?topic and ?mode=timed
   from the dashboard's links so "Practise" there lands here with the right things ticked. */
function Practice({ user }: { user: AccountUser }) {
  const [subject, setSubject] = useState<Subject>("Biology");
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const [mode, setMode] = useState<"tutor" | "timed">("tutor");
  const [count, setCount] = useState(25);
  const [only, setOnly] = useState<"all" | "unseen" | "wrong">("all");
  const [topic, setTopic] = useState<string | null>(null);
  const [stats, setStats] = useState<SubjectStat[]>([]);
  const [catalog, setCatalog] = useState<Catalog | null>(null);

  useEffect(() => {
    getDashboard(user).then((d) => setStats(d.subjects), () => {});
    getCatalog().then(setCatalog, () => {});
    const p = new URLSearchParams(window.location.search);
    const s = p.get("subject") as Subject | null;
    if (s && subjects.includes(s)) setSubject(s);
    const c = p.get("chapter");
    if (c) setPicked(new Set([c]));
    if (p.get("mode") === "timed") setMode("timed");
    const t = p.get("topic");
    if (t) setTopic(t);
  }, [user]);

  const chapters = syllabus[subject];
  const stat = (c: string) => stats.find((s) => s.subject === subject)?.chapters.find((x) => x.chapter === c);
  const pool = useMemo(() => openCount(catalog, subject, [...picked]), [catalog, subject, picked]);
  const locked = totalCount(catalog, subject, [...picked]) - pool;
  const allOn = picked.size === chapters.length;

  const switchSubject = (s: Subject) => { setSubject(s); setPicked(new Set()); setTopic(null); };
  const toggle = (c: string) => setPicked((p) => { const n = new Set(p); if (n.has(c)) n.delete(c); else n.add(c); return n; });

  const href = testHref({
    kind: mode === "timed" ? "timed" : "practice", subject, count, from: only, topic: topic ?? undefined,
    chapters: picked.size && !allOn ? [...picked] : undefined,
  });

  return (
    <div className="dgrid">
      <PageHead title="Practice" sub="Pick a subject and chapters, then choose how you want to work." />

      <div className="ptabs" role="tablist" aria-label="Subject">
        {subjects.map((s) => {
          const tone = paper.find((p) => p.subject === s)!;
          return (
            <button key={s} type="button" role="tab" aria-selected={s === subject} className="tab" style={{ ["--c" as string]: tone.solid }} onClick={() => switchSubject(s)}>
              <i />{s}
            </button>
          );
        })}
      </div>

      <div className="cols">
        <section className="dcard panel" aria-labelledby="ch-h">
          <div className="panel-h">
            <h2 id="ch-h">{subject} chapters</h2>
            <button type="button" className="link" onClick={() => setPicked(allOn ? new Set() : new Set(chapters))}>{allOn ? "Clear" : "Select all"}</button>
          </div>
          {topic && (
            <p className="note-chip">Topic: <b>{topic}</b> <button type="button" className="link" onClick={() => setTopic(null)}>Remove</button></p>
          )}
          <ul className="picklist">
            {chapters.map((c) => {
              const s = stat(c);
              const p = s?.answered ? pct(s.correct, s.answered) : null;
              const n = openCount(catalog, subject, [c]);
              return (
                <li key={c}>
                  <label>
                    <input type="checkbox" checked={picked.has(c)} onChange={() => toggle(c)} />
                    <span className="pk-name">{c}</span>
                    <span className="muted pk-n">{n ? `${s?.answered ?? 0}/${n}` : ""}</span>
                    {!n ? <span className="acc none">{totalCount(catalog, subject, [c]) ? "With a pass" : "Coming soon"}</span> : p === null ? <span className="acc none">Not started</span> : <span className={`acc ${band(p).cls}`} title={band(p).word}>{p}%</span>}
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="dcard panel setup" aria-labelledby="set-h">
          <h2 id="set-h" className="panel-title">Your set</h2>

          <div className="seg" role="radiogroup" aria-label="Mode">
            <button type="button" role="radio" aria-checked={mode === "tutor"} onClick={() => setMode("tutor")}>
              <b>Practice</b><span>Explanation after each answer</span>
            </button>
            <button type="button" role="radio" aria-checked={mode === "timed"} onClick={() => setMode("timed")}>
              <b>Timed test</b><span>1 minute a question, answers at the end</span>
            </button>
          </div>

          <div className="fld">
            <span>Questions</span>
            <div className="chips">
              {counts.map((c) => <button key={c} type="button" className="chip" aria-pressed={count === c} onClick={() => setCount(c)}>{c}</button>)}
            </div>
          </div>

          <div className="fld">
            <span>From</span>
            <div className="chips">
              {([["all", "All questions"], ["unseen", "Not yet seen"], ["wrong", "Got wrong before"]] as const).map(([k, l]) => (
                <button key={k} type="button" className="chip" aria-pressed={only === k} onClick={() => setOnly(k)}>{l}</button>
              ))}
            </div>
          </div>

          <div className="setup-sum">
            <span className="muted">{picked.size && !allOn ? `${picked.size} chapter${picked.size > 1 ? "s" : ""}` : "All chapters"} · {!catalog ? "…" : pool ? `${pool.toLocaleString("en-GB")} questions in the bank` : locked ? "with a pass" : "questions coming soon"}</span>
            {!catalog ? <button type="button" className="dpill dark block" disabled>Loading…</button>
              : pool ? <a className="dpill dark block" href={href}>Start {Math.min(count, pool)} questions</a>
              : locked ? <a className="dpill dark block" href="/pricing">Get a pass for these questions</a>
              : <button type="button" className="dpill dark block" disabled>Questions coming soon</button>}
            {pool > 0 && mode === "timed" && <span className="muted small">Clock: {Math.min(count, pool)} minutes</span>}
            {catalog && !catalog.paid && locked > 0 && <span className="muted small">Free plan: {pool.toLocaleString("en-GB")} of {(pool + locked).toLocaleString("en-GB")} questions here. <a className="link" href="/pricing">A pass opens them all.</a></span>}
            {only !== "all" && pool > 0 && <span className="muted small">{only === "unseen" ? "Only questions you haven't answered yet." : "Only questions you got wrong last time."} If none match, try All questions.</span>}
          </div>
        </section>
      </div>
    </div>
  );
}
