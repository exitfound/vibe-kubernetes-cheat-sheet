// ripple-double.test.mjs: HOW MANY rings land on one arrival, which is the question M-14 leaves open.
//
// M-14 is "every packet ripples at its destination, the delivered cue is part of the arrival canon
// with no per-call opt-in". render/motion.test.mjs enforces it with `if (!b.ripples)`, so it asks
// whether a ring EXISTS and never how many there are. The rule is written as a floor and read as
// one, and the ceiling is nobody's.
//
// The ceiling matters because there are two ways to get a ring and they do not know about each
// other. `packetAlong` calls `arrivalRipple` UNCONDITIONALLY on every ball it launches
// (js/lib/scheme-kit.js), and the `F.ripple` verb calls the SAME function directly, for the case the
// verb was added for: a receiving BOX that gets a ring instead of a pulse, since only Pods pulse.
// Point an F.ripple at the last point of a route in its own step, at that route's own arrival, and
// two identical rings expand over each other from the same pixel at the same millisecond.
//
// THAT IS NOT INVISIBLE ON SCREEN, and it was measured in pixels before this file existed: the alpha
// of the doubled ring reads 0.902 against 0.631 for a single one, and the prediction from the
// measured single, 1 - (1 - 0.692)^2 = 0.905, matched to 0.003. Two rings compositing is what the
// number says, not a brighter one.
//
// It needs no browser. A ring's position is the last point of its path and its start is the entry's
// arrival, both arithmetic over the spec through ../fixtures/spec.mjs `timelineOf`.
//
// ===========================================================================================
// TWO TIERS, AND ONLY THE FIRST IS A DEFECT
// ===========================================================================================
//   SIMULTANEOUS   two or more rings at the SAME point with dt = 0. One ring drawn twice. There is
//                  no reading of the picture in which two rings on one point are correct, because the
//                  second ring adds no information: it is the first one, again.
//   STAGGERED      same point, dt above zero and under the 560ms a ring lives. They overlap in time
//                  and are legible as a sequence rather than as one mark, which is what a card
//                  showing three peers answering one address is FOR. Printed as context, not as a
//                  queue. On this catalog the tier is `network-loadbalancer-bare-metal` (three BGP
//                  speakers into one point, 180ms apart), `storage-access-modes` (three writers onto
//                  one volume, 200ms apart) and `network-traffic-distribution` (540ms apart).
//
// The whole F.ripple census is printed too, because the queue is currently ONE CARD WIDE: all four
// uses of the verb in the catalog are on `network-service-cidr` and all four are findings. A check
// whose population is four is a check that says almost nothing about a future card, and saying so is
// more useful than the count.
//
// ===========================================================================================
// WHY report/ AND NOT render/
// ===========================================================================================
// The cycle is written in ./arrival.test.mjs and this project has run it three times: report-only,
// then a human triage of the queue, then promotion into the mandatory set. Four findings on one card
// is small enough to promote, and that decision is still a person's: the repair is deleting four
// F.ripple entries, which changes a picture, and no queue in this harness promotes itself. Nothing
// here fails on a finding.
//
// WHAT DOES FAIL: the census, the shape of the carried table, and the one constant this file copies.
// A report that walked less than the catalog prints few findings and looks exactly like a clean
// catalog: a walk one step short drops that step silently and nothing in the output
// looks wrong, which is why the floor below is asserted rather than printed.
//
// ===========================================================================================
// WHAT THIS FILE IS BLIND TO
// ===========================================================================================
//   - THE REDUCED PATH, where there are no rings at all: `arrivalRipple` returns on `ctx.reduced`
//     before it builds anything. Everything below is about the animated path only.
//   - A RIPPLE FROM AN ESCAPE. `arrivalRipple` is exported for a card animating its packets by hand,
//     and `step.enter`, `step.motion` and `F.run` are function bodies. A ring drawn from one is not
//     in the population. Measured: no card imports `arrivalRipple` today, so the population is whole,
//     and the day one does this file undercounts silently.
//   - THE 560ms RING LIFE IS A COPY. `arrivalRipple` hard-codes it in its animate options and
//     exports nothing, so RIPPLE_MS below is a second copy of one number. The run asserts the
//     literal is still in the function rather than trusting the copy: two rings that no longer
//     overlap in time are not a finding, and a stale window would keep reporting them.
//   - GEOMETRY IS COMPUTED, NEVER MEASURED. Arrivals come from `timelineOf`, the same reader
//     unit/spec-steps.test.mjs times a step with. A paused or seeked frame cannot see a deferred
//     callback at all (M-35), so a frame would be a weaker witness here, not a stronger one.
//   - A RING PAIR AT TWO DIFFERENT POINTS. Only an exact point match counts as one place. A ring
//     grows from r 3.15 to r 27, so two rings a few units apart also overlap on screen: the NEAR
//     tier below reports those, and it is empty today, which is the only reason the exact reading
//     is enough.
//   - WHICH RING IS THE WANTED ONE. When a ball and an F.ripple coincide the file says two rings are
//     drawn, not which of the two entries should go. That is the reading of the card: the F.ripple
//     is redundant when a ball already lands there, and the ball is the one that carries meaning.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { cards, ROOT } from '../fixtures/catalog.mjs';
import { importAll, stepTotal } from '../fixtures/module.mjs';
import { timelineOf } from '../fixtures/spec.mjs';
import { routeDur, REVEAL_MS, BEAT } from '../../js/lib/scheme-kit.js';

