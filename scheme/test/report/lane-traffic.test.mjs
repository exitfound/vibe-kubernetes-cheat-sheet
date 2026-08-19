// lane-traffic.test.mjs: the two halves of "a ball and the wire under it", read off the DATA.
// A-02 asks whether the points that MOVE a packet are the same points that DRAW the wire, and A-05
// asks the mirror question, whether a drawn wire has anything moving over it. Nothing in the harness
// has ever asked either: both rows read `review` in CANON.md, and the pair between them covers every
// lane and every route in the catalog, which is why they share one walk and one geometry reader.
//
// It needs no browser. A lane's points and a route's points are both fields on the spec.
//
// ===========================================================================================
// A-02 IS THREE DIFFERENT DISEASES AND THEY MUST NOT BE ADDED UP
// ===========================================================================================
// The rule is "the SAME points array feeds the static wire and the packet route, so the two cannot
// drift". Three ways a route can stand to the lanes of its own card, in falling order of trust:
//
//   SHARED     the route's `points` IS the lane's array, one object. The rule satisfied literally:
//              moving the lane moves the ball, because there is one number to move.
//   COPIED     deep-equal to a lane's points, and a DIFFERENT array. This is the drift the rule
//              exists to stop, and it is invisible until the day somebody edits one of the two
//              copies. It is not a picture defect today and it is not one tomorrow either: it is a
//              defect the FIRST time the geometry is touched, which is why it is a queue and not a
//              finding list.
//   NO LANE    equal to no lane on the card at all. This one is NOT a single condition, and reading
//              it as one is the mistake this file is written to avoid: most of the population is a
//              route ASSEMBLED out of several drawn legs (a spine plus a tap), which rides drawn
//              wires perfectly well and simply cannot be one array. The triage below splits it.
//
// The NO LANE tier is triaged by GEOMETRY, segment by segment, against every drawn path on the card:
//
//   OTHER-PART  the whole route is deep-equal to an `arrow` or a `relation` part rather than a
//               `lane`. Same disease as COPIED, one drawn kind over.
//   ASSEMBLED   every segment of the route lies on some drawn segment, but no single part matches.
//               The composite route. A-01 is satisfied and A-02 cannot be, in this form.
//   PARTIAL     some segments lie on drawn geometry and some do not.
//   UNDRAWN     no segment does. This is A-01 territory, "no ball travels over blank canvas", and
//               it is the sharpest thing this file can say. Read it against the `raw` count printed
//               beside it before believing it: see the blind spots.
//
// ===========================================================================================
// A-05 NEEDS TRIAGE AND NOT A VERDICT, FOR TWO SEPARATE REASONS
// ===========================================================================================
// 1. A PASS-THROUGH IS NOT AN UNRIDDEN LANE. Many short taps (22 units, a block edge down to the
//    row below it) have a LONGER route running straight through them, and an exact comparison sees
//    nothing on them. So the walk does the geometry: a lane every one of whose segments lies under
//    some ball path is reported as TRAVERSED and kept out of the queue. On this catalog that is 17
//    of the 26 lanes an exact reading calls unridden, so an exact-only report would have been two
//    thirds noise.
// 2. AN UNRIDDEN FAN LEG IS LEGAL AND SAID SO IN WRITING. `NET.A-03`: "N destinations get N wires.
//    A fan to three candidate backends draws all three even though a step takes one, so the reader
//    sees the choice was made among drawn alternatives. Those unridden legs are NOT a defect and
//    several card records say so." Those records are the reason A05_CARRIED starts with entries in
//    it, which no other queue in this harness does: the decision was taken and written down before
//    the check existed, so importing it is reading the record, not quieting the queue.
//
// A-05's own words are about an ARROWHEAD, not about a lane: "a wire nothing rides carries no
// arrowhead, use relationPath". So a finding here is a question, "should this be a relation", and
// the answer is a reading of the card. `storage-volume-detach-on-node-loss` answers it NO in its
// record, with a reason about symmetry, and that is a legitimate answer.
//
// ===========================================================================================
// WHY report/ AND NOT render/ OR unit/
// ===========================================================================================
// The cycle is written in ./arrival.test.mjs and this project has run it three times: report-only,
// then a human triage of the queue, then promotion into the mandatory set. A-02's COPIED tier alone
// is 56 routes, none of which is a defect on screen today, so promoted straight into the gate it
// would redden a working catalog against work nobody has scheduled. Nothing here fails on a finding.
//
// WHAT DOES FAIL: the census, and the shape of the carried table. A report that walked less than the
// catalog prints few findings and looks exactly like a clean catalog, which is the lesson of stage
// 2.4c, where the first run of a report test counted 649 steps of 650 and nothing in the output
// looked wrong. Fewer than 108 cards or 650 steps is an assertion failure, not a note.
//
// ===========================================================================================
// WHAT THIS FILE IS BLIND TO
// ===========================================================================================
//   - A PATH DRAWN BY AN ESCAPE. `part.raw` builds an element from a function body (43 sites) and
//     `part.tune` can rewrite a `d` attribute on one the layer already made (33 sites). Neither is
//     data. `network-model` draws its whole flat-network bus inside a raw hook, in BAND-LOCAL
//     coordinates under a translate, and its three bus routes therefore land in UNDRAWN here while
//     riding a drawn rail on screen. Every UNDRAWN and PARTIAL line carries its card's raw count for
//     exactly this reason, and a card with a raw part is a card whose UNDRAWN findings are suspect.
//   - A GROUP TRANSFORM. Coordinates are compared as written. Measured on this catalog: 3 group
//     parts carry a transform, one of them `translate(0, 0)`, and the other two hold `raw` parts
//     only, so nothing is misread today. A card that put a lane inside a translated group would be
//     misread, and there is no finding for it because there is nothing wrong with doing it.
//   - COVERAGE IS INK, NOT IDENTITY. A leg is covered when the UNION of the collinear drawn legs
//     under it spans it end to end, so a route running down a spine and then out along a tap is
//     ASSEMBLED even though three different parts drew what it rides. That union is not optional:
//     reading one drawn segment at a time called four routes UNDRAWN that run down a spine straight
//     into a tap, on `workloads-pod-qos-classes` and `workloads-statefulset-ordered-startup`, which
//     is a loud false finding in the tier that matters most.
//   - OPACITY, AND THEREFORE WHETHER THE WIRE IS ON SCREEN AT ALL. A lane pinned at opacity 0 for
//     every step counts as drawn here, and a ball riding a lane on a step where that lane is hidden
//     counts as riding a drawn wire. That is A-14 and A-15, and they have their own checks.
//   - WHICH STEP. A lane ridden on ONE step of eight is ridden, full stop. The reader that wants
//     "this lane is dead on this step" is looking at a different rule.
//   - `top` PACKETS. topPacket draws its own two-point path across the top strip and there is no
//     part under it by construction, so counting them would be 100 percent false findings.
//   - `F.anim` AND `F.tag`. A ball moved by hand through anim, and a label riding one, are not the
//     route/segment verbs this file reads.
//   - WHETHER THE LANE AND THE BALL AGREE ABOUT DIRECTION. Points are compared as a set of segments
//     in order, and a route running a lane BACKWARDS reads as riding it. A-03 is that rule.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { importAll, stepTotal } from '../fixtures/module.mjs';
import { walkParts } from '../fixtures/spec.mjs';

