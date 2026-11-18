"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type Device, type Entered, claimDevice, friendlyError } from "@/lib/auth";
import DeviceLimit from "@/components/auth/DeviceLimit";
import { admitted } from "@/components/auth/DeviceGate";
import { inAppPath } from "@/lib/paths";
import { getCurrentUser, knowUser } from "@/lib/user";

/* Runs once a session exists: makes this device the active one (locking the other), then goes to `next`.
   If the account already has two other devices, asks which one to remove first.
   A sign-in from the forms has done both already in its one request (`entered`), so this only has to open the page:
   in place, without loading the site again, with the account already known to the frame. */
export default function AfterSignIn({ next, entered }: { next: string; entered?: Entered }) {
  const [limit, setLimit] = useState<Device[] | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let live = true;
    // After a device was removed to make room, the claim is made again; the first answer no longer stands.
    const first = attempt === 0 ? entered : undefined;
    Promise.all([first?.device ?? claimDevice(), first?.user ?? getCurrentUser()])
      .then(([res, user]) => {
        if (!live) return;
        if (res.status === "device_limit") return setLimit(res.devices);
        // Nothing the last person to use this browser saw is shown to the next: remembering a different account
        // empties what was kept (lib/user.ts). The same student signing in again opens with their own last numbers.
        if (user) knowUser(user);
        if (res.status === "active" && user) admitted();
        // "takeover_limit": the page's own gate explains.
        if (inAppPath(next)) router.replace(next);
        else window.location.replace(next);
      })
      .catch((e) => live && setError(friendlyError(e)));
    return () => { live = false; };
  }, [next, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

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
