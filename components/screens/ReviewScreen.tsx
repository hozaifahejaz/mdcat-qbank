"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/app/AppShell";
import Explanation from "@/components/test/Explanation";
import Protected from "@/components/test/Protected";
import { ReportDialog } from "@/components/test/TestPlayer";
import { type Attempt, getAttempt, type Scored, score } from "@/lib/attempts";
import { type Question, subjects } from "@/lib/bank";
import { getDashboard } from "@/lib/dashboard-data";
import { band, clock, day, kindNames, letters, pct } from "@/lib/format";
import { paper } from "@/lib/site";
import type { AccountUser } from "@/lib/user";

type Filter = "all" | "wrong" | "skipped" | "flagged" | "correct";

export default function ReviewScreen() {
  return <AppShell>{(user) => <Review user={user} />}</AppShell>;
}

/* /review?id=… — the result of one test, then every question with the student's answer and the explanation. */
function Review({ user }: { user: AccountUser }) {
  const [attempt, setAttempt] = useState<Attempt | null | undefined>(undefined);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id") ?? "last";
    getDashboard(user).then((d) => setAttempt(getAttempt(id, d.recent)));
  }, [user]);

  if (attempt === undefined) return <div className="dgrid"><div className="sk" style={{ height: 240 }} /></div>;
  if (attempt === null) {
    return (
      <div className="dgrid">
        <section className="dcard panel empty">
          <h1>We couldn&apos;t find that test</h1>
          <p className="muted">It may have been from another session. Your full history is on the history page.</p>
          <a className="dpill dark" href="/history">See test history</a>
        </section>
      </div>
    );
  }
  return <Result user={user} attempt={attempt} />;
}

function Result({ user, attempt }: { user: AccountUser; attempt: Attempt }) {
  const rows = score(attempt);
  const [filter, setFilter] = useState<Filter>("all");
  const [report, setReport] = useState<Question | null>(null);
  const right = rows.filter((r) => r.status === "correct").length;
  const wrong = rows.filter((r) => r.status === "wrong").length;
  const skipped = rows.filter((r) => r.status === "skipped").length;
  const p = pct(right, rows.length);
  const per = Math.round(attempt.seconds / Math.max(1, rows.length));

  const bySubject = subjects.map((s) => {
    const r = rows.filter((x) => x.q.subject === s);
    return { s, n: r.length, right: r.filter((x) => x.status === "correct").length };
  }).filter((x) => x.n);

  const counts: Record<Filter, number> = { all: rows.length, wrong, skipped, flagged: rows.filter((r) => r.flagged).length, correct: right };
  const shown = rows.map((r, i) => ({ r, i })).filter(({ r }) => filter === "all" || (filter === "flagged" ? r.flagged : r.status === filter));
  const retry = rows.filter((r) => r.status !== "correct").map((r) => r.q.id);

  return (
    <div className="dgrid">
      <section className="result dcard">
        <div className="result-main">
          <span className="kind">{kindNames[attempt.kind]} · {day(attempt.date)}</span>
          <h1>{attempt.title}</h1>
          <div className="big-score">
            <strong>{right}<small>/{rows.length}</small></strong>
            <span className={`acc ${band(p).cls}`}>{p}% · {band(p).word}</span>
          </div>
          <div className="hello-ctas">
            {retry.length > 0 && <a className="dpill dark" href={`/test?mode=tutor&title=${encodeURIComponent("Retry: " + attempt.title)}&ids=${retry.join(",")}`}>Retry {retry.length} wrong and skipped</a>}
            <a className="dpill light" href="/dashboard">Back to dashboard</a>
          </div>
        </div>
        <dl className="result-facts">
          <div><dt>Correct</dt><dd className="up">{right}</dd></div>
          <div><dt>Wrong</dt><dd className="down">{wrong}</dd></div>
          <div><dt>Skipped</dt><dd>{skipped}</dd></div>
          <div><dt>Time</dt><dd>{clock(attempt.seconds)}</dd></div>
          <div><dt>Per question</dt><dd>{per}s</dd></div>
        </dl>
      </section>

      <section className="dcard panel" aria-labelledby="bys-h">
        <div className="panel-h"><h2 id="bys-h">By subject</h2></div>
        <ul className="bys">
          {bySubject.map((x) => {
            const sp = pct(x.right, x.n);
            const c = paper.find((pp) => pp.subject === x.s)!;
            return (
              <li key={x.s} style={{ ["--c" as string]: c.solid }}>
                <span className="subj-name"><i />{x.s}</span>
                <span className="meter" role="img" aria-label={`${sp}% correct`}><i style={{ width: `${sp}%` }} /></span>
                <span className="bys-n"><b>{x.right}</b>/{x.n}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="dcard panel" aria-labelledby="qs-h">
        <div className="panel-h">
          <h2 id="qs-h">Questions</h2>
          <div className="chips" role="group" aria-label="Show">
            {(["all", "wrong", "skipped", "flagged", "correct"] as Filter[]).map((f) => (
              <button key={f} type="button" className="chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {f[0]!.toUpperCase() + f.slice(1)} <span className="muted">{counts[f]}</span>
              </button>
            ))}
          </div>
        </div>
        <Protected user={user}>
          <ol className="rlist">
            {shown.map(({ r, i }) => <ReviewItem key={r.q.id} r={r} n={i + 1} onReport={() => setReport(r.q)} />)}
            {!shown.length && <li className="muted">Nothing here.</li>}
          </ol>
        </Protected>
      </section>
      {report && <ReportDialog q={report} onClose={() => setReport(null)} />}
    </div>
  );
}

function ReviewItem({ r, n, onReport }: { r: Scored; n: number; onReport: () => void }) {
  const label = { correct: "Correct", wrong: "Wrong", skipped: "Skipped" }[r.status];
  return (
    <li className={`ritem ${r.status}`}>
      <details open={r.status !== "correct"}>
        <summary>
          <span className={`rstat ${r.status}`}>{label}</span>
          <span className="rq"><b>Q{n}.</b> {r.q.stem}</span>
          {r.flagged && <span className="badge">Flagged</span>}
          <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </summary>
        <div className="rbody">
          <p className="muted small">{r.q.subject} · {r.q.chapter} · {r.q.topic}</p>
          <ul className="opts compact" role="list">
            {r.q.options.map((o, k) => (
              <li key={k}>
                <div className={`opt ${k === r.q.answer ? "key" : k === r.chosen ? "miss" : "dim"}`}>
                  <span className="letter">{letters[k]}</span>
                  <span className="otext">{o}</span>
                  {k === r.q.answer && <span className="otag good">Answer</span>}
                  {k === r.chosen && k !== r.q.answer && <span className="otag bad">Your answer</span>}
                </div>
              </li>
            ))}
          </ul>
          <Explanation q={r.q} chosen={r.chosen} onReport={onReport} />
        </div>
      </details>
    </li>
  );
}
