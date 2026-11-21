"use client";

import { useEffect, useState } from "react";
import { Framed } from "@/components/app/AppShell";
import Empty from "@/components/app/Empty";
import Icon from "@/components/app/Icon";
import BarChart from "@/components/dashboard/BarChart";
import MobileHome from "@/components/dashboard/MobileHome";
import NextCard from "@/components/dashboard/NextCard";
import { GoalStrip, Stand, Subjects, daysUntil } from "@/components/dashboard/Insights";
import { go } from "@/components/Nav";
import { BankButtons } from "@/components/screens/PracticeScreen";
import { getDashboard, type Dashboard as Data, type SubjectStat } from "@/lib/dashboard-data";
import { band, day, fullDay, kindNames, pct, tz } from "@/lib/format";
import { paper, site } from "@/lib/site";
import { useNarrow } from "@/lib/narrow";
import { testHref, watchCatalog } from "@/lib/study";
import { fresh, keep } from "@/lib/cache";
import { examDateFor } from "@/lib/prefs";
import { type AccountUser, getCurrentUser, lastUser } from "@/lib/user";

function greeting() {
  const h = Number(new Date().toLocaleString("en-GB", { hour: "numeric", hour12: false, timeZone: tz }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function sumChapters(s: SubjectStat) {
  return s.chapters.reduce((t, c) => ({ answered: t.answered + c.answered, available: t.available + c.available, correct: t.correct + c.correct }), { answered: 0, available: 0, correct: 0 });
}

/* Full mocks open once every subject has enough questions. Until then nothing on the dashboard points at them. */
function useMockReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => { watchCatalog("mdcat", (c) => setReady(c.mockReady)); }, []);
  return ready;
}

const COACH_KEY = "dash-coach-hidden";

/* Any questions open to this student yet? Before launch every screen says they're coming. */
export const hasQuestions = (d: Data) => d.subjects.some((s) => s.chapters.some((c) => c.available > 0));

export default function Dashboard() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [coach, setCoach] = useState(true);
  // Whose subjects and chapters to show: the student's own choice until they pick another tab.
  const [bank, setBank] = useState<string | null>(null);
  // Phones get their own home: the bank buttons and one progress card (MobileHome). Laptops get the full dashboard.
  const narrow = useNarrow();

  useEffect(() => {
    try { setCoach(localStorage.getItem(COACH_KEY) !== "1"); } catch {}
    let live = true;
    // Last time's numbers show at once; the account and the fresh numbers load side by side behind them.
    const known = lastUser();
    if (known) setUser(known);
    getCurrentUser().then((u) => { if (live && u) setUser(u); });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    let live = true;
    fresh(bank ? `dashboard:${bank}` : "dashboard", () => getDashboard(undefined, bank), (d) => { if (live) setData(d); }, true).catch(() => {});
    return () => { live = false; };
  }, [bank]);

  // A brand-new student picks their test, year and daily goal first (/welcome), once.
  const fresher = data?.welcomed === false && (data.answeredEver ?? 1) === 0 && !data.resume;
  useEffect(() => { if (fresher) go("/welcome", true); }, [fresher]);

  function setGoal(n: number) {
    setData((d) => {
      if (!d) return d;
      const next = { ...d, dailyGoal: n };
      keep(bank ? `dashboard:${bank}` : "dashboard", next, true);
      return next;
    });
  }

  function toggleCoach(show: boolean) {
    setCoach(show);
    try { localStorage.setItem(COACH_KEY, show ? "0" : "1"); } catch {}
  }

  const aside = narrow === false && user && data && coach ? <Coach data={data} onHide={() => toggleCoach(false)} /> : null;
  return (
    <Framed active="/dashboard" aside={aside}>
      {user && data && narrow !== null && !fresher ? narrow ? <MobileHome data={data} /> : <Body data={data} name={user.name} free={user.plan === "free"} coachHidden={!coach} onShowCoach={() => toggleCoach(true)} onBank={setBank} onGoal={setGoal} /> : <Skeleton />}
    </Framed>
  );
}

