"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPhone } from "@/lib/auth";
import { site } from "@/lib/site";
import type { AccountUser } from "@/lib/user";

/* The student's mark on every question: phone (or email) and a short account ID, so a leaked screenshot traces back. */
export function markFor(user: AccountUser) {
  const who = user.phone ? formatPhone(user.phone) : user.email ?? "";
  return [who, `ID ${user.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`].filter(Boolean).join(" · ");
}

/* The watermark is hidden from the eye: white text at about 1% opacity, blended with "difference" (see .wm in app.css),
   moves each pixel it covers by about 2 brightness levels out of 255, in light and dark mode alike. A screenshot keeps
   those levels, and /admin/reveal brings the text back out. Straight lines of text so it reads cleanly once revealed. */
function tile(text: string) {
  const t = text.replace(/[<&>]/g, "");
  const line = (x: number, y: number) => `<text x="${x}" y="${y}">${t}</text>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="120"><g font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#fff" fill-opacity="0.008">${line(8, 38)}${line(-212, 98)}${line(228, 98)}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/* Question protection from the plan's anti-piracy section: an invisible watermark, no copy, cut, right-click or drag,
   questions blurred while the page is in the background, and a warning (never a strike) on PrintScreen. */
export default function Protected({ user, children }: { user: AccountUser; children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const [warned, setWarned] = useState(false);
  const bg = useMemo(() => tile(markFor(user)), [user]);

  useEffect(() => {
    const hide = () => setHidden(true);
    const vis = () => { if (document.visibilityState !== "visible") setHidden(true); };
    const key = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        setWarned(true);
        navigator.clipboard?.writeText("").catch(() => {});
      }
    };
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("keyup", key);
    return () => {
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", vis);
      window.removeEventListener("keyup", key);
    };
  }, []);

  const block = (e: React.SyntheticEvent) => e.preventDefault();

  return (
    <div className="guard" onCopy={block} onCut={block} onContextMenu={block} onDragStart={block}>
      <div className={`guard-body${hidden ? " hidden" : ""}`} aria-hidden={hidden || undefined}>{children}</div>
      <div className="wm" style={{ backgroundImage: bg }} aria-hidden="true" />
      {hidden && (
        <div className="guard-cover">
          <p><b>Question hidden</b></p>
          <p className="muted">Questions are hidden while {site.name} isn&apos;t the window in front.</p>
          <button type="button" className="dpill dark small" onClick={() => setHidden(false)}>Show question</button>
        </div>
      )}
      {warned && (
        <div className="toast" role="alert">
          <span>Screenshots of questions aren&apos;t allowed. Every question carries your account ID.</span>
          <button type="button" className="link" onClick={() => setWarned(false)}>OK</button>
        </div>
      )}
    </div>
  );
}
