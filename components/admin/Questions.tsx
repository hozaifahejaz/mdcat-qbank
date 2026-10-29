"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageHead } from "@/components/app/AppShell";
import Empty from "@/components/app/Empty";
import { friendlyError } from "@/lib/auth";
import {
  type AdminQuestion, type LogEntry, type QuestionPage, actionNames, advanceQuestion, blindSolve, deleteQuestion, discardEdit, getQuestion, listQuestions,
  questionLog, saveQuestion, sendBack, setQuestionMeta,
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
  const [page, setPage] = useState<QuestionPage | null>(null);
  const [err, setErr] = useState("");
  const [view, setView] = useState<View>("all");
  const [subject, setSubject] = useState<Subject | "all">("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  // The open question when it isn't on the loaded page (opened by link, or just moved out of the current tab).
  const [extra, setExtra] = useState<AdminQuestion | null>(null);
  const [more, setMore] = useState(false);
  const [toast, setToast] = useState("");
  const first = useRef(true);

  // The queue is filtered and paged on the server, 50 at a time, so it stays quick with thousands of questions.
  const filters = useMemo(() => ({ view, subject: subject === "all" ? "" : subject, q: query }), [view, subject, query]);
  const load = useCallback(() => listQuestions({ ...filters, offset: 0 }).then((d) => { setPage(d); setErr(""); return d; }, (e) => { setErr(friendlyError(e)); return null; }), [filters]);
  const loadMore = async () => {
    if (!page) return;
    setMore(true);
    try {
      const d = await listQuestions({ ...filters, offset: page.questions.length });
      setPage({ ...d, questions: [...page.questions, ...d.questions.filter((q) => !page.questions.some((x) => x.id === q.id))] });
    } catch (e) { setErr(friendlyError(e)); } finally { setMore(false); }
  };

  useEffect(() => { const t = setTimeout(() => setQuery(search.trim()), 300); return () => clearTimeout(t); }, [search]);

  useEffect(() => {
    if (first.current) {
      // First load: honour ?stage=, ?id= and ?new= from links on the overview and elsewhere.
      first.current = false;
      const p = new URLSearchParams(window.location.search);
      const st = p.get("stage") as View | null;
      if (st && st !== view && (st === "all" || st === "mine" || stages.some((s) => s.id === st))) { setView(st); return; }
      const id = p.get("id");
      if (p.get("new")) setSel("new");
      else if (id) { setSel(id); getQuestion(id).then(setExtra, (e) => setErr(friendlyError(e))); }
      load().then((d) => { if (d && !p.get("new") && !id) setSel(d.questions[0]?.id ?? null); });
      return;
    }
    load().then((d) => setSel((s) => s ?? d?.questions[0]?.id ?? null));
  }, [load]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3200); return () => clearTimeout(t); } }, [toast]);

  const list = page?.questions ?? [];
  const current = sel === "new" ? null : list.find((q) => q.id === sel) ?? (extra?.id === sel ? extra : null);

  const changed = async (q: AdminQuestion | null, message: string) => {
    setExtra(q);
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
              {t.label}<span>{page?.counts[t.id] ?? 0}</span>
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
            {page && !list.length && sel !== "new" && <li className="muted pad">Nothing here.</li>}
          </ul>
          {page?.hasMore && <button type="button" className="dpill light small more" disabled={more} onClick={loadMore}>{more ? "Loading" : `Load more (${page.total - list.length} left)`}</button>}
        </aside>

        {sel === "new" ? <Editor key="new" user={user} q={null} spread={page?.spread} onChanged={changed} />
          : current ? <Editor key={current.id + current.updatedAt} user={user} q={current} spread={page?.spread} onChanged={changed} />
          : page && !page.counts.all ? (
            <section className="dcard panel">
              <Empty title="No questions yet" text="Write the first one. Each question goes through the automatic checks, a blind solve by someone else, the textbook checklist and an admin's sign-off before students see it.">
                <button type="button" className="dpill dark small" onClick={() => setSel("new")}>New question</button>
              </Empty>
            </section>
          )
          : page ? <section className="dcard panel"><Empty title="Pick a question" text="Choose one from the list to read or edit it." /></section>
          : <div className="sk" style={{ height: 480 }} />}
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function Editor({ user, q, spread, onChanged }: {
  user: AccountUser; q: AdminQuestion | null; spread: QuestionPage["spread"] | undefined;
  onChanged: (q: AdminQuestion | null, message: string) => Promise<void>;
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

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setErr("");
    try { await fn(); } catch (e) { setErr(friendlyError(e)); } finally { setBusy(false); }
  };

  const save = () => run(async () => {
    if (q && stage !== "draft" && !confirm(
      q.liveCopy || stage === "beta" || stage === "live"
        ? `Saving sends ${q.id} back to draft to be checked again. Students keep seeing the version that passed until the new one goes live. Save anyway?`
        : `Saving changes sends ${q.id} back to draft, and it goes through every check again. Save anyway?`,
    )) return;
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

  const discard = () => run(async () => {
    if (!confirm(`Throw away the edit to ${q!.id} and put back the ${stageLabel(q!.liveCopy!)} version students see?`)) return;
    const res = await discardEdit(q!.id);
    await onChanged(res, `Edit discarded. ${res.id} is back to ${stageLabel(res.stage)}.`);
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
        {q?.liveCopy && <p className="note-warn">This is an edit of a {stageLabel(q.liveCopy).toLowerCase()} question. Students keep seeing the version that passed until this one goes live again.</p>}
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
                {spread && spread.known >= 20
                  ? <Check ok={Math.max(...spread.pct) < 40} label="No key-position bias in the bank" detail={`Keys: ${spread.pct.map((p, i) => `${letters[i]} ${p}%`).join(" · ")}`} />
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

            {q && user.role === "admin" && <Publishing q={q} onChanged={onChanged} />}

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
              {q && stage === "draft" && !q.liveCopy && (user.role === "admin" || mine) && <button type="button" className="dpill light small danger" disabled={busy} onClick={remove}>Delete</button>}
              {q?.liveCopy && staffReviewer && <button type="button" className="dpill light small" disabled={busy} onClick={discard}>Discard edit</button>}
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

/* Admins only: whether the question is in the free set, and the past paper it was rebuilt from. Neither changes the
   question itself, so neither needs a re-check. */
function Publishing({ q, onChanged }: { q: AdminQuestion; onChanged: (q: AdminQuestion | null, message: string) => Promise<void> }) {
  const [free, setFree] = useState(q.free);
  const [paper, setPaper] = useState(q.paper ? String(q.paper) : "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const dirty = free !== q.free || paper !== (q.paper ? String(q.paper) : "");
  const save = async () => {
    setBusy(true); setErr("");
    try {
      const res = await setQuestionMeta(q.id, free, paper ? Number(paper) : null);
      await onChanged(res, `Publishing details saved for ${res.id}.`);
    } catch (e) { setErr(friendlyError(e)); setBusy(false); }
  };
  const year = new Date().getFullYear();
  return (
    <div className="dcard panel">
      <h3 className="panel-title">Publishing</h3>
      <label className="pub-row"><input type="checkbox" checked={free} onChange={(e) => setFree(e.target.checked)} /> In the free set</label>
      <label className="fld">
        <span>Past paper</span>
        <select value={paper} onChange={(e) => setPaper(e.target.value)}>
          <option value="">Not from a past paper</option>
          {Array.from({ length: 12 }, (_, i) => year - i).map((y) => <option key={y} value={y}>PMDC {y}</option>)}
        </select>
      </label>
      {err && <p className="note-bad" role="alert">{err}</p>}
      <div><button type="button" className="dpill dark small" disabled={busy || !dirty} onClick={save}>Save</button></div>
    </div>
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
