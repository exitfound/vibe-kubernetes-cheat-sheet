// spec.mjs: read a MIGRATED card's declarative spec as data. No browser, no source scraping.
// Everything here answers one of five questions a `SCENE` cannot answer by itself: what is in the
// part tree once groups are flattened, what names an escape hook creates behind the layer's back,
// out of those two what the whole set of names a key may legally resolve to IS, WHEN each entry of
// a `flow` fires and lands, and WHAT a chip reads at each of the three stages of a step.
//
// THE LAST TWO ARE ARITHMETIC, NOT STRUCTURE, and they live here for the same reason the ref
// universe does: more than one file asks them. `unit/spec-steps.test.mjs` times a flow against the
// step's declared duration, `report/chip-beat.test.mjs` times the same flow against when a chip
// turns over, and both resolve a chip through the same three stages. Two copies of the delay
// vocabulary would disagree about which card is late, which is exactly the drift the ref universe
// was pulled in here to end.
//
// WHY THE ESCAPES HAVE TO BE READ AT ALL. `tune(el, refs)` and `raw.make(refs)` may write a ref,
// and 10 cards do it: 33 assignments naming 27 distinct keys, which is what report section 4b
// prints. A reader that ignored them would call every reset key naming one a typo: twelve false
// findings.
//
// THE READER ONLY EVER WIDENS THE LEGAL SET, which is the safe direction for a regex over source
// text: a pattern it misses costs a loud false finding, never a silent pass. It reads a LITERAL key
// only, so a computed `refs[k] = ...` is invisible to it. `js/schemes/network/CLAUDE.md` bans that
// form for this reason and the catalog has none.
//
// WHO USES IT, and why it lives here rather than in any of them: `unit/spec-steps.test.mjs`
// resolves the names a step uses against the scene, `unit/spec-scene.test.mjs` resolves the reset
// prologue and judges the KIND a written key lands on, `report/skeleton-census.test.mjs` counts
// escapes by hook kind and prints Q1. Copies of one regex drift, and a drift between three readers
// would show up as a disagreement about which cards are broken. They had already drifted once,
// silently: spec-scene carried a looser variant with no `\b` and an `[^=]` tail, matching on this
// catalog by luck. The same argument applies one level up, to the ref universe those three resolve
// against, which is why `refUniverse` is here too and not three times over: see its own note.

// A literal `refs.x =` or `refs['x'] =` assignment. The `(?!=)` keeps `refs.x ==` out.
const ESCAPE_ASSIGN = /\brefs\s*(?:\.\s*([A-Za-z_$][\w$]*)|\[\s*['"]([^'"]+)['"]\s*\])\s*=(?!=)/g;

// Every function ANYWHERE in an object, so a hook kind invented after this file was written is
// still scanned. Depth 8 is the tree's own ceiling: groups nest, flow entries carry options.
export function collectFns(value, out = [], depth = 0) {
  if (depth > 8 || value === null || typeof value !== 'object') return out;
  for (const v of Object.values(value)) {
    if (typeof v === 'function') out.push(v);
    else if (v && typeof v === 'object') collectFns(v, out, depth + 1);
  }
  return out;
}

// The ref names one escape body assigns, in source order, duplicates kept: a caller counting sites
// needs them, a caller building a set does not care.
export const assignedRefs = (fn) => [...fn.toString().matchAll(ESCAPE_ASSIGN)].map(m => m[1] || m[2]);

// Every ref name the escapes of one or more spec objects create, deduplicated.
export function escapeRefs(...objects) {
  const names = new Set();
  for (const obj of objects) for (const fn of collectFns(obj)) for (const k of assignedRefs(fn)) names.add(k);
  return names;
}

// ---------------------------------------------------------------------------------------------
// THE `d` READER, and why it is here rather than twice.
//
// A `path` part carries its geometry as an SVG `d` string, and two readers had to turn one into
// point runs: `unit/spec-scene.test.mjs` (DIAGONAL, THROUGH, OFFEDGE) and `fixtures/lane-traffic.mjs`
// (A-02, A-05). They shared the regex and DISAGREED on everything around it, which is worse than a
// copy because the two answers looked equally plausible:
//   - a `d` opening with `L` and no `M` was a run to one and nothing to the other
//   - one rejected the six curve/arc commands by name, the other rejected any character outside a
//     literal set, which also threw out exponent notation
//   - one returned null on nothing found, the other an empty array
// One reader now, with the FORGIVING half of each disagreement, because a checker that drops a
// segment stops seeing an obstacle: a leading `L` opens a run, and rejection is by COMMAND, so any
// letter that is not M or L (a curve, an arc, a close, an exponent) takes the whole string out.
// Returning an empty array is the one contract; a caller wanting null wraps it in one line.
//
// A path it refuses is unread LOUDLY rather than approximated: an approximated obstacle is worse
// than a missing one, and no `d` in the catalog is anything but absolute M/L today.
export function pathRuns(d) {
  if (typeof d !== 'string' || /[A-KN-Za-kn-z]/.test(d)) return [];
  const runs = [];
  for (const m of d.matchAll(/([ML])\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/g)) {
    if (m[1] === 'M' || !runs.length) runs.push([]);
    runs[runs.length - 1].push([Number(m[2]), Number(m[3])]);
  }
  return runs.filter(r => r.length > 1);
}

// The part tree with groups flattened, in document order, which is z-order (scene-spec.js appends
// in list order). `visit(part, at)` is called for every entry INCLUDING a null one, because a hole
// in the list is a finding for the census and must not be skipped silently here.
export function walkParts(parts, visit, path = 'parts') {
  (parts || []).forEach((part, i) => {
    const at = `${path}[${i}]`;
    visit(part, at);
    if (part && part.kind === 'group') walkParts(part.p && part.p.parts, visit, `${at}.parts`);
  });
}

