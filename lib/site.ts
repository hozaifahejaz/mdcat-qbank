/* Site-wide names and numbers. The brand lives here and nowhere else. Prices follow the plan's pricing table. */
export const site = {
  name: "Examwise",
  /* The live address. Change to https://examwise.pk once the domain is bought and connected. */
  url: "https://mdcat-qbank.pages.dev",
  /* On the examwise.pk domain once it's bought. */
  supportEmail: "support@examwise.pk",
  /* WhatsApp support in international form without the +, e.g. "923001234567". Empty hides the WhatsApp links. */
  whatsapp: "",
  /* False until the first questions go live: the public pages then say the bank is opening soon instead of
     promising free questions, and the landing page offers the launch waitlist. */
  launched: false,
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
