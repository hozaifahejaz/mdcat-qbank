"use client";

import { useEffect, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { authConfigured, supabase } from "@/lib/supabase";
import { friendlyError, readNext } from "@/lib/auth";
import AuthFrame from "@/components/auth/AuthFrame";
import AfterSignIn from "@/components/auth/AfterSignIn";
import NotConfigured from "@/components/auth/NotConfigured";

/* Where Google, Apple and email links land.
   - ?code=...            (Google, Apple, and email links opened in the same browser): the Supabase client swaps it
                          for a session on load, so this just waits for the session.
   - ?token_hash=&type=   (the email templates in docs/auth-setup.md): verified here, so links work on any device.
   - ?error=...           sent back to /signin with the reason. */
export default function Callback() {
  const [next, setNext] = useState<string | null>(null);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    if (!supabase) return;
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const err = params.get("error_description") || hash.get("error_description") || params.get("error") || hash.get("error");
    if (err) {
      window.location.replace(`/signin?error=${encodeURIComponent(err.replace(/\+/g, " "))}`);
      return;
    }
    const target = readNext();
    const tokenHash = params.get("token_hash");
    const type = params.get("type") as EmailOtpType | null;

    (async () => {
      if (tokenHash && type) {
        const { error } = await supabase!.auth.verifyOtp({ token_hash: tokenHash, type });
        if (error) return setProblem(friendlyError(error));
        if (type === "recovery") return window.location.replace("/reset-password");
      }
      const { data, error } = await supabase!.auth.getSession();
      if (error) return setProblem(friendlyError(error));
      if (!data.session) {
        return setProblem("This link has expired or was opened in a different browser. If you were confirming your email, it may already be confirmed, so try signing in.");
      }
      setNext(target);
    })();
  }, []);

  if (!authConfigured) return <AuthFrame><NotConfigured /></AuthFrame>;
  if (next) return <AuthFrame><AfterSignIn next={next} /></AuthFrame>;
  return (
    <AuthFrame>
      {problem ? (
        <div className="center-state">
          <div className="card state-card">
            <h1>That link didn&apos;t work</h1>
            <p className="muted">{problem}</p>
            <a className="pill pill-dark" href="/signin">Go to sign in</a>
          </div>
        </div>
      ) : (
        <div className="center-state" role="status" aria-live="polite">
          <div style={{ display: "grid", justifyItems: "center", gap: 14 }}>
            <div className="spinner" />
            <p className="muted">Signing you in…</p>
          </div>
        </div>
      )}
    </AuthFrame>
  );
}
