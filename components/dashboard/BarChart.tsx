"use client";

import { useEffect, useState } from "react";
import type { DayActivity } from "@/lib/dashboard-data";

type Metric = "answered" | "correct";
type Range = "daily" | "weekly";

const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(iso + "T12:00:00").toLocaleDateString("en-GB", o);

/* Questions practised over time as bars. Daily shows the last 30 days (14 on phones), weekly the last 12 weeks.
   Hover or tab to a bar for its numbers; a hidden table carries the same data. */
export default function BarChart({ daily }: { daily: DayActivity[] }) {
  const [metric, setMetric] = useState<Metric>("answered");
  const [range, setRange] = useState<Range>("daily");
  const [hover, setHover] = useState<number | null>(null);
  // Phones show two weeks of days, so each bar stays wide enough to tap.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const cols = range === "daily"
    ? daily.slice(narrow ? -14 : -30).map((d) => ({ key: d.date, label: fmt(d.date, { day: "numeric", month: "short" }), long: fmt(d.date, { weekday: "short", day: "numeric", month: "short" }), answered: d.answered, correct: d.correct }))
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

  // Three gridlines above zero, on round numbers that clear the tallest bar.
  const max = Math.max(1, ...cols.map((c) => c.answered));
  const steps = [1, 2, 5, 10, 15, 20, 25, 50, 75, 100, 150, 200, 250, 500];
  const step = steps.find((s) => s * 3 >= max) ?? Math.ceil(max / 3);
  const top = step * 3;
  const ticks = [0, step, step * 2, top];
  const every = Math.ceil(cols.length / 5);
  const h = hover === null ? null : cols[hover];

  return (
    <div className="barchart">
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
              <option value="daily">{narrow ? "14 days" : "Daily"}</option>
              <option value="weekly">{narrow ? "12 weeks" : "Weekly"}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="dc-plot" onMouseLeave={() => setHover(null)}>
        <div className="dc-y" aria-hidden="true">
          {ticks.map((t) => <span key={t} style={{ bottom: `calc(${(t / top) * 100}% - 0.5em)` }}>{t}</span>)}
        </div>
        <div className={`dc-cols ${range}`}>
          {ticks.map((t) => <span key={t} className="dc-grid" style={{ bottom: `${(t / top) * 100}%` }} aria-hidden="true" />)}
          {cols.map((c, i) => {
            const v = c[metric];
            return (
              <button
                key={c.key} type="button" className={`dc-col ${hover === i ? "on" : ""}`}
                aria-label={`${c.long}: ${c.answered} answered, ${c.correct} correct`}
                onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
              >
                <i className={metric} style={{ height: `${(v / top) * 100}%` }} />
              </button>
            );
          })}
          {cols.every((c) => !c.answered) && <p className="dc-empty">No practice in this range yet. Answer a few questions and your bars show up here.</p>}
          {h && (
            <div className="tip dc-tip" style={{ left: `${((hover! + 0.5) / cols.length) * 100}%` }}>
              <b>{h[metric]} {metric}</b>
              <span>{h.long} · {h.answered ? Math.round((h.correct / h.answered) * 100) : 0}% right</span>
            </div>
          )}
        </div>
        <div className="dc-x" aria-hidden="true">
          {cols.map((c, i) => <span key={c.key}>{(i % every === 0 && cols.length - 1 - i >= every) || i === cols.length - 1 ? c.label : ""}</span>)}
        </div>
      </div>

      <table className="sr">
        <caption>Questions {metric}, {range}</caption>
        <thead><tr><th>{range === "daily" ? "Day" : "Week"}</th><th>Answered</th><th>Correct</th></tr></thead>
        <tbody>{cols.map((c) => <tr key={c.key}><td>{c.long}</td><td>{c.answered}</td><td>{c.correct}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
