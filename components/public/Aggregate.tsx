"use client";

import { useState } from "react";

type Row = { key: string; label: string; weight: number; got: string; of: string; eg: string };

/* The aggregate calculator: three marks, each as obtained out of total, weighted and added. The weights start at
   the PMDC formula and can be changed, since a university may publish its own. */
export default function Aggregate({ weights, mdcatTotal }: { weights: { mdcat: number; hssc: number; ssc: number }; mdcatTotal: number }) {
  const [rows, setRows] = useState<Row[]>([
    { key: "mdcat", label: "MDCAT", weight: weights.mdcat, got: "", of: String(mdcatTotal), eg: "e.g. 165" },
    { key: "hssc", label: "FSc or HSSC", weight: weights.hssc, got: "", of: "1200", eg: "e.g. 1080" },
    { key: "ssc", label: "Matric or SSC", weight: weights.ssc, got: "", of: "1200", eg: "e.g. 1100" },
  ]);
  const set = (i: number, k: "got" | "of" | "weight", v: string) =>
    setRows(rows.map((r, j) => (j === i ? { ...r, [k]: k === "weight" ? Number(v) || 0 : v } : r)));

  const parts = rows.map((r) => {
    const got = parseFloat(r.got), of = parseFloat(r.of);
    const ok = Number.isFinite(got) && Number.isFinite(of) && of > 0 && got >= 0 && got <= of;
    return { ...r, ok, pct: ok ? (got / of) * 100 : 0, share: ok ? (got / of) * r.weight : 0 };
  });
  const ready = parts.every((p) => p.ok);
  const weightSum = rows.reduce((n, r) => n + r.weight, 0);
  const total = parts.reduce((n, p) => n + p.share, 0);

  return (
    <div className="calc">
      <form className="x3-card" onSubmit={(e) => e.preventDefault()}>
        {rows.map((r, i) => (
          <fieldset key={r.key}>
            <legend>{r.label} ({r.weight}%)</legend>
            <div className="pair">
              <label><span>Marks obtained</span><input inputMode="decimal" value={r.got} onChange={(e) => set(i, "got", e.target.value)} placeholder={r.eg} aria-invalid={r.got !== "" && !parts[i].ok} /></label>
              <span>out of</span>
              <label><span>Total marks</span><input inputMode="decimal" value={r.of} onChange={(e) => set(i, "of", e.target.value)} /></label>
            </div>
          </fieldset>
        ))}
        <details>
          <summary>Change the weights</summary>
          <div className="pair" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginTop: 12 }}>
            {rows.map((r, i) => (
              <label key={r.key}><span>{r.label} %</span><input inputMode="numeric" value={r.weight} onChange={(e) => set(i, "weight", e.target.value)} /></label>
            ))}
          </div>
        </details>
      </form>
      <div className="out x3-card" aria-live="polite">
        <span>Your aggregate</span>
        <b className="big">{ready ? `${total.toFixed(2)}%` : "—"}</b>
        <dl>
          {parts.map((p) => (
            <div key={p.key}><dt>{p.label} ({p.ok ? `${p.pct.toFixed(1)}%` : "not entered"})</dt><dd>{p.ok ? p.share.toFixed(2) : "—"}</dd></div>
          ))}
        </dl>
        {weightSum !== 100 && <p className="note">The weights add up to {weightSum}%, not 100%.</p>}
        {!ready && <p className="note">Enter all three marks to see your aggregate. Marks obtained cannot be more than the total.</p>}
      </div>
    </div>
  );
}
