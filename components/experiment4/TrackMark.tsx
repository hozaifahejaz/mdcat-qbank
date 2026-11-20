import { ExamMark } from "@/components/Marks";
import type { TrackId } from "@/lib/catalogue";

/* One mark per track, in the same 24-grid, one-weight style as components/Marks.tsx. Medical, engineering and law
   reuse the MDCAT, ECAT and LAT marks; the rest are drawn here. */
const own: Partial<Record<TrackId, { soft?: string; line: string }>> = {
  // Doctors: a medical cross on a badge
  doctors: { soft: "M12 2.8a9.2 9.2 0 1 0 0 18.4 9.2 9.2 0 0 0 0-18.4z", line: "M12 2.8a9.2 9.2 0 1 0 0 18.4 9.2 9.2 0 0 0 0-18.4zM10.2 7.5h3.6v2.7h2.7v3.6h-2.7v2.7h-3.6v-2.7H7.5v-3.6h2.7z" },
  // Postgraduate: a graduation cap
  postgrad: { soft: "M2.5 9 12 4.5 21.5 9 12 13.5z", line: "M2.5 9 12 4.5 21.5 9 12 13.5zM6.5 11v4.5c0 1.6 2.5 3 5.5 3s5.5-1.4 5.5-3V11M21.5 9v5.5" },
  // Jobs and forces: a briefcase
  jobs: { soft: "M3.5 8.5h17v11h-17z", line: "M3.5 8.5h17v11h-17zM9 8.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v2.5M3.5 13h17M11 13v2h2v-2" },
  // O and A Levels: a stack of books
  cambridge: { soft: "M4 15h16v4.5H4z", line: "M4 15h16v4.5H4zM5.5 10.5h13V15h-13zM7 6h10v4.5H7zM9 17.2h6M8.5 12.7h7M10 8.2h4" },
  // Study abroad: a globe
  abroad: { soft: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", line: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3z" },
};

const reuse: Partial<Record<TrackId, string>> = { medical: "mdcat", engineering: "ecat", law: "lat" };

export default function TrackMark({ id, size = 22 }: { id: TrackId; size?: number }) {
  if (reuse[id]) return <ExamMark id={reuse[id]!} size={size} />;
  const m = own[id];
  if (!m) return null;
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {m.soft && <path d={m.soft} fill="currentColor" stroke="none" opacity=".2" />}
      <path d={m.line} />
    </svg>
  );
}
