import type { Question } from "@/lib/bank";
import { letters } from "@/lib/format";
import type { Stats } from "@/lib/study";

const share = (stats: Stats | null | undefined, k: number) => (stats && stats.n ? Math.round(((stats.picks[k] ?? 0) / stats.n) * 100) : null);

export function spent(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  return s < 60 ? `${s} sec` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} sec`;
}

const Tick = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
const Cross = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>;

/* The options once the answer is out: a tick by the key, a cross by a wrong pick, and how many students chose each. */
export function AnsweredOptions({ q, chosen, stats }: { q: Question; chosen: number | null | undefined; stats?: Stats | null }) {
  return (
    <ul className="opts" role="list">
      {q.options.map((o, k) => {
        const key = k === q.answer;
        const mine = k === chosen;
        const pct = share(stats, k);
        return (
          <li key={k}>
            <div className={`opt done${key ? " key" : mine ? " miss" : ""}${mine ? " on" : ""}`}>
              <span className="omark">{key ? <Tick /> : mine ? <Cross /> : null}</span>
              <span className="oradio" aria-hidden="true" />
              <span className="oletter">{letters[k]}.</span>
              <span className="otext">
                {o}
                {pct !== null && <span className="opct"> ({pct}%)</span>}
                <span className="sr">{key ? (mine ? " Your answer, correct" : " Correct answer") : mine ? " Your answer" : ""}</span>
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* One line of result under the options: right or wrong, how other students did, and the time it took. */
export function ResultStrip({ q, chosen, stats, seconds }: { q: Question; chosen: number | null | undefined; stats?: Stats | null; seconds?: number | null }) {
  const verdict = chosen === undefined ? "plain" : chosen === null ? "skip" : chosen === q.answer ? "right" : "wrong";
  const right = share(stats, q.answer);
  return (
    <div className={`rstrip ${verdict}`}>
      <div className="rs-main">
        <b>{verdict === "right" ? "Correct" : verdict === "wrong" ? "Incorrect" : verdict === "skip" ? "Not answered" : "Answer"}</b>
        {verdict !== "right" && <span>Correct answer <b>{letters[q.answer]}</b></span>}
      </div>
      {right !== null && (
        <div className="rs-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 4v16h16M9 16v-4M13 16V8M17 16v-6" /></svg>
          <span><b>{right}%</b><span>answered correctly</span></span>
        </div>
      )}
      {!!seconds && (
        <div className="rs-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
          <span><b>{spent(seconds)}</b><span>time spent</span></span>
        </div>
      )}
    </div>
  );
}

/* The explanation under an answered question: why the key is right, why each other option is wrong, then where it
   comes from in the book. */
export default function Explanation({ q, chosen, onReport }: { q: Question; chosen?: number | null; onReport?: () => void }) {
  const others = q.options.map((_, i) => i).filter((i) => i !== q.answer && q.wrong[i]);
  return (
    <section className="expl" aria-label="Explanation">
      <h2 className="expl-tab">Explanation</h2>
      <p><b>{letters[q.answer]} is correct.</b> {q.why}</p>
      {others.map((i) => (
        <p key={i} className={i === chosen ? "mine" : undefined}><b>Choice {letters[i]}{i === chosen ? " (your answer)" : ""}:</b> {q.wrong[i]}</p>
      ))}
      <div className="expl-ref">
        <b>Reference</b>
        <p>{q.source}</p>
      </div>
      <dl className="expl-tags">
        <div><dd>{q.subject}</dd><dt>Subject</dt></div>
        <div><dd>{q.chapter}</dd><dt>Chapter</dt></div>
        {q.topic && <div><dd>{q.topic}</dd><dt>Topic</dt></div>}
        {q.difficulty && <div><dd className="cap">{q.difficulty}</dd><dt>Difficulty</dt></div>}
      </dl>
      {onReport && <p className="expl-src"><button type="button" className="link quiet" onClick={onReport}>Report a problem with this question</button></p>}
    </section>
  );
}
