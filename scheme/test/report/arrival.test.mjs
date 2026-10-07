// The arrival grammar, reported: R3 a receiving block opens dark, R4 a sending block is cued before it
// departs, R2-ENTRY and R2-STEP a changed chip is lit (entry against entry, settled against settled).
// Fails only on the census. Frozen at t=0, so R4 misreads an F.light cue and never judges Pods.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards, SUBSET } from '../fixtures/catalog.mjs';
import { carriedBlock, carriedMap, carryKey, shapeProblems, staleKeys } from '../fixtures/carried.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import { readSnapshot } from '../fixtures/snapshot.mjs';
import { HIT_TOL, vpName, VIEWPORTS } from '../tools/walk.mjs';

const VP = vpName(VIEWPORTS[0]);

const EXPECTED_CARDS = (await cards()).length;
const EXPECTED_STEPS = await stepTotal();

// HIT_TOL is imported from tools/walk.mjs, where it is applied.

const near = (b, p, tol) =>
  p[0] >= b.x - tol && p[0] <= b.x + b.w + tol && p[1] >= b.y - tol && p[1] <= b.y + b.h + tol;

const catalogued = await cards();

// Carried rulings per axis, stored in ../fixtures/carried.mjs. `R2_STEP_CARRIED` keeps its name because CANON.md P-09a cites it.
const R2_STEP_CARRIED = carriedMap('R2-STEP');
const R2_ENTRY_CARRIED = carriedMap('R2-ENTRY');
const R3_CARRIED = carriedMap('R3');
const R4_CARRIED = carriedMap('R4');

