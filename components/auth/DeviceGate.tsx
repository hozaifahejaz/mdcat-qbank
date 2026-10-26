"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { type Device, checkDevice, claimDevice, friendlyError, signOut } from "@/lib/auth";
import DeviceLimit from "@/components/auth/DeviceLimit";
import { getCurrentUser } from "@/lib/user";

type State =
  | { kind: "loading" }
  | { kind: "active" }
  | { kind: "locked"; label: string | null }
  | { kind: "limit"; devices: Device[] }
  | { kind: "error"; message: string };

const CHECK_EVERY_MS = 30_000;

/* Wrap any signed-in page in this. It sends signed-out visitors to /signin, and enforces "one active device":
   it checks in every 30 seconds and whenever the tab comes back into view, and if another device has taken
   over it swaps the page for a lock screen with "Use it here". The server enforces the same rule on data
   (requireActiveSession in server/routes.ts), so this screen is the friendly half, not the only guard. */
export default function DeviceGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({ kind: "loading" });

  const claim = useCallback(async () => {
    const res = await claimDevice();
    setState(res.status === "active" ? { kind: "active" } : { kind: "limit", devices: res.devices });
  }, []);

  const toSignIn = useCallback(() => {
    const here = window.location.pathname + window.location.search;
    window.location.replace(`/signin?next=${encodeURIComponent(here)}`);
  }, []);

  const check = useCallback(async () => {
    try {
      const res = await checkDevice();
      if (res.status === "active") setState({ kind: "active" });
      else if (res.status === "locked") setState({ kind: "locked", label: res.active_label });
      else await claim();
    } catch (e) {
      // Signed out elsewhere (or this device was removed): back to sign-in.
      if (e instanceof ApiError && e.status === 401) return toSignIn();
      // A dropped connection shouldn't throw the student out; only a first load that fails shows an error.
      setState((s) => (s.kind === "loading" ? { kind: "error", message: friendlyError(e) } : s));
    }
  }, [claim, toSignIn]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    getCurrentUser().then((user) => {
      if (!user) return toSignIn();
      check();
      timer = setInterval(() => { if (document.visibilityState === "visible") check(); }, CHECK_EVERY_MS);
    });
    const onVisible = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [check, toSignIn]);

  if (state.kind === "active") return <>{children}</>;
  if (state.kind === "limit") {
    return <div className="center-state"><DeviceLimit devices={state.devices} onFreed={() => { setState({ kind: "loading" }); claim(); }} /></div>;
  }
  if (state.kind === "locked") return <Locked label={state.label} onTakeOver={() => claim().catch((e) => setState({ kind: "error", message: friendlyError(e) }))} />;
  if (state.kind === "error") {
    return (
      <div className="center-state">
        <div className="card state-card">
          <h1>We couldn&apos;t load your account</h1>
          <p className="note bad" role="alert">{state.message}</p>
          <button type="button" className="pill pill-dark" onClick={() => { setState({ kind: "loading" }); check(); }}>Try again</button>
        </div>
      </div>
    );
  }
  return (
    <div className="center-state" role="status" aria-live="polite">
      <div className="spinner" aria-label="Loading" />
    </div>
  );
}

function Locked({ label, onTakeOver }: { label: string | null; onTakeOver: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="center-state">
      <div className="card state-card" role="alertdialog" aria-labelledby="lock-h">
        <span className="lock-ic">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></svg>
        </span>
        <h1 id="lock-h">Your account is active on another device</h1>
        <p className="muted">
          {label ? <>It&apos;s in use on <b style={{ color: "var(--ink)" }}>{label}</b>. </> : null}
          Only one device can use the account at a time. Use it here instead? The other device will be paused, and any test you had open there is saved.
        </p>
        <div className="actions">
          <button type="button" className="pill pill-dark" disabled={busy} onClick={() => { setBusy(true); onTakeOver(); }}>
            {busy ? "Switching…" : "Use it here"}
          </button>
          <button type="button" className="pill pill-light" onClick={async () => { await signOut(); window.location.replace("/"); }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}
