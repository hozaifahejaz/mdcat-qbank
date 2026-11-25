import Ahead, { AheadReading } from "@/components/Ahead";
import { ExamFooter, ExamNav } from "@/components/exam/ExamFrame";
import ExamPricing from "@/components/exam/ExamPricing";
import Notify from "@/components/exam/Notify";
import TryQuestion from "@/components/exam/TryQuestion";
import { SubjectMark } from "@/components/Marks";
import { addOn, type ExamPage as Exam, groupOf } from "@/lib/exam-pages";
import { signupHref } from "@/lib/exams";
import { checkedText, faqData, ld } from "@/lib/public";
import { prices, site } from "@/lib/site";

/* The page every exam gets (lib/exam-pages.ts): the exam's bar, a short hero, its paper, a question to try, its
   subjects, its pricing (or "Tell me when it opens"), its FAQ and a closing line. Nothing on it names another exam
   except the "Add to your plan" row of its own group. `children` adds anything one exam needs on top. */
export default function ExamPage({ exam, children }: { exam: Exam; children?: React.ReactNode }) {
  const start = signupHref({ area: exam.area, exam: exam.id });
  const total = exam.paper.parts.reduce((n, p) => n + p.n, 0);
  return (
    <div className="x3 x4 x8 xe" id="top" style={{ ["--c" as string]: exam.colour }}>
      <ExamNav exam={exam} start={start} />

      <header className="xe-hero">
        <div className="x3-wrap">
          <p className="x4-kicker">{exam.name} · set by {exam.body}</p>
          <h1>{exam.h1}</h1>
          <p className="xe-lede">{exam.lede}</p>
          <div className="xe-acts">
            {exam.open
              ? <a className="x3-btn x3-blue x3-big" href={start}>Start free</a>
              : <a className="x3-btn x3-blue x3-big" href="#pricing">Tell me when it opens</a>}
            <a className="x3-btn xe-line x3-big" href="#try">Try a question</a>
          </div>
          <dl className="xe-stats">
            {exam.stats.map(([v, k]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
      </header>

      <main>
        <section id="paper" className="x3-sec xe-sec">
          <div className="x3-wrap">
            <div className="x3-head"><h2>The paper</h2></div>
            <div className="xe-paper x3-card">
              <div className="xe-paper-top">
                <b>{exam.paper.summary}</b>
                <span>{exam.name}</span>
              </div>
              {total > 0 && (
                <>
                  <span className="xe-bar" aria-hidden="true">
                    {exam.paper.parts.map((p, j) => <i key={p.name} style={{ flexGrow: p.n, background: `color-mix(in srgb, var(--c) ${100 - j * 17}%, var(--x-card))` }} />)}
                  </span>
                  <ul className="xe-parts">
                    {exam.paper.parts.map((p, j) => (
                      <li key={p.name}><i style={{ background: `color-mix(in srgb, var(--c) ${100 - j * 17}%, var(--x-card))` }} aria-hidden="true" />{p.name}<b>{p.n}</b></li>
                    ))}
                  </ul>
                </>
              )}
              <ul className="xe-notes">{exam.paper.notes.map((n) => <li key={n}>{n}</li>)}</ul>
              <p className="xe-src">From {exam.paper.source}, checked {checkedText}.</p>
            </div>
          </div>
        </section>

        <section id="try" className="x3-sec xe-sec">
          <div className="x3-wrap">
            <div className="x3-head"><h2>Try a question</h2></div>
            <TryQuestion q={exam.sample} tag={exam.sample.subject ? `${exam.sample.subject} · ${exam.sample.topic}` : exam.sample.topic} />
          </div>
        </section>

        <section id="subjects" className="x3-sec xe-sec">
          <div className="x3-wrap">
            <div className="x3-head"><h2>{exam.topicsHead ?? "Subjects"}</h2></div>
            <div className="xe-topics">
              {exam.topics.map((t) => {
                const inner = (
                  <>
                    <span className="xe-tmark" aria-hidden="true"><SubjectMark subject={t.name} size={22} /></span>
                    <b>{t.name}</b>
                    <small>{t.line}</small>
                  </>
                );
                if (t.href) return <a key={t.name} className="x3-card xe-topic" href={t.href}>{inner}<span className="xe-go">Free MCQs</span></a>;
                if (t.chapters) return (
                  <details key={t.name} className="x3-card xe-topic">
                    <summary>{inner}<span className="xe-go">See chapters</span></summary>
                    <ol>{t.chapters.map((c) => <li key={c}>{c}</li>)}</ol>
                  </details>
                );
                return <div key={t.name} className="x3-card xe-topic">{inner}</div>;
              })}
            </div>
          </div>
        </section>

        {children}

        <section id="pricing" className="x3-sec xe-sec">
          <div className="x3-wrap">
            <div className="x3-head"><h2>{exam.open ? "Pricing" : "Opening soon"}</h2></div>
            {exam.open && exam.price
              ? <ExamPricing exam={{ id: exam.id, area: exam.area, short: exam.short, name: exam.name }} price={exam.price} perks={exam.perks} others={groupOf(exam).map((o) => ({ id: o.id, short: o.short, name: o.name }))} addOn={addOn} payments={site.payments} renewOff={prices.renewOff} />
              : <Notify exam={exam.id} short={exam.short} />}
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

        {exam.open && (
          <section className="x3-sec xe-end">
            <div className="x3-wrap">
              <h2>Start with 100 free {exam.short} questions.</h2>
              <a className="x3-btn x3-blue x3-big" href={start}>Start free</a>
              <small className="x3-proof">No card needed.</small>
            </div>
          </section>
        )}
      </main>

      <ExamFooter exam={exam} />
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(faqData(exam.faqs))} />
      <Ahead />
      <AheadReading />
    </div>
  );
}
