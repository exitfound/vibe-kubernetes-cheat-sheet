#!/usr/bin/env node
// dom-dump.mjs: a card's STRUCTURE as text per step (the diagram's serialized DOM at step entry
// and at t=span). The structural half of the refactor oracle. Analysis aid, not a gate.
// node dom-dump.mjs <id> [step] [--base=URL]
// node dom-dump.mjs --all --out=DIR [--base=URL]
//
// Why this exists next to anim-dump, which already walks every step: the two are blind in
// opposite directions. outerHTML is IDENTICAL at t=0/0.5/1 under a WAAPI animation (measured:
// network-dns-coredns step 2, 22 animations, same 6455 bytes at all three offsets), because
// WAAPI composites off the inline style rather than writing to it. So this tool cannot see
// motion. anim-dump, in turn, only ever reports elements that are being animated, so it cannot
// see a static block that moved, a chip that got relabelled, or a wrapping <g> that gained a
// level. A refactor is only proven safe when BOTH diffs are empty.

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { launch, setInspect, stepCount, enterStep, stepSpan, seekStep, discoverIds, DEFAULT_BASE } from './_shared.mjs';

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
  console.error('Usage: node dom-dump.mjs <scheme-id> [step] [--base=URL]');
  console.error('       node dom-dump.mjs --all --out=DIR [--base=URL]');
  process.exit(1);
}
if (dumpAll && !outDir) {
  console.error('--all needs --out=DIR (108 dumps do not belong on stdout).');
  process.exit(1);
}

const DIAGRAM = 'dialog.scheme-dialog svg.diagram';

const serialize = (page) => page.evaluate((sel) => {
  const svg = document.querySelector(sel);
  return svg ? svg.outerHTML : '';
}, DIAGRAM);

// One tag per line so `diff` points at the element that changed instead of at a 6KB single line.
// Purely presentational and deterministic: it never merges or reorders anything.
const asLines = (html) => html.replace(/></g, '>\n<');

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
    const out = [`=== ${id} === (${total} steps)`];
    for (const idx of targets) {
      const ran = await enterStep(page, idx);
      if (!ran) degraded = true;
      await page.waitForTimeout(20);
      const span = await stepSpan(page);
      // Seek explicitly rather than trusting the state enterStep left behind: currentTime is
      // absolute, so elapsed real time between enter and read cannot leak into the dump.
      await seekStep(page, 0);
      const entry = await serialize(page);
      await seekStep(page, span);
      const end = await serialize(page);
      const n = String(idx + 1).padStart(2, '0');
      out.push(`\n--- step ${n} entry (span=${span}ms) ---`, asLines(entry));
      out.push(`\n--- step ${n} end ---`, end === entry ? '(identical to entry)' : asLines(end));
    }
    return { text: out.join('\n') + '\n', degraded, steps: targets.length };
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await launch();
  const ctx = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width: 1400, height: 900 } });
  await ctx.addInitScript(setInspect, 'expose');

  if (dumpAll) {
    const probe = await ctx.newPage();
    const ids = await discoverIds(probe, baseUrl);
    await probe.close();
    if (!ids.length) { console.error(`No cards discovered. base=${baseUrl}`); await browser.close(); process.exit(2); }
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
    if (degradedAny) console.error(`WARN: ${degradedAny} card(s) fell back to static state (no _timeline).`);
    console.log(`dom-dump --all: ${ids.length} cards, ${steps} steps -> ${outDir}`);
    return;
  }

  const r = await dumpCard(ctx, schemeId, stepArg);
  await browser.close();
  if (r.fatal) { console.error(r.fatal); process.exit(2); }
  if (r.degraded) console.error('WARN: controller lacked _timeline; some steps fell back to static state.');

  if (outDir) {
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, `${schemeId}.txt`), r.text);
    console.log(`dom-dump: ${schemeId} -> ${join(outDir, `${schemeId}.txt`)}`);
  } else {
    process.stdout.write(r.text);
  }
})().catch(e => { console.error(e); process.exit(1); });
