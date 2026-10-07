// The chip no step writes, the P-01 hole: LIT-NOT-WRITTEN (a step points at it) and SILENT (a caption
// drawn as a chip), reported with each chip's build-time value. Fails only on the census and table shape.
// Blind to writes inside escapes (P-11), chips built by escapes, chain rows and wire labels.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { carriedBlock, shapeProblems, staleKeys } from '../fixtures/carried.mjs';
import { importAll, stepTotal } from '../fixtures/module.mjs';
import { walkParts } from '../fixtures/spec.mjs';

const catalogued = await cards();
const modules = await importAll();

const pad = (n) => String(n).padStart(4);
const fmt = ([a, b]) => `${a} chip(s) / ${b} card(s)`;
const countsOf = (rows) => [rows.length, new Set(rows.map(r => r.card)).size];

// The walk and the carried table live in ../fixtures/chip-unwritten.mjs.
import { writtenKeys, cuedKeys } from '../fixtures/chip-unwritten.mjs';
import { CHIP_CARRIED } from '../fixtures/chip-unwritten.mjs';

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
  out.push('1. THE POPULATION, counted live on this walk');
  for (const k of Object.keys(live)) out.push(`   ${k.padEnd(16)} ${fmt(live[k])}`);
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

  if (held.length) out.push('');
  const stale = staleKeys('LIT-NOT-WRITTEN', all.map(r => r.carryKey));
  for (const l of carriedBlock('LIT-NOT-WRITTEN', held.map(r => ({ key: r.carryKey, why: r.why })), stale)) out.push(l);
  for (const b of shapeProblems('LIT-NOT-WRITTEN', new Set(catalogued.map(c => c.id)))) out.push(`   BROKEN RULING  ${b}`);

  if (notes.length) {
    out.push('');
    out.push(`cards that could not be read: ${notes.length}`);
    for (const l of notes) out.push(`   ${l}`);
  }
  out.push('===== end of report =====');
  console.log(out.join('\n'));

  // The census and the carried table's shape.
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
