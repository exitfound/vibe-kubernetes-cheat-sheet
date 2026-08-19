// chip-unwritten.test.mjs: the chip NO step writes, which is the hole in P-01 that P-01 cannot see.
//
// P-01 is "every step states EVERY chip, not only the ones it narrates", and unit/spec-steps.test.mjs
// enforces it by comparing one step's chip key set against the other steps of the same card. That
// comparison is the reason the rule is closed and also the reason this class is invisible: a chip
// missing from ALL the sets agrees with every other set perfectly. The card declares the chip in
// SCENE, the reader sees it on screen for the whole card, and nothing anywhere ever writes it.
//
// It needs no browser. A chip is a `chip` part with a key, and a write is a key in `chips`,
// `chipsCued`, `rewind` or an `F.set`, all of them fields.
//
// ===========================================================================================
// WHY THIS IS A QUEUE AND NOT A VERDICT, WHICH IS THE WHOLE POINT OF THE FILE
// ===========================================================================================
// A chip nobody writes is NOT automatically wrong, and the catalog says so out loud: every one of
// the findings below carries a build-time `value` in its own part, so what stands on screen is a
// real string and not the blank ' ' a placeholder chip is built with. A chip whose value is a
// CONSTANT of the diagram (a nameserver every step agrees on, a NodePort range fixed by the API
// server) is legitimately stated once, at build, and never restated.
//
// So the file prints the value each one carries and lets a person rule. What it separates out is the
// form where the card contradicts itself:
//
//   LIT-NOT-WRITTEN   at least one step names the chip in `lit`, in `reducedLit`, in a `lights` list
//                     or as an F.light target, and NO step writes it. The step is pointing at a
//                     value as the news of that step, and the value it points at is whatever the
//                     scene was built with. That is the sharp queue.
//   SILENT            nothing writes it and nothing points at it. A standing caption that happens to
//                     be drawn as a chip. Printed as its own tier because the reading is different:
//                     nobody is claiming anything about it, so the question is only whether a chip
//                     is the right part kind for it.
//
// The exemplar of the sharp form is `network-north-south-path svcChip`, named in the D1 inventory:
// three steps highlight it, none writes it, and the highlight is the cue for a value that never
// changes.
//
// ===========================================================================================
// WHY report/ AND NOT unit/
// ===========================================================================================
// The cycle is written in ./arrival.test.mjs and this project has run it three times: report-only,
// then a human triage of the queue, then promotion into the mandatory set. Eighteen findings on six
// cards, every one of them possibly correct by the constant-chip reading above, is not a thing to
// redden the gate with before anybody has read one. Nothing here fails on a finding.
//
// WHAT DOES FAIL: the census, and the shape of the carried table. A report that walked less than the
// catalog prints few findings and looks exactly like a clean catalog, which is the lesson of stage
// 2.4c, where the first run of a report test counted 649 steps of 650 and nothing in the output
// looked wrong. Fewer than 108 cards or 650 steps is an assertion failure, not a note.
//
// ===========================================================================================
// WHAT THIS FILE IS BLIND TO
// ===========================================================================================
//   - A WRITE INSIDE AN ESCAPE. `step.enter` (42 sites) and `F.run` (13) are function bodies, and
//     `setVal(s.refs.x, ...)` inside one is a write this reader does not see, so such a chip would
//     be reported here as unwritten. P-11 bans exactly that ("a value a step writes belongs in a
//     writer FIELD, never in the `enter` escape"), which is why the finding is worth printing rather
//     than guarding against: if one of these turns out to be written by an escape, the finding is a
//     P-11 finding instead of this one. Checked by hand on the 18 reported today: none of them is
//     mentioned anywhere in its card outside the part declaration, the reset keys and the `lit`
//     lists, so no escape writes any of them.
//   - A CHIP AN ESCAPE CREATES. `part.raw` can build an element and file it under a ref (10 cards
//     assign a ref from a hook). Such a chip is not a `chip` part and is not in the population at
//     all, so it can never be reported, however dead it is.
//   - WHETHER THE VALUE IS TRUE. A constant chip stating something the card later contradicts reads
//     as perfectly quiet here. That is a human reading of the picture, and the reason the two forms
//     are printed with their values attached.
//   - `chain` ROWS AND `wire` LABELS. Only the `chip` part kind is counted. A chain row nobody
//     activates and a wire label nobody sets are the same class one part kind over, and neither is
//     this file's subject.
//   - WHETHER THE HIGHLIGHT IS DESERVED. LIT-NOT-WRITTEN asks only that some step points at the
//     chip. Whether pointing at an unchanging value is right on THAT step is P-03 and R2, and
//     ./chip-beat.test.mjs and ./arrival.test.mjs own those.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { importAll, stepTotal } from '../fixtures/module.mjs';
import { walkParts } from '../fixtures/spec.mjs';

