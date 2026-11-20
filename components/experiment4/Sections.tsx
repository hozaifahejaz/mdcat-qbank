"use client";

import { Markhor } from "@/components/Logo";
import { SubjectMark } from "@/components/Marks";
import { Inside } from "./AreaLive";
import { useArea, ChangeArea } from "./ExamState";
import TrackMark from "./TrackMark";

/* Everything below the hero of experiment 4, written for the chosen area: the main landing page's features (with its
   live widgets), its subject orbit, the area's exams with their details, its own prices, FAQ and closing call. */

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

const extras = ["Timed mocks", "My mistakes", "Bookmarks", "Past papers", "Explanations", "Progress"];
export function Orbit() {
  const { area } = useArea();
  const outer = [...area.exams.map((e) => ({ name: e.name, exam: true })), ...extras.map((name) => ({ name, exam: false }))].slice(0, 8);
  const inner = area.page.subjects.slice(0, 5);
  return (
    <section id="subjects" className="x3-sec x3-grid">
      <div className="x3-wrap">
        <div className="x3-head">
          <h2>Every subject.<br />One bank.</h2>
        </div>
        <div className="orbit" aria-label={`${area.name} subjects and exams`} key={area.id}>
          <div className="orb r2">
            {outer.map((o, i) => (
              <span key={o.name} className="sat" style={{ ["--a" as string]: `${(360 / outer.length) * i}deg` }}>
                <i>{o.exam && <em style={{ color: area.colour }}><TrackMark id={area.id} size={16} /></em>}{o.name}</i>
              </span>
            ))}
          </div>
          <div className="orb r1">
            {inner.map((s, i) => (
              <span key={s.name} className="sat" style={{ ["--a" as string]: `${(360 / inner.length) * i + 20}deg` }}>
                <i><em style={{ color: s.c }}><SubjectMark subject={s.name} size={16} /></em>{s.name}</i>
              </span>
            ))}
          </div>
          <div className="core" style={{ color: area.colour }}><Markhor height={52} /></div>
        </div>
      </div>
    </section>
  );
}

export function Exams() {
  const { area } = useArea();
  const n = area.exams.length;
  const live = area.exams.filter((e) => e.live).length;
  return (
    <section id="exams" className="x3-sec">
      <div className="x3-wrap">
        <div className="x3-head">
          <span className="x3-tag">Tests</span>
          <h2>{n} {n === 1 ? "test" : "tests"}, one account.<br /><span className="mute">{live ? `${live} live now.` : "Opening soon."}</span></h2>
        </div>
        <div className="x4-exams" key={area.id}>
          {area.exams.map((e) => (
            <article key={e.id} className="x3-card x4-exam">
              <span className="x4-examhead">
                <span className="x4-tile" style={{ color: area.colour }}><TrackMark id={area.id} size={22} /></span>
                <em className={e.live ? "x4-status live" : "x4-status"}>{e.live ? "Live" : "Coming soon"}</em>
              </span>
              <b>{e.name}</b>
              <small>{e.body}</small>
              {e.pattern && (
                <>
                  <p>{e.pattern.summary}</p>
                  <div className="x4-bar thin" aria-hidden="true">
                    {e.pattern.parts.map((p, i) => <span key={p.name} title={`${p.name} ${p.n}`} style={{ flexGrow: p.n, background: `color-mix(in srgb, ${area.colour} ${100 - i * 15}%, var(--x-card))` }} />)}
                  </div>
                  <span className="x4-parts">{e.pattern.parts.map((p) => `${p.name} ${p.n}`).join(" · ")}</span>
                </>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const buy = (plan: string) => `/signup?next=${encodeURIComponent(`/checkout?plan=${plan}`)}`;

export function Pricing({ payments }: { payments: boolean }) {
  const { area } = useArea();
  const { month, three } = area.page.price;
  const save = Math.round((1 - three / (month * 3)) * 100);
  const open = area.live;
  const later = <a className="x3-btn x3-blue" href="#top">Tell me when it opens</a>;
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
            {open ? <a className="x3-btn x3-blue" href="/signup">Start free</a> : later}
            <ul>
              <li><Check />100 free questions</li>
              <li><Check />One mini mock</li>
              <li><Check />Every answer explained</li>
            </ul>
          </div>
          <div className="x3-card plan">
            <h3>1 month</h3>
            <p>A focused push before the paper.</p>
            <div className="price"><small>Rs.</small>{month.toLocaleString("en-GB")}</div>
            {open ? <a className="x3-btn x3-blue" href={buy("monthly")}>Get 1 month</a> : later}
            <ul>
              {area.page.perks.map((p) => <li key={p}><Check />{p}</li>)}
            </ul>
          </div>
          <div className="x3-card plan best">
            <span className="bolt" aria-hidden="true"><Markhor height={22} /></span>
            <h3>3 months</h3>
            <p>Time to cover the whole syllabus.</p>
            <div className="price"><small>Rs.</small>{three.toLocaleString("en-GB")}</div>
            {save > 0 && <span className="early">Save {save}% on 3 single months</span>}
            {open ? <a className="x3-btn x3-white" href="/signup">Get 3 months</a> : <a className="x3-btn x3-white" href="#top">Tell me when it opens</a>}
            <ul>
              <li><Check />Everything in 1 month</li>
              <li><Check />90 days of full access</li>
              <li><Check />One payment, no renewal</li>
            </ul>
          </div>
        </div>
        <p className="x3-note">
          {open ? (payments ? "" : "Payments open soon. The free questions are open now. ") : `${area.name} opens soon; these are the prices it will open at. `}
          Each area is priced on its own, so you never pay for exams you won&apos;t sit.
        </p>
      </div>
    </section>
  );
}

export function Faq() {
  const { area } = useArea();
  const faqs = [
    ...area.page.faqs,
    { q: "Will I see other areas?", a: `No. Your account shows ${area.name.toLowerCase()} and nothing else. If you later need another area, you buy it on its own.` },
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
  const { area } = useArea();
  return (
    <section className="x3-sec x4-end">
      <div className="x3-wrap">
        <h2>Your summit is waiting.</h2>
        {area.live
          ? <a className="x3-btn x3-blue x3-big" href="/signup">Start free</a>
          : <a className="x3-btn x3-blue x3-big" href="#top">Tell me when it opens</a>}
        <p><ChangeArea>Preparing for something else?</ChangeArea></p>
      </div>
    </section>
  );
}
