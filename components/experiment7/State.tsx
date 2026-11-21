"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { TrackId } from "@/lib/catalogue";

/* The area the prices show on landing experiment 7. Tapping an area tile picks it and scrolls to the prices; the
   chips above the plans change it too. */

const Ctx = createContext<{ id: TrackId; setId: (id: TrackId) => void } | null>(null);

export function AreaProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<TrackId>("medical");
  return <Ctx.Provider value={{ id, setId }}>{children}</Ctx.Provider>;
}

export function useArea() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useArea outside AreaProvider");
  return c;
}

export const still = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