// The recorded walk. Assertions, not notes: see the header.

// What the walk measured the day this file was written, as chips / cards. Printed beside the live
// numbers, never asserted: a card repaired in phase F is SUPPOSED to move them, and an assertion
// here would make a repair look like a regression.
const RECORDED = {
  'chip parts': [411, 108],
  'LIT-NOT-WRITTEN': [17, 6],
  SILENT: [1, 1],
};

// -------------------------------------------------------------------------------------------
// Findings a human has READ and decided to carry, keyed `<card id> <chip key>`, with the reason on
// each. EMPTY ON PURPOSE, and that is the statement this table makes: not one of the eighteen has
// been read by a person yet, so everything outside the table is work by definition, and a reason
// lands in the table only after someone has looked at the card. Same shape and same discipline as
// R2_STEP_CARRIED in ./arrival.test.mjs: an entry here is a decision with a measurement behind it,
// never a way to quiet the queue.
// -------------------------------------------------------------------------------------------

const catalogued = await cards();
const modules = await importAll();

const pad = (n) => String(n).padStart(4);
const fmt = ([a, b]) => `${a} chip(s) / ${b} card(s)`;
const countsOf = (rows) => [rows.length, new Set(rows.map(r => r.card)).size];

// Every key any step writes: the static block, the rewind the animated path adds, and every F.set
// in the flow. The same four places ../fixtures/spec.mjs resolves a chip through, asked as a set of
// NAMES rather than of values, because the question here is whether a writer exists at all.
// The walk and the carried table live in ../fixtures/chip-unwritten.mjs, shared with the gate
// file that asserts the queue. See that file's header for why.
import { writtenKeys, cuedKeys } from '../fixtures/chip-unwritten.mjs';
import { CHIP_CARRIED } from '../fixtures/chip-unwritten.mjs';

// The walk baseline, DERIVED rather than typed: the catalog it walks and the specs it reads are
// what say how big a whole walk is (CATALOG_BASELINE in ../fixtures/catalog.mjs).
const EXPECTED_CARDS = (await cards()).length;
const EXPECTED_STEPS = await stepTotal();


