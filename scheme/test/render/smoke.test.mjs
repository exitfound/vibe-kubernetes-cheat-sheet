// smoke.test.mjs: every card in the catalog opens, builds, and walks every step TWICE, statically
// and PLAYED, with zero console errors and zero uncaught page exceptions. Successor of
// tools/smoke-all.mjs, and the proof that the fixtures under ../fixtures/ actually work.
//
// The played pass is the point. Stepping only through gotoStep runs every enter() with
// ctx.reduced, which never executes a single line below `if (ctx.reduced) return;`, so the packets,
// pulses, riding labels and arrival highlights of every step would go unrun. Timeline swallows a
// throw into console.error, which the collector turns into a failure.
//
// It says nothing about whether the picture is RIGHT. A green smoke is not a looked-at card.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census } from '../fixtures/catalog.mjs';
import { readSnapshot } from '../fixtures/snapshot.mjs';

const catalogued = await cards();

// THE BROWSER IS NOT DRIVEN HERE ANY MORE, and this file is the clearest case for why: it read no
// DOM at all. It opened every card, drove both paths over every step and asserted that the console
// stayed quiet, which cost a whole Chromium and 1377 step round trips to collect a side effect that
// four other walks were producing anyway. `tools/walk.mjs` drives both paths once, NOT under
// reducedMotion because the played pass has to run the real motion path, and collects the console
// for the length of each card's visit. What is asserted here is unchanged.
const snap = readSnapshot();
const ids = snap.ids;

// Two independent answers to "how many cards are there": the rendered grid and data.js. Comparing
// them is what makes a short run red instead of quietly green over a subset.
test(`the grid renders the whole catalog (${catalogued.length} cards)`, () => {
  assert.ok(ids.length > 0, `NO CARDS RENDERED at ${snap.base}/scheme/ : posters or grid broken`);
  census('smoke grid', ids.length, catalogued.length);
});

let walked = 0;

for (const id of ids) {
  test(id, async () => {
    walked++;                       // counted before the assertions, so this stays a census of
                                    // COVERAGE and a broken card is reported once, as itself.
    const card = snap.cards[id];
    assert.ok(!card.openError, `the card never opened: ${card.openError}`);
    assert.ok(card.built > 0, `svg.diagram has ${card.built} children: the scene never built`);

    const total = card.steps;
    assert.ok(total > 0, `stepCount is ${total}: no steps to walk`);

    // The walk drove both paths over every step of this card with the console attached: the static
    // one the way prev and reset take it, and the played one that runs each step's real enter()
    // with reduced:false.
    const errs = card.errors;
    assert.equal(errs.length, 0,
      `${errs.length} error(s) over ${total} steps:\n  ${errs.slice(0, 6).join('\n  ')}`);
  });
}

test('every catalogued card was walked', () => {
  census('smoke walked', walked, catalogued.length);
});
