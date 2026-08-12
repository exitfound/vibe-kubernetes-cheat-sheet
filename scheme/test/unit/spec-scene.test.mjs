// spec-scene.test.mjs: what a MIGRATED card's SCENE owes, asserted by IMPORTING it. The geometry
// block of ../../CANON.md read as DATA rather than off a rendered page: L-09 (DIAGONAL), L-10
// (THROUGH), L-11 and L-12 (OFFEDGE), plus S-42 (where a role comes from), S-07 (one packet layer),
// and the reset prologue S-11 states as a shape.
//
// This is wave 2 of the harness: the rules that used to be a regex over card source and were
// deliberately deferred. SCENE.parts is module-level data now, so a lane's points, a block's rect
// and a chip's name are values a test reads in bare Node with no browser and nothing stubbed.
//
// ===========================================================================================
// THE POPULATION IS MIXED, AND THAT IS THE ONE THING THIS FILE CANNOT GET WRONG
// ===========================================================================================
// 21 cards of 108 export SCENE today; the other 87 export `init` alone and their scene lives inside
// makeInit's closure, unreachable (fixtures/module.mjs says why at length). So every rule below is
// asserted over a SUBSET, and a subset that shrinks to nothing passes every rule in this file.
// The first test therefore compares the number of cards this file built a scene for against the
// migration counter in fixtures/module.mjs, card for card and by NAME. A card that stops exporting
// SCENE turns this file red instead of quietly taking its own rules out of the run, which is the
// hole the old harness kept a COVERAGE_FLOOR constant for. No number here needs editing as the
// remaining three categories migrate: the counter is derived on every run.
//
// ===========================================================================================
// THIS FILE AND render/geometry.test.mjs ARE NOT THE SAME CHECK
// ===========================================================================================
// That one measures the three rules off the rendered DOM, at every step of all 108 cards, after the
// browser has applied every transform. This one reads what the card DECLARES, on 21. Both are worth
// having: this one fails in 0.4s with no server, and it is the only one that can see a DECLARED
// geometry that the drawn picture does not contradict. A rule failing here and not there (or the
// other way round) is a finding about the LAYER, not about the card, and both directions are real:
//   - declared clean, drawn dirty  -> something between the data and the DOM moved it: a group
//     transform, an escape hook, a per-step opacity that reveals a lane this file also counted.
//   - declared dirty, drawn clean  -> the part is never visible, or an escape overwrites it.
// Measured on this catalog today: 0 findings on both sides, over 190 declared segments here and
// 650 rendered steps there. The two agree.
//
// ===========================================================================================
// WHAT THIS FILE IS BLIND TO
// ===========================================================================================
//   - THE ESCAPE HOOKS. `raw` builds a whole element from a function and `tune` adjusts one after
//     construction. 22 such sites live in 7 cluster cards (11 raw, 11 tune), and everything they
//     draw, including cluster-cpu-throttling's three bar captions, is DOM this file cannot evaluate
//     without a document. They are counted, never read, and every key they assign to refs widens the
//     universe rather than narrowing it, so an escape can only cost this file a finding it would
//     have made, never invent one.
//   - PER-STEP STATE. A step may fade a lane in, move nothing and light a block; geometry here is
//     the resting declaration, which is exactly what makes it readable at all.
//   - THE MAPPING. A bbox in the browser is the element's own box mapped through the
//     element-to-root matrix, and a label wider than its rect would widen it. Measured in
//     render/geometry.test.mjs: no card in this catalog has one, so a declared rect and a drawn
//     bbox are the same rectangle. The moment one does, that file sees it and this one does not.
//   - `duration`, `narration`, step order, flow timing. Those belong to STEPS_SPEC and to
//     unit/spec-steps.test.mjs; what is read from STEPS_SPEC here is only whether a key a step
//     writes RESOLVES to a part of the scene.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census } from '../fixtures/catalog.mjs';
import { cardForm, importAll, importKit } from '../fixtures/module.mjs';

// ---------------------------------------------------------------------------------------------
// Tolerances. Every one is carried over from render/geometry.test.mjs unchanged, because the whole
// point of reading the same rules off the data is that the two layers agree on what a finding IS.
// A number retuned here and not there would make the pair of files disagree on purpose.
// ---------------------------------------------------------------------------------------------
const AXIS_EPS = 0.01;      // a segment is axis-aligned within this, in viewBox units
const TOL = 6;              // slack on a face midpoint
const EDGE_TOL = 2;         // how close a point must be to a face to count as sitting ON it
const TWIN_TOL = 2;         // how exactly two mirrored offsets must cancel to read as a pair (L-12)
const FACE_FRAC = 0.18;     // an offset up to 18% of the face it sits on is not a stray coordinate
const THROUGH_INSET = 3;    // the rect THROUGH tests is shrunk by this on each side

const listing = (items, cap = 8) =>
  items.slice(0, cap).join('\n  ') + (items.length > cap ? `\n  ... and ${items.length - cap} more` : '');

// ---------------------------------------------------------------------------------------------
// Gathered once. importAll() carries the census guard, so a run that resolved fewer than the whole
// catalog throws before a single assertion has had the chance to pass over a short list.
// ---------------------------------------------------------------------------------------------
const catalogued = await cards();
const CARD_COUNT = catalogued.length;
const modules = await importAll();
const categoryOf = new Map(catalogued.map(c => [c.id, c.category]));

// The migration counter, taken from the fixture rather than restated: cardForm() is EXACT set
// equality on the export surface, so it cannot call a legacy card migrated.
const migratedIds = [...modules].filter(([, ns]) => cardForm(ns) === 'migrated').map(([id]) => id).sort();
const legacyIds = [...modules].filter(([, ns]) => cardForm(ns) === 'legacy').map(([id]) => id).sort();

// The scenes this file actually reads, collected by the INDEPENDENT test of "does it hand me a
// SCENE object I can walk". Comparing this list against migratedIds is the whole coverage guard,
// and it is only a guard because the two lists are built by different questions.
const scenes = [];
for (const [id, ns] of modules) {
  const S = ns.SCENE;
  if (S && typeof S === 'object' && !Array.isArray(S) && Array.isArray(S.parts)) {
    scenes.push({ id, category: categoryOf.get(id), SCENE: S, STEPS_SPEC: ns.STEPS_SPEC || [] });
  }
}
scenes.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

// One kit per category that has a migrated card. The kit is where the role binding lives, so the
// EXPECTATION is read off the kit by calling its constructors, never hardcoded here: a test that
// spelled 'cluster' would have to be edited for every category and would then be asserting its own
// copy of the answer.
const kits = new Map();
for (const cat of new Set(scenes.map(s => s.category))) kits.set(cat, await importKit(cat));

