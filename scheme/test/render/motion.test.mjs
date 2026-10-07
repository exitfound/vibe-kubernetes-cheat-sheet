// The machine-checkable rows of the M block of CANON.md: pulse shape and kit, flash shape and target,
// riding tags, ball speed and clamp, arrival ripple, transform-only motion, empty deferred timers.
// Reads WAAPI plans at t=0 only, so nothing done in onfinish or by a seek-invisible effect (M-35) is seen.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census, floor, FULL_ONLY } from '../fixtures/catalog.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import { readSnapshot } from '../fixtures/snapshot.mjs';
import { PULSE_POD, PULSE_BLOCK, BEAT, FADE } from '../../js/lib/tokens.js';
import { routeDur, routeLength, REVEAL_MS } from '../../js/lib/scheme-kit.js';

// Population floors: every rule selects by class name, so a renamed selector empties the input
// and goes green. Never lower a floor to make a rename pass.
const EXPECTED_CARDS = floor((await cards()).length);
const EXPECTED_STEPS = floor(await stepTotal());
// Cards declaring F.pulse: losing one pulse of several does not move it, a dead selector collapses it.
const EXPECTED_PULSE_CARDS = floor(92);
// Brightness tracks, with headroom: one dropped Pod pulse costs about four tracks.
const EXPECTED_PULSES = floor(740);
const EXPECTED_RAMPS = floor(1568);     // stroke ramps, two per rect per pulse (up, then down)
const EXPECTED_BALLS = floor(714);      // .scheme-packet transform tracks
const EXPECTED_LABELS = floor(241);     // riding tags
const EXPECTED_TIMERS = floor(555);     // the 1ms deferred timers of lightBoxAt() and at()

