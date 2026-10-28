/* Landing page experiments. Each is a full page at /experiments/<n>; the live landing page at / is never changed by one.
   Add the next one at the end with the next number. */
export type Experiment = { n: number; title: string; note: string; inspiredBy: string; added: string };

export const experiments: Experiment[] = [
  { n: 1, title: "Beside-style landing", note: "Inter, monochrome, tabbed product frame", inspiredBy: "https://www.beside.com/", added: "2026-10-28" },
  { n: 2, title: "Acctual-style landing", note: "Centred hero over floating product cards, pastel feature panels", inspiredBy: "https://www.acctual.com/", added: "2026-10-28" },
];

export const experimentHref = (n: number) => `/experiments/${n}`;
