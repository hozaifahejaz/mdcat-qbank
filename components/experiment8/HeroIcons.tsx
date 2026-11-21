"use client";

import type { TrackId } from "@/lib/catalogue";
import { useArea } from "@/components/experiment4/ExamState";

/* One drawn object on each side of the hero, matching the area the hero shows (a stethoscope and a flask for
   pre-medical, scales and a gavel for law, and so on). Original artwork, decorative only. */

/* Each object is a line drawing on the 160 grid in the same style as components/Marks.tsx: one stroke weight, round
   ends, a soft fill at 0.18 opacity, all in currentColor (the area's colour). */
type Shape = { soft?: string; line: string; spin?: [string, string] };

function gear(cx: number, cy: number, ro: number, ri: number, n: number) {
  const step = (Math.PI * 2) / n, p: string[] = [];
  const pt = (a: number, r: number) => `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const a = i * step;
    p.push(pt(a - step * 0.3, ri), pt(a - step * 0.16, ro), pt(a + step * 0.16, ro), pt(a + step * 0.3, ri));
  }
  return `M${p.join("L")}Z`;
}
const circ = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;

const objects: Record<string, Shape> = {
  flask: { soft: "M51 96h58l23 32q6 14-8 14H36q-14 0-8-14z", line: `M60 16h40M68 16v46l-40 66q-6 14 8 14h88q14 0 8-14L92 62V16M51 96h58M92 74h-8M99 86h-8${circ(70, 120, 5)}${circ(90, 112, 3.5)}` },
  stethoscope: { soft: circ(122, 66, 20), line: `M46 18c-8 34-2 60 28 68M102 18c8 34 2 60-28 68M74 86c0 36 30 50 46 32 8-9 6-22 2-32${circ(122, 66, 20)}${circ(122, 66, 8)}${circ(46, 16, 3)}${circ(102, 16, 3)}` },
  compass: { soft: `${circ(80, 32, 11)}M42 146q38-30 74-12z`, line: `M80 8v13${circ(80, 32, 11)}M74 42 42 146M86 42l32 92M118 134l-2 12` },
  gear: { line: "", spin: [`${gear(64, 64, 50, 40, 12)}${circ(64, 64, 15)}`, `${gear(120, 120, 30, 22, 9)}${circ(120, 120, 8)}`] },
  heart: { soft: "M80 140C32 108 16 82 16 58c0-22 16-36 35-36 13 0 23 8 29 19 6-11 16-19 29-19 19 0 35 14 35 36 0 24-16 50-64 82z", line: "M80 140C32 108 16 82 16 58c0-22 16-36 35-36 13 0 23 8 29 19 6-11 16-19 29-19 19 0 35 14 35 36 0 24-16 50-64 82zM34 82h22l8-18 11 36 10-26 6 8h36" },
  microscope: { soft: "M58 22l22-12 30 52-22 12z", line: "M58 22l22-12 30 52-22 12zM28 144h104M104 144c22-24 22-60-2-80M40 112h70M86 74l6 12M60 112v-8h30v8" },
  scales: { soft: "M10 96h40q-4 20-20 20T10 96zM110 96h40q-4 20-20 20t-20-20z", line: `M80 30v112M54 144h52M20 42h120M30 42 12 96M30 42l18 54M130 42l-18 54M130 42l18 54M10 96h40q-4 20-20 20T10 96zM110 96h40q-4 20-20 20t-20-20z${circ(80, 26, 5)}` },
  gavel: { soft: "M40 54 86 22l20 30-46 32z", line: "M40 54 86 22l20 30-46 32zM50 47l20 30M78 28l20 30M84 68l44 64M14 146h76M20 146v-14h64v14" },
  cap: { soft: "M80 32l72 30-72 30L8 62z", line: "M80 32l72 30-72 30L8 62zM40 78v28c0 16 80 16 80 0V78M80 62q40 4 50 8v40M124 110h12l3 22h-18z" },
  books: { soft: "M16 116h128v26H16zM22 64h116v26H22z", line: "M16 116h128v26H16zM28 90h108v26H28zM22 64h116v26H22zM124 122v14M120 96v14M124 70v14M36 64v26M44 116v26M64 64V42l8 6 8-6v22" },
  briefcase: { soft: "M16 48h128v90H16z", line: "M16 48h128v90H16zM60 48V36q0-10 10-10h20q10 0 10 10v12M16 88h128M70 80h20v18H70z" },
  clipboard: { soft: "M28 20h104v134H28z", line: "M28 20h104v134H28zM56 10h48v22H56zM46 62l5 5 9-10M46 90l5 5 9-10M46 118l5 5 9-10M70 62h44M70 90h44M70 118h44" },
  atom: { soft: circ(80, 80, 14), line: circ(80, 80, 14), spin: ["M12 80a68 25 0 1 0 136 0a68 25 0 1 0-136 0", ""] },
  plane: { soft: "M12 78 150 18 62 94z", line: "M12 78 150 18 62 94zM62 94 150 18l-56 116zM62 94l6 34 26-30M10 138q32 20 50-12" },
  globe: { soft: circ(78, 70, 46), line: `${circ(78, 70, 46)}M32 70h92M78 24c14 14 20 30 20 46s-6 32-20 46c-14-14-20-30-20-46s6-32 20-46zM28 64a52 52 0 0 0 92 52M78 126v14M52 146h52` },
};

const pairs: Record<TrackId, [string, string]> = {
  medical: ["stethoscope", "flask"],
  engineering: ["compass", "gear"],
  doctors: ["heart", "microscope"],
  law: ["scales", "gavel"],
  postgrad: ["cap", "books"],
  jobs: ["briefcase", "clipboard"],
  cambridge: ["books", "atom"],
  abroad: ["plane", "globe"],
};

function Obj({ name, side }: { name: string; side: "left" | "right" }) {
  const o = objects[name];
  const sp = { fill: "none", stroke: "currentColor", strokeWidth: 6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <span className={`x8-obj x8-${side}`}>
      <span className="x8-bob">
        <svg viewBox="0 0 160 160" width="100%" height="100%" aria-hidden="true">
          {o.soft && <path d={o.soft} fill="currentColor" opacity=".18" />}
          {o.line && <path d={o.line} {...sp} />}
          {name === "atom" ? (
            <g className="x8-spin" style={{ transformOrigin: "80px 80px" }}>
              {[0, 60, 120].map((r) => <path key={r} d={o.spin![0]} transform={`rotate(${r} 80 80)`} {...sp} />)}
            </g>
          ) : o.spin && (<>
            <g className="x8-spin" style={{ transformOrigin: "64px 64px" }}><path d={o.spin[0]} fill="currentColor" fillRule="evenodd" opacity=".18" /><path d={o.spin[0]} {...sp} /></g>
            <g className="x8-spin x8-back" style={{ transformOrigin: "120px 120px" }}><path d={o.spin[1]} fill="currentColor" fillRule="evenodd" opacity=".18" /><path d={o.spin[1]} {...sp} /></g>
          </>)}
        </svg>
      </span>
    </span>
  );
}

export default function HeroIcons() {
  const { shown } = useArea();
  const [l, r] = pairs[shown.id as TrackId] ?? pairs.medical;
  return (
    <div className="x8-floats" aria-hidden="true" key={shown.id} style={{ color: shown.colour }}>
      <Obj name={l} side="left" />
      <Obj name={r} side="right" />
    </div>
  );
}