// ---------------------------------------------------------------------------------------------
// The walk. Groups nest and a group may carry a transform, so an offset is accumulated down the
// tree. Only `translate` composes into a pair of numbers; anything else is reported as a part this
// walk cannot place, because silently ignoring a scale would make every number below fiction.
// ---------------------------------------------------------------------------------------------
const TRANSLATE_RE = /^translate\(\s*(-?[\d.]+)(?:\s*[ ,]\s*(-?[\d.]+))?\s*\)$/;

function flatten(SCENE) {
  const out = [];
  const unplaceable = [];
  const walk = (parts, dx, dy, path) => {
    (parts || []).forEach((part, i) => {
      if (!part) return;
      const p = part.p || {};
      const here = `${path}[${i}]${part.kind}${part.key ? `#${part.key}` : ''}`;
      out.push({ kind: part.kind, key: part.key, p, dx, dy, path: here });
      if (part.kind !== 'group') return;
      let [ndx, ndy] = [dx, dy];
      if (p.transform !== undefined) {
        const m = TRANSLATE_RE.exec(String(p.transform).trim());
        if (!m) unplaceable.push(`${here} carries transform "${p.transform}", which is not a translate`);
        else { ndx += Number(m[1]); ndy += Number(m[2] || 0); }
      }
      walk(p.parts, ndx, ndy, `${here}/`);
    });
  };
  walk(SCENE.parts, 0, 0, '');
  return { parts: out, unplaceable };
}

const flat = new Map(scenes.map(s => [s.id, flatten(s.SCENE)]));

// ---------------------------------------------------------------------------------------------
// Blocks and lanes, as the two rules need them.
//
// The scoping is render/geometry.test.mjs's, deliberately, with ONE stated difference. Blocks are
// box, pod, the pod's inner box (a .scheme-box in the DOM too) and cylinder. A `node` is a FRAME:
// lanes are supposed to run inside it to reach what it holds, so it is never an obstacle, but its
// faces are real faces an endpoint may land on (L-10's own note).
//
// THE DIFFERENCE: a chip counts as an obstacle here and does not there. That file's reason is that
// "a lane ending on a chip is not a defect", which is a claim about TERMINATION, and this file
// honours it: a chip is not an OFFEDGE face. Crossing one is a different act, no card in the
// catalog commits it, and 82 chips would otherwise be invisible to the only rule that can see them.
// A finding from this set says `chip` in its text: if it ever fires, it is stricter than the DOM
// twin and that is the conversation to have, not a silent difference.
// ---------------------------------------------------------------------------------------------
const rectOf = (x, y, w, h, dx, dy, label, kind) =>
  ([x, y, w, h].every(v => typeof v === 'number' && Number.isFinite(v))
    ? { x: x + dx, y: y + dy, w, h, label: String(label).slice(0, 28), kind }
    : null);

// A relation may state its path as a `d` STRING instead of points, and then it was invisible to
// both rules below. That is not a second kind of line, it is a second way of spelling one: an
// L-12 mirrored PAIR whose halves are spelled differently had its exemption fail on the half that
// was visible. Only the straight M/L form is read; a curve or an arc yields null and stays out
// rather than being approximated, because an approximated obstacle is worse than a missing one.
// One `d` may hold SEVERAL subpaths (a trunk plus a stub per row). Each `M` starts a new line, and
// joining them would invent a segment between the end of one and the start of the next: that read
// as a diagonal on the first run of this parser.
function straightD(d) {
  if (typeof d !== 'string' || /[CcSsQqTtAaHhVvZz]/.test(d)) return null;
  const subpaths = [];
  for (const m of d.matchAll(/([ML])\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/g)) {
    if (m[1] === 'M' || !subpaths.length) subpaths.push([]);
    subpaths[subpaths.length - 1].push([parseFloat(m[2]), parseFloat(m[3])]);
  }
  const kept = subpaths.filter(s => s.length >= 2);
  return kept.length ? kept : null;
}

function geometryOf(parts) {
  const blocks = [];     // obstacles for THROUGH and faces for OFFEDGE
  const chips = [];      // obstacles for THROUGH only
  const frames = [];     // faces for OFFEDGE only
  const lanes = [];
  for (const { kind, key, p, dx, dy, path } of parts) {
    const push = (arr, r) => { if (r) arr.push(r); };
    if (kind === 'box') push(blocks, rectOf(p.x, p.y, p.w, p.h, dx, dy, p.label || key || 'box', kind));
    if (kind === 'cylinder') push(blocks, rectOf(p.x, p.y, p.w, p.h, dx, dy, p.label || key || 'cylinder', kind));
    if (kind === 'pod') {
      push(blocks, rectOf(p.x, p.y, p.w, p.h, dx, dy, key || p.label || 'pod', kind));
      // The inner box is built by buildPod at an offset from the shell, so its rect is derived the
      // same way here. It is a .scheme-box in the tree and the DOM twin counts it as one.
      if (p.inner) push(blocks, rectOf(p.x + p.inner.dx, p.y + p.inner.dy, p.inner.w, p.inner.h, dx, dy,
        p.inner.label || `${key} inner`, 'box'));
    }
    if (kind === 'node') push(frames, rectOf(p.x, p.y, p.w, p.h, dx, dy, p.label || key || 'node', kind));
    if (kind === 'chip') push(chips, rectOf(p.x, p.y, p.w, p.h, dx, dy, p.name || key || 'chip', kind));
    let pts = null;
    if (kind === 'lane' || kind === 'relation') {
      pts = p.points;
      if (!pts) {
        const subs = straightD(p.d);
        if (subs) {
          for (const s of subs) lanes.push({ kind, key, path, points: s.map(([x, y]) => [x + dx, y + dy]) });
          continue;
        }
      }
    }
    // Both arrow forms: two named points, or the four coordinates the primitive takes.
    if (kind === 'arrow') pts = p.from ? [p.from, p.to] : [[p.x1, p.y1], [p.x2, p.y2]];
    if (!Array.isArray(pts) || pts.length < 2) continue;
    const ok = pts.every(q => Array.isArray(q) && q.length >= 2 && q.slice(0, 2).every(v => typeof v === 'number' && Number.isFinite(v)));
    if (!ok) { lanes.push({ kind, key, path, points: null }); continue; }
    lanes.push({ kind, key, path, points: pts.map(([x, y]) => [x + dx, y + dy]) });
  }
  return { blocks, chips, frames, lanes };
}

const geom = new Map(scenes.map(s => [s.id, geometryOf(flat.get(s.id).parts)]));

