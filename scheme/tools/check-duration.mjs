#!/usr/bin/env node
// check-duration.mjs: a step must outlast its own motion. `routeDur` is length-based, so any
// geometry change is silently also a timing change, and when span > duration the auto-advance
// cuts the step off mid-flight and the card under-shows what it narrates. This was a checklist
// item that nothing enforced until a sweep found 78 steps across 37 cards already over budget.
// node check-duration.mjs [<id> ...]   ids => verbose; none => whole catalog, terse
import { launch, setInspect, stepCount, enterStep, stepSpan, discoverIds, DEFAULT_BASE } from './_shared.mjs';

const argIds = process.argv.slice(2).filter(a => !a.startsWith('--'));
const terse = argIds.length === 0;

const browser = await launch();
const page = await browser.newPage();
await page.addInitScript(setInspect, 'expose');
const ids = argIds.length ? argIds : await discoverIds(page, DEFAULT_BASE);

const over = [];
let cards = 0, steps = 0;
for (const id of ids) {
  await page.goto(`${DEFAULT_BASE}/scheme/#scheme=${id}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('dialog.scheme-dialog svg.diagram', { timeout: 15000 });
  const total = await stepCount(page);
  const durations = await page.evaluate(() => {
    const tl = window.__schemeCtl && window.__schemeCtl._timeline;
    return tl && tl.steps ? tl.steps.map(s => s.duration || 0) : null;
  });
  if (!durations) { console.error(`${id}: no timeline handle, skipped`); continue; }
  const mine = [];
  for (let i = 0; i < total; i++) {
    const live = await enterStep(page, i);
    if (!live) continue;
    const span = await stepSpan(page);
    steps++;
    const dur = durations[i] || 0;
    if (span > dur) mine.push(`  step ${String(i).padStart(2)} "${(await page.evaluate(() => {
      const tl = window.__schemeCtl._timeline; return (tl.steps[tl.index] || {}).id || '';
    }))}"  span=${span}ms > duration=${dur}ms  (short by ${span - dur}ms)`);
  }
  cards++;
  if (mine.length) {
    over.push(...mine.map(m => `${id}${m}`));
    if (!terse) { console.log(`${id}  ${mine.length} step(s) over budget`); mine.forEach(m => console.log(m)); }
  } else if (!terse) {
    console.log(`${id}  clean`);
  }
}
await browser.close();

if (over.length) {
  console.error(`duration check FAILED: ${over.length} step(s) over budget across ${cards} card(s):`);
  for (const o of over) console.error('  ' + o.replace(/\n/g, ' '));
  process.exit(1);
}
console.log(`duration check OK: ${cards} cards, ${steps} steps, every step outlasts its own motion`);
