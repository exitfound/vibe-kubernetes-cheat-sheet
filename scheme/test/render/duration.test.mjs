// duration.test.mjs: a step must outlast its own motion (M-19). Successor of
// tools/check-duration.mjs: same single rule, same reading, same absence of tolerance.
//
//   SPAN>DURATION (M-19)  span <= duration, strictly, for every step of every card.
//
// `span` is the logical length of everything the step animates (the latest delay + activeDuration +
// endDelay over the diagram's animations, from the fixture's stepSpan). `duration` is what the step
// DECLARES, and it is the hold the Timeline waits out before auto-advancing. When span exceeds it,
// the auto-advance cuts the step off mid-flight: the ball is still travelling, the arrival cue has
// not fired yet, and the card under-shows exactly what it is narrating. The fix is always to raise
// `duration`, never to shorten the motion (M-19, A-11).
//
// WHY THIS RULE IS ALIVE RATHER THAN A ONE-OFF. `routeDur` derives flight time from the LENGTH of
// the route (M-12), so moving a block is silently also a timing change (M-20): growing a lane by 300
// to 400 units adds 250 to 870ms per ball (A-11), and an added hop costs about 800ms (M-34).
// Nothing about that edit looks like a timing edit in the diff. A sweep when the original check was
// written found 78 steps across 37 cards already over budget.
//
// WHY THIS TEST CARRIES MORE WEIGHT THAN THE OTHER RENDER TESTS. A step's declared duration
// reaches neither WAAPI nor the DOM: it is a Timeline hold, so it appears neither in
// getAnimations() nor in the serialised markup. Measured: editing `duration: 1500` to `1501` is
// invisible to any dump of either. A clean comparison of two trees is therefore NOT evidence that
// the timings survived, and this file is the only guard that is.
// The same blind spot covers everything that reaches neither DOM nor WAAPI: a step's `id`, its
// `narration` (covered by the text tests) and the ORDER of keys in STEPS.
//
// Where the numbers come from. `duration` is read off the live controller through
// window.__schemeCtl._timeline.steps, the path the original used (check-duration.mjs:23-26) and the
// only one available in wave 1: a card exports exactly one symbol, `init`, so its STEPS array is
// sealed inside makeInit's closure and is statically unreachable. In wave 2, when a card exports
// STEPS_SPEC, the same rule gets a second and cheaper implementation off the spec arithmetic. That
// one will not replace this one: an infinite animation counts a single iteration here, so a span can
// include something that never actually ends, and only the rendered reading knows that.
//
// BLIND BY CONSTRUCTION, both inherited and both deliberate:
//   - a step with NO motion passes trivially. span 0 is under every duration, so this rule says
//     nothing about whether a step is long enough to be READ, only that it does not cut itself off.
//   - the poster step (index 0) is entered statically, so it is measured with the animations its
//     resting state carries, which is normally none.
// A third one is closed rather than inherited: the original wrote `if (!live) continue;` and a step
// whose debug handle was missing went silently uncounted. Here that is a finding of its own.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census, floor, SUBSET } from '../fixtures/catalog.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import {
  DEFAULT_BASE, launch, initPage, discoverIds, openCard, stepCount, stepMeta, enterStep, stepSpan,
} from '../fixtures/render.mjs';

// ---------------------------------------------------------------------------------------------
// Control numbers, taken off a green run of the whole catalog (stage 0.2a: 108 cards, 650 steps,
// every step outlasts its own motion). They are FLOORS, not equalities: a run that measures fewer
// cards or fewer steps than this has scanned a subset, and a subset that reports zero findings is
// worse than a red run, because nothing about it looks wrong. A card or a step added later is a
// legitimate widening and must not turn this file red on its own. The card count is additionally
// pinned to data.js exactly, through census().
// ---------------------------------------------------------------------------------------------
// The walk baseline, DERIVED rather than typed: the catalog it walks and the specs it reads are
// what say how big a whole walk is (CATALOG_BASELINE in ../fixtures/catalog.mjs).
const EXPECTED_CARDS = floor((await cards()).length);
const EXPECTED_STEPS = floor(await stepTotal());

