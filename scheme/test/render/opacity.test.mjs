// opacity.test.mjs: the fade-phase vocabulary, measured in the browser. Successor of
// tools/check-opacity.mjs: same three rules, same sampling, same tolerances (3 decimals for a
// shade, 1ms for a beat, 0.001 for the terminated match). One rule is deliberately WIDER than the
// original, LIT, and the paragraph on which opacity each rule reads says why and where it stops.
//
//   PHASE (C-04..C-10)  every opacity a card pins or animates is 0, 1, or an OPACITY.* shade.
//   ORDER (M-08)        a Pod that fades out in a step pulses FIRST: pulse delay <= fade delay.
//   LIT   (C-11)        nothing holds .highlight while it sits at the terminated shade.
//
// Why the browser and not the source. A source lint reads the literal an author typed; 53 cards
// route their shades through a setStage-style helper, so the value that reaches the element is a
// resolved parameter or a ternary branch, and the value a keyframe animates TO is not a literal at
// all. Reading the rendered tree resolves both. The cost is that this test needs a server and a
// browser, and that it only sees the shades the walk actually visits, which is why the census
// below is an assertion and not a log line.
//
// The vocabulary is IMPORTED from js/lib/tokens.js, never restated. Retuning OPACITY.terminating
// from 0.25 must move this test with it, or the test is asserting a number that no longer exists.
//
// Out of scope by construction, both inherited from the original and both deliberate:
//   - the packet layer (#packetLayer). A ball fades in and out, a ripple opens at 0.95 and expands
//     to 0, a riding tag fades with its ball. That is MOTION, not a lifecycle phase (C-10).
//   - CSS presentation shades (.scheme-pod-container, .scheme-grid-cell). They are presentation,
//     the vocabulary is state (C-10). See the PHASE note below for how the scope is drawn.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census, floor, SUBSET, FULL_ONLY } from '../fixtures/catalog.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import {
  DEFAULT_BASE,
  launch, initPage, discoverIds, openCard, stepCount, enterStep, stepSpan, seekStep,
  installOpacityHelpers,
} from '../fixtures/render.mjs';
import { OPACITY } from '../../js/lib/tokens.js';

// ---------------------------------------------------------------------------------------------
// Control numbers, taken off a green run of the whole catalog. They are FLOORS, not equalities:
// a run that sees fewer cards or fewer steps than this has scanned a subset and must be red (a
// check that scans nothing reports nothing), while a card or a step added later is a legitimate
// widening and must not turn this file red on its own. The card count is additionally pinned to
// data.js exactly, through census().
// ---------------------------------------------------------------------------------------------
// The walk baseline, DERIVED rather than typed: the catalog it walks and the specs it reads are
// what say how big a whole walk is (CATALOG_BASELINE in ../fixtures/catalog.mjs).
const EXPECTED_CARDS = floor((await cards()).length);
const EXPECTED_STEPS = floor(await stepTotal());
const EXPECTED_SHADES = 5;      // running, pending, notready, terminating, terminated

// Floats compared at 3 decimals, so 0.4 and 0.40 agree and 0.123 does not become 0.12. The two
// values that are not phases: 0 is "not drawn" and 1 is both OPACITY.running and "drawn".
const key = v => Number(v).toFixed(3);
const NAME = new Map(Object.entries(OPACITY).map(([k, v]) => [key(v), `OPACITY.${k}`]));
const ALLOWED = new Set([key(0), ...NAME.keys()]);

