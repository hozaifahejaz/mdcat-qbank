"use client";

import { useEffect, useState } from "react";
import { PageHead } from "@/components/app/AppShell";
import Empty from "@/components/app/Empty";
import { friendlyError } from "@/lib/auth";
import { type WaitlistEntry, getWaitlist, last } from "@/lib/admin";
import { day } from "@/lib/format";

/* /admin/waitlist — people who left an email or number on the landing page to hear when Markhor Prep opens. */
export default function Waitlist() {
  const [rows, setRows] = useState<WaitlistEntry[] | null>(() => last<WaitlistEntry[]>("waitlist"));
  const [err, setErr] = useState("");
  useEffect(() => { getWaitlist().then(setRows, (e) => setErr(friendlyError(e))); }, []);

  const copy = () => navigator.clipboard?.writeText((rows ?? []).map((r) => r.contact).join("\n"));

  return (
    <div className="dgrid">
      <PageHead title="Waitlist" sub="People who asked to hear when an exam opens, from its page.">
        {!!rows?.length && <a className="dpill light small" href="/api/admin/waitlist/export" download>Download CSV</a>}
        {!!rows?.length && <button type="button" className="dpill light small" onClick={copy}>Copy all</button>}
      </PageHead>
      {err && <p className="note-bad">{err}</p>}
      {!rows ? <div className="sk" style={{ height: 240 }} /> : !rows.length ? (
        <section className="dcard panel"><Empty title="Nobody yet" text="Exam pages that aren't open yet ask for an email. Entries show up here." /></section>
      ) : (
        <section className="dcard panel">
          <table className="wl-table">
            <thead><tr><th>Contact</th><th>Type</th><th>Asked about</th><th>Joined</th></tr></thead>
            <tbody>{rows.map((r) => <tr key={r.contact}><td>{r.contact}</td><td>{r.kind === "email" ? "Email" : "Phone"}</td><td>{r.exams ? r.exams.split(",").join(", ") : "Launch"}</td><td>{day(new Date(r.created_at).toISOString())}</td></tr>)}</tbody>
          </table>
        </section>
      )}
    </div>
  );
}
