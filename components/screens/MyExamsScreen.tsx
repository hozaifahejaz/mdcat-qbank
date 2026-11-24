"use client";

import { useEffect, useState } from "react";
import AppShell, { AccountTabs, PageHead } from "@/components/app/AppShell";
import { ExamOptions, type Picked, fromSaved, toSave } from "@/components/exams/ExamPicker";
import { friendlyError } from "@/lib/auth";
import { type AreaId, LEGACY, areaById, areas, examById, exams as allExams } from "@/lib/exams";
import { examYears, examsSaved, getPrefs, saveExams } from "@/lib/prefs";
import type { AccountUser } from "@/lib/user";

/* /account/exams — what the account is preparing for, changed any time: the exams inside its area, which one the app
   opens on, and the year. Saved the same way as the welcome screen (server/prefs.ts). */
export default function MyExamsScreen() {
  return <AppShell active="/account/exams">{(user) => <MyExams user={user} />}</AppShell>;
}

function MyExams({ user }: { user: AccountUser }) {
  const area = (areaById(user.area)?.id ?? LEGACY.area) as AreaId;
  const saved = user.exams?.length ? user.exams : LEGACY.exams;
  const [picked, setPicked] = useState<Picked>(() => fromSaved(saved));
  const [year, setYear] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  // Which exam the app opens on and the year are kept with the student's other choices.
  useEffect(() => {
    getPrefs().then((p) => {
      setYear(p.examYear && examYears.includes(p.examYear) ? p.examYear : null);
      const main = allExams.find((e) => e.bank === p.bank && saved.includes(e.id));
      if (main) setPicked((v) => ({ ...v, main: main.id }));
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const choice = toSave(area, picked);
  const asksWhen = !!choice && !examById(choice.main)?.group;
  const change = (p: Picked) => { setPicked(p); setNote(""); setError(""); };

  async function save() {
    if (busy || !choice) return;
    setBusy(true); setNote(""); setError("");
    try {
      const res = await saveExams({ area, exams: choice.exams, main: choice.main, examYear: asksWhen ? year : null });
      examsSaved(res.user, examById(choice.main)!.bank);
      setNote("Saved. Your banks, mocks and home screen now follow these exams.");
    } catch (e) {
      setError(friendlyError(e));
    }
    setBusy(false);
  }

  const soon = areas.filter((a) => !a.open).map((a) => a.name);
  return (
    <div className="dgrid acct">
      <PageHead title="Account" />
      <AccountTabs active="/account/exams" />

      <section className="dcard panel wel-step">
        <div>
          <h2 className="panel-title" id="mx-h">{areaById(area)?.name}</h2>
          <p className="muted">Tick the tests you are preparing for. Your question banks, mocks and home screen follow them, and your answers so far stay with you.</p>
        </div>
        <ExamOptions area={area} value={picked} onChange={change} labelledBy="mx-h" unsure={false} />
        {asksWhen && (
          <div className="wel-more">
            <span className="wel-q">When do you sit {choice!.exams.length > 1 ? "them" : "it"}?</span>
            <div className="chips" role="radiogroup" aria-label="Exam year">
              {examYears.map((y) => <button key={y} type="button" role="radio" aria-checked={year === y} aria-pressed={year === y} className="chip" onClick={() => { setYear(y); setNote(""); }}>{y}</button>)}
              <button type="button" role="radio" aria-checked={year === null} aria-pressed={year === null} className="chip" onClick={() => { setYear(null); setNote(""); }}>Not sure yet</button>
            </div>
          </div>
        )}
        {!choice && <p className="note-bad" role="alert">Keep at least one ticked.</p>}
        {error && <p className="note-bad" role="alert">{error}</p>}
        {note && <p className="note-good" role="status">{note}</p>}
        <div className="wel-go"><button type="button" className="dpill dark small" disabled={busy || !choice} onClick={save}>{busy ? "Saving" : "Save"}</button></div>
      </section>

      {soon.length > 0 && <p className="muted small">More areas are on the way: {soon.join(", ")}.</p>}
    </div>
  );
}
