"use client";

import { useEffect, useRef, useState } from "react";
import AppShell from "@/components/app/AppShell";
import Empty from "@/components/app/Empty";
import TestPlayer from "@/components/test/TestPlayer";
import { ApiError } from "@/lib/api";
import { friendlyError } from "@/lib/auth";
import { type OpenAttempt, getOpenAttempt, readTestHref, startTest } from "@/lib/study";

type State =
  | { kind: "loading" }
  | { kind: "ready"; attempt: OpenAttempt; note: string }
  | { kind: "problem"; title: string; text: string; pass: boolean };

/* /test?id=… sits or resumes a saved test. /test?kind=practice|timed|mock|mini-mock|past-paper plus what to ask
   (subject, chapters, topic, count, from, ids, mock, paper, title) starts one on the server first, then swaps the
   address for its id, so a refresh or another device picks up the same test. */
export default function TestScreen() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const once = useRef(false);

  useEffect(() => {
    // Starting a test writes to the server, so it must run once even when React mounts twice in development.
    if (once.current) return;
    once.current = true;
    (async () => {
      const params = new URLSearchParams(window.location.search);
      let id = params.get("id");
      let note = "";
      try {
        if (!id) {
          const started = await startTest(readTestHref(window.location.search));
          id = started.id;
          if (started.short) note = `Only ${started.count} question${started.count === 1 ? "" : "s"} match what you picked, so this set has ${started.count}.`;
          window.history.replaceState(null, "", `/test?id=${encodeURIComponent(id)}`);
        }
        const a = await getOpenAttempt(id);
        if ("finished" in a) return window.location.replace(`/review?id=${encodeURIComponent(a.id)}`);
        if (!a.items.length) return setState({ kind: "problem", title: "These questions were taken down", text: "They're being fixed after a report. Start a new set from Practice.", pass: false });
        setState({ kind: "ready", attempt: a, note });
      } catch (e) {
        const code = e instanceof ApiError ? e.code : "";
        setState({
          kind: "problem",
          title: code === "needs_pass" ? "This needs a pass" : code === "empty" || code === "not_ready" ? "Questions coming soon" : code === "not_found" ? "We couldn't find that test" : "This test didn't open",
          text: friendlyError(e),
          pass: code === "needs_pass",
        });
      }
    })();
  }, []);

  if (state.kind === "problem") {
    return (
      <AppShell title="Test">
        {() => (
          <div className="dgrid narrow">
            <section className="dcard panel">
              <Empty title={state.title} text={state.text}>
                <div className="hello-ctas">
                  {state.pass && <a className="dpill dark small" href="/pricing">See passes</a>}
                  <a className={`dpill ${state.pass ? "light" : "dark"} small`} href="/dashboard">Back to dashboard</a>
                </div>
              </Empty>
            </section>
          </div>
        )}
      </AppShell>
    );
  }
  return <AppShell bare>{(user) => state.kind === "ready" && <TestPlayer user={user} attempt={state.attempt} note={state.note} />}</AppShell>;
}
