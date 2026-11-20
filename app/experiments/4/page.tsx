import type { Metadata } from "next";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { PublicFooter } from "@/components/public/Shell";
import TrackMark from "@/components/experiment4/TrackMark";
import { tracks } from "@/lib/catalogue";
import { site } from "@/lib/site";
import "../../landing-new.css";
import "./exp4.css";

/* Landing page experiment 4: a short, uncluttered page that says what the site is. It names the tracks it covers
   without listing every exam, in the live landing's look (.x3). The live landing page at / is unchanged. Noindex. */
export const metadata: Metadata = { title: `Experiment 4 · ${site.name}`, robots: { index: false, follow: false } };

const points = [
  { h: "Original questions", p: "Written from the official syllabus, with every answer explained." },
  { h: "Mocks like the real paper", p: "Same number of questions, same time." },
  { h: "Only your exams", p: "Pick your track and see nothing else." },
];

export default function Experiment4() {
  return (
    <div className="x3 x4" id="top">
      <nav className="x3-nav">
        <div className="x3-wrap x3-navin">
          <Logo href="#top" size={22} />
          <div className="x3-navend">
            <ThemeToggle />
            <a className="x3-signin" href="/signin">Sign in</a>
            <a className="x3-btn x3-dark" href="/signup">Start free</a>
          </div>
        </div>
      </nav>

      <main>
        <header className="x4-hero">
          <div className="x3-wrap">
            <h1>Practice for your exam.<span>Every exam, one place.</span></h1>
            <p>Question banks for Pakistan&apos;s entry tests, board exams, residency, jobs and Cambridge.</p>
            <a className="x3-btn x3-blue x3-big" href="/signup">Start free</a>
            <small className="x4-proof">100 questions free. No card needed.</small>
          </div>
        </header>

        <section className="x4-band" aria-label="Tracks">
          <div className="x3-wrap">
            <ul className="x4-row">
              {tracks.map((t) => (
                <li key={t.id}>
                  <span className="x4-tile" style={{ color: t.colour }}><TrackMark id={t.id} size={22} /></span>
                  {t.name.replace("-", "\u2011")}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="x4-points">
          <div className="x3-wrap">
            <ul>
              {points.map((x) => (
                <li key={x.h}>
                  <b>{x.h}</b>
                  <p>{x.p}</p>
                </li>
              ))}
            </ul>
            <p className="x4-apps">iOS and Android apps coming soon.</p>
          </div>
        </section>
      </main>

      <PublicFooter home="#top" />
    </div>
  );
}
