"use client";

import { useEffect, useState } from "react";

/* True on phones (the app's 760px breakpoint, where the tab bar replaces the sidebar), false on wider screens, and
   null until the browser has said which, so a screen can wait instead of flashing the wrong layout. */
export function useNarrow(query = "(max-width: 760px)") {
  const [narrow, setNarrow] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return narrow;
}
