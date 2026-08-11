// spec-steps.test.mjs: a card's CHOREOGRAPHY read as DATA, in bare Node, with no browser and no
// source scraping. Everything here comes off `STEPS_SPEC` on the module namespace of a MIGRATED
// card, so it runs in milliseconds and it runs on the shape the declarative layer introduced:
// `flow` as an ordered emission program, `flowLights` as the derived reduced-motion guard, and
// `chips` as the state after the static block.
//
// ===========================================================================================
// THE POPULATION IS MIXED, AND THAT IS THE FIRST THING THIS FILE HAS TO SURVIVE
// ===========================================================================================
// A LEGACY card exports only `init` and seals its steps inside makeInit's closure, so there is
// nothing here to read: 21 of the 108 cards are migrated today and 87 are not. A test that simply
// skipped whatever it could not read would go quiet the day `STEPS_SPEC` is renamed, and a green run
// over an empty set is worse than a red one. So the walk is counted twice by two INDEPENDENT
// criteria: this file collects the cards whose `STEPS_SPEC` is an array, ../fixtures/module.mjs
// classifies the same cards by their whole export surface, and the two counts must agree exactly.
// Lose the export and both drop together; lose only the reader here and the numbers split and fail.
//
// ===========================================================================================
// WHAT THIS FILE ASSERTS THAT NOTHING ELSE CAN
// ===========================================================================================
//   - THE ORACLE CANNOT SEE `duration` AT ALL. Editing 1500 to 1501 leaves both halves of
//     test/oracle/ reporting CARD CLEAN, because the declared duration is a Timeline hold and not a
//     WAAPI animation (plan III.4). render/duration.test.mjs measures span <= duration off a live
//     card; this file asserts, off the data, that the field EXISTS, is a positive integer, and that
//     the arrival arithmetic the flow itself declares already fits inside it.
//   - THE ORACLE NEVER WALKS THE REDUCED PATH. Both dumps open a context with
//     reducedMotion: 'no-preference' and _shared.mjs enters every step with reduced: false (plan
//     III.8a). `flowLights` is the newest thing the layer does and it lives exactly there, so a
//     wrong derivation would be caught by nothing. Here it is re-derived independently and compared.
//   - A MISNAMED KEY IS A SILENT NO-OP. Every writer in scheme-kit is null-guarded (`setVal` is
//     `if (node && node.valueText)`), so `chips: { termChp: '4' }` throws nothing, draws nothing and
//     leaves the chip showing the PREVIOUS step's value, which is the one failure that looks
//     plausible on screen. Every key a step names is resolved against the scene here.
//
// ===========================================================================================
// WHAT THIS FILE IS BLIND TO, BY CONSTRUCTION
// ===========================================================================================
//   - Anything a step does inside its `enter(s, ctx)` or `motion(s, ctx)` escape. 14 of the 137
//     steps carry one. Their bodies are functions, not data, and this file does not read them
//     except to widen the set of legal ref names (see refsOf below).
//   - Whether a value is TRUE. P-01 is enforced here as a CONVENTION (every step writes every chip);
//     whether a carried-over value still describes the picture stays a review rule, exactly as the
//     canon says.
//   - Geometry. A route's points are read only for their arithmetic (length -> flight time), never
//     for where they sit. That is the scene test's subject.
//   - Real span. The arrival arithmetic below is a LOWER BOUND on what render/duration.test.mjs
//     measures: it ignores the ripple, the packet fades and the pulse tails, and an infinite
//     animation has no length here at all. It cannot replace that test and does not try to.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census } from '../fixtures/catalog.mjs';
import { cardForm, importAll } from '../fixtures/module.mjs';
import { flowLights } from '../../js/lib/step-spec.js';
import { routeDur, REVEAL_MS, BEAT } from '../../js/lib/scheme-kit.js';

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
  // block the write is about, and anim-dump records which.
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
};
const VERBS = new Set(Object.keys(VERB_PARAMS));

// ---------------------------------------------------------------------------------------------
// The scene's ref surface, needed only to resolve the names a STEP uses. Built from the part list,
// plus the two Pod sub-refs, plus whatever an escape assigns.
//
// WHY THE ESCAPES ARE READ AT ALL. `tune(el, refs)` and `raw.make(refs)` may write a ref: 3 of the
// 21 cards do it, 5 keys in all (crdRow, appGroup, appBox, n4Label, n4Sub). Reading `refs.x =` out
// of a function we already hold as a VALUE only ever WIDENS the legal set, so a pattern this misses
// costs a loud false finding, never a silent pass. That is the safe direction for a guess.
// ---------------------------------------------------------------------------------------------
const ESCAPE_ASSIGN = /\brefs\s*(?:\.\s*([A-Za-z_$][\w$]*)|\[\s*['"]([^'"]+)['"]\s*\])\s*=(?!=)/g;

