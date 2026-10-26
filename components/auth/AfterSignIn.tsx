"use client";

import { useEffect, useState } from "react";
import { type Device, claimDevice, friendlyError } from "@/lib/auth";
import DeviceLimit from "@/components/auth/DeviceLimit";

/* Runs once a session exists: makes this device the active one (locking the other), then goes to `next`.
   If the account already has two other devices, asks which one to remove first. */
export default function AfterSignIn({ next }: { next: string }) {
  const [limit, setLimit] = useState<Device[] | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    claimDevice()
      .then((res) => {
        if (!live) return;
        if (res.status === "active") window.location.replace(next);
        else setLimit(res.devices);
      })
      .catch((e) => live && setError(friendlyError(e)));
    return () => { live = false; };
  }, [next, attempt]);

  if (limit) return <DeviceLimit devices={limit} onFreed={() => { setLimit(null); setAttempt((n) => n + 1); }} />;
  if (error) {
    return (
      <div className="card state-card">
        <h1>We couldn&apos;t finish signing you in</h1>
        <p className="note bad" role="alert">{error}</p>
        <button type="button" className="pill pill-dark" onClick={() => { setError(""); setAttempt((n) => n + 1); }}>Try again</button>
      </div>
    );
  }
  return (
    <div className="center-state" role="status" aria-live="polite">
      <div style={{ display: "grid", justifyItems: "center", gap: 14 }}>
        <div className="spinner" />
        <p className="muted">Signing you in…</p>
      </div>
    </div>
  );
}
