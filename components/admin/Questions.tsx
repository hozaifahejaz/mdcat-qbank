"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHead } from "@/components/app/AppShell";
import Empty from "@/components/app/Empty";
import { friendlyError } from "@/lib/auth";
import {
  type AdminQuestion, type LogEntry, actionNames, advanceQuestion, blindSolve, deleteQuestion, keySpread, listQuestions, questionLog, saveQuestion, sendBack,
} from "@/lib/admin";
import { subjects, syllabus } from "@/lib/bank";
import type { Subject } from "@/lib/dashboard-data";
import { day, letters } from "@/lib/format";
import { DUPLICATE_LIMIT, type QuestionFields, type StageId, checklist, missingFields, stageLabel, stages } from "@/lib/qc";
import type { AccountUser } from "@/lib/user";

type View = StageId | "all" | "mine";
const stageIndex = (s: StageId) => stages.findIndex((x) => x.id === s);

const blank = (): QuestionFields => ({
  subject: "Biology", chapter: syllabus.Biology[0]!, topic: "", difficulty: "moderate", source: "", stem: "",
  options: ["", "", "", ""], answer: 0, why: "", wrong: {},
});
const fieldsOf = (q: AdminQuestion): QuestionFields => ({
  subject: q.subject, chapter: q.chapter, topic: q.topic, difficulty: q.difficulty, source: q.source, stem: q.stem,
  options: [...q.options], answer: q.answer ?? 0, why: q.why, wrong: { ...q.wrong },
});

/* /admin/questions — the writers' and reviewers' tool. A queue by quality-check stage, and an editor that runs each
   question through the check in docs/plan.md: template complete and not a duplicate, a blind solve by someone other
   than the writer, the textbook checklist, an admin's sign-off, beta, then live. The server enforces every step. */
