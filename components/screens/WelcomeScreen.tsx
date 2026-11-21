"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/app/AppShell";
import { go } from "@/components/Nav";
import { ExamMark } from "@/components/Marks";
import { friendlyError } from "@/lib/auth";
import { type BankId, banks } from "@/lib/banks";
import { keep, seen } from "@/lib/cache";
import type { Dashboard } from "@/lib/dashboard-data";
import { examYears, getPrefs, goalChoices, savePrefs } from "@/lib/prefs";
import { testHref } from "@/lib/study";
import type { AccountUser } from "@/lib/user";

/* The tests in the order a new student most likely wants them. */
const order: BankId[] = ["mdcat", "nums", "aku", "fsc1", "fsc2"];
const choices = order.map((id) => banks.find((b) => b.id === id)!);

/* /welcome — the first screen after signing up: which test, which year and how many questions a day, then straight
   into a first set of ten. The dashboard sends a new student here once (components/dashboard/Dashboard.tsx); the
   answers are saved to the account (server/prefs.ts) and can be changed later from the dashboard. */
export default function WelcomeScreen() {
  return <AppShell title="Welcome">{(user) => <Welcome user={user} />}</AppShell>;
}

function Welcome({ user }: { user: AccountUser }) {
  const [bank, setBank] = useState<BankId>("mdcat");
  const [year, setYear] = useState<number>(examYears[0]!);
  const [goal, setGoal] = useState(40);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getPrefs().then((p) => {
      if (choices.some((b) => b.id === p.bank)) setBank(p.bank as BankId);
      if (p.examYear && examYears.includes(p.examYear)) setYear(p.examYear);
      if (p.dailyGoal) setGoal(p.dailyGoal);
    }).catch(() => {});
  }, []);

  async function save(start: boolean) {
    if (busy) return;
    setBusy(true); setError("");
    try {
      await savePrefs({ bank, examYear: year, dailyGoal: goal, welcomed: true });
      try { localStorage.setItem("practice-bank", bank); } catch {}
      // The dashboard's kept copy still says "not welcomed"; put that right so it doesn't send them back here.
      const kept = seen<Dashboard>("dashboard", true);
      if (kept) keep("dashboard", { ...kept, welcomed: true, dailyGoal: goal, examYear: year }, true);
      if (!start) return go("/dashboard", true);
      // If they answered a sample question on the landing page, the first set is in that subject.
      let subject: string | undefined;
      try { subject = localStorage.getItem("start-subject") ?? undefined; localStorage.removeItem("start-subject"); } catch {}
      if (subject && !banks.find((b) => b.id === bank)!.subjects.some((s) => s.name === subject)) subject = undefined;
      go(testHref({ kind: "practice", bank, subject, count: 10, title: "Your first 10 questions" }), true);
    } catch (e) {
      setError(friendlyError(e));
      setBusy(false);
    }
  }

  const first = user.name.split(/\s+/)[0];
  return (
    <div className="dgrid narrow wel">
      <section className="hello page-head">
        <div>
          <h1>Welcome{first ? `, ${first}` : ""}</h1>
          <p className="muted">Three quick choices, then your first ten questions.</p>
        </div>
      </section>

      <section className="dcard panel wel-step" aria-labelledby="wel-test">
        <h2 id="wel-test"><span className="wel-n">1</span>What are you practicing for?</h2>
        <div className="wel-opts" role="radiogroup" aria-labelledby="wel-test">
          {choices.map((b) => (
            <button key={b.id} type="button" role="radio" aria-checked={bank === b.id} className="wel-opt" onClick={() => setBank(b.id)}>
              <span className={`wel-mark bank-${b.id}`}><ExamMark id={b.id} size={22} /></span><b>{b.name}</b><span>{b.blurb}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="dcard panel wel-step" aria-labelledby="wel-year">
        <h2 id="wel-year"><span className="wel-n">2</span>When do you sit it?</h2>
        <div className="wel-opts two" role="radiogroup" aria-labelledby="wel-year">
          {examYears.map((y, i) => (
            <button key={y} type="button" role="radio" aria-checked={year === y} className="wel-opt" onClick={() => setYear(y)}>
              <b>{y}</b><span>{i === 0 ? "This season" : "Next season"}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="dcard panel wel-step" aria-labelledby="wel-goal">
        <h2 id="wel-goal"><span className="wel-n">3</span>How many questions a day?</h2>
        <div className="wel-opts three" role="radiogroup" aria-labelledby="wel-goal">
          {goalChoices.map((g) => (
            <button key={g.n} type="button" role="radio" aria-checked={goal === g.n} className="wel-opt" onClick={() => setGoal(g.n)}>
              <b>{g.n}</b><span>{g.name} · {g.hint.toLowerCase()}</span>
            </button>
          ))}
        </div>
        <p className="muted small">You can change this any time from your dashboard.</p>
      </section>

      {error && <p className="note-bad" role="alert">{error}</p>}
      <div className="wel-go">
        <button type="button" className="dpill dark" disabled={busy} onClick={() => save(true)}>{busy ? "One moment…" : "Start my first 10 questions"}</button>
        <button type="button" className="dpill light" disabled={busy} onClick={() => save(false)}>Go to my dashboard</button>
      </div>
    </div>
  );
}
