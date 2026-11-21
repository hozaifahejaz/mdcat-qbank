"use client";

import { useEffect } from "react";
import { Markhor } from "@/components/Logo";
import { AREAS, still } from "./areas";
import Goat from "./Goat";
import { useArea } from "./State";

/* The sections under the map on landing experiment 7. Each one follows the peak chosen above: the route shows that
   area's subjects and mock, the prices are that area's, and the FAQ adds that area's own question. Seen() marks each
   section the first time it scrolls into view, which starts its entrance in exp7.css (a short rise, never a fade). */

const buy = (plan: string) => `/signup?next=${encodeURIComponent(`/checkout?plan=${plan}`)}`;
const rs = (n: number) => n.toLocaleString("en-GB");
const clock = (s: number) => `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:00`;

const Check = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

export function Seen() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".x7");
    if (!root || still() || !("IntersectionObserver" in window)) return;
    const secs = Array.from(root.querySelectorAll<HTMLElement>(".x7-sec"));
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { e.target.setAttribute("data-seen", ""); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -14% 0px" });
    const vh = window.innerHeight;
    for (const s of secs) { if (s.getBoundingClientRect().top < vh * 0.86) s.setAttribute("data-seen", ""); else io.observe(s); }
    root.setAttribute("data-armed", "");
    return () => io.disconnect();
  }, []);
  return null;
}

