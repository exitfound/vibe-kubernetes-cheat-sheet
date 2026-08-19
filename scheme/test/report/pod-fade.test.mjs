// pod-fade.test.mjs: the half of M-08 that no machine has ever asked about.
//
// M-08 reads "A Pod that FADES OUT in a step must PULSE FIRST: pulse delay `<=` fade delay. Fading a
// Pod while it is still blinking reads as two events at once." The check that owns it,
// render/opacity.test.mjs ORDER, enforces the SECOND sentence and cannot reach the first: its loop
// opens with
//
//     const mine = pulses.filter(...); if (!mine.length) continue;
//
// so a Pod that fades with NO pulse anywhere in the step is skipped in silence. ORDER is right to be
// written that way, because it is an ORDERING rule and there is nothing to order against. What was
// missing is anybody counting the population it steps over. This file counts it.
//
// ===========================================================================================
// WHY A REPORT AND NOT AN ASSERTION
// ===========================================================================================
// Because the absolute reading of M-08 is FALSE about this catalogue, and measuring says so. SIX
// steps fade a Pod with no pulse, and every one of the six is right. A step that pulses at 0 with
// its fade at BEAT.afterPulse is not in this population at all: that is the shape
// storage-multi-attach-error detach carries, and storage-generic-ephemeral-volume gc and
// storage-volumeattachment detach carry it too, which is why none of the three is listed below.
// The six that stand:
//
//   workloads-pvc-stickiness  evict     an API DELETE lands on the Pod object and the Pod dims to
//                                       terminating. A Pod on a Node the narration calls unreachable
//                                       cannot acknowledge anything, and a blink reads as
//                                       acknowledgement. This step is the EXEMPLAR for the shape.
//   workloads-pod-phase-machine  crashloop, terminal
//                                       the Pod's shade IS the phase on this card, so the fade is the
//                                       subject rather than an event happening to it.
//   workloads-replicaset  orphan        the Pod loses its owner and keeps running. A blink here reads
//                                       as a create, which is the defect the adoption step was
//                                       repaired for.
//   cluster-delete-flow  purge          a SECOND fade on a Pod that already pulsed earlier in the
//                                       card, so the beat is spent.
//   storage-volume-detach-on-node-loss  forcedetach
//                                       measured permanent: the Pod is already at 0.25 and blinked on
//                                       the previous step, whose own comment is that a pulse and a
//                                       fade must not read as one event. A blink at 0.25 needs
//                                       pulsePodDim, whose opacity lift reads as the Pod coming back.
//
// So the honest rule is not "always pulse", it is "a Pod that fades with no pulse owes a reason", and
// a reason is prose. This file therefore prints the population and lets a person rule, which is the
// cycle written in ./arrival.test.mjs and run four times in this project: report-only, then a human
// triage, then promotion. Promotion here means an allowlist keyed to the CARDS.md note that justifies
// each entry, exactly as ../fixtures/chip-beat.mjs E_CARRIED does for FORM-E.
//
// ===========================================================================================
// WHAT THIS FILE IS BLIND TO
// ===========================================================================================
//   - A FADE INSIDE AN ESCAPE. `step.enter` and `F.run` are function bodies, so a fade written with
//     el.animate() inside one is invisible here. 42 enter and 13 F.run sites exist; none of them
//     animates a pod opacity today, and P-11 is the rule that keeps it that way.
//   - A FADE BY `opacity:` RATHER THAN BY `F.fade`. A step that simply PINS a Pod lower than the step
//     before it produces no fade track at all: the picture snaps. That is a different class, it is
//     what report/palette-steps.test.mjs sees as a shade change, and this file does not judge it.
//   - WHETHER THE PULSE, WHERE THERE IS ONE, IS EARLY ENOUGH. That is ORDER's question and ORDER
//     answers it. This file deliberately reports only the empty case, so the two never disagree.
//   - A `pulsePodDim` LIFT. A dim Pod's blink carries an opacity track of its own (M-07), and this
//     file counts a `pulse` verb, not tracks, so it cannot confuse the two.
//
// ===========================================================================================
// WHAT FAILS HERE
// ===========================================================================================
// The census, and nothing else. A walk that read fewer cards or steps than the catalogue prints few
// findings and looks exactly like a clean catalogue: a walk that reaches 649 steps of 650 drops the
// 650th silently and nothing in the output looks wrong, which is why the floor below is asserted
// rather than printed.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { importAll, stepTotal } from '../fixtures/module.mjs';
import { walkParts } from '../fixtures/spec.mjs';

// The walk baseline, DERIVED rather than typed: the catalog it walks and the specs it reads are
// what say how big a whole walk is (CATALOG_BASELINE in ../fixtures/catalog.mjs).
const EXPECTED_CARDS = (await cards()).length;
const EXPECTED_STEPS = await stepTotal();

