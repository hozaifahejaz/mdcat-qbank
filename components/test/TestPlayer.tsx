"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Explanation, { AnsweredOptions, ResultStrip } from "@/components/test/Explanation";
import Protected from "@/components/test/Protected";
import ThemeToggle from "@/components/ThemeToggle";
import { ApiError } from "@/lib/api";
import { friendlyError } from "@/lib/auth";
import { subjects } from "@/lib/bank";
import { clock, letters } from "@/lib/format";
import { type OpenAttempt, type Stats, checkAnswer, finishTest, reportQuestion, saveAnswer, setBookmark } from "@/lib/study";
import type { Question } from "@/lib/bank";
import type { AccountUser } from "@/lib/user";

const SIZE_KEY = "q-text-size";
const sizeNames = ["Normal", "Large", "Larger"];
const HOLD_MS = 450;

type Props = { user: AccountUser; attempt: OpenAttempt; note?: string };

/* One screen for every way of answering questions: the question and its options on a plain page, a thin bar on top,
   and Previous, Navigator and Next pinned to the bottom. Every answer is saved on the server as it's picked, so
   leaving, refreshing or switching device carries on where the student was.
   tutor: Submit under the options shows the answer and its explanation straight away.
   timed / mock: answers and explanations only on the results page. Either can run on the server's clock. */
