"use client";

import { useState } from "react";
import { ApiError, api } from "@/lib/api";
import { friendlyError } from "@/lib/auth";
import Turnstile from "@/components/auth/Turnstile";

type Mode = "signin" | "signup";

/* Email and password. Sign-up emails a confirmation link (it lands on /auth/callback); sign-in is immediate. */
export default function EmailForm({ mode, next, siteKey, onSignedIn }: { mode: Mode; next: string; siteKey: string; onSignedIn: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [info, setInfo] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  const needCaptcha = Boolean(siteKey) && !captcha;
  const spend = () => { const t = captcha; setCaptchaReset((n) => n + 1); return t; };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(""); setInfo(""); setUnconfirmed(false);
    if (mode === "signup" && name.trim().length < 2) return setError("Please enter your name.");
    if (mode === "signup" && password.length < 8) return setError("Use at least 8 characters for your password.");
    if (needCaptcha) return setError("Please complete the check above.");
    setBusy(true);
    const addr = email.trim().toLowerCase();
    try {
      if (mode === "signup") {
        await api("/api/auth/signup", { body: { name: name.trim(), email: addr, password, next, captcha: spend() } });
        setSentTo(addr);
      } else {
        await api("/api/auth/signin", { body: { email: addr, password, captcha: spend() } });
        onSignedIn();
      }
    } catch (err) {
      setUnconfirmed(err instanceof ApiError && err.code === "email_not_confirmed");
      setError(friendlyError(err));
    }
    setBusy(false);
  }

  async function resend() {
    if (needCaptcha) return setError("Please complete the check above, then resend.");
    setError(""); setInfo("");
    try {
      await api("/api/auth/resend-verification", { body: { email: (sentTo || email).trim().toLowerCase(), next, captcha: spend() } });
      setInfo("Sent again. It can take a minute, and check your spam folder.");
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  if (sentTo) {
    return (
      <div className="stack">
        <p className="note good">We sent a confirmation link to <b>{sentTo}</b>. Open it to finish creating your account.</p>
        <p className="fine">Nothing arrived? Check spam, or resend it.</p>
        <Turnstile siteKey={siteKey} onToken={setCaptcha} resetKey={captchaReset} />
        <button type="button" className="pill pill-light block" onClick={resend}>Resend the link</button>
        {info && <p className="note info" role="status">{info}</p>}
        {error && <p className="note bad" role="alert">{error}</p>}
        <button type="button" className="linkish" onClick={() => { setSentTo(""); setInfo(""); setError(""); }}>Use a different email</button>
      </div>
    );
  }

  return (
    <form className="stack" onSubmit={submit} noValidate>
      {mode === "signup" && (
        <label className="field">
          <span>Full name</span>
          <input className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ayesha Khan" required />
        </label>
      )}
      <label className="field">
        <span>Email</span>
        <input className="input" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
      </label>
      <div className="field">
        <div className="row">
          <label htmlFor="pw" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Password</label>
          {mode === "signin" && <a href="/forgot-password">Forgot password?</a>}
        </div>
        <div className="pw">
          <input id="pw" className="input" type={show ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signup" ? "At least 8 characters" : ""} required minLength={mode === "signup" ? 8 : undefined} />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>{show ? "Hide" : "Show"}</button>
        </div>
      </div>
      <Turnstile siteKey={siteKey} onToken={setCaptcha} resetKey={captchaReset} />
      {error && (
        <p className="note bad" role="alert">
          {error}
          {unconfirmed && <> <button type="button" className="linkish" onClick={resend}>Resend the link</button></>}
        </p>
      )}
      {info && <p className="note info" role="status">{info}</p>}
      <button className="pill pill-dark block" disabled={busy || !email || !password}>
        {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