export function Skeleton() {
  return (
    <div className="dgrid" aria-busy="true" aria-label="Loading your dashboard">
      <div className="sk" style={{ height: 80 }} />
      <div className="sk" style={{ height: 160 }} />
      <div className="sk" style={{ height: 320 }} />
    </div>
  );
}

/* The full dashboard on laptops. progress: the phone's Progress tab, which shows the same numbers under its own
   heading, without the exam header and the Up next strip. */
export function Body({ data, name, free, coachHidden, onShowCoach, progress, onBank, onGoal }: { data: Data; name?: string; free?: boolean; coachHidden?: boolean; onShowCoach?: () => void; progress?: boolean; onBank?: (bank: string) => void; onGoal?: (n: number) => void }) {
  const totals = data.subjects.map(sumChapters).reduce((t, s) => ({ answered: t.answered + s.answered, available: t.available + s.available, correct: t.correct + s.correct }), { answered: 0, available: 0, correct: 0 });
  const month = data.daily.slice(-30).reduce((t, d) => ({ answered: t.answered + d.answered, correct: t.correct + d.correct }), { answered: 0, correct: 0 });
  const mocks = data.recent.filter((t) => t.kind === "mock").sort((a, b) => a.date.localeCompare(b.date));
  const lastMock = mocks.at(-1);
  const prevMock = mocks.at(-2);
  const change = lastMock && prevMock ? lastMock.score - prevMock.score : null;
  const mockReady = useMockReady();
  const showMock = mockReady || !!lastMock;
  const examDate = examDateFor(data.examYear);
  // A new account sees one thing to do and the banks, not a page of empty charts.
  const brandNew = !progress && hasQuestions(data) && totals.answered === 0 && data.recent.length === 0 && !data.resume;

  return (
    <div className="dgrid home">
      {progress ? <section className="hello page-head"><div><h1>Progress</h1><p className="muted">How your practice is going.</p></div></section> : (
      <section className="home-head" aria-labelledby="home-h">
        <div>
          <h1 id="home-h">{greeting()}{name ? `, ${name.split(/\s+/)[0]}` : ""}</h1>
          <p className="muted"><b>{daysUntil(examDate)} days</b> to MDCAT {examDate.slice(0, 4)}, expected {fullDay(examDate)}</p>
        </div>
        {coachHidden && <div className="hello-ctas"><button type="button" className="dpill light small hide-m" onClick={onShowCoach}><Icon name="spark" size={16} />Suggestions</button></div>}
      </section>
      )}

      {brandNew && (
        <section className="next-card" aria-label="Start practicing">
          <div className="next-txt">
            <span className="next-k">Start here</span>
            <b>Your first 10 questions</b>
            <span>Easy ones first, each with a full explanation. Your numbers show here once you have answered some.</span>
          </div>
          <div className="next-act">
            <a className="dpill dark" href={testHref({ kind: "practice", count: 10, title: "Your first 10 questions" })}>Start</a>
          </div>
        </section>
      )}
      {!progress && hasQuestions(data) && data.resume && <NextCard data={data} />}
      {!brandNew && hasQuestions(data) && <GoalStrip data={data} onGoal={onGoal} cta={!progress && !data.resume} />}

      {!progress && (
        <section aria-labelledby="banks-h" className="home-banks">
          <h2 id="banks-h">Question banks</h2>
          <BankButtons />
        </section>
      )}

      {!brandNew && <>
      {!hasQuestions(data) && <p className="demo"><i />Questions coming soon. Your stats fill in as you practice.</p>}

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
        {showMock ? (
        <div className="kpi">
          <h2><span className="kpi-ic" style={{ color: "var(--warn)" }}><Icon name="mock" /></span>Latest mock</h2>
          <strong>{lastMock ? <>{lastMock.score}<small>/{lastMock.total}</small></> : "–"}</strong>
          <p className="muted">
            {change !== null ? <><b className={change >= 0 ? "up" : "down"}>{change >= 0 ? "+" : ""}{change}</b> on the mock before</> : "Sit one to see your score"}
          </p>
        </div>
        ) : (
        <div className="kpi">
          <h2><span className="kpi-ic" style={{ color: "var(--warn)" }}><Icon name="flame" /></span>Streak</h2>
          <strong>{data.streakDays}<small className="unit">{data.streakDays === 1 ? "day" : "days"}</small></strong>
          <p className="muted">{data.streakDays > 0 ? "Days in a row with practice" : "Practice today to start one"}</p>
        </div>
        )}
      </section>

      <Stand data={data} free={free} />

      {!progress && <CoachStrip data={data} />}

      <section className="box" aria-labelledby="prog-h">
        <BarChart daily={data.daily} />
      </section>


      <Subjects data={data} onBank={onBank} />

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
      </>}
    </div>
  );
}

