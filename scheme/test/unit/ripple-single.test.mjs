// RING-SINGLE (M-14): no two rings start on one point in the same millisecond unless carried.
// Staggered and near pairs are the report's tiers. Blind to rings fired from an escape
// (step.enter, F.run) and to whether a ring belongs there at all.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { importAll, stepTotal } from '../fixtures/module.mjs';
import { timelineOf } from '../fixtures/spec.mjs';
import { routeDur, REVEAL_MS, BEAT } from '../../js/lib/scheme-kit.js';
import { RIPPLE_CARRIED, ringOf, at } from '../fixtures/ripple-double.mjs';

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
