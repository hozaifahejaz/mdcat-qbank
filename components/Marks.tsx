/* Our own small marks for each subject and each test. Drawn on a 24 grid in one line weight, with a soft fill
   behind, so they sit in the tinted tiles the app already uses and take their colour from the tile (currentColor).
   Original artwork: none of them copies a university's or council's crest. */

type Part = { d: string; fill?: "soft" | "solid" };

const subjectParts: Record<string, Part[]> = {
  // A twist of DNA
  Biology: [
    { d: "M7 3c0 5 10 5 10 9s-10 4-10 9" },
    { d: "M17 3c0 5-10 5-10 9s10 4 10 9" },
    { d: "M9.3 5.5h5.4M9.2 12h5.6M9.3 18.5h5.4" },
  ],
  // A flask with bubbles
  Chemistry: [
    { d: "M7.4 14.2h9.2l2 4.2a1.6 1.6 0 0 1-1.5 2.3H6.9a1.6 1.6 0 0 1-1.5-2.3z", fill: "soft" },
    { d: "M9 3h6M10 3v5.6L4.9 18.6A1.6 1.6 0 0 0 6.3 21h11.4a1.6 1.6 0 0 0 1.4-2.4L14 8.6V3" },
    { d: "M10.6 17.6a.9.9 0 1 0 0-.01zM13.7 15.9a.7.7 0 1 0 0-.01z", fill: "solid" },
  ],
  // An atom
  Physics: [
    { d: "M12 10.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6z", fill: "solid" },
    { d: "M21.5 12c0 2.1-4.25 3.8-9.5 3.8S2.5 14.1 2.5 12 6.75 8.2 12 8.2s9.5 1.7 9.5 3.8z" },
    { d: "M16.75 20.23c-1.82 1.05-5.4-1.79-8.03-6.33S5.43 4.82 7.25 3.77s5.4 1.79 8.03 6.33 3.29 9.08 1.47 10.13z" },
    { d: "M7.25 20.23c-1.82-1.05-1.16-5.59 1.47-10.13s6.21-7.38 8.03-6.33 1.16 5.59-1.47 10.13-6.21 7.38-8.03 6.33z" },
  ],
  // Capital and small a
  English: [
    { d: "M17.3 12.3a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z", fill: "soft" },
    { d: "M2.8 19.5 7.6 5l4.8 14.5M4.6 14.3h6" },
    { d: "M17.3 12.3a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zM20.5 11.8v7.7" },
  ],
  // A puzzle piece
  "Logical Reasoning": [
    { d: "M3 8h4.7a2.6 2.6 0 1 1 3.6 0H16v4.2a2.6 2.6 0 1 1 0 3.6V21H3z", fill: "soft" },
    { d: "M3 8h4.7a2.6 2.6 0 1 1 3.6 0H16v4.2a2.6 2.6 0 1 1 0 3.6V21H3z" },
  ],
  // The four signs
  Mathematics: [
    { d: "M7.5 4.5v6M4.5 7.5h6M13.5 7.5h6M5.4 14.4l4.2 4.2M9.6 14.4l-4.2 4.2M13.5 15h6M13.5 18h6" },
  ],
};

