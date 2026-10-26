"use client";

import { useEffect, useMemo, useState } from "react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { type AdminQuestion, checklist, getAdminQueue, keySpread, type StageId, stages } from "@/lib/admin-data";
import { subjects, syllabus } from "@/lib/bank";
import type { Subject } from "@/lib/dashboard-data";
import { day, letters } from "@/lib/format";

type View = StageId | "all" | "reported";

const stageIndex = (s: StageId) => stages.findIndex((x) => x.id === s);

/* /admin — the writers' and reviewers' tool: a queue by quality-check stage, and an editor that shows each question's
   automatic checks, blind solve, textbook checklist, live statistics and student reports.
   Sample data and local state only; staff roles and saving come with the backend. */
export default function AdminScreen() {
  const [qs, setQs] = useState<AdminQuestion[] | null>(null);
  const [view, setView] = useState<View>("review");
  const [subject, setSubject] = useState<Subject | "all">("all");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => { getAdminQueue().then((d) => { setQs(d); setSel(d.find((q) => q.stage === "review")?.id ?? d[0]?.id ?? null); }); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 2600); return () => clearTimeout(t); } }, [toast]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: qs?.length ?? 0, reported: qs?.filter((q) => q.reports.length).length ?? 0 };
    stages.forEach((s) => { c[s.id] = qs?.filter((q) => q.stage === s.id).length ?? 0; });
    return c;
  }, [qs]);

  const list = (qs ?? []).filter((q) =>
    (view === "all" || (view === "reported" ? q.reports.length > 0 : q.stage === view)) &&
    (subject === "all" || q.subject === subject) &&
    (!search || `${q.id} ${q.stem} ${q.topic} ${q.writer}`.toLowerCase().includes(search.toLowerCase())));
  const current = qs?.find((q) => q.id === sel) ?? null;

  const update = (q: AdminQuestion) => setQs((all) => all?.map((x) => (x.id === q.id ? q : x)) ?? null);

  return (
    <div className="dash admin">
      <header className="dnav-wrap">
        <div className="dwrap wide">
          <div className="dnav">
            <span className="admin-brand"><Logo href="/admin" /><span className="badge">Admin</span></span>
            <div className="dnav-end">
              <a className="dpill light small" href="/admin/reveal">Reveal watermark</a>
              <button type="button" className="dpill light small" onClick={() => setToast("CSV import opens a file picker once saving is connected.")}>Import CSV</button>
              <button type="button" className="dpill dark small" onClick={() => setToast("New questions open a blank template once saving is connected.")}>New question</button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="dwrap wide">
        <nav className="stage-tabs" aria-label="Stage">
          {([...stages.map((s) => ({ id: s.id as View, label: s.label })), { id: "reported" as View, label: "Reported" }, { id: "all" as View, label: "All" }]).map((t) => (
            <button key={t.id} type="button" className={`stab${t.id === "reported" ? " rep" : ""}`} aria-pressed={view === t.id} onClick={() => setView(t.id)}>
              {t.label}<span>{counts[t.id]}</span>
            </button>
          ))}
        </nav>

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
              {list.map((q) => (
                <li key={q.id}>
                  <button type="button" className="qrow" aria-current={q.id === sel || undefined} onClick={() => setSel(q.id)}>
                    <span className="qrow-top">
                      <code>{q.id}</code>
                      <span className={`stage s-${q.stage}`}>{stages[stageIndex(q.stage)]!.label}</span>
                      {q.reports.length > 0 && <span className="acc bad">{q.reports.length} report{q.reports.length > 1 ? "s" : ""}</span>}
                      {q.sentBack && <span className="acc warn">Sent back</span>}
                    </span>
                    <span className="qrow-stem">{q.stem}</span>
                    <span className="muted small">{q.subject} · {q.topic} · {q.writer}</span>
                  </button>
                </li>
              ))}
              {qs && !list.length && <li className="muted pad">Nothing in this stage.</li>}
            </ul>
          </aside>

          {current ? <Editor key={current.id} q={current} all={qs!} onChange={update} onToast={setToast} /> : <div className="sk" style={{ height: 480 }} />}
        </div>
      </main>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function Editor({ q: initial, all, onChange, onToast }: { q: AdminQuestion; all: AdminQuestion[]; onChange: (q: AdminQuestion) => void; onToast: (s: string) => void }) {
  const [q, setQ] = useState(initial);
  const [note, setNote] = useState("");
  const [backOpen, setBackOpen] = useState(false);
  const si = stageIndex(q.stage);
  const set = <K extends keyof AdminQuestion>(k: K, v: AdminQuestion[K]) => setQ((x) => ({ ...x, [k]: v }));

  const missing = [
    !q.stem.trim() && "stem",
    q.options.some((o) => !o.trim()) && "an option",
    !q.why.trim() && "the explanation",
    q.options.some((_, i) => i !== q.answer && !q.wrong[i]?.trim()) && "a wrong-option explanation",
    !q.source.trim() && "the source",
  ].filter(Boolean) as string[];
  const spread = keySpread(all);
  const blindMatch = q.blind ? q.blind.answer === q.answer : null;
  const checksDone = q.checks.every(Boolean);
  const canApprove =
    q.stage === "draft" ? missing.length === 0 :
    q.stage === "auto" ? missing.length === 0 && (q.auto?.duplicate ?? 0) < 80 && (q.auto?.plagiarism ?? 0) < 20 :
    q.stage === "blind" ? blindMatch === true :
    q.stage === "review" ? checksDone :
    q.stage !== "live";

  const advance = () => {
    const next = stages[si + 1]!;
    const nq = { ...q, stage: next.id, sentBack: undefined };
    setQ(nq); onChange(nq); onToast(`${q.id} moved to ${next.label}.`);
  };
  const sendBack = () => {
    const nq = { ...q, stage: "draft" as StageId, sentBack: note || "Sent back for changes.", checks: q.checks.map(() => false) };
    setQ(nq); onChange(nq); setBackOpen(false); setNote(""); onToast(`${q.id} sent back to ${q.writer}.`);
  };
  const save = () => { onChange(q); onToast("Saved."); };

  const correctPct = q.stats ? q.stats.dist[q.answer]! : null;
  const topPick = q.stats ? q.stats.topDist.indexOf(Math.max(...q.stats.topDist)) : null;

  return (
    <section className="editor" aria-label={`Question ${q.id}`}>
      <div className="dcard panel">
        <div className="panel-h">
          <h2><code>{q.id}</code></h2>
          <span className="muted">Written by {q.writer} · updated {day(q.updated)}</span>
        </div>
        <ol className="stepper" aria-label="Quality check">
          {stages.map((s, k) => (
            <li key={s.id} className={k < si ? "done" : k === si ? "now" : ""} title={s.step}>
              <i>{k < si ? "✓" : k + 1}</i><span>{s.label}</span>
            </li>
          ))}
        </ol>
        <p className="muted small">{stages[si]!.step}</p>
        {q.sentBack && <p className="note-warn"><b>Sent back:</b> {q.sentBack}</p>}
      </div>

      <div className="editor-cols">
        <div className="dcard panel">
          <h3 className="panel-title">Question</h3>
          <div className="form-grid">
            <label className="fld">
              <span>Subject</span>
              <select value={q.subject} onChange={(e) => { const s = e.target.value as Subject; setQ((x) => ({ ...x, subject: s, chapter: syllabus[s][0]!.chapter })); }}>
                {subjects.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label className="fld">
              <span>Chapter</span>
              <select value={q.chapter} onChange={(e) => set("chapter", e.target.value)}>
                {syllabus[q.subject].map((c) => <option key={c.chapter}>{c.chapter}</option>)}
              </select>
            </label>
            <label className="fld"><span>Topic</span><input value={q.topic} onChange={(e) => set("topic", e.target.value)} /></label>
            <label className="fld">
              <span>Difficulty</span>
              <select value={q.difficulty} onChange={(e) => set("difficulty", e.target.value as AdminQuestion["difficulty"])}>
                <option value="easy">Easy</option><option value="moderate">Moderate</option><option value="hard">Hard</option>
              </select>
            </label>
            <label className="fld span2"><span>Source (textbook, chapter, page)</span><input value={q.source} onChange={(e) => set("source", e.target.value)} /></label>
            <label className="fld span2"><span>Stem</span><textarea rows={3} value={q.stem} onChange={(e) => set("stem", e.target.value)} /></label>
          </div>

          <fieldset className="opts-edit">
            <legend>Options <span className="muted">· pick the key</span></legend>
            {q.options.map((o, k) => (
              <div key={k} className={`oe${k === q.answer ? " key" : ""}`}>
                <label className="oe-key" title="Correct answer">
                  <input type="radio" name="key" checked={k === q.answer} onChange={() => set("answer", k)} />
                  <span>{letters[k]}</span>
                </label>
                <input value={o} aria-label={`Option ${letters[k]}`} onChange={(e) => set("options", q.options.map((x, j) => (j === k ? e.target.value : x)))} />
                {k === q.answer ? (
                  <textarea rows={3} aria-label="Why the key is right" placeholder="Why this is right" value={q.why} onChange={(e) => set("why", e.target.value)} />
                ) : (
                  <textarea rows={2} aria-label={`Why ${letters[k]} is wrong`} placeholder={`Why ${letters[k]} is wrong`} value={q.wrong[k] ?? ""} onChange={(e) => set("wrong", { ...q.wrong, [k]: e.target.value })} />
                )}
              </div>
            ))}
          </fieldset>
        </div>

        <div className="side-checks">
          <div className="dcard panel">
            <h3 className="panel-title">Automatic checks</h3>
            <ul className="checks">
              <Check ok={missing.length === 0} label="All template fields filled" detail={missing.length ? `Missing ${missing.join(", ")}` : undefined} />
              <Check ok={(q.auto?.duplicate ?? 0) < 80} label="Not a duplicate" detail={`Closest match in the bank: ${q.auto?.duplicate ?? 0}%`} />
              <Check ok={(q.auto?.plagiarism ?? 0) < 20} label="No match online" detail={`Highest web match: ${q.auto?.plagiarism ?? 0}%`} />
              <Check ok={Math.max(...spread) < 40} label="No key-position bias" detail={`Keys in bank: ${spread.map((p, i) => `${letters[i]} ${p}%`).join(" · ")}`} />
            </ul>
          </div>

          <div className="dcard panel">
            <h3 className="panel-title">Blind solve</h3>
            {q.blind ? (
              <p className={blindMatch ? "note-good" : "note-bad"}>
                {q.blind.by} answered <b>{letters[q.blind.answer]}</b> without seeing the key.{" "}
                {blindMatch ? "Matches the key." : `The key is ${letters[q.answer]}: send it back to the writer.`}
              </p>
            ) : (
              <p className="muted">{si < 2 ? "Comes after the automatic checks." : "Waiting for a second expert."}</p>
            )}
          </div>

          <div className="dcard panel">
            <h3 className="panel-title">Reviewer checklist</h3>
            <ul className="checklist">
              {checklist.map((c, k) => (
                <li key={c}>
                  <label>
                    <input type="checkbox" checked={q.checks[k]} disabled={q.stage !== "review"} onChange={() => set("checks", q.checks.map((x, j) => (j === k ? !x : x)))} />
                    {c}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {q.stats && (
            <div className="dcard panel">
              <div className="panel-h"><h3 className="panel-title">Live statistics</h3><span className="muted small">{q.stats.attempts.toLocaleString("en-GB")} answers</span></div>
              <ul className="dist">
                {q.options.map((_, k) => (
                  <li key={k} className={k === q.answer ? "key" : ""}>
                    <span>{letters[k]}</span>
                    <span className="meter"><i style={{ width: `${q.stats!.dist[k]}%` }} /></span>
                    <b>{q.stats!.dist[k]}%</b>
                  </li>
                ))}
              </ul>
              {correctPct! < 20 && <p className="note-bad">Under 20% answer correctly: flag for review.</p>}
              {topPick !== q.answer && <p className="note-bad">Top scorers prefer {letters[topPick!]} over the key: flag for review.</p>}
              {correctPct! >= 20 && topPick === q.answer && <p className="note-good">Top scorers pick the key ({q.stats.topDist[q.answer]}%).</p>}
            </div>
          )}

          {q.reports.length > 0 && (
            <div className="dcard panel">
              <div className="panel-h"><h3 className="panel-title">Student reports</h3><span className="muted small">{q.reports.length} open · 3 hides the question</span></div>
              <ul className="reports">
                {q.reports.map((r) => (
                  <li key={r.id}>
                    <b>{r.reason}</b>
                    <p>&ldquo;{r.text}&rdquo;</p>
                    <span className="muted small">{r.by} · {day(r.date)}</span>
                    <div className="rep-act">
                      <button type="button" className="link" onClick={() => { const nq = { ...q, reports: q.reports.filter((x) => x.id !== r.id) }; setQ(nq); onChange(nq); onToast("Report closed, student notified: question is correct."); }}>Question is correct</button>
                      <button type="button" className="link" onClick={() => setBackOpen(true)}>Fix question</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="action-bar dcard">
        {backOpen ? (
          <>
            <input className="grow" autoFocus placeholder={`Note for ${q.writer}`} value={note} onChange={(e) => setNote(e.target.value)} />
            <button type="button" className="dpill light small" onClick={() => setBackOpen(false)}>Cancel</button>
            <button type="button" className="dpill dark small" onClick={sendBack}>Send back</button>
          </>
        ) : (
          <>
            <button type="button" className="dpill light small" onClick={save}>Save</button>
            <span className="grow" />
            {q.stage !== "draft" && <button type="button" className="dpill light small" onClick={() => setBackOpen(true)}>Send back to writer</button>}
            {q.stage !== "live" && (
              <button type="button" className="dpill dark small" disabled={!canApprove} onClick={advance} title={canApprove ? undefined : "Finish this stage first"}>
                {q.stage === "draft" ? "Submit for checks" : `Approve to ${stages[si + 1]!.label}`}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Check({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
  return (
    <li className={ok ? "ok" : "fail"}>
      <i aria-hidden="true">{ok ? "✓" : "!"}</i>
      <span><b>{label}</b>{detail && <span className="muted small">{detail}</span>}</span>
      <span className="sr">{ok ? "passed" : "failed"}</span>
    </li>
  );
}
