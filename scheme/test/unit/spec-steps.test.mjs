// Migrated cards' STEPS_SPEC read as data: field vocabulary, duration and narration shape, flow as an
// ordered program with backward references, the reduced-motion guard re-derived, chips (P-01, P-13),
// highlight lifetime (S-18, S-19), key resolution. Blind to enter/motion escapes and to real span.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census, CATALOG_BASELINE } from '../fixtures/catalog.mjs';
import { cardForm, importAll } from '../fixtures/module.mjs';
import { collectFns, entryChips, refNames, refUniverse, settledChips, staticChips, timelineOf, walkParts } from '../fixtures/spec.mjs';
import { flowLights } from '../../js/lib/step-spec.js';
import { routeDur, REVEAL_MS, BEAT } from '../../js/lib/scheme-kit.js';

// Handed to every fixture call so ../fixtures/spec.mjs stays importable without the kit.
const KIT = { routeDur, REVEAL_MS, BEAT };

// importAll() carries the census guard.
const catalogued = await cards();
const CARD_COUNT = catalogued.length;
const modules = await importAll();

// Two independent criteria: this file's reader against the fixture's whole-surface classification.
const withSpec = [...modules].filter(([, ns]) => Array.isArray(ns.STEPS_SPEC));
const byForm = [...modules].filter(([, ns]) => cardForm(ns) === 'migrated').map(([id]) => id);

const SPECS = withSpec.map(([id, ns]) => ({ id, scene: ns.SCENE, steps: ns.STEPS_SPEC }));
const STEP_COUNT = SPECS.reduce((n, c) => n + c.steps.length, 0);
const FLOW_COUNT = SPECS.reduce((n, c) => n + c.steps.reduce((m, s) => m + (s.flow ? s.flow.length : 0), 0), 0);

const listing = (items, cap = 8) =>
  items.slice(0, cap).join('\n  ') + (items.length > cap ? `\n  ... and ${items.length - cap} more` : '');

function* steps() {
  for (const c of SPECS) {
    for (let i = 0; i < c.steps.length; i++) yield { card: c, spec: c.steps[i], i, at: `${c.id}/${c.steps[i].id ?? `@${i}`}` };
  }
}

// makeSteps and runFlow read exactly these names, so a field outside the list is read by nothing.
const WRITER_FIELDS = ['chips', 'chipsCued', 'wires', 'labels', 'sublabels', 'podSublabels', 'opacity', 'lit', 'chain'];
const STEP_FIELDS = new Set([...WRITER_FIELDS, 'id', 'duration', 'narration', 'enter', 'reducedLit', 'rewind', 'flow', 'motion']);
const REWIND_FIELDS = new Set(WRITER_FIELDS);

// `after` is arrival + BEAT.afterHop, `at` the arrival, `delay` a literal, `plus` adds on top.
const COMMON_PARAMS = ['name', 'lights', 'after', 'at', 'delay', 'plus'];
const VERB_PARAMS = {
  // makeFlowKinds stamps the category onto roled verbs.
  route:   [...COMMON_PARAMS, 'points', 'dur', 'role', 'easing', 'offsets', 'fadeIn', 'fadeOut'],
  segment: [...COMMON_PARAMS, 'from', 'to', 'dur', 'role', 'fadeMs'],
  top:     [...COMMON_PARAMS, 'from', 'to', 'y', 'dur', 'role'],
  pulse:   [...COMMON_PARAMS, 'pod', 'fn', 'dim', 'persist', 'from', 'peak', 'dur'],
  fade:    [...COMMON_PARAMS, 'target', 'from', 'to', 'dur', 'fill', 'easing', 'unlight'],
  reveal:  [...COMMON_PARAMS, 'target', 'from'],
  // `on` names the element the empty 1ms timer hangs on.
  set:     [...COMMON_PARAMS, ...WRITER_FIELDS, 'on'],
  light:   [...COMMON_PARAMS, 'targets'],
  anim:    [...COMMON_PARAMS, 'target', 'keyframes', 'options'],
  run:     [...COMMON_PARAMS, 'fn'],
  // A tag lands nothing, so its arrival stays at its delay.
  tag:     [...COMMON_PARAMS, 'text', 'points', 'dur', 'easing', 'emerge', 'dy', 'dx', 'fn'],
  // Takes effect at its delay and lands nothing, like pulse.
  ripple:  [...COMMON_PARAMS, 'point', 'role'],
  // The block flash of a packet-less, Pod-less step (M-27).
  flash:   [...COMMON_PARAMS, 'targets'],
};
const VERBS = new Set(Object.keys(VERB_PARAMS));

