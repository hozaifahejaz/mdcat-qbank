"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPhone } from "@/lib/auth";
import { site } from "@/lib/site";
import type { AccountUser } from "@/lib/user";
import { shortId, tileUrl } from "@/lib/watermark";

/* The student's mark on every question: phone (or email) and a short account ID, so a leaked screenshot traces back. */
export function markFor(user: AccountUser) {
  const who = user.phone ? formatPhone(user.phone) : user.email ?? "";
  return [who, `ID ${shortId(user.id)}`].filter(Boolean).join(" · ");
}

/* Two marks, both hidden from the eye. Each is white at well under 1% opacity, blended with "difference" (see .wm in
   app.css), so it moves the pixels it covers by about 1 brightness level out of 255, in light and dark mode alike.
   - Text: the phone number and ID, readable once /admin/reveal amplifies a clean screenshot.
   - Code: the ID as repeating blocks over the whole screen (lib/watermark.ts), which /admin/reveal decodes even after
     compression or resizing. */
function textTile(text: string) {
  const t = text.replace(/[<&>]/g, "");
  const line = (x: number, y: number) => `<text x="${x}" y="${y}">${t}</text>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="120"><g font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#fff" fill-opacity="0.005">${line(8, 38)}${line(-212, 98)}${line(228, 98)}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/* Question protection from the plan's anti-piracy section: an invisible watermark, no copy, cut, right-click or drag,
   questions blurred while the page is in the background, and a warning (never a strike) on PrintScreen. */
export default function Protected({ user, children }: { user: AccountUser; children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const [warned, setWarned] = useState(false);
  const text = useMemo(() => textTile(markFor(user)), [user]);
  const code = useMemo(() => ({ "--wm-light": tileUrl(shortId(user.id)), "--wm-dark": tileUrl(shortId(user.id), 0.01) }) as React.CSSProperties, [user]);

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
      <div className="wm" style={{ backgroundImage: text }} aria-hidden="true" />
      {/* The code covers the whole screen, not just the question: more repeats in a screenshot, sturdier decoding. */}
      <div className="wm-code" style={code} aria-hidden="true" />
      {hidden && (
        <div className="guard-cover">
          <p><b>Question hidden</b></p>
          <p className="muted">Questions are hidden while {site.name} isn&apos;t the window in front.</p>
          <button type="button" className="dpill dark small" onClick={() => setHidden(false)}>Show question</button>
        </div>
      )}
      {warned && (
        <div className="toast" role="alert">
          <span>Screenshots of questions aren&apos;t allowed.</span>
          <button type="button" className="link" onClick={() => setWarned(false)}>OK</button>
        </div>
      )}
    </div>
  );
}
