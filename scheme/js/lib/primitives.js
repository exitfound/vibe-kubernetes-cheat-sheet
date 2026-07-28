import { g, rect, circle, ellipse, path, text, defs, marker } from './svg.js';

export function arrowDefs() {
  const mk = (id, fill) => marker(
    { id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' },
    [path({ d: 'M 0 0 L 10 5 L 0 10 z', fill })],
  );
  return defs([
    mk('arrowhead',     'var(--diag-arrow)'),
    mk('arrowhead-dim', 'var(--diag-arrow-dim)'),
    mk('arrowhead-net',     'var(--network-color)'),
    mk('arrowhead-storage', 'var(--storage-color)'),
    mk('arrowhead-cluster', 'var(--cluster-color)'),
  ]);
}

export function box({ x = 0, y = 0, w = 100, h = 60, rx = 6, label = '', sublabel = '', cls = '', role = '' } = {}) {
  const group = g({ class: ('scheme-box ' + cls).trim(), 'data-role': role || null, transform: `translate(${x},${y})` });
  group.appendChild(rect({ class: 'scheme-box-rect', x: 0, y: 0, width: w, height: h, rx, ry: rx }));
  if (label) {
    const ly = sublabel ? h / 2 - 2 : h / 2 + 5;
    group.appendChild(text({ class: 'scheme-box-label', x: w / 2, y: ly, 'text-anchor': 'middle' }, [label]));
  }
  if (sublabel) {
    group.appendChild(text({ class: 'scheme-box-sublabel', x: w / 2, y: h / 2 + 14, 'text-anchor': 'middle' }, [sublabel]));
  }
  return group;
}

export function pod({ x, y, w = 92, h = 60, label = 'Pod', sublabel = '', containers = 1, role = 'workloads' } = {}) {
  const group = g({ class: 'scheme-pod', 'data-role': role, transform: `translate(${x},${y})` });
  group.appendChild(rect({ class: 'scheme-pod-rect', x: 0, y: 0, width: w, height: h, rx: 8, ry: 8 }));
  group.appendChild(text({ class: 'scheme-pod-label', x: w / 2, y: 16, 'text-anchor': 'middle' }, [label]));
  if (sublabel) {
    group.appendChild(text({ class: 'scheme-pod-sublabel', x: w / 2, y: h - 8, 'text-anchor': 'middle' }, [sublabel]));
  }
  const cw = 16, ch = 12, gap = 4;
  const totalW = containers * cw + Math.max(0, containers - 1) * gap;
  const startX = (w - totalW) / 2;
  for (let i = 0; i < containers; i++) {
    group.appendChild(rect({ class: 'scheme-pod-container', x: startX + i * (cw + gap), y: 24, width: cw, height: ch, rx: 2 }));
  }
  return group;
}

export function node({ x, y, w = 320, h = 200, label = 'node-1', cls = '' } = {}) {
  const group = g({ class: ('scheme-node ' + cls).trim(), transform: `translate(${x},${y})` });
  group.appendChild(rect({ class: 'scheme-node-rect', x: 0, y: 0, width: w, height: h, rx: 10 }));
  group.appendChild(text({ class: 'scheme-node-label', x: 12, y: 18 }, [label]));
  return group;
}

export function cylinder({ x, y, w = 80, h = 60, label = '', role = 'storage', cls = '' } = {}) {
  const group = g({ class: ('scheme-cylinder ' + cls).trim(), 'data-role': role, transform: `translate(${x},${y})` });
  const ry = 8;
  group.appendChild(path({
    class: 'scheme-cylinder-body',
    d: `M 0 ${ry} A ${w / 2} ${ry} 0 0 1 ${w} ${ry} L ${w} ${h - ry} A ${w / 2} ${ry} 0 0 1 0 ${h - ry} Z`,
  }));
  group.appendChild(ellipse({ class: 'scheme-cylinder-cap', cx: w / 2, cy: ry, rx: w / 2, ry }));
  if (label) {
    group.appendChild(text({ class: 'scheme-cylinder-label', x: w / 2, y: h / 2 + 5, 'text-anchor': 'middle' }, [label]));
  }
  return group;
}

// role OUTRANKS dim on the marker, deliberately, and diagrams.css says the same about the stroke.
// Why that is not the bug it looks like: docs/INTERNALS.md#schemecssdiagramscss (2026-07-29).
export function arrow({ x1, y1, x2, y2, dashed = false, dim = false, role = '', cls = '' } = {}) {
  const dashAttr = dashed ? '5 5' : null;
  let markerId = dim ? 'arrowhead-dim' : 'arrowhead';
  if (role === 'network')  markerId = 'arrowhead-net';
  if (role === 'storage')  markerId = 'arrowhead-storage';
  if (role === 'cluster')  markerId = 'arrowhead-cluster';
  const klass = ['scheme-arrow', dashed && 'scheme-arrow-dashed', dim && 'scheme-arrow-dim', role && `scheme-arrow-${role}`, cls].filter(Boolean).join(' ');
  return path({
    class: klass,
    'data-role': role || null,
    d: `M ${x1} ${y1} L ${x2} ${y2}`,
    'stroke-dasharray': dashAttr,
    'marker-end': `url(#${markerId})`,
    fill: 'none',
  });
}

// Same precedence as `arrow()` above, same reason.
export function pathArrow({ points = [], dashed = false, dim = false, role = '', cls = '' } = {}) {
  if (!points || points.length < 2) return null;
  const dashAttr = dashed ? '5 5' : null;
  let markerId = dim ? 'arrowhead-dim' : 'arrowhead';
  if (role === 'network')  markerId = 'arrowhead-net';
  if (role === 'storage')  markerId = 'arrowhead-storage';
  if (role === 'cluster')  markerId = 'arrowhead-cluster';
  const klass = ['scheme-arrow', dashed && 'scheme-arrow-dashed', dim && 'scheme-arrow-dim', role && `scheme-arrow-${role}`, cls].filter(Boolean).join(' ');
  const d = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
  return path({
    class: klass,
    'data-role': role || null,
    d,
    'stroke-dasharray': dashAttr,
    'marker-end': `url(#${markerId})`,
    fill: 'none',
    'stroke-linejoin': 'miter',
  });
}

export function packet({ x, y, r = 5, role = 'network', cls = '' } = {}) {
  const c = circle({
    class: ('scheme-packet ' + cls).trim(),
    'data-role': role,
    cx: 0, cy: 0, r,
  });
  c.style.transform = `translate(${x}px, ${y}px)`;
  return c;
}

export function chip({ x, y, w = 90, h = 22, label: txt = '', role = '', cls = '' } = {}) {
  const group = g({ class: ('scheme-chip ' + cls).trim(), 'data-role': role || null, transform: `translate(${x},${y})` });
  group.appendChild(rect({ class: 'scheme-chip-rect', x: 0, y: 0, width: w, height: h, rx: 4 }));
  group.appendChild(text({ class: 'scheme-chip-text', x: w / 2, y: h / 2 + 4, 'text-anchor': 'middle' }, [txt]));
  return group;
}

export function chainList({ x = 0, y = 0, w = 220, rowH = 24, gap = 4, items = [], activeIdx = -1, role = '', cls = '' } = {}) {
  const group = g({ class: ('scheme-chain ' + cls).trim(), 'data-role': role || null, transform: `translate(${x},${y})` });
  items.forEach((item, i) => {
    const row = g({
      class: 'scheme-chip' + (i === activeIdx ? ' highlight' : ''),
      'data-role': role || null,
      'data-idx': i,
      transform: `translate(0, ${i * (rowH + gap)})`,
    });
    row.appendChild(rect({ class: 'scheme-chip-rect', x: 0, y: 0, width: w, height: rowH, rx: 4 }));
    row.appendChild(text({ class: 'scheme-chip-text', x: 10, y: rowH / 2 + 4, 'text-anchor': 'start' }, [String(item)]));
    group.appendChild(row);
  });
  return group;
}

export function setChainActive(chainEl, idx) {
  if (!chainEl) return;
  chainEl.querySelectorAll('.scheme-chip').forEach(row => {
    row.classList.toggle('highlight', Number(row.getAttribute('data-idx')) === idx);
  });
}

export function animateAlong(packetEl, points, options = {}) {
  if (!points || points.length < 2) return null;
  const duration = options.duration || 1500;
  const iterations = options.iterations || 1;
  const easing = options.easing || 'ease-in-out';
  const fill = options.fill || 'forwards';
  const delay = options.delay || 0;
  const lengths = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const d = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    lengths.push(d);
    total += d;
  }
  if (total === 0) return null;
  let acc = 0;
  const keyframes = points.map((p, i) => {
    if (i > 0) acc += lengths[i - 1];
    return { offset: Math.min(1, acc / total), transform: `translate(${p[0]}px, ${p[1]}px)` };
  });
  return packetEl.animate(keyframes, { duration, iterations, easing, fill, delay });
}

export function fadeIn(elNode, options = {}) {
  return elNode.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: options.duration || 400, fill: 'forwards', easing: 'ease-out' },
  );
}
