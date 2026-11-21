"use client";

import { Markhor } from "@/components/Logo";
import { tracks, type TrackId } from "@/lib/catalogue";
import { trackPages } from "@/lib/track-pages";
import { useArea } from "@/components/experiment4/ExamState";
import TrackMark from "@/components/experiment4/TrackMark";

/* Pricing for landing experiment 8, taken from experiment 7: area chips over the three plans (Free, 3 months in the
   middle, 1 month), priced per area. It shares the area with the hero, so picking an area in either place shows the
   same one in both. */

const buy = (plan: string) => `/signup?next=${encodeURIComponent(`/checkout?plan=${plan}`)}`;
const rs = (n: number) => n.toLocaleString("en-GB");
const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

export default function Pricing({ payments }: { payments: boolean }) {
  const { area, choose } = useArea();
  const id = area.id as TrackId;
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
        <div className="x8-chips" role="tablist" aria-label="Area">
          {tracks.map((x) => (
            <button key={x.id} type="button" role="tab" aria-selected={x.id === id} className={x.id === id ? "on" : ""} style={{ ["--c" as string]: x.colour }} onClick={() => choose(x.id as TrackId)}>
              <TrackMark id={x.id} size={16} />{x.name}
            </button>
          ))}
        </div>
        <div className="x3-plans x8-plans" key={id}>
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
