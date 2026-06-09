#!/usr/bin/env node
// play-probe.mjs — the COMPLEMENT to smoke-all.mjs / visual-regression.mjs.
//
// Those two run with reducedMotion=reduce, so they only ever exercise the pinned
// (reduced) state and NEVER the play-path (the code after `if (ctx.reduced) return;`
// in each step's enter()). Timeline wraps step.enter() in try/catch, so a broken
// play-path helper (e.g. an extracted pulsePod / packetAlong) throws silently and
// smoke + visual-regression both stay green. This probe closes that gap.
//
// It runs WITHOUT reducedMotion, steps every card forward via __schemeCtl.step('next')
// (which runs the real play-path), and records per-step the number of packet elements
// in #packetLayer plus any console-error / pageerror. The packet count is a stable,
// deterministic signal: every step's enter() appends its packets to #packetLayer
// synchronously (before any awaited animation), and they are only cleared by the next
// step's replaceChildren(), so the count within a step does not depend on timing.
//
// Usage:
//   node play-probe.mjs                  # compare current code vs play-baseline.json
//   node play-probe.mjs --update         # (re)write the baseline from current code
//   node play-probe.mjs --only=workloads-pod-qos-classes,workloads-cronjob
//   node play-probe.mjs --base=http://localhost:8080
//
// Requires the Docker container up on :8080 (same as the other tools).
import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASELINE  = join(__dirname, 'play-baseline.json');

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter(a => a.startsWith('--')).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  }),
);
const update  = !!flags.update;
const baseUrl = (flags.base || process.env.BASE || 'http://localhost:8080').replace(/\/$/, '');
const only    = flags.only ? new Set(String(flags.only).split(',')) : null;
const EXE = process.env.PLAYWRIGHT_CHROMIUM ||
  '/home/medoed/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome';

// Pre-existing/unrelated noise: the Cloudflare RUM beacon (CORS on localhost) and
// transient network blips. Everything else is a real error.
const ignore = t => /cloudflareinsights|cdn-cgi\/rum|ERR_FAILED|ERR_NETWORK_CHANGED/.test(t);

const browser = await chromium.launch({ executablePath: EXE });
const ctx = await browser.newContext();           // NO reducedMotion => play-path runs
await ctx.addInitScript(() => { try { localStorage.setItem('scheme:inspect', 'expose'); } catch (_) {} });
const page = await ctx.newPage();

await page.goto(`${baseUrl}/scheme/`, { waitUntil: 'networkidle' });
let ids = await page.$$eval('article.card', els =>
  els.map(e => e.dataset.id || e.getAttribute('data-id')).filter(Boolean));
if (only) ids = ids.filter(id => only.has(id));
if (!ids.length) { console.error('no schemes to probe'); process.exit(2); }

const PKT = 'dialog.scheme-dialog svg.diagram #packetLayer';
const result = {};
const failures = [];

for (const id of ids) {
  const errs = [];
  const onC = m => { if (m.type() === 'error' && !ignore(m.text())) errs.push('console: ' + m.text()); };
  const onP = e => { if (!ignore(e.message)) errs.push('pageerror: ' + e.message); };
  page.on('console', onC);
  page.on('pageerror', onP);
  const counts = [];
  try {
    await page.goto(`${baseUrl}/scheme/#scheme=${id}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!window.__schemeCtl, null, { timeout: 8000 });
    await page.waitForSelector('dialog.scheme-dialog svg.diagram', { timeout: 8000 });
    const total = await page.$$eval('dialog.scheme-dialog .dialog-step-dots > *', d => d.length);
    // Stop the auto-play, snap to step 0 (reduced), then walk the play-path forward.
    await page.evaluate(() => { const c = window.__schemeCtl; c.pause(); c.gotoStep(0); });
    await page.waitForTimeout(120);
    counts.push(await page.$eval(PKT, n => n.childElementCount).catch(() => 0));
    for (let i = 1; i < total; i++) {
      await page.evaluate(() => window.__schemeCtl.step('next'));
      await page.waitForTimeout(220);             // let enter() run + packets append
      counts.push(await page.$eval(PKT, n => n.childElementCount).catch(() => 0));
    }
  } catch (e) {
    errs.push('exception: ' + e.message);
  } finally {
    page.off('console', onC);
    page.off('pageerror', onP);
  }
  result[id] = counts;
  if (errs.length) failures.push({ id, errs });
}

await browser.close();

if (update) {
  await writeFile(BASELINE, JSON.stringify(result, null, 1));
  console.log(`play-baseline written for ${Object.keys(result).length} schemes -> ${BASELINE}`);
  if (failures.length) {
    console.log('WARNING: errors during baseline capture (the baseline may be invalid):');
    failures.forEach(f => { console.log(`  ${f.id}`); f.errs.slice(0, 4).forEach(e => console.log('     ' + e)); });
    process.exit(1);
  }
  process.exit(0);
}

if (!existsSync(BASELINE)) { console.error('no baseline; run with --update first'); process.exit(2); }
const base = JSON.parse(await readFile(BASELINE, 'utf8'));
let diffs = 0;
for (const id of Object.keys(result)) {
  const got = result[id];
  const exp = base[id];
  if (!exp) { console.log(`? ${id}: no baseline entry (new card?)`); continue; }
  if (JSON.stringify(got) !== JSON.stringify(exp)) {
    diffs++;
    console.log(`✗ ${id}: per-step packet counts changed`);
    console.log(`    baseline: ${JSON.stringify(exp)}`);
    console.log(`    current:  ${JSON.stringify(got)}`);
  }
}
console.log('---');
if (failures.length) {
  console.log(`PLAY-PATH ERRORS in ${failures.length} scheme(s):`);
  failures.forEach(f => { console.log(`### ${f.id}`); f.errs.slice(0, 6).forEach(e => console.log('   ' + e)); });
}
console.log(`${diffs} packet-count diffs, ${failures.length} scheme(s) with errors, ${Object.keys(result).length} schemes`);
process.exit(diffs > 0 || failures.length > 0 ? 1 : 0);
