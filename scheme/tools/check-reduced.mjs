// check-reduced.mjs: the ctx.reduced contract. Enters each step twice, played-and-seeked and
// statically, and diffs the resting opacity of every block. In the gate.
// node check-reduced.mjs [<id> ...]   ids => verbose; none => whole catalog, terse
import { launch, setInspect, stepCount, enterStep, stepSpan, seekStep, discoverIds, DEFAULT_BASE } from './_shared.mjs';

const argIds = process.argv.slice(2);
const terse = argIds.length === 0;

const SEL = '.scheme-box, .scheme-pod, .scheme-cylinder, .scheme-node, .scheme-chip, .scheme-arrow';

const snap = () => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return [];
  return [...svg.querySelectorAll('.scheme-box, .scheme-pod, .scheme-cylinder, .scheme-node, .scheme-chip, .scheme-arrow')]
    .filter(el => !el.closest('#packetLayer'))
    .map((el, i) => {
      const t = (el.querySelector('text') || {}).textContent || '';
      return {
        key: `${i}:${el.getAttribute('class').split(' ')[0]}:${t.trim().slice(0, 20)}`,
        op: Math.round(parseFloat(getComputedStyle(el).opacity) * 100) / 100,
        hl: el.classList.contains('highlight'),
      };
    });
};

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.addInitScript(setInspect, 'expose');

const ids = terse ? await discoverIds(page) : argIds;
if (!ids.length) { console.error('NO CARDS RENDERED: posters/grid broken'); process.exit(1); }

let bad = 0;
for (const id of ids) {
  await page.goto(`${DEFAULT_BASE}/scheme/#scheme=${id}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('dialog.scheme-dialog svg.diagram', { timeout: 10000 });
  const total = await stepCount(page);
  const issues = [];

  for (let i = 1; i < total; i++) {
    // Played: run the step's real play-path, then freeze well past its own span.
    await enterStep(page, i);
    const span = await stepSpan(page);
    await seekStep(page, span + 400);
    await page.waitForTimeout(30);
    const played = await page.evaluate(snap);

    // Reduced: the same step applied statically, the way prev/reset replays it.
    await page.evaluate((n) => window.__schemeCtl.gotoStep(n), i);
    await page.waitForTimeout(50);
    const reduced = await page.evaluate(snap);

    for (let k = 0; k < Math.min(played.length, reduced.length); k++) {
      const p = played[k], r = reduced[k];
      if (p.key !== r.key) continue;
      // Opacity only, with slack for a fill-forwards landing. .highlight is not comparable: onfinish
      // never fires for a seeked animation, so lightBoxAt's arrival class is missing by construction.
      if (Math.abs(p.op - r.op) > 0.06) issues.push(`  step ${i}  ${p.key}  opacity played=${p.op} reduced=${r.op}`);
    }
  }

  if (issues.length) { bad++; console.log(`\n${id}  ${issues.length} mismatch(es)`); issues.slice(0, 20).forEach(l => console.log(l)); }
  else if (!terse) console.log(`\n${id}  reduced state matches played end-state on every step`);
}

await browser.close();
if (terse && !bad) console.log(`reduced check OK: ${ids.length} cards match their played end-state on every step`);
process.exit(bad ? 1 : 0);