function collectFns(value, out, depth = 0) {
  if (depth > 8 || value === null || typeof value !== 'object') return;
  for (const v of Object.values(value)) {
    if (typeof v === 'function') out.push(v);
    else if (v && typeof v === 'object') collectFns(v, out, depth + 1);
  }
}

function refsOf(card) {
  const refs = new Set(), wires = new Set();
  const walk = (parts) => {
    for (const part of parts || []) {
      if (!part) continue;
      const { kind, key, p = {} } = part;
      // A wire lands in refs.wires[key], everything else in refs[key]: two namespaces, so a
      // `wires: { api: ... }` naming a box would resolve to nothing.
      if (kind === 'wire') { if (key) wires.add(key); } else if (key) refs.add(key);
      if (kind === 'pod') { if (p.shellKey) refs.add(p.shellKey); if (p.innerKey) refs.add(p.innerKey); }
      if (kind === 'group') walk(p.parts);
    }
  };
  walk(card.scene && card.scene.parts);
  const fns = [];
  collectFns(card.scene, fns);
  collectFns(card.steps, fns);
  for (const fn of fns) {
    for (const m of fn.toString().matchAll(ESCAPE_ASSIGN)) refs.add(m[1] || m[2]);
  }
  return { refs, wires, escapes: fns.length };
}

// ---------------------------------------------------------------------------------------------
// The delay and arrival arithmetic, re-implemented here from what runFlow does, because the point is
// to disagree with it when a card is wrong rather than to inherit its answer. Route flight time is
// pure geometry (routeDur over the points), which is why an arrival is knowable with no browser.
// ---------------------------------------------------------------------------------------------
const HOP_MS = 700;   // topPacket's default dur, the only length not derived from the points

function delayOf(p, named) {
  const ref = (v) => (typeof v === 'number' ? v : named.get(v));
  let d;
  if (p.after !== undefined) d = ref(p.after) + BEAT.afterHop;
  else if (p.at !== undefined) d = ref(p.at);
  else d = p.delay || 0;
  return d + (p.plus || 0);
}

function arrivalOf(verb, p, delay) {
  switch (verb) {
    case 'route':   return delay + (p.dur == null ? routeDur(p.points) : p.dur);
    case 'segment': return delay + (p.dur == null ? routeDur([p.from, p.to]) : p.dur);
    case 'top':     return delay + (p.dur == null ? HOP_MS : p.dur);
    case 'fade':    return delay + (p.dur || 0);
    case 'reveal':  return delay + REVEAL_MS;
    case 'anim':    return delay + ((p.options && p.options.duration) || 0);
    // pulse, set, light and run take effect AT their delay: runFlow leaves arrival = delay.
    default:        return delay;
  }
}

// The whole flow as a timeline. Returns null when a reference cannot be resolved, which is the
// finding the reference test reports: no arithmetic downstream of an unresolvable name is meaningful.
function timelineOf(flow) {
  const named = new Map();
  const rows = [];
  for (const e of flow || []) {
    const p = e.p || {};
    for (const f of ['after', 'at']) {
      if (typeof p[f] === 'string' && !named.has(p[f])) return null;
    }
    const delay = delayOf(p, named);
    if (!Number.isFinite(delay)) return null;
    const arrival = arrivalOf(e.verb, p, delay);
    if (p.name) named.set(p.name, arrival);
    rows.push({ verb: e.verb, p, delay, arrival });
  }
  return rows;
}

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
// id, duration, narration. None of the three reaches the DOM or WAAPI, so the oracle is blind to all
// of them (plan III.4) and this is the only place their SHAPE is asserted at all.
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
        // and the oracle reports CARD CLEAN whatever it says.
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
      const rows = timelineOf(spec.flow);
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
// The derived reduced-motion guard. THE ORACLE NEVER GOES HERE (plan III.8a): both dumps run with
// reducedMotion 'no-preference' and enter every step with reduced: false, so a wrong derivation is
// invisible to the whole refactor safety net and visible only to a reader of the data.
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

