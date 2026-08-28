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

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census, floor, SUBSET } from '../fixtures/catalog.mjs';
import {
  builtChildren, collectPageErrors, DEFAULT_BASE, discoverIds, enterStep, gotoStep, launch,
  openCard, initPage, stepCount,
} from '../fixtures/render.mjs';

const catalogued = await cards();

const browser = await launch();
// Registered on the line after the launch, before the page setup below: node:test runs an
// `after` hook whatever happens to the tests, but a throw in the setup itself (a context, an
// init script, a grid that never renders) happens BEFORE the hook exists, and that browser is
// then nobody's to close for the rest of the run.
after(() => browser.close());

// NOT reducedMotion: the played pass has to run the real motion path.
const context = await browser.newContext();
const page = await context.newPage();
await page.addInitScript(initPage, 'expose');
const ids = await discoverIds(page, DEFAULT_BASE);

// Two independent answers to "how many cards are there": the rendered grid and data.js. Comparing
// them is what makes a short run red instead of quietly green over a subset.
test(`the grid renders the whole catalog (${catalogued.length} cards)`, () => {
  assert.ok(ids.length > 0, `NO CARDS RENDERED at ${DEFAULT_BASE}/scheme/ : posters or grid broken`);
  census('smoke grid', ids.length, catalogued.length);
});

let walked = 0;

for (const id of ids) {
  test(id, async () => {
    walked++;                       // counted before the assertions, so this stays a census of
                                    // COVERAGE and a broken card is reported once, as itself.
    const collector = collectPageErrors(page);
    try {
      await openCard(page, id);
      const built = await builtChildren(page);
      assert.ok(built > 0, `svg.diagram has ${built} children: the scene never built`);

      const total = await stepCount(page);
      assert.ok(total > 0, `stepCount is ${total}: no steps to walk`);

      // Pass 1, reduced: the static end state of every step, the path prev and reset take.
      for (let i = 0; i < total; i++) {
        await gotoStep(page, i);
      }
      // Pass 2, played: enterStep runs each step's real enter() with reduced:false and freezes it.
      // Starts at 1, because step 0 is the static poster and has no play path of its own.
      for (let i = 1; i < total; i++) {
        await enterStep(page, i);
      }

      const errs = collector.errors;
      assert.equal(errs.length, 0,
        `${errs.length} error(s) over ${total} steps:\n  ${errs.slice(0, 6).join('\n  ')}`);
    } finally {
      collector.stop();
    }
  });
}

test('every catalogued card was walked', () => {
  census('smoke walked', walked, catalogued.length);
});
