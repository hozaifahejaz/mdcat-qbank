"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, type AuthConfig, api, getAuthConfig, lastAuthConfig } from "@/lib/api";
import { type Entered, friendlyError, readNext, signInError, thisDevice } from "@/lib/auth";
import { inAppPath, whenShown } from "@/lib/paths";
import { type AccountUser, getCurrentUser } from "@/lib/user";
import { site } from "@/lib/site";
import { Markhor } from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import AfterSignIn from "@/components/auth/AfterSignIn";
import NotConfigured from "@/components/auth/NotConfigured";
import Turnstile from "@/components/auth/Turnstile";
import Ridge, { type Step } from "@/components/experiment5/Ridge";

/* Sign-in experiment 5 (app/experiments/5). The page is a mountain: each part of signing in is a ledge the markhor
   climbs to, so the form shows how far along you are without a word of instruction. The sign-in itself is the live
   one: /api/auth/signin with this device in the same request, Google through /api/auth/oauth/google, then
   AfterSignIn for the device check and the way in. */

const LAST = "x5-last-method";
const looksLikeEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());

function greeting(h: number) {
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 22) return "Good evening";
  return "Studying late";
}

export default function Ascent() {
  const router = useRouter();
  const [next, setNext] = useState("/dashboard");
  const [config, setConfig] = useState<AuthConfig | null>(site.signIn);
  const [hello, setHello] = useState("");
  const [last, setLast] = useState<"google" | "email" | null>(null);
  const [already, setAlready] = useState<AccountUser | null>(null);
  const [entered, setEntered] = useState<Entered | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState("");
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [info, setInfo] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const [slip, setSlip] = useState(0);
  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const to = readNext();
    setNext(to);
    if (inAppPath(to)) router.prefetch(to);
    setHello(greeting(new Date().getHours()));
    try { const m = localStorage.getItem(LAST); if (m === "google" || m === "email") setLast(m); } catch {}
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) setError(signInError(params.get("error")!));
    setConfig(lastAuthConfig());
    getAuthConfig().then(setConfig);
    // Already signed in: say so and offer the way in, rather than leaving the page at once.
    whenShown(() => getCurrentUser().then((u) => u && setAlready(u)));
  }, [router]);

  const remember = (m: "google" | "email") => { try { localStorage.setItem(LAST, m); } catch {} };
  const siteKey = config?.turnstileSiteKey ?? "";
  const needCaptcha = Boolean(siteKey) && !captcha;
  const spend = () => { const t = captcha; setCaptchaReset((n) => n + 1); return t; };

  // How far up the ridge: a ledge for a real-looking email, one for a password, the summit once signing in.
  const step: Step = entered || busy ? 3 : looksLikeEmail(email) ? (password ? 2 : 1) : 0;

  function fall(msg: string) {
    setError(msg);
    setSlip((n) => n + 1);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(""); setInfo(""); setUnconfirmed(false);
    if (!looksLikeEmail(email)) { emailRef.current?.focus(); return fall("Enter the email you signed up with."); }
    if (!password) { pwRef.current?.focus(); return fall("Enter your password."); }
    if (needCaptcha) return fall("Please complete the check above.");
    setBusy("email");
    try {
      const res = await api<Entered>("/api/auth/signin", { body: { email: email.trim().toLowerCase(), password, captcha: spend(), ...thisDevice() } });
      remember("email");
      setEntered(res);
      return;
    } catch (err) {
      setUnconfirmed(err instanceof ApiError && err.code === "email_not_confirmed");
      fall(friendlyError(err));
    }
    setBusy(null);
  }

  async function resend() {
    if (needCaptcha) return setError("Please complete the check above, then resend.");
    setError(""); setInfo("");
    try {
      await api("/api/auth/resend-verification", { body: { email: email.trim().toLowerCase(), next, captcha: spend() } });
      setInfo("Sent again. It can take a minute, and check your spam folder.");
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  function google() {
    if (busy) return;
    setBusy("google");
    remember("google");
    window.location.assign(`/api/auth/oauth/google?next=${encodeURIComponent(next)}`);
  }

  const signupHref = next === "/dashboard" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`;

  let panel: React.ReactNode;
  if (entered) panel = <div className="x5-after"><AfterSignIn next={next} entered={entered} /></div>;
  else if (config === null) panel = <NotConfigured />;
  else panel = (
    <>
      <div className="x5-head">
        <p className="x5-hello">{hello || " "}</p>
        <h1>Welcome back</h1>
        <p className="x5-lede">Sign in and pick up where you left off.</p>
      </div>

      {already && (
        <div className="x5-already">
          <span>Signed in as <b>{already.name.split(" ")[0]}</b></span>
          <button type="button" onClick={() => setEntered({ user: already })}>Continue</button>
        </div>
      )}

      {config.google && (
        <>
          <button type="button" className="x5-google" onClick={google} disabled={busy !== null}>
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
            {busy === "google" ? "Opening Google…" : "Continue with Google"}
            {last === "google" && busy !== "google" && <em>Last used</em>}
          </button>
          <div className="x5-or"><span>or with email</span></div>
        </>
      )}

      <form className="x5-form" onSubmit={submit} noValidate>
        <label className="x5-field">
          <span>Email</span>
          <input ref={emailRef} type="email" inputMode="email" autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <i className={`x5-tick${looksLikeEmail(email) ? " on" : ""}`} aria-hidden="true" />
        </label>
        <div className="x5-field">
          <div className="x5-row">
            <label htmlFor="x5-pw">Password</label>
            <a href="/forgot-password">Forgot?</a>
          </div>
          <div className="x5-pw">
            <input id="x5-pw" ref={pwRef} type={show ? "text" : "password"} autoComplete="current-password" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>{show ? "Hide" : "Show"}</button>
          </div>
        </div>
        <Turnstile siteKey={siteKey} onToken={setCaptcha} resetKey={captchaReset} />
        {error && (
          <p className="x5-note bad" role="alert">
            {error}
            {unconfirmed && <> <button type="button" className="x5-link" onClick={resend}>Resend the link</button></>}
          </p>
        )}
        {info && <p className="x5-note info" role="status">{info}</p>}
        <button className="x5-go" disabled={busy !== null}>
          {busy === "email" ? "Signing in…" : "Sign in"}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </form>

      <p className="x5-new">New to {site.name}? <a href={signupHref}>Create a free account</a></p>
    </>
  );

  return (
    <div className="x5">
      <div className="x5-scene">
        <Ridge step={step} slip={slip} />
      </div>
      <div className="x5-side">
        <header className="x5-top">
          <a className="x5-logo" href="/"><Markhor height={30} />{site.name}</a>
          <ThemeToggle />
        </header>
        <main className="x5-main">{panel}</main>
        <footer className="x5-foot">{site.name} is independent and not affiliated with PMDC, NUMS or any university.</footer>
      </div>
    </div>
  );
}