// Explicit-dur registry (M-12): a ceiling per card on balls whose speed their route does not explain,
// and `clamp` counts those also under routeDur's floor. Unlisted cards get no latitude.
const PACING = new Map([
  ['network-service-clusterip',    { speed: 8, clamp: 0 }],
  // Three allocation balls share the longest path's duration so they land together.
  ['network-ipam-pod-cidr',        { speed: 1, clamp: 0 }],
  ['storage-fsgroup-ownership',    { speed: 3, clamp: 1 }],
  // Tagged legs ride one fixed speed so the tag can be read, instead of routeDur's 700ms floor.
  ['storage-configmap-secret-mount', { speed: 7, clamp: 0 }],
  // Tagged legs ride LEG_DUR so the tag can be read instead of retiring on the 700ms floor.
  ['storage-csi-ephemeral-volume', { speed: 9, clamp: 0 }],
  // Tagged legs ride LEG_DUR so the tag can be read instead of retiring on the 700ms floor.
  ['storage-subpath',              { speed: 6, clamp: 0 }],
  // Tagged balls ride LEG_DUR under the 700ms floor, on request (M-13).
  ['storage-volume-model',         { speed: 5, clamp: 5 }],
  // Tagged writes ride LEG_DUR so the tag can be read. The untagged drop keeps routeDur.
  ['storage-recursive-readonly',   { speed: 4, clamp: 0 }],
  // Tagged grid legs ride LEG_DUR and the long volume shaft rides routeDur sped up, for readable tags.
  ['storage-container-filesystem', { speed: 6, clamp: 0 }],
  // Tagged writes ride LEG_DUR so the tag can be read instead of retiring on the 700ms floor.
  ['storage-hostpath',             { speed: 2, clamp: 0 }],
  // Tagged ascents ride LEG_DUR so the tag can be read instead of retiring on the 700ms floor.
  ['storage-pvc-protection',       { speed: 2, clamp: 0 }],
  // Tagged mount and deny ride LEG_DUR so the tag can be read instead of retiring on the 700ms floor.
  ['storage-pvc-binding',          { speed: 2, clamp: 0 }],
  // The tagged retroactive write rides LEG_DUR so the tag can be read.
  ['storage-default-storageclass', { speed: 1, clamp: 0 }],
  // Tagged patch and verdicts ride LEG_DUR so the tag can be read instead of retiring on the 700ms floor.
  ['storage-pv-reservation',       { speed: 3, clamp: 0 }],
  ['network-ebpf-dataplane',       { speed: 1, clamp: 0 }],
  // The three creation balls share the longest tap's duration so one parallel wave lands on one beat.
  ['workloads-job-parallelism',    { speed: 2, clamp: 0 }],
  // maxUnavailable 2: both Pods land on one beat, so the shorter lane takes the longer one's duration.
  ['workloads-statefulset-update-strategy', { speed: 1, clamp: 0 }],
  // One DELETE reaches five owners at once, so the watch hops share the longest path's duration.
  ['workloads-pod-replacement-guarantees', { speed: 3, clamp: 0 }],
  // The 24 unit chain gaps take GAP_MS 200 so the packet hops box to box instead of oozing on the floor.
  ['network-kube-proxy-modes',     { speed: 2, clamp: 2 }],
  // The tagged Node-1 leg rides LEG_DUR so its tag does not retire before it can be read.
  ['network-nodeport-loadbalancer', { speed: 1, clamp: 0 }],
  // The tagged ARP reply rides LEG_DUR so its tag does not retire before it can be read.
  ['network-loadbalancer-without-cloud', { speed: 1, clamp: 0 }],
  // The tagged outer leg rides LEG_DUR so its tag can be read, untagged balls keep routeDur.
  ['network-external-traffic-policy', { speed: 4, clamp: 0 }],
  // Each tagged balancer leg rides LEG_DUR so its tag can be read.
  ['network-loadbalancer-straight-to-pods', { speed: 3, clamp: 0 }],
  // Each tagged branch rides LEG_DUR so its tag can be read.
  ['network-ingress-routing', { speed: 2, clamp: 0 }],
  // Tagged legs ride LEG_DUR so the tag clears both faces and can be read.
  ['network-gateway-api', { speed: 2, clamp: 0 }],
  // Tagged legs ride LEG_DUR so the tag clears the face it leaves, untagged balls keep routeDur.
  ['network-gateway-traffic-splitting', { speed: 2, clamp: 0 }],
  // Every tagged leg rides LEG_DUR so the tag fades in clear, is read, and retires before the ripple.
  ['network-client-ip-preservation', { speed: 6, clamp: 0 }],
  // Tagged legs ride LEG_DUR for a readable address, untagged short hops ride BRISK_HOP_MS under the floor.
  ['network-nodelocal-dnscache', { speed: 20, clamp: 16 }],
  // Short lookup legs ride BRISK_HOP_MS under the 700ms floor, where they read as crawling.
  ['network-headless-service', { speed: 8, clamp: 8 }],
  // The tagged query leg rides LEG_DUR so its tag can lead the ball over both block tops.
  ['network-dns-records', { speed: 4, clamp: 0 }],
  // Short poll and write hops ride BRISK_HOP_MS, the same pace network-nodelocal-dnscache uses.
  ['network-dns-autoscaling', { speed: 8, clamp: 8 }],
]);

// PULSE-TOGETHER ceiling per card (M-03). Empty on purpose: an entry here is a defect to fix.
const WHOLE_POD = new Map([]);

// routeDur's bounds are module-private to scheme-kit.js, so they are read by calling it.
const PKT_DUR_MIN = routeDur([[0, 0], [0, 0.001]]);
const PKT_DUR_MAX = routeDur([[0, 0], [0, 1e7]]);

// Element identity is answered in the probe, canon numbers on the Node side, never both.

const catalogued = await cards();

// The probe is motionProbe in fixtures/probes.mjs, read at t=0 of the played pass at 1600x1000.
const snap = readSnapshot();
const ids = snap.ids;

test(`the grid renders the whole catalog (${catalogued.length} cards)`, () => {
  assert.ok(ids.length > 0, `NO CARDS RENDERED at ${snap.base}/scheme/ : posters or grid broken`);
  census('motion grid', ids.length, catalogued.length);
});

