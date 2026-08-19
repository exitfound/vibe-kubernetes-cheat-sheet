// skeleton-census.test.mjs: R-skeleton's CENSUS, report only. The mandatory half of
// R-skeleton, R-viewbox and the source half of R-opacity live in ../unit/skeleton.test.mjs; this file
// holds the counting, the cross-check that the counting is honest, and the queue of skeleton facts
// that are not blocking yet.
//
// ===========================================================================================
// WHAT SECTION 1 COUNTS, AND WHY A CENSUS OF THE LEGACY FORM IS STILL RUN
// ===========================================================================================
// A card is generated from data, so the hand-written skeleton has no home in the tree: `class Scene`,
// `constructor(host)`, `reset() { this.build(); }`, the `makeInit` export, `function resetStep(s)`
// and `function clearHL(s)` all read 0 over 108 cards. Section 1 runs those six patterns anyway, and
// the zero is what they are FOR: they are a LEGACY-FORM TRIPWIRE, and any non-zero is a card that
// has gone back to writing its own skeleton by hand. Section 2 prints the same measure per category,
// so the tripwire names the category it fired in. Nothing below fails on a finding.
//
// A PATTERN WITH A BRACE IN IT CANNOT COUNT A STEP, and the `enter() bodies` row is the standing
// demonstration. A step is an object in an array, so nothing looking for `enter(s) {` reaches one:
// that row reads 17, and those 17 are the `step.enter` escapes written in method shorthand rather
// than any count of steps. The catalog holds 650 steps and section 3 reads them off the data.
//
// WHAT FEEDS THE ONE ASSERTION, because it is NOT those six patterns. The cross-check at the bottom
// takes specMigrated off the EXPORT SURFACE (cardForm over the module namespace) and sourceMigrated
// off the SOURCE with /^export const init = defineCard\(/m, and requires the two to agree and both
// to add up to the catalog. Both readings are of the CURRENT form, so the assertion stands with
// every legacy pattern deleted and no number in this file rests on one.
//
// ===========================================================================================
// THE QUEUE: skeleton facts that are measured here and NOT enforced anywhere
// ===========================================================================================
// Q1  reset.keys and reset.pods naming a ref NOTHING creates: neither a part `key:` nor a
//     `refs.x =` inside an escape body. What counts as creating one is settled below, in WHAT
//     COUNTS AS CREATING A REF, and an escape-created name counts: reading part keys alone files 12
//     escape-created refs on four cards as findings, and every one of them is false. A queue made
//     of false findings stops being read, and a real typo drowns in it.
// Q2  S-11 says the prologue runs the card's extras BEFORE clearWires. makeResetStep runs
//     reset.extra AFTER it. Invisible today: the one extra in the catalog is
//     cluster-api-structure's resetWatchArrow, which writes strokeDasharray on an arrow and touches
//     no wire, so the order it runs in cannot show. Recorded, not repaired:
//     the repair is a change to js/lib/ and would need its own diff.
// Q3  S-12 ("no card declares clearHL(s)") has NO successor as a statement about data, and none is
//     invented in the unit file. A migrated card writes no prologue, so there is nothing to fold;
//     `clearHL` is on no kit, so no card could import one. The only remaining form of the rule is the
//     source count printed below, and it is 0 over all 108.
// Q4  D-14's `posterFirst: true` is an ARGUMENT to defineCard, so it lives inside a closure and is
//     unreadable from the module namespace: no reading of the export surface can reach it. Counted
//     here from source, 108 of 108, because that is the only place it is visible without a browser.
// Q5  A recorded claim, "18 of 21 cards needed zero escape hatches, and the three justified cases
//     are api-structure, node-allocatable and pod-sandbox-cri", against what section 4 measures.
//     TWO POPULATIONS, and the printed line names both: the claim is about the 21 CLUSTER cards,
//     while section 4 counts the escape set {reset.extra, part.tune, part.raw, step.enter,
//     step.motion, F.run fn} over the whole catalog and prints `clean of 108`. In cluster the set is
//     carried by 7 cards, so 14 of 21 are clean rather than 18: the four the claim does not name are
//     cpu-throttling, resource-quota, scheduler-decision and server-side-apply, and all four are
//     `tune` or `raw`. No card is at fault, and the two verbs are the whole of the difference.
//
// ===========================================================================================
// WHAT COUNTS AS CREATING A REF, which is the whole of what Q1 stands on
// ===========================================================================================
// Two sources, and both are read:
//   - a part's `key:`, plus a pod's shellKey / innerKey and the packets layer, off the data
//   - a LITERAL `refs.x =` or `refs['x'] =` inside an escape body, read out of fn.toString()
// NEITHER reader is invented here and neither is copied: both are `refUniverse` in
// ../fixtures/spec.mjs, which ../unit/spec-steps.test.mjs and ../unit/spec-scene.test.mjs resolve
// their names against too. One regex, one recursive collect over the whole SCENE and STEPS_SPEC
// object rather than a hand-listed set of hook fields, and one answer to what a ref IS. A drift
// between the three files would surface as a disagreement about which cards are broken, which is
// why the reader has one home. Q1 was the reason it had to: the two unit files would go red over a
// reset key naming something nothing creates, and this queue, which exists for exactly that, would
// print 0 if its own set were the wider one.
//
// WHAT IS NOT A REF, and why the exclusion changes no number: a pod's `id` and a packets layer's
// `id` create nothing. Both are the DOM id of a wrapper `g`, never filed in refs. Measured on this
// catalog: 67 pod parts carry an id and every one repeats a name already filed as a ref, 0 packets
// parts carry one, so counting them would widen the set by nothing and Q1 stays 0. What excluding
// them stops is a real typo hiding behind a coincidence with an element id.
//
// MEASURED, and printed as section 4b on every run so it cannot go stale here: of the six escape
// kinds this file counts, only `part.tune` and the factories on `part.raw` assign a ref at all.
// reset.extra, step.enter, step.motion and F.run assign none. All six are scanned anyway, because
// collectFns takes the object and not a list of field names, and an `unattributed` row appears the
// day a ref arrives from a function no kind branch names.
//
// ===========================================================================================
// WHAT THIS FILE IS BLIND TO
// ===========================================================================================
//   - A ref built through a COMPUTED key, `refs[k] = ...`. Unreadable by construction, which is why
//     schemes/network/CLAUDE.md forbids one; the tree holds none, and one would read as a Q1 typo.
//   - A ref a HELPER assigns. fn.toString() ends at the escape's own body, so an escape that calls
//     out to a module-level builder taking `refs` hides that builder's assignments.
//   - WHEN a ref appears. A ref a step escape creates is counted as created even though reset runs
//     first, the same widening as above. No step escape assigns one today.
//   - What an escape builds beyond a ref. A P.raw make(refs) and a tune(el, refs) draw elements;
//     those elements are counted nowhere, only the names they are filed under.
//   - A card written in any form but data. Sections 3 to 5 read SCENE and STEPS_SPEC, so such a
//     card would be counted nowhere. The catalog is 108 migrated and 0 legacy, which is what puts
//     the whole tree in reach, and the cross-check at the bottom is what keeps that claim honest.
//   - Whether any of this draws correctly. Every number here is about declarations.
//
// A LOCAL COMMENT BLANKER, and why it is not in ../fixtures/. The patterns must not match text
// inside a comment, and fixtures/prose.mjs carries no stripper. This one stays local because it has
// ONE caller, unlike the escape reader above, and it blanks whole comment LINES only. That is sound for these patterns:
// every one of them is anchored to column 0 or column 2 of a code line, so an inline trailing comment
// cannot produce a match and a full-line comment is removed. If this census ever grows a pattern that
// is not line-anchored, a real stripper belongs in fixtures/prose.mjs first.

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

