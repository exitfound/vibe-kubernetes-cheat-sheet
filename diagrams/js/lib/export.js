// Saves the diagram as a PNG of the frame it stands on, or as a GIF of every step played through:
// computed styles inlined, the page fonts embedded, the dialog canvas colour behind it. Loaded on
// demand by the dialog's save buttons, so nothing here runs at import time.
import { encodeGif, rgb555 } from './gif.js';
import { playedHold } from './tokens.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const SCALE = 2;
const PROPS = [
  'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-dasharray',
  'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'visibility', 'display',
  'font-family', 'font-size', 'font-weight', 'font-style', 'letter-spacing', 'text-anchor',
  'dominant-baseline', 'transform', 'transform-origin', 'transform-box', 'filter', 'color',
];

const toBase64 = (buf) => {
  let s = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};

// The latin faces of the page's Google Fonts, as data URLs. An SVG drawn into a canvas cannot load
// fonts from the network, and without them every label falls back to a system face.
async function loadFontFaces() {
  const link = document.querySelector('link[href*="fonts.googleapis.com/css2"]');
  if (!link) return '';
  try {
    const css = await (await fetch(link.href)).text();
    const faces = css.split('@font-face').slice(1)
      .map(b => '@font-face' + b.slice(0, b.indexOf('}') + 1))
      .filter(b => /unicode-range:[^;]*U\+0000-00FF/i.test(b));
    const out = await Promise.all(faces.map(async (face) => {
      const url = (face.match(/url\(([^)]+)\)/) || [])[1];
      if (!url) return '';
      const buf = await (await fetch(url)).arrayBuffer();
      return face.replace(url, `data:font/woff2;base64,${toBase64(buf)}`);
    }));
    return out.join('\n');
  } catch (_) {
    return '';
  }
}

// Fetched and encoded once per page: every later save reuses it. A failed load is not kept, so the
// next save tries again.
let fontCache = null;
function fontFaces() {
  if (!fontCache) fontCache = loadFontFaces().then(css => { if (!css) fontCache = null; return css; });
  return fontCache;
}

// A detached copy of the diagram with every element's live computed style written inline, so a
// value mid-animation, a tint variable and a class rule all survive the trip out of the page.
function inlineCopy(svg) {
  const copy = svg.cloneNode(true);
  const src = [svg, ...svg.querySelectorAll('*')];
  const dst = [copy, ...copy.querySelectorAll('*')];
  src.forEach((el, i) => {
    const cs = getComputedStyle(el);
    const out = dst[i];
    out.removeAttribute('class');
    out.setAttribute('style', PROPS.map(p => `${p}:${cs.getPropertyValue(p)}`).join(';'));
  });
  return copy;
}

// The diagram's own size, in viewBox units.
function sizeOf(svg) {
  const vb = svg.viewBox.baseVal;
  return {
    vb,
    w: vb && vb.width ? vb.width : svg.clientWidth,
    h: vb && vb.height ? vb.height : svg.clientHeight,
  };
}

// The diagram as it stands, drawn on `canvas` over the background, scaled to the canvas size.
async function paint(svg, canvas, { background, credit, fonts, settle = true }) {
  const { vb, w, h } = sizeOf(svg);
  const copy = inlineCopy(svg);
  copy.setAttribute('xmlns', SVG_NS);
  copy.setAttribute('width', w);
  copy.setAttribute('height', h);
  const style = document.createElementNS(SVG_NS, 'style');
  style.textContent = fonts;
  copy.insertBefore(style, copy.firstChild);
  if (credit) {
    const t = document.createElementNS(SVG_NS, 'text');
    // Top left: the narration panel corner, which no diagram puts content in.
    t.setAttribute('x', (vb ? vb.x : 0) + 14);
    t.setAttribute('y', (vb ? vb.y : 0) + 22);
    t.setAttribute('style', "font-family:'JetBrains Mono',monospace;font-size:11px;fill:rgba(236,233,255,0.45)");
    t.textContent = credit;
    copy.appendChild(t);
  }

  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    // One more frame before the draw: decode() is not specified to wait for the @font-face rules
    // inside an SVG image. Chromium applies them by decode, the frame guards an engine that does not.
    if (settle) await new Promise(r => requestAnimationFrame(r));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function download(blob, file) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = file;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function savePng(svg, { background = '#110f1f', name = 'diagram', credit = 'kube.how' } = {}) {
  const { w, h } = sizeOf(svg);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * SCALE);
  canvas.height = Math.round(h * SCALE);
  await paint(svg, canvas, { background, credit, fonts: await fontFaces() });
  download(await new Promise(r => canvas.toBlob(r, 'image/png')), `${name}.png`);
}

// GIF delays count hundredths of a second: 60 ms is 6 of them, about 17 frames a second.
const FRAME_MS = 60;
const POSTER_MS = 700;   // the dialog's poster dwell before the first step plays

