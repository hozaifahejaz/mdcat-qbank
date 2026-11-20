"use client";

import { Markhor } from "@/components/Logo";
import { Inside } from "./AreaLive";
import { useArea, ChangeArea } from "./ExamState";

/* Everything below the hero of experiment 4, written for the chosen area: a look inside the account, its own prices,
   FAQ and closing call. The area's tests are shown once, as the cards in the hero. */

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

export function Features() {
  const { area } = useArea();
  return (
    <section id="features" className="x3-sec">
      <div className="x3-wrap">
        <div className="x3-head">
          <span className="x3-tag">Inside</span>
          <h2>Your {area.name.toLowerCase()} account.<br /><span className="mute">Nothing else in it.</span></h2>
        </div>
        <Inside area={area} />
      </div>
    </section>
  );
}

const buy = (plan: string) => `/signup?next=${encodeURIComponent(`/checkout?plan=${plan}`)}`;

export function Pricing({ payments }: { payments: boolean }) {
  const { area } = useArea();
  const { month, three } = area.page.price;
  const save = Math.round((1 - three / (month * 3)) * 100);
  return (
    <section id="pricing" className="x3-sec">
      <div className="x3-wrap">
        <div className="x3-head">
          <span className="x3-tag">Pricing</span>
          <h2>Pay for {area.name.toLowerCase()}.<br /><span className="mute">Not for everyone else&apos;s.</span></h2>
        </div>
        <div className="x3-plans" key={area.id}>
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
            <div className="price"><small>Rs.</small>{three.toLocaleString("en-GB")}</div>
            {save > 0 && <span className="early">Save {save}% on 3 single months</span>}
            <a className="x3-btn x3-white" href="/signup">Get 3 months</a>
            <ul>
              {area.page.perks.map((p) => <li key={p}><Check />{p}</li>)}
              <li><Check />One payment, no renewal</li>
            </ul>
          </div>
          <div className="x3-card plan">
            <h3>1 month</h3>
            <p>A last push before the paper.</p>
            <div className="price"><small>Rs.</small>{month.toLocaleString("en-GB")}</div>
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

export function Faq() {
  const { area } = useArea();
  const faqs = [
    ...area.page.faqs,
    { q: "Where do the questions come from?", a: "Every question is written for this bank from the official syllabus and checked against the textbook before it goes live." },
    { q: "Does it work on a phone?", a: "Yes, in any browser. iOS and Android apps are coming soon." },
  ];
  return (
    <section id="faq" className="x3-sec">
      <div className="x3-wrap x3-faqwrap">
        <div className="x3-head">
          <span className="x3-tag">FAQ</span>
          <h2>Questions,<br /><span className="mute">answered.</span></h2>
        </div>
        <div className="x3-faq" key={area.id}>
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
    <section className="x3-sec x4-end">
      <div className="x3-wrap">
        <h2>Your summit is waiting.</h2>
        <a className="x3-btn x3-blue x3-big" href="/signup">Start free</a>
        <p><ChangeArea>Preparing for something else?</ChangeArea></p>
      </div>
    </section>
  );
}
