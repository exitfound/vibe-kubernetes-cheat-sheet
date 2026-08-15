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
import { importAll } from '../fixtures/module.mjs';
import { walkParts } from '../fixtures/spec.mjs';

// The recorded walk. Assertions, not notes: see the header.
const EXPECTED_CARDS = 108;
const EXPECTED_STEPS = 650;

// Every part kind that puts a LINE on the canvas. `wire` is a text label and `chain` is a listing,
// so neither is here.
const DRAWN_KINDS = new Set(['lane', 'arrow', 'relation']);

// The reference set A-02 is measured against, and it is NARROWER than DRAWN_KINDS on purpose: the
// rule is about the lane a route rides, and a route equal to an `arrow` instead is its own tier so
// the two cannot be added up by accident.
const LANE_KIND = 'lane';

// Half a unit. Coordinates in this catalog are integers or exact thirds (`464.6666666666667`), and
// nothing is meant to be near-collinear, so the tolerance only has to survive float arithmetic.
const EPS = 0.5;

// What the walk measured the day this file was written. Printed beside the live numbers, never
// asserted: a card repaired in phase F is SUPPOSED to move them, and an assertion here would make a
// repair look like a regression.
const RECORDED = {
  'A-02 SHARED': 347,
  'A-02 COPIED': 56,
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
const A05_CARRIED = new Map([
  ['network-ebpf-dataplane [[660,312],[790,312],[790,442],[920,442]]',
    'TO_PODY, the ALTERNATIVE backend of the map lookup. network/CARDS.md under this card: "TO_PODY ' +
    'carries no ball. It is the ALTERNATIVE backend, drawn so the reader can see the map lookup ' +
    'picked one of two, and the card says so in words. N destinations, N wires." NET.A-03.'],
  ['network-headless-service [[290,485],[355,485],[355,520],[820,520],[820,472],[880,472]]',
    'TO_W2, the third leg of the data fan. network/CARDS.md: "TO_W2 in the data fan rides nothing. ' +
    'N destinations get N wires so the reader can see the client picked one of three." NET.A-03, ' +
    'and the record two cards down names this one as the precedent for the nodeport fan.'],
  ['network-nodeport-loadbalancer [[600,230],[600,320]]',
    'TO_N2. network/CARDS.md: "TO_N2 and TO_N3 carry no ball on a given step. A NodePort opens the ' +
    'SAME port on EVERY Node, which is the card whole first claim, so all three lanes have to exist ' +
    'for the reader to see that any Node would have served the request." NET.A-03.'],
  ['network-nodeport-loadbalancer [[600,230],[600,286],[970,286],[970,320]]',
    'TO_N3, the other half of the same pair and the same record entry. Which of the three legs a ' +
    'step takes is the arbitrary part, and drawing only the taken one would make the arbitrary look ' +
    'like the only. NET.A-03.'],
  ['network-traffic-distribution [[630,320],[700,320],[700,236],[820,236]]',
    'FAN_A2. network/CARDS.md: "FAN_A2 carries no ball on its step. It is the endpoint the traffic ' +
    'distribution did NOT pick, and the point of the card is that the choice was made among the ' +
    'drawn candidates rather than forced." NET.A-03.'],
  ['network-model [[990,172],[990,280]]',
    'CNI_CONNECTOR, and this one is NOT a fan leg. network/CARDS.md: "CNI_CONNECTOR IS animated, ' +
    'with the repeating MARCH dash offset rather than a ball: this card vocabulary for this is what ' +
    'implements the model. No packet rides it because nothing DISCRETE travels, the plugin is not ' +
    'sending a message, it is the thing that makes the flat space exist." An F.anim on the dash ' +
    'offset is motion this file does not read as traffic, and should not.'],
  ['storage-reclaim-policy [[712,336],[712,390]]',
    'W_RET_WIPE, and the card says so at the declaration: "drawn, never travelled: that is Retain". ' +
    'The whole subject of the card is that the Retain column HAS the lane the Delete column uses and ' +
    'never sends anything down it, so removing the arrowhead would remove the comparison.'],
  ['storage-volume-detach-on-node-loss [[578,282],[578,260],[496,260],[496,208]]',
    'W_ATTACH_A, and the record answers this exact question with a NO: "W_ATTACH_A is reported as a ' +
    'lane nobody rides, and converting it to a relationPath is DECLINED: sinking one half of a ' +
    'deliberately symmetric pair makes the left lane the lesser arrow, which is the thing this card ' +
    'goes out of its way not to do." The card says which half is live through OPACITY instead.'],
]);

const catalogued = await cards();
const modules = await importAll();

const pad = (n) => String(n).padStart(4);
const key = (pts) => JSON.stringify(pts);
const cardsOf = (rows) => new Set(rows.map(r => r.card)).size;

// ---- geometry, and it is all of it ----------------------------------------------------------
const segsOf = (pts) => { const o = []; for (let i = 1; i < pts.length; i++) o.push([pts[i - 1], pts[i]]); return o; };
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);

