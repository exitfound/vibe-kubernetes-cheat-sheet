// palette-steps.test.mjs: the coverage the palette check never had.
//
// tools/check-palette.mjs sampled a card ONCE, as it opened, and stopped. It contained no gotoStep
// and no enterStep at all, so every colour that appears in the middle of a story was outside its
// reach: packets and ripples exist only on the played path and were therefore never sampled by it,
// and a lit or dimmed state that only some step produces was seen only if that step happened to be
// the one showing at open. render/palette.test.mjs reproduces that behaviour exactly, numbers
// included. This file walks every step and measures what the extra sampling adds.
//
// WHY THIS IS REPORT-LEVEL AND NOT IN THE GATE. It is an EXTENSION of coverage, not a
// reimplementation. Anything it finds is a finding about a CARD, and the project already runs the
// cycle "report-only -> triage -> promote into the mandatory set" (the ENFORCED sets in
// check-canon.mjs:78 and check-reduced.mjs:25 are the same idea). Promoting the step walk before
// its findings have been read would turn one measurement into a red gate for work nobody has
// scheduled. So this file NEVER fails: it prints. Read the census line at the top of its output,
// because a report that scanned nothing also prints no findings.
//
// The played pass is NOT run-to-run deterministic in the small: enterStep freezes the animations of
// a step, but which of two cards happens to be caught mid-pulse varies, so the per-pass conflict
// count moves by one between runs while the union stays put. That instability is a second reason
// the walk stays here rather than in the gate, and it is why nothing below is asserted.
//
// The probe below is a LOCAL COPY of the one in render/palette.test.mjs. It is not imported,
// because importing a node:test module runs its tests as a side effect, and it is not hoisted into
// ../fixtures/ because widening a shared fixture is out of scope for this change. If a third caller
// ever appears, that is the moment to move it.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { PAINTED, classify, probePaint } from '../fixtures/palette.mjs';
import {
  DEFAULT_BASE, launch, initPage, discoverIds, openCard, stepCount, gotoStep, enterStep,
} from '../fixtures/render.mjs';

// The numbers render/palette.test.mjs asserts, restated here so the delta is readable without
// running the other file. If these two ever disagree, the mandatory test is the truth.
const OPEN_ELEMENTS = 2047;
const OPEN_COMBINATIONS = 29;

// One accumulator per sampling scope, plus a union. `where` is card + sampling point, which is what
// turns a conflict into something a reader can go and open.
function makeScope(name) {
  return { name, tuples: new Map(), elements: 0, unknown: [], unpainted: [] };
}

// The JUDGEMENT is ../fixtures/palette.mjs, the same reader render/palette.test.mjs folds with, so
// the gate and this census cannot disagree about which element resolved a colour. What stays here is
// this walk's bookkeeping: SITES rather than cards, because a step is what it reports on.
function fold(scope, id, where, rows) {
  for (const r of rows) {
    scope.elements++;
    const v = classify(id, r);
    if (v.verdict === 'unknown') { scope.unknown.push(`${id} @${where}  ${r.cls} role="${r.role}"`); continue; }
    if (v.verdict === 'unpainted') {
      scope.unpainted.push(`${id} @${where}  ${r.cls}[data-role="${r.role}"] ${r.paintProp}=${v.colour}`);
      continue;
    }
    if (!scope.tuples.has(v.key)) scope.tuples.set(v.key, new Map());
    const byColour = scope.tuples.get(v.key);
    if (!byColour.has(v.colour)) byColour.set(v.colour, []);
    const sites = byColour.get(v.colour);
    if (sites.length < 4 && !sites.some(s => s.startsWith(`${id}@`))) sites.push(`${id}@${where}`);
  }
}

const catalogued = await cards();

