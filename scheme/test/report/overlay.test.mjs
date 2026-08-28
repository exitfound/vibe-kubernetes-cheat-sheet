// overlay.test.mjs: the narration panel's REAL extent in viewBox units, per card, per step, per
// viewport. Successor to tools/overlay-measure.mjs.
//
// WHAT THE ANCESTOR WAS. `node overlay-measure.mjs <id>` opened ONE card at ONE viewport (VW/VH
// from the env, defaulting to 1600x1000), walked its steps, and printed the single worst bottom it
// saw. It was a reader, not a check: no threshold, no exit code, no catalog walk. The two numbers
// the canon records under L-02 and L-04 were produced by running it by hand, so nothing has
// re-measured them since, and nothing would notice them drifting. This file is the catalog-wide
// version of the same measurement: every card, every step, all three viewports of L-06.
//
// WHY IT IS REPORT-LEVEL. The canon records L-02 and L-04 against this file, as `report:overlay/L-02`
// and `report:overlay/L-04`, and neither they nor the ancestor were ever mandatory. The panel is HTML the browser lays out, so its extent moves with the
// font, the viewport and the prose, and a card that grows its panel by a line has not broken
// anything by itself: it has spent budget that L-08 says is spendable. The decision belongs to a
// person reading the number. So this file NEVER fails. It prints, and it says loudly when what it
// printed is not worth reading.
//
// FONTS ARE NOT A FORMALITY HERE, THEY ARE THE MEASUREMENT (L-21). Of everything the geometry
// rules read, the panel is the ONLY font-sensitive quantity: block bboxes are frames and a frame is
// wider than its label on every card, but the panel is wrapped text, and on the fallback face
// its bottom lands one text line HIGH, 17.5 viewBox units, on 3 of 6 sampled cards. A run without
// fonts therefore reports a SHALLOWER panel than the truth, which is the flattering direction: it
// would quietly widen the L-04 range at the low end and hide occlusion. So waiting for the real
// face is mandatory here: a run that skips it prints a lie in the flattering direction and nothing
// in its output says so. And
// document.fonts.ready alone is not enough because scheme/index.html:29 attaches the Google Fonts
// stylesheet from a <link rel="preload"> onload handler, so `ready` can settle before the sheet is
// even linked. Neither is fonts.check(): with no sheet attached there is no @font-face rule to be
// missing and it reports every family available. The behavioural width probe that answers this
// honestly is fixtures/render.mjs fallbackFaces(), with the measurement written on it. What it returns turns a fallback run into a printed REPORT INVALID
// instead of a silent lie.
//
// THE RIGHT EDGE IS BOUNDED, THE BOTTOM SWINGS, AND NEITHER IS FLAT (L-05, L-05a). The panel is
// HTML at a fixed fraction of the dialog width while the diagram scales with the dialog, so in
// viewBox units its WIDTH is BOUNDED rather than constant: x<=397 holds on every card and every
// viewport (which is why L-02 is one number for the whole catalog) while the right edge still
// travels up to 105.78 units across the set, reaching the bound only at the narrowest viewport.
// Measured below rather than assumed, because "bounded" and "flat" were read as one claim for
// months. Its HEIGHT swings far harder: a WIDER dialog gives a WIDER panel, which wraps the same
// narration into FEWER lines, and is therefore SHORTER in units, twice over, since it is also
// divided by a larger scale.
// Measuring on one viewport is meaningless, and this file measures the swing rather than asserting
// the direction, because the direction is what L-05 claims and a report that assumed it could not
// test it.
//
// THE PROBE CAN LOSE A STEP. Scene.build() empties the dialog host and
// appends a NEW <svg.diagram>, so a probe can land in the instant with no diagram and read null.
// One retry on the selector closes it. Without the retry a walk of this catalog came back one step
// short of what the mandatory files sampled, and in a file that never fails one missing step is one
// composition nobody looked at, reported as nothing.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import {
  DEFAULT_BASE, DIAGRAM, SELECTOR_TIMEOUT_MS, DIAGRAM_FACES, launch, initPage, discoverIds,
  openCard, stepCount, gotoStep, fallbackFaces, overlayProbe,
} from '../fixtures/render.mjs';

