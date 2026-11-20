"use client";

import { Markhor } from "@/components/Logo";
import { Notify } from "./Experience";
import { useExam, ChangeExam } from "./ExamState";

/* Pricing, FAQ and the closing call of experiment 4, all written for the chosen exam. */

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

export function Pricing({ season, monthly }: { season: number; monthly: number }) {
  const { chosen } = useExam();
  const t = chosen.track.name.toLowerCase();
  const live = chosen.track.exams.some((e) => e.live);
  return (
    <section id="pricing" className="x3-sec">
      <div className="x3-wrap">
        <div className="x3-head">
          <span className="x3-tag">Pricing</span>
          <h2>Pay for {chosen.name}.<br /><span className="mute">Not for everyone else&apos;s.</span></h2>
        </div>
        {live ? (
          <div className="x3-plans">
            <div className="x3-card plan">
              <h3>Free</h3>
              <p>See if it works for you.</p>
              <div className="price"><small>Rs.</small>0</div>
              <a className="x3-btn x3-blue" href="/signup">Start free</a>
              <ul>
                <li><Check />100 {t} questions</li>
                <li><Check />Every answer explained</li>
                <li><Check />No card needed</li>
              </ul>
            </div>
            <div className="x3-card plan best">
              <span className="bolt" aria-hidden="true"><Markhor height={22} /></span>
              <h3>Season Pass</h3>
              <p>All of {t} until {chosen.name} day.</p>
              <div className="price"><small>Rs.</small>{season.toLocaleString("en-GB")}</div>
              <a className="x3-btn x3-white" href="/signup">Start free</a>
              <ul>
                <li><Check />Every {t} question</li>
                <li><Check />Mocks in the {chosen.name} pattern</li>
                <li><Check />The related exams in {t}</li>
              </ul>
            </div>
            <div className="x3-card plan">
              <h3>One month</h3>
              <p>A last push before the paper.</p>
              <div className="price"><small>Rs.</small>{monthly.toLocaleString("en-GB")}</div>
              <a className="x3-btn x3-blue" href="/signup">Start free</a>
              <ul>
                <li><Check />Everything in the Season Pass</li>
                <li><Check />30 days, no renewal</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="x3-card x4-soon">
            <p><b>{chosen.name} isn&apos;t open yet.</b> Its price comes with it, and you&apos;ll only pay for {t}, never for exams you won&apos;t sit.</p>
            <Notify name={chosen.name} />
          </div>
        )}
      </div>
    </section>
  );
}

export function Faq() {
  const { chosen } = useExam();
  const t = chosen.track.name.toLowerCase();
  const others = chosen.track.exams.filter((e) => e.id !== chosen.id).map((e) => e.name);
  const faqs = [
    chosen.live
      ? { q: `Is ${chosen.name} open now?`, a: `Yes. Sign up free and start practicing ${chosen.name} today, no card needed.` }
      : { q: `When does ${chosen.name} open?`, a: `We're writing it now, chapter by chapter in its own pattern. Leave your email or number and we'll tell you the day it opens.` },
    chosen.pattern
      ? { q: `What's in the ${chosen.name} paper?`, a: `${chosen.pattern.summary}: ${chosen.pattern.parts.map((p) => `${p.name} ${p.n}`).join(", ")}. Our mocks follow the same split.` }
      : null,
    { q: "Will I see exams I'm not taking?", a: `No. Your account shows ${t} only${others.length ? `: ${chosen.name}, plus ${others.slice(0, 3).join(", ")}${others.length > 3 ? " and the rest of the track" : ""} if you add them` : ""}.` },
    { q: "Where do the questions come from?", a: `Each one is written for this bank from the ${chosen.body} syllabus and checked against the textbook before it goes live.` },
    { q: "Does it work on my phone?", a: "Yes, in any browser. iOS and Android apps are coming soon." },
  ].filter(Boolean) as { q: string; a: string }[];
  return (
    <section id="faq" className="x3-sec">
      <div className="x3-wrap x3-faqwrap">
        <div className="x3-head">
          <span className="x3-tag">FAQ</span>
          <h2>{chosen.name},<br /><span className="mute">answered.</span></h2>
        </div>
        <div className="x3-faq" key={chosen.id}>
          {faqs.map((f, i) => (
            <details key={f.q} className="x3-card" open={i === 0}>
              <summary>{f.q}<i aria-hidden="true" /></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function End() {
  const { chosen } = useExam();
  return (
    <section className="x3-sec x4-end">
      <div className="x3-wrap">
        <h2>Your {chosen.name} summit is waiting.</h2>
        {chosen.live
          ? <a className="x3-btn x3-blue x3-big" href="/signup">Start {chosen.name} free</a>
          : <a className="x3-btn x3-blue x3-big" href="#top">Tell me when it opens</a>}
        <p><ChangeExam>Not your exam? Change it</ChangeExam></p>
      </div>
    </section>
  );
}
