"use client";

import { useState } from "react";
import { type Device, friendlyError, removeDevice, signOut } from "@/lib/auth";
import DeviceList from "@/components/auth/DeviceList";

/* Shown when a third device signs in: pick one of the two registered devices to remove, or go back.
   The server allows one removal every 30 days; after that it's a support request. */
export default function DeviceLimit({ devices: initial, onFreed }: { devices: Device[]; onFreed: () => void }) {
  const [devices, setDevices] = useState(initial);
  const [confirm, setConfirm] = useState<Device | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove(d: Device) {
    setBusy(true); setError("");
    try {
      const res = await removeDevice(d.id);
      if (res.status === "removed") return onFreed();
      if (res.status === "swap_limit") {
        const date = new Date(res.next_allowed_at).toLocaleDateString("en-PK", { day: "numeric", month: "long" });
        setError(`You've already swapped a device in the last 30 days. You can swap again on ${date}, or contact support if you've lost a device.`);
      } else {
        setDevices(devices.filter((x) => x.id !== d.id));
      }
    } catch (e) {
      setError(friendlyError(e));
    }
    setBusy(false);
    setConfirm(null);
  }

  async function back() {
    await signOut();
    window.location.replace("/signin");
  }

  return (
    <div className="card state-card">
      <h1>This account already has two devices</h1>
      <p className="muted">To use it here, remove one of them. You can swap a device once every 30 days.</p>
      <DeviceList
        devices={devices}
        action={(d) => (
          <button type="button" className="pill pill-light small" disabled={busy} onClick={() => setConfirm(d)}>Remove</button>
        )}
      />
      {confirm && (
        <div className="note info" role="alertdialog" aria-label="Confirm removal">
          Remove <b>{confirm.label}</b>? It will be signed out, and your next swap opens in 30 days.
          <div className="actions" style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button type="button" className="pill pill-dark small" disabled={busy} onClick={() => remove(confirm)}>{busy ? "Removing…" : "Remove it"}</button>
            <button type="button" className="pill pill-light small" disabled={busy} onClick={() => setConfirm(null)}>Cancel</button>
          </div>
        </div>
      )}
      {error && <p className="note bad" role="alert">{error}</p>}
      <button type="button" className="linkish" onClick={back}>Not now, sign out</button>
    </div>
  );
}
