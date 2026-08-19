// chip-written.test.mjs: the chip nobody writes, promoted out of ../report/chip-unwritten.test.mjs
// on 2026-08-17 when its queue reached zero.
//
// The hole this closes is in `P-01`, and `P-01` cannot close it. That rule is "every step states
// EVERY chip", and unit/spec-steps.test.mjs enforces it by comparing one step's chip key set against
// the OTHER steps of the same card. A chip missing from every set agrees with every set perfectly, so
// the card can declare a chip in SCENE, light it, and never write it, and the comparison stays quiet.
//
//   CHIP-WRITTEN  a chip a step POINTS AT (in `lit`, in `reducedLit`, in a `lights` list or as an
//                 F.light target) is written by some step, or carries a written ruling.
//
// ===========================================================================================
// WHY THE SHARP TIER ONLY
// ===========================================================================================
// The report prints two tiers and this asserts one. LIT-NOT-WRITTEN is the sharp form: a step points
// at a value as the news of that step and the value is whatever the scene was built with. SILENT is a
// chip nothing writes and nothing points at, which is a standing caption drawn as a chip, and the
// only question there is whether a chip is the right part kind: a judgement, not a defect. The report
// keeps printing it.
//
// The defence that made this a queue rather than a verdict for months is real and still stands: a
// chip whose value is a CONSTANT of the diagram (a nameserver every step agrees on, a NodePort range
// fixed by the API server) is legitimately stated once. That is why the repair for 13 of the original
// 18 was to bring the chip inside P-01 rather than to invent a beat for it, and why a ruling may be
// carried instead of fixed.
//
// ===========================================================================================
// WHAT THIS FILE IS BLIND TO
// ===========================================================================================
//   - A WRITE INSIDE AN ESCAPE. `step.enter` (42 sites) and `F.run` (13) are function bodies, so
//     `setVal(s.refs.x, ...)` in one is a write this reader cannot see. `P-11` bans exactly that, so
//     such a chip would be a P-11 finding rather than this one.
//   - WHETHER THE POINTING IS RIGHT. Highlighting a value that never changes is `R2` and `P-03`,
//     which report/arrival.test.mjs and report/chip-beat.test.mjs own.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { importAll, stepTotal } from '../fixtures/module.mjs';
import { walkParts } from '../fixtures/spec.mjs';
import {
  CHIP_CARRIED, writtenKeys, cuedKeys,
} from '../fixtures/chip-unwritten.mjs';

const catalogued = await cards();
const modules = await importAll();

// The walk baseline, DERIVED rather than typed: the catalog it walks and the specs it reads are
// what say how big a whole walk is (CATALOG_BASELINE in ../fixtures/catalog.mjs).
const EXPECTED_CARDS = catalogued.length;
const EXPECTED_STEPS = await stepTotal();

test('CHIP-WRITTEN: a chip a step points at is written by some step', (t) => {
  const findings = [];
  let walked = 0, steps = 0, chips = 0;

  for (const c of catalogued) {
    const ns = modules.get(c.id);
    if (!ns || !ns.SCENE || !Array.isArray(ns.STEPS_SPEC)) continue;
    walked++;
    steps += ns.STEPS_SPEC.length;

    const declared = new Set();
    walkParts(ns.SCENE.parts, (p) => { if (p && p.kind === 'chip' && p.key) declared.add(p.key); });
    chips += declared.size;

    const written = writtenKeys(ns.STEPS_SPEC);
    const cued = cuedKeys(ns.STEPS_SPEC);
    for (const key of declared) {
      if (written.has(key)) continue;
      if (!cued.has(key)) continue;                 // SILENT: the report's other tier, not asserted
      if (CHIP_CARRIED.has(`${c.id} ${key}`)) continue;
      findings.push(`  ${c.id}  chip '${key}' is pointed at by a step and written by none`);
    }
  }

  assert.ok(walked >= EXPECTED_CARDS,
    `walked ${walked} card(s), the catalog holds ${EXPECTED_CARDS}. A shrunken walk finds few chips ` +
    'and reads exactly like a clean catalog.');
  assert.ok(steps >= EXPECTED_STEPS, `read ${steps} step(s), expected at least ${EXPECTED_STEPS}.`);
  assert.ok(chips > 0, 'measured no chip part at all, so the reader has gone quiet');

  assert.deepEqual(findings, [],
    `${findings.length} chip(s) are cued as the news of a step and written by nobody:\n` +
    `${findings.join('\n')}\n` +
    'Either write it (and P-01 then wants EVERY step to state it, which is the real cost), or stop ' +
    'pointing at it, or rule it a CONSTANT of the diagram and carry it in CHIP_CARRIED in ' +
    'fixtures/chip-unwritten.mjs with the reason.');

  t.diagnostic(`${chips} chip part(s) over ${walked} cards, 0 cued without a writer`);
});

test('CHIP-WRITTEN: every carried ruling still matches a finding', () => {
  const live = new Set();
  for (const c of catalogued) {
    const ns = modules.get(c.id);
    if (!ns || !ns.SCENE || !Array.isArray(ns.STEPS_SPEC)) continue;
    const declared = new Set();
    walkParts(ns.SCENE.parts, (p) => { if (p && p.kind === 'chip' && p.key) declared.add(p.key); });
    const written = writtenKeys(ns.STEPS_SPEC);
    const cued = cuedKeys(ns.STEPS_SPEC);
    for (const key of declared) if (!written.has(key) && cued.has(key)) live.add(`${c.id} ${key}`);
  }
  const stale = [...CHIP_CARRIED.keys()].filter(k => !live.has(k));
  assert.deepEqual(stale, [],
    `${stale.length} ruling(s) match no finding, so the chip was repaired and the reason is now ` +
    `false:\n  ${stale.join('\n  ')}`);
});
