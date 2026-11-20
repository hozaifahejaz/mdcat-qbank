"use client";

import { useEffect, useMemo, useState } from "react";
import { MARKHOR, Markhor } from "@/components/Logo";
import { samples } from "@/lib/sample-questions";
import { site } from "@/lib/site";

/* The whole not-found page (app/not-found.tsx). A markhor peeks over a ridge at a trail that ends at a "404" signpost;
   below it, the way back.
   It is loaded only when a page is not found (components/NotFoundLazy.tsx): Next puts the not-found page into every
   other page's data, so anything here directly would be downloaded by every page. Styled by the <style> below, not an
   imported stylesheet, for the same reason. Built only from the site's tokens, so it follows light, dark and the Classic
   look. Motion is slow drift and a peek, never a fade.

   Its two cards: a page finder that starts with the pages closest to the address that was
   typed, and one free question to answer while here. The page list is the site's own (out/urls.txt, written with
   the sitemap), fetched only on this page, so no other page carries it. */

type Page = { href: string; title: string; where: string };

const WORDS: Record<string, string> = {
  mdcat: "MDCAT", "nums-mdcat": "NUMS", "aku-test": "AKU", nums: "NUMS", aku: "AKU", mcqs: "MCQs",
  vs: "vs", english: "English", "logical-reasoning": "Logical reasoning", "past-paper-2026": "Past paper 2026",
};
const nice = (seg: string) => WORDS[seg] ?? seg.split("-").map((w, i) => (WORDS[w] ?? (i === 0 ? w[0].toUpperCase() + w.slice(1) : w))).join(" ");

/* App pages a signed-in student looks for, which the public list leaves out, and the common ones, so the list is
   whole before the rest arrives. */
const APP: Page[] = [
  { href: "/dashboard", title: "Dashboard", where: "Your account" },
  { href: "/practice", title: "Practice", where: "Your account" },
  { href: "/mocks", title: "Mock tests", where: "Your account" },
  { href: "/past-papers", title: "Past papers", where: "Your account" },
  { href: "/progress", title: "Progress", where: "Your account" },
  { href: "/mistakes", title: "Mistakes", where: "Your account" },
  { href: "/signin", title: "Sign in", where: "Account" },
  { href: "/mdcat/syllabus", title: "MDCAT syllabus", where: "MDCAT" },
  { href: "/pricing", title: "Pricing", where: "Markhor Prep" },
];

function toPage(url: string): Page | null {
  let path: string;
  try { path = new URL(url).pathname.replace(/\/$/, ""); } catch { return null; }
  if (!path) return null;
  const segs = path.split("/").filter(Boolean);
  const title = nice(segs[segs.length - 1]);
  const where = segs.length > 1 ? segs.slice(0, -1).map(nice).join(" · ") : "Markhor Prep";
  return { href: path, title, where };
}

const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1);
/* Letter-pair overlap, so a misspelt "enzymez" or "bilogy" still finds its page. */
function pairs(s: string) { const out = new Set<string>(); for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2)); return out; }
function alike(a: string, b: string) {
  if (a === b) return 1;
  const x = pairs(a), y = pairs(b);
  if (!x.size || !y.size) return 0;
  let n = 0;
  x.forEach((p) => { if (y.has(p)) n++; });
  return (2 * n) / (x.size + y.size);
}
function score(query: string[], p: Page) {
  const have = words(`${p.href} ${p.title} ${p.where}`);
  let s = 0;
  for (const q of query) {
    let best = 0;
    for (const h of have) best = Math.max(best, h.startsWith(q) ? 1 : alike(q, h));
    s += best >= 0.6 ? best : 0;
  }
  return s / Math.max(query.length, 1);
}

const COMMON = ["/dashboard", "/practice", "/mdcat/syllabus", "/pricing"];
const LETTERS = ["A", "B", "C", "D"];

