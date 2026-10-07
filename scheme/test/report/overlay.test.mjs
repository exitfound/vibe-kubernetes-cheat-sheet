// The narration panel's extent in viewBox units per card, step and viewport, against the L-02 right
// edge, the L-04 bottom range and the L-05 / L-05a swing. Never fails on a measurement. A fallback
// face reports the panel shallow, so it prints REPORT INVALID (L-21).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import { DIAGRAM_FACES, DEFAULT_BASE } from '../fixtures/render.mjs';
import { readSnapshot } from '../fixtures/snapshot.mjs';

// The three-viewport panel walk comes from tools/walk.mjs, stored as `panel`.

// L-06. Every number this file prints is a panel number, so all three are measured in full.
const VIEWPORTS = [
  { width: 1600, height: 1000 },
  { width: 1280, height: 860 },
  { width: 1100, height: 800 },
];
const vpName = vp => `${vp.width}x${vp.height}`;

// Both faces guarded: a half-loaded stylesheet is not a state worth measuring in.

// What the canon records, compared but never used to clamp a measurement.

const RIGHT_CEILING = 397;
const RECORDED_RIGHT = { value: 396.55, id: 'cluster-architecture', viewport: '1100x800' };

// L-04. Only the deep end belongs to one card: many cards share the shallow four-line panel.
const RECORDED_BOTTOM = {
  lo: 90, hi: 379,
  shallowest: { value: 90.23, id: 'cluster-leader-election', viewport: '1600x1000', step: 2 },
  deepest: { value: 378.90, id: 'workloads-pod-qos-classes', viewport: '1100x800', step: 4 },
};

const RECORDED_SWING = 131.68;

const EXPECTED_STEPS = await stepTotal();

// Within browser layout noise, well under one text line (17.5).
const SAME = 0.5;

const f2 = n => Number.isFinite(n) ? n.toFixed(2) : 'n/a';
const near = (a, b) => Number.isFinite(a) && Math.abs(a - b) <= SAME;

// OVERLAY_IDS (or SCHEME_IDS) narrows the walk, as L-08 prescribes after editing prose. A subset is
// announced as a SUBSET, and catalog-wide extremes are only meaningful on a full run.
const ONLY_VAR = process.env.OVERLAY_IDS ? 'OVERLAY_IDS' : 'SCHEME_IDS';
const ONLY = (process.env.OVERLAY_IDS || process.env.SCHEME_IDS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

const catalogued = await cards();

test('narration panel extent, per card and per viewport (report only, never fails)', async () => {
  const fellBack = new Set();
  const notes = [];
  const rows = [];
  let sampledCards = 0;
  const stepsPerVp = new Map(VIEWPORTS.map(v => [vpName(v), 0]));

  let worstRight = { value: -Infinity, id: null, viewport: null, step: -1 };
  let deepest = { value: -Infinity, id: null, viewport: null, step: -1 };
  let shallowest = { value: Infinity, id: null, viewport: null, step: -1 };
  const overCeiling = [];

  try {
    const snap = readSnapshot();
    const all = snap.ids;
    const ids = ONLY.length ? all.filter(i => ONLY.includes(i)) : all;
    for (const want of ONLY) {
      if (!all.includes(want)) notes.push(`${ONLY_VAR} names ${want}, which the grid does not render`);
    }

    for (const id of ids) {
      try {
        const card = snap.cards[id];
        for (const f of card.fellBack) fellBack.add(f);
        const total = card.steps;
        if (!total) { notes.push(`${id}: stepCount 0, nothing walked`); continue; }

        const byVp = new Map();
        for (const vp of VIEWPORTS) {
          const name = vpName(vp);
          const acc = { right: -Infinity, bottomLo: Infinity, bottomHi: -Infinity, loStep: -1, hiStep: -1, perStep: [] };
          for (let i = 0; i < total; i++) {
            const o = card.byVp[name][i].panel;
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
        rows.push({ id, steps: total, byVp });
        sampledCards++;
      } catch (err) {
        notes.push(`${id}: ${err.message.split('\n')[0]}`);
      }
    }
  } catch (err) {
    notes.push(`harness: ${err.message.split('\n')[0]}`);
  }

  // L-05: a step where the bottom does not fall as the viewport widens is the point, not a defect.
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

  // Honesty block first, so it is never read past.
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
  // Nothing measured means no server: stop rather than print findings about unopened cards.
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
  // L-05a: bounded is not constant. A run that reads constant means the panel or the scale changed.
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

  // No assertion on a measurement, one on the walk (S-46). The expected size is what the filter asked for.
  const wanted = ONLY.length ? ONLY.length : catalogued.length;
  assert.equal(sampledCards, wanted,
    `sampled ${sampledCards} of ${wanted} card(s) asked for. A report that scans nothing reports ` +
    'nothing, and every extreme above undercounts by whatever it missed.');
});