// L-06. All three are measured in full here: unlike the geometry rules, which read the panel on the
// extra viewports only to feed OCCLUDED, every number this file prints is a panel number.
const VIEWPORTS = [
  { width: 1600, height: 1000 },
  { width: 1280, height: 860 },
  { width: 1100, height: 800 },
];
const vpName = vp => `${vp.width}x${vp.height}`;

// Both faces are guarded, not just the panel's. The panel itself is Space Grotesk; JetBrains Mono
// is included because the same page paints both and a half-loaded stylesheet is not a state worth
// measuring in. DIAGRAM_FACES is fixtures/render.mjs default, so this file simply takes it.

// ---------------------------------------------------------------------------------------------
// What the canon has on record. Printed and compared, NEVER used to clamp a measurement: a
// disagreement is the finding this file exists to produce.
// ---------------------------------------------------------------------------------------------

// L-02: right edge x<=397 on every card and every viewport, worst measured 396.55.
const RIGHT_CEILING = 397;
const RECORDED_RIGHT = { value: 396.55, id: 'cluster-architecture', viewport: '1100x800' };

// L-04: the bottom ranges 90 to 504 over the standard set. Only the DEEP end belongs to one card.
// 107.67 is the four-line panel at 1600x1000 and 15 cards sit on it, so an "attribution DIFFERS" on
// the shallow end says nothing. 90.23 is one line under that cluster and one card reaches it.
const RECORDED_BOTTOM = {
  lo: 90, hi: 504,
  shallowest: { value: 90.23, id: 'cluster-leader-election', viewport: '1600x1000', step: 2 },
  deepest: { value: 503.13, id: 'workloads-pod-phase-machine', viewport: '1100x800', step: 5 },
};

// L-05a: the panel shrinks in units by up to 186 across the viewport set.
const RECORDED_SWING = 186;

// The step census of a green run of the whole catalog, per viewport.
// The walk baseline, DERIVED rather than typed: the catalog it walks and the specs it reads are
// what say how big a whole walk is (CATALOG_BASELINE in ../fixtures/catalog.mjs).
const EXPECTED_STEPS = await stepTotal();

// A number is only "the same as recorded" within the noise of a browser layout. 0.5 of a viewBox
// unit is well under a text line (17.5) and well under the tolerance any of these rules cares
// about, so anything outside it is a real move and not a rounding artefact.
const SAME = 0.5;

// The probe itself is fixtures/render.mjs overlayProbe, shared with report/geometry-soft.test.mjs:
// one calculation of the panel rect through xMidYMid meet, four edges, of which this file reads all
// four and that one reads two. It runs IN THE PAGE and carries the mapping argument in its own
// comment.

// One probe, with one retry when the diagram is momentarily absent (2.4c above).
async function probeOverlay(page) {
  const first = await page.evaluate(overlayProbe);
  if (first) return first;
  try { await page.waitForSelector(DIAGRAM, { timeout: SELECTOR_TIMEOUT_MS }); } catch (_) { return null; }
  return page.evaluate(overlayProbe);
}

const f2 = n => Number.isFinite(n) ? n.toFixed(2) : 'n/a';
const near = (a, b) => Number.isFinite(a) && Math.abs(a - b) <= SAME;

