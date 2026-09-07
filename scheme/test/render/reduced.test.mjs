// reduced.test.mjs: the ctx.reduced contract (S-13, S-14, S-15, S-16, S-17). Every step of every
// card is entered TWICE, once played to its end and once applied statically the way prev/reset
// replays it, and what the two leave on screen is diffed. Successor of tools/check-reduced.mjs.
//
// The two paths are not two renderings of the same code. The played path runs everything in
// `enter()`; the static path runs only what sits ABOVE `if (ctx.reduced) return;`. So this file is
// the machine behind "everything above the guard is the complete static end-state": the moment a
// card animates a value it never pins, or pins one it never animates, the two snapshots disagree.
//
// FOUR AXES, all four ENFORCED. Three of them were counted rather than asserted while their queues
// held findings, because making a queue green is a REPAIR JOB on the cards and silencing an axis
// here would delete the finding. All four queues now stand at 0.
//
//   OPACITY-OWN        the element's own computed opacity.
//   OPACITY-INHERITED  the EFFECTIVE opacity, the product down the ancestor chain.
//                      CSS opacity does not inherit, so a card that pins state on the <g> WRAPPER
//                      around a Pod is invisible to OPACITY-OWN entirely.
//   WIRE-TEXT          the drawn .scheme-label text. A card whose setWire runs only below the
//                      guard shows blank lanes on prev/reset.
//   BLOCK-TEXT         the drawn <text> inside a block: chip name and value, box label and
//                      sublabel, Pod sublabel, chain row. This is the axis a chip pinned at the
//                      value from BEFORE the step's event lands on, which is the whole `rewind`
//                      idiom (`T-30` states it for wires, and a chip is the same shape). Fourteen
//                      chips on six cards read one step behind on prev while the opacity beside
//                      them was pinned at the end state, so prev drew a terminated Pod next to a
//                      count saying nothing had happened, and no axis here could see it.
//   HIGHLIGHT          the .highlight class set. This is the axis a wrong `reducedLit` lands on,
//                      and enforcing it is what makes the derived guard checkable inside `npm test`.
//
// WHY OPACITY-INHERITED IS ENFORCED. The demonstration is on cluster-node-drain, whose
// Pod wrappers are bare `<g id="pod1">` with no class (cluster-node-drain.js:103) and therefore
// outside the element selector. Removing the static pin from one of them leaves the picture on
// prev visibly wrong and the only enforced axis SILENT, because the pin never sat on an element
// OPACITY-OWN can see, and the group wrapper is the most common carrier of opacity in the catalog.
// Its queue is 0 on all 542 compared steps, so promoting it costs nothing and closes that hole.
// WIRE-TEXT and HIGHLIGHT were held back until the derived guard had landed on all four categories,
// so that promoting the axes it touches could not buy false confidence in the place about to move.
// Both are at 0 over the same 542 steps with the derivation in place, which is what earned them.
//
// The two opacity axes are the two fixture helpers, and they are NOT interchangeable:
// ownOpacity() answers "did the step leave the same value behind on both paths", which is a
// question about the code, and effectiveOpacity() answers "does the reader see the same thing",
// which is a question about the picture. One helper named `opacity` would hand a caller whichever
// of the two it happened to be written for, and the number that comes back is not wrong, it is the
// answer to a question the caller did not ask (DIVERGENCE 3 in ../fixtures/render.mjs). So each
// axis here names the one it means.
//
// WHY THIS FILE CARRIES THE DERIVED GUARD. The reduced guard is not hand-written, it is DERIVED
// from `flow`: flowLights collects the ordered union of every `lights`, checked against 93 of 93
// cluster guards. The guard is generated code, and this test is the only thing standing between a
// wrong derivation and a card that shows a different picture on prev than on play. That is why
// every finding names the card, the step INDEX AND ID, the axis and the element: the question a
// finding has to answer is "which derived guard is wrong", and "reduced state diverged" does not
// answer it.
//
// AND WHY THE TWO SNAPSHOTS ARE MATCHED BY KEY. The comparison matches elements by IDENTITY and
// never by slot number. The SCENE part list is the append order, so creation order is not screen
// order and a card can put its elements up in a different sequence: a positional diff lines up
// unrelated pairs and reports noise no one can tell from a regression, on the one test that is
// supposed to be the guard on a derived guard. Each element carries an identity key with no slot
// number in it (../fixtures/render.mjs, elementKey), the two snapshots are matched through it, and
// the two cases a parallel walk by slot swallows, a key present on one path only and lists of
// unequal length, are findings here.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census, FULL_ONLY, CATALOG_BASELINE } from '../fixtures/catalog.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import { readSnapshot } from '../fixtures/snapshot.mjs';
import { vpName, VIEWPORTS } from '../tools/walk.mjs';