// ---------------------------------------------------------------------------------------------
// WHICH OPACITY EACH RULE READS. The fixture offers two, under two names, and a check that reads
// the wrong one disagrees with its neighbour silently: one multiplies down the ancestor chain and
// one ignores ancestors entirely. They answer two different questions:
//
//   ownOpacity(el)             the element's OWN declared value, ancestors ignored. The SOURCE
//                              value: "is the value declared HERE one from the vocabulary?"
//   effectiveOpacity(el, root) the PRODUCT down the ancestor chain: what SVG composites and what
//                              a reader sees. "is this thing visible on screen?"
//
// PHASE -> OWN. The rule is about the DECLARATION. A chip at 0.4 inside a group at 0.4 declares a
//   phase and composites to 0.16, which is not a phase and was never meant to be one: judging that
//   composite would report a finding against a card that is exactly right, and the fix would be to
//   invent a shade. Ancestors must be ignored.
//   The OWN value is read at the declaration site (el.style.opacity for a pin, the keyframe value
//   for a track) rather than through the fixture's getComputedStyle-based ownOpacity(), for two
//   reasons that both change the answer:
//     1. getComputedStyle folds in the CSS presentation shades that C-10 keeps OUT of the
//        vocabulary, so .scheme-pod-container's stylesheet value would start being judged as a
//        phase. The inline-pin scope is what keeps presentation out by construction.
//     2. at the sample point the animations are paused past their end, so a fill:'both' track
//        makes getComputedStyle return the ANIMATED value, hiding the pin underneath it and
//        double-counting a keyframe that is already enumerated on its own.
//   ownOpacity() also rounds to 2 decimals, where this rule compares at 3 (a pin of 0.123 would
//   round into the vocabulary and pass). Same axis, sharper reading: this is the local
//   implementation the fixture does not provide, and it is noted as such.
//
// ORDER -> NEITHER. It compares two delays. The only opacity it touches is the DIRECTION of a
//   track's own keyframes (last < first is a fade-out), which is an own-axis question by
//   construction: an ancestor fading is a different animation with its own target and its own
//   delay, and it is judged on its own.
//
// LIT -> EFFECTIVE. The rule says a block that is GONE cannot also be the thing the step is
//   pointing at, and "gone" is a composite: a highlight inside a group the step dimmed is just as
//   invisible as one pinned dim itself, and only the PRODUCT catches the nested case. This is a
//   deliberate divergence from the original, which took the MINIMUM of the pins on the chain: min
//   answers neither question (it is not what composites, and it is not what any one element
//   declares) and it was half of the silent disagreement the fixture exists to end.
//   The chain is composed from the step's DECLARED pins rather than through the fixture's
//   getComputedStyle-based effectiveOpacity(), for a reason measured on storage-reclaim-policy: a
//   card that fades a block out with an animation drops the highlight in that animation's
//   `onfinish`, and this harness FREEZES the step (enterStep pauses every animation, seekStep
//   moves paused time), so `onfinish` never runs while a fill:'forwards' track still holds the
//   element at 0.12. Reading the composited style there reports a card for something it does
//   correctly the moment it is actually played. The composited number is still measured and
//   carried in the finding text, so a reader sees both answers side by side.
// ---------------------------------------------------------------------------------------------

