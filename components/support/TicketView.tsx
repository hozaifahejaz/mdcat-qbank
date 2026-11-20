"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { friendlyError } from "@/lib/auth";
import { MESSAGE_MAX, MESSAGE_MIN, TICKET_EMAILS, type PublicTicket, topicLabel } from "@/lib/support";
import Thread from "@/components/support/Thread";

/* /contact/ticket?t=… — one support conversation, opened from the link in the email (or ?id= for the signed-in
   account that wrote it), with a box to add to it. */
export default function TicketView() {
  const [ref, setRef] = useState<{ t?: string; id?: string } | null>(null);
  const [ticket, setTicket] = useState<PublicTicket | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("t") ?? undefined, id = p.get("id") ?? undefined;
    if (!t && !id) setLoadErr("This link is missing its ticket. Open the link from your email again.");
    else setRef({ t, id });
  }, []);

  const load = useCallback(async () => {
    if (!ref) return;
    const q = ref.t ? `t=${encodeURIComponent(ref.t)}` : `id=${encodeURIComponent(ref.id!)}`;
    try { setTicket((await api<{ ticket: PublicTicket }>(`/api/support/ticket?${q}`)).ticket); } catch (e) { setLoadErr(friendlyError(e)); }
  }, [ref]);
  useEffect(() => { load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !ref) return;
    if (text.trim().length < MESSAGE_MIN) return setError("Please write a little more so we can help.");
    setBusy(true); setError(""); setNote("");
    try {
      await api("/api/support/ticket/reply", { body: { t: ref.t, id: ref.id ? Number(ref.id) : undefined, message: text } });
      setText("");
      setNote(TICKET_EMAILS ? "Sent. We'll reply by email." : "Sent. Our answer will appear here.");
      await load();
    } catch (err) { setError(friendlyError(err)); }
    setBusy(false);
  }

  if (loadErr) {
    return (
      <>
        <h1>Support ticket</h1>
        <p className="note-bad">{loadErr}</p>
        <div><a className="dpill dark small" href="/contact">Send a new message</a></div>
      </>
    );
  }
  if (!ticket) return <><h1>Support ticket</h1><div className="sk" style={{ height: 240 }} /></>;

  return (
    <>
      <h1>Ticket #{ticket.id}</h1>
      <p className="muted">{topicLabel(ticket.topic)} · {ticket.status === "closed" ? "Closed" : "Open"}</p>
      <Thread messages={ticket.messages} />
      <form className="support-form" onSubmit={submit} noValidate>
        <label className="fld">
          <span>{ticket.status === "closed" ? "Still need help? Writing here opens the ticket again." : "Add to the conversation"}</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} maxLength={MESSAGE_MAX} disabled={busy} />
        </label>
        {error && <p className="note-bad" role="alert">{error}</p>}
        {note && <p className="note-good" role="status">{note}</p>}
        <div><button className="dpill dark small" disabled={busy || !text.trim()}>{busy ? "Sending…" : "Send"}</button></div>
      </form>
      <p className="muted small">Keep this page&apos;s link private: anyone with it can read this conversation.</p>
    </>
  );
}
