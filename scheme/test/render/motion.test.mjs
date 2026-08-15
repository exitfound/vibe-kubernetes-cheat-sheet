// motion.test.mjs: the M block of ../../CANON.md, as far as a machine can carry it.
//
// M is the block a machine covers WORST. Of its 35 rows, 30 say `Check: review`, and that is not an
// oversight: most of M is about whether a beat READS right, which no probe can answer. This file
// deliberately does not attempt all 35. It takes the rows whose subject is a NUMBER or a PAIRING
// (which of two things moves, how long it moves for, whether two tracks agree) and leaves the rest
// named, in the table at the bottom of this header, so the reader knows what is still a person's job.
//
// Nine rules, all mandatory unless the row says otherwise:
//
//   PULSE-SHAPE (M-06)         every pulse is PULSE_POD.ms long, peaks at PULSE_POD.bright, and
//                              starts and ends at brightness 1. One length, catalog-wide.
//   PULSE-KIT   (M-02)         every pulse carries the kit's stroke ramp at the same delay. A pulse
//                              written by hand has a filter track and nothing else.
//   PULSE-POD   (M-01)         the pulsed element is a Pod or lives inside a Pod-bearing group.
//                              Infrastructure lights through .highlight, it never pulses.
//   PULSE-WHOLE (M-03)         a stroke ramp without a brightness track on the block that owns it is
//                              the half-strength pulse: pulsePod was handed a bare element, not the
//                              group. This is exactly the symptom M-03 names.
//   PULSE-TOGETHER (M-03)      REPORTED, not asserted. The Pod of a pulsed group must blink on the
//                              same beat as the containers inside it. 2 findings today, both on
//                              cluster-pod-sandbox-cri, and the ceiling below keeps a third from
//                              arriving quietly.
//   RIDE        (M-30, M-31)   a riding tag rides a real ball, with that ball's easing, that ball's
//                              duration, and pinned at the route start when it is built.
//   SPEED       (M-12)         a ball's flight time is routeDur() of its own route: one speed
//                              everywhere. Cards that took the explicit-dur exemption are registered
//                              below, with the count they are allowed.
//   CLAMP       (M-13)         no ball flies outside routeDur's own [floor, ceiling]. Same registry.
//   ARRIVE      (M-14)         every ball ripples at its destination, on the millisecond it lands.
//   TRANSFORM   (M-09)         packets move by transform. Nothing in the catalog animates cx or cy.
//   TIMER       (M-28, M-29)   the 1ms deferred timers behind lightBoxAt() and at() carry an EMPTY
//                              keyframe list, and no animation anywhere is a no-op opacity track.
//
// M-08 IS NOT HERE ON PURPOSE. "A Pod that fades out must pulse first" is already the ORDER rule of
// render/opacity.test.mjs, which reads the same animation list from the same frozen step. A second
// copy would be a second answer to maintain, and the two would drift.
//
// WHERE THE NUMBERS COME FROM. Nothing in this file restates a magnitude. PULSE_POD, BEAT and FADE
// are imported from js/lib/tokens.js, and routeDur / routeLength / REVEAL_MS are imported from
// js/lib/scheme-kit.js, so SPEED compares a ball against the very function that timed it rather than
// against a copy of its arithmetic. routeDur's clamp is not written down here either: CLAMP derives
// the floor and the ceiling by calling routeDur with a degenerate route and an absurd one, which is
// the only reading that cannot go stale when PKT_SPEED is retuned (both bounds are module-private
// to scheme-kit.js and are deliberately not exported).
//
// TWO HARNESS LIMITS THIS FILE IS BUILT AROUND.
//
// 1. A PAUSED ANIMATION NEVER FIRES onfinish (stage 2.3a). enterStep freezes the step, so any class
//    a card adds or removes in a completion handler is invisible to a frozen probe. The live example
//    is storage-reclaim-policy.js:43-49, where removeAt() drops .highlight in onfinish and a frozen
//    read accuses the card of holding it. EVERY rule above therefore reads WAAPI timings and
//    keyframes, which are the step's PLAN and are complete at t=0, and none of them reads a class or
//    a computed style. The one DOM value read at all is the riding tag's build-time transform pin
//    (M-31), which is written by makeRidingLabel before any animation starts and is not deferred.
//
// 2. THE PROBE CAN CATCH A STEP WITH NO DIAGRAM (stage 2.4c). Scene.build() empties the host and
//    appends a fresh <svg.diagram>, so a probe that lands in that window sees nothing. openCard waits
//    for the selector once, which is not enough: the rebuild happens again on every reset(). Every
//    sample below therefore re-waits on the selector and probes a second time before giving up, and
//    a step that still has no diagram is a FINDING rather than a silent `continue`. Without that the
//    walk undercounts by one step and nothing looks wrong.
//
// WHAT STAYS WITH A PERSON, and why (the other 24 rows of M):
//   M-04  pulse is brightness and never scale: a scale would be visible in the keyframes, but the
//         rule is about a composition clash a probe cannot judge.
//   M-05  the pulse base equals the Pod's resting stroke: a colour question, palette.test.mjs's job.
//   M-07  a DIM Pod needs pulsePodDim: whether a blink is VISIBLE against 0.55 is a perception call.
//   M-10  a packet must represent traffic the step narrates: needs the narration read against the
//         picture. This is the single most valuable row in the block and the least mechanisable.
//   M-11  three packet flavours and no fourth: a rendered ball carries no record of which wrapper
//         made it. Wave 2 reads it off STEPS_SPEC[].flow.
//   M-12  the second half of the row, "an explicit dur needs a one-line justification at the call
//         site", is source prose. SPEED below can only count the exemptions, not read their reasons.
//   M-15  M-16  M-17  M-18: which beat a delay came from. The BEAT census printed on a green run
//         measures how much of the catalog the vocabulary explains (671 of 714 balls today) but
//         cannot say that a given 800 was afterPulse rather than lead: the two tokens are the same
//         number, so the distinction is not in the data at all.
//   M-20  "geometry changes are timing changes" is a working instruction, not a property.
//   M-21  FADE.in / FADE.out with a justified exception: measured and printed below. Of 367 opacity
//         tracks outside the packet layer, 172 sit on the two tokens, 71 on REVEAL_MS, 12 are the
//         opacity lift of a pulsePodDim blink, and 112 are per-card pacing that the row explicitly
//         allows. Asserting the token would report those 112 as findings against cards that are right.
//   M-22  M-23  M-24: revealAt's shape and the shade it rests at. REVEAL_MS is measured (71 tracks),
//         but whether `from` is the right shade for a lane already pointing at the object is a
//         picture question.
//   M-25  animateAlong honours options.delay: a regression that would show up as every ball starting
//         at 0. The BEAT census would collapse to "zero 714" and is the standing witness, which is
//         weaker than an assertion and is named as such.
//   M-26  M-27: value chips never flash, and flashChips is the only sanctioned block flash. Nothing
//         to assert: the walk finds ZERO PULSE_BLOCK-magnitude tracks in the whole catalog, so no
//         card calls flashChips at all today. A rule with an empty population is not a green rule.
//   M-32  ridingLabel is bound once at module scope: a source-shape question, wave 2.
//   M-33  every animation goes through ctx.register: an unregistered animation looks identical here,
//         it just outlives its step. Visible only by stepping away and watching what keeps moving.
//   M-34  "an added hop costs about 800ms": advice about editing, and duration.test.mjs says by how much.
//   M-35  a SEEK cannot see a deferred effect: seekStep sets currentTime and never fires onfinish,
//         so an at() turnover, a lightBoxAt arrival class and a deferred setWire are all missing
//         from any frame it hands back. This is a LIVE blind spot of THIS harness, not a dead note
//         about the deleted frame-strip reader: seekStep lives in fixtures/render.mjs, and both
//         render/opacity.test.mjs and render/reduced.test.mjs read their frames through it. What
//         sees a turnover is a real-time playthrough (tools/settled-dump.mjs), which is a probe and
//         not an assertion, so the rule stays with a person until someone writes the check.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census } from '../fixtures/catalog.mjs';
import {
  DEFAULT_BASE, DIAGRAM, SELECTOR_TIMEOUT_MS,
  launch, setInspect, discoverIds, openCard, stepCount, enterStep,
} from '../fixtures/render.mjs';
import { PULSE_POD, PULSE_BLOCK, BEAT, FADE } from '../../js/lib/tokens.js';
import { routeDur, routeLength, REVEAL_MS } from '../../js/lib/scheme-kit.js';

