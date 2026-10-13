// R-skeleton census, report only (the gate is ../unit/skeleton.test.mjs). Legacy-form patterns are a
// tripwire that must read 0. The queue: Q1 reset keys naming no ref, Q3 S-12, Q4 D-14 posterFirst, Q5 escapes.
// Patterns are line-anchored, so blanking whole comment lines is a sound strip.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { cards, categories } from '../fixtures/catalog.mjs';
import { cardForm, importAll, importLib } from '../fixtures/module.mjs';
import { assignedRefs, collectFns, refNames, walkParts } from '../fixtures/spec.mjs';

const catalogued = await cards();
const CARD_COUNT = catalogued.length;
const CATS = await categories();
const modules = await importAll();
const { OPACITY } = await importLib('tokens.js');

// Zero is their resting value: a non-zero is a card writing its own skeleton again.
const LEGACY_FORM = new Set([
  'class Scene', 'constructor(host)', 'reset() { this.build(); }', 'makeInit export',
  'function resetStep(s)', 'function clearHL(s)',
]);

// Anchored to whole lines, so a mention in passing does not count.
const SOURCE_PATTERNS = {
  'class Scene': /^class Scene \{$/gm,
  'constructor(host)': /^  constructor\(host[^)]*\) \{/gm,
  'reset() { this.build(); }': /^  reset\(\) \{ this\.build\(\); \}$/gm,
  'makeInit export': /^export const init = makeInit\(Scene, STEPS, \{ posterFirst: true \}\);$/gm,
  'function resetStep(s)': /^function resetStep\(s\) \{/gm,
  'function clearHL(s)': /^function clearHL\(s\) \{/gm,
  'defineCard export': /^export const init = defineCard\(SCENE, STEPS_SPEC, \{ posterFirst: true \}\);$/gm,
  'export const SCENE': /^export const SCENE = \{$/gm,
  'export const STEPS_SPEC': /^export const STEPS_SPEC = \[$/gm,
};

const blankCommentLines = (src) =>
  src.split('\n').map(l => (/^\s*(\/\/|\*|\/\*)/.test(l) ? '' : l)).join('\n');

// Bracket matching, so a body not opening with resetStep(s) is counted rather than missed.
function enterBodies(code) {
  const out = [];
  for (const m of code.matchAll(/enter\(s(?:,\s*ctx)?\)\s*\{/g)) {
    let d = 1, j = m.index + m[0].length;
    const start = j;
    while (d && j < code.length) {
      if (code[j] === '{') d++;
      else if (code[j] === '}') d--;
      j++;
    }
    out.push(code.slice(start, j - 1));
  }
  return out;
}

// A null part is collected as a finding, not skipped.
function flatParts(scene) {
  const out = [], nulls = [];
  walkParts(scene.parts, (part, at) => (part ? out.push({ part, at }) : nulls.push(at)));
  return { out, nulls };
}

const pad = (n, w = 4) => String(n).padStart(w);
const histLine = (m) => [...m.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
  .map(([k, v]) => `${k} ${v}`).join(', ');

test('skeleton census: the declared spec form, with the legacy skeleton as a tripwire (report only)', async (t) => {
  const lines = [];

  const srcTotals = Object.fromEntries(Object.keys(SOURCE_PATTERNS).map(k => [k, 0]));
  const perCat = new Map(CATS.map(c => [c, { cards: 0, lines: 0, scene: 0, define: 0, reduced: 0, role: 0 }]));
  let enters = 0, prologues = 0, posterFirst = 0;
  let sourceMigrated = 0, sourceLegacy = 0;

  for (const c of catalogued) {
    const code = blankCommentLines(await readFile(c.path, 'utf8'));
    for (const [k, re] of Object.entries(SOURCE_PATTERNS)) {
      srcTotals[k] += (code.match(re) || []).length;
    }
    for (const body of enterBodies(code)) {
      enters++;
      const first = (body.split('\n').map(l => l.trim()).filter(Boolean)[0]) || '';
      if (/^resetStep\(s\);/.test(first)) prologues++;
    }
    if (/\{ posterFirst: true \}/.test(code)) posterFirst++;
    const hasDefine = /^export const init = defineCard\(/m.test(code);
    if (hasDefine) sourceMigrated++; else sourceLegacy++;

    const o = perCat.get(c.category);
    if (o) {
      o.cards++;
      o.lines += code.split('\n').length;
      o.scene += (code.match(/^class Scene \{$/gm) || []).length;
      o.define += hasDefine ? 1 : 0;
      o.reduced += (code.match(/if \(ctx\.reduced\)/g) || []).length;
      o.role += (code.match(/\brole: '/g) || []).length;
    }
  }

  lines.push('');
  lines.push('===== skeleton census, REPORT ONLY =====');
  lines.push('');
  lines.push(`1. THE SOURCE CENSUS, the legacy skeleton as a tripwire, over ${CARD_COUNT} cards`);
  for (const [k, n] of Object.entries(srcTotals)) {
    lines.push(`   ${pad(n)}  ${k}   ${LEGACY_FORM.has(k) ? 'LEGACY FORM, 0 is the resting value' : 'the declarative form'}`);
  }
  lines.push(`   ${pad(enters)}  enter() bodies with a brace   step.enter escapes in method shorthand, NOT steps`);
  lines.push(`   ${pad(prologues)}  of those opening with resetStep(s)   LEGACY FORM, 0 is the resting value`);
  lines.push(`   ${pad(posterFirst)}  cards passing { posterFirst: true } (D-14, Q4: unreadable from the namespace)`);
  lines.push('   A PATTERN WITH A BRACE IN IT CANNOT COUNT A STEP: a step is an object in an array. The row');
  lines.push(`   above reads ${enters} escape bodies rather than steps, and section 3 reads`);
  lines.push('   those off the data.');

  lines.push('');
  lines.push('2. PER CATEGORY, the same source measures split by category');
  lines.push('   category    cards  src lines  class Scene  defineCard  if (ctx.reduced)  role: \'..\'');
  for (const cat of CATS) {
    const o = perCat.get(cat);
    lines.push(`   ${cat.padEnd(10)} ${pad(o.cards, 6)} ${pad(o.lines, 10)} ${pad(o.scene, 12)} ${pad(o.define, 11)} ${pad(o.reduced, 17)} ${pad(o.role, 11)}`);
  }
  lines.push('   Every category reads 0 class Scene and 0 if (ctx.reduced): the skeleton is generated');
  lines.push('   once and the reduced guard is derived by flowLights, so a non-zero in either column is');
  lines.push('   a card that slipped back to the legacy form. The role column is NOT one of those: the');
  lines.push('   kit binds a role and writing one at a call site is an override (C-02), not a leftover.');

  const kinds = new Map(), stepFields = new Map(), verbs = new Map(), shades = new Map(), step0 = new Map();
  const hooks = new Map([
    ['SCENE.reset.extra', 0], ['part.tune', 0], ['part.raw', 0],
    ['step.enter', 0], ['step.motion', 0], ['F.run fn', 0],
  ]);
  const softFields = new Map([['step.rewind', 0], ['step.reducedLit', 0]]);
  // `unattributed` fires when a ref comes from a function none of the six branches reaches.
  const escapeRefs = new Map([...hooks.keys(), 'unattributed'].map(k => [k, 0]));
  const escapeRefCards = new Map();
  const hookCards = new Map();
  const q1 = [];
  let specMigrated = 0, specLegacy = 0;
  let topParts = 0, allParts = 0, nullParts = 0, keyedParts = 0, specSteps = 0;

  const bump = (m, k, n = 1) => m.set(k, (m.get(k) || 0) + n);
  const mark = (id, k) => { if (!hookCards.has(id)) hookCards.set(id, new Set()); hookCards.get(id).add(k); };

  for (const c of catalogued) {
    const ns = modules.get(c.id);
    if (cardForm(ns) !== 'migrated') { specLegacy++; continue; }
    specMigrated++;
    const scene = ns.SCENE;
    topParts += (scene.parts || []).length;
    const { out, nulls } = flatParts(scene);
    allParts += out.length;
    nullParts += nulls.length;

    // Wires excluded: they land in refs.wires, and clearHighlights reads refs.
    const refKeys = refNames(scene, ns.STEPS_SPEC);
    const escRefs = new Map();
    const noteEscape = (kind, fn) => {
      for (const k of assignedRefs(fn)) {
        if (escRefs.has(k)) continue;
        escRefs.set(k, kind);
        bump(escapeRefs, kind);
        if (!escapeRefCards.has(kind)) escapeRefCards.set(kind, new Set());
        escapeRefCards.get(kind).add(c.id);
      }
    };
    for (const { part } of out) {
      bump(kinds, part.kind);
      const p = part.p || {};
      if (part.key !== undefined) keyedParts++;
      if (typeof p.tune === 'function') { bump(hooks, 'part.tune'); mark(c.id, 'tune'); noteEscape('part.tune', p.tune); }
      if (part.kind === 'raw') {
        bump(hooks, 'part.raw'); mark(c.id, 'raw');
        // A raw part carries make and may carry tune.
        for (const v of Object.values(p)) if (typeof v === 'function') noteEscape('part.raw', v);
      }
      if (p.opacity !== undefined) bump(shades, String(p.opacity));
    }
    const reset = scene.reset || {};
    if (typeof reset.extra === 'function') {
      bump(hooks, 'SCENE.reset.extra'); mark(c.id, 'reset.extra'); noteEscape('SCENE.reset.extra', reset.extra);
    }

    specSteps += ns.STEPS_SPEC.length;
    const first = ns.STEPS_SPEC[0];
    bump(step0, `id "${first.id}", flow ${!!first.flow}, motion ${!!first.motion}, narration ${first.narration !== undefined}`);
    for (const step of ns.STEPS_SPEC) {
      for (const k of Object.keys(step)) bump(stepFields, k);
      if (step.enter) { bump(hooks, 'step.enter'); mark(c.id, 'enter'); noteEscape('step.enter', step.enter); }
      if (step.motion) { bump(hooks, 'step.motion'); mark(c.id, 'motion'); noteEscape('step.motion', step.motion); }
      if (step.rewind) { bump(softFields, 'step.rewind'); }
      if (step.reducedLit) { bump(softFields, 'step.reducedLit'); }
      for (const [, v] of Object.entries(step.opacity || {})) bump(shades, String(v));
      for (const e of step.flow || []) {
        bump(verbs, e.verb);
        if (e.verb === 'run' && typeof (e.p || {}).fn === 'function') {
          bump(hooks, 'F.run fn'); mark(c.id, 'run'); noteEscape('F.run fn', e.p.fn);
        }
      }
    }

    // The safety net: a missed function is still read and its ref filed as `unattributed`.
    const wide = [];
    collectFns(scene, wide);
    collectFns(ns.STEPS_SPEC, wide);
    for (const fn of wide) noteEscape('unattributed', fn);

    for (const field of ['keys', 'pods']) {
      for (const k of reset[field] || []) {
        if (!refKeys.has(k)) {
          q1.push(`${c.id}  reset.${field} names "${k}", which nothing creates: no part key, no refs.${k} = in an escape`);
        }
      }
    }
  }

  const cleanCards = specMigrated - hookCards.size;
  lines.push('');
  lines.push('3. THE NEW SPEC CENSUS, read off SCENE and STEPS_SPEC with no browser');
  lines.push(`   ${pad(specMigrated)}  migrated cards, ${specLegacy} legacy, ${specMigrated + specLegacy} of ${CARD_COUNT} accounted for`);
  lines.push(`   ${pad(topParts)}  top-level parts, ${allParts} with groups flattened, ${nullParts} conditional null entries appendParts skips`);
  lines.push(`   ${pad(keyedParts)}  parts carrying a key, so reachable as a ref`);
  lines.push(`   ${pad(specSteps)}  steps declared as data`);
  lines.push(`   part kinds:   ${histLine(kinds)}`);
  lines.push(`   step fields:  ${histLine(stepFields)}`);
  lines.push(`   flow verbs:   ${histLine(verbs)}`);
  lines.push(`   step 0 shape: ${[...step0.entries()].map(([k, v]) => `${k} x${v}`).join(' | ')}`);
  lines.push(`   declared shades on parts and step.opacity: ${histLine(shades)}`);
  lines.push(`   (OPACITY vocabulary, live from js/lib/tokens.js: ${Object.entries(OPACITY).map(([k, v]) => `${k}=${v}`).join(', ')}, plus a bare 0 and 1)`);

  lines.push('');
  lines.push('4. ESCAPE HATCHES BY KIND. An escape is a FUNCTION the card hands the layer, which is the');
  lines.push('   line past which a static reader cannot follow.');
  for (const [k, n] of hooks) lines.push(`   ${pad(n)}  ${k}`);
  lines.push(`   ${pad(hookCards.size)}  of ${specMigrated} cards carry at least one, so ${cleanCards} are fully declarative`);
  for (const [id, set] of [...hookCards.entries()].sort()) lines.push(`         ${id}  [${[...set].sort().join(', ')}]`);
  lines.push('   Not escapes, listed because they are the fields most easily mistaken for one:');
  for (const [k, n] of softFields) lines.push(`   ${pad(n)}  ${k}  (declarative data, not a function)`);

  const escapeRefTotal = [...escapeRefs.values()].reduce((a, b) => a + b, 0);
  lines.push('');
  lines.push(`4b. REFS AN ESCAPE CREATES, read as a literal refs.x = out of the body: ${escapeRefTotal} on ` +
    `${new Set([...escapeRefCards.values()].flatMap(s => [...s])).size} cards`);
  for (const [k, n] of escapeRefs) {
    const cardsWith = (escapeRefCards.get(k) || new Set()).size;
    lines.push(`   ${pad(n)}  ${k}${n ? `  on ${cardsWith} card(s)` : '  assigns no ref at all'}`);
  }
  lines.push('   A name two kinds both assign is filed under the first that sees it, so a raw part with a');
  lines.push('   tune lands on part.tune. These names are refs as much as a part key is, and Q1 counts them.');
  lines.push('   The `unattributed` row is the alarm: anything but 0 means an escape kind is unnamed above.');

  lines.push('');
  lines.push(`5. QUEUE Q1, reset keys naming a ref NOTHING creates, no part key and no escape: ${q1.length} finding(s)`);
  for (const l of q1) lines.push(`   ${l}`);
  lines.push('   A finding here is a typo: every writer in the kit is null-guarded, so the key resolves to');
  lines.push('   nothing, clears nothing and throws nothing. Reading part keys alone would file 12 names an');
  lines.push('   escape creates on four cards here: 4b reads them, they count as created, and that is what');
  lines.push('   leaves a real typo visible.');
  lines.push(`   Q3, source count of "function clearHL(s)" over ${CARD_COUNT} cards: ` +
    `${srcTotals['function clearHL(s)']}. S-12 has no data successor, and this is its only remaining form.`);
  lines.push('===== end of report =====');
  console.log(lines.join('\n'));

  // The one assertion: the export-surface count and the source count must agree and sum to the catalog.
  assert.equal(specMigrated + specLegacy, CARD_COUNT,
    `the spec walk saw ${specMigrated + specLegacy} card(s), data.js lists ${CARD_COUNT}`);
  assert.equal(sourceMigrated + sourceLegacy, CARD_COUNT,
    `the source walk saw ${sourceMigrated + sourceLegacy} card(s), data.js lists ${CARD_COUNT}`);
  assert.equal(specMigrated, sourceMigrated,
    `${specMigrated} card(s) export SCENE and STEPS_SPEC but ${sourceMigrated} call defineCard in their source. ` +
    'One of the two readings has gone blind, and until they agree every number above is unsafe.');
  assert.ok(specMigrated > 0, 'no card is in the migrated form, so section 3 measured an empty set');

  t.diagnostic(`census: ${specMigrated} migrated / ${specLegacy} legacy, ${allParts} parts, ${specSteps} spec steps, ` +
    `${[...hooks.values()].reduce((a, b) => a + b, 0)} escapes on ${hookCards.size} cards, Q1 ${q1.length}`);
});
