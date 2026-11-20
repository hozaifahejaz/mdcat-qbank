"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHead } from "@/components/app/AppShell";
import Empty from "@/components/app/Empty";
import { friendlyError } from "@/lib/auth";
import { type TicketList, type TicketView, deleteTicket, getTicket, last, listTickets, replyTicket, setTicketStatus, ticketsKey } from "@/lib/admin";
import { planNames } from "@/lib/format";
import { type TicketDetail, MESSAGE_MAX, topicLabel } from "@/lib/support";
import Thread, { when } from "@/components/support/Thread";
import type { AccountUser } from "@/lib/user";

const views: { id: TicketView; label: string }[] = [
  { id: "waiting", label: "Needs reply" },
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
  { id: "all", label: "All" },
];

/* /admin/tickets — messages from the contact page. Answer one and the answer is emailed to the person from the support
   address; the whole conversation stays here. Admins only. */
export default function Tickets({ user: me }: { user: AccountUser }) {
  const [view, setView] = useState<TicketView>("waiting");
  const [q, setQ] = useState("");
  const [data, setData] = useState<TicketList | null>(() => last<TicketList>(ticketsKey("waiting", "")));
  const [err, setErr] = useState("");
  const [sel, setSel] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const id = Number(new URLSearchParams(window.location.search).get("id"));
    if (id) { setSel(id); setView("all"); }
  }, []);
  const load = useCallback(() => listTickets(view, q).then(setData, (e) => setErr(friendlyError(e))), [view, q]);
  useEffect(() => {
    const kept = last<TicketList>(ticketsKey(view, q));
    if (kept) setData(kept);
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, view, q]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3000); return () => clearTimeout(t); } }, [toast]);

  const rows = data?.tickets ?? null;
  return (
    <div className="dgrid">
      <PageHead title="Support tickets" sub="Messages from the contact page. Your answers are emailed from the support address." />
      <div className="q-head">
        <nav className="stage-tabs" aria-label="Show">
          {views.map((v) => (
            <button key={v.id} type="button" className="stab" aria-pressed={view === v.id} onClick={() => setView(v.id)}>
              {v.label}{data ? ` ${data.counts[v.id]}` : ""}
            </button>
          ))}
        </nav>
        <input type="search" className="user-search" placeholder="Search name, email or ticket number" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search tickets" />
      </div>
      {err && <p className="note-bad">{err}</p>}

      <div className={`users-cols${sel ? " open" : ""}`}>
        <section className="dcard panel users-list">
          {rows === null ? <div className="sk" style={{ height: 240 }} />
            : rows.length === 0 ? <Empty title={view === "waiting" && !q ? "All caught up" : "No tickets here"} text={q ? "Try another search." : view === "waiting" ? "Every open ticket has an answer from you." : "Tickets appear here when someone writes in from the contact page."} />
            : (
              <div className="table-scroll"><table className="utable">
                <thead><tr><th>Ticket</th><th>Status</th><th className="hide-sm">Updated</th></tr></thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.id} aria-selected={t.id === sel} onClick={() => setSel(t.id)}>
                      <td>
                        <button type="button" className="link-row" onClick={() => setSel(t.id)}>
                          <b>#{t.id} · {t.name}</b>
                          <span className="muted small">{topicLabel(t.topic)} · {t.email}</span>
                          <span className="muted small tk-preview">{t.preview}</span>
                        </button>
                      </td>
                      <td><Status s={t.status} waiting={t.status === "open" && t.lastFrom === "person"} /></td>
                      <td className="hide-sm muted">{when(t.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            )}
        </section>
        {sel && <Detail key={sel} id={sel} me={me} onClose={() => setSel(null)} onChanged={(m, gone) => { setToast(m); if (gone) setSel(null); load(); }} />}
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function Status({ s, waiting }: { s: "open" | "closed"; waiting: boolean }) {
  if (s === "closed") return <span className="muted">Closed</span>;
  return waiting ? <span className="badge bad">Needs reply</span> : <span className="badge good">Answered</span>;
}

function Detail({ id, me, onClose, onChanged }: { id: number; me: AccountUser; onClose: () => void; onChanged: (message: string, gone?: boolean) => void }) {
  const [d, setD] = useState<TicketDetail | null>(() => last<TicketDetail>(`ticket:${id}`));
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");

  const load = useCallback(() => getTicket(id).then(setD, (e) => setErr(friendlyError(e))), [id]);
  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<unknown>, message: string, gone = false) => {
    setBusy(true); setErr("");
    try { await fn(); onChanged(message, gone); if (!gone) await load(); } catch (x) { setErr(friendlyError(x)); }
    setBusy(false);
  };
  const send = (close: boolean) => act(async () => { await replyTicket(id, text.trim(), close); setText(""); }, close ? "Answer sent and ticket closed." : "Answer sent.");

  if (!d) return <aside className="dcard panel udetail">{err ? <p className="note-bad">{err}</p> : <div className="sk" style={{ height: 300 }} />}</aside>;
  const t = d.ticket;
  const a = d.account;
  const paid = a && a.plan !== "free" && (!a.planExpiresAt || a.planExpiresAt > Date.now());

  return (
    <aside className="dcard panel udetail" aria-label={`Ticket ${t.id}`}>
      <div className="panel-h">
        <h2>#{t.id} · {topicLabel(t.topic)}</h2>
        <button type="button" className="link" onClick={onClose}>Close</button>
      </div>
      <div className="tk-who">
        <b>{t.name}</b>
        <a className="link" href={`mailto:${t.email}`}>{t.email}</a>
        {a ? (
          <span className="muted small">
            {a.linked ? "Sent while signed in to " : "Has an account: "}
            <a className="link" href={`/admin/users?id=${encodeURIComponent(a.id)}`}>{a.name || "account"}</a>
            {` · ${paid ? planNames[a.plan as keyof typeof planNames] ?? a.plan : "Free"}`}
          </span>
        ) : <span className="muted small">No account with this email</span>}
        {d.others.length > 0 && (
          <span className="muted small">Earlier tickets: {d.others.map((o, i) => <span key={o.id}>{i ? ", " : ""}<a className="link" href={`/admin/tickets?id=${o.id}`}>#{o.id}</a></span>)}</span>
        )}
      </div>

      <Thread messages={d.messages} />

      {err && <p className="note-bad" role="alert">{err}</p>}
      <form className="usec" onSubmit={(e) => { e.preventDefault(); if (text.trim()) send(false); }}>
        <label className="fld">
          <span>Your answer to {t.name.split(" ")[0]}</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} maxLength={MESSAGE_MAX} disabled={busy} placeholder="Write your answer. It's emailed from the support address, signed by the team." />
        </label>
        <p className="muted small">Signed in as {me.name || me.email}. The email starts with &ldquo;Hi {t.name.split(" ")[0]},&rdquo; and links to this conversation, where they can answer.</p>
        <div className="role-row">
          <button type="submit" className="dpill dark small" disabled={busy || text.trim().length < 10}>{busy ? "Sending…" : "Send answer"}</button>
          <button type="button" className="dpill light small" disabled={busy || text.trim().length < 10} onClick={() => send(true)}>Send and close</button>
        </div>
      </form>

      <div className="usec">
        <div className="role-row">
          {t.status === "open"
            ? <button type="button" className="dpill light small" disabled={busy} onClick={() => act(() => setTicketStatus(id, "closed"), "Ticket closed.")}>Close without answering</button>
            : <button type="button" className="dpill light small" disabled={busy} onClick={() => act(() => setTicketStatus(id, "open"), "Ticket reopened.")}>Reopen</button>}
          <button type="button" className="dpill light small" disabled={busy} onClick={() => { if (confirm(`Delete ticket #${id} for good? Use this for spam only.`)) act(() => deleteTicket(id), "Ticket deleted.", true); }}>Delete as spam</button>
        </div>
      </div>
    </aside>
  );
}
