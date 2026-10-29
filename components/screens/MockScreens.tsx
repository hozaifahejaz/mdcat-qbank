"use client";

import { useEffect, useState } from "react";
import AppShell, { PageHead } from "@/components/app/AppShell";
import Empty from "@/components/app/Empty";
import type { TestResult } from "@/lib/dashboard-data";
import { band, day, kindNames, pct } from "@/lib/format";
import { paper } from "@/lib/site";
import { type Catalog, getCatalog, getHistory, testHref } from "@/lib/study";
import type { AccountUser } from "@/lib/user";

/* Every finished test, newest first. */
function useRecent() {
  const [recent, setRecent] = useState<TestResult[] | null>(null);
  useEffect(() => { getHistory().then(setRecent, () => setRecent([])); }, []);
  return recent;
}

function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  useEffect(() => { getCatalog().then(setCatalog, () => {}); }, []);
  return catalog;
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
  const recent = useRecent();
  const catalog = useCatalog();
  const taken = (recent ?? []).filter((t) => t.kind === "mock");
  const mini = (recent ?? []).find((t) => t.kind === "mini-mock");
  const byTitle = new Map(taken.map((t) => [t.title, t]));
  const paid = catalog?.paid ?? user.plan !== "free";
  const ready = !!catalog?.mockReady;
  const mocks = catalog?.mocks ?? 12;
  const nextMock = Array.from({ length: mocks }, (_, k) => k + 1).find((k) => !byTitle.has(`Full mock ${k}`)) ?? 1;
  return (
    <div className="dgrid">
      <PageHead title="Full mocks" sub="180 MCQs in 3 hours, with the real paper's split and difficulty mix.">
        {ready && paid && <a className="dpill dark" href={`/mocks/new?n=${nextMock}`}>Start the next mock</a>}
      </PageHead>
      <section className="dcard panel">
        <Split />
        <SplitLegend />
      </section>
      {catalog && !paid && (
        <section className="dcard panel">
          <div className="panel-h">
            <h2>Your free mini mock</h2>
            {mini && <span className="badge good">Taken</span>}
          </div>
          {mini ? (
            <p className="muted"><b>{mini.score}</b>/{mini.total} on {day(mini.date)}. <a className="link" href={`/review?id=${mini.id}`}>Review answers</a> · <a className="link" href="/pricing">Get a pass for every full mock</a></p>
          ) : catalog.miniOpen ? (
            <>
              <p className="muted">You started your mini mock. Its clock keeps running, so finish it while you can.</p>
              <div><a className="dpill dark small" href={`/test?id=${encodeURIComponent(catalog.miniOpen)}`}>Resume the mini mock</a></div>
            </>
          ) : catalog.miniReady ? (
            <>
              <p className="muted">30 questions in 30 minutes, in the real paper&apos;s proportions. One per free account.</p>
              <div><a className="dpill dark small" href="/mocks/new?mini=1">Start the mini mock</a></div>
            </>
          ) : <p className="muted">Opens once the free set has a few more questions.</p>}
        </section>
      )}
      {catalog && !ready && (
        <section className="dcard panel">
          <Empty title="Mocks open soon" text="Full-length mocks open once the question bank has enough questions in every subject. Your scores and reviews will show here." />
        </section>
      )}
      {ready && <section className="mock-grid" aria-label="Mocks">
        {Array.from({ length: mocks }, (_, k) => {
          const title = `Full mock ${k + 1}`;
          const t = byTitle.get(title);
          const next = paid && k + 1 === nextMock;
          const p = t ? pct(t.score, t.total) : 0;
          return (
            <article key={title} className={`dcard mock${t ? " done" : ""}${next ? " next" : ""}`}>
              <div className="panel-h">
                <h2>{title}</h2>
                {t ? <span className={`acc ${band(p).cls}`}>{p}%</span> : next ? <span className="badge good">Up next</span> : null}
              </div>
              {t ? (
                <>
                  <p className="mock-score"><b>{t.score}</b>/{t.total}</p>
                  <p className="muted small">Taken {day(t.date)} · {t.minutes} min</p>
                  <a className="link" href={`/review?id=${t.id}`}>Review answers</a>
                </>
              ) : (
                <>
                  <p className="muted small">180 MCQs · 3 hours</p>
                  {paid
                    ? <a className={`dpill ${next ? "dark" : "light"} small`} href={`/mocks/new?n=${k + 1}`}>Start</a>
                    : <a className="dpill light small" href="/pricing">With a pass</a>}
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
  const [n, setN] = useState(1);
  const [mini, setMini] = useState(false);
  const catalog = useCatalog();
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const v = Number(p.get("n"));
    if (v) setN(v);
    setMini(p.get("mini") === "1");
  }, []);
  const title = mini ? "Mini mock" : `Full mock ${n}`;
  const ready = mini ? catalog?.miniReady : catalog?.mockReady;
  return (
    <div className="dgrid narrow">
      <section className="dcard intro">
        <span className="kind">{mini ? "Free mini mock" : "Full mock"}</span>
        <h1>{title}</h1>
        <div className="intro-facts">
          <div><b>{mini ? 30 : 180}</b><span className="muted">MCQs</span></div>
          <div><b>{mini ? "30 min" : "3 h"}</b><span className="muted">time limit</span></div>
          <div><b>0</b><span className="muted">negative marks</span></div>
        </div>
        <Split />
        <SplitLegend />
        <ul className="rules">
          <li>The clock runs once you start, and keeps running if you leave. At zero the test submits itself.</li>
          <li>Move freely between questions and flag any to come back to.</li>
          <li>Answers and explanations open when you submit.</li>
          <li>If you switch devices, the test picks up where you left off.</li>
          {mini && <li>Free accounts get one mini mock.</li>}
        </ul>
        {!catalog ? <button type="button" className="dpill dark block" disabled>Loading…</button>
          : !mini && !catalog.paid ? <a className="dpill dark block" href="/pricing">Full mocks come with a pass</a>
          : ready ? <a className="dpill dark block" href={testHref(mini ? { kind: "mini-mock" } : { kind: "mock", mock: n })}>Start {mini ? "the mini mock" : "mock"}</a>
          : <button type="button" className="dpill dark block" disabled>Mocks open soon</button>}
      </section>
    </div>
  );
}

/* /past-papers — PMDC papers by year, reconstructed and explained. */
export function PastPapersScreen() {
  return <AppShell active="/past-papers">{(user) => <PastPapers user={user} />}</AppShell>;
}

function PastPapers({ user }: { user: AccountUser }) {
  const recent = useRecent();
  const catalog = useCatalog();
  const papers = catalog?.papers ?? [];
  const paid = catalog?.paid ?? user.plan !== "free";
  return (
    <div className="dgrid">
      <PageHead title="Past papers" sub="PMDC MDCAT papers, rebuilt in our own words with a full explanation on every question." />
      <section className="dcard panel">
        {catalog && !papers.length && <Empty title="Past papers coming soon" text="PMDC MDCAT papers from recent years, each with a full explanation on every question." />}
        {papers.length > 0 && <ul className="pp">
          {papers.map(({ year: y, count }) => {
            const t = recent?.find((r) => r.kind === "past-paper" && r.title.endsWith(String(y)));
            return (
              <li key={y}>
                <div>
                  <b>PMDC MDCAT {y}</b>
                  <span className="muted">{count} MCQ{count === 1 ? "" : "s"} · {count} minute{count === 1 ? "" : "s"}</span>
                </div>
                {t ? <span className="pp-score"><b>{t.score}</b>/{t.total} <span className="muted">· {day(t.date)}</span></span> : <span className="muted small">Not taken</span>}
                <div className="pp-act">
                  {t && <a className="link" href={`/review?id=${t.id}`}>Review</a>}
                  {paid
                    ? <a className="dpill light small" href={testHref({ kind: "past-paper", paper: y })}>{t ? "Retake" : "Start"}</a>
                    : <a className="dpill light small" href="/pricing">With a pass</a>}
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
  return <AppShell active="/history">{() => <History />}</AppShell>;
}

function History() {
  const recent = useRecent();
  const [kind, setKind] = useState<TestResult["kind"] | "all">("all");
  const rows = (recent ?? []).filter((t) => kind === "all" || t.kind === kind);
  return (
    <div className="dgrid">
      <PageHead title="Test history" sub={recent?.length ? `${recent.length} test${recent.length > 1 ? "s" : ""}` : undefined} />
      <section className="dcard panel">
        <div className="chips" role="group" aria-label="Type">
          {(["all", "mock", "mini-mock", "past-paper", "timed", "practice"] as const).map((k) => (
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
