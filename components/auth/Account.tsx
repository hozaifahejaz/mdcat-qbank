"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { type Device, formatPhone, friendlyError, myDevices, removeDevice, signOut } from "@/lib/auth";
import { type AccountUser, getCurrentUser } from "@/lib/user";
import AuthFrame from "@/components/auth/AuthFrame";
import DeviceGate from "@/components/auth/DeviceGate";
import DeviceList from "@/components/auth/DeviceList";

const providerName: Record<string, string> = { email: "Email and password", phone: "Phone (SMS code)", google: "Google", apple: "Apple" };

/* Name, how they sign in, their two devices (with the 30-day swap rule), and sign out. */
export default function Account() {
  return (
    <AuthFrame top={{ label: "Dashboard", href: "/dashboard" }}>
      <DeviceGate>
        <AccountBody />
      </DeviceGate>
    </AuthFrame>
  );
}

function AccountBody() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    getCurrentUser().then((u) => { setUser(u); setName(u?.name ?? ""); });
    myDevices().then(setDevices).catch((e) => setError(friendlyError(e)));
  }, []);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaved(""); setError("");
    const full = name.trim();
    if (full.length < 2) return setError("Please enter your name.");
    try {
      const res = await api<{ user: AccountUser }>("/api/auth/me", { method: "PATCH", body: { name: full } });
      setUser(res.user);
      setSaved("Saved.");
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  async function remove(d: Device) {
    if (!window.confirm(`Remove ${d.label}? It will be signed out, and you can only swap a device once every 30 days.`)) return;
    setBusyId(d.id); setError("");
    try {
      const res = await removeDevice(d.id);
      if (res.status === "removed") setDevices(res.devices);
      else if (res.status === "swap_limit") {
        const date = new Date(res.next_allowed_at).toLocaleDateString("en-PK", { day: "numeric", month: "long" });
        setError(`You've already swapped a device in the last 30 days. You can remove one again on ${date}.`);
      }
    } catch (e) {
      setError(friendlyError(e));
    }
    setBusyId("");
  }

  return (
    <div className="acct" style={{ width: "100%" }}>
      <section className="card">
        <h2>Your account</h2>
        <dl className="kv">
          {user?.email && <><dt>Email</dt><dd>{user.email}</dd></>}
          {user?.phone && <><dt>Phone</dt><dd>{formatPhone(user.phone)}</dd></>}
          <dt>Signs in with</dt><dd>{user ? user.methods.map((m) => providerName[m] ?? m).join(", ") : "…"}</dd>
          <dt>Plan</dt><dd style={{ textTransform: "capitalize" }}>{user?.plan ?? "…"}</dd>
        </dl>
        <form className="field" onSubmit={saveName}>
          <span>Name</span>
          <div className="inline">
            <input className="input" autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); setSaved(""); }} />
            <button className="pill pill-dark">Save</button>
          </div>
          {saved && <span className="fine" role="status">{saved}</span>}
        </form>
      </section>

      <section className="card">
        <div>
          <h2>Devices</h2>
          <p className="muted" style={{ marginTop: 6 }}>Up to two devices, one in use at a time. Removing a device frees its slot; you can do that once every 30 days.</p>
        </div>
        <DeviceList
          devices={devices}
          action={(d) => d.active
            ? <span className="fine">This device</span>
            : <button type="button" className="pill pill-light small" disabled={busyId === d.id} onClick={() => remove(d)}>{busyId === d.id ? "Removing…" : "Remove"}</button>}
        />
        {error && <p className="note bad" role="alert">{error}</p>}
      </section>

      <section className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <p className="muted">Signing out here frees this device&apos;s slot for your other one.</p>
        <button type="button" className="pill pill-light" onClick={async () => { await signOut(); window.location.replace("/"); }}>Sign out</button>
      </section>
    </div>
  );
}
