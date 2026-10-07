#!/usr/bin/env node
// The settled frame of each step played in real time, nothing frozen, so deferred onfinish callbacks
// are seen: text, highlights and opacities by ref name. node tools/settled-dump.mjs <id> [step] |
// --all --out=DIR [--base=URL]. Two runs on an unchanged tree must be byte-identical.

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
  console.error('--all needs --out=DIR (a dump per card does not belong on stdout).');
  process.exit(1);
}

// On top of the step's span: the 300ms CSS transition in diagrams.css plus slack.
const SETTLE_MS = 350;

// No withTimer and no pause, so every deferred onfinish fires. Not render.enterStep, which freezes.
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

// Finished animations report 'finished'. Infinite ones (the marching dash) are excluded or the wait would spin to its cap.
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

  // The ref key where there is one, else document path and class.
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

  // Document order, not sorted: a label moving between blocks is a real change.
  const texts = [...svg.querySelectorAll('text')]
    .filter(t => (t.textContent || '').trim() !== '')
    .map(t => `${idOf(t.parentNode && t.parentNode.nodeType === 1 ? t.parentNode : t)}: ${t.textContent}`);

  const highlights = [...svg.querySelectorAll('.highlight')].map(idOf).sort();

  // By name, so a reordered scene is not an opacity change. 3 places: a fade lands on a float.
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
      // Re-read after every wait, since a deferred callback can schedule new work. Bounded for the marching dash.
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
  // This tool plays the animated path out to its end.
  const ctx = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width: 1400, height: 900 } });
  await ctx.addInitScript(initPage, 'expose');

  if (dumpAll) {
    const probe = await ctx.newPage();
    const ids = await discoverIds(probe, baseUrl);
    await probe.close();
    if (!ids.length) { console.error(`No cards discovered. base=${baseUrl}`); await browser.close(); process.exit(2); }
    // Wipe first, sentinel last, so a partial run cannot be diffed as whole.
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
