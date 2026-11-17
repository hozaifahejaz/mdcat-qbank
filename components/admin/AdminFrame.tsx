"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { AppFrame, type Nav, type NavGroup } from "@/components/app/AppShell";
import Empty from "@/components/app/Empty";
import { isStaff } from "@/lib/qc";
import { type AccountUser, getCurrentUser, lastUser } from "@/lib/user";

/* The admin panel in the same frame as the student app, with its own sidebar. Users, the waitlist, visitors and the
   watermark tool are admins only, so writers and reviewers don't see them. */
function adminNav(user: AccountUser): Nav {
  const admin = user.role === "admin";
  const reviewer = admin || user.role === "reviewer";
  const groups: NavGroup[] = [
    { links: [{ href: "/admin", label: "Overview", icon: "home" }] },
    { label: "Content", links: [
      { href: "/admin/questions", label: "Questions", icon: "practice" },
      ...(reviewer ? [{ href: "/admin/reports", label: "Reports", icon: "flag" }] : []),
      { href: "/admin/bank", label: "Bank health", icon: "trend", short: "Health" },
    ] },
    ...(admin ? [{
      label: "Accounts",
      links: [
        { href: "/admin/users", label: "Users and plans", icon: "account", short: "Users" },
        { href: "/admin/waitlist", label: "Waitlist", icon: "bell" },
        { href: "/admin/visitors", label: "Visitors", icon: "results" },
        { href: "/admin/reveal", label: "Reveal watermark", icon: "target", short: "Watermark" },
      ],
    }] : []),
  ];
  return { kind: "admin", home: "/admin", groups, tabs: admin ? ["/admin", "/admin/questions", "/admin/users", "/admin/visitors"] : ["/admin", "/admin/questions"] };
}

const AdminContext = createContext<{ user: AccountUser; setActive: (href: string) => void } | null>(null);

/* The one frame around every /admin page (app/admin/layout.tsx): it stays on screen while admin pages change inside
   it, so the sidebar is drawn once. Signed-out visitors go to sign-in, students get "not found" (so the panel isn't
   advertised), and staff get the admin frame with the links their role can use. This only shapes the page; the API
   refuses anyone without the role anyway. */
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [active, setActive] = useState("");
  // The account as last seen, before the first paint, so the frame doesn't wait on the server to draw.
  useLayoutEffect(() => { setUser((u) => u ?? lastUser()); }, []);
  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) window.location.replace(`/signin?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      else setUser(u);
    });
  }, []);
  const ctx = useMemo(() => (user ? { user, setActive } : null), [user]);

  if (!user || !ctx) return <div className="dash"><div className="sk" style={{ height: "100dvh", borderRadius: 0 }} /></div>;

  if (!isStaff(user.role)) {
    return (
      <AppFrame user={user} title="Not found">
        <section className="box">
          <Empty title="Page not found" text="There's nothing at this address.">
            <a className="dpill dark small" href="/dashboard">Go to your dashboard</a>
          </Empty>
        </section>
      </AppFrame>
    );
  }

  return (
    <AdminContext value={ctx}>
      <AppFrame user={user} active={active} nav={adminNav(user)}>{children}</AppFrame>
    </AdminContext>
  );
}

/* An admin page inside that frame: says which link is lit, and keeps a page to the roles that may use it. */
export default function AdminFrame({ active, adminOnly, reviewerOnly, children }: {
  active: string; adminOnly?: boolean; reviewerOnly?: boolean; children: (user: AccountUser) => React.ReactNode;
}) {
  const ctx = useContext(AdminContext);
  const setActive = ctx?.setActive;
  // Before the paint, so the sidebar never shows the last page's highlight.
  useLayoutEffect(() => { setActive?.(active); }, [setActive, active]);
  if (!ctx) return null;
  const { user } = ctx;
  return (!adminOnly || user.role === "admin") && (!reviewerOnly || user.role !== "writer") ? <>{children(user)}</> : (
    <section className="box">
      <Empty title="Admins only" text="Your role doesn't include this part of the admin panel. If you need it, ask an admin.">
        <a className="dpill dark small" href="/admin">Back to the overview</a>
      </Empty>
    </section>
  );
}
