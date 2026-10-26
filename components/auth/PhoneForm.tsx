"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatPhone, friendlyError, normalisePhone } from "@/lib/auth";
import Turnstile from "@/components/auth/Turnstile";

type Mode = "signin" | "signup";
const RESEND_AFTER = 60;

/* Phone number and a 6-digit SMS code. The same flow signs in an existing number or creates a new account,
   so a student who picks the "wrong" page still gets in. */
export default function PhoneForm({ mode, siteKey, onSignedIn }: { mode: Mode; siteKey: string; onSignedIn: () => void }) {
  const [name, setName] = useState("");
  const [raw, setRaw] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [wait, setWait] = useState(0);
  const [captcha, setCaptcha] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function send(number: string) {
    if (siteKey && !captcha) return setError("Please complete the check above.");
    setBusy(true); setError("");
    const token = captcha;
    setCaptchaReset((n) => n + 1);
    try {
      await api("/api/auth/phone/start", { body: { phone: number, captcha: token } });
      setPhone(number);
      setCode("");
      setWait(RESEND_AFTER);
    } catch (err) {
      setError(friendlyError(err));
    }
    setBusy(false);
  }

  function submitNumber(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (mode === "signup" && name.trim().length < 2) return setError("Please enter your name.");
    const number = normalisePhone(raw);
    if (!number) return setError("Enter a mobile number like 0300 1234567.");
    send(number);
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const token = code.replace(/\D/g, "");
    if (token.length !== 6) return setError("Enter the 6-digit code from the SMS.");
    setBusy(true); setError("");
    try {
      await api("/api/auth/phone/verify", { body: { phone, code: token, name: mode === "signup" ? name.trim() : "" } });
      onSignedIn();
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  }

  if (phone) {
    return (
      <form className="stack" onSubmit={submitCode} noValidate>
        <div className="sent-to">
          <span>Code sent to <b>{formatPhone(phone)}</b></span>
          <button type="button" className="linkish" onClick={() => { setPhone(""); setError(""); }}>Change</button>
        </div>
        <label className="field">
          <span>6-digit code</span>
          <input className="input otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus
            value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="••••••" />
        </label>
        {error && <p className="note bad" role="alert">{error}</p>}
        <button className="pill pill-dark block" disabled={busy || code.length !== 6}>{busy ? "Checking…" : "Verify and continue"}</button>
        <Turnstile siteKey={siteKey} onToken={setCaptcha} resetKey={captchaReset} />
        <p className="fine">
          No SMS?{" "}
          <button type="button" className="linkish" disabled={wait > 0 || busy} onClick={() => send(phone)}>
            {wait > 0 ? `Resend in ${wait}s` : "Resend code"}
          </button>
        </p>
      </form>
    );
  }

  return (
    <form className="stack" onSubmit={submitNumber} noValidate>
      {mode === "signup" && (
        <label className="field">
          <span>Full name</span>
          <input className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ayesha Khan" required />
        </label>
      )}
      <label className="field">
        <span>Mobile number</span>
        <div className="phone-in">
          <b aria-hidden="true">🇵🇰 +92</b>
          <input className="input" type="tel" inputMode="tel" autoComplete="tel-national" value={raw} onChange={(e) => setRaw(e.target.value)}
            placeholder="300 1234567" aria-describedby="phone-hint" required />
        </div>
      </label>
      <p id="phone-hint" className="fine">We&apos;ll text you a 6-digit code. Outside Pakistan? Type your number with its country code, like +44.</p>
      <Turnstile siteKey={siteKey} onToken={setCaptcha} resetKey={captchaReset} />
      {error && <p className="note bad" role="alert">{error}</p>}
      <button className="pill pill-dark block" disabled={busy || !raw}>{busy ? "Sending…" : "Send code"}</button>
    </form>
  );
}
