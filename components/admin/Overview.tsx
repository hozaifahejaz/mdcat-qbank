"use client";

import { useEffect, useState } from "react";
import { PageHead } from "@/components/app/AppShell";
import Empty from "@/components/app/Empty";
import { friendlyError } from "@/lib/auth";
import { type Overview as Data, actionNames, getOverview } from "@/lib/admin";
import { planNames } from "@/lib/format";
import { stages } from "@/lib/qc";
import { paper } from "@/lib/site";
import type { AccountUser } from "@/lib/user";

const when = (ms: number) => new Date(ms).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Karachi" });

/* /admin — what needs doing now, where the bank stands, and (for admins) accounts, plans and recent activity. */
export default function Overview({ user }: { user: AccountUser }) {
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => { getOverview().then(setD, (e) => setErr(friendlyError(e))); }, []);

  if (err) return <div className="dgrid"><PageHead title="Overview" /><p className="note-bad">{err}</p></div>;
  if (!d) return <div className="dgrid"><PageHead title="Overview" /><div className="sk" style={{ height: 420 }} /></div>;

  const total = Object.values(d.byStage).reduce((a, b) => a + b, 0);
  const todo = [
    d.openReports > 0 && { n: d.openReports, text: "questions reported by students", href: "/admin/reports" },
    d.sentBackToMe > 0 && { n: d.sentBackToMe, text: "of your questions were sent back to you", href: "/admin/questions?stage=draft" },
    d.waitingBlind > 0 && { n: d.waitingBlind, text: "waiting for a blind solve", href: "/admin/questions?stage=blind" },
    user.role !== "writer" && d.byStage.review > 0 && { n: d.byStage.review, text: "waiting for the textbook checklist", href: "/admin/questions?stage=review" },
    user.role === "admin" && d.byStage.signoff > 0 && { n: d.byStage.signoff, text: "waiting for your sign-off", href: "/admin/questions?stage=signoff" },
    user.role === "admin" && d.byStage.beta > 0 && { n: d.byStage.beta, text: "in beta, ready to go live once their stats look right", href: "/admin/questions?stage=beta" },
  ].filter(Boolean) as { n: number; text: string; href: string }[];

  return (
    <div className="dgrid">
      <PageHead title="Overview" sub={`Signed in as ${user.name || user.email}. Here's what needs doing and where the bank stands.`}>
        <a className="dpill dark small" href="/admin/questions?new=1">New question</a>
      </PageHead>
    <div className="ov">
      <section className="dcard panel">
        <div className="panel-h"><h2>To do</h2></div>
        {todo.length ? (
          <ul className="todo">
            {todo.map((t) => <li key={t.href}><a href={t.href}><b>{t.n}</b> {t.n === 1 ? t.text.replace("questions were", "question was").replace("questions reported", "question reported") : t.text}</a></li>)}
          </ul>
        ) : <p className="muted">Nothing waiting on you.</p>}
      </section>

      <section className="dcard panel">
        <div className="panel-h"><h2>Question bank</h2><span className="muted">{total} question{total === 1 ? "" : "s"} in total</span></div>
        <ul className="stage-grid">
          {stages.filter((s) => s.id !== "auto").map((s) => (
            <li key={s.id}><a href={`/admin/questions?stage=${s.id}`}><span className={`stage s-${s.id}`}>{s.label}</span><b>{d.byStage[s.id]}</b></a></li>
          ))}
        </ul>
        <h3 className="panel-title">Live questions by subject</h3>
        <ul className="dist live-subj">
          {paper.map((p) => {
            const n = d.liveBySubject[p.subject] ?? 0;
            return (
              <li key={p.subject}>
                <span>{p.subject}</span>
                <span className="meter"><i style={{ width: `${Math.min(100, (n / (p.count * 20)) * 100)}%`, background: p.solid }} /></span>
                <b>{n}</b>
              </li>
            );
          })}
        </ul>
        <p className="muted small">Bars fill at 20 questions per paper slot (for example 1,620 for Biology&apos;s 81), enough for every student to sit many mocks without repeats.</p>
      </section>

      {d.users && (
        <>
          <section className="dcard panel">
            <div className="panel-h"><h2>Accounts</h2><a className="link" href="/admin/users">Manage</a></div>
            <dl className="kpis">
              <div><dt>Accounts</dt><dd>{d.users.total}</dd></div>
              <div><dt>New this week</dt><dd>{d.users.newThisWeek}</dd></div>
              <div><dt>Paid now</dt><dd>{Object.values(d.users.paid).reduce((a, b) => a + b, 0)}</dd></div>
              <div><dt>Staff</dt><dd>{d.users.staff}</dd></div>
              {d.waitlist > 0 && <div><dt>Waitlist</dt><dd><a href="/admin/waitlist">{d.waitlist}</a></dd></div>}
            </dl>
            {Object.keys(d.users.paid).length > 0 && (
              <p className="muted small">{Object.entries(d.users.paid).map(([p, n]) => `${planNames[p as keyof typeof planNames] ?? p}: ${n}`).join(" · ")}</p>
            )}
          </section>

          {d.visits && (
            <section className="dcard panel">
              <div className="panel-h"><h2>Visitors</h2><a className="link" href="/admin/visitors">See all</a></div>
              <dl className="kpis three">
                <div><dt>On the site now</dt><dd>{d.visits.now}</dd></div>
                <div><dt>Today</dt><dd>{d.visits.today}</dd></div>
                <div><dt>Last 7 days</dt><dd>{d.visits.week}</dd></div>
              </dl>
            </section>
          )}

          <section className="dcard panel">
            <h2 className="panel-title">Recent activity</h2>
            {d.activity.length ? (
              <ul className="activity">
                {d.activity.map((a, i) => (
                  <li key={i}>
                    <span><b>{a.actor ?? "Someone"}</b> · {actionNames[a.action] ?? a.action}{a.target && a.action.startsWith("question.") ? <> · <code>{a.target}</code></> : null}{a.detail ? <span className="muted"> · {a.detail}</span> : null}</span>
                    <span className="muted small">{when(a.created_at)}</span>
                  </li>
                ))}
              </ul>
            ) : <Empty title="No activity yet" text="Question changes, role and plan changes show up here." />}
          </section>
        </>
      )}
    </div>
    </div>
  );
}