test('the motion vocabulary is the one tokens.js and scheme-kit.js declare', () => {
  // Token names and shapes: a lost field or collapsed magnitude would make several rules vacuous.
  assert.deepEqual(Object.keys(PULSE_POD), ['ms', 'bright', 'dimPeak']);
  assert.deepEqual(Object.keys(BEAT), ['afterPulse', 'afterHop', 'lead']);
  assert.deepEqual(Object.keys(FADE), ['in', 'out']);
  assert.ok(PULSE_POD.bright > 1, 'a pulse has to brighten');
  assert.notEqual(PULSE_POD.bright, PULSE_BLOCK.bright,
    'the pod pulse and the block flash must stay distinguishable by magnitude, or PULSE-SHAPE cannot ' +
    'tell a hand-rolled flash from the kit pulse');
  assert.ok(PKT_DUR_MIN > 0 && PKT_DUR_MAX > PKT_DUR_MIN,
    `routeDur's clamp read back as [${PKT_DUR_MIN}, ${PKT_DUR_MAX}], which is not a usable band`);
  assert.equal(routeDur([[0, 0], [0, 0]]), PKT_DUR_MIN, 'a zero-length route must land on the floor');
});

let walked = 0, sampled = 0;
const n = { pulses: 0, flashes: 0, ramps: 0, balls: 0, labels: 0, timers: 0 };
// Cards with at least one POD pulse, the selector guard behind EXPECTED_PULSE_CARDS.
const pulseCards = new Set();
const beats = new Map();
const fadeHist = new Map();
const together = [];        // PULSE-TOGETHER findings, reported rather than asserted
const pacingHits = new Map();
const slowest = [];

const bump = (m, k) => m.set(k, (m.get(k) || 0) + 1);

