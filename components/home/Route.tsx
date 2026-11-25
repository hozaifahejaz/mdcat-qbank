import { MARKHOR } from "@/components/Logo";

/* How practicing works, as three stops on one switchback trail that climbs from left to right. On phones the trail
   runs down the left edge instead. */
const stops = [
  {
    t: "Practice by chapter",
    p: "Every chapter of your syllabus, in the order you study it.",
    icon: "M5 4.5h10.5a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3zM5 16.5a3 3 0 0 1 3-3h10.5M9 8.5h6",
  },
  {
    t: "Read why",
    p: "Each answer explains why it's right, and why the others aren't.",
    icon: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.6M12 16.8v.1",
  },
  {
    t: "Sit the full paper",
    p: "Timed mocks with the real count and the real clock.",
    icon: "M12 5.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15zM12 9v4l2.5 1.8M10 2.5h4M18.5 6l1.5-1.5",
  },
];

export default function Route() {
  return (
    <section id="how" className="x3-sec xr-route">
      <div className="x3-wrap">
        <div className="x3-head"><h2>How it works</h2></div>
        <div className="xr-climb">
          <svg className="xr-path" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 292 C 160 292 240 250 340 220 S 600 160 680 120 S 900 30 975 -10" pathLength={1} />
          </svg>
          <ol>
            {stops.map((s, i) => (
              <li key={s.t} className="x3-card" style={{ ["--i" as string]: i }}>
                <span className="xr-stop">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={s.icon} /></svg>
                </span>
                <small>0{i + 1}</small>
                <h3>{s.t}</h3>
                <p>{s.p}</p>
              </li>
            ))}
          </ol>
          <svg className="xr-flag" viewBox="0 0 60 70" aria-hidden="true">
            <path d="M14 66V8" />
            <path className="xr-flagcloth" d="M14 9h30l-8 9 8 9H14z" />
          </svg>
        </div>
      </div>
    </section>
  );
}

/* The last section: a small summit with the markhor on top, and the one thing to do next. */
export function Summit({ line, button, href, note }: { line: string; button: string; href: string; note?: string }) {
  return (
    <section className="xr-summit">
      <div className="x3-wrap">
        <svg className="xr-hill" viewBox="0 0 520 150" aria-hidden="true">
          <path className="xr-hill-c" d="M0 150 L120 112 L170 120 L260 46 L330 92 L380 84 L520 150" transform="translate(0 16)" />
          <path className="xr-hill-l" d="M0 150 L120 112 L170 120 L260 46 L330 92 L380 84 L520 150" pathLength={1} />
          <path className="xr-hill-goat" d={MARKHOR} transform="translate(238 -2) scale(.5)" />
        </svg>
        <h2>{line}</h2>
        <a className="x3-btn x3-blue x3-big" href={href}>{button}</a>
        {note && <small>{note}</small>}
      </div>
    </section>
  );
}
