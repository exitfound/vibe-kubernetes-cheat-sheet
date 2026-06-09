const SVG_NS = 'http://www.w3.org/2000/svg';

export function inspectMode() {
  try {
    const qs = new URLSearchParams(location.search);
    const v = qs.get('inspect');
    if (v === '1' || v === 'grid') return 'grid';
    if (v === 'expose') return 'expose';
  } catch (_) {}
  try {
    const v = localStorage.getItem('scheme:inspect');
    if (v === '1' || v === 'grid') return 'grid';
    if (v === 'expose') return 'expose';
  } catch (_) {}
  return false;
}

export function isInspectActive() {
  return inspectMode() !== false;
}

export function collectRefs(svg) {
  if (!svg) return [];
  const sel = [
    '[id]',
    '[data-ref]',
    'g.scheme-box',
    'g.scheme-pod',
    'g.scheme-node',
    'g.scheme-cylinder',
    '.scheme-label',
  ].join(',');
  const out = [];
  for (const el of svg.querySelectorAll(sel)) {
    let bb;
    try { bb = el.getBBox(); } catch (_) { continue; }
    if (!bb || (bb.width === 0 && bb.height === 0)) continue;

    let tx = 0, ty = 0;
    const tAttr = el.getAttribute('transform');
    if (tAttr) {
      const m = tAttr.match(/translate\(\s*(-?[\d.]+)\s*[, ]\s*(-?[\d.]+)\s*\)/);
      if (m) { tx = +m[1]; ty = +m[2]; }
    }
    const x = +(bb.x + tx).toFixed(1);
    const y = +(bb.y + ty).toFixed(1);
    const w = +bb.width.toFixed(1);
    const h = +bb.height.toFixed(1);

    out.push({
      tag: el.tagName,
      id: el.id || null,
      ref: el.dataset?.ref || null,
      cls: (el.getAttribute('class') || '').trim() || null,
      label: el.querySelector?.('.scheme-box-label, .scheme-pod-label, .scheme-node-label')?.textContent?.trim() || null,
      x, y, w, h,
      cx: +(x + w / 2).toFixed(1),
      cy: +(y + h / 2).toFixed(1),
    });
  }
  out.sort((a, b) => (a.y - b.y) || (a.x - b.x));
  return out;
}

export function dumpRefs(svg) {
  const rows = collectRefs(svg);
  try { console.table(rows.map(r => ({
    label: r.label || r.id || r.ref || r.cls?.split(' ')[0] || r.tag,
    x: r.x, y: r.y, w: r.w, h: r.h, cx: r.cx, cy: r.cy,
  }))); } catch (_) {}
  return rows;
}

