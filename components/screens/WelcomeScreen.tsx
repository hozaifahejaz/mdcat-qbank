"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import AppShell from "@/components/app/AppShell";
import { AreaOptions, ExamOptions, type Picked, nothingPicked, toSave } from "@/components/exams/ExamPicker";
import Logo from "@/components/Logo";
import { go } from "@/components/Nav";
import { friendlyError, signOut } from "@/lib/auth";
import { type AreaId, areaById, examById, examsIn } from "@/lib/exams";
import { useNarrow } from "@/lib/narrow";
import { examYears, examsSaved, saveExams } from "@/lib/prefs";
import { testHref } from "@/lib/study";
import type { AccountUser } from "@/lib/user";

/* /welcome — the first screen after signing up: which area, which exams inside it and (if they know) when they sit
   them. Every app page sends a student here until they have chosen (components/app/AppShell.tsx), so nobody lands on
   another exam's questions. The area or exam a visitor was looking at on the site arrives in the address
   (lib/exams.ts signupHref) and is already ticked. The answers are saved to the account (server/prefs.ts) and can be
   changed under Account, My exams.

   Laptops show the questions as cards that open one after another on one page; phones show one question a screen. */
export default function WelcomeScreen() {
  return <AppShell title="Welcome" bare>{(user) => <Welcome user={user} />}</AppShell>;
}

type Step = "area" | "exam" | "when";
/* Only addresses on this site, so ?next= can't send anyone elsewhere. */
const safe = (raw: string | null) => (raw && /^\/(?![\/\\])[^\s\\]*$/.test(raw) ? raw : null);

