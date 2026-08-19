// chip-beat.test.mjs: P-03 read off the DATA. "A chip must not run ahead of the motion that
// produces its value." Nothing in the harness has ever asked that question. ../report/arrival.test.mjs
// carries the only rule about a chip and a packet in one step, and R2 asks the OPPOSITE half of it:
// "this value CHANGED and nothing is pointing at it", which is about the CUE. The question P-03 is
// made of is about the BEAT: "this value is already on screen, and the arrival that earns it has not
// happened yet". A card can satisfy R2 perfectly, with the changed chip lit at entry, and still show
// the answer a second and a half before the ball that carries it arrives. That is the class a manual
// read of all 108 cards found about 25 times in all four categories, and it is the class this file
// counts.
//
// It needs no browser. A route's flight time is geometry (routeDur over its points) and a step's
// chip values are fields, so both halves of the question are in the spec.
//
// ===========================================================================================
// WHY THIS IS A REPORT WITH A SEVERITY AXIS AND NOT A VERDICT
// ===========================================================================================
// Because the canon deliberately says the naive form of this is LEGAL. P-06: "Value chips are
// deliberately OUT of the arrival rule: they light at step ENTRY with the text change, while boxes,
// pods and cylinders light on ARRIVAL. Two different cues for two different kinds of object." So a
// chip whose text turns over at step entry is by itself correct, and the question that separates a
// defect from the ordinary case is whether the arrival in that step is what EARNS the value. No
// field on a step declares that. It is a reading of the picture and of the narration, and no walk
// over the data can do it.
//
// So the file prints a QUEUE ORDERED BY HOW BAD THE CASE LOOKS, and a person rules on it. The order
// is the lead: how many milliseconds the value sits on screen before the first packet of that step
// lands anywhere. A chip that turns over 2971ms before anything arrives is a different animal from
// one 700ms ahead, and only the reader can say which of them is wrong.
//
// WHERE THE FORMS ARE COMPUTED, AND WHY NOT HERE. The walk, the four form definitions, the census
// floor and the carried table are all in ../fixtures/chip-beat.mjs, because FORM-E has since been
// promoted and ../unit/chip-beat-e.test.mjs asks the same question as a VERDICT. Two copies of "what
// a FORM-E record is" would let the gate and this report describe two different catalogues while
// both stayed green. This file owns the PRINTING and nothing else; that fixture's header carries the
// argument for its own address.
//
// FOUR FORMS, NARROWING. The two printed queues are the two CANON.md P-03 cites: FORM-B here, as
// `report:chip-beat/FORM-B`, and FORM-E in the gate, as `test:chip-beat-e/FORM-E`. All four are
// counted on every run so the shape of the population is visible; only the two named ones are
// printed in full.
//
//   FORM-A       step i > 0, the flow carries a packet, the chip's ENTRY value (chips + chipsCued
//                + rewind) differs from the previous step's SETTLED value, and no F.set with a
//                positive delay turns that key over in this step. The naive form.
//                                                                    578 rec / 289 steps / 96 cards
//   FORM-B       FORM-A, and the step names that chip in `lit`, so the CARD ITSELF declares the
//                value to be the news of this step. Printed in full, ranked by lead.
//                                                                    400 rec / 190 steps / 67 cards
//                lead bands: 227 in 700-1000ms, 16 in 1000-1500, 146 in 1500-2200, 11 above 2200.
//                Worst: network-headless-service `stable-name` at 2971ms, workloads-rolling-update
//                `probe-and-drain` and `third-cycle` at 2860ms.
//   FORM-B-LEAD  FORM-B with a first arrival at or past 1500ms.    157 rec /  69 steps / 39 cards
//   FORM-E       FORM-B, and ANOTHER chip on the SAME step IS turned over on a beat (an F.set with
//                a delay). The card knows the technique and applies it to a neighbour, so this is
//                the strongest reading the data can give: both sides of the comparison stand on one
//                step of one card. P-04 names exactly this shape and calls it worse than doing
//                neither. Printed as its own queue.       6 rec /   5 steps /  5 cards
//
// The ~25 findings a human read lie between FORM-E and FORM-B-LEAD, and no form reproduces them
// exactly. That is expected rather than a defect of the forms: what the human was reading is
// whether the arrival EARNS the value, and P-06 is the reason no field says so.
//
// ===========================================================================================
// WHY THREE OF THE FOUR ARE STILL report/, AND WHY FORM-E IS NOT
// ===========================================================================================
// The cycle is written in ../report/arrival.test.mjs and this project has now run it three times:
// report-only, then a human triage of the queue, then promotion into the mandatory set. FORM-E
// reached the end of it. Its queue was read card by card, nine findings, nine carried with a written
// reason, none left to work, and on that day it left this file for ../unit/chip-beat-e.test.mjs,
// where a new one goes red. This file still COUNTS it and still prints the carried table, because
// the queue is the record of that triage and the reasons are the only place the argument for each
// one is written down.
//
// The other three stay here, and the numbers are the argument: FORM-A is 556 records and FORM-B is
// 384 on two thirds of the catalogue, so either of them promoted would redden the gate against work
// nobody has scheduled, and the gate would stop being usable. Section 4's path divergence is 15 open
// findings on 7 cards and is the same case.
//
// WHAT FAILS HERE: the census, and nothing else. A report that walked less than the catalog prints
// few findings and looks exactly like a clean catalog: a walk that reaches 649 steps of 650 drops
// the 650th silently and nothing in the output looks wrong, which is why the floor below is
// asserted rather than printed. Fewer than the recorded cards or steps is an assertion failure,
// not a note. The SHAPE of the carried
// table (a reason on every entry, three fields in every key) is asserted in the gate file,
// ../unit/chip-beat-e.test.mjs, where a table that has gone soft can go red.
//
// ===========================================================================================
// THE TRAP: THE TWO EXEMPLARS DO IT RIGHT IN TWO DIFFERENT WAYS, AND ONE OF THEM OPENS A SECOND HOLE
// ===========================================================================================
// Both of these are correct P-03 and they are not the same edit:
//
//   cluster-etcd-raft `quorum-lost`  states the END value in `chips` (r1: Leader) and winds it BACK
//                                    with `rewind`, then an F.set turns it over at 1500ms.
//   workloads-daemonset `place`      states the START value in `chips` (currentChip: 0) and raises
//                                    it with an F.set on the beat.
//
// The difference matters to a fixer, because the STATIC path reads `chips` and never runs the flow.
// So with the rewind form both paths end on the same text, and with the F.set form the static path
// (prev, reset, and prefers-reduced-motion) ends on the value the step STARTED from while the
// animated path ends on the new one. NOTHING in the harness sees that. render/reduced.test.mjs
// compares four axes, OPACITY-OWN, OPACITY-INHERITED, WIRE-TEXT and HIGHLIGHT, and a chip's VALUE
// TEXT is on none of them: its text list is wire labels only (`WIRE_SEL = '.scheme-label'`, line
// 113 of that file). The count today is printed in section 4 below: 15 step/chip pairs on 7 cards
// already end the two paths on different text.
//
// So: FIXING A FINDING FROM THIS QUEUE WITH AN F.set ALONE CLOSES P-03 AND OPENS THAT ONE. Either
// use the rewind form, which is invisible to it, or write the end value into `chips` as well and
// wind it back, so the static path lands where the animated path lands.
//
// ===========================================================================================
// WHAT THIS FILE IS BLIND TO
// ===========================================================================================
//   - WHETHER THE ARRIVAL EARNS THE VALUE. The whole subject, and it is judged by the SHAPE OF THE
//     DATA: a packet in the flow, a value that moved, a `lit` naming the chip. Whether that packet
//     is the thing that produces that number is a reading of the picture. This is why FORM-B is a
//     queue and not a finding list.
//   - `enter(s, ctx)`. 42 of the 650 steps carry one and their bodies are functions, not data. A
//     chip an escape writes reads here as whatever the fields said, so a step can be reported for a
//     value it does not actually show, or stay silent about one it does.
//   - THE ARITHMETIC IS COMPUTED FROM `flow`, NOT MEASURED OFF A FRAME. It is ../fixtures/spec.mjs
//     `timelineOf`, the same reader unit/spec-steps.test.mjs times a step's duration with: it
//     ignores the ripple, the packet fades and the pulse tails, and it cannot see anything a paused
//     animation would have deferred. Deliberately so. A frozen frame is blind to a deferred F.set
//     (a paused animation never fires onfinish), and propping this reading up with a frame would
//     make it weaker, not stronger.
//   - A CUE THAT IS NOT A HIGHLIGHT. P-05a: on four cards the cue is a Pod pulse or a helper walking
//     a listing row by row. FORM-B asks only whether the step names the chip in `lit`, so a card
//     cueing a chip any other way stays down in FORM-A and is never printed.
//   - WHICH packet earns which chip. The lead is measured to the FIRST arrival of the step, whatever
//     it carries. A step whose first ball is unrelated to the chip reads as less severe than it is.
//   - `anim` and `tag` are not counted as packets. A ball drawn through F.anim, and a label riding a
//     ball, are not the route/segment/top verbs this file looks for.
//   - Everything R2 is blind to about the CUE, which is the other half of the same rule and not this
//     file's subject. What this file does NOT inherit from R2 is its positional weakness: chips are
//     paired here by REF KEY, so adding or removing a chip cannot silently pair two different ones.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import { chipBeat } from '../fixtures/chip-beat.mjs';

