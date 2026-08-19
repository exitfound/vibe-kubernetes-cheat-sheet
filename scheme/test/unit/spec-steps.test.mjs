// spec-steps.test.mjs: a card's CHOREOGRAPHY read as DATA, in bare Node, with no browser and no
// source scraping. Everything here comes off `STEPS_SPEC` on the module namespace of a MIGRATED
// card, so it runs in milliseconds and it runs on the shape the declarative layer introduced:
// `flow` as an ordered emission program, `flowLights` as the derived reduced-motion guard, and
// `chips` as the state after the static block.
//
// ===========================================================================================
// THE POPULATION IS A SUBSET, AND THAT IS THE FIRST THING THIS FILE HAS TO SURVIVE
// ===========================================================================================
// A LEGACY card exports only `init` and seals its steps inside makeInit's closure, so there is
// nothing here to read: 108 of the 108 cards are migrated today and 0 are not. A test that simply
// skipped whatever it could not read would go quiet the day `STEPS_SPEC` is renamed, and a green run
// over an empty set is worse than a red one. So the walk is counted twice by two INDEPENDENT
// criteria: this file collects the cards whose `STEPS_SPEC` is an array, ../fixtures/module.mjs
// classifies the same cards by their whole export surface, and the two counts must agree exactly.
// Lose the export and both drop together; lose only the reader here and the numbers split and fail.
//
// ===========================================================================================
// WHAT THIS FILE ASSERTS THAT NOTHING ELSE CAN
// ===========================================================================================
//   - `duration` REACHES NEITHER WAAPI NOR THE DOM. Editing 1500 to 1501 is invisible to any dump
//     of animations or of serialised markup, because the declared duration is a Timeline hold and
//     not an animation. render/duration.test.mjs measures span <= duration off a live card; this
//     file asserts, off the data, that the field EXISTS, is a positive integer, and that the
//     arrival arithmetic the flow itself declares already fits inside it.
//   - THE DERIVED GUARD IS RE-DERIVED HERE. `flowLights` is the newest thing the layer does, and
//     render/reduced.test.mjs proves the two paths AGREE without proving the derivation is the one
//     the card meant. Here it is re-derived independently, off the data, and compared.
//   - A MISNAMED KEY IS A SILENT NO-OP. Every writer in scheme-kit is null-guarded (`setVal` is
//     `if (node && node.valueText)`), so `lit: ['termChp']` throws nothing, draws nothing and leaves
//     the picture showing the PREVIOUS step's state, which is the one failure that looks plausible
//     on screen. Every key a step names OUTSIDE the six string writers is resolved against the scene
//     here: the six themselves are resolved in unit/spec-scene.test.mjs, which asks the same
//     question and one more (whether the part is a KIND that writer can write to). The split, and
//     why both halves are not asked twice, is written out over the last describe block below.
//   - THE LIFETIME OF A HIGHLIGHT, which is neither the scene's question nor the render level's.
//     S-18 and S-19 both stand at ZERO findings, which is what makes them assertable and when a
//     check is cheap. S-19 is the expensive one to lose: the class it names ACCUMULATES over
//     prev and reset, so five networking cards carried it at once and nothing in the suite could
//     see it (render/reduced.test.mjs compares the two paths and both accumulate identically).
//
// ===========================================================================================
// WHAT THIS FILE IS BLIND TO, BY CONSTRUCTION
// ===========================================================================================
//   - Anything a step does inside its `enter(s, ctx)` or `motion(s, ctx)` escape. 42 of the 650
//     steps carry one. Their bodies are functions, not data, and this file does not read them
//     except to widen the set of legal ref names (see refsOf below).
//   - Whether a value is TRUE. P-01 is enforced here as a CONVENTION (every step writes every chip);
//     whether a carried-over value still describes the picture stays a review rule, exactly as the
//     canon says.
//   - Geometry. A route's points are read only for their arithmetic (length -> flight time), never
//     for where they sit. That is the scene test's subject.
//   - Whether a highlight the step DOES take back is taken back at the right moment. S-18 below asks
//     only whether the fade that kills a block carries the `unlight` at all: which frame the class
//     leaves on is a rendered fact and stays with render/reduced.test.mjs.
//   - Real span. The arrival arithmetic below is a LOWER BOUND on what render/duration.test.mjs
//     measures: it ignores the ripple, the packet fades and the pulse tails, and an infinite
//     animation has no length here at all. It cannot replace that test and does not try to.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census, CATALOG_BASELINE } from '../fixtures/catalog.mjs';
import { cardForm, importAll } from '../fixtures/module.mjs';
import { collectFns, refNames, refUniverse, settledChips, staticChips, timelineOf, walkParts } from '../fixtures/spec.mjs';
import { flowLights } from '../../js/lib/step-spec.js';
import { routeDur, REVEAL_MS, BEAT } from '../../js/lib/scheme-kit.js';

// The three kit constants the arrival arithmetic in ../fixtures/spec.mjs runs on, handed to it at
// every call so that fixture stays importable without the kit.
const KIT = { routeDur, REVEAL_MS, BEAT };

// ---------------------------------------------------------------------------------------------
// Gathered once. importAll() carries the census guard, so a short walk throws before any assertion
// has had a chance to pass over a subset.
// ---------------------------------------------------------------------------------------------
const catalogued = await cards();
const CARD_COUNT = catalogued.length;
const modules = await importAll();

// Criterion A: this file's own reader. Criterion B: the fixture's whole-surface classification.
const withSpec = [...modules].filter(([, ns]) => Array.isArray(ns.STEPS_SPEC));
const byForm = [...modules].filter(([, ns]) => cardForm(ns) === 'migrated').map(([id]) => id);

const SPECS = withSpec.map(([id, ns]) => ({ id, scene: ns.SCENE, steps: ns.STEPS_SPEC }));
const STEP_COUNT = SPECS.reduce((n, c) => n + c.steps.length, 0);
const FLOW_COUNT = SPECS.reduce((n, c) => n + c.steps.reduce((m, s) => m + (s.flow ? s.flow.length : 0), 0), 0);

const listing = (items, cap = 8) =>
  items.slice(0, cap).join('\n  ') + (items.length > cap ? `\n  ... and ${items.length - cap} more` : '');

// Every step of every migrated card, flat, with the label a finding is reported under.
function* steps() {
  for (const c of SPECS) {
    for (let i = 0; i < c.steps.length; i++) yield { card: c, spec: c.steps[i], i, at: `${c.id}/${c.steps[i].id ?? `@${i}`}` };
  }
}

