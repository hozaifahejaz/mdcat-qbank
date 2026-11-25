import Ahead, { AheadReading } from "@/components/Ahead";
import { ExamFooter, ExamNav } from "@/components/exam/ExamFrame";
import ExamPricing from "@/components/exam/ExamPricing";
import Profile from "@/components/exam/Profile";
import TryQuestion from "@/components/exam/TryQuestion";
import { Summit } from "@/components/home/Route";
import { SubjectMark } from "@/components/Marks";
import { addOn, type ExamPage as Exam, groupOf } from "@/lib/exam-pages";
import { signupHref } from "@/lib/exams";
import { faqData, ld } from "@/lib/public";
import { prices, site } from "@/lib/site";

/* The page every exam gets (lib/exam-pages.ts), told as that exam's climb: the hero with the paper drawn as a
   profile beside it, one question on an answer sheet, the subjects as base camps along a trail, a pass to build for
   pricing (or "Tell me when it opens"), the FAQ and a summit to start from. Nothing on it names another exam except
   the add-ons of its own group in the pass. `children` adds anything one exam needs on top. */
export default function ExamPage({ exam, children }: { exam: Exam; children?: React.ReactNode }) {
  const start = signupHref({ area: exam.area, exam: exam.id });
  const tag = exam.sample.subject ? `${exam.sample.subject} · ${exam.sample.topic}` : exam.sample.topic;
  return (
    <div className="x3 x4 x8 xr xe" id="top" style={{ ["--c" as string]: exam.colour }}>
      <ExamNav exam={exam} start={start} />

      <header className="xe-hero">
        <div className="x3-wrap xe-hero-in">
          <div className="xe-hero-text">
            <p className="xe-kicker"><span className="xe-dot" />{exam.name} · set by {exam.body}</p>
            <h1>{exam.h1}</h1>
            <p className="xe-lede">{exam.lede}</p>
            <div className="xe-acts">
              {exam.open
                ? <a className="x3-btn x3-blue x3-big" href={start}>Start free</a>
                : <a className="x3-btn x3-blue x3-big" href="#pricing">Tell me when it opens</a>}
              <a className="x3-btn xe-line x3-big" href="#try">Try a question</a>
            </div>
            <dl className="xe-stats">
              {exam.stats.map(([v, k]) => <div key={k}><dd>{v}</dd><dt>{k}</dt></div>)}
            </dl>
          </div>
          <div id="paper" className="xe-hero-art"><Profile exam={exam} /></div>
        </div>
      </header>

      <main>
        <section id="try" className="x3-sec xe-sec">
          <div className="x3-wrap">
            <div className="x3-head"><h2>Try a question</h2></div>
            <TryQuestion q={exam.sample} tag={tag} exam={exam.short} />
          </div>
        </section>

        <section id="subjects" className="x3-sec xe-sec">
          <div className="x3-wrap">
            <div className="x3-head"><h2>{exam.topicsHead ?? "Subjects"}</h2></div>
            <ol className="xe-camps" style={{ ["--n" as string]: Math.min(exam.topics.length, 5) }}>
              {exam.topics.map((t, i) => {
                const inner = (
                  <>
                    <span className="xe-tmark" aria-hidden="true"><SubjectMark subject={t.name} size={22} /></span>
                    <small className="xe-campno">Camp {i + 1}</small>
                    <b>{t.name}</b>
                    <small>{t.line}</small>
                  </>
                );
                return (
                  <li key={t.name}>
                    {t.href ? <a className="x3-card xe-topic" href={t.href}>{inner}<span className="xe-go">Free MCQs</span></a>
                      : t.chapters ? (
                        <details className="x3-card xe-topic">
                          <summary>{inner}<span className="xe-go">See chapters</span></summary>
                          <ol>{t.chapters.map((c) => <li key={c}>{c}</li>)}</ol>
                        </details>
                      ) : <div className="x3-card xe-topic">{inner}</div>}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {children}

        <section id="pricing" className="x3-sec xe-sec">
          <div className="x3-wrap">
            <div className="x3-head"><h2>{exam.open ? "Pricing" : "Opening soon"}</h2></div>
            <ExamPricing exam={{ id: exam.id, area: exam.area, short: exam.short, name: exam.name }} price={exam.open ? exam.price : undefined} perks={exam.perks}
              others={groupOf(exam).map((o) => ({ id: o.id, short: o.short, name: o.name }))} addOn={addOn} payments={site.payments} renewOff={prices.renewOff} />
          </div>
        </section>

        <section id="faq" className="x3-sec xe-sec">
          <div className="x3-wrap x3-faqwrap">
            <div className="x3-head"><h2>FAQ</h2></div>
            <div className="x3-faq">
              {exam.faqs.map((f, i) => (
                <details key={f.q} className="x3-card" open={i === 0}>
                  <summary>{f.q}<i aria-hidden="true" /></summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {exam.open
          ? <Summit line={`Start with 100 free ${exam.short} questions.`} button="Start free" href={start} note="No card needed." />
          : <Summit line={`${exam.short} opens soon.`} button="Tell me when it opens" href="#pricing" />}
      </main>

      <ExamFooter exam={exam} />
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(faqData(exam.faqs))} />
      <Ahead />
      <AheadReading />
    </div>
  );
}