// ---------------------------------------------------------------------------------------------
// The ref namespace, which is what a key in reset.keys, in `lit` or in a step's chips means.
// buildScene keeps TWO buckets: a wire lands in refs.wires[key], everything else in refs[key], so a
// wire named `api` and a box named `api` are two different things. Reading one merged namespace
// reports 8 phantom key collisions on this catalog, which is how this note came to be here.
//
// Escape hooks widen the universe: `raw` and `tune` may assign refs of their own, read out of the
// hook's own source. A widening is never a source of findings, so a name this regex misses costs a
// false finding, which is loud, and never a silent pass.
// ---------------------------------------------------------------------------------------------
const REF_ASSIGN_RE = /refs\s*(?:\.\s*([A-Za-z_$][\w$]*)|\[\s*['"]([^'"]+)['"]\s*\])\s*=[^=]/g;

function refUniverse(parts) {
  const refs = new Map();      // key -> the kind that put it there
  const wires = new Set();
  const escaped = new Set();
  for (const { kind, key, p } of parts) {
    if (kind === 'wire') { if (key) wires.add(key); }
    else if (key) refs.set(key, kind);
    if (p.innerKey) refs.set(p.innerKey, 'box');
    if (p.shellKey) refs.set(p.shellKey, 'podShell');
    for (const fn of [p.tune, p.make]) {
      if (typeof fn !== 'function') continue;
      for (const m of String(fn).matchAll(REF_ASSIGN_RE)) escaped.add(m[1] || m[2]);
    }
  }
  return { refs, wires, escaped };
}

// Every object in a step that writes statics, with a label saying where it came from. `rewind` and
// F.set run the SAME writeStatics, so a key that draws nothing draws nothing in all three places.
function writeBlocks(STEPS_SPEC) {
  const out = [];
  for (const [i, spec] of (STEPS_SPEC || []).entries()) {
    if (!spec) continue;
    const at = `step ${i} "${spec.id}"`;
    out.push([at, spec]);
    if (spec.rewind) out.push([`${at} rewind`, spec.rewind]);
    for (const [j, e] of (spec.flow || []).entries()) {
      if (e && e.verb === 'set' && e.p) out.push([`${at} flow[${j}] F.set`, e.p]);
    }
  }
  return out;
}

// Does segment (a,b) pass through the INTERIOR of rect r? Copied from render/geometry.test.mjs,
// including the two exemptions: an endpoint resting on a face is not a crossing, and an endpoint
// INSIDE the block is an arrival (a lane terminating on a container inside a Pod shell).
function crosses(a, b, r, tol) {
  const x0 = r.x + tol, x1 = r.x + r.w - tol, y0 = r.y + tol, y1 = r.y + r.h - tol;
  if (x1 <= x0 || y1 <= y0) return false;
  const inside = p => p[0] > x0 && p[0] < x1 && p[1] > y0 && p[1] < y1;
  if (inside(a) || inside(b)) return false;
  if (Math.abs(a[0] - b[0]) < AXIS_EPS) {
    if (a[0] <= x0 || a[0] >= x1) return false;
    return Math.min(a[1], b[1]) < y1 && Math.max(a[1], b[1]) > y0;
  }
  if (Math.abs(a[1] - b[1]) < AXIS_EPS) {
    if (a[1] <= y0 || a[1] >= y1) return false;
    return Math.min(a[0], b[0]) < x1 && Math.max(a[0], b[0]) > x0;
  }
  return false;
}

// ---------------------------------------------------------------------------------------------
describe('the migrated population', () => {
  // The guard the whole file rests on. Two independently built lists of card ids: one from the
  // export surface (fixtures/module.mjs), one from "this actually gave me a walkable SCENE". They
  // must be the same list, not the same length: a card swapped for another would keep a count.
  test('every migrated card was walked, and only migrated cards were', (t) => {
    assert.ok(migratedIds.length > 0,
      'NOT ONE CARD EXPORTS A SCENE. Every rule in this file would pass over an empty set, which is ' +
      'the failure this test exists to make loud. Either the declarative layer was reverted or the ' +
      'export surface changed name.');
    assert.deepEqual(scenes.map(s => s.id), migratedIds,
      `this file walked ${scenes.length} scene(s), fixtures/module.mjs counts ${migratedIds.length} ` +
      'migrated card(s). A card exporting SCENE without the rest of the migrated surface, or the ' +
      'other way round, takes itself out of these rules silently.');
    // Sums to the catalog, so a card counted in neither form cannot leave a plausible pair of
    // numbers that adds up short. Same shape as the counter in unit/module.test.mjs.
    census('spec-scene population', migratedIds.length + legacyIds.length, CARD_COUNT);
    const cats = [...new Set(scenes.map(s => s.category))].sort();
    t.diagnostic(`scenes walked: ${scenes.length} migrated, ${legacyIds.length} legacy, ` +
      `${CARD_COUNT} of ${CARD_COUNT} accounted for. Categories in play: ${cats.join(', ')}`);
  });

  // Coverage cannot collapse quietly one card at a time either: a scene emptied to `parts: []`
  // would satisfy every rule below and stay in the population count above.
  test('every walked scene holds parts, blocks and lanes to rule on', (t) => {
    const findings = [];
    let parts = 0, blocks = 0, lanes = 0, segments = 0;
    for (const s of scenes) {
      const f = flat.get(s.id), g = geom.get(s.id);
      parts += f.parts.length;
      blocks += g.blocks.length + g.chips.length + g.frames.length;
      lanes += g.lanes.length;
      for (const L of g.lanes) if (L.points) segments += L.points.length - 1;
      if (f.parts.length === 0) findings.push(`${s.id}  SCENE.parts is empty`);
      if (g.blocks.length === 0) findings.push(`${s.id}  declares no block at all, so THROUGH and OFFEDGE have no subject`);
      if (g.lanes.length === 0) findings.push(`${s.id}  declares no lane at all, so DIAGONAL has no subject`);
      assert.deepEqual(f.unplaceable, [],
        `${s.id}: this walk cannot place ${f.unplaceable.length} part(s), so every coordinate below ` +
        `them is wrong rather than missing:\n  ${listing(f.unplaceable)}`);
    }
    assert.equal(findings.length, 0, `${findings.length} scene(s) with nothing to rule on:\n  ${listing(findings)}`);
    t.diagnostic(`${parts} parts, ${blocks} block rects, ${lanes} lanes, ${segments} segments across ${scenes.length} scenes`);
  });
});