test('a chip no step writes (report only, census is the assertion)', (t) => {
  const litNotWritten = [], silent = [];
  const notes = [];
  let walked = 0, steps = 0, chipParts = 0, written = 0;

  for (const c of catalogued) {
    const ns = modules.get(c.id);
    if (!ns || !Array.isArray(ns.STEPS_SPEC) || !ns.SCENE) {
      notes.push(`${c.id}: exports no SCENE and STEPS_SPEC pair, so this card was never read`);
      continue;
    }
    walked++;
    steps += ns.STEPS_SPEC.length;

    const chips = [];
    walkParts(ns.SCENE.parts, (part) => {
      if (!part || part.kind !== 'chip' || !part.key) return;
      chips.push({ key: part.key, name: part.p.name, value: part.p.value });
    });
    chipParts += chips.length;

    const writes = writtenKeys(ns.STEPS_SPEC);
    const cues = cuedKeys(ns.STEPS_SPEC);
    for (const ch of chips) {
      if (writes.has(ch.key)) { written++; continue; }
      const rec = {
        card: c.id, key: ch.key, name: ch.name, value: ch.value,
        carryKey: `${c.id} ${ch.key}`,
      };
      rec.why = CHIP_CARRIED.get(rec.carryKey);
      (cues.has(ch.key) ? litNotWritten : silent).push(rec);
    }
  }

  const live = {
    'chip parts': [chipParts, walked],
    'LIT-NOT-WRITTEN': countsOf(litNotWritten),
    SILENT: countsOf(silent),
  };
  const all = [...litNotWritten, ...silent];
  const held = all.filter(r => r.why), open = all.filter(r => !r.why);

  const out = [];
  out.push('');
  out.push('===== a chip no step writes, REPORT ONLY =====');
  out.push(`  cards walked ${walked} of ${catalogued.length} in the catalog, steps read ${steps}`);
  out.push(`  chip parts ${chipParts}, of which ${written} are written by at least one step`);
  if (walked < EXPECTED_CARDS || steps < EXPECTED_STEPS) {
    out.push(`  REPORT INCOMPLETE: expected at least ${EXPECTED_CARDS} cards and ${EXPECTED_STEPS} steps, ` +
      'every number below undercounts');
  }

  out.push('');
  out.push('1. THE POPULATION, live against what was recorded when this file was written');
  for (const k of Object.keys(RECORDED)) {
    const same = live[k].every((n, j) => n === RECORDED[k][j]);
    out.push(`   ${k.padEnd(16)} ${fmt(live[k])}${same ? '' : `   (recorded ${fmt(RECORDED[k])})`}`);
  }
  out.push('   P-01 compares one step\'s chip set against the other steps of the same card, so a chip');
  out.push('   missing from EVERY set is a chip every set agrees about. That is this population.');

  out.push('');
  out.push(`2. LIT-NOT-WRITTEN, THE QUEUE: ${litNotWritten.length} chip(s) on ` +
    `${new Set(litNotWritten.map(r => r.card)).size} card(s) are pointed at by a step and written by none, ` +
    `${held.length} carried with a reason, ${open.filter(r => litNotWritten.includes(r)).length} left to work`);
  out.push('   Read the value beside each one first: a chip stating a CONSTANT of the diagram is');
  out.push('   legitimately built once and never restated, and the whole queue below is that shape.');
  const byCard = new Map();
  for (const r of litNotWritten) {
    if (!byCard.has(r.card)) byCard.set(r.card, []);
    byCard.get(r.card).push(r);
  }
  for (const [id, rows] of [...byCard.entries()].sort((a, b) => b[1].length - a[1].length)) {
    out.push(`   ${pad(rows.length)}  ${id}`);
    for (const r of rows) {
      if (r.why) continue;
      out.push(`         chip "${r.key}" reads ${JSON.stringify(r.name)} = ${JSON.stringify(r.value)} for the whole card`);
    }
  }

  out.push('');
  out.push(`3. SILENT: ${silent.length} chip(s) nothing writes and nothing points at`);
  for (const r of silent) {
    if (r.why) continue;
    out.push(`   ${r.card} chip "${r.key}" reads ${JSON.stringify(r.name)} = ${JSON.stringify(r.value)}, ` +
      'and no step lights it either');
  }

  if (held.length) {
    out.push('');
    for (const r of held) out.push(`   CARRIED  ${r.carryKey}\n      WHY ${r.why}`);
  }
  const stale = [...CHIP_CARRIED.keys()].filter(k => !all.some(r => r.carryKey === k));
  if (stale.length) out.push(`   carried entries no longer reported (stale, remove them): ${stale.join(' | ')}`);

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
  // measurement at all, and a carried entry with no reason is a queue quietly getting shorter.
  // -------------------------------------------------------------------------------------------
  assert.ok(walked >= EXPECTED_CARDS,
    `walked ${walked} card(s), the catalog had ${EXPECTED_CARDS} when this report was written. ` +
    'A report over a subset prints few findings and looks exactly like a clean catalog.');
  assert.ok(steps >= EXPECTED_STEPS,
    `read ${steps} step(s), expected at least ${EXPECTED_STEPS}. A step nobody read is a step whose ` +
    'writes were never collected, and every chip on that card would then look unwritten.');
  assert.ok(chipParts > 0 && written > 0,
    `${chipParts} chip part(s) seen, ${written} written. Zero of either means the part reader or the ` +
    'field reader has gone blind, and the whole catalog would report as unwritten or as clean.');
  for (const [key, why] of CHIP_CARRIED) {
    assert.ok(typeof why === 'string' && why.trim().length > 20,
      `CHIP_CARRIED['${key}'] carries no reason. A carried finding is a decision somebody measured, ` +
      'and without the reason it is only a shorter queue.');
    assert.equal(key.split(' ').length, 2,
      `CHIP_CARRIED key '${key}' is not '<card id> <chip key>', so it can never match a finding`);
  }

  t.diagnostic(`unwritten chips: ${walked} cards, ${chipParts} chip parts, ` +
    `lit-not-written ${litNotWritten.length}, silent ${silent.length}, ` +
    `${held.length} carried, ${open.length} unread`);
});
