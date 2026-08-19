#!/usr/bin/env node
// settled-dump.mjs: what the viewer is LOOKING AT once a step has finished playing. Each step is
// played in REAL TIME with nothing frozen, then the settled frame is read as text, the sorted
// highlight set and the sorted opacity set.
//   node tools/settled-dump.mjs <id> [step] [--base=URL]
//   node tools/settled-dump.mjs --all --out=DIR [--base=URL]
//
// WHY IT EXISTS. A probe that FREEZES a card cannot see a DEFERRED callback at all. `at()` and
// `lightBoxAt()` schedule their work as the onfinish of an empty 1ms animation, and a paused
// animation never fires onfinish, so a frozen probe records a timer's TARGET and DELAY and never
// records WHAT the callback wrote. Measured consequence: writing `rows: [i]` where the card means
// `rows: upTo(i)` leaves a frozen dump byte-identical and still changes the picture, the ladder
// rows walking one at a time instead of accumulating. That is what this plays out instead.
//
// WHAT IT SEES. The settled frame only: label and chip text, which elements ended up carrying
// .highlight, and which ended up at what opacity.
//
// WHAT IT IS BLIND TO. Everything in flight, and everything before the first step. A ball's path,
// a tag's delay, an easing curve, an arrowhead marker, an SVG attribute that is not opacity, and
// the aria-label are all outside it. `tools/buildframe.mjs` is the one that reads the frame BEFORE
// step 0, and the `render/` suite is what holds the picture to the rules.
//
// NAMES, AND WHY A DIFF CAN BE LOUD FOR NOTHING. An element is named by the ref key the card gives
// it, so RENAMING a ref (an array split into scalars, a key respelled) reddens every line that
// element appears on without the picture moving. Compare the values before believing the names.
//
// DETERMINISM. Nothing is paused and nothing is seeked, so the settling wait is the whole
// correctness argument: SETTLE_MS is added on top of the step's own logical span to cover the 0.3s
// CSS transition in diagrams.css, which is what makes a raw pixel comparison of the same tree
// disagree with itself by tens of thousands of pixels. Prove the wait is enough the only way there
// is: two runs against an unchanged tree must be byte-identical.

import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { launch, initPage, stepCount, discoverIds, stepSpan, DEFAULT_BASE, DIAGRAM } from '../fixtures/render.mjs';

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter(a => a.startsWith('--')).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  }),
);
const positional = args.filter(a => !a.startsWith('--'));
const schemeId = positional[0];
const stepArg = positional[1];
const baseUrl = (flags.base || DEFAULT_BASE).replace(/\/$/, '');
const dumpAll = !!flags.all;
const outDir = typeof flags.out === 'string' ? flags.out : null;

if (!schemeId && !dumpAll) {
  console.error('Usage: node tools/settled-dump.mjs <scheme-id> [step] [--base=URL]');
  console.error('       node tools/settled-dump.mjs --all --out=DIR [--base=URL]');
  process.exit(1);
}
if (dumpAll && !outDir) {
  console.error('--all needs --out=DIR (108 dumps do not belong on stdout).');
  process.exit(1);
}

// On top of the step's own span: 300ms is the transition in diagrams.css, the rest is slack.
const SETTLE_MS = 350;

// Play one step for real: no withTimer, so nothing auto-advances, and no pause, so every deferred
// onfinish actually fires. Step 0 is the poster and has no play path.
//
// NOT `fixtures/render.enterStep`, and the difference is the whole point of this file: that one
// freezes every animation on the diagram the instant the step opens, and a paused animation never
// fires an onfinish, so it can never see what a deferred callback wrote.
const playStep = (page, idx) => page.evaluate((i) => {
  const c = window.__schemeCtl;
  if (!c) return false;
  const tl = c._timeline;
  if (i <= 0) { c.gotoStep(0); return true; }
  if (!tl || typeof tl._enterStep !== 'function') { c.gotoStep(i); return false; }
  c.gotoStep(i - 1);
  tl._enterStep(i, { withTimer: false, reduced: false });
  return true;
}, idx);

