// skeleton-census.test.mjs: the successor of R-skeleton's CENSUS, report only. The mandatory half of
// R-skeleton, R-viewbox and the source half of R-opacity live in ../unit/skeleton.test.mjs; this file
// holds the counting, the cross-check that the counting is honest, and the queue of skeleton facts
// that are not blocking yet.
//
// ===========================================================================================
// WHY REPORT-ONLY FIRST, AND WHAT THE NUMBERS WERE
// ===========================================================================================
// R-skeleton printed a census on every gate run precisely so that a refactor of the skeleton would be
// accepted against numbers rather than against an empty finding list. The replacement is introduced
// the way this project introduces every check: report-only, then a triage, then promotion. So the
// numbers are recorded here on both sides of the migration and nothing below fails on a finding.
//
//   BEFORE, the old census over 108 cards, taken by check-canon.mjs (deleted with scheme/tools/):
//     108 class Scene | 108 constructor(host) | 108 reset() { this.build(); } | 108 makeInit export
//     108 function resetStep(s) | 650 enter() bodies, 650 of them opening with resetStep(s)
//
//   AFTER, the SAME regexes over the same 108 cards, reproduced below on every run. The interesting
//   number is not that the counts fell, it is that the old census now reads 517 enter() bodies where
//   the catalog holds 650 steps. It cannot see a step any more, because a migrated step is an object
//   in an array and not a method with a brace. THAT is why the census had to change form: left alone
//   it would have gone quiet card by card, printing a smaller number every batch and never a finding.
//
// The old regexes are still run, on purpose. They are the only thing that can tell whether the
// migration counter this suite derives from the EXPORT SURFACE agrees with what is actually written
// in the files, and that cross-check is the single assertion at the bottom of this file.
//
// ===========================================================================================
// THE QUEUE: skeleton facts that are measured here and NOT enforced anywhere
// ===========================================================================================
// Q1  reset.keys and reset.pods naming a ref no part declares. 1 today, and it is legitimate:
//     cluster-pod-sandbox-cri lists pods ['sandboxGroup', 'appGroup'] and `appGroup` is built by a
//     tune(el, refs) escape, so no static reader can see it. Promoting this needs a decision about
//     escape-created refs, not a fix to a card.
// Q2  S-11 says the prologue runs the card's extras BEFORE clearWires. makeResetStep runs
//     reset.extra AFTER it. Invisible today: the one extra in the catalog is
//     cluster-api-structure's resetWatchArrow, which writes strokeDasharray on an arrow and touches
//     no wire, which is why the oracle stayed clean through the migration. Recorded, not repaired:
//     the repair is a change to js/lib/ and would need its own diff.
// Q3  S-12 ("no card declares clearHL(s)") has NO successor as a statement about data, and none is
//     invented in the unit file. A migrated card writes no prologue, so there is nothing to fold;
//     `clearHL` is on no kit, so no card could import one. The only remaining form of the rule is the
//     source count printed below, and it is 0 over all 108.
// Q4  D-14's `posterFirst: true` is an ARGUMENT to defineCard, so it is inside makeInit's closure and
//     unreadable from the module namespace. The refactor did not change that: it was an argument to
//     makeInit before. Counted here from source, 108 of 108, because that is the only place it is
//     visible without a browser.
// Q5  REFACTOR-PLAN 4 records "18 of 21 cards needed zero escape hatches, and the three justified
//     cases are api-structure, node-allocatable and pod-sandbox-cri". Measured from the specs, the
//     escape set {reset.extra, part.tune, part.raw, step.enter, step.motion, F.run fn} is carried by
//     7 cards, so 14 of 21 are clean rather than 18. The four the plan does not name are
//     cpu-throttling, resource-quota, scheduler-decision and server-side-apply, and all four are
//     `tune` or `raw`, two verbs that did not exist when that sentence was written. No card is at
//     fault; the sentence predates the vocabulary.
//
// ===========================================================================================
// WHAT THIS FILE IS BLIND TO
// ===========================================================================================
//   - Anything an escape builds. A P.raw make(refs) and a tune(el, refs) are functions; their parts
//     are counted, their effects are not.
//   - The 87 legacy cards' step shape. Their steps are inside makeInit's closure, so the spec-form
//     census counts 137 steps out of 650. That gap IS the migration measure and shrinks to zero.
//   - Whether any of this draws correctly. Every number here is about declarations.
//
// A LOCAL COMMENT BLANKER, and why it is not in ../fixtures/. The original ran its regexes over a
// comment-stripped copy via tools/prose.mjs stripComments, which was deleted with tools/ and has no
// successor in fixtures/prose.mjs. Rather than edit a fixture two other files are being written
// against, this file blanks whole comment LINES only. That is sound for these particular patterns:
// every one of them is anchored to column 0 or column 2 of a code line, so an inline trailing comment
// cannot produce a match and a full-line comment is removed. If this census ever grows a pattern that
// is not line-anchored, a real stripper belongs in fixtures/prose.mjs first.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { cards, categories } from '../fixtures/catalog.mjs';
import { cardForm, importAll, importLib } from '../fixtures/module.mjs';

