"use client";

import { useId } from "react";
import type { TrackId } from "@/lib/catalogue";
import { useArea } from "@/components/experiment4/ExamState";

/* One large drawn object on each side of the hero, matching the area the hero shows (a stethoscope and a flask for
   pre-medical, scales and a gavel for law, and so on). Original artwork, decorative only. */

type Draw = (u: string) => React.ReactNode;

const lin = (id: string, a: string, b: string, h = false) => (
  <linearGradient id={id} x1="0" y1="0" x2={h ? 1 : 0} y2={h ? 0 : 1}>
    <stop offset="0" stopColor={a} />
    <stop offset="1" stopColor={b} />
  </linearGradient>
);
const rad = (id: string, a: string, b: string) => (
  <radialGradient id={id} cx=".35" cy=".3" r=".8">
    <stop offset="0" stopColor={a} />
    <stop offset="1" stopColor={b} />
  </radialGradient>
);

function gear(cx: number, cy: number, ro: number, ri: number, n: number) {
  const step = (Math.PI * 2) / n, p: string[] = [];
  const pt = (a: number, r: number) => `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const a = i * step;
    p.push(pt(a - step * 0.3, ri), pt(a - step * 0.16, ro), pt(a + step * 0.16, ro), pt(a + step * 0.3, ri));
  }
  return `M${p.join("L")}Z`;
}

const objects: Record<string, Draw> = {
  flask: (u) => (<>
    <defs>{lin(`${u}g`, "#e0f2fe", "#bae6fd")}{lin(`${u}l`, "#34d399", "#047857")}</defs>
    <rect x="60" y="12" width="40" height="11" rx="5.5" fill="#cbd5e1" />
    <path d="M68 22h24v40l40 66q6 14-8 14H36q-14 0-8-14l40-66z" fill={`url(#${u}g)`} fillOpacity=".85" stroke="#7dd3fc" strokeWidth="3" />
    <path d="M51 96h58l23 32q6 14-8 14H36q-14 0-8-14z" fill={`url(#${u}l)`} />
    <ellipse cx="80" cy="96" rx="29" ry="4" fill="#6ee7b7" />
    <circle cx="68" cy="118" r="6" fill="#fff" opacity=".55" /><circle cx="94" cy="126" r="4" fill="#fff" opacity=".55" /><circle cx="86" cy="108" r="3" fill="#fff" opacity=".55" />
    <path d="M75 30v34l-28 48" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".7" />
    <path d="M92 70h-8M99 82h-8M106 94h-8" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" />
  </>),
  stethoscope: (u) => (<>
    <defs>{rad(`${u}m`, "#f8fafc", "#94a3b8")}{lin(`${u}t`, "#3b82f6", "#1d4ed8")}</defs>
    <path d="M46 20c-8 34-2 58 28 66M102 20c8 34 2 58-28 66" stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" fill="none" />
    <path d="M74 86c0 36 30 50 46 32 8-9 8-20 4-26" stroke={`url(#${u}t)`} strokeWidth="10" strokeLinecap="round" fill="none" />
    <circle cx="46" cy="16" r="8" fill="#475569" /><circle cx="102" cy="16" r="8" fill="#475569" />
    <rect x="118" y="86" width="10" height="10" rx="3" fill="#64748b" />
    <circle cx="123" cy="70" r="22" fill={`url(#${u}m)`} stroke="#64748b" strokeWidth="2" />
    <circle cx="123" cy="70" r="14" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="3" />
    <ellipse cx="117" cy="63" rx="6" ry="4" fill="#fff" opacity=".9" />
  </>),
  compass: (u) => (<>
    <defs>{lin(`${u}m`, "#e2e8f0", "#64748b", true)}{lin(`${u}p`, "#fcd34d", "#f59e0b")}</defs>
    <path d="M36 150q44-34 88-6" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="6 8" fill="none" strokeLinecap="round" />
    <path d="M74 36 38 144l8 3 38-109z" fill={`url(#${u}m)`} />
    <path d="M86 36l32 94-8 3-34-95z" fill={`url(#${u}m)`} />
    <path d="M40 142l-3 12" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
    <path d="M109 128l11-4 6 16-8 12-7-10z" fill={`url(#${u}p)`} /><path d="M118 152l-2 5" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
    <rect x="73" y="6" width="14" height="20" rx="5" fill={`url(#${u}p)`} />
    <circle cx="80" cy="32" r="12" fill={`url(#${u}m)`} stroke="#475569" strokeWidth="2" /><circle cx="80" cy="32" r="4" fill="#475569" />
  </>),
  gear: (u) => (<>
    <defs>{lin(`${u}a`, "#fcd34d", "#d97706")}{lin(`${u}b`, "#cbd5e1", "#64748b")}</defs>
    <g className="x8-spin" style={{ transformOrigin: "66px 66px" }}>
      <path d={gear(66, 66, 58, 46, 12)} fill={`url(#${u}a)`} />
      <circle cx="66" cy="66" r="24" fill="#b45309" /><circle cx="66" cy="66" r="11" fill="#fef3c7" />
    </g>
    <g className="x8-spin x8-back" style={{ transformOrigin: "122px 124px" }}>
      <path d={gear(122, 124, 34, 26, 9)} fill={`url(#${u}b)`} />
      <circle cx="122" cy="124" r="13" fill="#475569" /><circle cx="122" cy="124" r="6" fill="#e2e8f0" />
    </g>
  </>),
  heart: (u) => (<>
    <defs>{rad(`${u}h`, "#fda4af", "#e11d48")}</defs>
    <path d="M80 142C30 108 14 82 14 57c0-22 16-37 36-37 14 0 24 8 30 20 6-12 16-20 30-20 20 0 36 15 36 37 0 25-16 51-66 85z" fill={`url(#${u}h)`} />
    <ellipse cx="44" cy="48" rx="14" ry="8" transform="rotate(-35 44 48)" fill="#fff" opacity=".5" />
    <path d="M28 80h28l8-18 11 38 10-28 6 8h41" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>),
  microscope: (u) => (<>
    <defs>{lin(`${u}b`, "#475569", "#1e293b")}{lin(`${u}t`, "#f1f5f9", "#94a3b8", true)}</defs>
    <rect x="28" y="134" width="104" height="14" rx="7" fill={`url(#${u}b)`} />
    <path d="M104 134c24-26 22-66-4-86" stroke="#475569" strokeWidth="14" strokeLinecap="round" fill="none" />
    <rect x="40" y="100" width="70" height="9" rx="4.5" fill="#334155" />
    <rect x="56" y="95" width="34" height="5" rx="1.5" fill="#7dd3fc" />
    <g transform="rotate(-28 74 56)">
      <rect x="62" y="20" width="26" height="70" rx="7" fill={`url(#${u}t)`} stroke="#64748b" strokeWidth="2" />
      <rect x="66" y="6" width="18" height="18" rx="4" fill="#1e293b" />
      <rect x="68" y="88" width="14" height="12" rx="3" fill="#f59e0b" />
      <rect x="62" y="48" width="26" height="8" fill="#64748b" />
    </g>
  </>),
  scales: (u) => (<>
    <defs>{lin(`${u}g`, "#fde68a", "#d97706")}{lin(`${u}d`, "#f59e0b", "#92400e")}</defs>
    <path d="M30 44 14 94M30 44l16 50M130 44l-16 50M130 44l16 50" stroke="#b45309" strokeWidth="2" />
    <path d="M50 148h60l-10-14H60z" fill={`url(#${u}d)`} />
    <rect x="76" y="30" width="8" height="108" rx="3" fill={`url(#${u}g)`} />
    <rect x="20" y="38" width="120" height="8" rx="4" fill={`url(#${u}g)`} />
    <circle cx="80" cy="26" r="8" fill={`url(#${u}g)`} />
    <path d="M8 94h44q-4 20-22 20T8 94zM108 94h44q-4 20-22 20t-22-20z" fill={`url(#${u}g)`} stroke="#b45309" strokeWidth="1.5" />
  </>),
  gavel: (u) => (<>
    <defs>{lin(`${u}w`, "#c2763a", "#78350f")}{lin(`${u}h`, "#d6935a", "#92400e", true)}</defs>
    <rect x="8" y="130" width="96" height="20" rx="6" fill="#78350f" />
    <rect x="8" y="124" width="96" height="14" rx="6" fill={`url(#${u}w)`} />
    <g transform="rotate(-35 80 70)">
      <rect x="74" y="66" width="12" height="78" rx="6" fill={`url(#${u}h)`} />
      <rect x="36" y="34" width="88" height="36" rx="9" fill={`url(#${u}w)`} />
      <rect x="36" y="34" width="12" height="36" rx="6" fill="#78350f" /><rect x="112" y="34" width="12" height="36" rx="6" fill="#78350f" />
      <rect x="56" y="34" width="7" height="36" fill="#fcd34d" /><rect x="97" y="34" width="7" height="36" fill="#fcd34d" />
      <rect x="44" y="39" width="72" height="5" rx="2.5" fill="#fff" opacity=".25" />
    </g>
  </>),
  cap: (u) => (<>
    <defs>{lin(`${u}n`, "#475569", "#0f172a")}{lin(`${u}y`, "#fde68a", "#f59e0b")}</defs>
    <path d="M40 74v32c0 16 80 16 80 0V74L80 90z" fill="#1e293b" />
    <path d="M80 30l72 30-72 30L8 60z" fill={`url(#${u}n)`} />
    <path d="M80 34 20 60" stroke="#fff" strokeOpacity=".2" strokeWidth="3" strokeLinecap="round" />
    <path d="M80 60q40 4 50 8v42" stroke={`url(#${u}y)`} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <circle cx="80" cy="60" r="6" fill={`url(#${u}y)`} />
    <path d="M124 108h12l3 26h-18z" fill={`url(#${u}y)`} />
  </>),
  books: (u) => (<>
    <defs>{lin(`${u}a`, "#60a5fa", "#1d4ed8")}{lin(`${u}b`, "#fb7185", "#be123c")}{lin(`${u}c`, "#34d399", "#047857")}</defs>
    <rect x="14" y="116" width="132" height="26" rx="4" fill={`url(#${u}a)`} /><rect x="128" y="120" width="12" height="18" fill="#f8fafc" />
    <g transform="rotate(-4 80 102)"><rect x="24" y="90" width="114" height="26" rx="4" fill={`url(#${u}b)`} /><rect x="122" y="94" width="11" height="18" fill="#fff" /><rect x="40" y="90" width="6" height="26" fill="#fff" opacity=".3" /></g>
    <g transform="rotate(3 80 76)"><rect x="18" y="64" width="116" height="26" rx="4" fill={`url(#${u}c)`} /><rect x="118" y="68" width="11" height="18" fill="#fff" /><rect x="34" y="64" width="6" height="26" fill="#fff" opacity=".3" /></g>
    <path d="M64 64V40l8 6 8-6v26" fill="#f59e0b" transform="rotate(3 80 76)" />
    <rect x="26" y="121" width="80" height="4" rx="2" fill="#fff" opacity=".3" />
  </>),
  briefcase: (u) => (<>
    <defs>{lin(`${u}l`, "#b45309", "#7c2d12")}{lin(`${u}y`, "#fde68a", "#d97706")}</defs>
    <path d="M60 48V36q0-10 10-10h20q10 0 10 10v12" stroke="#78350f" strokeWidth="9" fill="none" />
    <rect x="14" y="46" width="132" height="94" rx="14" fill={`url(#${u}l)`} />
    <path d="M14 86h132" stroke="#4a1d0a" strokeOpacity=".45" strokeWidth="3" />
    <rect x="24" y="53" width="112" height="7" rx="3.5" fill="#fff" opacity=".15" />
    <rect x="68" y="76" width="24" height="20" rx="4" fill={`url(#${u}y)`} /><rect x="76" y="83" width="8" height="6" rx="2" fill="#92400e" />
  </>),
  clipboard: (u) => (<>
    <defs>{lin(`${u}w`, "#f59e0b", "#92400e")}{lin(`${u}m`, "#f1f5f9", "#94a3b8")}</defs>
    <rect x="26" y="20" width="108" height="134" rx="12" fill={`url(#${u}w)`} />
    <rect x="38" y="36" width="84" height="108" rx="4" fill="#fff" />
    <rect x="54" y="10" width="52" height="24" rx="7" fill={`url(#${u}m)`} stroke="#64748b" strokeWidth="2" /><rect x="72" y="15" width="16" height="6" rx="3" fill="#64748b" />
    {[62, 88, 114].map((y) => (
      <g key={y}><path d={`M46 ${y}l5 5 9-10`} stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /><rect x="68" y={y - 3} width="44" height="7" rx="3.5" fill="#e2e8f0" /></g>
    ))}
  </>),
  atom: (u) => (<>
    <defs>{lin(`${u}o`, "#a78bfa", "#6d28d9", true)}{rad(`${u}n`, "#fdba74", "#ea580c")}</defs>
    <g className="x8-spin" style={{ transformOrigin: "80px 80px" }}>
      {[0, 60, 120].map((r) => (
        <g key={r} transform={`rotate(${r} 80 80)`}><ellipse cx="80" cy="80" rx="68" ry="25" stroke={`url(#${u}o)`} strokeWidth="6" fill="none" /><circle cx={r === 60 ? 12 : 148} cy="80" r="7" fill="#38bdf8" /></g>
      ))}
    </g>
    <circle cx="80" cy="80" r="16" fill={`url(#${u}n)`} /><circle cx="75" cy="74" r="5" fill="#fff" opacity=".6" />
  </>),
  plane: (u) => (<>
    <defs>{lin(`${u}a`, "#ffffff", "#bae6fd")}{lin(`${u}b`, "#7dd3fc", "#0284c7")}</defs>
    <path d="M8 138q34 22 54-14" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 8" strokeLinecap="round" fill="none" />
    <path d="M12 78 150 18 62 94z" fill={`url(#${u}a)`} stroke="#7dd3fc" strokeWidth="2" strokeLinejoin="round" />
    <path d="M62 94 150 18l-56 116z" fill={`url(#${u}b)`} strokeLinejoin="round" />
    <path d="M62 94l6 34 26-30z" fill="#0369a1" />
  </>),
  globe: (u) => (<>
    <defs>{rad(`${u}s`, "#7dd3fc", "#0369a1")}<clipPath id={`${u}c`}><circle cx="78" cy="72" r="48" /></clipPath></defs>
    <path d="M28 66a52 52 0 0 0 92 50" stroke="#94a3b8" strokeWidth="6" fill="none" strokeLinecap="round" />
    <rect x="73" y="124" width="12" height="16" fill="#64748b" /><ellipse cx="79" cy="146" rx="36" ry="9" fill="#475569" />
    <circle cx="78" cy="72" r="48" fill={`url(#${u}s)`} />
    <g clipPath={`url(#${u}c)`} fill="#4ade80">
      <path d="M44 46c10-14 32-12 34 2 2 12-12 14-16 26s-18 8-20-2-6-16 2-26z" />
      <path d="M92 74c12-8 30 0 26 16-4 14-20 18-26 6s-8-16 0-22z" />
      <path d="M90 32c8-6 22 0 18 8-4 6-14 4-18-8z" />
    </g>
    <ellipse cx="78" cy="72" rx="22" ry="48" stroke="#fff" strokeOpacity=".3" strokeWidth="2" fill="none" />
    <ellipse cx="60" cy="50" rx="14" ry="8" transform="rotate(-30 60 50)" fill="#fff" opacity=".4" />
  </>),
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
  const u = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={`x8-obj x8-${side}`}>
      <span className="x8-bob">
        <svg viewBox="0 0 160 160" width="100%" height="100%" aria-hidden="true">{objects[name](u)}</svg>
      </span>
    </span>
  );
}

export default function HeroIcons() {
  const { shown } = useArea();
  const [l, r] = pairs[shown.id as TrackId] ?? pairs.medical;
  return (
    <div className="x8-floats" aria-hidden="true" key={shown.id}>
      <Obj name={l} side="left" />
      <Obj name={r} side="right" />
    </div>
  );
}
