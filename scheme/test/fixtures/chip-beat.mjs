// chip-beat.mjs: the four P-03 forms, computed ONCE for the two files that read them. The walk, the
// forms, the carried table and the recorded census floor all live here, and neither reader owns a
// copy of any of them.
//
// WHO USES IT, and why the split is what it is:
//   ../report/chip-beat.test.mjs  prints all four forms as a queue a person rules on, and fails only
//                                 on the census. FORM-A and FORM-B are open queues.
//   ../unit/chip-beat-e.test.mjs  turns FORM-E into a verdict: an E record outside E_CARRIED is a
//                                 red gate, which is what promotion into `npm test` MEANS.
//
// WHY A FIXTURE AND NOT A HELPER INSIDE EITHER OF THEM. A test file that imported another test file
// would REGISTER that file's tests a second time, so the report cannot be the gate's library and the
// gate cannot be the report's. What is left is a shared module, and the alternative to it is two
// implementations of "what a FORM-E record is": the day one of them learns that `F.anim` moves a
// ball, the gate and the report describe two different catalogues and both look green. That drift is
// exactly what ./spec.mjs was pulled together to end, one layer down, and the note at the top of it
// tells the story of the three readers of one regex that had already parted.
//
// WHY HERE AND NOT INSIDE ./spec.mjs. That file answers questions about ONE step or ONE scene, holds
// no opinion about any card, and knows nothing of the catalogue: every function in it takes a spec
// and returns a reading of it. This one walks the whole catalogue and returns a JUDGEMENT (four named
// populations, one of them a failure class). Those are two layers, and the reason to keep them apart
// is practical rather than tidy: ./spec.mjs is imported by four mandatory checks that have nothing to
// do with P-03, and a walk of the whole catalogue does not belong in their import graph.
//
// THE KIT IS IMPORTED HERE, not passed in as ./spec.mjs takes it. That fixture states its reason
// (it stays importable without the kit, and its callers time flows against different questions);
// this one cannot do its job without the arrival arithmetic at all, so an argument would only be a
// way for two callers to hand it two different constants.
//
// WHAT IT IS BLIND TO is the subject of both readers and is written out in full in the header of
// ../report/chip-beat.test.mjs: whether the arrival EARNS the value, `enter(s, ctx)` bodies, the
// four cards whose cue is not a highlight, WHICH packet earns which chip, and `anim` and `tag`,
// which are not counted as balls. The short version of all five: this module reads the SHAPE of the
// data, and P-06 is the reason no field in the data says which shape is correct.

import { cards } from './catalog.mjs';
import { importAll } from './module.mjs';
import { entryChips, settledChips, staticChips, timelineOf } from './spec.mjs';
import { routeDur, REVEAL_MS, BEAT } from '../../js/lib/scheme-kit.js';

// The walk is asserted by both readers: a walk over a subset finds few E records and looks exactly
// like a clean catalogue, and a walk one step short drops that step silently with nothing in the
// output looking wrong. The two numbers it is judged against are DERIVED, never typed here: the
// card count off the catalog the reader already walks, the step count off `stepTotal()` in
// ./module.mjs. See CATALOG_BASELINE in ./catalog.mjs.

// The kit constants the fixture's arrival arithmetic runs on.
const KIT = { routeDur, REVEAL_MS, BEAT };

// The verbs that put a BALL on the wire. pulse, set, light, run, fade, reveal and anim move no
// packet, and tag rides one rather than being one, so a step made only of those has no arrival for a
// chip to run ahead of and is not a candidate at all.
const PACKET_VERBS = new Set(['route', 'segment', 'top']);

// The lead at or past which a FORM-B record is also counted as FORM-B-LEAD.
const LEAD_CUT_MS = 1500;

