// How many rings land on one arrival, the ceiling M-14 leaves open: SIMULTANEOUS (same point, dt 0,
// carried or a defect), STAGGERED and NEAR (context). Fails on the census and on a stale RIPPLE_MS copy.
// Blind to the reduced path, to rings fired from escapes, and to which of two coinciding rings should go.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { cards, ROOT } from '../fixtures/catalog.mjs';
import { carriedBlock, shapeProblems, staleKeys } from '../fixtures/carried.mjs';
import { importAll, stepTotal } from '../fixtures/module.mjs';
import { timelineOf } from '../fixtures/spec.mjs';
import { routeDur, REVEAL_MS, BEAT } from '../../js/lib/scheme-kit.js';

const EXPECTED_CARDS = (await cards()).length;
const EXPECTED_STEPS = await stepTotal();

const KIT = { routeDur, REVEAL_MS, BEAT };

// The walk, the ring window and the carried table live in ../fixtures/ripple-double.mjs.
import { RIPPLE_MS, RIPPLE_CARRIED, ringOf, at } from '../fixtures/ripple-double.mjs';

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

      // Grouped by exact point and paired with time neighbours: three rings 180ms apart are two overlapping pairs.
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

      // Close enough to overlap on screen: what the exact reading would miss.
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
  const stale = staleKeys('SIMULTANEOUS', simultaneous.map(r => r.carryKey));
  for (const l of carriedBlock('SIMULTANEOUS', held.map(r => ({ key: r.carryKey, why: r.why })), stale)) out.push(l);
  for (const b of shapeProblems('SIMULTANEOUS', new Set(catalogued.map(c => c.id)))) out.push(`   BROKEN RULING  ${b}`);

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

  // The census and the RIPPLE_MS copy, checked against the literal in scheme-kit.js.
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
