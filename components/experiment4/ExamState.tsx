"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { tracks, type TrackId } from "@/lib/catalogue";
import { trackPages } from "@/lib/track-pages";

/* The area (track) the visitor is preparing for, shared by every section of experiment 4 so the whole page speaks to
   that area. Until the visitor chooses, the hero turns through the areas (the tour) while the rest of the page shows
   pre-medical; once they scroll past the hero without choosing, the tour stops on pre-medical so the page agrees with
   itself. Any part of the page can ask for the picker to open with openPicker(). */

const KEY = "x4-track";
const FALLBACK: TrackId = "medical";
export const still = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

const find = (id: string) => tracks.find((t) => t.id === id) ?? tracks[0];
// The experiment shows every area as open (Huzaifa 2026-11-21: "make it like everything is done").
const withPage = (id: string) => { const t = find(id); return { ...t, page: trackPages[t.id] }; };
export type Area = ReturnType<typeof withPage>;

type State = {
  shown: Area;      // what the hero shows (moves during the tour)
  area: Area;       // what the rest of the page follows
  touched: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  choose: (id: TrackId) => void;
  openPicker: () => void;
};

const Ctx = createContext<State | null>(null);
const toTop = () => document.getElementById("top")?.scrollIntoView({ behavior: still() ? "auto" : "smooth" });

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const [id, setId] = useState<string>(FALLBACK);
  const [touched, setTouched] = useState(false);
  const [settled, setSettled] = useState(false);
  const [open, setOpen] = useState(false);

  const choose = useCallback((next: TrackId) => {
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

  // A returning visitor sees the area they picked last time.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && tracks.some((t) => t.id === saved)) { setId(saved); setTouched(true); }
    } catch {}
  }, []);

  // The tour, until the visitor touches anything or scrolls on.
  useEffect(() => {
    if (touched || settled || open || still()) return;
    const t = setTimeout(() => setId(tracks[(tracks.findIndex((x) => x.id === id) + 1) % tracks.length].id), 2400);
    return () => clearTimeout(t);
  }, [id, touched, settled, open]);

  // Scrolling past the hero without choosing ends the tour on pre-medical.
  useEffect(() => {
    if (touched || settled) return;
    const onScroll = () => { if (window.scrollY > window.innerHeight * 0.6) { setSettled(true); setId(FALLBACK); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [touched, settled]);

  const shown = withPage(id);
  const area = touched || settled ? shown : withPage(FALLBACK);
  return <Ctx.Provider value={{ shown, area, touched, open, setOpen, choose, openPicker }}>{children}</Ctx.Provider>;
}

export function useArea() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useArea outside ExamProvider");
  return v;
}

export function ChangeArea({ children = "Change", className = "x4-link" }: { children?: React.ReactNode; className?: string }) {
  const { openPicker } = useArea();
  return <button type="button" className={className} onClick={openPicker}>{children}</button>;
}
