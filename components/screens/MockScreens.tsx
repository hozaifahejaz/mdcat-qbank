"use client";

import { useEffect, useState } from "react";
import AppShell, { PageHead } from "@/components/app/AppShell";
import Empty from "@/components/app/Empty";
import { bank } from "@/lib/bank";
import { getDashboard, type TestResult } from "@/lib/dashboard-data";
import { band, day, kindNames, pct } from "@/lib/format";
import { paper } from "@/lib/site";
import type { AccountUser } from "@/lib/user";

const MOCKS = 12;

/* Mocks and past papers are built from the bank, so they open once it has questions. */
const ready = () => bank.length > 0;

function useRecent(user: AccountUser) {
  const [recent, setRecent] = useState<TestResult[] | null>(null);
  useEffect(() => { getDashboard(user).then((d) => setRecent(d.recent)); }, [user]);
  return recent;
}

function Split() {
  return (
    <div className="split" role="img" aria-label={paper.map((p) => `${p.subject} ${p.count}`).join(", ")}>
      {paper.map((p) => <i key={p.subject} style={{ flex: p.count, background: p.solid }} />)}
    </div>
  );
}

function SplitLegend() {
  return (
    <ul className="split-legend">
      {paper.map((p) => <li key={p.subject}><i style={{ background: p.solid }} />{p.subject} <b>{p.count}</b></li>)}
    </ul>
  );
}

/* /mocks — the full-length mocks, taken and still to sit. */
export function MocksScreen() {
  return <AppShell active="/mocks">{(user) => <Mocks user={user} />}</AppShell>;
}

function Mocks({ user }: { user: AccountUser }) {
  const recent = useRecent(user);
  const taken = (recent ?? []).filter((t) => t.kind === "mock");
  const byTitle = new Map(taken.map((t) => [t.title, t]));
  return (
    <div className="dgrid">
      <PageHead title="Full mocks" sub="180 MCQs in 3 hours, with the real paper's split and difficulty mix.">
        {ready() && <a className="dpill dark" href="/mocks/new">Start the next mock</a>}
      </PageHead>
      <section className="dcard panel">
        <Split />
        <SplitLegend />
      </section>
      {!ready() && (
        <section className="dcard panel">
          <Empty title="Mocks open soon" text="Full-length mocks open once the question bank is live. Your scores and reviews will show here." />
        </section>
      )}
      {ready() && <section className="mock-grid" aria-label="Mocks">
        {Array.from({ length: MOCKS }, (_, k) => {
          const title = `Full mock ${k + 1}`;
          const t = byTitle.get(title);
          const next = !t && k === taken.length;
          const p = t ? pct(t.score, t.total) : 0;
          return (
            <article key={title} className={`dcard mock${t ? " done" : ""}${next ? " next" : ""}`}>
              <div className="panel-h">
                <h2>{title}</h2>
                {t ? <span className={`acc ${band(p).cls}`}>{p}%</span> : next ? <span className="badge good">Up next</span> : null}
              </div>
              {t ? (
                <>
                  <p className="mock-score"><b>{t.score}</b>/180</p>
                  <p className="muted small">Taken {day(t.date)} · {t.minutes} min</p>
                  <a className="link" href={`/review?id=${t.id}`}>Review answers</a>
                </>
              ) : (
                <>
                  <p className="muted small">{k < 4 ? "Moderate" : k < 9 ? "Exam level" : "Hard"} · 180 MCQs · 3 hours</p>
                  <a className={`dpill ${next ? "dark" : "light"} small`} href={`/mocks/new?n=${k + 1}`}>Start</a>
                </>
              )}
            </article>
          );
        })}
      </section>}
    </div>
  );
}

/* /mocks/new — the rules before a mock starts. */
export function MockIntroScreen() {
  return <AppShell active="/mocks" title="New mock">{() => <MockIntro />}</AppShell>;
}