// The verdicts written down so far. A key here is NOT a pass: this file
// asserts nothing about them. It prints them beside the finding so the next reader inherits the
// argument instead of re-deriving it, and so a NEW finding stands out from the six known ones.
//
// A verdict that says a pulse IS missing is a WORK ITEM, not a resting entry, and it lives here only
// until the pulse is put in. Once it is, the step stops fading unbeaten, the walk stops producing the
// key, and the ruling has to go or the stale-ruling assert below reddens: a repaired step whose
// reason is still on file is how a table starts lying. A step that has been given its pulse is out
// of this population, and nothing about it belongs in this map any more.
const RULED = new Map([
  ['workloads-pvc-stickiness evict podA',
    'CORRECT. The DELETE lands on the Pod object and it dims to terminating. A Pod on an unreachable ' +
    'Node cannot acknowledge anything, and a blink would read as acknowledgement. The exemplar.'],
  ['workloads-pod-phase-machine crashloop podGroup',
    'CORRECT. On this card the Pod SHADE is the phase, so the fade is the subject of the step.'],
  ['workloads-pod-phase-machine terminal podGroup',
    'CORRECT. Same as crashloop: the shade is the phase.'],
  ['workloads-replicaset orphan pod3',
    'CORRECT. The Pod loses its owner and keeps running. A blink reads as a create, which is the ' +
    'defect the adoption step on this same card was repaired for.'],
  ['cluster-delete-flow purge placedPod',
    'CORRECT. A second fade on a Pod that already pulsed earlier in the card, so the beat is spent.'],
  ['storage-volume-detach-on-node-loss forcedetach oldPod',
    'CORRECT, and measured permanent. The Pod is already at 0.25 and blinked on the previous step, ' +
    'whose comment is that a pulse and a fade must not read as one event. A blink at 0.25 needs ' +
    'pulsePodDim, whose opacity lift reads as the Pod coming back to life.'],
]);

const catalogued = await cards();
const modules = await importAll();

test('M-08 second half: a Pod that fades with no pulse in the same step', (t) => {
  const rows = [];
  let walked = 0, steps = 0, fades = 0;

  for (const c of catalogued) {
    const ns = modules.get(c.id);
    if (!ns || !ns.SCENE || !Array.isArray(ns.STEPS_SPEC)) continue;
    walked++;
    // Pod refs, off the SCENE. A fade names a ref and the verb cannot say what kind of thing it is,
    // so the part kind is the only honest source for "this is a Pod".
    const pods = new Set();
    walkParts(ns.SCENE.parts, (p) => { if (p && p.kind === 'pod' && p.key) pods.add(p.key); });

    for (const s of ns.STEPS_SPEC) {
      steps++;
      const down = new Map();
      const pulsed = new Set();
      for (const e of s.flow || []) {
        if (!e || !e.p) continue;
        if (e.verb === 'pulse' && e.p.pod) pulsed.add(e.p.pod);
        if (e.verb !== 'fade' || !pods.has(e.p.target)) continue;
        fades++;
        // A RISE is not a fade-out. `from` defaults to 1 in runFlow, so an absent `from` with a `to`
        // below 1 is a fade and an absent `from` with `to: 1` is a reveal.
        const from = e.p.from === undefined ? 1 : e.p.from;
        if ((e.p.to ?? 1) < from) down.set(e.p.target, { from, to: e.p.to });
      }
      for (const [key, sh] of down) {
        if (pulsed.has(key)) continue;               // ORDER owns this one
        rows.push({ card: c.id, step: s.id, key, ...sh });
      }
    }
  }

  const out = [''];
  out.push(`M-08 SECOND HALF: ${rows.length} step(s) fade a Pod with no pulse anywhere in the step.`);
  out.push('   ORDER in render/opacity.test.mjs skips exactly these, by construction. See this file\'s header.');
  out.push('');
  let unruled = 0;
  for (const r of rows) {
    const key = `${r.card} ${r.step} ${r.key}`;
    const why = RULED.get(key);
    if (!why) unruled++;
    out.push(`   ${why ? '        ' : 'UNRULED '}${r.card} step '${r.step}' fades ${r.key} ${r.from} -> ${r.to}`);
    if (why) out.push(`             ${why}`);
  }
  out.push('');
  out.push(`   ${rows.length - unruled} ruled with a reason, ${unruled} left to read.`);
  out.push('   The queue is EMPTY: no verdict here says a pulse is right and missing. A step that pulses');
  out.push('   at 0 with its fade at BEAT.afterPulse is not in this population at all, which is where');
  out.push('   storage-generic-ephemeral-volume gc and storage-volumeattachment detach sit. Every finding');
  out.push('   standing is a fade that earns going unbeaten.');
  out.push('');
  for (const line of out) t.diagnostic(line);

  // Stale ruling: a key we carry that the walk no longer produces. Loud, because a repaired step
  // whose reason is still on file is how a table starts lying.
  const live = new Set(rows.map(r => `${r.card} ${r.step} ${r.key}`));
  const stale = [...RULED.keys()].filter(k => !live.has(k));
  assert.deepEqual(stale, [],
    `${stale.length} ruling(s) in RULED match no finding, so the step was repaired and the reason is ` +
    `now false:\n  ${stale.join('\n  ')}`);

  assert.ok(walked >= EXPECTED_CARDS,
    `walked ${walked} card(s), the catalog holds ${EXPECTED_CARDS}. A shrunken walk prints few ` +
    'findings and reads exactly like a clean catalog.');
  assert.ok(steps >= EXPECTED_STEPS,
    `read ${steps} step(s), expected at least ${EXPECTED_STEPS}. A step nobody read is a Pod whose ` +
    'fade can be unbeaten while this file stays quiet.');
  assert.ok(fades > 0, 'measured no Pod fade at all, so the selector or the part-kind read has gone quiet');
});
