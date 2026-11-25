import { Figure } from "@/components/test/Figure";
import { script } from "@/lib/format";
import type { PublicQuestion } from "@/lib/public";
import { rich } from "@/lib/rich";

const letters = ["A", "B", "C", "D"];

/* One sample question, readable without any script: the options, then the answer and its explanation behind a
   plain disclosure so a student can try it first. The whole text is in the page for search engines either way. */
export default function Question({ q, n }: { q: PublicQuestion; n: number }) {
  return (
    <article className="pq x3-card">
      <h3><span>Q{n}</span><span {...script(q.stem)}>{rich(q.stem)}</span></h3>
      <Figure svg={q.figure} />
      <ol>
        {q.options.map((o, i) => <li key={i}><b>{letters[i]}</b><span {...script(o)}>{rich(o)}</span></li>)}
      </ol>
      <details>
        <summary>Show the answer and explanation</summary>
        <p className="ans"><b>Answer: {letters[q.answer]}.</b> {rich(q.options[q.answer])}</p>
        <p {...script(q.why)}>{rich(q.why)}</p>
        {Object.keys(q.wrong).length > 0 && (
          <ul>
            {q.options.map((_, i) => (q.wrong[String(i)] ? <li key={i}><b>{letters[i]} is wrong:</b> {rich(q.wrong[String(i)])}</li> : null))}
          </ul>
        )}
      </details>
    </article>
  );
}
