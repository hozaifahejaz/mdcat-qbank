"use client";

import { useEffect, useState } from "react";
import Empty from "@/components/app/Empty";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { isStaff, roleNames } from "@/lib/qc";
import { type AccountUser, getCurrentUser } from "@/lib/user";

const tabs = [
  { href: "/admin", label: "Overview", adminOnly: false },
  { href: "/admin/questions", label: "Questions", adminOnly: false },
  { href: "/admin/users", label: "Users and plans", adminOnly: true },
  { href: "/admin/reveal", label: "Reveal watermark", adminOnly: true },
];

/* Every /admin page: signed-out visitors go to sign-in, students get "staff only", and staff get the admin header
   with the tabs their role can use. This only shapes the page; the API refuses anyone without the role anyway. */
export default function AdminFrame({ active, adminOnly, children }: { active: string; adminOnly?: boolean; children: (user: AccountUser) => React.ReactNode }) {
  const [user, setUser] = useState<AccountUser | null | undefined>(undefined);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) window.location.replace(`/signin?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      else setUser(u);
    });
  }, []);

  const allowed = user && isStaff(user.role) && (!adminOnly || user.role === "admin");

  return (
    <div className="dash admin">
      <header className="dnav-wrap">
        <div className="dwrap wide">
          <div className="dnav">
            <span className="admin-brand"><Logo href="/admin" /><span className="badge">Admin</span></span>
            {allowed && (
              <nav aria-label="Admin">
                <ul>
                  {tabs.filter((t) => !t.adminOnly || user.role === "admin").map((t) => (
                    <li key={t.href}><a href={t.href} aria-current={t.href === active ? "page" : undefined}>{t.label}</a></li>
                  ))}
                </ul>
              </nav>
            )}
            <div className="dnav-end">
              {user && <span className="muted small admin-me">{user.name || user.email} · {roleNames[user.role]}</span>}
              <a className="dpill light small" href="/dashboard">Student view</a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      <main className="dwrap wide">
        {user === undefined || user === null ? <div className="sk" style={{ height: 420, marginTop: 20 }} />
          : allowed ? children(user)
          : (
            <section className="dcard panel" style={{ marginTop: 20 }}>
              <Empty title={isStaff(user.role) ? "Admins only" : "This page is for Examwise staff"} text="Your account doesn't have access to this part of the admin panel. If you think it should, ask an admin.">
                <a className="dpill dark small" href={isStaff(user.role) ? "/admin" : "/dashboard"}>{isStaff(user.role) ? "Back to the admin panel" : "Go to your dashboard"}</a>
              </Empty>
            </section>
          )}
      </main>
    </div>
  );
}
