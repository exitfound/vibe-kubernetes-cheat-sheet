// Migrated card shape against the exported spec and the live lib/ bindings: S-01, S-10, S-11 (traced
// call order), S-04/S-05 camera via a recording DOM stub, D-14 static poster, C-04 declared shades.
// Blind to escape hooks (raw, tune), flow order, lane geometry and the rendered picture.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { CARD_FORMS, cardForm, importAll, importLib } from '../fixtures/module.mjs';

// importAll() carries the census guard.
const catalogued = await cards();
const CARD_COUNT = catalogued.length;
const modules = await importAll();

const schemeKit = await importLib('scheme-kit.js');
const sceneSpec = await importLib('scene-spec.js');
const stepSpec = await importLib('step-spec.js');
const { OPACITY } = await importLib('tokens.js');

// cardForm is exact set equality on the export surface. Migrated + legacy must sum to the catalog.
const MIGRATED = [];
let legacyCount = 0;
for (const c of catalogued) {
  const form = cardForm(modules.get(c.id));
  if (form === 'migrated') MIGRATED.push({ ...c, ns: modules.get(c.id) });
  else if (form === 'legacy') legacyCount++;
}
const N = MIGRATED.length;

const listing = (items, cap = 8) =>
  items.slice(0, cap).join('\n  ') + (items.length > cap ? `\n  ... and ${items.length - cap} more` : '');

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// `null` entries are legal (appendParts skips them) and counted, never a finding.
function walkParts(parts, path, out, nulls) {
  (parts || []).forEach((part, i) => {
    const at = `${path}[${i}]`;
    if (!part) { nulls.push(at); return; }
    out.push({ part, at });
    if (part.kind === 'group') walkParts(part.p && part.p.parts, `${at}.parts`, out, nulls);
  });
}
function partsOf(scene) {
  const out = [], nulls = [];
  walkParts(scene.parts, 'parts', out, nulls);
  return { flat: out, nulls };
}

// The census: migrated + legacy equals data.js. In each test below `walked === N` is only a tripwire
// against a `continue` added above the counter.
test(`the migrated population is ${N} card(s), and the split accounts for the whole catalog`, (t) => {
  assert.ok(N > 0, 'no card is in the migrated form, so every assertion in this file walked an empty list');
  assert.equal(N + legacyCount, CARD_COUNT,
    `${N} migrated + ${legacyCount} legacy = ${N + legacyCount}, but data.js lists ${CARD_COUNT} card(s). ` +
    'A card in neither form is a card this file skipped without saying so.');
  t.diagnostic(`skeleton walk: ${N} migrated (surface [${CARD_FORMS.migrated}]), ` +
    `${legacyCount} legacy (surface [${CARD_FORMS.legacy}]), ${CARD_COUNT} in the catalog`);
});

