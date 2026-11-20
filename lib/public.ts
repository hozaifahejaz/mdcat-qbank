/* The public study pages: the facts and the sample questions they show. The questions come from lib/public-data.json,
   written by scripts/public-samples.mjs. Facts about the exams are kept here in one place with the date they were
   checked, so a change by PMDC or NUMS is one edit. */
import raw from "@/lib/public-data.json";
import { mdcatSyllabus } from "@/lib/banks";
import { paper, site } from "@/lib/site";

export type PublicQuestion = { id: string; topic: string; stem: string; options: string[]; answer: number; why: string; wrong: Record<string, string>; subject?: string };
type ChapterData = { total: number; samples: PublicQuestion[] };
type Data = {
  made: string; bank: number; banks: Record<string, number>; totals: Record<string, number>;
  chapters: Record<string, Record<string, ChapterData>>;
  paper: { year: number; total: number; chapters: Record<string, { chapter: string; n: number }[]>; samples: PublicQuestion[] };
};
export const data = raw as unknown as Data;

/* When the facts on these pages were last checked against the official notices. Shown on the pages and in the sitemap. */
export const checked = "2026-11-20";
export const checkedText = "20 November 2026";

export const slug = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const subjects = (Object.keys(mdcatSyllabus) as (keyof typeof mdcatSyllabus)[]).map((name) => ({
  name: name as string,
  slug: slug(name),
  count: paper.find((p) => p.subject === name)?.count ?? 0,
  total: data.totals[name] ?? 0,
  chapters: mdcatSyllabus[name].map((chapter) => ({
    name: chapter,
    slug: slug(chapter),
    total: data.chapters[name]?.[chapter]?.total ?? 0,
    samples: data.chapters[name]?.[chapter]?.samples ?? [],
  })),
}));
export const subjectBySlug = (s: string) => subjects.find((x) => x.slug === s);

/* The PMDC MDCAT as held in 2026: 180 MCQs in three hours with no negative marking (PMDC notice of June 2026). */
export const mdcat = {
  mcqs: paper.reduce((n, p) => n + p.count, 0),
  hours: 3,
  held2026: "20 September 2026",
  difficulty: [["Easy", 15], ["Moderate", 70], ["Hard", 15]] as const,
  weights: { mdcat: 50, hssc: 40, ssc: 10 },
};

/* NUMS MDCAT as announced for 2026: a 150-MCQ subject paper and a separate 50-item psychological test. */
export const nums = {
  mcqs: 150,
  time: "2 hours 45 minutes",
  split: [["Biology", 55], ["Chemistry", 40], ["Physics", 40], ["English", 15]] as const,
  held2026: "23 August 2026",
};

export const round = (n: number) => `${(Math.floor(n / 100) * 100).toLocaleString("en-GB")}+`;
export const bankSize = round(data.bank);
export const abs = (path: string) => `${site.url}${path}`;

/* The trail of links above a page, as the page shows it and as search engines read it. */
export type Crumb = { name: string; href: string };
export const crumbData = (trail: Crumb[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.href) })),
});
export const faqData = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});
/* JSON for a script tag: "<" is escaped so no text in it can close the tag. */
export const ld = (o: unknown) => ({ __html: JSON.stringify(o).replace(/</g, "\\u003c") });
