import { tracks, type Track, type TrackId } from "@/lib/catalogue";
import { trackPages, type TrackPage } from "@/lib/track-pages";

/* The areas on landing experiment 7's map. Each area keeps its own peak, its own short name for the headline,
   and the catalogue's exams and prices. Plain data, so both the server-drawn map and the client parts can use it. */

export type Peak = { x: number; y: number; word: string; label: string };

// Summits in the map's 1000 x 760 box (they match the hills in contours.ts) and the words the headline rolls to.
export const PEAKS: Record<TrackId, Peak> = {
  medical: { x: 620, y: 328, word: "the MDCAT", label: "Pre-medical" },
  engineering: { x: 372, y: 212, word: "ECAT and NET", label: "Engineering" },
  doctors: { x: 832, y: 160, word: "FCPS Part 1", label: "Residency" },
  law: { x: 216, y: 424, word: "the LAT", label: "Law" },
  postgrad: { x: 480, y: 540, word: "HAT and GAT", label: "Postgraduate" },
  jobs: { x: 144, y: 164, word: "CSS and PPSC", label: "Government jobs" },
  cambridge: { x: 824, y: 528, word: "O and A Levels", label: "O and A Levels" },
  abroad: { x: 100, y: 664, word: "SAT and IELTS", label: "Study abroad" },
};

export type Area = Track & { page: TrackPage; peak: Peak };
export const AREAS: Area[] = tracks.map((t) => ({ ...t, page: trackPages[t.id], peak: PEAKS[t.id] }));

export const still = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

