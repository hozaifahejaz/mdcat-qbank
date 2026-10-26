"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import ScoreTrend from "@/components/dashboard/ScoreTrend";
import { getDashboard, type Dashboard as Data, type SubjectStat, type TestResult } from "@/lib/dashboard-data";
import { paper, prices, site } from "@/lib/site";
import { getCurrentUser, type Plan, type StudentUser } from "@/lib/user";

const links = [
  { href: "/dashboard", label: "Home" },
  { href: "/practice", label: "Practice" },
  { href: "/mocks", label: "Mocks" },
  { href: "/past-papers", label: "Past papers" },
  { href: "/mistakes", label: "My mistakes" },
];

const planNames: Record<Plan, string> = {
  free: "Free plan",
  season: "MDCAT Season Pass",
  bundle: "MDCAT + NUMS Bundle",
  monthly: "Monthly",
};

const kindNames: Record<TestResult["kind"], string> = {
  mock: "Mock",
  timed: "Timed test",
  practice: "Practice",
  "past-paper": "Past paper",
};

const tz = "Asia/Karachi";
const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: tz });
const fullDay = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: tz });
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

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

/* Accuracy band, always shown with its words so it never rests on colour alone. */
function band(p: number) {
  return p >= 75 ? { cls: "good", word: "Strong" } : p >= 60 ? { cls: "warn", word: "Getting there" } : { cls: "bad", word: "Needs work" };
}

export default function Dashboard() {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
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

  return (
    <div className="dash">
      <header className="dnav-wrap">
        <div className="dwrap">
          <div className="dnav">
            <Logo href="/dashboard" />
            <nav aria-label="Main">
              <ul>
                {links.map((l) => (
                  <li key={l.href}><a href={l.href} aria-current={l.href === "/dashboard" ? "page" : undefined}>{l.label}</a></li>
                ))}
              </ul>
            </nav>
            <div className="dnav-end">
              <ThemeToggle />
              <a className="avatar" href="/account" title="Account" aria-label="Account">{user ? initials(user.name) : ""}</a>
            </div>
          </div>
        </div>
      </header>

      <main className="dwrap">
        {user && data ? <Body user={user} data={data} /> : <Skeleton />}
      </main>
    </div>
  );
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}

function Skeleton() {
  return (
    <div className="dgrid" aria-busy="true" aria-label="Loading your dashboard">
      <div className="sk" style={{ height: 120 }} />
      <div className="sk" style={{ height: 160 }} />
      <div className="sk" style={{ height: 360 }} />
    </div>
  );
}

