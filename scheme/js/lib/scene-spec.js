import { g, text } from './svg.js';
import { arrowDefs, box, cylinder, node, chip, chainList, arrow, pathArrow, podShell } from './primitives.js';
import { valChip, relationPath, diagramRoot, clearHighlights, clearWires } from './scheme-kit.js';

// A scene as DATA. `parts` is ORDERED, and that order is the append order, which is the z-order.
// Shape and what is deliberately NOT derived from it: ../../CLAUDE.md.

// One violet for shell and inner box, so a Pod recolours as one family.
export const POD_VIOLET = '#c0b0ff';

// A kit binds role, podRole and tint ONCE, so a card writes no `role:` and cannot pick up a
// neighbour's palette. The narrow S-42 reading, guarded by render/palette.test.mjs.
export function makePartKinds({ role = '', podRole = 'workloads', tint = null } = {}) {
  // `undefined` takes the binding. An explicit null or '' is an override and survives.
  const roled = (p) => (p.role === undefined ? { ...p, role } : p);
  const part = (kind) => (p = {}) => ({ kind, key: p.key, p });
  const roledPart = (kind) => (p = {}) => ({ kind, key: p.key, p: roled(p) });
  return {
    defs:     part('defs'),
    group:    part('group'),
    box:      roledPart('box'),
    cylinder: roledPart('cylinder'),
    node:     part('node'),            // node() takes no role, so none is added: see S-42 above
    chip:     roledPart('chip'),       // valChip, the name/value pair
    // A <text> takes NO role: adding one puts an attribute on the element that nothing else has.
    tag:      part('tag'),             // a standing caption
    chain:    roledPart('chain'),
    arrow:    roledPart('arrow'),      // two points
    lane:     roledPart('lane'),       // three or more points, pathArrow
    relation: roledPart('relation'),
    wire:     part('wire'),            // a per-step label, lands in refs.wires
    packets:  part('packets'),
    raw:      part('raw'),
    pod: (p = {}) => ({
      kind: 'pod',
      key: p.key,
      p: {
        ...p,
        role: p.role === undefined ? podRole : p.role,
        tint: p.tint === undefined ? tint : p.tint,
      },
    }),
  };
}

// Shell, recolour, inner box, recolour, the g carrying the id, two appends. A serialised tree keeps
// that ORDER, so it is the order the handwritten copies used.
function buildPod(p, refs) {
  const { id, x, y, w, h, label = 'Pod', sublabel = '', containers = 0, role, tint, inner, opacity } = p;
  const shell = podShell({ x, y, w, h, label, sublabel, containers, role });
  if (tint) shell.style.setProperty(`--${role}-color`, tint);
  const innerBox = inner
    ? box({ x: x + inner.dx, y: y + inner.dy, w: inner.w, h: inner.h, label: inner.label, sublabel: inner.sublabel, role })
    : null;
  if (innerBox && tint) innerBox.style.setProperty(`--${role}-color`, tint);
  // The wrapper is built here rather than by a shared helper because it needs the ID: a card
  // reaches its Pod through g({id:'pod1'}), and a helper returning a bare g({}) is unreachable.
  const wrap = g({ id });
  if (opacity !== undefined) wrap.style.opacity = String(opacity);
  wrap.appendChild(shell);
  if (innerBox) wrap.appendChild(innerBox);
  if (p.shellKey) refs[p.shellKey] = shell;
  if (innerBox && p.innerKey) refs[p.innerKey] = innerBox;
  return wrap;
}

const BUILDERS = {
  defs:     () => arrowDefs(),
  box:      (p) => box(p),
  cylinder: (p) => {
    const el = cylinder(p);
    // Measured: the default h/2 baseline reads high under the cap. Only reason this knob exists.
    if (p.labelY !== undefined) {
      const l = el.querySelector('.scheme-cylinder-label');
      if (l) l.setAttribute('y', p.labelY);
    }
    return el;
  },
  node:     (p) => node(p),
  chip:     (p) => valChip(p),
  tag:      (p) => label(p),
  chain:    (p) => chainList(p),
  arrow:    (p) => arrow(p.from ? { ...p, x1: p.from[0], y1: p.from[1], x2: p.to[0], y2: p.to[1] } : p),
  lane:     (p) => pathArrow(p),
  relation: (p) => relationPath(p),
  wire:     (p) => label(p),
  packets:  (p) => g({ id: p.id === undefined ? 'packetLayer' : p.id }),
  pod:      (p, refs) => buildPod(p, refs),
  raw:      (p, refs) => (typeof p.make === 'function' ? p.make(refs) : p.el),
};

// A caption and a per-step wire label are the same element, differing only in the ref bucket.
function label(p) {
  return text({
    class: p.cls === undefined ? 'scheme-label code dim' : p.cls,
    x: p.x,
    y: p.y,
    'text-anchor': p.anchor === undefined ? 'middle' : p.anchor,
    'data-role': p.role || null,
  }, [p.text === undefined ? ' ' : p.text]);
}

function appendParts(parent, parts, refs) {
  for (const part of parts || []) {
    if (!part) continue;
    const el = buildOne(part, refs);
    if (el) parent.appendChild(el);
  }
}

function buildOne(part, refs) {
  const { kind, key, p = {} } = part;
  let el;
  if (kind === 'group') {
    el = g({ id: p.id === undefined ? null : p.id, class: p.cls === undefined ? null : p.cls, transform: p.transform === undefined ? null : p.transform });
    if (p.opacity !== undefined) el.style.opacity = String(p.opacity);
    appendParts(el, p.parts, refs);
  } else {
    const make = BUILDERS[kind];
    if (!make) throw new Error(`scene part of unknown kind: ${kind}`);
    el = make(p, refs);
    if (el && p.opacity !== undefined && kind !== 'pod') el.style.opacity = String(p.opacity);
  }
  if (!el) return null;
  // Narrow escape: nudge a part the kinds already build. `raw` replaces a whole element, which is
  // the wrong tool for one attribute.
  if (typeof p.tune === 'function') p.tune(el, refs);
  if (kind === 'wire') refs.wires[key] = el;
  else if (kind === 'packets') { refs.packetLayer = el; if (key) refs[key] = el; }
  else if (key) refs[key] = el;
  return el;
}

// One camera, one ordered walk. The aria-label is all that varies between the 108 roots.
export function buildScene(host, SCENE) {
  host.replaceChildren();
  const refs = { wires: {} };
  const root = diagramRoot({ 'aria-label': SCENE['aria-label'] });
  refs.svg = root;
  appendParts(root, SCENE.parts, refs);
  host.appendChild(root);
  return refs;
}

// reset() IS build(): a step is replayed against a fresh tree, never undone.
export function makeScene(SCENE) {
  return class Scene {
    constructor(host) { this.host = host; this.refs = {}; this.build(); }
    build() { this.refs = buildScene(this.host, SCENE); }
    reset() { this.build(); }
  };
}

// The prologue every enter() opens with. `keys` and `pods` are written out in SCENE, never
// inferred: inferring pods adds a clearPodHighlight that wipes four inline styles (R5).
export function makeResetStep(SCENE) {
  const { keys = [], pods = [], extra = null } = SCENE.reset || {};
  return function resetStep(s) {
    if (s.refs.packetLayer) s.refs.packetLayer.replaceChildren();
    clearHighlights(s, keys, pods.map(k => s.refs[k]).filter(Boolean));
    clearWires(s);
    if (extra) extra(s);
  };
}