// The six hand-written-skeleton patterns. Each reads 0 on a declarative catalog, and 0 is their
// resting value: a non-zero is a card that has gone back to writing its own skeleton.
const LEGACY_FORM = new Set([
  'class Scene', 'constructor(host)', 'reset() { this.build(); }', 'makeInit export',
  'function resetStep(s)', 'function clearHL(s)',
]);

// Exact rather than loose, every one anchored to a whole line: a card that slipped back reads as a
// count, and a card that merely mentions the words in passing does not.
const SOURCE_PATTERNS = {
  'class Scene': /^class Scene \{$/gm,
  'constructor(host)': /^  constructor\(host[^)]*\) \{/gm,
  'reset() { this.build(); }': /^  reset\(\) \{ this\.build\(\); \}$/gm,
  'makeInit export': /^export const init = makeInit\(Scene, STEPS, \{ posterFirst: true \}\);$/gm,
  'function resetStep(s)': /^function resetStep\(s\) \{/gm,
  'function clearHL(s)': /^function clearHL\(s\) \{/gm,
  // The three shapes the declarative form writes instead.
  'defineCard export': /^export const init = defineCard\(SCENE, STEPS_SPEC, \{ posterFirst: true \}\);$/gm,
  'export const SCENE': /^export const SCENE = \{$/gm,
  'export const STEPS_SPEC': /^export const STEPS_SPEC = \[$/gm,
};

const blankCommentLines = (src) =>
  src.split('\n').map(l => (/^\s*(\/\/|\*|\/\*)/.test(l) ? '' : l)).join('\n');

// Bracket matching rather than a fixed shape, so a body that opens with something other than
// resetStep(s) is counted and reported rather than missed.
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

// Parts, groups flattened, off the shared walk. A HOLE in the list is collected rather than skipped:
// a null part draws nothing and is a finding, not a shorter run.
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

  // -------------------------------------------------------------------------------------------
  // 1. The source form: the legacy tripwire, plus the three shapes the declarative form writes.
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
  lines.push(`1. THE SOURCE CENSUS, the legacy skeleton as a tripwire, over ${CARD_COUNT} cards`);
  for (const [k, n] of Object.entries(srcTotals)) {
    lines.push(`   ${pad(n)}  ${k}   ${LEGACY_FORM.has(k) ? 'LEGACY FORM, 0 is the resting value' : 'the declarative form'}`);
  }
  lines.push(`   ${pad(enters)}  enter() bodies with a brace   step.enter escapes in method shorthand, NOT steps`);
  lines.push(`   ${pad(prologues)}  of those opening with resetStep(s)   LEGACY FORM, 0 is the resting value`);
  lines.push(`   ${pad(posterFirst)}  cards passing { posterFirst: true } (D-14, Q4: unreadable from the namespace)`);
  lines.push('   A PATTERN WITH A BRACE IN IT CANNOT COUNT A STEP: a step is an object in an array. The row');
  lines.push(`   above reads ${enters} escape bodies where the catalog holds 650 steps, and section 3 reads`);
  lines.push('   those off the data.');

  // -------------------------------------------------------------------------------------------
  // 2. Per category. All four are migrated, so this is a shape census and not a burn-down.
  // -------------------------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------------------------
  // 3. The new census: the spec form.
  // -------------------------------------------------------------------------------------------
  const kinds = new Map(), stepFields = new Map(), verbs = new Map(), shades = new Map(), step0 = new Map();
  const hooks = new Map([
    ['SCENE.reset.extra', 0], ['part.tune', 0], ['part.raw', 0],
    ['step.enter', 0], ['step.motion', 0], ['F.run fn', 0],
  ]);
  const softFields = new Map([['step.rewind', 0], ['step.reducedLit', 0]]);
  // Refs created by an escape rather than by a key, per escape kind. `unattributed` is the row that
  // fires when a ref arrives from a function none of the six branches below reaches.
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

    // Every ref a static reader can see, off the shared universe: declared keys plus escape-assigned
    // names, wires excluded because they land in refs.wires and clearHighlights reads refs.
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
        // A raw part carries make and may carry tune, so both factories are read, not just make.
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

    // The safety net over the same two objects: a function the six branches missed still gets read,
    // and the name it assigns is filed as `unattributed` rather than reported as a typo.
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
  lines.push(`   Q5: the recorded claim is 18 of the 21 CLUSTER cards clean, naming 3. Measured over the whole`);
  lines.push(`   catalog: ${cleanCards} of ${specMigrated} clean, and in cluster 14 of 21, because tune and raw are escapes too.`);

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
