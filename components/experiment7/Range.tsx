"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AREAS, type Peak } from "./areas";
import Goat from "./Goat";
import { useArea } from "./State";
import { still } from "./areas";

/* The hero of landing experiment 7: "Practice for ___" beside a survey map where every area is a peak. The word in
   the headline rolls to the area being shown, the markhor hops to that summit along a dotted trail, and the contour
   lines around it take the area's colour. Until the visitor picks a peak it tours the range by itself, slowly, and
   only while the map is on screen. Every move is a transform or a stroke being drawn, never a fade, and all of it
   rests for people who ask for reduced motion. */

const SIZE = 0.62; // markhor scale on the map

const at = (p: Peak) => `translate(${p.x}px, ${p.y}px)`;

export default function Range({ map }: { map: ReactNode }) {
  const { area, pick, touched } = useArea();
  const plate = useRef<HTMLDivElement>(null);
  const goat = useRef<SVGGElement>(null);
  const last = useRef<Peak>(area.peak);
  const [hop, setHop] = useState<{ n: number; from: Peak; to: Peak; face: 1 | -1 }>({ n: 0, from: area.peak, to: area.peak, face: 1 });
  const [words, setWords] = useState<{ n: number; cur: string; prev?: string }>({ n: 0, cur: area.peak.word });

  // Tour the range until the visitor picks a peak themselves.
  useEffect(() => {
    if (touched || still()) return;
    let seen = true, t = 0;
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; }, { threshold: 0.25 });
    if (plate.current) io.observe(plate.current);
    const tick = () => {
      if (seen && document.visibilityState === "visible") {
        const i = AREAS.findIndex((a) => a.id === area.id);
        pick(AREAS[(i + 1) % AREAS.length].id, false);
      }
    };
    t = window.setTimeout(tick, words.n === 0 ? 3200 : 3600);
    return () => { clearTimeout(t); io.disconnect(); };
  }, [touched, area.id, pick, words.n]);

  // A new peak: roll the word, hop the markhor along an arc.
  useEffect(() => {
    const from = last.current, to = area.peak;
    if (from === to) return;
    last.current = to;
    const face: 1 | -1 = to.x > from.x ? -1 : 1;
    setHop((h) => ({ n: h.n + 1, from, to, face }));
    setWords((w) => ({ n: w.n + 1, cur: to.word, prev: w.cur }));
    const g = goat.current;
    if (!g || still()) { if (g) g.style.transform = at(to); return; }
    const lift = Math.min(from.y, to.y) - 70 - Math.hypot(to.x - from.x, to.y - from.y) * 0.12;
    const frames = Array.from({ length: 17 }, (_, k) => {
      const t = k / 16, e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const x = from.x + (to.x - from.x) * e;
      const y = (1 - e) * (1 - e) * from.y + 2 * (1 - e) * e * lift + e * e * to.y;
      return { transform: `translate(${x}px, ${y}px)` };
    });
    g.animate(frames, { duration: 950, fill: "forwards" }).onfinish = () => { g.style.transform = at(to); };
  }, [area.peak]);

  const { from, to } = hop;
  const mid = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 60 };
  const trail = `M${from.x} ${from.y}Q${mid.x} ${mid.y} ${to.x} ${to.y}`;

  return (
    <header className="x7-hero" id="range">
      <div className="x7-wrap x7-herogrid">
        <div className="x7-copy">
          <p className="x7-kicker">Original MCQs. Every answer explained.</p>
          <h1>
            Practice for
            <span className="x7-drum">
              {words.prev && words.n > 0 && <span key={`p${words.n}`} className="x7-w out" aria-hidden="true">{words.prev}</span>}
              <span key={`c${words.n}`} className={words.n > 0 ? "x7-w in" : "x7-w"}>{words.cur}</span>
            </span>
          </h1>
          <p className="x7-lede">Every entrance test is a peak. Pick yours, and climb it one chapter at a time.</p>
          <div className="x7-ctas">
            <a className="x7-btn x7-solid" href="/signup">Start free</a>
            <a className="x7-btn x7-quiet" href="#pricing">See prices</a>
          </div>
          <small className="x7-proof">100 questions free. No card needed.</small>
        </div>

        <figure className="x7-plate">
          <div className="x7-platehead">
            <span>Plate I · The range</span>
            <span className="x7-north" aria-hidden="true"><svg width="12" height="16" viewBox="0 0 12 16"><path d="M6 0l6 16-6-4-6 4z" /></svg>N</span>
          </div>
          <div className="x7-map" ref={plate}>
            {map}
            <svg className="x7-live" viewBox="0 0 1000 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <defs>
                <radialGradient id="x7-rg">
                  <stop offset="0" stopColor="#fff" />
                  <stop offset=".55" stopColor="#fff" />
                  <stop offset="1" stopColor="#000" />
                </radialGradient>
                <mask id="x7-halo" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="760">
                  <rect width="1000" height="760" fill="#000" />
                  <circle r="175" fill="url(#x7-rg)" className="x7-halo" style={{ transform: at(area.peak) }} />
                </mask>
                <mask id="x7-tm" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="760">
                  <path key={hop.n} d={trail} pathLength={1} className="x7-trailmask" />
                </mask>
              </defs>
              <use href="#x7-c" className="x7-tint" mask="url(#x7-halo)" />
              {hop.n > 0 && <path d={trail} className="x7-trail" mask="url(#x7-tm)" />}
              <g ref={goat} className="x7-goat" style={{ transform: at(area.peak) }}>
                <Goat size={SIZE} face={hop.face} />
              </g>
            </svg>
            {AREAS.map((a) => (
              <button
                key={a.id}
                type="button"
                className={a.id === area.id ? "x7-peak on" : "x7-peak"}
                style={{ left: `${a.peak.x / 10}%`, top: `${(a.peak.y / 760) * 100}%`, ["--c" as string]: a.colour }}
                aria-pressed={a.id === area.id}
                onClick={() => pick(a.id)}
              >
                {a.peak.label}
              </button>
            ))}
          </div>
          <figcaption className="x7-legend">
            <div className="x7-lrow">
              <i style={{ background: area.colour }} aria-hidden="true" />
              <b>{area.peak.label}</b>
              <span>{area.who}</span>
            </div>
            <p key={area.id} className="x7-exams">{area.exams.map((e) => e.name).join("  ·  ")}</p>
            <div className="x7-lrow x7-lfoot">
              <a href="#pricing">From Rs {area.page.price.month.toLocaleString("en-GB")} a month</a>
              <span className="x7-hint">{touched ? "36° N, 74° E" : "Tap a peak"}</span>
            </div>
          </figcaption>
        </figure>
      </div>
    </header>
  );
}