// The catalog as it stands. Asserted, not printed: a walk that sees fewer cards or fewer steps
// reports fewer findings and passes, which is the failure mode this whole suite is built against.
// The step total counts EVERY step including each card's
// step 0; the comparison itself starts at 1, so 665 - 110 = 555 steps are actually diffed.
const CARD_TOTAL = CATALOG_BASELINE.cards;
// The walk baseline, DERIVED rather than typed: the catalog it walks and the specs it reads are
// what say how big a whole walk is (CATALOG_BASELINE in ../fixtures/catalog.mjs).
const STEP_TOTAL = await stepTotal();

// Axis names, in the order a summary lists them.
const AXES = ['OPACITY-OWN', 'OPACITY-INHERITED', 'WIRE-TEXT', 'BLOCK-TEXT', 'HIGHLIGHT'];

// Which axes fail `npm test`. Everything else is counted and reported.
//
// TO PROMOTE AN AXIS: drain its queue on the cards, then add its name here. Nothing else in this
// file needs to change, and the env override exists so the queue can be worked with a red run
// without editing the file:
//   REDUCED_ENFORCE=OPACITY-OWN,WIRE-TEXT node --test 'render/reduced.test.mjs'
// All five are enforced: the two that were once report-only stand at 0 over the 542 compared steps,
// so the reason they were counted rather than asserted is gone, and BLOCK-TEXT went in green after
// the fourteen chips it found were repaired.
const DEFAULT_ENFORCED = ['OPACITY-OWN', 'OPACITY-INHERITED', 'WIRE-TEXT', 'BLOCK-TEXT', 'HIGHLIGHT'];
const ENFORCED = new Set(
  (process.env.REDUCED_ENFORCE ?? DEFAULT_ENFORCED.join(','))
    .split(',').map(s => s.trim()).filter(Boolean));

for (const name of ENFORCED) {
  if (!AXES.includes(name)) throw new Error(`REDUCED_ENFORCE names "${name}", which is not one of ${AXES.join(', ')}`);
}

// Tolerance on both opacity axes, and it covers float drift and nothing else: a fill-forwards
// animation lands on its end value through a float, and both fixture helpers round to 2 decimals,
// so an exact compare would report arithmetic as a defect. The ceiling on it is the OPACITY
// vocabulary, whose closest pair is terminated 0.12 against a bare 0: at 0.06 a shade written where
// its neighbour belongs is still twice the slack away and still reports.
const OPACITY_SLACK = 0.06;

// Findings kept per axis for the summary. A queue that is only counted cannot be drained.
const SAMPLES_PER_AXIS = 4;

// The elements whose state both paths must agree on. ONE copy: snap() and captureDeferred() both
// run in the page but both take it as an argument, so the list cannot drift between them. It used
// to be inlined in each, which mattered while the pulse exemption was keyed by an element's INDEX
// in this list. It is keyed by the element's KEY now, and the index is gone.
const SEL = '.scheme-box, .scheme-pod, .scheme-cylinder, .scheme-node, .scheme-chip, .scheme-arrow';

// Wire labels are loose text nodes, not blocks, so they are their own list.
const WIRE_SEL = '.scheme-label';

// Packets and their ripples are transient by definition: they exist on the played path and cannot
// exist on the static one. Excluding the layer is what keeps that from being reported as a scene
// that differs between the paths.
const TRANSIENT = '#packetLayer';

// -------------------------------------------------------------------------------------------
// In-page snapshot. Uses window.__opacity and window.__keyed, installed as init scripts below,
// rather than private readings of its own: two checks each growing their own was the drift this
// suite exists to end.
//
// The key is the fixture's elementKey(): tag, classes minus `highlight`, data-role / data-idx, the
// id chain down from the diagram root, and the element's own geometry. It carries no slot number,
// so the two snapshots can be matched by identity instead of by position. See ../fixtures/render.mjs
// for what is deliberately kept OUT of it and why.
// -------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------
// A step's deferred side effects hang on `a.onfinish`: lightBoxAt adds its arrival class that way
// (scheme-kit.js) and several cards defer a setWire through the same shape. Seeking sets
// currentTime and never fires the event, and finish() does not help either, because the animation
// is PAUSED and a paused animation never enters the finished play state. So the handlers are
// invoked directly. The seek has already gone past the whole step span, so every one of them would
// have run in a real playback, and each is idempotent (add a class, set a text), which is what
// makes calling them by hand safe rather than a simulation of the browser.
//
// It has to be a two-part dance, and the reason is worth knowing before anyone simplifies it: the
// marker animations carry `fill: 'none'`, so the moment the seek pushes past their end they drop
// out of getAnimations() entirely. Measured on network-dns-ndots step 3: 16 handlers before the
// seek, 0 after. So the handlers are captured while they still exist, with the end time of each,
// and replayed afterwards for exactly those the seek went past.
// -------------------------------------------------------------------------------------------

