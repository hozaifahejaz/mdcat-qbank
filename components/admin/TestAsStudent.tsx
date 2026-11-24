"use client";

import { useState } from "react";
import { PageHead } from "@/components/app/AppShell";
import { ExamOptions, type Picked, fromSaved, nothingPicked } from "@/components/exams/ExamPicker";
import { setTest } from "@/lib/admin";
import { friendlyError } from "@/lib/auth";
import { type AreaId, areas, examById } from "@/lib/exams";
import { examsSaved } from "@/lib/prefs";
import type { AccountUser } from "@/lib/user";

/* /admin/test — try the site as a student without making a new account each time. The admin's own account behaves
   like a student on the chosen plan with the chosen exams (server/users.ts testing) until the test is stopped:
   a new sign-up gets the welcome screen, a free student gets the free set and the upgrade prompts, and so on.
   Only what students see changes; the admin panel stays open throughout. */
const area: AreaId = areas.find((a) => a.open)!.id;
type Who = "new" | "chosen";

export default function TestAsStudent({ user }: { user: AccountUser }) {
  const on = !!user.testing;
  const [who, setWho] = useState<Who>(on && user.exams?.length ? "chosen" : "new");
  const [plan, setPlan] = useState<"free" | "paid">(on && user.plan !== "free" ? "paid" : "free");
  const [picked, setPicked] = useState<Picked>(() => (on && user.exams?.length ? fromSaved(user.exams) : nothingPicked));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ready = who === "new" || picked.exams.length > 0;

  async function run(body: Parameters<typeof setTest>[0], then: string) {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const res = await setTest(body);
      // Numbers kept for the other view are dropped, and the account as it now reads is remembered.
      examsSaved(res.user, examById(picked.main)?.bank ?? "mdcat");
      window.location.assign(then);
    } catch (e) {
      setError(friendlyError(e));
      setBusy(false);
    }
  }

  return (
    <div className="dgrid acct">
      <PageHead title="Test as a student" sub="See the site the way a student does, without making a new account each time. Only your own account changes, and only until you stop." />

      {on && (
        <section className="dcard panel acct-out">
          <p className="muted"><b>A test is running.</b> Your account is a {user.plan === "free" ? "free" : "paid"} student{user.exams?.length ? ` on ${user.exams.map((id) => examById(id)?.short ?? id).join(", ")}` : " who has just signed up"}.</p>
          <button type="button" className="dpill light small" disabled={busy} onClick={() => run({ off: true }, "/admin/test")}>Stop testing</button>
        </section>
      )}

      <section className="dcard panel wel-step">
        <h2 className="panel-title" id="tst-who">Which student?</h2>
        <div className="wel-opts two" role="radiogroup" aria-labelledby="tst-who">
          <button type="button" role="radio" aria-checked={who === "new"} className="wel-opt" onClick={() => setWho("new")}>
            <b>Just signed up</b><span>Opens the welcome screen, as a new student sees it</span>
          </button>
          <button type="button" role="radio" aria-checked={who === "chosen"} className="wel-opt" onClick={() => setWho("chosen")}>
            <b>Already chose exams</b><span>Opens the dashboard for the exams you tick</span>
          </button>
        </div>
        {who === "chosen" && <ExamOptions area={area} value={picked} onChange={setPicked} labelledBy="tst-who" unsure={false} />}
        <div className="wel-more">
          <span className="wel-q">Plan</span>
          <div className="chips" role="radiogroup" aria-label="Plan">
            <button type="button" role="radio" aria-checked={plan === "free"} aria-pressed={plan === "free"} className="chip" onClick={() => setPlan("free")}>Free</button>
            <button type="button" role="radio" aria-checked={plan === "paid"} aria-pressed={plan === "paid"} className="chip" onClick={() => setPlan("paid")}>Paid</button>
          </div>
        </div>
        {error && <p className="note-bad" role="alert">{error}</p>}
        <div className="wel-go">
          <button type="button" className="dpill dark small" disabled={busy || !ready}
            onClick={() => run({ plan, area, exams: who === "chosen" ? picked.exams : [] }, "/dashboard")}>{busy ? "One moment…" : on ? "Restart the test" : "Start the test"}</button>
        </div>
      </section>

      <p className="muted small">Your practice history is your own account&apos;s, so the numbers are yours. Device limits and the admin panel are not part of the test.</p>
    </div>
  );
}
