"use client";

import { useState } from "react";

/* "Tell me when it opens", in place of the plans on a page whose exam isn't open yet. The address goes on the waitlist
   with the exam it was left for (server/study.ts, /admin/waitlist), and we write once, when that exam opens. */
export default function Notify({ exam, short }: { exam: string; short: string }) {
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (state === "busy") return;
    setState("busy"); setError("");
    try {
      const res = await fetch("/api/waitlist", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ contact, exam }) });
      if (!res.ok) {
        const d = await res.json().catch(() => null) as { error?: { message?: string } } | null;
        throw new Error(d?.error?.message ?? "Something went wrong. Please try again.");
      }
      setState("done");
    } catch (err) {
      setError(err instanceof Error && err.message !== "Failed to fetch" ? err.message : "You seem to be offline. Check your connection and try again.");
      setState("idle");
    }
  }

  return (
    <div className="xe-soon x3-card">
      <span className="x8-soonbadge">Opening soon</span>
      <h3>{short} opens soon.</h3>
      {state === "done" ? (
        <p className="xe-done" role="status">Done. We&apos;ll write once, when {short} opens.</p>
      ) : (
        <>
          <p>Its prices will show here when it opens. Leave your email and we&apos;ll write once, when it does.</p>
          <form className="xe-form" onSubmit={send}>
            <label className="xe-sr" htmlFor="xe-contact">Email or mobile number</label>
            <input id="xe-contact" type="text" inputMode="email" autoComplete="email" placeholder="Email or mobile number" required value={contact} onChange={(e) => setContact(e.target.value)} />
            <button type="submit" className="x3-btn x3-blue" disabled={state === "busy"}>Tell me when it opens</button>
          </form>
          {error && <p className="xe-err" role="alert">{error}</p>}
        </>
      )}
    </div>
  );
}
