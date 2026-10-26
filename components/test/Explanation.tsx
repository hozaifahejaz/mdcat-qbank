import type { Question } from "@/lib/bank";
import { letters } from "@/lib/format";

/* The explanation under an answered question: why the key is right, then why each other option is wrong.
   chosen: the student's answer, null if skipped, left out when there's no answer to judge (a bookmark). */
export default function Explanation({ q, chosen, onReport }: { q: Question; chosen?: number | null; onReport?: () => void }) {
  const verdict = chosen === undefined ? "plain" : chosen === null ? "skip" : chosen === q.answer ? "right" : "wrong";
  return (
    <div className={`expl ${verdict}`}>
      <p className="expl-v">
        {verdict === "right" ? "Correct." : verdict === "wrong" ? `Not quite. The answer is ${letters[q.answer]}.` : verdict === "skip" ? `Skipped. The answer is ${letters[q.answer]}.` : `The answer is ${letters[q.answer]}.`}
      </p>
      <p><b>Why {letters[q.answer]}:</b> {q.why}</p>
      <ul className="expl-wrong">
        {q.options.map((_, i) => i !== q.answer && q.wrong[i] && (
          <li key={i} className={i === chosen ? "mine" : undefined}><b>{letters[i]}{i === chosen ? " (your answer)" : ""}:</b> {q.wrong[i]}</li>
        ))}
      </ul>
      <p className="expl-src muted">
        Source: {q.source}
        {onReport && <> · <button type="button" className="link" onClick={onReport}>Report a problem</button></>}
      </p>
    </div>
  );
}