// Replayed in END-TIME order, which is the only order that reproduces a real playback: two handlers
// writing the SAME value are a last-writer-wins race, and getAnimations() hands them back in
// composite order, which for timers on one element is CREATION order. workloads-daemonset step 2
// is the demonstration: three creates raise one count, tap 0 has the longest lane (2196ms against
// 1582) and lands the final 3, and replaying as captured ended on tap 2 and its 2. The sort is
// stable, so handlers that genuinely finish together keep the order the browser would fire them in.

// -------------------------------------------------------------------------------------------

const catalogued = await cards();

// THE BROWSER IS NOT DRIVEN HERE ANY MORE. `tools/walk.mjs` takes both frames this file compares:
// the PLAYED one in its played pass (enterStep, captureDeferred, seek past the span, runDeferred,
// snap) and the REDUCED one in its static pass (gotoStep, snap), at 1600x1000 and NOT under
// reducedMotion, which are the conditions this file set and the reasons it gave: the played path
// has to run the real motion, and 1600x1000 is the size every geometry number in this suite is
// measured at (L-06's first row). The three in-page functions moved to fixtures/probes.mjs
// verbatim, and the selector bundle they share is declared in the walk beside the pass that uses
// it, so neither frame can be looking at a different scene.
const snap = readSnapshot();
const ids = snap.ids;
const VP = vpName(VIEWPORTS[0]);

// Per-axis totals over the whole catalog, and a few worked examples of each.
const totals = new Map(AXES.map(a => [a, 0]));
const samples = new Map(AXES.map(a => [a, []]));
let cardsWalked = 0;
let stepsSeen = 0;      // every step, step 0 included: this is the step total the baseline counted
let stepsDiffed = 0;    // the steps actually compared, which starts at 1 per card
let keyCollisions = 0;  // how often the key had to fall back on document order, see the summary

// Two independent answers to "how many cards are there": the rendered grid and data.js. Comparing
// them is what makes a short run red instead of quietly green over a subset.
test(`the grid renders the whole catalog (${CARD_TOTAL} cards)`, () => {
  assert.ok(ids.length > 0, `NO CARDS RENDERED at ${snap.base}/scheme/ : posters or grid broken`);
  assert.equal(catalogued.length, CARD_TOTAL,
    `data.js lists ${catalogued.length} cards, this suite was calibrated against ${CARD_TOTAL}`);
  census('reduced grid', ids.length, catalogued.length);
});

