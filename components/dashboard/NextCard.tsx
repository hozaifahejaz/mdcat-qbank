import type { Dashboard } from "@/lib/dashboard-data";
import { pct } from "@/lib/format";

/* The one thing to do next, at the top of the home screen on every device: finish the open test if there is one,
   otherwise start today's practice. */
export default function NextCard({ data }: { data: Dashboard }) {
  const r = data.resume;
  const today = data.daily.at(-1)?.answered ?? 0;
  const left = Math.max(0, data.dailyGoal - today);
  if (r) {
    return (
      <section className="next-card" aria-label="Continue your test">
        <div className="next-txt">
          <span className="next-k">Pick up where you left off</span>
          <b>{r.title}</b>
          <span className="next-meter">
            <span className="meter" role="img" aria-label={`${r.done} of ${r.total} answered`}><i style={{ width: `${pct(r.done, r.total)}%` }} /></span>
            <span>{r.done} of {r.total} answered</span>
          </span>
        </div>
        <div className="next-act">
          <a className="dpill dark" href={r.href}>Continue</a>
          <a className="next-alt" href="/practice">New test</a>
        </div>
      </section>
    );
  }
  return (
    <section className="next-card" aria-label="Start practising">
      <div className="next-txt">
        <span className="next-k">Today</span>
        <b>{today === 0 ? "Start today's practice" : left > 0 ? "Keep going" : "Daily goal done"}</b>
        <span className="next-meter">
          <span className="meter" role="img" aria-label={`${today} of ${data.dailyGoal} questions today`}><i style={{ width: `${Math.min(100, pct(today, data.dailyGoal))}%` }} /></span>
          <span>{today} of {data.dailyGoal} questions</span>
        </span>
      </div>
      <div className="next-act">
        <a className="dpill dark" href="/practice">Create a test</a>
      </div>
    </section>
  );
}