// Is `seg` covered end to end by the UNION of the pool segments collinear with it. Everything is
// projected onto seg's own parameter, clipped to [0,1] and merged, so ink from three different parts
// covers a leg that no single one of them does: see the header for why the union is not optional.
function covered(seg, pool) {
  const [a, b] = seg;
  const L = dist(a, b);
  if (L === 0) return true;
  const tol = EPS / L;
  const spans = [];
  for (const [c, d] of pool) {
    if (Math.abs(cross(a, b, c)) / L > EPS || Math.abs(cross(a, b, d)) / L > EPS) continue;
    const at = (p) => ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / (L * L);
    let [t0, t1] = [at(c), at(d)];
    if (t0 > t1) [t0, t1] = [t1, t0];
    t0 = Math.max(0, t0);
    t1 = Math.min(1, t1);
    if (t1 > t0) spans.push([t0, t1]);
  }
  spans.sort((x, y) => x[0] - y[0]);
  let reach = 0;
  for (const [t0, t1] of spans) {
    if (t0 > reach + tol) break;
    if (t1 > reach) reach = t1;
  }
  return reach >= 1 - tol;
}

// A `d` string of absolute M/L commands, which is every `d` in the catalog (5 relation parts carry
// one). Anything else returns nothing rather than half a path, so an arc would go unread and loud
// rather than unread and quiet.
function parseD(d) {
  if (typeof d !== 'string' || /[^ML\d\s.,-]/.test(d)) return [];
  const runs = [];
  let cur = null;
  for (const m of d.matchAll(/([ML])\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/g)) {
    const pt = [Number(m[2]), Number(m[3])];
    if (m[1] === 'M') { cur = [pt]; runs.push(cur); } else if (cur) cur.push(pt);
  }
  return runs.filter(r => r.length > 1);
}

// The point runs one part draws, as arrays. A part draws more than one when its `d` carries several
// M commands, which is how a spine plus its taps is one element.
function runsOf(part) {
  const p = part.p || {};
  if (Array.isArray(p.points)) return [p.points];
  if (p.from && p.to) return [[p.from, p.to]];
  if (p.x1 !== undefined) return [[[p.x1, p.y1], [p.x2, p.y2]]];
  if (p.d !== undefined) return parseD(p.d);
  return [];
}

// Everything one card draws and everything one card sends down a wire, in one pass.
function readCard(ns) {
  const lanes = [];        // the A-02 reference set and the A-05 population
  const drawn = [];        // every run of every drawn kind, for the geometry tier
  const runs = [];         // the same runs unbroken, for the whole-path comparisons
  let raws = 0, tunes = 0, unreadableD = 0;
  walkParts(ns.SCENE.parts, (part, at) => {
    if (!part) return;
    const { kind, p = {} } = part;
    if (kind === 'raw') raws++;
    if (typeof p.tune === 'function') tunes++;
    if (!DRAWN_KINDS.has(kind)) return;
    const mine = runsOf(part);
    if (!mine.length) { unreadableD++; return; }
    for (const pts of mine) {
      drawn.push(...segsOf(pts));
      runs.push({ kind, pts });
      if (kind === LANE_KIND) lanes.push({ pts, name: part.key || at });
    }
  });
  const routes = [], segments = [];
  for (const s of ns.STEPS_SPEC || []) {
    for (const e of s.flow || []) {
      if (e.verb === 'route' && Array.isArray(e.p.points)) routes.push({ step: s.id, pts: e.p.points });
      // `from` and `to` are the two point objects the entry was handed, kept as such: a segment
      // sharing them with an arrow part is the segment form of SHARED, and building a fresh
      // [from, to] array first would destroy the only identity there is to compare.
      else if (e.verb === 'segment' && e.p.from && e.p.to) segments.push({ step: s.id, pts: [e.p.from, e.p.to], ends: [e.p.from, e.p.to] });
    }
  }
  return { lanes, drawn, runs, routes, segments, raws, tunes, unreadableD };
}

// Which of the six tiers one ROUTE falls in, against one card. Ordered, and the first match wins,
// so the tiers are mutually exclusive and can be summed.
function tierOf(pts, { lanes, drawn, runs }) {
  if (lanes.some(l => l.pts === pts)) return 'SHARED';
  if (lanes.some(l => key(l.pts) === key(pts))) return 'COPIED';
  if (runs.some(r => r.kind !== LANE_KIND && key(r.pts) === key(pts))) return 'OTHER-PART';
  return geometryTier(pts, drawn);
}

// The same tiers for an F.segment, and the top two have to be asked differently: the entry carries
// two POINT objects rather than one array, so identity lives on the endpoints. It is also asked
// against every drawn kind rather than against lanes alone, because a two-point hop is drawn by an
// `arrow` far more often than by a `lane`.
function segTierOf(ends, { drawn, runs }) {
  const pts = [ends[0], ends[1]];
  if (runs.some(r => r.pts.length === 2 && r.pts[0] === ends[0] && r.pts[1] === ends[1])) return 'SHARED';
  if (runs.some(r => key(r.pts) === key(pts))) return 'COPIED';
  return geometryTier(pts, drawn);
}

function geometryTier(pts, drawn) {
  const segs = segsOf(pts);
  const on = segs.filter(sg => covered(sg, drawn)).length;
  if (on === segs.length) return 'ASSEMBLED';
  return on ? 'PARTIAL' : 'UNDRAWN';
}

const TIERS = ['SHARED', 'COPIED', 'OTHER-PART', 'ASSEMBLED', 'PARTIAL', 'UNDRAWN'];

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
