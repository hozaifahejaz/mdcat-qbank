"use client";

import { useEffect, useRef, useState } from "react";
import { Markhor } from "@/components/Logo";

/* "The climb": how the site works, told as a markhor climbing to the summit. As the visitor scrolls through the steps,
   the markhor walks up the path and each step lights up. Transform and colour only, no fades; with reduced motion the
   markhor waits at the summit and every step is lit. */

const steps = [
  { h: "Pick your exam", p: "Your account shows your track and nothing else." },
  { h: "Practice by chapter", p: "Every option explained, so you learn why, not just what." },
  { h: "Sit the real paper", p: "Timed mocks with the same number of questions and the same clock." },
  { h: "Fix your mistakes", p: "Every wrong answer waits in My mistakes for another try." },
  { h: "Exam day", p: "Walk in having seen it all before." },
];
const ROUTE = "M80 660 C 240 650 450 620 480 560 S 200 470 230 400 S 400 330 360 250 S 290 130 300 62";
const stops = [0.04, 0.3, 0.55, 0.8, 1];

export default function Climb() {
  const box = useRef<HTMLDivElement>(null);
  const route = useRef<SVGPathElement>(null);
  const [p, setP] = useState(0);
  const [pos, setPos] = useState({ x: 80, y: 660 });
  const [len, setLen] = useState(1);
  const [dots, setDots] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const path = route.current!;
    const L = path.getTotalLength();
    setLen(L);
    setDots(stops.map((s) => { const q = path.getPointAtLength(s * L); return { x: q.x, y: q.y }; }));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = box.current!.getBoundingClientRect();
      const vh = window.innerHeight;
      const v = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.55 - r.top) / (r.height - vh * 0.35)));
      setP(v);
      const q = path.getPointAtLength(v * L);
      setPos({ x: q.x, y: q.y });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);

  const reached = (i: number) => p >= stops[i] - 0.02;

  return (
    <section id="how" className="x3-sec x4-climb">
      <div className="x3-wrap">
        <div className="x3-head">
          <span className="x3-tag">How it works</span>
          <h2>Every exam is a climb.<br /><span className="mute">We mark the path.</span></h2>
        </div>
        <div className="x4-climbin" ref={box}>
          <div className="x4-mount">
            <svg viewBox="0 0 600 700" role="img" aria-label="A mountain path from practice to exam day">
              <path className="x4-ridge back" d="M0 700 L90 430 L170 500 L300 60 L420 300 L480 250 L600 470 L600 700 Z" />
              <path className="x4-ridge" d="M0 700 L0 600 L120 500 L210 560 L330 380 L400 430 L500 330 L600 520 L600 700 Z" />
              <path className="x4-snow" d="M300 60 L270 160 L285 150 L300 168 L318 150 L350 160 Z" />
              <path ref={route} d={ROUTE} className="x4-route" />
              <path d={ROUTE} className="x4-route done" style={{ strokeDasharray: len, strokeDashoffset: len * (1 - p) }} />
              {dots.map((d, i) => (
                <g key={i} className={reached(i) ? "x4-stop on" : "x4-stop"} transform={`translate(${d.x} ${d.y})`}>
                  <circle r={i === dots.length - 1 ? 11 : 9} />
                  <text y="4.5" textAnchor="middle">{i === dots.length - 1 ? "★" : i + 1}</text>
                </g>
              ))}
              <g transform={`translate(${pos.x - 16} ${pos.y - 46})`} className="x4-goat">
                <Markhor height={44} />
              </g>
            </svg>
          </div>
          <ol className="x4-steps">
            {steps.map((s, i) => (
              <li key={s.h} className={reached(i) ? "on" : ""}>
                <span>{i === steps.length - 1 ? "★" : i + 1}</span>
                <div>
                  <h3>{s.h}</h3>
                  <p>{s.p}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
