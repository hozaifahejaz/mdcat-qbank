"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { HOME_AFTER_SIGN_IN, friendlyError } from "@/lib/auth";
import AuthFrame from "@/components/auth/AuthFrame";
import AfterSignIn from "@/components/auth/AfterSignIn";

/* The reset link brings a one-hour token; here the student chooses the new password, which also
   signs out every other session. */
export default function ResetPassword() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token") ?? "";
    setToken(t);
    if (!t) setExpired(true);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setBusy(true); setError("");
    try {
      await api("/api/auth/reset", { body: { token, password } });
      setDone(true);
    } catch (err) {
      setError(friendlyError(err));
      if ((err as { code?: string }).code === "link_expired") setExpired(true);
      setBusy(false);
    }
  }

  if (done) return <AuthFrame><AfterSignIn next={HOME_AFTER_SIGN_IN} /></AuthFrame>;

  return (
    <AuthFrame>
      <div className="card auth-card">
        <div>
          <h1>Choose a new password</h1>
          <p className="lede">At least 8 characters. This signs you out everywhere else.</p>
        </div>
        {expired ? (
          <>
            <p className="note bad" role="alert">This reset link has expired or was already used. Request a new one.</p>
            <a className="pill pill-dark block" href="/forgot-password">Send a new link</a>
          </>
        ) : (
          <form className="stack" onSubmit={submit} noValidate>
            <label className="field">
              <span>New password</span>
              <input className="input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </label>
            <label className="field">
              <span>Type it again</span>
              <input className="input" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} />
            </label>
            {error && <p className="note bad" role="alert">{error}</p>}
            <button className="pill pill-dark block" disabled={busy || !token || !password}>{busy ? "Saving…" : "Save and continue"}</button>
          </form>
        )}
      </div>
    </AuthFrame>
  );
}