// ---------------------------------------------------------------------------------------------
// The field vocabulary, written out rather than inferred. makeSteps reads exactly these names off a
// step and runFlow exactly these off a flow entry, so a field outside the list is a field NOTHING
// reads: `chip:` for `chips:`, `light:` for `lights:`, `dururation:`. None of them throws, none of
// them draws, and none of them shows up in a diff as anything but a plausible-looking line.
// ---------------------------------------------------------------------------------------------
const WRITER_FIELDS = ['chips', 'chipsCued', 'wires', 'labels', 'sublabels', 'podSublabels', 'opacity', 'lit', 'chain'];
const STEP_FIELDS = new Set([...WRITER_FIELDS, 'id', 'duration', 'narration', 'enter', 'reducedLit', 'rewind', 'flow', 'motion']);
// `rewind` runs through the same writeStatics as the static block, so it takes writer fields only.
const REWIND_FIELDS = new Set(WRITER_FIELDS);

// Delay vocabulary, shared by every verb: `after` is arrival + BEAT.afterHop, `at` is the arrival
// itself, `delay` is a literal, `plus` adds on top. `name` and `lights` are read for every verb.
const COMMON_PARAMS = ['name', 'lights', 'after', 'at', 'delay', 'plus'];
const VERB_PARAMS = {
  // `role` is on the roled verbs because makeFlowKinds stamps the category onto them.
  route:   [...COMMON_PARAMS, 'points', 'dur', 'role', 'easing', 'offsets', 'fadeIn', 'fadeOut'],
  segment: [...COMMON_PARAMS, 'from', 'to', 'dur', 'role', 'fadeMs'],
  top:     [...COMMON_PARAMS, 'from', 'to', 'y', 'dur', 'role'],
  pulse:   [...COMMON_PARAMS, 'pod', 'fn', 'dim', 'persist', 'from', 'peak', 'dur'],
  fade:    [...COMMON_PARAMS, 'target', 'from', 'to', 'dur', 'fill', 'easing', 'unlight'],
  reveal:  [...COMMON_PARAMS, 'target', 'from'],
  // `on` names the element the empty 1ms timer hangs on: at() uses the svg, three cards use the
  // block the write is about, and which one it is shows up in getAnimations().
  set:     [...COMMON_PARAMS, ...WRITER_FIELDS, 'on'],
  light:   [...COMMON_PARAMS, 'targets'],
  anim:    [...COMMON_PARAMS, 'target', 'keyframes', 'options'],
  run:     [...COMMON_PARAMS, 'fn'],
  // A tag rides a packet and lands nothing, so it computes no arrival and arrivalOf leaves it at
  // its delay, the same as pulse, set, light and run.
  tag:     [...COMMON_PARAMS, 'text', 'points', 'dur', 'easing', 'emerge', 'dy', 'dx', 'fn'],
  // A ripple is what a receiving BOX gets where a Pod would pulse, so like pulse it takes effect
  // AT its delay and lands nothing.
  ripple:  [...COMMON_PARAMS, 'point', 'role'],
  // The block flash of a packet-less, Pod-less step (M-27). Takes a LIST like light does, because
  // the magnitude is one token and the step names whichever blocks its beat is about.
  flash:   [...COMMON_PARAMS, 'targets'],
};
const VERBS = new Set(Object.keys(VERB_PARAMS));

// ---------------------------------------------------------------------------------------------
// The scene's ref surface, needed only to resolve the names a STEP uses: every name buildScene
// files, plus whatever an escape assigns. It is NOT built here. ../fixtures/spec.mjs holds it,
// because ../unit/spec-scene.test.mjs and ../report/skeleton-census.test.mjs resolve names against
// the same set and three readings of one universe is three chances to drift; that file also carries
// the argument for why reading escape source text is safe (it only ever WIDENS the legal set) and
// the list of names left out of the universe on purpose.
// ---------------------------------------------------------------------------------------------
function refsOf(card) {
  const refs = refNames(card.scene, card.steps);
  // The count stays the number of FUNCTIONS read, not of names found: the diagnostic below reports
  // how much of each spec was scanned, and most of those functions assign nothing.
  const fns = collectFns(card.scene).length + collectFns(card.steps).length;
  return { refs, escapes: fns };
}

// The delay and arrival arithmetic is `timelineOf` in ../fixtures/spec.mjs, which re-implements
// what runFlow does so it can DISAGREE with the runtime when a card is wrong. It lives there rather
// than here because ../report/chip-beat.test.mjs times the same flow against a different question,
// and two copies of the delay vocabulary would disagree about which card is late.