// The step's logical length is read WHILE it plays, through `fixtures/render.stepSpan`. That
// arithmetic lives in the fixture and nowhere else, this file keeps no copy of it: stepSpan only
// reads getComputedTiming() off every animation on the diagram, and the pausing lives in seekStep()
// and enterStep(), neither of which this file calls, so it is safe to call from the playing path.
// `playStep` is a real divergence and stays.

// Is anything on the diagram still moving? A finite animation that has finished reports 'finished',
// so only live work answers true. An INFINITE one (the marching dash) is excluded by construction:
// it never finishes and would spin the wait loop to its cap on every step of that card.
const stillRunning = (page) => page.evaluate((sel) => {
  const svg = document.querySelector(sel);
  if (!svg) return false;
  return document.getAnimations().some((a) => {
    const tgt = a.effect && a.effect.target;
    if (!tgt || !svg.contains(tgt) || a.playState !== 'running') return false;
    const t = a.effect.getComputedTiming();
    return Number.isFinite(t.activeDuration) && t.iterations !== Infinity;
  });
}, DIAGRAM);

const readSettled = (page, idx) => page.evaluate(({ sel, i }) => {
  const svg = document.querySelector(sel);
  if (!svg) return null;
  const tl = window.__schemeCtl && window.__schemeCtl._timeline;
  const refs = (tl && tl.scene && tl.scene.refs) || null;

  // Element -> the name the card calls it: the ref key where there is one, the document path and
  // class where there is not, so a reader holds one vocabulary rather than a position.
  const nameOf = new Map();
  const claim = (el, key) => { if (el && el.nodeType === 1 && !nameOf.has(el)) nameOf.set(el, key); };
  if (refs) {
    for (const k of Object.keys(refs)) {
      if (k === 'wires') continue;
      const v = refs[k];
      if (Array.isArray(v)) v.forEach((el, n) => claim(el, `${k}[${n}]`));
      else claim(v, k);
    }
    if (refs.wires) for (const k of Object.keys(refs.wires)) claim(refs.wires[k], `wires.${k}`);
  }
  const pathOf = (el) => {
    const p = [];
    for (let n = el; n && n !== svg && n.parentNode; n = n.parentNode) {
      p.unshift([...n.parentNode.children].indexOf(n));
    }
    return p.join('/');
  };
  const idOf = (el) => nameOf.get(el)
    || `@${pathOf(el)}.${(el.getAttribute('class') || '').split(/\s+/).filter(c => c && c !== 'highlight')[0] || el.tagName}`;

  // Every glyph on screen, in document order. Document order rather than sorted: a label that moves
  // from one block to another is a real change and sorting would hide it.
  const texts = [...svg.querySelectorAll('text')]
    .filter(t => (t.textContent || '').trim() !== '')
    .map(t => `${idOf(t.parentNode && t.parentNode.nodeType === 1 ? t.parentNode : t)}: ${t.textContent}`);

  const highlights = [...svg.querySelectorAll('.highlight')].map(idOf).sort();

  // Anything not fully opaque, by NAME rather than by position, so a reordered scene does not read
  // as an opacity change. Rounded to 3 places: a fill-forwards fade lands on a float.
  const opacity = [];
  for (const el of svg.querySelectorAll('*')) {
    const v = parseFloat(getComputedStyle(el).opacity);
    if (Number.isFinite(v) && v < 0.999) opacity.push(`${idOf(el)}=${v.toFixed(3)}`);
  }
  opacity.sort();

  const step = tl && tl.steps && tl.steps[i];
  return { texts, highlights, opacity, stepId: (step && step.id) || '' };
}, { sel: DIAGRAM, i: idx });