for (const id of ids) {
  test(id, async () => {
    walked++;                    // counted before the assertions, so a broken card is reported once, as itself
    const card = snap.cards[id];
    const total = card.steps;
    assert.ok(total > 0, `stepCount is ${total}: no steps to walk`);

    const findings = [];
    const allowance = PACING.get(id) || { speed: 0, clamp: 0 };
    let speedSeen = 0, clampSeen = 0;

    for (let i = 0; i < total; i++) {
      // Frozen at t=0: the plan is complete on entry, and a seek would put fill-forward values in front of the pins.
      const { live, motion: r } = card.played[i];
      if (!live && i > 0) {
        findings.push(`UNMEASURED step ${i}: no _timeline handle, the step fell back to a static ` +
          'frame and none of its motion was planned');
        continue;
      }
      if (!r) {
        findings.push(`NO DIAGRAM step ${i}: the probe found no svg.diagram after a retry, so this ` +
          "step's motion was never read");
        continue;
      }
      sampled++;

      for (const p of r.pulses) {
        // Flash and pod pulse share the brightness track and are told apart by magnitude (M-27).
        if (p.peak === PULSE_BLOCK.bright && p.dur === PULSE_BLOCK.ms) {
          n.flashes++;
          if (p.easing !== PULSE_BLOCK.easing || p.first !== 1 || p.last !== 1) {
            findings.push(`FLASH-SHAPE step ${i} "${p.label}" [${p.cls}] brightness ${p.first} to ` +
              `${p.peak} to ${p.last} over ${p.dur}ms ${p.easing}: the sanctioned block flash is ` +
              `1 to ${PULSE_BLOCK.bright} to 1 over ${PULSE_BLOCK.ms}ms ${PULSE_BLOCK.easing}, and it ` +
              'comes from flashChips through F.flash, never from keyframes typed into a card');
          }
          // Only Pods pulse (M-01): a flash inside a Pod is a pulse written wrong.
          if (p.inPod || p.ownsPod) {
            findings.push(`FLASH-BLOCK step ${i} "${p.label}" [${p.cls}] flashes at ${p.delay}ms ` +
              'on a Pod or the group holding one. A Pod blinks through pulsePod at the pod ' +
              'magnitude: F.flash is for infrastructure, which never pulses');
          }
          continue;
        }
        n.pulses++;
        pulseCards.add(id);
        if (p.peak !== PULSE_POD.bright || p.dur !== PULSE_POD.ms || p.easing !== 'ease-in-out' ||
            p.first !== 1 || p.last !== 1) {
          findings.push(`PULSE-SHAPE step ${i} "${p.label}" [${p.cls}] brightness ${p.first} to ` +
            `${p.peak} to ${p.last} over ${p.dur}ms ${p.easing}: the canon pulse is ` +
            `1 to ${PULSE_POD.bright} to 1 over ${PULSE_POD.ms}ms ease-in-out, one length catalog-wide`);
        }
        if (!p.kitPaired) {
          findings.push(`PULSE-KIT step ${i} "${p.label}" [${p.cls}] brightens at ${p.delay}ms with ` +
            'no stroke ramp beside it: the kit pulse always animates the stroke of the rects in the ' +
            'same group at the same delay, so this one was written by hand and not through pulsePod');
        }
        if (!p.inPod) {
          findings.push(`PULSE-POD step ${i} "${p.label}" [${p.cls}] pulses at ${p.delay}ms and no ` +
            'Pod is anywhere in the group it belongs to. Only Pods pulse: infrastructure lights ' +
            'through .highlight or lightBoxAt');
        } else if (!p.coTimed) {
          together.push(`${id} step ${i} "${p.label}" [${p.cls}] blinks at ${p.delay}ms while the Pod ` +
            'holding it does not blink on that beat');
        }
      }

      for (const s of r.ramps) {
        n.ramps++;
        if (!s.blockPulses) {
          findings.push(`PULSE-WHOLE step ${i} "${s.label}" [${s.cls}] has a stroke ramp but the ` +
            'block owning it has no brightness track. That is the half-strength pulse: pulsePod was ' +
            'handed a bare element instead of the group holding the shell and its inner boxes');
        }
      }

      for (const b of r.balls) {
        n.balls++;
        const want = routeDur(b.pts);
        if (b.dur !== want) {
          speedSeen++;
          if (speedSeen > allowance.speed) {
            findings.push(`SPEED step ${i} "${b.label}" flies ${Math.round(routeLength(b.pts))} units ` +
              `in ${b.dur}ms, and its own route says ${want}ms. Routes take no explicit dur: one ` +
              'speed everywhere, or a ball on a short lane reads as a dart next to a long glide');
          }
        }
        if (b.dur < PKT_DUR_MIN || b.dur > PKT_DUR_MAX) {
          clampSeen++;
          if (clampSeen > allowance.clamp) {
            findings.push(`CLAMP step ${i} "${b.label}" flies for ${b.dur}ms, outside routeDur's own ` +
              `[${PKT_DUR_MIN}, ${PKT_DUR_MAX}]`);
          }
        }
        if (!b.ripples) {
          findings.push(`ARRIVE step ${i} "${b.label}" lands at ${b.delay + b.dur}ms with no ripple ` +
            'on its last point. Every packet ripples at its destination, with no per-call opt-in');
        }
        if (b.delay === 0) bump(beats, 'delay 0, the step opens on it');
        else if (b.delay === BEAT.afterPulse) bump(beats, `delay ${BEAT.afterPulse}, BEAT.afterPulse or BEAT.lead`);
        else if (b.afterArrivals.some(x => x + BEAT.afterHop === b.delay)) bump(beats, `a hop arrival plus BEAT.afterHop (${BEAT.afterHop})`);
        else if (b.afterArrivals.some(x => x === b.delay)) bump(beats, 'a hop arrival exactly');
        else bump(beats, 'not explained by the BEAT vocabulary');
        slowest.push({ id, i, label: b.label, dur: b.dur, len: Math.round(routeLength(b.pts)) });
      }

      for (const l of r.labels) {
        n.labels++;
        if (!l.matches) {
          findings.push(`RIDE step ${i} tag "${l.txt}" rides a route no packet on this step travels. ` +
            'A tag and its ball share one points array by construction, so either the ball is gone ' +
            'or the tag was given a different route');
          continue;
        }
        if (l.easing !== l.ballEasing) {
          findings.push(`RIDE step ${i} tag "${l.txt}" eases ${l.easing} while its ball eases ` +
            `${l.ballEasing}: the tag drifts off the ball mid-flight and rejoins it only at the ends`);
        }
        if (l.dur !== l.ballDur) {
          findings.push(`RIDE step ${i} tag "${l.txt}" flies for ${l.dur}ms while its ball takes ` +
            `${l.ballDur}ms on the same route`);
        }
        if (!l.pinnedAtStart) {
          findings.push(`RIDE step ${i} tag "${l.txt}" is built at ${JSON.stringify(l.pin)} rather ` +
            `than at its route start ${JSON.stringify(l.start.map(Math.round))}: until the delay ` +
            'elapses it sits at the SVG origin, under the narration panel');
        }
      }

      for (const t of r.timers) {
        n.timers++;
        if (t.kf) {
          findings.push(`TIMER step ${i} "${t.label}" is a 1ms deferred timer carrying ${t.kf} ` +
            'keyframe(s). The keyframe list must stay EMPTY: naming a property composites the target ' +
            'for the whole delay window, so every block about to light shifts tone and snaps back');
        }
      }
      for (const o of r.noop) {
        findings.push(`TIMER step ${i} "${o.label}" animates opacity ${JSON.stringify(o.ops)} over ` +
          `${o.dur}ms, which changes nothing and composites the target for the whole window`);
      }
      for (const c of r.cxcy) {
        findings.push(`TRANSFORM step ${i} "${c.label}" animates cx or cy. Packets move by ` +
          'transform on a cx=0, cy=0 circle');
      }
      for (const f of r.fades) bump(fadeHist, f.dir === 'in'
        ? (f.dur === FADE.in ? `in, FADE.in (${FADE.in})` : f.dur === REVEAL_MS ? `in, REVEAL_MS (${REVEAL_MS})` : 'in, per-card pacing')
        : f.dir === 'out'
          ? (f.dur === FADE.out ? `out, FADE.out (${FADE.out})` : 'out, per-card pacing')
          : 'blink, a pulsePodDim lift');
    }

    if (speedSeen || clampSeen) pacingHits.set(id, { speed: speedSeen, clamp: clampSeen });

    const uniq = [...new Set(findings)];
    assert.equal(uniq.length, 0,
      `${uniq.length} finding(s) over ${total} step(s):\n  ${uniq.join('\n  ')}`);
  });
}

