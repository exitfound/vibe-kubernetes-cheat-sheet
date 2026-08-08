// skeleton.test.mjs: the shape of a MIGRATED card, asserted against the exported SPECIFICATION and
// against the live lib/ bindings that turn it into a card. Successor to check-canon's R-skeleton and
// R-viewbox, and to the source half of R-opacity. Nothing here reads a card's source text.
//
// ===========================================================================================
// WHICH RELAXED RULES THIS FILE RETURNS, AND IN WHAT FORM
// ===========================================================================================
// Stage 1.3b honestly dropped seven source-shape rules to `review` because their subject was about
// to stop existing. Four of them have a real successor as a statement about DATA, two are the same
// rule read one layer up, and one has no successor at all. Written out so the next reader does not
// have to reconstruct which is which:
//
//   S-01  `class Scene { constructor(host){...} build(){...} reset(){ this.build(); } }` once per card.
//         RETURNED, one layer up. No migrated card writes a Scene: makeScene(SCENE) is the only
//         producer, so "once per card" becomes "one class, and every card's SCENE is accepted by it".
//         Asserted per card (the prototype inventory is closed to build/constructor/reset) and once
//         behaviourally (constructor paints, reset() repaints from scratch).
//   S-10  every enter() opens with `resetStep(s);` and nothing before it.
//         RETURNED as an ordering fact about the enter() makeSteps GENERATES, traced on both paths.
//         No card writes an enter() any more, so the rule now has exactly one subject.
//   S-11  resetStep declared once per card, packetLayer.replaceChildren() first, clearHighlights and
//         extras in the middle, clearWires last.
//         RETURNED as a traced call order out of makeResetStep. ONE DEVIATION IS RECORDED, not
//         asserted: the generated prologue runs `reset.extra` AFTER clearWires, where the 21
//         handwritten copies ran their extras before it. It is invisible today because the single
//         extra in the catalog (cluster-api-structure resetWatchArrow) touches strokeDasharray on an
//         arrow and no wire, which is why the oracle stayed clean. See report/skeleton-census.
//   S-12  no card declares clearHL(s).
//         NO SUCCESSOR, and inventing one would be dishonest. Its subject was a card-local prologue
//         helper; a migrated card writes no prologue at all, and `clearHL` is not on any kit, so a
//         card could not import one even if it wanted to (unit/module.test.mjs already fails a card
//         that imports a name its kit does not export). The only remaining form of the rule is a
//         source count, and it is 0 catalog-wide: that count lives in report/skeleton-census.
//   S-04  the root svg carries viewBox '0 0 1200 640', no exceptions.
//         RETURNED as a VALUE, not a text match: diagramRoot is called here and the attributes it
//         actually applies are read off a recording stub. See "WHY A STUB" below.
//   S-05  R-viewbox required a match per card and was a finding when it found neither.
//         RETURNED as the card-side half that survives the hoist: a card feeds the camera one thing,
//         its aria-label, and declares no camera key of its own anywhere in its parts.
//   D-14  the poster-first model.
//         HALF RETURNED, and the other half has no successor here. `posterFirst: true` is an ARGUMENT
//         to defineCard, so it is inside makeInit's closure and statically unreachable from the
//         namespace, exactly as it was unreachable when it was an argument to makeInit. The refactor
//         did not make it readable. What IS readable is "idle is a static poster": step 0 declares no
//         flow and no motion. That half is asserted; the auto-play dwell and the wrap from the last
//         step back to the poster are runtime facts and stay with the render level.
//
// R-opacity, the source half of C-04, is here too: every shade a migrated card DECLARES is read out
// of SCENE.parts and STEPS_SPEC and matched against the OPACITY vocabulary imported from the live
// js/lib/tokens.js. The numbers are never copied into this file. The runtime half of C-04 is
// render/opacity.test.mjs and covers all 108; this covers what the 21 wrote down.
//
// ===========================================================================================
// WHY A DOM STUB FOR ONE CALL, AND WHY NOT A BUILT SCENE
// ===========================================================================================
// The task offered two readings of the viewBox: through diagramRoot, or off a built scene. A built
// scene is out: buildScene walks every part through primitives.js, which needs classList,
// querySelectorAll, getBBox and a real tree, and faking that is a browser badly. diagramRoot needs
// exactly one DOM call, createElementNS plus setAttribute, so it is stubbed for the length of one
// call and the stub records what was applied. That reads a VALUE. A regex over diagramRoot's source
// would go quiet the day the attributes are composed instead of written as literals; the stub goes
// red, because an svg with no viewBox attribute is what it would then observe.
//
// ===========================================================================================
// WHAT THIS FILE IS BLIND TO
// ===========================================================================================
//   - The 87 LEGACY cards. They export `init` alone, so none of this is readable for them and the
//     count of what was walked is printed on every test rather than assumed.
//   - Anything an escape hatch builds. `P.raw` takes a `make(refs)` function and `tune(el, refs)`
//     mutates a finished element, so a ref either of them creates is invisible to a static reader.
//     Today that is 11 raw parts and 11 tunes on 7 cards, and one consequence is measured in
//     report/skeleton-census: reset.pods on cluster-pod-sandbox-cri names `appGroup`, which a tune
//     creates.
//   - Flow ORDER, after/at resolution and chip turnover. That is unit/spec-steps.test.mjs. This file
//     only asserts where the generated enter() puts the prologue, the escape and the guard.
//   - Lane geometry and role coverage out of SCENE.parts. That is unit/spec-scene.test.mjs.
//   - The rendered picture. A card can satisfy every line here and draw a lane into empty space.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { CARD_FORMS, cardForm, importAll, importLib } from '../fixtures/module.mjs';