test('arrival grammar across every step (report only, census is the one assertion)', async (t) => {
  const r3 = [], r4 = [], r2entry = [], r2step = [], notes = [];
  const r3ByCard = new Map(), r4ByCard = new Map(), entryByCard = new Map(), stepByCard = new Map();
  let walked = 0, sampled = 0, unstamped = 0, judged = 0;
  let senders = 0, senderless = 0, podSenders = 0;
  let entryPairs = 0, entryChanged = 0, stepPairs = 0, stepChanged = 0, deferredCue = 0;

  try {
    // The played reading at t=0 and the settled one from the static pass, both from tools/walk.mjs at 1600x1000.
    const snap = readSnapshot();
    const ids = snap.ids;

    for (const id of ids) {
      try {
        const card = snap.cards[id];
        const total = card.steps;
        walked++;
        let prevEntry = null, prevSettled = null;

        for (let i = 0; i < total; i++) {
          const { live, arrival: data } = card.played[i];
          if (!live && i > 0) {
            notes.push(`${id} step ${i}: no _timeline handle, the play path is not runnable and the step was skipped`);
            continue;
          }
          if (!data) {
            notes.push(`${id} step ${i}: no svg.diagram after a retry, the step was never read`);
            continue;
          }
          sampled++;

          const settledData = card.byVp[VP][i].arrival;
          const settled = (settledData && settledData.chips) || null;

          if (i > 0) {
            for (const pkt of data.packets) {
              // No arrivalMs stamp means no arrival to defer to: counted as the blind spot's size.
              if (!pkt.arrivalMs) { unstamped++; continue; }
              judged++;
              const actsFirst = (b) => data.packets.some(q => near(b, q.from, HIT_TOL) && q.delay <= pkt.delay);
              for (const b of data.blocks) {
                if (!near(b, pkt.to, HIT_TOL)) continue;
                if (actsFirst(b)) continue;      // it sent before it received: lit at entry is correct
                if (!b.hl) continue;             // dark at entry, lights on arrival: correct
                const key = `${id}|${i}|${b.label}|${b.x.toFixed(0)},${b.y.toFixed(0)}`;
                if (r3.some(l => l.key === key)) continue;
                // No coordinates in the carry key, so a ruling survives a block moving a few units.
                const carry = carryKey(id, [String(i), b.label]);
                r3.push({
                  key, id, carryKey: carry, why: R3_CARRIED.get(carry),
                  line: `${id} step ${i}  "${b.label}" (${b.kind}) is lit when the step opens and receives a packet at ${pkt.arrivalMs}ms`,
                });
                if (!R3_CARRIED.has(carry)) r3ByCard.set(id, (r3ByCard.get(id) || 0) + 1);
              }

              // R4: lit at entry, or lit by an earlier arrival of this step (the mid-chain shape).
              const litEarlier = (b) => data.packets.some(q =>
                near(b, q.to, HIT_TOL) && q.arrivalMs != null && q.arrivalMs <= pkt.delay);
              for (const b of data.blocks) {
                if (!near(b, pkt.from, HIT_TOL)) continue;
                if (b.kind === 'pod') { podSenders++; continue; }
                senders++;
                if (b.hl || litEarlier(b)) continue;
                const key4 = `${id}|${i}|${b.label}|${b.x.toFixed(0)},${b.y.toFixed(0)}`;
                if (r4.some(l => l.key === key4)) continue;
                const carry4 = carryKey(id, [String(i), b.label]);
                r4.push({
                  key: key4, id, carryKey: carry4, why: R4_CARRIED.get(carry4),
                  line: `${id} step ${i}  "${b.label}" (${b.kind}) sends a packet at ${pkt.delay}ms ` +
                    'and is dark when the step opens, with no earlier arrival to light it',
                });
                if (!R4_CARRIED.has(carry4)) r4ByCard.set(id, (r4ByCard.get(id) || 0) + 1);
              }
              if (!data.blocks.some(b => near(b, pkt.from, HIT_TOL))) senderless++;
            }
          }

          // Two frozen entry samples compared at t=0.
          if (prevEntry) {
            for (const c of data.chips) {
              const was = prevEntry.find(p => p.key === c.key);
              if (!was || was.value == null || c.value == null) continue;
              entryPairs++;
              if (was.value === c.value) continue;
              entryChanged++;
              if (c.hl) continue;
              const late = settled && settled.find(p => p.key === c.key);
              const deferred = !!(late && late.hl);
              if (deferred) deferredCue++;
              const carry = carryKey(id, [String(i), c.name]);
              const why = R2_ENTRY_CARRIED.get(carry);
              r2entry.push({
                id, deferred, carryKey: carry, why,
                line: `${id} step ${i}  [${deferred ? 'CUE LANDS LATER' : 'NO CUE IN STEP '}] chip "${c.name}" changed ` +
                  `${JSON.stringify(was.value)} to ${JSON.stringify(c.value)} with no .highlight at entry`,
              });
              if (!why) entryByCard.set(id, (entryByCard.get(id) || 0) + 1);
            }
          }

          // Settled against settled: a value turned over mid-step shows one step late on R2-ENTRY, not here.
          if (prevSettled && settled) {
            for (const c of settled) {
              const was = prevSettled.find(p => p.key === c.key);
              if (!was || was.value == null || c.value == null) continue;
              stepPairs++;
              if (was.value === c.value) continue;
              stepChanged++;
              if (c.hl) continue;
              const key = carryKey(id, [String(i), c.name]);
              const why = R2_STEP_CARRIED.get(key);
              r2step.push({
                id,
                key,
                why,
                line: `${id} step ${i}  chip "${c.name}" changed ${JSON.stringify(was.value)} to ` +
                  `${JSON.stringify(c.value)} and carries no .highlight when the step has settled`,
              });
              if (!why) stepByCard.set(id, (stepByCard.get(id) || 0) + 1);
            }
          }

          prevEntry = data.chips;
          if (settled) prevSettled = settled;
        }
      } catch (err) {
        notes.push(`${id}: ${err.message.split('\n')[0]}`);
      }
    }
  } catch (err) {
    notes.push(`harness: ${err.message.split('\n')[0]}`);
  }

  const out = [];
  out.push('');
  out.push('===== arrival grammar, REPORT ONLY =====');
  out.push(`  cards walked ${walked} of ${catalogued.length} in the catalog, steps sampled ${sampled}`);
  out.push(`  packets judged by R3 ${judged}, packets with no arrivalMs stamp and therefore invisible to R3 ${unstamped}`);
  out.push(`  senders judged by R4 ${senders}, balls leaving a Pod and left to the pulse ${podSenders}, ` +
    `balls leaving no block at all ${senderless}`);
  out.push(`  chip slots compared at entry ${entryPairs} (${entryChanged} changed), on the settled step ${stepPairs} (${stepChanged} changed)`);
  if (SUBSET) {
    out.push(`  SUBSET: SCHEME_IDS restricted the walk to ${walked} card(s), so the census below is NOT`);
    out.push('  asked. Every per-card row is as true as on a full run: R3, R4 and the two R2 axes judge');
    out.push('  a ball against its own step and never against the catalog. The TOTALS and the queue');
    out.push('  lengths are only the walked cards, and a full run is what says how many the catalog holds.');
  } else if (walked < EXPECTED_CARDS || sampled < EXPECTED_STEPS) {
    out.push(`  REPORT INCOMPLETE: expected at least ${EXPECTED_CARDS} cards and ${EXPECTED_STEPS} steps, ` +
      'every number below undercounts');
  }
  // Rows still to work, then carried rows with reasons. The counts are never summed.
  out.push('');
  const r3open = r3.filter(f => !f.why), r3held = r3.filter(f => f.why);
  out.push(`R3  lit before the ball lands: ${r3.length} finding(s), ` +
    `${r3held.length} carried with a reason, ${r3open.length} left to work on ${r3ByCard.size} card(s)`);
  for (const f of r3open) out.push('  ' + f.line);
  if (r3ByCard.size) {
    out.push('  by card:');
    for (const [id, c] of [...r3ByCard.entries()].sort((a, b) => b[1] - a[1])) out.push(`    ${String(c).padStart(3)}  ${id}`);
  }
  for (const l of carriedBlock('R3', r3held.map(f => ({ key: f.carryKey, why: f.why })),
    staleKeys('R3', r3.map(f => f.carryKey)), '  ')) out.push(l);

  out.push('');
  const r4open = r4.filter(f => !f.why), r4held = r4.filter(f => f.why);
  out.push(`R4  dark when the ball leaves it: ${r4.length} finding(s), ` +
    `${r4held.length} carried with a reason, ${r4open.length} left to work on ${r4ByCard.size} card(s)`);
  out.push('  THE FIX IS ONE OF TWO, and which one is a reading of the step rather than a preference:');
  out.push('  the block ACTS FIRST, so it goes in that step\'s `lit` and its ball waits BEAT.lead (M-18),');
  out.push('  or it is MID-CHAIN, so the hop before it names it in `lights` and it sends `after` that.');
  for (const f of r4open) out.push('  ' + f.line);
  if (r4ByCard.size) {
    out.push('  by card:');
    for (const [id, c] of [...r4ByCard.entries()].sort((a, b) => b[1] - a[1])) out.push(`    ${String(c).padStart(3)}  ${id}`);
  }
  for (const l of carriedBlock('R4', r4held.map(f => ({ key: f.carryKey, why: f.why })),
    staleKeys('R4', r4.map(f => f.carryKey)), '  ')) out.push(l);

  out.push('');
  const entryOpen = r2entry.filter(f => !f.why), entryHeld = r2entry.filter(f => f.why);
  out.push(`R2-ENTRY  the tool's own reading, both samples frozen at t=0: ${r2entry.length} finding(s), ` +
    `${entryHeld.length} carried with a reason, ${entryOpen.length} left to work on ${entryByCard.size} card(s)`);
  out.push(`    of those, ${deferredCue} have a cue that lands later in the same step and ${r2entry.length - deferredCue} have none in that step`);
  for (const f of entryOpen) out.push('  ' + f.line);
  if (entryByCard.size) {
    out.push('  by card:');
    for (const [id, c] of [...entryByCard.entries()].sort((a, b) => b[1] - a[1])) out.push(`    ${String(c).padStart(3)}  ${id}`);
  }
  for (const l of carriedBlock('R2-ENTRY', entryHeld.map(f => ({ key: f.carryKey, why: f.why })),
    staleKeys('R2-ENTRY', r2entry.map(f => f.carryKey)), '  ')) out.push(l);
  out.push('');
  const open = r2step.filter(f => !f.why), held = r2step.filter(f => f.why);
  out.push(`R2-STEP   the same rule off the SETTLED step: ${r2step.length} finding(s), ` +
    `${held.length} carried with a reason, ${open.length} left to work on ${stepByCard.size} card(s)`);
  if (open.length) {
    out.push('  the queue to work:');
    for (const f of open) out.push('    ' + f.line);
    out.push('  by card:');
    for (const [id, c] of [...stepByCard.entries()].sort((a, b) => b[1] - a[1])) out.push(`    ${String(c).padStart(3)}  ${id}`);
  }
  if (held.length) out.push('  carried, text changed and the fact did not:');
  for (const l of carriedBlock('R2-STEP', held.map(f => ({ key: f.key, why: f.why, line: f.line })),
    staleKeys('R2-STEP', r2step.map(f => f.key)), '    ')) out.push(l);

  // Printed rather than asserted: this file fails on the census alone.
  const ids = new Set(catalogued.map(c => c.id));
  const broken = ['R3', 'R4', 'R2-ENTRY', 'R2-STEP'].flatMap(a => shapeProblems(a, ids));
  if (broken.length) {
    out.push('');
    out.push(`BROKEN RULINGS in fixtures/carried.mjs: ${broken.length}`);
    for (const b of broken) out.push('  ' + b);
  }
  if (notes.length) {
    out.push('');
    out.push(`steps or cards that could not be read: ${notes.length}`);
    notes.slice(0, 30).forEach(l => out.push('  ' + l));
  }
  out.push('===== end of report =====');
  console.log(out.join('\n'));

  // Skipped, not failed, under SCHEME_IDS: a narrowed run is not a broken one.
  if (!SUBSET) {
    assert.ok(walked >= EXPECTED_CARDS,
      `walked ${walked} card(s), the catalog had ${EXPECTED_CARDS} when this report was written. ` +
      'A report over a subset prints few findings and looks exactly like a clean catalog.');
    assert.ok(sampled >= EXPECTED_STEPS,
      `sampled ${sampled} step(s), expected at least ${EXPECTED_STEPS}. A step nobody entered is a ` +
      'step whose arrival cue was never read, and this file would still print a number.');
  }

  t.diagnostic(`arrival: ${walked} cards, ${sampled} steps, ` +
    `R3 ${r3.length} (${r3.filter(f => !f.why).length} unexplained), ` +
    `R4 ${r4.length} (${r4.filter(f => !f.why).length} unexplained), ` +
    `R2-ENTRY ${r2entry.length} (${r2entry.filter(f => !f.why).length} unexplained), ` +
    `R2-STEP ${r2step.length} (${r2step.filter(f => !f.why).length} unexplained)`);
});