// ---------------------------------------------------------------------------------------------
describe('the migrated population', () => {
  test(`STEPS_SPEC is readable on exactly the cards the migration counter calls migrated`, (t) => {
    census('spec-steps catalog', modules.size, CARD_COUNT);
    // Two independent criteria over the same catalog. If STEPS_SPEC is renamed away, THIS list goes
    // empty while the fixture's list does not, and the run is red instead of vacuously green.
    assert.ok(SPECS.length > 0,
      'not one card exports a STEPS_SPEC array, so every assertion in this file would pass over an ' +
      'empty set. Either the export was renamed or the migration was reverted.');
    assert.deepEqual(SPECS.map(c => c.id).sort(), [...byForm].sort(),
      'the cards whose STEPS_SPEC this file can read are not the cards ../fixtures/module.mjs counts ' +
      'as migrated. One of the two readers has gone blind.');
    assert.ok(STEP_COUNT > 0, `${SPECS.length} card(s) carry a STEPS_SPEC but they hold 0 steps between them`);
    // The step half of the catalog baseline, and this is its one assertion: every other file in
    // the harness DERIVES its step total from these same specs, through `stepTotal()`, so this is
    // the only place a step appearing or disappearing has to be acknowledged on purpose.
    assert.equal(STEP_COUNT, CATALOG_BASELINE.steps,
      `the catalog declares ${STEP_COUNT} steps, the baseline is ${CATALOG_BASELINE.steps}. A step ` +
      'added or removed is a deliberate change: update CATALOG_BASELINE in ../fixtures/catalog.mjs. ' +
      'Every floor in the harness is derived from this sum, so a step that vanished would only ' +
      'lower every floor with it and nothing else would go red.');
    for (const c of SPECS) {
      assert.ok(c.steps.length > 0, `${c.id}  exports an empty STEPS_SPEC, so this card declares no step`);
      assert.ok(c.scene && typeof c.scene === 'object', `${c.id}  exports STEPS_SPEC without a SCENE to resolve its keys against`);
    }
    t.diagnostic(`${SPECS.length} migrated of ${CARD_COUNT} catalogued (${CARD_COUNT - SPECS.length} legacy, unreadable here), ` +
      `${STEP_COUNT} steps, ${FLOW_COUNT} flow entries`);
  });

  // A typo'd field name is the cheapest way to write a line that does nothing. makeSteps reads a
  // fixed vocabulary and ignores the rest in silence, so the vocabulary is asserted rather than
  // trusted, on the step and on the rewind block alike.
  test(`every field on a step spec is one makeSteps reads (${STEP_FIELDS.size} legal names)`, (t) => {
    const findings = [];
    const seen = new Map();
    let walked = 0;
    for (const { spec, at } of steps()) {
      walked++;
      for (const k of Object.keys(spec)) {
        seen.set(k, (seen.get(k) || 0) + 1);
        if (!STEP_FIELDS.has(k)) findings.push(`${at}  declares '${k}', which makeSteps never reads. Legal: ${[...STEP_FIELDS].sort().join(' ')}`);
      }
      for (const k of Object.keys(spec.rewind || {})) {
        if (!REWIND_FIELDS.has(k)) findings.push(`${at}  rewind declares '${k}': rewind goes through writeStatics, so only ${[...REWIND_FIELDS].join(' ')} are read`);
      }
    }
    assert.equal(walked, STEP_COUNT, `walked ${walked} steps, the catalog holds ${STEP_COUNT}`);
    assert.equal(findings.length, 0, `${findings.length} finding(s) over ${walked} steps:\n  ${listing(findings)}`);
    t.diagnostic(`${walked} steps, ${seen.size} distinct fields in use: ` +
      [...seen].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} x${n}`).join(', '));
  });
});

// ---------------------------------------------------------------------------------------------
// id, duration, narration. None of the three reaches the DOM or WAAPI, so no dump of either can see
// them, and this is the only place their SHAPE is asserted at all.
// ---------------------------------------------------------------------------------------------
describe('step identity and duration', () => {
  test(`every one of the ${STEP_COUNT} steps declares an id and a duration`, (t) => {
    const findings = [];
    const durations = [];
    let walked = 0;
    for (const c of SPECS) {
      const ids = new Set();
      for (let i = 0; i < c.steps.length; i++) {
        walked++;
        const spec = c.steps[i];
        const at = `${c.id}@${i}`;
        if (typeof spec.id !== 'string' || spec.id.length === 0) findings.push(`${at}  id is ${JSON.stringify(spec.id)}, expected a non-empty string`);
        else if (ids.has(spec.id)) findings.push(`${at}  id '${spec.id}' is used twice on this card, so a finding cannot name one step`);
        else ids.add(spec.id);
        // Not a default and not derived: Timeline holds this exact number before auto-advancing,
        // and nothing that reads WAAPI or the DOM can see what it says.
        if (typeof spec.duration !== 'number' || !Number.isFinite(spec.duration)) findings.push(`${at}  duration is ${JSON.stringify(spec.duration)}, expected a number of milliseconds`);
        else if (!Number.isInteger(spec.duration) || spec.duration <= 0) findings.push(`${at}  duration is ${spec.duration}, expected a positive whole number of milliseconds`);
        else durations.push(spec.duration);
        if (spec.narration !== undefined && (typeof spec.narration !== 'string' || spec.narration.trim() === '')) {
          findings.push(`${at}  narration is ${typeof spec.narration}, expected a non-empty string or nothing at all`);
        }
      }
    }
    assert.equal(walked, STEP_COUNT, `walked ${walked} steps, expected ${STEP_COUNT}`);
    assert.equal(findings.length, 0, `${findings.length} finding(s) over ${walked} steps:\n  ${listing(findings)}`);
    durations.sort((a, b) => a - b);
    t.diagnostic(`${durations.length} durations declared, ${durations[0]} to ${durations[durations.length - 1]}ms, ` +
      `median ${durations[Math.floor(durations.length / 2)]}ms`);
  });

  // S-09, the half of it that is data. The poster is a deliberate static beat: it carries no
  // narration because the panel already previews step 1's text, and it must not move. The canon says
  // nothing checks this; the readable half is checked here.
  test('each card opens on one static poster step, and only that step has no narration', (t) => {
    const findings = [];
    const offName = [];
    for (const c of SPECS) {
      const silent = c.steps.map((s, i) => (s.narration === undefined ? i : -1)).filter(i => i >= 0);
      if (silent.length !== 1 || silent[0] !== 0) {
        findings.push(`${c.id}  step(s) without narration at index [${silent.join(', ')}], expected exactly [0]`);
      }
      const poster = c.steps[0];
      if (poster.flow) findings.push(`${c.id}  the poster step '${poster.id}' declares a flow of ${poster.flow.length} entr(ies): the poster is the still frame before anything moves`);
      if (poster.motion) findings.push(`${c.id}  the poster step '${poster.id}' declares a motion escape`);
      if (poster.rewind) findings.push(`${c.id}  the poster step '${poster.id}' declares a rewind, which only the animated path reads and the poster has none`);
      if (poster.id !== 'idle') offName.push(`${c.id} opens on '${poster.id}'`);
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s) over ${SPECS.length} cards:\n  ${listing(findings)}`);
    // Reported, not asserted: S-09 says step 0 is `id: 'idle'` and one card disagrees. Naming it is
    // a card edit, which is not this file's business.
    t.diagnostic(`${SPECS.length} poster steps, all static and all silent` +
      (offName.length ? `. S-09 says the id is 'idle': ${offName.join(', ')}` : ''));
  });
});

