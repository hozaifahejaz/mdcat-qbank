"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { friendlyError, readNext } from "@/lib/auth";
import { getCurrentUser } from "@/lib/user";
import AuthFrame from "@/components/auth/AuthFrame";
import AfterSignIn from "@/components/auth/AfterSignIn";

/* Where Google, Apple and email links land.
   - ?verify=<token>  an email confirmation link. Confirmed here with a POST, not by the link itself, so mail
                      scanners that open links can't use it up.
   - ?error=...       sent back to /signin with the reason.
   - otherwise        Google and Apple have already signed the browser in; this runs the device check. */
export default function Callback() {
  const [next, setNext] = useState<string | null>(null);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) {
      window.location.replace(`/signin?error=${encodeURIComponent(err)}`);
      return;
    }
    const target = readNext();
    const token = params.get("verify");
    (async () => {
      if (token) {
        try {
          await api("/api/auth/verify-email", { body: { token } });
        } catch (e) {
          return setProblem(`${friendlyError(e)} If you already confirmed it, just sign in.`);
        }
        return setNext(target);
      }
      if (await getCurrentUser()) setNext(target);
      else setProblem("Sign-in didn't complete. Please try again.");
    })();
  }, []);

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
