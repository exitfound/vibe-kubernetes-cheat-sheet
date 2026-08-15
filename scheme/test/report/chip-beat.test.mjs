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
// FOUR FORMS, NARROWING. The two printed queues are what CANON.md P-03 cites, as FORM-B and
// FORM-E. All four are counted on every run so the shape of the population is visible; only the
// two named ones are printed in full.
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
//                a delay). The card knows the technique and applied it to a neighbour, so this is
//                the strongest reading the data can give: the author's own hand is on both sides of
//                the comparison. P-04 names exactly this shape and calls it worse than doing
//                neither. Printed as its own queue.       6 rec /   5 steps /  5 cards
//
// The ~25 findings a human read lie between FORM-E and FORM-B-LEAD, and no form reproduces them
// exactly. That is expected rather than a defect of the forms: what the human was reading is
// whether the arrival EARNS the value, and P-06 is the reason no field says so.
//
// ===========================================================================================
// WHY report/ AND NOT render/ OR unit/, AND WHAT WOULD HAVE TO HAPPEN FIRST
// ===========================================================================================
// The cycle is written in ../report/arrival.test.mjs and this project has run it twice: report-only,
// then a human triage of the queue, then promotion into the mandatory set. FORM-B is 400 records on
// 67 of the 108 cards. Promoted straight into the gate it would redden two thirds of the catalog
// against work nobody has scheduled, and the gate would stop being usable. So nothing here fails on
// a finding, FORM-E included. FORM-E gets the CARRIED-LIST shape R2_STEP_CARRIED has in
// arrival.test.mjs, and it starts EMPTY on purpose: not one of the six has been read by a person
// yet, so everything outside the table is work by definition, and a reason lands in the table only
// after someone has looked at the card.
//
// WHAT DOES FAIL HERE: the census, and the shape of the carried table. A report that walked less
// than the catalog prints few findings and looks exactly like a clean catalog, which is the lesson
// of stage 2.4c, where the first run of a report test counted 649 steps of 650 and nothing in the
// output looked wrong. Fewer than 108 cards or 650 steps is an assertion failure, not a note.
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
import { importAll } from '../fixtures/module.mjs';
import { entryChips, settledChips, staticChips, timelineOf } from '../fixtures/spec.mjs';
import { routeDur, REVEAL_MS, BEAT } from '../../js/lib/scheme-kit.js';

// The recorded walk. Assertions, not notes: see the header.
const EXPECTED_CARDS = 108;
const EXPECTED_STEPS = 650;

// The kit constants the fixture's arrival arithmetic runs on.
const KIT = { routeDur, REVEAL_MS, BEAT };

// The verbs that put a BALL on the wire. pulse, set, light, run, fade, reveal and anim move no
// packet, and tag rides one rather than being one, so a step made only of those has no arrival for a
// chip to run ahead of and is not a candidate at all.
const PACKET_VERBS = new Set(['route', 'segment', 'top']);

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

// The lead at or past which a FORM-B record is also counted as FORM-B-LEAD.
const LEAD_CUT_MS = 1500;

// -------------------------------------------------------------------------------------------
// FORM-E entries a human has READ and decided to carry, keyed `<card id> <step id> <chip key>`,
// with the reason on each. EMPTY ON PURPOSE, and that is the statement this table makes: the six FORM-E
// findings the walk reports today have not been read by anybody, so every one of them is work.
// Same shape and same discipline as R2_STEP_CARRIED in ./arrival.test.mjs: an entry here is a
// decision with a measurement behind it, never a way to quiet the queue, and an entry that stops
// being reported is a stale carry the run names below.
// -------------------------------------------------------------------------------------------
const E_CARRIED = new Map([
  ['cluster-node-pressure-eviction relieve memChip',
    'memory.available is a cAdvisor reading of the Node, and the one ball of this step is the PATCH ' +
    'carrying MemoryPressure=False to the API, which does not produce it: the memory freed first and ' +
    'is WHY the PATCH goes out. The card says so itself on step 1, where the same chip drops 4Gi to ' +
    '500Mi at entry over a flow that is empty. Binding it to that arrival would claim a local stat ' +
    'moves when the API is told.'],
  ['cluster-oom-kill observe memChip',
    'memory.current is a cgroup file the kernel emptied when it SIGKILLed the processes one step ' +
    'earlier, and the ball of this step runs the OTHER way, PLEG relist from the kernel to Kubelet. ' +
    'The rewind next door is right for terminationChip because that is what the Kubelet KNOWS, and ' +
    'wrong here for the same reason: it would say memory frees when the Kubelet is told. Entry is ' +
    'the earliest honest beat this step has.'],
  ['cluster-static-pods edit-file fileChip',
    'fileChip is the manifest file on disk, and the file is the SOURCE of the first ball here, ' +
    'the spec segment running from fileBox to the Kubelet. The edit therefore has to be on screen ' +
    'before the ball leaves, not after it lands. Step 1 is the same shape and reads correctly: the ' +
    'chip takes the new filename at entry and the segment leaves REVEAL_MS later.'],
  ['workloads-daemonset place focusChip',
    'focusChip is named `focus` and every one of the five steps writes it as a caption of what that ' +
    'step is about, not as object state. Here it states the controller RULE the narration states ' +
    'in words, one Pod per matching Node, which is true before any create is issued. What the three ' +
    'creates actually earn is currentChip and readyChip, and those are exactly the two the step ' +
    'already steps up one arrival at a time.'],
]);

