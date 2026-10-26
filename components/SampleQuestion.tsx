"use client";

import { useState } from "react";
import { samples } from "@/lib/sample-questions";

const LETTERS = ["A", "B", "C", "D"];

/* The hero's "try a question" card: one free question per subject, answered in place, with the full explanation
   and the reason each wrong option is wrong. The faint watermark is the same one every bank question carries. */
export default function SampleQuestion() {
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const q = samples[at];
  const done = picked !== null;
  const right = picked === q.answer;

  function choose(i: number) {
    setAt(i);
    setPicked(null);
  }

  return (
    <div className="card app" id="try" aria-label="Try a sample question">
      <div className="app-head">
        <h2>Try a question</h2>
      </div>

      <div className="app-in">
        <div className="seg" role="radiogroup" aria-label="Subject">
          {samples.map((s, i) => (
            <button key={s.subject} type="button" role="radio" aria-checked={i === at} onClick={() => choose(i)}>
              {s.subject}
            </button>
          ))}
        </div>

        <div className="qbox">
          <div className="wm" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => <span key={i}>ID 4821-0937</span>)}
          </div>
          <p className="qtag">{q.subject} · {q.tag}</p>
          <p className="stem">{q.stem}</p>
          <div className="opts">
            {q.options.map((o, i) => {
              const state = !done ? "" : i === q.answer ? " is-right" : i === picked ? " is-wrong" : " is-dim";
              return (
                <button key={o} type="button" className={"opt" + state} disabled={done} onClick={() => setPicked(i)}>
                  <b>{LETTERS[i]}</b>
                  <span>{o}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="res" aria-live="polite">
        {!done ? (
          <>
            <div className="res-top"><strong>Pick an answer</strong></div>
            <ul className="ticks-list">
              <li>Why the answer is right</li>
              <li>Why each wrong option is wrong</li>
              <li>Its chapter and topic on the PMDC syllabus</li>
            </ul>
          </>
        ) : (
          <>
            <div className={"verdict " + (right ? "ok" : "no")}>
              {right ? "Correct." : `Not quite. The answer is ${LETTERS[q.answer]}.`}
            </div>
            <div className="why">
              <h3 className="rows-h">Why {LETTERS[q.answer]} is right</h3>
              <p>{q.why}</p>
            </div>
            <div className="why">
              <h3 className="rows-h">Why not the others</h3>
              <ul className="wrong">
                {Object.entries(q.wrong).map(([i, text]) => (
                  <li key={i}><b>{LETTERS[+i]}</b><span>{text}</span></li>
                ))}
              </ul>
            </div>
            <div className="res-foot">
              <button type="button" className="pill pill-light small" onClick={() => choose((at + 1) % samples.length)}>
                Next question
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
