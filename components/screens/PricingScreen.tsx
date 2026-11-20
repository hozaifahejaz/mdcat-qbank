"use client";

import { useEffect, useState } from "react";
import PayLogo from "@/components/app/PayLogo";
import { PublicFooter, PublicNav } from "@/components/public/Frame";
import { money, plans } from "@/lib/billing";
import { prices, site } from "@/lib/site";
import { lastUser } from "@/lib/user";

const buy = (plan: string) => `/signup?next=${encodeURIComponent(`/checkout?plan=${plan}`)}`;

const tick = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;

const cards = [
  {
    id: "free",
    name: "Free",
    price: 0,
    per: "",
    items: ["100 free questions", "1 mini mock", "Basic stats"],
    cta: { label: "Start free", href: "/signup" },
    tone: "var(--card)",
  },
  {
    id: "season",
    name: plans.season.name,
    price: plans.season.price,
    was: plans.season.was,
    per: plans.season.per,
    items: ["The full question bank, every chapter", "MDCAT, NUMS and AKU banks", "Full-length timed mocks", "Past papers by year", "Chapter-by-chapter dashboard"],
    cta: { label: "Get the Season Pass", href: buy("season") },
    tone: "var(--lilac)",
    note: plans.season.was ? `Early-bird price until ${prices.earlyBirdUntil}` : plans.season.blurb,
  },
  {
    id: "monthly",
    name: plans.monthly.name,
    price: plans.monthly.price,
    per: plans.monthly.per,
    items: ["Everything in the Season Pass", "30 days of full access", "No renewal: buy again only if you need more"],
    cta: { label: "Get one month", href: buy("monthly") },
    tone: "var(--card)",
  },
];

/* /pricing — public. Plans from the plan's pricing table; Bundle (MDCAT + NUMS) is added when NUMS questions are. */
export default function PricingScreen() {
  // A student who is already signed in (the account as this browser last saw it) gets a way back in, not "Sign in".
  const [inside, setInside] = useState(false);
  useEffect(() => { setInside(!!lastUser()); }, []);
  return (
    <div className="dash">
      <div className="x3 x3-part"><PublicNav inside={inside} /></div>
      <main className="dwrap">
        <div className="dgrid">
          <section className="price-head">
            <h1>One pass. Every MDCAT question.</h1>
            <p className="muted">Pay with JazzCash, Easypaisa or card.</p>
          </section>
          <section className="price-grid">
            {cards.map((c) => (
              <article key={c.id} className={`dcard price${c.id === "season" ? " best" : ""}`} style={{ background: c.tone }}>
                <div className="panel-h">
                  <h2>{c.name}</h2>
                  {c.id === "season" && <span className="badge good">Best value</span>}
                </div>
                <p className="price-n">
                  {c.was && <s className="muted">{money(c.was)}</s>}
                  <b>{c.price ? money(c.price) : "Rs. 0"}</b>
                  {c.per && <span className="muted">{c.per}</span>}
                </p>
                <ul className="ticks">{c.items.map((x) => <li key={x}>{tick}{x}</li>)}</ul>
                <a className={`dpill ${c.id === "season" ? "dark" : "light"} block`} href={c.cta.href}>{c.cta.label}</a>
                {c.note && <p className="muted small center">{c.note}</p>}
              </article>
            ))}
          </section>
          <section className="pay-strip" aria-label="Ways to pay">
            {(["jazzcash", "easypaisa", "visa", "mastercard", "unionpay", "raast"] as const).map((b) => <PayLogo key={b} brand={b} />)}
          </section>
          <p className="muted small center">{site.name} · iOS and Android apps coming soon</p>
        </div>
      </main>
      <div className="x3 x3-part"><PublicFooter /></div>
    </div>
  );
}
