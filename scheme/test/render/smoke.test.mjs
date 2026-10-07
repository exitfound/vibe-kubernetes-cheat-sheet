// Every card opens and walks every step both statically and played, with zero console errors and
// zero page exceptions. The played pass is what runs the code below `if (ctx.reduced) return`.
// Says nothing about whether the picture is right.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census } from '../fixtures/catalog.mjs';
import { readSnapshot } from '../fixtures/snapshot.mjs';

const catalogued = await cards();

// Asserts over the console tools/walk.mjs collected per card, played pass not under reducedMotion.
const snap = readSnapshot();
const ids = snap.ids;

// Grid count against data.js, so a short run goes red instead of quietly green over a subset.
test(`the grid renders the whole catalog (${catalogued.length} cards)`, () => {
  assert.ok(ids.length > 0, `NO CARDS RENDERED at ${snap.base}/scheme/ : posters or grid broken`);
  census('smoke grid', ids.length, catalogued.length);
});

let walked = 0;

for (const id of ids) {
  test(id, async () => {
    walked++;                       // counted before the assertions, so a broken card is reported once, as itself
    const card = snap.cards[id];
    assert.ok(!card.openError, `the card never opened: ${card.openError}`);
    assert.ok(card.built > 0, `svg.diagram has ${card.built} children: the scene never built`);

    const total = card.steps;
    assert.ok(total > 0, `stepCount is ${total}: no steps to walk`);

    const errs = card.errors;
    assert.equal(errs.length, 0,
      `${errs.length} error(s) over ${total} steps:\n  ${errs.slice(0, 6).join('\n  ')}`);
  });
}

test('every catalogued card was walked', () => {
  census('smoke walked', walked, catalogued.length);
});
