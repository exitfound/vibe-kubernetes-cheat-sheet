// lane-shared.test.mjs: the two halves of the lane rules whose queues reached zero, promoted out of
// ../report/lane-traffic.test.mjs on 2026-08-17.
//
// The cycle this project runs, written in ../report/arrival.test.mjs and now run five times:
// report-only, then a human triage of the queue, then promotion. Both queues below were triaged card
// by card and are empty, so a NEW one goes red here instead of waiting for somebody to read a report.
//
//   A02-SHARED  (A-02)  a ball rides the array that DREW its wire, not an equal copy of it. 56 routes
//                       on 6 cards were copies until they were shared; the queue is 0.
//   A05-CARRIED (A-05)  a drawn lane with a marker and no rider claims traffic that does not exist.
//                       9 such lanes remain and every one carries a written ruling; the queue is 0.
//
// ===========================================================================================
// WHY THIS IS SAFE TO ASSERT AND THE REST OF THAT FILE IS NOT
// ===========================================================================================
// The report prints six A-02 tiers and only ONE of them was ever a defect. SHARED is the rule
// satisfied literally. ASSEMBLED (27) is a composite route over several drawn legs and cannot BE one
// array, so it is outside what the rule can ask for. OTHER-PART (4) equals an arrow or a relation
// rather than a lane. UNDRAWN (3) is on a card whose geometry is built inside a `part.raw`, which a
// reader of parts-as-data cannot see, and the report prints that escape count beside each one so a
// person can weigh it. Asserting any of those would redden the gate against cards that are right.
//
// The same applies to the F.segment tier the report also prints: a segment is two points and so is an
// `arrow`, so the question is a different one and the file says so out loud.
//
// ===========================================================================================
// WHAT THIS FILE IS BLIND TO
// ===========================================================================================
//   - A LANE OR A ROUTE BUILT INSIDE AN ESCAPE. `part.raw` hands the layer a function; a path drawn
//     there is invisible here, which is exactly the UNDRAWN caveat above.
//   - WHETHER SHARING IS HONEST. Two arrays can be shared and both wrong: this asks for identity, not
//     for the geometry being right. `report/geometry-soft.test.mjs` and the frame own that.
//   - THE ARROWHEAD ITSELF. A-05's repair is `relationPath`, not deleting the line, and whether a
//     given lane should lose its marker is a picture judgement. This only asks that somebody ruled.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { importAll, stepTotal } from '../fixtures/module.mjs';
import {
  A05_CARRIED, readCard, tierOf, key, segsOf, covered,
} from '../fixtures/lane-traffic.mjs';

const catalogued = await cards();
const modules = await importAll();

// The walk baseline, DERIVED rather than typed: the catalog it walks and the specs it reads are
// what say how big a whole walk is (CATALOG_BASELINE in ../fixtures/catalog.mjs).
const EXPECTED_CARDS = catalogued.length;
const EXPECTED_STEPS = await stepTotal();

// One walk, both questions, so the two assertions can never disagree about which catalogue they read.
function walk() {
  const copied = [];
  const dead = [];
  let cardCount = 0, stepCount = 0, routeCount = 0, laneCount = 0;

  for (const c of catalogued) {
    const ns = modules.get(c.id);
    if (!ns || !ns.SCENE || !Array.isArray(ns.STEPS_SPEC)) continue;
    cardCount++;
    stepCount += ns.STEPS_SPEC.length;
    const card = readCard(ns);

    for (const r of card.routes) {
      routeCount++;
      if (tierOf(r.pts, card) === 'COPIED') copied.push({ card: c.id, step: r.step, pts: r.pts });
    }

    // A-05, read exactly as the report reads it: a lane is RIDDEN when a route or a segment carries
    // the same array or an equal one, and TRAVERSED when a longer ball covers every one of its legs.
    const paths = [...card.routes, ...card.segments];
    const ident = new Set(paths.map(p => p.pts));
    const equal = new Set(paths.map(p => key(p.pts)));
    const ballSegs = paths.flatMap(p => segsOf(p.pts));
    for (const l of card.lanes) {
      laneCount++;
      if (ident.has(l.pts) || equal.has(key(l.pts))) continue;
      const segs = segsOf(l.pts);
      if (segs.every(sg => covered(sg, ballSegs))) continue;      // TRAVERSED
      dead.push({ card: c.id, pts: l.pts });
    }
  }
  return { copied, dead, cardCount, stepCount, routeCount, laneCount };
}

const W = walk();

test('A02-SHARED: a ball rides the array that drew its wire, not an equal copy', (t) => {
  assert.ok(W.cardCount >= EXPECTED_CARDS,
    `walked ${W.cardCount} card(s), the catalog holds ${EXPECTED_CARDS}. A shrunken walk finds few ` +
    'copies and reads exactly like a clean catalog.');
  assert.ok(W.stepCount >= EXPECTED_STEPS,
    `read ${W.stepCount} step(s), expected at least ${EXPECTED_STEPS}.`);
  assert.ok(W.routeCount > 0, 'measured no route at all, so the reader has gone quiet');

  const lines = W.copied.map(r =>
    `  ${r.card} step '${r.step}' rides ${JSON.stringify(r.pts)}, which EQUALS a drawn lane and is ` +
    'a separate array');
  assert.deepEqual(lines, [],
    `${W.copied.length} route(s) ride a COPY of the lane they are drawn on:\n${lines.join('\n')}\n` +
    'Build the points ONCE and let the P.lane and every F.route index the same array. A factory that ' +
    'returns a fresh array per call makes the two equal by construction and never the same object, ' +
    'which is the shape all 56 of the original queue had. See report/lane-traffic.test.mjs for the ' +
    'tiers this does NOT ask about.');

  t.diagnostic(`A-02: ${W.routeCount} route(s) over ${W.cardCount} cards, 0 riding a copy`);
});

test('A05-CARRIED: every drawn lane with an arrowhead and no rider carries a written ruling', (t) => {
  assert.ok(W.laneCount > 0, 'measured no lane at all, so the reader has gone quiet');

  const unread = W.dead.filter(d => !A05_CARRIED.has(`${d.card} ${key(d.pts)}`));
  const lines = unread.map(d => `  ${d.card} ${key(d.pts)}`);
  assert.deepEqual(lines, [],
    `${unread.length} lane(s) carry an arrowhead that nothing ever rides, and nobody has ruled on ` +
    `them:\n${lines.join('\n')}\n` +
    'A-05 is about the ARROWHEAD: the repair it names is relationPath, not deleting the line. Rule ' +
    'it, then either repair the card or add the ruling to A05_CARRIED in fixtures/lane-traffic.mjs ' +
    'with the reason, quoting the card record.');

  // A ruling that matches no finding is a lie the table tells: the lane was repaired and the reason
  // still claims it. Loud on purpose, and the fix is one line.
  const live = new Set(W.dead.map(d => `${d.card} ${key(d.pts)}`));
  const stale = [...A05_CARRIED.keys()].filter(k => !live.has(k));
  assert.deepEqual(stale, [],
    `${stale.length} ruling(s) match no finding, so the lane changed and the reason is now false:\n  ` +
    stale.join('\n  '));

  t.diagnostic(`A-05: ${W.laneCount} lane(s), ${W.dead.length} with no rider, all ruled`);
});