// ---------------------------------------------------------------------------------------------
// `flow` is a PROGRAM. Entries emit in list order with no sorting and no de-duplication, because the
// order is observable: getAnimations() hands animations back in creation order.
// ---------------------------------------------------------------------------------------------
describe('flow as an ordered program', () => {
  test(`every one of the ${FLOW_COUNT} flow entries is a known verb carrying the params that verb reads`, (t) => {
    const findings = [];
    const tally = new Map();
    let walked = 0;
    for (const { spec, at } of steps()) {
      if (spec.flow !== undefined && !Array.isArray(spec.flow)) { findings.push(`${at}  flow is ${typeof spec.flow}, expected an ordered array`); continue; }
      for (let i = 0; i < (spec.flow || []).length; i++) {
        walked++;
        const e = spec.flow[i];
        const where = `${at}[${i}]`;
        if (!e || typeof e !== 'object' || !VERBS.has(e.verb)) { findings.push(`${where}  verb is ${JSON.stringify(e && e.verb)}, not one of ${[...VERBS].join(' ')}`); continue; }
        tally.set(e.verb, (tally.get(e.verb) || 0) + 1);
        const p = e.p;
        if (!p || typeof p !== 'object') { findings.push(`${where}  ${e.verb} carries no params object`); continue; }
        const legal = new Set(VERB_PARAMS[e.verb]);
        for (const k of Object.keys(p)) if (!legal.has(k)) findings.push(`${where}  ${e.verb} carries '${k}', which runFlow does not read for that verb. Legal: ${[...legal].join(' ')}`);
        // Per verb, the params without which the entry emits nothing or emits a zero-length thing.
        switch (e.verb) {
          case 'route':
            if (!Array.isArray(p.points) || p.points.length < 2) findings.push(`${where}  route needs at least 2 points, got ${Array.isArray(p.points) ? p.points.length : typeof p.points}`);
            break;
          case 'segment':
            // from/to are POINTS here, and a pair of numbers would make routeDur NaN.
            for (const k of ['from', 'to']) {
              if (!Array.isArray(p[k]) || p[k].length !== 2 || !p[k].every(n => typeof n === 'number')) findings.push(`${where}  segment ${k} is ${JSON.stringify(p[k])}, expected a point [x, y]`);
            }
            break;
          case 'top':
            // and NUMBERS here: topPacket builds [[from, y], [to, y]] itself.
            for (const k of ['from', 'to', 'y']) if (typeof p[k] !== 'number') findings.push(`${where}  top ${k} is ${JSON.stringify(p[k])}, expected an x (or y) coordinate`);
            break;
          case 'fade':
            if (typeof p.target !== 'string') findings.push(`${where}  fade target is ${JSON.stringify(p.target)}`);
            if (typeof p.to !== 'number') findings.push(`${where}  fade to is ${JSON.stringify(p.to)}, expected the opacity it ends on`);
            // WAAPI reads a missing duration as 0: the element snaps and nothing announces it.
            if (typeof p.dur !== 'number' || p.dur <= 0) findings.push(`${where}  fade dur is ${JSON.stringify(p.dur)}, so el.animate would run for 0ms and snap`);
            break;
          case 'reveal':
            if (typeof p.target !== 'string') findings.push(`${where}  reveal target is ${JSON.stringify(p.target)}`);
            break;
          case 'anim':
            if (typeof p.target !== 'string') findings.push(`${where}  anim target is ${JSON.stringify(p.target)}`);
            if (!p.keyframes) findings.push(`${where}  anim carries no keyframes`);
            if (typeof (p.options && p.options.duration) !== 'number') findings.push(`${where}  anim options.duration is ${JSON.stringify(p.options && p.options.duration)}`);
            break;
          case 'pulse':
            if (typeof p.pod !== 'string') findings.push(`${where}  pulse pod is ${JSON.stringify(p.pod)}`);
            if (typeof p.fn !== 'function') findings.push(`${where}  pulse has no fn: the kit binds the tinted pulse, so an unbound F.pulse would pulse nothing`);
            break;
          case 'light':
            if (!Array.isArray(p.targets) || p.targets.length === 0) findings.push(`${where}  light carries no targets`);
            // runFlow reads `p.lights` for every verb EXCEPT light, so this pair is dropped in silence.
            if (p.lights) findings.push(`${where}  light also carries lights: [${p.lights}], which runFlow skips for this verb. Fold them into targets`);
            break;
          case 'run':
            if (typeof p.fn !== 'function') findings.push(`${where}  run fn is ${typeof p.fn}`);
            break;
          case 'flash':
            if (!Array.isArray(p.targets) || p.targets.length === 0) findings.push(`${where}  flash carries no targets`);
            break;
          case 'set': {
            const writes = WRITER_FIELDS.filter(k => p[k] !== undefined);
            if (writes.length === 0) findings.push(`${where}  set writes nothing: it carries none of ${WRITER_FIELDS.join(' ')}`);
            break;
          }
          default: break;
        }
      }
    }
    assert.equal(walked, FLOW_COUNT, `walked ${walked} flow entries, the catalog holds ${FLOW_COUNT}`);
    assert.equal(findings.length, 0, `${findings.length} finding(s) over ${walked} flow entries:\n  ${listing(findings)}`);
    t.diagnostic(`${walked} entries: ` + [...tally].sort((a, b) => b[1] - a[1]).map(([v, n]) => `${v} x${n}`).join(', '));
  });

  // The reference rule. `after: 'x'` and `at: 'x'` resolve against a Map that runFlow fills AS IT
  // WALKS, so a name declared later in the list, or never, resolves to undefined: `undefined + 100`
  // is NaN, WAAPI reads a NaN delay as 0, and the whole chain collapses onto the step's first frame
  // instead of throwing. That is the failure this test exists for.
  // M-26 is a rule whose population is EMPTY and whose emptiness is the whole content of the row:
  // nothing in the catalog flashes a value chip, so a green run of the motion walk says nothing
  // about it. `F.flash` is the one verb that could open that population without anybody noticing,
  // since `flashChips` is named for chips and takes any ref. This asks the question the name
  // invites and the runtime does not: what KIND of part is on the end of each target.
  test('M-26: F.flash targets blocks, never a value chip', (t) => {
    const findings = [];
    let entries = 0, targets = 0;
    for (const c of SPECS) {
      const { refs } = refUniverse(c.scene, c.steps);
      for (const spec of c.steps) {
        for (const e of spec.flow || []) {
          if (!e || e.verb !== 'flash') continue;
          entries++;
          for (const k of (e.p && e.p.targets) || []) {
            targets++;
            const kind = refs.get(k);
            if (kind === 'chip') findings.push(`${c.id}/${spec.id}  flash targets '${k}', which the SCENE declares as a chip. A value chip never flashes (M-26): flash the block the value is ABOUT`);
          }
        }
      }
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    t.diagnostic(`${entries} F.flash entr(ies) over ${targets} target(s), zero of them a chip`);
  });

  test('every after/at names an entry declared EARLIER in the same flow', (t) => {
    const findings = [];
    let refs = 0, namesDeclared = 0, dead = [];
    for (const { spec, at } of steps()) {
      const named = new Set(), used = new Set();
      for (let i = 0; i < (spec.flow || []).length; i++) {
        const e = spec.flow[i];
        const p = (e && e.p) || {};
        const where = `${at}[${i}]`;
        if (p.after !== undefined && p.at !== undefined) {
          findings.push(`${where}  carries both after:'${p.after}' and at:'${p.at}': delayOf takes after and drops at without a word`);
        }
        for (const f of ['after', 'at']) {
          const v = p[f];
          if (v === undefined) continue;
          if (typeof v === 'number') { refs++; continue; }
          if (typeof v !== 'string') { findings.push(`${where}  ${f} is ${typeof v}, expected the name of an earlier entry or a literal ms`); continue; }
          refs++;
          used.add(v);
          if (!named.has(v)) {
            const later = (spec.flow || []).slice(i).some(o => o && o.p && o.p.name === v);
            findings.push(`${where}  ${f}: '${v}' names ${later ? 'an entry declared LATER in this flow' : 'nothing in this flow'}. ` +
              'A name is only resolvable once the entry that declares it has been emitted.');
          }
        }
        if (p.name !== undefined) {
          if (typeof p.name !== 'string' || p.name === '') findings.push(`${where}  name is ${JSON.stringify(p.name)}`);
          else if (named.has(p.name)) findings.push(`${where}  re-declares the name '${p.name}': the later arrival silently replaces the earlier one`);
          else { named.add(p.name); namesDeclared++; }
        }
      }
      for (const n of named) if (!used.has(n)) dead.push(`${at}:'${n}'`);
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s) over ${FLOW_COUNT} flow entries:\n  ${listing(findings)}`);
    // Reported, not asserted: a name nobody chains off is dead weight, not a broken picture.
    t.diagnostic(`${namesDeclared} names declared, ${refs} after/at references, all resolving backwards` +
      (dead.length ? `. ${dead.length} name(s) nobody chains off: ${dead.join(' ')}` : ''));
  });

  // M-19 from the DATA side. render/duration.test.mjs measures the real span off a live card and
  // stays the authority; this is the cheap half that needs no browser, and it is a LOWER bound: the
  // ripple (560ms), the packet fades and the pulse tails all sit past the last arrival.
  test('the last arrival a flow computes lands inside the step it belongs to', (t) => {
    const findings = [];
    let withFlow = 0, tightest = Infinity, tightestAt = '';
    for (const { spec, at } of steps()) {
      const rows = timelineOf(spec.flow, KIT);
      if (!rows) continue;   // an unresolvable reference: the test above owns that finding
      if (rows.length === 0) continue;
      withFlow++;
      const last = Math.max(...rows.map(r => r.arrival));
      if (!Number.isFinite(last)) { findings.push(`${at}  the flow's arrival arithmetic is not a finite number`); continue; }
      if (last > spec.duration) {
        findings.push(`${at}  last declared arrival ${last}ms > duration ${spec.duration}ms, so the auto-advance cuts the step off mid-flight (M-19)`);
      }
      const slack = spec.duration - last;
      if (slack < tightest) { tightest = slack; tightestAt = at; }
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    assert.ok(withFlow > 0, 'no step produced a timeline at all, so this arithmetic measured nothing');
    t.diagnostic(`${withFlow} steps timed off their own flow, tightest margin ${tightest}ms on ${tightestAt} ` +
      '(a floor: the ripple, the fades and the pulse tails are past the last arrival)');
  });
});

// ---------------------------------------------------------------------------------------------
// The derived reduced-motion guard, and what it catches is a WRONG derivation. Anything that enters
// a step with reduced: false never runs the derived path at all, so a wrong one is invisible to it
// and only a reader of the data sees it. The HIGHLIGHT axis of render/reduced.test.mjs holds the
// live half on a rendered card, and the assertions below are the half that needs no browser: they
// read the derivation off the data.
// ---------------------------------------------------------------------------------------------
describe('the reduced-motion guard', () => {
  test('flowLights is the ordered, de-duplicated union of what the flow lights', (t) => {
    const findings = [];
    let walked = 0, keys = 0;
    for (const { spec, at } of steps()) {
      if (!spec.flow) continue;
      walked++;
      // Derived a second time, on purpose. Inheriting flowLights' own answer would assert nothing:
      // this is the independent reading that disagrees when the derivation drifts.
      const expect = [];
      for (const e of spec.flow) {
        const from = e.verb === 'light' ? (e.p.targets || []) : (e.p.lights || []);
        for (const k of from) if (!expect.includes(k)) expect.push(k);
      }
      const got = flowLights(spec.flow);
      assert.ok(Array.isArray(got), `${at}  flowLights returned ${typeof got}`);
      if (got.join('|') !== expect.join('|')) findings.push(`${at}  flowLights gave [${got}], the ordered union of its lights is [${expect}]`);
      if (new Set(got).size !== got.length) findings.push(`${at}  flowLights repeats a key: [${got}]. A repeat means the reduced path adds the same class twice`);
      // Same input, same output: the derivation must not depend on anything but the list.
      if (flowLights(spec.flow).join('|') !== got.join('|')) findings.push(`${at}  flowLights is not deterministic over one flow`);
      keys += got.length;
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s) over ${walked} flows:\n  ${listing(findings)}`);
    assert.ok(keys > 0, 'flowLights derived 0 keys across the whole catalog, so the guard it generates is empty everywhere');
    t.diagnostic(`${walked} flows, ${keys} derived highlight keys, order and de-duplication agree with an independent reading`);
  });

  // The one thing the derivation CANNOT reach: a highlight the reduced path shows INSTEAD of motion.
  // No lightBoxAt names it, so flowLights returns without it by construction and the step states it.
  // Expect this wherever a pulse has no static equivalent, NOT as a one-off (plan 3.5, corrected).
  test('reducedLit is declared only where flowLights cannot derive the key', (t) => {
    const findings = [];
    const declared = [];
    for (const { spec, at } of steps()) {
      if (spec.reducedLit === undefined) continue;
      if (!Array.isArray(spec.reducedLit) || spec.reducedLit.length === 0) { findings.push(`${at}  reducedLit is ${JSON.stringify(spec.reducedLit)}, expected a non-empty array of keys`); continue; }
      if (new Set(spec.reducedLit).size !== spec.reducedLit.length) findings.push(`${at}  reducedLit repeats a key: [${spec.reducedLit}]`);
      const derived = flowLights(spec.flow);
      const redundant = spec.reducedLit.filter(k => derived.includes(k));
      if (redundant.length) {
        findings.push(`${at}  reducedLit states [${redundant}], which flowLights already derives from this flow. ` +
          'A derived key stated by hand is a second source of truth for the same class.');
      }
      // With no flow the two paths are identical, so a reducedLit would light something the animated
      // path never shows, which is a difference between the paths rather than a stand-in for motion.
      if (!spec.flow || spec.flow.length === 0) findings.push(`${at}  declares reducedLit with no flow: there is no motion here for it to stand in for`);
      declared.push(`${at} -> [${spec.reducedLit}]${(spec.flow || []).some(e => e.verb === 'pulse') ? ' (stands in for a pulse)' : ''}`);
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    t.diagnostic(`${declared.length} step(s) of ${STEP_COUNT} state a reducedLit: ${declared.join('; ') || 'none'}`);
  });
});

// ---------------------------------------------------------------------------------------------
// Chips. `chips` is the state AFTER the static block, which is not the end of the step: `rewind`
// winds a key back to what the step starts from and an F.set can carry it PAST its static value.
// ---------------------------------------------------------------------------------------------

// A key's value at the end of the ANIMATED path is `settledChips` in ../fixtures/spec.mjs: the
// static block, then rewind, then every F.set in flow order. `enter` is an escape and is not read
// there, so a key it writes resolves to what the fields said rather than to what the escape wrote.
// It sits in the fixture beside `staticChips` because ../report/chip-beat.test.mjs compares one
// step's static reading against the previous step's settled one, and a second copy of the order
// would be a second answer to what a chip says.

describe('chip turnover', () => {
  // P-01, the CONVENTION half, which becomes machine-checkable the moment a step is data: an unset
  // chip keeps the previous step's value and silently lies. Whether a carried value is still TRUE
  // stays a review rule, as the canon says.
  test('P-01: every step of a card writes the same set of chips', (t) => {
    const findings = [];
    let walked = 0, chipWrites = 0;
    for (const c of SPECS) {
      const sets = new Map();
      for (const spec of c.steps) {
        walked++;
        const both = [...Object.keys(spec.chips || {}), ...Object.keys(spec.chipsCued || {})];
        chipWrites += both.length;
        const dupes = both.filter((k, i) => both.indexOf(k) !== i);
        // The write order is chips then chipsCued, so naming one ref in both is one write losing.
        if (dupes.length) findings.push(`${c.id}/${spec.id}  names [${[...new Set(dupes)]}] in both chips and chipsCued, so the setVal write is overwritten by the setChip one`);
        sets.set(spec.id, [...new Set(both)].sort());
        // A chip an F.set turns over mid-step but no step states statically is never written on the
        // reduced path at all, which is the same defect one layer down.
        for (const e of spec.flow || []) {
          if (e.verb !== 'set') continue;
          for (const k of [...Object.keys(e.p.chips || {}), ...Object.keys(e.p.chipsCued || {})]) {
            if (!both.includes(k)) findings.push(`${c.id}/${spec.id}  an F.set writes chip '${k}' that the static block never writes, so prev and reset show the previous step's value`);
          }
        }
      }
      const shapes = new Map();
      for (const [id, keys] of sets) {
        const sig = keys.join(',');
        if (!shapes.has(sig)) shapes.set(sig, []);
        shapes.get(sig).push(id);
      }
      if (shapes.size > 1) {
        const union = [...new Set([...sets.values()].flat())].sort();
        const detail = [...sets].map(([id, keys]) => `${id} missing [${union.filter(k => !keys.includes(k)).join(' ') || '-'}]`).join('; ');
        findings.push(`${c.id}  ${shapes.size} different chip sets across ${sets.size} steps, union of ${union.length} chips: ${detail}. ` +
          'A write that happens inside the enter() escape is invisible here by construction: state it in `chips`.');
      }
    }
    assert.equal(walked, STEP_COUNT, `walked ${walked} steps, expected ${STEP_COUNT}`);
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    t.diagnostic(`${chipWrites} chip writes over ${walked} steps on ${SPECS.length} cards, one set per card`);
  });

  // P-13. Four key names are banned outright, and the reason is that a chip key of this shape is
  // READ as something else: a scan of card source takes `ip: '...'` in an object literal for a Pod
  // ADDRESS written where a block is built, so a chip keyed `ip` makes its value look like a second
  // block carrying that address, and a real duplicate address look like a duplicate of itself. No
  // check in the suite reads addresses that way (render/inline.test.mjs takes them off the RENDERED
  // frames), and the ban holds anyway: the names are also the four fields of a BLOCK, so one of them
  // on a chip is a key that reads as the wrong kind of thing to every human after it. Use podIp.
  test('P-13: no chip is keyed label, sublabel, ip or sub', (t) => {
    const BANNED = new Set(['label', 'sublabel', 'ip', 'sub']);
    const findings = [];
    let walked = 0, keys = 0;
    for (const { spec, at } of steps()) {
      walked++;
      const blocks = [['chips', spec.chips], ['chipsCued', spec.chipsCued],
        ['rewind.chips', spec.rewind && spec.rewind.chips], ['rewind.chipsCued', spec.rewind && spec.rewind.chipsCued]];
      for (const e of spec.flow || []) {
        if (e.verb === 'set') blocks.push(['F.set chips', e.p.chips], ['F.set chipsCued', e.p.chipsCued]);
      }
      for (const [where, block] of blocks) {
        for (const k of Object.keys(block || {})) {
          keys++;
          if (BANNED.has(k)) findings.push(`${at}  ${where} is keyed '${k}', one of the four banned chip names (P-13). Use podIp, or a name that is not a BLOCK field`);
        }
      }
    }
    // The census, and it is INDEPENDENT: STEP_COUNT comes off the specs this file collected, so
    // the two sides of an equality over it are one reader. CARD_COUNT comes off data.js.
    assert.equal(SPECS.length, CARD_COUNT, `walked ${SPECS.length} cards, data.js lists ${CARD_COUNT}: a walk over a subset finds fewer defects and passes`);
    assert.equal(walked, STEP_COUNT, `walked ${walked} steps, expected ${STEP_COUNT}`);
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    assert.ok(keys > 0, 'not one chip key was read, so this ban was applied to nothing');
    t.diagnostic(`${keys} chip keys over ${walked} steps, none of them ${[...BANNED].join(' / ')}`);
  });

  // The reading rule, asserted by exercising it: a key's final value is chips, then enter, then
  // rewind, then every F.set in flow order. A check that reads `chips` as the final value is wrong
  // on exactly the steps counted below, and cluster-etcd-raft `quorum-lost` is the exemplar: it
  // states r1 as Leader and an F.set turns it over to Follower at 1500ms.
  test('a chip resolves through chips, rewind and the flow, in that order', (t) => {
    const carried = [];
    const findings = [];
    let resolved = 0, rewound = 0;
    for (const { spec, at } of steps()) {
      const stat = staticChips(spec);
      const final = settledChips(spec);
      resolved += Object.keys(final).length;
      rewound += Object.keys((spec.rewind && spec.rewind.chips) || {}).length;
      for (const k of Object.keys(stat)) {
        if (final[k] !== stat[k]) carried.push(`${at}:${k} '${stat[k]}' -> '${final[k]}'`);
      }
      // Same input, same answer: the resolution must not depend on iteration luck.
      if (JSON.stringify(settledChips(spec)) !== JSON.stringify(final)) findings.push(`${at}  the chip resolution is not deterministic`);
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    // The anchor. If this ever reaches 0, either every F.set stopped moving a chip past its static
    // value, or this resolver has quietly collapsed into reading `chips` and asserts nothing.
    assert.ok(carried.length > 0,
      'not one step carries a chip past its static value, so the three-stage resolution above is ' +
      'indistinguishable from reading `chips` and this test has stopped testing it.');
    t.diagnostic(`${resolved} chip keys resolved, ${rewound} rewound before the animated path, ` +
      `${carried.length} carried past their static value by an F.set: ` +
      carried.slice(0, 3).join(' | ') + (carried.length > 3 ? ` | ... and ${carried.length - 3} more` : ''));
  });
});

