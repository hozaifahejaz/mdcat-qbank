"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/app/AppShell";
import Empty from "@/components/app/Empty";
import TestPlayer from "@/components/test/TestPlayer";
import type { Mode } from "@/lib/attempts";
import { bank, paperOrder, pickQuestions, type Question } from "@/lib/bank";
import type { TestResult } from "@/lib/dashboard-data";

type Setup = { mode: Mode; kind: TestResult["kind"]; title: string; questions: Question[]; minutes?: number };

/* /test?mode=tutor|timed|mock plus what to ask:
   subject, chapters (separated by |), ids (comma-separated), count, title, paper (a past-paper year).
   A full mock is the whole bank in paper order, one minute a question. With no questions to ask, it says so instead. */
function readSetup(): Setup {
  const p = new URLSearchParams(window.location.search);
  const mode = (["tutor", "timed", "mock"].includes(p.get("mode") ?? "") ? p.get("mode") : "tutor") as Mode;
  const paper = p.get("paper");
  const ids = p.get("ids")?.split(",").filter(Boolean);
  const count = Number(p.get("count")) || undefined;
  if (mode === "mock") {
    const qs = paperOrder(bank);
    return { mode, kind: paper ? "past-paper" : "mock", title: p.get("title") ?? (paper ? `PMDC MDCAT ${paper}` : "Full mock"), questions: qs, minutes: qs.length };
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
  if (setup && !setup.questions.length) {
    return (
      <AppShell title="Test">
        {() => (
          <div className="dgrid narrow">
            <section className="dcard panel">
              <Empty title="Questions coming soon" text="Every question is checked by a second expert against the textbook before it goes live. This test opens when they're ready.">
                <a className="dpill dark small" href="/dashboard">Back to dashboard</a>
              </Empty>
            </section>
          </div>
        )}
      </AppShell>
    );
  }
  return <AppShell bare>{(user) => setup && <TestPlayer user={user} {...setup} />}</AppShell>;
}
