"use client";

import { useState } from "react";
import { samples } from "@/lib/sample-questions";

const LETTERS = ["A", "B", "C", "D"];

/* One free sample question per subject, answered in place, on the dark "try it" band. */
export default function TryIt() {
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const q = samples[at];
  const done = picked !== null;

  return (
    <div className="bx-tryit">
      <div className="tabs" role="tablist" aria-label="Subject">
        {samples.map((s, i) => (
          <button key={s.subject} type="button" role="tab" aria-selected={i === at} onClick={() => { setAt(i); setPicked(null); }}>
            {s.subject}
          </button>
        ))}
      </div>
      <span className="tag">{q.tag}</span>
      <p className="stem">{q.stem}</p>
      <div className="opts">
        {q.options.map((o, i) => {
          const state = !done ? "" : i === q.answer ? " good" : i === picked ? " bad" : " dim";
          return (
            <button key={o} type="button" className={`opt${state}`} disabled={done} onClick={() => setPicked(i)}>
              <b>{LETTERS[i]}</b>{o}
            </button>
          );
        })}
      </div>
      {done && (
        <div className="why" aria-live="polite">
          <b>{picked === q.answer ? "Correct." : `Answer: ${LETTERS[q.answer]}.`}</b> {q.why}
          <button type="button" className="again" onClick={() => setPicked(null)}>Try again</button>
        </div>
      )}
    </div>
  );
}