// The ref surface comes from ../fixtures/spec.mjs.
function refsOf(card) {
  const refs = refNames(card.scene, card.steps);
  // Counts functions read, not names found.
  const fns = collectFns(card.scene).length + collectFns(card.steps).length;
  return { refs, escapes: fns };
}

describe('the migrated population', () => {
  test(`STEPS_SPEC is readable on exactly the cards the migration counter calls migrated`, (t) => {
    census('spec-steps catalog', modules.size, CARD_COUNT);
    // If STEPS_SPEC is renamed away this list empties while the fixture's does not.
    assert.ok(SPECS.length > 0,
      'not one card exports a STEPS_SPEC array, so every assertion in this file would pass over an ' +
      'empty set. Either the export was renamed or the migration was reverted.');
    assert.deepEqual(SPECS.map(c => c.id).sort(), [...byForm].sort(),
      'the cards whose STEPS_SPEC this file can read are not the cards ../fixtures/module.mjs counts ' +
      'as migrated. One of the two readers has gone blind.');
    assert.ok(STEP_COUNT > 0, `${SPECS.length} card(s) carry a STEPS_SPEC but they hold 0 steps between them`);
    // The one place a step appearing or disappearing is acknowledged. Every other file derives it.
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

  // makeSteps ignores unknown fields in silence, so the vocabulary is asserted.
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

// id, duration and narration reach neither the DOM nor WAAPI, so only this asserts their shape.
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
        // Timeline holds exactly this number before auto-advancing.
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

  // S-09: the poster is a static, silent step.
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
    // Reported, not asserted: renaming a step id is a card edit.
    t.diagnostic(`${SPECS.length} poster steps, all static and all silent` +
      (offName.length ? `. S-09 says the id is 'idle': ${offName.join(', ')}` : ''));
  });
});

// Entries emit in list order with no sorting or de-dup: getAnimations() order is observable.
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
        switch (e.verb) {
          case 'route':
            if (!Array.isArray(p.points) || p.points.length < 2) findings.push(`${where}  route needs at least 2 points, got ${Array.isArray(p.points) ? p.points.length : typeof p.points}`);
            break;
          case 'segment':
            // Points here: a pair of numbers would make routeDur NaN.
            for (const k of ['from', 'to']) {
              if (!Array.isArray(p[k]) || p[k].length !== 2 || !p[k].every(n => typeof n === 'number')) findings.push(`${where}  segment ${k} is ${JSON.stringify(p[k])}, expected a point [x, y]`);
            }
            break;
          case 'top':
            // Numbers here: topPacket builds the points itself.
            for (const k of ['from', 'to', 'y']) if (typeof p[k] !== 'number') findings.push(`${where}  top ${k} is ${JSON.stringify(p[k])}, expected an x (or y) coordinate`);
            break;
          case 'fade':
            if (typeof p.target !== 'string') findings.push(`${where}  fade target is ${JSON.stringify(p.target)}`);
            if (typeof p.to !== 'number') findings.push(`${where}  fade to is ${JSON.stringify(p.to)}, expected the opacity it ends on`);
            // WAAPI reads a missing duration as 0 and the element snaps.
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
            // runFlow reads `p.lights` for every verb except light.
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

  // M-26: `flashChips` takes any ref, so the kind behind each F.flash target is checked.
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
    t.diagnostic(`${namesDeclared} names declared, ${refs} after/at references, all resolving backwards` +
      (dead.length ? `. ${dead.length} name(s) nobody chains off: ${dead.join(' ')}` : ''));
  });

  // M-19 from the data side, a lower bound: ripples, fades and pulse tails sit past the last arrival.
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

