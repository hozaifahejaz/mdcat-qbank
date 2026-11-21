"use client";

import { useEffect, useRef, useState } from "react";
import { useArea, still } from "./ExamState";

/* Motion for experiment 4. <Motion/> sits in the nav: it draws the reading-progress line, gives the whole page the
   chosen area's colour (so colours glide when the area changes) and marks each section as seen the first time it
   scrolls into view, which is what starts that section's entrance in exp4.css. <Count/> counts a number up from zero
   when it first comes into view and glides to a new value when it changes. Transform and colour only, no fades;
   reduced motion shows everything in place. */

export default function Motion() {
  const { area } = useArea();

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".x4");
    root?.style.setProperty("--x4-c", area.colour);
  }, [area.colour]);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".x4");
    if (!root || still() || !("IntersectionObserver" in window)) return;
    const secs = Array.from(root.querySelectorAll<HTMLElement>(".x3-sec"));
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { e.target.setAttribute("data-seen", ""); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -12% 0px" });
    // Sections already on screen when the page opens are shown as they are.
    const vh = window.innerHeight;
    for (const s of secs) { if (s.getBoundingClientRect().top < vh * 0.88) s.setAttribute("data-seen", ""); else io.observe(s); }
    root.setAttribute("data-armed", "");
    return () => io.disconnect();
  }, []);

  return <span className="x4-progress" aria-hidden="true" />;
}

const fmt = (n: number) => n.toLocaleString("en-GB");

export function Count({ to, ms = 900 }: { to: number; ms?: number }) {
  const el = useRef<HTMLSpanElement>(null);
  const now = useRef(to);
  const seen = useRef(false);
  const [n, setN] = useState(to);

  useEffect(() => {
    if (still() || !("IntersectionObserver" in window)) { now.current = to; setN(to); return; }
    let raf = 0;
    const run = () => {
      const a = now.current, t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / ms), v = Math.round(a + (to - a) * (1 - Math.pow(1 - k, 3)));
        now.current = v; setN(v);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    if (seen.current) { run(); return () => cancelAnimationFrame(raf); }
    now.current = 0; setN(0);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { seen.current = true; io.disconnect(); run(); } }, { threshold: 0.3 });
    io.observe(el.current!);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, ms]);

  return <span ref={el} className="x4-count">{fmt(n)}</span>;
}