const catalogued = await cards();
const modules = await importAll();

const pad = (n) => String(n).padStart(4);
const countsOf = (recs) => [recs.length, new Set(recs.map(r => r.step)).size, new Set(recs.map(r => r.card)).size];
const fmt = ([a, b, c]) => `${a} record(s) / ${b} step(s) / ${c} card(s)`;

test('P-03, a chip that runs ahead of the ball (report only, census is the assertion)', (t) => {
  const A = [], B = [], E = [];
  const divergent = [];          // the second hole: static path and animated path end on different text
  const notes = [];
  let walked = 0, steps = 0, candidateSteps = 0, compared = 0, unresolved = 0;

  for (const c of catalogued) {
    const ns = modules.get(c.id);
    if (!ns || !Array.isArray(ns.STEPS_SPEC)) {
      notes.push(`${c.id}: exports no STEPS_SPEC array, so this card was never read`);
      continue;
    }
    walked++;
    const spec = ns.STEPS_SPEC;

    for (let i = 0; i < spec.length; i++) {
      const s = spec[i];
      steps++;

      // Section 4, measured on the way past: a key whose static value is not where the animated
      // path leaves it. Every step, not only a candidate one, since the divergence has nothing to
      // do with packets. See the trap in the header.
      const stat = staticChips(s), settled = settledChips(s);
      for (const k of Object.keys(stat)) {
        if (settled[k] !== stat[k]) {
          divergent.push({
            card: c.id,
            line: `${c.id} '${s.id}' chip "${k}": the static path ends on ${JSON.stringify(stat[k])}, ` +
              `the animated path on ${JSON.stringify(settled[k])}`,
          });
        }
      }

      if (i === 0) continue;      // the poster carries no flow by construction (S-09)

      const rows = timelineOf(s.flow, KIT);
      if (rows === null) { unresolved++; continue; }   // unit/spec-steps.test.mjs owns that finding
      const balls = rows.filter(r => PACKET_VERBS.has(r.verb));
      if (!balls.length) continue;
      candidateSteps++;

      // The lead: the first moment ANY ball of this step lands. A value on screen before this had
      // nothing to arrive for it.
      const lead = Math.min(...balls.map(r => r.arrival));

      // Keys this step turns over ON A BEAT, which is the technique P-03 asks for. A key here is
      // doing the right thing and is not a candidate; the SAME set is what makes a neighbour's
      // failure form E.
      const onBeat = new Set();
      for (const r of rows) {
        if (r.verb !== 'set' || !(r.delay > 0)) continue;
        for (const k of [...Object.keys(r.p.chips || {}), ...Object.keys(r.p.chipsCued || {})]) onBeat.add(k);
      }

      const now = entryChips(s);
      const before = settledChips(spec[i - 1]);
      const lit = new Set(s.lit || []);

      for (const k of Object.keys(now)) {
        // A key the previous step does not state cannot be compared. P-01 makes that empty today
        // (every step of a card writes the same chip set) and it stays guarded rather than assumed.
        if (!(k in before)) continue;
        compared++;
        if (before[k] === now[k]) continue;
        if (onBeat.has(k)) continue;

        const rec = {
          card: c.id, step: `${c.id}#${i}`, i, stepId: s.id, key: k,
          from: before[k], to: now[k], lead,
          neighbours: [...onBeat].filter(x => x !== k),
        };
        A.push(rec);
        if (!lit.has(k)) continue;           // the card does not call this value the news: A only
        B.push(rec);
        if (rec.neighbours.length) {
          rec.carryKey = `${c.id} ${s.id} ${k}`;
          rec.why = E_CARRIED.get(rec.carryKey);
          E.push(rec);
        }
      }
    }
  }

  const bLead = B.filter(r => r.lead >= LEAD_CUT_MS);
  const live = { 'FORM-A': countsOf(A), 'FORM-B': countsOf(B), 'FORM-B-LEAD': countsOf(bLead), 'FORM-E': countsOf(E) };

  const out = [];
  out.push('');
  out.push('===== P-03, value ahead of motion, REPORT ONLY =====');
  out.push(`  cards walked ${walked} of ${catalogued.length} in the catalog, steps read ${steps}`);
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
  const eOpen = E.filter(r => !r.why), eHeld = E.filter(r => r.why);
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
  const stale = [...E_CARRIED.keys()].filter(k => !E.some(r => r.carryKey === k));
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
  // The assertions, and neither of them is about a card. A finding here is a statement about a
  // card and its acceptance belongs to a person; a walk that covered less than the catalog is not a
  // measurement at all, and a carried entry with no reason is a queue quietly getting shorter.
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
  for (const [key, why] of E_CARRIED) {
    assert.ok(typeof why === 'string' && why.trim().length > 20,
      `E_CARRIED['${key}'] carries no reason. A carried finding is a decision somebody measured, ` +
      'and without the reason it is only a shorter queue.');
    assert.equal(key.split(' ').length, 3,
      `E_CARRIED key '${key}' is not '<card id> <step id> <chip key>', so it can never match a finding`);
  }

  t.diagnostic(`P-03: ${walked} cards, ${steps} steps, A ${A.length}, B ${B.length}, ` +
    `B+lead ${bLead.length}, E ${E.length} (${eOpen.length} unread), path divergence ${divergent.length}`);
});
