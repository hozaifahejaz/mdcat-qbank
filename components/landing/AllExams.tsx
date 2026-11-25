import TrackMark from "@/components/experiment4/TrackMark";
import { tracks } from "@/lib/catalogue";

/* The home page's list of every exam by area. An exam with its own page links to it; the rest say Coming soon. The
   home page sells nothing itself: each exam's page has its pattern, a question to try and its price. */
const shown = ["medical", "engineering", "doctors", "law", "jobs"];

export default function AllExams() {
  return (
    <section id="exams" className="x3-sec xe-sec">
      <div className="x3-wrap">
        <div className="x3-head"><h2>All exams</h2></div>
        <div className="xe-all">
          {tracks.filter((t) => shown.includes(t.id)).map((t) => (
            <div key={t.id} className="x3-card xe-area" style={{ ["--a" as string]: t.colour }}>
              <h3><span aria-hidden="true"><TrackMark id={t.id} size={18} /></span>{t.name}</h3>
              <ul>
                {t.exams.map((e) => (
                  <li key={e.id}>
                    {e.href ? <a href={e.href}>{e.name}</a> : <span>{e.name}{!e.live && <em>Coming soon</em>}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
