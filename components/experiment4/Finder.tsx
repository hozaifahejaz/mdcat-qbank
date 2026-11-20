"use client";

import { useEffect, useMemo, useState } from "react";
import { tracks, type TrackId } from "@/lib/catalogue";
import TrackMark from "./TrackMark";

/* Exam finder: a track filter and a search box over every exam in lib/catalogue.ts. The hero's track buttons link to
   #find-<track>, which picks that track here. */
export default function Finder() {
  const [track, setTrack] = useState<TrackId | "all">("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    const read = () => {
      const m = window.location.hash.match(/^#find-(\w+)$/);
      if (m && tracks.some((t) => t.id === m[1])) setTrack(m[1] as TrackId);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return tracks
      .filter((t) => track === "all" || t.id === track)
      .map((t) => ({
        ...t,
        exams: t.exams.filter((e) => !needle || `${e.name} ${e.body} ${t.name}`.toLowerCase().includes(needle)),
      }))
      .filter((t) => t.exams.length);
  }, [track, q]);

  return (
    <div className="x4-finder">
      <div className="x4-tools">
        <label className="x4-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search an exam, e.g. ECAT or FCPS" aria-label="Search exams" />
        </label>
        <div className="x4-chips" role="tablist" aria-label="Tracks">
          <button type="button" role="tab" aria-selected={track === "all"} className={track === "all" ? "on" : ""} onClick={() => setTrack("all")}>All</button>
          {tracks.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={track === t.id} className={track === t.id ? "on" : ""} onClick={() => setTrack(t.id)}>
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 && <p className="x4-none">No exam matches &ldquo;{q}&rdquo;. Tell us which one you need at the contact page.</p>}

      <div className="x4-groups">
        {shown.map((t) => (
          <section key={t.id} className="x3-card x4-group">
            <header>
              <span className="x4-tile" style={{ color: t.colour }}><TrackMark id={t.id} size={22} /></span>
              <div>
                <h3>{t.name}</h3>
                <small>{t.who}</small>
              </div>
            </header>
            <ul>
              {t.exams.map((e) => {
                const inner = (
                  <>
                    <span><b>{e.name}</b><small>{e.body}</small></span>
                    <em className={e.live ? "live" : ""}>{e.live ? "Live" : "Soon"}</em>
                  </>
                );
                return <li key={e.name}>{e.href ? <a href={e.href}>{inner}</a> : <div>{inner}</div>}</li>;
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
