"use client";

import { Markhor } from "@/components/Logo";
import { ExamMark, SubjectMark, hasSubjectMark } from "@/components/Marks";
import { useArea } from "@/components/experiment4/ExamState";
import TrackMark from "@/components/experiment4/TrackMark";

/* The live landing's subjects orbit, made to follow the area picked in the hero on landing experiment 8: the inner
   ring is that area's subjects and the outer ring its tests plus the practice tools. Pre-medical keeps the live
   landing's rings exactly, and only pre-medical shows the links to the subject pages (the only area that has them). */

type Sat = { name: string; id?: string };
const tools: Sat[] = [{ name: "Timed mocks" }, { name: "My mistakes" }];
const medicalOuter: Sat[] = [
  { name: "PMDC MDCAT", id: "mdcat" }, { name: "NUMS", id: "nums" }, { name: "AKU", id: "aku" }, { name: "Past papers" },
  { name: "FSc Part 1", id: "fsc1" }, { name: "FSc Part 2", id: "fsc2" }, ...tools,
];
const markName = (s: string) => (s === "Maths" ? "Mathematics" : s);

export default function Orbit({ links }: { links: React.ReactNode }) {
  const { area } = useArea();
  const subjects = area.page.subjects;
  const outer: Sat[] = area.id === "medical" ? medicalOuter : [...area.exams.slice(0, 6).map((e) => ({ name: e.name, id: e.id })), ...tools];
  const examMark = (id: string) => ExamMark({ id, size: 16 }) ?? <TrackMark id={area.id} size={16} />;

  return (
    <>
      <div className="orbit" aria-label={`${area.name} subjects and tests`} key={area.id}>
        <div className="orb r2">
          {outer.map((o, i) => (
            <span key={o.name} className="sat" style={{ ["--a" as string]: `${(360 / outer.length) * i}deg` }}><i>{o.id && examMark(o.id)}{o.name}</i></span>
          ))}
        </div>
        <div className="orb r1">
          {subjects.map((s, i) => (
            <span key={s.name} className="sat" style={{ ["--a" as string]: `${(360 / subjects.length) * i + 20}deg` }}>
              <i><em style={{ color: s.c }}>{hasSubjectMark(markName(s.name)) ? <SubjectMark subject={markName(s.name)} size={16} /> : <b className="x8-dot" style={{ background: s.c }} />}</em>{s.name}</i>
            </span>
          ))}
        </div>
        <div className="core"><Markhor height={52} /></div>
      </div>
      {area.id === "medical" && links}
    </>
  );
}