// What SCENE and STEPS_SPEC hold must be the shape the declarative layer consumes.
describe('the migrated module, as data', () => {
  // Closed to three keys: a fourth would be read by nobody.
  const SCENE_KEYS = ['aria-label', 'parts', 'reset'];
  const RESET_KEYS = ['keys', 'pods', 'extra'];

  test(`every migrated SCENE is data buildScene can walk (${N} cards)`, (t) => {
    const findings = [];
    let walked = 0, partCount = 0, nullCount = 0, keyed = 0;
    for (const { id, ns } of MIGRATED) {
      walked++;
      const scene = ns.SCENE;
      for (const k of Object.keys(scene)) {
        if (!SCENE_KEYS.includes(k)) findings.push(`${id}  SCENE carries "${k}", which is outside [${SCENE_KEYS.join(', ')}]`);
      }
      if (!Array.isArray(scene.parts) || scene.parts.length === 0) {
        findings.push(`${id}  SCENE.parts is ${Array.isArray(scene.parts) ? 'an empty array' : typeof scene.parts}, expected a non-empty array`);
        continue;
      }
      const { flat, nulls } = partsOf(scene);
      partCount += flat.length;
      nullCount += nulls.length;
      for (const { part, at } of flat) {
        if (!isPlainObject(part)) { findings.push(`${id}  ${at} is ${typeof part}, expected a part record`); continue; }
        if (typeof part.kind !== 'string' || !part.kind) findings.push(`${id}  ${at} has kind ${JSON.stringify(part.kind)}, expected a non-empty string`);
        if (!isPlainObject(part.p)) findings.push(`${id}  ${at} (${part.kind}) has no props object`);
        if (part.key !== undefined) {
          if (typeof part.key !== 'string' || !part.key) findings.push(`${id}  ${at} (${part.kind}) has key ${JSON.stringify(part.key)}`);
          else keyed++;
        }
      }
      // Missing reset is legal to the code but means a card that never clears a highlight.
      if (!isPlainObject(scene.reset)) {
        findings.push(`${id}  SCENE.reset is ${typeof scene.reset}, expected an object with [${RESET_KEYS.join(', ')}]`);
        continue;
      }
      for (const k of Object.keys(scene.reset)) {
        if (!RESET_KEYS.includes(k)) findings.push(`${id}  SCENE.reset carries "${k}", which makeResetStep does not read`);
      }
      for (const k of ['keys', 'pods']) {
        const v = scene.reset[k];
        if (v === undefined) continue;
        if (!Array.isArray(v)) { findings.push(`${id}  SCENE.reset.${k} is ${typeof v}, expected an array`); continue; }
        const bad = v.filter(e => typeof e !== 'string' || !e);
        if (bad.length) findings.push(`${id}  SCENE.reset.${k} holds ${bad.length} entry that is not a ref name`);
      }
      if (scene.reset.extra !== undefined && typeof scene.reset.extra !== 'function') {
        findings.push(`${id}  SCENE.reset.extra is ${typeof scene.reset.extra}, expected a function`);
      }
      if (!Array.isArray(scene.reset.keys) || scene.reset.keys.length === 0) {
        findings.push(`${id}  SCENE.reset.keys is empty, so resetStep clears no highlight between steps`);
      }
    }
    assert.equal(walked, N, `walked ${walked} card(s), the migrated population is ${N}`);
    assert.equal(findings.length, 0, `${findings.length} finding(s) over ${walked} migrated card(s):\n  ${listing(findings)}`);
    t.diagnostic(`${walked} scenes, ${partCount} parts (${keyed} keyed, ${nullCount} conditional null entries appendParts skips)`);
  });

  // Runs the card data through makeScene and makeSteps, both pure in bare Node, so bad data throws here.
  test(`every migrated card's data survives makeScene and makeSteps (${N} cards)`, (t) => {
    const findings = [];
    let walked = 0, stepCount = 0;
    for (const { id, ns } of MIGRATED) {
      walked++;
      let Scene, steps;
      try {
        Scene = sceneSpec.makeScene(ns.SCENE);
        steps = stepSpec.makeSteps(ns.STEPS_SPEC, { resetStep: sceneSpec.makeResetStep(ns.SCENE) });
      } catch (e) {
        findings.push(`${id}  ${e.constructor.name}: ${e.message.split('\n')[0]}`);
        continue;
      }
      // S-01: the prototype inventory is closed.
      if (Scene.name !== 'Scene') findings.push(`${id}  makeScene returns a class named "${Scene.name}"`);
      if (Scene.length !== 1) findings.push(`${id}  Scene takes ${Scene.length} argument(s), the contract is constructor(host)`);
      const proto = Object.getOwnPropertyNames(Scene.prototype).sort();
      if (proto.join(',') !== 'build,constructor,reset') findings.push(`${id}  Scene.prototype holds [${proto.join(', ')}], expected [build, constructor, reset]`);

      if (steps.length !== ns.STEPS_SPEC.length) {
        findings.push(`${id}  ${ns.STEPS_SPEC.length} spec(s) produced ${steps.length} step(s)`);
        continue;
      }
      stepCount += steps.length;
      const seen = new Set();
      steps.forEach((step, i) => {
        const spec = ns.STEPS_SPEC[i];
        if (typeof step.id !== 'string' || !step.id) findings.push(`${id}  step ${i} has id ${JSON.stringify(step.id)}`);
        else if (seen.has(step.id)) findings.push(`${id}  step id "${step.id}" is used twice, so a finding cannot name one step`);
        else seen.add(step.id);
        if (!Number.isFinite(step.duration) || step.duration <= 0) findings.push(`${id}  step "${step.id}" has duration ${step.duration}`);
        if (typeof step.enter !== 'function') findings.push(`${id}  step "${step.id}" produced no enter()`);
        else if (step.enter.length !== 2) findings.push(`${id}  step "${step.id}" enter takes ${step.enter.length} argument(s), the contract is enter(s, ctx)`);
        // Identity, not a deep compare: a frozen probe reads intent off _timeline.steps[i].spec.
        if (step.spec !== spec) findings.push(`${id}  step "${step.id}" does not carry its own spec object`);
      });
      // D-14: step 0 is a static poster.
      const first = ns.STEPS_SPEC[0];
      if (first.flow || first.motion) {
        findings.push(`${id}  step 0 "${first.id}" declares ${first.flow ? 'a flow' : ''}${first.flow && first.motion ? ' and ' : ''}${first.motion ? 'a motion()' : ''}, but the poster step is static`);
      }
    }
    assert.equal(walked, N, `walked ${walked} card(s), the migrated population is ${N}`);
    assert.equal(findings.length, 0, `${findings.length} finding(s) over ${walked} migrated card(s):\n  ${listing(findings)}`);
    t.diagnostic(`${walked} cards, ${stepCount} steps built from spec, every step 0 static (D-14, the readable half)`);
  });
});

