"use client";

import { MARKHOR, Markhor } from "@/components/Logo";
import { site } from "@/lib/site";

/* The whole not-found page (app/not-found.tsx). A markhor peeks over a ridge at a trail that ends at a "404" signpost,
   with the way home below.
   It is loaded only when a page is not found (components/NotFoundLazy.tsx): Next puts the not-found page into every
   other page's data, so anything here directly would be downloaded by every page. Styled by the <style> below, not an
   imported stylesheet, for the same reason. Built only from the site's tokens, so it follows light, dark and the Classic
   look. Motion is slow drift and a peek, never a fade. */

const css = `
.nf { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; padding: 20px 16px 48px; }
.nf a { color: inherit; text-decoration: none; }
.nf-top { width: 100%; max-width: 880px; display: flex; align-items: center; }
.nf-logo { display: inline-flex; align-items: center; gap: 9px; font-weight: 700; font-size: 1.0625rem; letter-spacing: -0.02em; white-space: nowrap; }
.nf-main { flex: 1; width: 100%; max-width: 880px; display: grid; align-content: center; justify-items: center; text-align: center; padding-bottom: 32px; }

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
@media (hover: hover) { .nf-btn:hover { transform: translateY(-1px); } }
.nf-btn.is-main { background: var(--cta, var(--ink)); color: var(--on-cta, var(--bg)); }
.nf-btn.is-alt { background: var(--card); box-shadow: inset 0 0 0 1px var(--line); }

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
      </div>
    </main>
  );
}