test('the explicit-dur registry has no dead and no under-sized entries', FULL_ONLY, () => {
  // A registry entry that no longer deviates, or allows more than it covers, is a hole.
  const dead = [], loose = [];
  for (const [id, allow] of PACING) {
    const hit = pacingHits.get(id) || { speed: 0, clamp: 0 };
    if (!hit.speed && !hit.clamp) { dead.push(`${id}: registered for ${allow.speed} deviating ball(s), found none`); continue; }
    if (allow.speed > hit.speed) loose.push(`${id}: allowed ${allow.speed} deviating ball(s), found ${hit.speed}`);
    if (allow.clamp > hit.clamp) loose.push(`${id}: allowed ${allow.clamp} clamp escape(s), found ${hit.clamp}`);
  }
  assert.equal(dead.length + loose.length, 0,
    `the registry no longer matches the catalog:\n  ${[...dead, ...loose].join('\n  ')}\n` +
    '  Lower the entry to what the card actually does, or delete it.');
});

test('PULSE-TOGETHER: a Pod blinks with everything inside it (M-03, reported)', (t) => {
  // Ceiling per card (WHOLE_POD), empty, so any finding is red.
  const byCard = new Map();
  for (const line of together) {
    const id = line.split(' ')[0];
    byCard.set(id, (byCard.get(id) || 0) + 1);
  }
  t.diagnostic(`PULSE-TOGETHER: ${together.length} finding(s) on ${byCard.size} card(s)`);
  together.forEach(l => t.diagnostic('  ' + l));
  const over = [...byCard.entries()].filter(([id, count]) => count > (WHOLE_POD.get(id) || 0));
  assert.equal(over.length, 0,
    `${over.length} card(s) over the recorded ceiling:\n  ` +
    over.map(([id, c]) => `${id}: ${c} finding(s), ${WHOLE_POD.get(id) || 0} recorded`).join('\n  '));
});