export function Route() {
  const { area } = useArea();
  const subs = area.page.subjects.slice(0, 3);
  const most = Math.max(...subs.map((s) => s.n));
  return (
    <section className="x7-sec" id="route" aria-labelledby="route-h">
      <div className="x7-wrap">
        <div className="x7-head">
          <span className="x7-num">II</span>
          <h2 id="route-h">One route to every summit.</h2>
          <p>Three camps, whichever peak you pick.</p>
        </div>
        <div className="x7-route">
          {/* The route climbs left to right through the three camps; each column hangs from its camp. */}
          <svg className="x7-path" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
            <path d="M6 110C120 110 240 70 351 70S580 30 696 30 900 10 994 6" pathLength={1} />
          </svg>
          <span className="x7-dot" style={{ left: "0.6%", top: 110 }} aria-hidden="true" />
          <span className="x7-dot" style={{ left: "35.1%", top: 70 }} aria-hidden="true" />
          <span className="x7-dot" style={{ left: "69.6%", top: 30 }} aria-hidden="true" />
          <ol>
            <li>
              <span className="x7-camp"><b>Camp I</b>Base</span>
              <h3>Practice by chapter</h3>
              <p>Pick a chapter and go. Every answer comes with the reason, and why the others are wrong.</p>
              <div className="x7-mini x7-bars" aria-hidden="true">
                {subs.map((s, i) => (
                  <div key={area.id + s.name}>
                    <span>{s.name}</span>
                    <u><s style={{ ["--w" as string]: (0.35 + 0.6 * (s.n / most) * (1 - i * 0.18)).toFixed(2), background: s.c }} /></u>
                  </div>
                ))}
              </div>
            </li>
            <li>
              <span className="x7-camp"><b>Camp II</b>The climb</span>
              <h3>Timed mocks</h3>
              <p>{area.page.mock.line}</p>
              <div className="x7-mini x7-clock" aria-hidden="true">
                <svg viewBox="0 0 64 64" width="56" height="56">
                  <circle cx="32" cy="32" r="28" />
                  {Array.from({ length: 12 }, (_, i) => <path key={i} d="M32 7v4" transform={`rotate(${i * 30} 32 32)`} />)}
                  <path className="hand" d="M32 32V12" />
                  <circle cx="32" cy="32" r="2.5" className="pin" />
                </svg>
                <b>{clock(area.page.mock.secs)}</b>
              </div>
            </li>
            <li>
              <span className="x7-camp"><b>Summit</b>Paper day</span>
              <h3>Fix what you missed</h3>
              <p>Wrong answers wait in My mistakes until you get them right. Then they leave.</p>
              <div className="x7-mini x7-fix" aria-hidden="true">
                {subs.map((s, i) => (
                  <div key={area.id + s.name} style={{ ["--d" as string]: `${i * 0.35}s` }}>
                    <span>{s.name}</span><i><Check /></i>
                  </div>
                ))}
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Pricing({ payments }: { payments: boolean }) {
  const { area, pick } = useArea();
  const { month, three } = area.page.price;
  const save = Math.round((1 - three / (month * 3)) * 100);
  return (
    <section className="x7-sec" id="pricing" aria-labelledby="price-h">
      <div className="x7-wrap">
        <div className="x7-head">
          <span className="x7-num">III</span>
          <h2 id="price-h">Pick how long you climb.</h2>
          <p>
            Prices for{" "}
            <label className="x7-select">
              <span className="x7-sr">Area</span>
              <select value={area.id} onChange={(e) => pick(e.target.value as typeof area.id)}>
                {AREAS.map((a) => <option key={a.id} value={a.id}>{a.peak.label}</option>)}
              </select>
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3.5l4 4 4-4" /></svg>
            </label>
          </p>
        </div>
        <div className="x7-plans">
          <div className="x7-plan">
            <h3>Free</h3>
            <p>Try it first.</p>
            <div className="x7-price"><small>Rs</small>0</div>
            <a className="x7-btn x7-line" href="/signup">Start free</a>
            <ul>
              <li><Check />100 free questions</li>
              <li><Check />One mini mock</li>
              <li><Check />Every answer explained</li>
            </ul>
          </div>
          <div className="x7-plan best">
            <span className="x7-mark" aria-hidden="true"><Markhor height={24} /></span>
            <h3>3 months</h3>
            <p>Time to cover the whole syllabus.</p>
            <div className="x7-price"><small>Rs</small><span key={three} className="x7-roll">{rs(three)}</span></div>
            <span className="x7-save">Rs {rs(Math.round(three / 3))} a month{save > 0 ? `, ${save}% less than monthly` : ""}</span>
            <a className="x7-btn x7-solid" href="/signup">Get 3 months</a>
            <ul>
              {area.page.perks.map((p) => <li key={p}><Check />{p}</li>)}
              <li><Check />One payment, no renewal</li>
            </ul>
          </div>
          <div className="x7-plan">
            <h3>1 month</h3>
            <p>A last push before the paper.</p>
            <div className="x7-price"><small>Rs</small><span key={month} className="x7-roll">{rs(month)}</span></div>
            <a className="x7-btn x7-line" href={buy("monthly")}>Get 1 month</a>
            <ul>
              <li><Check />Everything in 3 months</li>
              <li><Check />30 days, no renewal</li>
            </ul>
          </div>
        </div>
        <p className="x7-note">{payments ? "" : "Payments open soon. The free questions are open now. "}Each area is priced on its own, so you never pay for tests you won&apos;t sit.</p>
      </div>
    </section>
  );
}

const general = (payments: boolean) => [
  { q: "Is this a coaching course?", a: "No. It's a practice tool: MCQs, explanations, timed mocks and past papers, for a fraction of what a course costs." },
  { q: "Where do the questions come from?", a: "Every question is written for this bank from the syllabus and its textbooks, then checked against the textbook before it goes live." },
  { q: "How do I pay?", a: payments ? "JazzCash, Easypaisa, card or bank transfer. One payment, no renewal." : "Payments open soon: JazzCash, Easypaisa, card or bank transfer, as one payment with no renewal. The free questions are open now." },
  { q: "Does it work on a phone?", a: "Yes. It's built for phones first and works in any browser. iOS and Android apps are coming soon." },
];

export function Faq({ payments }: { payments: boolean }) {
  const { area } = useArea();
  const faqs = [...area.page.faqs, ...general(payments)];
  return (
    <section className="x7-sec" id="faq" aria-labelledby="faq-h">
      <div className="x7-wrap x7-faqgrid">
        <div className="x7-head">
          <span className="x7-num">IV</span>
          <h2 id="faq-h">Asked often.</h2>
        </div>
        <div className="x7-faq">
          {faqs.map((f, i) => (
            <details key={area.id + f.q} open={i === 0}>
              <summary><span>{f.q}</span><i aria-hidden="true" /></summary>
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
    <section className="x7-sec x7-end" aria-labelledby="end-h">
      <div className="x7-wrap">
        {/* A small summit in terraces, the markhor on top. */}
        <svg className="x7-summit" viewBox="0 -60 320 180" aria-hidden="true">
          {[150, 122, 96, 72, 50, 30].map((rx, i) => <ellipse key={rx} cx="160" cy={104 - i * 14} rx={rx} ry={rx * 0.2} pathLength={1} style={{ transitionDelay: `${i * 0.12}s` }} />)}
          <g className="x7-endgoat"><g transform="translate(160 34)"><Goat size={0.6} /></g></g>
        </svg>
        <h2 id="end-h">The markhor climbs where there is no path.<span>Yours is already marked.</span></h2>
        <a className="x7-btn x7-solid x7-big" href="/signup">Start free</a>
        <small>iOS and Android apps coming soon.</small>
      </div>
    </section>
  );
}
