"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

/* /admin/reveal — bring out the hidden watermark in a leaked screenshot. The mark shifts pixels by only 2 or 3
   brightness levels, so: blur a copy to get the local background, subtract it, and amplify what's left.
   Everything runs in the browser; the image is never uploaded. A photo of a screen or a heavily compressed
   image (WhatsApp, Instagram) can lose the mark. */
export default function RevealScreen() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [gain, setGain] = useState(40);
  const out = useRef<HTMLCanvasElement>(null);

  function load(file?: File) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => setImg(im);
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
    const lum = (d: Uint8ClampedArray) => {
      const l = new Float32Array(w * h);
      for (let p = 0; p < l.length; p++) l[p] = 0.299 * d[p * 4]! + 0.587 * d[p * 4 + 1]! + 0.114 * d[p * 4 + 2]!;
      return l;
    };
    const a = lum(src.data), b = lum(bg.data);
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
