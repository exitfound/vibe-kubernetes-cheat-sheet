// CHIP-WRITTEN: a chip a step points at is written by some step or carries a ruling. Closes the P-01
// hole where a chip missing from every step agrees with every step. The SILENT tier stays a report.
// Blind to writes inside an escape (P-11) and to whether the pointing is right (R2, P-03).

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
