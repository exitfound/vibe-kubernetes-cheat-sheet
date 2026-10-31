// A GIF89a encoder for the dialog's animation save: one palette for the whole file, built by median
// cut over every pixel the recording saw, and frames written as the rectangle that changed, with
// the pixels that did not change left transparent. Loaded on demand with export.js.
const TRANSPARENT = 255;   // palette slot 255 is never a colour, so every frame can see through it

// Colours are counted in RGB555, 32 levels a channel: the diagrams sit on one dark canvas with a
// handful of tints, and five bits a channel keep the glows smooth at a fraction of the work.
export const rgb555 = (r, g, b) => ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);

// Median cut over the histogram. Boxes split by pixel count first, then by count times volume, so
// the background does not take every slot and a small bright packet still gets its own colour.
function buildPalette(hist, size) {
  const used = [];
  for (let c = 0; c < hist.length; c++) if (hist[c]) used.push(c);
  const box = (cols) => {
    const lo = [31, 31, 31], hi = [0, 0, 0];
    let count = 0;
    for (const c of cols) {
      const ch = [c >> 10, (c >> 5) & 31, c & 31];
      for (let k = 0; k < 3; k++) { if (ch[k] < lo[k]) lo[k] = ch[k]; if (ch[k] > hi[k]) hi[k] = ch[k]; }
      count += hist[c];
    }
    const vol = (hi[0] - lo[0] + 1) * (hi[1] - lo[1] + 1) * (hi[2] - lo[2] + 1);
    return { cols, lo, hi, count, vol };
  };
  const boxes = [box(used)];
  while (boxes.length < size) {
    const byVolume = boxes.length >= size / 2;
    let pick = -1, best = 0;
    boxes.forEach((b, i) => {
      if (b.cols.length < 2) return;
      const score = byVolume ? b.count * b.vol : b.count;
      if (score > best) { best = score; pick = i; }
    });
    if (pick < 0) break;
    const b = boxes[pick];
    const span = [0, 1, 2].map(k => b.hi[k] - b.lo[k]);
    const axis = span.indexOf(Math.max(...span));
    const shift = [10, 5, 0][axis];
    b.cols.sort((x, y) => ((x >> shift) & 31) - ((y >> shift) & 31));
    let acc = 0, cut = 1;
    for (let i = 0; i < b.cols.length - 1; i++) {
      acc += hist[b.cols[i]];
      if (acc >= b.count / 2) { cut = i + 1; break; }
    }
    boxes.splice(pick, 1, box(b.cols.slice(0, cut)), box(b.cols.slice(cut)));
  }
  return boxes.map(b => {
    let r = 0, g = 0, bl = 0;
    for (const c of b.cols) {
      const n = hist[c];
      r += (c >> 10) * n; g += ((c >> 5) & 31) * n; bl += (c & 31) * n;
    }
    const to8 = (v) => Math.round((v / b.count) * 255 / 31);
    return [to8(r), to8(g), to8(bl)];
  });
}

// Every used RGB555 value to its nearest palette slot.
function buildLookup(hist, palette) {
  const lut = new Uint8Array(32768);
  for (let c = 0; c < 32768; c++) {
    if (!hist[c]) continue;
    const r = ((c >> 10) * 255) / 31, g = (((c >> 5) & 31) * 255) / 31, b = ((c & 31) * 255) / 31;
    let best = 0, bestD = Infinity;
    for (let i = 0; i < palette.length; i++) {
      const p = palette[i];
      const d = (p[0] - r) ** 2 + (p[1] - g) ** 2 + (p[2] - b) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    }
    lut[c] = best;
  }
  return lut;
}

class Bytes {
  constructor() { this.buf = new Uint8Array(1 << 20); this.n = 0; }
  room(k) {
    if (this.n + k <= this.buf.length) return;
    const next = new Uint8Array(Math.max(this.buf.length * 2, this.n + k));
    next.set(this.buf);
    this.buf = next;
  }
  byte(b) { this.room(1); this.buf[this.n++] = b; }
  word(w) { this.byte(w & 255); this.byte((w >> 8) & 255); }
  bytes(arr) { this.room(arr.length); this.buf.set(arr, this.n); this.n += arr.length; }
  view() { return this.buf.subarray(0, this.n); }
}

