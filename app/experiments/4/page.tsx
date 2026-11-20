import type { Metadata } from "next";
import Logo, { Markhor } from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { PublicFooter } from "@/components/public/Shell";
import Finder from "@/components/experiment4/Finder";
import TrackMark from "@/components/experiment4/TrackMark";
import { examCount, liveCount, tracks } from "@/lib/catalogue";
import { bankSize } from "@/lib/public";
import { plans } from "@/lib/billing";
import { site } from "@/lib/site";
import "../../landing-new.css";
import "./exp4.css";

/* Landing page experiment 4: one home for every exam, grouped into tracks, in the live landing's look (.x3). The live
   landing page at / is unchanged. Noindex. */
export const metadata: Metadata = { title: `Experiment 4 · ${site.name}`, robots: { index: false, follow: false } };

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

const faqs = [
  { q: "Which exams can I practice today?", a: "PMDC MDCAT, NUMS MDCAT, the AKU test and FSc pre-medical Part 1 and 2. The other exams on this page open track by track." },
  { q: "Will I see exams I'm not taking?", a: "No. You pick your track when you sign up, and your account shows only that track and what you've unlocked in it." },
  { q: "Can I buy two exams together?", a: "Yes, inside your track. For example, FSc pre-engineering and the engineering entry tests come as one bundle." },
  { q: "Where do the questions come from?", a: "Every question is written for this bank from the official syllabus and its textbooks, then checked before it goes live." },
  { q: "Is there a free plan?", a: "Yes. 100 questions in your track are free, each with a full explanation. No card is needed." },
  { q: "My exam isn't listed. Can you add it?", a: "Tell us at the contact page. We add exams in the order students ask for them." },
];

export default function Experiment4() {
  return (
    <div className="x3 x4" id="top">
      <nav className="x3-nav">
        <div className="x3-wrap x3-navin">
          <Logo href="#top" size={22} />
          <ul>
            <li><a href="#tracks">Tracks</a></li>
            <li><a href="#find">All exams</a></li>
            <li><a href="#how">How it works</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <div className="x3-navend">
            <ThemeToggle />
            <a className="x3-signin" href="/signin">Sign in</a>
            <a className="x3-btn x3-dark" href="/signup">Start free</a>
          </div>
        </div>
      </nav>

      <header className="x4-hero">
        <div className="x3-wrap">
          <span className="x3-tag">{examCount} exams · {liveCount} live now</span>
          <h1>Every exam in Pakistan.<span>One place to practice.</span></h1>
          <p>From MDCAT and ECAT to FCPS Part 1, CSS and A Levels. Pick your track and see only what you need.</p>
          <div id="tracks" className="x4-tracks" aria-label="Pick your track">
            {tracks.map((t) => {
              const live = t.exams.filter((e) => e.live).length;
              return (
                <a key={t.id} href={`#find-${t.id}`} className="x3-card x4-track">
                  <span className="x4-tile" style={{ color: t.colour }}><TrackMark id={t.id} size={26} /></span>
                  <b>{t.name}</b>
                  <small>{t.exams.slice(0, 3).map((e) => e.name).join(", ")}{t.exams.length > 3 ? " and more" : ""}</small>
                  <em className={live ? "live" : ""}>{live ? `${live} live` : "Coming soon"}</em>
                </a>
              );
            })}
          </div>
        </div>
      </header>

      <main>
        <section id="find" className="x3-sec x4-find">
          <div className="x3-wrap">
            <div className="x3-head">
              <span className="x3-tag">All exams</span>
              <h2>Find your exam.<br /><span className="mute">We&apos;ll do the rest.</span></h2>
            </div>
            <Finder />
          </div>
        </section>

        <section id="how" className="x3-sec">
          <div className="x3-wrap">
            <div className="x3-head">
              <span className="x3-tag">How it works</span>
              <h2>Made for <span className="hl">your</span> track.</h2>
            </div>
            <div className="x3-cards">
              <article className="x3-card">
                <span className="x4-step">1</span>
                <h3>Pick your track</h3>
                <p>Pre-medical, pre-engineering, doctors, law, jobs or Cambridge. One tap when you sign up.</p>
              </article>
              <article className="x3-card">
                <span className="x4-step">2</span>
                <h3>See only your exams</h3>
                <p>Your subjects, your chapters, your mocks. Nothing from other tracks gets in the way.</p>
              </article>
              <article className="x3-card">
                <span className="x4-step">3</span>
                <h3>Practice and improve</h3>
                <p>Every answer explained, timed mocks in the real pattern, and a list of your mistakes.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="x3-sec">
          <div className="x3-wrap">
            <div className="x3-head">
              <span className="x3-tag">Pricing</span>
              <h2>Pay for your track.<br /><span className="mute">Nothing else.</span></h2>
            </div>
            <div className="x3-plans">
              <div className="x3-card plan">
                <h3>Free</h3>
                <p>Try your track first.</p>
                <div className="price"><small>Rs.</small>0</div>
                <a className="x3-btn x3-blue" href="/signup">Start free</a>
                <ul>
                  <li><Check />100 questions in your track</li>
                  <li><Check />Every answer explained</li>
                  <li><Check />No card needed</li>
                </ul>
              </div>
              <div className="x3-card plan best">
                <span className="bolt" aria-hidden="true"><Markhor height={22} /></span>
                <h3>Bundle</h3>
                <p>Board papers and entry tests of one track.</p>
                <div className="price x4-from"><small>Save on</small>both</div>
                <a className="x3-btn x3-white" href="/signup">Start free</a>
                <ul>
                  <li><Check />FSc pre-medical + MDCAT, NUMS, AKU</li>
                  <li><Check />FSc pre-engineering + ECAT, NET</li>
                  <li><Check />FCPS Part 1 + JCAT</li>
                </ul>
              </div>
              <div className="x3-card plan">
                <h3>One exam</h3>
                <p>Just the exam you&apos;re taking.</p>
                <div className="price x4-from"><small>From Rs.</small>{plans.monthly.price.toLocaleString("en-GB")}</div>
                <a className="x3-btn x3-blue" href="/signup">Start free</a>
                <ul>
                  <li><Check />Season or one-month pass</li>
                  <li><Check />Full-length timed mocks</li>
                </ul>
              </div>
            </div>
            <p className="x3-note">{bankSize} questions live today for the medical track. Prices for each new track are set when it opens.</p>
          </div>
        </section>

        <section className="x3-sec">
          <div className="x3-wrap">
            <div className="x3-apps x3-card">
              <div>
                <span className="x3-tag">Apps</span>
                <h2>iOS and Android apps<br /><span className="mute">coming soon.</span></h2>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="x3-sec">
          <div className="x3-wrap x3-faqwrap">
            <div className="x3-head">
              <span className="x3-tag">FAQ</span>
              <h2>Questions,<br /><span className="mute">answered.</span></h2>
            </div>
            <div className="x3-faq">
              {faqs.map((f, i) => (
                <details key={f.q} className="x3-card" open={i === 0}>
                  <summary>{f.q}<i aria-hidden="true" /></summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter home="#top" />
    </div>
  );
}
