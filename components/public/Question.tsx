import type { PublicQuestion } from "@/lib/public";

const letters = ["A", "B", "C", "D"];

/* One sample question, readable without any script: the options, then the answer and its explanation behind a
   plain disclosure so a student can try it first. The whole text is in the page for search engines either way. */
export default function Question({ q, n }: { q: PublicQuestion; n: number }) {
  return (
    <article className="pq x3-card">
      <h3><span>Q{n}</span>{q.stem}</h3>
      <ol>
        {q.options.map((o, i) => <li key={i}><b>{letters[i]}</b>{o}</li>)}
      </ol>
      <details>
        <summary>Show the answer and explanation</summary>
        <p className="ans"><b>Answer: {letters[q.answer]}.</b> {q.options[q.answer]}</p>
        <p>{q.why}</p>
        {Object.keys(q.wrong).length > 0 && (
          <ul>
            {q.options.map((_, i) => (q.wrong[String(i)] ? <li key={i}><b>{letters[i]} is wrong:</b> {q.wrong[String(i)]}</li> : null))}
          </ul>
        )}
      </details>
    </article>
  );
}
