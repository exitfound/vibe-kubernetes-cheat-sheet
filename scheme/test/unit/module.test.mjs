// module.test.mjs: what a card module owes, asserted by IMPORTING it. Successor to check-canon's
// R-kitparity, and to the part of the S- block of ../../CANON.md that is readable without a
// browser: S-02 (runtime half), S-08b, S-21, S-22, S-23, S-28. It also holds L-08a, the one canon
// row about two categories agreeing with each other, because the two objects it is about are kit
// exports and this is the file that compares kits.
//
// R-modulepath (D-02) and the folder contract (S-20, D-03) were here and are now in
// unit/catalog.test.mjs alone. The note at the foot of this file says which test took over what,
// and why putting a second copy back would be a loss rather than more coverage.
//
// Everything here runs in bare Node in well under a second, which is only possible because
// lib/motion.js guards its window.matchMedia probe (see ../fixtures/module.mjs). Before that guard
// all 108 cards threw at module load and every one of these facts would have needed a browser.
//
// ===========================================================================================
// WHAT THIS FILE DELIBERATELY DOES NOT TRY TO SEE
// ===========================================================================================
// A LEGACY card exports exactly one symbol, `init`, and its step list is an ARGUMENT to makeInit,
// so the step `id`, `duration`, `narration` and the diagram `aria-label` live inside a closure and
// are statically unreachable. They are read by RENDER (window.__schemeCtl._timeline.steps). A
// MIGRATED card exports SCENE and STEPS_SPEC as data and those facts come off the namespace, but
// reading them is the job of the spec tests, not of this file: here the two forms are only counted.
// Do NOT add a regex over a card body to fake any of it: source scraping is the mechanism this
// refactor is retiring, and a scraper that stops matching goes quiet rather than red.
//
// The one regex over card source that stays is the IMPORT header. An import statement is structure,
// not prose: it is the module graph written down, it cannot be expressed as data by any refactor,
// and a specifier that stops being found makes the card fail its "imports its own kit" assertion
// rather than passing silently.
//
// Not here because they need a rendered card: the shape of `Scene`, the `resetStep` prologue, the
// reduced-motion split, z-order, viewBox. Not here because they are body-text scans that belong to
// a source-text test or to wave 2: BANNED-SYMBOL, RIPPLE-OPT, R-rawpulse, R-skeleton, R-opacity.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  ROOT, cards, categories, census,
} from '../fixtures/catalog.mjs';
import { CARD_FORMS, cardForm, exportSurface, importAll, importKit, importLib } from '../fixtures/module.mjs';

// ---------------------------------------------------------------------------------------------
// Gathered once. importAll() carries the census guard, so a run that resolved fewer than the whole
// catalog throws HERE, before a single assertion has had the chance to pass over a short list.
// ---------------------------------------------------------------------------------------------
const catalogued = await cards();
const CARD_COUNT = catalogued.length;
const CATS = await categories();

const modules = await importAll();
const schemeKit = await importLib('scheme-kit.js');

const kits = new Map();
for (const c of CATS) kits.set(c, await importKit(c));

const sources = new Map();
for (const c of catalogued) sources.set(c.id, await readFile(c.path, 'utf8'));