// ---------------------------------------------------------------------------------------------
// L-09, L-10, L-11, L-12, off the declaration.
// ---------------------------------------------------------------------------------------------
describe('scene geometry, read from SCENE.parts', () => {
  test('L-09 DIAGONAL: every declared segment is horizontal or vertical', (t) => {
    const findings = [];
    let segments = 0;
    for (const s of scenes) {
      for (const L of geom.get(s.id).lanes) {
        if (!L.points) {
          findings.push(`${s.id}  ${L.path} declares points that are not a list of number pairs`);
          continue;
        }
        for (let k = 0; k + 1 < L.points.length; k++) {
          segments++;
          const a = L.points[k], b = L.points[k + 1];
          if (Math.abs(a[0] - b[0]) > AXIS_EPS && Math.abs(a[1] - b[1]) > AXIS_EPS) {
            findings.push(`${s.id}  ${L.path}: segment (${a}) -> (${b}) is neither horizontal nor vertical`);
          }
        }
      }
    }
    assert.ok(segments > 0, 'zero segments walked: the lane kinds were renamed and this rule is asserting nothing');
    assert.equal(findings.length, 0, `${findings.length} diagonal segment(s):\n  ${listing(findings)}`);
    t.diagnostic(`${segments} declared segments, all axis-aligned within ${AXIS_EPS}`);
  });

  // THE BLIND SPOT THIS TABLE COVERS. The rule reads SCENE.parts, which is the scene as BUILT, and
  // knows nothing about per-step opacity. A card whose two branches are mutually exclusive draws
  // both, hides one per step, and reads here as a crossing that is never once on screen. Verified
  // by opening the frames, not by reading the code: the entry states which step shows what.
  // An entry that stops firing FAILS, so a geometry change cannot leave a stale exemption behind.
  const THROUGH_EXEMPT = {
    'storage-topology-aware-provisioning [11]lane#wProvA x Disk zone-b':
      'The Immediate and WaitForFirstConsumer branches never share a frame. On imm-provision, '
      + 'wProvA runs to Disk zone-a and diskB is at opacity 0; on wffc-provision, diskB is drawn '
      + 'and wProvA is at opacity 0, with wProvB serving it. Frames checked at both steps.',
    // The second shape this table covers: a lane drawn THROUGH a block on purpose, where the block
    // is sized around it. Satisfying the rule means routing the walk around the listing it walks,
    // which is the "the rule can only be met by making the picture worse" case (L-16).
    ...Object.fromEntries(['/data', 'app.log', '... 4.2M more'].map(row => [
      `storage-fsgroup-ownership [11]lane x ${row}`,
      'The walk lane IS the scan, and it is drawn down the corridor the listing rows leave for it: '
      + 'each row spans x 446..754, its name column ends at 547 and its owner column starts at 653, '
      + 'so the lane at x=600 has 53 units clear either side. Frame checked on the always step.',
    ])),
  };

  test('L-10 THROUGH: no declared segment crosses a block it does not terminate on', (t) => {
    const findings = [];
    const usedExempt = new Set();
    let tested = 0;
    for (const s of scenes) {
      const g = geom.get(s.id);
      // Frames excluded on purpose: a node frame is what lanes run INSIDE to reach its contents.
      const obstacles = [...g.blocks, ...g.chips];
      for (const L of g.lanes) {
        if (!L.points) continue;
        for (let k = 0; k + 1 < L.points.length; k++) {
          const a = L.points[k], b = L.points[k + 1];
          for (const r of obstacles) {
            tested++;
            if (!crosses(a, b, r, THROUGH_INSET)) continue;
            const ex = `${s.id} ${L.path} x ${r.label}`;
            if (ex in THROUGH_EXEMPT) { usedExempt.add(ex); continue; }
            findings.push(`${s.id}  ${L.path}: segment (${a}) -> (${b}) crosses ${r.kind} "${r.label}" ` +
              `[${r.x}..${r.x + r.w} x ${r.y}..${r.y + r.h}]`);
          }
        }
      }
    }
    assert.ok(tested > 0, 'zero segment-block pairs tested: either the lanes or the blocks went missing');
    assert.equal(findings.length, 0, `${findings.length} crossing(s):\n  ${listing(findings)}`);
    // A stale exemption is a silenced rule, so an entry that no longer fires is itself a failure.
    const stale = Object.keys(THROUGH_EXEMPT).filter(k => !usedExempt.has(k));
    assert.equal(stale.length, 0, `${stale.length} exemption(s) that no longer describe anything:\n  ${listing(stale)}`);
    t.diagnostic(`${tested} segment-block pairs tested against rects inset by ${THROUGH_INSET}, `
      + `${usedExempt.size} declared exemption(s) used`);
  });

  // L-11 with L-12's exemption. An endpoint is a defect only if it is ALONE on its face: a mirrored
  // sibling (+d against -d, any d) is the out-and-back lane pair 18 cluster cards draw by hand.
  // Pooled per card, because the halves of a pair may be declared far apart in the list.
  test('L-11 OFFEDGE: a lane endpoint sits on a face midpoint, unless L-12 pairs it', (t) => {
    const findings = [];
    let hits = 0, faces = 0, atMid = 0, byFrac = 0, byTwin = 0;
    for (const s of scenes) {
      const g = geom.get(s.id);
      // Chips are not faces here: render/geometry.test.mjs holds that a lane ending on a chip is
      // not a defect, and this file does not invent a second answer to the same question.
      const faceable = [...g.blocks, ...g.frames];
      const faceHits = new Map();
      for (const L of g.lanes) {
        if (!L.points) continue;
        for (const p of [L.points[0], L.points[L.points.length - 1]]) {
          for (const r of faceable) {
            const mx = r.x + r.w / 2, my = r.y + r.h / 2;
            const onV = (Math.abs(p[0] - r.x) < EDGE_TOL || Math.abs(p[0] - (r.x + r.w)) < EDGE_TOL) &&
              p[1] > r.y - EDGE_TOL && p[1] < r.y + r.h + EDGE_TOL;
            const onH = (Math.abs(p[1] - r.y) < EDGE_TOL || Math.abs(p[1] - (r.y + r.h)) < EDGE_TOL) &&
              p[0] > r.x - EDGE_TOL && p[0] < r.x + r.w + EDGE_TOL;
            const gk = `${r.x},${r.y},${r.w},${r.h}`;
            const push = (face, off, axis) => {
              const k = `${gk}:${face}`;
              if (!faceHits.has(k)) faceHits.set(k, []);
              faceHits.get(k).push({ off, p, r, axis, path: L.path });
            };
            if (onV) push(Math.abs(p[0] - r.x) < EDGE_TOL ? 'left' : 'right', p[1] - my, 'v');
            if (onH) push(Math.abs(p[1] - r.y) < EDGE_TOL ? 'top' : 'bottom', p[0] - mx, 'h');
          }
        }
      }
      faces += faceHits.size;
      const seen = new Set();
      for (const list of faceHits.values()) {
        for (const h of list) {
          hits++;
          const off = Math.abs(h.off);
          if (off <= TOL) { atMid++; continue; }
          const face = h.axis === 'v' ? h.r.h : h.r.w;
          if (off / face <= FACE_FRAC) { byFrac++; continue; }
          if (list.some(o => o !== h && Math.abs(o.off + h.off) <= TWIN_TOL)) { byTwin++; continue; }
          const key = `${h.p} ${h.r.label} ${h.axis}`;
          if (seen.has(key)) continue;
          seen.add(key);
          const mid = h.axis === 'v' ? (h.r.y + h.r.h / 2) : (h.r.x + h.r.w / 2);
          findings.push(`${s.id}  ${h.path}: endpoint (${h.p}) alone on "${h.r.label}" ` +
            `${h.axis === 'v' ? 'side' : 'top/bottom'} edge, ${off.toFixed(1)} off its midpoint ` +
            `${h.axis === 'v' ? 'y' : 'x'}=${mid} (${(100 * off / face).toFixed(0)}% of a ${face} face)`);
        }
      }
    }
    // Without this the rule is vacuous whenever the face test stops matching, and it would look
    // exactly like a clean catalog.
    assert.ok(hits > 0, 'not one lane endpoint landed on any block face, so OFFEDGE ruled on nothing');
    assert.equal(findings.length, 0, `${findings.length} endpoint(s) off a face midpoint:\n  ${listing(findings)}`);
    t.diagnostic(`${hits} endpoint-on-face hits over ${faces} faces: ${atMid} on the midpoint, ` +
      `${byFrac} within ${FACE_FRAC * 100}% of the face, ${byTwin} exempt as an L-12 mirrored pair`);
  });
});

