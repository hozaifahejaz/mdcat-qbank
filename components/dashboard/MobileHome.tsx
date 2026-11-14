"use client";

import NextCard from "@/components/dashboard/NextCard";
import { BankButtons } from "@/components/screens/PracticeScreen";
import type { Dashboard } from "@/lib/dashboard-data";
import { band, pct } from "@/lib/format";

const weekday = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { weekday: "narrow" });

/* The phone home screen: a button per question bank, straight into practice, and one progress card. Everything else
   lives on the Progress tab. */
export default function MobileHome({ data }: { data: Dashboard }) {
  return (
    <div className="dgrid m-home">
      {data.resume && <NextCard data={data} />}
      <section aria-labelledby="mh-start">
        <h1 id="mh-start" className="m-home-h">Start practising</h1>
        <BankButtons />
      </section>
      <WeekCard data={data} />
    </div>
  );
}

/* Questions answered each of the last seven days, with the week's total and accuracy. Taps through to Progress. */
function WeekCard({ data }: { data: Dashboard }) {
  const week = data.daily.slice(-7);
  const answered = week.reduce((n, d) => n + d.answered, 0);
  const correct = week.reduce((n, d) => n + d.correct, 0);
  const top = Math.max(1, ...week.map((d) => d.answered));
  return (
    <a className="week-card" href="/progress" aria-label={`This week: ${answered} questions answered${answered ? `, ${pct(correct, answered)}% right` : ""}. See your progress.`}>
      <span className="week-top">
        <span>
          <span className="week-k">This week</span>
          <strong>{answered.toLocaleString("en-GB")}<small> answered</small></strong>
        </span>
        <span className="week-acc">
          <b className={answered ? band(pct(correct, answered)).cls : undefined}>{answered ? `${pct(correct, answered)}%` : "–"}</b>
          <span className="muted">right</span>
        </span>
      </span>
      <span className="week-bars" aria-hidden="true">
        {week.map((d, i) => (
          <span key={d.date} className={[i === week.length - 1 ? "today" : "", d.answered ? "" : "zero"].join(" ").trim() || undefined}>
            <i style={{ height: `${d.answered ? Math.max(8, (d.answered / top) * 100) : 4}%` }} />
            <em>{weekday(d.date)}</em>
          </span>
        ))}
      </span>
      <span className="week-more">See progress</span>
    </a>
  );
}