const examParts: Record<string, Part[]> = {
  // MDCAT: a stethoscope
  mdcat: [
    { d: "M18 9.6a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4z", fill: "soft" },
    { d: "M4 3h2M14 3h2M5 3v5a5 5 0 0 0 10 0V3M10 13v3a4 4 0 0 0 8 0v-2" },
    { d: "M18 9.6a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4z" },
  ],
  // NUMS: a shield with a cross
  nums: [
    { d: "M12 3l7 2.5V11c0 4.6-3 8.2-7 10-4-1.8-7-5.4-7-10V5.5z", fill: "soft" },
    { d: "M12 3l7 2.5V11c0 4.6-3 8.2-7 10-4-1.8-7-5.4-7-10V5.5zM12 8.5v7M8.5 12h7" },
  ],
  // AKU: a pointed arch
  aku: [
    { d: "M9 21v-5.5c0-2 1.3-3.4 3-4.5 1.7 1.1 3 2.5 3 4.5V21z", fill: "soft" },
    { d: "M2.5 21h19M4.5 21V10.5C4.5 6.8 8 4.6 12 3c4 1.6 7.5 3.8 7.5 7.5V21M9 21v-5.5c0-2 1.3-3.4 3-4.5 1.7 1.1 3 2.5 3 4.5V21" },
  ],
  // FSc Part 1 and 2: an open book with the year on it
  fsc1: [
    { d: "M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5z", fill: "soft" },
    { d: "M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5c-3.5-.5-6.5 0-8.5 1.5zM12 6.5v13" },
    { d: "M15.2 9.6l1.6-1.1v7" },
  ],
  fsc2: [
    { d: "M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5z", fill: "soft" },
    { d: "M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5c-3.5-.5-6.5 0-8.5 1.5zM12 6.5v13" },
    { d: "M14.9 9.5c.3-.7 1-1.1 1.8-1.1 1 0 1.7.7 1.7 1.6 0 1.6-3.5 2.8-3.5 5.5h3.6" },
  ],
  // Tests still to come
  ecat: [
    { d: "M18.55 10.19 20.9 10.64v2.72l-2.35.45-.63 1.54 1.33 1.98-1.92 1.92-1.98-1.33-1.54.63-.45 2.35h-2.72l-.45-2.35-1.54-.63-1.98 1.33-1.92-1.92 1.33-1.98-.63-1.54-2.35-.45v-2.72l2.35-.45.63-1.54-1.33-1.98 1.92-1.92 1.98 1.33 1.54-.63.45-2.35h2.72l.45 2.35 1.54.63 1.98-1.33 1.92 1.92-1.33 1.98z", fill: "soft" },
    { d: "M18.55 10.19 20.9 10.64v2.72l-2.35.45-.63 1.54 1.33 1.98-1.92 1.92-1.98-1.33-1.54.63-.45 2.35h-2.72l-.45-2.35-1.54-.63-1.98 1.33-1.92-1.92 1.33-1.98-.63-1.54-2.35-.45v-2.72l2.35-.45.63-1.54-1.33-1.98 1.92-1.92 1.98 1.33 1.54-.63.45-2.35h2.72l.45 2.35 1.54.63 1.98-1.33 1.92 1.92-1.33 1.98z" },
    { d: "M12 9.3a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4z" },
  ],
  net: [
    { d: "M12 3v2.4M10.9 8.6 5.5 20.5M13.1 8.6l5.4 11.9M7.4 15.8c3 1.6 6.2 1.6 9.2 0" },
    { d: "M12 5.4a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6z", fill: "soft" },
    { d: "M12 5.4a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6z" },
  ],
  lat: [
    { d: "M2 13.5a3 3 0 0 0 6 0zM16 13.5a3 3 0 0 0 6 0z", fill: "soft" },
    { d: "M12 4v16M8 20.5h8M4.5 6.5h15M5 6.5l-3 7M5 6.5l3 7M19 6.5l-3 7M19 6.5l3 7M2 13.5a3 3 0 0 0 6 0zM16 13.5a3 3 0 0 0 6 0z" },
  ],
};

function Mark({ parts, size }: { parts: Part[]; size: number }) {
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {parts.map((p, i) => p.fill === "soft" ? <path key={i} d={p.d} fill="currentColor" stroke="none" opacity=".2" />
        : p.fill === "solid" ? <path key={i} d={p.d} fill="currentColor" stroke="none" />
        : <path key={i} d={p.d} />)}
    </svg>
  );
}

export const hasSubjectMark = (subject: string) => subject in subjectParts;

/** The mark for a subject; falls back to its first letter for a subject without one. */
export function SubjectMark({ subject, size = 18 }: { subject: string; size?: number }) {
  const parts = subjectParts[subject];
  return parts ? <Mark parts={parts} size={size} /> : <>{subject[0]}</>;
}

/** The mark for a test or bank: mdcat, nums, aku, fsc1, fsc2, and ecat, net, lat for the ones still to come. */
export function ExamMark({ id, size = 22 }: { id: string; size?: number }) {
  const parts = examParts[id];
  return parts ? <Mark parts={parts} size={size} /> : null;
}