// ---------------------------------------------------------------------------------------------
// Gathered once. importAll() carries the census guard, so a run that resolved fewer than the whole
// catalog throws before any assertion has had a chance to pass over a short list.
// ---------------------------------------------------------------------------------------------
const catalogued = await cards();
const CARD_COUNT = catalogued.length;
const modules = await importAll();

const schemeKit = await importLib('scheme-kit.js');
const sceneSpec = await importLib('scene-spec.js');
const stepSpec = await importLib('step-spec.js');
const { OPACITY } = await importLib('tokens.js');

// The migrated subset, decided by fixtures/module.mjs and by nothing local: cardForm is EXACT set
// equality on the export surface, so a legacy card that grew one stray export is not quietly counted
// in. `legacy` is kept because the two must sum to the catalog, which is the only guard that catches
// a filter silently dropping a card.
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

// Every part of a SCENE, groups flattened, with the path that names it in a finding. `null` entries
// are LEGAL and skipped by appendParts: cluster-node-allocatable writes `caption ? P.tag(...) : null`
// inside a group helper, which is 1 of the 495 entries today. They are counted, never a finding.
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

// ---------------------------------------------------------------------------------------------
// The population, and the two guards on it, which are not the same guard.
//
//   HERE, and this is the census: migrated + legacy has to equal the catalog. Both sides come from
//   different places (cardForm over every imported namespace, against data.js's own length), so a
//   filter that silently dropped a card, or a card that fell out of both legal export forms, parts
//   them. Proved by mutation: one stray export on a legacy card takes this red.
//   IN EACH TEST BELOW, `walked === N` is a tripwire and NOT a census: both sides come from the same
//   loop. It exists so that a `continue` added above the counter one day cannot quietly shrink the
//   walk while the numbers in the diagnostics keep reading full.
// ---------------------------------------------------------------------------------------------
test(`the migrated population is ${N} card(s), and the split accounts for the whole catalog`, (t) => {
  assert.ok(N > 0, 'no card is in the migrated form, so every assertion in this file walked an empty list');
  assert.equal(N + legacyCount, CARD_COUNT,
    `${N} migrated + ${legacyCount} legacy = ${N + legacyCount}, but data.js lists ${CARD_COUNT} card(s). ` +
    'A card in neither form is a card this file skipped without saying so.');
  t.diagnostic(`skeleton walk: ${N} migrated (surface [${CARD_FORMS.migrated}]), ` +
    `${legacyCount} legacy (surface [${CARD_FORMS.legacy}]), ${CARD_COUNT} in the catalog`);
});

// ---------------------------------------------------------------------------------------------
// The module surface as DATA. unit/module.test.mjs establishes that the three names are exported and
// that SCENE and STEPS_SPEC are a non-empty object and a non-empty array. This is the next question:
// is what they hold actually the shape the declarative layer consumes.
// ---------------------------------------------------------------------------------------------
describe('the migrated module, as data', () => {
  // The SCENE surface is CLOSED to three keys. That is the successor of "a card declares one Scene
  // and nothing else": a card can no longer smuggle a builder, a second camera or a stray option
  // into the scene, because a fourth key would be read by nobody and would say so here.
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
      // reset is what makeResetStep destructures. Missing entirely is legal to the code (it defaults
      // to `{}`) and would mean a card that never clears a highlight, so it is a finding here.
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

  // "init is defineCard's product", proved by running the card's own data through the two producers
  // defineCard chains. Both are pure in bare Node: makeScene returns a class without building, and
  // makeSteps maps the specs without entering one. A SCENE or a STEPS_SPEC that the layer cannot
  // consume throws HERE instead of at the first dialog open.
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
      // S-01, per card: the prototype inventory is CLOSED. The rule named three members and the
      // handwritten class had exactly those three; a generated class that grew a fourth would be a
      // different skeleton wearing the same name.
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
        // The spec rides ON the step on purpose: a frozen probe reads intent off
        // _timeline.steps[i].spec with nothing animating. An identity check, not a deep compare,
        // because a copy would drift from what the card exported.
        if (step.spec !== spec) findings.push(`${id}  step "${step.id}" does not carry its own spec object`);
      });
      // D-14, the half that is readable as data: idle is a STATIC poster. A step 0 that declares
      // motion would start the card moving before the deliberate beat the model is built around.
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

