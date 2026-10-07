// DIAGONAL (L-09), THROUGH (L-10) and OFFEDGE (L-11 with L-12 pairs pooled per card) over every step
// at 1600x1000, on the static path, in root space. The packet layer and curves are excluded, a node
// frame is a face but never an obstacle. A fallback face fails the run (L-21).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census, floor } from '../fixtures/catalog.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import { readSnapshot } from '../fixtures/snapshot.mjs';
import { vpName, VIEWPORTS } from '../tools/walk.mjs';

// Floors from a full walk: a subset that passes is worse than a red run.
const EXPECTED_CARDS = floor((await cards()).length);
const EXPECTED_STEPS = floor(await stepTotal());

// Every tolerance is a decision about what counts as deliberate, not a free parameter.
const TOL = 6;              // slack on a face midpoint, in viewBox units
const EDGE_TOL = 2;         // how close a point must be to a face to count as sitting ON it
const TWIN_TOL = 2;         // how exactly two mirrored offsets must cancel to read as a pair (L-12)
const FACE_FRAC = 0.18;     // an offset up to 18% of the face it sits on is not a stray coordinate

// L-11: on a Node FRAME face an endpoint may sit level with the centre of a block the frame holds.
function aimedAtHeld(p, f, axis, blocks) {
  return blocks.some(b => !b.isFrame &&
    b.x >= f.x - EDGE_TOL && b.x + b.w <= f.x + f.w + EDGE_TOL &&
    b.y >= f.y - EDGE_TOL && b.y + b.h <= f.y + f.h + EDGE_TOL &&
    Math.abs((axis === 'v' ? p[1] - (b.y + b.h / 2) : p[0] - (b.x + b.w / 2))) <= TOL);
}
const AXIS_EPS = 0.01;      // a segment is axis-aligned within this, in viewBox units
const THROUGH_INSET = 3;    // the rect THROUGH tests is shrunk by this on each side

const VIEWPORT = VIEWPORTS[0];
const VP = vpName(VIEWPORT);

// An endpoint on a face or inside the block (an arrival) does not count. Diagonals are their own finding.
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

// The probe is geometryProbe in fixtures/probes.mjs, run by tools/walk.mjs.
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
    walked++;                    // counted before the assertions, so a broken card is reported once, as itself
    const card = snap.cards[id];
    // L-21 fails the run: every number on a fallback face is wrong in the same direction.
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
    // Pooled over the card (L-12), keyed by block geometry since the block array order is unstable.
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
              faceHits.get(k).push({ off, p, r, axis, step: i, blocks: data.blocks });
            };
            if (onV) push(Math.abs(p[0] - r.x) < EDGE_TOL ? 'left' : 'right', p[1] - my, 'v');
            if (onH) push(Math.abs(p[1] - r.y) < EDGE_TOL ? 'top' : 'bottom', p[0] - mx, 'h');
          }
        }
      }
    }

    // An endpoint is a defect only alone on its face: a mirrored +d/-d sibling is an L-12 pair.
    for (const hits of faceHits.values()) {
      for (const h of hits) {
        const off = Math.abs(h.off);
        if (off <= TOL) continue;                                   // on the midpoint, near enough
        const face = h.axis === 'v' ? h.r.h : h.r.w;
        if (off / face <= FACE_FRAC) continue;                      // a small share of a long face
        if (hits.some(o => o !== h && Math.abs(o.off + h.off) <= TWIN_TOL)) continue;   // L-12 pair
        if (h.r.isFrame && aimedAtHeld(h.p, h.r, h.axis, h.blocks)) continue;          // L-11 frame face
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
  // The claim in the words the run prints, for a reader of the last line.
  assert.deepEqual(dirty, [],
    `${dirty.length} card(s) are not clean on [DIAGONAL, THROUGH, OFFEDGE]: ${dirty.join(', ')}`);
});
