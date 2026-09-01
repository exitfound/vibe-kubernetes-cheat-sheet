// geometry.test.mjs: the three geometry rules that guard the gate today, measured in viewBox units
// over every step of every card. Successor of the ENFORCED half of tools/check-geometry.mjs
// (`--rules=diagonal,through,offedge` in tools/package.json), same tolerances, same verdicts.
//
//   DIAGONAL (L-09)  every segment of a lane is horizontal or vertical.
//   THROUGH  (L-10)  no segment crosses a block it does not terminate on.
//   OFFEDGE  (L-11)  an endpoint sits on a block face MIDPOINT, not at a hand-typed coordinate
//                    near one. L-12: two endpoints on ONE face at mirrored offsets (+d and -d,
//                    any d) are a deliberate lane pair and not a finding, and the pair is judged
//                    over the whole card because its halves may live in different steps.
//
// THE OTHER THREE RULES OF THE SAME CHECK ARE NOT HERE, AND THAT SPLIT IS THE POINT.
// CENTRE (L-13), CENTRE-LOW (L-14) and OCCLUDED (L-15) live in report/geometry-soft.test.mjs and
// never fail a run. L-16 says a finding that can only be closed by making the picture worse stays
// OPEN, and the four card records carry such findings today. Promoting those three rules into this
// file would turn a documented, deliberate set of exceptions into a red gate for nobody's work.
// The line is the check's own and not this file's: of its six rules, three gate and three report.
//
// Why the browser and not the source. The numbers a card types are in its own coordinate system:
// primitives are translated groups, so a bbox and a path only become comparable after both are
// mapped through the element-to-root matrix. A source lint would also have to evaluate the layout
// arithmetic (SLOT_X(i), CX - COL_W / 2) to know where anything actually lands. Wave 2 can read the
// declared SCENE, but the mapping is still the browser's answer.
//
// Sampled on the STATIC path (gotoStep), which is what prev and reset replay: every enter() runs
// with ctx.reduced, so a step settles at its final state with no animation in flight. Geometry is a
// question about resting positions, and a frozen mid-flight packet is neither a lane nor a block.
//
// Scope, inherited from the original and deliberate:
//   - the packet layer is excluded everywhere (#packetLayer): a ball is motion, not a lane.
//   - blocks are .scheme-box, .scheme-pod, .scheme-cylinder and .scheme-node. Chips and captions
//     are not blocks: lanes never route near them, and a lane ending on a chip is not a defect.
//   - a .scheme-node frame is measured but never counted as CROSSED (L-10's own note): it is a
//     container lanes are supposed to run inside to reach the blocks it holds. It still counts as
//     an OFFEDGE face, because an endpoint landing on a frame edge is a real endpoint.
//   - a curved path (QqCcSsTtAa) is skipped whole: it makes no straight-segment claim.
//   - every M starts a NEW polyline. Reading `d` as one flat list of numbers fabricates a segment
//     between subpaths, and those phantoms were the entire DIAGONAL report before the original
//     check learned to split on M.
//
// One viewport, 1600x1000. The standard set (L-06) is three, but only the narration panel moves
// with the viewport, and none of these three rules reads the panel. Blocks and lanes are viewBox
// geometry: the SVG scales as a whole, so the same numbers come back at any size. The report file
// is where the viewport set matters, because OCCLUDED is about the panel.
//
// FONTS FIRST (L-21). A block's bbox is the bbox of its GROUP, label and sublabel included, so a
// block measured before the webfont arrives is measured on the fallback face, which is about 20
// percent narrower and flatters every centring and clearance number taken off it. NEVER measure
// geometry without waiting for the real face: a run that does not wait reports numbers taken on
// whatever face happened to be resolved, and nothing in its output says which one that was. The
// guard is fixtures/render.mjs fallbackFaces(), a behavioural width probe, and it is behavioural
// because neither document.fonts.ready nor document.fonts.check() can answer this: with the font
// hosts unreachable the stylesheet never attaches, so there is no @font-face rule to be missing and
// check() returns true for every family including invented ones. The full measurement is in the
// comment on that function. Here it is an ASSERTION: a missing face fails the run.
//   Measured, and it is worth knowing which way: with fonts.gstatic.com blocked, the content span
//   of every card is UNCHANGED, because no card has a label wider than the rect around it, so a
//   block's bbox is its rect either way. The panel is the font-sensitive part (one text line, 17.5
//   units, on 3 of 6 cards sampled), and the panel belongs to report/geometry-soft.test.mjs. The
//   guard stays here regardless: "no card overflows its rect today" is a fact about the catalog,
//   not a property of these rules, and the first card that does would silently move a face.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census, floor } from '../fixtures/catalog.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import { readSnapshot } from '../fixtures/snapshot.mjs';
import { vpName, VIEWPORTS } from '../tools/walk.mjs';

