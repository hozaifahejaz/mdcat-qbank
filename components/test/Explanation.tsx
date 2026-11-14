import type { Question } from "@/lib/bank";
import { letters } from "@/lib/format";

/* The explanation under an answered question: why the key is right, then why each other option is wrong.
   chosen: the student's answer, null if skipped, left out when there's no answer to judge (a bookmark). */
export default function Explanation({ q, chosen, onReport }: { q: Question; chosen?: number | null; onReport?: () => void }) {
  const verdict = chosen === undefined ? "plain" : chosen === null ? "skip" : chosen === q.answer ? "right" : "wrong";
  const others = q.options.map((_, i) => i).filter((i) => i !== q.answer && q.wrong[i]);
  return (
    <div className={`expl ${verdict}`}>
      <p className="expl-v">
        {verdict === "right" && <span className="v-ic"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg></span>}
        <b>{verdict === "right" ? "Correct" : verdict === "wrong" ? "Not quite" : verdict === "skip" ? "Skipped" : "Answer"}</b>
        <span>The answer is {letters[q.answer]}</span>
      </p>
      <div className="expl-sec">
        <p className="expl-h">Why {letters[q.answer]} is right</p>
        <p>{q.why}</p>
      </div>
      {others.length > 0 && (
        <div className="expl-sec">
          <p className="expl-h">Why not the others</p>
          <ul className="expl-wrong">
            {others.map((i) => (
              <li key={i} className={i === chosen ? "mine" : undefined}>
                <span className="expl-l">{letters[i]}</span>
                <span>{i === chosen && <b className="expl-you">Your answer. </b>}{q.wrong[i]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="expl-src muted">
        Source: {q.source}
        {onReport && <> · <button type="button" className="link" onClick={onReport}>Report a problem</button></>}
      </p>
    </div>
  );
}