// S-04 / S-05: one camera for the whole catalog.
const CANON_VIEWBOX = '0 0 1200 640';
const CANON_PAR = 'xMidYMid meet';

// Just createElementNS and setAttribute, all diagramRoot touches. A stub reads the applied value,
// where a regex over its source would go quiet once attributes are composed.
function recordingDocument() {
  const made = [];
  const node = (tag) => ({
    tag, attrs: {}, children: [], style: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    appendChild(c) { this.children.push(c); return c; },
    addEventListener() {},
  });
  return {
    made,
    createElementNS(ns, tag) { const el = node(tag); el.ns = ns; made.push(el); return el; },
    createTextNode(t) { return { text: t }; },
  };
}

function withStubDocument(fn) {
  const had = Object.prototype.hasOwnProperty.call(globalThis, 'document');
  const prev = globalThis.document;
  const doc = recordingDocument();
  globalThis.document = doc;
  try { return fn(doc); } finally { if (had) globalThis.document = prev; else delete globalThis.document; }
}

describe('S-04 and S-05: one camera, and no card owns it', () => {
  test('the single camera carries the canon canvas, read off the attributes it applies', (t) => {
    const root = withStubDocument(() => schemeKit.diagramRoot({ 'aria-label': 'probe label' }));
    assert.ok(root && root.attrs, 'diagramRoot returned nothing a stub could record, so this assertion read no attribute at all');
    assert.equal(root.tag, 'svg', `the diagram root is a <${root.tag}>`);
    assert.equal(root.attrs.viewBox, CANON_VIEWBOX,
      `the diagram root carries viewBox "${root.attrs.viewBox}", the canon canvas is "${CANON_VIEWBOX}". ` +
      'S-04 says re-centre the content, do not move the camera.');
    assert.equal(root.attrs.preserveAspectRatio, CANON_PAR,
      `preserveAspectRatio is "${root.attrs.preserveAspectRatio}", expected "${CANON_PAR}"`);
    assert.equal(root.attrs.class, 'diagram', `the root class is "${root.attrs.class}", every probe and every stylesheet selects on .diagram`);
    assert.equal(root.attrs['aria-label'], 'probe label', 'diagramRoot dropped the aria-label it was handed');
    t.diagnostic(`one camera for ${CARD_COUNT} cards: viewBox ${CANON_VIEWBOX}, preserveAspectRatio ${CANON_PAR}, ` +
      `${Object.keys(root.attrs).length} attributes on the root`);
  });

  // A card could only reach the camera by declaring a camera key on itself or a part. The aria-label must not be blank.
  const CAMERA_KEYS = ['viewBox', 'preserveAspectRatio'];
  test(`no migrated card declares a camera, and each feeds the one camera an aria-label (${N} cards)`, (t) => {
    const findings = [];
    let walked = 0, inspected = 0, rawParts = 0;
    for (const { id, ns } of MIGRATED) {
      walked++;
      const scene = ns.SCENE;
      const aria = scene['aria-label'];
      if (typeof aria !== 'string' || !aria.trim()) {
        findings.push(`${id}  SCENE['aria-label'] is ${typeof aria === 'string' ? 'blank' : typeof aria}, so the diagram root is unnamed`);
      } else if (aria !== aria.trim()) {
        findings.push(`${id}  SCENE['aria-label'] has leading or trailing space`);
      }
      for (const k of CAMERA_KEYS) {
        if (k in scene) findings.push(`${id}  SCENE declares "${k}", a second camera. There is one, in diagramRoot`);
      }
      for (const { part, at } of partsOf(scene).flat) {
        inspected++;
        if (part.kind === 'raw') rawParts++;
        const p = part.p || {};
        for (const k of CAMERA_KEYS) {
          if (k in p) findings.push(`${id}  ${at} (${part.kind}) declares "${k}", a second camera`);
        }
      }
    }
    assert.equal(walked, N, `walked ${walked} card(s), the migrated population is ${N}`);
    assert.equal(findings.length, 0, `${findings.length} finding(s) over ${walked} migrated card(s):\n  ${listing(findings)}`);
    t.diagnostic(`${walked} scenes, ${inspected} parts inspected for a camera key, none found. ` +
      `Blind to what ${rawParts} P.raw make() function(s) build.`);
  });
});

