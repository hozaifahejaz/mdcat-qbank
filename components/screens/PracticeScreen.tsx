"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell, { PageHead } from "@/components/app/AppShell";
import Icon from "@/components/app/Icon";
import { type Bank, bankById, banks, toneOf } from "@/lib/banks";
import { band, pct } from "@/lib/format";
import { type Catalog, type Filter, type Pool, doneCount, filters, getCatalog, getPool, openCount, poolMatch, testHref, totalCount } from "@/lib/study";

const counts = [10, 25, 50, 100];
const filterNames: Record<Filter, string> = { unused: "Unused", incorrect: "Incorrect", marked: "Marked", omitted: "Omitted", correct: "Correct" };
const nf = (n: number) => n.toLocaleString("en-GB");

export default function PracticeScreen() {
  return <AppShell active="/practice">{() => <Practice />}</AppShell>;
}

const BANK_KEY = "practice-bank";

/* /practice opens Create a test on the bank used last (MDCAT the first time); /practice?bank=fsc1 on that bank. The
   bank tabs on the page switch between them. Older links that name a subject (?subject=Biology&chapter=Enzymes from
   the dashboard) open the MDCAT bank with it ticked. */
function Practice() {
  const [bank, setBank] = useState<Bank | undefined>(undefined);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    let last: string | null = null;
    try { last = localStorage.getItem(BANK_KEY); } catch {}
    const picked = bankById(p.get("bank"));
    const b = picked ?? (p.get("subject") || p.get("mode") ? undefined : bankById(last)) ?? bankById("mdcat")!;
    if (picked) { try { localStorage.setItem(BANK_KEY, picked.id); } catch {} }
    setBank(b);
  }, []);
  if (bank === undefined) return <div className="dgrid" aria-busy="true"><div className="sk" style={{ height: 320 }} /></div>;
  return <BankPractice bank={bank} />;
}

