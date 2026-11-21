"use client";

import { useEffect, useState } from "react";
import AppShell, { AccountTabs, PageHead } from "@/components/app/AppShell";
import { getReceipts, isRenewal, methodNames, money, plans, type Receipt, renewOff, renewPrice } from "@/lib/billing";
import { day, fullDay, planNames } from "@/lib/format";
import { site, supportHref } from "@/lib/site";
import type { AccountUser } from "@/lib/user";

export default function BillingScreen() {
  return <AppShell active="/account/billing">{(user) => <Billing user={user} />}</AppShell>;
}

const statusNames: Record<Receipt["status"], { word: string; cls: string }> = {
  paid: { word: "Paid", cls: "good" },
  pending: { word: "Checking", cls: "warn" },
  refunded: { word: "Refunded", cls: "" },
};

/* /account/billing — the plan and every payment. */
function Billing({ user }: { user: AccountUser }) {
  const [receipts, setReceipts] = useState<Receipt[] | null>(null);
  useEffect(() => { getReceipts(user).then(setReceipts); }, [user]);

  const paid = user.plan !== "free";
  return (
    <div className="dgrid">
      <PageHead title="Plan and billing" />
      <AccountTabs active="/account/billing" />

      <div className="cols even">
        <section className={`dcard panel plan${paid ? "" : " free"}`} aria-labelledby="plan-h">
          <div className="panel-h">
            <h2 id="plan-h">Your plan</h2>
            <span className={`badge ${paid ? "good" : ""}`}>{paid ? "Active" : "Free"}</span>
          </div>
          <p className="plan-name">{planNames[user.plan]}</p>
          <p className="muted">
            {paid
              ? <>Full access{user.planExpiresAt ? <> until <b>{fullDay(user.planExpiresAt)}</b>. Nothing is charged automatically. Renew for {renewOff}% less</> : null}.</>
              : "100 free questions, one mini mock and every answer explained."}
          </p>
          <div className="hello-ctas">
            {/* Lifetime access (no end date) has nothing to buy. */}
            {!paid && <a className="dpill dark" href="/checkout?plan=season">Get 3 months · {money(plans.season.price)}</a>}
            {!paid && <a className="dpill light" href="/checkout?plan=monthly">1 month · {money(plans.monthly.price)}</a>}
            {isRenewal(user.plan) && user.planExpiresAt && <a className="dpill dark" href={`/checkout?plan=${user.plan}`}>Renew · {money(renewPrice(plans[user.plan as "season" | "monthly"].price))}</a>}
          </div>
        </section>

        {site.payments && <section className="dcard panel" aria-labelledby="help-h">
          <h2 id="help-h" className="panel-title">Paid but not showing?</h2>
          <p className="muted">Wallet and card payments switch your plan on straight away. Bank transfers are checked by hand first.</p>
          <a className="link" href={site.whatsapp ? supportHref : "/contact?topic=payment"}>Message support</a>
        </section>}
      </div>

      {site.payments && <section className="dcard panel" aria-labelledby="rc-h">
        <div className="panel-h"><h2 id="rc-h">Receipts</h2></div>
        {receipts && !receipts.length ? (
          <p className="muted">No payments yet.</p>
        ) : (
          <div className="table-scroll">
            <table className="recent">
              <thead>
                <tr><th scope="col">Receipt</th><th scope="col">Item</th><th scope="col">Paid with</th><th scope="col">Date</th><th scope="col" className="num">Amount</th><th scope="col">Status</th><th scope="col"><span className="sr">Download</span></th></tr>
              </thead>
              <tbody>
                {(receipts ?? []).map((r) => (
                  <tr key={r.id}>
                    <th scope="row"><code>{r.id}</code></th>
                    <td>{r.item}</td>
                    <td>{methodNames[r.method]}</td>
                    <td>{day(r.date)}</td>
                    <td className="num"><b>{money(r.amount)}</b></td>
                    <td><span className={`acc ${statusNames[r.status].cls}`}>{statusNames[r.status].word}</span></td>
                    <td className="num"><button type="button" className="link" onClick={() => window.print()}>Print</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>}
    </div>
  );
}
