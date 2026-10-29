"use client";

import { useEffect, useState } from "react";
import AppShell, { PageHead } from "@/components/app/AppShell";
import Empty from "@/components/app/Empty";
import Explanation from "@/components/test/Explanation";
import Protected from "@/components/test/Protected";
import { friendlyError } from "@/lib/auth";
import { type Question, subjects } from "@/lib/bank";
import { type Mistake, getBookmarks, getMistakes, setBookmark, testHref } from "@/lib/study";
import type { Subject } from "@/lib/dashboard-data";
import { day, letters } from "@/lib/format";
import type { AccountUser } from "@/lib/user";

export default function MistakesScreen() {
  return <AppShell active="/mistakes">{(user) => <Mistakes user={user} />}</AppShell>;
}

/* /mistakes — questions the student got wrong (latest answer), and their bookmarks. Retry sends them to practice mode. */
function Mistakes({ user }: { user: AccountUser }) {
  const [tab, setTab] = useState<"wrong" | "saved">("wrong");
  const [subject, setSubject] = useState<Subject | "all">("all");
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [saved, setSaved] = useState<Question[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMistakes().then(setMistakes, (e) => setError(friendlyError(e)));
    getBookmarks().then(setSaved, (e) => setError(friendlyError(e)));
    if (new URLSearchParams(window.location.search).get("tab") === "saved") setTab("saved");
  }, []);

  const rows = (tab === "wrong" ? mistakes.map((m) => ({ q: m.q, m })) : saved.map((q) => ({ q, m: undefined as Mistake | undefined })))
    .filter((r) => subject === "all" || r.q.subject === subject);
  const ids = rows.map((r) => r.q.id);
  const unsave = (id: string) => {
    setSaved((x) => x.filter((q) => q.id !== id));
    setBookmark(id, false).catch((e) => setError(friendlyError(e)));
  };

  return (
    <div className="dgrid">
      <PageHead title="My mistakes" sub="Get each one right once and it leaves the list.">
        {rows.length > 0 && <a className="dpill dark" href={testHref({ kind: "practice", ids: ids.slice(0, 100), title: tab === "wrong" ? "My mistakes" : "Bookmarks" })}>Retry {Math.min(100, rows.length)}</a>}
      </PageHead>

      <div className="ptabs" role="tablist">
        <button type="button" role="tab" className="tab" aria-selected={tab === "wrong"} onClick={() => setTab("wrong")}>Wrong answers <span className="muted">{mistakes.length}</span></button>
        <button type="button" role="tab" className="tab" aria-selected={tab === "saved"} onClick={() => setTab("saved")}>Bookmarked <span className="muted">{saved.length}</span></button>
      </div>

      {error && <p className="note-bad" role="alert">{error}</p>}
      <section className="dcard panel">
        <div className="chips" role="group" aria-label="Subject">
          <button type="button" className="chip" aria-pressed={subject === "all"} onClick={() => setSubject("all")}>All subjects</button>
          {subjects.map((s) => <button key={s} type="button" className="chip" aria-pressed={subject === s} onClick={() => setSubject(s)}>{s}</button>)}
        </div>
        <Protected user={user}>
          <ul className="mlist">
            {rows.map(({ q, m }) => (
              <li key={q.id}>
                <button type="button" className="mrow" aria-expanded={open === q.id} onClick={() => setOpen(open === q.id ? null : q.id)}>
                  <span className="mq">
                    <b>{q.stem}</b>
                    <span className="muted small">
                      {q.subject} · {q.topic}
                      {m && <> · you chose {letters[m.chosen]} on {day(m.date)}{m.tries > 1 ? ` · wrong ${m.tries} times` : ""}</>}
                    </span>
                  </span>
                  <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: open === q.id ? "rotate(180deg)" : undefined }}><path d="m6 9 6 6 6-6" /></svg>
                </button>
                {open === q.id && (
                  <div className="rbody">
                    <Explanation q={q} chosen={m?.chosen} />
                    <div className="hello-ctas">
                      <a className="dpill light small" href={testHref({ kind: "practice", ids: [q.id], title: q.topic || q.chapter })}>Try it again</a>
                      {!m && <button type="button" className="dpill light small" onClick={() => unsave(q.id)}>Remove bookmark</button>}
                    </div>
                  </div>
                )}
              </li>
            ))}
            {!rows.length && <li><Empty title={tab === "wrong" ? "No mistakes yet" : "No bookmarks yet"} text={tab === "wrong" ? "Questions you get wrong land here so you can retry them." : "Bookmark a question while you practise to keep it here."} /></li>}
          </ul>
        </Protected>
      </section>
    </div>
  );
}
