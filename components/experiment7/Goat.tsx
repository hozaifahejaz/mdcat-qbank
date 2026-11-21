import { MARKHOR } from "@/components/Logo";

/* The whole markhor for experiment 7. The logo is its head and chest; this adds the back, rump, tail and four legs
   (the same body as sign-in experiment 5). Drawn facing left with its hooves at (0, 0), so callers place it by its
   footing; face={-1} turns it to face right. */
const BODY = "M60 50C78 46 100 48 112 54C120 58 122 66 120 76C119 84 117 90 114 94L116 120L110 121L106 98L102 98L103 120L97 121L94 96C88 97 82 97 76 95L77 120L71 121L68 97L66 120L60 121L58 90ZM113 56 123 49 121 60Z";

export default function Goat({ size, face = 1 }: { size: number; face?: 1 | -1 }) {
  return (
    <g transform={`scale(${size * face} ${size}) translate(-90 -121)`}>
      <path className="x7-body" d={BODY} />
      <path className="x7-head" d={MARKHOR} />
    </g>
  );
}
