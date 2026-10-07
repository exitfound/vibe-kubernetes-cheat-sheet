// A-02 (does a ball ride the array that drew its wire: SHARED, COPIED, OTHER-PART, ASSEMBLED, PARTIAL,
// UNDRAWN) and A-05 (does a drawn wire carry anything: traversed or carried, NET.A-03), reported.
// Fails only on the census. Blind to part.raw/tune paths, group transforms, opacity, direction and top packets.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { carriedBlock, shapeProblems, staleKeys } from '../fixtures/carried.mjs';
import { importAll, stepTotal } from '../fixtures/module.mjs';

const catalogued = await cards();
const modules = await importAll();

const pad = (n) => String(n).padStart(4);
const cardsOf = (rows) => new Set(rows.map(r => r.card)).size;

// The walk lives in ../fixtures/lane-traffic.mjs, shared with ../unit/lane-shared.test.mjs.
import { A05_CARRIED, readCard, tierOf, segTierOf, key, segsOf, covered, TIERS, DRAWN_KINDS } from '../fixtures/lane-traffic.mjs';
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
  out.push('1. THE THREE LEVELS THE RULE IS ABOUT, over F.route, counted live on this walk');
  const live = { 'A-02 SHARED': routeTier.get('SHARED').length, 'A-02 COPIED': routeTier.get('COPIED').length, 'A-02 NO LANE': noLane };
  for (const k of Object.keys(live)) out.push(`   ${k.padEnd(14)} ${pad(live[k])}`);
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

  // The census assertions. Findings belong to a person.
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
    `${cardsOf([...traversed, ...dead])} card(s) carry no ball path with their own points`);
  out.push(`   of those, ${traversed.length} are TRAVERSED` +
    ': every segment of the lane lies under a');
  out.push('   LONGER ball path that runs straight through it, which an exact comparison cannot see.');
  out.push('   Most are 22 unit taps from a block edge down to the row below. Not findings.');
  for (const r of traversed) out.push(`   TRAVERSED  ${r.card} lane ${r.name}  ${key(r.pts)}`);

  out.push('');
  out.push(`2. THE QUEUE: ${dead.length} lane(s)` +
    ` on ${cardsOf(dead)} card(s) have nothing running over them, ` +
    `${held.length} carried with a reason, ${open.length} left to work`);
  for (const r of open) {
    out.push(`   ${r.card} lane ${r.name}  ${key(r.pts)}` +
      (r.on ? `   (${r.on} of ${r.of} segments do carry something)` : '') +
      (r.raws || r.tunes ? `   [${r.raws} raw, ${r.tunes} tune on this card]` : ''));
  }
  const stale = staleKeys('A-05', [...traversed, ...dead].map(r => r.carryKey));
  for (const l of carriedBlock('A-05', held.map(r => ({ key: r.carryKey, why: r.why })), stale)) out.push(l);
  for (const b of shapeProblems('A-05', new Set(catalogued.map(c => c.id)))) out.push(`   BROKEN RULING  ${b}`);
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
