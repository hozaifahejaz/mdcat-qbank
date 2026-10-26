"use client";

import { useEffect } from "react";

/* Sections rise in as they scroll into view. Anything already on screen stays put, and content is readable the whole time. */
export default function Reveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".rv"));
    els.forEach((el) => { if (el.getBoundingClientRect().top > innerHeight * 0.92) el.classList.add("wait"); });
    [".steps", ".plans"].forEach((s) => {
      document.querySelectorAll<HTMLElement>(s + " > .rv").forEach((el, i) => el.style.setProperty("--rd", i * 90 + "ms"));
    });
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.remove("wait"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.remove("wait"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
