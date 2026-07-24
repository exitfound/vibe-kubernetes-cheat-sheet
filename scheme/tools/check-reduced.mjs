// check-reduced.mjs — verify the reduced-motion contract per step.
//
// The load-bearing rule: everything above `if (ctx.reduced) return;` is the
// COMPLETE static end-state of the step. Prev/reset replays steps reduced, so if
// the played end-state and the reduced state differ, going backwards shows a
// different picture than going forwards did.
//
// This enters each step twice: once reduced (gotoStep), once played and seeked
// past its own span, then diffs the resting OPACITY of every block. Highlights are
// deliberately not compared: see the note at the diff below.
//
// node check-reduced.mjs <id> [<id> ...]
import { launch, setInspect, stepCount, enterStep, stepSpan, seekStep, DEFAULT_BASE } from './_shared.mjs';

const ids = process.argv.slice(2);
if (!ids.length) { console.error('usage: node check-reduced.mjs <id> [<id> ...]'); process.exit(1); }

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
      // Opacity slack absorbs a fill-forwards animation that lands a hair off.
      // Opacity only. .highlight is NOT comparable this way: lightBoxAt sets the class from an
      // animation's onfinish, and onfinish never fires for an animation that was seeked rather than
      // played, so the played snapshot is missing every arrival highlight by construction.
      if (Math.abs(p.op - r.op) > 0.06) issues.push(`  step ${i}  ${p.key}  opacity played=${p.op} reduced=${r.op}`);
    }
  }

  if (issues.length) { bad++; console.log(`\n${id}  ${issues.length} mismatch(es)`); issues.slice(0, 20).forEach(l => console.log(l)); }
  else console.log(`\n${id}  reduced state matches played end-state on every step`);
}

await browser.close();
process.exit(bad ? 1 : 0);
