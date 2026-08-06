#!/usr/bin/env node
// check-opacity.mjs: the fade-phase rule (R4), measured in the browser rather than read off the
// source. Two things the source lint cannot do: it resolves every helper parameter and ternary
// (53 cards route their shades through a setStage-style helper), and it sees the value a keyframe
// actually animates to.
//   PHASE     every opacity a card pins or animates must be 0, 1, or an OPACITY.* shade. It reads
//             el.style.opacity and the keyframes of every registered animation, never the computed
//             style, so a CSS presentation shade (.scheme-pod-container, .scheme-grid-cell) is out
//             of scope by construction: those are presentation, the vocabulary is state.
//   ORDER     a Pod that fades out in a step must pulse first: pulse delay <= fade delay. Fading a
//             Pod out while it is still blinking reads as two events at once.
//   LIT       nothing may hold .highlight while it sits at the terminated shade. A block that is
//             gone cannot also be the thing the step is pointing at.
// node check-opacity.mjs [--rules=phase,order,lit] [<id> ...]   ids => verbose; none => catalog
import { launch, setInspect, stepCount, enterStep, stepSpan, seekStep, discoverIds, DEFAULT_BASE } from './_shared.mjs';
import { OPACITY } from '../js/lib/tokens.js';

const ALL_RULES = ['PHASE', 'ORDER', 'LIT'];
const args = process.argv.slice(2);
const ruleArg = args.find(a => a.startsWith('--rules='));
const rules = new Set(ruleArg
  ? ruleArg.slice('--rules='.length).split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
  : ALL_RULES);
const unknown = [...rules].filter(r => !ALL_RULES.includes(r));
if (unknown.length) { console.error(`unknown rule(s): ${unknown.join(', ')} (have: ${ALL_RULES.join(', ')})`); process.exit(2); }
const on = r => rules.has(r);

const argIds = args.filter(a => !a.startsWith('--'));
const terse = argIds.length === 0;

// The vocabulary, plus the two values that are not phases: 0 is "not drawn" and 1 is both
// OPACITY.running and "drawn". Floats are compared at 3 decimals so 0.4 and 0.40 agree.
const key = v => Number(v).toFixed(3);
const NAME = new Map(Object.entries(OPACITY).map(([k, v]) => [key(v), `OPACITY.${k}`]));
const ALLOWED = new Set([key(0), ...NAME.keys()]);

const probe = (opts) => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;
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

  // The packet layer is MOTION, not state: a ball fades in and out, a ripple opens at 0.95 and
  // expands to 0, a riding tag fades with its ball. None of that is a lifecycle phase.
  const moving = (el) => !!(el.closest && el.closest('#packetLayer'));

  const found = [];
  // 1. every inline pin currently on the tree
  for (const el of svg.querySelectorAll('[style*="opacity"]')) {
    const v = el.style.opacity;
    if (v === '' || moving(el)) continue;
    found.push({ kind: 'pin', v: parseFloat(v), label: label(el) });
  }
  // 2. every opacity keyframe of every animation on this diagram, plus its timing
  const fades = [], pulses = [], rises = [];
  for (const a of document.getAnimations()) {
    const tgt = a.effect && a.effect.target;
    if (!tgt || !svg.contains(tgt)) continue;
    const t = a.effect.getComputedTiming();
    let frames = [];
    try { frames = a.effect.getKeyframes(); } catch (_) { continue; }
    const ops = frames.map(f => f.opacity).filter(o => o !== undefined && o !== null).map(Number);
    if (frames.some(f => f.filter)) pulses.push({ el: tgt, delay: t.delay || 0, label: label(tgt) });
    if (!ops.length || moving(tgt)) continue;
    // A track that comes back to where it started is a BLINK (pulsePodDim), so only its resting
    // value is a phase: the peak is a pulse magnitude and lives in PULSE_POD, not in OPACITY.
    const blink = ops.length > 2 && ops[0] === ops[ops.length - 1];
    for (const o of (blink ? [ops[0]] : ops)) found.push({ kind: blink ? 'rest' : 'frame', v: o, label: label(tgt) });
    // a fade-out is any opacity track whose last value is below its first
    if (ops[ops.length - 1] < ops[0]) {
      fades.push({ el: tgt, delay: t.delay || 0, label: label(tgt), pod: isPod(tgt), to: ops[ops.length - 1] });
    } else if (ops[ops.length - 1] > ops[0]) {
      rises.push({ el: tgt, delay: t.delay || 0 });
    }
  }
  // ORDER: for every Pod that fades out, the earliest pulse ON THAT ELEMENT (or inside it).
  // A pulse only belongs to this fade if the Pod has not come back up in between: a delete-then-
  // recreate (workloads-replicaset, storage-volumeclaimtemplates) fades out at 0 and pulses on the
  // way back, and that pulse answers the return, not the fade.
  const order = [];
  for (const f of fades) {
    if (!f.pod) continue;
    const mine = pulses
      .filter(p => p.el === f.el || f.el.contains(p.el))
      .filter(p => !rises.some(r => (r.el === f.el || f.el.contains(r.el)) && r.delay >= f.delay && r.delay <= p.delay));
    if (!mine.length) continue;                       // no pulse of this fade: nothing to order
    const first = Math.min(...mine.map(p => p.delay));
    if (first > f.delay + 1) order.push({ label: f.label, pulse: Math.round(first), fade: Math.round(f.delay) });
  }
  // LIT: anything holding .highlight while pinned at the terminated shade
  const lit = [];
  if (opts.terminated !== undefined) {
    for (const el of svg.querySelectorAll('.highlight')) {
      let n = el, op = 1;
      while (n && n !== svg) {
        const s = n.style && n.style.opacity;
        if (s !== '' && s !== undefined && s !== null) { op = Math.min(op, parseFloat(s)); }
        n = n.parentElement;
      }
      if (Math.abs(op - opts.terminated) < 0.001) lit.push(label(el));
    }
  }
  return { found, order, lit };
};

