"use client";

import { useEffect, useState } from "react";
import { AppFrame, type Nav, type NavGroup } from "@/components/app/AppShell";
import Empty from "@/components/app/Empty";
import { isStaff } from "@/lib/qc";
import { type AccountUser, getCurrentUser } from "@/lib/user";

/* The admin panel in the same frame as the student app, with its own sidebar. Users and the watermark tool are
   admins only, so writers and reviewers don't see them. */
function adminNav(user: AccountUser): Nav {
  const admin = user.role === "admin";
  const groups: NavGroup[] = [
    { links: [{ href: "/admin", label: "Overview", icon: "home" }] },
    { label: "Content", links: [{ href: "/admin/questions", label: "Questions", icon: "practice" }] },
    ...(admin ? [{
      label: "Accounts",
      links: [
        { href: "/admin/users", label: "Users and plans", icon: "account", short: "Users" },
        { href: "/admin/reveal", label: "Reveal watermark", icon: "target", short: "Watermark" },
      ],
    }] : []),
  ];
  return { kind: "admin", home: "/admin", groups, tabs: admin ? ["/admin", "/admin/questions", "/admin/users"] : ["/admin", "/admin/questions"] };
}

/* Every /admin page: signed-out visitors go to sign-in, students get "staff only", and staff get the admin frame
   with the links their role can use. This only shapes the page; the API refuses anyone without the role anyway. */
export default function AdminFrame({ active, adminOnly, children }: { active: string; adminOnly?: boolean; children: (user: AccountUser) => React.ReactNode }) {
  const [user, setUser] = useState<AccountUser | null | undefined>(undefined);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) window.location.replace(`/signin?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      else setUser(u);
    });
  }, []);

  if (!user) return <div className="dash"><div className="sk" style={{ height: "100dvh", borderRadius: 0 }} /></div>;

  if (!isStaff(user.role)) {
    return (
      <AppFrame user={user} title="Admin">
        <section className="box">
          <Empty title="This page is for Examwise staff" text="Your account doesn't have access to the admin panel. If you think it should, ask an admin.">
            <a className="dpill dark small" href="/dashboard">Go to your dashboard</a>
          </Empty>
        </section>
      </AppFrame>
    );
  }

  return (
    <AppFrame user={user} active={active} nav={adminNav(user)}>
      {!adminOnly || user.role === "admin" ? children(user) : (
        <section className="box">
          <Empty title="Admins only" text="Your role doesn't include this part of the admin panel. If you need it, ask an admin.">
            <a className="dpill dark small" href="/admin">Back to the overview</a>
          </Empty>
        </section>
      )}
    </AppFrame>
  );
}
