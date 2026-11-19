"use client";

import { Fragment, createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import DeviceGate from "@/components/auth/DeviceGate";
import Icon from "@/components/app/Icon";
import Logo, { Markhor } from "@/components/Logo";
import { usePageTurn } from "@/components/Nav";
import ThemeToggle from "@/components/ThemeToggle";
import { signOut } from "@/lib/auth";
import { planNames } from "@/lib/format";
import { isStaff, roleNames } from "@/lib/qc";
import { site, supportHref } from "@/lib/site";
import { type AccountUser, getCurrentUser, lastUser } from "@/lib/user";

/* The sidebar, grouped like the study loop: practise, then review what went wrong. */
/* short is the label under a phone tab, when the full one is too long. */
/* phoneOnly links show in the phone tab bar but not in the sidebar, where the dashboard already covers them. */
/* inAccount links are reached from the name at the foot of the sidebar; on phones they sit in the More sheet. */
export type NavLink = { href: string; label: string; icon: string; short?: string; phoneOnly?: boolean; inAccount?: boolean };
export type NavGroup = { label?: string; links: NavLink[] };

const groups: NavGroup[] = [
  { links: [{ href: "/dashboard", label: "Home", icon: "home" }] },
  {
    links: [
      { href: "/practice", label: "Practice", icon: "practice" },
      { href: "/mocks", label: "Mocks", icon: "mock" },
      { href: "/past-papers", label: "Past papers", icon: "paper" },
    ],
  },
  {
    links: [
      { href: "/progress", label: "Progress", icon: "trend", phoneOnly: true },
      { href: "/mistakes", label: "My mistakes", icon: "mistakes", short: "Mistakes" },
      { href: "/history", label: "Results", icon: "results" },
    ],
  },
  {
    links: [
      { href: "/account/billing", label: "Plan and billing", icon: "billing", inAccount: true },
      { href: "/account", label: "Account", icon: "account", inAccount: true },
    ],
  },
];

export const links = groups.flatMap((g) => g.links);

/* Which links the frame shows. Phones get a bottom tab bar instead of the sidebar: the places people go most,
   and More for the rest. The admin panel passes its own (components/admin/AdminFrame.tsx). */
export type Nav = { kind: "student" | "admin"; home: string; groups: NavGroup[]; tabs: string[] };
const studentNav: Nav = { kind: "student", home: "/dashboard", groups, tabs: ["/dashboard", "/practice", "/mocks", "/progress"] };

export function initials(name: string) {
  return (name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}

/* The frame every signed-in screen shares: sidebar on the left, a white work surface with a top bar, and an optional
   side panel on the right (the dashboard's study coach). On phones the sidebar slides in from the menu button. */
export function AppFrame({ active, title, user, aside, nav = studentNav, bare, hasAside, asideSlot, children }: {
  active?: string; title?: string; user: AccountUser | null; aside?: React.ReactNode; nav?: Nav; children: React.ReactNode;
  /* For the shared layout: bare drops the frame around the page (the test player), and asideSlot is where a page
     puts its own side panel. The page itself stays in the same place in the tree either way, so it never restarts. */
  bare?: boolean; hasAside?: boolean; asideSlot?: (el: HTMLDivElement | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  // The frame outlives the page now, so a menu left open is closed when the page changes.
  const path = usePathname();
  useEffect(() => { setOpen(false); setMore(false); }, [path]);
  const navLinks = nav.groups.flatMap((g) => g.links);
  const here = navLinks.find((l) => l.href === active);
  const tabs = nav.tabs;
  const moreLinks = navLinks.filter((l) => !tabs.includes(l.href) && !l.phoneOnly);
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
    <div className={bare ? "dash bare" : `dash frame ${aside || hasAside ? "has-aside" : ""}`}>
      {!bare && <aside className={`side ${open ? "open" : ""}`} aria-label="Sidebar">
        <div className="side-top">
          <Logo href={nav.home} />
          <ThemeToggle />
          <button type="button" className="icon-btn side-close" onClick={() => setOpen(false)} aria-label="Close menu"><Icon name="close" /></button>
        </div>
        <nav aria-label="Main" className="side-nav">
          {nav.groups.map((g, i) => {
            const shown = g.links.filter((l) => !l.inAccount && (!l.phoneOnly || l.href === active));
            return shown.length > 0 && (
              <div key={i} className="side-group">
                {g.label && <span className="side-label">{g.label}</span>}
                <ul>
                  {shown.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} aria-current={l.href === active ? "page" : undefined}><Icon name={l.icon} />{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>
        <div className="side-foot">
          {!admin && user?.plan === "free" && <a className="dpill dark small" href="/pricing">Get the Season Pass</a>}
          <ul>
            {switchLink && <li><a href={switchLink.href}><Icon name={switchLink.icon} />{switchLink.label}</a></li>}
            <li><a href={supportHref}><Icon name="help" />Help</a></li>
            <li>
              <button type="button" onClick={async () => { await signOut(); window.location.replace("/"); }}><Icon name="signout" />Sign out</button>
            </li>
          </ul>
          <a className="me" href="/account" aria-current={here?.inAccount ? "page" : undefined}>
            <span className="avatar">{user ? initials(user.name) : ""}</span>
            <span className="me-name">{user?.name || "Your account"}</span>
            {chip}
          </a>
        </div>
      </aside>}
      {!bare && open && <button type="button" className="scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <div className={bare ? undefined : "surface"}>
        {!bare && <header className="topbar">
          <button type="button" className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}><Icon name="menu" /></button>
          <p className="crumbs">
            <span className="muted">{admin ? `${site.name} admin` : site.name}</span>
            <span className="dot" aria-hidden="true">·</span>
            <b>{title ?? here?.label ?? "Study"}</b>
          </p>
          <a className="m-brand" href={nav.home} aria-label={`${site.name} home`}>
            <Markhor height={32} />
          </a>
          <h1 className="m-title">{title ?? here?.label ?? "Study"}</h1>
          <div className="topbar-end">
            {!admin && user?.plan === "free" && <a className="dpill dark small hide-xs" href="/pricing">Upgrade</a>}
            <ThemeToggle />
            <a className="avatar m-avatar" href="/account" aria-label="Account">{user ? initials(user.name) : ""}</a>
          </div>
        </header>}
        <div className={bare ? undefined : "surface-body"}>
          <div className={bare ? undefined : "dwrap"} role={bare ? undefined : "main"}>{children}</div>
          {aside}
          {asideSlot && <div ref={asideSlot} className="aside-slot" />}
        </div>
      </div>

      {!bare && <nav className="tabbar" aria-label="Main" style={{ gridTemplateColumns: `repeat(${tabs.length + 1}, minmax(0, 1fr))` }}>
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
      </nav>}

      {!bare && more && (
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

/* What a page tells the shared frame about itself. */
type Meta = { active?: string; title?: string; bare?: boolean; aside?: boolean };
const FrameContext = createContext<{ user: AccountUser | null; set: (m: Meta) => void; slot: HTMLDivElement | null } | null>(null);

/* The one frame around every signed-in student page (app/(app)/layout.tsx). It stays on screen while pages change
   inside it: the sidebar, the phone tab bar and the device check are set up once, not once per page. */
export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DeviceGate>
      <SharedFrame>{children}</SharedFrame>
    </DeviceGate>
  );
}

function SharedFrame({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const path = usePathname();
  // What the page will say about itself, guessed from the address so the saved page file already has the right frame:
  // its link lit, and no sidebar around the test player.
  const [meta, setMeta] = useState<Meta>(() => ({ active: path ?? undefined, bare: path === "/test" }));
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  // The page that is showing, opened afresh in place when it is asked for with another query (components/Nav.tsx).
  const turn = usePageTurn();
  useLayoutEffect(() => { setUser((u) => u ?? lastUser()); }, []);
  // Asked again on each page (the answer is shared for half a minute), so a new name or plan shows in the frame.
  useEffect(() => { getCurrentUser().then((u) => { if (u) setUser(u); }); }, [path]);
  const set = useCallback((m: Meta) => setMeta((o) => (o.active === m.active && o.title === m.title && o.bare === m.bare && o.aside === m.aside ? o : m)), []);
  const ctx = useMemo(() => ({ user, set, slot }), [user, set, slot]);
  return (
    <FrameContext value={ctx}>
      <AppFrame active={meta.active} title={meta.title} user={user} bare={meta.bare} hasAside={meta.aside} asideSlot={setSlot}><Fragment key={turn}>{children}</Fragment></AppFrame>
    </FrameContext>
  );
}

/* A page inside the shared frame: says which link is lit, its title, and (optionally) a side panel of its own. */
export function Framed({ active, title, bare, aside, children }: { active?: string; title?: string; bare?: boolean; aside?: React.ReactNode; children: React.ReactNode }) {
  const f = useContext(FrameContext);
  const set = f?.set;
  const has = !!aside;
  // Before the paint, so the frame never shows the last page's title or highlight.
  useLayoutEffect(() => { set?.({ active, title, bare, aside: has }); }, [set, active, title, bare, has]);
  return <>{children}{aside && f?.slot ? createPortal(aside, f.slot) : null}</>;
}

/* A signed-in screen: the page body once the student is known, inside the shared frame. */
export default function AppShell({ active, title, bare, children }: { active?: string; title?: string; bare?: boolean; children: (user: AccountUser) => React.ReactNode }) {
  const f = useContext(FrameContext);
  // Outside the shared layout a page brings the device lock and frame itself.
  if (!f) {
    return (
      <DeviceGate>
        <Shell active={active} title={title} bare={bare}>{children}</Shell>
      </DeviceGate>
    );
  }
  return (
    <Framed active={active} title={title} bare={bare}>
      {f.user ? children(f.user) : bare ? <div className="sk" style={{ height: "100dvh", borderRadius: 0 }} /> : (
        <div className="dgrid" aria-busy="true"><div className="sk" style={{ height: 120 }} /><div className="sk" style={{ height: 360 }} /></div>
      )}
    </Framed>
  );
}


function Shell({ active, title, bare, children }: { active?: string; title?: string; bare?: boolean; children: (user: AccountUser) => React.ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  useLayoutEffect(() => { setUser((u) => u ?? lastUser()); }, []);
  useEffect(() => { getCurrentUser().then((u) => { if (u) setUser(u); }); }, []);

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

/* Account and Plan and billing are one place with two tabs. */
export function AccountTabs({ active }: { active: "/account" | "/account/billing" }) {
  return (
    <nav className="ptabs" aria-label="Account">
      <a className="tab" href="/account" aria-current={active === "/account" ? "page" : undefined}>Account</a>
      <a className="tab" href="/account/billing" aria-current={active === "/account/billing" ? "page" : undefined}>Plan and billing</a>
    </nav>
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