// The walk baseline, DERIVED rather than typed: the catalog it walks and the specs it reads are
// what say how big a whole walk is (CATALOG_BASELINE in ../fixtures/catalog.mjs).
const EXPECTED_CARDS = (await cards()).length;
const EXPECTED_STEPS = await stepTotal();


// The bands the queue is summarised in. Chosen off the measured distribution, not in advance: the
// population starts at 700ms because that is the shortest flight in the catalog.
const LEAD_BANDS = [[0, 700], [700, 1000], [1000, 1500], [1500, 2200], [2200, Infinity]];

// What the four forms measured the day this file was written, as records / steps / cards. Printed
// beside the live numbers, never asserted: a card repaired in phase F is SUPPOSED to move them, and
// an assertion here would make a repair look like a regression. What the drift line is for is the
// other direction, a walk that goes quiet without anyone repairing anything.
const RECORDED = {
  'FORM-A': [578, 289, 96],
  'FORM-B': [400, 190, 67],
  'FORM-B-LEAD': [157, 69, 39],
  'FORM-E': [6, 5, 5],
};

// The walk itself, and every number this file prints, come from the fixture. See the header.
const FORMS = await chipBeat();

const pad = (n) => String(n).padStart(4);
const countsOf = (recs) => [recs.length, new Set(recs.map(r => r.step)).size, new Set(recs.map(r => r.card)).size];
const fmt = ([a, b, c]) => `${a} record(s) / ${b} step(s) / ${c} card(s)`;