// ---------------------------------------------------------------------------------------------
// S-42. The role is the palette: css/styles.css maps --cluster-color and its three siblings to the
// tint inside a tinted dialog, so a wrong role does not SPREAD colour and render/palette.test.mjs
// would not catch it (REFACTOR-PLAN III.7). What catches it is this: the role a part carries must
// be the one its category kit binds, and the expectation is obtained by CALLING the kit's own
// constructors, so the four conditions S-42 names stay readable rather than restated.
// ---------------------------------------------------------------------------------------------
// S-42's fourth clause lets a part override the bound role at its own call. That is legal, and it
// is also exactly how P-08 happened (82 chips silently on the cluster palette), so an override
// counts as a decision only once it is WRITTEN DOWN, and this table is where. The unit is the
// (category, kind, role) TRIPLE rather than the card: which kinds a category may paint in which
// foreign colour is the editorial call, so a new card reusing a declared triple needs no edit here
// while a new KIND of override goes red until someone adds it deliberately.
//
// Counts are deliberately not asserted: they move with every card that migrates. A declared triple
// that no card uses is printed instead, and at a category's close-out an unused one is removed.
const CROSS_ROLE = {
  // Workloads cards draw the control plane that acts ON the Pod: Kubelet, the corridor it probes
  // down, and the pipeline ladder narrating Kubelet's work. Those belong to cluster, and painting
  // them workloads blue would claim the Pod admits and restarts itself.
  // `storage` appears on ONE card, workloads-pvc-stickiness: a StatefulSet Pod keeps its PVC, so the
  // volume, its two lanes and its three chips are storage's and are painted jade, not workloads blue.
  workloads: {
    box: ['cluster'], chain: ['cluster'], arrow: ['cluster'],
    lane: ['cluster', 'storage'], relation: ['cluster', 'storage'],
    chip: ['storage'], cylinder: ['storage'],
  },
};

// An override to the EMPTY role is a different decision from an override to a neighbour's colour,
// and reading it through CROSS_ROLE would have said "painted network in the colour ''". It means the
// part carries NO role: a wire drawn before the kit binding existed, which renders with the neutral
// dim arrowhead rather than the category one. Binding it now would swap `arrowhead-dim` for
// `arrowhead-net`, a VISIBLE change, so the migration reproduces the absence and declares it here.
// Same discipline as CROSS_ROLE: the (category, kind) pair is the unit, unused pairs are printed.
const NO_ROLE = {
  network: ['arrow', 'lane', 'relation'],
};

