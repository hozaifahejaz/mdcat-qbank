"use client";

import { useEffect, useState } from "react";
import { PageHead } from "@/components/app/AppShell";
import Empty from "@/components/app/Empty";
import { friendlyError } from "@/lib/auth";
import { type Coverage, type Quality, getCoverage, getQuality, last } from "@/lib/admin";
import { letters } from "@/lib/format";
import type { AccountUser } from "@/lib/user";

/* A chapter with fewer questions than this is thin: a student runs out after a test or two. */
const THIN = 20;
const nf = (n: number) => n.toLocaleString("en-GB");

/* /admin/bank — how full each chapter of each test is, and which questions students' answers say need a look. */
export default function Bank({ user }: { user: AccountUser }) {
  const [cov, setCov] = useState<Coverage | null>(() => last<Coverage>("coverage"));
  const [q, setQ] = useState<Quality | null>(() => last<Quality>("quality"));
  const [bank, setBank] = useState("mdcat");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const canJudge = user.role !== "writer";

  useEffect(() => {
    getCoverage().then(setCov, (e) => setErr(friendlyError(e)));
    if (canJudge) getQuality().then(setQ, (e) => setErr(friendlyError(e)));
  }, [canJudge]);

  const recount = async () => {
    setBusy(true);
    try { setQ(await getQuality(true)); } catch (e) { setErr(friendlyError(e)); }
    setBusy(false);
  };

  const b = cov?.banks.find((x) => x.id === bank) ?? cov?.banks[0];
  const chapters = b?.subjects.flatMap((s) => s.chapters) ?? [];
  const empty = chapters.filter((c) => c.total === 0).length;
  const thin = chapters.filter((c) => c.total > 0 && c.total < THIN).length;

  return (
    <div className="dgrid">
      <PageHead title="Bank health" sub="How full each chapter is, and the questions students' answers say need a look." />
      {err && <p className="note-bad">{err}</p>}

      {canJudge && (
        <section className="dcard panel">
          <div className="panel-h">
            <h2>Needs a look</h2>
            {q && <button type="button" className="dpill light small" disabled={busy} onClick={recount}>{busy ? "Counting…" : "Count again"}</button>}
          </div>
          {!q ? <div className="sk" style={{ height: 160 }} /> : (
            <>
              <p className="muted small">
                {nf(q.measured)} question{q.measured === 1 ? " has" : "s have"} {q.minAnswers} or more answers{q.average !== null && <>, {q.average}% right on average</>}.
                Listed here: a wrong option picked more than the key, or under 30% right.
              </p>
              {q.look.length === 0 ? <Empty title="Nothing to check" text={q.measured ? "No question stands out yet." : `Questions show here once they have ${q.minAnswers} answers.`} /> : (
                <div className="table-scroll"><table className="utable bh-q">
                  <thead><tr><th>Question</th><th>Right</th><th>Picks</th><th>Why</th></tr></thead>
                  <tbody>
                    {q.look.map((r) => (
                      <tr key={r.id} onClick={() => { window.location.href = `/admin/questions?id=${encodeURIComponent(r.id)}`; }}>
                        <td>
                          <a className="link-row" href={`/admin/questions?id=${encodeURIComponent(r.id)}`}>
                            <b>{r.id}{r.reports > 0 && <> <span className="badge bad">{r.reports} report{r.reports === 1 ? "" : "s"}</span></>}</b>
                            <span className="muted small">{r.subject} · {r.chapter}</span>
                            <span className="small bh-stem">{r.stem}</span>
                          </a>
                        </td>
                        <td><b>{r.pct}%</b><br /><span className="muted small">of {r.n}</span></td>
                        <td className="bh-picks">{r.picks.map((n, i) => <span key={i} className={i === r.key ? "key" : undefined}>{letters[i]} {n}</span>)}</td>
                        <td>{r.why === "wrong_pick" ? <span className="badge bad">Wrong option leads</span> : <span className="badge">Under 30% right</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              )}
            </>
          )}
        </section>
      )}

      <section className="dcard panel">
        <div className="panel-h">
          <h2>Chapters</h2>
          {cov && (
            <div className="bk-tabs" role="tablist" aria-label="Question bank">
              {cov.banks.map((x) => <button key={x.id} type="button" role="tab" aria-selected={x.id === b?.id} onClick={() => setBank(x.id)}>{x.name}</button>)}
            </div>
          )}
        </div>
        {!cov || !b ? <div className="sk" style={{ height: 320 }} /> : (
          <>
            <p className="muted small">{nf(chapters.reduce((n, c) => n + c.total, 0))} questions students can get in {b.name}. {empty} chapter{empty === 1 ? "" : "s"} empty, {thin} with fewer than {THIN}.</p>
            <div className="bh-subjects">
              {b.subjects.map((s) => {
                const max = Math.max(1, ...s.chapters.map((c) => c.total));
                return (
                  <div key={s.subject} className="bh-subject">
                    <h3 className="panel-title">{s.subject} <span className="muted">{nf(s.chapters.reduce((n, c) => n + c.total, 0))}</span></h3>
                    {s.chapters.length === 0 ? <p className="muted small">No chapters listed.</p> : (
                      <ul className="bh-ch">
                        {s.chapters.map((c) => (
                          <li key={c.chapter} className={c.total === 0 ? "none" : c.total < THIN ? "thin" : undefined}>
                            <a href={`/admin/questions?stage=live&subject=${encodeURIComponent(s.subject)}&chapter=${encodeURIComponent(c.chapter)}`}>{c.chapter}{!c.listed && <span className="muted"> (not in the syllabus list)</span>}</a>
                            <span className="meter" aria-hidden="true"><i style={{ width: `${(c.total / max) * 100}%` }} /></span>
                            <b>{c.total}</b>
                            <span className="muted small">{c.free ? `${c.free} free` : ""}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
