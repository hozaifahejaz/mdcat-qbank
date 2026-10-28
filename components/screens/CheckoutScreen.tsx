"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/app/AppShell";
import PayLogo, { type Brand } from "@/components/app/PayLogo";
import { formatPhone } from "@/lib/auth";
import { type Method, methodNames, money, type PlanId, plans } from "@/lib/billing";
import { site } from "@/lib/site";
import type { AccountUser } from "@/lib/user";

export default function CheckoutScreen() {
  return <AppShell title="Checkout">{(user) => <Checkout user={user} />}</AppShell>;
}

const methods: { id: Method; hint: string; brands: Brand[]; steps: string[] }[] = [
  {
    id: "jazzcash",
    hint: "Mobile account",
    brands: ["jazzcash"],
    steps: ["Enter your JazzCash number", "Approve the request with your MPIN", "Your pass opens straight away"],
  },
  {
    id: "easypaisa",
    hint: "Mobile account",
    brands: ["easypaisa"],
    steps: ["Enter your Easypaisa number", "Approve the request in the Easypaisa app", "Your pass opens straight away"],
  },
  {
    id: "card",
    hint: "Any Pakistani or international card",
    brands: ["visa", "mastercard", "unionpay"],
    steps: ["Enter your card on the secure payment page", "Confirm with the code your bank sends", "Your pass opens straight away"],
  },
  {
    id: "transfer",
    hint: "Any Pakistani bank",
    brands: ["raast"],
    steps: ["Send the total to our Raast ID or IBAN", "Upload a screenshot of the transfer", "We open your pass once it's checked"],
  },
];

const included = ["Every MDCAT question with explanations", "Full-length mocks and past papers", "Subject and chapter analytics"];

const icon = {
  tick: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  bolt: <path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></>,
};
const Icon = ({ d, size = 16 }: { d: keyof typeof icon; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon[d]}</svg>
);

/* /checkout?plan=season|monthly — the order and the ways to pay. Payments aren't open until the aggregator is
   connected, so picking a method only shows how it will work: nothing takes card or wallet details and the pay
   button stays off. */
function Checkout({ user }: { user: AccountUser }) {
  const [planId, setPlanId] = useState<PlanId>("season");
  const [method, setMethod] = useState<Method>("jazzcash");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("plan");
    if (p === "monthly" || p === "season") setPlanId(p);
  }, []);

  const plan = plans[planId];

  return (
    <div className="dgrid checkout">
      <section className="hello page-head">
        <div>
          <a className="link back" href="/pricing">← Plans</a>
          <h1>Checkout</h1>
        </div>
      </section>
      <p className="demo"><i />Payments aren&apos;t open yet. Nothing can be bought or charged.</p>

      <div className="cols">
        <section className="dcard panel" aria-labelledby="pay-h">
          <h2 id="pay-h" className="panel-title">How would you like to pay?</h2>
          <div className="paylist" role="radiogroup" aria-labelledby="pay-h">
            {methods.map((m) => {
              const on = method === m.id;
              return (
                <div key={m.id} className={`payopt${on ? " on" : ""}`}>
                  <button type="button" role="radio" aria-checked={on} onClick={() => setMethod(m.id)}>
                    <span className="dot" aria-hidden="true" />
                    <span className="payopt-t">
                      <b>{methodNames[m.id]}</b>
                      <span className="muted">{m.hint}</span>
                    </span>
                    <span className="payopt-logos">{m.brands.map((b) => <PayLogo key={b} brand={b} />)}</span>
                  </button>
                  {on && (
                    <ol className="paysteps">
                      {m.steps.map((s) => <li key={s}>{s}</li>)}
                    </ol>
                  )}
                </div>
              );
            })}
          </div>
          <ul className="trust">
            <li><Icon d="lock" />Paid through a licensed gateway. We never see your card or MPIN.</li>
            <li><Icon d="bolt" />Access opens the moment payment clears.</li>
            <li><Icon d="receipt" />Receipt by SMS and email.</li>
          </ul>
        </section>

        <aside className="dcard panel summary" aria-labelledby="sum-h">
          <h2 id="sum-h" className="panel-title">Your order</h2>
          <div className="seg" role="radiogroup" aria-label="Plan">
            {(Object.keys(plans) as PlanId[]).map((id) => (
              <button key={id} type="button" role="radio" aria-checked={planId === id} onClick={() => setPlanId(id)}>
                <span className="seg-row">
                  <b>{plans[id].name}</b>
                  {id === "season" && <span className="badge good">Best value</span>}
                </span>
                <span>{money(plans[id].price)} {plans[id].per}</span>
              </button>
            ))}
          </div>
          <ul className="ticks small-ticks">{included.map((x) => <li key={x}><Icon d="tick" />{x}</li>)}</ul>
          <dl className="sum">
            <div><dt>{plan.name}</dt><dd>{money(plan.was ?? plan.price)}</dd></div>
            {plan.was && <div className="up"><dt>Early bird</dt><dd>− {money(plan.was - plan.price)}</dd></div>}
            <div className="total"><dt>Total</dt><dd>{money(plan.price)}</dd></div>
          </dl>
          <button type="button" className="dpill dark block" disabled>Payments open soon</button>
          <p className="muted small">
            {plan.blurb}. Signed in as {user.phone ? formatPhone(user.phone) : user.email}.
          </p>
          <p className="muted small">
            Questions? <a className="link" href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>
          </p>
        </aside>
      </div>
    </div>
  );
}
