import type { ExamPage } from "@/lib/exam-pages";
import { checkedText } from "@/lib/public";

/* The paper drawn as a climb: one peak per part, as wide as its share of the paper and as tall as its count, so the
   biggest part of the paper is the highest summit (with the flag on it). A paper with no published split shows its
   sittings on a trail instead. */
const W = 560, H = 230, L = 24, R = 536, G = 196;

export default function Profile({ exam }: { exam: ExamPage }) {
  const parts = exam.paper.parts;
  const total = parts.reduce((n, p) => n + p.n, 0);
  const max = Math.max(1, ...parts.map((p) => p.n));
  let x = L;
  const peaks = parts.map((p, j) => {
    const w = ((R - L) * p.n) / total;
    const h = 26 + 136 * (p.n / max);
    const pk = { name: p.name, n: p.n, j, x0: x, x1: x + w, cx: x + w / 2, y: G - h };
    x += w;
    return pk;
  });
  const top = peaks.reduce((a, b) => (b.n > a.n ? b : a), peaks[0]!);
  // Line art: valley, a shoulder, the summit, a shoulder, the next valley.
  const d = peaks.length
    ? `M${L} ${G}` + peaks.map((p) => {
        const h = G - p.y, w = p.x1 - p.x0;
        return `L${p.x0 + w * 0.28} ${p.y + h * 0.48}L${p.x0 + w * 0.36} ${p.y + h * 0.42}L${p.cx} ${p.y}L${p.x0 + w * 0.68} ${p.y + h * 0.36}L${p.x1} ${G - Math.min(18, h * 0.2)}`;
      }).join("") + `L${R} ${G}`
    : "";
  const tone = (j: number) => `color-mix(in srgb, var(--c) ${100 - j * 15}%, var(--x-card))`;

  return (
    <figure className="xe-profile x3-card">
      <figcaption>
        <span>The paper</span>
        <b>{exam.paper.summary}</b>
      </figcaption>
      {peaks.length ? (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={parts.map((p) => `${p.name} ${p.n}`).join(", ")}>
            <path className="xe-pf-ground" d={`M${L} ${G + 10}H${R}`} />
            <path className="xe-pf-fill" d={`${d}Z`} />
            {peaks.map((p) => <path key={p.name} className="xe-pf-band" d={`M${p.x0 + 2} ${G + 10}H${p.x1 - 2}`} style={{ stroke: tone(p.j) }} />)}
            <path className="xe-pf-line" d={d} pathLength={1} />
            {peaks.map((p) => (p.x1 - p.x0 > 34 ? <text key={p.name} className="xe-pf-n" x={p === top ? p.cx - 8 : p.cx} y={p === top ? p.y - 8 : p.y - 12} textAnchor={p === top ? "end" : "middle"}>{p.n}</text> : null))}
            <g className="xe-pf-flag" transform={`translate(${top.cx} ${top.y})`}>
              <path d="M0 0V-34" />
              <path className="cloth" d="M0 -33h20l-5 6 5 6H0z" />
            </g>
          </svg>
          <ul className="xe-legend">
            {parts.map((p, j) => <li key={p.name}><i style={{ background: tone(j) }} />{p.name}<b>{p.n}</b></li>)}
          </ul>
        </>
      ) : exam.paper.sittings?.length ? (
        <div className="xe-sittings">
          <small>Sittings in {exam.paper.year}</small>
          <ol>{exam.paper.sittings.map((s) => <li key={s}><i />{s}</li>)}</ol>
        </div>
      ) : null}
      <ul className="xe-notes">{exam.paper.notes.map((n) => <li key={n}>{n}</li>)}</ul>
      <p className="xe-src">From {exam.paper.source}, checked {checkedText}.</p>
    </figure>
  );
}
