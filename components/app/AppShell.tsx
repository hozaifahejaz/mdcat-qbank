"use client";

import { useEffect, useState } from "react";
import DeviceGate from "@/components/auth/DeviceGate";
import Icon from "@/components/app/Icon";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { signOut } from "@/lib/auth";
import { planNames } from "@/lib/format";
import { isStaff, roleNames } from "@/lib/qc";
import { site, supportHref } from "@/lib/site";
import { type AccountUser, getCurrentUser } from "@/lib/user";

/* The sidebar, grouped like the study loop: practise, then review what went wrong. */
/* short is the label under a phone tab, when the full one is too long. */
export type NavLink = { href: string; label: string; icon: string; short?: string };
export type NavGroup = { label?: string; links: NavLink[] };

const groups: NavGroup[] = [
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
      { href: "/mistakes", label: "My mistakes", icon: "mistakes", short: "Mistakes" },
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

/* Which links the frame shows. Phones get a bottom tab bar instead of the sidebar: the places people go most,
   and More for the rest. The admin panel passes its own (components/admin/AdminFrame.tsx). */
export type Nav = { kind: "student" | "admin"; home: string; groups: NavGroup[]; tabs: string[] };
const studentNav: Nav = { kind: "student", home: "/dashboard", groups, tabs: ["/dashboard", "/practice", "/mocks", "/mistakes"] };

export function initials(name: string) {
  return (name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}

/* The frame every signed-in screen shares: sidebar on the left, a white work surface with a top bar, and an optional
   side panel on the right (the dashboard's study coach). On phones the sidebar slides in from the menu button. */
export function AppFrame({ active, title, user, aside, nav = studentNav, children }: { active?: string; title?: string; user: AccountUser | null; aside?: React.ReactNode; nav?: Nav; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const navLinks = nav.groups.flatMap((g) => g.links);
  const here = navLinks.find((l) => l.href === active);
  const tabs = nav.tabs;
  const moreLinks = navLinks.filter((l) => !tabs.includes(l.href));
  const admin = nav.kind === "admin";
  /* The chip by the name: plan for students, role in the admin panel. */
  const chip = !user ? null
    : admin ? <span className="plan-chip">{roleNames[user.role]}</span>
    : user.plan === "free" ? <span className="plan-chip free">Free</span>
    : <span className="plan-chip" title={planNames[user.plan]}>Pass</span>;
  /* From the student app to the admin panel for staff, and back again from the admin panel. */
  const switchLink = admin ? { href: "/dashboard", label: "Student view", icon: "home" } : isStaff(user?.role) ? { href: "/admin", label: "Admin panel", icon: "shield" } : null;

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
          <Logo href={nav.home} />
          <button type="button" className="icon-btn side-close" onClick={() => setOpen(false)} aria-label="Close menu"><Icon name="close" /></button>
        </div>
        <nav aria-label="Main" className="side-nav">
          {nav.groups.map((g, i) => (
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
            {switchLink && <li><a href={switchLink.href}><Icon name={switchLink.icon} />{switchLink.label}</a></li>}
            <li><a href={supportHref}><Icon name="help" />Help</a></li>
            <li>
              <button type="button" onClick={async () => { await signOut(); window.location.replace("/"); }}><Icon name="signout" />Sign out</button>
            </li>
          </ul>
          <a className="me" href="/account">
            <span className="avatar">{user ? initials(user.name) : ""}</span>
            <span className="me-name">{user?.name || "Your account"}</span>
            {chip}
          </a>
        </div>
      </aside>
      {open && <button type="button" className="scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <div className="surface">
        <header className="topbar">
          <button type="button" className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}><Icon name="menu" /></button>
          <p className="crumbs">
            <span className="muted">{admin ? `${site.name} admin` : site.name}</span>
            <span className="dot" aria-hidden="true">·</span>
            <b>{title ?? here?.label ?? "Study"}</b>
          </p>
          <a className="m-brand" href={nav.home} aria-label={`${site.name} home`}>
            <svg width="28" height="28" viewBox="0 0 26 26" aria-hidden="true"><rect width="26" height="26" rx="8" fill="var(--blue)" /><path d="m7.5 13.5 3.6 3.6L18.5 9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <h1 className="m-title">{title ?? here?.label ?? "Study"}</h1>
          <div className="topbar-end">
            {!admin && user?.plan === "free" && <a className="dpill dark small hide-xs" href="/pricing">Upgrade</a>}
            <a className="help-link hide-xs" href={supportHref}>Need help?</a>
            <ThemeToggle />
            <a className="avatar m-avatar" href="/account" aria-label="Account">{user ? initials(user.name) : ""}</a>
          </div>
        </header>
        <div className="surface-body">
          <main className="dwrap">{children}</main>
          {aside}
        </div>
      </div>

      <nav className="tabbar" aria-label="Main" style={{ gridTemplateColumns: `repeat(${tabs.length + 1}, minmax(0, 1fr))` }}>
        {tabs.map((href) => {
          const l = navLinks.find((x) => x.href === href)!;
          return (
            <a key={href} href={href} aria-current={href === active ? "page" : undefined}>
              <Icon name={l.icon} size={22} /><span>{l.short ?? l.label}</span>
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
              {chip}
            </a>
            <ul>
              {moreLinks.map((l) => (
                <li key={l.href}><a href={l.href} aria-current={l.href === active ? "page" : undefined}><Icon name={l.icon} />{l.label}<span className="chev"><Icon name="chevron" size={16} /></span></a></li>
              ))}
              {switchLink && <li><a href={switchLink.href}><Icon name={switchLink.icon} />{switchLink.label}<span className="chev"><Icon name="chevron" size={16} /></span></a></li>}
              <li><a href={supportHref}><Icon name="help" />Help<span className="chev"><Icon name="chevron" size={16} /></span></a></li>
              <li><button type="button" className="danger" onClick={async () => { await signOut(); window.location.replace("/"); }}><Icon name="signout" />Sign out</button></li>
            </ul>
            {!admin && user?.plan === "free" && <a className="dpill dark block" href="/pricing">Get the Season Pass</a>}
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