// The recorded walk. Assertions, not notes: see the header.

// Every part kind that puts a LINE on the canvas. `wire` is a text label and `chain` is a listing,
// so neither is here.

// The reference set A-02 is measured against, and it is NARROWER than DRAWN_KINDS on purpose: the
// rule is about the lane a route rides, and a route equal to an `arrow` instead is its own tier so
// the two cannot be added up by accident.

// Half a unit. Coordinates in this catalog are integers or exact thirds (`464.6666666666667`), and
// nothing is meant to be near-collinear, so the tolerance only has to survive float arithmetic.

// What the walk measured the day this file was written. Printed beside the live numbers, never
// asserted: a card repaired in phase F is SUPPOSED to move them, and an assertion here would make a
// repair look like a regression.
const RECORDED = {
  'A-02 SHARED': 405,
  'A-02 COPIED': 0,
  'A-02 NO LANE': 34,
  'A-05 no exact rider': 26,
  'A-05 TRAVERSED': 17,
  'A-05 DEAD': 9,
};

// -------------------------------------------------------------------------------------------
// A-05 findings a human has READ and decided to carry, keyed `<card id> <points as JSON>`, with the
// reason on each. Same shape and same discipline as R2_STEP_CARRIED in ./arrival.test.mjs: an entry
// here is a decision with a measurement behind it, never a way to quiet the queue, and an entry that
// stops being reported is a stale carry the run names below.
//
// This table does NOT start empty, and it is the only one in the harness that does not. Every entry
// below was written into a card record BEFORE this check existed, under a `NOT A DEFECT` heading,
// and the citation on each is where to go and read it. Importing a decision somebody already took
// and wrote down is the opposite of shortening a queue.
// -------------------------------------------------------------------------------------------
// The carried rulings are DATA and live beside the walk, so the gate and this report treat one
// table. See ../fixtures/lane-traffic.mjs.


