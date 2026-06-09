#!/usr/bin/env node
// frame-strip.mjs — capture N evenly-spaced frames of a scheme step and stitch
// them horizontally into one PNG per step. Reveals motion that a single
// end-of-step screenshot hides (animateAlong delays, packet trajectories).
//
// Usage:
//   node frame-strip.mjs <scheme-id>                   # all steps
//   node frame-strip.mjs <scheme-id> 3                 # step 3 only
//   node frame-strip.mjs <scheme-id> 3 --frames=12
//   node frame-strip.mjs <scheme-id> --inspect         # keep grid overlay in frames
//   node frame-strip.mjs <scheme-id> --base=http://localhost:8888
//   node frame-strip.mjs <scheme-id> --sample-ms=3000
//
// Output: scheme/tools/output/<id>/step-<N>.png

import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = join(__dirname, 'output');

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter(a => a.startsWith('--')).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  }),
);
const positional = args.filter(a => !a.startsWith('--'));
const schemeId = positional[0];
const stepArg  = positional[1];
const frames   = parseInt(flags.frames || '8', 10);
const baseUrl  = (flags.base || 'http://localhost:8080').replace(/\/$/, '');
const showGrid = !!flags.inspect;
const sampleMs = parseInt(flags['sample-ms'] || '2400', 10);

if (!schemeId) {
  console.error('Usage: node frame-strip.mjs <scheme-id> [step] [--frames=N] [--inspect] [--base=URL] [--sample-ms=2400]');
  process.exit(1);
}

const CHROMIUM = process.env.PLAYWRIGHT_CHROMIUM
  || '/home/medoed/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome';

async function withScheme(page, id) {
  await page.goto(`${baseUrl}/scheme/#scheme=${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__schemeCtl, null, { timeout: 5000 });
  await page.waitForFunction(
    () => document.querySelectorAll('dialog.scheme-dialog .dialog-step-dots > *').length > 0,
    null, { timeout: 5000 },
  );
}

async function getStepCount(page) {
  return page.evaluate(() => document.querySelectorAll('dialog.scheme-dialog .dialog-step-dots > *').length);
}

async function captureStep(page, idx) {
  await page.evaluate(({ i }) => {
    const c = window.__schemeCtl;
    if (!c) return;
    try { c.pause?.(); } catch (_) {}
    c.gotoStep(i);
  }, { i: idx });
  // gotoStep enters step in reduced/static mode. To get motion, restart that
  // step's enter() via play() and immediately repause to capture from t=0
  // would over-engineer. Cleaner: rebuild via _enterStep with timer=true if
  // exposed; otherwise just call play() and sample during the step window.
  await page.evaluate(() => { try { window.__schemeCtl.play(); } catch (_) {} });
  await page.waitForTimeout(40);

  const dt = Math.max(1, Math.floor(sampleMs / frames));
  const shots = [];
  const locator = page.locator('dialog.scheme-dialog svg.diagram');
  for (let i = 0; i < frames; i++) {
    shots.push(await locator.screenshot({ type: 'png' }));
    if (i < frames - 1) await page.waitForTimeout(dt);
  }
  await page.evaluate(() => { try { window.__schemeCtl.pause(); } catch (_) {} });
  return shots;
}

function stitch(shots) {
  const pngs = shots.map(buf => PNG.sync.read(buf));
  const w = pngs[0].width;
  const h = pngs[0].height;
  const gutter = 4;
  const totalW = w * pngs.length + gutter * (pngs.length - 1);
  const out = new PNG({ width: totalW, height: h });
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = 17; out.data[i + 1] = 15; out.data[i + 2] = 31; out.data[i + 3] = 255;
  }
  pngs.forEach((p, idx) => {
    const dstX = idx * (w + gutter);
    for (let y = 0; y < h; y++) {
      const sStart = y * p.width * 4;
      const dStart = (y * totalW + dstX) * 4;
      p.data.copy(out.data, dStart, sStart, sStart + w * 4);
    }
  });
  return PNG.sync.write(out);
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROMIUM, headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    reducedMotion: 'no-preference',
  });
  await ctx.addInitScript((mode) => {
    try { localStorage.setItem('scheme:inspect', mode); } catch (_) {}
  }, showGrid ? 'grid' : 'expose');
  const page = await ctx.newPage();

  await withScheme(page, schemeId);
  const total = await getStepCount(page);
  if (!total) {
    console.error(`No steps detected for ${schemeId}. Is the scheme loaded? base=${baseUrl}`);
    await browser.close();
    process.exit(2);
  }

  const targets = stepArg
    ? [parseInt(stepArg, 10) - 1].filter(n => n >= 0 && n < total)
    : Array.from({ length: total }, (_, i) => i);

  const outDir = join(OUT_ROOT, schemeId);
  if (!existsSync(outDir)) await mkdir(outDir, { recursive: true });

  for (const idx of targets) {
    const shots = await captureStep(page, idx);
    const png = stitch(shots);
    const out = join(outDir, `step-${String(idx + 1).padStart(2, '0')}.png`);
    await writeFile(out, png);
    console.log(`  ${out}  (${shots.length} frames, ${sampleMs}ms window)`);
  }

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
