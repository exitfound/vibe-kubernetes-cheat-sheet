#!/usr/bin/env node
// extents.mjs: every drawn string of a card MEASURED in viewBox units, per step, with the panel
// rectangle beside it. Character-count arithmetic (6.89 units per mono character) is an estimate
// and has been wrong by 5 units on a string that then sat 1.8 from a box wall: measure instead.
//
//   cd scheme/test && node ../../.claude/skills/card-review/tools/extents.mjs <card-id>
//     [--step=N]  one step only, default every step
//     [--viewport=1600x1000]
//     [--base=http://localhost:8888]
//
// Reads: x1..x2 and y1..y2 of each <text>, its width, and whether its box intersects the narration
// panel (which is what OCCLUDED cannot report for a text, because that rule scores BLOCKS).
import {
  launch, initPage, openCard, enterStep, stepCount, DEFAULT_BASE, DIAGRAM,
} from '../../../../scheme/test/fixtures/render.mjs';

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, v = 'true'] = a.slice(2).split('='); return [k, v];
}));
const id = args.find(a => !a.startsWith('--'));
if (!id) { console.error('Usage: node extents.mjs <card-id> [--step=N]'); process.exit(1); }
const [width, height] = (flags.viewport || '1600x1000').split('x').map(Number);

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width, height } });
await ctx.addInitScript(initPage, 'expose');
const page = await ctx.newPage();
await openCard(page, id, (flags.base || DEFAULT_BASE).replace(/\/$/, ''));
await page.evaluate(() => window.__schemeCtl?.pause?.());
// Fonts first. A text measured before the webfont lands is measured in the fallback face, and the
// same string then reads 173.6 units on one run and 159.5 on the next.
await page.evaluate(() => document.fonts.ready.then(() => true));

const read = () => page.evaluate((sel) => {
  const svg = document.querySelector(sel);
  // getScreenCTM, NOT viewBox.width / rect.width. `preserveAspectRatio` letterboxes the diagram
  // inside its box on any viewport whose aspect differs from the viewBox, and the naive ratio then
  // reports a string tens of units from where it is: measured, it put a right-aligned frame label
  // back on the left corner at 1100x800. The matrix is the only reading that survives a resize.
  const inv = svg.getScreenCTM().inverse();
  const at = (x, y) => { const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(inv); };
  const toVB = (b) => {
    const a = at(b.left, b.top), c = at(b.right, b.bottom);
    return {
      x1: +a.x.toFixed(1), x2: +c.x.toFixed(1), y1: +a.y.toFixed(1), y2: +c.y.toFixed(1),
      w: +(c.x - a.x).toFixed(1),
    };
  };
  const panelEl = document.querySelector('.narration-overlay');
  const panel = panelEl ? toVB(panelEl.getBoundingClientRect()) : null;
  const texts = [];
  for (const t of svg.querySelectorAll('text')) {
    const s = (t.textContent || '').trim();
    if (!s) continue;
    const box = toVB(t.getBoundingClientRect());
    const hidden = panel && box.x1 < panel.x2 && box.x2 > panel.x1 && box.y1 < panel.y2 && box.y2 > panel.y1;
    texts.push({ s, cls: t.getAttribute('class') || '', ...box, hidden: !!hidden });
  }
  return { panel, texts };
}, DIAGRAM);

const n = await stepCount(page);
const steps = flags.step !== undefined ? [Number(flags.step)] : [...Array(n).keys()];
for (const i of steps) {
  await enterStep(page, i);
  await page.waitForTimeout(200);
  const { panel, texts } = await read();
  console.log(`\n=== step ${i} at ${flags.viewport || '1600x1000'} ===`);
  if (panel) console.log(`panel  x ${panel.x1}..${panel.x2}   y ${panel.y1}..${panel.y2}`);
  console.log('  width      x1      x2      y1      y2  text');
  for (const t of texts) {
    console.log(
      String(t.w).padStart(7), String(t.x1).padStart(7), String(t.x2).padStart(7),
      String(t.y1).padStart(7), String(t.y2).padStart(7), ' ', t.s, t.hidden ? '  <-- UNDER THE PANEL' : '',
    );
  }
}
await browser.close();