// ---------------------------------------------------------------------------------------------
// Control numbers, measured on a green walk of the whole catalog (108 cards, 650 steps).
//
// The card and step floors are the same two every render test carries. The four population floors
// under them are NOT decoration: every rule in this file selects its input with a class name, so
// renaming .scheme-packet or .scheme-pod-rect would empty the input and turn the file green with no
// error and no finding. That is the exact failure the old harness paid for twice, and a population
// floor is the only thing that sees it. It is a FLOOR: a card added later legitimately raises these
// numbers, and a card edit that lowers one is a deliberate change that has to move the floor too.
//
// This is not the case stage 0.4a refused to port. COVERAGE FLOOR and UNREAD CEILING insured a
// REGEX that was about to be replaced by an import; these insure a SELECTOR, which wave 2 does not
// remove, because the rendered tree stays the only place a WAAPI timing exists.
// ---------------------------------------------------------------------------------------------
const EXPECTED_CARDS = 108;
const EXPECTED_STEPS = 650;
const EXPECTED_PULSES = 784;     // brightness tracks (pod shells and the boxes inside them)
const EXPECTED_RAMPS = 1568;     // stroke ramps, two per rect per pulse (up, then down)
const EXPECTED_BALLS = 714;      // .scheme-packet transform tracks
const EXPECTED_LABELS = 241;     // riding tags
const EXPECTED_TIMERS = 555;     // the 1ms deferred timers of lightBoxAt() and at()

