"use client";

import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app/AppShell";
import Empty from "@/components/app/Empty";
import Icon from "@/components/app/Icon";
import BarChart from "@/components/dashboard/BarChart";
import { bank } from "@/lib/bank";
import { getDashboard, type Dashboard as Data, type SubjectStat } from "@/lib/dashboard-data";
import { band, day, fullDay, kindNames, pct, tz } from "@/lib/format";
import { paper, site } from "@/lib/site";
import { type AccountUser, getCurrentUser } from "@/lib/user";

function greeting() {
  const h = Number(new Date().toLocaleString("en-GB", { hour: "numeric", hour12: false, timeZone: tz }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function daysUntil(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso + "T09:00:00+05:00").getTime() - Date.now()) / 86_400_000));
}

function sumChapters(s: SubjectStat) {
  return s.chapters.reduce((t, c) => ({ answered: t.answered + c.answered, available: t.available + c.available, correct: t.correct + c.correct }), { answered: 0, available: 0, correct: 0 });
}

const COACH_KEY = "dash-coach-hidden";

export default function Dashboard() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [coach, setCoach] = useState(true);

  useEffect(() => {
    try { setCoach(localStorage.getItem(COACH_KEY) !== "1"); } catch {}
    let live = true;
    (async () => {
      const u = await getCurrentUser();
      if (!u) {
        window.location.replace("/signin?next=/dashboard");
        return;
      }
      const d = await getDashboard(u);
      if (live) { setUser(u); setData(d); }
    })();
    return () => { live = false; };
  }, []);

  function toggleCoach(show: boolean) {
    setCoach(show);
    try { localStorage.setItem(COACH_KEY, show ? "0" : "1"); } catch {}
  }

  const aside = user && data && coach ? <Coach user={user} data={data} onHide={() => toggleCoach(false)} /> : null;
  return (
    <AppFrame active="/dashboard" user={user} aside={aside}>
      {user && data ? <Body data={data} coachHidden={!coach} onShowCoach={() => toggleCoach(true)} /> : <Skeleton />}
    </AppFrame>
  );
}

function Skeleton() {
  return (
    <div className="dgrid" aria-busy="true" aria-label="Loading your dashboard">
      <div className="sk" style={{ height: 80 }} />
      <div className="sk" style={{ height: 160 }} />
      <div className="sk" style={{ height: 320 }} />
    </div>
  );
}

