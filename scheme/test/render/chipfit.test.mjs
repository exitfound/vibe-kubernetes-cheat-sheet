// chipfit.test.mjs: a value chip's NAME must not collide with its VALUE (P-07). Successor of
// tools/check-chipfit.mjs: same rule, same MIN_GAP, same pooling over every step.
//
//   GAP (P-07)  for every name/value chip on every step, value.x - (name.x + name.width) >= MIN_GAP,
//               measured with getBBox() on the RENDERED text, in viewBox units.
//
// A chip is one rect with the name anchored 12 units from its left edge and the value 12 from its
// right (`valChip` in lib/scheme-kit.js), so a chip narrower than name + value + 24 plus a readable
// gap draws the two strings on top of each other and the text stops being text:
// "spec.unschedulabSehedulingDisabled" is the real artefact that produced the original check.
// The fix is to shorten the VALUE, not to widen the chip (P-07, STO.L-03).
//
// Nothing else in the suite answers this question. render/inline.test.mjs reads the strings and
// compares them across cards, render/geometry.test.mjs measures blocks: neither asks whether a
// string FITS. It has to be a rendered measurement for the same reason: the width of a string is a fact
// about the font, and no amount of reading the source produces it.
//
// WHY EVERY STEP. A chip carries different values through the story and only overflows on the step
// holding its longest one, so a single sample at open would miss most of the catalog. The walk is
// STATIC (gotoStep), which replays each step under ctx.reduced and lands on the value the step
// SETTLES on: that is the value the reader has time to read, and it is deterministic between runs,
// where a played walk is not.
//
// FONTS ARE THE WHOLE MEASUREMENT (L-21). The fallback face is about 20 percent narrower than
// JetBrains Mono, so measuring before the webfont lands flatters every chip on the card and turns
// this file into a green run that proves nothing. The fixture's openCard waits for networkidle,
// which is necessary but not sufficient (the stylesheet is attached by an onload handler on a
// preload link, so the font can still be pending when the network goes quiet). Neither is
// document.fonts.check(): with the font hosts unreachable the stylesheet never attaches, so there
// is no @font-face rule to be missing and check() reports every family available, invented ones
// included. The guard is fixtures/render.mjs fallbackFaces(), which measures a string in the wanted
// family against the same string in an impossible one, and it ASSERTS. A run without the Google
// Fonts network is a run that cannot answer the question, and it says so rather than passing.
//
// BLIND BY CONSTRUCTION, inherited and deliberate:
//   - WIRE LABELS are not measured, here or anywhere in the gate (L-19). A caption on a lane can
//     overrun its neighbour and nothing will notice.
//   - a chip whose two strings are STACKED (a heading over a sub-line, as in the event slots of
//     cluster-list-watch-informers) is not a name/value pair and cannot collide horizontally, so pairs
//     whose vertical centres differ by more than STACK_TOL are excluded.
//   - ladder rows (.scheme-chain) carry ONE string per chip, so they are excluded outright.
//   - only the FIRST and LAST text of a chip are compared, as the original did. A chip with three
//     texts has its middle one unjudged.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census, floor, SUBSET } from '../fixtures/catalog.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import {
  DEFAULT_BASE, discoverIds, FACE_MONO, fallbackFaces, gotoStep, launch, openCard, initPage,
  stepCount,
} from '../fixtures/render.mjs';

// ---------------------------------------------------------------------------------------------
// The two numbers of the rule, both taken from the original tool and not from any prose about it.
// ---------------------------------------------------------------------------------------------

// Minimum clear space between the end of the name and the start of the value, in viewBox units.
// check-chipfit.mjs:17. Not a rendering tolerance: it is the readable gap itself, so 0 would let a
// value touch its name and still pass.
const MIN_GAP = 4;

// Two texts whose vertical centres differ by more than this are STACKED, not a pair.
// check-chipfit.mjs:35. Same unit, same value, and the coincidence is not meaningful.
const STACK_TOL = 4;

// The font the chip strings are actually drawn in: .scheme-chip-text is 11px 'JetBrains Mono'
// (css/diagrams.css:203-207), which is fixtures/render.mjs FACE_MONO. Measured, not assumed,
// because the fallback is what makes a false green possible (L-21). Only this face is guarded:
// every string this file measures is a chip string, and a chip string is mono.
const CHIP_FACES = [FACE_MONO];

