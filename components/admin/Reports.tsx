"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHead } from "@/components/app/AppShell";
import Empty from "@/components/app/Empty";
import { friendlyError } from "@/lib/auth";
import { type Report, listReports, resolveReports } from "@/lib/admin";
import { day } from "@/lib/format";
import { stageLabel } from "@/lib/qc";

/* /admin/reports — what students flagged from the test screen, grouped by question. A question with three open
   reports is hidden from new tests until it's fixed or the reports are dismissed here. */
export default function Reports() {
  const [tab, setTab] = useState<"open" | "closed">("open");
  const [rows, setRows] = useState<Report[] | null>(null);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");

  const load = useCallback(() => { setRows(null); listReports(tab).then(setRows, (e) => setErr(friendlyError(e))); }, [tab]);
  useEffect(load, [load]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3200); return () => clearTimeout(t); } }, [toast]);

  const groups = new Map<string, Report[]>();
  (rows ?? []).forEach((r) => groups.set(r.question_id, [...(groups.get(r.question_id) ?? []), r]));

  return (
    <div className="dgrid">
      <PageHead title="Reports" sub="Problems students flagged on a question. Fix the question, then close its reports, or dismiss them if it was right." />
      <nav className="stage-tabs" aria-label="Status">
        <button type="button" className="stab" aria-pressed={tab === "open"} onClick={() => setTab("open")}>Open</button>
        <button type="button" className="stab" aria-pressed={tab === "closed"} onClick={() => setTab("closed")}>Closed</button>
      </nav>
      {err && <p className="note-bad">{err}</p>}
      {!rows ? <div className="sk" style={{ height: 320 }} /> : !rows.length ? (
        <section className="dcard panel"><Empty title={tab === "open" ? "No open reports" : "Nothing closed yet"} text={tab === "open" ? "When a student reports a question, it shows up here." : undefined} /></section>
      ) : (
        <ul className="rep-list">
          {[...groups].map(([id, rs]) => (
            <li key={id}><Group id={id} reports={rs} open={tab === "open"} onDone={(m) => { setToast(m); load(); }} /></li>
          ))}
        </ul>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function Group({ id, reports, open, onDone }: { id: string; reports: Report[]; open: boolean; onDone: (message: string) => void }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const first = reports[0]!;
  const close = async (status: "fixed" | "dismissed") => {
    setBusy(true); setErr("");
    try {
      await resolveReports(id, status, note.trim());
      onDone(status === "fixed" ? `Reports on ${id} closed as fixed.` : `Reports on ${id} dismissed.`);
    } catch (e) { setErr(friendlyError(e)); setBusy(false); }
  };
  return (
    <section className="dcard panel rep-q">
      <div className="qrow-top">
        <a href={`/admin/questions?id=${encodeURIComponent(id)}`}><code>{id}</code></a>
        {first.stage && <span className={`stage s-${first.stage}`}>{stageLabel(first.stage)}</span>}
        {open && <span className={`acc${reports.length >= 3 ? " warn" : ""}`}>{reports.length} open{reports.length >= 3 ? ", hidden from new tests" : ""}</span>}
      </div>
      <p className="qrow-stem">{first.stem ?? <span className="muted">This question was deleted.</span>}</p>
      <ul className="rep-items">
        {reports.map((r) => (
          <li key={r.id}>
            <b>{r.reason}</b>{r.details && <> · {r.details}</>}
            <span className="muted small"> · {r.student ?? "A student"}, {day(new Date(r.created_at).toISOString())}</span>
            {!open && <span className="muted small"> · {r.status === "fixed" ? "Fixed" : "Dismissed"} by {r.resolver ?? "someone"}{r.note && `: ${r.note}`}</span>}
          </li>
        ))}
      </ul>
      {open && (
        <div className="rep-act">
          <input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} aria-label="Note" />
          <button type="button" className="dpill light small" disabled={busy} onClick={() => close("dismissed")}>Dismiss</button>
          <button type="button" className="dpill dark small" disabled={busy} onClick={() => close("fixed")}>Mark fixed</button>
        </div>
      )}
      {err && <p className="note-bad" role="alert">{err}</p>}
    </section>
  );
}
