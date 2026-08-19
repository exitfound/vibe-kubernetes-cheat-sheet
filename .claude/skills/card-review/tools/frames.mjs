#!/usr/bin/env node
// frames.mjs: one PNG per step per viewport, so a reviewer can LOOK at every frame of a card.
//
//   cd scheme/test && node ../../.claude/skills/card-review/tools/frames.mjs <card-id> --out=DIR
//     [--viewports=1600x1000,1280x860,1100x800]   the set the render tests measure on
//     [--at=0,0.5,0.95]                           fractions of each step span to freeze at
//     [--base=http://localhost:8888]
//
// WHY THE 0 IS IN THE DEFAULT SET, and do not drop it: a single frame cannot show that something
// OSCILLATES. A 600ms brightness flash on a step whose whole span is 600ms is at peak at 0.5 and
// still lit at 0.95, so both frames read as "this block is highlighted" and are indistinguishable
// from a static `.highlight`. The 0 frame is the resting state, so a block that differs between
// -0.png and -50.png is MOVING. Compare them per step, never read one alone.
//
// Needs a server at the base URL (python3 -m http.server 8888 from the repo root) and Playwright,
// which lives in scheme/test/node_modules, so RUN IT FROM scheme/test.
//
// BLIND SPOT, and it matters (CANON M-35): a SEEK never fires onfinish, so every `at(...)`
// turnover, every arrival class and every deferred setWire is missing from these frames. To read a
// turnover, play the card for real with scheme/test/tools/settled-dump.mjs instead.
import { mkdir } from 'node:fs/promises';
import {
  launch, initPage, openCard, enterStep, seekStep, stepCount, stepSpan, DEFAULT_BASE,
} from '../../../../scheme/test/fixtures/render.mjs';

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, v = 'true'] = a.slice(2).split('='); return [k, v];
}));
const id = args.find(a => !a.startsWith('--'));
if (!id) { console.error('Usage: node frames.mjs <card-id> --out=DIR'); process.exit(1); }

const base = (flags.base || DEFAULT_BASE).replace(/\/$/, '');
const out = flags.out || `/tmp/card-review/${id}`;
const viewports = (flags.viewports || '1600x1000,1280x860,1100x800').split(',').map(v => {
  const [width, height] = v.split('x').map(Number);
  return { width, height, tag: v };
});
const fractions = (flags.at || '0,0.5,0.95').split(',').map(Number);

await mkdir(out, { recursive: true });
const browser = await launch();
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  await ctx.addInitScript(initPage, 'expose');
  const page = await ctx.newPage();
  await openCard(page, id, base);
  // The poster auto-plays step 1 about a second in: pause first or the frame is a race.
  await page.evaluate(() => window.__schemeCtl?.pause?.());
  await page.evaluate(() => document.fonts.ready.then(() => true));
  const n = await stepCount(page);
  for (let i = 0; i < n; i++) {
    await enterStep(page, i);
    const span = await stepSpan(page);
    for (const f of fractions) {
      await seekStep(page, Math.round(span * f));
      await page.waitForTimeout(120);
      const name = `${id}-${vp.tag}-s${String(i).padStart(2, '0')}-${Math.round(f * 100)}.png`;
      await page.screenshot({ path: `${out}/${name}` });
    }
  }
  console.log(`${vp.tag}: ${n} step(s) x ${fractions.length} frame(s)`);
  await ctx.close();
}
await browser.close();
console.log(`frames in ${out}`);