// ---------------------------------------------------------------------------------------------
// THE LIFETIME OF A HIGHLIGHT. Both rules below were `review` until 2026-08-15 and both stand at
// zero, and they fail in opposite directions: S-18 leaves a class on a block that is no longer
// there, S-19 leaves one on a box the prologue never clears, where it then ACCUMULATES.
// ---------------------------------------------------------------------------------------------

// Every key a step puts a highlight on: the static `lit`, the reduced-path stand-in, and whatever
// the flow cues, which is `targets` on an F.light and `lights` on everything else.
//
// `deferred` adds the two writers that light a key LATE rather than at step entry: an F.set carrying
// a `lit` (11 sites) and a `rewind.lit` (2). They are a flag rather than part of the set because the
// two rules below want different answers. S-19 wants them: a class is a class whenever it lands, and
// including them changes nothing today (the same 153 pairs, the same zero). S-18 must not assert on
// them: `storage-multi-attach-error` lights `vaA` through an F.set and takes the class back through
// an `unlightAt` inside an F.run, because an `unlight` on the fade would drop the empty 1ms timer
// that carries the highlight on the OTHER attachment. That is the one site the wide reading finds,
// it is deliberate, its card says why, and a rule cannot see through an escape.
function litKeys(spec, { deferred = false } = {}) {
  const out = new Set([...(spec.lit || []), ...(spec.reducedLit || [])]);
  if (deferred) for (const k of (spec.rewind && spec.rewind.lit) || []) out.add(k);
  for (const e of spec.flow || []) {
    const p = (e && e.p) || {};
    const from = e.verb === 'light' ? (p.targets || []) : (p.lights || []);
    for (const k of from) out.add(k);
    if (deferred && e.verb === 'set') for (const k of p.lit || []) out.add(k);
  }
  return out;
}

