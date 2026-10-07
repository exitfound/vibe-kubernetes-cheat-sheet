// ctx.reduced contract (S-13 to S-17): each step played to its end and applied statically must leave the
// same screen on five enforced axes, OPACITY-OWN, OPACITY-INHERITED, WIRE-TEXT, BLOCK-TEXT, HIGHLIGHT.
// Elements are matched by elementKey, never slot. The derived reduced guard has no other check.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census, FULL_ONLY, CATALOG_BASELINE } from '../fixtures/catalog.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import { readSnapshot } from '../fixtures/snapshot.mjs';
import { vpName, VIEWPORTS } from '../tools/walk.mjs';

// Asserted: a walk over fewer cards or steps reports fewer findings and passes. Diffing starts at step 1.
const CARD_TOTAL = CATALOG_BASELINE.cards;
const STEP_TOTAL = await stepTotal();

const AXES = ['OPACITY-OWN', 'OPACITY-INHERITED', 'WIRE-TEXT', 'BLOCK-TEXT', 'HIGHLIGHT'];

// Axes that fail `npm test`. REDUCED_ENFORCE=<axis>,... overrides it to work a queue red.
const DEFAULT_ENFORCED = ['OPACITY-OWN', 'OPACITY-INHERITED', 'WIRE-TEXT', 'BLOCK-TEXT', 'HIGHLIGHT'];
const ENFORCED = new Set(
  (process.env.REDUCED_ENFORCE ?? DEFAULT_ENFORCED.join(','))
    .split(',').map(s => s.trim()).filter(Boolean));

for (const name of ENFORCED) {
  if (!AXES.includes(name)) throw new Error(`REDUCED_ENFORCE names "${name}", which is not one of ${AXES.join(', ')}`);
}

// Float drift only (both helpers round to 2 decimals), below half the closest OPACITY pair (0.12 against 0).
const OPACITY_SLACK = 0.06;

// A queue that is only counted cannot be drained.
const SAMPLES_PER_AXIS = 4;

// One copy, passed into both in-page functions as an argument.
const SEL = '.scheme-box, .scheme-pod, .scheme-cylinder, .scheme-node, .scheme-chip, .scheme-arrow';

const WIRE_SEL = '.scheme-label';

// Packets and ripples exist only on the played path.
const TRANSIENT = '#packetLayer';

// Deferred effects hang on onfinish, which a paused seek never fires, so the handlers are captured
// before the seek (fill: 'none' drops them after) and invoked by hand. Each is idempotent.

// Replayed in end-time order with a stable sort: same-value writers are last-writer-wins.

const catalogued = await cards();

// Both frames come from tools/walk.mjs at 1600x1000, not under reducedMotion: played (enterStep,
// captureDeferred, seek, runDeferred, snap) and static (gotoStep, snap).
const snap = readSnapshot();
const ids = snap.ids;
const VP = vpName(VIEWPORTS[0]);

const totals = new Map(AXES.map(a => [a, 0]));
const samples = new Map(AXES.map(a => [a, []]));
let cardsWalked = 0;
let stepsSeen = 0;      // every step, step 0 included: this is the step total the baseline counted
let stepsDiffed = 0;    // the steps actually compared, which starts at 1 per card
let keyCollisions = 0;  // how often the key had to fall back on document order, see the summary

// Grid count against data.js, so a short run goes red instead of quietly green over a subset.
test(`the grid renders the whole catalog (${CARD_TOTAL} cards)`, () => {
  assert.ok(ids.length > 0, `NO CARDS RENDERED at ${snap.base}/scheme/ : posters or grid broken`);
  assert.equal(catalogued.length, CARD_TOTAL,
    `data.js lists ${catalogued.length} cards, this suite was calibrated against ${CARD_TOTAL}`);
  census('reduced grid', ids.length, catalogued.length);
});

