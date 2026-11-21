"use client";

import { useEffect, useRef, useState } from "react";
import { Markhor } from "@/components/Logo";
import { useArea, type Area } from "./ExamState";

/* "The climb": how the site works, told as a markhor climbing to the summit. As the visitor scrolls through the steps,
   the markhor walks up the path and each step lights up. Transform and colour only, no fades; with reduced motion the
   markhor waits at the summit and every step is lit. */

const list = (xs: string[]) => xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
const stepsFor = (a: Area) => [
  { h: "Sign up free", p: `Choose ${a.name.toLowerCase()}, pick your tests and set your exam date.` },
  { h: "Learn by chapter", p: `${list(a.page.subjects.slice(0, 3).map((s) => s.name))}, one chapter at a time, every answer explained.` },
  { h: "Test yourself", p: "Mixed tests from the chapters you've finished, as long or short as you like." },
  { h: "Sit the real paper", p: a.page.mock.line },
  { h: "Exam day", p: "Walk in having seen it all before." },
];
const ROUTE = "M80 660 C 240 650 450 620 480 560 S 200 470 230 400 S 400 330 360 250 S 290 130 300 62";
const stops = [0.04, 0.3, 0.55, 0.8, 1];

export default function Climb() {
  const { area } = useArea();
  const steps = stepsFor(area);
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
      const v = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.78 - r.top) / (r.height * 0.85)));
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
  const now = stops.reduce((n, s, i) => (p >= s - 0.02 ? i : n), -1);
  // How far the rail under step i has filled: from its stop to the next one.
  const fill = (i: number) => i + 1 < stops.length ? Math.min(1, Math.max(0, (p - stops[i]) / (stops[i + 1] - stops[i]))) : 0;
  const tick = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;

  return (
    <section id="how" className="x3-sec x7-climb" style={{ ["--x7-c" as string]: area.colour }}>
      <div className="x3-wrap">
        <div className="x3-head">
          <span className="x3-tag">How it works</span>
          <h2>Every exam is a climb.<br /><span className="mute">We mark the path.</span></h2>
        </div>
        <div className="x7-climbin" ref={box}>
          <div className="x7-mount">
            <svg viewBox="0 0 600 700" role="img" aria-label="A mountain path from practice to exam day">
              <path className="x7-ridge back" d="M0 700 L90 430 L170 500 L300 60 L420 300 L480 250 L600 470 L600 700 Z" />
              <path className="x7-ridge" d="M0 700 L0 600 L120 500 L210 560 L330 380 L400 430 L500 330 L600 520 L600 700 Z" />
              <path className="x7-snow" d="M300 60 L270 160 L285 150 L300 168 L318 150 L350 160 Z" />
              <path ref={route} d={ROUTE} className="x7-route" />
              <path d={ROUTE} className="x7-route done" style={{ strokeDasharray: len, strokeDashoffset: len * (1 - p) }} />
              {dots.map((d, i) => (
                <g key={i} className={reached(i) ? "x7-stop on" : "x7-stop"} transform={`translate(${d.x} ${d.y})`}>
                  <circle r={i === dots.length - 1 ? 11 : 9} />
                  <text y="4.5" textAnchor="middle">{i === dots.length - 1 ? "★" : i + 1}</text>
                </g>
              ))}
              <g transform={`translate(${pos.x - 16} ${pos.y - 46})`} className="x7-goat">
                <Markhor height={44} />
              </g>
            </svg>
          </div>
          <ol className="x7-steps">
            {steps.map((s, i) => (
              <li key={s.h} className={i === now ? "on now" : reached(i) ? "on" : ""} style={{ ["--fill" as string]: fill(i) }}>
                <span>{reached(i) && i < now ? tick : i === steps.length - 1 ? "★" : i + 1}</span>
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
