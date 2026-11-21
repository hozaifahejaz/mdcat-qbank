"use client";

import { Fragment, useEffect, useRef } from "react";
import { tracks, type TrackId } from "@/lib/catalogue";
import { useArea, type Area } from "./ExamState";
import TrackMark from "./TrackMark";
import { ExamMark } from "@/components/Marks";

/* The heart of experiment 4: "I'm preparing for ___". The blank is an area (medical college, engineering university,
   residency...). Until the visitor touches it, it turns through the areas so they can see the page adapt. Picking one
   changes the test cards under it and every section below, which read the same choice from ExamState. */

/* soon: the live landing page passes it so tests and areas that aren't open yet say "Coming soon" (experiment 4
   shows every area as done). */
export default function Experience({ soon = false }: { soon?: boolean }) {
  const { shown, touched, open, setOpen, choose } = useArea();

  return (
    <header className="x4-hero" style={{ ["--x4-c" as string]: shown.colour }}>
      <Contours />
      <div className="x3-wrap">
        <p className="x4-kicker">Question banks for Pakistan&apos;s exams</p>
        <h1>
          I&apos;m preparing for
          <span className="x4-pickwrap">
            <button type="button" className={touched ? "x4-pick" : "x4-pick idle"} style={{ color: shown.colour }} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>
              <Phrase key={shown.id} text={shown.page.phrase} />
              <svg className="x4-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            {open && <Picker current={shown.id} onPick={choose} onClose={() => setOpen(false)} />}
          </span>
        </h1>
        {!touched && <p className="x4-hint">Tap to choose yours</p>}
        <AreaCard key={shown.id} area={shown} soon={soon} />
      </div>
    </header>
  );
}

/* The phrase arrives letter by letter, each letter sliding up out of a mask (no fade). */
function Phrase({ text }: { text: string }) {
  let k = 0;
  return (
    <span className="x4-word">
      <span className="x4-sr">{text}</span>
      {text.split(" ").map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="x4-wd" aria-hidden="true">
            {[...w].map((ch, j) => <span key={j} style={{ ["--i" as string]: k++ }}>{ch}</span>)}
          </span>
        </Fragment>
      ))}
    </span>
  );
}

/* Contour lines behind the hero, drawn in on load in the area's colour; the colour glides as the area changes. */
function Contours() {
  return (
    <svg className="x4-contours" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true">
      <path pathLength={1} d="M0 250 C 160 210 260 150 420 170 S 700 260 860 200 S 1120 90 1260 120 S 1400 170 1440 150" />
      <path pathLength={1} d="M0 285 C 180 250 300 200 450 215 S 720 290 880 240 S 1130 140 1270 165 S 1400 210 1440 195" />
      <path pathLength={1} d="M0 315 C 200 290 330 250 480 260 S 740 315 900 280 S 1140 190 1280 210 S 1400 250 1440 240" />
    </svg>
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
          <button key={t.id} ref={i === 0 ? first : undefined} type="button" className={t.id === current ? "on" : ""} style={{ ["--i" as string]: i }} onClick={() => onPick(t.id)}>
            <span className="x4-tile" style={{ color: t.colour }}><TrackMark id={t.id} size={20} /></span>
            <span><b>{t.name}</b><small>{t.exams.slice(0, 3).map((e) => e.name).join(", ")}{t.exams.length > 3 ? "…" : ""}</small></span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* The area's tests as a fan of admit tickets, each in its own colour: a number and its name above the tear line,
   the paper and the clock (or who sets it) below it, and a band along the bottom split by the paper's parts.
   Then one call to action with the main hero's proof line. */
const palette = ["#11804a", "#2445ff", "#b06a00", "#8a63ff", "#d4483b", "#0f9fb5", "#c9a400"];
const marks = new Set(["mdcat", "nums", "aku", "ecat", "net", "lat"]);

/* The two facts printed on a ticket: the paper and the clock when we know the pattern, otherwise who sets it. */
type AnyExam = Area["exams"][number];
const facts = (e: AnyExam): [string, string][] => {
  if (!e.pattern) return [["Set by", e.body]];
  const [paper, time] = e.pattern.summary.split(" · ");
  return time ? [["Paper", paper], ["Time", time]] : [["Paper", paper]];
};

function AreaCard({ area, soon }: { area: Area; soon: boolean }) {
  const n = area.exams.length;
  const start = Math.max(0, palette.indexOf(area.colour));
  return (
    <div className="x4-under">
      <ul className="x4-fan" aria-label={`Tests in ${area.name}`}>
        {area.exams.map((e, i) => {
          const c = palette[(start + i) % palette.length];
          const later = soon && !e.live;
          return (
            <li key={e.id} className={later ? "x4-ticket x4-later" : "x4-ticket"} style={{ ["--r" as string]: n > 5 ? `${i % 2 ? 1.5 : -1.5}deg` : `${(i - (n - 1) / 2) * 3}deg`, ["--d" as string]: `${i * 60}ms`, ["--c" as string]: c }}>
              <div className="x4-tk-top">
                <span className="x4-tk-row">
                  <small>No. {String(i + 1).padStart(2, "0")}</small>
                  <span className="x4-tk-mark">{marks.has(e.id) ? <ExamMark id={e.id} size={18} /> : <TrackMark id={area.id} size={18} />}</span>
                </span>
                <b>{e.name}</b>
                {later && <em className="x4-soonstamp">Coming soon</em>}
              </div>
              <div className="x4-tk-cut" aria-hidden="true" />
              <dl className="x4-tk-facts">
                {facts(e).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
              </dl>
              <span className="x4-tk-band" aria-hidden="true">
                {e.pattern
                  ? e.pattern.parts.map((p, j) => <i key={p.name} style={{ flexGrow: p.n, background: `color-mix(in srgb, var(--c) ${100 - j * 16}%, var(--x-card))` }} />)
                  : <i style={{ flexGrow: 1, background: "var(--c)" }} />}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="x4-go">
        <a className="x3-btn x3-blue x3-big" href="/signup">Start free</a>
        <small className="x3-proof">{soon && !area.exams.some((e) => e.live) ? `${area.name} is coming soon. Pre-medical is open now, with 100 questions free.` : "100 questions free. No card needed."}</small>
      </div>
    </div>
  );
}