describe('highlight lifetime', () => {
  // S-18. A block that dies mid-step (a fade to nothing) has to give its highlight back in that
  // fade's own onfinish, which is what `unlight` compiles to. Mirroring the take-back onto the
  // static path instead leaves the animated path showing a lit outline around an invisible block.
  // The threshold is the fade's `to`, and it is `OPACITY.terminated` itself: 0.12 is the lowest
  // shade the vocabulary has and the one that means "gone from the API, or finished", so a fade at
  // or under it is a block that has died. The next shade up, terminating at 0.25, is a block still
  // on screen and still legitimately lit, which is why the line sits between them.
  test('S-18: a fade that kills a block the step lit takes the highlight back with it', (t) => {
    const DEAD = 0.12;
    const findings = [];
    const deferredLit = [];
    let walked = 0, fades = 0, dying = 0, withUnlight = 0;
    for (const { spec, at } of steps()) {
      walked++;
      const lit = litKeys(spec);
      const late = litKeys(spec, { deferred: true });
      for (let i = 0; i < (spec.flow || []).length; i++) {
        const e = spec.flow[i];
        if (!e || e.verb !== 'fade') continue;
        const p = e.p || {};
        fades++;
        if (typeof p.to !== 'number' || p.to > DEAD) continue;
        dying++;
        if (p.unlight && p.unlight.length) { withUnlight++; continue; }
        if (lit.has(p.target)) {
          findings.push(`${at}[${i}]  fades '${p.target}' to ${p.to} and this step lights that same key, ` +
            'with no unlight on the fade. The class outlives the block: take it back in the fade\'s ' +
            'own onfinish (S-18) rather than mirroring the take-back onto the static path');
        } else if (late.has(p.target)) deferredLit.push(`${at}[${i}]:${p.target}`);
      }
    }
    // The census, and it is INDEPENDENT: STEP_COUNT comes off the specs this file collected, so
    // the two sides of an equality over it are one reader. CARD_COUNT comes off data.js.
    assert.equal(SPECS.length, CARD_COUNT, `walked ${SPECS.length} cards, data.js lists ${CARD_COUNT}: a walk over a subset finds fewer defects and passes`);
    assert.equal(walked, STEP_COUNT, `walked ${walked} steps, expected ${STEP_COUNT}`);
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    assert.ok(dying > 0, `${fades} fades walked and none of them ends at or below ${DEAD}, so this rule was applied to nothing`);
    t.diagnostic(`${fades} fades, ${dying} of them down to <= ${DEAD} (a block dying mid-step), ${withUnlight} carrying an unlight` +
      (deferredLit.length ? `. ${deferredLit.length} site(s) light the dying target through an F.set instead, and are reported rather than asserted: ${deferredLit.join(' ')}` : ''));
  });

  // S-19. A `.highlight` on a Pod's INNER BOX is cleared only by NAME, through clearHighlights' keys
  // list. The `pods` argument runs clearPodHighlight instead, which resets inline stroke styles and
  // touches no class at all, so a card that names the Pod and trusts it to cover the box leaves the
  // class standing: prev and reset replay steps 0..n, the box gathers one more with every replay,
  // and nothing in the suite can see it. Five networking cards carried this at once.
  test('S-19: a Pod inner box a step lights is cleared by name in reset.keys', (t) => {
    const findings = [];
    let walked = 0, inners = 0, lit = 0;
    for (const c of SPECS) {
      // innerKey files a ref only when the Pod actually built an inner box, the same guard
      // ../fixtures/spec.mjs applies when it builds the ref universe.
      const innerOf = new Map();
      walkParts(c.scene && c.scene.parts, (part) => {
        if (!part || part.kind !== 'pod') return;
        const p = part.p || {};
        if (p.inner && p.innerKey) innerOf.set(p.innerKey, part.key || part.p.shellKey || '(unkeyed pod)');
      });
      inners += innerOf.size;
      const reset = new Set(((c.scene.reset && c.scene.reset.keys) || []));
      const pods = new Set(((c.scene.reset && c.scene.reset.pods) || []));
      for (const spec of c.steps) {
        walked++;
        for (const k of litKeys(spec, { deferred: true })) {
          if (!innerOf.has(k)) continue;
          lit++;
          if (reset.has(k)) continue;
          findings.push(`${c.id}/${spec.id}  lights '${k}', the inner box of Pod '${innerOf.get(k)}', and ` +
            `SCENE.reset.keys does not carry it${pods.has(innerOf.get(k)) ? ` (reset.pods names '${innerOf.get(k)}', and clearPodHighlight touches no class)` : ''}. ` +
            'The class then accumulates over every prev and reset replay (S-19)');
        }
      }
    }
    // The census, and it is INDEPENDENT: STEP_COUNT comes off the specs this file collected, so
    // the two sides of an equality over it are one reader. CARD_COUNT comes off data.js.
    assert.equal(SPECS.length, CARD_COUNT, `walked ${SPECS.length} cards, data.js lists ${CARD_COUNT}: a walk over a subset finds fewer defects and passes`);
    assert.equal(walked, STEP_COUNT, `walked ${walked} steps, expected ${STEP_COUNT}`);
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    assert.ok(inners > 0, 'no Pod in the catalog declares an inner box, so this rule was applied to nothing');
    t.diagnostic(`${inners} Pod inner boxes over ${SPECS.length} cards, lit on ${lit} step/key pair(s), all cleared by name`);
  });
});