// A static import statement, with its clause and its specifier. Written to span newlines, because a
// clause may be wrapped, and anchored to line start so a specifier quoted inside a `//` or ` * `
// comment cannot be read as an import.
const IMPORT_RE = /(?:^|\n)[ \t]*import\s+(?:([^;]*?)\s+from\s+)?(['"])([^'"]+)\2\s*;/g;

const importsOf = (src) =>
  [...src.matchAll(IMPORT_RE)].map(m => ({ clause: (m[1] || '').trim(), spec: m[3] }));

// The names a clause binds. Every card today uses the named form only, so a default or namespace
// import (no braces) is reported rather than skipped.
function boundNames(clause) {
  const braced = clause.match(/\{([\s\S]*)\}/);
  if (!braced) return null;
  return braced[1].split(',').map(s => s.trim()).filter(Boolean);
}

const listing = (items, cap = 8) =>
  items.slice(0, cap).join('\n  ') + (items.length > cap ? `\n  ... and ${items.length - cap} more` : '');

// ---------------------------------------------------------------------------------------------
describe('card module surface', () => {
  test(`the whole catalog imports in bare Node (${CARD_COUNT} cards)`, (t) => {
    assert.ok(CARD_COUNT > 0, 'the catalog is empty: data.js resolved to no cards at all');
    census('module importAll', modules.size, CARD_COUNT);
    t.diagnostic(`${modules.size} card modules imported, no browser, nothing stubbed`);
  });

  // S-02, narrowed 2026-08-15: there is ONE legal surface, the migrated one. This is a set EQUALITY
  // per card, never a containment: a card that grew one stray export would satisfy "contains init"
  // and read as conforming.
  //
  // LEGACY IS STILL NAMED, and that is the whole reason CARD_FORMS keeps two entries. A regression
  // has to be told apart from a typo: `init` alone is a card that went back to the hand-written
  // form, and `[init, SCENE]` is a card someone broke halfway. Both fail, with different messages.
  // The counter stays printed because a run that walked fewer cards must not read as a clean one.
  test('every card is on the one legal export form, and a legacy surface is a regression', (t) => {
    const findings = [];
    const tally = new Map(Object.keys(CARD_FORMS).map(f => [f, 0]));
    let walked = 0;
    for (const [id, ns] of modules) {
      walked++;
      const form = cardForm(ns);
      if (!form) {
        findings.push(`${id}  exports [${exportSurface(ns)}], which is neither ` +
          Object.entries(CARD_FORMS).map(([f, s]) => `${f} [${s}]`).join(' nor '));
        continue;
      }
      tally.set(form, tally.get(form) + 1);
      if (typeof ns.init !== 'function') findings.push(`${id}  init is ${typeof ns.init}, not a function`);
      if (form !== 'migrated') {
        findings.push(`${id}  exports [${exportSurface(ns)}], the RETIRED hand-written surface. ` +
          'S-02 admits one form since 2026-08-15: SCENE, STEPS_SPEC and init from defineCard');
        continue;
      }
      // The whole reason the surface grew: SCENE and STEPS_SPEC are DATA a test reads with no
      // browser. A card exporting the right three names with a builder function behind one of them
      // would pass the surface check and leave the spec tests nothing to read.
      const scene = ns.SCENE;
      if (scene === null || typeof scene !== 'object' || Array.isArray(scene)) {
        findings.push(`${id}  SCENE is ${Array.isArray(scene) ? 'an array' : typeof scene}, expected a plain object`);
      } else if (Object.keys(scene).length === 0) {
        findings.push(`${id}  SCENE is an empty object, so nothing about the scene is readable`);
      }
      if (!Array.isArray(ns.STEPS_SPEC)) {
        findings.push(`${id}  STEPS_SPEC is ${typeof ns.STEPS_SPEC}, expected an array`);
      } else if (ns.STEPS_SPEC.length === 0) {
        findings.push(`${id}  STEPS_SPEC is an empty array, so the card declares no step`);
      }
    }
    census('export surface', walked, CARD_COUNT);
    assert.equal(findings.length, 0,
      `${findings.length} of ${walked} card(s) are off the one legal export form:\n  ${listing(findings)}`);
    // Sums to the catalog or the counter is not a measure of anything: a card counted in neither
    // form, or in two, would leave a plausible-looking pair of numbers that adds up short.
    const counted = [...tally.values()].reduce((a, b) => a + b, 0);
    assert.equal(counted, CARD_COUNT,
      `the migration counter accounts for ${counted} card(s), the catalog lists ${CARD_COUNT}`);
    t.diagnostic(`migration: ${tally.get('migrated')} migrated, ${tally.get('legacy')} legacy, ` +
      `${counted} of ${CARD_COUNT} cards accounted for`);
  });
});

// ---------------------------------------------------------------------------------------------
// The controller contract. `init` is not written by a card: makeInit returns it, so its signature
// and the object it returns are one fact for all 108, provable by identity of source text rather
// than by matching the call site with a regex.
// ---------------------------------------------------------------------------------------------
class ProbeScene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }
  build() {}
  reset() { this.build(); }
}
const probeInit = schemeKit.makeInit(ProbeScene, [{ id: 'idle', duration: 1000, enter() {} }], { posterFirst: true });
const controller = probeInit({ replaceChildren() {} }, {});

