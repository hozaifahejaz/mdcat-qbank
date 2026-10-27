"use client";

import { useState } from "react";
import type { DayActivity } from "@/lib/dashboard-data";

type Metric = "answered" | "correct";
type Range = "daily" | "weekly";

const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(iso + "T12:00:00").toLocaleDateString("en-GB", o);

/* Questions practised over time as columns of dots: each filled dot is a fixed number of questions, and the faint
   dots behind show the full height. Daily shows the last 30 days, weekly the last 12 weeks. Hover or tab to a column
   for its numbers; a hidden table carries the same data. */
export default function DotChart({ daily }: { daily: DayActivity[] }) {
  const [metric, setMetric] = useState<Metric>("answered");
  const [range, setRange] = useState<Range>("daily");
  const [hover, setHover] = useState<number | null>(null);

  const cols = range === "daily"
    ? daily.slice(-30).map((d) => ({ key: d.date, label: fmt(d.date, { day: "numeric", month: "short" }), long: fmt(d.date, { weekday: "short", day: "numeric", month: "short" }), answered: d.answered, correct: d.correct }))
    : Array.from({ length: Math.floor(daily.length / 7) }, (_, w) => {
        const days = daily.slice(daily.length - (Math.floor(daily.length / 7) - w) * 7).slice(0, 7);
        return {
          key: days[0].date,
          label: fmt(days[0].date, { day: "numeric", month: "short" }),
          long: `Week of ${fmt(days[0].date, { day: "numeric", month: "short" })}`,
          answered: days.reduce((n, d) => n + d.answered, 0),
          correct: days.reduce((n, d) => n + d.correct, 0),
        };
      });

  const rows = 12;
  const max = Math.max(1, ...cols.map((c) => c.answered));
  const steps = range === "daily" ? [1, 2, 3, 4, 5, 6, 8, 10, 15, 20] : [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  const unit = steps.find((s) => s * rows >= max) ?? steps.at(-1)!;
  const top = unit * rows;
  const ticks = [0, rows / 3, (rows * 2) / 3, rows].map((r) => r * unit);
  const every = Math.ceil(cols.length / 5);
  const h = hover === null ? null : cols[hover];

  return (
    <div className="dotchart">
      <div className="panel-h">
        <h2 id="prog-h">Progress</h2>
        <div className="chart-ctl">
          <div className="legend" role="radiogroup" aria-label="Show">
            {(["answered", "correct"] as Metric[]).map((m) => (
              <button key={m} type="button" role="radio" aria-checked={metric === m} className={`lg ${m}`} onClick={() => setMetric(m)}>
                <i />{m === "answered" ? "Answered" : "Correct"}
              </button>
            ))}
          </div>
          <label className="sel">
            <span className="sr">Range</span>
            <select value={range} onChange={(e) => { setRange(e.target.value as Range); setHover(null); }}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>
        </div>
      </div>

      <div className="dc-plot" onMouseLeave={() => setHover(null)}>
        <div className="dc-y" aria-hidden="true">
          {ticks.map((t) => <span key={t} style={{ bottom: `calc(${(t / top) * 100}% - 0.5em)` }}>{t}</span>)}
        </div>
        <div className={`dc-cols ${range}`} style={{ ["--rows" as string]: rows }}>
          {cols.map((c, i) => {
            const v = c[metric];
            const filled = v ? Math.max(1, Math.round(v / unit)) : 0;
            return (
              <button
                key={c.key} type="button" className={`dc-col ${hover === i ? "on" : ""}`}
                aria-label={`${c.long}: ${c.answered} answered, ${c.correct} correct`}
                onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
              >
                {Array.from({ length: rows }, (_, r) => <i key={r} className={rows - r <= filled ? `f ${metric}` : ""} />)}
              </button>
            );
          })}
          {h && (
            <div className="tip dc-tip" style={{ left: `${((hover! + 0.5) / cols.length) * 100}%` }}>
              <b>{h[metric]} {metric}</b>
              <span>{h.long} · {h.answered ? Math.round((h.correct / h.answered) * 100) : 0}% right</span>
            </div>
          )}
        </div>
        <div className="dc-x" aria-hidden="true">
          {cols.map((c, i) => <span key={c.key}>{i % every === 0 || i === cols.length - 1 ? c.label : ""}</span>)}
        </div>
      </div>
      <p className="muted small">Each dot is {unit} questions.</p>

      <table className="sr">
        <caption>Questions {metric}, {range}</caption>
        <thead><tr><th>{range === "daily" ? "Day" : "Week"}</th><th>Answered</th><th>Correct</th></tr></thead>
        <tbody>{cols.map((c) => <tr key={c.key}><td>{c.long}</td><td>{c.answered}</td><td>{c.correct}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