// OVERLAY_IDS=a,b restricts the walk, the way `node overlay-measure.mjs <id> [<id>...]` did. That
// was the ancestor's ONLY mode and it is the mode L-08 prescribes by name: after editing prose on a
// card whose panel is already deep, re-measure THAT card. The default is the whole catalog, and a
// subset is announced as a SUBSET rather than as REPORT INCOMPLETE, because a walk that was handed
// an explicit list did not lose anything (the same distinction fixtures/catalog.mjs census() draws
// with its `subset` flag). The catalog-wide extremes and the L-04 range are only meaningful on a
// full run, so the report says so when it was not one.
//
// SCHEME_IDS does the same thing for the rest of the suite, and this file answers to BOTH: two
// names for one job is how a reviewer who set SCHEME_IDS for the gate gets a full catalog panel
// walk they did not ask for. OVERLAY_IDS wins where both are set, because it is the narrower
// instrument and the one L-08 names.
const ONLY_VAR = process.env.OVERLAY_IDS ? 'OVERLAY_IDS' : 'SCHEME_IDS';
const ONLY = (process.env.OVERLAY_IDS || process.env.SCHEME_IDS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

const catalogued = await cards();

test('narration panel extent, per card and per viewport (report only, never fails)', async () => {
  const fellBack = new Set();
  const notes = [];
  // per card: { id, steps, byVp: Map(vpName -> { right, bottomLo, bottomHi, loStep, hiStep, perStep: [] }) }
  const rows = [];
  let browser;
  let sampledCards = 0;
  const stepsPerVp = new Map(VIEWPORTS.map(v => [vpName(v), 0]));

  // Catalog-wide extremes, each carrying where it was seen.
  let worstRight = { value: -Infinity, id: null, viewport: null, step: -1 };
  let deepest = { value: -Infinity, id: null, viewport: null, step: -1 };
  let shallowest = { value: Infinity, id: null, viewport: null, step: -1 };
  const overCeiling = [];

  try {
    browser = await launch();
    const context = await browser.newContext({ viewport: VIEWPORTS[0] });
    const page = await context.newPage();
    await page.addInitScript(initPage, 'expose');
    const all = await discoverIds(page, DEFAULT_BASE);
    const ids = ONLY.length ? all.filter(i => ONLY.includes(i)) : all;
    for (const want of ONLY) {
      if (!all.includes(want)) notes.push(`${ONLY_VAR} names ${want}, which the grid does not render`);
    }

    for (const id of ids) {
      try {
        await openCard(page, id);
        for (const f of await fallbackFaces(page)) fellBack.add(f);
        const total = await stepCount(page);
        if (!total) { notes.push(`${id}: stepCount 0, nothing walked`); continue; }

        const byVp = new Map();
        for (const vp of VIEWPORTS) {
          const name = vpName(vp);
          await page.setViewportSize(vp);
          const acc = { right: -Infinity, bottomLo: Infinity, bottomHi: -Infinity, loStep: -1, hiStep: -1, perStep: [] };
          for (let i = 0; i < total; i++) {
            await gotoStep(page, i);
            const o = await probeOverlay(page);
            if (!o) {
              acc.perStep.push(null);
              notes.push(`${id}: step ${i} at ${name} had no diagram or no panel, not sampled`);
              continue;
            }
            stepsPerVp.set(name, stepsPerVp.get(name) + 1);
            acc.perStep.push(o.bottom);
            if (o.right > acc.right) acc.right = o.right;
            if (o.bottom > acc.bottomHi) { acc.bottomHi = o.bottom; acc.hiStep = i; }
            if (o.bottom < acc.bottomLo) { acc.bottomLo = o.bottom; acc.loStep = i; }

            if (o.right > worstRight.value) worstRight = { value: o.right, id, viewport: name, step: i };
            if (o.bottom > deepest.value) deepest = { value: o.bottom, id, viewport: name, step: i };
            if (o.bottom < shallowest.value) shallowest = { value: o.bottom, id, viewport: name, step: i };
            if (o.right > RIGHT_CEILING) {
              overCeiling.push(`${id} at ${name} step ${i}: right ${f2(o.right)} (ceiling ${RIGHT_CEILING})`);
            }
          }
          byVp.set(name, acc);
        }
        await page.setViewportSize(VIEWPORTS[0]);
        rows.push({ id, steps: total, byVp });
        sampledCards++;
      } catch (err) {
        notes.push(`${id}: ${err.message.split('\n')[0]}`);
      }
    }
  } catch (err) {
    notes.push(`harness: ${err.message.split('\n')[0]}`);
  } finally {
    if (browser) await browser.close();
  }

  // -------------------------------------------------------------------------------------------
  // L-05, measured rather than assumed. For each step of each card the three viewports give three
  // bottoms; "as L-05 describes" means the bottom falls as the viewport widens. A step where the
  // order breaks is not a defect, it is the point: the quantity is not monotonic in the viewport,
  // so no single viewport bounds it.
  // -------------------------------------------------------------------------------------------
  let comparableSteps = 0, descending = 0, brokenOrder = 0;
  let maxSwing = { value: -Infinity, id: null, step: -1 };
  const swingByCard = [];
  for (const r of rows) {
    const per = VIEWPORTS.map(v => r.byVp.get(vpName(v)).perStep);
    let cardSwing = -Infinity, cardSwingStep = -1;
    for (let i = 0; i < r.steps; i++) {
      const b = per.map(p => p[i]);
      if (b.some(x => !Number.isFinite(x))) continue;
      comparableSteps++;
      if (b[0] <= b[1] && b[1] <= b[2]) descending++; else brokenOrder++;
      const swing = Math.max(...b) - Math.min(...b);
      if (swing > cardSwing) { cardSwing = swing; cardSwingStep = i; }
      if (swing > maxSwing.value) maxSwing = { value: swing, id: r.id, step: i };
    }
    if (Number.isFinite(cardSwing)) swingByCard.push({ id: r.id, swing: cardSwing, step: cardSwingStep });
  }
  swingByCard.sort((a, b) => b.swing - a.swing);

  const totalSteps = [...stepsPerVp.values()].reduce((a, b) => a + b, 0);

  const out = [];
  out.push('');
  out.push('===== NARRATION PANEL EXTENT, REPORT ONLY (L-02, L-04, L-05) =====');

  // ---- honesty block, before any number, so it is never read past --------------------------
  if (fellBack.size) {
    out.push('  REPORT INVALID: measured on the FALLBACK face, not the real one.');
    for (const f of fellBack) out.push(`    ${f}`);
    out.push(`  The two faces this report needs are ${DIAGRAM_FACES.map(f => f.family).join(' and ')}.`);
    out.push('  The panel is the one font-sensitive quantity in this suite: block bboxes are frames and');
    out.push('  a frame is wider than its label on every card, but the panel is wrapped text. On the');
    out.push('  fallback its bottom lands about one text line (17.5 units) HIGH, so every bottom below');
    out.push('  is flatter than the truth and the L-04 range is wider at the shallow end than it should');
    out.push('  be. Measured against a full-font run of the same card: 24.85 units shallower. That is');
    out.push('  the FLATTERING direction, which is why L-21 is a rule and not a suggestion.');
    out.push('  This is a run problem (no route to fonts.gstatic.com), not a card problem. Fix the run.');
  }
  out.push(`  cards sampled ${sampledCards} of ${catalogued.length} in the catalog`);
  out.push(`  steps sampled ${totalSteps} over ${VIEWPORTS.length} viewports: ` +
    [...stepsPerVp.entries()].map(([n, c]) => `${n} ${c}`).join(', '));
  if (ONLY.length) {
    out.push(`  SUBSET: ${ONLY_VAR} restricted this walk to ${ONLY.length} card(s) (${ONLY.join(', ')}).`);
    out.push('  The per-card rows are true. The catalog-wide extremes, the L-02 ceiling verdict and the');
    out.push('  L-04 range verdict are NOT: they are the worst of what was walked. Only a full run');
    out.push('  can say anything about the catalog.');
  } else if (sampledCards !== catalogued.length) {
    out.push(`  REPORT INCOMPLETE: ${catalogued.length - sampledCards} card(s) were not sampled, so every`);
    out.push('  extreme below undercounts. A report that scans nothing reports nothing.');
  }
  if (!ONLY.length) {
    for (const [name, count] of stepsPerVp) {
      if (count < EXPECTED_STEPS) {
        out.push(`  REPORT INCOMPLETE: ${name} sampled ${count} step(s), ${EXPECTED_STEPS - count} short of the ` +
          `${EXPECTED_STEPS} a green run walks.`);
      }
    }
  }
  // Nothing measured at all, which in practice means no server on BASE. Everything below this
  // point would compare Infinity against the record and print DIFFERS three times, and a run that
  // measured nothing must not produce findings about cards it never opened. Say so and stop.
  if (!totalSteps) {
    out.push('  REPORT INVALID: not one sample was taken, so there is nothing below to read.');
    out.push(`  BASE is ${DEFAULT_BASE}. The render tests need the working tree served there:`);
    out.push('    python3 -m http.server 8888        (from the repo root)');
    out.push('  Every verdict this file prints is a comparison against a measurement, and with zero');
    out.push('  measurements the comparison is not "the record is wrong", it is "nobody looked".');
    if (notes.length) {
      out.push(`  what went wrong (${notes.length}):`);
      notes.slice(0, 5).forEach(l => out.push(`    ${l}`));
    }
    out.push('===== end of report =====');
    console.log(out.join('\n'));
    return;
  }
  out.push('');

  // ---- L-02 --------------------------------------------------------------------------------
  out.push('  L-02  RIGHT EDGE');
  out.push(`    measured worst  ${f2(worstRight.value)} on ${worstRight.id} at ${worstRight.viewport}, step ${worstRight.step}`);
  out.push(`    canon records   ${RECORDED_RIGHT.value} on ${RECORDED_RIGHT.id} at ${RECORDED_RIGHT.viewport}`);
  out.push(`    ceiling         x<=${RIGHT_CEILING} on every card and every viewport`);
  const rightSame = near(worstRight.value, RECORDED_RIGHT.value);
  const rightWhere = worstRight.id === RECORDED_RIGHT.id && worstRight.viewport === RECORDED_RIGHT.viewport;
  out.push(`    verdict         value ${rightSame ? 'MATCHES' : 'DIFFERS FROM'} the record` +
    ` (${f2(worstRight.value)} vs ${RECORDED_RIGHT.value}, tolerance ${SAME}), ` +
    `attribution ${rightWhere ? 'MATCHES' : 'DIFFERS'}` +
    (rightWhere ? '' : ` (record says ${RECORDED_RIGHT.id} at ${RECORDED_RIGHT.viewport})`));
  out.push(`    ceiling         ${overCeiling.length ? `BREACHED by ${overCeiling.length} sample(s)` : 'held on every sample'}`);
  overCeiling.slice(0, 20).forEach(l => out.push(`      ${l}`));
  const rightByVp = VIEWPORTS.map(v => {
    const n = vpName(v);
    const w = Math.max(...rows.map(r => r.byVp.get(n).right).filter(Number.isFinite));
    return `${n} ${f2(w)}`;
  });
  out.push(`    worst per viewport: ${rightByVp.join(' | ')}`);
  // L-05a calls the panel's WIDTH in viewBox units BOUNDED, with x<=397 as the bound, and carries
  // the travel with it. BOUNDED and CONSTANT are two different claims and only the first one is
  // what x<=397 is evidence for: never read the bound as flatness. The measurement stays here
  // rather than becoming a repeated number: per card, how far the right edge travels across the
  // set. The verdict below handles both outcomes, because a run that reads CONSTANT is a run in
  // which the panel or the scale changed and someone must be told.
  let rightSpread = { value: -Infinity, id: null, lo: 0, hi: 0 };
  for (const r of rows) {
    const rs = VIEWPORTS.map(v => r.byVp.get(vpName(v)).right).filter(Number.isFinite);
    if (rs.length < 2) continue;
    const lo = Math.min(...rs), hi = Math.max(...rs);
    if (hi - lo > rightSpread.value) rightSpread = { value: hi - lo, id: r.id, lo, hi };
  }
  out.push(`    L-05a calls the panel WIDTH in viewBox units BOUNDED, not constant. Measured, the right edge`);
  out.push(`    travels up to ${f2(rightSpread.value)} units across the set` +
    (rightSpread.id ? ` (${rightSpread.id}: ${f2(rightSpread.lo)} at the widest viewport to ${f2(rightSpread.hi)} at the narrowest)` : ''));
  out.push(`    verdict         the width is ${rightSpread.value <= SAME ? 'CONSTANT, which L-05a no longer claims: re-read the row' : 'NOT constant, as L-05a says. x<=' + RIGHT_CEILING + ' bounds it and it does'}`);
  if (rightSpread.value > SAME) {
    out.push('                    move: the panel is a fixed FRACTION of the');
    out.push('                    dialog, so it holds its share of the picture while the diagram scale');
    out.push('                    changes under it, and the bound is reached only at the narrowest');
    out.push('                    viewport. A one-viewport L-02 measurement at 1600x1000 would read');
    out.push('                    about 100 units clear of a ceiling it is in fact 0.45 short of.');
  }
  out.push('');

  // ---- L-04 --------------------------------------------------------------------------------
  out.push('  L-04  BOTTOM');
  out.push(`    measured range  ${f2(shallowest.value)} .. ${f2(deepest.value)}`);
  out.push(`      shallowest    ${f2(shallowest.value)} on ${shallowest.id} at ${shallowest.viewport}, step ${shallowest.step}`);
  out.push(`      deepest       ${f2(deepest.value)} on ${deepest.id} at ${deepest.viewport}, step ${deepest.step}`);
  out.push(`    canon records   ${RECORDED_BOTTOM.lo} .. ${RECORDED_BOTTOM.hi}`);
  out.push(`      shallowest    ${RECORDED_BOTTOM.shallowest.value} on ${RECORDED_BOTTOM.shallowest.id} ` +
    `at ${RECORDED_BOTTOM.shallowest.viewport}, step ${RECORDED_BOTTOM.shallowest.step}`);
  out.push(`      deepest       ${RECORDED_BOTTOM.deepest.value} on ${RECORDED_BOTTOM.deepest.id} ` +
    `at ${RECORDED_BOTTOM.deepest.viewport}, step ${RECORDED_BOTTOM.deepest.step}`);
  const loSame = near(shallowest.value, RECORDED_BOTTOM.shallowest.value);
  const hiSame = near(deepest.value, RECORDED_BOTTOM.deepest.value);
  const inBand = shallowest.value >= RECORDED_BOTTOM.lo - SAME && deepest.value <= RECORDED_BOTTOM.hi + SAME;
  out.push(`    verdict         shallowest ${loSame ? 'MATCHES' : 'DIFFERS FROM'} the record, ` +
    `deepest ${hiSame ? 'MATCHES' : 'DIFFERS FROM'} the record (tolerance ${SAME})`);
  out.push(`                    the ${RECORDED_BOTTOM.lo}..${RECORDED_BOTTOM.hi} band written into L-04 ` +
    `${inBand ? 'still holds' : 'is BREACHED by the measurement above'}`);
  const loWhere = shallowest.id === RECORDED_BOTTOM.shallowest.id;
  const hiWhere = deepest.id === RECORDED_BOTTOM.deepest.id;
  out.push(`                    attribution: shallowest ${loWhere ? 'MATCHES' : `DIFFERS (record: ${RECORDED_BOTTOM.shallowest.id})`}, ` +
    `deepest ${hiWhere ? 'MATCHES' : `DIFFERS (record: ${RECORDED_BOTTOM.deepest.id})`}`);
  out.push('');

  // ---- L-05 --------------------------------------------------------------------------------
  out.push('  L-05  THE PANEL AGAINST THE VIEWPORT');
  out.push(`    comparable steps (all three viewports sampled): ${comparableSteps}`);
  out.push(`    bottom falls as the viewport widens, the direction L-05 names: ${descending}`);
  out.push(`    that order broken, so the widest viewport is NOT the shortest panel: ${brokenOrder}`);
  out.push(`    widest swing across the set: ${f2(maxSwing.value)} units on ${maxSwing.id}, step ${maxSwing.step}`);
  out.push(`    L-05a records the swing reaching ${RECORDED_SWING}: measured ` +
    `${f2(maxSwing.value)}, ${maxSwing.value > RECORDED_SWING + SAME ? 'LARGER than' : maxSwing.value < RECORDED_SWING - SAME ? 'smaller than' : 'the same as'} the record`);
  out.push('    the ten cards whose panel moves most between viewports:');
  swingByCard.slice(0, 10).forEach(s => out.push(`      ${s.id.padEnd(38)} ${f2(s.swing).padStart(7)} at step ${s.step}`));
  out.push('');
  out.push(`    Read the two counts carefully. ${brokenOrder} broken orders does NOT contradict L-05, and`);
  out.push('    a reader who takes the word "non-monotonic" literally will think it does. The bottom is');
  out.push('    an orderly, monotone function of the viewport WIDTH, and it runs in exactly the');
  out.push('    direction L-05 gives. What is non-monotonic is the panel against the PICTURE: widen the');
  out.push('    dialog and every drawn thing grows while the panel shrinks, because the panel is HTML at');
  out.push('    a fraction of the dialog and the diagram scales past it. The consequence is the part');
  out.push('    worth acting on, and the swing above is that consequence in units: a one-viewport');
  out.push('    measurement of any of those cards is wrong by up to that much, in the flattering');
  out.push('    direction if it was taken at 1600x1000. Which is why L-08 names VW=1100 VH=800');
  out.push('    specifically for an author who has just edited prose.');
  out.push('');

  // ---- the full table ----------------------------------------------------------------------
  out.push(`  EVERY CARD, EVERY VIEWPORT (${rows.length} cards x ${VIEWPORTS.length} viewports)`);
  out.push(`    ${'card'.padEnd(38)} ${'st'.padStart(2)}  ` +
    VIEWPORTS.map(v => `${vpName(v)}: right / bottom lo..hi`).join('   '));
  for (const r of rows) {
    const cells = VIEWPORTS.map(v => {
      const a = r.byVp.get(vpName(v));
      return `${f2(a.right).padStart(6)} / ${f2(a.bottomLo).padStart(6)}..${f2(a.bottomHi).padStart(6)}`;
    });
    out.push(`    ${r.id.padEnd(38)} ${String(r.steps).padStart(2)}  ${cells.join('   ')}`);
  }
  out.push('');

  out.push('  How to read a row. `right` is BOUNDED, not flat: L-05a records x<=397 everywhere and a');
  out.push('  right edge that still travels up to 105.78 units across the three columns, so the bound');
  out.push('  is reached at the narrowest viewport alone. The spread measured on this run is above.');
  out.push('  `bottom lo..hi` is the card\'s own reserved corner: L-07 says that measurement belongs in');
  out.push('  the card header comment, never in a constant, because it is a fact ABOUT the panel and');
  out.push('  not an input to the layout. L-08: on a card whose bottom is already deep the panel is a');
  out.push('  CHARACTER BUDGET, and editing narration for accuracy spends it without any check saying');
  out.push('  so, because OCCLUDED scores occluded AREA and a 25 unit strip off a 152 unit frame is');
  out.push('  under its bar.');
  if (notes.length) {
    out.push('');
    out.push(`  samples that could not be taken: ${notes.length}`);
    notes.slice(0, 20).forEach(l => out.push(`    ${l}`));
  }
  out.push('===== end of report =====');

  console.log(out.join('\n'));

  // NO ASSERTION ON A MEASUREMENT, and one on the WALK. Every verdict above is a quantity the
  // canon records as report-level, and a person acts on it. Whether this file ran AT ALL is a
  // different question: a browser that never launched or a card that threw on every open prints
  // REPORT INCOMPLETE into a page nobody has to read and exits 0. That is the one thing a report
  // may go red on (`S-46`).
  //
  // OVERLAY_IDS is the legitimate way to walk fewer, so the expected size is what the filter asked
  // for and not the catalog, and a named id the grid does not render is already a note above.
  const wanted = ONLY.length ? ONLY.length : catalogued.length;
  assert.equal(sampledCards, wanted,
    `sampled ${sampledCards} of ${wanted} card(s) asked for. A report that scans nothing reports ` +
    'nothing, and every extreme above undercounts by whatever it missed.');
});