// ---------------------------------------------------------------------------------------------
// S-04 / S-05. One camera for 108 cards. See "WHY A DOM STUB" in the header.
// ---------------------------------------------------------------------------------------------
const CANON_VIEWBOX = '0 0 1200 640';
const CANON_PAR = 'xMidYMid meet';

// The smallest thing svg.js el() can write into: createElementNS plus setAttribute. Nothing else is
// reached for a root with no children, which is exactly what diagramRoot builds.
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
    // The aria-label is the ONLY thing a card feeds this function, so it has to arrive.
    assert.equal(root.attrs['aria-label'], 'probe label', 'diagramRoot dropped the aria-label it was handed');
    t.diagnostic(`one camera for ${CARD_COUNT} cards: viewBox ${CANON_VIEWBOX}, preserveAspectRatio ${CANON_PAR}, ` +
      `${Object.keys(root.attrs).length} attributes on the root`);
  });

  // The card side of R-viewbox after the hoist. A card cannot reach the camera through buildScene,
  // which passes it SCENE['aria-label'] and nothing else, so the only way one could try is by
  // declaring a camera key on itself or on a part. Both are checked, and the aria-label it does owe
  // is checked with it: a blank one would leave the diagram unnamed to a screen reader.
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

// ---------------------------------------------------------------------------------------------
// S-01, S-10, S-11. The skeleton the 21 cards used to copy, now generated once. These three probes
// are the only assertions in the suite that watch the generated enter() run, so they use fakes that
// record rather than a DOM: what is being measured is call ORDER, not what the calls draw.
// ---------------------------------------------------------------------------------------------
describe('S-01, S-10, S-11: the skeleton, generated once instead of copied 21 times', () => {
  // S-01, behavioural. A probe SCENE with no parts, so buildScene reaches only diagramRoot and the
  // host. Building a real card's parts would need primitives.js and a browser.
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

  // S-11: the prologue's call ORDER, which is the whole content of the rule. The three refs are
  // fakes that push a marker, so the assertion is the sequence and nothing else.
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
    // The order S-11 pins, with the one recorded deviation: `reset.extra` lands AFTER clearWires
    // where the handwritten copies ran extras before it. Asserted as it IS, so a future reorder is
    // a red run either way, and written up in report/skeleton-census rather than silently accepted.
    assert.deepEqual(trace,
      ['packetLayer.replaceChildren', 'clearHighlights', 'clearPodHighlight', 'clearWires:""', 'reset.extra'],
      `the prologue ran ${JSON.stringify(trace)}. packetLayer.replaceChildren() must come first or a ` +
      'ball from the previous step is still on screen while the new step paints.');
    t.diagnostic(`prologue order: ${trace.join(' -> ')}`);
  });

  // S-10: what the generated enter() does, in order, on both paths. This is the successor of "every
  // enter() opens with resetStep(s) and nothing before it": there is now one enter() and it is here.
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
        // delay 0, so at() runs the callback inline and this probe needs no refs.svg.animate.
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

    // The reduced path stops at the guard: everything above it is written on both paths, which is
    // what makes "every enter() writes every chip" a property of the data rather than a habit.
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

// ---------------------------------------------------------------------------------------------
// C-04, the half R-opacity used to cover by scanning source expressions. Every shade a migrated card
// DECLARES, read off the spec. The vocabulary is imported from the live tokens.js: copying the five
// numbers into this file would let the two drift and leave the test green.
// ---------------------------------------------------------------------------------------------
describe('C-04: every declared shade comes from the OPACITY vocabulary', () => {
  const ALLOWED = new Map([
    // A bare 0 or 1 is explicitly fine: C-04 governs what lies BETWEEN them.
    [0, 'bare 0'],
    [1, 'bare 1'],
    ...Object.entries(OPACITY).map(([name, v]) => [v, `OPACITY.${name}`]),
  ]);

  // Everywhere a number reaches an element's opacity through the layer. Deliberately NOT included:
  // F.pulse `peak`, which is PULSE_POD.dimPeak (0.8), a pulse MAGNITUDE that tokens.js keeps out of
  // OPACITY on purpose. No card writes either pulse option today, so the exclusion costs 0 readings.
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
          // fade's `from` defaults to 1 and `to` has no default: both are written straight into a
          // keyframe, so both are shades.
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

  // The rule is about the VALUE, not its JS type. 122 of the 764 shades arrive as STRINGS because
  // the kit's own laneOf() is `String(Math.min(...))`: a lane takes the dimmer of its two ends, and
  // it hands back text. writeStatics does String(v) on every one anyway, so '1' and 1 paint the same
  // pixel. A string is therefore coerced and counted, never a finding; anything that is not a finite
  // number after coercion is.
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
    // A reader that stopped matching would find nothing and read as a clean catalog. 764 shades were
    // declared when this was written; the floor is deliberately loose, it only has to catch silence.
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