// The generated enter() run against recording fakes: what is measured is call order.
describe('S-01, S-10, S-11: the skeleton, generated once instead of copied per card', () => {
  // A probe SCENE with no parts, so only diagramRoot and the host are reached.
  test('S-01: makeScene builds on construction and reset() repaints from scratch', (t) => {
    const PROBE_SCENE = { 'aria-label': 'probe', parts: [], reset: { keys: [] } };
    const trace = [];
    const host = {
      replaceChildren: () => trace.push('host.replaceChildren'),
      appendChild: (c) => { trace.push('host.appendChild'); return c; },
    };
    const Scene = sceneSpec.makeScene(PROBE_SCENE);
    const scene = withStubDocument(() => {
      const inst = new Scene(host);
      inst.reset();
      return inst;
    });
    assert.equal(scene.host, host, 'the constructor did not keep its host');
    assert.deepEqual(trace, ['host.replaceChildren', 'host.appendChild', 'host.replaceChildren', 'host.appendChild'],
      `construction plus one reset() gave ${JSON.stringify(trace)}. The contract is that BOTH paint, ` +
      'because a step is replayed against a fresh tree rather than undone.');
    assert.ok(scene.refs && typeof scene.refs === 'object', 'the scene exposes no refs map');
    assert.ok(scene.refs.svg, 'refs.svg is unset, so nothing can time an at() against the root');
    assert.deepEqual(scene.refs.wires, {}, 'refs.wires must exist even with no wire part, or setWire writes nowhere');
    t.diagnostic(`one Scene class serves ${N} migrated card(s): constructor(host) paints, reset() repaints`);
  });

  test('S-11: the generated resetStep clears the packet layer first and the wires last', (t) => {
    const trace = [];
    const s = {
      refs: {
        packetLayer: { replaceChildren: () => trace.push('packetLayer.replaceChildren') },
        boxA: { classList: { remove: () => trace.push('clearHighlights'), add() {} } },
        podA: { querySelectorAll: () => { trace.push('clearPodHighlight'); return []; } },
        wires: { w1: { set textContent(v) { trace.push(`clearWires:${JSON.stringify(v)}`); } } },
      },
    };
    const resetStep = sceneSpec.makeResetStep({
      'aria-label': 'probe', parts: [],
      reset: { keys: ['boxA'], pods: ['podA'], extra: () => trace.push('reset.extra') },
    });
    assert.equal(resetStep.name, 'resetStep', `the prologue is named "${resetStep.name}"`);
    assert.equal(resetStep.length, 1, `the prologue takes ${resetStep.length} argument(s), the contract is resetStep(s)`);
    resetStep(s);
    // Recorded deviation from S-11: `reset.extra` runs after clearWires. Asserted as it is, so a reorder goes red.
    assert.deepEqual(trace,
      ['packetLayer.replaceChildren', 'clearHighlights', 'clearPodHighlight', 'clearWires:""', 'reset.extra'],
      `the prologue ran ${JSON.stringify(trace)}. packetLayer.replaceChildren() must come first or a ` +
      'ball from the previous step is still on screen while the new step paints.');
    t.diagnostic(`prologue order: ${trace.join(' -> ')}`);
  });

  // The one enter() in the catalog is generated, so S-10 is a fact about one function.
  test('S-10: the generated enter() opens with the prologue, and the escape closes the static block', (t) => {
    const F = stepSpec.makeFlowKinds({ role: 'probe' });
    const build = (extra = {}) => {
      const trace = [];
      const s = {
        refs: {
          chipA: { valueText: { set textContent(v) { trace.push(`chips:${v}`); } } },
          boxA: { classList: { add: () => trace.push('lit'), remove() {} } },
          wires: {},
        },
      };
      const spec = {
        id: 'probe', duration: 100,
        chips: { chipA: 'after' },
        lit: ['boxA'],
        enter: () => trace.push('spec.enter'),
        rewind: { chips: { chipA: 'before' } },
        // delay 0, so at() runs inline and needs no refs.svg.animate.
        flow: [F.run({ fn: () => trace.push('flow.run'), delay: 0 })],
        motion: () => trace.push('spec.motion'),
        ...extra,
      };
      const [step] = stepSpec.makeSteps([spec], { resetStep: () => trace.push('resetStep') });
      return { trace, s, step, spec };
    };

    const animated = build();
    animated.step.enter(animated.s, { reduced: false, register() {} });
    assert.deepEqual(animated.trace,
      ['resetStep', 'chips:after', 'lit', 'spec.enter', 'chips:before', 'flow.run', 'spec.motion'],
      `the animated path ran ${JSON.stringify(animated.trace)}. resetStep must be first and the card ` +
      'escape must close the STATIC block, before rewind and before any emission.');

    // Everything above the guard is written on both paths.
    const reduced = build({ reducedLit: ['boxA'] });
    reduced.step.enter(reduced.s, { reduced: true, register() {} });
    assert.deepEqual(reduced.trace, ['resetStep', 'chips:after', 'lit', 'spec.enter', 'lit'],
      `the reduced path ran ${JSON.stringify(reduced.trace)}. It must write the same statics, run the ` +
      'same escape, add the derived and declared lights, and emit nothing.');
    assert.ok(!reduced.trace.includes('flow.run'), 'the reduced path ran a flow entry');
    assert.ok(!reduced.trace.includes('spec.motion'), 'the reduced path ran motion(), which is the animated-only escape');
    assert.ok(!reduced.trace.includes('chips:before'), 'the reduced path ran rewind, which exists only to be undone by motion');

    assert.equal(animated.step.enter.name, 'enter', `the generated step function is named "${animated.step.enter.name}"`);
    t.diagnostic(`animated: ${animated.trace.join(' -> ')} | reduced: ${reduced.trace.join(' -> ')}`);
  });
});

