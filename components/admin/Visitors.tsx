"use client";

import { useEffect, useState } from "react";
import { PageHead } from "@/components/app/AppShell";
import Empty from "@/components/app/Empty";
import { BrowserMark, DeviceMark, Flag, SourceMark, SystemMark, sourceName } from "@/components/admin/VisitIcons";
import { friendlyError } from "@/lib/auth";
import { type VisitRow, type Visits, getVisits, last } from "@/lib/admin";

type Metric = "visitors" | "views";

const ranges: [number, string][] = [[1, "Today"], [7, "7 days"], [30, "30 days"], [90, "90 days"]];
const n = (v: number) => v.toLocaleString("en-PK");
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "0%");
const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(iso + "T12:00:00").toLocaleDateString("en-GB", o);
const hourName = (h: string) => { const x = Number(h); return x === 0 ? "12 am" : x < 12 ? `${x} am` : x === 12 ? "12 pm" : `${x - 12} pm`; };

const regionNames = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
const countryName = (cc: string) => (/^[A-Z]{2}$/.test(cc) && cc !== "XX" && cc !== "T1" ? (regionNames?.of(cc) ?? cc) : "Unknown");
const page = (p: string) => (p === "/" ? "Home page" : p);
const deviceNames: Record<string, string> = { phone: "Phones", tablet: "Tablets", desktop: "Computers" };

function change(now: number, before: number, label: string) {
  if (!before) return <span className="muted small">{label}: none</span>;
  const p = Math.round(((now - before) / before) * 100);
  return <span className={`delta ${p > 0 ? "up" : p < 0 ? "down" : ""}`}>{p > 0 ? "▲" : p < 0 ? "▼" : ""} {Math.abs(p)}% <span className="muted">vs {label}</span></span>;
}

/* /admin/visitors — how many people visit, what they read, where they come from and what they use. Admins only.
   Counted without cookies or IP addresses (server/visits.ts). */
export default function Visitors() {
  const [days, setDays] = useState(30);
  const [d, setD] = useState<Visits | null>(() => last<Visits>("visits:30"));
  const [err, setErr] = useState("");
  useEffect(() => {
    setErr("");
    const had = last<Visits>(`visits:${days}`);
    if (had) setD(had);
    getVisits(days).then(setD, (e) => setErr(friendlyError(e)));
  }, [days]);

  const head = (
    <PageHead title="Visitors" sub="Who visits the site, what they read and where they come from. Staff and the admin panel aren't counted.">
      <nav className="stage-tabs range-tabs" aria-label="Range">
        {ranges.map(([r, label]) => <button key={r} type="button" className="stab" aria-pressed={days === r} onClick={() => setDays(r)}>{label}</button>)}
      </nav>
    </PageHead>
  );

  if (err) return <div className="dgrid">{head}<p className="note-bad">{err}</p></div>;
  if (!d || !d.lists) return <div className="dgrid">{head}<div className="sk" style={{ height: 520 }} /></div>;
  // A range not looked at before: the last one's numbers stay on screen until the new ones land.
  const shown = d.days;
  const t = d.totals;
  const vs = shown === 1 ? "yesterday at this time" : `the ${shown} days before`;
  const L = d.lists;

  return (
    <div className="dgrid visitors">
      {head}

      <section className="dcard panel">
        <dl className="kpis vkpis">
          <div><dt>Visitors</dt><dd>{n(t.visitors)}</dd>{change(t.visitors, d.previous.visitors, vs)}</div>
          <div><dt>Page views</dt><dd>{n(t.views)}</dd>{change(t.views, d.previous.views, vs)}</div>
          <div><dt>Pages per visitor</dt><dd>{t.visitors ? (t.views / t.visitors).toFixed(1) : "0"}</dd><span className="muted small">{pct(t.single, t.visitors)} left after one page</span></div>
          <div><dt>Signed in</dt><dd>{pct(t.signedIn, t.visitors)}</dd><span className="muted small">{n(t.signedIn)} of {n(t.visitors)} visitors</span></div>
          <div><dt>New accounts</dt><dd>{n(t.signups)}</dd><span className="muted small">{t.visitors > 0 && t.signups <= t.visitors ? `${((t.signups / t.visitors) * 100).toFixed(1)}% of visitors` : shown === 1 ? "today" : `in ${shown} days`}</span></div>
          <div><dt>On the site now</dt><dd className="live">{d.now > 0 && <i aria-hidden="true" />}{n(d.now)}</dd><span className="muted small">in the last 5 minutes</span></div>
        </dl>
        <VisitsChart d={d} />
        {shown > 1 && <p className="muted small">A visitor is counted once a day, so someone who comes back on three days counts three times.</p>}
      </section>

      <Group title="Pages">
        <Card title="Most viewed" sub="Visitors">
          <Rows rows={L.page} total={t.visitors} label={page} mono />
        </Card>
        <Card title="Where visits start" sub="First page seen">
          <Rows rows={L.entry} total={t.visitors} label={page} mono empty="Fills in from visits made after this update." />
        </Card>
      </Group>

      <Group title="How they find us">
        <Card title="Sources" sub="Visitors">
          <Rows rows={L.referrer} total={t.visitors} label={sourceName} mark={(k) => <SourceMark k={k} />} />
          {L.campaign.length > 0 && (
            <div className="vblock">
              <div className="panel-h"><h3>Tagged links</h3><span className="muted">?utm_source= or ?ref=</span></div>
              <Rows rows={L.campaign} total={t.visitors} label={(k) => k} mono />
            </div>
          )}
        </Card>
        <Card title="When they visit" sub="Pakistan time">
          <Hours rows={L.hour} metric="visitors" />
        </Card>
      </Group>

      <Group title="Where they are">
        <Places d={d} />
        <Card title="Countries" sub="Visitors">
          <Rows rows={L.country} total={t.visitors} label={countryName} mark={(k) => <Flag k={k} />} />
        </Card>
      </Group>

      <Group title="What they use">
        <Card title="Devices" sub="Visitors">
          <Split rows={L.device} />
          <Rows rows={L.device} total={t.visitors} label={(k) => deviceNames[k] ?? k} mark={(k) => <DeviceMark k={k} />} />
        </Card>
        <Tabbed
          tabs={[
            { name: "Browsers", rows: L.browser, mark: (k) => <BrowserMark k={k} /> },
            { name: "Systems", rows: L.os, mark: (k) => <SystemMark k={k} /> },
          ]}
          total={t.visitors}
        />
      </Group>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="vgroup" aria-label={title}>
      <h2 className="vgroup-h">{title}</h2>
      <div className="ov">{children}</div>
    </section>
  );
}

