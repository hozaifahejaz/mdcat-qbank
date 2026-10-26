"use client";

import { useState } from "react";
import { samples } from "@/lib/sample-questions";

const LETTERS = ["A", "B", "C", "D"];

/* The hero's live demo: one free question per subject, laid out like an OMR answer sheet. Filling a bubble marks it
   and opens the explanation. The faint watermark is the same one every bank question carries. */
export default function AnswerSheet() {
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const q = samples[at];
  const done = picked !== null;

  function show(i: number) {
    setAt(i);
    setPicked(null);
  }

  return (
    <div className="sheet" id="try">
      <div className="sheet-wm" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => <span key={i}>ID 4821-0937</span>)}
      </div>

      <div className="sheet-top">
        <span className="sheet-no">Q{String(at + 1).padStart(2, "0")}</span>
        <div className="sheet-tabs" role="tablist" aria-label="Subject">
          {samples.map((s, i) => (
            <button key={s.subject} type="button" role="tab" aria-selected={i === at} onClick={() => show(i)}>
              {s.subject}
            </button>
          ))}
        </div>
      </div>

      <p className="sheet-stem">{q.stem}</p>

      <div className="sheet-opts" role="radiogroup" aria-label="Answer">
        {q.options.map((o, i) => {
          const state = !done ? "" : i === q.answer ? " right" : i === picked ? " wrong" : " dim";
          return (
            <button key={o} type="button" role="radio" aria-checked={picked === i} className={"opt" + state} disabled={done} onClick={() => setPicked(i)}>
              <span className="bubble">{LETTERS[i]}</span>
              <span>{o}</span>
            </button>
          );
        })}
      </div>

      {done ? (
        <div className="sheet-why" aria-live="polite">
          <p className={"verdict " + (picked === q.answer ? "right" : "wrong")}>
            {picked === q.answer ? "Correct." : `The answer is ${LETTERS[q.answer]}.`}
          </p>
          <p>{q.why}</p>
          <ul>
            {Object.entries(q.wrong).map(([i, text]) => (
              <li key={i}><b>{LETTERS[+i]}</b>{text}</li>
            ))}
          </ul>
          <button type="button" className="sheet-next" onClick={() => show((at + 1) % samples.length)}>Next question →</button>
        </div>
      ) : (
        <p className="sheet-hint">Fill a bubble to see the explanation.</p>
      )}
    </div>
  );
}
