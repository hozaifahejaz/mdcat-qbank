"use client";

import { useEffect, useRef } from "react";
import { tracks, type TrackId } from "@/lib/catalogue";
import { useArea, type Area } from "./ExamState";
import TrackMark from "./TrackMark";
import { ExamMark } from "@/components/Marks";

/* The heart of experiment 4: "I'm preparing for ___". The blank is an area (medical college, engineering university,
   residency...). Until the visitor touches it, it turns through the areas so they can see the page adapt. Picking one
   changes the test cards under it and every section below, which read the same choice from ExamState. */

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

/* The area's tests as a fan of cards, each in its own colour, with its paper in one line and a thin bar of its parts.
   Then one call to action with the main hero's proof line. */
const palette = ["#11804a", "#2445ff", "#b06a00", "#8a63ff", "#d4483b", "#0f9fb5", "#c9a400"];
const marks = new Set(["mdcat", "nums", "aku", "ecat", "net", "lat"]);

function AreaCard({ area }: { area: Area }) {
  const n = area.exams.length;
  const start = Math.max(0, palette.indexOf(area.colour));
  return (
    <div className="x4-under">
      <ul className="x4-fan" aria-label={`Tests in ${area.name}`}>
        {area.exams.map((e, i) => {
          const c = palette[(start + i) % palette.length];
          return (
            <li key={e.id} className="x3-card x4-fcard" style={{ ["--r" as string]: n > 5 ? `${i % 2 ? 1.5 : -1.5}deg` : `${(i - (n - 1) / 2) * 3}deg`, ["--d" as string]: `${i * 60}ms`, ["--c" as string]: c }}>
              <span className="x4-tile">{marks.has(e.id) ? <ExamMark id={e.id} size={20} /> : <TrackMark id={area.id} size={20} />}</span>
              <b>{e.name}</b>
              <small>{e.pattern ? e.pattern.summary : e.body}</small>
              {e.pattern && (
                <span className="x4-fbar" aria-hidden="true">
                  {e.pattern.parts.map((p, j) => <i key={p.name} style={{ flexGrow: p.n, background: `color-mix(in srgb, var(--c) ${100 - j * 15}%, var(--x-card))` }} />)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <div className="x4-go">
        <a className="x3-btn x3-blue x3-big" href="/signup">Start free</a>
        <small className="x3-proof">100 questions free. No card needed.</small>
      </div>
    </div>
  );
}
