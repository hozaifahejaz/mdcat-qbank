"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { decode, luminance, residual } from "@/lib/watermark";

/* /admin/reveal — read the hidden marks in a leaked screenshot (see components/test/Protected.tsx).
   1. Decode the block code: the account ID, even after compression or resizing.
   2. Show the hidden text: blur a copy to get the local background, subtract it, and amplify what's left.
   Everything runs in the browser; the image is never uploaded. A photo of a screen can lose both marks. */
export default function RevealScreen() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [gain, setGain] = useState(40);
  const [found, setFound] = useState<null | "reading" | "none" | { id: string; confidence: number }>(null);
  const out = useRef<HTMLCanvasElement>(null);

  function load(file?: File) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => { setImg(im); setFound("reading"); };
    im.src = url;
  }

  useEffect(() => {
    const c = out.current;
    if (!img || !c) return;
    const w = img.naturalWidth, h = img.naturalHeight;
    c.width = w; c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.filter = "none";
    ctx.drawImage(img, 0, 0);
    const src = ctx.getImageData(0, 0, w, h);
    ctx.filter = "blur(3px)";
    ctx.drawImage(img, 0, 0);
    const bg = ctx.getImageData(0, 0, w, h);
    ctx.filter = "none";
    const a = luminance(src.data, w * h), b = luminance(bg.data, w * h);
    const busy = edges(a, w, h);
    const o = ctx.createImageData(w, h);
    for (let p = 0; p < a.length; p++) {
      // Near real content (letters, borders) the background estimate is off, so grey it out and let the mark stand alone.
      const v = busy[p] ? 128 : 128 + (a[p]! - b[p]!) * gain;
      o.data[p * 4] = o.data[p * 4 + 1] = o.data[p * 4 + 2] = v;
      o.data[p * 4 + 3] = 255;
    }
    ctx.putImageData(o, 0, 0);
  }, [img, gain]);

  useEffect(() => {
    if (!img) return;
    // Let "Reading…" paint first; decoding a large screenshot takes a second or two.
    const t = setTimeout(() => {
      const w = img.naturalWidth, h = img.naturalHeight;
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);
      const got = decode(residual(luminance(ctx.getImageData(0, 0, w, h).data, w * h), w, h));
      setFound(got ? { id: got.id, confidence: got.confidence } : "none");
    }, 50);
    return () => clearTimeout(t);
  }, [img]);

  return (
    <div className="dash admin">
      <header className="dnav-wrap">
        <div className="dwrap wide">
          <div className="dnav">
            <span className="admin-brand"><Logo href="/admin" /><span className="badge">Admin</span></span>
            <div className="dnav-end"><a className="dpill light small" href="/admin">Question review</a><ThemeToggle /></div>
          </div>
        </div>
      </header>
      <main className="dwrap wide">
        <div className="dgrid">
          <section className="hello page-head">
            <div>
              <h1>Reveal watermark</h1>
              <p className="muted">Drop in a leaked screenshot to read the account ID hidden in it.</p>
            </div>
          </section>
          <section className="dcard panel">
            <label className="fld upload" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); load(e.dataTransfer.files[0]); }}>
              <span>Screenshot</span>
              <input type="file" accept="image/*" onChange={(e) => load(e.target.files?.[0])} />
              <span className="drop">{img ? "Choose another image" : "Choose or drop an image"}</span>
            </label>
            {found && (
              <div className={found === "reading" ? "note-chip" : found === "none" ? "note-warn" : "note-good"} role="status">
                {found === "reading" ? "Reading the code…"
                  : found === "none" ? "No code found. The image may be a photo of a screen or cropped to less than a question; check the text below."
                  : <>Account ID <b className="mono">{found.id}</b> · checksum matches</>}
              </div>
            )}
            {img && <p className="muted small">Below: the hidden phone number and ID as text. It only shows on clean screenshots, not compressed ones.</p>}
            {img && (
              <label className="fld">
                <span>Strength</span>
                <input type="range" min={10} max={90} value={gain} onChange={(e) => setGain(Number(e.target.value))} />
              </label>
            )}
            <canvas ref={out} className="reveal-out" hidden={!img} aria-label="Screenshot with the watermark brought out" />
          </section>
        </div>
      </main>
    </div>
  );
}

/* Marks pixels within 9px of real content: anywhere the brightness range in that window is more than the mark could make. */
function edges(l: Float32Array, w: number, h: number) {
  const r = 9, limit = 8;
  const hi = new Float32Array(l.length), lo = new Float32Array(l.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let mx = -1, mn = 256;
      for (let k = Math.max(0, x - r); k <= Math.min(w - 1, x + r); k++) { const v = l[y * w + k]!; if (v > mx) mx = v; if (v < mn) mn = v; }
      hi[y * w + x] = mx; lo[y * w + x] = mn;
    }
  }
  const out = new Uint8Array(l.length);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let mx = -1, mn = 256;
      for (let k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++) { const i = k * w + x; if (hi[i]! > mx) mx = hi[i]!; if (lo[i]! < mn) mn = lo[i]!; }
      out[y * w + x] = mx - mn > limit ? 1 : 0;
    }
  }
  return out;
}