// -------------------------------------------------------------------------------------------
// FORM-E entries a human has READ and decided to carry, keyed `<card id> <step id> <chip key>`,
// with the reason on each. Nineteen entries, nineteen findings, nothing unread: that is the state that let
// FORM-E out of the report and into `npm test`, and every entry below is the measurement that put
// one finding there. Same shape and same discipline as R2_STEP_CARRIED in ../report/arrival.test.mjs:
// an entry here is a decision with a measurement behind it, never a way to quiet the queue.
//
// IT LIVES IN THE FIXTURE BECAUSE BOTH READERS NEED IT AND THEY NEED THE SAME ONE. The report marks
// a carried record CARRIED and prints its reason; the gate treats the same record as not-a-failure.
// Two copies would mean a finding carried in one file and red in the other, which is the worst of
// the shapes this table can take. Its own shape (a reason on every entry, three fields in every key)
// is asserted by ../unit/chip-beat-e.test.mjs, where a broken table has to be able to go red.
// -------------------------------------------------------------------------------------------
export const E_CARRIED = new Map([
  ['cluster-pod-priority-preemption delete focusChip',
    '`standard DELETE · PDB best effort` names what this step DOES, and it is true the moment the '
    + 'Scheduler forms the request: no arrival on this step produces it. Its two neighbours wait for '
    + 'a beat because both are Pod-object state the DELETE produces, nominatedNodeName at the API '
    + 'and Terminating on the Node. The focus chip is NOT uniformly at entry on this card, and the '
    + 'split is the point: on the bind step it IS deferred, because `nominatedNodeName cleared` is '
    + 'an outcome the API writes when the binding lands rather than a name for the step. Binding '
    + 'this one to an arrival would leave the delete step nameless for its first 700ms.'],
  ['cluster-pod-priority-preemption bind victimChip',
    'Pod A left during the terminationGracePeriodSeconds the PREVIOUS step narrates, so `Pod A · gone` '
    + 'is true when this step opens and the `pod1: 0` opacity pin beside it draws the same fact. No '
    + 'ball of this step produces it: the bind travels to Node-1 and places Pod NEW. Its two '
    + 'neighbours wait because the API writes both on the binding itself. Winding this one back would '
    + 'redraw a Pod the card has already said exited.'],
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
  ['cluster-leader-election renew v1',
    'The role suffix reports what mgr-1 is DOING, and the reconciling is what SENDS the first ball ' +
    'of the step, the CAS-PUT carrying a fresh renewTime. It is on screen before anything departs ' +
    'rather than after anything lands, the same shape as `cluster-static-pods edit-file fileChip`. ' +
    'What the arrival earns is renewChip, which is the Lease RECORD and moves when the write lands, ' +
    'and that is the one chip this step holds back.'],
  ['cluster-leader-election renew v2',
    'See `renew v1`: polling is what sends the standby GET, so the suffix stands before the ball ' +
    'leaves. Binding it to the answer would say a standby starts polling because its own poll ' +
    'came back.'],
  ['cluster-leader-election renew v3',
    'See `renew v2`: the second standby runs the identical poll and its chip moves with it, or ' +
    'P-04 splits one fact across two chips.'],
  ['cluster-static-pods edit-file fileChip',
    'fileChip is the manifest file on disk, and the file is the SOURCE of the first ball here, ' +
    'the spec segment running from fileBox to the Kubelet. The edit therefore has to be on screen ' +
    'before the ball leaves, not after it lands. Step 1 is the same shape and reads correctly: the ' +
    'chip takes the new filename at entry and the segment leaves REVEAL_MS later.'],
  ['cluster-taints-tolerations prefer taintsChip',
    'The rewrite of spec.taints is the PREMISE of the step and its opening sentence, true before the '
    + 'Scheduler forms the binding this step sends: no arrival here produces it, and the ball that '
    + 'does arrive carries Pod web-2 to Node-1. The frame header spells the same taint at entry on '
    + 'the same beat, so binding the chip alone would leave it reading NoSchedule under a header '
    + 'already reading PreferNoSchedule. Step 1 is the same shape and is read the same way, both '
    + 'taint chips light at entry there. What the arrival earns is web2Chip, the chip this step defers.'],
  ['cluster-taints-tolerations prefer effectChip',
    'See `prefer taintsChip`: effect in force reports that same rewrite one field narrower, and the '
    + 'two move together or P-04 splits one fact across two chips.'],
  ['cluster-taints-tolerations noexecute taintsChip',
    'The second taint is what SENDS the first ball of the step, the DELETE the taint-eviction-controller '
    + 'issues, so it is on screen before anything departs rather than after anything lands. Binding it '
    + 'to that arrival would say the taint appears because the controller acted. web2Chip is what the '
    + 'arrival earns and it is the one chip this step holds back.'],
  ['cluster-taints-tolerations noexecute effectChip',
    'See `noexecute taintsChip`: effect in force reports the same added taint and moves with it.'],
  ['workloads-daemonset place focusChip',
    'focusChip is named `focus` and every one of the five steps writes it as a caption of what that ' +
    'step is about, not as object state. Here it states the controller RULE the narration states ' +
    'in words, one Pod per matching Node, which is true before any create is issued. What the three ' +
    'creates actually earn is currentChip and readyChip, and those are exactly the two the step ' +
    'already steps up one arrival at a time.'],
  // The entries below were PROMOTED into E by repairing their neighbours, which is a mechanical
  // consequence of the form: E is "one chip on this step waits for a beat and this one does not",
  // so binding the earned chip on a step makes every unearned chip beside it eligible. A rise in E
  // after a P-03 repair is therefore not a regression, and "E must not rise" cannot be an
  // acceptance criterion for this class unless every chip on the step is bound.
  ['workloads-daemonset node-join focusChip',
    'The same argument as `place focusChip` above, on the same card: `focus` is the caption of what ' +
    'the step is about and not object state. Node-4 joining is the PREMISE of the step, on screen ' +
    'before anything is watched or created, and what the arrivals earn is the three counters, which ' +
    'this step now steps up on the watch and on the create.'],
  ['network-dns-records a-record qChip',
    'qChip is the QUESTION, which the client holds before it sends anything, so it is the premise ' +
    'of the step and not a value an arrival produces. The card already says the name a second time ' +
    'at entry: `asking()` writes the four FQDN segment boxes and LIGHTS them in the static block, ' +
    'so binding the chip alone would leave it blank while the band beside it spells the same name.'],
  ['network-dns-records srv-record qChip', 'See `a-record qChip`: the question is the premise, and the FQDN band states it at entry.'],
  ['network-dns-records headless-record qChip', 'See `a-record qChip`: the question is the premise, and the FQDN band states it at entry.'],
  ['network-dns-records pod-record qChip', 'See `a-record qChip`: the question is the premise, and the FQDN band states it at entry.'],
  ['network-internal-traffic-policy local policyChip',
    'internalTrafficPolicy is a FIELD OF THE SERVICE that the operator set before anything is dialed, ' +
    'and the card record says so in as many words: the policy is a property of the Service, so it is ' +
    'true from the start, while the scope, the hop and the result are outcomes of a call. Those three ' +
    'are exactly what this step now waits on, at kube-proxy (1500) and at the local Pod (2300). The ' +
    'rest of the entry frame is written from the same premise: the two endpoint notes read in scope ' +
    'and out of scope and the remote Pod is already dimmed, so binding the chip alone would leave it ' +
    'reading Cluster over a picture that is already the Local one.'],
]);

