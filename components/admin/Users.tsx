"use client";

import { useCallback, useEffect, useState } from "react";
import Empty from "@/components/app/Empty";
import { friendlyError } from "@/lib/auth";
import { type AdminUser, type UserDetail, actionNames, getUser, listUsers, resetDevices, setPlan, setRole, signOutUser } from "@/lib/admin";
import { day, fullDay, planNames } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { type Role, roleNames, roles } from "@/lib/qc";
import type { AccountUser } from "@/lib/user";

const filters = [
  { id: "", label: "Everyone" },
  { id: "paid", label: "Paid" },
  { id: "free", label: "Free" },
  { id: "staff", label: "Staff" },
];

const planActive = (u: AdminUser) => u.plan !== "free" && (!u.planExpiresAt || Date.parse(u.planExpiresAt) > Date.now());
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/* /admin/users — find an account, give it a plan by hand, change its role, or clear its devices. Admins only. */
export default function Users({ user: me }: { user: AccountUser }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [err, setErr] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const load = useCallback(() => listUsers(q, filter).then(setUsers, (e) => setErr(friendlyError(e))), [q, filter]);
  useEffect(() => { const t = setTimeout(load, q ? 250 : 0); return () => clearTimeout(t); }, [load, q]);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("id")) setSel(p.get("id"));
    if (p.get("q")) setQ(p.get("q")!);
  }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3000); return () => clearTimeout(t); } }, [toast]);

  return (
    <>
      <div className="q-head">
        <nav className="stage-tabs" aria-label="Filter">
          {filters.map((f) => <button key={f.id} type="button" className="stab" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>)}
        </nav>
        <input type="search" className="user-search" placeholder="Search name, email, phone or account ID" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search accounts" />
      </div>
      {err && <p className="note-bad">{err}</p>}

      <div className={`users-cols${sel ? " open" : ""}`}>
        <section className="dcard panel users-list">
          {users === null ? <div className="sk" style={{ height: 240 }} />
            : users.length === 0 ? <Empty title="No accounts found" text={q ? "Try another search." : "Accounts appear here as students sign up."} />
            : (
              <table className="utable">
                <thead><tr><th>Account</th><th>Plan</th><th>Role</th><th className="hide-sm">Devices</th><th className="hide-sm">Joined</th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} aria-selected={u.id === sel} onClick={() => setSel(u.id)}>
                      <td>
                        <button type="button" className="link-row" onClick={() => setSel(u.id)}>
                          <b>{u.name || "No name"}{u.id === me.id ? " (you)" : ""}</b>
                          <span className="muted small">{u.email ?? (u.phone ? formatPhone(u.phone) : "")}</span>
                        </button>
                      </td>
                      <td>{planActive(u) ? <span className="badge good">{planNames[u.plan]}</span> : <span className="muted">Free</span>}</td>
                      <td>{u.role === "student" ? <span className="muted">Student</span> : <span className="badge">{roleNames[u.role]}</span>}</td>
                      <td className="hide-sm">{u.devices}/2</td>
                      <td className="hide-sm muted">{day(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          {users && users.length === 200 && <p className="muted small">Showing the newest 200. Search to find others.</p>}
        </section>

        {sel && <Detail key={sel} id={sel} me={me} onClose={() => setSel(null)} onChanged={(m) => { setToast(m); load(); }} />}
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}

function Detail({ id, me, onClose, onChanged }: { id: string; me: AccountUser; onClose: () => void; onChanged: (message: string) => void }) {
  const [d, setD] = useState<UserDetail | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [role, setR] = useState<Role>("student");
  const [plan, setP] = useState<AdminUser["plan"]>("free");
  const [until, setUntil] = useState("");

  const load = useCallback(() => getUser(id).then((x) => {
    setD(x);
    setR(x.user.role);
    setP(planActive(x.user) ? x.user.plan : "free");
    setUntil(x.user.planExpiresAt ? isoDay(new Date(x.user.planExpiresAt)) : isoDay(new Date(Date.now() + 365 * 864e5)));
  }, (e) => setErr(friendlyError(e))), [id]);
  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<unknown>, message: string, ask?: string) => {
    if (ask && !confirm(ask)) return;
    setBusy(true); setErr("");
    try { await fn(); await load(); onChanged(message); } catch (e) { setErr(friendlyError(e)); } finally { setBusy(false); }
  };

  if (!d) return <aside className="dcard panel udetail">{err ? <p className="note-bad">{err}</p> : <div className="sk" style={{ height: 300 }} />}</aside>;
  const u = d.user;
  const self = u.id === me.id;
  const planChanged = plan !== (planActive(u) ? u.plan : "free") || (plan !== "free" && until !== (u.planExpiresAt ? isoDay(new Date(u.planExpiresAt)) : ""));

  return (
    <aside className="dcard panel udetail" aria-label={`Account ${u.name}`}>
      <div className="panel-h">
        <h2>{u.name || "No name"}</h2>
        <button type="button" className="link" onClick={onClose}>Close</button>
      </div>
      <dl className="sum">
        {u.email && <div><dt>Email</dt><dd>{u.email}{!u.emailVerified && <span className="muted"> (not confirmed)</span>}</dd></div>}
        {u.phone && <div><dt>Phone</dt><dd>{formatPhone(u.phone)}</dd></div>}
        <div><dt>Signs in with</dt><dd>{[u.email && "email", u.phone && "phone", ...d.methods].filter(Boolean).join(", ") || "–"}</dd></div>
        <div><dt>Joined</dt><dd>{fullDay(u.createdAt)}</dd></div>
        <div><dt>Last seen</dt><dd>{u.lastSeen ? fullDay(u.lastSeen) : "–"}</dd></div>
        <div><dt>Account ID</dt><dd><code className="small">{u.id}</code></dd></div>
      </dl>
      {err && <p className="note-bad" role="alert">{err}</p>}

      <div className="usec">
        <h3 className="panel-title">Plan</h3>
        <p className="muted small">{planActive(u) ? `${planNames[u.plan]}${u.planExpiresAt ? ` until ${fullDay(u.planExpiresAt)}` : ""}.` : "Free plan."} Use this for bank transfers, refunds or support until online payments open.</p>
        <div className="form-grid">
          <label className="fld">
            <span>Plan</span>
            <select value={plan} onChange={(e) => setP(e.target.value as AdminUser["plan"])} disabled={busy}>
              {(Object.keys(planNames) as AdminUser["plan"][]).map((p) => <option key={p} value={p}>{planNames[p]}</option>)}
            </select>
          </label>
          {plan !== "free" && <label className="fld"><span>Ends on</span><input type="date" value={until} min={isoDay(new Date())} onChange={(e) => setUntil(e.target.value)} disabled={busy} /></label>}
        </div>
        <div><button type="button" className="dpill dark small" disabled={busy || !planChanged} onClick={() => act(() => setPlan(u.id, plan, plan === "free" ? null : `${until}T23:59:59+05:00`), "Plan updated.")}>Save plan</button></div>
      </div>

      <div className="usec">
        <h3 className="panel-title">Role</h3>
        <p className="muted small">Writers add questions. Reviewers also blind-solve and check them. Admins can do everything here.</p>
        <div className="role-row">
          <select value={role} onChange={(e) => setR(e.target.value as Role)} disabled={busy || self} aria-label="Role">
            {roles.map((r) => <option key={r} value={r}>{roleNames[r]}</option>)}
          </select>
          <button type="button" className="dpill dark small" disabled={busy || role === u.role} onClick={() => act(() => setRole(u.id, role), `${u.name || "Account"} is now ${roleNames[role].toLowerCase()}.`, role === "admin" ? `Make ${u.name || "this account"} an admin? Admins can change plans, roles and every question.` : undefined)}>Save role</button>
        </div>
        {self && <p className="muted small">You can&apos;t change your own role.</p>}
      </div>

      <div className="usec">
        <div className="panel-h"><h3 className="panel-title">Devices</h3><span className="muted small">{d.takeoversToday} takeover{d.takeoversToday === 1 ? "" : "s"} today</span></div>
        {d.devices.length ? (
          <ul className="devs">
            {d.devices.map((x) => <li key={x.id}><b>{x.label}</b>{x.active && <span className="badge good">Active</span>}<span className="muted small">added {day(new Date(x.created_at).toISOString())}, last used {day(new Date(x.last_seen_at).toISOString())}</span></li>)}
          </ul>
        ) : <p className="muted small">No devices registered.</p>}
        {d.takeoversToday > 6 && <p className="note-warn">More than 6 takeovers today: this account may be shared.</p>}
        <div className="role-row">
          <button type="button" className="dpill light small" disabled={busy || !d.devices.length} onClick={() => act(() => resetDevices(u.id), "Devices cleared.", `Clear both device slots for ${u.name || "this account"} and sign it out everywhere? It doesn't count as one of their 30-day swaps.`)}>Reset devices</button>
          {!self && <button type="button" className="dpill light small" disabled={busy} onClick={() => act(() => signOutUser(u.id), "Signed out everywhere.", "Sign this account out on every device?")}>Sign out everywhere</button>}
        </div>
      </div>

      {d.log.length > 0 && (
        <div className="usec">
          <h3 className="panel-title">Admin history</h3>
          <ul className="activity">
            {d.log.map((l, i) => <li key={i}><span><b>{l.actor ?? "Someone"}</b> · {actionNames[l.action] ?? l.action}{l.detail && <span className="muted"> · {l.detail}</span>}</span><span className="muted small">{day(new Date(l.created_at).toISOString())}</span></li>)}
          </ul>
        </div>
      )}
    </aside>
  );
}
