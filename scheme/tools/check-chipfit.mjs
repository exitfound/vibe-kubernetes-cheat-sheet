#!/usr/bin/env node
// check-chipfit.mjs: does a value chip's NAME collide with its VALUE? A chip is name-left,
// value-right inside one rect, so a chip that is too narrow for its longest value renders the two
// strings on top of each other and the text becomes unreadable. Nothing else in the gate looks at
// this: check-inline reads the strings, check-labels compares them across cards, check-geometry
// measures blocks. None of them measures whether a string FITS.
//
// Written 2026-07-27 after the R5 pass narrowed value chips from 350 to 258 (four across) and 205
// (five across) to build a full-width bottom strip, which produced 79 collisions across 21 cards,
// e.g. "spec.unschedulabSehedulingDisabled". It measures the RENDERED text, so it cannot be fooled
// by a font or a value that only appears on one step: every step is walked.
//
// node check-chipfit.mjs [<id> ...]   ids => those cards; none => whole catalog
import { launch, setInspect, stepCount, discoverIds, DEFAULT_BASE } from './_shared.mjs';

// Minimum clear space between the end of the name and the start of the value, in viewBox units.
const MIN_GAP = 4;

const argIds = process.argv.slice(2).filter(a => !a.startsWith('--'));
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.addInitScript(setInspect, 'expose');
const ids = argIds.length ? argIds : await discoverIds(page, DEFAULT_BASE);

const probe = (minGap) => {
  const out = [];
  for (const c of document.querySelectorAll('dialog.scheme-dialog svg.diagram .scheme-chip')) {
    if (c.closest('.scheme-chain')) continue;      // ladder rows carry one string, not a pair
    const ts = [...c.querySelectorAll('text')];
    if (ts.length < 2) continue;
    const [n, v] = [ts[0], ts[ts.length - 1]];
    const nb = n.getBBox(), vb = v.getBBox();
    // Two texts STACKED (a heading over a sub-line, as in the event slots of
    // cluster-api-structure) are not a name/value pair and cannot overlap horizontally.
    if (Math.abs((nb.y + nb.height / 2) - (vb.y + vb.height / 2)) > 4) continue;
    const gap = vb.x - (nb.x + nb.width);
    if (gap < minGap) out.push({ n: (n.textContent || '').trim(), v: (v.textContent || '').trim(), gap: Math.round(gap) });
  }
  return out;
};

const issues = [];
let cards = 0;
for (const id of ids) {
  await page.goto(`${DEFAULT_BASE}/scheme/#scheme=${id}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('dialog.scheme-dialog svg.diagram', { timeout: 15000 });
  const total = await stepCount(page);
  // Pooled over every step: a chip only overflows on the step carrying its longest value.
  const hits = new Map();
  for (let i = 0; i < total; i++) {
    await page.evaluate((n) => window.__schemeCtl.gotoStep(n), i);
    await page.waitForTimeout(20);
    for (const h of await page.evaluate(probe, MIN_GAP)) hits.set(`${h.n}|${h.v}`, h);
  }
  cards++;
  if (hits.size) {
    console.log(`\n${id}  ${hits.size} collision(s)`);
    for (const h of hits.values()) {
      console.log(`  gap=${String(h.gap).padStart(4)}  "${h.n}" | "${h.v}"`);
      issues.push(`${id}  "${h.n}" | "${h.v}" (gap ${h.gap})`);
    }
  }
}
await browser.close();

if (issues.length) {
  console.error(`\nchipfit check FAILED: ${issues.length} collision(s) over ${cards} card(s)`);
  process.exit(1);
}
console.log(`chipfit check OK: ${cards} cards, every value chip fits its name and its longest value`);
