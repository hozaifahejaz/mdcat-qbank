"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/app/AppShell";
import { Body, Skeleton } from "@/components/dashboard/Dashboard";
import { fresh } from "@/lib/cache";
import { type Dashboard, getDashboard } from "@/lib/dashboard-data";
import type { AccountUser } from "@/lib/user";

/* The phone's Progress tab: the dashboard's numbers (stats, chart, subjects, recent tests) that the phone home leaves
   out. On a laptop the dashboard itself shows all of this. */
export default function ProgressScreen() {
  return <AppShell active="/progress">{(user) => <Progress user={user} />}</AppShell>;
}

function Progress({ user }: { user: AccountUser }) {
  const [data, setData] = useState<Dashboard | null>(null);
  const [bank, setBank] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    fresh(bank ? `dashboard:${bank}` : "dashboard", () => getDashboard(user, bank), (d) => { if (live) setData(d); }, true).catch(() => {});
    return () => { live = false; };
  }, [user, bank]);
  return data ? <Body data={data} progress onBank={setBank} onGoal={(n) => setData((d) => (d ? { ...d, dailyGoal: n } : d))} /> : <Skeleton />;
}
