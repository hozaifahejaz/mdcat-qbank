"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { friendlyError } from "@/lib/auth";
import { forgetAll } from "@/lib/cache";
import type { AccountUser } from "@/lib/user";
import AppShell, { PageHead } from "@/components/app/AppShell";

/* /account/delete: deletes the account and everything in it, after the password (or a recent sign-in). */
export default function DeleteAccount() {
  return <AppShell active="/account" title="Delete account">{(user) => <Body me={user} />}</AppShell>;
}

function Body({ me }: { me: AccountUser }) {
  const hasPassword = me.methods.includes("email");
  const [password, setPassword] = useState("");
  const [sure, setSure] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!sure) return setError("Tick the box to confirm.");
    setBusy(true);
    try {
      await api("/api/auth/delete-account", { body: hasPassword ? { password } : {} });
      forgetAll();
      window.location.replace("/?deleted=1");
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  }

  return (
    <div className="dgrid acct">
      <PageHead title="Delete your account" />
      <section className="dcard panel">
        <p>This deletes your account, your test history, progress, bookmarks and devices. It can&apos;t be undone.</p>
        {me.plan !== "free" && <p className="muted">Any time left on your paid plan is lost too.</p>}
        <form className="fld" onSubmit={submit}>
          {hasPassword && (
            <label className="fld">
              <span>Your password</span>
              <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
          )}
          <label className="check">
            <input type="checkbox" checked={sure} onChange={(e) => setSure(e.target.checked)} /> I understand my account will be deleted for good
          </label>
          {error && <p className="note-bad" role="alert">{error}</p>}
          <div className="inline">
            <a className="dpill light small" href="/account">Keep my account</a>
            <button className="dpill dark small" disabled={busy}>{busy ? "Deleting" : "Delete my account"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
