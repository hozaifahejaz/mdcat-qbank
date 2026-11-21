import { MARKHOR } from "@/components/Logo";

export type Step = 0 | 1 | 2 | 3;

/* The scene beside the sign-in form: a Karakoram ridge at first light (at night in the dark theme) with three ledges
   and a summit. The markhor stands on the ledge for each part of signing in that is done, and a flag unfurls on the
   summit once the account is opening. Every move is a transform (a hop: across at one pace, up at another, so it
   arcs), never a fade, and stops for people who ask for reduced motion (exp5.css). */

// Where the markhor's hooves rest on each ledge, in the drawing's units.
const LEDGES: [number, number][] = [[134, 695], [296, 594], [443, 484], [600, 354]];

/* The logo is the markhor's head and shaggy chest; on the mountain it needs the rest of it. Back, rump, a short tail and
   four legs, drawn in the logo's own units so they join its neck, behind it. */
const BODY = "M60 50C78 46 100 48 112 54C120 58 122 66 120 76C119 84 117 90 114 94L116 120L110 121L106 98L102 98L103 120L97 121L94 96C88 97 82 97 76 95L77 120L71 121L68 97L66 120L60 121L58 90ZM113 56 123 49 121 60Z";

// A fixed sky, so the stars sit in the same places on every visit.
const STARS: [number, number, number][] = [
  [351, 97, 1.3], [686, 44, 1], [568, 68, 1.3], [616, 49, 1.8], [239, 39, 1], [464, 234, 1], [266, 66, 1.8], [454, 50, 1.8],
  [146, 134, 1.8], [70, 133, 1], [590, 88, 1.3], [449, 93, 1.8], [212, 210, 1], [580, 52, 1.8], [81, 125, 1.3], [716, 292, 1.3],
  [341, 258, 1.8], [484, 205, 1.3], [274, 112, 1.8], [327, 288, 1.3], [371, 249, 1.3], [643, 57, 1], [544, 234, 1], [740, 160, 1.3],
  [30, 260, 1], [760, 90, 1.8], [690, 230, 1],
];

/* Drawn twice: the tall window beside the form on wide screens, and a band cropped to the ridge above it on phones.
   CSS shows one (exp5.css). */
export default function Ridge({ step, slip }: { step: Step; slip: number }) {
  return (
    <>
      <Drawing id="w" box="0 0 800 800" step={step} slip={slip} />
      <Drawing id="b" box="40 262 720 450" step={step} slip={slip} />
    </>
  );
}

function Drawing({ id, box, step, slip }: { id: string; box: string; step: Step; slip: number }) {
  const [x, y] = LEDGES[step];
  return (
    <svg className={`x5-svg x5-${id}`} viewBox={box} preserveAspectRatio="xMidYMax slice" role="img"
      aria-label={`A markhor climbing a mountain ridge, ${step === 3 ? "at the summit" : `on ledge ${step + 1} of 4`}`}>
      <defs>
        <linearGradient id={`x5-sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="x5-sky-top" />
          <stop offset="0.75" className="x5-sky-bot" />
        </linearGradient>
        <mask id={`x5-cr-${id}`}>
          <circle cx="180" cy="230" r="40" fill="#fff" />
          <circle cx="198" cy="218" r="36" fill="#000" />
        </mask>
      </defs>
      <rect width="800" height="800" fill={`url(#x5-sky-${id})`} />

      <g className="x5-night">
        {STARS.map(([sx, sy, r], i) => <circle key={i} className={i % 5 === 0 ? "x5-star tw" : "x5-star"} cx={sx} cy={sy} r={r} style={i % 5 === 0 ? { animationDelay: `${-i * 0.7}s` } : undefined} />)}
        <circle className="x5-moon" cx="180" cy="230" r="40" mask={`url(#x5-cr-${id})`} />
      </g>
      <circle className="x5-sun" cx="180" cy="262" r="52" />

      <g className="x5-drift">
        <rect className="x5-cloud" x="420" y="186" width="120" height="22" rx="11" />
        <rect className="x5-cloud" x="452" y="172" width="58" height="24" rx="12" />
      </g>
      <g className="x5-drift2">
        <rect className="x5-cloud" x="60" y="330" width="96" height="18" rx="9" />
        <rect className="x5-cloud" x="660" y="268" width="72" height="16" rx="8" />
      </g>

      <path className="x5-far" d="M0 520 60 470 110 498 190 380 240 432 300 328 362 410 420 362 472 420 540 300 602 380 660 342 722 402 800 360V800H0Z" />
      <path className="x5-snow-far" d="M190 380 206 402 197 398 189 408 180 398 172 402ZM300 328 318 352 308 348 299 360 290 349 282 354ZM540 300 560 326 549 321 540 334 530 322 521 327Z" />
      <path className="x5-mid" d="M0 604 90 562 170 590 262 522 350 580 432 540 520 602 620 562 700 590 800 552V800H0Z" />

      {/* The ridge: three flat ledges and the summit. */}
      <path className="x5-ridge" d="M0 748 100 700 168 692 212 658 270 598 322 591 362 558 420 488 466 481 502 438 558 358 626 351 668 390 724 440 800 472V800H0Z" />
      <path className="x5-shade" d="M626 351 668 390 724 440 800 472V800H660L700 600 640 470Z" />
      <path className="x5-snow" d="M540 384 558 358 626 351 650 373 632 369 616 380 598 368 580 381 562 372Z" />
      <path className="x5-lip" d="M102 700 168 692M270 598 322 591M420 488 466 481" />

      <path className="x5-trail" d="M134 695C200 688 250 640 296 594S392 520 443 484 540 392 598 354" />
      <path className="x5-climbed" pathLength="3" style={{ strokeDashoffset: 3 - step }} d="M134 695C200 688 250 640 296 594S392 520 443 484 540 392 598 354" />

      <rect className="x5-pole" x="562" y="300" width="3.5" height="57" rx="1.5" />
      <path className={`x5-flag${step === 3 ? " up" : ""}`} d="M562 302 524 313 562 324Z" />

      <g className="x5-mx" style={{ transform: `translateX(${x}px)` }}>
        <g className="x5-my" style={{ transform: `translateY(${y}px)` }}>
          <g key={slip} className={slip ? "x5-slip" : undefined}>
            <g className="x5-markhor" transform="scale(-0.66 0.66) translate(-88 -121)">
              <path d={BODY} />
              <path d={MARKHOR} />
            </g>
          </g>
        </g>
      </g>

      <path className="x5-near" d="M0 800V764L120 744 262 772 402 752 540 778 682 756 800 772V800Z" />
    </svg>
  );
}
