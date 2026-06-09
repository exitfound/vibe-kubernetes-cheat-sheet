#!/usr/bin/env node
// visual-regression.mjs — capture every scheme × every step under
// reducedMotion=reduce (so frames are deterministic), compare against
// scheme/tools/baselines/. Reports diffs above threshold and writes
// diff PNGs to scheme/tools/output/_vr/<id>/step-<N>.diff.png.
//
// Usage:
//   node visual-regression.mjs                       # diff vs baselines
//   node visual-regression.mjs --update              # regenerate baselines from current state
//   node visual-regression.mjs --only=control-plane-architecture
//   node visual-regression.mjs --threshold=0.03      # 3% pixel-diff allowed
//   node visual-regression.mjs --base=http://localhost:8080

import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const BASELINES  = join(__dirname, 'baselines');
const DIFFS      = join(__dirname, 'output', '_vr');

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter(a => a.startsWith('--')).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  }),
);

const update    = !!flags.update;
const baseUrl   = (flags.base || 'http://localhost:8080').replace(/\/$/, '');
const threshold = parseFloat(flags.threshold || '0.005');
const only      = flags.only ? new Set(String(flags.only).split(',')) : null;

const CHROMIUM = process.env.PLAYWRIGHT_CHROMIUM
  || '/home/medoed/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome';

async function listSchemes(page) {
  await page.goto(`${baseUrl}/scheme/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('article.card', { timeout: 5000 });
  return page.evaluate(() => {
    // SCHEMES is a module-local in app.js, but each card has the scheme id
    // baked into its click handler via data attribute or aria-label. Walk
    // the data export instead — it's loaded by the same module.
    return Array.from(document.querySelectorAll('article.card'))
      .map(c => c.dataset.schemeId || c.getAttribute('data-id') || null)
      .filter(Boolean);
  });
}

async function getStepCount(page, id) {
  await page.goto(`${baseUrl}/scheme/#scheme=${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__schemeCtl, null, { timeout: 5000 });
  await page.waitForFunction(
    () => document.querySelectorAll('dialog.scheme-dialog .dialog-step-dots > *').length > 0,
    null, { timeout: 5000 },
  );
  return page.evaluate(() => document.querySelectorAll('dialog.scheme-dialog .dialog-step-dots > *').length);
}

async function shotStep(page, id, idx) {
  await page.evaluate(({ i }) => {
    const c = window.__schemeCtl;
    if (!c) return;
    try { c.pause?.(); } catch (_) {}
    c.gotoStep(i);
  }, { i: idx });
  await page.waitForTimeout(60);
  return page.locator('dialog.scheme-dialog svg.diagram').screenshot({ type: 'png' });
}

function diff(aBuf, bBuf) {
  const a = PNG.sync.read(aBuf);
  const b = PNG.sync.read(bBuf);
  if (a.width !== b.width || a.height !== b.height) {
    return { mismatch: 1, total: a.width * a.height, diffPng: null, sizeMismatch: true };
  }
  const out = new PNG({ width: a.width, height: a.height });
  const mismatch = pixelmatch(a.data, b.data, out.data, a.width, a.height, { threshold: 0.1 });
  return { mismatch, total: a.width * a.height, diffPng: PNG.sync.write(out), sizeMismatch: false };
}

async function ensureDir(p) { if (!existsSync(p)) await mkdir(p, { recursive: true }); }

(async () => {
  const browser = await chromium.launch({ executablePath: CHROMIUM, headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    reducedMotion: 'reduce',
  });
  await ctx.addInitScript(() => {
    try { localStorage.setItem('scheme:inspect', 'expose'); } catch (_) {}
  });
  const page = await ctx.newPage();

  let ids = await listSchemes(page);
  if (!ids.length) {
    // Fallback: data-scheme-id wasn't on cards. Read scheme registry by
    // importing data.js text-side.
    const txt = await (await fetch(`${baseUrl}/scheme/js/data.js`)).text();
    ids = [...txt.matchAll(/id:\s*['"]([\w-]+)['"]/g)].map(m => m[1]);
  }
  if (only) ids = ids.filter(id => only.has(id));
  if (!ids.length) { console.error('No schemes to test.'); process.exit(2); }

  await ensureDir(BASELINES);
  await ensureDir(DIFFS);

  const report = { ok: 0, diffs: 0, missing: 0, schemes: 0 };
  for (const id of ids) {
    report.schemes++;
    const total = await getStepCount(page, id);
    if (!total) { console.log(`! ${id}: no steps`); continue; }
    const schemeDir = join(BASELINES, id);
    if (update) await ensureDir(schemeDir);

    for (let i = 0; i < total; i++) {
      const png = await shotStep(page, id, i);
      const name = `step-${String(i + 1).padStart(2, '0')}.png`;
      const baselinePath = join(schemeDir, name);

      if (update) {
        await writeFile(baselinePath, png);
        continue;
      }

      if (!existsSync(baselinePath)) {
        report.missing++;
        console.log(`? ${id}/${name}: no baseline (run with --update)`);
        continue;
      }
      const baseline = await readFile(baselinePath);
      const d = diff(baseline, png);
      const ratio = d.mismatch / d.total;
      if (d.sizeMismatch || ratio > threshold) {
        report.diffs++;
        await ensureDir(join(DIFFS, id));
        const diffPath = join(DIFFS, id, name.replace('.png', '.diff.png'));
        if (d.diffPng) await writeFile(diffPath, d.diffPng);
        const actualPath = join(DIFFS, id, name.replace('.png', '.actual.png'));
        await writeFile(actualPath, png);
        console.log(`✗ ${id}/${name}: ${d.sizeMismatch ? 'size mismatch' : `${(ratio * 100).toFixed(2)}% pixels differ`} → ${diffPath}`);
      } else {
        report.ok++;
      }
    }
    if (update) console.log(`  ${id}: ${total} baselines written`);
  }

  if (!update) {
    console.log(`\n${report.ok} ok, ${report.diffs} diffs, ${report.missing} missing across ${report.schemes} schemes`);
  } else {
    console.log(`\nbaselines updated for ${report.schemes} schemes`);
  }
  await browser.close();
  process.exit(report.diffs > 0 || report.missing > 0 ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
