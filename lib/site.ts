/* Site-wide names and numbers. The brand is a working name until the real one is chosen (see docs/plan.md, open questions),
   so it lives here and nowhere else. Prices follow the plan's pricing table. */
export const site = {
  name: "MDCAT Pilot",
  url: "https://example.com",
  season: "2027",
};

export const prices = {
  seasonPass: "2,999",
  earlyBird: "1,999",
  earlyBirdUntil: "March 2027",
  monthly: "799",
};

/* The PMDC MDCAT paper: 180 MCQs in 3 hours. "solid" is its colour in the paper split. */
export const paper = [
  { subject: "Biology", count: 81, solid: "var(--good)" },
  { subject: "Chemistry", count: 45, solid: "var(--blue)" },
  { subject: "Physics", count: 36, solid: "var(--warn)" },
  { subject: "English", count: 9, solid: "#8a63ff" },
  { subject: "Logical Reasoning", count: 9, solid: "#c9a400" },
];
