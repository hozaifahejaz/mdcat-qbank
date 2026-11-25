"use client";

import { useState } from "react";
import { script } from "@/lib/format";
import type { PublicQuestion } from "@/lib/public";
import { rich } from "@/lib/rich";

const letters = ["A", "B", "C", "D"];

/* One question from the exam's bank, answered in place: pick an option and the right one lights up, with the
   explanation and why the picked one is wrong. The whole text is in the page for search engines either way. */
export default function TryQuestion({ q, tag }: { q: PublicQuestion; tag: string }) {
  const [picked, setPicked] = useState<number | null>(null);
  const done = picked !== null;
  return (
    <div className="xe-try x3-card">
      <p className="xe-tag">{tag}</p>
      <h3 {...script(q.stem)}>{rich(q.stem)}</h3>
      <ol className="xe-opts">
        {q.options.map((o, i) => {
          const state = !done ? "" : i === q.answer ? "right" : i === picked ? "wrong" : "dim";
          return (
            <li key={i}>
              <button type="button" className={state} disabled={done} onClick={() => setPicked(i)} aria-pressed={picked === i}>
                <b>{letters[i]}</b><span {...script(o)}>{rich(o)}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {done ? (
        <div className="xe-why" role="status">
          <p className="xe-verdict">{picked === q.answer ? "Correct." : `Not quite. The answer is ${letters[q.answer]}.`}</p>
          <p {...script(q.why)}>{rich(q.why)}</p>
          {picked !== q.answer && q.wrong[String(picked)] && <p className="xe-mute"><b>{letters[picked!]} is wrong:</b> {rich(q.wrong[String(picked)])}</p>}
          <button type="button" className="xe-again" onClick={() => setPicked(null)}>Try again</button>
        </div>
      ) : (
        <p className="xe-mute xe-hint">Pick an answer to see the explanation.</p>
      )}
    </div>
  );
}
