"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { TrackId } from "@/lib/catalogue";
import { AREAS, type Area } from "./areas";

/* Which area (peak) the visitor is looking at on landing experiment 7. The map in the hero sets it; the route, the
   prices and the FAQ below all follow it. */

type Ctx = { area: Area; pick: (id: TrackId, byHand?: boolean) => void; touched: boolean };
const AreaCtx = createContext<Ctx | null>(null);

export function AreaProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<TrackId>("medical");
  const [touched, setTouched] = useState(false);
  const area = AREAS.find((a) => a.id === id)!;
  const pick = useCallback((next: TrackId, byHand = true) => { setId(next); if (byHand) setTouched(true); }, []);
  // The page wears the area's colour, so every accent glides to the new one when the area changes.
  return (
    <AreaCtx.Provider value={{ area, pick, touched }}>
      <div className="x7" id="top" style={{ ["--c" as string]: area.colour }}>{children}</div>
    </AreaCtx.Provider>
  );
}

export function useArea() {
  const c = useContext(AreaCtx);
  if (!c) throw new Error("useArea outside AreaProvider");
  return c;
}
