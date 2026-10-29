"use client";

import { useEffect, useState } from "react";
import AppShell, { PageHead } from "@/components/app/AppShell";
import { getReceipts, methodNames, money, plans, type Receipt } from "@/lib/billing";
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
      <PageHead title="Plan and billing">
        <a className="dpill light" href="/account">Account and devices</a>
      </PageHead>

      <div className="cols even">
        <section className={`dcard panel plan${paid ? "" : " free"}`} aria-labelledby="plan-h">
          <div className="panel-h">
            <h2 id="plan-h">Your plan</h2>
            <span className={`badge ${paid ? "good" : ""}`}>{paid ? "Active" : "Free"}</span>
          </div>
          <p className="plan-name">{planNames[user.plan]}</p>
          <p className="muted">
            {paid
              ? <>Full access{user.planExpiresAt ? <> until <b>{fullDay(user.planExpiresAt)}</b></> : null}. One payment, no renewal.</>
              : site.launched ? "A free set of questions in every subject, one mini mock and basic stats." : "Free questions, one mini mock and basic stats once the bank opens."}
          </p>
          <div className="hello-ctas">
            {user.plan !== "season" && <a className="dpill dark" href="/checkout?plan=season">{paid ? "Switch to" : "Get"} the Season Pass · {money(plans.season.price)}</a>}
          </div>
        </section>

        <section className="dcard panel" aria-labelledby="help-h">
          <h2 id="help-h" className="panel-title">Paid but not showing?</h2>
          <p className="muted">Wallet and card payments switch your plan on straight away. Bank transfers are checked by hand first.</p>
          <a className="link" href={supportHref}>Message support with your receipt number</a>
        </section>
      </div>

      <section className="dcard panel" aria-labelledby="rc-h">
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
      </section>
    </div>
  );
}
