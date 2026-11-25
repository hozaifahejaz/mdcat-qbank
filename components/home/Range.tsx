"use client";

import { useState } from "react";
import { MARKHOR } from "@/components/Logo";
import TrackMark from "@/components/experiment4/TrackMark";
import { tracks, type TrackId } from "@/lib/catalogue";

/* The home page's hero: "Which exam are you climbing?" answered by a mountain range drawn in one line. Each peak is an
   area; picking one (on the peak itself or in the row of names under it) lights that peak in the area's colour and
   walks the markhor to its summit, and the trail below lists that area's exams, each opening its own page. Motion is
   the line drawing itself in and the markhor moving; nothing fades. */

/* The ridge as line art, left to right in the drawing's own units (1200 x 300): each area's stretch runs from one
   valley to the next with a few shoulders on the way, so it reads as a range and not a chart. Medical, the one open
   today, stands tallest. `peak` marks each summit. */
type Pt = [number, number];
const stretches: { id: TrackId; pts: Pt[]; peak: Pt }[] = [
  { id: "medical", peak: [200, 58], pts: [[0, 262], [48, 246], [86, 252], [128, 198], [148, 204], [200, 58], [226, 108], [246, 100], [288, 172], [314, 164], [340, 214]] },
  { id: "engineering", peak: [432, 118], pts: [[372, 190], [390, 196], [432, 118], [456, 148], [472, 142], [522, 226]] },
  { id: "doctors", peak: [652, 90], pts: [[550, 206], [568, 212], [606, 150], [622, 156], [652, 90], [684, 138], [700, 130], [752, 222]] },
  { id: "law", peak: [872, 140], pts: [[790, 196], [806, 202], [846, 164], [872, 140], [894, 166], [910, 160], [952, 236]] },
  { id: "jobs", peak: [1062, 110], pts: [[982, 210], [998, 214], [1032, 150], [1062, 110], [1086, 146], [1102, 140], [1150, 222], [1200, 250]] },
];
const all: Pt[] = stretches.flatMap((x) => x.pts);
const line = (pts: Pt[]) => pts.map(([x, y], k) => `${k ? "L" : "M"}${x} ${y}`).join("");
const ridge = line(all);
/* One area's stretch, from the valley before it to the valley after it. */
const stretch = (i: number): Pt[] => [...(i ? [stretches[i - 1]!.pts.at(-1)!] : []), ...stretches[i]!.pts];
// A softer range behind, for depth; the front ridge's fill hides it where they cross.
const back = "M0 214L70 168L118 182L196 120L250 150L330 104L400 140L470 96L548 136L640 70L716 118L780 100L860 132L960 84L1040 120L1130 76L1200 112";

const live = (t: (typeof tracks)[number]) => t.exams.some((e) => e.live);

export default function Range() {
  const [on, setOn] = useState<TrackId>("medical");
  const i = stretches.findIndex((x) => x.id === on);
  const area = tracks.find((t) => t.id === on)!;
  const [px, py] = stretches[i]!.peak;
  const lit = stretch(i);
  const s = 0.56; // the markhor's size on the summit

  return (
    <header className="xr-hero" style={{ ["--a" as string]: area.colour }}>
      <div className="x3-wrap xr-top">
        <p className="xr-kicker">Question banks for Pakistan&apos;s entrance exams</p>
        <h1>Which exam are you <span>climbing?</span></h1>
      </div>

      <div className="xr-range">
        <svg viewBox="0 -64 1200 364" preserveAspectRatio="xMidYMax meet" role="group" aria-label="Areas">
          <path className="xr-back" d={back} />
          <path className="xr-ground" d={`${ridge}L1200 300L0 300Z`} />
          <path className="xr-ridge" d={ridge} pathLength={1} />
          <path key={`f${on}`} className="xr-lit-fill" d={`${line(lit)}L${lit.at(-1)![0]} 300L${lit[0]![0]} 300Z`} />
          <path key={`l${on}`} className="xr-lit" d={line(lit)} pathLength={1} />
          {stretches.map((st, j) => {
            const t = tracks.find((x) => x.id === st.id)!;
            const [x, y] = st.peak;
            const from = stretch(j)[0]![0], to = st.pts.at(-1)![0];
            return (
              <g key={st.id} className={st.id === on ? "xr-peak on" : "xr-peak"} style={{ ["--a" as string]: t.colour }} onClick={() => setOn(st.id)}>
                <rect className="xr-hit" x={from} y={y - 130} width={to - from} height={300 - y + 130} />
                <circle cx={x} cy={y} r="4" />
                <text x={x} y={y - 58} textAnchor="middle" className="xr-name">{t.name}</text>
                <text x={x} y={y - 40} textAnchor="middle" className="xr-sub">{live(t) ? `${t.exams.filter((e) => e.href).length} open now` : "Opening soon"}</text>
              </g>
            );
          })}
          <g className="xr-goat" style={{ transform: `translate(${px - 47 * s}px, ${py - 95 * s}px)` }} aria-hidden="true">
            <path d={MARKHOR} transform={`scale(${s})`} />
          </g>
        </svg>
      </div>

      <div className="x3-wrap">
        <div className="xr-areas" role="tablist" aria-label="Choose an area">
          {tracks.filter((t) => stretches.some((x) => x.id === t.id)).map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={t.id === on} style={{ ["--a" as string]: t.colour }} onClick={() => setOn(t.id)}>
              <TrackMark id={t.id} size={18} />{t.name}
            </button>
          ))}
        </div>

        <div className="xr-trail" key={on} role="tabpanel" aria-label={area.name}>
          <p className="xr-who">{area.who}</p>
          <ul>
            {area.exams.map((e, k) => (
              <li key={e.id} style={{ ["--k" as string]: k }}>
                {e.href ? (
                  <a className={e.live ? "xr-exam" : "xr-exam soon"} href={e.href}>
                    <b>{e.name}</b><small>{e.live ? e.body : "Opening soon"}</small>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </a>
                ) : (
                  <span className={e.live ? "xr-exam quiet" : "xr-exam quiet soon"}><b>{e.name}</b><small>{e.live ? "In the app" : "Opening soon"}</small></span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
