"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/app/AppShell";
import { formatPhone } from "@/lib/auth";
import { type Method, methodNames, money, type PlanId, plans } from "@/lib/billing";
import { site } from "@/lib/site";
import type { AccountUser } from "@/lib/user";

export default function CheckoutScreen() {
  return <AppShell title="Checkout">{(user) => <Checkout user={user} />}</AppShell>;
}

const methods: { id: Method; hint: string }[] = [
  { id: "jazzcash", hint: "Approve with your MPIN" },
  { id: "easypaisa", hint: "Approve in the app" },
  { id: "card", hint: "Visa, Mastercard, UnionPay" },
  { id: "transfer", hint: "Upload a screenshot" },
];

/* /checkout?plan=season|monthly — the order and the ways to pay. Payments aren't open until the aggregator is
   connected, so nothing here takes card or wallet details and the pay button stays off. */
function Checkout({ user }: { user: AccountUser }) {
  const [planId, setPlanId] = useState<PlanId>("season");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("plan");
    if (p === "monthly" || p === "season") setPlanId(p);
  }, []);

  const plan = plans[planId];

  return (
    <div className="dgrid">
      <section className="hello page-head">
        <div>
          <a className="link back" href="/pricing">← Plans</a>
          <h1>Checkout</h1>
        </div>
      </section>
      <p className="demo"><i />Payments aren&apos;t open yet. Nothing can be bought or charged.</p>

      <div className="cols">
        <section className="dcard panel" aria-labelledby="pay-h">
          <h2 id="pay-h" className="panel-title">Ways to pay</h2>
          <ul className="methods" aria-label="Payment methods">
            {methods.map((m) => (
              <li key={m.id} className={`method m-${m.id} static`}>
                <span className="m-logo" aria-hidden="true">{m.id === "jazzcash" ? "JC" : m.id === "easypaisa" ? "ep" : m.id === "card" ? "▭" : "⇄"}</span>
                <b>{methodNames[m.id]}</b>
                <span className="muted">{m.hint}</span>
              </li>
            ))}
          </ul>
          <p className="muted small">
            These open with the question bank. Questions before then? <a className="link" href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>
          </p>
        </section>

        <aside className="dcard panel summary" aria-labelledby="sum-h">
          <h2 id="sum-h" className="panel-title">Order</h2>
          <div className="seg" role="radiogroup" aria-label="Plan">
            {(Object.keys(plans) as PlanId[]).map((id) => (
              <button key={id} type="button" role="radio" aria-checked={planId === id} onClick={() => setPlanId(id)}>
                <b>{plans[id].name}</b><span>{money(plans[id].price)} {plans[id].per}</span>
              </button>
            ))}
          </div>
          <dl className="sum">
            <div><dt>{plan.name}</dt><dd>{money(plan.was ?? plan.price)}</dd></div>
            {plan.was && <div className="up"><dt>Early bird</dt><dd>− {money(plan.was - plan.price)}</dd></div>}
            <div className="total"><dt>Total</dt><dd>{money(plan.price)}</dd></div>
          </dl>
          <button type="button" className="dpill dark block" disabled>Payments open soon</button>
          <p className="muted small">
            Signed in as {user.phone ? formatPhone(user.phone) : user.email}. {plan.blurb}.
          </p>
        </aside>
      </div>
    </div>
  );
}