export default function Questions({ user }: { user: AccountUser }) {
  const [qs, setQs] = useState<AdminQuestion[] | null>(null);
  const [err, setErr] = useState("");
  const [view, setView] = useState<View>("all");
  const [subject, setSubject] = useState<Subject | "all">("all");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const load = useCallback(() => listQuestions().then((d) => { setQs(d); return d; }, (e) => { setErr(friendlyError(e)); return null; }), []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const st = p.get("stage") as View | null;
    if (st && (st === "all" || st === "mine" || stages.some((s) => s.id === st))) setView(st);
    load().then((d) => {
      if (p.get("new")) setSel("new");
      else if (p.get("id")) setSel(p.get("id"));
      else if (d) setSel((d.find((q) => !st || st === "all" || q.stage === st) ?? null)?.id ?? null);
    });
  }, [load]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3200); return () => clearTimeout(t); } }, [toast]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: qs?.length ?? 0, mine: qs?.filter((q) => q.writerId === user.id).length ?? 0 };
    stages.forEach((s) => { c[s.id] = qs?.filter((q) => q.stage === s.id).length ?? 0; });
    return c;
  }, [qs, user.id]);

  const list = (qs ?? []).filter((q) =>
    (view === "all" || (view === "mine" ? q.writerId === user.id : q.stage === view)) &&
    (subject === "all" || q.subject === subject) &&
    (!search || `${q.id} ${q.stem} ${q.topic} ${q.writer}`.toLowerCase().includes(search.toLowerCase())));
  const current = sel === "new" ? null : qs?.find((q) => q.id === sel) ?? null;

  const changed = async (q: AdminQuestion | null, message: string) => {
    await load();
    setSel(q?.id ?? null);
    setToast(message);
  };

  // The "Auto checks" stage passes straight through, so it has no tab.
  const tabList: { id: View; label: string }[] = [
    { id: "all", label: "All" },
    { id: "mine", label: "Mine" },
    ...stages.filter((s) => s.id !== "auto").map((s) => ({ id: s.id as View, label: s.label })),
  ];

  return (
    <div className="dgrid">
      <PageHead title="Questions" sub="Write questions and take each one through the quality check before students see it.">
        <button type="button" className="dpill dark small" onClick={() => setSel("new")}>New question</button>
      </PageHead>
      <div className="q-head">
        <nav className="stage-tabs" aria-label="Stage">
          {tabList.map((t) => (
            <button key={t.id} type="button" className="stab" aria-pressed={view === t.id} onClick={() => setView(t.id)}>
              {t.label}<span>{counts[t.id]}</span>
            </button>
          ))}
        </nav>
      </div>

      {err && <p className="note-bad">{err}</p>}

      <div className="admin-cols">
        <aside className="dcard queue" aria-label="Questions">
          <div className="queue-f">
            <input type="search" placeholder="Search stem, ID, topic, writer" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search" />
            <select value={subject} onChange={(e) => setSubject(e.target.value as Subject | "all")} aria-label="Subject">
              <option value="all">All subjects</option>
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <ul>
            {sel === "new" && (
              <li><button type="button" className="qrow" aria-current="true"><span className="qrow-top"><code>New</code><span className="stage s-draft">Draft</span></span><span className="qrow-stem muted">Not saved yet</span></button></li>
            )}
            {list.map((q) => (
              <li key={q.id}>
                <button type="button" className="qrow" aria-current={q.id === sel || undefined} onClick={() => setSel(q.id)}>
                  <span className="qrow-top">
                    <code>{q.id}</code>
                    <span className={`stage s-${q.stage}`}>{stageLabel(q.stage)}</span>
                    {q.sentBack && q.stage === "draft" && <span className="acc warn">Sent back</span>}
                  </span>
                  <span className="qrow-stem">{q.stem || <span className="muted">No stem yet</span>}</span>
                  <span className="muted small">{q.subject} · {q.topic || q.chapter} · {q.writer}</span>
                </button>
              </li>
            ))}
            {qs && !list.length && sel !== "new" && <li className="muted pad">Nothing here.</li>}
          </ul>
        </aside>

        {sel === "new" ? <Editor key="new" user={user} q={null} all={qs ?? []} onChanged={changed} onToast={setToast} />
          : current ? <Editor key={current.id + current.updatedAt} user={user} q={current} all={qs!} onChanged={changed} onToast={setToast} />
          : qs && !qs.length ? (
            <section className="dcard panel">
              <Empty title="No questions yet" text="Write the first one. Each question goes through the automatic checks, a blind solve by someone else, the textbook checklist and an admin's sign-off before students see it.">
                <button type="button" className="dpill dark small" onClick={() => setSel("new")}>New question</button>
              </Empty>
            </section>
          )
          : qs ? <section className="dcard panel"><Empty title="Pick a question" text="Choose one from the list to read or edit it." /></section>
          : <div className="sk" style={{ height: 480 }} />}
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function Editor({ user, q, all, onChanged, onToast }: {
  user: AccountUser; q: AdminQuestion | null; all: AdminQuestion[];
  onChanged: (q: AdminQuestion | null, message: string) => Promise<void>; onToast: (s: string) => void;
}) {
  const start = q ? fieldsOf(q) : blank();
  const [f, setF] = useState<QuestionFields>(start);
  const [checks, setChecks] = useState<boolean[]>(() => checklist.map((_, i) => q?.stage === "review" ? !!q.checks[i] : false));
  const [note, setNote] = useState("");
  const [backOpen, setBackOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [log, setLog] = useState<LogEntry[] | null>(null);
  const set = <K extends keyof QuestionFields>(k: K, v: QuestionFields[K]) => setF((x) => ({ ...x, [k]: v }));

  useEffect(() => { if (q) questionLog(q.id).then(setLog, () => setLog([])); }, [q]);

  const stage: StageId = q?.stage ?? "draft";
  const si = stageIndex(stage);
  const mine = !q || q.writerId === user.id;
  const staffReviewer = user.role === "admin" || user.role === "reviewer";
  const canEdit = !q?.keyHidden && (staffReviewer || (mine && stage === "draft"));
  const dirty = JSON.stringify(f) !== JSON.stringify(start);
  const missing = missingFields(f);
  const spread = keySpread(all);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setErr("");
    try { await fn(); } catch (e) { setErr(friendlyError(e)); } finally { setBusy(false); }
  };

  const save = () => run(async () => {
    if (q && stage !== "draft" && !confirm(`Saving changes sends ${q.id} back to draft, and it goes through every check again. Save anyway?`)) return;
    const saved = await saveQuestion({ ...f, id: q?.id });
    await onChanged(saved, q ? (saved.stage === stage ? "Saved." : `Saved. ${saved.id} is back in draft.`) : `${saved.id} created as a draft.`);
  });

  const advance = () => run(async () => {
    let id = q?.id;
    if (!q || dirty) id = (await saveQuestion({ ...f, id })).id;
    const res = await advanceQuestion(id!, stage === "review" ? checks : undefined);
    const msg =
      res.stage === "blind" ? `${res.id} passed the automatic checks and is waiting for a blind solve.` :
      res.stage === "draft" ? `${res.id} failed the automatic checks: ${res.sentBack}` :
      `${res.id} moved to ${stageLabel(res.stage)}.`;
    await onChanged(res, msg);
  });

  const doSendBack = () => run(async () => {
    const res = await sendBack(q!.id, note);
    setBackOpen(false);
    await onChanged(res, `${res.id} sent back to ${res.writer}.`);
  });

  const remove = () => run(async () => {
    if (!confirm(`Delete ${q!.id}? This can't be undone.`)) return;
    await deleteQuestion(q!.id);
    await onChanged(null, `${q!.id} deleted.`);
  });

  const primary =
    stage === "draft" ? (mine || user.role === "admin" ? { label: "Submit for checks", ok: missing.length === 0, why: `Fill in ${missing.join(", ")}` } : null) :
    stage === "review" ? (staffReviewer && !mine ? { label: "Checklist passed", ok: checks.every(Boolean), why: "Tick every item first" } : null) :
    stage === "signoff" ? (user.role === "admin" ? { label: "Sign off to beta", ok: true, why: "" } : null) :
    stage === "beta" ? (user.role === "admin" ? { label: "Make live", ok: true, why: "" } : null) :
    null;

  return (
    <section className="editor" aria-label={q ? `Question ${q.id}` : "New question"}>
      <div className="dcard panel">
        <div className="panel-h">
          <h2>{q ? <code>{q.id}</code> : "New question"}</h2>
          {q && <span className="muted">Written by {q.writer}{mine ? " (you)" : ""} · updated {day(q.updatedAt)}</span>}
        </div>
        <ol className="stepper" aria-label="Quality check">
          {stages.map((s, k) => (
            <li key={s.id} className={k < si ? "done" : k === si ? "now" : ""} title={s.step}>
              <i>{k < si ? "✓" : k + 1}</i><span>{s.label}</span>
            </li>
          ))}
        </ol>
        <p className="muted small">{stages[si]!.step}</p>
        {q?.sentBack && stage === "draft" && <p className="note-warn"><b>Sent back:</b> {q.sentBack}</p>}
        {!canEdit && !q?.keyHidden && <p className="muted small">{mine ? "Only reviewers and admins can edit a question once it's submitted." : "Writers can only edit their own drafts."}</p>}
        {err && <p className="note-bad" role="alert">{err}</p>}
      </div>

      {q?.keyHidden ? <BlindSolve q={q} onChanged={onChanged} /> : (
        <div className="editor-cols">
          <div className="dcard panel">
            <h3 className="panel-title">Question</h3>
            <fieldset className="plain" disabled={!canEdit || busy}>
              <div className="form-grid">
                <label className="fld">
                  <span>Subject</span>
                  <select value={f.subject} onChange={(e) => { const s = e.target.value as Subject; setF((x) => ({ ...x, subject: s, chapter: syllabus[s][0]! })); }}>
                    {subjects.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label className="fld">
                  <span>Chapter</span>
                  <select value={f.chapter} onChange={(e) => set("chapter", e.target.value)}>
                    {(syllabus[f.subject as Subject] ?? []).map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label className="fld"><span>Topic</span><input value={f.topic} onChange={(e) => set("topic", e.target.value)} /></label>
                <label className="fld">
                  <span>Difficulty</span>
                  <select value={f.difficulty} onChange={(e) => set("difficulty", e.target.value as QuestionFields["difficulty"])}>
                    <option value="easy">Easy</option><option value="moderate">Moderate</option><option value="hard">Hard</option>
                  </select>
                </label>
                <label className="fld span2"><span>Source (textbook, chapter, page)</span><input value={f.source} placeholder="e.g. Punjab Biology XI, ch. 4, p. 72" onChange={(e) => set("source", e.target.value)} /></label>
                <label className="fld span2"><span>Stem</span><textarea rows={3} value={f.stem} onChange={(e) => set("stem", e.target.value)} /></label>
              </div>

              <div className="opts-edit">
                <p className="legend">Options <span className="muted">· pick the key</span></p>
                {f.options.map((o, k) => (
                  <div key={k} className={`oe${k === f.answer ? " key" : ""}`}>
                    <label className="oe-key" title="Correct answer">
                      <input type="radio" name="key" checked={k === f.answer} onChange={() => set("answer", k)} />
                      <span>{letters[k]}</span>
                    </label>
                    <input value={o} aria-label={`Option ${letters[k]}`} onChange={(e) => set("options", f.options.map((x, j) => (j === k ? e.target.value : x)))} />
                    {k === f.answer ? (
                      <textarea rows={3} aria-label="Why the key is right" placeholder="Why this is right" value={f.why} onChange={(e) => set("why", e.target.value)} />
                    ) : (
                      <textarea rows={2} aria-label={`Why ${letters[k]} is wrong`} placeholder={`Why ${letters[k]} is wrong`} value={f.wrong[k] ?? ""} onChange={(e) => set("wrong", { ...f.wrong, [k]: e.target.value })} />
                    )}
                  </div>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="side-checks">
            <div className="dcard panel">
              <h3 className="panel-title">Automatic checks</h3>
              <ul className="checks">
                <Check ok={missing.length === 0} label="Every template field filled" detail={missing.length ? `Missing ${missing.join(", ")}` : undefined} />
                {q?.duplicate !== null && q?.duplicate !== undefined
                  ? <Check ok={q.duplicate < DUPLICATE_LIMIT} label="Not a duplicate" detail={q.duplicateOf ? `Closest match: ${q.duplicateOf}, ${q.duplicate}% the same words` : "Nothing similar in the bank"} />
                  : <Check ok={null} label="Not a duplicate" detail="Checked against the bank when you submit" />}
                {/* With a handful of questions any split looks lopsided, so this waits for a real sample. */}
                {all.length >= 20
                  ? <Check ok={Math.max(...spread) < 40} label="No key-position bias in the bank" detail={`Keys: ${spread.map((p, i) => `${letters[i]} ${p}%`).join(" · ")}`} />
                  : <Check ok={null} label="No key-position bias in the bank" detail="Checked once the bank has 20 questions" />}
              </ul>
            </div>

            <div className="dcard panel">
              <h3 className="panel-title">Blind solve</h3>
              {q?.blind && q.blind.answer !== null ? (
                <p className="note-good">{q.blind.by} answered <b>{letters[q.blind.answer]}</b> without seeing the key, which matches.</p>
              ) : (
                <p className="muted">{si < 2 ? "After the automatic checks, someone other than the writer answers it without seeing the key. A wrong answer sends it back." : mine ? "Waiting for someone else to solve it. You can't, since you wrote it." : "Waiting."}</p>
              )}
            </div>

            <div className="dcard panel">
              <h3 className="panel-title">Reviewer checklist</h3>
              {stage === "review" && mine && <p className="muted small">Someone other than the writer has to tick these.</p>}
              <ul className="checklist">
                {checklist.map((c, k) => (
                  <li key={c}>
                    <label>
                      <input type="checkbox" checked={si > stageIndex("review") || checks[k]} disabled={stage !== "review" || mine || !staffReviewer} onChange={() => setChecks((x) => x.map((v, j) => (j === k ? !v : v)))} />
                      {c}
                    </label>
                  </li>
                ))}
              </ul>
              {q?.reviewedBy && <p className="muted small">Checked by {q.reviewedBy}{q.signedOffBy ? `, signed off by ${q.signedOffBy}` : ""}.</p>}
            </div>

            {q && (
              <div className="dcard panel">
                <h3 className="panel-title">History</h3>
                {log === null ? <div className="sk" style={{ height: 60 }} /> : (
                  <ul className="activity">
                    {log.map((l, i) => (
                      <li key={i}><span><b>{l.actor ?? "Someone"}</b> · {actionNames[l.action] ?? l.action}{l.detail && <span className="muted"> · {l.detail}</span>}</span><span className="muted small">{day(new Date(l.created_at).toISOString())}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {!q?.keyHidden && (
        <div className="action-bar dcard">
          {backOpen ? (
            <>
              <input className="grow" autoFocus placeholder={`What should ${q!.writer} fix?`} value={note} onChange={(e) => setNote(e.target.value)} />
              <button type="button" className="dpill light small" onClick={() => setBackOpen(false)}>Cancel</button>
              <button type="button" className="dpill dark small" disabled={busy || !note.trim()} onClick={doSendBack}>Send back</button>
            </>
          ) : (
            <>
              {canEdit && <button type="button" className="dpill light small" disabled={busy || (!!q && !dirty)} onClick={save}>{q ? "Save" : "Save draft"}</button>}
              {q && stage === "draft" && (user.role === "admin" || mine) && <button type="button" className="dpill light small danger" disabled={busy} onClick={remove}>Delete</button>}
              <span className="grow" />
              {q && stage !== "draft" && staffReviewer && <button type="button" className="dpill light small" disabled={busy} onClick={() => setBackOpen(true)}>Send back to writer</button>}
              {primary && (
                <button type="button" className="dpill dark small" disabled={busy || !primary.ok} onClick={advance} title={primary.ok ? undefined : primary.why}>{primary.label}</button>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

/* What a reviewer sees while a question waits for its blind solve: the stem and options, no key, no explanations. */
function BlindSolve({ q, onChanged }: { q: AdminQuestion; onChanged: (q: AdminQuestion | null, message: string) => Promise<void> }) {
  const [pick, setPick] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async () => {
    setBusy(true); setErr("");
    try {
      const r = await blindSolve(q.id, pick!);
      await onChanged(r.question, r.match ? `Correct: ${q.id} moves to the checklist.` : `The key is ${letters[r.answer]}, not ${letters[pick!]}. ${q.id} went back to ${q.writer}.`);
    } catch (e) { setErr(friendlyError(e)); setBusy(false); }
  };
  return (
    <div className="dcard panel blind">
      <div className="panel-h"><h3 className="panel-title">Solve it blind</h3><span className="muted small">{q.subject} · {q.chapter} · {q.topic}</span></div>
      <p className="muted">Answer as a student would. The key and explanations stay hidden until you do. If your answer doesn&apos;t match the key, the question goes back to {q.writer}.</p>
      <p className="blind-stem">{q.stem}</p>
      <div className="blind-opts" role="radiogroup" aria-label="Your answer">
        {q.options.map((o, k) => (
          <label key={k} className={`blind-opt${pick === k ? " on" : ""}`}>
            <input type="radio" name="blind" checked={pick === k} onChange={() => setPick(k)} />
            <b>{letters[k]}</b><span>{o}</span>
          </label>
        ))}
      </div>
      {err && <p className="note-bad" role="alert">{err}</p>}
      <div><button type="button" className="dpill dark small" disabled={pick === null || busy} onClick={submit}>Submit my answer</button></div>
    </div>
  );
}

function Check({ ok, label, detail }: { ok: boolean | null; label: string; detail?: string }) {
  return (
    <li className={ok === null ? "wait" : ok ? "ok" : "fail"}>
      <i aria-hidden="true">{ok === null ? "·" : ok ? "✓" : "!"}</i>
      <span><b>{label}</b>{detail && <span className="muted small">{detail}</span>}</span>
      <span className="sr">{ok === null ? "not run yet" : ok ? "passed" : "failed"}</span>
    </li>
  );
}
