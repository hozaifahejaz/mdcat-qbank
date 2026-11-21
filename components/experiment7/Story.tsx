"use client";

import { useEffect, useRef, useState } from "react";
import Phone, { SCREENS } from "./Phone";

/* The opening of landing experiment 7: the hero and "how it works" are one story. On wide screens a single phone sits
   beside the text and stays there while the visitor scrolls; each step of practicing scrolls past on the left and the
   phone moves to that screen. A rail beside the phone shows which step is on. On phones the same steps stack, each
   with its own screen, and a screen plays once it scrolls into view. */

const steps = [
  { h: "Open a chapter.", m: "Start in one tap.", p: "Every chapter of your syllabus, in the order you study it. Pick one and go." },
  { h: "Answer.", m: "Then see why.", p: "Each answer shows why it's right, and why the other options aren't." },
  { h: "Sit the real paper.", m: "Same count, same clock.", p: "Full mocks timed like the exam you're taking, with every question marked." },
  { h: "Miss one?", m: "It comes back.", p: "Wrong answers wait in My mistakes until you get them right. Then they leave." },
  { h: "Watch yourself", m: "climb.", p: "Every subject's progress, week by week, so you know where to spend tonight." },
];

/* A small card that floats beside the phone, one per step, in the way the live landing floats cards around its
   headline: it names the detail worth noticing on that screen. */
const floats = [
  { t: "Every answer explained", s: "In every area" },
  { t: "Syllabus order", s: "Pick up where you stopped" },
  { t: "Why B, and why not A, C, D", s: "A reason for each option" },
  { t: "Real count, real clock", s: "MDCAT: 180 MCQs in 3 hours" },
  { t: "18 mistakes cleared", s: "This week" },
  { t: "Biology up 9%", s: "Since last week" },
];

export default function Story() {
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState<number[]>([]);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = Array.from(box.current!.querySelectorAll<HTMLElement>("[data-step]"));
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) {
        const i = Number((e.target as HTMLElement).dataset.step);
        setActive(i);
        setSeen((s) => (s.includes(i) ? s : [...s, i]));
      }
    }, { rootMargin: "-45% 0px -45% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="x7-story" ref={box}>
      <div className="x3-wrap x7-storyin">
        <div className="x7-steps">
          <header className="x7-step x7-intro" data-step={0}>
            <span className="x3-tag">Question banks for Pakistan&apos;s exams</span>
            <h1>Practice that<span>explains itself.</span></h1>
            <p>Original MCQs for MDCAT, ECAT, FCPS, CSS, O Levels and more, with the reason behind every answer.</p>
            <div className="x7-cta">
              <a className="x3-btn x3-blue x3-big" href="/signup">Start free</a>
              <a className="x7-how" href="#how">See how it works</a>
            </div>
            <small className="x3-proof">100 questions free. No card needed.</small>
            <div className="x7-inline"><Phone active={seen.includes(0) ? 0 : -1} only={0} /></div>
          </header>
          {steps.map((s, k) => {
            const i = k + 1;
            return (
              <section key={s.h} className={active === i ? "x7-step on" : "x7-step"} data-step={i} id={i === 1 ? "how" : undefined}>
                <span className="x7-num">{String(i).padStart(2, "0")}</span>
                <h2>{s.h}<span>{s.m}</span></h2>
                <p>{s.p}</p>
                <div className="x7-inline"><Phone active={seen.includes(i) ? i : -1} only={i} /></div>
              </section>
            );
          })}
        </div>
        <div className="x7-stage">
          <div className="x7-sticky">
            <ol className="x7-rail" aria-hidden="true">
              {Array.from({ length: SCREENS }, (_, i) => <li key={i} className={i === active ? "on" : i < active ? "past" : ""} />)}
            </ol>
            <Phone active={active} />
            <div key={active} className={active % 2 ? "x7-float low" : "x7-float"} aria-hidden="true">
              <i><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></i>
              <span><b>{floats[active].t}</b><small>{floats[active].s}</small></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