for (const id of ids) {
  test(id, async () => {
    cardsWalked++;                  // counted before the assertions, so a broken card is reported once, as itself
    const card = snap.cards[id];
    const total = card.steps;
    assert.ok(total > 0, `${id}: stepCount is ${total}, there are no steps to compare`);
    stepsSeen += total;

    // Only so a finding can name the step by id. Without the handle it reports by index.
    const meta = card.meta;

    const found = new Map(AXES.map(a => [a, []]));

    // Step 0 is the poster and has no play path.
    for (let i = 1; i < total; i++) {
      const label = meta && meta[i] && meta[i].id ? `step ${i} (${meta[i].id})` : `step ${i}`;

      const pulsed = new Set(card.played[i].pulsed);
      const played = card.played[i].snap;

      const reduced = card.byVp[VP][i].snap;

      stepsDiffed++;
      keyCollisions += played.collisions + reduced.collisions;

      const hit = (axis, msg) => found.get(axis).push(`${id}  ${label}  ${axis}  ${msg}`);

      // Matched by key: never put the slot in the key, never Math.min the lengths. A key on one path only is
      // a finding, on OPACITY-OWN for elements and WIRE-TEXT for wire labels.
      const index = (list) => new Map(list.map(e => [e.key, e]));
      const rEls = index(reduced.els);

      for (const p of played.els) {
        const r = rEls.get(p.key);
        if (!r) { hit('OPACITY-OWN', `${p.key}  on the PLAYED path only, absent on the reduced path`); continue; }

        if (Math.abs(p.own - r.own) > OPACITY_SLACK) {
          hit('OPACITY-OWN', `${p.key}  own opacity played=${p.own} reduced=${r.own}`);
        } else if (Math.abs(p.eff - r.eff) > OPACITY_SLACK) {
          // Only when the own-opacity axis agrees, so one defect is not reported twice.
          hit('OPACITY-INHERITED', `${p.key}  effective opacity played=${p.eff} reduced=${r.eff}`);
        }

        // Separate from opacity: a value pinned one step behind is a different repair (it moves into `rewind`).
        if (p.txt !== r.txt) {
          hit('BLOCK-TEXT', `${p.key}  played=${JSON.stringify(p.txt)} reduced=${JSON.stringify(r.txt)}`);
        }

        // A reduced-only highlight on a pulsed element is the stand-in. The other direction is a defect (S-17).
        if (p.hl !== r.hl && !(!p.hl && r.hl && pulsed.has(p.key))) {
          hit('HIGHLIGHT', `${p.key}  highlight played=${p.hl} reduced=${r.hl}`);
        }
      }

      const pEls = index(played.els);
      for (const r of reduced.els) {
        if (!pEls.has(r.key)) hit('OPACITY-OWN', `${r.key}  on the REDUCED path only, absent on the played path`);
      }

      const rWires = index(reduced.wires);
      for (const p of played.wires) {
        const r = rWires.get(p.key);
        if (!r) { hit('WIRE-TEXT', `${p.key}  on the PLAYED path only, absent on the reduced path`); continue; }
        if (p.text !== r.text) {
          hit('WIRE-TEXT', `${p.key}  played=${JSON.stringify(p.text)} reduced=${JSON.stringify(r.text)}`);
        }
      }

      const pWires = index(played.wires);
      for (const r of reduced.wires) {
        if (!pWires.has(r.key)) hit('WIRE-TEXT', `${r.key}  on the REDUCED path only, absent on the played path`);
      }
    }

    for (const axis of AXES) {
      const list = found.get(axis);
      totals.set(axis, totals.get(axis) + list.length);
      const bank = samples.get(axis);
      for (const line of list) if (bank.length < SAMPLES_PER_AXIS) bank.push(line);
    }

    const failing = AXES.filter(a => ENFORCED.has(a)).flatMap(a => found.get(a));
    assert.equal(failing.length, 0,
      `${id}: ${failing.length} reduced-state mismatch(es) on ${[...ENFORCED].join(', ')} over ${total - 1} compared step(s).\n` +
      'The static path (prev/reset) and the played end-state must leave the same value behind.\n  ' +
      failing.slice(0, 20).join('\n  '));
  });
}

// The number of steps compared is part of the result.
test(`the walk covered the whole catalog (${CARD_TOTAL} cards, ${STEP_TOTAL} steps)`, FULL_ONLY, () => {
  census('reduced walked', cardsWalked, catalogued.length);
  assert.equal(stepsSeen, STEP_TOTAL,
    `walked ${stepsSeen} steps, the baseline counted ${STEP_TOTAL}.\n` +
    '  Fewer means the walk lost steps and every axis under-reported. More means the catalog grew\n' +
    '  and this constant has to be re-taken deliberately.');
  assert.equal(stepsDiffed, STEP_TOTAL - CARD_TOTAL,
    `compared ${stepsDiffed} steps, expected ${STEP_TOTAL - CARD_TOTAL} (${STEP_TOTAL} minus one poster step per card)`);
});

// Prints counts for any axis demoted through REDUCED_ENFORCE.
test('axis counts, and any axis demoted through REDUCED_ENFORCE', (t) => {
  for (const axis of AXES) {
    if (ENFORCED.has(axis)) continue;
    t.diagnostic(`${axis}: ${totals.get(axis)} mismatch(es) across ${stepsDiffed} compared steps`);
    for (const line of samples.get(axis)) t.diagnostic(`    ${line}`);
  }
  for (const axis of ENFORCED) t.diagnostic(`${axis}: ENFORCED, ${totals.get(axis)} mismatch(es)`);
  // How much of the comparison still rests on document order.
  t.diagnostic(`key collisions: ${keyCollisions} element(s) across ${stepsDiffed * 2} snapshots`);
  // Not asserted: pinning a demoted axis would make its repair turn the suite red.
});