const probe = ({ terminated }) => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;

  // How a finding names an element: its own text, else the text of the nearest block around it.
  const label = (el) => {
    const t = el.querySelector && el.querySelector('text');
    const own = (t && t.textContent || '').trim();
    if (own) return own.slice(0, 28);
    const near = el.closest && el.closest('.scheme-box, .scheme-pod, .scheme-cylinder, .scheme-node');
    const nt = near && near.querySelector('text');
    return ((nt && nt.textContent) || el.tagName).trim().slice(0, 28) || el.tagName;
  };
  const isPod = (el) => !!(el.classList && el.classList.contains('scheme-pod')) ||
    !!(el.querySelector && el.querySelector('.scheme-pod'));
  const moving = (el) => !!(el.closest && el.closest('#packetLayer'));

  // PHASE, source (a): every inline pin currently on the tree. The OWN declared value.
  const found = [];
  for (const el of svg.querySelectorAll('[style*="opacity"]')) {
    const v = el.style.opacity;
    if (v === '' || moving(el)) continue;
    found.push({ kind: 'pin', v: parseFloat(v), label: label(el) });
  }

  // PHASE, source (b): every opacity keyframe of every animation on this diagram, plus the timing
  // ORDER needs. One pass, because both rules are answers about the same animation list.
  const fades = [], pulses = [], rises = [];
  for (const a of document.getAnimations()) {
    const tgt = a.effect && a.effect.target;
    if (!tgt || !svg.contains(tgt)) continue;
    const t = a.effect.getComputedTiming();
    let frames = [];
    try { frames = a.effect.getKeyframes(); } catch (_) { continue; }
    const ops = frames.map(f => f.opacity).filter(o => o !== undefined && o !== null).map(Number);
    // A pulse is the track carrying `filter`: brightness up and back. Collected even when it
    // carries no opacity of its own, because a dim Pod's blink lifts opacity and an ordinary one
    // does not, and ORDER has to see both.
    if (frames.some(f => f.filter)) pulses.push({ el: tgt, delay: t.delay || 0, label: label(tgt) });
    if (!ops.length || moving(tgt)) continue;
    // A track that returns to where it started is a BLINK (pulsePodDim), so only its resting value
    // is a phase: the peak is a pulse magnitude and lives in PULSE_POD, not in OPACITY (C-10).
    const blink = ops.length > 2 && ops[0] === ops[ops.length - 1];
    for (const o of (blink ? [ops[0]] : ops)) found.push({ kind: blink ? 'rest' : 'frame', v: o, label: label(tgt) });
    if (ops[ops.length - 1] < ops[0]) {
      fades.push({ el: tgt, delay: t.delay || 0, label: label(tgt), pod: isPod(tgt) });
    } else if (ops[ops.length - 1] > ops[0]) {
      rises.push({ el: tgt, delay: t.delay || 0 });
    }
  }

  // ORDER: for every Pod that fades out, the earliest pulse ON THAT ELEMENT (or inside it).
  // A pulse belongs to this fade only if the Pod has not come back up in between: a delete-then-
  // recreate (workloads-replicaset, storage-volumeclaimtemplates) fades to 0 and pulses on the way
  // back, and that pulse answers the RETURN, not the fade.
  const order = [];
  for (const f of fades) {
    if (!f.pod) continue;
    const mine = pulses
      .filter(p => p.el === f.el || f.el.contains(p.el))
      .filter(p => !rises.some(r => (r.el === f.el || f.el.contains(r.el)) && r.delay >= f.delay && r.delay <= p.delay));
    if (!mine.length) continue;                    // no pulse of this fade: nothing to order
    const first = Math.min(...mine.map(p => p.delay));
    // 1ms of slack: a pulse and a fade issued in the same call are the same beat.
    if (first > f.delay + 1) order.push({ label: f.label, pulse: Math.round(first), fade: Math.round(f.delay) });
  }

  // LIT: anything holding .highlight while it sits at the terminated shade, meaning anywhere in
  // (0, terminated]. Two edges, and both were measured rather than guessed:
  //   upper  at-or-below rather than equal-to, because under the PRODUCT reading a highlight
  //          pinned terminated inside a dimmed group lands below 0.12 and is no less gone for it.
  //          The original's equality could not see that case at all. Tolerance 0.001, as before.
  //   lower  a declared 0 is excluded. 0 is not a phase, it is "not drawn" (C-04), and pinning 0
  //          then revealing with a fade-in while the arrival lights the block is the standard
  //          reveal idiom: cluster-resource-quota, cluster-node-allocatable, network-service-cidr,
  //          storage-container-filesystem and storage-configmap-secret-mount all do it, and all
  //          five composite to full strength at the moment the highlight is on them.
  const lit = [];
  for (const el of svg.querySelectorAll('.highlight')) {
    // The product of the DECLARED pins on the chain, element included, root excluded: the same
    // walk effectiveOpacity() makes, over el.style.opacity instead of getComputedStyle. An
    // element with no pin of its own contributes 1, exactly as the original treated it.
    let declared = 1;
    for (let n = el; n && n !== svg; n = n.parentElement) {
      const v = n.style && n.style.opacity;
      if (v !== '' && v !== undefined && v !== null) {
        const f = parseFloat(v);
        if (Number.isFinite(f)) declared *= f;
      }
    }
    declared = Math.round(declared * 1000) / 1000;
    if (declared <= 0.001 || declared > terminated + 0.001) continue;
    lit.push({ label: label(el), declared, composited: window.__opacity.effective(el, svg) });
  }

  return { found, order, lit };
};

const catalogued = await cards();

