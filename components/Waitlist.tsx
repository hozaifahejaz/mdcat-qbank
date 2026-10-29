"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { friendlyError } from "@/lib/auth";

/* The launch waitlist on the landing page while the bank isn't open (site.launched). One field: an email or a
   Pakistani mobile number. Saved by /api/waitlist (server/study.ts); admins see the list under Users. */
export default function Waitlist() {
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !contact.trim()) return;
    setBusy(true); setError("");
    try {
      await api("/api/waitlist", { body: { contact: contact.trim() } });
      setDone(true);
    } catch (err) {
      setError(friendlyError(err));
    }
    setBusy(false);
  }

  if (done) return <p className="wl-done" role="status">You&apos;re on the list. We&apos;ll be in touch the day questions open.</p>;
  return (
    <form className="wl" onSubmit={submit} noValidate>
      <label className="sr" htmlFor="wl-contact">Email or mobile number</label>
      <input id="wl-contact" autoComplete="email" placeholder="Email or 0300 1234567" value={contact} onChange={(e) => setContact(e.target.value)} />
      <button className="pill pill-dark" disabled={busy || !contact.trim()}>{busy ? "Adding…" : "Tell me when it opens"}</button>
      {error && <p className="wl-err" role="alert">{error}</p>}
      <a className="wl-alt" href="/signup">Or make a free account now</a>
    </form>
  );
}