/* The five banks as big buttons. The phone home screen uses the same ones. */
export function BankButtons() {
  return (
    <ul className="bank-grid">
      {banks.map((b) => (
        <li key={b.id}>
          <a className={`bank-btn bank-${b.id}`} href={`/practice?bank=${b.id}`}>
            <span className="bank-mark" aria-hidden="true">{b.short}</span>
            <span className="bank-txt"><b>{b.name}</b><span>{b.blurb}</span></span>
            <span className="bank-go" aria-hidden="true"><Icon name="chevron" size={18} /></span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/* What's ticked: some whole subjects (books), or some chapters of one subject. Nothing ticked means the whole bank. */
type Sel = { kind: "subjects"; set: Set<string> } | { kind: "chapters"; subject: string; set: Set<string> };

function BankPractice({ bank }: { bank: Bank }) {
  const [sel, setSel] = useState<Sel>({ kind: "subjects", set: new Set() });
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const [tutor, setTutor] = useState(true);
  const [timed, setTimed] = useState(false);
  const [count, setCount] = useState(25);
  const [picked, setPicked] = useState<Filter[]>([]);
  const [mine, setMine] = useState<Pool | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const isBook = bank.id === "fsc1" || bank.id === "fsc2";
  const noun = isBook ? "book" : "subject";

  useEffect(() => {
    getCatalog(bank.id).then(setCatalog, () => {});
    const p = new URLSearchParams(window.location.search);
    const s = p.get("subject");
    const c = p.get("chapter");
    if (s && bank.subjects.some((x) => x.name === s)) {
      if (c) { setSel({ kind: "chapters", subject: s, set: new Set([c]) }); setOpen(new Set([s])); }
      else setSel({ kind: "subjects", set: new Set([s]) });
    }
    if (p.get("mode") === "timed") { setTutor(false); setTimed(true); }
    const t = p.get("topic");
    if (t) setTopic(t);
  }, [bank]);

  const subjectNames = bank.subjects.map((s) => s.name);
  const chosenSubjects = sel.kind === "subjects" ? [...sel.set] : [sel.subject];
  const chosenChapters = sel.kind === "chapters" ? [...sel.set] : [];
  const pool = useMemo(() => openCount(catalog, chosenSubjects, chosenChapters), [catalog, sel]); // eslint-disable-line react-hooks/exhaustive-deps
  const locked = totalCount(catalog, chosenSubjects, chosenChapters) - pool;

  function toggleSubject(s: string) {
    setTopic(null);
    setSel((cur) => {
      const set = cur.kind === "subjects" ? new Set(cur.set) : new Set<string>();
      if (set.has(s)) set.delete(s); else set.add(s);
      return { kind: "subjects", set };
    });
  }
  function toggleChapter(s: string, c: string) {
    setTopic(null);
    setSel((cur) => {
      const set = cur.kind === "chapters" && cur.subject === s ? new Set(cur.set) : new Set<string>();
      if (set.has(c)) set.delete(c); else set.add(c);
      const all = bank.subjects.find((x) => x.name === s)!.chapters;
      // Every chapter ticked is the same as the whole book; none ticked is nothing.
      if (set.size === all.length) return { kind: "subjects", set: new Set([s]) };
      if (!set.size) return { kind: "subjects", set: new Set() };
      return { kind: "chapters", subject: s, set };
    });
  }
  const toggleOpen = (s: string) => setOpen((o) => { const n = new Set(o); if (n.has(s)) n.delete(s); else n.add(s); return n; });

  const scope = sel.kind === "chapters" ? { subject: sel.subject, chapters: [...sel.set] }
    : sel.set.size === 1 ? { subject: [...sel.set][0] }
    : sel.set.size > 1 ? { subjects: subjectNames.filter((s) => sel.set.has(s)) } : {};
  const scopeKey = JSON.stringify([bank.id, scope, topic]);

  // Where this student stands on the picked questions: the counts beside each filter.
  useEffect(() => {
    let live = true;
    setMine(null);
    getPool({ bank: bank.id, topic: topic ?? undefined, ...scope }).then((r) => { if (live) setMine(r); }, () => {});
    return () => { live = false; };
  }, [scopeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const match = mine ? poolMatch(mine, picked) : pool;
  const start = Math.min(count, match);
  const href = testHref({ kind: "practice", tutor, timed, bank: bank.id, count, filters: picked, topic: topic ?? undefined, ...scope });
  const toggleFilter = (f: Filter) => setPicked((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));

  const summary = sel.kind === "chapters"
    ? `${sel.subject} · ${sel.set.size === 1 ? [...sel.set][0] : `${sel.set.size} chapters`}`
    : sel.set.size === 0 ? `All ${noun}s`
    : sel.set.size <= 2 ? subjectNames.filter((s) => sel.set.has(s)).join(" + ")
    : `${sel.set.size} ${noun}s`;
  const modeLine = tutor
    ? `Answer and explanation after each question${timed ? ", on the clock" : ""}.`
    : `Answers and explanations at the end${timed ? ", on the clock" : ", no clock"}.`;

  return (
    <div className="dgrid setup-page">
      <PageHead title="Create a test" />

      <nav className="ptabs" aria-label="Question bank">
        {banks.map((b) => (
          <a key={b.id} className="tab" href={`/practice?bank=${b.id}`} aria-current={b.id === bank.id ? "page" : undefined}>{b.name}</a>
        ))}
      </nav>

      <div className="setup-grid">
      <div className="dcard setup su-a">
        <section className="setup-sec" aria-labelledby="mode-h">
          <h2 id="mode-h">Test mode</h2>
          <div className="switches">
            <Switch label="Tutor" on={tutor} onChange={setTutor} />
            <Switch label="Timed" on={timed} onChange={setTimed} />
          </div>
          <p className="muted small">{modeLine}{timed ? " One minute a question." : ""}</p>
        </section>

        <section className="setup-sec" aria-labelledby="q-h">
          <div className="setup-h">
            <h2 id="q-h">Questions</h2>
            {picked.length > 0 ? <button type="button" className="link" onClick={() => setPicked([])}>All questions</button> : <span className="muted small">All questions</span>}
          </div>
          <ul className="fchecks">
            {filters.map((f) => (
              <li key={f}>
                <label>
                  <input type="checkbox" checked={picked.includes(f)} onChange={() => toggleFilter(f)} />
                  <span>{filterNames[f]}</span>
                  <span className="fcount">{mine ? nf(mine[f]) : "…"}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>

      </div>

      <div className="dcard setup su-b">
        <section className="setup-sec" aria-labelledby="ch-h">
          <div className="setup-h">
            <h2 id="ch-h">{isBook ? "Books" : "Subjects"}</h2>
            {(sel.kind === "chapters" || sel.set.size > 0) && <button type="button" className="link" onClick={() => setSel({ kind: "subjects", set: new Set() })}>Clear</button>}
          </div>
          {topic && (
            <p className="note-chip">Topic: <b>{topic}</b> <button type="button" className="link" onClick={() => setTopic(null)}>Remove</button></p>
          )}
          <ul className="booklist">
            {bank.subjects.map((s) => {
              const tone = toneOf(s.name);
              const checked = sel.kind === "subjects" && sel.set.has(s.name);
              const partial = sel.kind === "chapters" && sel.subject === s.name;
              const expanded = open.has(s.name);
              const d = doneCount(catalog, s.name);
              const n = openCount(catalog, s.name);
              return (
                <li key={s.name} className={expanded ? "open" : ""}>
                  <div className="book-row">
                    <label>
                      <input type="checkbox" checked={checked} ref={(el) => { if (el) el.indeterminate = partial; }} onChange={() => toggleSubject(s.name)} />
                      <span className="row-ic" style={{ background: tone.tone, color: tone.solid }}>{s.name[0]}</span>
                      <span className="book-name">
                        <b>{s.name}</b>
                        <span className="muted">{s.chapters.length} chapters{partial ? ` · ${sel.set.size} picked` : ""}</span>
                      </span>
                      <Score n={n} total={totalCount(catalog, s.name)} answered={d.answered} correct={d.correct} />
                    </label>
                    <button type="button" className="icon-btn book-open" aria-expanded={expanded} aria-label={`${expanded ? "Hide" : "Show"} ${s.name} chapters`} onClick={() => toggleOpen(s.name)}>
                      <Icon name="chevron" size={18} />
                    </button>
                  </div>
                  {expanded && (
                    <ul className="picklist chapter-list">
                      {s.chapters.map((c, i) => {
                        const cd = doneCount(catalog, s.name, [c]);
                        return (
                          <li key={c}>
                            <label>
                              <input type="checkbox" checked={checked || (partial && sel.set.has(c))} onChange={() => toggleChapter(s.name, c)} />
                              <span className="pk-name">{isBook && <span className="muted pk-no">{i + 1}.</span>}{c}</span>
                              <Score n={openCount(catalog, s.name, [c])} total={totalCount(catalog, s.name, [c])} answered={cd.answered} correct={cd.correct} />
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

      </div>

      <div className="dcard setup su-c">
        <section className="setup-sec" aria-labelledby="n-h">
          <h2 id="n-h">Number of questions</h2>
          <div className="chips big">
            {counts.map((c) => <button key={c} type="button" className="chip" aria-pressed={count === c} onClick={() => setCount(c)}>{c}</button>)}
          </div>
          {catalog && !catalog.paid && locked > 0 && <p className="muted small">Free plan: {nf(pool)} of {nf(pool + locked)} questions here. <a className="link" href="/pricing">A pass opens them all.</a></p>}
        </section>

      <div className="setup-go">
        <span className="setup-go-txt">
          <b>{!catalog ? "…" : match ? `${nf(match)} questions` : pool ? "No questions match" : locked ? "With a pass" : "Coming soon"}</b>
          <span className="muted">{summary}</span>
        </span>
        {!catalog ? <button type="button" className="dpill dark" disabled>Loading…</button>
          : match ? <a className="dpill dark" href={href}>Start {start} questions</a>
          : pool ? <button type="button" className="dpill dark" onClick={() => setPicked([])}>Use all questions</button>
          : locked ? <a className="dpill dark" href="/pricing">Get a pass</a>
          : <button type="button" className="dpill dark" disabled>Coming soon</button>}
      </div>
      </div>
      </div>
    </div>
  );
}

function Switch({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} className="sw" onClick={() => onChange(!on)}>
      <span>{label}</span><i aria-hidden="true" />
    </button>
  );
}

/* A subject's or chapter's progress chip: accuracy once practised, otherwise whether questions are there yet. */
function Score({ n, total, answered, correct }: { n: number; total: number; answered: number; correct: number }) {
  if (!n) return <span className="acc none">{total ? "With a pass" : "Coming soon"}</span>;
  if (!answered) return <span className="acc none">Not started</span>;
  const p = pct(correct, answered);
  return <span className={`acc ${band(p).cls}`} title={`${band(p).word} · ${answered} answered`}>{p}%</span>;
}