export function renderGrid(svg, { step = 50, refs = null } = {}) {
  if (!svg) return null;
  const old = svg.querySelector(':scope > g.inspector-overlay');
  if (old) old.remove();

  const vb = (svg.getAttribute('viewBox') || '0 0 1200 620').split(/\s+/).map(Number);
  const [vx, vy, vw, vh] = vb;

  const overlay = document.createElementNS(SVG_NS, 'g');
  overlay.setAttribute('class', 'inspector-overlay');
  overlay.setAttribute('pointer-events', 'none');

  const minor = document.createElementNS(SVG_NS, 'g');
  minor.setAttribute('stroke', 'rgba(255,255,255,0.06)');
  minor.setAttribute('stroke-width', '1');
  for (let x = Math.ceil(vx / step) * step; x <= vx + vw; x += step) {
    const ln = document.createElementNS(SVG_NS, 'line');
    ln.setAttribute('x1', x); ln.setAttribute('x2', x);
    ln.setAttribute('y1', vy); ln.setAttribute('y2', vy + vh);
    minor.appendChild(ln);
  }
  for (let y = Math.ceil(vy / step) * step; y <= vy + vh; y += step) {
    const ln = document.createElementNS(SVG_NS, 'line');
    ln.setAttribute('y1', y); ln.setAttribute('y2', y);
    ln.setAttribute('x1', vx); ln.setAttribute('x2', vx + vw);
    minor.appendChild(ln);
  }
  overlay.appendChild(minor);

  const major = document.createElementNS(SVG_NS, 'g');
  major.setAttribute('stroke', 'rgba(255,255,255,0.18)');
  major.setAttribute('stroke-width', '1');
  for (let x = Math.ceil(vx / (step * 2)) * (step * 2); x <= vx + vw; x += step * 2) {
    const ln = document.createElementNS(SVG_NS, 'line');
    ln.setAttribute('x1', x); ln.setAttribute('x2', x);
    ln.setAttribute('y1', vy); ln.setAttribute('y2', vy + vh);
    major.appendChild(ln);
  }
  for (let y = Math.ceil(vy / (step * 2)) * (step * 2); y <= vy + vh; y += step * 2) {
    const ln = document.createElementNS(SVG_NS, 'line');
    ln.setAttribute('y1', y); ln.setAttribute('y2', y);
    ln.setAttribute('x1', vx); ln.setAttribute('x2', vx + vw);
    major.appendChild(ln);
  }
  overlay.appendChild(major);

  const labels = document.createElementNS(SVG_NS, 'g');
  labels.setAttribute('fill', 'rgba(255,255,255,0.55)');
  labels.setAttribute('font-family', 'JetBrains Mono, monospace');
  labels.setAttribute('font-size', '10');
  for (let x = Math.ceil(vx / (step * 2)) * (step * 2); x <= vx + vw; x += step * 2) {
    const t = document.createElementNS(SVG_NS, 'text');
    t.setAttribute('x', x + 2); t.setAttribute('y', vy + 10);
    t.textContent = String(x);
    labels.appendChild(t);
  }
  for (let y = Math.ceil(vy / (step * 2)) * (step * 2); y <= vy + vh; y += step * 2) {
    const t = document.createElementNS(SVG_NS, 'text');
    t.setAttribute('x', vx + 2); t.setAttribute('y', y - 2);
    t.textContent = String(y);
    labels.appendChild(t);
  }
  overlay.appendChild(labels);

  const cross = document.createElementNS(SVG_NS, 'g');
  cross.setAttribute('stroke', 'rgba(255,120,180,0.9)');
  cross.setAttribute('stroke-width', '1');
  cross.setAttribute('fill', 'rgba(255,120,180,0.9)');
  const rows = refs || collectRefs(svg);
  for (const r of rows) {
    const ln1 = document.createElementNS(SVG_NS, 'line');
    ln1.setAttribute('x1', r.cx - 4); ln1.setAttribute('x2', r.cx + 4);
    ln1.setAttribute('y1', r.cy);     ln1.setAttribute('y2', r.cy);
    cross.appendChild(ln1);
    const ln2 = document.createElementNS(SVG_NS, 'line');
    ln2.setAttribute('x1', r.cx); ln2.setAttribute('x2', r.cx);
    ln2.setAttribute('y1', r.cy - 4); ln2.setAttribute('y2', r.cy + 4);
    cross.appendChild(ln2);
    const dot = document.createElementNS(SVG_NS, 'circle');
    dot.setAttribute('cx', r.cx); dot.setAttribute('cy', r.cy);
    dot.setAttribute('r', '1.2');
    cross.appendChild(dot);
  }
  overlay.appendChild(cross);

  svg.appendChild(overlay);
  return overlay;
}

export function removeGrid(svg) {
  if (!svg) return;
  const old = svg.querySelector(':scope > g.inspector-overlay');
  if (old) old.remove();
}

export function attachInspector(dialog) {
  if (!dialog) return () => {};
  const canvas = dialog.querySelector('.dialog-canvas');
  if (!canvas) return () => {};
  const mode = inspectMode();

  let svg = canvas.querySelector('svg.diagram');
  let observer = null;
  const onSvg = (s) => {
    svg = s;
    if (mode === 'grid') renderGrid(svg);
    publishApi(dialog, svg);
  };

  if (svg) {
    onSvg(svg);
  } else {
    observer = new MutationObserver(() => {
      const found = canvas.querySelector('svg.diagram');
      if (found && found !== svg) onSvg(found);
    });
    observer.observe(canvas, { childList: true, subtree: true });
  }

  // Re-render grid when SVG content swaps (Scene.reset rebuilds it).
  const innerObserver = new MutationObserver(() => {
    const found = canvas.querySelector('svg.diagram');
    if (found && found !== svg) onSvg(found);
  });
  innerObserver.observe(canvas, { childList: true });

  return () => {
    try { observer && observer.disconnect(); } catch (_) {}
    try { innerObserver.disconnect(); } catch (_) {}
    if (svg) removeGrid(svg);
    if (window.SCHEME_INSPECT?.dialog === dialog) delete window.SCHEME_INSPECT;
  };
}

function publishApi(dialog, svg) {
  window.SCHEME_INSPECT = {
    dialog,
    svg,
    dump: () => dumpRefs(svg),
    grid: (opts) => renderGrid(svg, opts || {}),
    off:  () => removeGrid(svg),
  };
  // Quiet hint so console users notice the API is live.
  try { console.info('[inspect] window.SCHEME_INSPECT ready. .dump() .grid({step:25}) .off()'); } catch (_) {}
}