const catalogued = await cards();
const modules = await importAll();

const pad = (n) => String(n).padStart(4);
const cardsOf = (rows) => new Set(rows.map(r => r.card)).size;

// The walk itself now lives in ../fixtures/lane-traffic.mjs, shared with the gate file that
// asserts the two tiers whose queues are empty. See that file's header for why.
import { A05_CARRIED, readCard, tierOf, segTierOf, key, segsOf, covered, TIERS, DRAWN_KINDS, LANE_KIND, EPS } from '../fixtures/lane-traffic.mjs';
// The walk baseline, DERIVED rather than typed: the catalog it walks and the specs it reads are
// what say how big a whole walk is (CATALOG_BASELINE in ../fixtures/catalog.mjs).
const EXPECTED_CARDS = (await cards()).length;
const EXPECTED_STEPS = await stepTotal();

test('A-02, a ball rides the array that drew its wire (report only, census is the assertion)', (t) => {
  const routeTier = new Map(TIERS.map(k => [k, []]));
  const segTier = new Map(TIERS.map(k => [k, []]));
  const notes = [];
  let walked = 0, steps = 0, escapeCards = 0, unreadableD = 0;

  for (const c of catalogued) {
    const ns = modules.get(c.id);
    if (!ns || !Array.isArray(ns.STEPS_SPEC) || !ns.SCENE) {
      notes.push(`${c.id}: exports no SCENE and STEPS_SPEC pair, so this card was never read`);
      continue;
    }
    walked++;
    steps += ns.STEPS_SPEC.length;
    const card = readCard(ns);
    unreadableD += card.unreadableD;
    if (card.raws || card.tunes) escapeCards++;
    for (const r of card.routes) {
      routeTier.get(tierOf(r.pts, card)).push({ card: c.id, step: r.step, pts: r.pts, raws: card.raws, tunes: card.tunes });
    }
    for (const r of card.segments) {
      segTier.get(segTierOf(r.ends, card)).push({ card: c.id, step: r.step, pts: r.pts, raws: card.raws, tunes: card.tunes });
    }
  }

  const routes = TIERS.flatMap(k => routeTier.get(k));
  const noLane = ['OTHER-PART', 'ASSEMBLED', 'PARTIAL', 'UNDRAWN'].reduce((n, k) => n + routeTier.get(k).length, 0);

  const out = [];
  out.push('');
  out.push('===== A-02, the ball and the array under it, REPORT ONLY =====');
  out.push(`  cards walked ${walked} of ${catalogued.length} in the catalog, steps read ${steps}`);
  out.push(`  routes ${routes.length}, segments ${TIERS.reduce((n, k) => n + segTier.get(k).length, 0)}, ` +
    `cards carrying a raw or tune escape ${escapeCards}, drawn parts whose \`d\` this reader cannot parse ${unreadableD}`);
  if (walked < EXPECTED_CARDS || steps < EXPECTED_STEPS) {
    out.push(`  REPORT INCOMPLETE: expected at least ${EXPECTED_CARDS} cards and ${EXPECTED_STEPS} steps, ` +
      'every number below undercounts');
  }

  out.push('');
  out.push('1. THE THREE LEVELS THE RULE IS ABOUT, over F.route, live against what was recorded');
  const live = { 'A-02 SHARED': routeTier.get('SHARED').length, 'A-02 COPIED': routeTier.get('COPIED').length, 'A-02 NO LANE': noLane };
  for (const k of Object.keys(live)) {
    out.push(`   ${k.padEnd(14)} ${pad(live[k])}${live[k] === RECORDED[k] ? '' : `   (recorded ${RECORDED[k]})`}`);
  }
  out.push('   SHARED is the rule satisfied literally and is counted only. COPIED is the queue: two');
  out.push('   independent copies of one set of numbers, which come apart on the first geometry edit.');

  out.push('');
  out.push(`2. COPIED, THE QUEUE: ${routeTier.get('COPIED').length} route(s) on ` +
    `${cardsOf(routeTier.get('COPIED'))} card(s) ride an array EQUAL to a lane and not the lane's own`);
  const byCard = new Map();
  for (const r of routeTier.get('COPIED')) {
    if (!byCard.has(r.card)) byCard.set(r.card, []);
    byCard.get(r.card).push(r);
  }
  for (const [id, rows] of [...byCard.entries()].sort((a, b) => b[1].length - a[1].length)) {
    out.push(`   ${pad(rows.length)}  ${id}  steps: ${[...new Set(rows.map(r => r.step))].join(', ')}`);
  }

  out.push('');
  out.push(`3. NO LANE AT ALL: ${noLane}, and it is FOUR conditions, not one`);
  for (const k of ['OTHER-PART', 'ASSEMBLED', 'PARTIAL', 'UNDRAWN']) {
    out.push(`   ${k.padEnd(11)} ${pad(routeTier.get(k).length)}`);
  }
  out.push('   ASSEMBLED is a composite route over several drawn legs and cannot BE one array, so it');
  out.push('   is outside what A-02 can ask for. OTHER-PART is COPIED against an arrow or a relation.');
  for (const r of routeTier.get('OTHER-PART')) {
    out.push(`   OTHER-PART  ${r.card} '${r.step}' equals an arrow or relation part, not a lane: ${key(r.pts)}`);
  }
  for (const r of [...routeTier.get('PARTIAL'), ...routeTier.get('UNDRAWN')]) {
    const tier = routeTier.get('UNDRAWN').includes(r) ? 'UNDRAWN   ' : 'PARTIAL   ';
    out.push(`   ${tier}  ${r.card} '${r.step}' ${key(r.pts)}` +
      (r.raws || r.tunes ? `   [card carries ${r.raws} raw and ${r.tunes} tune escape(s): a drawn path may exist that this reader cannot see]` : ''));
  }

  out.push('');
  out.push('4. THE SAME QUESTION OVER F.segment, which is beyond what the rule was ever measured on');
  for (const k of TIERS) {
    const n = segTier.get(k).length;
    if (n) out.push(`   ${k.padEnd(11)} ${pad(n)}`);
  }
  out.push('   A segment is two points and an `arrow` part is two points, so SHARED here means the');
  out.push('   entry passed the part\'s own `from` and `to` objects, and it is asked against every');
  out.push('   drawn kind rather than against lanes alone: a two-point hop is usually an `arrow`.');
  for (const r of [...segTier.get('PARTIAL'), ...segTier.get('UNDRAWN')]) {
    out.push(`   off any drawn path  ${r.card} '${r.step}' ${key(r.pts)}` +
      (r.raws || r.tunes ? `   [${r.raws} raw, ${r.tunes} tune on this card]` : ''));
  }

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
  // measurement at all.
  // -------------------------------------------------------------------------------------------
  assert.ok(walked >= EXPECTED_CARDS,
    `walked ${walked} card(s), the catalog had ${EXPECTED_CARDS} when this report was written. ` +
    'A report over a subset prints few findings and looks exactly like a clean catalog.');
  assert.ok(steps >= EXPECTED_STEPS,
    `read ${steps} step(s), expected at least ${EXPECTED_STEPS}. A step nobody read is a step whose ` +
    'routes were never compared against anything, and this file would still print a number.');
  assert.ok(routes.length > 0 && routeTier.get('SHARED').length > 0,
    `${routes.length} route(s) collected, ${routeTier.get('SHARED').length} of them SHARED. Zero of ` +
    'either means the flow reader or the part reader has gone blind, not that the catalog is clean.');

  t.diagnostic(`A-02: ${walked} cards, ${routes.length} routes, SHARED ${routeTier.get('SHARED').length}, ` +
    `COPIED ${routeTier.get('COPIED').length}, no lane ${noLane} ` +
    `(other-part ${routeTier.get('OTHER-PART').length}, assembled ${routeTier.get('ASSEMBLED').length}, ` +
    `partial ${routeTier.get('PARTIAL').length}, undrawn ${routeTier.get('UNDRAWN').length})`);
});