function Body({ user, data }: { user: StudentUser; data: Data }) {
  const totals = data.subjects.map(sumChapters).reduce((t, s) => ({ answered: t.answered + s.answered, available: t.available + s.available, correct: t.correct + s.correct }), { answered: 0, available: 0, correct: 0 });
  const mocks = data.recent.filter((t) => t.total === 180).sort((a, b) => a.date.localeCompare(b.date));
  const lastMock = mocks.at(-1);
  const prevMock = mocks.at(-2);
  const days = daysUntil(site.examDate);
  const firstName = user.name.split(/\s+/)[0];

  return (
    <div className="dgrid">
      <section className="hello" aria-labelledby="hello-h">
        <div>
          <p className="demo"><i />Preview with sample data</p>
          <h1 id="hello-h">{greeting()}, {firstName}.</h1>
          <p className="muted">
            <b>{days} days</b> to MDCAT (expected {fullDay(site.examDate)}) · {data.streakDays}-day practice streak
          </p>
        </div>
        <div className="hello-ctas">
          <a className="dpill dark" href="/mocks/new">Start a full mock</a>
          <a className="dpill light" href="/practice">Practise a chapter</a>
        </div>
      </section>

      <section className="quick" aria-label="Start">
        {data.resume && (
          <a className="tile" href={data.resume.href} style={{ background: "var(--sky)" }}>
            <span className="tile-k">Continue</span>
            <b>{data.resume.title}</b>
            <span className="meter" role="img" aria-label={`${data.resume.done} of ${data.resume.total} done`}><i style={{ width: `${pct(data.resume.done, data.resume.total)}%` }} /></span>
            <span className="tile-s">{data.resume.done} of {data.resume.total} questions</span>
          </a>
        )}
        <a className="tile" href="/mocks/new" style={{ background: "var(--mint)" }}>
          <span className="tile-k">Full mock</span>
          <b>180 MCQs · 3 hours</b>
          <span className="tile-s">Real paper split, no negative marking</span>
        </a>
        <a className="tile" href="/practice?mode=timed" style={{ background: "var(--lemon)" }}>
          <span className="tile-k">Timed test</span>
          <b>Pick chapters, set a clock</b>
          <span className="tile-s">1 minute per question, like the exam</span>
        </a>
        <a className="tile" href="/mistakes" style={{ background: "var(--rose)" }}>
          <span className="tile-k">My mistakes</span>
          <b>{data.mistakesToRetry} to retry</b>
          <span className="tile-s">{data.bookmarks} bookmarked questions</span>
        </a>
      </section>

      <section className="stats" aria-label="Your numbers">
        <div className="dcard stat">
          <span className="stat-k">Questions answered</span>
          <strong>{totals.answered.toLocaleString("en-GB")}</strong>
          <span className="muted">{pct(totals.answered, totals.available)}% of the bank</span>
        </div>
        <div className="dcard stat">
          <span className="stat-k">Accuracy</span>
          <strong>{pct(totals.correct, totals.answered)}%</strong>
          <span className="muted">{totals.correct.toLocaleString("en-GB")} correct</span>
        </div>
        <div className="dcard stat">
          <span className="stat-k">Latest mock</span>
          <strong>{lastMock ? <>{lastMock.score}<small>/180</small></> : "–"}</strong>
          <span className="muted">
            {lastMock && prevMock ? <><span className={lastMock.score >= prevMock.score ? "up" : "down"}>{lastMock.score >= prevMock.score ? "+" : ""}{lastMock.score - prevMock.score}</span> on the one before</> : "Sit one to see your score"}
          </span>
        </div>
        <div className="dcard stat">
          <span className="stat-k">Mocks taken</span>
          <strong>{mocks.length}</strong>
          <span className="muted">Including past papers</span>
        </div>
      </section>

      <div className="cols">
        <section className="dcard panel" aria-labelledby="subj-h">
          <div className="panel-h">
            <h2 id="subj-h">Progress by subject</h2>
            <span className="muted">Tap a subject for chapters</span>
          </div>
          <div className="subjects">
            {data.subjects.map((s) => <SubjectRow key={s.subject} s={s} />)}
          </div>
        </section>

        <div className="stack">
          <section className="dcard panel" aria-labelledby="trend-h">
            <div className="panel-h">
              <h2 id="trend-h">Mock scores</h2>
              <span className="muted">out of 180</span>
            </div>
            <ScoreTrend tests={mocks} />
          </section>

          <section className="dcard panel" aria-labelledby="weak-h">
            <div className="panel-h">
              <h2 id="weak-h">Weak topics</h2>
              <span className="muted">Lowest accuracy, 10+ answered</span>
            </div>
            <ul className="weak">
              {[...data.weakTopics].sort((a, b) => a.correct / a.answered - b.correct / b.answered).map((w) => {
                const p = pct(w.correct, w.answered);
                return (
                  <li key={w.topic}>
                    <div>
                      <b>{w.topic}</b>
                      <span className="muted">{w.subject} · {w.chapter}</span>
                    </div>
                    <span className={`acc ${band(p).cls}`}>{p}%</span>
                    <a className="dpill light small" href={`/practice?topic=${encodeURIComponent(w.topic)}`} aria-label={`Practise ${w.topic}`}>Practise</a>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>

      <section className="dcard panel" aria-labelledby="recent-h">
        <div className="panel-h">
          <h2 id="recent-h">Recent tests</h2>
          <a className="link" href="/history">See all</a>
        </div>
        <div className="table-scroll">
          <table className="recent">
            <thead>
              <tr><th scope="col">Test</th><th scope="col" className="num">Score</th><th scope="col">Type</th><th scope="col">Date</th><th scope="col" className="num">Time</th><th scope="col"><span className="sr">Review</span></th></tr>
            </thead>
            <tbody>
              {data.recent.slice(0, 6).map((t) => {
                const p = pct(t.score, t.total);
                return (
                  <tr key={t.id}>
                    <th scope="row">{t.title}</th>
                    <td className="num"><b>{t.score}</b>/{t.total} <span className={`acc ${band(p).cls}`}>{p}%</span></td>
                    <td><span className="kind">{kindNames[t.kind]}</span></td>
                    <td>{day(t.date)}</td>
                    <td className="num">{t.minutes} min</td>
                    <td className="num"><a className="link" href={`/review/${t.id}`}>Review</a></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="cols even">
        <PlanCard user={user} />
        <Devices data={data} />
      </div>
    </div>
  );
}

function SubjectRow({ s }: { s: SubjectStat }) {
  const t = sumChapters(s);
  const acc = pct(t.correct, t.answered);
  const cover = pct(t.answered, t.available);
  const onPaper = paper.find((p) => p.subject === s.subject)!;
  return (
    <details className="subj" style={{ ["--c" as string]: onPaper.solid, ["--tone" as string]: onPaper.tone }}>
      <summary>
        <span className="subj-name"><i />{s.subject}<em>{onPaper.count} on the paper</em></span>
        <span className="subj-acc"><b>{t.answered ? `${acc}%` : "–"}</b><span className="muted">accuracy</span></span>
        <span className="subj-cover">
          <span className="meter" role="img" aria-label={`${cover}% of ${s.subject} questions answered`}><i style={{ width: `${cover}%` }} /></span>
          <span className="muted">{t.answered} of {t.available} answered</span>
        </span>
        <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </summary>
      <ul className="chapters">
        {s.chapters.map((c) => {
          const p = pct(c.correct, c.answered);
          return (
            <li key={c.chapter}>
              <span>{c.chapter}</span>
              <span className="muted">{c.answered}/{c.available}</span>
              {c.answered ? <span className={`acc ${band(p).cls}`} title={band(p).word}>{p}%</span> : <span className="acc none">Not started</span>}
              <a className="link" href={`/practice?subject=${encodeURIComponent(s.subject)}&chapter=${encodeURIComponent(c.chapter)}`} aria-label={`Practise ${c.chapter}`}>Practise</a>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

function PlanCard({ user }: { user: StudentUser }) {
  const paid = user.plan !== "free";
  return (
    <section className={`dcard panel plan ${paid ? "" : "free"}`} aria-labelledby="plan-h">
      <div className="panel-h">
        <h2 id="plan-h">Your plan</h2>
        <span className={`badge ${paid ? "good" : ""}`}>{paid ? "Active" : "Free"}</span>
      </div>
      <p className="plan-name">{planNames[user.plan]}</p>
      {paid ? (
        <p className="muted">
          Full question bank, mocks, past papers and analytics
          {user.planExpiresAt ? <> until <b>{fullDay(user.planExpiresAt)}</b>.</> : "."}
          {user.plan === "monthly" ? " Renews monthly." : " One payment, no renewal."}
        </p>
      ) : (
        <>
          <p className="muted">About 300 questions, one mini-mock and basic stats. The Season Pass opens the full bank, every mock and past paper until the exam.</p>
          <a className="dpill dark" href="/pricing">Get the Season Pass · Rs. {prices.seasonPass}</a>
        </>
      )}
      <a className="link" href="/account/billing">Receipts and billing</a>
    </section>
  );
}

function Devices({ data }: { data: Data }) {
  const [note, setNote] = useState(false);
  return (
    <section className="dcard panel" aria-labelledby="dev-h">
      <div className="panel-h">
        <h2 id="dev-h">Devices</h2>
        <span className="muted">{data.devices.length} of 2 registered</span>
      </div>
      <ul className="devices">
        {data.devices.map((d) => (
          <li key={d.id}>
            <span className="dev-ico" aria-hidden="true">
              {/android|phone|iphone/i.test(d.name) ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M2 20h20" /></svg>
              )}
            </span>
            <div>
              <b>{d.name}{d.thisDevice && <em> · this device</em>}</b>
              <span className="muted">{d.active ? "Active now" : `Last used ${day(d.lastSeen)}`}</span>
            </div>
            {d.active ? <span className="badge good">Active</span> : <button type="button" className="link" onClick={() => setNote(true)}>Remove</button>}
          </li>
        ))}
      </ul>
      <p className="muted small">
        Only one device can be in use at a time. Opening {site.name} on the other one moves your session there, and an unfinished test picks up where you left off.
        A removed device can be replaced once every 30 days.
      </p>
      {note && <p className="small" role="status">Removing devices turns on with sign-in.</p>}
    </section>
  );
}