const catalogued = await cards();
const CARD_COUNT = catalogued.length;
const CATS = await categories();
const modules = await importAll();
const { OPACITY } = await importLib('tokens.js');

// What the old census read, when it read 108 of everything.
const RECORDED_BEFORE = {
  'class Scene': 108,
  'constructor(host)': 108,
  'reset() { this.build(); }': 108,
  'makeInit export': 108,
  'function resetStep(s)': 108,
  'enter() bodies': 650,
  'enter() opening with resetStep(s)': 650,
};

// check-canon.mjs's own patterns, copied verbatim so the two numbers are comparable. A looser
// rewrite of them would make the before/after column meaningless.
const SOURCE_PATTERNS = {
  'class Scene': /^class Scene \{$/gm,
  'constructor(host)': /^  constructor\(host[^)]*\) \{/gm,
  'reset() { this.build(); }': /^  reset\(\) \{ this\.build\(\); \}$/gm,
  'makeInit export': /^export const init = makeInit\(Scene, STEPS, \{ posterFirst: true \}\);$/gm,
  'function resetStep(s)': /^function resetStep\(s\) \{/gm,
  'function clearHL(s)': /^function clearHL\(s\) \{/gm,
  // The two shapes the migrated form writes instead. Not in the original: it had no reason to exist.
  'defineCard export': /^export const init = defineCard\(SCENE, STEPS_SPEC, \{ posterFirst: true \}\);$/gm,
  'export const SCENE': /^export const SCENE = \{$/gm,
  'export const STEPS_SPEC': /^export const STEPS_SPEC = \[$/gm,
};

const blankCommentLines = (src) =>
  src.split('\n').map(l => (/^\s*(\/\/|\*|\/\*)/.test(l) ? '' : l)).join('\n');

// The original walked enter() bodies by bracket matching rather than by a fixed shape, so a step
// that opened with something else was counted and reported instead of missed. Kept identical.
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

// Parts, groups flattened. Same walk as the unit file; kept local rather than pushed into a fixture
// two sibling agents are writing against in the same pass.
function flatParts(scene) {
  const out = [], nulls = [];
  const walk = (parts, path) => {
    (parts || []).forEach((part, i) => {
      const at = `${path}[${i}]`;
      if (!part) { nulls.push(at); return; }
      out.push({ part, at });
      if (part.kind === 'group') walk(part.p && part.p.parts, `${at}.parts`);
    });
  };
  walk(scene.parts, 'parts');
  return { out, nulls };
}

const pad = (n, w = 4) => String(n).padStart(w);
const histLine = (m) => [...m.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
  .map(([k, v]) => `${k} ${v}`).join(', ');

test('skeleton census: the old source form and the new spec form, side by side (report only)', async (t) => {
  const lines = [];

  // -------------------------------------------------------------------------------------------
  // 1. The source form, with the original regexes.
  // -------------------------------------------------------------------------------------------
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
  lines.push(`1. THE OLD SOURCE CENSUS, check-canon.mjs regexes verbatim, over ${CARD_COUNT} cards`);
  for (const [k, n] of Object.entries(srcTotals)) {
    const was = RECORDED_BEFORE[k];
    lines.push(`   ${pad(n)}  ${k}${was === undefined ? '   (not in the original census)' : `   was ${was}`}`);
  }
  lines.push(`   ${pad(enters)}  enter() bodies   was ${RECORDED_BEFORE['enter() bodies']}`);
  lines.push(`   ${pad(prologues)}  of those opening with resetStep(s)   was ${RECORDED_BEFORE['enter() opening with resetStep(s)']}`);
  lines.push(`   ${pad(posterFirst)}  cards passing { posterFirst: true } (D-14, Q4: unreadable from the namespace)`);
  lines.push('   THE OLD CENSUS IS NOW BLIND TO A STEP. It reads enter() bodies with a brace; a migrated');
  lines.push(`   step is an object in an array, so it counts ${enters} where the catalog holds 650 steps.`);

  // -------------------------------------------------------------------------------------------
  // 2. Per category, which is the measure the three remaining categories are run against.
  // -------------------------------------------------------------------------------------------
  lines.push('');
  lines.push('2. PER CATEGORY, the measure for the three categories still to migrate');
  lines.push('   category    cards  src lines  class Scene  defineCard  if (ctx.reduced)  role: \'..\'');
  for (const cat of CATS) {
    const o = perCat.get(cat);
    lines.push(`   ${cat.padEnd(10)} ${pad(o.cards, 6)} ${pad(o.lines, 10)} ${pad(o.scene, 12)} ${pad(o.define, 11)} ${pad(o.reduced, 17)} ${pad(o.role, 11)}`);
  }
  lines.push('   A migrated category reads 0 / n / 0: the reduced guard is derived by flowLights and the');
  lines.push('   role is bound once by the kit, so both literal counts go to zero as the category lands.');

  // -------------------------------------------------------------------------------------------
  // 3. The new census: the spec form.
  // -------------------------------------------------------------------------------------------
  const kinds = new Map(), stepFields = new Map(), verbs = new Map(), shades = new Map(), step0 = new Map();
  const hooks = new Map([
    ['SCENE.reset.extra', 0], ['part.tune', 0], ['part.raw', 0],
    ['step.enter', 0], ['step.motion', 0], ['F.run fn', 0],
  ]);
  const softFields = new Map([['step.rewind', 0], ['step.reducedLit', 0]]);
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

    // Every ref a static reader can see. Wires land in refs.wires, not in refs, so a wire key and a
    // box key of the same name are two different refs and must not be merged here.
    const refKeys = new Set();
    for (const { part } of out) {
      bump(kinds, part.kind);
      const p = part.p || {};
      if (part.key !== undefined) keyedParts++;
      if (part.key !== undefined && part.kind !== 'wire') refKeys.add(part.key);
      if (part.kind === 'packets') refKeys.add(p.id === undefined ? 'packetLayer' : p.id);
      if (part.kind === 'pod') {
        for (const k of ['shellKey', 'innerKey', 'id']) if (p[k]) refKeys.add(p[k]);
      }
      if (typeof p.tune === 'function') { bump(hooks, 'part.tune'); mark(c.id, 'tune'); }
      if (part.kind === 'raw') { bump(hooks, 'part.raw'); mark(c.id, 'raw'); }
      if (p.opacity !== undefined) bump(shades, String(p.opacity));
    }
    const reset = scene.reset || {};
    if (typeof reset.extra === 'function') { bump(hooks, 'SCENE.reset.extra'); mark(c.id, 'reset.extra'); }
    for (const field of ['keys', 'pods']) {
      for (const k of reset[field] || []) {
        if (!refKeys.has(k)) q1.push(`${c.id}  reset.${field} names "${k}", which no declared part creates`);
      }
    }

    specSteps += ns.STEPS_SPEC.length;
    const first = ns.STEPS_SPEC[0];
    bump(step0, `id "${first.id}", flow ${!!first.flow}, motion ${!!first.motion}, narration ${first.narration !== undefined}`);
    for (const step of ns.STEPS_SPEC) {
      for (const k of Object.keys(step)) bump(stepFields, k);
      if (step.enter) { bump(hooks, 'step.enter'); mark(c.id, 'enter'); }
      if (step.motion) { bump(hooks, 'step.motion'); mark(c.id, 'motion'); }
      if (step.rewind) { bump(softFields, 'step.rewind'); }
      if (step.reducedLit) { bump(softFields, 'step.reducedLit'); }
      for (const [, v] of Object.entries(step.opacity || {})) bump(shades, String(v));
      for (const e of step.flow || []) {
        bump(verbs, e.verb);
        if (e.verb === 'run' && typeof (e.p || {}).fn === 'function') { bump(hooks, 'F.run fn'); mark(c.id, 'run'); }
      }
    }
  }

  const cleanCards = specMigrated - hookCards.size;
  lines.push('');
  lines.push('3. THE NEW SPEC CENSUS, read off SCENE and STEPS_SPEC with no browser');
  lines.push(`   ${pad(specMigrated)}  migrated cards, ${specLegacy} legacy, ${specMigrated + specLegacy} of ${CARD_COUNT} accounted for`);
  lines.push(`   ${pad(topParts)}  top-level parts, ${allParts} with groups flattened, ${nullParts} conditional null entries appendParts skips`);
  lines.push(`   ${pad(keyedParts)}  parts carrying a key, so reachable as a ref`);
  lines.push(`   ${pad(specSteps)}  steps declared as data, out of 650 in the catalog`);
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
  lines.push(`   Q5: REFACTOR-PLAN records 18 of 21 clean and names 3 cards. Measured: ${cleanCards} of ${specMigrated} clean,`);
  lines.push('   because tune and raw did not exist as verbs when that sentence was written.');

  lines.push('');
  lines.push(`5. QUEUE Q1, reset keys naming a ref no part declares: ${q1.length} finding(s)`);
  for (const l of q1) lines.push(`   ${l}`);
  lines.push('   Each one is either a typo that silently clears nothing, or a ref an escape creates.');
  lines.push(`   Q3, source count of "function clearHL(s)" over ${CARD_COUNT} cards: ` +
    `${srcTotals['function clearHL(s)']}. S-12 has no data successor, and this is its only remaining form.`);
  lines.push('===== end of report =====');
  console.log(lines.join('\n'));

  // -------------------------------------------------------------------------------------------
  // THE ONE ASSERTION, and it is a cross-check rather than a threshold. A census that scanned a
  // subset prints small numbers and looks exactly like a young migration, so the count derived from
  // the EXPORT SURFACE and the count derived from the SOURCE have to agree, and both have to add up
  // to the catalog. Two independent readings of the same fact: if either walk goes short, they part.
  // -------------------------------------------------------------------------------------------
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