// ---------------------------------------------------------------------------------------------
// Control numbers, taken off a green run of the whole catalog, where every chip fits its name
// and its longest value. FLOORS, not equalities: a run that measures fewer cards, steps or chips
// than this has scanned a subset, and a subset reporting zero collisions looks exactly like a clean
// catalog. The card count is additionally pinned to data.js exactly, through census().
// ---------------------------------------------------------------------------------------------
// The walk baseline, DERIVED rather than typed: the catalog it walks and the specs it reads are
// what say how big a whole walk is (CATALOG_BASELINE in ../fixtures/catalog.mjs).
const EXPECTED_CARDS = floor((await cards()).length);
const EXPECTED_STEPS = floor(await stepTotal());
// Cards that DECLARE a chip, counted off the specs: 106 today, the four without one being
// cluster-object-create-path, cluster-architecture, cluster-cascading-deletion and network-service-types. This is
// the guard the pair floor below was being asked to be and could not: it is immune to what a card
// SAYS and falls only when the selector stops matching chips, which is the failure being guarded.
const EXPECTED_CHIP_CARDS = floor(104);
// Distinct card+name+value pairs. CONTENT-DEPENDENT, and deliberately carrying headroom: two chips
// that come to share a value are ONE pair, so an ordinary text repair lowers this number without
// anything being wrong. Three separate agents tripped it in one session on honest de-duplication
// while it sat at the measured 1143 with zero margin. A narrowed selector does not cost three
// pairs, it collapses the count, so the floor is set well under the measurement on purpose.
const EXPECTED_PAIRS = floor(1080);    // measured 1143 on 2026-08-17

// Runs IN THE PAGE, serialised across the CDP boundary, so it closes over nothing. Returns EVERY
// name/value pair it measured, not only the failing ones: the passing ones are the coverage census
// and the tightest-margin report, and a check that only returns findings cannot prove it looked.
const probe = ({ stackTol }) => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;
  const out = [];
  for (const c of svg.querySelectorAll('.scheme-chip')) {
    if (c.closest('.scheme-chain')) continue;        // ladder rows carry one string, not a pair
    const ts = [...c.querySelectorAll('text')];
    if (ts.length < 2) continue;
    const [n, v] = [ts[0], ts[ts.length - 1]];
    const nb = n.getBBox(), vb = v.getBBox();
    // Stacked texts (a heading over a sub-line) are not a name/value pair.
    if (Math.abs((nb.y + nb.height / 2) - (vb.y + vb.height / 2)) > stackTol) continue;
    out.push({
      n: (n.textContent || '').trim(),
      v: (v.textContent || '').trim(),
      gap: Math.round(vb.x - (nb.x + nb.width)),
    });
  }
  return out;
};

const catalogued = await cards();

const browser = await launch();
// Registered on the line after the launch, before the page setup below: node:test runs an
// `after` hook whatever happens to the tests, but a throw in the setup itself (a context, an
// init script, a grid that never renders) happens BEFORE the hook exists, and that browser is
// then nobody's to close for the rest of the run.
after(() => browser.close());

// 1600x1000, as the original set on its page. getBBox reports viewBox units, so the window size is
// not load-bearing for the measurement, but it is what the numbers below were measured under.
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.addInitScript(initPage, 'expose');
const ids = await discoverIds(page, DEFAULT_BASE);

test(`the grid renders the whole catalog (${catalogued.length} cards)`, () => {
  assert.ok(ids.length > 0, `NO CARDS RENDERED at ${DEFAULT_BASE}/scheme/ : posters or grid broken`);
  census('chipfit grid', ids.length, catalogued.length);
});

let walked = 0, stepped = 0;
const tightest = new Map();      // `${id}|${name}|${value}` -> { id, i, name, value, gap }

for (const id of ids) {
  test(id, async () => {
    walked++;                    // counted before the assertions, so this stays a census of
                                 // COVERAGE and a broken card is reported once, as itself.
    await openCard(page, id);

    const fellBack = await fallbackFaces(page, CHIP_FACES);
    assert.deepEqual(fellBack, [],
      `${FACE_MONO.spec} is NOT what this page paints with:\n  ${fellBack.join('\n  ')}\n` +
      'Every width below would be the fallback face, roughly 20 percent narrower, so every chip ' +
      'would look like it fits (L-21). This run needs the Google Fonts network ' +
      '(fonts.googleapis.com and fonts.gstatic.com), it is not a finding about the card.');

    const total = await stepCount(page);
    assert.ok(total > 0, `stepCount is ${total}: no steps to walk`);

    // Pooled over every step, keeping the TIGHTEST reading of each name/value pair: the same chip
    // is remeasured on every step it survives, and the smallest gap is the one that decides.
    const mine = new Map();
    for (let i = 0; i < total; i++) {
      await gotoStep(page, i);
      const rows = await page.evaluate(probe, { stackTol: STACK_TOL });
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
  // One line each: a diagnostic is a single TAP comment, so an embedded newline is escaped and the
  // list becomes unreadable. These five are the chips a longer value will break first.
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
  // The precise reading of "the selector still matches chips": how many CARDS handed this walk at
  // least one pair. A card that declares a chip and contributes none is a card the probe went blind
  // on, and no amount of editing a value can move this number.
  const chipCards = new Set([...tightest.values()].map(h => h.id)).size;
  assert.ok(chipCards >= EXPECTED_CHIP_CARDS,
    `measured a chip on ${chipCards} card(s), expected at least ${EXPECTED_CHIP_CARDS}. The specs ` +
    'declare a chip part on that many, so a card missing here is one the probe read nothing on, and ' +
    'zero collisions over a shrunken set is not a pass.');
  assert.ok(tightest.size >= EXPECTED_PAIRS,
    `measured ${tightest.size} distinct chip pair(s), expected at least ${EXPECTED_PAIRS}. ` +
    'The selector or the pair test has narrowed: zero collisions over a shrunken set is not a pass.');
});