// ---------------------------------------------------------------------------------------------
// The explicit-dur registry (M-12). A route takes its time from its LENGTH; an explicit `dur` is
// reserved for narrative pacing. check-canon.mjs:19 kept the same kind of list under
// ALLOW_EXPLICIT_DUR, per file, and this is that list measured from the other side: not "the source
// spells dur" but "a ball flew at a speed its route does not explain".
//
// The number is a CEILING, not an equality, and the asymmetry is deliberate: a new deviation on a
// registered card is a finding (the count rises), while removing one is a fix and must not turn this
// file red. A card that is not on the list gets no latitude at all, which is what makes the rule
// bite on the other 100.
//
// `clamp` is the subset of those balls that also escape routeDur's floor: a ball moving faster than
// the canon minimum. All five are short segment hops shortened on purpose.
// ---------------------------------------------------------------------------------------------
const PACING = new Map([
  ['network-service-clusterip',    { speed: 8, clamp: 0 }],
  ['network-ipam-pod-cidr',        { speed: 6, clamp: 3 }],
  ['network-pod-to-pod-same-node', { speed: 6, clamp: 0 }],
  ['network-traffic-distribution', { speed: 6, clamp: 0 }],
  ['storage-csi-capacity-tracking',{ speed: 6, clamp: 0 }],
  ['network-service-cidr',         { speed: 3, clamp: 1 }],
  ['storage-fsgroup-ownership',    { speed: 3, clamp: 1 }],
  ['network-ebpf-dataplane',       { speed: 1, clamp: 0 }],
]);

// PULSE-TOGETHER's ceiling (M-03). cluster-pod-sandbox-cri pulses appGroup alone on its last two
// steps, so the app container blinks while the Pod shell holding it does not. Both are deliberate
// and recorded as NOT A DEFECT in that card's CARDS.md section: the ceiling keeps a third quiet.
const WHOLE_POD = new Map([
  ['cluster-pod-sandbox-cri', 2],
]);

