"use client";

import { useEffect, useState } from "react";
import { type AuthConfig, api, getAuthConfig } from "@/lib/api";
import { friendlyError } from "@/lib/auth";
import AuthFrame from "@/components/auth/AuthFrame";
import NotConfigured from "@/components/auth/NotConfigured";
import Turnstile from "@/components/auth/Turnstile";

/* Email a reset link. The reply is the same whether or not the email has an account, so this page
   can't be used to find out who has signed up. */
export default function ForgotPassword() {
  const [config, setConfig] = useState<AuthConfig | null | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const siteKey = config?.turnstileSiteKey ?? "";

  useEffect(() => { getAuthConfig().then(setConfig); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (siteKey && !captcha) return setError("Please complete the check above.");
    setBusy(true); setError("");
    const token = captcha;
    setCaptchaReset((n) => n + 1);
    try {
      await api("/api/auth/forgot", { body: { email: email.trim().toLowerCase(), captcha: token } });
      setSent(true);
    } catch (err) {
      setError(friendlyError(err));
    }
    setBusy(false);
  }

  const top = { hint: "Remembered it?", label: "Sign in", href: "/signin?method=email" };
  if (config === null || config?.email === false) return <AuthFrame top={top}><NotConfigured /></AuthFrame>;

  return (
    <AuthFrame top={top}>
      <div className="card auth-card">
        <div>
          <h1>Reset your password</h1>
          <p className="lede">Enter the email you signed up with and we&apos;ll send you a link to choose a new password.</p>
        </div>
        {sent ? (
          <p className="note good" role="status">If <b>{email.trim()}</b> has an account, a reset link is on its way. It can take a minute, and check your spam folder.</p>
        ) : (
          <form className="stack" onSubmit={submit} noValidate>
            <label className="field">
              <span>Email</span>
              <input className="input" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </label>
            <Turnstile siteKey={siteKey} onToken={setCaptcha} resetKey={captchaReset} />
            {error && <p className="note bad" role="alert">{error}</p>}
            <button className="pill pill-dark block" disabled={busy || !email}>{busy ? "Sending…" : "Send reset link"}</button>
          </form>
        )}
        <p className="fine">Signed up with your phone number, Google or Apple? You don&apos;t need a password. <a href="/signin">Sign in that way</a> instead.</p>
      </div>
    </AuthFrame>
  );
}