async function dumpCard(ctx, id, only) {
  const page = await ctx.newPage();
  try {
    await page.goto(`${baseUrl}/scheme/#scheme=${id}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!window.__schemeCtl, null, { timeout: 8000 });
    await page.waitForSelector(DIAGRAM, { timeout: 8000 });

    const total = await stepCount(page);
    if (!total) return { fatal: `No steps for ${id}. base=${baseUrl}` };

    let targets;
    if (only) {
      const s = parseInt(only, 10);
      if (!Number.isInteger(s) || s < 1 || s > total) {
        return { fatal: `Step "${only}" out of range (1..${total}) for ${id}.` };
      }
      targets = [s - 1];
    } else {
      targets = Array.from({ length: total }, (_, i) => i);
    }

    let degraded = false;
    const out = [`=== ${id} === (${total} steps, settled frame after real-time play)`];
    for (const idx of targets) {
      const ran = await playStep(page, idx);
      if (!ran) degraded = true;
      // The span is re-read after every wait, because a DEFERRED callback can schedule work that
      // did not exist when the step opened, which is the whole population this tool watches. One
      // reading caught a 560ms arrival ripple mid-decay and made two runs of an unchanged tree
      // disagree at the third decimal. Bounded, because a marching dash never finishes.
      for (let round = 0; round < 8; round++) {
        const span = await stepSpan(page);
        await page.waitForTimeout(span + SETTLE_MS);
        if (!(await stillRunning(page))) break;
      }
      const d = await readSettled(page, idx);
      if (!d) return { fatal: `No diagram for ${id} at step ${idx + 1}. base=${baseUrl}` };
      const n = String(idx + 1).padStart(2, '0');
      out.push(`\n--- step ${n} id=${d.stepId} ---`);
      out.push(`highlights (${d.highlights.length}): ${d.highlights.join(', ')}`);
      out.push(`opacity (${d.opacity.length}): ${d.opacity.join(', ')}`);
      out.push('text:');
      for (const t of d.texts) out.push(`  ${t}`);
    }
    return { text: out.join('\n') + '\n', degraded, steps: targets.length };
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await launch();
  // no-preference explicitly: this tool is the ANIMATED path played out to its end.
  const ctx = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width: 1400, height: 900 } });
  await ctx.addInitScript(initPage, 'expose');

  if (dumpAll) {
    const probe = await ctx.newPage();
    const ids = await discoverIds(probe, baseUrl);
    await probe.close();
    if (!ids.length) { console.error(`No cards discovered. base=${baseUrl}`); await browser.close(); process.exit(2); }
    // Wipe first, sentinel last, so a run that dies partway cannot be diffed as if it were whole.
    await rm(outDir, { recursive: true, force: true });
    await mkdir(outDir, { recursive: true });

    let degradedAny = 0, steps = 0;
    for (const [i, id] of ids.entries()) {
      const r = await dumpCard(ctx, id, null);
      if (r.fatal) { console.error(r.fatal); await browser.close(); process.exit(2); }
      if (r.degraded) degradedAny++;
      steps += r.steps;
      await writeFile(join(outDir, `${id}.txt`), r.text);
      process.stderr.write(`\r  ${i + 1}/${ids.length} ${id}`.padEnd(60));
    }
    process.stderr.write('\r'.padEnd(61) + '\r');
    await browser.close();
    if (degradedAny) console.error(`WARN: ${degradedAny} card(s) had no controller handle (no play path read).`);
    await writeFile(join(outDir, '_complete'), `${ids.length} cards, ${steps} steps\n`);
    console.log(`settled-dump --all: ${ids.length} cards, ${steps} steps -> ${outDir}`);
    return;
  }

  const r = await dumpCard(ctx, schemeId, stepArg);
  await browser.close();
  if (r.fatal) { console.error(r.fatal); process.exit(2); }
  if (r.degraded) console.error('WARN: controller lacked the debug handle; the step was not played.');

  if (outDir) {
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, `${schemeId}.txt`), r.text);
    console.log(`settled-dump: ${schemeId} -> ${join(outDir, `${schemeId}.txt`)}`);
  } else {
    process.stdout.write(r.text);
  }
})().catch(e => { console.error(e); process.exit(1); });