// The card played once through at 1x on a hidden copy in `root`, steps as long as the dialog holds
// them. Time is SET: every animation is paused and seeked, and a finish callback runs when a seek
// passes its end. A stretch where nothing moves costs one frame. False when `cancelled()` turns true.
export async function saveGif(tl, root, { background = '#110f1f', name = 'diagram', credit = 'kube.how', onProgress = () => {}, cancelled = () => false } = {}) {
  const fonts = await fontFaces();
  const svgNow = () => root.querySelector('svg.diagram');
  const { w, h } = sizeOf(svgNow());
  const W = Math.round(w), H = Math.round(h);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  // The first getContext fixes the options: every frame is read back, so the canvas stays in memory.
  canvas.getContext('2d', { willReadFrequently: true });

  const born = new Map();      // animation -> the virtual time it appeared
  const keyed = new Map();     // animation -> whether it has keyframes (an at() timer has none)
  const fired = new Set();
  let registered = [];
  const ctx = { reduced: false, speed: 1, register: (a) => { if (a) registered.push(a); return a; } };

  const adopt = (now) => {
    for (const a of document.getAnimations()) {
      if (born.has(a)) continue;
      const tgt = a.effect && a.effect.target;
      if (!tgt || !root.contains(tgt)) continue;
      try { a.pause(); } catch (_) {}
      born.set(a, now);
      keyed.set(a, a.effect.getKeyframes().length > 0);
    }
  };
  // Seek everything to `now`, then run the finish callbacks the seek passed. A callback can start
  // new animations, so the pass repeats until none fires. Returns whether any did.
  const seek = (now) => {
    let any = false;
    for (let pass = 0; pass < 50; pass++) {
      adopt(now);
      let again = false;
      for (const [a, t0] of born) {
        if (a.playState === 'idle') continue;
        const local = now - t0;
        try { a.currentTime = local; } catch (_) {}
        if (a.onfinish && !fired.has(a) && local >= a.effect.getComputedTiming().endTime) {
          fired.add(a);
          const fn = a.onfinish;
          a.onfinish = null;
          try { fn.call(a); } catch (e) { console.error('GIF finish callback:', e); }
          again = true;
        }
      }
      if (!again) break;
      any = true;
    }
    return any;
  };
  // Whether anything drawn is between its delay and its end: an at() timer draws nothing.
  const moving = () => {
    for (const a of born.keys()) {
      if (a.playState === 'idle' || !keyed.get(a)) continue;
      const { delay, activeDuration } = a.effect.getComputedTiming();
      if (a.currentTime >= delay && a.currentTime < delay + activeDuration) return true;
    }
    return false;
  };

  const frames = [];
  const hist = new Uint32Array(32768);
  let prev = null;
  const capture = async (now) => {
    await paint(svgNow(), canvas, { background, credit, fonts, settle: !prev });
    const cur = new Uint32Array(canvas.getContext('2d').getImageData(0, 0, W, H).data.buffer);
    let x0 = 0, y0 = 0, x1 = W - 1, y1 = H - 1;
    if (prev) {
      x0 = W; y0 = H; x1 = -1; y1 = -1;
      for (let y = 0; y < H; y++) {
        const row = y * W;
        for (let x = 0; x < W; x++) {
          if (cur[row + x] === prev[row + x]) continue;
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
      if (x1 < 0) return;
    }
    const fw = x1 - x0 + 1, fh = y1 - y0 + 1;
    const px = new Uint16Array(fw * fh);
    for (let y = 0; y < fh; y++) {
      for (let x = 0; x < fw; x++) {
        const v = cur[(y0 + y) * W + x0 + x];
        const c = rgb555(v & 255, (v >> 8) & 255, (v >> 16) & 255);
        px[y * fw + x] = c;
        hist[c]++;
      }
    }
    frames.push({ x: x0, y: y0, w: fw, h: fh, px, t: now });
    prev = cur;
  };

  const steps = tl.steps;
  const first = tl.posterFirst ? 1 : 0;
  tl._rebuild(first);
  let now = 0;
  if (tl.posterFirst) {
    seek(0);
    await capture(0);
    now = POSTER_MS;
  }
  for (let i = first; i < steps.length; i++) {
    // Between steps the dialog cancels what the last step registered, and nothing else.
    for (const a of registered) { try { a.cancel(); } catch (_) {} }
    registered = [];
    const start = now;
    try { steps[i].enter && steps[i].enter(tl.scene, ctx); } catch (e) { console.error('GIF step enter:', e); }
    adopt(start);
    let motionEnd = 0;
    for (const a of registered) {
      const t = a.effect && a.effect.getTiming();
      if (!t || !isFinite(t.iterations)) continue;
      const end = (t.delay || 0) + (Number(t.duration) || 0) * (t.iterations || 1) + (t.endDelay || 0);
      if (end > motionEnd) motionEnd = end;
    }
    const dur = Math.max(playedHold(steps[i].duration, motionEnd, tl._narrationOf(steps[i]).length), motionEnd + 60);
    let was = true;
    for (let t = 0; t < dur; t += FRAME_MS) {
      if (cancelled()) return false;
      now = start + t;
      const fired = seek(now);
      const is = moving();
      // A stretch that just stopped moving still needs the frame it stopped on.
      if (t === 0 || fired || is || was) await capture(now);
      was = is;
      onProgress((i - first + t / dur) / (steps.length - first));
    }
    now = start + dur;
  }
  if (cancelled()) return false;
  frames.forEach((f, i) => { f.ms = (i + 1 < frames.length ? frames[i + 1].t : now) - f.t; });
  download(encodeGif(W, H, frames, hist), `${name}.gif`);
  return true;
}
