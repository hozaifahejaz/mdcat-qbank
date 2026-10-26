"use client";

import { useEffect, useRef, useState } from "react";
import type { TestResult } from "@/lib/dashboard-data";

const H = 168;
const pad = { t: 14, r: 12, b: 26, l: 34 };

/* Full-length mock scores over time: one line, hover or tab to a point for its score. A hidden table carries the same numbers. */
export default function ScoreTrend({ tests }: { tests: TestResult[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (tests.length < 2) {
    return <p className="muted small">Sit two full mocks to see your trend.</p>;
  }

  const scores = tests.map((t) => t.score);
  const lo = Math.max(0, Math.floor((Math.min(...scores) - 10) / 20) * 20);
  const hi = Math.min(180, Math.ceil((Math.max(...scores) + 10) / 20) * 20);
  const ticks = Array.from({ length: (hi - lo) / 20 + 1 }, (_, i) => lo + i * 20);
  const iw = Math.max(0, w - pad.l - pad.r);
  const ih = H - pad.t - pad.b;
  const x = (i: number) => pad.l + (tests.length === 1 ? iw / 2 : (i / (tests.length - 1)) * iw);
  const y = (s: number) => pad.t + ih - ((s - lo) / (hi - lo)) * ih;
  const path = tests.map((t, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(t.score).toFixed(1)}`).join("");
  const label = (t: TestResult) => new Date(t.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Karachi" });
  const h = hover === null ? null : tests[hover];

  return (
    <div className="trend" ref={box} onMouseLeave={() => setHover(null)}>
      {w > 0 && (
        <svg width={w} height={H} role="img" aria-label={`Mock scores from ${scores[0]} to ${scores.at(-1)} out of 180`}>
          {ticks.map((v) => (
            <g key={v}>
              <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} className="grid" />
              <text x={pad.l - 8} y={y(v)} className="axis" textAnchor="end" dominantBaseline="middle">{v}</text>
            </g>
          ))}
          {tests.map((t, i) => (
            (i === 0 || i === tests.length - 1 || tests.length * 52 <= iw) && (
              <text key={t.id} x={x(i)} y={H - 6} className="axis" textAnchor={i === 0 ? "start" : i === tests.length - 1 ? "end" : "middle"}>{label(t)}</text>
            )
          ))}
          {h && <line x1={x(hover!)} x2={x(hover!)} y1={pad.t} y2={pad.t + ih} className="cross" />}
          <path d={path} className="line" />
          {tests.map((t, i) => (
            <g key={t.id}>
              <circle cx={x(i)} cy={y(t.score)} r={hover === i ? 6 : 4} className="dot" />
              <rect
                x={x(i) - iw / (tests.length - 1) / 2} y={pad.t} width={iw / (tests.length - 1)} height={ih}
                fill="transparent" tabIndex={0} aria-label={`${t.title}, ${label(t)}: ${t.score} out of 180`}
                onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
              />
            </g>
          ))}
          <text x={x(tests.length - 1) - 8} y={y(scores.at(-1)!) - 10} className="end-label" textAnchor="end">{scores.at(-1)}</text>
        </svg>
      )}
      {h && (
        <div className="tip" style={{ left: Math.min(Math.max(x(hover!), 70), w - 70), top: y(h.score) - 8 }}>
          <b>{h.score}/180</b>
          <span>{h.title} · {label(h)}</span>
        </div>
      )}
      <table className="sr">
        <caption>Mock scores</caption>
        <thead><tr><th>Test</th><th>Date</th><th>Score</th></tr></thead>
        <tbody>{tests.map((t) => <tr key={t.id}><td>{t.title}</td><td>{label(t)}</td><td>{t.score}/180</td></tr>)}</tbody>
      </table>
    </div>
  );
}
