"use client";

import { useEffect, useState } from "react";
import { authConfigured, supabase } from "@/lib/supabase";
import { readNext } from "@/lib/auth";
import AuthFrame from "@/components/auth/AuthFrame";
import AfterSignIn from "@/components/auth/AfterSignIn";
import EmailForm from "@/components/auth/EmailForm";
import NotConfigured from "@/components/auth/NotConfigured";
import PhoneForm from "@/components/auth/PhoneForm";
import ProviderButtons from "@/components/auth/ProviderButtons";

type Mode = "signin" | "signup";
type Method = "phone" | "email";

const copy = {
  signin: { title: "Welcome back", lede: "Sign in to pick up where you left off.", switchText: "New here?", switchLabel: "Create an account", switchHref: "/signup" },
  signup: { title: "Create your account", lede: "Start free. Upgrade to the season pass when you're ready.", switchText: "Already have an account?", switchLabel: "Sign in", switchHref: "/signin" },
};

/* Sign in and sign up share one screen: Google and Apple on top, then phone (SMS code) or email and password. */
export default function AuthPage({ mode }: { mode: Mode }) {
  const [next, setNext] = useState("/dashboard");
  const [method, setMethod] = useState<Method>("phone");
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const c = copy[mode];

  useEffect(() => {
    setNext(readNext());
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) setError(params.get("error")!);
    if (params.get("method") === "email") setMethod("email");
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSignedIn(true);
      setReady(true);
    });
  }, []);

  const switchHref = next === "/dashboard" ? c.switchHref : `${c.switchHref}?next=${encodeURIComponent(next)}`;
  const top = { hint: c.switchText, label: c.switchLabel, href: switchHref };

  if (!authConfigured) return <AuthFrame top={top}><NotConfigured /></AuthFrame>;
  if (signedIn) return <AuthFrame><AfterSignIn next={next} /></AuthFrame>;

  return (
    <AuthFrame side top={top}>
      <div className="card auth-card" aria-busy={!ready}>
        <div>
          <h1>{c.title}</h1>
          <p className="lede">{c.lede}</p>
        </div>
        <ProviderButtons next={next} onError={setError} />
        <div className="or">or</div>
        <div className="tabs" role="tablist" aria-label="Sign-in method">
          <button type="button" role="tab" aria-selected={method === "phone"} onClick={() => { setMethod("phone"); setError(""); }}>Phone</button>
          <button type="button" role="tab" aria-selected={method === "email"} onClick={() => { setMethod("email"); setError(""); }}>Email</button>
        </div>
        {error && <p className="note bad" role="alert">{error}</p>}
        <div role="tabpanel">
          {method === "phone"
            ? <PhoneForm key={`p-${mode}`} mode={mode} onSignedIn={() => setSignedIn(true)} />
            : <EmailForm key={`e-${mode}`} mode={mode} next={next} onSignedIn={() => setSignedIn(true)} />}
        </div>
        {mode === "signup" && (
          <p className="fine">
            By creating an account you agree to our Terms and Fair Use policy: one account per student, up to two devices,
            and no sharing or copying of questions.
          </p>
        )}
        <p className="switch">{c.switchText} <a href={switchHref}>{c.switchLabel}</a></p>
      </div>
    </AuthFrame>
  );
}