// ---------------------------------------------------------------------------------------------
// THE REF UNIVERSE: every name a key in reset.keys, in `lit` or in a step's chips may resolve to.
// Modelled on lib/scene-spec.js buildOne/buildPod line by line, because the three files that ask
// "does this name exist" have to ask it of the same set. They did not: one read `key` plus the two
// Pod sub-refs, one added the escapes to that, one added a pod's `id` and a packets layer's `id` on
// top. All three agreed on this catalog and would have parted the day a card put `packetLayer` in
// reset.keys, which is the one queue written to catch exactly that.
//
// TWO BUCKETS, NEVER MERGED. A wire lands in refs.wires[key] and everything else in refs[key], so a
// wire named `api` and a box named `api` are two different things: merging them reports 8 phantom
// key collisions on this catalog.
//
// WHAT IS DELIBERATELY NOT IN IT, both measured on this catalog today:
//   - A pod's `id` and a packets layer's `id`. Those are the DOM id of the wrapper `g`, not a ref:
//     buildPod passes `id` to g({id}) and never files it. Counted: 67 pod parts carry one and all
//     67 repeat a name already filed as a ref, 0 packets parts carry one, so dropping them removes
//     no name from the set today and stops the set claiming a name that would resolve to nothing.
//   - `refs.svg`, which buildScene files for the root. No part declares it, and nothing in the
//     catalog names it. Adding it would only widen the set past what a SCENE says.
// `packetLayer`, by contrast, IS in it: buildScene files it for every packets part, unconditionally,
// whatever `id` says.
//
// The escapes are read off BOTH objects, scene and steps, since `escapeRefs` scans every function it
// is handed. Measured: the step escapes assign no ref at all today, so the set is the same 27 names
// either way, and reading them can only ever widen it.
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
      // buildPod files innerKey only when it actually built the inner box, so an innerKey on a Pod
      // with no `inner` names nothing. None in the catalog, and the guard keeps it that way.
      if (p.inner && p.innerKey) refs.set(p.innerKey, 'box');
    }
  });
  return { refs, wires, escaped };
}

// The same universe as one flat set of legal names, for the readers that only ask whether a name
// exists and never which kind answers to it.
export const refNames = (scene, steps) => {
  const { refs, escaped } = refUniverse(scene, steps);
  return new Set([...refs.keys(), ...escaped]);
};

// ---------------------------------------------------------------------------------------------
// THE FLOW AS A TIMELINE. Re-implemented from what runFlow does rather than imported from it, so
// that it DISAGREES with the runtime when a card is wrong instead of inheriting the runtime's own
// answer. A route's flight time is pure geometry (routeDur over its points), which is why an
// arrival is knowable with no browser and no frame.
//
// WHAT IT IS NOT: a measurement of the real span. It ignores the ripple, the packet fades and the
// pulse tails, and an infinite animation has no length here at all, so every number it gives is a
// LOWER bound on what render/duration.test.mjs measures off a live card.
// ---------------------------------------------------------------------------------------------
const HOP_MS = 700;   // topPacket's default dur, the only length not derived from the points

// The delay vocabulary, closed: `after` is a named arrival plus BEAT.afterHop, `at` is the arrival
// itself, `delay` is a literal, `plus` adds on top of whichever of the three was used.
export function delayOf(p, named, BEAT) {
  const ref = (v) => (typeof v === 'number' ? v : named.get(v));
  let d;
  if (p.after !== undefined) d = ref(p.after) + BEAT.afterHop;
  else if (p.at !== undefined) d = ref(p.at);
  else d = p.delay || 0;
  return d + (p.plus || 0);
}

// When the entry LANDS. pulse, set, light, run, tag, ripple and flash land nothing, so runFlow
// leaves their arrival at their delay and so does this.
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

// One flow as rows of { verb, p, delay, arrival }, in emission order. Returns null when a name is
// referenced before the entry that declares it: no arithmetic downstream of an unresolvable
// reference is meaningful, and unit/spec-steps.test.mjs owns that finding.
//
// The kit constants come in as an ARGUMENT so this fixture stays importable without them; every
// caller passes the same three off ../../js/lib/scheme-kit.js.
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

// ---------------------------------------------------------------------------------------------
// A CHIP HAS THREE READINGS INSIDE ONE STEP, and reading the wrong one is the mistake this trio
// exists to stop. scheme/CLAUDE.md writes the order out: `chips` (through setVal) then `chipsCued`
// (through setChip, in that FIXED order), then `enter`, then `rewind`, then every `F.set` in flow
// order. `enter` is a function body and is not read here, so a key an escape writes resolves to
// whatever the fields said and the caller has to name that blindness.
// ---------------------------------------------------------------------------------------------

// After the static block alone: what BOTH paths write at step entry.
export const staticChips = (spec) => ({ ...(spec.chips || {}), ...(spec.chipsCued || {}) });

// What the ANIMATED path shows when the step opens: the static block wound back by `rewind`, which
// only that path reads. This is the reading a "the value is already on screen" question needs.
export function entryChips(spec) {
  const out = staticChips(spec);
  Object.assign(out, spec.rewind && spec.rewind.chips, spec.rewind && spec.rewind.chipsCued);
  return out;
}

// What the animated path LEAVES BEHIND: entry plus every F.set in flow order. This is the value the
// next step starts from, and it is NOT `chips`: an F.set can carry a key past its static value on
// 15 step/chip pairs today.
export function settledChips(spec) {
  const out = entryChips(spec);
  for (const e of spec.flow || []) {
    if (e.verb !== 'set') continue;
    Object.assign(out, e.p.chips, e.p.chipsCued);
  }
  return out;
}
