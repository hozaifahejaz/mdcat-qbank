"use client";

import type { TrackId } from "@/lib/catalogue";
import { useArea } from "@/components/experiment4/ExamState";

/* One drawn object on each side of the hero, matching the area the hero shows (a stethoscope and a flask for
   pre-medical, scales and a gavel for law, and so on). Original artwork, decorative only. */

/* Each object is a line drawing on the 160 grid in the same style as components/Marks.tsx: one stroke weight, round
   ends, a soft fill at 0.18 opacity, all in currentColor (the area's colour). */
type Shape = { soft?: string; line: string; dash?: string; spin?: [string, string] };

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
  flask: {
    soft: "M46 98q8.5-6 17 0t17 0 17 0 17 0l18 30q6 14-8 14H36q-14 0-8-14z",
    line: `M58 14h44M66 14v8M94 14v8M68 22v40l-40 66q-6 14 8 14h88q14 0 8-14L92 62V22M66 34h28M46 98q8.5-6 17 0t17 0 17 0 17 0M100 74h-6M106 86h-6${circ(66, 120, 6)}${circ(92, 126, 4)}${circ(80, 112, 3)}`,
  },
  stethoscope: {
    soft: `${circ(122, 70, 20)}`,
    line: `M44 22c-8 30-4 56 30 64M104 22c8 30 4 56-30 64M40 14l6 10M108 14l-6 10M74 86v10c0 30 24 44 40 30 8-7 8-18 8-36${circ(122, 70, 20)}${circ(122, 70, 9)}${circ(74, 86, 4)}`,
  },
  compass: {
    soft: `${circ(80, 34, 10)}M108 124l12-4 4 16-8 10z`,
    line: `M76 6h8v16h-8zM80 22v2${circ(80, 34, 10)}M74 44 44 136M86 44l24 72M44 136l-3 12M108 124l12-4 4 16-8 10-8-22zM116 146l-1 6`,
    dash: "M30 148q48-36 92 0",
  },
  gear: { line: "", spin: [`${gear(64, 64, 50, 40, 12)}${circ(64, 64, 15)}`, `${gear(120, 120, 30, 22, 9)}${circ(120, 120, 8)}`] },
  heart: {
    soft: "M80 140C32 108 16 82 16 58c0-22 16-36 35-36 13 0 23 8 29 19 6-11 16-19 29-19 19 0 35 14 35 36 0 24-16 50-64 82z",
    line: "M80 140C32 108 16 82 16 58c0-22 16-36 35-36 13 0 23 8 29 19 6-11 16-19 29-19 19 0 35 14 35 36 0 24-16 50-64 82zM34 82h22l8-18 11 36 10-26 6 8h36M38 52c0-8 6-14 14-14",
  },
  microscope: {
    soft: "M30 132h100v12H30zM54 28l18-9 30 54-18 9z",
    line: "M30 132h100v12H30zM54 28l18-9 30 54-18 9zM48 18l18-9M57 23l-4-8M86 82l6 11M40 104h66M52 104v-6h24v6M96 132v-12c22-10 24-48 4-66M68 104v28",
  },
  scales: {
    soft: "M10 96h40q-4 20-20 20T10 96zM110 96h40q-4 20-20 20t-20-20zM58 132h44l8 12H50z",
    line: `M80 32v100M58 132h44l8 12H50zM20 42h120M30 42 12 96M30 42l18 54M130 42l-18 54M130 42l18 54M10 96h40q-4 20-20 20T10 96zM110 96h40q-4 20-20 20t-20-20z${circ(80, 26, 6)}`,
  },
  gavel: {
    soft: "M38 54 84 22l20 30-46 32zM16 132h80v12H16z",
    line: "M38 54 84 22l20 30-46 32zM48 47l20 30M74 29l20 30M82 68l40 58M16 132h80v12H16zM22 132v-6h68v6M118 98l12-6M124 112l14 0M112 86l6-12",
  },
  cap: {
    soft: "M80 32l72 30-72 30L8 62z",
    line: "M80 32l72 30-72 30L8 62zM40 78v26c0 18 80 18 80 0V78M80 62q40 4 52 10v38M126 110h12l4 24h-20zM128 134l-1 6M136 134l1 6",
  },
  books: {
    soft: "M16 116h128v26H16zM22 64h116v26H22z",
    line: "M16 116h128v26H16zM28 90h108v26H28zM22 64h116v26H22zM122 122v14M116 96v14M122 70v14M36 64v26M48 90v26M30 116v26M64 64V42l8 6 8-6v22M58 77h40M70 103h30M50 129h50",
  },
  briefcase: {
    soft: "M16 48h128v90H16z",
    line: "M16 56q0-8 8-8h112q8 0 8 8v74q0 8-8 8H24q-8 0-8-8zM60 48V36q0-10 10-10h20q10 0 10 10v12M16 88h54M90 88h54M70 80h20v18H70zM40 48v90M120 48v90",
  },
  clipboard: {
    soft: "M28 20h104v134H28z",
    line: "M36 20h88q8 0 8 8v118q0 8-8 8H36q-8 0-8-8V28q0-8 8-8zM56 10h48v22H56zM74 16h12M44 60l6 6 10-12M44 90l6 6 10-12M44 120l6 6 10-12M72 60h44M72 90h44M72 120h30",
  },
  atom: { soft: circ(80, 80, 14), line: `${circ(80, 80, 14)}`, spin: ["M12 80a68 25 0 1 0 136 0a68 25 0 1 0-136 0", ""] },
  plane: {
    soft: "M12 78 150 18 62 94z",
    line: "M12 78 150 18 62 94zM62 94 150 18l-56 116zM62 94l6 34 26-30",
    dash: "M6 140q30 16 50-12",
  },
  globe: {
    soft: `${circ(78, 70, 46)}`,
    line: `${circ(78, 70, 46)}M34 56h88M34 84h88M78 24c14 14 20 30 20 46s-6 32-20 46c-14-14-20-30-20-46s6-32 20-46zM26 62a54 54 0 0 0 96 54M78 128v12M52 146h52`,
  },
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
          {o.dash && <path d={o.dash} {...sp} strokeDasharray="1 12" />}
          {name === "atom" ? (
            <g className="x8-spin" style={{ transformOrigin: "80px 80px" }}>
              {[0, 60, 120].map((r) => (
                <g key={r} transform={`rotate(${r} 80 80)`}><path d={o.spin![0]} {...sp} /><circle cx={r === 60 ? 12 : 148} cy="80" r="7" fill="currentColor" /></g>
              ))}
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
