/* The coded watermark: a student's 8-character account ID written as a 10 × 10 grid of faint blocks that repeats
   across every question. A block is either shifted by 1 to 2 brightness levels out of 255 or left alone, which no
   eye can see at any zoom (zooming makes blocks bigger, not darker). Because the same grid repeats many times,
   decode() averages every repeat together, so the code survives JPEG compression and resizing where the hidden
   text does not.

   Grid: row 0 and column 0 are a fixed sync pattern for finding the grid's position and polarity. The other 81
   cells hold the 32-bit ID twice (read together, so a smudged cell in one copy is outvoted) and a 16-bit checksum
   (CRC-16/CCITT); one is spare. */

export const CELL = 16; // CSS px per block
export const GRID = 10;
export const TILE = CELL * GRID; // 160 CSS px

const SYNC_ROW = [1, 1, 1, 0, 1, 0, 0, 1, 1, 0];
const SYNC_COL = [1, 0, 0, 1, 1, 0, 1, 0, 1]; // rows 1 to 9 of column 0

/* The short ID used everywhere a student's mark appears: first 8 hex digits of the account ID. */
export const shortId = (userId: string) => userId.replace(/-/g, "").slice(0, 8).toUpperCase().padEnd(8, "0");

function crc16(bytes: number[]) {
  let c = 0xffff;
  for (const b of bytes) {
    c ^= b << 8;
    for (let i = 0; i < 8; i++) c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xffff : (c << 1) & 0xffff;
  }
  return c;
}

const idBytes = (id: string) => [0, 2, 4, 6].map((i) => parseInt(id.slice(i, i + 2), 16) || 0);
const toBits = (bytes: number[]) => bytes.flatMap((b) => [7, 6, 5, 4, 3, 2, 1, 0].map((k) => (b >> k) & 1));
const isSync = (i: number) => i < GRID || i % GRID === 0;

/* Data cells in order: ID copy one (32), checksum (16), ID copy two (32), spare. */
function payload(id: string) {
  const bytes = idBytes(id), crc = crc16(bytes);
  const idBits = toBits(bytes);
  return [...idBits, ...toBits([crc >> 8, crc & 0xff]), ...idBits, 0];
}

/* GRID × GRID cells, row-major: 1 = shifted block. */
export function encode(id: string): number[] {
  const data = payload(id);
  let d = 0;
  return Array.from({ length: GRID * GRID }, (_, i) => {
    const r = Math.floor(i / GRID), c = i % GRID;
    if (r === 0) return SYNC_ROW[c]!;
    if (c === 0) return SYNC_COL[r - 1]!;
    return data[d++]!;
  });
}

/* One tile as an SVG data URL, for a repeating CSS background. Shown with mix-blend-mode: difference, so on a light
   page the blocks are a touch darker and on a dark page a touch lighter. Dark pages need a little more opacity for
   the same shift (see .wm-code in app.css). */
export function tileUrl(id: string, opacity = 0.006) {
  const rects = encode(id).map((b, i) => (b ? `<rect x="${(i % GRID) * CELL}" y="${Math.floor(i / GRID) * CELL}" width="${CELL}" height="${CELL}"/>` : "")).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}" shape-rendering="crispEdges"><g fill="#fff" fill-opacity="${opacity}">${rects}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/* ---------- Decoding ---------- */

export type Residual = { r: Float32Array; ok: Uint8Array; w: number; h: number; scale: number };

/* Brightness per pixel from RGBA image data. */
export function luminance(d: Uint8ClampedArray, n: number) {
  const l = new Float32Array(n);
  for (let p = 0; p < n; p++) l[p] = 0.299 * d[p * 4]! + 0.587 * d[p * 4 + 1]! + 0.114 * d[p * 4 + 2]!;
  return l;
}

/* Keeps only the tiny differences in flat areas, which is where the mark lives; text, borders and photos are left
   out. On a light page the mark only ever darkens, so a pixel's background is the brightest flat pixel near it
   (on a dark page, the darkest). That holds right up to the edge of a card or a button, unlike an average. */