// -------------------------------------------------------------------------------------------
// THE WALK. One pass over the catalogue, and the only place the four forms are defined.
//
//   FORM-A       step i > 0, the flow carries a packet, the chip's ENTRY value (chips + chipsCued
//                + rewind) differs from the previous step's SETTLED value, and no F.set with a
//                positive delay turns that key over in this step. The naive form, which P-06 puts
//                inside the rules, so it is counted and never judged.
//   FORM-B       FORM-A, and the step names that chip in `lit`, so the CARD ITSELF declares the
//                value to be the news of this step.
//   FORM-B-LEAD  FORM-B with a first arrival at or past LEAD_CUT_MS.
//   FORM-E       FORM-B, and ANOTHER chip on the SAME step IS turned over on a beat (an F.set with
//                a delay). The card knows the technique and applied it to a neighbour, which is
//                the shape P-04 calls worse than doing neither.
//
// One record object is pushed into every form it satisfies, so A, B and E share objects by identity
// and `neighbours` on an E record is the beat-bound set of that same step.
// -------------------------------------------------------------------------------------------
function chipBeatForms(catalogued, modules) {
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

      // Measured on the way past: a key whose static value is not where the animated path leaves
      // it. Every step, not only a candidate one, since the divergence has nothing to do with
      // packets. It is the hole an F.set repair opens, and the report's section 4 prints it.
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
  const eOpen = E.filter(r => !r.why), eHeld = E.filter(r => r.why);
  const stale = [...E_CARRIED.keys()].filter(k => !E.some(r => r.carryKey === k));

  return {
    A, B, bLead, E, eOpen, eHeld, divergent, notes, stale,
    walked, steps, candidateSteps, compared, unresolved,
    catalogSize: catalogued.length,
  };
}

// The same walk with its two inputs loaded, for a caller that wants the forms and nothing else.
// Both readers use it, so both read one catalogue and one set of modules.
export async function chipBeat() {
  return chipBeatForms(await cards(), await importAll());
}
