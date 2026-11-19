"use client";

import { Fragment, useState } from "react";
import Icon from "@/components/app/Icon";
import { banks, toneOf } from "@/lib/banks";
import { warm } from "@/lib/cache";
import { type ChapterStat, type Dashboard, ESTIMATE_AFTER, estimateScore, getDashboard } from "@/lib/dashboard-data";
import { band, pct } from "@/lib/format";
import { examDateFor, goalChoices, savePrefs } from "@/lib/prefs";
import { paper } from "@/lib/site";
import { testHref } from "@/lib/study";

/* The parts of the dashboard that tell a student where they stand and what to study next: today's goal and streak,
   the first-day checklist, coverage and pace, and the subjects table that opens into chapters. */

const nf = (n: number) => n.toLocaleString("en-GB");
export const daysUntil = (iso: string) => Math.max(0, Math.ceil((new Date(iso + "T09:00:00+05:00").getTime() - Date.now()) / 86_400_000));
const totalsOf = (d: Dashboard) => d.subjects.flatMap((s) => s.chapters).reduce((t, c) => ({ answered: t.answered + c.answered, available: t.available + c.available, correct: t.correct + c.correct }), { answered: 0, available: 0, correct: 0 });

/* Today's goal and the streak in one strip, with the goal changed in place. */
export function GoalStrip({ data, onGoal, cta }: { data: Dashboard; onGoal?: (n: number) => void; cta?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const today = data.daily.at(-1)?.answered ?? 0;
  const goal = data.dailyGoal;
  const left = Math.max(0, goal - today);
  const options = [...new Set([...goalChoices.map((g) => g.n), 60, 100, goal])].sort((a, b) => a - b);

  async function pick(n: number) {
    setSaving(true);
    try { await savePrefs({ dailyGoal: n }); onGoal?.(n); setEditing(false); } catch {}
    setSaving(false);
  }

  return (
    <section className="gs" aria-label="Today's goal and streak">
      <div className="gs-streak">
        <span className="gs-ic" aria-hidden="true"><Icon name="flame" size={18} /></span>
        <span><b>{data.streakDays}</b> day{data.streakDays === 1 ? "" : "s"} in a row</span>
      </div>
      <div className="gs-goal">
        <div className="gs-row">
          <span>Today <b>{today}</b> of {goal}</span>
          <span className="muted">{left > 0 ? `${left} to go` : "Goal done"}</span>
        </div>
        <span className="meter" role="img" aria-label={`${today} of ${goal} questions today`}><i style={{ width: `${Math.min(100, pct(today, goal))}%` }} /></span>
      </div>
      {onGoal && (editing ? (
        <div className="gs-edit" role="group" aria-label="Questions a day">
          {options.map((n) => (
            <button key={n} type="button" className="gs-opt" aria-pressed={n === goal} disabled={saving} onClick={() => pick(n)}>{n}</button>
          ))}
        </div>
      ) : (
        <button type="button" className="dpill light small" onClick={() => setEditing(true)}>Change goal</button>
      ))}
      {cta && <a className="dpill dark small" href="/practice">Create a test</a>}
    </section>
  );
}

/* A new student's dashboard: three things to do, ticked off from their own numbers, instead of empty charts. */
export const FIRST_DAY_UNTIL = 20;
export function FirstDay({ data }: { data: Dashboard }) {
  const answered = data.answeredEver ?? 0;
  const steps = [
    { done: answered >= 10, title: "Answer your first 10 questions", text: "Every question explains why the answer is right and why the others are wrong.", // A set already under way is carried on with, not started a second time.
      href: data.resume?.href ?? testHref({ kind: "practice", bank: data.bank, count: 10, title: "Your first 10 questions" }), cta: data.resume ? "Continue" : "Start" },
    { done: data.recent.some((t) => t.kind !== "practice"), title: "Try a timed test", text: "A minute a question, answers at the end, like the real paper.", href: "/practice?mode=timed", cta: "Set one up" },
    { done: data.daily.some((d) => d.answered >= data.dailyGoal), title: `Reach your daily goal of ${data.dailyGoal}`, text: "A little every day beats a lot once a week.", href: "/practice", cta: "Practise" },
  ];
  const next = steps.findIndex((s) => !s.done);
  return (
    <section className="box fd" aria-labelledby="fd-h">
      <div className="panel-h">
        <h2 id="fd-h">Getting started</h2>
        <span className="muted">{steps.filter((s) => s.done).length} of {steps.length} done</span>
      </div>
      <ol className="fd-list">
        {steps.map((s, i) => (
          <li key={s.title} className={s.done ? "done" : i === next ? "next" : undefined}>
            <span className="fd-mark" aria-hidden="true">{s.done ? <Icon name="check" size={16} /> : i + 1}</span>
            <span className="fd-txt"><b>{s.title}</b><span className="muted">{s.text}</span></span>
            {!s.done && <a className={`dpill ${i === next ? "dark" : "light"} small`} href={s.href}>{s.cta}</a>}
            {s.done && <span className="muted small">Done</span>}
          </li>
        ))}
      </ol>
      <p className="muted small">Your charts and chapter numbers show here once you have answered {FIRST_DAY_UNTIL} questions.</p>
    </section>
  );
}

/* Coverage of the bank, pace per question and (for MDCAT) a rough score out of 180. */
export function Stand({ data, free }: { data: Dashboard; free?: boolean }) {
  const t = totalsOf(data);
  const bank = banks.find((b) => b.id === (data.bank ?? "mdcat")) ?? banks.find((b) => b.id === "mdcat")!;
  const days = daysUntil(examDateFor(data.examYear));
  const left = Math.max(0, t.available - t.answered);
  const perDay = days > 0 ? Math.ceil(left / days) : left;
  const secs = data.secondsPerQuestion ?? null;
  const est = bank.id === "mdcat" ? estimateScore(data, paper) : null;
  const total = paper.reduce((n, p) => n + p.count, 0);
  return (
    <section className="st" aria-label="Where you stand">
      <div className="st-cell">
        <h2>Bank covered</h2>
        <strong>{pct(t.answered, t.available)}<small>%</small></strong>
        <span className="meter" role="img" aria-label={`${pct(t.answered, t.available)}% of the ${bank.name} bank answered`}><i style={{ width: `${pct(t.answered, t.available)}%` }} /></span>
        <p className="muted">{nf(t.answered)} of {nf(t.available)} {free ? "free" : bank.short} questions.{free ? <> <a className="link" href="/pricing">A pass opens the whole bank.</a></> : left > 0 && days > 0 && <> About <b>{nf(perDay)} a day</b> finishes it by the exam.</>}</p>
      </div>
      <div className="st-cell">
        <h2>Time per question</h2>
        <strong>{secs === null ? "–" : secs}<small>{secs === null ? "" : " sec"}</small></strong>
        <p className="muted">{secs === null ? "Shows after 20 answers." : secs <= 60 ? <>Inside the <b>60 seconds</b> the paper allows.</> : <>The paper allows <b>60 seconds</b>. Timed tests build speed.</>}</p>
      </div>
      {bank.id === "mdcat" && (
        <div className="st-cell">
          <h2>Estimated score</h2>
          <strong>{est === null ? "–" : est}<small>/{total}</small></strong>
          {est === null
            ? <><span className="meter" role="img" aria-label={`${Math.min(t.answered, ESTIMATE_AFTER)} of ${ESTIMATE_AFTER} answers`}><i style={{ width: `${Math.min(100, pct(t.answered, ESTIMATE_AFTER))}%` }} /></span>
              <p className="muted">Shows after {ESTIMATE_AFTER} answers with at least 30 in Biology, Chemistry and Physics.</p></>
            : <p className="muted">From your latest answer to each question. A full mock is the truer test.</p>}
        </div>
      )}
    </section>
  );
}

/* Weakest first among the chapters with enough answers to judge, then the ones barely started, in syllabus order. */
function ordered(chapters: ChapterStat[]) {
  const judged = chapters.filter((c) => c.answered >= 3).sort((a, b) => a.correct / a.answered - b.correct / b.answered);
  return [...judged, ...chapters.filter((c) => c.answered < 3)];
}

/* Subjects, each opening into its chapters with accuracy, coverage and a link straight into practice. The bank
   tabs lay the same answers out in another test's subjects and chapters. */
export function Subjects({ data, onBank }: { data: Dashboard; onBank?: (bank: string) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const bankId = data.bank ?? "mdcat";
  // The tab lights the moment it is pressed, and its numbers are fetched as soon as it is pointed at or touched.
  const [pressed, setPressed] = useState<string | null>(null);
  const lit = pressed ?? bankId;
  const ahead = (id: string) => { if (id !== bankId) warm(`dashboard:${id}`, () => getDashboard(undefined, id), true); };
  const practise = (subject: string, chapter?: string) => `/practice?${new URLSearchParams({ bank: bankId, subject, ...(chapter ? { chapter } : {}) })}`;
  return (
    <section className="box" aria-labelledby="subj-h">
      <div className="panel-h">
        <h2 id="subj-h">Subjects and chapters</h2>
        {onBank && (
          <div className="bk-tabs" role="tablist" aria-label="Question bank">
            {banks.map((b) => (
              <button key={b.id} type="button" role="tab" aria-selected={b.id === lit} onPointerEnter={() => ahead(b.id)} onTouchStart={() => ahead(b.id)} onFocus={() => ahead(b.id)}
                onClick={() => { if (b.id !== lit) { setPressed(b.id); onBank(b.id); } }}>{b.short}</button>
            ))}
          </div>
        )}
      </div>
      <ul className="sj">
        {data.subjects.map((s) => {
          const t = s.chapters.reduce((x, c) => ({ answered: x.answered + c.answered, available: x.available + c.available, correct: x.correct + c.correct }), { answered: 0, available: 0, correct: 0 });
          const acc = pct(t.correct, t.answered);
          const tone = toneOf(s.subject);
          const onPaper = bankId === "mdcat" ? paper.find((x) => x.subject === s.subject)?.count : undefined;
          const b = t.answered ? band(acc) : { cls: "", word: t.available ? "Not started" : "Coming soon" };
          const isOpen = open === s.subject;
          return (
            <li key={s.subject} className={isOpen ? "open" : undefined}>
              <button type="button" className="sj-row" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : s.subject)}>
                <span className="row-ic" style={{ background: tone.tone, color: tone.solid }}>{s.subject[0]}</span>
                <span className="sj-main">
                  <b>{s.subject}</b>
                  <span className="muted">{nf(t.answered)} of {nf(t.available)} answered{onPaper ? ` · ${onPaper} on the paper` : ""}</span>
                </span>
                <span className="sj-cover"><span className="meter" style={{ ["--c" as string]: tone.solid }} role="img" aria-label={`${pct(t.answered, t.available)}% answered`}><i style={{ width: `${pct(t.answered, t.available)}%` }} /></span></span>
                <span className="sj-acc"><b>{t.answered ? `${acc}%` : "–"}</b><span className={`status-chip ${b.cls}`}><i />{b.word}</span></span>
                <span className="sj-chev" aria-hidden="true"><Icon name="chevron" size={18} /></span>
              </button>
              {isOpen && (
                <div className="sj-chapters">
                  {s.chapters.length === 0 && <p className="muted small">No questions here yet.</p>}
                  {ordered(s.chapters).map((c, i, list) => {
                    const cacc = pct(c.correct, c.answered);
                    const judged = c.answered >= 3;
                    return (
                      <Fragment key={c.chapter}>
                        {i > 0 && judged !== (list[i - 1]!.answered >= 3) && <p className="sj-sep muted small">Not enough answers yet</p>}
                        <a className="sj-ch" href={practise(s.subject, c.chapter)}>
                          <span className="sj-ch-name">{c.chapter}</span>
                          <span className="muted sj-ch-n">{c.answered} of {c.available}</span>
                          <span className="sj-ch-acc">{judged ? <b className={band(cacc).cls}>{cacc}%</b> : <span className="muted">–</span>}</span>
                          <span className="sj-ch-go">Practise<Icon name="chevron" size={14} /></span>
                        </a>
                      </Fragment>
                    );
                  })}
                  <a className="dpill light small" href={practise(s.subject)}>Practise all of {s.subject}</a>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