for (const id of ids) {
  test(id, async () => {
    cardsWalked++;                  // counted before the assertions, so a broken card is still
                                    // counted as covered and reported once, as itself.
    const card = snap.cards[id];
    const total = card.steps;
    assert.ok(total > 0, `${id}: stepCount is ${total}, there are no steps to compare`);
    stepsSeen += total;

    // Step ids off the live controller, only so a finding can name the step by its own id. A
    // card without the debug handle still gets compared, it just reports by index.
    const meta = card.meta;

    const found = new Map(AXES.map(a => [a, []]));

    // Step 0 is the poster: it has no play path of its own, so there is nothing to compare it
    // against. The comparison starts at step 1.
    for (let i = 1; i < total; i++) {
      const label = meta && meta[i] && meta[i].id ? `step ${i} (${meta[i].id})` : `step ${i}`;

      // PLAYED: run the step's real play-path, freeze well past its own span, then replay the
      // deferred handlers the seek jumped over, then let the DOM settle.
      const pulsed = new Set(card.played[i].pulsed);
      const played = card.played[i].snap;

      // REDUCED: the same step applied statically, the way prev and reset replay it.
      const reduced = card.byVp[VP][i].snap;

      stepsDiffed++;
      keyCollisions += played.collisions + reduced.collisions;

      const hit = (axis, msg) => found.get(axis).push(`${id}  ${label}  ${axis}  ${msg}`);

      // MATCHED BY KEY, NOT BY SLOT, and the three consequences are the point of the change:
      //
      //   1. re-ordering the scene between the two paths changes nothing here. NEVER put the slot
      //      index in the key: a key that CARRIES it shifts on every element after a moved one, and
      //      the rest of the scene drops out of the comparison.
      //   2. a key on one path and not on the other is a FINDING. That is the defect this file
      //      exists for, an element the reader sees on play and not on prev, and a walk of the two
      //      lists in parallel is exactly what skips it in silence.
      //   3. lists of unequal length are covered by 2, so there is nothing left to truncate. NEVER
      //      Math.min the two lengths: that drops the tail of the longer list, which is exactly
      //      where an added or a missing element sits.
      //
      // The structural half is reported on OPACITY-OWN: an element that is not there left no value
      // behind at all, which is the strongest form of the question that axis asks, and reporting it
      // on that axis is what makes it red rather than a note. A missing WIRE LABEL goes to
      // WIRE-TEXT, the axis that owns that list, and is red there too: all four axes are enforced,
      // so the routing decides WHICH axis names a defect and never whether it goes red.
      const index = (list) => new Map(list.map(e => [e.key, e]));
      const rEls = index(reduced.els);

      for (const p of played.els) {
        const r = rEls.get(p.key);
        if (!r) { hit('OPACITY-OWN', `${p.key}  on the PLAYED path only, absent on the reduced path`); continue; }

        if (Math.abs(p.own - r.own) > OPACITY_SLACK) {
          hit('OPACITY-OWN', `${p.key}  own opacity played=${p.own} reduced=${r.own}`);
        } else if (Math.abs(p.eff - r.eff) > OPACITY_SLACK) {
          // Only when the own-opacity axis agrees, so one defect is not reported on two axes.
          hit('OPACITY-INHERITED', `${p.key}  effective opacity played=${p.eff} reduced=${r.eff}`);
        }

        // What the block DRAWS. Separate from the opacity axes rather than folded into one of
        // them: a value pinned one step behind is a different repair from a shade pinned wrong
        // (the text moves into `rewind`, the shade does not), and an axis that named both would
        // not say which.
        if (p.txt !== r.txt) {
          hit('BLOCK-TEXT', `${p.key}  played=${JSON.stringify(p.txt)} reduced=${JSON.stringify(r.txt)}`);
        }

        // A reduced-only highlight on something this step PULSES is the stand-in convention. The
        // other direction always is a defect: whatever lights on arrival must also light on the
        // reduced path (S-17), or prev shows a different picture than playing forward.
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

// Coverage guard, and the reason it is an assertion and not a printout: a walk over a subset
// reports zero findings and exits 0, so the number of steps compared is part of the result.
test(`the walk covered the whole catalog (${CARD_TOTAL} cards, ${STEP_TOTAL} steps)`, FULL_ONLY, () => {
  census('reduced walked', cardsWalked, catalogued.length);
  assert.equal(stepsSeen, STEP_TOTAL,
    `walked ${stepsSeen} steps, the baseline counted ${STEP_TOTAL}.\n` +
    '  Fewer means the walk lost steps and every axis under-reported. More means the catalog grew\n' +
    '  and this constant has to be re-taken deliberately.');
  assert.equal(stepsDiffed, STEP_TOTAL - CARD_TOTAL,
    `compared ${stepsDiffed} steps, expected ${STEP_TOTAL - CARD_TOTAL} (${STEP_TOTAL} minus one poster step per card)`);
});

// The axis counts, printed. All four are enforced today, so the loop below prints nothing on the
// first pass; it stays because `REDUCED_ENFORCE` can demote an axis to work a queue red, and that
// is the run where an unprinted count would let the queue drift unseen.
test('axis counts, and any axis demoted through REDUCED_ENFORCE', (t) => {
  for (const axis of AXES) {
    if (ENFORCED.has(axis)) continue;
    t.diagnostic(`${axis}: ${totals.get(axis)} mismatch(es) across ${stepsDiffed} compared steps`);
    for (const line of samples.get(axis)) t.diagnostic(`    ${line}`);
  }
  for (const axis of ENFORCED) t.diagnostic(`${axis}: ENFORCED, ${totals.get(axis)} mismatch(es)`);
  // How often two elements in one snapshot were indistinguishable by every stable attribute and the
  // key fell back on document order. Printed, not asserted: it says how much of the comparison still
  // rests on position, which is the number to watch whenever a scene is re-ordered.
  t.diagnostic(`key collisions: ${keyCollisions} element(s) across ${stepsDiffed * 2} snapshots`);
  // Nothing is asserted here on purpose: a demoted axis is being worked, and pinning its count
  // would make the repair itself turn the suite red.
});
