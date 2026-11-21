"use client";

import { SubjectMark, ExamMark } from "@/components/Marks";
import TrackMark from "@/components/experiment4/TrackMark";
import type { TrackId } from "@/lib/catalogue";
import { useArea } from "@/components/experiment4/ExamState";

/* Floating icons on both sides of the hero, three a side, that change with the area the hero shows. Same 24-grid,
   one-weight line style as components/Marks.tsx. Decorative only. */

type Ic = { s: string } | { e: string } | { t: TrackId } | { d: { soft?: string; line: string } };

const draw = {
  gavel: { soft: "M6.6 5.2 11 9.6l-3.4 3.4-4.4-4.4z", line: "M6.6 5.2 11 9.6l-3.4 3.4-4.4-4.4zM9.4 2.4l5.2 5.2M1.8 10.4 7 15.6M9.3 11.3 18.7 20.7M13 21h8" },
  book: { soft: "M4 4.5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4z", line: "M4 4.5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 4.5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z" },
  landmark: { soft: "M3.5 8.5 12 4l8.5 4.5z", line: "M3.5 8.5 12 4l8.5 4.5zM5.5 11v6.5M10 11v6.5M14 11v6.5M18.5 11v6.5M3 20.5h18" },
  pen: { soft: "M15.5 4.5l4 4L9 19l-5 1 1-5z", line: "M15.5 4.5l4 4L9 19l-5 1 1-5zM13 7l4 4" },
  heart: { soft: "M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.2 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z", line: "M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.2 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10zM7 12h2.5l1.2-2.2 2 4.4 1.3-2.2H17" },
  pill: { soft: "M4.9 13.1l8.2-8.2a4 4 0 0 1 5.7 5.7l-4.1 4.1z", line: "M10.9 19.1a4 4 0 0 1-5.7-5.7l8.2-8.2a4 4 0 0 1 5.7 5.7zM9 9l6 6" },
  microscope: { soft: "M9 3.5h3l1 7h-5z", line: "M9 3.5h3l1 7h-5zM10.5 10.5v2.5M6 20.5h12M8 17.5a6 6 0 0 0 10-4.5 6 6 0 0 0-4-5.6M9.5 17.5H6" },
  bulb: { soft: "M12 3.5a6 6 0 0 0-3.5 10.9V16h7v-1.6A6 6 0 0 0 12 3.5z", line: "M12 3.5a6 6 0 0 0-3.5 10.9V16h7v-1.6A6 6 0 0 0 12 3.5zM9.5 19h5M10.5 21.5h3" },
  chart: { soft: "M6 13h3v7H6zM10.5 9h3v11h-3zM15 5h3v15h-3z", line: "M6 13h3v7H6zM10.5 9h3v11h-3zM15 5h3v15h-3zM3.5 20.5h17" },
  calc: { soft: "M5.5 3.5h13v17h-13z", line: "M5.5 3.5h13v17h-13zM8.5 6.5h7v3h-7zM8.5 13h.01M12 13h.01M15.5 13h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01" },
  shield: { soft: "M12 3 4.5 6v5.5c0 4.5 3.2 8.2 7.5 9.5 4.3-1.3 7.5-5 7.5-9.5V6z", line: "M12 3 4.5 6v5.5c0 4.5 3.2 8.2 7.5 9.5 4.3-1.3 7.5-5 7.5-9.5V6zM8.8 12l2.2 2.2 4.2-4.4" },
  flag: { soft: "M5 4.5c4-2 7 2 14 0v9c-7 2-10-2-14 0z", line: "M5 21V4.5M5 4.5c4-2 7 2 14 0v9c-7 2-10-2-14 0" },
  plane: { soft: "M3 13.5 21 6l-4.5 12-4-4.5z", line: "M3 13.5 21 6l-4.5 12-4-4.5zM21 6 12.5 13.5V19l2.6-2.6" },
  chat: { soft: "M4 5h16v11H9l-5 4z", line: "M4 5h16v11H9l-5 4zM8 9.5h8M8 12.5h5" },
  code: { soft: "M3.5 4.5h17v15h-17z", line: "M3.5 4.5h17v15h-17zM9 10l-2.5 2.5L9 15M15 10l2.5 2.5L15 15M13 9l-2 7" },
  clock: { soft: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", line: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7.5V12l3 2" },
};

const sets: Record<TrackId, [Ic[], Ic[]]> = {
  medical: [[{ s: "Biology" }, { e: "mdcat" }, { s: "English" }], [{ s: "Chemistry" }, { s: "Physics" }, { s: "Logical Reasoning" }]],
  engineering: [[{ s: "Mathematics" }, { e: "ecat" }, { d: draw.code }], [{ s: "Physics" }, { s: "Chemistry" }, { e: "net" }]],
  doctors: [[{ e: "mdcat" }, { d: draw.heart }, { d: draw.pill }], [{ t: "doctors" }, { d: draw.microscope }, { d: draw.bulb }]],
  law: [[{ e: "lat" }, { d: draw.book }, { d: draw.pen }], [{ d: draw.gavel }, { d: draw.landmark }, { s: "English" }]],
  postgrad: [[{ t: "postgrad" }, { d: draw.chart }, { d: draw.pen }], [{ d: draw.bulb }, { d: draw.calc }, { s: "English" }]],
  jobs: [[{ t: "jobs" }, { d: draw.shield }, { s: "English" }], [{ d: draw.flag }, { d: draw.landmark }, { d: draw.clock }]],
  cambridge: [[{ t: "cambridge" }, { s: "Chemistry" }, { s: "Mathematics" }], [{ s: "Biology" }, { s: "Physics" }, { d: draw.pen }]],
  abroad: [[{ t: "abroad" }, { d: draw.plane }, { s: "English" }], [{ d: draw.chat }, { d: draw.book }, { s: "Mathematics" }]],
};

function Icon({ ic }: { ic: Ic }) {
  if ("s" in ic) return <SubjectMark subject={ic.s} size={26} />;
  if ("e" in ic) return <ExamMark id={ic.e} size={26} />;
  if ("t" in ic) return <TrackMark id={ic.t} size={26} />;
  return (
    <svg className="mark" width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ic.d.soft && <path d={ic.d.soft} fill="currentColor" stroke="none" opacity=".2" />}
      <path d={ic.d.line} />
    </svg>
  );
}

export default function HeroIcons() {
  const { shown } = useArea();
  const [left, right] = sets[shown.id as TrackId] ?? sets.medical;
  return (
    <div className="x8-floats" aria-hidden="true" key={shown.id} style={{ color: shown.colour }}>
      {[left, right].map((side, s) => (
        <div key={s} className={`x8-side x8-${s ? "right" : "left"}`}>
          {side.map((ic, i) => (
            <span key={i} className={`x8-float x8-f${i}`} style={{ "--i": i + s * 3 } as React.CSSProperties}>
              <span className="x8-bob"><Icon ic={ic} /></span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