// A wrong reduced-motion derivation is invisible to anything that enters with reduced: false.
describe('the reduced-motion guard', () => {
  test('flowLights is the ordered, de-duplicated union of what the flow lights', (t) => {
    const findings = [];
    let walked = 0, keys = 0;
    for (const { spec, at } of steps()) {
      if (!spec.flow) continue;
      walked++;
      // Derived independently, so it disagrees when flowLights drifts.
      const expect = [];
      for (const e of spec.flow) {
        const from = e.verb === 'light' ? (e.p.targets || []) : (e.p.lights || []);
        for (const k of from) if (!expect.includes(k)) expect.push(k);
      }
      const got = flowLights(spec.flow);
      assert.ok(Array.isArray(got), `${at}  flowLights returned ${typeof got}`);
      if (got.join('|') !== expect.join('|')) findings.push(`${at}  flowLights gave [${got}], the ordered union of its lights is [${expect}]`);
      if (new Set(got).size !== got.length) findings.push(`${at}  flowLights repeats a key: [${got}]. A repeat means the reduced path adds the same class twice`);
      if (flowLights(spec.flow).join('|') !== got.join('|')) findings.push(`${at}  flowLights is not deterministic over one flow`);
      keys += got.length;
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s) over ${walked} flows:\n  ${listing(findings)}`);
    assert.ok(keys > 0, 'flowLights derived 0 keys across the whole catalog, so the guard it generates is empty everywhere');
    t.diagnostic(`${walked} flows, ${keys} derived highlight keys, order and de-duplication agree with an independent reading`);
  });

  // flowLights cannot derive a highlight shown instead of motion, so the step states it as reducedLit.
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
      // With no flow, a reducedLit would light something the animated path never shows.
      if (!spec.flow || spec.flow.length === 0) findings.push(`${at}  declares reducedLit with no flow: there is no motion here for it to stand in for`);
      declared.push(`${at} -> [${spec.reducedLit}]${(spec.flow || []).some(e => e.verb === 'pulse') ? ' (stands in for a pulse)' : ''}`);
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    t.diagnostic(`${declared.length} step(s) of ${STEP_COUNT} state a reducedLit: ${declared.join('; ') || 'none'}`);
  });
});

// `chips` is the state after the static block, and settledChips in ../fixtures/spec.mjs resolves the rest.

describe('chip turnover', () => {
  // P-01, the convention half: an unset chip keeps the previous step's value. Truth stays review.
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
        // chips then chipsCued, so one ref in both is one write losing.
        if (dupes.length) findings.push(`${c.id}/${spec.id}  names [${[...new Set(dupes)]}] in both chips and chipsCued, so the setVal write is overwritten by the setChip one`);
        sets.set(spec.id, [...new Set(both)].sort());
        // A chip only an F.set writes is never written on the reduced path.
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

  // P-13: these four names are the fields of a block, so a chip keyed by one reads as the wrong kind. Use podIp.
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
    // CARD_COUNT comes off data.js, independent of the specs this file collected.
    assert.equal(SPECS.length, CARD_COUNT, `walked ${SPECS.length} cards, data.js lists ${CARD_COUNT}: a walk over a subset finds fewer defects and passes`);
    assert.equal(walked, STEP_COUNT, `walked ${walked} steps, expected ${STEP_COUNT}`);
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    assert.ok(keys > 0, 'not one chip key was read, so this ban was applied to nothing');
    t.diagnostic(`${keys} chip keys over ${walked} steps, none of them ${[...BANNED].join(' / ')}`);
  });

  // Final value: chips, enter, rewind, then every F.set in firing order.
  test('a chip resolves through chips, rewind and the flow, in that order', (t) => {
    const carried = [];
    const findings = [];
    let resolved = 0, rewound = 0;
    for (const { spec, at } of steps()) {
      const stat = staticChips(spec);
      const final = settledChips(spec, KIT);
      resolved += Object.keys(final).length;
      rewound += Object.keys((spec.rewind && spec.rewind.chips) || {}).length;
      for (const k of Object.keys(stat)) {
        if (final[k] !== stat[k]) carried.push(`${at}:${k} '${stat[k]}' -> '${final[k]}'`);
      }
      if (JSON.stringify(settledChips(spec, KIT)) !== JSON.stringify(final)) findings.push(`${at}  the chip resolution is not deterministic`);
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    // A probe, not the catalog, proves the resolver: chips, rewind and two F.sets whose source order
    // disagrees with firing order. A resolver skipping any stage gets a different answer.
    const probe = {
      chips: { k: 'static', tie: 'static' }, rewind: { chips: { k: 'rewound' } },
      flow: [
        { verb: 'top', p: { from: 0, to: 10, y: 0, name: 'hop' } },
        { verb: 'set', p: { at: 'hop', chips: { k: 'lands last' } } },
        { verb: 'set', p: { delay: 100, chips: { k: 'lands first' } } },
        { verb: 'set', p: { delay: 100, chips: { tie: 'written first' } } },
        { verb: 'set', p: { delay: 100, chips: { tie: 'written second' } } },
      ],
    };
    assert.deepEqual([staticChips(probe).k, entryChips(probe).k, settledChips(probe, KIT).k],
      ['static', 'rewound', 'lands last'],
      'the probe resolves wrong: chips, then rewind, then every F.set by the time it fires');
    assert.equal(settledChips(probe, KIT).tie, 'written second',
      'two F.sets on one delay fire in creation order, so the later one in the flow wins');
    t.diagnostic(`${resolved} chip keys resolved, ${rewound} rewound before the animated path, ` +
      `${carried.length} carried past their static value by an F.set: ` +
      carried.slice(0, 3).join(' | ') + (carried.length > 3 ? ` | ... and ${carried.length - 3} more` : ''));
  });
});

// Highlight lifetime: S-18 leaves a class on a dead block, S-19 one the prologue never clears, which accumulates.

// Keys a step lights: `lit`, `reducedLit`, F.light targets and other verbs' `lights`. `deferred` adds
// F.set `lit` and `rewind.lit`, which S-19 wants and S-18 must not assert on.
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
  // S-18: a fade to OPACITY.terminated or below kills the block, so its `unlight` must ride that fade's
  // onfinish, or the animated path keeps a lit outline around an invisible block.
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
    // CARD_COUNT comes off data.js, independent of the specs this file collected.
    assert.equal(SPECS.length, CARD_COUNT, `walked ${SPECS.length} cards, data.js lists ${CARD_COUNT}: a walk over a subset finds fewer defects and passes`);
    assert.equal(walked, STEP_COUNT, `walked ${walked} steps, expected ${STEP_COUNT}`);
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    assert.ok(dying > 0, `${fades} fades walked and none of them ends at or below ${DEAD}, so this rule was applied to nothing`);
    t.diagnostic(`${fades} fades, ${dying} of them down to <= ${DEAD} (a block dying mid-step), ${withUnlight} carrying an unlight` +
      (deferredLit.length ? `. ${deferredLit.length} site(s) light the dying target through an F.set instead, and are reported rather than asserted: ${deferredLit.join(' ')}` : ''));
  });

  // S-19: an inner box highlight clears only by name in reset.keys. `pods` resets inline strokes, no
  // class, so prev and reset accumulate the class.
  test('S-19: a Pod inner box a step lights is cleared by name in reset.keys', (t) => {
    const findings = [];
    let walked = 0, inners = 0, lit = 0;
    for (const c of SPECS) {
      // innerKey files a ref only when the inner box was built.
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
    // CARD_COUNT comes off data.js, independent of the specs this file collected.
    assert.equal(SPECS.length, CARD_COUNT, `walked ${SPECS.length} cards, data.js lists ${CARD_COUNT}: a walk over a subset finds fewer defects and passes`);
    assert.equal(walked, STEP_COUNT, `walked ${walked} steps, expected ${STEP_COUNT}`);
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    assert.ok(inners > 0, 'no Pod in the catalog declares an inner box, so this rule was applied to nothing');
    t.diagnostic(`${inners} Pod inner boxes over ${SPECS.length} cards, lit on ${lit} step/key pair(s), all cleared by name`);
  });
});

// Writers are null-guarded, so an unresolved key is a silent no-op. The six string writers are
// resolved in ../unit/spec-scene.test.mjs. Everything else (opacity, lit, chain, flow keys, reset) here.
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
        // setChain reaches for refs.chain by that exact name.
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
          // A missing `on` drops the whole writeStatics: atOn returns on `!el` before its delay short-circuit.
          if (p.on !== undefined) check(p.on, where, 'on');
          for (const k of p.lights || []) check(k, where, 'lights');
          for (const k of p.targets || []) check(k, where, 'targets');
          for (const k of p.unlight || []) check(k, where, 'unlight');
          if (e && e.verb === 'set') writers(p, where, 'set.');
        }
      }
      // A key here resolving to nothing leaves a highlight standing into the next step.
      for (const k of (c.scene.reset && c.scene.reset.keys) || []) check(k, `${c.id} SCENE.reset`, 'keys');
      for (const k of (c.scene.reset && c.scene.reset.pods) || []) check(k, `${c.id} SCENE.reset`, 'pods');
    }
    assert.equal(walked, STEP_COUNT, `walked ${walked} steps, expected ${STEP_COUNT}`);
    assert.equal(findings.length, 0, `${findings.length} finding(s) over ${resolved} key references:\n  ${listing(findings)}`);
    t.diagnostic(`${resolved} key references over ${walked} steps all resolve, ` +
      `${escapes} functions on the specs read for the refs they assign (escapes plus the kit-bound pulses)`);
  });
});