export function residual(full: Float32Array, fw: number, fh: number): Residual {
  // Big screenshots are averaged down to about 1400 px: faster, and the averaging smooths out JPEG noise.
  const k = Math.max(1, Math.ceil(Math.max(fw, fh) / 1400));
  const { lum, w, h } = shrink(full, fw, fh, k);
  let total = 0;
  for (let i = 0; i < lum.length; i++) total += lum[i]!;
  const dark = total / lum.length < 110;
  const ok = new Uint8Array(w * h);
  const flatOnly = new Float32Array(w * h).fill(dark ? 999 : -999);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x, v = lum[i]!;
      // A pixel next to a sharp change (text, an edge) can't tell us about a 1-level shift.
      let flat = true;
      for (const j of [i - 1, i + 1, i - w, i + w, i - w - 1, i - w + 1, i + w - 1, i + w + 1]) if (Math.abs(v - lum[j]!) >= 4) { flat = false; break; }
      if (flat) { ok[i] = 1; flatOnly[i] = v; }
    }
  }
  // Wide enough to always reach an unmarked block, at any likely screenshot scale.
  const span = Math.max(w, h);
  const r = Math.max(24, Math.round(span / 36));
  const bg = extreme(flatOnly, w, h, r, dark);
  const out = new Float32Array(w * h);
  for (let i = 0; i < ok.length; i++) {
    if (!ok[i]) continue;
    const d = lum[i]! - bg[i]!;
    if (Math.abs(d) < 6) out[i] = d; else ok[i] = 0;
  }
  // Only questions carry the mark. Leave out flat areas with no trace of it, or they water the signal down
  // unevenly (a cell near the edge of a question would look fainter than one in the middle).
  const R = Math.max(32, Math.round(span / 24));
  const trace = new Float32Array(w * h), flat = new Float32Array(w * h);
  for (let i = 0; i < ok.length; i++) if (ok[i]) { flat[i] = 1; if (Math.abs(out[i]!) >= 1) trace[i] = 1; }
  const tr = boxSum(trace, w, h, R), fl = boxSum(flat, w, h, R);
  for (let i = 0; i < ok.length; i++) if (ok[i] && tr[i]! < fl[i]! * 0.08) ok[i] = 0;
  return { r: out, ok, w, h, scale: k };
}

/* Average k × k blocks of pixels into one. */
function shrink(src: Float32Array, w: number, h: number, k: number) {
  if (k === 1) return { lum: src, w, h };
  const sw = Math.floor(w / k), sh = Math.floor(h / k), lum = new Float32Array(sw * sh);
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      let t = 0;
      for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) t += src[(y * k + dy) * w + x * k + dx]!;
      lum[y * sw + x] = t / (k * k);
    }
  }
  return { lum, w: sw, h: sh };
}

/* Sum over a (2r+1) square around each pixel. */
function boxSum(src: Float32Array, w: number, h: number, r: number) {
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    let s = 0;
    for (let x = 0; x <= Math.min(w - 1, r); x++) s += src[y * w + x]!;
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = s;
      if (x + r + 1 < w) s += src[y * w + x + r + 1]!;
      if (x - r >= 0) s -= src[y * w + x - r]!;
    }
  }
  for (let x = 0; x < w; x++) {
    let s = 0;
    for (let y = 0; y <= Math.min(h - 1, r); y++) s += tmp[y * w + x]!;
    for (let y = 0; y < h; y++) {
      out[y * w + x] = s;
      if (y + r + 1 < h) s += tmp[(y + r + 1) * w + x]!;
      if (y - r >= 0) s -= tmp[(y - r) * w + x]!;
    }
  }
  return out;
}

/* Max (or min) in a (2r+1) square around each pixel, by van Herk's method: constant time per pixel. */
function extreme(src: Float32Array, w: number, h: number, r: number, min: boolean) {
  const pick = min ? Math.min : Math.max;
  const run = (get: (i: number) => number, set: (i: number, v: number) => void, n: number) => {
    const k = 2 * r + 1, f = new Float32Array(n), g = new Float32Array(n);
    for (let i = 0; i < n; i++) f[i] = i % k === 0 ? get(i) : pick(f[i - 1]!, get(i));
    for (let i = n - 1; i >= 0; i--) g[i] = i === n - 1 || (i + 1) % k === 0 ? get(i) : pick(g[i + 1]!, get(i));
    for (let i = 0; i < n; i++) set(i, pick(g[Math.max(0, i - r)]!, f[Math.min(n - 1, i + r)]!));
  };
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) run((x) => src[y * w + x]!, (x, v) => { tmp[y * w + x] = v; }, w);
  for (let x = 0; x < w; x++) run((y) => tmp[y * w + x]!, (y, v) => { out[y * w + x] = v; }, h);
  return out;
}

const BINS = GRID * 8; // folded tile resolution, 8 bins per cell

/* Average every repeat of a tile of `period` pixels into one BINS × BINS tile, over columns x0 to x1.
   step > 1 samples every step-th pixel for speed. */
export function fold(res: Residual, period: number, step = 1, x0 = 0, x1 = res.w) {
  const sum = new Float64Array(BINS * BINS), n = new Float64Array(BINS * BINS);
  const k = BINS / period;
  for (let y = 0; y < res.h; y += step) {
    const by = Math.floor((y % period) * k) % BINS;
    const row = y * res.w;
    for (let x = x0; x < x1; x += step) {
      const i = row + x;
      if (!res.ok[i]) continue;
      const b = by * BINS + (Math.floor((x % period) * k) % BINS);
      sum[b] += res.r[i]!;
      n[b] += 1;
    }
  }
  const t = new Float64Array(BINS * BINS);
  for (let b = 0; b < t.length; b++) t[b] = n[b] ? sum[b]! / n[b]! : NaN;
  return { t, n };
}

/* How sure we are that `period` is the tile size: the left and right halves of the image, folded separately,
   should show the same pattern. Page content and compression noise don't repeat, so they don't agree. */