describe('the role binding', () => {
  test('each kit binds a role, gives node none, and gives Pod parts their own', (t) => {
    const findings = [];
    for (const [cat, kit] of kits) {
      const probe = (kind) => kit.P[kind]({}).p;
      const roled = Object.keys(kit.P).filter(k => typeof probe(k).role === 'string' && probe(k).role !== '');
      if (roled.length === 0) findings.push(`${cat}: no part kind carries a bound role, so the role test below is vacuous`);
      // The narrow reading of S-42 the refactor settled on, all three halves of it.
      if ('role' in probe('node')) findings.push(`${cat}: P.node adds role "${probe('node').role}". A node() takes no role (S-42, R6)`);
      const pod = probe('pod');
      const catRole = probe('box').role;
      // A Pod's colour is stated exactly ONCE, and which of the two ways is a fact about the
      // category, not a defect: cluster draws WORKLOADS Pods and must pin the violet itself, while
      // the other three draw their own and must not, since a tint there would restate the category
      // colour in a second place. Written as "one of two shapes" because the first version of this
      // row demanded cluster's shape of all four and no workloads card could ever have passed it.
      if (typeof pod.role !== 'string' || !pod.role) findings.push(`${cat}: P.pod carries no podRole`);
      else if (pod.role === catRole && pod.tint) findings.push(`${cat}: P.pod takes the category's own role "${pod.role}" yet pins tint ${pod.tint}, a second copy of the category colour`);
      else if (pod.role !== catRole && (typeof pod.tint !== 'string' || !pod.tint)) findings.push(`${cat}: P.pod borrows role "${pod.role}" from another category and pins no tint, so its colour is whatever that category paints`);
      t.diagnostic(`${cat}: role "${probe('box').role}" on ${roled.length} kinds, podRole "${pod.role}", tint ${pod.tint}`);
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s) in the kit bindings:\n  ${listing(findings)}`);
  });

  test('every part carries exactly the role its kit binds to its kind', (t) => {
    const findings = [];
    const tally = new Map();
    const used = new Map();
    let walked = 0;
    for (const s of scenes) {
      const kit = kits.get(s.category);
      for (const { kind, p, path } of flat.get(s.id).parts) {
        if (!(kind in kit.P)) { findings.push(`${s.id}  ${path}: kind "${kind}" is not one the kit builds`); continue; }
        walked++;
        const want = kit.P[kind]({}).p;
        const has = 'role' in p, wants = 'role' in want;
        const k = `${kind}:${wants ? want.role : '(none)'}`;
        tally.set(k, (tally.get(k) || 0) + 1);
        if (!wants && has) {
          findings.push(`${s.id}  ${path}: carries role "${p.role}" on a kind the kit gives none`);
        } else if (wants && !has) {
          findings.push(`${s.id}  ${path}: carries no role, the kit binds "${want.role}" to this kind`);
        } else if (wants && p.role !== want.role) {
          // An override is a part painted in another category's colour, so it is a finding UNLESS
          // CROSS_ROLE declares it. That table is the "decision someone wrote down"; before it
          // existed this branch was red for any override at all, which no workloads card survives.
          const triple = `${s.category}.${kind} -> ${p.role || '(none)'}`;
          used.set(triple, (used.get(triple) || 0) + 1);
          if (p.role === '') {
            if (!(NO_ROLE[s.category] || []).includes(kind)) {
              findings.push(`${s.id}  ${path}: drops the role entirely, the kit binds "${want.role}", and no NO_ROLE entry allows ${s.category}.${kind}`);
            }
          } else if (!((CROSS_ROLE[s.category] || {})[kind] || []).includes(p.role)) {
            findings.push(`${s.id}  ${path}: overrides role to "${p.role}", the kit binds "${want.role}", and no CROSS_ROLE entry allows ${s.category}.${kind}`);
          }
        }
        if (kind === 'pod' && p.tint !== want.tint) {
          findings.push(`${s.id}  ${path}: Pod tint is ${p.tint}, the kit binds ${want.tint}`);
        }
      }
    }
    assert.ok(walked > 0, 'no part was checked for a role at all');
    assert.equal(findings.length, 0, `${findings.length} role finding(s) over ${walked} parts:\n  ${listing(findings)}`);
    t.diagnostic([...tally.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} x${n}`).join(', '));
    // The declared inventory, from both sides: what is used, and what is declared and used by
    // nobody. The second list is the one that rots, so it is printed rather than left to be noticed.
    t.diagnostic(`cross-role in use: ${[...used.entries()].map(([k, n]) => `${k} x${n}`).join(', ') || 'none'}`);
    const idle = Object.entries(CROSS_ROLE).flatMap(([cat, kinds]) =>
      Object.entries(kinds).flatMap(([kind, roles]) => roles
        .filter(r => !used.has(`${cat}.${kind} -> ${r}`))
        .map(r => `${cat}.${kind} -> ${r}`)))
      .concat(Object.entries(NO_ROLE).flatMap(([cat, kinds]) => kinds
        .filter(k => !used.has(`${cat}.${k} -> (none)`))
        .map(k => `${cat}.${k} -> (none)`)));
    t.diagnostic(`cross-role declared but unused: ${idle.join(', ') || 'none'}`);
  });
});

// ---------------------------------------------------------------------------------------------
// Every string the card draws on the canvas, and whether it is reachable from SCENE.
//
// The field table is written down rather than discovered, for the reason unit/module.test.mjs
// writes down the controller members: a walk that reads whatever it happens to find goes quiet when
// a kind grows a new text field. The anti-collapse guard is the second list. Every string-valued
// property on a part must be either a text field this file reads or a NON-text field named here, so
// a new one is a red run saying "a string this walk does not read", not a silent gap in coverage.
// ---------------------------------------------------------------------------------------------
const TEXT_FIELDS = {
  box: ['label', 'sublabel'],
  pod: ['label', 'sublabel'],          // inner.label / inner.sublabel handled beside it
  node: ['label'],
  cylinder: ['label'],
  chip: ['name', 'value'],
  chain: ['items'],                    // an array of row strings
  tag: ['text'],
  wire: [],                            // draws only what a step writes, so it needs a key and no more
};
const NON_TEXT_STRINGS = {
  '*': ['key', 'role', 'cls'],
  pod: ['id', 'innerKey', 'shellKey', 'tint'],
  group: ['id', 'transform'],
  packets: ['id'],
  tag: ['anchor'],
  wire: ['anchor'],
  chain: ['anchor'],
  relation: ['dash', 'd'],             // a stroke-dasharray and a path definition, neither read off the canvas
};

