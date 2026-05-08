import { el, g, rect, circle, ellipse, path, text, defs, marker } from './svg.js';

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
    mk('arrowhead-control', 'var(--control-color)'),
  ]);
}

export function box({ x = 0, y = 0, w = 100, h = 60, rx = 6, label = '', sublabel = '', cls = '', cat = '' } = {}) {
  const group = g({ class: ('scheme-box ' + cls).trim(), 'data-cat': cat || null, transform: `translate(${x},${y})` });
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

export function pod({ x, y, w = 92, h = 60, label = 'Pod', sublabel = '', containers = 1, cat = 'workloads' } = {}) {
  const group = g({ class: 'scheme-pod', 'data-cat': cat, transform: `translate(${x},${y})` });
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

export function cylinder({ x, y, w = 80, h = 60, label = '', cat = 'storage', cls = '' } = {}) {
  const group = g({ class: ('scheme-cylinder ' + cls).trim(), 'data-cat': cat, transform: `translate(${x},${y})` });
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

export function arrow({ x1, y1, x2, y2, dashed = false, dim = false, color = '', cls = '' } = {}) {
  const dashAttr = dashed ? '5 5' : null;
  let markerId = dim ? 'arrowhead-dim' : 'arrowhead';
  if (color === 'network')  markerId = 'arrowhead-net';
  if (color === 'storage')  markerId = 'arrowhead-storage';
  if (color === 'control')  markerId = 'arrowhead-control';
  const klass = ['scheme-arrow', dashed && 'scheme-arrow-dashed', dim && 'scheme-arrow-dim', color && `scheme-arrow-${color}`, cls].filter(Boolean).join(' ');
  return path({
    class: klass,
    d: `M ${x1} ${y1} L ${x2} ${y2}`,
    'stroke-dasharray': dashAttr,
    'marker-end': `url(#${markerId})`,
    fill: 'none',
  });
}

export function pathArrow({ points = [], dashed = false, dim = false, color = '', cls = '' } = {}) {
  if (!points || points.length < 2) return null;
  const dashAttr = dashed ? '5 5' : null;
  let markerId = dim ? 'arrowhead-dim' : 'arrowhead';
  if (color === 'network')  markerId = 'arrowhead-net';
  if (color === 'storage')  markerId = 'arrowhead-storage';
  if (color === 'control')  markerId = 'arrowhead-control';
  const klass = ['scheme-arrow', dashed && 'scheme-arrow-dashed', dim && 'scheme-arrow-dim', color && `scheme-arrow-${color}`, cls].filter(Boolean).join(' ');
  const d = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
  return path({
    class: klass,
    d,
    'stroke-dasharray': dashAttr,
    'marker-end': `url(#${markerId})`,
    fill: 'none',
    'stroke-linejoin': 'miter',
  });
}

export function curveArrow({ x1, y1, x2, y2, curve = 0.25, dashed = false, dim = false, color = '', cls = '' } = {}) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const off = len * curve;
  const cx = mx + nx * off, cy = my + ny * off;
  const dashAttr = dashed ? '5 5' : null;
  let markerId = dim ? 'arrowhead-dim' : 'arrowhead';
  if (color === 'network')  markerId = 'arrowhead-net';
  if (color === 'storage')  markerId = 'arrowhead-storage';
  if (color === 'control')  markerId = 'arrowhead-control';
  const klass = ['scheme-arrow', dashed && 'scheme-arrow-dashed', dim && 'scheme-arrow-dim', color && `scheme-arrow-${color}`, cls].filter(Boolean).join(' ');
  return path({
    class: klass,
    d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,
    'stroke-dasharray': dashAttr,
    'marker-end': `url(#${markerId})`,
    fill: 'none',
  });
}

export function packet({ x, y, r = 5, cat = 'network', cls = '' } = {}) {
  const c = circle({
    class: ('scheme-packet ' + cls).trim(),
    'data-cat': cat,
    cx: 0, cy: 0, r,
  });
  c.style.transform = `translate(${x}px, ${y}px)`;
  return c;
}

export function label({ x, y, text: txt, anchor = 'middle', cls = '' } = {}) {
  return text({ class: ('scheme-label ' + cls).trim(), x, y, 'text-anchor': anchor }, [txt]);
}

export function chip({ x, y, w = 90, h = 22, label: txt = '', cat = '', cls = '' } = {}) {
  const group = g({ class: ('scheme-chip ' + cls).trim(), 'data-cat': cat || null, transform: `translate(${x},${y})` });
  group.appendChild(rect({ class: 'scheme-chip-rect', x: 0, y: 0, width: w, height: h, rx: 4 }));
  group.appendChild(text({ class: 'scheme-chip-text', x: w / 2, y: h / 2 + 4, 'text-anchor': 'middle' }, [txt]));
  return group;
}

export function chainList({ x = 0, y = 0, w = 220, rowH = 24, gap = 4, items = [], activeIdx = -1, cat = '', cls = '' } = {}) {
  const group = g({ class: ('scheme-chain ' + cls).trim(), 'data-cat': cat || null, transform: `translate(${x},${y})` });
  items.forEach((item, i) => {
    const row = g({
      class: 'scheme-chip' + (i === activeIdx ? ' highlight' : ''),
      'data-cat': cat || null,
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

export function stateNode({ id = '', label = '', x = 0, y = 0, w = 140, h = 60, cat = 'lifecycle', cls = '' } = {}) {
  const grp = g({ class: ('scheme-state ' + cls).trim(), 'data-cat': cat || null, 'data-state-id': id, transform: `translate(${x},${y})` });
  grp.appendChild(rect({ class: 'scheme-box-rect', x: 0, y: 0, width: w, height: h, rx: 10, ry: 10 }));
  grp.appendChild(text({ class: 'scheme-box-label', x: w / 2, y: h / 2 + 5, 'text-anchor': 'middle' }, [label]));
  return grp;
}

export function setActiveState(scope, id) {
  if (!scope) return;
  scope.querySelectorAll('.scheme-state').forEach(n => {
    n.classList.toggle('highlight', n.getAttribute('data-state-id') === id);
  });
}

export function queueLane({ x = 0, y = 0, slotW = 36, slotH = 36, gap = 6, items = [], cat = 'workloads', cls = '' } = {}) {
  const grp = g({ class: ('scheme-queue ' + cls).trim(), 'data-cat': cat || null, transform: `translate(${x},${y})` });
  items.forEach((item, i) => {
    const slot = g({
      class: 'scheme-queue-slot scheme-chip',
      'data-cat': cat || null,
      'data-idx': i,
      'data-state': item || 'queued',
      transform: `translate(${i * (slotW + gap)}, 0)`,
    });
    slot.appendChild(rect({ class: 'scheme-chip-rect', x: 0, y: 0, width: slotW, height: slotH, rx: 4 }));
    slot.appendChild(text({ class: 'scheme-chip-text', x: slotW / 2, y: slotH / 2 + 4, 'text-anchor': 'middle' }, [String(i + 1)]));
    grp.appendChild(slot);
  });
  return grp;
}

export function setSlotState(laneEl, idx, state) {
  if (!laneEl) return;
  const slot = laneEl.querySelector(`[data-idx="${idx}"]`);
  if (!slot) return;
  slot.setAttribute('data-state', state);
  slot.classList.toggle('highlight', state === 'in-flight');
  if (state === 'queued')        slot.style.opacity = '0.45';
  else if (state === 'done')     slot.style.opacity = '0.7';
  else                            slot.style.opacity = '1';
}

export function animateAlong(packetEl, points, options = {}) {
  if (!points || points.length < 2) return null;
  const duration = options.duration || 1500;
  const iterations = options.iterations || 1;
  const easing = options.easing || 'ease-in-out';
  const fill = options.fill || 'forwards';
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
  return packetEl.animate(keyframes, { duration, iterations, easing, fill });
}

export function pulse(elNode, options = {}) {
  const duration = options.duration || 700;
  return elNode.animate(
    [
      { filter: 'brightness(1)' },
      { filter: 'brightness(1.45)' },
      { filter: 'brightness(1)' },
    ],
    { duration, iterations: options.iterations || 2, easing: 'ease-in-out' },
  );
}

export function fadeIn(elNode, options = {}) {
  return elNode.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: options.duration || 400, fill: 'forwards', easing: 'ease-out' },
  );
}

export function fadeOut(elNode, options = {}) {
  return elNode.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: options.duration || 400, fill: 'forwards', easing: 'ease-in' },
  );
}

export function flowDash(pathEl, options = {}) {
  const duration = options.duration || 1500;
  const len = (() => {
    try { return pathEl.getTotalLength(); } catch (_) { return 100; }
  })();
  pathEl.style.strokeDasharray = `${len * 0.25} ${len * 0.75}`;
  return pathEl.animate(
    [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
    { duration, iterations: options.iterations || Infinity, easing: 'linear' },
  );
}