// The recorded walk. Assertions, not notes: see the header.
// The walk baseline, DERIVED rather than typed: the catalog it walks and the specs it reads are
// what say how big a whole walk is (CATALOG_BASELINE in ../fixtures/catalog.mjs).
const EXPECTED_CARDS = (await cards()).length;
const EXPECTED_STEPS = await stepTotal();

// The kit constants the fixture's arrival arithmetic runs on.
const KIT = { routeDur, REVEAL_MS, BEAT };

// How long a ring lives, copied from arrivalRipple's animate options because nothing exports it.
// Two rings starting further apart than this never share the canvas. The copy is checked, see below.
// The walk, the window and the carried table live in ../fixtures/ripple-double.mjs, shared with
// the gate file that asserts the queue. See that file's header for why.
import { RIPPLE_MS, TOP_DEFAULT, RIPPLE_CARRIED, ringOf, at } from '../fixtures/ripple-double.mjs';

const catalogued = await cards();
const modules = await importAll();
const pad = (n) => String(n).padStart(4);

test('how many rings land on one arrival (report only, census is the assertion)', async (t) => {
  const simultaneous = [], staggered = [], near = [], ripples = [];
  const notes = [];
  let walked = 0, steps = 0, rings = 0, unresolved = 0;

  for (const c of catalogued) {
    const ns = modules.get(c.id);
    if (!ns || !Array.isArray(ns.STEPS_SPEC)) {
      notes.push(`${c.id}: exports no STEPS_SPEC array, so this card was never read`);
      continue;
    }
    walked++;

    for (const s of ns.STEPS_SPEC) {
      steps++;
      const rows = timelineOf(s.flow, KIT);
      if (rows === null) { unresolved++; continue; }   // unit/spec-steps.test.mjs owns that finding
      const here = [];
      for (const row of rows) {
        const ring = ringOf(row);
        if (!ring) continue;
        here.push(ring);
        rings++;
        if (ring.src === 'F.ripple') ripples.push({ card: c.id, step: s.id, ...ring });
      }

      // Group by exact point, then walk each group in time order and pair neighbours: three rings
      // 180ms apart are two overlapping pairs, which is what they look like.
      const byPoint = new Map();
      for (const r of here) {
        if (!byPoint.has(at(r.pt))) byPoint.set(at(r.pt), []);
        byPoint.get(at(r.pt)).push(r);
      }
      for (const [pt, list] of byPoint) {
        list.sort((a, b) => a.t - b.t);
        for (let i = 1; i < list.length; i++) {
          const dt = list[i].t - list[i - 1].t;
          if (dt >= RIPPLE_MS) continue;               // the first ring is gone before the second starts
          const rec = {
            card: c.id, step: s.id, pt, dt,
            first: list[i - 1], second: list[i],
            carryKey: `${c.id} ${s.id} ${pt}`,
          };
          rec.why = RIPPLE_CARRIED.get(rec.carryKey);
          (dt === 0 ? simultaneous : staggered).push(rec);
        }
      }

      // Two rings at points close enough that they still overlap on screen. Exact matches are
      // already counted above, so this tier is what the exact reading would MISS.
      for (let i = 0; i < here.length; i++) {
        for (let j = i + 1; j < here.length; j++) {
          const a = here[i], b = here[j];
          if (at(a.pt) === at(b.pt)) continue;
          const gap = Math.hypot(a.pt[0] - b.pt[0], a.pt[1] - b.pt[1]);
          if (gap > 12 || Math.abs(a.t - b.t) >= RIPPLE_MS) continue;
          near.push({ card: c.id, step: s.id, a, b, gap, dt: Math.abs(a.t - b.t) });
        }
      }
    }
  }

  const live = {
    rings, 'F.ripple': ripples.length,
    SIMULTANEOUS: simultaneous.length, STAGGERED: staggered.length, NEAR: near.length,
  };
  const held = simultaneous.filter(r => r.why), open = simultaneous.filter(r => !r.why);

  const out = [];
  out.push('');
  out.push('===== how many rings land on one arrival, REPORT ONLY =====');
  out.push(`  cards walked ${walked} of ${catalogued.length} in the catalog, steps read ${steps}`);
  out.push(`  rings drawn ${rings} (one per ball with no opt-in, plus one per F.ripple)` +
    (unresolved ? `, flows with an unresolvable after/at reference and therefore no arithmetic ${unresolved}` : ''));
  if (walked < EXPECTED_CARDS || steps < EXPECTED_STEPS) {
    out.push(`  REPORT INCOMPLETE: expected at least ${EXPECTED_CARDS} cards and ${EXPECTED_STEPS} steps, ` +
      'every number below undercounts');
  }

  out.push('');
  out.push('1. THE POPULATION, counted live on this walk');
  for (const k of Object.keys(live)) out.push(`   ${k.padEnd(13)} ${pad(live[k])}`);

  out.push('');
  out.push(`2. SIMULTANEOUS, THE QUEUE: ${simultaneous.length} place(s) where two rings start on the ` +
    `same pixel at the same millisecond, ${held.length} carried with a reason, ${open.length} left to work`);
  for (const r of open) {
    out.push(`   ${r.card} '${r.step}' at [${r.pt}]  ${r.first.src}@${r.first.t}ms + ${r.second.src}@${r.second.t}ms  dt=${r.dt}ms`);
  }
  for (const r of held) out.push(`   CARRIED  ${r.carryKey}\n      WHY ${r.why}`);
  const stale = [...RIPPLE_CARRIED.keys()].filter(k => !simultaneous.some(r => r.carryKey === k));
  if (stale.length) out.push(`   carried entries no longer reported (stale, remove them): ${stale.join(' | ')}`);

  out.push('');
  out.push(`3. STAGGERED, CONTEXT AND NOT A QUEUE: ${staggered.length} pair(s) share a point inside the ` +
    `${RIPPLE_MS}ms a ring lives, but start apart`);
  for (const r of staggered) {
    out.push(`   ${r.card} '${r.step}' at [${r.pt}]  ${r.first.src}@${r.first.t}ms then ${r.second.src}@${r.second.t}ms  dt=${r.dt}ms`);
  }
  out.push('   Several balls converging on one destination is a thing cards do on purpose, and a');
  out.push('   second ring opening while the first is still expanding reads as a second arrival.');

  out.push('');
  out.push(`4. NEAR, what the exact reading would miss: ${near.length} pair(s) within 12 units and ${RIPPLE_MS}ms`);
  for (const r of near) {
    out.push(`   ${r.card} '${r.step}' ${r.a.src}@${r.a.t} at [${at(r.a.pt)}] and ${r.b.src}@${r.b.t} at ` +
      `[${at(r.b.pt)}]  ${r.gap.toFixed(1)} units apart, dt=${r.dt}ms`);
  }
  out.push('   Empty is what makes the exact point match above sufficient. It is not empty by');
  out.push('   construction, so a card putting two destinations a few units apart would land here.');

  out.push('');
  out.push(`5. EVERY F.ripple IN THE CATALOG: ${ripples.length}, on ` +
    `${new Set(ripples.map(r => r.card)).size} card(s). This is how wide the check is today.`);
  for (const r of ripples) out.push(`   ${r.card} '${r.step}' rings at [${at(r.pt)}] at ${r.t}ms`);
  out.push('   The verb exists for a receiving BOX, which gets a ring where a Pod would get a pulse.');
  out.push('   Pointed at the end of a route in its own step it duplicates the ring packetAlong');
  out.push('   already drew there, since that call has no opt-in.');

  if (notes.length) {
    out.push('');
    out.push(`cards that could not be read: ${notes.length}`);
    for (const l of notes) out.push(`   ${l}`);
  }
  out.push('===== end of report =====');
  console.log(out.join('\n'));

  // -------------------------------------------------------------------------------------------
  // The assertions, and none of them is about a card. A finding here is a statement about a card
  // and its acceptance belongs to a person; a walk that covered less than the catalog is not a
  // measurement at all, and a window copied out of the kit that no longer matches the kit makes
  // every overlap number wrong in a way nothing else would notice.
  // -------------------------------------------------------------------------------------------
  const kitSrc = await readFile(join(ROOT, 'js', 'lib', 'scheme-kit.js'), 'utf8');
  const body = kitSrc.slice(kitSrc.indexOf('export function arrivalRipple'));
  assert.ok(body && new RegExp(`duration:\\s*${RIPPLE_MS}\\b`).test(body.slice(0, 900)),
    `arrivalRipple no longer animates over ${RIPPLE_MS}ms, so RIPPLE_MS here is a stale copy and ` +
    'every overlap window above was measured against a life the ring does not have.');
  assert.ok(walked >= EXPECTED_CARDS,
    `walked ${walked} card(s), the catalog had ${EXPECTED_CARDS} when this report was written. ` +
    'A report over a subset prints few findings and looks exactly like a clean catalog.');
  assert.ok(steps >= EXPECTED_STEPS,
    `read ${steps} step(s), expected at least ${EXPECTED_STEPS}. A step nobody read is a step whose ` +
    'rings were never counted, and this file would still print a number.');
  assert.ok(rings > 0,
    'not one ring was located, so every tier above measured an empty set. Either the flow reader ' +
    'has gone blind or no step in the catalog carries a ball.');
  for (const [key, why] of RIPPLE_CARRIED) {
    assert.ok(typeof why === 'string' && why.trim().length > 20,
      `RIPPLE_CARRIED['${key}'] carries no reason. A carried finding is a decision somebody measured, ` +
      'and without the reason it is only a shorter queue.');
    assert.equal(key.split(' ').length, 3,
      `RIPPLE_CARRIED key '${key}' is not '<card id> <step id> <x>,<y>', so it can never match a finding`);
  }

  t.diagnostic(`rings: ${walked} cards, ${rings} rings, ${ripples.length} F.ripple, ` +
    `simultaneous ${simultaneous.length} (${open.length} unread), staggered ${staggered.length}, near ${near.length}`);
});