// LZW with an 8-bit minimum code size, the code table reset at 4096 entries. The code-size bump
// sits BEFORE the new entry is added, one code later than the encoder's own table would suggest,
// because a decoder adds each entry one code behind the encoder.
const child = new Int16Array(4096 * 256);
function lzw(indices, out) {
  const CLEAR = 256, EOI = 257;
  const data = new Bytes();
  let size = 9, next = 258, cur = 0, bits = 0;
  const emit = (code) => {
    cur |= code << bits;
    bits += size;
    while (bits >= 8) { data.byte(cur & 255); cur >>>= 8; bits -= 8; }
  };
  child.fill(-1);
  emit(CLEAR);
  let prefix = indices[0];
  for (let i = 1; i < indices.length; i++) {
    const k = indices[i];
    const key = prefix * 256 + k;
    const c = child[key];
    if (c !== -1) { prefix = c; continue; }
    emit(prefix);
    if (next === 4096) {
      emit(CLEAR);
      child.fill(-1);
      size = 9;
      next = 258;
    } else {
      if (next >= (1 << size)) size++;
      child[key] = next++;
    }
    prefix = k;
  }
  emit(prefix);
  emit(EOI);
  if (bits > 0) data.byte(cur & 255);
  out.byte(8);
  const v = data.view();
  for (let i = 0; i < v.length; i += 255) {
    const len = Math.min(255, v.length - i);
    out.byte(len);
    out.bytes(v.subarray(i, i + len));
  }
  out.byte(0);
}

// `frames`: [{ x, y, w, h, px: Uint16Array of RGB555, ms }], the first one the whole picture,
// `hist`: the RGB555 counts over all of them. Returns the file as a Blob.
export function encodeGif(width, height, frames, hist) {
  const palette = buildPalette(hist, 255);
  const lut = buildLookup(hist, palette);
  const out = new Bytes();
  out.bytes([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
  out.word(width); out.word(height);
  out.byte(0xf7); out.byte(0); out.byte(0);
  for (let i = 0; i < 256; i++) out.bytes(palette[i] || [0, 0, 0]);
  // NETSCAPE2.0: loop forever.
  out.bytes([0x21, 0xff, 0x0b, ...'NETSCAPE2.0'.split('').map(c => c.charCodeAt(0)), 0x03, 0x01, 0x00, 0x00, 0x00]);

  const screen = new Uint8Array(width * height).fill(TRANSPARENT);
  let pending = null;   // a frame is written once the next one says how long it stays
  const write = (f) => {
    out.bytes([0x21, 0xf9, 0x04, 0x05]);
    out.word(Math.max(2, Math.round(f.ms / 10)));
    out.bytes([TRANSPARENT, 0x00, 0x2c]);
    out.word(f.x); out.word(f.y); out.word(f.w); out.word(f.h);
    out.byte(0);
    lzw(f.idx, out);
  };
  for (const f of frames) {
    // Indices, transparent where the screen already shows that slot, then the rectangle trimmed to
    // what is left. A frame that changes nothing after quantising only lengthens the one before.
    const idx = new Uint8Array(f.w * f.h);
    let x0 = f.w, y0 = f.h, x1 = -1, y1 = -1;
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < f.w; x++) {
        const i = y * f.w + x;
        const s = (f.y + y) * width + f.x + x;
        const v = lut[f.px[i]];
        if (screen[s] === v) { idx[i] = TRANSPARENT; continue; }
        screen[s] = v;
        idx[i] = v;
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    if (x1 < 0) {
      if (pending) pending.ms += f.ms;
      else pending = { x: 0, y: 0, w: 1, h: 1, idx: new Uint8Array([TRANSPARENT]), ms: f.ms };
      continue;
    }
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    const crop = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) crop.set(idx.subarray((y0 + y) * f.w + x0, (y0 + y) * f.w + x0 + w), y * w);
    if (pending) write(pending);
    pending = { x: f.x + x0, y: f.y + y0, w, h, idx: crop, ms: f.ms };
  }
  if (pending) write(pending);
  out.byte(0x3b);
  return new Blob([out.view()], { type: 'image/gif' });
}
