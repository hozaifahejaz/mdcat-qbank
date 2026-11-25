import Ahead, { AheadReading } from "@/components/Ahead";
import { ExamFooter, ExamNav } from "@/components/exam/ExamFrame";
import { fcpsSpecialities } from "@/lib/exam-pages";
import { faqData, ld } from "@/lib/public";
import { Summit } from "@/components/home/Route";
import { pageMeta } from "@/lib/public-meta";
import "../landing-new.css";
import "../landing-hero.css";
import "../landing-areas.css";
import "../home-range.css";
import "../exam-page.css";

/* FCPS Part 1: what it is and a card per speciality. Each speciality is its own exam with its own page and price
   (Huzaifa 2026-11-24), so this page only explains the exam and sends a doctor to theirs. */
export const metadata = pageMeta({
  title: "FCPS Part 1 MCQs by Speciality",
  description: "FCPS Part 1 practice MCQs for each speciality group: basic sciences with a full explanation on every question. Pick your speciality.",
  path: "/fcps",
});

const brand = { short: "FCPS Part 1", path: "/fcps", colour: "#2f55f0", open: false, body: "CPSP", links: fcpsSpecialities.filter((s) => s.page).map((s) => ({ name: s.name, href: `/fcps/${s.slug}` })) };
const faqs = [
  { q: "Why is there a page for each speciality?", a: "CPSP sets FCPS Part 1 by speciality group, so each group has its own paper. Pick yours and you practice only what your paper asks." },
  { q: "When is FCPS Part 1 held?", a: "CPSP's schedule for 2027 lists four sittings: 5 January, 6 April, 6 July and 5 October." },
  { q: "When does practice open?", a: "Speciality by speciality, starting with Surgery. Leave your email on your speciality's page and we'll write once, when it opens." },
];

export default function Fcps() {
  return (
    <div className="x3 x4 x8 xr xe" id="top" style={{ ["--c" as string]: brand.colour }}>
      <ExamNav exam={brand} start="#specialities" cta={{ name: "Pick yours", href: "#specialities" }} links={[{ name: "Specialities", href: "#specialities" }, { name: "FAQ", href: "#faq" }]} />
      <header className="xe-hero">
        <div className="x3-wrap">
          <p className="xe-kicker"><span className="xe-dot" />FCPS Part 1 · set by CPSP</p>
          <h1>FCPS Part 1 MCQs for your speciality</h1>
          <p className="xe-lede">Each speciality group sits its own paper, so each gets its own bank and its own plan. Pick yours.</p>
        </div>
      </header>
      <main>
        <section id="specialities" className="x3-sec xe-sec">
          <div className="x3-wrap">
            <div className="x3-head"><h2>Specialities</h2></div>
            <ol className="xe-camps" style={{ ["--n" as string]: fcpsSpecialities.length }}>
              {fcpsSpecialities.map((s, i) => {
                const inner = <><small className="xe-campno">Camp {i + 1}</small><b>{s.name}</b><small>{s.page ? "Questions, paper and plan" : "Opening soon"}</small></>;
                return (
                  <li key={s.slug}>
                    {s.page ? <a className="x3-card xe-topic" href={`/fcps/${s.slug}`}>{inner}<span className="xe-go">Open its page</span></a>
                      : <div className="x3-card xe-topic soon">{inner}</div>}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
        <section id="faq" className="x3-sec xe-sec">
          <div className="x3-wrap x3-faqwrap">
            <div className="x3-head"><h2>FAQ</h2></div>
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
        <Summit line="Pick your speciality and start climbing." button="Pick yours" href="#specialities" />
      </main>
      <ExamFooter exam={brand} />
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(faqData(faqs))} />
      <Ahead />
      <AheadReading />
    </div>
  );
}