test('A-05, a drawn lane nothing rides (report only, census is the assertion)', (t) => {
  const traversed = [], dead = [];
  const notes = [];
  let walked = 0, steps = 0, lanesSeen = 0, ridden = 0;

  for (const c of catalogued) {
    const ns = modules.get(c.id);
    if (!ns || !Array.isArray(ns.STEPS_SPEC) || !ns.SCENE) {
      notes.push(`${c.id}: exports no SCENE and STEPS_SPEC pair, so this card was never read`);
      continue;
    }
    walked++;
    steps += ns.STEPS_SPEC.length;
    const card = readCard(ns);
    const paths = [...card.routes, ...card.segments];
    const ident = new Set(paths.map(p => p.pts));
    const equal = new Set(paths.map(p => key(p.pts)));
    const ballSegs = paths.flatMap(p => segsOf(p.pts));

    for (const l of card.lanes) {
      lanesSeen++;
      if (ident.has(l.pts) || equal.has(key(l.pts))) { ridden++; continue; }
      const segs = segsOf(l.pts);
      const on = segs.filter(sg => covered(sg, ballSegs)).length;
      const rec = {
        card: c.id, name: l.name, pts: l.pts, on, of: segs.length,
        raws: card.raws, tunes: card.tunes,
        carryKey: `${c.id} ${key(l.pts)}`,
      };
      rec.why = A05_CARRIED.get(rec.carryKey);
      (on === segs.length ? traversed : dead).push(rec);
    }
  }

  const held = dead.filter(r => r.why), open = dead.filter(r => !r.why);

  const out = [];
  out.push('');
  out.push('===== A-05, a lane nothing rides, REPORT ONLY =====');
  out.push(`  cards walked ${walked} of ${catalogued.length} in the catalog, steps read ${steps}`);
  out.push(`  lane parts ${lanesSeen}, of which ${ridden} carry a route or a segment with the same points`);
  if (walked < EXPECTED_CARDS || steps < EXPECTED_STEPS) {
    out.push(`  REPORT INCOMPLETE: expected at least ${EXPECTED_CARDS} cards and ${EXPECTED_STEPS} steps, ` +
      'every number below undercounts');
  }

  const exact = traversed.length + dead.length;
  out.push('');
  out.push(`1. THE UPPER BOUND, AND WHY IT IS NOT THE ANSWER: ${exact} lane(s) on ` +
    `${cardsOf([...traversed, ...dead])} card(s) carry no ball path with their own points` +
    (exact === RECORDED['A-05 no exact rider'] ? '' : `   (recorded ${RECORDED['A-05 no exact rider']})`));
  out.push(`   of those, ${traversed.length} are TRAVERSED` +
    (traversed.length === RECORDED['A-05 TRAVERSED'] ? '' : ` (recorded ${RECORDED['A-05 TRAVERSED']})`) +
    ': every segment of the lane lies under a');
  out.push('   LONGER ball path that runs straight through it, which an exact comparison cannot see.');
  out.push('   Most are 22 unit taps from a block edge down to the row below. Not findings.');
  for (const r of traversed) out.push(`   TRAVERSED  ${r.card} lane ${r.name}  ${key(r.pts)}`);

  out.push('');
  out.push(`2. THE QUEUE: ${dead.length} lane(s)` +
    (dead.length === RECORDED['A-05 DEAD'] ? '' : ` (recorded ${RECORDED['A-05 DEAD']})`) +
    ` on ${cardsOf(dead)} card(s) have nothing running over them, ` +
    `${held.length} carried with a reason, ${open.length} left to work`);
  for (const r of open) {
    out.push(`   ${r.card} lane ${r.name}  ${key(r.pts)}` +
      (r.on ? `   (${r.on} of ${r.of} segments do carry something)` : '') +
      (r.raws || r.tunes ? `   [${r.raws} raw, ${r.tunes} tune on this card]` : ''));
  }
  for (const r of held) out.push(`   CARRIED  ${r.carryKey}\n      WHY ${r.why}`);
  const stale = [...A05_CARRIED.keys()].filter(k => ![...traversed, ...dead].some(r => r.carryKey === k));
  if (stale.length) out.push(`   carried entries no longer reported (stale, remove them): ${stale.join(' | ')}`);
  out.push('   A-05 is about the ARROWHEAD: the repair it names is relationPath, not deleting the line.');
  out.push('   NET.A-03 says a fan leg nothing rides is correct, so most of the carried table is that.');

  if (notes.length) {
    out.push('');
    out.push(`cards that could not be read: ${notes.length}`);
    for (const l of notes) out.push(`   ${l}`);
  }
  out.push('===== end of report =====');
  console.log(out.join('\n'));

  assert.ok(walked >= EXPECTED_CARDS,
    `walked ${walked} card(s), the catalog had ${EXPECTED_CARDS} when this report was written. ` +
    'A report over a subset prints few findings and looks exactly like a clean catalog.');
  assert.ok(steps >= EXPECTED_STEPS,
    `read ${steps} step(s), expected at least ${EXPECTED_STEPS}. A step nobody read is a step whose ` +
    'balls were never counted against a lane, and this file would still print a number.');
  assert.ok(lanesSeen > 0 && ridden > 0,
    `${lanesSeen} lane part(s) seen, ${ridden} ridden. Zero of either means the part reader or the ` +
    'flow reader has gone blind, and every lane in the catalog would then report as dead.');
  const ids = new Set(catalogued.map(c => c.id));
  for (const [k, why] of A05_CARRIED) {
    assert.ok(typeof why === 'string' && why.trim().length > 20,
      `A05_CARRIED['${k}'] carries no reason. A carried finding is a decision somebody measured, ` +
      'and without the reason it is only a shorter queue.');
    const id = k.slice(0, k.indexOf(' '));
    assert.ok(ids.has(id), `A05_CARRIED key '${k}' does not open with a catalogued card id`);
    assert.doesNotThrow(() => JSON.parse(k.slice(k.indexOf(' ') + 1)),
      `A05_CARRIED key '${k}' is not '<card id> <points as JSON>', so it can never match a finding`);
  }

  t.diagnostic(`A-05: ${walked} cards, ${lanesSeen} lanes, ${exact} with no exact rider, ` +
    `${traversed.length} traversed, ${dead.length} dead (${held.length} carried, ${open.length} unread)`);
});
