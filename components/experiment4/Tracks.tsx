"use client";

import { tracks } from "@/lib/catalogue";
import { pickExam } from "./Experience";
import TrackMark from "./TrackMark";

/* Every track on one screen. Tapping one sets the hero to its first exam and scrolls back up, so the whole page then
   speaks to that track. */
export default function Tracks() {
  return (
    <div className="x4-tracks">
      {tracks.map((t) => {
        const live = t.exams.filter((e) => e.live).length;
        return (
          <button key={t.id} type="button" className="x3-card x4-track" onClick={() => pickExam(t.exams[0].id)}>
            <span className="x4-tile" style={{ color: t.colour }}><TrackMark id={t.id} size={24} /></span>
            <b>{t.name}</b>
            <small>{t.exams.map((e) => e.name).join(" · ")}</small>
            <em className={live ? "live" : ""}>{live ? `${live} live now` : "Opening soon"}</em>
          </button>
        );
      })}
    </div>
  );
}