// ---------------------------------------------------------------------------------------------
// Every writer in scheme-kit is null-guarded, so a key that names nothing is a SILENT no-op: no
// throw, no visible change, and the element keeps whatever the previous step left on it.
//
// WHAT IS RESOLVED HERE AND WHAT IS RESOLVED IN ../unit/spec-scene.test.mjs. The six STRING writers
// (chips, chipsCued, labels, sublabels, podSublabels and the separate wires bucket) are that file's
// subject, over the same three blocks this one walks: it asks the same "does the name resolve" AND
// the question this file cannot ask, whether the part the name lands on is a KIND that writer can
// write to (setVal needs the valueText a chip carries, setBoxLabel needs a .scheme-box-label). Two
// files asking the strictly weaker half of one question is a duplicate branch, not a second check,
// so the six string writers are resolved THERE and nowhere else, by the stricter reading.
// What is left below is everything that file does NOT look at: `opacity`, `lit`, `chain`,
// `reducedLit`, a flow entry's pod / target / lights / targets / unlight / on, and the reset
// prologue. `on` is resolved here and by nobody else: 15 sites, 0 of them unresolvable, and it is
// the one key where a miss costs the whole write rather than one late frame.
// ---------------------------------------------------------------------------------------------
describe('key resolution', () => {
  test('every key a step lights or moves names something the SCENE declares', (t) => {
    const findings = [];
    let walked = 0, resolved = 0, escapes = 0;
    for (const c of SPECS) {
      const { refs, escapes: n } = refsOf(c);
      escapes += n;
      assert.ok(refs.size > 0, `${c.id}  the SCENE declares no keyed part at all, so nothing here could resolve`);
      const check = (key, at, field) => {
        resolved++;
        if (typeof key !== 'string') { findings.push(`${at}  ${field} names ${JSON.stringify(key)}, expected a key`); return; }
        if (!refs.has(key)) {
          findings.push(`${at}  ${field} names '${key}', which no SCENE part declares as a ref. ` +
            'Every writer is null-guarded, so this line does nothing at all. ' +
            '(If the ref is created by a computed key inside a tune/make escape, this check cannot see it.)');
        }
      };
      const writers = (o, at, prefix) => {
        for (const k of Object.keys(o.opacity || {})) check(k, at, `${prefix}opacity`);
        for (const k of o.lit || []) check(k, at, `${prefix}lit`);
        // setChain reaches for refs.chain by that exact name and does nothing without it.
        if (o.chain !== undefined && !refs.has('chain')) findings.push(`${at}  ${prefix}chain is declared but the SCENE has no part keyed 'chain', so setChain returns at once`);
      };
      for (const spec of c.steps) {
        walked++;
        const at = `${c.id}/${spec.id}`;
        writers(spec, at, '');
        if (spec.rewind) writers(spec.rewind, at, 'rewind.');
        for (const k of spec.reducedLit || []) check(k, at, 'reducedLit');
        for (let i = 0; i < (spec.flow || []).length; i++) {
          const e = spec.flow[i];
          const p = (e && e.p) || {};
          const where = `${at}[${i}] ${e && e.verb}`;
          if (p.pod !== undefined) check(p.pod, where, 'pod');
          if (p.target !== undefined) check(p.target, where, 'target');
          // `on` is the one key whose miss is WORSE than a silent no-op. atOn returns on `!el`
          // BEFORE its own delay <= 0 short-circuit, so an unresolvable `on` drops the entire
          // writeStatics: the chip is not written late, it is never written at all, on either path.
          if (p.on !== undefined) check(p.on, where, 'on');
          for (const k of p.lights || []) check(k, where, 'lights');
          for (const k of p.targets || []) check(k, where, 'targets');
          for (const k of p.unlight || []) check(k, where, 'unlight');
          if (e && e.verb === 'set') writers(p, where, 'set.');
        }
      }
      // The prologue clears exactly these, so a key here that resolves to nothing leaves a highlight
      // standing into the next step.
      for (const k of (c.scene.reset && c.scene.reset.keys) || []) check(k, `${c.id} SCENE.reset`, 'keys');
      for (const k of (c.scene.reset && c.scene.reset.pods) || []) check(k, `${c.id} SCENE.reset`, 'pods');
    }
    assert.equal(walked, STEP_COUNT, `walked ${walked} steps, expected ${STEP_COUNT}`);
    assert.equal(findings.length, 0, `${findings.length} finding(s) over ${resolved} key references:\n  ${listing(findings)}`);
    t.diagnostic(`${resolved} key references over ${walked} steps all resolve, ` +
      `${escapes} functions on the specs read for the refs they assign (escapes plus the kit-bound pulses)`);
  });
});
