// Saves the diagram as it stands now as a PNG for slides: computed styles inlined, the page fonts
// embedded, the dialog canvas colour behind it. Loaded on demand by the dialog's save button, so
// nothing here runs at import time.
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

export async function savePng(svg, { background = '#110f1f', name = 'diagram', credit = 'kube.how' } = {}) {
  const vb = svg.viewBox.baseVal;
  const w = vb && vb.width ? vb.width : svg.clientWidth;
  const h = vb && vb.height ? vb.height : svg.clientHeight;
  const copy = inlineCopy(svg);
  copy.setAttribute('xmlns', SVG_NS);
  copy.setAttribute('width', w);
  copy.setAttribute('height', h);
  const style = document.createElementNS(SVG_NS, 'style');
  style.textContent = await fontFaces();
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
    await new Promise(r => requestAnimationFrame(r));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * SCALE);
    canvas.height = Math.round(h * SCALE);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  } finally {
    URL.revokeObjectURL(url);
  }
}