// What app.js reaches for on the object init returns, read off js/app.js rather than off a document.
// `call` records HOW it reaches: a member app.js only touches behind `x.member && x.member()` may
// go missing without breaking the page, one it calls flat may not.
const APP_CONTROLLER_MEMBERS = {
  setSpeed:    { type: 'function', call: 'unconditional' },
  setLoop:     { type: 'function', call: 'unconditional' },
  gotoStep:    { type: 'function', call: 'unconditional at open, feature-detected on deep link and scrub' },
  posterFirst: { type: 'boolean',  call: 'read flat, picks the 1000ms dwell over 500ms' },
  autoPlay:    { type: 'function', call: 'feature-detected, falls back to setTimeout + play()' },
  play:        { type: 'function', call: 'unconditional' },
  pause:       { type: 'function', call: 'unconditional' },
  isPlaying:   { type: 'function', call: 'feature-detected: isPlaying && isPlaying()' },
  isLooping:   { type: 'function', call: 'feature-detected: isLooping && isLooping()' },
  step:        { type: 'function', call: 'unconditional' },
  restart:     { type: 'function', call: 'unconditional' },
  destroy:     { type: 'function', call: 'unconditional, inside a try/catch on dialog close' },
};

describe('the init contract', () => {
  test(`all ${CARD_COUNT} inits are the one function makeInit returns`, (t) => {
    const want = probeInit.toString();
    const findings = [];
    let walked = 0;
    for (const [id, ns] of modules) {
      walked++;
      const fn = ns.init;
      if (typeof fn !== 'function') { findings.push(`${id}  init is ${typeof fn}`); continue; }
      if (fn.name !== 'init') findings.push(`${id}  init.name is "${fn.name}"`);
      if (fn.length !== probeInit.length) findings.push(`${id}  init takes ${fn.length} required argument(s), makeInit gives ${probeInit.length}`);
      if (fn.toString() !== want) findings.push(`${id}  init is not makeInit's closure, it is a body of its own`);
    }
    census('init identity', walked, CARD_COUNT);
    assert.equal(findings.length, 0,
      `${findings.length} card(s) hand app.js an init that is not makeInit's:\n  ${listing(findings)}`);
    t.diagnostic(`${walked} inits, 1 distinct body, signature init(root, callbacks = {}) so arity ${probeInit.length}`);
  });

  test(`the controller carries the ${Object.keys(APP_CONTROLLER_MEMBERS).length} members app.js consumes`, (t) => {
    const findings = [];
    for (const [name, { type }] of Object.entries(APP_CONTROLLER_MEMBERS)) {
      if (!(name in controller)) { findings.push(`${name}  missing from the controller`); continue; }
      if (typeof controller[name] !== type) findings.push(`${name}  is ${typeof controller[name]}, app.js uses it as ${type}`);
    }
    assert.equal(findings.length, 0,
      `${findings.length} member(s) app.js depends on are not on the object init returns:\n  ${listing(findings)}`);
    const detected = Object.entries(APP_CONTROLLER_MEMBERS).filter(([, m]) => m.call.startsWith('feature-detected')).length;
    t.diagnostic(`${Object.keys(APP_CONTROLLER_MEMBERS).length} consumed, ${detected} of them behind a feature detect, ` +
      `${Object.keys(controller).length} on the controller in all`);
  });

  // The other direction, and the one that rots: app.js growing a call to a member the kit never
  // returns is a TypeError on a user click that nothing else in the suite would reach.
  test('app.js reaches for no controller member the kit does not return', async (t) => {
    const src = await readFile(join(ROOT, 'js', 'app.js'), 'utf8');
    const found = new Set([...src.matchAll(/\b(?:ctrl|activeController)\s*(?:\?\.)?\.\s*([A-Za-z_$][\w$]*)/g)].map(m => m[1]));
    assert.ok(found.size > 0,
      'read 0 controller members out of js/app.js: the controller was renamed away from ctrl / activeController ' +
      'and this assertion has gone blind, which is worse than a finding');
    assert.deepEqual([...found].sort(), Object.keys(APP_CONTROLLER_MEMBERS).sort(),
      'js/app.js and the table in this file disagree about which controller members are consumed');
    for (const name of found) {
      assert.ok(name in controller, `js/app.js calls ctrl.${name}, which makeInit does not return`);
    }
    t.diagnostic(`${found.size} distinct controller members reached for in js/app.js, all provided`);
  });
});