test('palette across every step (report only, never fails)', async () => {
  const open = makeScope('open');          // what the old check saw: the card as it opens
  const stat = makeScope('static');        // gotoStep over every step, the prev/reset replay path
  const play = makeScope('played');        // enterStep over every step, the real motion path
  const union = makeScope('union');

  const notes = [];
  let browser;
  let sampledCards = 0;
  let steps = 0;
  let playedSteps = 0;

  try {
    browser = await launch();
    // Same environment as the mandatory test: reducedMotion so a pulse mid-flight is not read back
    // as a resting stroke. The played pass overrides it per step through enterStep's reduced:false,
    // which is the same route smoke.test.mjs takes.
    const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.addInitScript(initPage, 'expose');
    const ids = await discoverIds(page, DEFAULT_BASE);

    for (const id of ids) {
      try {
        await openCard(page, id);
        const atOpen = await page.evaluate(probePaint, PAINTED);
        if (!atOpen) { notes.push(`${id}: no diagram`); continue; }
        fold(open, id, 'open', atOpen);
        fold(union, id, 'open', atOpen);

        const total = await stepCount(page);

        for (let i = 0; i < total; i++) {
          await gotoStep(page, i);
          const rows = await page.evaluate(probePaint, PAINTED);
          if (!rows) continue;
          steps++;
          fold(stat, id, `static#${i}`, rows);
          fold(union, id, `static#${i}`, rows);
        }

        // Step 0 is the static poster and has no play path of its own.
        for (let i = 1; i < total; i++) {
          await enterStep(page, i);
          const rows = await page.evaluate(probePaint, PAINTED);
          if (!rows) continue;
          playedSteps++;
          fold(play, id, `played#${i}`, rows);
          fold(union, id, `played#${i}`, rows);
        }

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

  const conflicts = (scope) => [...scope.tuples.entries()].filter(([, byColour]) => byColour.size > 1);
  const line = (s) => `  ${s.name.padEnd(7)} elements ${String(s.elements).padStart(7)}   combinations ${String(s.tuples.size).padStart(4)}   conflicting ${conflicts(s).length}`;

  const out = [];
  out.push('');
  out.push('===== palette across every step, REPORT ONLY =====');
  out.push(`  cards sampled ${sampledCards} of ${catalogued.length} in the catalog`);
  out.push(`  steps walked  ${steps} static, ${playedSteps} played`);
  if (sampledCards !== catalogued.length) {
    out.push(`  REPORT INCOMPLETE: ${catalogued.length - sampledCards} card(s) were not sampled, the numbers below undercount`);
  }
  out.push('');
  out.push(`  baseline asserted by render/palette.test.mjs: ${OPEN_ELEMENTS} elements, ${OPEN_COMBINATIONS} combinations`);
  out.push(line(open));
  out.push(line(stat));
  out.push(line(play));
  out.push(line(union));
  out.push('');

  const newKeys = [...union.tuples.keys()].filter(k => !open.tuples.has(k)).sort();
  out.push(`NEW combinations the step walk reveals (union minus open): ${newKeys.length}`);
  for (const k of newKeys) {
    const byColour = union.tuples.get(k);
    const colours = [...byColour.entries()]
      .map(([c, sites]) => `${c} <- ${sites.join(', ')}`).join('  ||  ');
    out.push(`  ${byColour.size > 1 ? 'CONFLICT ' : '         '}${k.padEnd(52)} ${colours}`);
  }
  out.push('');

  const bad = conflicts(union);
  // A conflict whose SECOND and later colours come only from played samples is the sampling
  // artefact the original avoided by running under reducedMotion: the kit pulse animates the stroke
  // from tint.base to tint.bright with fill forwards, enterStep freezes it at its first keyframe, so
  // a lit element reads back as resting. Separating the two is the difference between a card
  // finding and a note about this file.
  const playedOnly = bad.filter(([, byColour]) =>
    [...byColour.values()].slice(1).every(sites => sites.every(s => s.includes('@played'))));
  out.push(`CONFLICTING combinations over the whole walk (one tuple, more than one colour): ${bad.length}`);
  out.push(`  of those, ${playedOnly.length} owe their extra colour(s) to PLAYED samples only (pulse frozen at its first keyframe, not a card defect)`);
  for (const [k, byColour] of bad) {
    out.push(`  ${k}${open.tuples.has(k) ? '   (already visible at open)' : '   (only visible mid-story)'}`);
    for (const [colour, sites] of byColour) out.push(`      ${colour.padEnd(22)} ${sites.join(', ')}`);
  }
  out.push('');

  out.push(`UNKNOWN roles over the whole walk: ${union.unknown.length}`);
  union.unknown.slice(0, 20).forEach(l => out.push('  ' + l));
  out.push(`UNPAINTED over the whole walk: ${union.unpainted.length}`);
  union.unpainted.slice(0, 20).forEach(l => out.push('  ' + l));

  if (notes.length) {
    out.push('');
    out.push(`cards that could not be sampled: ${notes.length}`);
    notes.slice(0, 20).forEach(l => out.push('  ' + l));
  }
  out.push('===== end of report =====');

  console.log(out.join('\n'));

  // NO ASSERTION ON A FINDING, and one on the WALK. Every line above is a measurement, and the
  // decision about it belongs to a person reading the card's record. What is NOT a measurement is
  // whether this file ran at all: a browser that never launched, a server that answered nothing or
  // a card that threw on every open leaves `notes` full, prints REPORT INCOMPLETE into a page of
  // output nobody has to read, and exits 0. That is the failure the rest of the harness is built
  // against (`S-46`), and it is the one thing a report may go red on.
  assert.equal(sampledCards, catalogued.length,
    `sampled ${sampledCards} of ${catalogued.length} card(s). A report that scans nothing reports ` +
    'nothing, and every number above undercounts by whatever it missed.');
  assert.ok(steps > 0 && playedSteps > 0,
    `walked ${steps} static and ${playedSteps} played step(s): a run that samples neither has ` +
    'measured no palette at all.');
});