// No tolerance, matching the original's strict `>` (check-duration.mjs:38). A step that ends on the
// same millisecond its motion ends is legal and sits at margin 0; one millisecond past it is not.
const overrun = (span, duration) => span - duration;

const catalogued = await cards();

const browser = await launch();
// Registered on the line after the launch, before the page setup below: node:test runs an
// `after` hook whatever happens to the tests, but a throw in the setup itself (a context, an
// init script, a grid that never renders) happens BEFORE the hook exists, and that browser is
// then nobody's to close for the rest of the run.
after(() => browser.close());

// No explicit viewport, as the original had none. Spans are computed from route LENGTH in viewBox
// units, so the size of the window is not load-bearing here, and keeping the original's conditions
// is what makes its green run reproducible rather than merely similar.
const page = await browser.newPage();
await page.addInitScript(initPage, 'expose');
const ids = await discoverIds(page, DEFAULT_BASE);

test(`the grid renders the whole catalog (${catalogued.length} cards)`, () => {
  assert.ok(ids.length > 0, `NO CARDS RENDERED at ${DEFAULT_BASE}/scheme/ : posters or grid broken`);
  census('duration grid', ids.length, catalogued.length);
});

let walked = 0, measured = 0, undeclared = 0;
const margins = [];        // { id, i, stepId, duration, span, margin } for every measured step

for (const id of ids) {
  test(id, async () => {
    walked++;                    // counted before the assertions, so this stays a census of
                                 // COVERAGE and a broken card is reported once, as itself.
    await openCard(page, id);
    const total = await stepCount(page);
    assert.ok(total > 0, `stepCount is ${total}: no steps to walk`);

    // The declared durations, straight off the controller. A null here is not "no findings", it is
    // "the question could not be asked": without the debug handle there is nothing to compare a
    // span against, and the original skipped such a card with a note on stderr that no exit code
    // carried.
    const meta = await stepMeta(page);
    assert.ok(meta, 'no window.__schemeCtl._timeline: the declared durations are unreachable, ' +
      'so nothing on this card was judged. Check that the inspect handle is exposed.');
    assert.equal(meta.length, total,
      `the controller declares ${meta.length} step(s) but reports total=${total}: ` +
      'one of the two counts is wrong and the durations would be read off the wrong steps.');

    const findings = [];
    for (let i = 0; i < total; i++) {
      const { id: stepId, duration } = meta[i];
      // The played path with animations attached but no auto-advance, then frozen. Walking
      // statically instead would run every enter() under ctx.reduced and reach no animation at all,
      // which would make every span 0 and the whole file green by construction.
      const live = await enterStep(page, i);
      if (!live) {
        findings.push(
          `UNMEASURED  ${id} step ${String(i).padStart(2)} "${stepId}": no debug handle, ` +
          'the step fell back to a static frame and its motion was never timed');
        continue;
      }
      const span = await stepSpan(page);
      measured++;
      // Faithful to the original: a step that declares no duration reads 0. At runtime such a step
      // would fall back to Timeline's defaultDuration (2000), so the two numbers would disagree,
      // which is why the count below is asserted to be zero rather than merely reported.
      if (!duration) undeclared++;
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

test('every step declares its own duration', () => {
  // A strengthening of the original, and a small one: it compared spans against `durations[i] || 0`,
  // so a step declaring no duration was judged against 0 while the Timeline would actually hold it
  // for defaultDuration (2000). Both readings are defensible and they disagree, so the ambiguity is
  // removed rather than resolved. It costs nothing today: all 650 steps declare one.
  assert.equal(undeclared, 0,
    `${undeclared} step(s) declare no duration. Such a step is judged against 0 here and held for ` +
    "Timeline's defaultDuration (2000) when played, so the rule would mean two different things.");
});

test('every catalogued card was walked, every step was timed', (t) => {
  const sorted = [...margins].sort((a, b) => a.margin - b.margin);
  t.diagnostic(`duration: ${walked} cards, ${measured} steps timed`);
  // One line each: a diagnostic is a single TAP comment, so an embedded newline is escaped and the
  // list becomes unreadable in exactly the run where it matters. These five are the steps a geometry
  // edit will push over budget first, which is why they are printed on a GREEN run and not only on
  // a red one.
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