// routeDur's own bounds, read out of the function instead of copied from beside it. Both constants
// are module-private to scheme-kit.js, so this is the only reading that cannot go stale.
const PKT_DUR_MIN = routeDur([[0, 0], [0, 0.001]]);
const PKT_DUR_MAX = routeDur([[0, 0], [0, 1e7]]);

// ---------------------------------------------------------------------------------------------
// The probe. Everything that needs ELEMENT IDENTITY (does this stroke ramp sit on a rect inside the
// pulsed group, does this tag's route belong to a real ball, is there a Pod in the group that was
// pulsed) is answered here, where the elements exist. Everything that needs a CANON NUMBER is
// answered on the Node side, where the tokens are imported. Nothing is answered in both places.
// ---------------------------------------------------------------------------------------------
const probe = () => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;

  const label = (el) => {
    const t = el.querySelector && el.querySelector('text');
    const own = ((t && t.textContent) || '').trim();
    if (own) return own.slice(0, 30);
    const near = el.closest && el.closest('.scheme-box, .scheme-pod, .scheme-cylinder, .scheme-node');
    const nt = near && near.querySelector('text');
    return (((nt && nt.textContent) || el.tagName).trim().slice(0, 30)) || el.tagName;
  };
  // A translate() out of a keyframe or out of an inline style. Packets and tags are pinned at
  // cx=0,cy=0 and moved by transform (M-09), so this is where a position lives.
  const xy = (t) => {
    const m = /translate\(\s*(-?[\d.]+)px[, ]+\s*(-?[\d.]+)px\s*\)/.exec(t || '');
    return m ? [+m[1], +m[2]] : null;
  };
  const rk = (p) => p.map(q => `${Math.round(q[0])},${Math.round(q[1])}`).join('|');

  const all = [];
  for (const a of document.getAnimations()) {
    const tgt = a.effect && a.effect.target;
    if (!tgt || !svg.contains(tgt)) continue;
    let kf = [];
    try { kf = a.effect.getKeyframes(); } catch (_) { continue; }
    // getComputedTiming for the delay (it is the resolved one), getTiming for duration and easing
    // (the computed easing of a paused effect is the same string, and the declared one is what the
    // rule is about).
    const tm = a.effect.getTiming(), ct = a.effect.getComputedTiming();
    all.push({ el: tgt, kf, delay: Math.round(ct.delay || 0), dur: Math.round(Number(tm.duration) || 0), easing: tm.easing });
  }

  const brightA = all.filter(r => r.kf.some(k => k.filter));
  const strokeA = all.filter(r => r.kf.some(k => k.stroke));
  const moves = all.map(r => ({ ...r, pts: r.kf.map(k => xy(k.transform)).filter(Boolean) })).filter(r => r.pts.length >= 2);
  const balls = moves.filter(r => r.el.classList.contains('scheme-packet'));

  const out = { pulses: [], ramps: [], balls: [], labels: [], timers: [], noop: [], cxcy: [], fades: [] };

  for (const b of brightA) {
    const peaks = b.kf.map(k => parseFloat((/brightness\(([\d.]+)\)/.exec(k.filter || '') || [0, NaN])[1]))
      .filter(Number.isFinite);
    // inPod: the target is a Pod, or SOME ancestor below the diagram root holds one. The ancestor
    // walk is what makes a container box legal: storage-emptydir wraps shell and containers in one
    // group and the boxes sit a level deeper, so a parent-only test would report four correct cards.
    // coTimed is the stricter half: that Pod must blink on the SAME beat, which is what "a Pod
    // pulses with everything inside it" actually says.
    let inPod = b.el.classList.contains('scheme-pod');
    let coTimed = inPod;
    for (let p = b.el.parentElement; p && p !== svg && !(inPod && coTimed); p = p.parentElement) {
      const pods = [...p.querySelectorAll('.scheme-pod')];
      if (pods.length) inPod = true;
      if (pods.some(q => brightA.some(x => x.el === q && x.delay === b.delay))) coTimed = true;
    }
    // The kit animates stroke on the rects of the same group at the same delay. A hand-rolled
    // brightness track has no such partner, which is what makes this the render-side R-rawpulse.
    const rects = [b.el, ...b.el.querySelectorAll('.scheme-pod-rect, .scheme-box-rect')];
    out.pulses.push({
      label: label(b.el), cls: b.el.getAttribute('class') || '', delay: b.delay, dur: b.dur, easing: b.easing,
      first: peaks.length ? peaks[0] : null,
      last: peaks.length ? peaks[peaks.length - 1] : null,
      peak: peaks.length ? Math.max(...peaks) : null,
      kitPaired: strokeA.some(s => s.delay === b.delay && rects.includes(s.el)),
      inPod, coTimed,
    });
  }

  for (const s of strokeA) {
    const blk = s.el.closest('.scheme-pod, .scheme-box');
    out.ramps.push({
      label: label(s.el), cls: s.el.getAttribute('class') || '', delay: s.delay, dur: s.dur,
      blockPulses: !!blk && brightA.some(x => x.el === blk),
    });
  }

  const arrivals = balls.map(b => b.delay + b.dur);
  for (const b of balls) {
    const end = b.pts[b.pts.length - 1];
    const want = b.delay + b.dur;
    out.balls.push({
      label: label(b.el), delay: b.delay, dur: b.dur, easing: b.easing, pts: b.pts,
      // The ripple is stamped at delay + travel on the last point of the route (M-14). 1ms of slack
      // because both numbers are rounded off the same arithmetic.
      ripples: all.some(r => r.el.classList.contains('scheme-ripple') && Math.abs(r.delay - want) <= 1 &&
        r.kf.some(k => { const p = xy(k.transform); return p && Math.abs(p[0] - end[0]) < 1 && Math.abs(p[1] - end[1]) < 1; })),
      // Every arrival in this step, so the Node side can name which beat this ball's delay came
      // from against the imported BEAT. A ball's OWN arrival is in the list and cannot explain its
      // own delay (an arrival is always later than the departure it belongs to), so it is left in
      // rather than filtered out by a special case.
      afterArrivals: arrivals,
    });
  }

  for (const l of moves) {
    if (l.el.tagName !== 'text' || !l.el.closest('#packetLayer')) continue;
    const same = balls.filter(b => rk(b.pts) === rk(l.pts));
    const pin = xy(l.el.style.transform);
    out.labels.push({
      txt: (l.el.textContent || '').slice(0, 24), easing: l.easing, dur: l.dur, delay: l.delay,
      matches: same.length,
      ballEasing: same.length ? same[0].easing : null,
      ballDur: same.length ? same[0].dur : null,
      // M-31: built pinned at the route start, or the tag sits at the SVG origin under the narration
      // panel until its delay elapses. Read off the inline style, which makeRidingLabel writes at
      // build time: it is not deferred, so a frozen probe sees it.
      pinnedAtStart: !!pin && Math.abs(pin[0] - l.pts[0][0]) <= 1 && Math.abs(pin[1] - l.pts[0][1]) <= 1,
      pin,
      start: l.pts[0],
    });
  }

  for (const a of all) {
    if (a.dur === 1) out.timers.push({ label: label(a.el), kf: a.kf.length });
    const ops = a.kf.map(k => k.opacity).filter(o => o !== undefined && o !== null).map(Number);
    // M-29's grep, as data: a track that animates opacity from a value to the same value is the
    // composite-forcing no-op M-28 exists to forbid.
    if (ops.length >= 2 && ops.every(o => o === ops[0]) && a.kf.every(k => !k.transform && !k.filter && !k.stroke)) {
      out.noop.push({ label: label(a.el), ops, dur: a.dur });
    }
    if (a.kf.some(k => k.cx !== undefined || k.cy !== undefined)) out.cxcy.push({ label: label(a.el) });
    if (!ops.length || a.el.closest('#packetLayer') || a.kf.some(k => k.filter)) continue;
    out.fades.push({ dir: ops[ops.length - 1] < ops[0] ? 'out' : ops[ops.length - 1] > ops[0] ? 'in' : 'blink', dur: a.dur });
  }

  return out;
};

