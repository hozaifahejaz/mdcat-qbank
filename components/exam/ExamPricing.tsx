"use client";

import { useState } from "react";
import { Markhor } from "@/components/Logo";
import Notify from "@/components/exam/Notify";
import { signupHref } from "@/lib/exams";

/* An exam page's pricing as a pass the student builds: pick how long, add another test of the same group if they sit
   more than one (MDCAT, NUMS and AKU offer each other), and the pass beside it shows exactly what they get and what it
   costs. Every button signs up with all the picked tests ticked. An exam that isn't open yet shows the same pass,
   stamped "Opening soon", with "Tell me when it opens" where the choices would be. */

type Mini = { id: string; short: string; name: string };
type Props = {
  exam: Mini & { area: string };
  price?: { month: number; three: number };
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
  const [len, setLen] = useState<"three" | "month">("three");
  const [added, setAdded] = useState<string[]>([]);
  const flip = (id: string) => setAdded((a) => (a.includes(id) ? a.filter((x) => x !== id) : others.map((o) => o.id).filter((x) => x === id || a.includes(x))));
  const n = added.length;
  const tests = [exam, ...others.filter((o) => added.includes(o.id))];
  const href = (then?: string) => signupHref({ area: exam.area, exam: tests.map((t) => t.id).join(","), then });

  if (!price) {
    return (
      <div className="xe-pass-wrap">
        <Notify exam={exam.id} short={exam.short} />
        <Ticket tests={[exam]} soon />
      </div>
    );
  }

  const three = price.three + n * addOn.three, month = price.month + n * addOn.month;
  const total = len === "three" ? three : month;
  const save = Math.round((1 - three / (month * 3)) * 100);

  return (
    <>
      <div className="xe-pass-wrap">
        <div className="xe-build">
          <fieldset>
            <legend>How long</legend>
            <div className="xe-seg" role="radiogroup">
              <button type="button" role="radio" aria-checked={len === "three"} onClick={() => setLen("three")}>
                <b>3 months</b><small>Rs. {rs(three)}{save > 0 ? ` · save ${save}%` : ""}</small>
              </button>
              <button type="button" role="radio" aria-checked={len === "month"} onClick={() => setLen("month")}>
                <b>1 month</b><small>Rs. {rs(month)}</small>
              </button>
            </div>
          </fieldset>
          {others.length > 0 && (
            <fieldset>
              <legend>Sitting another test too?</legend>
              <div className="xe-adds">
                {others.map((o) => (
                  <button key={o.id} type="button" className="xe-addopt" aria-pressed={added.includes(o.id)} onClick={() => flip(o.id)}>
                    <span className="xe-box" aria-hidden="true"><Check /></span>
                    <span><b>{o.name}</b><small>+Rs. {rs(len === "three" ? addOn.three : addOn.month)}</small></span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          <div className="xe-free">
            <p><b>Not ready to pay?</b> 100 questions are free, with every answer explained.</p>
            <a className="x3-btn xe-line" href={href()}>Start free</a>
          </div>
        </div>

        <Ticket tests={tests} len={len} total={total} perks={perks} renewOff={renewOff}
          cta={<a className="x3-btn x3-white" href={href(len === "three" ? "/checkout?plan=season" : "/checkout?plan=monthly")}>Get {len === "three" ? "3 months" : "1 month"}</a>} />
      </div>
      {!payments && <p className="x3-note">Payments open soon. The free questions are open now.</p>}
    </>
  );
}

/* The pass itself: an admit card with a torn edge, the tests on it, how long, and the price. */
function Ticket({ tests, len, total, perks = [], renewOff, cta, soon = false }: { tests: Mini[]; len?: "three" | "month"; total?: number; perks?: string[]; renewOff?: number; cta?: React.ReactNode; soon?: boolean }) {
  return (
    <div className={soon ? "xe-pass soon" : "xe-pass"}>
      <div className="xe-pass-top">
        <span className="xe-pass-brand"><Markhor height={20} />Markhor Prep pass</span>
        <ul className="xe-pass-tests">{tests.map((t) => <li key={t.id}>{t.short}</li>)}</ul>
        {soon ? (
          <p className="xe-pass-price soon">Opening soon</p>
        ) : (
          <>
            <p className="xe-pass-price"><small>Rs. </small>{rs(total!)}</p>
            <p className="xe-pass-per">{len === "three" ? `3 months · Rs. ${rs(Math.round(total! / 3))} a month` : "1 month · 30 days of full access"}</p>
            {cta}
          </>
        )}
      </div>
      <div className="xe-pass-cut" aria-hidden="true" />
      <ul className="xe-pass-perks">
        {(soon ? ["Every chapter of the syllabus", "Full-length timed mocks", "Every answer explained"] : perks).map((p) => <li key={p}><Check />{p}</li>)}
        {!soon && len === "three" && <li><Check />Renew for {renewOff}% less when it ends</li>}
      </ul>
    </div>
  );
}