export default function TestPlayer({ user, attempt, note }: Props) {
  const { mode, title, items } = attempt;
  const n = items.length;
  const tutor = mode === "tutor";
  const [i, setI] = useState(() => Math.max(0, items.findIndex((x) => x.answer === null && !x.checked)));
  const [answers, setAnswers] = useState<(number | null)[]>(() => items.map((x) => x.answer));
  const [flagged, setFlagged] = useState<boolean[]>(() => items.map((x) => x.flagged));
  const [reveals, setReveals] = useState<(Question | null)[]>(() => items.map((x) => x.reveal));
  const [stats, setStats] = useState<(Stats | null)[]>(() => items.map((x) => x.stats));
  const [marks, setMarks] = useState<Set<string>>(() => new Set(items.filter((x) => x.bookmarked).map((x) => x.q.id)));
  const [now, setNow] = useState(() => Date.now());
  const [sheet, setSheet] = useState(false);
  const [dialog, setDialog] = useState<null | "submit" | "exit" | "report">(null);
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef(0);
  // Options the student has ruled out, per question. A thinking aid only: nothing is saved or marked.
  const [struck, setStruck] = useState<Record<number, number[]>>({});
  const [size, setSize] = useState(0);
  useEffect(() => { try { setSize(Math.min(2, Math.max(0, Number(localStorage.getItem(SIZE_KEY)) || 0))); } catch {} }, []);
  const nextSize = () => { const v = (size + 1) % 3; setSize(v); try { localStorage.setItem(SIZE_KEY, String(v)); } catch {} };

  // Seconds spent on each question while it was on screen and still open to answer.
  const spent = useRef<number[]>(items.map((x) => x.seconds ?? 0));
  const since = useRef(Date.now());
  const [times, setTimes] = useState<number[]>(() => spent.current.slice());

  // The clock is the server's: the deadline it set, corrected for how far this device's clock is off.
  const skew = useMemo(() => attempt.now - Date.now(), [attempt.now]);
  const left = attempt.deadlineAt === null ? null : Math.max(0, Math.round((attempt.deadlineAt - (now + skew)) / 1000));
  const item = items[i]!;
  const q = item.q;
  const chosen = answers[i] ?? null;
  const reveal = tutor ? reveals[i] : null;
  const answered = tutor ? reveals.filter(Boolean).length : answers.filter((a) => a !== null).length;
  const modeName = mode === "mock" ? "Mock" : tutor ? (left === null ? "Tutor" : "Timed tutor") : left === null ? "Test" : "Timed test";

  /* Adds the time since the question came up to its total, and starts counting again from now. */
  const tally = (k: number, counts: boolean) => {
    const t = Date.now();
    if (counts) spent.current[k] = (spent.current[k] ?? 0) + Math.min(600, (t - since.current) / 1000);
    since.current = t;
    return Math.max(1, Math.round(spent.current[k] ?? 0));
  };

  const leaving = useRef(false);
  const submit = useCallback(async () => {
    if (leaving.current) return;
    leaving.current = true;
    setBusy(true);
    try {
      const done = await finishTest(attempt.id);
      // Nothing was checked, so there's no result to show.
      window.location.href = done.empty ? "/practice" : `/review?id=${encodeURIComponent(attempt.id)}`;
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
    saveAnswer(attempt.id, items[k]!.idx, answer, flag, tally(k, !reveals[k]))
      .then(() => setProblem(""))
      .catch((e) => {
        if (e instanceof ApiError && (e.code === "time_up" || e.code === "finished")) {
          leaving.current = true;
          window.location.href = `/review?id=${encodeURIComponent(attempt.id)}`;
        } else if (!(e instanceof ApiError && e.code === "locked")) setProblem(`Your last answer didn't save. ${friendlyError(e)}`);
      })
      .finally(() => { pending.current--; });
  };

  const out = struck[i] ?? [];
  const strike = (o: number) => {
    if (reveal || busy) return;
    const on = !out.includes(o);
    setStruck((m) => ({ ...m, [i]: on ? [...out, o] : out.filter((x) => x !== o) }));
    // Ruling out the picked option unpicks it.
    if (on && chosen === o) {
      setAnswers((a) => a.map((x, k) => (k === i ? null : x)));
      if (!tutor) save(i, null, flagged[i]!);
    }
  };
  // Press and hold on a touch screen crosses an option out; the tap that follows the hold must not pick it.
  const hold = useRef<{ t: ReturnType<typeof setTimeout> | null; fired: boolean }>({ t: null, fired: false });
  const holdStart = (o: number, e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    hold.current.fired = false;
    hold.current.t = setTimeout(() => { hold.current.fired = true; strike(o); navigator.vibrate?.(12); }, HOLD_MS);
  };
  const holdEnd = () => { if (hold.current.t) clearTimeout(hold.current.t); hold.current.t = null; };

  const choose = (o: number) => {
    if (reveal || busy) return;
    if (hold.current.fired) { hold.current.fired = false; return; }
    if (out.includes(o)) setStruck((m) => ({ ...m, [i]: out.filter((x) => x !== o) }));
    const next = chosen === o && !tutor ? null : o;
    setAnswers((a) => a.map((x, k) => (k === i ? next : x)));
    if (!tutor) save(i, next, flagged[i]!);
  };
  const toggleFlag = () => {
    const f = !flagged[i];
    setFlagged((x) => x.map((v, k) => (k === i ? f : v)));
    if (!reveal) save(i, answers[i] ?? null, f);
  };
  const check = async () => {
    if (chosen === null || reveal) return;
    setBusy(true);
    try {
      const secs = tally(i, true);
      const r = await checkAnswer(attempt.id, item.idx, chosen, secs);
      setAnswers((a) => a.map((x, k) => (k === i ? r.answer : x)));
      setReveals((x) => x.map((v, k) => (k === i ? r.reveal : v)));
      setStats((x) => x.map((v, k) => (k === i ? r.stats : v)));
      setTimes((t) => t.map((v, k) => (k === i ? secs : v)));
      setProblem("");
    } catch (e) {
      setProblem(friendlyError(e));
    }
    setBusy(false);
  };
  const go = (k: number) => {
    tally(i, !reveals[i]);
    setI(Math.max(0, Math.min(n - 1, k)));
    setSheet(false);
    window.scrollTo({ top: 0 });
  };
  const toggleMark = () => {
    const on = !marks.has(q.id);
    setMarks((m) => { const c = new Set(m); if (on) c.add(q.id); else c.delete(q.id); return c; });
    setBookmark(q.id, on).catch((e) => setProblem(friendlyError(e)));
  };

  const last = i === n - 1;
  const finish = () => (tutor ? submit() : setDialog("submit"));
  const canSubmit = tutor && !reveal && chosen !== null;

  // Keyboard: A–D or 1–4 to answer, Enter to submit then move on, arrows to move.
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (dialog || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      const o = "abcd".indexOf(k) >= 0 ? "abcd".indexOf(k) : "1234".indexOf(k);
      if (o >= 0 && o < q.options.length) choose(o);
      else if (e.key === "Enter") {
        // Enter submits and then moves on, even with an option still focused from a click. Other focused controls keep their own Enter.
        const t = e.target as HTMLElement;
        if (sheet || (t.closest("button, a") && !t.closest(".opt, .pfoot, .qsubmit"))) return;
        e.preventDefault();
        if (busy) return;
        if (canSubmit) check();
        else if (!last) go(i + 1);
        else if (!tutor || reveal) finish();
      }
      else if (e.key === "ArrowRight") go(i + 1);
      else if (e.key === "ArrowLeft") go(i - 1);
      else if (e.key === "Escape") setSheet(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  // The result opens under the options: bring it into view on a small screen once the answer is submitted.
  const resultRef = useRef<HTMLDivElement>(null);
  const shown = useRef<Question | null>(reveal);
  useEffect(() => {
    if (reveal && shown.current !== reveal && resultRef.current) {
      const r = resultRef.current.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.6) window.scrollBy({ top: r.top - window.innerHeight * 0.4, behavior: "smooth" });
    }
    shown.current = reveal;
  }, [reveal, i]);

  const groups = useMemo(() => subjects.map((s) => ({ s, idx: items.flatMap((x, k) => (x.q.subject === s ? [k] : [])) })).filter((g) => g.idx.length), [items]);
  const low = left !== null && left < 5 * 60;
  const cellState = (k: number) => {
    if (!tutor) return answers[k] !== null ? " done" : "";
    const r = reveals[k];
    return r ? (r.answer === answers[k] ? " ok" : " no") : "";
  };
  const cellWord = (k: number) => {
    if (!tutor) return answers[k] !== null ? ", answered" : "";
    const r = reveals[k];
    return r ? (r.answer === answers[k] ? ", correct" : ", wrong") : "";
  };
  const marked = marks.has(q.id);

  return (
    <div className={`player ${tutor ? "is-tutor" : "is-timed"} qsize-${size}`}>
      <header className="ptop-wrap">
        <div className="ptop dwrap">
          <button type="button" className="pbtn" onClick={() => (answered ? setDialog("exit") : (window.location.href = "/dashboard"))}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
            <span>Exit</span>
          </button>
          <div className="ptitle">
            <b>{i + 1} <span className="muted">of {n}</span></b>
            <span className="muted hide-xs">{modeName} · {title}</span>
          </div>
          <div className="ptop-end">
            {left !== null && (
              <span className={`timer${low ? " low" : ""}`} role="timer" aria-label="Time left">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M9 2h6" /></svg>
                {clock(left)}
              </span>
            )}
            <button type="button" className="pbtn ptext" onClick={nextSize} aria-label={`Text size: ${sizeNames[size]}. Change`} title="Text size">
              <span aria-hidden="true">A<small>A</small></span>
            </button>
            <span className="hide-xs"><ThemeToggle /></span>
          </div>
        </div>
        <div className="pbar" role="progressbar" aria-label={tutor ? "Questions answered" : "Questions answered"} aria-valuemin={0} aria-valuemax={n} aria-valuenow={answered}><i style={{ width: `${(answered / n) * 100}%` }} /></div>
      </header>

      <main className="pbody dwrap">
        {note && i === 0 && <p className="note-chip">{note}</p>}
        {problem && <p className="note-bad" role="alert">{problem}</p>}
        <Protected user={user}>
          <article className="qpage" aria-labelledby="stem">
            <div className="qhead">
              <h1 className="qno">Question {i + 1}</h1>
              <span className="qacts">
                <button type="button" className={`qact${flagged[i] ? " on" : ""}`} aria-pressed={flagged[i]} title="Come back to this question later" onClick={toggleFlag}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={flagged[i] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true"><path d="M5 21V4h11l-2 4 2 4H5" /></svg>
                  <span>{flagged[i] ? "Flagged" : "Flag"}</span>
                </button>
                <button type="button" className={`qact${marked ? " on" : ""}`} aria-pressed={marked} title={marked ? "Remove mark" : "Mark this question to find it again"} onClick={toggleMark}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={marked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z" /></svg>
                  <span>{marked ? "Marked" : "Mark"}</span>
                </button>
              </span>
            </div>
            <p id="stem" className="stem">{q.stem}</p>

            {reveal ? (
              <AnsweredOptions q={reveal} chosen={chosen} stats={stats[i]} />
            ) : (
              <ul className="opts" role="list">
                {q.options.map((o, k) => {
                  const state = k === chosen ? "on" : out.includes(k) ? "out" : "";
                  return (
                    <li key={k}>
                      <button type="button" className={`opt ${state}`} aria-pressed={k === chosen} onClick={() => choose(k)}
                        onContextMenu={(e) => { e.preventDefault(); if (!hold.current.fired && !hold.current.t) strike(k); }}
                        onPointerDown={(e) => holdStart(k, e)} onPointerUp={holdEnd} onPointerLeave={holdEnd} onPointerCancel={holdEnd}>
                        <span className="omark" />
                        <span className="oradio" aria-hidden="true" />
                        <span className="oletter">{letters[k]}.</span>
                        <span className="otext">{o}{state === "out" && <span className="sr"> (crossed out)</span>}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {tutor && !reveal && (
              <div className="qsubmit-row">
                <button type="button" className="dpill dark qsubmit" disabled={chosen === null || busy} onClick={check}>{busy ? "Checking…" : "Submit"}</button>
              </div>
            )}

            {reveal && (
              <div ref={resultRef} className="qresult">
                <ResultStrip q={reveal} chosen={chosen} stats={stats[i]} seconds={times[i]} />
                <Explanation q={reveal} chosen={chosen} onReport={() => setDialog("report")} />
              </div>
            )}

            {!reveal && (
              <p className="qfoot">
                <span className="kbd-hint muted hide-sm">A to D to pick · Enter to {tutor ? "submit" : "move on"} · right-click to cross out</span>
                <span className="kbd-hint muted show-sm">Hold an option to cross it out</span>
                <button type="button" className="link quiet" onClick={() => setDialog("report")}>Report a problem</button>
              </p>
            )}
          </article>
        </Protected>
      </main>

      <aside className={`palette dcard${sheet ? " open" : ""}`} aria-label="Navigator" aria-hidden={!sheet || undefined}>
        <div className="pal-h">
          <b>Navigator</b>
          <button type="button" className="link" onClick={() => setSheet(false)}>Close</button>
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
        {tutor ? (
          <ul className="legend">
            <li><i className="cell ok" />Correct</li>
            <li><i className="cell no" />Incorrect</li>
            <li><i className="cell" />Not answered</li>
            <li><i className="cell flag" />Flagged</li>
          </ul>
        ) : (
          <ul className="legend">
            <li><i className="cell done" />Answered</li>
            <li><i className="cell" />Not answered</li>
            <li><i className="cell flag" />Flagged</li>
          </ul>
        )}
        <button type="button" className="dpill dark" disabled={busy} onClick={() => { setSheet(false); finish(); }}>End test and see results</button>
      </aside>
      {sheet && <button type="button" className="pscrim" aria-label="Close" onClick={() => setSheet(false)} />}

      <footer className="pfoot-wrap">
        <div className="pfoot dwrap">
          <button type="button" className="pnavb" disabled={i === 0} onClick={() => go(i - 1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
            Previous
          </button>
          <button type="button" className="pnavb pall" onClick={() => setSheet(true)} aria-expanded={sheet}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.6" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6" /></svg>
            Navigator
          </button>
          {last ? (
            <button type="button" className="pnavb pnext main" disabled={busy} onClick={finish}>End test</button>
          ) : (
            <button type="button" className={`pnavb pnext${!tutor || reveal ? " main" : ""}`} onClick={() => go(i + 1)}>
              Next
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          )}
        </div>
      </footer>

      {dialog === "submit" && (
        <Dialog title="End this test?" onClose={() => setDialog(null)}>
          <p className="muted">
            {n - answered ? <><b>{n - answered} not answered</b> and </> : null}
            <b>{flagged.filter(Boolean).length} flagged</b>. There&apos;s no negative marking, so an answer on every question can only help.
          </p>
          <div className="dlg-actions">
            <button type="button" className="dpill light" onClick={() => setDialog(null)}>Keep going</button>
            <button type="button" className="dpill dark" disabled={busy} onClick={submit}>{busy ? "Ending…" : "End test"}</button>
          </div>
        </Dialog>
      )}
      {dialog === "exit" && (
        <Dialog title="Leave this test?" onClose={() => setDialog(null)}>
          <p className="muted">
            Your answers so far are saved. Pick up where you left off from the dashboard{left !== null ? ", but the clock keeps running while you're away" : ""}.
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
