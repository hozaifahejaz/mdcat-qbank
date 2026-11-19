"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

/* One line of proof under the hero: how many questions are in the bank right now, from /api/stats (kept counts, so it
   costs next to nothing). Until it answers, and if it can't, the line shows the numbers the page was built with
   (lib/site.ts), so it doesn't change shape as it loads. */
export default function BankSize() {
  const [n, setN] = useState<number | null>(site.bank.questions);
  const [papers, setPapers] = useState<number[]>(site.bank.papers);
  useEffect(() => {
    fetch("/api/stats").then((r) => (r.ok ? r.json() : null)).then((d: { questions?: number; papers?: number[] } | null) => {
      if (d?.questions && d.questions >= 100) setN(Math.floor(d.questions / 100) * 100);
      if (d?.papers?.length) setPapers(d.papers);
    }).catch(() => {});
  }, []);
  return (
    <p className="proof">
      <span><b>{n ? `${n.toLocaleString("en-GB")}+` : "Thousands of"}</b> questions</span>
      <span>Every one explained</span>
      {papers.length > 0 && <span>MDCAT {papers[0]} past paper</span>}
    </p>
  );
}