function Welcome({ user }: { user: AccountUser }) {
  const narrow = useNarrow();
  const [area, setArea] = useState<AreaId | null>(null);
  const [picked, setPicked] = useState<Picked>(nothingPicked);
  const [year, setYear] = useState<number | null | undefined>(undefined);
  const [step, setStep] = useState<Step>("area");
  const [after, setAfter] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const leaving = useRef(false);

  // Before the first paint: what the address says they were looking at, and where they were headed.
  useLayoutEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const next = safe(p.get("next"));
    // An account that has already chosen keeps its choice: a link's pick never overwrites it.
    if (user.exams?.length) { leaving.current = true; go(next ?? "/dashboard", true); return; }
    setAfter(next);
    const a = areaById(p.get("area"));
    if (a?.open) {
      setArea(a.id);
      setStep("exam");
      const e = examById(p.get("exam"));
      if (e && e.area === a.id) setPicked({ exams: [e.id], unsure: false, main: e.id });
    }
    setReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const choice = area ? toSave(area, picked) : null;
  // The date question is for an entrance test; the textbooks on their own have no test day.
  const asksWhen = !!choice && !examById(choice.main)?.group;
  const steps: Step[] = asksWhen || !choice ? ["area", "exam", "when"] : ["area", "exam"];
  const at = Math.max(0, steps.indexOf(step));
  const last = at === steps.length - 1;
  useEffect(() => { if (!steps.includes(step)) setStep("exam"); }, [steps, step]);

  function pickArea(a: AreaId) {
    if (a !== area) setPicked(nothingPicked);
    setArea(a);
  }

  async function save(start: boolean) {
    if (busy || !area || !choice) return;
    setBusy(true); setError("");
    try {
      const res = await saveExams({ area, exams: choice.exams, main: choice.main, examYear: asksWhen ? year ?? null : null });
      const bank = examById(choice.main)!.bank;
      examsSaved(res.user, bank);
      leaving.current = true;
      if (after) return go(after, true);
      if (!start) return go("/dashboard", true);
      go(testHref({ kind: "practice", bank, count: 10, title: "Your first 10 questions" }), true);
    } catch (e) {
      setError(friendlyError(e));
      setBusy(false);
    }
  }

  if (!ready || narrow === null || leaving.current && !busy) return <div className="onb"><div className="sk" style={{ height: 320, maxWidth: 680, margin: "80px auto" }} /></div>;

  const first = user.name.split(/\s+/)[0];
  const many = area ? examsIn(area).filter((e) => !e.group).length > 1 : false;
  const areaCard = (
    <section className="dcard panel wel-step" aria-labelledby="wel-area">
      <h2 id="wel-area"><span className="wel-n">1</span>What are you preparing for?</h2>
      <AreaOptions value={area} onChange={pickArea} labelledBy="wel-area" />
    </section>
  );
  const examCard = area && (
    <section className="dcard panel wel-step" aria-labelledby="wel-exam">
      <h2 id="wel-exam"><span className="wel-n">2</span>{many ? "Which tests will you sit?" : "Which test will you sit?"}</h2>
      {many && <p className="muted small wel-hint">Tick every one you plan to sit.</p>}
      <ExamOptions area={area} value={picked} onChange={setPicked} labelledBy="wel-exam" />
    </section>
  );
  const whenCard = choice && asksWhen && (
    <section className="dcard panel wel-step" aria-labelledby="wel-year">
      <h2 id="wel-year"><span className="wel-n">3</span>When do you sit {choice.exams.length > 1 ? "them" : "it"}?</h2>
      <div className="wel-opts three" role="radiogroup" aria-labelledby="wel-year">
        {examYears.map((y, i) => (
          <button key={y} type="button" role="radio" aria-checked={year === y} className="wel-opt" onClick={() => setYear(y)}>
            <b>{y}</b><span>{i === 0 ? "This season" : "Next season"}</span>
          </button>
        ))}
        <button type="button" role="radio" aria-checked={year === null} className="wel-opt" onClick={() => setYear(null)}>
          <b>Not sure yet</b><span>You can add it later</span>
        </button>
      </div>
    </section>
  );
  const main = after
    ? <button type="button" className="dpill dark" disabled={busy || !choice} onClick={() => save(false)}>{busy ? "One moment…" : "Continue"}</button>
    : <button type="button" className="dpill dark" disabled={busy || !choice} onClick={() => save(true)}>{busy ? "One moment…" : "Start my first 10 questions"}</button>;
  const other = !after && <button type="button" className={narrow ? "onb-skip" : "dpill light"} disabled={busy || !choice} onClick={() => save(false)}>Go to my dashboard{narrow ? " instead" : ""}</button>;
  const canNext = step === "area" ? !!area : step === "exam" ? !!choice : true;

  return (
    <div className={`onb${narrow ? " phone" : ""}`}>
      <header className="onb-top">
        <Logo href="/welcome" />
        <button type="button" className="onb-out" onClick={async () => { await signOut(); window.location.replace("/"); }}>Sign out</button>
      </header>

      {narrow ? (
        <main className="onb-main">
          <div className="onb-bar" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={at + 1} aria-label={`Step ${at + 1} of ${steps.length}`}>
            {steps.map((s, i) => <i key={s} className={i <= at ? "on" : undefined} />)}
          </div>
          {at === 0 && <div className="onb-hello"><h1>Welcome{first ? `, ${first}` : ""}</h1><p className="muted">A couple of quick choices and you are in.</p></div>}
          {step === "area" ? areaCard : step === "exam" ? examCard : whenCard}
          {last && other}
          {error && <p className="note-bad" role="alert">{error}</p>}
          <div className="onb-foot">
            {at > 0 && <button type="button" className="dpill light" disabled={busy} onClick={() => setStep(steps[at - 1]!)}>Back</button>}
            {last ? main : <button type="button" className="dpill dark" disabled={!canNext} onClick={() => setStep(steps[at + 1]!)}>Next</button>}
          </div>
        </main>
      ) : (
        <main className="onb-main">
          <div className="onb-hello"><h1>Welcome{first ? `, ${first}` : ""}</h1><p className="muted">A couple of quick choices and you are in.</p></div>
          {areaCard}
          {examCard}
          {whenCard}
          {error && <p className="note-bad" role="alert">{error}</p>}
          {area && <div className="wel-go">{main}{other}</div>}
        </main>
      )}
    </div>
  );
}