const catalogued = await cards();

const browser = await launch();
// 1600x1000, the viewport check-arrival and check-geometry used. Route lengths are in viewBox units
// so the window size does not move a duration, but keeping one viewport across the render tests is
// what makes two of their numbers comparable.
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.addInitScript(setInspect, 'expose');
const ids = await discoverIds(page, DEFAULT_BASE);

after(() => browser.close());

// One retry on the diagram selector, then one more probe. See harness limit 2 in the header: the
// scene is torn down and rebuilt on every reset, so a null here is a race and not a broken card.
async function sample(p) {
  let r = await p.evaluate(probe);
  if (r) return r;
  await p.waitForSelector(DIAGRAM, { timeout: SELECTOR_TIMEOUT_MS });
  r = await p.evaluate(probe);
  return r;
}

test(`the grid renders the whole catalog (${catalogued.length} cards)`, () => {
  assert.ok(ids.length > 0, `NO CARDS RENDERED at ${DEFAULT_BASE}/scheme/ : posters or grid broken`);
  census('motion grid', ids.length, catalogued.length);
});

test('the motion vocabulary is the one tokens.js and scheme-kit.js declare', () => {
  // Names and shapes, not a second copy of the numbers. What this catches is a token quietly losing
  // a field or a magnitude collapsing onto its neighbour, either of which would make several rules
  // below assert nothing while still passing.
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
const n = { pulses: 0, ramps: 0, balls: 0, labels: 0, timers: 0 };
const beats = new Map();
const fadeHist = new Map();
const together = [];        // PULSE-TOGETHER findings, reported rather than asserted
const pacingHits = new Map();
const slowest = [];

const bump = (m, k) => m.set(k, (m.get(k) || 0) + 1);

for (const id of ids) {
  test(id, async () => {
    walked++;                    // counted before the assertions, so this stays a census of
                                 // COVERAGE and a broken card is reported once, as itself.
    await openCard(page, id);
    const total = await stepCount(page);
    assert.ok(total > 0, `stepCount is ${total}: no steps to walk`);

    const findings = [];
    const allowance = PACING.get(id) || { speed: 0, clamp: 0 };
    let speedSeen = 0, clampSeen = 0;

    for (let i = 0; i < total; i++) {
      // The played path with animations attached but no auto-advance, frozen at t=0. t=0 rather than
      // the end of the step because every rule here reads the PLAN (delays, durations, keyframes),
      // and the plan is complete the moment the step is entered. Seeking would buy nothing and would
      // put fill-forwards values in front of the pins.
      const live = await enterStep(page, i);
      if (!live && i > 0) {
        findings.push(`UNMEASURED step ${i}: no _timeline handle, the step fell back to a static ` +
          'frame and none of its motion was planned');
        continue;
      }
      const r = await sample(page);
      if (!r) {
        findings.push(`NO DIAGRAM step ${i}: the probe found no svg.diagram after a retry, so this ` +
          "step's motion was never read");
        continue;
      }
      sampled++;

      for (const p of r.pulses) {
        n.pulses++;
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

test('the explicit-dur registry has no dead and no under-sized entries', () => {
  // A registry that outlives its reason is a hole with a comment on it. Two failure modes, and both
  // are silent without this: an entry for a card that no longer deviates (latitude nobody uses, and
  // the next author reads it as permission), and an allowance larger than the deviation it covers
  // (room for a defect to arrive unnoticed).
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
  // Reported with a ceiling rather than asserted to zero. The two findings are real and neither is
  // written down in the card record, but closing them is a card change and this file only measures.
  // The ceiling is per card, so a NEW one anywhere is red while fixing one of these is not.
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
  t.diagnostic(`  pulses ${n.pulses}  stroke ramps ${n.ramps}  balls ${n.balls}  riding tags ${n.labels}  deferred timers ${n.timers}`);

  // Printed on a GREEN run, because it is a measurement and not a finding. It is also the only
  // standing witness for M-25 (animateAlong honours options.delay): if that regressed, every ball
  // would report delay 0 and this table would collapse to one row.
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
  // The population floors. Each of these is a selector that could go quiet.
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
