"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Explanation from "@/components/test/Explanation";
import Protected from "@/components/test/Protected";
import ThemeToggle from "@/components/ThemeToggle";
import { ApiError } from "@/lib/api";
import { friendlyError } from "@/lib/auth";
import { subjects } from "@/lib/bank";
import { clock, letters } from "@/lib/format";
import { paper } from "@/lib/site";
import { type Mode, type OpenAttempt, checkAnswer, finishTest, reportQuestion, saveAnswer, setBookmark } from "@/lib/study";
import type { Question } from "@/lib/bank";
import type { AccountUser } from "@/lib/user";

const modeNames: Record<Mode, string> = { tutor: "Practice", timed: "Timed test", mock: "Mock" };
const tone = (s: string) => paper.find((p) => p.subject === s)?.tone ?? "var(--bg)";

type Props = { user: AccountUser; attempt: OpenAttempt; note?: string };

/* One screen for every way of answering questions. Every answer is saved on the server as it's picked, so leaving,
   refreshing or switching device carries on where the student was.
   tutor: check each answer and read its explanation straight away, no clock.
   timed / mock: the server's countdown, a question palette, flag for review, and the answers only on the results page. */
export default function TestPlayer({ user, attempt, note }: Props) {
  const { mode, title, items } = attempt;
  const n = items.length;
  const [i, setI] = useState(() => Math.max(0, items.findIndex((x) => x.answer === null && !x.checked)));
  const [answers, setAnswers] = useState<(number | null)[]>(() => items.map((x) => x.answer));
  const [flagged, setFlagged] = useState<boolean[]>(() => items.map((x) => x.flagged));
  const [reveals, setReveals] = useState<(Question | null)[]>(() => items.map((x) => x.reveal));
  const [marks, setMarks] = useState<Set<string>>(() => new Set(items.filter((x) => x.bookmarked).map((x) => x.q.id)));
  const [now, setNow] = useState(() => Date.now());
  const [sheet, setSheet] = useState(false);
  const [dialog, setDialog] = useState<null | "submit" | "exit" | "report">(null);
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef(0);

  // The clock is the server's: the deadline it set, corrected for how far this device's clock is off.
  const skew = useMemo(() => attempt.now - Date.now(), [attempt.now]);
  const left = attempt.deadlineAt === null ? null : Math.max(0, Math.round((attempt.deadlineAt - (now + skew)) / 1000));
  const elapsed = Math.max(0, Math.round((now + skew - attempt.startedAt) / 1000));
  const item = items[i]!;
  const q = item.q;
  const chosen = answers[i] ?? null;
  const reveal = mode === "tutor" ? reveals[i] : null;
  const answered = mode === "tutor" ? reveals.filter(Boolean).length : answers.filter((a) => a !== null).length;

  const leaving = useRef(false);
  const submit = useCallback(async () => {
    if (leaving.current) return;
    leaving.current = true;
    setBusy(true);
    try {
      await finishTest(attempt.id);
      window.location.href = `/review?id=${encodeURIComponent(attempt.id)}`;
    } catch (e) {
      leaving.current = false;
      setBusy(false);
      setProblem(friendlyError(e));
    }
  }, [attempt.id]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { if (left !== null && left <= 0) submit(); }, [left, submit]);

  // Only unsaved answers need a warning; everything else is already on the server.
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (pending.current > 0 && !leaving.current) e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const save = (k: number, answer: number | null, flag: boolean) => {
    pending.current++;
    saveAnswer(attempt.id, items[k]!.idx, answer, flag)
      .then(() => setProblem(""))
      .catch((e) => {
        if (e instanceof ApiError && (e.code === "time_up" || e.code === "finished")) {
          leaving.current = true;
          window.location.href = `/review?id=${encodeURIComponent(attempt.id)}`;
        } else setProblem(`Your last answer didn't save. ${friendlyError(e)}`);
      })
      .finally(() => { pending.current--; });
  };

  const choose = (o: number) => {
    if (reveal || busy) return;
    const next = chosen === o && mode !== "tutor" ? null : o;
    setAnswers((a) => a.map((x, k) => (k === i ? next : x)));
    if (mode !== "tutor") save(i, next, flagged[i]!);
  };
  const toggleFlag = () => {
    const f = !flagged[i];
    setFlagged((x) => x.map((v, k) => (k === i ? f : v)));
    save(i, answers[i] ?? null, f);
  };
  const check = async () => {
    if (chosen === null) return;
    setBusy(true);
    try {
      const r = await checkAnswer(attempt.id, item.idx, chosen);
      setAnswers((a) => a.map((x, k) => (k === i ? r.answer : x)));
      setReveals((x) => x.map((v, k) => (k === i ? r.reveal : v)));
      setProblem("");
    } catch (e) {
      setProblem(friendlyError(e));
    }
    setBusy(false);
  };
  const go = (k: number) => { setI(Math.max(0, Math.min(n - 1, k))); setSheet(false); window.scrollTo({ top: 0 }); };
  const toggleMark = () => {
    const on = !marks.has(q.id);
    setMarks((m) => { const c = new Set(m); if (on) c.add(q.id); else c.delete(q.id); return c; });
    setBookmark(q.id, on).catch((e) => setProblem(friendlyError(e)));
  };

  const last = i === n - 1;
  const finish = () => (mode === "tutor" ? submit() : setDialog("submit"));
  // The one main button under every question: check, then move on; the last one ends the set.
  const primary = mode === "tutor" && !reveal && chosen !== null ? { label: busy ? "Checking…" : "Check answer", act: check, strong: true }
    : !last ? { label: mode === "tutor" && !reveal ? "Skip" : "Next", act: () => go(i + 1), strong: mode !== "tutor" || !!reveal }
    : { label: mode === "tutor" ? "Finish" : "Submit", act: finish, strong: true };

  // Keyboard: A–D or 1–4 to answer, Enter for the main button, arrows to move.
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (dialog || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      const o = "abcd".indexOf(k) >= 0 ? "abcd".indexOf(k) : "1234".indexOf(k);
      if (o >= 0 && o < q.options.length) choose(o);
      else if (e.key === "Enter") {
        // Enter is the main button, even with an option still focused from a click. Other focused controls keep their own Enter.
        const t = e.target as HTMLElement;
        if (sheet || (t.closest("button, a") && !t.closest(".opt, .pfoot"))) return;
        e.preventDefault();
        if (!busy) primary.act();
      }
      else if (e.key === "ArrowRight") go(i + 1);
      else if (e.key === "ArrowLeft") go(i - 1);
      else if (e.key === "Escape") setSheet(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  // On a phone the explanation opens below the fold: bring its first line into view once the answer is checked.
  const explRef = useRef<HTMLDivElement>(null);
  const shown = useRef<Question | null>(reveal);
  useEffect(() => {
    if (reveal && shown.current !== reveal && explRef.current) {
      const r = explRef.current.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.6) window.scrollBy({ top: r.top - window.innerHeight * 0.35, behavior: "smooth" });
    }
    shown.current = reveal;
  }, [reveal, i]);

  const groups = useMemo(() => subjects.map((s) => ({ s, idx: items.flatMap((x, k) => (x.q.subject === s ? [k] : [])) })).filter((g) => g.idx.length), [items]);
  const low = left !== null && left < 5 * 60;
  const cellState = (k: number) => {
    if (mode !== "tutor") return answers[k] !== null ? " done" : "";
    const r = reveals[k];
    return r ? (r.answer === answers[k] ? " ok" : " no") : "";
  };
  const cellWord = (k: number) => {
    if (mode !== "tutor") return answers[k] !== null ? ", answered" : "";
    const r = reveals[k];
    return r ? (r.answer === answers[k] ? ", correct" : ", wrong") : "";
  };
  const marked = marks.has(q.id);

  return (
    <div className={`player ${mode === "tutor" ? "is-tutor" : "is-timed"}`}>
      <header className="ptop-wrap">
        <div className="ptop dwrap">
          <button type="button" className="pico" aria-label="Exit" title="Exit" onClick={() => (answered ? setDialog("exit") : (window.location.href = "/dashboard"))}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
          <div className="ptitle">
            <b>Question {i + 1} <span className="muted">of {n}</span></b>
            <span className="muted">{modeNames[mode]} · {title}</span>
          </div>
          <div className="ptop-end">
            {left !== null && (
              <span className={`timer${low ? " low" : ""}`} role="timer" aria-label="Time left">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M9 2h6" /></svg>
                {clock(left)}
              </span>
            )}
            <span className="hide-xs"><ThemeToggle /></span>
          </div>
        </div>
        <div className="pbar" role="progressbar" aria-label={mode === "tutor" ? "Questions checked" : "Questions answered"} aria-valuemin={0} aria-valuemax={n} aria-valuenow={answered}><i style={{ width: `${(answered / n) * 100}%` }} /></div>
      </header>

      <div className={`pbody dwrap${mode === "tutor" ? " solo" : ""}`}>
        <main className="pmain">
          {note && i === 0 && <p className="note-chip">{note}</p>}
          {problem && <p className="note-bad" role="alert">{problem}</p>}
          <Protected user={user}>
            <article className="qcard dcard" aria-labelledby="stem">
              <div className="qmeta">
                <span className="qchip" style={{ background: tone(q.subject) }}>{q.subject}</span>
                <span className="qwhere muted" title={`${q.chapter} · ${q.topic}`}>{q.chapter} · {q.topic}</span>
                <span className="qacts">
                  {mode !== "tutor" && (
                    <button type="button" className={`qact${flagged[i] ? " on" : ""}`} aria-pressed={flagged[i]} title="Come back to this question later" onClick={toggleFlag}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={flagged[i] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true"><path d="M5 21V4h11l-2 4 2 4H5" /></svg>
                      <span>{flagged[i] ? "Flagged" : "Flag"}</span>
                    </button>
                  )}
                  <button type="button" className={`qact${marked ? " on" : ""}`} aria-pressed={marked} title={marked ? "Remove bookmark" : "Save this question"} onClick={toggleMark}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={marked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z" /></svg>
                    <span>{marked ? "Saved" : "Save"}</span>
                  </button>
                </span>
              </div>
              <p id="stem" className="stem">{q.stem}</p>
              <ul className="opts" role="list">
                {q.options.map((o, k) => {
                  const state = reveal ? (k === reveal.answer ? "key" : k === chosen ? "miss" : "dim") : k === chosen ? "on" : "";
                  return (
                    <li key={k}>
                      <button type="button" className={`opt ${state}`} aria-pressed={k === chosen} disabled={!!reveal} onClick={() => choose(k)}>
                        <span className="letter">{letters[k]}</span>
                        <span className="otext">{o}</span>
                        {state === "key" && <span className="omark good"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg><span className="sr">{k === chosen ? "Your answer, correct" : "Correct answer"}</span></span>}
                        {state === "miss" && <span className="omark bad"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg><span className="sr">Your answer</span></span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {reveal && <div ref={explRef}><Explanation q={reveal} chosen={chosen} onReport={() => setDialog("report")} /></div>}
              {!reveal && (
                <p className="qfoot">
                  <span className="kbd-hint muted hide-sm">{mode === "tutor" ? "Press A to D to pick, Enter to check" : "Press A to D to pick, Enter for the next question"}</span>
                  <button type="button" className="link quiet" onClick={() => setDialog("report")}>Report a problem</button>
                </p>
              )}
            </article>
          </Protected>
        </main>

        <aside className={`palette dcard${sheet ? " open" : ""}`} aria-label="All questions" aria-hidden={mode === "tutor" && !sheet ? true : undefined}>
          <div className="pal-h">
            <b>All questions</b>
            <button type="button" className={`link${mode === "tutor" ? "" : " show-sm"}`} onClick={() => setSheet(false)}>Close</button>
          </div>
          {groups.map((g) => (
            <div key={g.s} className="pal-group">
              {groups.length > 1 && <span className="pal-s">{g.s}</span>}
              <div className="pal-grid">
                {g.idx.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={`cell${cellState(k)}${flagged[k] ? " flag" : ""}${k === i ? " now" : ""}`}
                    aria-label={`Question ${k + 1}${cellWord(k)}${flagged[k] ? ", flagged" : ""}`}
                    aria-current={k === i || undefined}
                    onClick={() => go(k)}
                  >{k + 1}</button>
                ))}
              </div>
            </div>
          ))}
          {mode === "tutor" ? (
            <ul className="legend">
              <li><i className="cell ok" />Correct</li>
              <li><i className="cell no" />Wrong</li>
              <li><i className="cell" />Not checked</li>
            </ul>
          ) : (
            <ul className="legend">
              <li><i className="cell done" />Answered</li>
              <li><i className="cell" />Not answered</li>
              <li><i className="cell flag" />Flagged</li>
            </ul>
          )}
          <button type="button" className={`dpill ${mode === "tutor" ? "light" : "dark"}`} disabled={busy} onClick={() => { setSheet(false); finish(); }}>{mode === "tutor" ? "Finish and see results" : "Submit test"}</button>
        </aside>
        {sheet && <button type="button" className="pscrim" aria-label="Close" onClick={() => setSheet(false)} />}
      </div>

      <footer className="pfoot-wrap">
        <div className={`pfoot dwrap${mode === "tutor" ? " solo" : ""}`}>
          <div className="pfoot-in">
            <button type="button" className="dpill light pprev" disabled={i === 0} onClick={() => go(i - 1)} aria-label="Previous question">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14.5 5-7 7 7 7" /></svg>
              <span className="hide-xs">Previous</span>
            </button>
            <button type="button" className={`dpill light pall${mode === "tutor" ? "" : " show-sm"}`} onClick={() => setSheet(true)} aria-label={`All questions, ${answered} of ${n} ${mode === "tutor" ? "checked" : "answered"}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.6" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6" /></svg>
              <span>{i + 1}/{n}</span>
            </button>
            <button type="button" className={`dpill ${primary.strong ? "dark" : "light"} pnext`} disabled={busy} onClick={primary.act}>{primary.label}</button>
          </div>
        </div>
      </footer>

      {dialog === "submit" && (
        <Dialog title="Submit your test?" onClose={() => setDialog(null)}>
          <p className="muted">
            {n - answered ? <><b>{n - answered} unanswered</b> and </> : null}
            <b>{flagged.filter(Boolean).length} flagged</b>. There&apos;s no negative marking, so an answer on every question can only help.
          </p>
          <div className="dlg-actions">
            <button type="button" className="dpill light" onClick={() => setDialog(null)}>Keep going</button>
            <button type="button" className="dpill dark" disabled={busy} onClick={submit}>{busy ? "Submitting…" : "Submit"}</button>
          </div>
        </Dialog>
      )}
      {dialog === "exit" && (
        <Dialog title="Leave this test?" onClose={() => setDialog(null)}>
          <p className="muted">
            Your answers so far are saved. Pick up where you left off from the dashboard{mode !== "tutor" ? ", but the clock keeps running while you're away" : ""}.
          </p>
          <div className="dlg-actions">
            <button type="button" className="dpill light" onClick={() => setDialog(null)}>Stay</button>
            <a className="dpill dark" href="/dashboard" onClick={() => { leaving.current = true; }}>Save and exit</a>
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
export function ReportDialog({ q, onClose }: { q: Pick<Question, "id" | "subject" | "topic">; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await reportQuestion(q.id, reason, details.trim());
      setSent(true);
    } catch (err) {
      setError(friendlyError(err));
    }
    setBusy(false);
  };
  return (
    <Dialog title={sent ? "Thanks, we'll check it" : "Report a problem"} onClose={onClose}>
      {sent ? (
        <>
          <p className="muted">A subject reviewer looks at every report within 48 hours. If the question changes, your stats are corrected.</p>
          <div className="dlg-actions"><button type="button" className="dpill dark" onClick={onClose}>Done</button></div>
        </>
      ) : (
        <form onSubmit={send}>
          <p className="muted small">{q.subject} · {q.topic}</p>
          <fieldset className="radios">
            <legend className="sr">What&apos;s wrong?</legend>
            {reasons.map((r) => (
              <label key={r}><input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} />{r}</label>
            ))}
          </fieldset>
          <label className="fld"><span>Details (optional)</span><textarea rows={3} placeholder="For example: the textbook says…" value={details} onChange={(e) => setDetails(e.target.value)} maxLength={2000} /></label>
          {error && <p className="note-bad" role="alert">{error}</p>}
          <div className="dlg-actions">
            <button type="button" className="dpill light" onClick={onClose}>Cancel</button>
            <button className="dpill dark" disabled={!reason || busy}>{busy ? "Sending…" : "Send report"}</button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
