"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { fresh } from "@/lib/cache";
import { type Device, formatPhone, friendlyError, myDevices, removeDevice, signOut } from "@/lib/auth";
import { planNames } from "@/lib/format";
import { type AccountUser, knowUser } from "@/lib/user";
import AppShell, { AccountTabs, PageHead } from "@/components/app/AppShell";
import DeviceList from "@/components/auth/DeviceList";

const providerName: Record<string, string> = { email: "Email and password", phone: "Phone (SMS code)", google: "Google", apple: "Apple" };

/* /account, in the app frame: name, how they sign in, their two devices (with the 30-day swap rule), and sign out. */
export default function Account() {
  return <AppShell active="/account">{(user) => <AccountBody me={user} />}</AppShell>;
}

function AccountBody({ me }: { me: AccountUser }) {
  const [user, setUser] = useState<AccountUser>(me);
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [name, setName] = useState(me.name ?? "");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [pw, setPw] = useState({ current: "", next: "", note: "", bad: "", busy: false });

  useEffect(() => {
    // The list as last seen shows at once; the fresh one follows.
    fresh("devices", myDevices, setDevices, true).catch((e) => setError(friendlyError(e)));
  }, []);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setSaved(""); setError("");
    const full = name.trim();
    if (full.length < 2) return setError("Please enter your name.");
    try {
      const res = await api<{ user: AccountUser }>("/api/auth/me", { method: "PATCH", body: { name: full } });
      setUser(res.user);
      knowUser(res.user);
      setSaved("Saved.");
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.next.length < 8) return setPw({ ...pw, note: "", bad: "Use at least 8 characters for your new password." });
    setPw({ ...pw, note: "", bad: "", busy: true });
    try {
      await api("/api/auth/change-password", { body: { current: pw.current, password: pw.next } });
      setPw({ current: "", next: "", note: "Password changed. Any other device is signed out.", bad: "", busy: false });
    } catch (err) {
      setPw({ ...pw, note: "", bad: friendlyError(err), busy: false });
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
    <div className="dgrid acct">
      <PageHead title="Account" />
      <AccountTabs active="/account" />

      <div className="cols even">
      <section className="dcard panel">
        <h2 className="panel-title">Your details</h2>
        <dl className="kv">
          {user.email && <><dt>Email</dt><dd>{user.email}</dd></>}
          {user.phone && <><dt>Phone</dt><dd>{formatPhone(user.phone)}</dd></>}
          <dt>Signs in with</dt><dd>{user.methods.map((m) => providerName[m] ?? m).join(", ")}</dd>
          <dt>Plan</dt><dd>{planNames[user.plan]}</dd>
        </dl>
        <form className="fld" onSubmit={saveName}>
          <span>Name</span>
          <div className="inline">
            <input autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); setSaved(""); }} />
            <button className="dpill dark small">Save</button>
          </div>
          {saved && <span className="muted small" role="status">{saved}</span>}
        </form>
        {user.methods.includes("email") && (
          <form className="fld" onSubmit={changePassword}>
            <span>Change password</span>
            <input type="password" autoComplete="current-password" placeholder="Current password" aria-label="Current password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value, note: "", bad: "" })} />
            <div className="inline">
              <input type="password" autoComplete="new-password" placeholder="New password" aria-label="New password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value, note: "", bad: "" })} />
              <button className="dpill dark small" disabled={pw.busy || !pw.current || !pw.next}>{pw.busy ? "Saving" : "Change"}</button>
            </div>
            {pw.note && <span className="muted small" role="status">{pw.note}</span>}
            {pw.bad && <span className="note-bad" role="alert">{pw.bad}</span>}
          </form>
        )}
        <p className="muted small">To change your email, <a className="link" href="/contact?topic=account">message support</a> from your current address.</p>
      </section>

      <section className="dcard panel">
        <div>
          <h2 className="panel-title">Devices</h2>
          <p className="muted">Up to two devices, one in use at a time. Removing a device frees its slot; you can do that once every 30 days.</p>
        </div>
        {devices ? (
          <DeviceList
            devices={devices}
            action={(d) => d.active
              ? <span className="muted small">This device</span>
              : <button type="button" className="dpill light small" disabled={busyId === d.id} onClick={() => remove(d)}>{busyId === d.id ? "Removing" : "Remove"}</button>}
          />
        ) : !error && <div className="sk" style={{ height: 120 }} />}
        {error && <p className="note-bad" role="alert">{error}</p>}
      </section>
      </div>

      <section className="dcard panel acct-out">
        <p className="muted">Signing out here frees this device&apos;s slot for your other one.</p>
        <button type="button" className="dpill light small" onClick={async () => { await signOut(); window.location.replace("/"); }}>Sign out</button>
      </section>

      {user.role === "student" && (
        <p className="muted small">Want to leave for good? <a href="/account/delete">Delete your account</a></p>
      )}
    </div>
  );
}
