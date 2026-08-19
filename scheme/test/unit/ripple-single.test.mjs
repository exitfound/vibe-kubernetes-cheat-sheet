// ripple-single.test.mjs: two rings on one pixel in one millisecond, promoted out of
// ../report/ripple-double.test.mjs on 2026-08-17 when its queue reached zero.
//
// `M-14` is "every ball ripples at its destination, on the millisecond it lands", and
// render/motion.test.mjs asks whether a ripple EXISTS, never how many. Where two rings start on the
// same point at the same millisecond they stack, and the composite alpha is visibly higher than one:
// measured 0.902 against 0.631, against a prediction of 0.905 that matched to 0.003.
//
//   RING-SINGLE  no two rings start on one point in the same millisecond, or the pair carries a
//                written ruling.
//
// ===========================================================================================
// WHY dt === 0 ONLY
// ===========================================================================================
// The report prints three tiers and this asserts one. STAGGERED (7 pairs) is two rings sharing a
// point INSIDE the 560ms a ring lives but starting apart, which is a legitimate second arrival at the
// same place and reads as one: it is context, and the report says so. NEAR is the same question at a
// tolerance. Only dt === 0 is two rings drawn as one thicker ring, which no card ever means.
//
// The original four were all one shape and all on network-service-cidr: an `F.ripple` naming the last
// point of a route in its own step at that route's own arrival, where `packetAlong` already fires
// `arrivalRipple`. The repair was to delete the redundant verb, not to retime anything, so no arrival
// moved and `M-14` was never in question.
//
// ===========================================================================================
// WHAT THIS FILE IS BLIND TO
// ===========================================================================================
//   - A RING FIRED FROM AN ESCAPE. `step.enter` and `F.run` are function bodies, so an
//     arrivalRipple() called inside one is invisible to a reader of the flow as data.
//   - WHETHER THE RING BELONGS THERE AT ALL. That is `M-14` and `M-10`, and a rendered ring carries
//     no record of which wrapper made it: render/motion.test.mjs owns the existence question.
//   - RIPPLE_MS. The window is a second copy of a number `arrivalRipple` does not export, asserted in
//     the report file so a stale window cannot go quiet. This file inherits it from the fixture.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { importAll, stepTotal } from '../fixtures/module.mjs';
import { timelineOf } from '../fixtures/spec.mjs';
import { routeDur, REVEAL_MS, BEAT } from '../../js/lib/scheme-kit.js';
import { RIPPLE_CARRIED, ringOf, at } from '../fixtures/ripple-double.mjs';

// The walk baseline, DERIVED rather than typed: the catalog it walks and the specs it reads are
// what say how big a whole walk is (CATALOG_BASELINE in ../fixtures/catalog.mjs).
const EXPECTED_CARDS = (await cards()).length;
const EXPECTED_STEPS = await stepTotal();
const KIT = { routeDur, REVEAL_MS, BEAT };

const catalogued = await cards();
const modules = await importAll();

function walk() {
  const pairs = [];
  let walked = 0, steps = 0, rings = 0;
  for (const c of catalogued) {
    const ns = modules.get(c.id);
    if (!ns || !Array.isArray(ns.STEPS_SPEC)) continue;
    walked++;
    for (const s of ns.STEPS_SPEC) {
      steps++;
      const rows = timelineOf(s.flow, KIT);
      if (rows === null) continue;                  // unit/spec-steps.test.mjs owns that finding
      const byPoint = new Map();
      for (const row of rows) {
        const ring = ringOf(row);
        if (!ring) continue;
        rings++;
        if (!byPoint.has(at(ring.pt))) byPoint.set(at(ring.pt), []);
        byPoint.get(at(ring.pt)).push(ring);
      }
      for (const [pt, list] of byPoint) {
        list.sort((a, b) => a.t - b.t);
        for (let i = 1; i < list.length; i++) {
          if (list[i].t - list[i - 1].t !== 0) continue;   // STAGGERED is the report's tier
          pairs.push({ card: c.id, step: s.id, pt, t: list[i].t });
        }
      }
    }
  }
  return { pairs, walked, steps, rings };
}

const W = walk();

test('RING-SINGLE: no two arrival rings start on one point in the same millisecond', (t) => {
  assert.ok(W.walked >= EXPECTED_CARDS,
    `walked ${W.walked} card(s), the catalog holds ${EXPECTED_CARDS}. A shrunken walk finds few ` +
    'pairs and reads exactly like a clean catalog.');
  assert.ok(W.steps >= EXPECTED_STEPS, `read ${W.steps} step(s), expected at least ${EXPECTED_STEPS}.`);
  assert.ok(W.rings > 0, 'measured no ring at all, so the reader has gone quiet');

  const open = W.pairs.filter(p => !RIPPLE_CARRIED.has(`${p.card} ${p.step} ${p.pt}`));
  const lines = open.map(p => `  ${p.card} step '${p.step}' fires two rings at ${p.pt} on ${p.t}ms`);
  assert.deepEqual(lines, [],
    `${open.length} place(s) draw two rings as one thicker ring:\n${lines.join('\n')}\n` +
    'Usually one of the two is redundant: packetAlong already fires arrivalRipple at a route last ' +
    'point, so an F.ripple naming that same point at that same arrival draws it twice. Delete the ' +
    'redundant one, or stagger the arrivals, or carry the pair in RIPPLE_CARRIED in ' +
    'fixtures/ripple-double.mjs with the reason the simultaneity is the point.');

  t.diagnostic(`${W.rings} ring(s) over ${W.walked} cards, 0 stacked`);
});

test('RING-SINGLE: every carried ruling still matches a pair', () => {
  const live = new Set(W.pairs.map(p => `${p.card} ${p.step} ${p.pt}`));
  const stale = [...RIPPLE_CARRIED.keys()].filter(k => !live.has(k));
  assert.deepEqual(stale, [],
    `${stale.length} ruling(s) match no pair, so the step was repaired and the reason is now false:` +
    `\n  ${stale.join('\n  ')}`);
});
