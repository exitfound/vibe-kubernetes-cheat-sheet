// M-19: a step's motion span (latest delay + active + endDelay) never exceeds its declared duration,
// strictly, or auto-advance cuts it off. Fix by raising `duration`. Declared durations reach neither
// WAAPI nor the DOM, so this is their only rendered guard. A motionless step passes trivially.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census, floor } from '../fixtures/catalog.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import { readSnapshot } from '../fixtures/snapshot.mjs';

// Floors from a full walk.
const EXPECTED_CARDS = floor((await cards()).length);
const EXPECTED_STEPS = floor(await stepTotal());

// Strict: ending on the same millisecond as the motion is legal.
const overrun = (span, duration) => span - duration;

const catalogued = await cards();

// `live` and `span` come off the played pass of tools/walk.mjs.
const snap = readSnapshot();
const ids = snap.ids;

test(`the grid renders the whole catalog (${catalogued.length} cards)`, () => {
  assert.ok(ids.length > 0, `NO CARDS RENDERED at ${snap.base}/scheme/ : posters or grid broken`);
  census('duration grid', ids.length, catalogued.length);
});

let walked = 0, measured = 0;
const margins = [];        // { id, i, stepId, duration, span, margin } for every measured step

for (const id of ids) {
  test(id, async () => {
    walked++;                    // counted before the assertions, so a broken card is reported once, as itself
    const card = snap.cards[id];
    const total = card.steps;
    assert.ok(total > 0, `stepCount is ${total}: no steps to walk`);

    // A null here means the question could not be asked, never "no findings".
    const meta = card.meta;
    assert.ok(meta, 'no window.__schemeCtl._timeline: the declared durations are unreachable, ' +
      'so nothing on this card was judged. Check that the inspect handle is exposed.');
    assert.equal(meta.length, total,
      `the controller declares ${meta.length} step(s) but reports total=${total}: ` +
      'one of the two counts is wrong and the durations would be read off the wrong steps.');

    const findings = [];
    for (let i = 0; i < total; i++) {
      const { id: stepId, duration } = meta[i];
      // Played, then frozen: a static walk reaches no animation and every span would be 0.
      const { live, span } = card.played[i];
      if (!live) {
        findings.push(
          `UNMEASURED  ${id} step ${String(i).padStart(2)} "${stepId}": no debug handle, ` +
          'the step fell back to a static frame and its motion was never timed');
        continue;
      }
      measured++;
      margins.push({ id, i, stepId, duration, span, margin: duration - span });
      const over = overrun(span, duration);
      if (over > 0) {
        findings.push(
          `OVERRUN  ${id} step ${String(i).padStart(2)} "${stepId}": ` +
          `span ${span}ms > duration ${duration}ms, over by ${over}ms ` +
          `(raise duration to at least ${span}, never shorten the motion)`);
      }
    }

    assert.equal(findings.length, 0,
      `${findings.length} finding(s) over ${total} step(s):\n  ${findings.join('\n  ')}`);
  });
}

test('every catalogued card was walked, every step was timed', (t) => {
  const sorted = [...margins].sort((a, b) => a.margin - b.margin);
  t.diagnostic(`duration: ${walked} cards, ${measured} steps timed`);
  // One line each, printed on green: these steps go over budget first on a geometry edit.
  t.diagnostic('tightest 5 steps (spare = duration - span):');
  for (const m of sorted.slice(0, 5)) {
    t.diagnostic(`  ${m.id} step ${m.i} "${m.stepId}" span ${m.span} of ${m.duration} (${m.margin}ms spare)`);
  }

  census('duration walked', walked, catalogued.length);
  assert.ok(walked >= EXPECTED_CARDS,
    `walked ${walked} card(s), the catalog had ${EXPECTED_CARDS} when this floor was measured. ` +
    'A shrunken walk is a subset, and a subset that passes is worse than a red run.');
  assert.ok(measured >= EXPECTED_STEPS,
    `timed ${measured} step(s), expected at least ${EXPECTED_STEPS}. ` +
    'Steps go missing when a card fails to build or the debug handle is absent, and a step nobody ' +
    'timed is a step that can be over budget while this file stays green.');
});
