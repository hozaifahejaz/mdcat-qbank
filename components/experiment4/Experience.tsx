"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { allExams, tracks } from "@/lib/catalogue";
import { useExam } from "./ExamState";
import TrackMark from "./TrackMark";

/* The heart of experiment 4: "I'm preparing for ___". Until the visitor touches it, the blank turns through a few exams
   so they can see the page adapt. Picking an exam changes the card under it (paper pattern, start or get notified)
   and every section below, which read the same choice from ExamState. */

export default function Experience() {
  const { exam, touched, open, setOpen, choose } = useExam();
  const track = exam.track;

  return (
    <header className="x4-hero">
      <div className="x3-wrap">
        <p className="x4-kicker">Question banks for Pakistan&apos;s exams</p>
        <h1>
          I&apos;m preparing for
          <span className="x4-pickwrap">
            <button type="button" className="x4-pick" style={{ color: track.colour }} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>
              <span key={exam.id} className="x4-word">{exam.name}</span>
              <svg className="x4-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            {open && <Picker current={exam.id} onPick={choose} onClose={() => setOpen(false)} />}
          </span>
        </h1>
        {!touched && <p className="x4-hint">Tap the exam to choose yours</p>}
        <ExamCard key={exam.id} exam={exam} />
      </div>
    </header>
  );
}

function Picker({ current, onPick, onClose }: { current: string; onPick: (id: string) => void; onClose: () => void }) {
  const [q, setQ] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const click = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (box.current && !box.current.contains(t) && !t.closest(".x4-pick")) onClose();
    };
    document.addEventListener("keydown", key);
    document.addEventListener("mousedown", click);
    return () => { document.removeEventListener("keydown", key); document.removeEventListener("mousedown", click); };
  }, [onClose]);

  const needle = q.trim().toLowerCase();
  const groups = useMemo(() => tracks
    .map((t) => ({ ...t, exams: t.exams.filter((e) => !needle || `${e.name} ${e.body} ${t.name}`.toLowerCase().includes(needle)) }))
    .filter((t) => t.exams.length), [needle]);

  return (
    <div className="x4-picker x3-card" ref={box} role="dialog" aria-label="Choose your exam">
      <label className="x4-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input ref={input} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search, e.g. ECAT or FCPS" aria-label="Search exams" />
      </label>
      <div className="x4-pgroups">
        {groups.map((t) => (
          <div key={t.id} className="x4-pgroup">
            <small><i style={{ background: t.colour }} />{t.name}</small>
            <div>
              {t.exams.map((e) => (
                <button key={e.id} type="button" className={e.id === current ? "on" : ""} onClick={() => onPick(e.id)}>
                  {e.name}{e.live && <em>Live</em>}
                </button>
              ))}
            </div>
          </div>
        ))}
        {groups.length === 0 && <p className="x4-none">Not on our list yet. Tell us at the contact page.</p>}
      </div>
    </div>
  );
}

type AnyExam = (typeof allExams)[number];

function ExamCard({ exam }: { exam: AnyExam }) {
  const t = exam.track;
  const total = exam.pattern?.parts.reduce((s, p) => s + p.n, 0) ?? 0;
  return (
    <div className="x4-card x3-card">
      <div className="x4-cardhead">
        <span className="x4-tile" style={{ color: t.colour }}><TrackMark id={t.id} size={22} /></span>
        <div>
          <b>{exam.name}</b>
          <small>{t.name} · {exam.body}</small>
        </div>
        <em className={exam.live ? "x4-status live" : "x4-status"}>{exam.live ? "Live now" : "Opening soon"}</em>
      </div>

      {exam.pattern ? (
        <div className="x4-paper">
          <p>The paper: <b>{exam.pattern.summary}</b></p>
          <div className="x4-bar" aria-hidden="true">
            {exam.pattern.parts.map((p, i) => (
              <span key={p.name} style={{ flexGrow: p.n, background: `color-mix(in srgb, ${t.colour} ${100 - i * 15}%, var(--x-card))` }} />
            ))}
          </div>
          <ul className="x4-legend">
            {exam.pattern.parts.map((p, i) => (
              <li key={p.name}><i style={{ background: `color-mix(in srgb, ${t.colour} ${100 - i * 15}%, var(--x-card))` }} />{p.name} <b>{p.n}</b></li>
            ))}
          </ul>
          <span className="x4-sr">{exam.pattern.parts.map((p) => `${p.name} ${p.n}`).join(", ")} of {total}</span>
        </div>
      ) : (
        <p className="x4-paper x4-mute">{exam.live ? "Chapter-wise practice, timed tests and mocks in its own pattern." : `We'll add ${exam.name} in its own pattern, chapter by chapter, when it opens.`}</p>
      )}

      {exam.live ? (
        <div className="x4-ctas">
          <a className="x3-btn x3-blue x3-big" href="/signup">Start {exam.name} free</a>
          <a className="x4-link" href="#try">Try a question first</a>
        </div>
      ) : (
        <Notify name={exam.name} />
      )}
    </div>
  );
}

export function Notify({ name }: { name: string }) {
  const [v, setV] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("busy");
    try {
      const r = await fetch("/api/waitlist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contact: v }) });
      if (r.ok) { setState("done"); return; }
      const j = await r.json().catch(() => ({}));
      setMsg(j?.message || "That didn't work. Try again.");
      setState("error");
    } catch {
      setMsg("No connection. Try again.");
      setState("error");
    }
  };
  if (state === "done") return <p className="x4-done">You&apos;re on the list. We&apos;ll tell you when {name} opens.</p>;
  return (
    <form className="x4-notify" onSubmit={send}>
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder="Email or mobile number" aria-label="Email or mobile number" required />
      <button className="x3-btn x3-dark" disabled={state === "busy"}>Tell me when it opens</button>
      {state === "error" && <small role="alert">{msg}</small>}
    </form>
  );
}

export function Try() {
  const { chosen } = useExam();
  const t = chosen.track;
  const s = t.sample;
  const [picked, setPicked] = useState<number | null>(null);
  useEffect(() => setPicked(null), [t.id]);
  return (
    <section id="try" className="x3-sec x4-try">
      <div className="x3-wrap">
        <div className="x3-head">
          <span className="x3-tag">Try one</span>
          <h2>One {chosen.name} question.<br /><span className="mute">Every option explained.</span></h2>
        </div>
        <div className="x4-q x3-card">
          <small className="x4-qtag" style={{ color: t.colour }}>{s.tag}</small>
          <p className="x4-stem">{s.stem}</p>
          <div className="x4-opts">
            {s.options.map((o, i) => {
              const state = picked === null ? "" : i === s.answer ? "ok" : i === picked ? "no" : "dim";
              return (
                <button key={o} type="button" className={state} disabled={picked !== null} onClick={() => setPicked(i)}>
                  <i>{"ABCD"[i]}</i>
                  <span>{o}</span>
                  {picked !== null && <small>{i === s.answer ? s.why : s.wrong[i]}</small>}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="x4-after">
              <b>{picked === s.answer ? "Correct." : "Not quite."}</b> {chosen.live ? `That's how every ${chosen.name} question is explained.` : `Every ${chosen.name} question will be explained like this.`}
              <button type="button" className="x4-link" onClick={() => setPicked(null)}>Try again</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
