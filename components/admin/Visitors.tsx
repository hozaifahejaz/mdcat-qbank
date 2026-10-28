"use client";

import { useEffect, useState } from "react";
import { PageHead } from "@/components/app/AppShell";
import Empty from "@/components/app/Empty";
import { friendlyError } from "@/lib/auth";
import { type VisitRow, type Visits, getVisits } from "@/lib/admin";

type Metric = "visitors" | "views";

const ranges = [7, 30, 90];
const n = (v: number) => v.toLocaleString("en-PK");
const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(iso + "T12:00:00").toLocaleDateString("en-GB", o);

const regions = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
const flag = (cc: string) => String.fromCodePoint(...[...cc].map((c) => 0x1f1a5 + c.charCodeAt(0)));
const country = (cc: string) => (/^[A-Z]{2}$/.test(cc) && cc !== "XX" && cc !== "T1" ? `${flag(cc)}  ${regions?.of(cc) ?? cc}` : "Unknown");

/* Well-known hosts by name; the rest as they are. */
const sites: [RegExp, string][] = [
  [/(^|\.)google\./, "Google"], [/(^|\.)bing\.com$/, "Bing"], [/(^|\.)(facebook\.com|fb\.com)$/, "Facebook"],
  [/(^|\.)instagram\.com$/, "Instagram"], [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube"], [/^(t\.co|x\.com|twitter\.com)$/, "X (Twitter)"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "WhatsApp"], [/(^|\.)tiktok\.com$/, "TikTok"], [/(^|\.)reddit\.com$/, "Reddit"], [/(^|\.)linkedin\.com$/, "LinkedIn"],
];
const referrer = (h: string) => (h ? sites.find(([re]) => re.test(h))?.[1] ?? h : "Direct or unknown");
const page = (p: string) => (p === "/" ? "/ (home page)" : p);
const devices: Record<string, string> = { phone: "Phones", tablet: "Tablets", desktop: "Computers" };

function change(now: number, before: number, days: number) {
  if (!before) return null;
  const pct = Math.round(((now - before) / before) * 100);
  return <span className={`delta ${pct > 0 ? "up" : pct < 0 ? "down" : ""}`}>{pct > 0 ? "▲" : pct < 0 ? "▼" : ""} {Math.abs(pct)}% <span className="muted">vs the {days} days before</span></span>;
}

/* /admin/visitors — how many people visit the site, what they look at, and where they come from. Admins only. */
export default function Visitors() {
  const [days, setDays] = useState(30);
  const [d, setD] = useState<Visits | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    setErr("");
    getVisits(days).then(setD, (e) => setErr(friendlyError(e)));
  }, [days]);

  const head = (
    <PageHead title="Visitors" sub="Who's visiting the site. Counted without cookies or IP addresses; staff and the admin panel aren't counted.">
      <nav className="stage-tabs range-tabs" aria-label="Range">
        {ranges.map((r) => <button key={r} type="button" className="stab" aria-pressed={days === r} onClick={() => setDays(r)}>{r} days</button>)}
      </nav>
    </PageHead>
  );

  if (err) return <div className="dgrid">{head}<p className="note-bad">{err}</p></div>;
  if (!d || d.days !== days) return <div className="dgrid">{head}<div className="sk" style={{ height: 520 }} /></div>;

  const t = d.totals;
  return (
    <div className="dgrid">
      {head}
      <section className="dcard panel">
        <dl className="kpis">
          <div><dt>Visitors</dt><dd>{n(t.visitors)}</dd>{change(t.visitors, d.previous.visitors, days)}</div>
          <div><dt>Page views</dt><dd>{n(t.views)}</dd>{change(t.views, d.previous.views, days)}</div>
          <div><dt>On the site now</dt><dd className="live">{d.now > 0 && <i aria-hidden="true" />}{n(d.now)}</dd><span className="muted small">in the last 5 minutes</span></div>
          <div><dt>New accounts</dt><dd>{n(t.signups)}</dd>{t.visitors > 0 && <span className="muted small">{((t.signups / t.visitors) * 100).toFixed(1)}% of visitors</span>}</div>
        </dl>
        <VisitsChart daily={d.daily} weekly={days > 31} />
        <p className="muted small">
          A visitor is counted once a day, so over {days} days someone who comes back on three days counts three times.
          {t.views > 0 && ` ${(t.views / Math.max(1, t.visitors)).toFixed(1)} pages per visit; ${Math.round((t.signedIn / Math.max(1, t.visitors)) * 100)}% of visits were signed in.`}
        </p>
      </section>

      <div className="ov">
        <Top title="Top pages" rows={d.pages} label={page} mono />
        <section className="dcard panel">
          <Rows title="Where they came from" rows={d.referrers} label={referrer} />
          {d.campaigns.length > 0 && <Rows title="Tagged links" sub="?utm_source= or ?ref= on the link" rows={d.campaigns} label={(k) => k} />}
        </section>
        <Top title="Countries" rows={d.countries} label={country} />
        <section className="dcard panel">
          <Rows title="Devices" rows={d.devices} label={(k) => devices[k] ?? k} />
          <Rows title="Operating systems" rows={d.os} label={(k) => k} />
          <Rows title="Browsers" rows={d.browsers} label={(k) => k} />
        </section>
      </div>
    </div>
  );
}