export function agreement(res: Residual, period: number) {
  const mid = Math.floor(res.w / 2);
  const a = fold(res, period, 2, 0, mid).t, b = fold(res, period, 2, mid, res.w).t;
  let sa = 0, sb = 0, n = 0;
  for (let i = 0; i < a.length; i++) if (!isNaN(a[i]!) && !isNaN(b[i]!)) { sa += a[i]!; sb += b[i]!; n++; }
  if (n < a.length * 0.5) return 0;
  const ma = sa / n, mb = sb / n;
  let ab = 0, aa = 0, bb = 0;
  for (let i = 0; i < a.length; i++) {
    if (isNaN(a[i]!) || isNaN(b[i]!)) continue;
    const x = a[i]! - ma, y = b[i]! - mb;
    ab += x * y; aa += x * x; bb += y * y;
  }
  return aa && bb ? ab / Math.sqrt(aa * bb) : 0;
}

/* Mean of the inner 4 × 4 bins of each cell, with the grid starting at bin (ox, oy). Empty bins are skipped. */
export function cellMeans(t: Float64Array, ox: number, oy: number) {
  const out: number[] = [];
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      let s = 0, n = 0;
      for (let dy = 2; dy < 6; dy++) {
        for (let dx = 2; dx < 6; dx++) {
          const v = t[((oy + r * 8 + dy) % BINS) * BINS + ((ox + c * 8 + dx) % BINS)]!;
          if (!isNaN(v)) { s += v; n++; }
        }
      }
      out.push(n ? s / n : 0);
    }
  }
  return out;
}

const SYNC = encode("00000000").map((b, i) => (isSync(i) ? b : null));

/* Read the ID from a folded tile. Finds the grid position from the sync cells, reads each ID bit from both of its
   copies against the midpoint of the sync cells, and accepts the result only if every sync cell reads right and
   the checksum matches. No guessing at bits: a wrong ID is worse than none. */
export function readGrid(t: Float64Array): { id: string; confidence: number } | null {
  const fits: { c: number; m: number[] }[] = [];
  for (let oy = 0; oy < BINS; oy++) {
    for (let ox = 0; ox < BINS; ox++) {
      const m = cellMeans(t, ox, oy);
      const mean = m.reduce((a, b) => a + b, 0) / m.length;
      let c = 0;
      SYNC.forEach((s, i) => { if (s !== null) c += (m[i]! - mean) * (s ? 1 : -1); });
      fits.push({ c, m });
    }
  }
  fits.sort((a, b) => Math.abs(b.c) - Math.abs(a.c));
  for (const { c, m } of fits.slice(0, 3)) {
    const v = m.map((x) => (c < 0 ? -x : x)); // make "block present" the high side, light page or dark
    let on = 0, off = 0, nOn = 0, nOff = 0;
    SYNC.forEach((s, i) => { if (s === 1) { on += v[i]!; nOn++; } else if (s === 0) { off += v[i]!; nOff++; } });
    const hi = on / nOn, lo = off / nOff, mid = (hi + lo) / 2;
    if (hi <= lo || !SYNC.every((s, i) => s === null || (v[i]! > mid ? 1 : 0) === s)) continue;
    const data = v.filter((_, i) => !isSync(i));
    const idBits = Array.from({ length: 32 }, (_, k) => (data[k]! + data[48 + k]! > 2 * mid ? 1 : 0));
    const crcBits = data.slice(32, 48).map((x) => (x > mid ? 1 : 0));
    const bytes: number[] = [...idBits, ...crcBits];
    const by = Array.from({ length: 6 }, (_, k) => bytes.slice(k * 8, k * 8 + 8).reduce((a, x) => (a << 1) | x, 0));
    if (crc16(by.slice(0, 4)) !== ((by[4]! << 8) | by[5]!)) continue;
    return { id: by.slice(0, 4).map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase(), confidence: hi - lo };
  }
  return null;
}

/* Find the tile size in the image (it depends on the device's pixel ratio and any resizing since), then read the ID.
   Ranks tile sizes from 48 to 640 pixels by how well the two halves of the image agree, then reads the best few,
   along with their halves, thirds and quarters (a pattern also repeats at 2, 3 and 4 times its size). */
export function decode(res: Residual): { id: string; tilePx: number; confidence: number } | null {
  const span = Math.max(res.w, res.h);
  const cands: { p: number; s: number }[] = [];
  for (let p = 48; p <= 640; p += Math.max(0.1, (p * p) / (24 * span))) cands.push({ p, s: agreement(res, p) });
  cands.sort((a, b) => b.s - a.s);
  const tried = new Set<number>();
  for (const c of cands.slice(0, 6)) {
    for (const k of [1, 2, 3, 4]) {
      const base = c.p / k;
      if (base < 48) break;
      const key = Math.round(base * 4);
      if (tried.has(key)) continue;
      tried.add(key);
      for (const d of [0, -0.2, 0.2, -0.4, 0.4]) {
        const p = base + d * (base / TILE);
        const got = readGrid(fold(res, p).t);
        if (got) return { ...got, tilePx: p * res.scale };
      }
    }
  }
  return null;
}