describe('the strings the scene draws', () => {
  test('every drawn string SCENE declares is a plain string, and no string field goes unread', (t) => {
    const findings = [];
    const perField = new Map();
    let strings = 0, textParts = 0;
    for (const s of scenes) {
      for (const { kind, key, p, path } of flat.get(s.id).parts) {
        const fields = TEXT_FIELDS[kind];
        const allowed = new Set([...(NON_TEXT_STRINGS['*']), ...(NON_TEXT_STRINGS[kind] || []), ...(fields || [])]);
        for (const [name, v] of Object.entries(p)) {
          if (typeof v !== 'string') continue;
          if (!allowed.has(name)) {
            findings.push(`${s.id}  ${path}: string field "${name}" is one this walk does not read. ` +
              'Add it to TEXT_FIELDS if it is drawn, to NON_TEXT_STRINGS if it is not.');
          }
        }
        if (!fields) continue;
        textParts++;
        let declared = 0;
        for (const f of fields) {
          if (!(f in p)) continue;
          if (f === 'items') {
            if (!Array.isArray(p.items)) { findings.push(`${s.id}  ${path}: items is ${typeof p.items}, expected an array`); continue; }
            if (p.items.length === 0) findings.push(`${s.id}  ${path}: chain declares no row, so it draws nothing`);
            for (const [i, it] of p.items.entries()) {
              if (typeof it !== 'string') { findings.push(`${s.id}  ${path}: chain row ${i} is ${typeof it}, expected a string`); continue; }
              declared++; strings++;
              perField.set('items', (perField.get('items') || 0) + 1);
            }
            continue;
          }
          if (typeof p[f] !== 'string') {
            findings.push(`${s.id}  ${path}: ${f} is ${typeof p[f]}, expected a string. A number renders and ` +
              'then reads as prose to nothing, so no text rule can ever see it.');
            continue;
          }
          declared++; strings++;
          perField.set(f, (perField.get(f) || 0) + 1);
        }
        if (kind === 'pod' && p.inner) {
          for (const f of ['label', 'sublabel']) {
            if (!(f in p.inner)) continue;
            if (typeof p.inner[f] !== 'string') { findings.push(`${s.id}  ${path}: inner.${f} is ${typeof p.inner[f]}`); continue; }
            declared++; strings++;
            perField.set(`inner.${f}`, (perField.get(`inner.${f}`) || 0) + 1);
          }
        }
        // A part that can draw text, declares none and carries no key is a blank nothing can ever
        // fill: writeStatics reaches a part only through refs[key]. cluster-cpu-throttling declares
        // three captions with no text and all three carry a key, which is the legal form.
        if (declared === 0 && !key) {
          findings.push(`${s.id}  ${path}: draws no declared text and has no key, so no step can write one`);
        }
      }
    }
    assert.ok(strings > 0, 'zero drawn strings found in any SCENE: the text fields were renamed and this rule is blind');
    assert.equal(findings.length, 0, `${findings.length} finding(s) over ${textParts} text-bearing parts:\n  ${listing(findings)}`);
    t.diagnostic(`${strings} drawn strings declared in SCENE over ${textParts} text-bearing parts: ` +
      [...perField.entries()].sort((a, b) => b[1] - a[1]).map(([f, n]) => `${f} ${n}`).join(', '));
  });

  // The other half of the same question. A step writes a label, a sublabel, a chip value, a Pod
  // sublabel or a wire THROUGH A KEY, and every writer in step-spec.js is guarded (`if (el)`,
  // `if (node && node.valueText)`), so a key naming nothing draws nothing and says nothing. The
  // kind matters as much as the key: setBoxLabel wants a .scheme-box-label, setVal wants the
  // valueText a valChip carries, so a chip write aimed at a box is the same silent blank.
  // A `raw` part is an element built by a function this file cannot read, so its SHAPE is unknown
  // rather than wrong, and answering "wrong" would be the check overstating what it knows. The
  // declared alternative, same discipline as CROSS_ROLE: name the raw that deliberately imitates a
  // kind, and it is judged AS that kind. Unused entries are printed, so one cannot rot unnoticed.
  const RAW_SHAPED_AS = {
    // The flat-network band is a hand-forged g.scheme-box: it holds a .scheme-box-sublabel child of
    // its own, which is why setBoxSublabel reaches it and six steps write through it.
    'network-model.bus': 'box',
    // The Pod shell here is primitives.pod(), not podShell() + inner: it writes an inline fill on
    // .scheme-pod-rect that dom-dump serialises, and the card hangs TWO sibling containers off it.
    'network-pod-ip-and-veth.podShell': 'podShell',
  };

  test('every string a step writes lands on a part of the scene that can hold it', (t) => {
    const WRITERS = {
      chips: { kinds: ['chip'], via: 'setVal / setChip, which need the valueText only a valChip carries' },
      chipsCued: { kinds: ['chip'], via: 'setChip' },
      labels: { kinds: ['box'], via: 'setBoxLabel, which queries .scheme-box-label' },
      sublabels: { kinds: ['box'], via: 'setBoxSublabel, which queries .scheme-box-sublabel' },
      podSublabels: { kinds: ['pod', 'podShell'], via: 'setPodSublabel, which queries .scheme-pod-sublabel' },
    };
    const findings = [];
    const usedShapes = new Set();
    let writes = 0;
    for (const s of scenes) {
      const { refs, wires, escaped } = refUniverse(flat.get(s.id).parts);
      for (const [where, o] of writeBlocks(s.STEPS_SPEC)) {
        for (const [field, { kinds, via }] of Object.entries(WRITERS)) {
          for (const k of Object.keys(o[field] || {})) {
            writes++;
            if (escaped.has(k)) continue;              // built by an escape: unreadable, never a finding
            const shaped = RAW_SHAPED_AS[`${s.id}.${k}`];
            if (shaped) usedShapes.add(`${s.id}.${k}`);
            const kind = shaped && refs.get(k) === 'raw' ? shaped : refs.get(k);
            if (!kind) findings.push(`${s.id}  ${where} writes ${field}.${k}, and no part of the scene answers to "${k}"`);
            else if (!kinds.includes(kind)) {
              findings.push(`${s.id}  ${where} writes ${field}.${k} onto a ${kind}. It needs ${kinds.join(' or ')}: ${via}`);
            }
          }
        }
        // setWire reads the OTHER bucket, refs.wires, so this resolves against the P.wire keys.
        for (const k of Object.keys(o.wires || {})) {
          writes++;
          if (!wires.has(k)) findings.push(`${s.id}  ${where} writes wire "${k}", which no P.wire declares`);
        }
      }
    }
    assert.ok(writes > 0, 'no step writes a single string through a key: this rule is asserting nothing');
    assert.equal(findings.length, 0, `${findings.length} write(s) that draw nothing:\n  ${listing(findings)}`);
    t.diagnostic(`${writes} step string writes, every one landing on a part that can hold it`);
    const idleShapes = Object.keys(RAW_SHAPED_AS).filter(k => !usedShapes.has(k));
    t.diagnostic(`raw parts judged as another kind: ${usedShapes.size} in use` +
      (idleShapes.length ? `, DECLARED AND UNUSED: ${idleShapes.join(', ')}` : ''));
  });

  test('the escape hooks are the only place a drawn string can hide, and each is a real hook', (t) => {
    const findings = [];
    let raws = 0, tunes = 0, assigned = 0;
    const cardsWith = new Set();
    for (const s of scenes) {
      for (const { kind, p, path } of flat.get(s.id).parts) {
        if (kind === 'raw') {
          raws++; cardsWith.add(s.id);
          if (typeof p.make !== 'function' && p.el === undefined) {
            findings.push(`${s.id}  ${path}: a raw part with neither make() nor el builds nothing`);
          }
        }
        if (p.tune !== undefined) {
          tunes++; cardsWith.add(s.id);
          if (typeof p.tune !== 'function') findings.push(`${s.id}  ${path}: tune is ${typeof p.tune}, expected a function`);
        }
      }
      assigned += refUniverse(flat.get(s.id).parts).escaped.size;
    }
    assert.equal(findings.length, 0, `${findings.length} malformed escape(s):\n  ${listing(findings)}`);
    t.diagnostic(`${raws} raw parts and ${tunes} tune hooks in ${cardsWith.size} of ${scenes.length} cards, ` +
      `assigning ${assigned} refs this file can only see by name`);
  });
});