const Top = (p: { title: string; rows: VisitRow[]; label: (k: string) => string; mono?: boolean }) => <section className="dcard panel"><Rows {...p} /></section>;

/* A ranked list, each row's bar showing its share of the top row's visitors. */
function Rows({ title, sub, rows, label, mono }: { title: string; sub?: string; rows: VisitRow[]; label: (k: string) => string; mono?: boolean }) {
  const max = Math.max(1, ...rows.map((r) => r.visitors));
  return (
    <div className="vblock">
      <div className="panel-h"><h2>{title}</h2><span className="muted">{sub ?? "Visitors"}</span></div>
      {rows.length ? (
        <ul className={`vlist${mono ? " mono-list" : ""}`}>
          {rows.map((r) => (
            <li key={r.key} title={`${r.visitors} visitors, ${r.views} page views`}>
              <i style={{ width: `${(r.visitors / max) * 100}%` }} aria-hidden="true" />
              <span>{label(r.key)}</span>
              <b>{n(r.visitors)}</b>
            </li>
          ))}
        </ul>
      ) : <Empty title="Nothing yet" text="This fills in as people visit the site." />}
    </div>
  );
}

/* Visitors or page views per day as bars (per week for 90 days). Phones show the last 14 days of a 30-day range so
   each bar stays tappable. Same look as the student progress chart. */
function VisitsChart({ daily, weekly }: { daily: Visits["daily"]; weekly: boolean }) {
  const [metric, setMetric] = useState<Metric>("visitors");
  const [hover, setHover] = useState<number | null>(null);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const cols = weekly
    ? Array.from({ length: Math.ceil(daily.length / 7) }, (_, w) => {
        const end = daily.length - w * 7;
        const ds = daily.slice(Math.max(0, end - 7), end);
        return { key: ds[0]!.date, label: fmt(ds[0]!.date, { day: "numeric", month: "short" }), long: `Week of ${fmt(ds[0]!.date, { day: "numeric", month: "short" })}`, visitors: ds.reduce((a, x) => a + x.visitors, 0), views: ds.reduce((a, x) => a + x.views, 0) };
      }).reverse()
    : daily.slice(narrow ? -14 : 0).map((x) => ({ key: x.date, label: fmt(x.date, { day: "numeric", month: "short" }), long: fmt(x.date, { weekday: "short", day: "numeric", month: "short" }), visitors: x.visitors, views: x.views }));

  const max = Math.max(1, ...cols.map((c) => c[metric]));
  const steps = [1, 2, 5, 10, 15, 20, 25, 50, 75, 100, 150, 200, 250, 500, 750, 1000, 1500, 2000, 2500, 5000, 10000];
  const step = steps.find((s) => s * 3 >= max) ?? Math.ceil(max / 3);
  const top = step * 3;
  const ticks = [0, step, step * 2, top];
  const every = Math.ceil(cols.length / 5);
  const h = hover === null ? null : cols[hover];

  return (
    <div className="barchart vchart">
      <div className="panel-h">
        <h2>{weekly ? "By week" : "By day"}</h2>
        <div className="legend" role="radiogroup" aria-label="Show">
          {(["visitors", "views"] as Metric[]).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={metric === m} className={`lg ${m}`} onClick={() => setMetric(m)}>
              <i />{m === "visitors" ? "Visitors" : "Page views"}
            </button>
          ))}
        </div>
      </div>
      <div className="dc-plot" onMouseLeave={() => setHover(null)}>
        <div className="dc-y" aria-hidden="true">
          {ticks.map((x) => <span key={x} style={{ bottom: `calc(${(x / top) * 100}% - 0.5em)` }}>{x >= 1000 ? `${x / 1000}k` : x}</span>)}
        </div>
        <div className={`dc-cols ${weekly ? "weekly" : "daily"}`}>
          {ticks.map((x) => <span key={x} className="dc-grid" style={{ bottom: `${(x / top) * 100}%` }} aria-hidden="true" />)}
          {cols.map((c, i) => (
            <button
              key={c.key} type="button" className={`dc-col ${hover === i ? "on" : ""}`}
              aria-label={`${c.long}: ${c.visitors} visitors, ${c.views} page views`}
              onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
            >
              <i className={metric} style={{ height: `${(c[metric] / top) * 100}%` }} />
            </button>
          ))}
          {h && (
            <div className="tip dc-tip" style={{ left: `${((hover! + 0.5) / cols.length) * 100}%` }}>
              <b>{n(h[metric])} {metric === "visitors" ? "visitors" : "page views"}</b>
              <span>{h.long}{metric === "visitors" ? ` · ${n(h.views)} views` : ` · ${n(h.visitors)} visitors`}</span>
            </div>
          )}
        </div>
        <div className="dc-x" aria-hidden="true">
          {cols.map((c, i) => <span key={c.key}>{(i % every === 0 && cols.length - 1 - i >= every) || i === cols.length - 1 ? c.label : ""}</span>)}
        </div>
      </div>
      <table className="sr">
        <caption>Visitors and page views, {weekly ? "weekly" : "daily"}</caption>
        <thead><tr><th>{weekly ? "Week" : "Day"}</th><th>Visitors</th><th>Page views</th></tr></thead>
        <tbody>{cols.map((c) => <tr key={c.key}><td>{c.long}</td><td>{c.visitors}</td><td>{c.views}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
