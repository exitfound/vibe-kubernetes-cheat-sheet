#!/usr/bin/env node
// settled-dump.mjs: what the viewer is LOOKING AT once a step has finished playing. Each step is
// played in REAL TIME with nothing frozen, then the settled frame is read as text, the sorted
// highlight set and the sorted opacity set.
// node settled-dump.mjs <id> [step] [--base=URL]
// node settled-dump.mjs --all --out=DIR [--base=URL]
//
// WHY IT EXISTS. The three oracle halves cannot see a DEFERRED callback at all. at() and
// lightBoxAt() schedule their work as the onfinish of an empty 1ms animation, and a paused
// animation never fires onfinish (III.5); the reduced half never runs `flow` in the first place
// (III.8a). So all three record a timer's TARGET and DELAY and none of them ever records WHAT the
// callback wrote. Measured consequence: writing `rows: [i]` where the card means `rows: upTo(i)`
// leaves every one of the three byte-identical and still changes the picture, the ladder rows
// walking one at a time instead of accumulating.
//
// Exposure when this was written: 46 deferred F.set entries on 15 cards, and storage's legacy form
// carries 150 lightBoxAt calls of which not one passes a literal zero. This tool is what watches
// them.
//
// WHAT IT SEES. The settled frame only: label and chip text, which elements ended up carrying
// .highlight, and which ended up at what opacity.
//
// WHAT IT IS BLIND TO. Everything in flight. A ball's path, a tag's delay, an easing curve, an
// arrowhead marker, an SVG attribute that is not opacity, and the aria-label are all outside it:
// those are anim-dump's and dom-dump's subject. It is a complement to the oracle, never a
// replacement, and it is the ONLY thing that watches what a deferred callback wrote.
//
// DETERMINISM. Nothing is paused and nothing is seeked, so the settling wait is the whole
// correctness argument: SETTLE_MS is added on top of the step's own logical span to cover the 0.3s
// CSS transition in diagrams.css, which is what makes a raw pixel comparison of the same tree
// disagree with itself by tens of thousands of pixels (III.6a). Prove the wait is enough the same
// way the oracle proved its own: two runs against an unchanged tree must be byte-identical.

import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { launch, setInspect, stepCount, discoverIds, DEFAULT_BASE } from './_shared.mjs';

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
  console.error('Usage: node settled-dump.mjs <scheme-id> [step] [--base=URL]');
  console.error('       node settled-dump.mjs --all --out=DIR [--base=URL]');
  process.exit(1);
}
if (dumpAll && !outDir) {
  console.error('--all needs --out=DIR (108 dumps do not belong on stdout).');
  process.exit(1);
}

const DIAGRAM = 'dialog.scheme-dialog svg.diagram';
// On top of the step's own span: 300ms is the transition in diagrams.css, the rest is slack.
const SETTLE_MS = 350;

// Play one step for real: no withTimer, so nothing auto-advances, and no pause, so every deferred
// onfinish actually fires. Step 0 is the poster and has no play path.
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

// The step's logical length, read WHILE it plays. Same arithmetic as _shared.stepSpan, kept here
// because that one is written for the frozen path and this file must not pause anything.
const spanOf = (page) => page.evaluate((sel) => {
  const svg = document.querySelector(sel);
  if (!svg) return 0;
  let max = 0;
  for (const a of document.getAnimations()) {
    const tgt = a.effect && a.effect.target;
    if (!tgt || !svg.contains(tgt)) continue;
    const t = a.effect.getComputedTiming();
    const active = Number.isFinite(t.activeDuration) ? t.activeDuration : (t.duration || 0);
    const end = (t.delay || 0) + active + (t.endDelay || 0);
    if (Number.isFinite(end) && end > max) max = end;
  }
  return Math.round(max);
}, DIAGRAM);

const readSettled = (page, idx) => page.evaluate(({ sel, i }) => {
  const svg = document.querySelector(sel);
  if (!svg) return null;
  const tl = window.__schemeCtl && window.__schemeCtl._timeline;
  const refs = (tl && tl.scene && tl.scene.refs) || null;

  // Element -> the name the card calls it, exactly as reduced-dump does it, so the two tools name
  // the same element the same way and a reader can hold one vocabulary instead of two.
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
      const span = await spanOf(page);
      await page.waitForTimeout(span + SETTLE_MS);
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
  // no-preference, unlike reduced-dump: this tool is the ANIMATED path played out to its end.
  const ctx = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width: 1400, height: 900 } });
  await ctx.addInitScript(setInspect, 'expose');

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
