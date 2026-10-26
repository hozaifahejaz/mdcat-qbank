"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Explanation from "@/components/test/Explanation";
import Protected from "@/components/test/Protected";
import ThemeToggle from "@/components/ThemeToggle";
import { type Attempt, type Mode, saveAttempt } from "@/lib/attempts";
import { type Question, subjects } from "@/lib/bank";
import type { TestResult } from "@/lib/dashboard-data";
import { clock, letters } from "@/lib/format";
import { paper } from "@/lib/site";
import type { AccountUser } from "@/lib/user";

const modeNames: Record<Mode, string> = { tutor: "Practice", timed: "Timed test", mock: "Mock" };
const tone = (s: string) => paper.find((p) => p.subject === s)?.tone ?? "var(--bg)";

type Props = { user: AccountUser; mode: Mode; kind: TestResult["kind"]; title: string; questions: Question[]; minutes?: number };

/* One screen for every way of answering questions.
   tutor: check each answer and read its explanation straight away, no clock.
   timed / mock: a countdown, a question palette, flag for review, and the answers only on the results page. */
export default function TestPlayer({ user, mode, kind, title, questions, minutes }: Props) {
  const n = questions.length;
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [flagged, setFlagged] = useState<boolean[]>(() => questions.map(() => false));
  const [checked, setChecked] = useState<boolean[]>(() => questions.map(() => false));
  const [marks, setMarks] = useState<Set<string>>(() => new Set());
  const [elapsed, setElapsed] = useState(0);
  const [sheet, setSheet] = useState(false);
  const [dialog, setDialog] = useState<null | "submit" | "exit" | "report">(null);

  const limit = mode === "tutor" ? null : (minutes ?? n) * 60;
  const left = limit === null ? null : limit - elapsed;
  const q = questions[i]!;
  const chosen = answers[i] ?? null;
  const revealed = mode === "tutor" && checked[i];
  const answered = answers.filter((a) => a !== null).length;

  const leaving = useRef(false);
  const submit = useCallback(() => {
    leaving.current = true;
    const a: Attempt = { id: "last", kind, mode, title, date: new Date().toISOString(), seconds: elapsed, questionIds: questions.map((x) => x.id), answers, flagged };
    saveAttempt(a);
    window.location.href = "/review?id=last";
  }, [kind, mode, title, elapsed, questions, answers, flagged]);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { if (left !== null && left <= 0) submit(); }, [left, submit]);

  // Leaving mid-test asks first; the backend will also save progress so another device can resume it.
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (answered && !dialog && !leaving.current) e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [answered, dialog]);

  const choose = (o: number) => {
    if (revealed) return;
    setAnswers((a) => a.map((x, k) => (k === i ? (x === o && mode !== "tutor" ? null : o) : x)));
  };
  const go = (k: number) => { setI(Math.max(0, Math.min(n - 1, k))); setSheet(false); window.scrollTo({ top: 0 }); };
  const toggleMark = () => setMarks((m) => { const c = new Set(m); if (c.has(q.id)) c.delete(q.id); else c.add(q.id); return c; });

  // Keyboard: A–D or 1–4 to answer, arrows to move.
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (dialog || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.metaKey || e.ctrlKey) return;
      const k = e.key.toLowerCase();
      const o = "abcd".indexOf(k) >= 0 ? "abcd".indexOf(k) : "1234".indexOf(k);
      if (o >= 0 && o < q.options.length) choose(o);
      else if (e.key === "ArrowRight") go(i + 1);
      else if (e.key === "ArrowLeft") go(i - 1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  const groups = useMemo(() => subjects.map((s) => ({ s, idx: questions.flatMap((x, k) => (x.subject === s ? [k] : [])) })).filter((g) => g.idx.length), [questions]);
  const low = left !== null && left < 5 * 60;

  return (
    <div className="player">
      <header className="ptop-wrap">
        <div className="ptop dwrap">
          <button type="button" className="dpill light small" onClick={() => (answered ? setDialog("exit") : (window.location.href = "/dashboard"))}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
            <span className="hide-sm">Exit</span>
          </button>
          <div className="ptitle">
            <b>{title}</b>
            <span className="muted">{modeNames[mode]} · {answered} of {n} answered</span>
          </div>
          <div className="ptop-end">
            <span className={`timer${low ? " low" : ""}`} role="timer" aria-label={left === null ? "Time spent" : "Time left"}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M9 2h6" /></svg>
              {clock(left ?? elapsed)}
            </span>
            <ThemeToggle />
            {mode !== "tutor" && <button type="button" className="dpill dark small hide-sm" onClick={() => setDialog("submit")}>Submit</button>}
          </div>
        </div>
        <div className="pbar" aria-hidden="true"><i style={{ width: `${((i + 1) / n) * 100}%` }} /></div>
      </header>

      <div className={`pbody dwrap${mode === "tutor" ? " solo" : ""}`}>
        <main className="pmain">
          <Protected user={user}>
            <article className="qcard dcard" aria-labelledby="stem">
              <div className="qmeta">
                <span className="qchip" style={{ background: tone(q.subject) }}>{q.subject}</span>
                <span className="muted">{q.chapter} · {q.topic}</span>
                <span className="qnum">Q{i + 1}<span className="muted">/{n}</span></span>
              </div>
              <p id="stem" className="stem">{q.stem}</p>
              <ul className="opts" role="list">
                {q.options.map((o, k) => {
                  const state = revealed ? (k === q.answer ? "key" : k === chosen ? "miss" : "dim") : k === chosen ? "on" : "";
                  return (
                    <li key={k}>
                      <button type="button" className={`opt ${state}`} aria-pressed={k === chosen} disabled={revealed} onClick={() => choose(k)}>
                        <span className="letter">{letters[k]}</span>
                        <span className="otext">{o}</span>
                        {state === "key" && <span className="otag good">Answer</span>}
                        {state === "miss" && <span className="otag bad">Your answer</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {revealed && <Explanation q={q} chosen={chosen} onReport={() => setDialog("report")} />}
            </article>
          </Protected>

          <div className="qtools">
            {mode !== "tutor" && (
              <button type="button" className={`tool${flagged[i] ? " on" : ""}`} aria-pressed={flagged[i]} onClick={() => setFlagged((f) => f.map((x, k) => (k === i ? !x : x)))}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill={flagged[i] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true"><path d="M5 21V4h11l-2 4 2 4H5" /></svg>
                {flagged[i] ? "Flagged" : "Flag for review"}
              </button>
            )}
            <button type="button" className={`tool${marks.has(q.id) ? " on" : ""}`} aria-pressed={marks.has(q.id)} onClick={toggleMark}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill={marks.has(q.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z" /></svg>
              {marks.has(q.id) ? "Bookmarked" : "Bookmark"}
            </button>
            <button type="button" className="tool" onClick={() => setDialog("report")}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.01" /></svg>
              Report
            </button>
          </div>

          <div className="qnav">
            <button type="button" className="dpill light" disabled={i === 0} onClick={() => go(i - 1)}>Previous</button>
            {mode !== "tutor" && <button type="button" className="dpill light show-sm" onClick={() => setSheet(true)}>All questions</button>}
            {mode === "tutor" && !revealed ? (
              <button type="button" className="dpill dark" disabled={chosen === null} onClick={() => setChecked((c) => c.map((x, k) => (k === i ? true : x)))}>Check answer</button>
            ) : i < n - 1 ? (
              <button type="button" className="dpill dark" onClick={() => go(i + 1)}>Next</button>
            ) : (
              <button type="button" className="dpill dark" onClick={() => (mode === "tutor" ? submit() : setDialog("submit"))}>{mode === "tutor" ? "Finish" : "Submit"}</button>
            )}
          </div>
          <p className="kbd-hint muted hide-sm">Keys: A to D to answer, ← → to move</p>
        </main>

        {mode !== "tutor" && (
          <aside className={`palette dcard${sheet ? " open" : ""}`} aria-label="Questions">
            <div className="pal-h">
              <b>Questions</b>
              <button type="button" className="link show-sm" onClick={() => setSheet(false)}>Close</button>
            </div>
            {groups.map((g) => (
              <div key={g.s} className="pal-group">
                <span className="pal-s">{g.s}</span>
                <div className="pal-grid">
                  {g.idx.map((k) => (
                    <button
                      key={k}
                      type="button"
                      className={`cell${answers[k] !== null ? " done" : ""}${flagged[k] ? " flag" : ""}${k === i ? " now" : ""}`}
                      aria-label={`Question ${k + 1}${answers[k] !== null ? ", answered" : ""}${flagged[k] ? ", flagged" : ""}`}
                      aria-current={k === i || undefined}
                      onClick={() => go(k)}
                    >{k + 1}</button>
                  ))}
                </div>
              </div>
            ))}
            <ul className="legend">
              <li><i className="cell done" />Answered</li>
              <li><i className="cell" />Not answered</li>
              <li><i className="cell flag" />Flagged</li>
            </ul>
            <button type="button" className="dpill dark" onClick={() => setDialog("submit")}>Submit test</button>
          </aside>
        )}
        {sheet && <div className="scrim show-sm" onClick={() => setSheet(false)} />}
      </div>

      {dialog === "submit" && (
        <Dialog title="Submit your test?" onClose={() => setDialog(null)}>
          <p className="muted">
            {n - answered ? <><b>{n - answered} unanswered</b> and </> : null}
            <b>{flagged.filter(Boolean).length} flagged</b>. There&apos;s no negative marking, so an answer on every question can only help.
          </p>
          <div className="dlg-actions">
            <button type="button" className="dpill light" onClick={() => setDialog(null)}>Keep going</button>
            <button type="button" className="dpill dark" onClick={submit}>Submit</button>
          </div>
        </Dialog>
      )}
      {dialog === "exit" && (
        <Dialog title="Leave this test?" onClose={() => setDialog(null)}>
          <p className="muted">Your answers so far are saved, and you can pick up where you left off from the dashboard.</p>
          <div className="dlg-actions">
            <button type="button" className="dpill light" onClick={() => setDialog(null)}>Stay</button>
            <a className="dpill dark" href="/dashboard">Save and exit</a>
          </div>
        </Dialog>
      )}
      {dialog === "report" && <ReportDialog q={q} onClose={() => setDialog(null)} />}
    </div>
  );
}

export function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);
  return (
    <div className="dlg-scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dlg dcard" role="dialog" aria-modal="true" aria-labelledby="dlg-h">
        <h2 id="dlg-h">{title}</h2>
        {children}
      </div>
    </div>
  );
}

const reasons = ["The answer key is wrong", "More than one answer is correct", "The explanation is wrong or unclear", "Typo or formatting problem", "Something else"];

/* Report a question: goes to the reviewers' queue in the admin tool. Three open reports hide a question until it's checked. */
export function ReportDialog({ q, onClose }: { q: Question; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <Dialog title={sent ? "Thanks, we'll check it" : "Report a problem"} onClose={onClose}>
      {sent ? (
        <>
          <p className="muted">A subject reviewer looks at every report within 48 hours. If the question changes, your stats are corrected.</p>
          <div className="dlg-actions"><button type="button" className="dpill dark" onClick={onClose}>Done</button></div>
        </>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <p className="muted small">{q.subject} · {q.topic}</p>
          <fieldset className="radios">
            <legend className="sr">What&apos;s wrong?</legend>
            {reasons.map((r) => (
              <label key={r}><input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} />{r}</label>
            ))}
          </fieldset>
          <label className="fld"><span>Details (optional)</span><textarea rows={3} placeholder="For example: the textbook says…" /></label>
          <div className="dlg-actions">
            <button type="button" className="dpill light" onClick={onClose}>Cancel</button>
            <button className="dpill dark" disabled={!reason}>Send report</button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
