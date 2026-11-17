"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { type Device, checkDevice, claimDevice, friendlyError, signOut } from "@/lib/auth";
import DeviceLimit from "@/components/auth/DeviceLimit";
import { forgetAll, keep, seen } from "@/lib/cache";
import { getCurrentUser, lastUser } from "@/lib/user";

type State =
  | { kind: "loading" }
  | { kind: "active" }
  | { kind: "locked"; label: string | null }
  | { kind: "limit"; devices: Device[] }
  | { kind: "switches"; until: string }
  | { kind: "error"; message: string };

const CHECK_EVERY_MS = 30_000;
/* Set once this tab has been let in, so the next page shows at once while the check runs behind it. */
const LET_IN = "let-in";
/* When this tab last heard "active" from the server. Moving to another page within the check interval doesn't ask
   again: the 30-second check carries on from the new page, and the server checks every data request itself. */
let checkedAt = 0;

/* Wrap any signed-in page in this. It sends signed-out visitors to /signin, and enforces "one active device":
   it checks in every 30 seconds and whenever the tab comes back into view, and if another device has taken
   over it swaps the page for a lock screen with "Use it here". A tab that was let in a moment ago shows the next
   page straight away and checks behind it, so moving around never waits. The server enforces the same rule on data
   (requireActiveSession in server/routes.ts), so this screen is the friendly half, not the only guard. */
export default function DeviceGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({ kind: "loading" });

  const claim = useCallback(async () => {
    const res = await claimDevice();
    keep(LET_IN, res.status === "active", true);
    checkedAt = res.status === "active" ? Date.now() : 0;
    setState(res.status === "active" ? { kind: "active" } : res.status === "takeover_limit" ? { kind: "switches", until: res.next_allowed_at } : { kind: "limit", devices: res.devices });
  }, []);

  const toSignIn = useCallback(() => {
    const here = window.location.pathname + window.location.search;
    forgetAll();
    window.location.replace(`/signin?next=${encodeURIComponent(here)}`);
  }, []);

  const check = useCallback(async () => {
    try {
      const res = await checkDevice();
      checkedAt = res.status === "active" ? Date.now() : 0;
      if (res.status === "active") { keep(LET_IN, true, true); setState({ kind: "active" }); }
      else if (res.status === "locked") { keep(LET_IN, false, true); setState({ kind: "locked", label: res.active_label }); }
      else await claim();
    } catch (e) {
      checkedAt = 0;
      // Signed out elsewhere (or this device was removed): back to sign-in.
      if (e instanceof ApiError && e.status === 401) return toSignIn();
      // A dropped connection shouldn't throw the student out; only a first load that fails shows an error.
      setState((s) => (s.kind === "loading" ? { kind: "error", message: friendlyError(e) } : s));
    }
  }, [claim, toSignIn]);

  // Before the first paint, so a tab that is already let in never flashes the spinner.
  useLayoutEffect(() => {
    if (seen<boolean>(LET_IN, true) && lastUser()) setState((s) => (s.kind === "loading" ? { kind: "active" } : s));
  }, []);

  useEffect(() => {
    // Who is signed in and whether this device may use the account are asked together, not one after the other.
    const letIn = seen<boolean>(LET_IN, true) && lastUser();
    if (!letIn || Date.now() - checkedAt > CHECK_EVERY_MS) {
      getCurrentUser().then((user) => { if (!user && !navigator.onLine) return; if (!user) toSignIn(); });
      check();
    }
    const timer = setInterval(() => { if (document.visibilityState === "visible") check(); }, CHECK_EVERY_MS);
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
  if (state.kind === "switches") {
    return (
      <div className="center-state">
        <div className="card state-card" role="alert">
          <h1>Your account is in use on your other device</h1>
          <p className="muted">It has moved between devices several times today, so it stays on the other one for now. You can use it here again after {new Date(state.until).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}, or carry on there.</p>
          <div className="actions">
            <button type="button" className="pill pill-dark" onClick={() => { setState({ kind: "loading" }); check(); }}>Try again</button>
            <button type="button" className="pill pill-light" onClick={async () => { await signOut(); window.location.replace("/"); }}>Sign out</button>
          </div>
        </div>
      </div>
    );
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
