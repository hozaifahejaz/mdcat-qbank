/* Site-wide names and numbers. The brand lives here and nowhere else. Prices follow the plan's pricing table. */
export const site = {
  name: "Markhor Prep",
  /* The live address. www.markhorprep.com and mdcat-qbank.pages.dev redirect here. */
  url: "https://markhorprep.com",
  supportEmail: "support@markhorprep.com",
  /* WhatsApp support in international form without the +, e.g. "923001234567". Empty hides the WhatsApp links. */
  whatsapp: "",
  /* The bank is open: anyone can make a free account and practice the free set. */
  open: true,
  /* False until a payment provider is connected. The public pages then say payments open soon, and checkout shows
     how paying will work without taking any money. */
  payments: false,
  /* What the landing page says before /api/stats answers (and if it can't): the bank's size rounded down to a
     hundred, and the past-paper years. Keep roughly in step with the bank so the line doesn't change as it loads. */
  bank: { questions: 7200, papers: [2026] },
  /* The sign-in methods switched on in the live site (docs/auth-setup.md). Sign-in pages draw from this at once
     and correct themselves when the server answers, so keep it in step when a method is switched on or off. */
  signIn: { email: true, emailVerification: true, passwordReset: true, phone: false, google: true, apple: false, turnstileSiteKey: "" },
  season: "2027",
  examMonth: "August 2027",
  /* Expected date for the dashboard countdown. PMDC announces the real one; 2026 was set for 16 August and held on 20 September. Update when it does. */
  examDate: "2027-08-15",
};

/* The two paid plans, as the landing page shows them for pre-medical (lib/track-pages.ts keeps the same numbers).
   Buying again while a plan is running, or after it has ended, is a renewal and costs renewOff percent less. */
export const prices = {
  three: "1,999",
  monthly: "799",
  renewOff: 25,
};

/* The PMDC MDCAT paper: 180 MCQs in 3 hours. "tone" is the pastel chip, "solid" the bar colour in the paper split. */
export const paper = [
  { subject: "Biology", count: 81, tone: "var(--mint)", solid: "var(--good)" },
  { subject: "Chemistry", count: 45, tone: "var(--sky)", solid: "var(--blue)" },
  { subject: "Physics", count: 36, tone: "var(--peach)", solid: "var(--warn)" },
  { subject: "English", count: 9, tone: "var(--lilac)", solid: "#8a63ff" },
  { subject: "Logical Reasoning", count: 9, tone: "var(--lemon)", solid: "#c9a400" },
];

/* The full mocks a student can sit, by the paper they copy: how many questions from each subject and how long.
   NUMS is its 150-MCQ subject paper (NUMS notice for 2026): 2 hours 45 minutes, no Logical Reasoning.
   negFirst is how many of the first questions take marks off for a wrong answer. */
export const mockFormats = {
  mdcat: { id: "mdcat", name: "Full mock", label: "MDCAT", minutes: 180, negFirst: 0, split: paper },
  nums: {
    id: "nums", name: "NUMS mock", label: "NUMS", minutes: 165, negFirst: 0,
    split: [
      { ...paper[0]!, count: 55 },
      { ...paper[1]!, count: 40 },
      { ...paper[2]!, count: 40 },
      { ...paper[3]!, count: 15 },
    ],
  },
  /* AKU (admission information 2026-27): 100 MCQs in 2 hours. The first 40 are Science Achievement, where a wrong
     answer costs 0.25; the other 60 are Science and Mathematics Reasoning with no penalty (AKU sample test paper 2026:
     "100 questions in two Sections", any order). AKU gives no subject counts inside a section: Science Achievement is
     split evenly over Biology, Chemistry and Physics, and the reasoning section is half science, half mathematics. */
  aku: {
    id: "aku", name: "AKU mock", label: "AKU", minutes: 120, negFirst: 40,
    split: [
      { ...paper[0]!, count: 24, first: 14 },
      { ...paper[1]!, count: 23, first: 13 },
      { ...paper[2]!, count: 23, first: 13 },
      { subject: "Mathematics", count: 30, first: 0, tone: "var(--lemon)", solid: "#c9a400" },
    ],
  },
} as const;
export type MockFormatId = keyof typeof mockFormats;
export const mockFormat = (id: unknown) => mockFormats[id === "nums" || id === "aku" ? id : "mdcat"];
export const NEG_MARK = 0.25;
export const hoursText = (minutes: number) => minutes % 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes / 60} hours`;

/* Where Help links go: WhatsApp when there's a number, otherwise the contact form (each message becomes a support ticket). */
export const supportHref = site.whatsapp ? `https://wa.me/${site.whatsapp}` : "/contact";
export const whatsappHref = site.whatsapp ? `https://wa.me/${site.whatsapp}` : "";