// ---------------------------------------------------------------------------------------------
// Control numbers, taken off a green run of the whole catalog, clean on [DIAGONAL, THROUGH, OFFEDGE].
// They are FLOORS, not equalities. A run that walks fewer cards or fewer steps than this has
// scanned a subset, and a subset that passes is worse than a red run; a card added later is a
// legitimate widening and must not turn this file red by itself. The card count is additionally
// pinned to data.js exactly, through census().
// ---------------------------------------------------------------------------------------------
// The walk baseline, DERIVED rather than typed: the catalog it walks and the specs it reads are
// what say how big a whole walk is (CATALOG_BASELINE in ../fixtures/catalog.mjs).
const EXPECTED_CARDS = floor((await cards()).length);
const EXPECTED_STEPS = floor(await stepTotal());

// Tolerances, all four carried over unchanged from check-geometry.mjs:6-13. Every one of them is a
// decision about what counts as deliberate, so none of them is a free parameter to retune here.
const TOL = 6;              // slack on a face midpoint, in viewBox units
const EDGE_TOL = 2;         // how close a point must be to a face to count as sitting ON it
const TWIN_TOL = 2;         // how exactly two mirrored offsets must cancel to read as a pair (L-12)
const FACE_FRAC = 0.18;     // an offset up to 18% of the face it sits on is not a stray coordinate
const AXIS_EPS = 0.01;      // a segment is axis-aligned within this, in viewBox units
const THROUGH_INSET = 3;    // the rect THROUGH tests is shrunk by this on each side

// L-06's first row. See the header for why one viewport answers all three rules.
const VIEWPORT = VIEWPORTS[0];
const VP = vpName(VIEWPORT);

// ---------------------------------------------------------------------------------------------
// The probe. Runs IN THE PAGE, so it closes over nothing: it is serialised by page.evaluate.
//
// The PROBE stays local, and for the reason it always did: the three files that read this picture
// read different halves of it (this one wants lanes and blocks, report/geometry-soft wants blocks,
// chips and the narration panel, report/arrival wants blocks and route endpoints), so a probe wide
// enough for all three would be a fourth definition none of them uses whole.
//
// What is NOT local any more is the root-space mapping the three of them each had a copy of. It
// lives in fixtures/render.mjs as rootBBox and reaches the page as window.__toRoot, which
// installGeometryHelpers() writes before the first navigation.
// ---------------------------------------------------------------------------------------------

// Does segment (a,b) pass through the INTERIOR of rect r? An endpoint resting on a face does not
// count, and neither does an endpoint inside the block: a lane terminating on a container inside a
// Pod shell is an arrival, which is how storage cards are drawn. Both segments are axis-aligned by
// the time this matters (a diagonal is its own finding), so an overlap test against the shrunk
// rect is the whole of it.
function crosses(a, b, r, tol) {
  const x0 = r.x + tol, x1 = r.x + r.w - tol, y0 = r.y + tol, y1 = r.y + r.h - tol;
  if (x1 <= x0 || y1 <= y0) return false;
  const inside = p => p[0] > x0 && p[0] < x1 && p[1] > y0 && p[1] < y1;
  if (inside(a) || inside(b)) return false;
  if (Math.abs(a[0] - b[0]) < AXIS_EPS) {                   // vertical
    if (a[0] <= x0 || a[0] >= x1) return false;
    const lo = Math.min(a[1], b[1]), hi = Math.max(a[1], b[1]);
    return lo < y1 && hi > y0;
  }
  if (Math.abs(a[1] - b[1]) < AXIS_EPS) {                   // horizontal
    if (a[1] <= y0 || a[1] >= y1) return false;
    const lo = Math.min(a[0], b[0]), hi = Math.max(a[0], b[0]);
    return lo < x1 && hi > x0;
  }
  return false;
}

