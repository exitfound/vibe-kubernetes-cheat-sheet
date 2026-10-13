// A02-SHARED (A-02): a ball rides the array that drew its wire, not an equal copy.
// A05-CARRIED (A-05): a lane with a marker and no rider carries a written ruling.
// Blind to lanes and routes built inside part.raw, and to whether shared geometry is right.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { importAll, stepTotal } from '../fixtures/module.mjs';
import {
  A05_CARRIED, readCard, tierOf, key, segsOf, covered,
} from '../fixtures/lane-traffic.mjs';

const catalogued = await cards();
const modules = await importAll();

const EXPECTED_CARDS = catalogued.length;
const EXPECTED_STEPS = await stepTotal();

// One walk for both questions, so they cannot read different catalogues.
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

    // Ridden when a route or segment carries the same or an equal array, traversed when a longer ball covers every leg.
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

  // A ruling that matches no finding means the lane was repaired under it.
  const live = new Set(W.dead.map(d => `${d.card} ${key(d.pts)}`));
  const stale = [...A05_CARRIED.keys()].filter(k => !live.has(k));
  assert.deepEqual(stale, [],
    `${stale.length} ruling(s) match no finding, so the lane changed and the reason is now false:\n  ` +
    stale.join('\n  '));

  t.diagnostic(`A-05: ${W.laneCount} lane(s), ${W.dead.length} with no rider, all ruled`);
});
