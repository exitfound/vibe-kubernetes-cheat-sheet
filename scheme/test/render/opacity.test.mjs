// PHASE (C-04 to C-10, own declared values against OPACITY), ORDER (M-08, a fading Pod pulses first) and
// LIT (C-11, no .highlight at a composited opacity at or under terminated), read past the end of each step.
// The packet layer and CSS presentation shades are out of scope (C-10). Vocabulary imported from tokens.js.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census, floor } from '../fixtures/catalog.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import { readSnapshot } from '../fixtures/snapshot.mjs';
import { OPACITY } from '../../js/lib/tokens.js';

// Floors from a full walk.
const EXPECTED_CARDS = floor((await cards()).length);
const EXPECTED_STEPS = floor(await stepTotal());
const EXPECTED_SHADES = 5;      // running, pending, notready, terminating, terminated

// 3 decimals, so 0.123 does not round into the vocabulary.
const key = v => Number(v).toFixed(3);
const NAME = new Map(Object.entries(OPACITY).map(([k, v]) => [key(v), `OPACITY.${k}`]));
const ALLOWED = new Set([key(0), ...NAME.keys()]);

// PHASE reads the declared value at its site (inline pin or keyframe), not getComputedStyle, which folds
// in presentation shades and the paused fill value. LIT composes declared pins down the chain, because
// a frozen step never runs the onfinish that drops a highlight. ORDER compares delays only.

const catalogued = await cards();

// Frozen one millisecond past each step's span by tools/walk.mjs (opacityProbe).
const snap = readSnapshot();
const ids = snap.ids;

test(`the grid renders the whole catalog (${catalogued.length} cards)`, () => {
  assert.ok(ids.length > 0, `NO CARDS RENDERED at ${snap.base}/scheme/ : posters or grid broken`);
  census('opacity grid', ids.length, catalogued.length);
});

test(`the vocabulary is ${EXPECTED_SHADES} named shades, imported from tokens.js`, () => {
  // Names only: a lost or added phase, or two phases on one value, fails.
  assert.deepEqual(Object.keys(OPACITY),
    ['running', 'pending', 'notready', 'terminating', 'terminated']);
  assert.equal(NAME.size, EXPECTED_SHADES,
    `two phases share a value: ${Object.entries(OPACITY).map(([k, v]) => `${k}=${v}`).join(' ')}`);
  assert.equal(OPACITY.running, 1, 'OPACITY.running is the "drawn" value and PHASE allows a bare 1');
});

let walked = 0, sampled = 0;

for (const id of ids) {
  test(id, async () => {
    walked++;                    // counted before the assertions, so a broken card is reported once, as itself
    const card = snap.cards[id];
    const total = card.steps;
    assert.ok(total > 0, `stepCount is ${total}: no steps to walk`);

    const findings = [];
    for (let i = 0; i < total; i++) {
      // Played and frozen at the end of the step: static stepping never reaches a fade or pulse.
      const r = card.played[i].opacity;
      if (!r) continue;
      sampled++;

      for (const f of r.found) {
        if (Number.isNaN(f.v)) continue;
        if (f.v === 1 || ALLOWED.has(key(f.v))) continue;
        findings.push(`PHASE  step ${i} "${f.label}" ${f.kind} opacity ${f.v} is not in the vocabulary`);
      }
      for (const o of r.order) {
        findings.push(`ORDER  step ${i} Pod "${o.label}" fades at ${o.fade}ms but pulses at ${o.pulse}ms (pulse first, then fade)`);
      }
      for (const l of r.lit) {
        findings.push(`LIT    step ${i} "${l.label}" holds .highlight at the terminated shade: declared ${l.declared}, composited ${l.composited} (terminated is ${OPACITY.terminated})`);
      }
    }

    const uniq = [...new Set(findings)];
    assert.equal(uniq.length, 0,
      `${uniq.length} finding(s) over ${total} steps:\n  ${uniq.join('\n  ')}`);
  });
}

test('every catalogued card was walked, every step was sampled', (t) => {
  t.diagnostic(`opacity: ${walked} cards, ${sampled} steps, vocabulary [${[...NAME.values()].join(' ')}]`);
  census('opacity walked', walked, catalogued.length);
  assert.ok(walked >= EXPECTED_CARDS,
    `walked ${walked} card(s), the catalog had ${EXPECTED_CARDS} when this floor was measured. ` +
    'A shrunken walk is a subset, and a subset that passes is worse than a red run.');
  assert.ok(sampled >= EXPECTED_STEPS,
    `sampled ${sampled} step(s), expected at least ${EXPECTED_STEPS}. ` +
    'Steps go missing when a card fails to build or the debug handle is absent, and every missing ' +
    'step is a shade nobody looked at.');
});
