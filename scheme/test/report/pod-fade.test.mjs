// M-08's first half: a Pod that fades out in a step with no pulse at all, which ORDER in
// render/opacity.test.mjs skips. Reported with RULED reasons, never asserted. Fails only on the census
// and on a stale ruling. Blind to fades inside escapes and to fades by `opacity:` pins.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { importAll, stepTotal } from '../fixtures/module.mjs';
import { walkParts } from '../fixtures/spec.mjs';

const EXPECTED_CARDS = (await cards()).length;
const EXPECTED_STEPS = await stepTotal();

// Rulings printed beside their finding, never a pass. A ruling the walk no longer produces fails.
const RULED = new Map([
  ['workloads-statefulset-update-strategy partition slot0',
    'CORRECT. Nothing happens to this Pod. The two slots are the maxUnavailable WINDOW rather than ' +
    'two Pods on a Node, and the partition landing is what closes the window: the walk reached the ' +
    'line and the controller now has nothing in hand. A blink would say the Pod was deleted, which ' +
    'is the one reading the step must not have, and the beat belongs to the rule fading in beside ' +
    'it. The card DOES blink a Pod where one is really replaced, on every hop of `replace`.'],
  ['workloads-statefulset-update-strategy ondelete slot0',
    'CORRECT, and the same reason one step later. OnDelete means the controller opens the window ' +
    'for nobody, so the window empties because nothing is in it, not because a Pod died.'],
  ['workloads-statefulset-update-strategy ondelete slot1',
    'CORRECT. The second half of the same empty window.'],
  ['workloads-force-deletion silent podOld',
    'CORRECT. Nothing arrives at this Pod on this step and nothing can: the step is the Kubelet ' +
    'acknowledgement channel going dead, and a blink would be the Pod answering over the channel ' +
    'the step has just severed. The beat belongs to the break mark, which fades in first and is ' +
    'what this fade hangs off.'],
  ['workloads-replicaset adopt free4',
    'CORRECT. This is the LEAVING half of a crossfade, not a Pod going away. The same Pod arrives ' +
    'one band up as pod4 on the same beat and pulses there, so the beat is spent on the half that ' +
    'lands. A second blink on the half that leaves would read as two Pods where the step is ' +
    'drawing one crossing between the bands.'],
  ['workloads-replicaset orphan pod3',
    'CORRECT. The Pod loses its owner and keeps running. A blink reads as a create, which is the ' +
    'defect the adoption step on this same card was repaired for.'],
  ['workloads-rolling-update repeat pod1',
    'CORRECT. A second fade on a Pod that already pulsed on the previous step, where the delete ' +
    'ball reached it, so the beat is spent. This is that termination finishing.'],
  ...['pod1', 'pod2', 'pod3'].map(pod => [`workloads-job-parallelism refill ${pod}`,
    'CORRECT. A wave 1 tombstone at OPACITY.terminated vacating the running window: the Pod ' +
    'already pulsed on its own exit step, `succeed` for worker-1 and worker-2 and `fail` for ' +
    'worker-3, and nothing on `refill` is addressed to it, so the beat is spent.']),
  ['cluster-cascading-deletion purge placedPod',
    'CORRECT. A second fade on a Pod that already pulsed earlier in the card, so the beat is spent.'],
  ['network-headless-service not-ready w2',
    'CORRECT. A failed readiness probe signals nobody the card draws, so there is no beat for web-2 to answer. The fade is the cause the lookup then shows as a smaller answer.'],
  ['network-headless-service new-ip w0',
    'CORRECT. The Pod is deleted, so nothing is left to blink, and a pulse would claim the old Pod answered something. The reveal that follows is the recreated web-0.'],
  ['storage-attach-mount-chain unwind podA',
    'CORRECT. The Pod is deleted, so nothing is left to blink, and the teardown that follows is the ' +
    'node plugin unpublishing its bind mount, which the Pod no longer answers. The beat is the fade itself.'],
  ['cluster-node-restart reboot podWeb',
    'CORRECT. A reboot signals nobody, so there is no beat for a Pod to answer. A blink would claim ' +
    'an acknowledgement that never happened, and the Pod object is untouched in the API.'],
  ['cluster-node-restart reboot podAgent',
    'CORRECT. Same reboot, same reason: the machine goes down under all three Pods at once.'],
  ['cluster-node-restart reboot podDbg',
    'CORRECT. Same reboot, same reason.'],
  ['cluster-node-restart replaced podWeb',
    'CORRECT. The DELETE landed while the Node was away, so it reaches nothing on this Node that ' +
    'could answer it. The card draws no control-plane block for the same reason.'],
  ['cluster-node-restart standalone podDbg',
    'CORRECT. Same eviction, one Pod later, and nothing recreates a standalone Pod afterwards.'],
  ['storage-ephemeral-storage-eviction replace podA',
    'CORRECT. A second fade on a Pod that already pulsed on the previous step, where the evict ' +
    'ball reached it, so the beat is spent. web-a leaves the slot for web-b, which pulses as it lands.'],
  ['storage-detach-on-node-failure forcedetach oldPod',
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
    // The part kind is the only honest source for "this is a Pod".
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
        // `from` defaults to 1, so `to` below 1 is a fade and `to: 1` a reveal.
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

  // A repaired step whose reason is still on file is how a table starts lying.
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
