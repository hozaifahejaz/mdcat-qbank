"use client";

import { useEffect, useRef, useState } from "react";
import { tracks, type TrackId } from "@/lib/catalogue";
import { useArea, type Area } from "./ExamState";
import TrackMark from "./TrackMark";

/* The heart of experiment 4: "I'm preparing for ___". The blank is an area (medical college, engineering university,
   residency...). Until the visitor touches it, it turns through the areas so they can see the page adapt. Picking one
   changes the card under it and every section below, which read the same choice from ExamState. */

export default function Experience() {
  const { shown, touched, open, setOpen, choose } = useArea();

  return (
    <header className="x4-hero">
      <div className="x3-wrap">
        <p className="x4-kicker">Question banks for Pakistan&apos;s exams</p>
        <h1>
          I&apos;m preparing for
          <span className="x4-pickwrap">
            <button type="button" className="x4-pick" style={{ color: shown.colour }} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>
              <span key={shown.id} className="x4-word">{shown.page.phrase}</span>
              <svg className="x4-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            {open && <Picker current={shown.id} onPick={choose} onClose={() => setOpen(false)} />}
          </span>
        </h1>
        {!touched && <p className="x4-hint">Tap to choose yours</p>}
        <AreaCard key={shown.id} area={shown} />
      </div>
    </header>
  );
}

function Picker({ current, onPick, onClose }: { current: string; onPick: (id: TrackId) => void; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    first.current?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const click = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (box.current && !box.current.contains(t) && !t.closest(".x4-pick")) onClose();
    };
    document.addEventListener("keydown", key);
    document.addEventListener("mousedown", click);
    return () => { document.removeEventListener("keydown", key); document.removeEventListener("mousedown", click); };
  }, [onClose]);

  return (
    <div className="x4-picker x3-card" ref={box} role="dialog" aria-label="Choose what you're preparing for">
      <div className="x4-areas">
        {tracks.map((t, i) => (
          <button key={t.id} ref={i === 0 ? first : undefined} type="button" className={t.id === current ? "on" : ""} onClick={() => onPick(t.id)}>
            <span className="x4-tile" style={{ color: t.colour }}><TrackMark id={t.id} size={20} /></span>
            <span><b>{t.name}</b><small>{t.exams.slice(0, 3).map((e) => e.name).join(", ")}{t.exams.length > 3 ? "…" : ""}</small></span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* The area's tests as a fan of cards (the main landing's test cards), then one call to action with the same proof
   line as the main hero. */
function AreaCard({ area }: { area: Area }) {
  const n = area.exams.length;
  return (
    <div className="x4-under">
      <ul className="x4-fan" aria-label={`Tests in ${area.name}`}>
        {area.exams.map((e, i) => (
          <li key={e.id} className="x3-card x4-fcard" style={{ ["--r" as string]: `${(i - (n - 1) / 2) * 3}deg`, ["--d" as string]: `${i * 60}ms` }}>
            <span className="x4-fhead">
              <span className="x4-tile" style={{ color: area.colour }}><TrackMark id={area.id} size={20} /></span>
              <em className={e.live ? "x4-status live" : "x4-status"}>{e.live ? "Live" : "Soon"}</em>
            </span>
            <b>{e.name}</b>
            <small>{e.pattern ? e.pattern.summary : e.body}</small>
          </li>
        ))}
      </ul>
      {area.live ? (
        <div className="x4-go">
          <a className="x3-btn x3-blue x3-big" href="/signup">Start free</a>
          <small className="x3-proof">100 questions free. No card needed.</small>
        </div>
      ) : (
        <div className="x4-go">
          <Notify name={area.name.toLowerCase()} />
          <small className="x3-proof">{area.name} opens soon. We&apos;ll tell you the day it does.</small>
        </div>
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
