#!/usr/bin/env node
// frames.mjs: one PNG per step per viewport at fractions of each span, so a reviewer can LOOK at every frame of a card.
// usage: cd scheme/test && node ../../.claude/skills/card-review/tools/frames.mjs <card-id> --out=DIR [--viewports=WxH,...] [--at=0,0.5,0.95] [--base=URL]
// Keep 0 in --at: a block differing between -0 and -50 is MOVING. A seek never fires onfinish (M-35), so turnovers need settled-dump.mjs.
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