function Body({ data, coachHidden, onShowCoach }: { data: Data; coachHidden: boolean; onShowCoach: () => void }) {
  const totals = data.subjects.map(sumChapters).reduce((t, s) => ({ answered: t.answered + s.answered, available: t.available + s.available, correct: t.correct + s.correct }), { answered: 0, available: 0, correct: 0 });
  const month = data.daily.slice(-30).reduce((t, d) => ({ answered: t.answered + d.answered, correct: t.correct + d.correct }), { answered: 0, correct: 0 });
  const mocks = data.recent.filter((t) => t.total === 180).sort((a, b) => a.date.localeCompare(b.date));
  const lastMock = mocks.at(-1);
  const prevMock = mocks.at(-2);
  const change = lastMock && prevMock ? lastMock.score - prevMock.score : null;

  return (
    <div className="dgrid home">
      <section className="home-head" aria-labelledby="home-h">
        <div>
          <div className="title-row">
            <h1 id="home-h">MDCAT {site.season}</h1>
            <span className="status-chip good"><i />{daysUntil(site.examDate)} days to go</span>
          </div>
          <p className="muted">Exam expected {fullDay(site.examDate)}{data.streakDays > 0 && <> · {data.streakDays}-day practice streak</>}</p>
        </div>
        <div className="hello-ctas">
          {coachHidden && <button type="button" className="dpill light small hide-m" onClick={onShowCoach}><Icon name="spark" size={16} />Study coach</button>}
          <a className="dpill light small" href="/practice">Practise</a>
          <a className="dpill dark small" href="/mocks/new">Start a full mock</a>
        </div>
      </section>

      {!bank.length && <p className="demo"><i />Questions coming soon. Your stats fill in as you practise.</p>}

      <section className="kpis" aria-label="Your numbers">
        <div className="kpi">
          <h2><span className="kpi-ic" style={{ color: "var(--blue)" }}><Icon name="practice" /></span>Answered</h2>
          <strong>{month.answered.toLocaleString("en-GB")}</strong>
          <p className="muted">Questions in the <b>last 30 days</b></p>
        </div>
        <div className="kpi">
          <h2><span className="kpi-ic" style={{ color: "var(--good)" }}><Icon name="check" /></span>Accuracy</h2>
          <strong>{month.answered ? `${pct(month.correct, month.answered)}%` : "–"}</strong>
          <p className="muted">Right in the <b>last 30 days</b>{totals.answered > 0 && <span className="overall"> · {pct(totals.correct, totals.answered)}% overall</span>}</p>
        </div>
        <div className="kpi">
          <h2><span className="kpi-ic" style={{ color: "var(--warn)" }}><Icon name="mock" /></span>Latest mock</h2>
          <strong>{lastMock ? <>{lastMock.score}<small>/180</small></> : "–"}</strong>
          <p className="muted">
            {change !== null ? <><b className={change >= 0 ? "up" : "down"}>{change >= 0 ? "+" : ""}{change}</b> on the mock before</> : "Sit one to see your score"}
          </p>
        </div>
      </section>

      <CoachStrip data={data} />

      <section className="box" aria-labelledby="prog-h">
        <BarChart daily={data.daily} />
      </section>

      <section className="box" aria-labelledby="subj-h">
        <div className="panel-h">
          <h2 id="subj-h">Subjects</h2>
          <div className="hello-ctas">
            <a className="dpill light small" href="/mistakes">Retry mistakes</a>
            <a className="dpill light small" href="/practice">Choose chapters</a>
          </div>
        </div>
        <ul className="m-list show-m">
          {data.subjects.map((s) => {
            const t = sumChapters(s);
            const acc = pct(t.correct, t.answered);
            const p = paper.find((x) => x.subject === s.subject)!;
            const b = t.answered ? band(acc) : { cls: "", word: "Not started" };
            return (
              <li key={s.subject}>
                <a href={`/practice?subject=${encodeURIComponent(s.subject)}`}>
                  <span className="row-ic" style={{ background: p.tone, color: p.solid }}>{s.subject[0]}</span>
                  <span className="m-main">
                    <b>{s.subject}</b>
                    <span className="meter" style={{ ["--c" as string]: p.solid }} role="img" aria-label={`${pct(t.answered, t.available)}% answered`}><i style={{ width: `${pct(t.answered, t.available)}%` }} /></span>
                    <span className="muted">{t.answered} answered · {p.count} on the paper</span>
                  </span>
                  <span className="m-side">
                    <b>{t.answered ? `${acc}%` : "–"}</b>
                    <span className={`status-chip ${b.cls}`}><i />{b.word}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
        <div className="table-scroll hide-m">
          <table className="dtable">
            <thead>
              <tr><th scope="col">Subject</th><th scope="col" className="num">On paper</th><th scope="col" className="num">Answered</th><th scope="col" className="num">Accuracy</th><th scope="col" className="cover-h">Coverage</th></tr>
            </thead>
            <tbody>
              {data.subjects.map((s) => {
                const t = sumChapters(s);
                const acc = pct(t.correct, t.answered);
                const p = paper.find((x) => x.subject === s.subject)!;
                const b = t.answered ? band(acc) : { cls: "", word: "Not started" };
                return (
                  <tr key={s.subject}>
                    <th scope="row">
                      <a className="row-link" href={`/practice?subject=${encodeURIComponent(s.subject)}`}>
                        <span className="row-ic" style={{ background: p.tone, color: p.solid }}>{s.subject[0]}</span>
                        {s.subject}
                        <span className={`status-chip ${b.cls}`}><i />{b.word}</span>
                      </a>
                    </th>
                    <td className="num">{p.count}</td>
                    <td className="num">{t.answered.toLocaleString("en-GB")}</td>
                    <td className="num"><b>{t.answered ? `${acc}%` : "–"}</b></td>
                    <td className="cover"><div>
                      <span className="meter" style={{ ["--c" as string]: p.solid }} role="img" aria-label={`${pct(t.answered, t.available)}% of ${s.subject} answered`}><i style={{ width: `${pct(t.answered, t.available)}%` }} /></span>
                      <span className="muted">{pct(t.answered, t.available)}%</span>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="box" aria-labelledby="recent-h">
        <div className="panel-h">
          <h2 id="recent-h">Recent tests</h2>
          {data.recent.length > 0 && <a className="dpill light small" href="/history">See all</a>}
        </div>
        {data.recent.length === 0 && <Empty title="No tests yet" text="Practice sets, timed tests and mocks you finish will show here." />}
        {data.recent.length > 0 && <>
        <ul className="m-list show-m">
          {data.recent.slice(0, 5).map((t) => {
            const p = pct(t.score, t.total);
            return (
              <li key={t.id}>
                <a href={`/review?id=${t.id}`}>
                  <span className="m-main">
                    <b>{t.title}</b>
                    <span className="muted">{kindNames[t.kind]} · {day(t.date)} · {t.minutes} min</span>
                  </span>
                  <span className="m-side">
                    <b>{t.score}<small>/{t.total}</small></b>
                    <span className={`acc ${band(p).cls}`}>{p}%</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
        <div className="table-scroll hide-m">
          <table className="dtable">
            <thead>
              <tr><th scope="col">Test</th><th scope="col">Type</th><th scope="col">Date</th><th scope="col" className="num">Time</th><th scope="col" className="num">Score</th></tr>
            </thead>
            <tbody>
              {data.recent.slice(0, 5).map((t) => {
                const p = pct(t.score, t.total);
                return (
                  <tr key={t.id}>
                    <th scope="row"><a className="row-link" href={`/review?id=${t.id}`}>{t.title}</a></th>
                    <td><span className="kind">{kindNames[t.kind]}</span></td>
                    <td>{day(t.date)}</td>
                    <td className="num">{t.minutes} min</td>
                    <td className="num"><b>{t.score}</b>/{t.total} <span className={`acc ${band(p).cls}`}>{p}%</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>}
      </section>
    </div>
  );
}

/* The right-hand panel: what to do next, worked out from the student's own numbers. Every suggestion is a link
   into practice, not a chat; an AI tutor is a later phase of the plan. */
function coachTips(data: Data) {
  if (!bank.length) return [];
  const weakest = [...data.weakTopics].sort((a, b) => a.correct / a.answered - b.correct / b.answered).slice(0, 2);
  const nextMock = data.recent.filter((t) => t.kind === "mock").length + 1;
  return [
    ...weakest.map((w) => ({ href: `/practice?topic=${encodeURIComponent(w.topic)}`, icon: "target", tone: "var(--bad)", label: `${w.topic} · ${pct(w.correct, w.answered)}%` })),
    ...(data.resume ? [{ href: data.resume.href, icon: "play", tone: "var(--blue)", label: `Finish ${data.resume.title.split(" · ").at(-1)}` }] : []),
    ...(data.mistakesToRetry ? [{ href: "/mistakes", icon: "retry", tone: "var(--warn)", label: `Retry ${data.mistakesToRetry} mistakes` }] : []),
    { href: "/mocks/new", icon: "mock", tone: "var(--good)", label: `Sit full mock ${nextMock}` },
    { href: "/practice?mode=timed", icon: "bolt", tone: "#8a63ff", label: "Timed test, 25 questions" },
  ];
}

function Coach({ user, data, onHide }: { user: AccountUser; data: Data; onHide: () => void }) {
  const firstName = user.name.split(/\s+/)[0] || "there";
  const today = data.daily.at(-1)?.answered ?? 0;
  const tips = coachTips(data);

  return (
    <aside className="coach" aria-labelledby="coach-h">
      <div className="coach-top">
        <h2 id="coach-h">Study coach</h2>
        <button type="button" className="icon-btn" onClick={onHide} aria-label="Hide study coach" title="Hide"><Icon name="panel" /></button>
      </div>
      <div className="coach-body">
        <span className="coach-mark"><Icon name="spark" size={22} /></span>
        <p className="coach-hi">{greeting()}, {firstName}</p>
        <p className="muted">{tips.length ? "Here’s what would help most today." : "Questions are being written and checked. Suggestions show here once you can practise."}</p>
        <ul className="coach-tips">
          {tips.map((t) => (
            <li key={t.label}><a href={t.href}><span style={{ color: t.tone }}><Icon name={t.icon} size={16} /></span>{t.label}</a></li>
          ))}
        </ul>
      </div>
      <Goal today={today} goal={data.dailyGoal} />
    </aside>
  );
}

function Goal({ today, goal }: { today: number; goal: number }) {
  return (
    <div className="goal">
      <div className="goal-h">
        <span><Icon name="flame" size={16} />Today</span>
        <b>{today} / {goal}</b>
      </div>
      <span className="meter" role="img" aria-label={`${today} of ${goal} questions today`}><i style={{ width: `${Math.min(100, pct(today, goal))}%` }} /></span>
      <p className="muted small">{today >= goal ? "Daily goal done. Anything more is a bonus." : `${goal - today} more questions to hit your daily goal.`}</p>
    </div>
  );
}

/* Phones: the coach's suggestions as a swipeable row and the daily goal, near the top instead of in a side panel. */
function CoachStrip({ data }: { data: Data }) {
  return (
    <section className="m-coach show-m" aria-labelledby="mcoach-h">
      <div className="m-coach-h">
        <h2 id="mcoach-h"><span className="coach-dot"><Icon name="spark" size={14} /></span>Up next</h2>
      </div>
      {!bank.length && <p className="muted small">Questions are being written and checked. Suggestions show here once you can practise.</p>}
      <ul className="m-tips">
        {coachTips(data).map((t) => (
          <li key={t.label}><a href={t.href}><span style={{ color: t.tone }}><Icon name={t.icon} size={18} /></span>{t.label}</a></li>
        ))}
      </ul>
      <Goal today={data.daily.at(-1)?.answered ?? 0} goal={data.dailyGoal} />
    </section>
  );
}