const catalogued = await cards();

// THE BROWSER IS NOT DRIVEN HERE ANY MORE. `tools/walk.mjs` opens each card once for the whole
// suite and takes this reading with the rest. The probe moved into fixtures/probes.mjs as
// `geometryProbe`, verbatim, and with it went the ONE-RETRY guard and the block extraction that
// report/geometry-soft.test.mjs held a byte-identical copy of. The walk runs it at VIEWPORT.
const snap = readSnapshot();
const ids = snap.ids;

test(`the grid renders the whole catalog (${catalogued.length} cards)`, () => {
  assert.ok(ids.length > 0, `NO CARDS RENDERED at ${snap.base}/scheme/ : posters or grid broken`);
  census('geometry grid', ids.length, catalogued.length);
});

let walked = 0, sampled = 0, laneCount = 0, blockCount = 0;
const dirty = [];

for (const id of ids) {
  test(id, async () => {
    walked++;                    // counted before the assertions, so this stays a census of
                                 // COVERAGE and a broken card is reported once, as itself.
    const card = snap.cards[id];
    // L-21, and it fails the run rather than warning: a missing face is not a card defect, it is a
    // run whose every number is wrong in the same direction, and a quiet 20 percent is exactly the
    // kind of error that gets believed.
    const fellBack = card.fellBack;
    assert.deepEqual(fellBack, [],
      `THE FONTS ARE NOT THE REAL ONES, so this run measures the FALLBACK face:\n  ` +
      `${fellBack.join('\n  ')}\n` +
      'Every bbox in this run is taken on a face about 20 percent narrower (L-21), which flatters ' +
      'every centring and clearance number. This is a finding about the RUN, almost always no ' +
      'network reaching fonts.googleapis.com / fonts.gstatic.com, and NOT about this card. ' +
      'Nothing here is a defect in the diagram: restore the network and run again.');
    const total = card.steps;
    assert.ok(total > 0, `stepCount is ${total}: no steps to walk`);

    const seen = new Set();
    const issues = [];
    // Pooled over the whole card, because L-12 is: a lane pair whose halves are drawn in different
    // steps is still a pair. The key is the block's GEOMETRY and not its index, since the block
    // array is rebuilt on every step and its order is not stable.
    const faceHits = new Map();

    for (let i = 0; i < total; i++) {
      const data = card.byVp[VP][i].lanes;
      if (!data) continue;
      sampled++;
      laneCount += data.lanes.length;
      blockCount += data.blocks.length;

      for (const pts of data.lanes) {
        for (let k = 0; k + 1 < pts.length; k++) {
          const a = pts[k], b = pts[k + 1];
          const dx = Math.abs(a[0] - b[0]), dy = Math.abs(a[1] - b[1]);
          if (dx > AXIS_EPS && dy > AXIS_EPS) {
            const key = `DIAGONAL ${a} -> ${b}`;
            if (!seen.has(key)) {
              seen.add(key);
              issues.push(`DIAGONAL  step ${i}: segment (${a}) -> (${b}) is neither horizontal nor vertical`);
            }
          }
          for (const r of data.blocks) {
            if (r.isFrame) continue;
            if (!crosses(a, b, r, THROUGH_INSET)) continue;
            const key = `THROUGH ${a}-${b} ${r.label}`;
            if (!seen.has(key)) {
              seen.add(key);
              issues.push(`THROUGH   step ${i}: segment (${a}) -> (${b}) crosses block "${r.label}" ` +
                `[${r.x.toFixed(0)}..${(r.x + r.w).toFixed(0)} x ${r.y.toFixed(0)}..${(r.y + r.h).toFixed(0)}]`);
            }
          }
        }
        // Endpoint-on-face accumulation only. The verdict waits until every step has been walked.
        for (const p of [pts[0], pts[pts.length - 1]]) {
          for (const r of data.blocks) {
            const my = r.y + r.h / 2, mx = r.x + r.w / 2;
            const onV = (Math.abs(p[0] - r.x) < EDGE_TOL || Math.abs(p[0] - (r.x + r.w)) < EDGE_TOL) &&
              p[1] > r.y - EDGE_TOL && p[1] < r.y + r.h + EDGE_TOL;
            const onH = (Math.abs(p[1] - r.y) < EDGE_TOL || Math.abs(p[1] - (r.y + r.h)) < EDGE_TOL) &&
              p[0] > r.x - EDGE_TOL && p[0] < r.x + r.w + EDGE_TOL;
            const gk = `${r.x.toFixed(0)},${r.y.toFixed(0)},${r.w.toFixed(0)},${r.h.toFixed(0)}`;
            const push = (face, off, axis) => {
              const k = `${gk}:${face}`;
              if (!faceHits.has(k)) faceHits.set(k, []);
              faceHits.get(k).push({ off, p, r, axis, step: i });
            };
            if (onV) push(Math.abs(p[0] - r.x) < EDGE_TOL ? 'left' : 'right', p[1] - my, 'v');
            if (onH) push(Math.abs(p[1] - r.y) < EDGE_TOL ? 'top' : 'bottom', p[0] - mx, 'h');
          }
        }
      }
    }

    // OFFEDGE verdicts. An endpoint is a defect only if it is ALONE on its face: a mirrored sibling
    // (+d against -d) means the two are a deliberate lane pair (L-12), whatever d is. The numeric
    // whitelist this replaced hid unpaired endpoints that happened to sit at a whitelisted value.
    for (const hits of faceHits.values()) {
      for (const h of hits) {
        const off = Math.abs(h.off);
        if (off <= TOL) continue;                                   // on the midpoint, near enough
        const face = h.axis === 'v' ? h.r.h : h.r.w;
        if (off / face <= FACE_FRAC) continue;                      // a small share of a long face
        if (hits.some(o => o !== h && Math.abs(o.off + h.off) <= TWIN_TOL)) continue;   // L-12 pair
        const r = h.r;
        const mid = h.axis === 'v' ? (r.y + r.h / 2) : (r.x + r.w / 2);
        const key = `OFFEDGE ${h.p} ${r.label} ${h.axis}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const where = h.axis === 'v' ? 'side edge' : 'top/bottom edge';
        const axisName = h.axis === 'v' ? 'y' : 'x';
        issues.push(`OFFEDGE   step ${h.step}: endpoint (${h.p}) alone on "${r.label}" ${where}, ` +
          `${off.toFixed(0)} off its midpoint ${axisName}=${mid.toFixed(0)} ` +
          `(${(100 * off / face).toFixed(0)}% of a ${face.toFixed(0)} face)`);
      }
    }

    if (issues.length) dirty.push(id);
    assert.equal(issues.length, 0,
      `${issues.length} finding(s) over ${total} steps:\n  ${issues.join('\n  ')}`);
  });
}

test('every catalogued card was walked, every step was sampled, and all of them are clean', (t) => {
  t.diagnostic(`geometry: ${walked} cards, ${sampled} steps, ${laneCount} lane polylines, ` +
    `${blockCount} block samples at ${VIEWPORT.width}x${VIEWPORT.height}`);
  census('geometry walked', walked, catalogued.length);
  assert.ok(walked >= EXPECTED_CARDS,
    `walked ${walked} card(s), the catalog had ${EXPECTED_CARDS} when this floor was measured. ` +
    'A shrunken walk is a subset, and a subset that passes is worse than a red run.');
  assert.ok(sampled >= EXPECTED_STEPS,
    `sampled ${sampled} step(s), expected at least ${EXPECTED_STEPS}. ` +
    'A step goes missing when a card fails to build or the debug handle is absent, and every ' +
    'missing step is geometry nobody looked at.');
  // The control number itself, in the words the run prints. The per-card tests above have
  // already failed by the time this line disagrees with them: it is here so a reader of the last
  // line of the run sees the claim being made, not just the absence of a failure.
  assert.deepEqual(dirty, [],
    `${dirty.length} card(s) are not clean on [DIAGONAL, THROUGH, OFFEDGE]: ${dirty.join(', ')}`);
});
