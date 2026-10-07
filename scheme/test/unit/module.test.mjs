// What a card module owes, by importing it: R-kitparity, S-02, S-08b, S-21, S-22, S-23, S-28 and L-08a.
// Only the import header is read as source text. D-02, S-20 and D-03 live in unit/catalog.test.mjs.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  ROOT, cards, categories, census,
} from '../fixtures/catalog.mjs';
import { CARD_FORMS, cardForm, exportSurface, importAll, importKit, importLib } from '../fixtures/module.mjs';

// importAll() carries the census guard.
const catalogued = await cards();
const CARD_COUNT = catalogued.length;
const CATS = await categories();

const modules = await importAll();
const schemeKit = await importLib('scheme-kit.js');

const kits = new Map();
for (const c of CATS) kits.set(c, await importKit(c));

const sources = new Map();
for (const c of catalogued) sources.set(c.id, await readFile(c.path, 'utf8'));

// Spans newlines, anchored to line start so an import quoted in a comment is not read.
const IMPORT_RE = /(?:^|\n)[ \t]*import\s+(?:([^;]*?)\s+from\s+)?(['"])([^'"]+)\2\s*;/g;

const importsOf = (src) =>
  [...src.matchAll(IMPORT_RE)].map(m => ({ clause: (m[1] || '').trim(), spec: m[3] }));

// A default or namespace import is reported rather than skipped.
function boundNames(clause) {
  const braced = clause.match(/\{([\s\S]*)\}/);
  if (!braced) return null;
  return braced[1].split(',').map(s => s.trim()).filter(Boolean);
}

const listing = (items, cap = 8) =>
  items.slice(0, cap).join('\n  ') + (items.length > cap ? `\n  ... and ${items.length - cap} more` : '');

describe('card module surface', () => {
  test(`the whole catalog imports in bare Node (${CARD_COUNT} cards)`, (t) => {
    assert.ok(CARD_COUNT > 0, 'the catalog is empty: data.js resolved to no cards at all');
    census('module importAll', modules.size, CARD_COUNT);
    t.diagnostic(`${modules.size} card modules imported, no browser, nothing stubbed`);
  });

  // S-02: set equality per card. Legacy stays named so a regression reads differently from a half-broken card.
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
          'S-02 admits ONE form: SCENE, STEPS_SPEC and init from defineCard');
        continue;
      }
      // A builder function behind SCENE or STEPS_SPEC would pass the surface check with nothing to read.
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
    // Sums to the catalog, so a card in neither form cannot hide.
    const counted = [...tally.values()].reduce((a, b) => a + b, 0);
    assert.equal(counted, CARD_COUNT,
      `the migration counter accounts for ${counted} card(s), the catalog lists ${CARD_COUNT}`);
    t.diagnostic(`migration: ${tally.get('migrated')} migrated, ${tally.get('legacy')} legacy, ` +
      `${counted} of ${CARD_COUNT} cards accounted for`);
  });
});

// makeInit returns `init`, so its signature and result are one fact for every card.
class ProbeScene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }
  build() {}
  reset() { this.build(); }
}
const probeInit = schemeKit.makeInit(ProbeScene, [{ id: 'idle', duration: 1000, enter() {} }], { posterFirst: true });
const controller = probeInit({ replaceChildren() {} }, {});

// Read off js/app.js. `call` records whether app.js guards the member or calls it flat.
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

  // app.js calling a member the kit never returns is a TypeError on a user click.
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

// R-kitparity / S-22 / S-23: the kits are compared with each other, the list size is never a constant.
// Re-exported means the same binding as scheme-kit, which a local lookalike is not.
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

    // Four empty sets agree, so two anchors are required. `defineCard` is read off the kit namespace
    // because it is each kit's own binding, not a re-export.
    assert.ok(refNames.size > 0, `${ref}-kit.js re-exports nothing from scheme-kit.js`);
    for (const cat of CATS) {
      assert.equal(typeof kits.get(cat).defineCard, 'function',
        `${cat}-kit.js exports no defineCard function, and every card in that folder imports one ` +
        'from it: the folder would stop loading in the browser.');
    }
    t.diagnostic(`shared kit surface: ${refNames.size} names, identical across ${shared.size} kits`);
  });

  // S-08b: a pulsePod straight from scheme-kit would pulse in workloads blue for every category.
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
        for (const k of ['bright']) {
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

  // Ties the shared list to real use, so it cannot shrink in parallel across all four kits.
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

  // L-08a: where the cluster and workloads X grammars overlap they must agree. Non-shared keys are printed only.
  const X_GRAMMARS = [['cluster', 'CLU'], ['workloads', 'WL']];

  // Leaf paths, so a nested difference names the field.
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

// S-21: a card imports its own kit and nothing past it.
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

  // lib/ holds only what every category shares.
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

// S-28: a lib module touching window or document at load breaks every unit test with a ReferenceError.
const LIB_REQUIRED = [
  'inspector.js', 'motion.js', 'primitives.js', 'scheme-kit.js',
  'sidebar.js', 'svg.js', 'timeline.js', 'tokens.js',
];

test('every module under js/lib/ imports in bare Node, with no browser global at module load', async (t) => {
  const files = (await readdir(join(ROOT, 'js', 'lib'))).filter(n => n.endsWith('.js')).sort();
  // A floor: new modules are walked too.
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
