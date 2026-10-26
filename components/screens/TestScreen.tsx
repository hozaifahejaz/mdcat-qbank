"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/app/AppShell";
import TestPlayer from "@/components/test/TestPlayer";
import type { Mode } from "@/lib/attempts";
import { bank, paperOrder, pickQuestions, type Question } from "@/lib/bank";
import type { TestResult } from "@/lib/dashboard-data";

type Setup = { mode: Mode; kind: TestResult["kind"]; title: string; questions: Question[]; minutes?: number };

/* /test?mode=tutor|timed|mock plus what to ask:
   subject, chapters (separated by |), ids (comma-separated), count, title, paper (a past-paper year).
   Until the bank is live, every set comes from the sample questions; a full mock is 180 MCQs in 180 minutes. */
function readSetup(): Setup {
  const p = new URLSearchParams(window.location.search);
  const mode = (["tutor", "timed", "mock"].includes(p.get("mode") ?? "") ? p.get("mode") : "tutor") as Mode;
  const paper = p.get("paper");
  const ids = p.get("ids")?.split(",").filter(Boolean);
  const count = Number(p.get("count")) || undefined;
  if (mode === "mock") {
    const qs = paperOrder(bank);
    return { mode, kind: paper ? "past-paper" : "mock", title: p.get("title") ?? (paper ? `PMDC MDCAT ${paper}` : "Full mock 6"), questions: qs, minutes: qs.length };
  }
  const subject = p.get("subject");
  const chapters = p.get("chapters")?.split("|") ?? [];
  const qs = pickQuestions({ subject, chapters, ids, count });
  const title = p.get("title") ?? (subject ? `${subject}${chapters.length === 1 ? ` · ${chapters[0]}` : ""}` : "Mixed practice");
  return { mode, kind: mode === "timed" ? "timed" : "practice", title, questions: qs, minutes: mode === "timed" ? qs.length : undefined };
}

export default function TestScreen() {
  const [setup, setSetup] = useState<Setup | null>(null);
  useEffect(() => setSetup(readSetup()), []);
  return <AppShell bare>{(user) => setup && <TestPlayer user={user} {...setup} />}</AppShell>;
}
