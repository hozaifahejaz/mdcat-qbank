"use client";

import { useEffect } from "react";
import { Markhor } from "@/components/Logo";
import { tracks, type TrackId } from "@/lib/catalogue";
import { trackPages } from "@/lib/track-pages";
import TrackMark from "./TrackMark";
import { useArea, still } from "./State";

/* Everything after the story on landing experiment 7: every area as a tile, prices by area, the FAQ and the close.
   Seen() marks each section the first time it scrolls into view, which starts its entrance in exp7.css (a rise,
   never a fade). */

const buy = (plan: string) => `/signup?next=${encodeURIComponent(`/checkout?plan=${plan}`)}`;
const rs = (n: number) => n.toLocaleString("en-GB");
const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

export function Seen() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".x7");
    if (!root || still() || !("IntersectionObserver" in window)) return;
    const secs = Array.from(root.querySelectorAll<HTMLElement>(".x3-sec"));
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { e.target.setAttribute("data-seen", ""); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -12% 0px" });
    secs.forEach((s) => io.observe(s));
    root.setAttribute("data-armed", "");
    return () => io.disconnect();
  }, []);
  return null;
}

const to = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: still() ? "auto" : "smooth" });

export function Areas() {
  const { setId } = useArea();
  return (
    <section id="areas" className="x3-sec">
      <div className="x3-wrap">
        <div className="x3-head">
          <span className="x3-tag">Areas</span>
          <h2>Every paper.<br /><span className="mute">One app.</span></h2>
        </div>
        <div className="x7-areas">
          {tracks.map((t, i) => (
            <button key={t.id} type="button" className="x3-card x7-area" style={{ ["--c" as string]: t.colour, ["--i" as string]: i }} onClick={() => { setId(t.id); to("pricing"); }}>
              <span className="x7-tile"><TrackMark id={t.id} size={22} /></span>
              <b>{t.name}</b>
              <small>{t.exams.slice(0, 3).map((e) => e.name).join(" · ")}{t.exams.length > 3 ? ` · +${t.exams.length - 3}` : ""}</small>
              <em>From Rs. {rs(trackPages[t.id].price.month)} a month</em>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Pricing({ payments }: { payments: boolean }) {
  const { id, setId } = useArea();
  const t = tracks.find((x) => x.id === id)!;
  const page = trackPages[id];
  const { month, three } = page.price;
  const save = Math.round((1 - three / (month * 3)) * 100);
  return (
    <section id="pricing" className="x3-sec">
      <div className="x3-wrap">
        <div className="x3-head">
          <span className="x3-tag">Pricing</span>
          <h2>Pay for your area.<br /><span className="mute">Nothing else.</span></h2>
        </div>
        <div className="x7-chips" role="tablist" aria-label="Area">
          {tracks.map((x) => (
            <button key={x.id} type="button" role="tab" aria-selected={x.id === id} className={x.id === id ? "on" : ""} style={{ ["--c" as string]: x.colour }} onClick={() => setId(x.id as TrackId)}>
              <TrackMark id={x.id} size={16} />{x.name}
            </button>
          ))}
        </div>
        <div className="x3-plans" key={id} style={{ ["--c" as string]: t.colour }}>
          <div className="x3-card plan">
            <h3>Free</h3>
            <p>Try it first.</p>
            <div className="price"><small>Rs.</small>0</div>
            <a className="x3-btn x3-blue" href="/signup">Start free</a>
            <ul>
              <li><Check />100 free questions</li>
              <li><Check />One mini mock</li>
              <li><Check />Every answer explained</li>
            </ul>
          </div>
          <div className="x3-card plan best">
            <span className="bolt" aria-hidden="true"><Markhor height={22} /></span>
            <h3>3 months</h3>
            <p>Time to cover the whole syllabus.</p>
            <div className="price"><small>Rs.</small>{rs(three)}</div>
            <span className="early">Rs. {rs(Math.round(three / 3))} a month{save > 0 ? `, ${save}% less than monthly` : ""}</span>
            <a className="x3-btn x3-white" href="/signup">Get 3 months</a>
            <ul>
              {page.perks.map((p) => <li key={p}><Check />{p}</li>)}
              <li><Check />One payment, no renewal</li>
            </ul>
          </div>
          <div className="x3-card plan">
            <h3>1 month</h3>
            <p>A last push before the paper.</p>
            <div className="price"><small>Rs.</small>{rs(month)}</div>
            <a className="x3-btn x3-blue" href={buy("monthly")}>Get 1 month</a>
            <ul>
              <li><Check />Everything in 3 months</li>
              <li><Check />30 days, no renewal</li>
            </ul>
          </div>
        </div>
        <p className="x3-note">{payments ? "" : "Payments open soon. The free questions are open now. "}Each area is priced on its own, so you never pay for exams you won&apos;t sit.</p>
      </div>
    </section>
  );
}

export function Faq({ payments }: { payments: boolean }) {
  const faqs = [
    { q: "Is this a coaching course?", a: "No. It's a practice tool: MCQs, explanations, timed mocks and past papers, for a fraction of what a course costs." },
    { q: "Where do the questions come from?", a: "Every question is written for this bank from the official syllabus and its textbooks, then checked against the textbook before it goes live." },
    { q: "Can I use more than one area?", a: "Yes. Each area is its own plan, so add another whenever you need it." },
    { q: "How do I pay?", a: payments ? "JazzCash, Easypaisa, card or bank transfer. One payment, no renewal." : "Payments open soon: JazzCash, Easypaisa, card or bank transfer, as one payment with no renewal. The free questions are open now." },
    { q: "Does it work on a phone?", a: "Yes. It's built for phones first and works in any browser. iOS and Android apps are coming soon." },
  ];
  return (
    <section id="faq" className="x3-sec">
      <div className="x3-wrap x3-faqwrap">
        <div className="x3-head">
          <span className="x3-tag">FAQ</span>
          <h2>Questions,<br /><span className="mute">answered.</span></h2>
        </div>
        <div className="x3-faq">
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
  return (
    <section className="x3-sec x7-end">
      <div className="x3-wrap">
        <div className="x3-card x7-endcard">
          <span className="x7-endmark" aria-hidden="true"><Markhor height={56} /></span>
          <h2>Start where you are.<br /><span className="mute">The first 100 questions are free.</span></h2>
          <a className="x3-btn x3-blue x3-big" href="/signup">Start free</a>
          <small>iOS and Android apps coming soon.</small>
        </div>
      </div>
    </section>
  );
}
