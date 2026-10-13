// A migrated card's declarative spec read as data, shared so readers cannot drift: the flattened part
// tree, refs created by escape hooks, the legal ref universe, flow timing and the three chip readings.
// The escape regex only widens the legal set and reads literal keys only.

const ESCAPE_ASSIGN = /\brefs\s*(?:\.\s*([A-Za-z_$][\w$]*)|\[\s*['"]([^'"]+)['"]\s*\])\s*=(?!=)/g;

// Every function anywhere in an object, so a new hook kind is still scanned. Depth 8 is the tree's ceiling.
export function collectFns(value, out = [], depth = 0) {
  if (depth > 8 || value === null || typeof value !== 'object') return out;
  for (const v of Object.values(value)) {
    if (typeof v === 'function') out.push(v);
    else if (v && typeof v === 'object') collectFns(v, out, depth + 1);
  }
  return out;
}

// Duplicates kept: a caller counting sites needs them.
export const assignedRefs = (fn) => [...fn.toString().matchAll(ESCAPE_ASSIGN)].map(m => m[1] || m[2]);

export function escapeRefs(...objects) {
  const names = new Set();
  for (const obj of objects) for (const fn of collectFns(obj)) for (const k of assignedRefs(fn)) names.add(k);
  return names;
}

// Absolute M/L only, a leading `L` opens a run, and any other command letter (curve, arc, close,
// exponent) rejects the whole string rather than approximating an obstacle. Returns [] when refused.
export function pathRuns(d) {
  if (typeof d !== 'string' || /[A-KN-Za-kn-z]/.test(d)) return [];
  const runs = [];
  for (const m of d.matchAll(/([ML])\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/g)) {
    if (m[1] === 'M' || !runs.length) runs.push([]);
    runs[runs.length - 1].push([Number(m[2]), Number(m[3])]);
  }
  return runs.filter(r => r.length > 1);
}

// Document order is z-order. `visit` is called for null entries too, a hole is a census finding.
export function walkParts(parts, visit, path = 'parts') {
  (parts || []).forEach((part, i) => {
    const at = `${path}[${i}]`;
    visit(part, at);
    if (part && part.kind === 'group') walkParts(part.p && part.p.parts, visit, `${at}.parts`);
  });
}

// Every name a key in reset.keys, `lit` or a step's chips may resolve to, modelled on scene-spec.js
// buildOne/buildPod. Two buckets, never merged: refs.wires and refs. A pod's or packets' `id` and
// refs.svg are left out (DOM ids, not refs), while packetLayer is in.
export function refUniverse(scene, steps) {
  const refs = new Map();      // key -> the part kind that filed it
  const wires = new Set();
  const escaped = new Set(escapeRefs(scene, steps));
  walkParts(scene && scene.parts, (part) => {
    if (!part) return;
    const { kind, key, p = {} } = part;
    if (kind === 'wire') { if (key) wires.add(key); return; }
    if (kind === 'packets') refs.set('packetLayer', 'packets');
    if (key) refs.set(key, kind);
    if (kind === 'pod') {
      if (p.shellKey) refs.set(p.shellKey, 'podShell');
      // buildPod files innerKey only when it built the inner box.
      if (p.inner && p.innerKey) refs.set(p.innerKey, 'box');
    }
  });
  return { refs, wires, escaped };
}

export const refNames = (scene, steps) => {
  const { refs, escaped } = refUniverse(scene, steps);
  return new Set([...refs.keys(), ...escaped]);
};

// The flow as a timeline, re-implemented from runFlow so it disagrees with the runtime when a card is
// wrong. A lower bound: ripples, fades and pulse tails are ignored.
const HOP_MS = 700;   // topPacket's default dur, the only length not derived from the points

// `after` is a named arrival plus BEAT.afterHop, `at` the arrival, `delay` a literal, `plus` adds on top.
export function delayOf(p, named, BEAT) {
  const ref = (v) => (typeof v === 'number' ? v : named.get(v));
  let d;
  if (p.after !== undefined) d = ref(p.after) + BEAT.afterHop;
  else if (p.at !== undefined) d = ref(p.at);
  else d = p.delay || 0;
  return d + (p.plus || 0);
}

// pulse, set, light, run, tag, ripple and flash land nothing, so arrival equals delay.
export function arrivalOf(verb, p, delay, { routeDur, REVEAL_MS }) {
  switch (verb) {
    case 'route':   return delay + (p.dur == null ? routeDur(p.points) : p.dur);
    case 'segment': return delay + (p.dur == null ? routeDur([p.from, p.to]) : p.dur);
    case 'top':     return delay + (p.dur == null ? HOP_MS : p.dur);
    case 'fade':    return delay + (p.dur || 0);
    case 'reveal':  return delay + REVEAL_MS;
    case 'anim':    return delay + ((p.options && p.options.duration) || 0);
    default:        return delay;
  }
}

// Null when a name is used before its declaring entry. Kit constants come in as an argument.
export function timelineOf(flow, kit) {
  const named = new Map();
  const rows = [];
  for (const e of flow || []) {
    const p = e.p || {};
    for (const f of ['after', 'at']) {
      if (typeof p[f] === 'string' && !named.has(p[f])) return null;
    }
    const delay = delayOf(p, named, kit.BEAT);
    if (!Number.isFinite(delay)) return null;
    const arrival = arrivalOf(e.verb, p, delay, kit);
    if (p.name) named.set(p.name, arrival);
    rows.push({ verb: e.verb, p, delay, arrival });
  }
  return rows;
}

// A chip has three readings per step: static (`chips` then `chipsCued`), entry (wound back by
// `rewind`), settled (every F.set in firing order). `enter` is not read.

export const staticChips = (spec) => ({ ...(spec.chips || {}), ...(spec.chipsCued || {}) });

// Animated path only: what a "value already on screen" question needs.
export function entryChips(spec) {
  const out = staticChips(spec);
  Object.assign(out, spec.rewind && spec.rewind.chips, spec.rewind && spec.rewind.chipsCued);
  return out;
}

// Entry plus every F.set in firing order, a stable sort on max(delay, 0), as runFlow applies them.
// Falls back to source order when timelineOf cannot resolve the flow.
export function settledChips(spec, kit) {
  if (!kit) throw new Error('settledChips(spec, kit): the F.sets apply in the order they fire, which needs the kit constants');
  const out = entryChips(spec);
  const rows = timelineOf(spec.flow, kit);
  const sets = rows
    ? rows.map((r, i) => ({ r, i })).filter(({ r }) => r.verb === 'set')
      .sort((a, b) => (Math.max(a.r.delay, 0) - Math.max(b.r.delay, 0)) || (a.i - b.i)).map(({ r }) => r.p)
    : (spec.flow || []).filter(e => e.verb === 'set').map(e => e.p);
  for (const p of sets) Object.assign(out, p.chips, p.chipsCued);
  return out;
}