// C-04 over declared shades, with the vocabulary imported from tokens.js.
describe('C-04: every declared shade comes from the OPACITY vocabulary', () => {
  const ALLOWED = new Map([
    // C-04 governs what lies between 0 and 1.
    [0, 'bare 0'],
    [1, 'bare 1'],
    ...Object.entries(OPACITY).map(([name, v]) => [v, `OPACITY.${name}`]),
  ]);

  // Every place a number reaches opacity through the layer. F.pulse `peak` is a magnitude, kept out on purpose.
  function* declaredOpacity(id, ns) {
    for (const { part, at } of partsOf(ns.SCENE).flat) {
      const p = part.p || {};
      if (p.opacity !== undefined) yield { v: p.opacity, where: `${id} ${at} (${part.kind}).opacity` };
    }
    for (const step of ns.STEPS_SPEC) {
      const tag = `${id}/${step.id}`;
      for (const [k, v] of Object.entries(step.opacity || {})) yield { v, where: `${tag} opacity.${k}` };
      for (const [k, v] of Object.entries((step.rewind && step.rewind.opacity) || {})) yield { v, where: `${tag} rewind.opacity.${k}` };
      for (const e of step.flow || []) {
        const p = e.p || {};
        if (e.verb === 'set') for (const [k, v] of Object.entries(p.opacity || {})) yield { v, where: `${tag} F.set.opacity.${k}` };
        if (e.verb === 'fade') {
          // Both go straight into a keyframe.
          if (p.from !== undefined) yield { v: p.from, where: `${tag} F.fade.from` };
          if (p.to !== undefined) yield { v: p.to, where: `${tag} F.fade.to` };
        }
        if (e.verb === 'reveal' && p.from !== undefined) yield { v: p.from, where: `${tag} F.reveal.from` };
        if (e.verb === 'anim') {
          const frames = p.keyframes || [];
          for (let i = 0; i < frames.length; i++) {
            const kf = frames[i];
            if (kf && kf.opacity !== undefined) yield { v: kf.opacity, where: `${tag} F.anim.keyframes[${i}].opacity` };
          }
        }
      }
    }
  }

  // laneOf() returns a string and writeStatics does String(v) anyway, so strings are coerced, not findings.
  const asShade = (v) => {
    if (typeof v === 'number') return { n: v, str: false };
    if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return { n: Number(v), str: true };
    return { n: NaN, str: typeof v === 'string' };
  };

  test(`every shade a migrated card declares is in the vocabulary (${N} cards)`, (t) => {
    const findings = [];
    const histogram = new Map();
    let walked = 0, read = 0, asString = 0;
    for (const { id, ns } of MIGRATED) {
      walked++;
      for (const { v, where } of declaredOpacity(id, ns)) {
        read++;
        const { n, str } = asShade(v);
        if (str) asString++;
        if (!Number.isFinite(n)) {
          findings.push(`${where} is ${JSON.stringify(v)}, which is not a shade at all`);
          continue;
        }
        const name = ALLOWED.get(n);
        if (!name) {
          findings.push(`${where} = ${v}, which is not in [${[...ALLOWED.entries()].map(([val, label]) => `${label}=${val}`).join(', ')}]`);
          continue;
        }
        histogram.set(name, (histogram.get(name) || 0) + 1);
      }
    }
    assert.equal(walked, N, `walked ${walked} card(s), the migrated population is ${N}`);
    // Loose on purpose: it only has to catch a reader that stopped matching.
    assert.ok(read > 100,
      `read ${read} declared opacity value(s) over ${walked} card(s). The spec surface this walks ` +
      '(parts, step.opacity, rewind.opacity, F.set, F.fade, F.reveal, F.anim) has gone quiet.');
    assert.equal(findings.length, 0,
      `${findings.length} of ${read} declared shade(s) are outside the OPACITY vocabulary:\n  ${listing(findings)}`);
    t.diagnostic(`${read} declared shades over ${walked} cards (${asString} of them strings out of laneOf), ` +
      `${ALLOWED.size} legal values: ` +
      [...histogram.entries()].sort((a, b) => b[1] - a[1]).map(([n, c]) => `${n} x${c}`).join(', '));
  });
});