function Card({ title, sub, children, tabs }: { title: string; sub?: string; children: React.ReactNode; tabs?: React.ReactNode }) {
  return (
    <section className="dcard panel vcard">
      <div className="panel-h"><h2>{title}</h2>{tabs ?? <span className="muted">{sub}</span>}</div>
      {children}
    </section>
  );
}

/* Cities and provinces, the city keys being "PK|Lahore". */
function Places({ d }: { d: Visits }) {
  const [tab, setTab] = useState<"city" | "region">("city");
  const rows = d.lists[tab];
  const part = (k: string) => k.split("|") as [string, string];
  return (
    <Card
      title={tab === "city" ? "Cities" : "Provinces and states"}
      tabs={<Seg value={tab} onChange={setTab} options={[["city", "Cities"], ["region", "Provinces"]]} />}
    >
      <Rows
        rows={rows}
        total={d.totals.visitors}
        label={(k) => part(k)[1]}
        hint={(k) => { const cc = part(k)[0]; return cc === "PK" ? "" : countryName(cc); }}
        mark={(k) => <Flag k={part(k)[0]} />}
        empty="Fills in from visits made after this update."
      />
    </Card>
  );
}

function Tabbed({ tabs, total }: { tabs: { name: string; rows: VisitRow[]; mark: (k: string) => React.ReactNode }[]; total: number }) {
  const [i, setI] = useState(0);
  const tab = tabs[i]!;
  return (
    <Card title={tab.name} tabs={<Seg value={i} onChange={setI} options={tabs.map((x, j) => [j, x.name] as [number, string])} />}>
      <Rows rows={tab.rows} total={total} label={(k) => k} mark={tab.mark} />
    </Card>
  );
}

function Seg<T extends string | number>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="vseg" role="tablist">
      {options.map(([v, label]) => <button key={String(v)} type="button" role="tab" aria-selected={value === v} onClick={() => onChange(v)}>{label}</button>)}
    </div>
  );
}