// ---------------------------------------------------------------------------------------------
// R-kitparity / S-22 / S-23. The four kits re-export one list and the SIZE of that list is written
// down nowhere on purpose: comparing the kits to each other is the source of truth. So this reads
// the four namespaces and compares them, and the number below is computed, never asserted against a
// constant. A name is counted as re-exported when the kit and scheme-kit hold the SAME binding,
// which is what an ES re-export gives and what a locally redefined lookalike would not.
// ---------------------------------------------------------------------------------------------
const sharedOf = (kitNs) => new Set(
  Object.keys(kitNs).filter(n => n in schemeKit && kitNs[n] === schemeKit[n]));

const shared = new Map(CATS.map(c => [c, sharedOf(kits.get(c))]));
const ownOf = (cat) => Object.keys(kits.get(cat)).filter(n => !shared.get(cat).has(n)).sort();

describe('kit parity', () => {
  test(`the ${CATS.length} kits re-export one identical list`, (t) => {
    assert.equal(kits.size, CATS.length, `expected ${CATS.length} kits, imported ${kits.size}`);
    const [ref, refNames] = [...shared.entries()][0];
    const findings = [];
    for (const [cat, names] of shared) {
      if (cat === ref) continue;
      const missing = [...refNames].filter(n => !names.has(n)).sort();
      const extra = [...names].filter(n => !refNames.has(n)).sort();
      if (missing.length || extra.length) {
        findings.push(`${cat}-kit.js re-exports a different set than ${ref}-kit.js` +
          (missing.length ? `, missing: ${missing.join(', ')}` : '') +
          (extra.length ? `, extra: ${extra.join(', ')}` : ''));
      }
    }
    assert.equal(findings.length, 0, `${findings.length} kit(s) have drifted:\n  ${listing(findings)}`);

    // A set of four empty sets agrees with itself, so parity alone is not a live rule. These two
    // anchors are what stop an emptied kit from reading as green.
    //
    // The second anchor used to name makeInit and say "which every one of its cards imports from
    // it". Nothing imports makeInit: it is called from defineCardWith inside lib/, and the parse of
    // all 108 import headers gives it zero importers. `defineCard` is the name that sentence was
    // true of, on all 108, so it is the anchor now and the kit surface can lose makeInit without
    // this turning red for the wrong reason. It is read off the kit NAMESPACE rather than off the
    // shared set on purpose: defineCard is each kit's OWN binding, built from defineCardWith with
    // that category's role and tint, so it is by construction not a scheme-kit re-export.
    assert.ok(refNames.size > 0, `${ref}-kit.js re-exports nothing from scheme-kit.js`);
    for (const cat of CATS) {
      assert.equal(typeof kits.get(cat).defineCard, 'function',
        `${cat}-kit.js exports no defineCard function, and every card in that folder imports one ` +
        'from it: the folder would stop loading in the browser.');
    }
    t.diagnostic(`shared kit surface: ${refNames.size} names, identical across ${shared.size} kits`);
  });

  // S-08b. What each kit adds on top is its tint and the two pulses bound to it, and those must NOT
  // be scheme-kit bindings: a kit whose pulsePod came straight from scheme-kit would pulse in the
  // workloads blue whatever its category.
  test('each kit binds its own tint and its two tinted pulses', (t) => {
    const findings = [];
    for (const cat of CATS) {
      const ns = kits.get(cat);
      const own = new Set(ownOf(cat));
      const tintKey = `${cat.toUpperCase()}_TINT`;
      if (!own.has(tintKey)) { findings.push(`${cat}-kit.js has no own ${tintKey}`); }
      else {
        const tint = ns[tintKey];
        if (!Object.isFrozen(tint)) findings.push(`${cat}: ${tintKey} is not frozen`);
        for (const k of ['base', 'bright']) {
          if (typeof tint?.[k] !== 'string') findings.push(`${cat}: ${tintKey}.${k} is ${typeof tint?.[k]}, expected a colour string`);
        }
      }
      for (const p of ['pulsePod', 'pulsePodDim']) {
        if (typeof ns[p] !== 'function') findings.push(`${cat}: ${p} is ${typeof ns[p]}, not a function`);
        else if (!own.has(p)) findings.push(`${cat}: ${p} is scheme-kit's binding, not one bound to ${tintKey}`);
      }
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s) in the per-category kit surface:\n  ${listing(findings)}`);
    t.diagnostic(CATS.map(c => `${c}: +${ownOf(c).length} own (${ownOf(c).join(' ')})`).join(' | '));
  });

  // Ties the parity list to real use. Without this, the shared list could shrink to whatever is
  // left after a bad edit and stay perfectly parallel across all four while cards starve.
  test('every name a card imports from its kit is on that kit, and the shared ones are on all four', (t) => {
    const [, refNames] = [...shared.entries()][0];
    const findings = [];
    const usedShared = new Set();
    let walked = 0;
    for (const c of catalogued) {
      walked++;
      const kitImport = importsOf(sources.get(c.id)).find(i => i.spec === `./${c.category}-kit.js`);
      if (!kitImport) { findings.push(`${c.id}  imports no kit`); continue; }
      const names = boundNames(kitImport.clause);
      if (!names) { findings.push(`${c.id}  imports its kit with a non-named clause: ${kitImport.clause}`); continue; }
      for (const n of names) {
        if (!(n in kits.get(c.category))) { findings.push(`${c.id}  imports ${n} from ${c.category}-kit.js, which does not export it`); continue; }
        if (shared.get(c.category).has(n)) {
          usedShared.add(n);
          for (const other of CATS) {
            if (!shared.get(other).has(n)) findings.push(`${n} is shared in ${c.category} but absent from ${other}-kit.js`);
          }
        }
      }
    }
    census('kit imports', walked, CARD_COUNT);
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    assert.ok(usedShared.size > 0, 'no card imports a single shared kit name, so the parity list is decorative');
    t.diagnostic(`${usedShared.size} of the ${refNames.size} shared names are imported by at least one card`);
  });

  // L-08a. Two categories carry a two-column X grammar and read their columns out of their kit's
  // LAYOUT rather than typing them. The canon says the two grammar objects agree where they
  // overlap, and that a divergence between them would be a DEFECT rather than a choice, which is
  // exactly the kind of sentence that holds until nobody is looking. Nothing guarded it before.
  //
  // ONLY THE OVERLAP IS A RULE. A key one object has and the other does not is the difference
  // between the two grammars (cluster frames its rows in a Node, workloads does not), so those are
  // printed as diagnostics and never asserted. Storage's STO is a different object, overlapping on
  // two keys, and networking has no such grammar at all: neither belongs in this comparison.
  const X_GRAMMARS = [['cluster', 'CLU'], ['workloads', 'WL']];

  // Leaf paths of a plain object: `COL_L.x` rather than `COL_L`, so a nested pair that differs in
  // one field lands as one finding naming that field instead of an opaque object mismatch.
  const leaves = (obj, prefix = '', out = new Map()) => {
    for (const [k, v] of Object.entries(obj)) {
      const at = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) leaves(v, at, out);
      else out.set(at, v);
    }
    return out;
  };

  test(`L-08a the ${X_GRAMMARS.length} X grammars agree on every key they share`, (t) => {
    const read = X_GRAMMARS.map(([cat, name]) => {
      const ns = kits.get(cat);
      assert.ok(ns, `no ${cat}-kit.js was imported, so L-08a was not read at all`);
      assert.equal(typeof ns[name], 'object',
        `${cat}-kit.js exports no ${name} object, and L-08a is written about it. If the grammar ` +
        'was renamed or moved, this test names the wrong thing and CANON.md L-08a names it too.');
      assert.equal(typeof ns.LAYOUT, 'object',
        `${cat}-kit.js exports no LAYOUT, which L-08a says the A / B / C columns are read out of`);
      return { cat, name, grammar: leaves(ns[name]), layout: ns.LAYOUT };
    });
    const [a, b] = read;

    const sharedKeys = [...a.grammar.keys()].filter(k => b.grammar.has(k)).sort();
    const onlyA = [...a.grammar.keys()].filter(k => !b.grammar.has(k)).sort();
    const onlyB = [...b.grammar.keys()].filter(k => !a.grammar.has(k)).sort();
    assert.ok(sharedKeys.length > 0,
      `${a.name} and ${b.name} have no key in common, so this comparison saw nothing. Either one ` +
      'of them was rewritten wholesale or `leaves` stopped reading them.');

    const findings = sharedKeys
      .filter(k => !Object.is(a.grammar.get(k), b.grammar.get(k)))
      .map(k => `${k}: ${a.name} ${a.grammar.get(k)}, ${b.name} ${b.grammar.get(k)}`);
    assert.equal(findings.length, 0,
      `L-08a: ${findings.length} of ${sharedKeys.length} shared key(s) disagree between ` +
      `${a.name} (${a.cat}-kit.js) and ${b.name} (${b.cat}-kit.js):\n  ${listing(findings)}\n` +
      '  L-08a calls a divergence here a defect rather than a choice, so the fix is to bring the ' +
      'two back together. If the two categories are meant to diverge, that is a change to the ' +
      'CANON.md row, made first and on purpose, and this test follows it. Do not relax the test ' +
      'to make a drift green.');

    assert.deepEqual(a.layout, b.layout,
      `L-08a: the LAYOUT derived from ${a.name} and the one derived from ${b.name} are no longer ` +
      'equal, so the A / B / C columns a card picks depend on which folder it sits in. Same ' +
      'ruling as above: change the canon row first, or bring the two back together.');

    t.diagnostic(`${a.name} vs ${b.name}: ${sharedKeys.length} shared leaf key(s), 0 differing, ` +
      `LAYOUT deep-equal. Only ${a.name}: ${onlyA.join(' ') || 'none'}. ` +
      `Only ${b.name}: ${onlyB.join(' ') || 'none'}.`);
  });
});

// ---------------------------------------------------------------------------------------------
// S-21. A card imports its own kit and nothing past it. This is the boundary that makes a kit worth
// having: the moment a card reaches into lib/timeline.js or lib/scheme-kit.js directly, the kit
// stops being the thing that documents what a category may paint with.
// ---------------------------------------------------------------------------------------------
describe('the import boundary', () => {
  test(`each of the ${CARD_COUNT} cards imports its own kit and nothing past it`, (t) => {
    const findings = [];
    const specCount = new Map();
    let walked = 0;
    for (const c of catalogued) {
      walked++;
      const allowed = new Set(['../../lib/svg.js', '../../lib/primitives.js', `./${c.category}-kit.js`]);
      const found = importsOf(sources.get(c.id));
      if (found.length === 0) { findings.push(`${c.id}  no import statement found at all, so this card was not read`); continue; }
      let hasKit = false;
      for (const { spec, clause } of found) {
        specCount.set(spec, (specCount.get(spec) || 0) + 1);
        if (!allowed.has(spec)) {
          findings.push(`${c.id}  imports '${spec}', past its kit. Allowed: ${[...allowed].join(', ')}`);
          continue;
        }
        if (spec === `./${c.category}-kit.js`) hasKit = true;
        if (!boundNames(clause)) findings.push(`${c.id}  imports '${spec}' with a non-named clause: ${clause || '(side effect only)'}`);
      }
      if (!hasKit) findings.push(`${c.id}  never imports ./${c.category}-kit.js`);
    }
    census('import boundary', walked, CARD_COUNT);
    assert.equal(findings.length, 0,
      `${findings.length} import finding(s) over ${walked} cards:\n  ${listing(findings)}`);
    t.diagnostic([...specCount.entries()].sort((a, b) => b[1] - a[1]).map(([s, n]) => `${s} x${n}`).join(', '));
  });

  // The second sentence of S-21: lib/ holds only what every category shares. A lib module reaching
  // back into one category folder would invert the dependency and make that lib module category
  // specific without saying so.
  test('no module under js/lib/ imports from js/schemes/', async (t) => {
    const dir = join(ROOT, 'js', 'lib');
    const files = (await readdir(dir)).filter(n => n.endsWith('.js')).sort();
    assert.ok(files.length > 0, `js/lib/ holds no .js at all, so this walk saw nothing`);
    const findings = [];
    for (const n of files) {
      for (const { spec } of importsOf(await readFile(join(dir, n), 'utf8'))) {
        if (spec.includes('schemes/')) findings.push(`js/lib/${n} imports '${spec}'`);
      }
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    t.diagnostic(`${files.length} modules under js/lib/, none reaching into a category folder`);
  });
});

// ---------------------------------------------------------------------------------------------
// S-28, and the property 0.4b of the refactor plan bought by guarding motion.js. A lib module that
// touches window or document at module load takes the whole unit level of this suite down with it,
// because scheme-kit.js and all 108 cards import through lib/. Keeping it true is cheaper than
// rediscovering it: the failure mode is a ReferenceError at import, not a wrong picture.
// ---------------------------------------------------------------------------------------------
const LIB_REQUIRED = [
  'inspector.js', 'motion.js', 'primitives.js', 'scheme-kit.js',
  'sidebar.js', 'svg.js', 'timeline.js', 'tokens.js',
];

test('every module under js/lib/ imports in bare Node, with no browser global at module load', async (t) => {
  const files = (await readdir(join(ROOT, 'js', 'lib'))).filter(n => n.endsWith('.js')).sort();
  // A floor, not a ceiling: the declarative layer adds modules here and must be walked too, but a
  // walk that lost one of these has stopped covering what it covers today.
  const absent = LIB_REQUIRED.filter(n => !files.includes(n));
  assert.equal(absent.length, 0, `js/lib/ is missing ${absent.length} module(s) this test covers: ${absent.join(', ')}`);

  const findings = [];
  for (const n of files) {
    try {
      const ns = await importLib(n);
      if (Object.keys(ns).length === 0) findings.push(`${n}  imports but exports nothing`);
    } catch (e) {
      findings.push(`${n}  ${e.constructor.name}: ${e.message.split('\n')[0]}`);
    }
  }
  assert.equal(findings.length, 0,
    `${findings.length} of ${files.length} module(s) under js/lib/ do not import outside a browser:\n  ${listing(findings)}`);
  t.diagnostic(`${files.length} modules under js/lib/, all import clean (${LIB_REQUIRED.length} of them required by name)`);
});

// ---------------------------------------------------------------------------------------------
// R-modulepath USED TO LIVE HERE, as two tests, and it has gone to unit/catalog.test.mjs, which is
// where the module PATH belongs: this file's own header says the path is not its subject, and the
// catalog file was already asking all three questions alongside it.
//
//   the id prefix            -> catalog.test.mjs `D-02`. Stricter: it also asserts the derived
//                               `rel` path, which the copy here never read.
//   a stray `module` field   -> catalog.test.mjs `D-01`, twice over: a deepEqual on the whole key
//                               set of an entry, and an explicit `s.module === undefined`.
//   the folder contract      -> catalog.test.mjs `D-03`. Stricter: a deepEqual of the folder
//                               listing against the manifest, so a card CLAIMED but missing is
//                               reported as well as a file on disk that nothing claims.
//
// Both files walked the same population (`cards()` is a projection of `schemes()`), so the
// inclusion is total in all three cases and no coverage was traded for the smaller number. Do not
// put them back: a second copy of a rule is a second thing to update, and the copy that goes stale
// is the one nobody is reading.
// ---------------------------------------------------------------------------------------------
