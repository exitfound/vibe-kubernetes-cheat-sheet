// P-07: a value chip's name and value keep MIN_GAP between them on every step, measured with getBBox
// on the static walk. A fallback mono face fails the run (L-21). Blind to wire labels (L-19), stacked
// texts, chain rows, and the middle text of a three-text chip.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census, floor } from '../fixtures/catalog.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import { FACE_MONO } from '../fixtures/render.mjs';
import { readSnapshot } from '../fixtures/snapshot.mjs';
import { STACK_TOL, vpName, VIEWPORTS } from '../tools/walk.mjs';

const VP = vpName(VIEWPORTS[0]);

// The readable gap itself, not a rendering tolerance, in viewBox units.
const MIN_GAP = 4;

// STACK_TOL is imported from tools/walk.mjs, where it is applied.

// Chip strings are drawn in mono only, so only FACE_MONO is guarded.
const CHIP_FACES = [FACE_MONO];

// Floors from a full walk: a subset reporting zero collisions looks clean.
const EXPECTED_CARDS = floor((await cards()).length);
const EXPECTED_STEPS = floor(await stepTotal());
// Cards declaring a chip: immune to what a card says, falls only when the selector stops matching.
const EXPECTED_CHIP_CARDS = floor(104);
// Distinct card+name+value pairs, with headroom: chips coming to share a value merge into one pair.
const EXPECTED_PAIRS = floor(1080);

const catalogued = await cards();

// The probe is chipProbe in fixtures/probes.mjs, run by tools/walk.mjs at 1600x1000.
const snap = readSnapshot();
const ids = snap.ids;

test(`the grid renders the whole catalog (${catalogued.length} cards)`, () => {
  assert.ok(ids.length > 0, `NO CARDS RENDERED at ${snap.base}/scheme/ : posters or grid broken`);
  census('chipfit grid', ids.length, catalogued.length);
});

let walked = 0, stepped = 0;
const tightest = new Map();      // `${id}|${name}|${value}` -> { id, i, name, value, gap }

for (const id of ids) {
  test(id, async () => {
    walked++;                    // counted before the assertions, so a broken card is reported once, as itself
    const card = snap.cards[id];

    const fellBack = card.fellBackMono;
    assert.deepEqual(fellBack, [],
      `${FACE_MONO.spec} is NOT what this page paints with:\n  ${fellBack.join('\n  ')}\n` +
      'Every width below would be the fallback face, roughly 20 percent narrower, so every chip ' +
      'would look like it fits (L-21). This run needs the Google Fonts network ' +
      '(fonts.googleapis.com and fonts.gstatic.com), it is not a finding about the card.');

    const total = card.steps;
    assert.ok(total > 0, `stepCount is ${total}: no steps to walk`);

    // Pooled over every step, keeping the tightest gap per pair.
    const mine = new Map();
    for (let i = 0; i < total; i++) {
      const rows = card.byVp[VP][i].chips;
      assert.ok(rows, `step ${i}: no svg.diagram, the dialog never opened`);
      stepped++;
      for (const r of rows) {
        const key = `${r.n}|${r.v}`;
        const seen = mine.get(key);
        if (!seen || r.gap < seen.gap) mine.set(key, { id, i, name: r.n, value: r.v, gap: r.gap });
      }
    }
    for (const [key, h] of mine) tightest.set(`${id}|${key}`, h);

    const findings = [...mine.values()]
      .filter(h => h.gap < MIN_GAP)
      .map(h => `COLLISION  ${id} step ${h.i} chip "${h.name}" | "${h.value}": ` +
        `gap ${h.gap} < MIN_GAP ${MIN_GAP} (short by ${MIN_GAP - h.gap} units, ` +
        'shorten the VALUE rather than widening the chip)');

    assert.equal(findings.length, 0,
      `${findings.length} collision(s) over ${total} step(s):\n  ${findings.join('\n  ')}`);
  });
}

test('every catalogued card was walked, every step and every chip was measured', (t) => {
  const sorted = [...tightest.values()].sort((a, b) => a.gap - b.gap);
  t.diagnostic(`chipfit: ${walked} cards, ${stepped} steps, ${tightest.size} distinct chip pairs measured`);
  // One line each: a TAP diagnostic escapes embedded newlines.
  t.diagnostic(`tightest 5 chips (MIN_GAP is ${MIN_GAP}):`);
  for (const h of sorted.slice(0, 5)) {
    t.diagnostic(`  ${h.id} "${h.name}" | "${h.value}" gap ${h.gap}`);
  }

  census('chipfit walked', walked, catalogued.length);
  assert.ok(walked >= EXPECTED_CARDS,
    `walked ${walked} card(s), the catalog had ${EXPECTED_CARDS} when this floor was measured. ` +
    'A shrunken walk is a subset, and a subset that passes is worse than a red run.');
  assert.ok(stepped >= EXPECTED_STEPS,
    `measured ${stepped} step(s), expected at least ${EXPECTED_STEPS}. A chip takes its longest ` +
    'value on exactly one step, so a missing step is a chip nobody measured at its widest.');
  // Cards that handed the walk at least one pair: the selector guard.
  const chipCards = new Set([...tightest.values()].map(h => h.id)).size;
  assert.ok(chipCards >= EXPECTED_CHIP_CARDS,
    `measured a chip on ${chipCards} card(s), expected at least ${EXPECTED_CHIP_CARDS}. The specs ` +
    'declare a chip part on that many, so a card missing here is one the probe read nothing on, and ' +
    'zero collisions over a shrunken set is not a pass.');
  assert.ok(tightest.size >= EXPECTED_PAIRS,
    `measured ${tightest.size} distinct chip pair(s), expected at least ${EXPECTED_PAIRS}. ` +
    'The selector or the pair test has narrowed: zero collisions over a shrunken set is not a pass.');
});
