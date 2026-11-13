"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell, { PageHead } from "@/components/app/AppShell";
import Icon from "@/components/app/Icon";
import { type Bank, bankById, banks, toneOf } from "@/lib/banks";
import { band, pct } from "@/lib/format";
import { type Catalog, doneCount, getCatalog, openCount, testHref, totalCount } from "@/lib/study";

const counts = [10, 25, 50, 100];

export default function PracticeScreen() {
  return <AppShell active="/practice">{() => <Practice />}</AppShell>;
}

/* /practice shows the question banks; /practice?bank=fsc1 that bank's subjects. Older links that name a subject
   (?subject=Biology&chapter=Enzymes from the dashboard and coach) open the MDCAT bank with it ticked. */
function Practice() {
  const [bank, setBank] = useState<Bank | null | undefined>(undefined);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setBank(bankById(p.get("bank")) ?? (p.get("subject") || p.get("mode") ? bankById("mdcat")! : null));
  }, []);
  if (bank === undefined) return <div className="dgrid" aria-busy="true"><div className="sk" style={{ height: 320 }} /></div>;
  return bank ? <BankPractice bank={bank} /> : <BankList />;
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

function BankList() {
  return (
    <div className="dgrid">
      <PageHead title="Practice" sub="Pick a question bank." />
      <BankButtons />
    </div>
  );
}

/* What's ticked: some whole subjects (books), or some chapters of one subject. Nothing ticked means the whole bank. */
type Sel = { kind: "subjects"; set: Set<string> } | { kind: "chapters"; subject: string; set: Set<string> };

function BankPractice({ bank }: { bank: Bank }) {
  const [sel, setSel] = useState<Sel>({ kind: "subjects", set: new Set() });
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const [mode, setMode] = useState<"tutor" | "timed">("tutor");
  const [count, setCount] = useState(25);
  const [only, setOnly] = useState<"all" | "unseen" | "wrong">("all");
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
    if (p.get("mode") === "timed") setMode("timed");
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

  const href = testHref({
    kind: mode === "timed" ? "timed" : "practice", bank: bank.id, count, from: only, topic: topic ?? undefined,
    ...(sel.kind === "chapters" ? { subject: sel.subject, chapters: [...sel.set] }
      : sel.set.size === 1 ? { subject: [...sel.set][0] }
      : sel.set.size > 1 ? { subjects: subjectNames.filter((s) => sel.set.has(s)) } : {}),
  });

  const summary = sel.kind === "chapters"
    ? `${sel.subject} · ${sel.set.size === 1 ? [...sel.set][0] : `${sel.set.size} chapters`}`
    : sel.set.size === 0 ? `All ${noun}s`
    : sel.set.size <= 2 ? subjectNames.filter((s) => sel.set.has(s)).join(" + ")
    : `${sel.set.size} ${noun}s`;

  return (
    <div className="dgrid">
      <PageHead title={bank.name} sub={`Pick one or more ${noun}s, or open a ${noun} to practise a single chapter.`} />

      <nav className="ptabs" aria-label="Question bank">
        {banks.map((b) => (
          <a key={b.id} className="tab" href={`/practice?bank=${b.id}`} aria-current={b.id === bank.id ? "page" : undefined}>{b.name}</a>
        ))}
      </nav>

      <div className="cols">
        <section className="dcard panel" aria-labelledby="ch-h">
          <div className="panel-h">
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

        <section className="dcard panel setup" aria-labelledby="set-h">
          <h2 id="set-h" className="panel-title">Your set</h2>

          <div className="seg" role="radiogroup" aria-label="Mode">
            <button type="button" role="radio" aria-checked={mode === "tutor"} onClick={() => setMode("tutor")}>
              <b>Practice</b><span>Explanation after each answer</span>
            </button>
            <button type="button" role="radio" aria-checked={mode === "timed"} onClick={() => setMode("timed")}>
              <b>Timed test</b><span>1 minute a question, answers at the end</span>
            </button>
          </div>

          <div className="fld">
            <span>Questions</span>
            <div className="chips">
              {counts.map((c) => <button key={c} type="button" className="chip" aria-pressed={count === c} onClick={() => setCount(c)}>{c}</button>)}
            </div>
          </div>

          <div className="fld">
            <span>From</span>
            <div className="chips">
              {([["all", "All questions"], ["unseen", "Not yet seen"], ["wrong", "Got wrong before"]] as const).map(([k, l]) => (
                <button key={k} type="button" className="chip" aria-pressed={only === k} onClick={() => setOnly(k)}>{l}</button>
              ))}
            </div>
          </div>

          <div className="setup-sum">
            <span className="muted">{summary} · {!catalog ? "…" : pool ? `${pool.toLocaleString("en-GB")} questions in the bank` : locked ? "with a pass" : "questions coming soon"}</span>
            {!catalog ? <button type="button" className="dpill dark block" disabled>Loading…</button>
              : pool ? <a className="dpill dark block" href={href}>Start {Math.min(count, pool)} questions</a>
              : locked ? <a className="dpill dark block" href="/pricing">Get a pass for these questions</a>
              : <button type="button" className="dpill dark block" disabled>Questions coming soon</button>}
            {pool > 0 && mode === "timed" && <span className="muted small">Clock: {Math.min(count, pool)} minutes</span>}
            {catalog && !catalog.paid && locked > 0 && <span className="muted small">Free plan: {pool.toLocaleString("en-GB")} of {(pool + locked).toLocaleString("en-GB")} questions here. <a className="link" href="/pricing">A pass opens them all.</a></span>}
            {only !== "all" && pool > 0 && <span className="muted small">{only === "unseen" ? "Only questions you haven't answered yet." : "Only questions you got wrong last time."} If none match, try All questions.</span>}
          </div>
        </section>
      </div>
    </div>
  );
}

/* A subject's or chapter's progress chip: accuracy once practised, otherwise whether questions are there yet. */
function Score({ n, total, answered, correct }: { n: number; total: number; answered: number; correct: number }) {
  if (!n) return <span className="acc none">{total ? "With a pass" : "Coming soon"}</span>;
  if (!answered) return <span className="acc none">Not started</span>;
  const p = pct(correct, answered);
  return <span className={`acc ${band(p).cls}`} title={`${band(p).word} · ${answered} answered`}>{p}%</span>;
}
