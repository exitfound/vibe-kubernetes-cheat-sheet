// P-03 off the data, as a queue ranked by lead (ms a chip value shows before the step's first arrival):
// FORM-A, FORM-B (the chip is in `lit`), FORM-B-LEAD, FORM-E (gated in ../unit/chip-beat-e.test.mjs).
// Fails only on the census. Cannot tell whether the arrival earns the value (P-06), nor read enter().

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { carriedBlock, shapeProblems } from '../fixtures/carried.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import { chipBeat } from '../fixtures/chip-beat.mjs';

const EXPECTED_CARDS = (await cards()).length;
const EXPECTED_STEPS = await stepTotal();

// The population starts at 700ms, the shortest flight in the catalog.
const LEAD_BANDS = [[0, 700], [700, 1000], [1000, 1500], [1500, 2200], [2200, Infinity]];

const FORMS = await chipBeat();

const pad = (n) => String(n).padStart(4);
const countsOf = (recs) => [recs.length, new Set(recs.map(r => r.step)).size, new Set(recs.map(r => r.card)).size];
const fmt = ([a, b, c]) => `${a} record(s) / ${b} step(s) / ${c} card(s)`;

test('P-03, a chip that runs ahead of the ball (report only, census is the assertion)', async (t) => {
  const {
    A, B, bLead, bOpen, bHeld, bStale, E, eOpen, eHeld, divergent, notes, stale,
    walked, steps, candidateSteps, compared, unresolved, catalogSize,
  } = FORMS;

  const live = { 'FORM-A': countsOf(A), 'FORM-B': countsOf(B), 'FORM-B-LEAD': countsOf(bLead), 'FORM-E': countsOf(E) };

  const out = [];
  out.push('');
  out.push('===== P-03, value ahead of motion, REPORT ONLY =====');
  out.push(`  cards walked ${walked} of ${catalogSize} in the catalog, steps read ${steps}`);
  out.push(`  steps carrying a ball ${candidateSteps}, chip slots compared against the previous step ${compared}` +
    (unresolved ? `, flows with an unresolvable after/at reference and therefore no arithmetic ${unresolved}` : ''));
  if (walked < EXPECTED_CARDS || steps < EXPECTED_STEPS) {
    out.push(`  REPORT INCOMPLETE: expected at least ${EXPECTED_CARDS} cards and ${EXPECTED_STEPS} steps, ` +
      'every number below undercounts');
  }

  out.push('');
  out.push('1. THE FOUR FORMS, counted live on this walk');
  for (const form of Object.keys(live)) out.push(`   ${form.padEnd(11)} ${fmt(live[form])}`);
  out.push('   FORM-A is the naive form and is counted only: P-06 puts a chip turning over at step');
  out.push('   ENTRY inside the rules, so most of FORM-A is the ordinary case and printing all of it');
  out.push('   would bury FORM-B.');

  out.push('');
  out.push(`2. FORM-B, the queue, ranked by how long the value stands on screen before the first ball lands: ${B.length} finding(s), ` +
    `${bHeld.length} carried with a reason, ${E.length} owned by FORM-E below, ${bOpen.length} left to work`);
  out.push('   lead bands:');
  for (const [lo, hi] of LEAD_BANDS) {
    const n = bOpen.filter(r => r.lead >= lo && r.lead < hi).length;
    if (n) out.push(`   ${pad(n)}  ${hi === Infinity ? `${lo}ms and up` : `${lo} to ${hi}ms`}`);
  }
  for (const r of [...bOpen].sort((a, b) => b.lead - a.lead || (a.card < b.card ? -1 : 1))) {
    out.push(`   ${pad(r.lead)}ms  ${r.card} step ${r.i} '${r.stepId}'  chip "${r.key}" already reads ` +
      `${JSON.stringify(r.to)} (was ${JSON.stringify(r.from)}) and is lit at entry`);
  }
  const byCard = new Map();
  for (const r of bOpen) byCard.set(r.card, (byCard.get(r.card) || 0) + 1);
  if (byCard.size) {
    out.push('   by card:');
    for (const [id, n] of [...byCard.entries()].sort((a, b) => b[1] - a[1])) out.push(`   ${pad(n)}  ${id}`);
  }
  // A record that is also FORM-E is owned by section 3, never carried here.
  for (const l of carriedBlock('FORM-B', bHeld.map(r => ({ key: r.carryKey, why: r.bWhy })), bStale)) out.push(l);

  out.push('');
  out.push(`3. FORM-E, THE STRONGEST CLASS THE DATA CAN NAME: ${E.length} finding(s), ` +
    `${eHeld.length} carried with a reason, ${eOpen.length} left to work`);
  out.push('   Every one of these steps turns ANOTHER chip over on a beat, so the card already knows');
  out.push('   the technique and applied it next door. P-04: doing this to one chip and not its');
  out.push('   neighbour is worse than doing it to neither.');
  for (const r of eOpen) {
    out.push(`   ${r.card} step ${r.i} '${r.stepId}'  chip "${r.key}" reads ${JSON.stringify(r.to)} at entry, ` +
      `${r.lead}ms before the first arrival, while [${r.neighbours.join(', ')}] on this same step ` +
      'wait for their beat');
  }
  for (const l of carriedBlock('FORM-E', eHeld.map(r => ({ key: r.carryKey, why: r.why })), stale)) out.push(l);

  out.push('');
  out.push(`4. THE HOLE A FIX CAN OPEN: ${divergent.length} step/chip pair(s) on ` +
    `${new Set(divergent.map(d => d.card)).size} card(s) already end the two paths on different text`);
  for (const d of divergent) out.push(`   ${d.line}`);
  out.push('   The static path (prev, reset, prefers-reduced-motion) writes `chips` and never runs the');
  out.push('   flow, so an F.set is the animated path only. render/reduced.test.mjs compares opacity,');
  out.push('   wire text and highlight, and a chip VALUE is on none of them. Repair a FORM-B or FORM-E finding');
  out.push('   with the rewind form, or write the end value into `chips` too: see the header.');

  // Printed rather than asserted: this file fails on the census alone.
  const ids = new Set((await cards()).map(c => c.id));
  const broken = ['FORM-B', 'FORM-E'].flatMap(a => shapeProblems(a, ids));
  if (broken.length) {
    out.push('');
    out.push(`BROKEN RULINGS in fixtures/carried.mjs: ${broken.length}`);
    for (const b of broken) out.push('   ' + b);
  }

  if (notes.length) {
    out.push('');
    out.push(`cards that could not be read: ${notes.length}`);
    for (const l of notes) out.push(`   ${l}`);
  }
  out.push('===== end of report =====');
  console.log(out.join('\n'));

  // The census assertions. FORM-E is asserted in ../unit/chip-beat-e.test.mjs.
  assert.ok(walked >= EXPECTED_CARDS,
    `walked ${walked} card(s), the catalog had ${EXPECTED_CARDS} when this report was written. ` +
    'A report over a subset prints few findings and looks exactly like a clean catalog.');
  assert.ok(steps >= EXPECTED_STEPS,
    `read ${steps} step(s), expected at least ${EXPECTED_STEPS}. A step nobody read is a step whose ` +
    'chip turnover was never timed, and this file would still print a number.');
  assert.ok(compared > 0,
    'not one chip slot was compared against the previous step, so every form above measured an ' +
    'empty set. Either the chip resolution has gone blind or no step carries a ball.');
  t.diagnostic(`P-03: ${walked} cards, ${steps} steps, A ${A.length}, B ${B.length} (${bOpen.length} unread), ` +
    `B+lead ${bLead.length}, E ${E.length} (${eOpen.length} unread), path divergence ${divergent.length}`);
});
