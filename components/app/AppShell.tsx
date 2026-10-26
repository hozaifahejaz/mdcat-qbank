"use client";

import { useEffect, useState } from "react";
import DeviceGate from "@/components/auth/DeviceGate";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { signOut } from "@/lib/auth";
import { type AccountUser, getCurrentUser } from "@/lib/user";

export const links = [
  { href: "/dashboard", label: "Home" },
  { href: "/practice", label: "Practice" },
  { href: "/mocks", label: "Mocks" },
  { href: "/past-papers", label: "Past papers" },
  { href: "/mistakes", label: "My mistakes" },
];

export function initials(name: string) {
  return (name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}

/* The pill nav every signed-in screen shares. `active` is the link to highlight, if any. */
export function AppNav({ active, user }: { active?: string; user: AccountUser | null }) {
  return (
    <header className="dnav-wrap">
      <div className="dwrap">
        <div className="dnav">
          <Logo href="/dashboard" />
          <nav aria-label="Main">
            <ul>
              {links.map((l) => (
                <li key={l.href}><a href={l.href} aria-current={l.href === active ? "page" : undefined}>{l.label}</a></li>
              ))}
            </ul>
          </nav>
          <div className="dnav-end">
            <ThemeToggle />
            <button type="button" className="signout" onClick={async () => { await signOut(); window.location.replace("/"); }}>Sign out</button>
            <a className="avatar" href="/account" title="Account" aria-label="Account">{user ? initials(user.name) : ""}</a>
          </div>
        </div>
      </div>
    </header>
  );
}

/* A signed-in screen: device lock, nav, and the page body once the student is known. */
export default function AppShell({ active, bare, children }: { active?: string; bare?: boolean; children: (user: AccountUser) => React.ReactNode }) {
  return (
    <DeviceGate>
      <Shell active={active} bare={bare}>{children}</Shell>
    </DeviceGate>
  );
}

function Shell({ active, bare, children }: { active?: string; bare?: boolean; children: (user: AccountUser) => React.ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  useEffect(() => { getCurrentUser().then(setUser); }, []);

  // The test player brings its own focused top bar.
  if (bare) return <div className="dash">{user ? children(user) : <div className="sk" style={{ height: "100dvh", borderRadius: 0 }} />}</div>;
  return (
    <div className="dash">
      <AppNav active={active} user={user} />
      <main className="dwrap">
        {user ? children(user) : (
          <div className="dgrid" aria-busy="true"><div className="sk" style={{ height: 120 }} /><div className="sk" style={{ height: 360 }} /></div>
        )}
      </main>
    </div>
  );
}

/* Page heading row used by every list screen. */
export function PageHead({ title, sub, children }: { title: string; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="hello page-head">
      <div>
        <h1>{title}</h1>
        {sub && <p className="muted">{sub}</p>}
      </div>
      {children && <div className="hello-ctas">{children}</div>}
    </section>
  );
}
