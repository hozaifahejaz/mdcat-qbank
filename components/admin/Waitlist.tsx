"use client";

import { useEffect, useState } from "react";
import { PageHead } from "@/components/app/AppShell";
import Empty from "@/components/app/Empty";
import { friendlyError } from "@/lib/auth";
import { type WaitlistEntry, getWaitlist } from "@/lib/admin";
import { day } from "@/lib/format";

/* /admin/waitlist — people who left an email or number on the landing page to hear when Examwise opens. */
export default function Waitlist() {
  const [rows, setRows] = useState<WaitlistEntry[] | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => { getWaitlist().then(setRows, (e) => setErr(friendlyError(e))); }, []);

  const copy = () => navigator.clipboard?.writeText((rows ?? []).map((r) => r.contact).join("\n"));

  return (
    <div className="dgrid">
      <PageHead title="Waitlist" sub="People who asked to hear when Examwise opens.">
        {!!rows?.length && <button type="button" className="dpill light small" onClick={copy}>Copy all</button>}
      </PageHead>
      {err && <p className="note-bad">{err}</p>}
      {!rows ? <div className="sk" style={{ height: 240 }} /> : !rows.length ? (
        <section className="dcard panel"><Empty title="Nobody yet" text="Sign-ups from the landing page's waitlist form show up here." /></section>
      ) : (
        <section className="dcard panel">
          <table className="wl-table">
            <thead><tr><th>Contact</th><th>Type</th><th>Joined</th></tr></thead>
            <tbody>{rows.map((r) => <tr key={r.contact}><td>{r.contact}</td><td>{r.kind === "email" ? "Email" : "Phone"}</td><td>{day(new Date(r.created_at).toISOString())}</td></tr>)}</tbody>
          </table>
        </section>
      )}
    </div>
  );
}