/* A ranked list. Each row's bar shows its share of all visitors in the range; eight rows show until "Show all". */
function Rows({ rows, total, label, hint, mark, mono, empty }: {
  rows: VisitRow[]; total: number; label: (k: string) => string; hint?: (k: string) => string; mark?: (k: string) => React.ReactNode; mono?: boolean; empty?: string;
}) {
  const [all, setAll] = useState(false);
  if (!rows.length) return <Empty title="Nothing yet" text={empty ?? "This fills in as people visit the site."} />;
  const max = Math.max(1, ...rows.map((r) => r.visitors));
  const list = all ? rows : rows.slice(0, 8);
  return (
    <>
      <ul className={`vlist${mono ? " mono-list" : ""}`}>
        {list.map((r) => {
          const h = hint?.(r.key);
          return (
            <li key={r.key} title={`${n(r.visitors)} visitors, ${n(r.views)} page views`}>
              <i style={{ width: `${(r.visitors / max) * 100}%` }} aria-hidden="true" />
              {mark && <span className="vmark">{mark(r.key)}</span>}
              <span className="vname">{label(r.key)}{h && <small className="muted"> {h}</small>}</span>
              <b>{n(r.visitors)}</b>
              <em className="muted">{pct(r.visitors, total)}</em>
            </li>
          );
        })}
      </ul>
      {rows.length > 8 && <button type="button" className="vmore" onClick={() => setAll(!all)}>{all ? "Show fewer" : `Show all ${rows.length}`}</button>}
    </>
  );
}

/* Phones, tablets and computers as one bar. */
function Split({ rows }: { rows: VisitRow[] }) {
  const sum = rows.reduce((a, r) => a + r.visitors, 0);
  if (!sum) return null;
  return (
    <div className="vsplit" aria-hidden="true">
      {rows.map((r) => <i key={r.key} className={`d-${r.key}`} style={{ width: `${(r.visitors / sum) * 100}%` }} title={`${deviceNames[r.key] ?? r.key}: ${pct(r.visitors, sum)}`} />)}
    </div>
  );
}

/* The 24 hours of the day, Pakistan time. */
function Hours({ rows, metric }: { rows: VisitRow[]; metric: Metric }) {
  const by = new Map(rows.map((r) => [r.key, r]));
  const hours = Array.from({ length: 24 }, (_, h) => { const k = String(h).padStart(2, "0"); return { k, v: by.get(k)?.[metric] ?? 0 }; });
  const max = Math.max(1, ...hours.map((h) => h.v));
  const busiest = hours.reduce((a, h) => (h.v > a.v ? h : a), hours[0]!);
  if (!rows.length) return <Empty title="Nothing yet" text="Fills in from visits made after this update." />;
  return (
    <div className="vhours">
      <div className="vh-bars">
        {hours.map((h) => (
          <span key={h.k} title={`${hourName(h.k)}: ${n(h.v)} visitors`}>
            <i style={{ height: `${Math.max(h.v ? 4 : 0, (h.v / max) * 100)}%` }} className={h.k === busiest.k ? "top" : ""} />
          </span>
        ))}
      </div>
      <div className="vh-x" aria-hidden="true"><span>12 am</span><span>6 am</span><span>12 pm</span><span>6 pm</span><span>12 am</span></div>
      <p className="muted small">Busiest around {hourName(busiest.k)}.</p>
      <table className="sr">
        <caption>Visitors by hour of the day</caption>
        <tbody>{hours.map((h) => <tr key={h.k}><td>{hourName(h.k)}</td><td>{h.v}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

/* Visitors or page views per day as bars (per week for 90 days, per hour for today). Phones show the last 14 days of
   a 30-day range so each bar stays tappable. Same look as the student progress chart. */
function VisitsChart({ d }: { d: Visits }) {
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

  const daily = d.daily;
  const kind = d.days === 1 ? "hourly" : d.days > 31 ? "weekly" : "daily";
  const cols = kind === "hourly"
    ? (d.hourly ?? []).map((x) => ({ key: x.hour, label: hourName(x.hour), long: hourName(x.hour), visitors: x.visitors, views: x.views }))
    : kind === "weekly"
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
  const every = kind === "hourly" ? 6 : Math.ceil(cols.length / 5);
  const h = hover === null ? null : cols[hover];

  return (
    <div className="barchart vchart">
      <div className="panel-h">
        <h2>{kind === "hourly" ? "Today by hour" : kind === "weekly" ? "By week" : "By day"}</h2>
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
        <div className={`dc-cols ${kind === "weekly" ? "weekly" : "daily"}`}>
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
          {cols.every((c) => !c.views) && <p className="dc-empty">No visits in this range yet.</p>}
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
        <caption>Visitors and page views, {kind === "hourly" ? "by hour" : kind}</caption>
        <thead><tr><th>{kind === "hourly" ? "Hour" : kind === "weekly" ? "Week" : "Day"}</th><th>Visitors</th><th>Page views</th></tr></thead>
        <tbody>{cols.map((c) => <tr key={c.key}><td>{c.long}</td><td>{c.visitors}</td><td>{c.views}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
