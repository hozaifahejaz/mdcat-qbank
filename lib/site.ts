/* Site-wide names and numbers. The brand lives here and nowhere else. Prices follow the plan's pricing table. */
export const site = {
  name: "Markhor Prep",
  /* The live address. www.markhorprep.com redirects here; mdcat-qbank.pages.dev still serves the same site. */
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
  season: "2027",
  examMonth: "August 2027",
  /* Expected date for the dashboard countdown. PMDC announces the real one; 2026 was 16 August. Update when it does. */
  examDate: "2027-08-15",
};

export const prices = {
  seasonPass: "2,999",
  earlyBird: "1,999",
  earlyBirdUntil: "March 2027",
  monthly: "799",
};

/* The PMDC MDCAT paper: 180 MCQs in 3 hours. "tone" is the pastel chip, "solid" the bar colour in the paper split. */
export const paper = [
  { subject: "Biology", count: 81, tone: "var(--mint)", solid: "var(--good)" },
  { subject: "Chemistry", count: 45, tone: "var(--sky)", solid: "var(--blue)" },
  { subject: "Physics", count: 36, tone: "var(--peach)", solid: "var(--warn)" },
  { subject: "English", count: 9, tone: "var(--lilac)", solid: "#8a63ff" },
  { subject: "Logical Reasoning", count: 9, tone: "var(--lemon)", solid: "#c9a400" },
];

/* Where Help links go: WhatsApp when there's a number, email otherwise. */
export const supportHref = site.whatsapp ? `https://wa.me/${site.whatsapp}` : `mailto:${site.supportEmail}`;
export const whatsappHref = site.whatsapp ? `https://wa.me/${site.whatsapp}` : "";