test('every catalogued card was walked, every population was seen', (t) => {
  t.diagnostic(`motion: ${walked} cards, ${sampled} steps`);
  t.diagnostic(`  pulses ${n.pulses}  block flashes ${n.flashes}  stroke ramps ${n.ramps}  balls ${n.balls}  riding tags ${n.labels}  deferred timers ${n.timers}`);

  // Printed on green: the only standing witness for M-25, every delay would collapse to 0.
  t.diagnostic('where a ball\'s delay comes from (M-15 to M-18, measured not asserted):');
  for (const [k, v] of [...beats.entries()].sort((a, b) => b[1] - a[1])) t.diagnostic(`  ${String(v).padStart(4)}  ${k}`);
  t.diagnostic('fade durations against FADE and REVEAL_MS (M-21, M-22, measured not asserted):');
  for (const [k, v] of [...fadeHist.entries()].sort((a, b) => b[1] - a[1])) t.diagnostic(`  ${String(v).padStart(4)}  ${k}`);

  const slow = [...slowest].sort((a, b) => b.dur - a.dur).slice(0, 5);
  t.diagnostic('slowest 5 balls (a ball at the ceiling cannot be slowed by lengthening its route):');
  for (const s of slow) t.diagnostic(`  ${s.id} step ${s.i} "${s.label}" ${s.len} units in ${s.dur}ms`);

  census('motion walked', walked, catalogued.length);
  assert.ok(walked >= EXPECTED_CARDS,
    `walked ${walked} card(s), the catalog had ${EXPECTED_CARDS} when this floor was measured. ` +
    'A shrunken walk is a subset, and a subset that passes is worse than a red run.');
  assert.ok(sampled >= EXPECTED_STEPS,
    `sampled ${sampled} step(s), expected at least ${EXPECTED_STEPS}. A step nobody sampled is a ` +
    'step whose motion can be wrong while this file stays green.');
  assert.ok(pulseCards.size >= EXPECTED_PULSE_CARDS,
    `measured a Pod pulse on ${pulseCards.size} card(s), expected at least ${EXPECTED_PULSE_CARDS}. ` +
    'The specs declare an F.pulse on that many, so a card missing here is one whose brightness this ' +
    'walk read nothing of, and every pulse rule is then judging a shrunken set.');
  assert.ok(n.pulses >= EXPECTED_PULSES,
    `saw ${n.pulses} pulse(s), expected at least ${EXPECTED_PULSES}: the brightness track is how ` +
    'every pulse rule finds its input');
  assert.ok(n.ramps >= EXPECTED_RAMPS,
    `saw ${n.ramps} stroke ramp(s), expected at least ${EXPECTED_RAMPS}: PULSE-WHOLE has no input without them`);
  assert.ok(n.balls >= EXPECTED_BALLS,
    `saw ${n.balls} ball(s), expected at least ${EXPECTED_BALLS}: SPEED, CLAMP and ARRIVE all select ` +
    'on .scheme-packet, so renaming that class would empty three rules at once');
  assert.ok(n.labels >= EXPECTED_LABELS,
    `saw ${n.labels} riding tag(s), expected at least ${EXPECTED_LABELS}`);
  assert.ok(n.timers >= EXPECTED_TIMERS,
    `saw ${n.timers} deferred timer(s), expected at least ${EXPECTED_TIMERS}: TIMER is the only ` +
    'machine reading of M-28 and it selects on a 1ms duration');
});
