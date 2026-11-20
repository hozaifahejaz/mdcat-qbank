/* Every exam Markhor Prep plans to cover, grouped into tracks (docs: the multi-exam plan). Used by the landing page
   experiment at /experiments/4. "live" means students can practice it today; everything else is coming soon.
   9th and 10th class are left out on purpose. */

export type TrackId = "medical" | "engineering" | "doctors" | "law" | "postgrad" | "jobs" | "cambridge" | "abroad";

export type Exam = { name: string; body: string; live?: boolean; href?: string };
export type Track = { id: TrackId; name: string; who: string; colour: string; exams: Exam[] };

export const tracks: Track[] = [
  {
    id: "medical", name: "Pre-medical", who: "FSc pre-medical students and MDCAT candidates", colour: "#11804a",
    exams: [
      { name: "PMDC MDCAT", body: "PMDC", live: true, href: "/mdcat" },
      { name: "NUMS MDCAT", body: "NUMS", live: true, href: "/nums-mdcat" },
      { name: "AKU admission test", body: "Aga Khan University", live: true, href: "/aku-test" },
      { name: "FSc Pre-Medical Part 1", body: "Punjab textbooks", live: true },
      { name: "FSc Pre-Medical Part 2", body: "Punjab textbooks", live: true },
      { name: "ETEA medical", body: "ETEA, Khyber Pakhtunkhwa" },
      { name: "11th and 12th board papers", body: "Punjab, Federal, KP and Sindh boards" },
    ],
  },
  {
    id: "engineering", name: "Pre-engineering", who: "FSc pre-engineering and ICS students", colour: "#b06a00",
    exams: [
      { name: "ECAT", body: "UET" },
      { name: "NUST NET", body: "NUST" },
      { name: "GIKI admission test", body: "GIKI" },
      { name: "FAST admission test", body: "FAST-NU" },
      { name: "PIEAS entry test", body: "PIEAS" },
      { name: "ETEA engineering", body: "ETEA, Khyber Pakhtunkhwa" },
      { name: "FSc Pre-Engineering Part 1 and 2", body: "Board textbooks" },
    ],
  },
  {
    id: "doctors", name: "Doctors", who: "MBBS and BDS graduates", colour: "#2f55f0",
    exams: [
      { name: "FCPS Part 1", body: "CPSP" },
      { name: "JCAT (MS, MD, MDS)", body: "KEMU and UHS" },
      { name: "MD and MS entry tests", body: "Medical universities" },
      { name: "NLE", body: "PMDC" },
    ],
  },
  {
    id: "law", name: "Law and university", who: "Students applying for LLB and undergraduate degrees", colour: "#8a63ff",
    exams: [
      { name: "LAT", body: "HEC" },
      { name: "USAT", body: "HEC" },
      { name: "NAT", body: "NTS" },
    ],
  },
  {
    id: "postgrad", name: "Postgraduate", who: "Graduates applying for MS, MPhil and PhD", colour: "#0f9fb5",
    exams: [
      { name: "HAT", body: "HEC" },
      { name: "GAT General", body: "NTS" },
    ],
  },
  {
    id: "jobs", name: "Jobs and forces", who: "Civil service and armed forces candidates", colour: "#c9a400",
    exams: [
      { name: "CSS MPT", body: "FPSC" },
      { name: "PMS", body: "Provincial commissions" },
      { name: "FPSC tests", body: "FPSC" },
      { name: "PPSC tests", body: "PPSC" },
      { name: "ISSB", body: "Inter Services Selection Board" },
      { name: "Army, Navy and PAF initial tests", body: "Armed forces" },
    ],
  },
  {
    id: "cambridge", name: "O and A Levels", who: "Cambridge students", colour: "#d4483b",
    exams: [
      { name: "O Level", body: "Cambridge" },
      { name: "AS and A Level", body: "Cambridge" },
    ],
  },
  {
    id: "abroad", name: "Study abroad", who: "Students applying outside Pakistan", colour: "#3a7d6b",
    exams: [
      { name: "SAT", body: "College Board" },
      { name: "IELTS", body: "British Council and IDP" },
    ],
  },
];

export const examCount = tracks.reduce((n, t) => n + t.exams.length, 0);
export const liveCount = tracks.reduce((n, t) => n + t.exams.filter((e) => e.live).length, 0);