// ---------------------------------------------------------------------------------------------
// reset, S-11's prologue read as data. `keys` and `pods` are written out and never inferred (see
// the note in lib/scene-spec.js: inferring pods would add a clearPodHighlight that wipes four
// inline styles), so nothing keeps them honest except a test that resolves them.
// ---------------------------------------------------------------------------------------------
describe('the reset prologue', () => {
  test('every reset key and every reset pod names a part of the scene', (t) => {
    const findings = [];
    let keys = 0, pods = 0;
    for (const s of scenes) {
      const { refs, wires, escaped } = refUniverse(flat.get(s.id).parts);
      const reset = s.SCENE.reset || {};
      if (!s.SCENE.reset) findings.push(`${s.id}  declares no reset, so resetStep clears nothing`);
      for (const [field, list] of [['keys', reset.keys || []], ['pods', reset.pods || []]]) {
        for (const k of list) {
          field === 'keys' ? keys++ : pods++;
          if (refs.has(k) || escaped.has(k)) continue;
          const hint = wires.has(k) ? ' It is a WIRE key, and clearHighlights reads refs, not refs.wires.' : '';
          findings.push(`${s.id}  reset.${field} names "${k}", which no part and no escape hook creates.${hint}`);
        }
      }
      if (reset.extra !== undefined && typeof reset.extra !== 'function') {
        findings.push(`${s.id}  reset.extra is ${typeof reset.extra}, expected a function`);
      }
    }
    assert.ok(keys > 0, 'not one reset key over the whole population: this rule is asserting nothing');
    assert.equal(findings.length, 0, `${findings.length} unresolved reset entr(ies):\n  ${listing(findings)}`);
    t.diagnostic(`${keys} reset keys and ${pods} reset pods, all resolved`);
  });

  // The leak this catches: a step lights a part, resetStep does not clear it, and the highlight
  // survives into every later step. It is invisible to the oracle on the animated path and to the
  // eye on a card played straight through, because the wrong block is lit in a step that also has
  // a right one.
  test('every part a step lights is cleared by the reset', (t) => {
    const findings = [];
    let lit = 0;
    for (const s of scenes) {
      const { refs, escaped } = refUniverse(flat.get(s.id).parts);
      const cleared = new Set(s.SCENE.reset && s.SCENE.reset.keys ? s.SCENE.reset.keys : []);
      for (const [i, spec] of (s.STEPS_SPEC || []).entries()) {
        if (!spec) continue;
        const where = `step ${i} "${spec.id}"`;
        // Three ways a step lights something, and all three end in classList.add('highlight'):
        // the static `lit`, the reduced-path `reducedLit`, and lightBoxAt behind a flow entry.
        const sources = [['lit', spec.lit || []], ['reducedLit', spec.reducedLit || []]];
        for (const [j, e] of (spec.flow || []).entries()) {
          if (!e || !e.p) continue;
          const keys = e.verb === 'light' ? (e.p.targets || []) : (e.p.lights || []);
          if (keys.length) sources.push([`flow[${j}] ${e.verb}`, keys]);
          // `unlight` is NOT a fourth source: it REMOVES a highlight and cannot cause the leak
          // above. Counting it flagged storage-pvc-protection, whose four unlights name targets no
          // step ever lights, and the only honest repair (dropping them) flips anim-dump's
          // `onfinish` boolean, so a dead unlight is not free to delete either. A live one names a
          // key some other source already names, so nothing is lost by leaving it out.
        }
        for (const [field, keys] of sources) {
          for (const k of keys) {
            lit++;
            // The chain is cleared by its own sweep inside clearHighlights, row by row, so it is
            // never in reset.keys and must not be reported as a leak.
            if (k === 'chain' || cleared.has(k)) continue;
            if (!refs.has(k) && !escaped.has(k)) {
              findings.push(`${s.id}  ${where} ${field} names "${k}", which no part of the scene answers to`);
              continue;
            }
            findings.push(`${s.id}  ${where} lights "${k}" via ${field}, and reset.keys does not clear it`);
          }
        }
      }
    }
    assert.ok(lit > 0, 'no step lights anything: this rule is asserting nothing');
    assert.equal(findings.length, 0, `${findings.length} highlight(s) that outlive their step:\n  ${listing(findings)}`);
    t.diagnostic(`${lit} highlight targets across lit, reducedLit and flow, all cleared by their reset`);
  });
});

// ---------------------------------------------------------------------------------------------
// The rest of what a scene declares and a test can settle without a browser.
// ---------------------------------------------------------------------------------------------
describe('scene shape', () => {
  test("every scene carries its own aria-label", (t) => {
    const findings = [];
    const byLabel = new Map();
    for (const s of scenes) {
      const al = s.SCENE['aria-label'];
      if (typeof al !== 'string' || !al.trim()) {
        findings.push(`${s.id}  aria-label is ${typeof al === 'string' ? 'blank' : typeof al}`);
        continue;
      }
      if (byLabel.has(al)) findings.push(`${s.id}  shares its aria-label with ${byLabel.get(al)}: "${al}"`);
      byLabel.set(al, s.id);
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    t.diagnostic(`${byLabel.size} distinct aria-labels over ${scenes.length} scenes, ` +
      `${Math.min(...[...byLabel.keys()].map(l => l.length))} to ${Math.max(...[...byLabel.keys()].map(l => l.length))} chars`);
  });

  // S-07's readable half plus the ref bucket. One packet layer, because buildScene assigns
  // refs.packetLayer and the second one silently wins; one arrowDefs, because five markers declared
  // twice is two ids in one document.
  test('one defs, one packet layer, and no key claimed twice', (t) => {
    const findings = [];
    let defs = 0, packets = 0;
    for (const s of scenes) {
      const parts = flat.get(s.id).parts;
      const d = parts.filter(p => p.kind === 'defs').length;
      const k = parts.filter(p => p.kind === 'packets').length;
      defs += d; packets += k;
      if (d !== 1) findings.push(`${s.id}  declares ${d} defs part(s), expected exactly 1`);
      if (k !== 1) findings.push(`${s.id}  declares ${k} packet layer(s), expected exactly 1`);
      const seen = new Map();
      for (const { kind, key, p, path } of parts) {
        const bucket = kind === 'wire' ? 'wires' : 'refs';
        for (const [name, src] of [[key, kind], [p.innerKey, 'innerKey'], [p.shellKey, 'shellKey']]) {
          if (!name) continue;
          const at = src === kind ? bucket : 'refs';
          const id = `${at}:${name}`;
          if (seen.has(id)) findings.push(`${s.id}  ${path}: key "${name}" is already claimed by ${seen.get(id)}, ` +
            'and the later part silently replaces the earlier ref');
          seen.set(id, path);
        }
      }
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    t.diagnostic(`${defs} arrowDefs and ${packets} packet layers over ${scenes.length} scenes, no key claimed twice`);
  });

  // A declared opacity is written into style.opacity through String(v), so a string or a value out
  // of range paints without complaint and render/opacity.test.mjs then compares it to a token.
  test('every opacity a part declares is a number between 0 and 1', (t) => {
    const findings = [];
    let declared = 0;
    for (const s of scenes) {
      for (const { p, path } of flat.get(s.id).parts) {
        if (p.opacity === undefined) continue;
        declared++;
        if (typeof p.opacity !== 'number' || !Number.isFinite(p.opacity) || p.opacity < 0 || p.opacity > 1) {
          findings.push(`${s.id}  ${path}: opacity is ${JSON.stringify(p.opacity)}`);
        }
      }
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    t.diagnostic(`${declared} opacities declared in SCENE, all numeric and in range`);
  });
});