const base = DEFAULT_BASE;
const browser = await launch();
const page = await browser.newPage();
await page.addInitScript(setInspect, 'expose');
const ids = argIds.length ? argIds : await discoverIds(page, base);

const issues = [];
let cards = 0, samples = 0;
for (const id of ids) {
  await page.goto(`${base}/scheme/#scheme=${id}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('dialog.scheme-dialog svg.diagram', { timeout: 15000 });
  const total = await stepCount(page);
  const mine = [];
  for (let i = 0; i < total; i++) {
    // The played path, frozen at the end of the step: that is the state the step settles on, and
    // the keyframes are readable while the animations are still attached.
    const live = await enterStep(page, i);
    if (live) { const span = await stepSpan(page); await seekStep(page, span + 1); }
    const r = await page.evaluate(probe, { terminated: OPACITY.terminated });
    if (!r) continue;
    samples++;
    for (const f of r.found) {
      if (Number.isNaN(f.v)) continue;
      if (f.v === 1 || ALLOWED.has(key(f.v))) continue;
      if (on('PHASE')) mine.push(`  PHASE  step ${i} "${f.label}" ${f.kind} opacity ${f.v} is not in the vocabulary`);
    }
    for (const o of r.order) {
      if (on('ORDER')) mine.push(`  ORDER  step ${i} Pod "${o.label}" fades at ${o.fade}ms but pulses at ${o.pulse}ms (pulse first, then fade)`);
    }
    for (const l of r.lit) {
      if (on('LIT')) mine.push(`  LIT    step ${i} "${l}" holds .highlight at the terminated shade`);
    }
  }
  cards++;
  const uniq = [...new Set(mine)];
  if (uniq.length) {
    issues.push(...uniq.map(m => `${id}${m}`));
    if (!terse) { console.log(`${id}  ${uniq.length} issue(s)`); for (const m of uniq) console.log(m); }
  } else if (!terse) {
    console.log(`${id}  clean`);
  }
}
await browser.close();

if (issues.length) {
  console.error(`opacity check FAILED: ${issues.length} finding(s) over ${cards} card(s), ${samples} step(s):`);
  for (const i of issues) console.error('  ' + i.replace(/\n/g, ' '));
  process.exit(1);
}
console.log(`opacity check OK: ${cards} cards, ${samples} steps, every shade in the vocabulary [${[...NAME.values()].join(' ')}]`);
