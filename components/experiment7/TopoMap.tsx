import { CONTOURS } from "./contours";
import { AREAS } from "./areas";

/* The survey map behind landing experiment 7's hero, drawn on the server so its line data ships as markup, not script.
   Contour lines (every fifth one heavier), a spot-height mark on each area's summit, and the plate's edge ticks. The
   lines draw themselves in once when the page opens (stroke offset, not a fade); the client layer on top (Range.tsx)
   reuses them through <use> to tint the chosen peak. */
const LINE = { stroke: "var(--lc, var(--topo))", strokeWidth: "var(--lw, .8px)", vectorEffect: "non-scaling-stroke", strokeDasharray: 1 } as const;
const MAJ = { stroke: "var(--lm, var(--topo-maj))", strokeWidth: "var(--lwm, 1.15px)" };

export default function TopoMap() {
  return (
    <svg className="x7-topo" viewBox="0 0 1000 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {/* Styled inline through custom properties so the copy in the tint layer (a <use> clone) takes its colour from
          the layer it sits in. */}
      <g id="x7-c" fill="none">
        {CONTOURS.map((d, i) => (
          <path key={i} d={d} pathLength={1} style={{ ...LINE, ...(i % 5 === 0 ? MAJ : {}), animation: `x7-draw 2.6s cubic-bezier(.22,.8,.24,1) ${i * 45}ms backwards` }} />
        ))}
      </g>
      <g className="x7-ticks">
        {Array.from({ length: 21 }, (_, i) => <path key={`t${i}`} d={`M${i * 50} 0v${i % 5 === 0 ? 14 : 7}M${i * 50} 760v-${i % 5 === 0 ? 14 : 7}`} />)}
        {Array.from({ length: 16 }, (_, i) => <path key={`l${i}`} d={`M0 ${i * 50}h${i % 5 === 0 ? 14 : 7}M1000 ${i * 50}h-${i % 5 === 0 ? 14 : 7}`} />)}
      </g>
      <g className="x7-spots">
        {AREAS.map((a) => <path key={a.id} d={`M${a.peak.x} ${a.peak.y - 7}l6 10h-12z`} />)}
      </g>
    </svg>
  );
}