test('P-03, a chip that runs ahead of the ball (report only, census is the assertion)', (t) => {
  const {
    A, B, bLead, E, eOpen, eHeld, divergent, notes, stale,
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
  out.push('1. THE FOUR FORMS, live against what was recorded when this file was written');
  for (const form of Object.keys(RECORDED)) {
    const same = live[form].every((n, j) => n === RECORDED[form][j]);
    out.push(`   ${form.padEnd(11)} ${fmt(live[form])}${same ? '' : `   (recorded ${fmt(RECORDED[form])})`}`);
  }
  out.push('   FORM-A is the naive form and is counted only: P-06 puts a chip turning over at step');
  out.push('   ENTRY inside the rules, so most of FORM-A is the ordinary case and printing all of it');
  out.push('   would bury FORM-B.');

  out.push('');
  out.push(`2. FORM-B, the queue, ranked by how long the value stands on screen before the first ball lands: ${B.length}`);
  out.push('   lead bands:');
  for (const [lo, hi] of LEAD_BANDS) {
    const n = B.filter(r => r.lead >= lo && r.lead < hi).length;
    if (n) out.push(`   ${pad(n)}  ${hi === Infinity ? `${lo}ms and up` : `${lo} to ${hi}ms`}`);
  }
  for (const r of [...B].sort((a, b) => b.lead - a.lead || (a.card < b.card ? -1 : 1))) {
    out.push(`   ${pad(r.lead)}ms  ${r.card} step ${r.i} '${r.stepId}'  chip "${r.key}" already reads ` +
      `${JSON.stringify(r.to)} (was ${JSON.stringify(r.from)}) and is lit at entry`);
  }
  const byCard = new Map();
  for (const r of B) byCard.set(r.card, (byCard.get(r.card) || 0) + 1);
  if (byCard.size) {
    out.push('   by card:');
    for (const [id, n] of [...byCard.entries()].sort((a, b) => b[1] - a[1])) out.push(`   ${pad(n)}  ${id}`);
  }

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
  for (const r of eHeld) out.push(`   CARRIED  ${r.carryKey}\n      WHY ${r.why}`);
  if (stale.length) out.push(`   carried entries no longer reported (stale, remove them): ${stale.join(' | ')}`);

  out.push('');
  out.push(`4. THE HOLE A FIX CAN OPEN: ${divergent.length} step/chip pair(s) on ` +
    `${new Set(divergent.map(d => d.card)).size} card(s) already end the two paths on different text`);
  for (const d of divergent) out.push(`   ${d.line}`);
  out.push('   The static path (prev, reset, prefers-reduced-motion) writes `chips` and never runs the');
  out.push('   flow, so an F.set is the animated path only. render/reduced.test.mjs compares opacity,');
  out.push('   wire text and highlight, and a chip VALUE is on none of them. Repair a FORM-B or FORM-E finding');
  out.push('   with the rewind form, or write the end value into `chips` too: see the header.');

  if (notes.length) {
    out.push('');
    out.push(`cards that could not be read: ${notes.length}`);
    for (const l of notes) out.push(`   ${l}`);
  }
  out.push('===== end of report =====');
  console.log(out.join('\n'));

  // -------------------------------------------------------------------------------------------
  // The assertions, and not one of them is about a card. A FORM-A or FORM-B finding is a statement
  // about a card and its acceptance belongs to a person; a walk that covered less than the catalog
  // is not a measurement at all. FORM-E is the one form that IS a verdict now, and it is asserted in
  // ../unit/chip-beat-e.test.mjs, on the same records, off the same fixture.
  // -------------------------------------------------------------------------------------------
  assert.ok(walked >= EXPECTED_CARDS,
    `walked ${walked} card(s), the catalog had ${EXPECTED_CARDS} when this report was written. ` +
    'A report over a subset prints few findings and looks exactly like a clean catalog.');
  assert.ok(steps >= EXPECTED_STEPS,
    `read ${steps} step(s), expected at least ${EXPECTED_STEPS}. A step nobody read is a step whose ` +
    'chip turnover was never timed, and this file would still print a number.');
  assert.ok(compared > 0,
    'not one chip slot was compared against the previous step, so every form above measured an ' +
    'empty set. Either the chip resolution has gone blind or no step carries a ball.');
  t.diagnostic(`P-03: ${walked} cards, ${steps} steps, A ${A.length}, B ${B.length}, ` +
    `B+lead ${bLead.length}, E ${E.length} (${eOpen.length} unread), path divergence ${divergent.length}`);
});