const browser = await launch();
// Registered on the line after the launch, before the page setup below: node:test runs an
// `after` hook whatever happens to the tests, but a throw in the setup itself (a context, an
// init script, a grid that never renders) happens BEFORE the hook exists, and that browser is
// then nobody's to close for the rest of the run.
after(() => browser.close());

const context = await browser.newContext();
const page = await context.newPage();
await page.addInitScript(initPage, 'expose');
// Before the first navigation: an init script only runs on a document still to be created.
await installOpacityHelpers(page);
const ids = await discoverIds(page, DEFAULT_BASE);

test(`the grid renders the whole catalog (${catalogued.length} cards)`, () => {
  assert.ok(ids.length > 0, `NO CARDS RENDERED at ${DEFAULT_BASE}/scheme/ : posters or grid broken`);
  census('opacity grid', ids.length, catalogued.length);
});

test(`the vocabulary is ${EXPECTED_SHADES} named shades, imported from tokens.js`, () => {
  // Names, not numbers: the numbers are the token file's business, and restating them here would
  // be the copy this test exists to avoid. What is asserted is that the vocabulary did not silently
  // lose a phase or grow a sixth one, and that no two phases collapsed onto the same value.
  assert.deepEqual(Object.keys(OPACITY),
    ['running', 'pending', 'notready', 'terminating', 'terminated']);
  assert.equal(NAME.size, EXPECTED_SHADES,
    `two phases share a value: ${Object.entries(OPACITY).map(([k, v]) => `${k}=${v}`).join(' ')}`);
  assert.equal(OPACITY.running, 1, 'OPACITY.running is the "drawn" value and PHASE allows a bare 1');
});

let walked = 0, sampled = 0;

for (const id of ids) {
  test(id, async () => {
    walked++;                    // counted before the assertions, so this stays a census of
                                 // COVERAGE and a broken card is reported once, as itself.
    await openCard(page, id);
    const total = await stepCount(page);
    assert.ok(total > 0, `stepCount is ${total}: no steps to walk`);

    const findings = [];
    for (let i = 0; i < total; i++) {
      // The played path, frozen at the END of the step: that is the state the step settles on, and
      // the keyframes are still readable while the animations are attached. Stepping statically
      // instead would run every enter() with ctx.reduced and never reach a single fade or pulse.
      const live = await enterStep(page, i);
      if (live) { const span = await stepSpan(page); await seekStep(page, span + 1); }
      const r = await page.evaluate(probe, { terminated: OPACITY.terminated });
      if (!r) continue;
      sampled++;

      for (const f of r.found) {
        if (Number.isNaN(f.v)) continue;
        if (f.v === 1 || ALLOWED.has(key(f.v))) continue;
        findings.push(`PHASE  step ${i} "${f.label}" ${f.kind} opacity ${f.v} is not in the vocabulary`);
      }
      for (const o of r.order) {
        findings.push(`ORDER  step ${i} Pod "${o.label}" fades at ${o.fade}ms but pulses at ${o.pulse}ms (pulse first, then fade)`);
      }
      for (const l of r.lit) {
        findings.push(`LIT    step ${i} "${l.label}" holds .highlight at the terminated shade: declared ${l.declared}, composited ${l.composited} (terminated is ${OPACITY.terminated})`);
      }
    }

    const uniq = [...new Set(findings)];
    assert.equal(uniq.length, 0,
      `${uniq.length} finding(s) over ${total} steps:\n  ${uniq.join('\n  ')}`);
  });
}

test('every catalogued card was walked, every step was sampled', (t) => {
  t.diagnostic(`opacity: ${walked} cards, ${sampled} steps, vocabulary [${[...NAME.values()].join(' ')}]`);
  census('opacity walked', walked, catalogued.length);
  assert.ok(walked >= EXPECTED_CARDS,
    `walked ${walked} card(s), the catalog had ${EXPECTED_CARDS} when this floor was measured. ` +
    'A shrunken walk is a subset, and a subset that passes is worse than a red run.');
  assert.ok(sampled >= EXPECTED_STEPS,
    `sampled ${sampled} step(s), expected at least ${EXPECTED_STEPS}. ` +
    'Steps go missing when a card fails to build or the debug handle is absent, and every missing ' +
    'step is a shade nobody looked at.');
});