function Help() {
  const [pages, setPages] = useState<Page[]>(APP);
  const [path, setPath] = useState("");
  const [q, setQ] = useState("");
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    setPath(location.pathname);
    fetch("/urls.txt").then((r) => (r.ok ? r.text() : "")).then((t) => {
      const seen = new Set(APP.map((p) => p.href));
      const more = t.split("\n").map((l) => toPage(l.trim())).filter((p): p is Page => !!p && !seen.has(p.href));
      setPages([...APP, ...more]);
    }).catch(() => {});
  }, []);

  const typed = q.trim();
  const groups = useMemo(() => {
    const query = words(typed || path);
    const ranked = query.length
      ? pages.map((p) => ({ p, s: score(query, p) })).filter((r) => r.s >= (typed ? 0.5 : 0.6)).sort((a, b) => b.s - a.s).map((r) => r.p)
      : [];
    const near = ranked.slice(0, typed ? 5 : 3);
    const common = COMMON.map((h) => pages.find((p) => p.href === h)).filter((p): p is Page => !!p && !near.includes(p));
    if (typed) return near.length ? [{ label: "Results", items: near }] : [{ label: "No page matches that", items: [] }, { label: "Popular", items: common }];
    return [
      ...(near.length ? [{ label: "Did you mean", items: near }] : []),
      { label: "Popular", items: common.slice(0, Math.max(2, 5 - near.length)) },
    ];
  }, [pages, path, typed]);

  const s = samples[at];
  const done = picked !== null;

  return (
    <div className="nf-grid">
      <section className="nf-card" aria-label="Find a page">
        <label className="nf-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <span className="sr">Search pages</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search, e.g. enzymes" autoComplete="off" spellCheck={false} />
        </label>
        {groups.map((g) => (
          <div key={g.label}>
            <p className="nf-label">{g.label}</p>
            <ul className="nf-list">
              {g.items.map((p) => (
                <li key={p.href}>
                  <a href={p.href}>
                    <span><b>{p.title}</b><small>{p.where}</small></span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="nf-card nf-q" aria-label="A quick question">
        <p className="nf-label">Quick question · {s.subject}</p>
        <h2>{s.stem}</h2>
        <div className="nf-opts">
          {s.options.map((o, i) => {
            const state = !done ? "" : i === s.answer ? " is-right" : i === picked ? " is-wrong" : " is-dim";
            return (
              <button key={i} type="button" className={`nf-opt${state}`} disabled={done} onClick={() => setPicked(i)}>
                <i>{LETTERS[i]}</i>{o}
              </button>
            );
          })}
        </div>
        {done && (
          <div className="nf-why">
            <p><b className={picked === s.answer ? "nf-good" : "nf-bad"}>{picked === s.answer ? "Correct." : `Not quite. It's ${LETTERS[s.answer]}.`}</b> {s.why}</p>
            <div className="nf-why-row">
              <a href="/signup">Practice free questions</a>
              <button type="button" onClick={() => { setAt((at + 1) % samples.length); setPicked(null); }}>Another one</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

const css = `
.nf { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; padding: 20px 16px 48px; }
.nf a { color: inherit; text-decoration: none; }
.nf-top { width: 100%; max-width: 880px; display: flex; align-items: center; }
.nf-logo { display: inline-flex; align-items: center; gap: 9px; font-weight: 700; font-size: 1.0625rem; letter-spacing: -0.02em; white-space: nowrap; }
.nf-main { width: 100%; max-width: 880px; display: grid; justify-items: center; text-align: center; }

.nf-scene { width: 100%; margin-top: 20px; border-radius: var(--r-lg, 28px); overflow: hidden; line-height: 0;
  background: linear-gradient(180deg, var(--blue-soft), var(--bg) 92%); }
.nf-scene svg { width: 100%; height: auto; aspect-ratio: 720 / 270; display: block; }
@media (max-width: 560px) { .nf-scene svg { aspect-ratio: auto; height: 220px; } }
.nf-far { fill: color-mix(in srgb, var(--ink) 7%, var(--bg)); }
.nf-mid { fill: color-mix(in srgb, var(--ink) 12%, var(--bg)); }
.nf-near { fill: color-mix(in srgb, var(--ink) 18%, var(--bg)); }
.nf-snow { fill: var(--card); }
.nf-sun { fill: color-mix(in srgb, var(--blue) 16%, var(--bg)); }
.nf-cloud { fill: var(--card); opacity: .85; }
:root[data-theme="dark"] .nf-snow { fill: color-mix(in srgb, var(--ink) 55%, var(--bg)); }
:root[data-theme="dark"] .nf-sun { fill: color-mix(in srgb, var(--ink) 34%, var(--bg)); }
:root[data-theme="dark"] .nf-cloud { fill: color-mix(in srgb, var(--ink) 16%, var(--bg)); opacity: 1; }
.nf-trail { fill: none; stroke: color-mix(in srgb, var(--ink) 34%, var(--bg)); stroke-width: 3; stroke-linecap: round; stroke-dasharray: 1 9; }
.nf-post { fill: color-mix(in srgb, var(--ink) 42%, var(--bg)); }
.nf-board { fill: var(--card); stroke: color-mix(in srgb, var(--ink) 42%, var(--bg)); stroke-width: 2; stroke-linejoin: round; }
.nf-sign { fill: var(--ink); font: 800 19px/1 var(--font); letter-spacing: -0.02em; }
.nf-drift { animation: nf-drift 26s ease-in-out infinite alternate; }
.nf-drift2 { animation: nf-drift 34s ease-in-out -12s infinite alternate-reverse; }
.nf-peek { animation: nf-peek 5.5s ease-in-out infinite; }
@keyframes nf-drift { from { transform: translateX(-24px); } to { transform: translateX(24px); } }
@keyframes nf-peek { 0%, 55%, 100% { transform: translateY(0); } 70%, 85% { transform: translateY(7px); } }
@media (prefers-reduced-motion: reduce) { .nf-drift, .nf-drift2, .nf-peek { animation: none; } }

.nf h1 { margin: 28px 0 0; font-size: clamp(2.25rem, 1.4rem + 3.4vw, 3.5rem); font-weight: 800; letter-spacing: -0.045em; line-height: 1.05; }
.nf-sub { margin: 10px 0 0; color: var(--muted); font-size: 1.0625rem; }
.nf-btns { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 22px; }
.nf-btn { display: inline-flex; align-items: center; height: 44px; padding: 0 20px; border-radius: var(--r-btn, 999px); font-size: .9375rem; font-weight: 600; transition: transform .15s; }
.nf-btn:hover { transform: translateY(-1px); }
.nf-btn.is-main { background: var(--cta, var(--ink)); color: var(--on-cta, var(--bg)); }
.nf-btn.is-alt { background: var(--card); box-shadow: inset 0 0 0 1px var(--line); }

.nf-grid { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 36px; text-align: left; }
@media (max-width: 760px) { .nf-grid { grid-template-columns: 1fr; } }
.nf-card { background: var(--card); border-radius: var(--r-lg, 28px); box-shadow: var(--shadow), inset 0 0 0 1px var(--line); padding: 20px; min-width: 0; }
.nf-label { margin: 16px 0 6px; font-size: .75rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }
.nf-q .nf-label { margin-top: 0; }
.nf-search { display: flex; align-items: center; gap: 10px; height: 48px; padding: 0 14px; border-radius: var(--r-md, 18px); background: var(--bg); box-shadow: inset 0 0 0 1px var(--line); color: var(--muted); }
.nf-search:focus-within { box-shadow: inset 0 0 0 2px var(--blue); }
.nf-search input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--ink); font: 500 1rem var(--font); }
.nf-search input::-webkit-search-cancel-button { display: none; }
.nf-list { list-style: none; margin: 0; padding: 0; }
.nf-list a { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; margin: 0 -12px; border-radius: var(--r-md, 18px); color: var(--muted); }
.nf-list a:hover, .nf-list a:focus-visible { background: var(--bg); color: var(--blue); }
.nf-list span { display: grid; min-width: 0; }
.nf-list b { color: var(--ink); font-weight: 600; font-size: .9375rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nf-list small { font-size: .8125rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.nf-q h2 { margin: 0 0 14px; font-size: 1.0625rem; font-weight: 700; line-height: 1.4; letter-spacing: -0.01em; }
.nf-opts { display: grid; gap: 8px; }
.nf-opt { display: flex; align-items: center; gap: 10px; width: 100%; min-height: 44px; padding: 8px 12px; border: 0; border-radius: var(--r-md, 18px); background: var(--bg); box-shadow: inset 0 0 0 1px var(--line); color: var(--ink); font: 500 .9375rem/1.35 var(--font); text-align: left; cursor: pointer; }
.nf-opt:not(:disabled):hover { box-shadow: inset 0 0 0 2px var(--blue); }
.nf-opt:disabled { cursor: default; }
.nf-opt i { flex: none; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 50%; background: var(--card); box-shadow: inset 0 0 0 1px var(--line); font: 700 .75rem var(--font); font-style: normal; color: var(--muted); }
.nf-opt.is-right { box-shadow: inset 0 0 0 2px var(--good); }
.nf-opt.is-right i { background: var(--good); color: var(--card); box-shadow: none; }
.nf-opt.is-wrong { box-shadow: inset 0 0 0 2px var(--bad); }
.nf-opt.is-wrong i { background: var(--bad); color: var(--card); box-shadow: none; }
.nf-opt.is-dim { color: var(--muted); }
.nf-why p { margin: 14px 0 0; font-size: .9375rem; line-height: 1.55; color: var(--muted); }
.nf-good { color: var(--good); } .nf-bad { color: var(--bad); }
.nf-why-row { display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: center; margin-top: 12px; font-size: .9375rem; font-weight: 600; }
.nf-why-row a { color: var(--blue) !important; }
.nf-why-row button { border: 0; padding: 0; background: none; color: var(--muted); font: inherit; cursor: pointer; }
.nf-why-row button:hover { color: var(--ink); }
`;

/* The markhor's own outline is in components/Logo.tsx; here it is placed behind the near ridge so only its head and
   horns show, facing the signpost. */
function Scene() {
  return (
    <div className="nf-scene">
      <svg viewBox="0 30 720 270" preserveAspectRatio="xMidYMax slice" role="img" aria-label="A markhor peeking over a ridge at a trail sign that reads 404">
        <circle className="nf-sun" cx="566" cy="86" r="34" />
        <g className="nf-drift">
          <rect className="nf-cloud" x="140" y="64" width="92" height="20" rx="10" />
          <rect className="nf-cloud" x="166" y="52" width="44" height="22" rx="11" />
        </g>
        <g className="nf-drift2">
          <rect className="nf-cloud" x="396" y="50" width="70" height="16" rx="8" />
          <rect className="nf-cloud" x="610" y="130" width="58" height="14" rx="7" />
        </g>

        <path className="nf-far" d="M0 196 70 150 118 172 190 96 252 158 306 124 368 168 440 80 500 140 560 112 630 158 720 118V300H0Z" />
        <path className="nf-snow" d="M190 96 208 115 199 112 190 120 182 111 174 116ZM440 80 460 103 450 99 441 108 432 99 423 104Z" />
        <path className="nf-mid" d="M0 232 92 190 160 214 262 168 340 208 420 184 520 224 602 188 720 214V300H0Z" />

        <path className="nf-trail" d="M352 300C330 287 302 280 282 272S244 260 224 256" />
        <rect className="nf-post" x="208" y="192" width="7" height="66" rx="2" />
        <path className="nf-board" d="M166 198H252L266 212 252 226H166Z" />
        <text className="nf-sign" x="209" y="219" textAnchor="middle">404</text>
        <path className="nf-near" d="M0 300V258L90 244 200 252 270 266 304 300Z" />

        <g transform="translate(435 147) scale(1.35)">
          <path className="nf-peek" fill="var(--blue)" d={MARKHOR} />
        </g>
        <path className="nf-near" d="M326 300 392 266 470 250 560 246 640 258 720 244V300Z" />
      </svg>
    </div>
  );
}

export default function NotFoundPage() {
  return (
    <main className="nf">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="nf-top">
        <a className="nf-logo" href="/"><Markhor height={31} />{site.name}</a>
      </div>
      <div className="nf-main">
        <Scene />
        <h1>Off the trail</h1>
        <p className="nf-sub">There&apos;s nothing at this address.</p>
        <div className="nf-btns">
          <a className="nf-btn is-main" href="/">Go home</a>
          <a className="nf-btn is-alt" href="/dashboard">Your dashboard</a>
        </div>
        <Help />
      </div>
    </main>
  );
}