function MockIntro() {
  const [n, setN] = useState(6);
  useEffect(() => { const v = Number(new URLSearchParams(window.location.search).get("n")); if (v) setN(v); }, []);
  const title = `Full mock ${n}`;
  return (
    <div className="dgrid narrow">
      <section className="dcard intro">
        <span className="kind">Full mock</span>
        <h1>{title}</h1>
        <div className="intro-facts">
          <div><b>180</b><span className="muted">MCQs</span></div>
          <div><b>3 h</b><span className="muted">time limit</span></div>
          <div><b>0</b><span className="muted">negative marks</span></div>
        </div>
        <Split />
        <SplitLegend />
        <ul className="rules">
          <li>The clock runs once you start. At zero the test submits itself.</li>
          <li>Move freely between questions and flag any to come back to.</li>
          <li>Answers and explanations open when you submit.</li>
          <li>If you switch devices, the test picks up where you left off.</li>
        </ul>
        {ready()
          ? <a className="dpill dark block" href={`/test?mode=mock&title=${encodeURIComponent(title)}`}>Start mock</a>
          : <button type="button" className="dpill dark block" disabled>Mocks open soon</button>}
      </section>
    </div>
  );
}

/* /past-papers — PMDC papers by year, reconstructed and explained. */
export function PastPapersScreen() {
  return <AppShell active="/past-papers">{(user) => <PastPapers user={user} />}</AppShell>;
}

const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019];

function PastPapers({ user }: { user: AccountUser }) {
  const recent = useRecent(user);
  return (
    <div className="dgrid">
      <PageHead title="Past papers" sub="PMDC MDCAT papers, rebuilt in our own words with a full explanation on every question." />
      <section className="dcard panel">
        {!ready() && <Empty title="Past papers coming soon" text={`PMDC MDCAT ${years.at(-1)} to ${years[0]}, each with a full explanation on every question.`} />}
        {ready() && <ul className="pp">
          {years.map((y) => {
            const t = recent?.find((r) => r.kind === "past-paper" && r.title.endsWith(String(y)));
            return (
              <li key={y}>
                <div>
                  <b>PMDC MDCAT {y}</b>
                  <span className="muted">{y === 2020 ? "Provincial papers (KPK, Sindh, Punjab)" : "180 MCQs · 3 hours"}</span>
                </div>
                {t ? <span className="pp-score"><b>{t.score}</b>/180 <span className="muted">· {day(t.date)}</span></span> : <span className="muted small">Not taken</span>}
                <div className="pp-act">
                  {t && <a className="link" href={`/review?id=${t.id}`}>Review</a>}
                  <a className="dpill light small" href={`/test?mode=mock&paper=${y}`}>{t ? "Retake" : "Start"}</a>
                </div>
              </li>
            );
          })}
        </ul>}
      </section>
    </div>
  );
}

/* /history — every test taken. */
export function HistoryScreen() {
  return <AppShell active="/history">{(user) => <History user={user} />}</AppShell>;
}

function History({ user }: { user: AccountUser }) {
  const recent = useRecent(user);
  const [kind, setKind] = useState<TestResult["kind"] | "all">("all");
  const rows = (recent ?? []).filter((t) => kind === "all" || t.kind === kind);
  return (
    <div className="dgrid">
      <PageHead title="Test history" sub={recent?.length ? `${recent.length} test${recent.length > 1 ? "s" : ""}` : undefined} />
      <section className="dcard panel">
        <div className="chips" role="group" aria-label="Type">
          {(["all", "mock", "past-paper", "timed", "practice"] as const).map((k) => (
            <button key={k} type="button" className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>{k === "all" ? "All" : kindNames[k]}</button>
          ))}
        </div>
        {recent && !rows.length && <Empty title={recent.length ? "No tests of this type yet" : "No tests yet"} text="Every practice set, timed test and mock you finish is listed here with its review." />}
        {rows.length > 0 && <div className="table-scroll">
          <table className="recent">
            <thead>
              <tr><th scope="col">Test</th><th scope="col" className="num">Score</th><th scope="col">Type</th><th scope="col">Date</th><th scope="col" className="num">Time</th><th scope="col"><span className="sr">Review</span></th></tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const p = pct(t.score, t.total);
                return (
                  <tr key={t.id}>
                    <th scope="row">{t.title}</th>
                    <td className="num"><b>{t.score}</b>/{t.total} <span className={`acc ${band(p).cls}`}>{p}%</span></td>
                    <td><span className="kind">{kindNames[t.kind]}</span></td>
                    <td>{day(t.date)}</td>
                    <td className="num">{t.minutes} min</td>
                    <td className="num"><a className="link" href={`/review?id=${t.id}`}>Review</a></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>}
      </section>
    </div>
  );
}
