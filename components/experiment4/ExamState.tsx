"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { allExams } from "@/lib/catalogue";

/* The exam the visitor is preparing for, shared by every section of experiment 4 so the whole page speaks to that one
   exam. Until the visitor chooses, the hero turns through a few exams (the tour) while the rest of the page shows
   PMDC MDCAT; once they scroll past the hero without choosing, the tour stops on MDCAT so the page agrees with itself.
   Any part of the page can ask for the picker to open with openPicker(). */

const tour = ["mdcat", "ecat", "fcps1", "css", "lat", "alevel", "hat", "sat"];
const KEY = "x4-exam";
const FALLBACK = "mdcat";
export const still = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

type AnyExam = (typeof allExams)[number];
type State = {
  exam: AnyExam;        // what the hero shows (moves during the tour)
  chosen: AnyExam;      // what the rest of the page follows
  touched: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  choose: (id: string) => void;
  openPicker: () => void;
  stopTour: () => void;
};

const Ctx = createContext<State | null>(null);
const find = (id: string) => allExams.find((e) => e.id === id) ?? allExams[0];
const toTop = () => document.getElementById("top")?.scrollIntoView({ behavior: still() ? "auto" : "smooth" });

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const [id, setId] = useState(FALLBACK);
  const [touched, setTouched] = useState(false);
  const [settled, setSettled] = useState(false);
  const [open, setOpen] = useState(false);

  const choose = useCallback((next: string) => {
    setId(next);
    setTouched(true);
    setOpen(false);
    try { localStorage.setItem(KEY, next); } catch {}
  }, []);

  const openPicker = useCallback(() => {
    setTouched(true);
    toTop();
    setTimeout(() => setOpen(true), still() ? 0 : 450);
  }, []);

  const stopTour = useCallback(() => { setSettled(true); setId((cur) => (touched ? cur : FALLBACK)); }, [touched]);

  // A returning visitor sees the exam they picked last time.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && allExams.some((e) => e.id === saved)) { setId(saved); setTouched(true); }
    } catch {}
  }, []);

  // The tour, until the visitor touches anything or scrolls on.
  useEffect(() => {
    if (touched || settled || open || still()) return;
    const t = setTimeout(() => setId(tour[(tour.indexOf(id) + 1) % tour.length]), 2600);
    return () => clearTimeout(t);
  }, [id, touched, settled, open]);

  // Scrolling past the hero without choosing ends the tour on MDCAT.
  useEffect(() => {
    if (touched || settled) return;
    const onScroll = () => { if (window.scrollY > window.innerHeight * 0.6) stopTour(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [touched, settled, stopTour]);

  const exam = find(id);
  const chosen = touched || settled ? exam : find(FALLBACK);
  return (
    <Ctx.Provider value={{ exam, chosen, touched, open, setOpen, choose, openPicker, stopTour }}>
      {children}
    </Ctx.Provider>
  );
}

export function useExam() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useExam outside ExamProvider");
  return v;
}

export function ChangeExam({ children = "Change exam", className = "x4-link" }: { children?: React.ReactNode; className?: string }) {
  const { openPicker } = useExam();
  return <button type="button" className={className} onClick={openPicker}>{children}</button>;
}