/* The right-hand panel: what to do next, worked out from the student's own numbers. Every suggestion is a link
   into practice, not a chat; an AI tutor is a later phase of the plan. */
function coachTips(data: Data, mockReady: boolean) {
  if (!hasQuestions(data)) return [];
  const weakest = [...data.weakTopics].sort((a, b) => a.correct / a.answered - b.correct / b.answered).slice(0, 2);
  const nextMock = data.recent.filter((t) => t.kind === "mock").length + 1;
  return [
    ...weakest.map((w) => ({ href: `/practice?${new URLSearchParams({ subject: w.subject, chapter: w.chapter, topic: w.topic })}`, icon: "target", tone: "var(--bad)", label: `${w.topic} · ${pct(w.correct, w.answered)}%` })),
    ...(data.mistakesToRetry ? [{ href: "/mistakes", icon: "retry", tone: "var(--warn)", label: `Retry ${data.mistakesToRetry} mistakes` }] : []),
    ...(data.nextMock === "full" ? [{ href: "/mocks/new", icon: "mock", tone: "var(--good)", label: `Sit full mock ${nextMock}` }] : []),
    ...(data.nextMock === "mini" ? [{ href: "/mocks/new?mini=1", icon: "mock", tone: "var(--good)", label: "Take the mini mock" }] : []),
    { href: "/practice?mode=timed", icon: "bolt", tone: "#8a63ff", label: "Timed test, 25 questions" },
  ];
}

function Coach({ data, onHide }: { data: Data; onHide: () => void }) {
  const tips = coachTips(data, useMockReady());

  return (
    <aside className="coach" aria-labelledby="coach-h">
      <div className="coach-top">
        <h2 id="coach-h">Suggestions</h2>
        <button type="button" className="icon-btn" onClick={onHide} aria-label="Hide suggestions" title="Hide"><Icon name="panel" /></button>
      </div>
      <div className="coach-body">
        {!tips.length && <p className="muted">Questions are being written and checked. Suggestions show here once you can practice.</p>}
        <ul className="coach-tips">
          {tips.map((t) => (
            <li key={t.label}><a href={t.href}><span style={{ color: t.tone }}><Icon name={t.icon} size={16} /></span><b>{t.label}</b><Icon name="chevron" size={16} /></a></li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/* Phones: the coach's suggestions as a swipeable row and the daily goal, near the top instead of in a side panel. */
function CoachStrip({ data }: { data: Data }) {
  const mockReady = useMockReady();
  return (
    <section className="m-coach show-m" aria-labelledby="mcoach-h">
      <div className="m-coach-h">
        <h2 id="mcoach-h"><span className="coach-dot"><Icon name="spark" size={14} /></span>Up next</h2>
      </div>
      {!hasQuestions(data) && <p className="muted small">Questions are being written and checked. Suggestions show here once you can practice.</p>}
      <ul className="m-tips">
        {coachTips(data, mockReady).map((t) => (
          <li key={t.label}><a href={t.href}><span style={{ color: t.tone }}><Icon name={t.icon} size={18} /></span>{t.label}</a></li>
        ))}
      </ul>
    </section>
  );
}
