"use client";

import { useState } from "react";
import { Markhor } from "@/components/Logo";
import { signupHref } from "@/lib/exams";

/* An exam page's pricing: this exam's plans only, priced for it. Exams in its group (MDCAT, NUMS and AKU offer each
   other) can be added in the "Add to your plan" row; each one adds a small amount to both plans, and every button then
   signs up with all the picked exams ticked. */

type Mini = { id: string; short: string; name: string };
type Props = {
  exam: Mini & { area: string };
  price: { month: number; three: number };
  perks: string[];
  others: Mini[];
  addOn: { month: number; three: number };
  payments: boolean;
  renewOff: number;
};

const rs = (n: number) => n.toLocaleString("en-GB");
const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

export default function ExamPricing({ exam, price, perks, others, addOn, payments, renewOff }: Props) {
  const [added, setAdded] = useState<string[]>([]);
  const flip = (id: string) => setAdded((a) => (a.includes(id) ? a.filter((x) => x !== id) : others.map((o) => o.id).filter((x) => x === id || a.includes(x))));
  const n = added.length;
  const month = price.month + n * addOn.month;
  const three = price.three + n * addOn.three;
  const save = Math.round((1 - three / (month * 3)) * 100);
  const exams = [exam.id, ...added].join(",");
  const href = (then?: string) => signupHref({ area: exam.area, exam: exams, then });
  const names = [exam.short, ...others.filter((o) => added.includes(o.id)).map((o) => o.short)];
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0];

  return (
    <>
      {others.length > 0 && (
        <div className="xe-add" role="group" aria-labelledby="xe-add-h">
          <p id="xe-add-h"><b>Add to your plan</b><span>Sitting more than one test? Add it for a little more.</span></p>
          <div className="xe-addopts">
            {others.map((o) => (
              <button key={o.id} type="button" className="xe-addopt" aria-pressed={added.includes(o.id)} onClick={() => flip(o.id)}>
                <span className="xe-box" aria-hidden="true"><Check /></span>
                <span><b>{o.name}</b><small>+Rs. {rs(addOn.three)} on 3 months · +Rs. {rs(addOn.month)} on 1 month</small></span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="x3-plans x8-plans">
        <div className="x3-card plan">
          <h3>Free</h3>
          <p>Try it first.</p>
          <div className="price"><small>Rs. </small>0</div>
          <a className="x3-btn x3-blue" href={href()}>Start free</a>
          <ul>
            <li><Check />100 free questions</li>
            <li><Check />One mini mock</li>
            <li><Check />Every answer explained</li>
          </ul>
        </div>
        <div className="x3-card plan best">
          <span className="bolt" aria-hidden="true"><Markhor height={22} /></span>
          <h3>3 months</h3>
          <p>{n ? list : "Time to cover the whole syllabus."}</p>
          <div className="price"><small>Rs. </small>{rs(three)}</div>
          <span className="early">Rs. {rs(Math.round(three / 3))} a month{save > 0 ? `, ${save}% less than monthly` : ""}</span>
          <a className="x3-btn x3-white" href={href("/checkout?plan=season")}>Get 3 months</a>
          <ul>
            {perks.map((p) => <li key={p}><Check />{p}</li>)}
            {added.map((id) => <li key={id}><Check />Everything for {others.find((o) => o.id === id)!.short} too</li>)}
            <li><Check />Renew for {renewOff}% less when it ends</li>
          </ul>
        </div>
        <div className="x3-card plan">
          <h3>1 month</h3>
          <p>{n ? list : "A last push before the paper."}</p>
          <div className="price"><small>Rs. </small>{rs(month)}</div>
          <a className="x3-btn x3-blue" href={href("/checkout?plan=monthly")}>Get 1 month</a>
          <ul>
            <li><Check />Everything in 3 months</li>
            <li><Check />30 days of full access</li>
          </ul>
        </div>
      </div>
      {!payments && <p className="x3-note">Payments open soon. The free questions are open now.</p>}
    </>
  );
}
