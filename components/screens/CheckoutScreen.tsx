"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/app/AppShell";
import { formatPhone } from "@/lib/auth";
import { type Method, methodNames, money, pay, type PlanId, plans } from "@/lib/billing";
import { fullDay } from "@/lib/format";
import { site } from "@/lib/site";
import type { AccountUser } from "@/lib/user";

export default function CheckoutScreen() {
  return <AppShell>{(user) => <Checkout user={user} />}</AppShell>;
}

const methods: { id: Method; hint: string }[] = [
  { id: "jazzcash", hint: "Approve with your MPIN" },
  { id: "easypaisa", hint: "Approve in the app" },
  { id: "card", hint: "Visa, Mastercard, UnionPay" },
  { id: "transfer", hint: "Upload a screenshot" },
];

const digits = (s: string, n: number) => s.replace(/\D/g, "").slice(0, n);
const walletOk = (s: string) => /^03\d{9}$/.test(s.replace(/\D/g, ""));

type Stage = { kind: "form" } | { kind: "paying" } | { kind: "done"; receiptId: string } | { kind: "sent" };

/* /checkout?plan=season|monthly — choose a way to pay, then a stand-in for the payment while the aggregator isn't connected. */
function Checkout({ user }: { user: AccountUser }) {
  const [planId, setPlanId] = useState<PlanId>("season");
  const [method, setMethod] = useState<Method>("jazzcash");
  const [stage, setStage] = useState<Stage>({ kind: "form" });
  const [wallet, setWallet] = useState(user.phone ? `0${user.phone.replace(/^\+92/, "")}` : "");
  const [cnic, setCnic] = useState("");
  const [card, setCard] = useState({ name: user.name, number: "", exp: "", cvc: "" });
  const [shot, setShot] = useState<string | null>(null);
  const [promo, setPromo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("plan");
    if (p === "monthly" || p === "season") setPlanId(p);
  }, []);

  const plan = plans[planId];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if ((method === "jazzcash" || method === "easypaisa") && !walletOk(wallet)) return setError(`Enter your ${methodNames[method]} mobile number, like 0300 1234567.`);
    if (method === "jazzcash" && cnic.length !== 6) return setError("Enter the last 6 digits of your CNIC.");
    if (method === "card" && (card.number.replace(/\s/g, "").length < 15 || !/^\d{2}\/\d{2}$/.test(card.exp) || card.cvc.length < 3)) return setError("Check your card number, expiry date and CVC.");
    if (method === "transfer") {
      if (!shot) return setError("Add a screenshot of your transfer.");
      return setStage({ kind: "sent" });
    }
    setStage({ kind: "paying" });
    const res = await pay(planId, method);
    setStage({ kind: "done", receiptId: res.receiptId });
  }

  if (stage.kind === "done" || stage.kind === "sent") {
    const done = stage.kind === "done";
    return (
      <div className="dgrid narrow">
        <section className="dcard intro center-text">
          <span className={`big-tick${done ? "" : " wait"}`} aria-hidden="true">
            {done
              ? <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
              : <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>}
          </span>
          <h1>{done ? "You're in." : "Payment sent for checking"}</h1>
          <p className="muted">
            {done
              ? <>{plan.name} is active{planId === "season" ? <> until the exam</> : <> until {fullDay(new Date(Date.now() + 30 * 86400000).toISOString())}</>}. Receipt {stage.receiptId} is on your billing page.</>
              : <>We check each transfer by hand. Your {plan.name} switches on as soon as it&apos;s confirmed.</>}
          </p>
          <div className="hello-ctas center-row">
            <a className="dpill dark" href={done ? "/dashboard" : "/account/billing"}>{done ? "Go to dashboard" : "See billing"}</a>
          </div>
        </section>
      </div>
    );
  }

  return (
    <form className="dgrid" onSubmit={submit} noValidate>
      <section className="hello page-head">
        <div>
          <a className="link back" href="/pricing">← Plans</a>
          <h1>Checkout</h1>
        </div>
      </section>
      <p className="demo"><i />Payments aren&apos;t connected yet. Nothing is charged.</p>

      <div className="cols">
        <section className="dcard panel" aria-labelledby="pay-h">
          <h2 id="pay-h" className="panel-title">Pay with</h2>
          <div className="methods" role="radiogroup" aria-label="Payment method">
            {methods.map((m) => (
              <button key={m.id} type="button" role="radio" aria-checked={method === m.id} className={`method m-${m.id}`} onClick={() => { setMethod(m.id); setError(""); }}>
                <span className="m-logo" aria-hidden="true">{m.id === "jazzcash" ? "JC" : m.id === "easypaisa" ? "ep" : m.id === "card" ? "▭" : "⇄"}</span>
                <b>{methodNames[m.id]}</b>
                <span className="muted">{m.hint}</span>
              </button>
            ))}
          </div>

          {(method === "jazzcash" || method === "easypaisa") && (
            <div className="form-grid">
              <label className="fld">
                <span>{methodNames[method]} mobile number</span>
                <input inputMode="numeric" autoComplete="tel-national" placeholder="0300 1234567" value={wallet} onChange={(e) => setWallet(digits(e.target.value, 11))} />
              </label>
              {method === "jazzcash" && (
                <label className="fld">
                  <span>Last 6 digits of your CNIC</span>
                  <input inputMode="numeric" placeholder="123456" value={cnic} onChange={(e) => setCnic(digits(e.target.value, 6))} />
                </label>
              )}
              <p className="muted small span2">
                {method === "jazzcash" ? "You'll get a JazzCash prompt on this number. Enter your MPIN to approve." : "You'll get an Easypaisa notification. Approve it in the app, or dial *786# if it doesn't arrive."}
              </p>
            </div>
          )}

          {method === "card" && (
            <div className="form-grid">
              <label className="fld span2"><span>Name on card</span><input autoComplete="cc-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} /></label>
              <label className="fld span2">
                <span>Card number</span>
                <input inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" value={card.number} onChange={(e) => setCard({ ...card, number: digits(e.target.value, 19).replace(/(\d{4})(?=\d)/g, "$1 ") })} />
              </label>
              <label className="fld">
                <span>Expiry</span>
                <input inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={card.exp} onChange={(e) => { const d = digits(e.target.value, 4); setCard({ ...card, exp: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }); }} />
              </label>
              <label className="fld">
                <span>CVC</span>
                <input inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: digits(e.target.value, 4) })} />
              </label>
              <p className="muted small span2">Your bank may ask you to confirm with a code. Card details go straight to the payment provider; {site.name} never sees them.</p>
            </div>
          )}

          {method === "transfer" && (
            <div className="form-grid">
              <dl className="kv span2">
                <dt>Amount</dt><dd><b>{money(plan.price)}</b></dd>
                <dt>Raast ID</dt><dd>Added when the business account is open</dd>
                <dt>Reference</dt><dd><code>EW-{user.id.replace(/-/g, "").slice(0, 6).toUpperCase()}</code></dd>
              </dl>
              <label className="fld span2 upload">
                <span>Screenshot of the transfer</span>
                <input type="file" accept="image/*" onChange={(e) => setShot(e.target.files?.[0]?.name ?? null)} />
                <span className="drop">{shot ?? "Choose an image"}</span>
              </label>
            </div>
          )}

          {error && <p className="note-bad" role="alert">{error}</p>}
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
          <label className="fld">
            <span>Promo code</span>
            <div className="inline"><input value={promo} onChange={(e) => setPromo(e.target.value.toUpperCase())} placeholder="Optional" /><button type="button" className="dpill light small" disabled={!promo}>Apply</button></div>
          </label>
          <button className="dpill dark block" disabled={stage.kind === "paying"}>
            {stage.kind === "paying" ? (method === "card" ? "Confirming…" : `Waiting for ${methodNames[method]} approval…`) : method === "transfer" ? "Send for checking" : `Pay ${money(plan.price)}`}
          </button>
          <p className="muted small">
            Signed in as {user.phone ? formatPhone(user.phone) : user.email}. {plan.blurb}.
          </p>
        </aside>
      </div>
    </form>
  );
}
