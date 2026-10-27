"use client";

import { useEffect, useState } from "react";
import DeviceGate from "@/components/auth/DeviceGate";
import Icon from "@/components/app/Icon";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { signOut } from "@/lib/auth";
import { planNames } from "@/lib/format";
import { site } from "@/lib/site";
import { type AccountUser, getCurrentUser } from "@/lib/user";

/* The sidebar, grouped like the study loop: practise, then review what went wrong. */
const groups: { label?: string; links: { href: string; label: string; icon: string }[] }[] = [
  { links: [{ href: "/dashboard", label: "Home", icon: "home" }] },
  {
    label: "Practise",
    links: [
      { href: "/practice", label: "Practice", icon: "practice" },
      { href: "/mocks", label: "Mocks", icon: "mock" },
      { href: "/past-papers", label: "Past papers", icon: "paper" },
    ],
  },
  {
    label: "Review",
    links: [
      { href: "/mistakes", label: "My mistakes", icon: "mistakes" },
      { href: "/history", label: "Results", icon: "results" },
    ],
  },
  {
    label: "Account",
    links: [
      { href: "/account/billing", label: "Plan and billing", icon: "billing" },
      { href: "/account", label: "Account", icon: "account" },
    ],
  },
];

export const links = groups.flatMap((g) => g.links);

/* Phones get a bottom tab bar instead of the sidebar: the four places students go most, and More for the rest. */
const tabs = ["/dashboard", "/practice", "/mocks", "/mistakes"];
const moreLinks = links.filter((l) => !tabs.includes(l.href));

export function initials(name: string) {
  return (name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}

/* The frame every signed-in screen shares: sidebar on the left, a white work surface with a top bar, and an optional
   side panel on the right (the dashboard's study coach). On phones the sidebar slides in from the menu button. */
export function AppFrame({ active, title, user, aside, children }: { active?: string; title?: string; user: AccountUser | null; aside?: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const here = links.find((l) => l.href === active);

  useEffect(() => {
    if (!open && !more) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setMore(false); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, more]);

  return (
    <div className={`dash frame ${aside ? "has-aside" : ""}`}>
      <aside className={`side ${open ? "open" : ""}`} aria-label="Sidebar">
        <div className="side-top">
          <Logo href="/dashboard" />
          <button type="button" className="icon-btn side-close" onClick={() => setOpen(false)} aria-label="Close menu"><Icon name="close" /></button>
        </div>
        <nav aria-label="Main" className="side-nav">
          {groups.map((g, i) => (
            <div key={i} className="side-group">
              {g.label && <span className="side-label">{g.label}</span>}
              <ul>
                {g.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} aria-current={l.href === active ? "page" : undefined}><Icon name={l.icon} />{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="side-foot">
          <ul>
            <li><a href={`mailto:${site.supportEmail}`}><Icon name="help" />Help</a></li>
            <li>
              <button type="button" onClick={async () => { await signOut(); window.location.replace("/"); }}><Icon name="signout" />Sign out</button>
            </li>
          </ul>
          <a className="me" href="/account">
            <span className="avatar">{user ? initials(user.name) : ""}</span>
            <span className="me-name">{user?.name || "Your account"}</span>
            {user && (user.plan === "free"
              ? <span className="plan-chip free">Free</span>
              : <span className="plan-chip" title={planNames[user.plan]}>Pass</span>)}
          </a>
        </div>
      </aside>
      {open && <button type="button" className="scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <div className="surface">
        <header className="topbar">
          <button type="button" className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}><Icon name="menu" /></button>
          <p className="crumbs">
            <span className="muted">{site.name}</span>
            <span className="dot" aria-hidden="true">·</span>
            <b>{title ?? here?.label ?? "Study"}</b>
          </p>
          <a className="m-brand" href="/dashboard" aria-label={`${site.name} home`}>
            <svg width="28" height="28" viewBox="0 0 26 26" aria-hidden="true"><rect width="26" height="26" rx="8" fill="var(--blue)" /><path d="m7.5 13.5 3.6 3.6L18.5 9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <h1 className="m-title">{title ?? here?.label ?? "Study"}</h1>
          <div className="topbar-end">
            {user?.plan === "free" && <a className="dpill dark small hide-xs" href="/pricing">Upgrade</a>}
            <a className="help-link hide-xs" href={`mailto:${site.supportEmail}`}>Need help?</a>
            <ThemeToggle />
            <a className="avatar m-avatar" href="/account" aria-label="Account">{user ? initials(user.name) : ""}</a>
          </div>
        </header>
        <div className="surface-body">
          <main className="dwrap">{children}</main>
          {aside}
        </div>
      </div>

      <nav className="tabbar" aria-label="Main">
        {tabs.map((href) => {
          const l = links.find((x) => x.href === href)!;
          return (
            <a key={href} href={href} aria-current={href === active ? "page" : undefined}>
              <Icon name={l.icon} size={22} /><span>{href === "/mistakes" ? "Mistakes" : l.label}</span>
            </a>
          );
        })}
        <button type="button" onClick={() => setMore(true)} aria-expanded={more} aria-current={active && !tabs.includes(active) ? "page" : undefined}>
          <Icon name="menu" size={22} /><span>More</span>
        </button>
      </nav>

      {more && (
        <>
          <button type="button" className="sheet-scrim" aria-label="Close" onClick={() => setMore(false)} />
          <div className="sheet" role="dialog" aria-modal="true" aria-label="More">
            <span className="sheet-grip" aria-hidden="true" />
            <a className="me" href="/account">
              <span className="avatar">{user ? initials(user.name) : ""}</span>
              <span className="me-name">{user?.name || "Your account"}</span>
              {user && (user.plan === "free" ? <span className="plan-chip free">Free</span> : <span className="plan-chip">Pass</span>)}
            </a>
            <ul>
              {moreLinks.map((l) => (
                <li key={l.href}><a href={l.href} aria-current={l.href === active ? "page" : undefined}><Icon name={l.icon} />{l.label}<span className="chev"><Icon name="chevron" size={16} /></span></a></li>
              ))}
              <li><a href={`mailto:${site.supportEmail}`}><Icon name="help" />Help<span className="chev"><Icon name="chevron" size={16} /></span></a></li>
              <li><button type="button" className="danger" onClick={async () => { await signOut(); window.location.replace("/"); }}><Icon name="signout" />Sign out</button></li>
            </ul>
            {user?.plan === "free" && <a className="dpill dark block" href="/pricing">Get the Season Pass</a>}
          </div>
        </>
      )}
    </div>
  );
}

/* A signed-in screen: device lock, frame, and the page body once the student is known. */
export default function AppShell({ active, title, bare, children }: { active?: string; title?: string; bare?: boolean; children: (user: AccountUser) => React.ReactNode }) {
  return (
    <DeviceGate>
      <Shell active={active} title={title} bare={bare}>{children}</Shell>
    </DeviceGate>
  );
}

function Shell({ active, title, bare, children }: { active?: string; title?: string; bare?: boolean; children: (user: AccountUser) => React.ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  useEffect(() => { getCurrentUser().then(setUser); }, []);

  // The test player brings its own focused top bar.
  if (bare) return <div className="dash">{user ? children(user) : <div className="sk" style={{ height: "100dvh", borderRadius: 0 }} />}</div>;
  return (
    <AppFrame active={active} title={title} user={user}>
      {user ? children(user) : (
        <div className="dgrid" aria-busy="true"><div className="sk" style={{ height: 120 }} /><div className="sk" style={{ height: 360 }} /></div>
      )}
    </AppFrame>
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
