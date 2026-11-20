"use client";

import { useExam, ChangeExam } from "./ExamState";
import TrackMark from "./TrackMark";

/* The chosen exam and the exams related to it (the rest of its track), the ones a student would bundle with it.
   Tapping one makes it the chosen exam; other tracks stay out of sight behind "Change exam". */
export default function Tracks() {
  const { chosen, choose } = useExam();
  const t = chosen.track;
  const live = t.exams.filter((e) => e.live).length;
  return (
    <section id="exams" className="x3-sec">
      <div className="x3-wrap">
        <div className="x3-head">
          <span className="x3-tag">{t.name}</span>
          <h2>{chosen.name} and the exams beside it.<br /><span className="mute">One track, one account.</span></h2>
        </div>
        <div className="x4-related">
          {t.exams.map((e) => {
            const on = e.id === chosen.id;
            return (
              <button key={e.id} type="button" className={on ? "x3-card x4-track on" : "x3-card x4-track"} aria-pressed={on} onClick={() => choose(e.id)} style={on ? { boxShadow: `inset 0 0 0 2px ${t.colour}` } : undefined}>
                <span className="x4-tile" style={{ color: t.colour }}><TrackMark id={t.id} size={22} /></span>
                <b>{e.name}</b>
                <small>{e.body}</small>
                <em className={e.live ? "live" : ""}>{on ? "Your exam" : e.live ? "Live now" : "Opening soon"}</em>
              </button>
            );
          })}
        </div>
        <p className="x3-note">
          {live ? `Bundles stay inside ${t.name.toLowerCase()}, so you only pay for exams you might sit.` : `${t.name} opens exam by exam. Leave your number above and we'll tell you.`}{" "}
          <ChangeExam>Preparing for something else?</ChangeExam>
        </p>
      </div>
    </section>
  );
}