// A key's value at the end of the ANIMATED path: the static block, then rewind, then every F.set in
// flow order. `enter` is an escape and is not read, so a key it writes is reported as unknowable
// rather than resolved wrongly.
function finalChips(spec) {
  const out = { ...(spec.chips || {}), ...(spec.chipsCued || {}) };
  Object.assign(out, spec.rewind && spec.rewind.chips, spec.rewind && spec.rewind.chipsCued);
  for (const e of spec.flow || []) {
    if (e.verb !== 'set') continue;
    Object.assign(out, e.p.chips, e.p.chipsCued);
  }
  return out;
}

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

  // The reading rule, asserted by exercising it: a key's final value is chips, then enter, then
  // rewind, then every F.set in flow order. A check that reads `chips` as the final value is wrong
  // on exactly the steps counted below, and cluster-etcd-raft `quorum-lost` is the exemplar: it
  // states r1 as Leader and an F.set turns it over to Follower at 1500ms.
  test('a chip resolves through chips, rewind and the flow, in that order', (t) => {
    const carried = [];
    const findings = [];
    let resolved = 0, rewound = 0;
    for (const { spec, at } of steps()) {
      const stat = { ...(spec.chips || {}), ...(spec.chipsCued || {}) };
      const final = finalChips(spec);
      resolved += Object.keys(final).length;
      rewound += Object.keys((spec.rewind && spec.rewind.chips) || {}).length;
      for (const k of Object.keys(stat)) {
        if (final[k] !== stat[k]) carried.push(`${at}:${k} '${stat[k]}' -> '${final[k]}'`);
      }
      // Same input, same answer: the resolution must not depend on iteration luck.
      if (JSON.stringify(finalChips(spec)) !== JSON.stringify(final)) findings.push(`${at}  the chip resolution is not deterministic`);
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
// Every writer in scheme-kit is null-guarded, so a key that names nothing is a SILENT no-op: no
// throw, no visible change, and the element keeps whatever the previous step left on it.
// ---------------------------------------------------------------------------------------------
describe('key resolution', () => {
  test('every key a step writes, lights or moves names something the SCENE declares', (t) => {
    const findings = [];
    let walked = 0, resolved = 0, escapes = 0;
    for (const c of SPECS) {
      const { refs, wires, escapes: n } = refsOf(c);
      escapes += n;
      assert.ok(refs.size > 0, `${c.id}  the SCENE declares no keyed part at all, so nothing here could resolve`);
      const check = (key, at, field, bucket) => {
        resolved++;
        const known = bucket === 'wire' ? wires : refs;
        if (typeof key !== 'string') { findings.push(`${at}  ${field} names ${JSON.stringify(key)}, expected a key`); return; }
        if (!known.has(key)) {
          findings.push(`${at}  ${field} names '${key}', which no SCENE part declares as a ${bucket === 'wire' ? 'wire (refs.wires)' : 'ref'}. ` +
            'Every writer is null-guarded, so this line does nothing at all. ' +
            '(If the ref is created by a computed key inside a tune/make escape, this check cannot see it.)');
        }
      };
      const writers = (o, at, prefix) => {
        for (const f of ['chips', 'chipsCued', 'labels', 'sublabels', 'podSublabels', 'opacity']) {
          for (const k of Object.keys(o[f] || {})) check(k, at, `${prefix}${f}`, 'ref');
        }
        for (const k of Object.keys(o.wires || {})) check(k, at, `${prefix}wires`, 'wire');
        for (const k of o.lit || []) check(k, at, `${prefix}lit`, 'ref');
        // setChain reaches for refs.chain by that exact name and does nothing without it.
        if (o.chain !== undefined && !refs.has('chain')) findings.push(`${at}  ${prefix}chain is declared but the SCENE has no part keyed 'chain', so setChain returns at once`);
      };
      for (const spec of c.steps) {
        walked++;
        const at = `${c.id}/${spec.id}`;
        writers(spec, at, '');
        if (spec.rewind) writers(spec.rewind, at, 'rewind.');
        for (const k of spec.reducedLit || []) check(k, at, 'reducedLit', 'ref');
        for (let i = 0; i < (spec.flow || []).length; i++) {
          const e = spec.flow[i];
          const p = (e && e.p) || {};
          const where = `${at}[${i}] ${e && e.verb}`;
          if (p.pod !== undefined) check(p.pod, where, 'pod', 'ref');
          if (p.target !== undefined) check(p.target, where, 'target', 'ref');
          for (const k of p.lights || []) check(k, where, 'lights', 'ref');
          for (const k of p.targets || []) check(k, where, 'targets', 'ref');
          for (const k of p.unlight || []) check(k, where, 'unlight', 'ref');
          if (e && e.verb === 'set') writers(p, where, 'set.');
        }
      }
      // The prologue clears exactly these, so a key here that resolves to nothing leaves a highlight
      // standing into the next step.
      for (const k of (c.scene.reset && c.scene.reset.keys) || []) check(k, `${c.id} SCENE.reset`, 'keys', 'ref');
      for (const k of (c.scene.reset && c.scene.reset.pods) || []) check(k, `${c.id} SCENE.reset`, 'pods', 'ref');
    }
    assert.equal(walked, STEP_COUNT, `walked ${walked} steps, expected ${STEP_COUNT}`);
    assert.equal(findings.length, 0, `${findings.length} finding(s) over ${resolved} key references:\n  ${listing(findings)}`);
    t.diagnostic(`${resolved} key references over ${walked} steps all resolve, ` +
      `${escapes} functions on the specs read for the refs they assign (escapes plus the kit-bound pulses)`);
  });
});
