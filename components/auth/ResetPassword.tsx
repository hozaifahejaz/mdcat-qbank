"use client";

import { useEffect, useState } from "react";
import { authConfigured, supabase } from "@/lib/supabase";
import { HOME_AFTER_SIGN_IN, friendlyError } from "@/lib/auth";
import AuthFrame from "@/components/auth/AuthFrame";
import AfterSignIn from "@/components/auth/AfterSignIn";
import NotConfigured from "@/components/auth/NotConfigured";

/* The reset link signs the student in for this one purpose; here they choose the new password. */
export default function ResetPassword() {
  const [ready, setReady] = useState<"wait" | "ok" | "expired">("wait");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setReady(data.session ? "ok" : "expired"));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || busy) return;
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setBusy(true); setError("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(friendlyError(error));
    setDone(true);
  }

  if (!authConfigured) return <AuthFrame><NotConfigured /></AuthFrame>;
  if (done) return <AuthFrame><AfterSignIn next={HOME_AFTER_SIGN_IN} /></AuthFrame>;

  return (
    <AuthFrame>
      <div className="card auth-card">
        <div>
          <h1>Choose a new password</h1>
          <p className="lede">At least 8 characters. You&apos;ll stay signed in on this device.</p>
        </div>
        {ready === "expired" ? (
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
            <button className="pill pill-dark block" disabled={busy || ready !== "ok" || !password}>{busy ? "Saving…" : "Save and continue"}</button>
          </form>
        )}
      </div>
    </AuthFrame>
  );
}
