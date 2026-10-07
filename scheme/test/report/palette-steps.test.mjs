// The palette tuples sampled at open, on every static step and on every played step, reporting what
// the extra sampling adds (CONFLICTING). Never fails on a finding: the played pass is not deterministic
// in the small. Fails only on an incomplete walk (S-46).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards, SUBSET } from '../fixtures/catalog.mjs';
import { classify } from '../fixtures/palette.mjs';
import { readSnapshot } from '../fixtures/snapshot.mjs';

// render/palette.test.mjs is the truth if these ever disagree.
const OPEN_ELEMENTS = 2047;
const OPEN_COMBINATIONS = 29;

// `where` is card + sampling point, so a conflict can be opened.
function makeScope(name) {
  return { name, tuples: new Map(), elements: 0, unknown: [], unpainted: [] };
}

// The judgement is ../fixtures/palette.mjs. Only sites-not-cards bookkeeping stays here.
function fold(scope, id, where, rows) {
  for (const r of rows) {
    scope.elements++;
    const v = classify(id, r);
    if (v.verdict === 'unknown') { scope.unknown.push(`${id} @${where}  ${r.cls} role="${r.role}"`); continue; }
    if (v.verdict === 'unpainted') {
      scope.unpainted.push(`${id} @${where}  ${r.cls}[data-role="${r.role}"] ${r.paintProp}=${v.colour}`);
      continue;
    }
    if (!scope.tuples.has(v.key)) scope.tuples.set(v.key, new Map());
    const byColour = scope.tuples.get(v.key);
    if (!byColour.has(v.colour)) byColour.set(v.colour, []);
    const sites = byColour.get(v.colour);
    if (sites.length < 4 && !sites.some(s => s.startsWith(`${id}@`))) sites.push(`${id}@${where}`);
  }
}

const catalogued = await cards();

test('palette across every step (report only, never fails)', async () => {
  const open = makeScope('open');          // what the old check saw: the card as it opens
  const stat = makeScope('static');        // gotoStep over every step, the prev/reset replay path
  const play = makeScope('played');        // enterStep over every step, the real motion path
  const union = makeScope('union');

  const notes = [];
  let sampledCards = 0;
  let steps = 0;
  let playedSteps = 0;

  try {
    // All three readings come from the walk's reduced-motion pass. Played rows override it per step.
    const snap = readSnapshot();
    const ids = snap.ids;

    for (const id of ids) {
      try {
        const card = snap.cards[id];
        if (card.paintError) { notes.push(`${id}: ${card.paintError}`); continue; }
        const atOpen = card.paint && card.paint.open;
        if (!atOpen) { notes.push(`${id}: no diagram`); continue; }
        fold(open, id, 'open', atOpen);
        fold(union, id, 'open', atOpen);

        const total = card.steps;

        for (let i = 0; i < total; i++) {
          const rows = card.paint.static[i];
          if (!rows) continue;
          steps++;
          fold(stat, id, `static#${i}`, rows);
          fold(union, id, `static#${i}`, rows);
        }

        // Step 0 is the static poster with no play path.
        for (let i = 1; i < total; i++) {
          const rows = card.paint.played[i];
          if (!rows) continue;
          playedSteps++;
          fold(play, id, `played#${i}`, rows);
          fold(union, id, `played#${i}`, rows);
        }

        sampledCards++;
      } catch (err) {
        notes.push(`${id}: ${err.message.split('\n')[0]}`);
      }
    }
  } catch (err) {
    notes.push(`harness: ${err.message.split('\n')[0]}`);
  }

  const conflicts = (scope) => [...scope.tuples.entries()].filter(([, byColour]) => byColour.size > 1);
  const line = (s) => `  ${s.name.padEnd(7)} elements ${String(s.elements).padStart(7)}   combinations ${String(s.tuples.size).padStart(4)}   conflicting ${conflicts(s).length}`;

  const out = [];
  out.push('');
  out.push('===== palette across every step, REPORT ONLY =====');
  out.push(`  cards sampled ${sampledCards} of ${catalogued.length} in the catalog`);
  out.push(`  steps walked  ${steps} static, ${playedSteps} played`);
  if (SUBSET) {
    out.push(`  SUBSET: SCHEME_IDS restricted the walk to ${sampledCards} card(s), so the card census is NOT`);
    out.push('  asked. The per-combination rows are as true as on a full run, because a tuple is a colour');
    out.push('  a card actually paints. The TOTALS, the NEW-combination list and the conflict count are');
    out.push('  only the walked cards: a combination this run calls new may be one a sibling has painted');
    out.push('  for months. A full run is what says what the catalog holds.');
  } else if (sampledCards !== catalogued.length) {
    out.push(`  REPORT INCOMPLETE: ${catalogued.length - sampledCards} card(s) were not sampled, the numbers below undercount`);
  }
  out.push('');
  out.push(`  baseline asserted by render/palette.test.mjs: ${OPEN_ELEMENTS} elements, ${OPEN_COMBINATIONS} combinations`);
  out.push(line(open));
  out.push(line(stat));
  out.push(line(play));
  out.push(line(union));
  out.push('');

  const newKeys = [...union.tuples.keys()].filter(k => !open.tuples.has(k)).sort();
  out.push(`NEW combinations the step walk reveals (union minus open): ${newKeys.length}`);
  for (const k of newKeys) {
    const byColour = union.tuples.get(k);
    const colours = [...byColour.entries()]
      .map(([c, sites]) => `${c} <- ${sites.join(', ')}`).join('  ||  ');
    out.push(`  ${byColour.size > 1 ? 'CONFLICT ' : '         '}${k.padEnd(52)} ${colours}`);
  }
  out.push('');

  const bad = conflicts(union);
  // Extra colours from played samples only are a frozen-pulse artefact, not a card finding.
  const playedOnly = bad.filter(([, byColour]) =>
    [...byColour.values()].slice(1).every(sites => sites.every(s => s.includes('@played'))));
  out.push(`CONFLICTING combinations over the whole walk (one tuple, more than one colour): ${bad.length}`);
  out.push(`  of those, ${playedOnly.length} owe their extra colour(s) to PLAYED samples only (pulse frozen at its first keyframe, not a card defect)`);
  for (const [k, byColour] of bad) {
    out.push(`  ${k}${open.tuples.has(k) ? '   (already visible at open)' : '   (only visible mid-story)'}`);
    for (const [colour, sites] of byColour) out.push(`      ${colour.padEnd(22)} ${sites.join(', ')}`);
  }
  out.push('');

  out.push(`UNKNOWN roles over the whole walk: ${union.unknown.length}`);
  union.unknown.slice(0, 20).forEach(l => out.push('  ' + l));
  out.push(`UNPAINTED over the whole walk: ${union.unpainted.length}`);
  union.unpainted.slice(0, 20).forEach(l => out.push('  ' + l));

  if (notes.length) {
    out.push('');
    out.push(`cards that could not be sampled: ${notes.length}`);
    notes.slice(0, 20).forEach(l => out.push('  ' + l));
  }
  out.push('===== end of report =====');

  console.log(out.join('\n'));

  // No assertion on a finding, one on the walk (S-46). The card census is skipped under SCHEME_IDS,
  // sampling zero steps never is.
  if (!SUBSET) {
    assert.equal(sampledCards, catalogued.length,
      `sampled ${sampledCards} of ${catalogued.length} card(s). A report that scans nothing reports ` +
      'nothing, and every number above undercounts by whatever it missed.');
  }
  assert.ok(steps > 0 && playedSteps > 0,
    `walked ${steps} static and ${playedSteps} played step(s): a run that samples neither has ` +
    'measured no palette at all.');
});
