"use client";

import { useState } from "react";
import { script } from "@/lib/format";
import type { PublicQuestion } from "@/lib/public";
import { rich } from "@/lib/rich";

const letters = ["A", "B", "C", "D"];

/* One question from the exam's bank, set out like the real thing: the question paper on the left and an answer sheet
   on the right, where the student fills a bubble (or taps the option itself). The sheet then marks it, and the
   explanation opens under both. The whole text is in the page for search engines either way. */
export default function TryQuestion({ q, tag, exam }: { q: PublicQuestion; tag: string; exam: string }) {
  const [picked, setPicked] = useState<number | null>(null);
  const done = picked !== null;
  const state = (i: number) => (!done ? "" : i === q.answer ? "right" : i === picked ? "wrong" : "dim");

  return (
    <div className="xe-sheet">
      <div className="xe-qpaper x3-card">
        <p className="xe-tag"><span>Q 1</span>{tag}</p>
        <h3 {...script(q.stem)}>{rich(q.stem)}</h3>
        <ol className="xe-opts">
          {q.options.map((o, i) => (
            <li key={i}>
              <button type="button" className={state(i)} disabled={done} onClick={() => setPicked(i)}>
                <b>{letters[i]}</b><span {...script(o)}>{rich(o)}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="xe-omr" aria-label="Answer sheet">
        <p className="xe-omr-head"><span>{exam}</span><span>Answer sheet</span></p>
        <div className="xe-omr-row">
          <small>1</small>
          {letters.map((l, i) => (
            <button key={l} type="button" className={`xe-bubble ${state(i)}${picked === i ? " filled" : ""}`} disabled={done} onClick={() => setPicked(i)} aria-label={`Fill ${l}`}>
              {l}
            </button>
          ))}
        </div>
        {[2, 3, 4].map((n) => (
          <div key={n} className="xe-omr-row ghost" aria-hidden="true">
            <small>{n}</small>{letters.map((l) => <span key={l} className="xe-bubble">{l}</span>)}
          </div>
        ))}
        <p className="xe-omr-foot">{done ? "Marked. See why below." : "Fill one bubble"}</p>
      </div>

      {done && (
        <div className="xe-why x3-card" role="status">
          <p className="xe-verdict">{picked === q.answer ? "Correct." : `Not quite. The answer is ${letters[q.answer]}.`}</p>
          <p {...script(q.why)}>{rich(q.why)}</p>
          {picked !== q.answer && q.wrong[String(picked)] && <p className="xe-mute"><b>{letters[picked!]} is wrong:</b> {rich(q.wrong[String(picked)])}</p>}
          <button type="button" className="xe-again" onClick={() => setPicked(null)}>Try again</button>
        </div>
      )}
    </div>
  );
}
