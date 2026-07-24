// overlay-measure.mjs — measure a card's REAL narration overlay in viewBox units.
//
// The blanket safe-zone (x<=380 & y<=300) is a worst case sized for the longest
// narration in the catalog, not a measurement of any one card. This walks every
// step, reads .narration-overlay's client rect, and maps it back into viewBox
// units so a layout can reclaim the room it actually has.
//
// node overlay-measure.mjs <id> [<id> ...]
import { launch, setInspect, stepCount, DEFAULT_BASE } from './_shared.mjs';

const ids = process.argv.slice(2);
if (!ids.length) { console.error('usage: node overlay-measure.mjs <id> [<id> ...]'); process.exit(1); }

const browser = await launch();
const page = await browser.newPage({ viewport: { width: Number(process.env.VW||1600), height: Number(process.env.VH||1000) } });
await page.addInitScript(setInspect, 'expose');

for (const id of ids) {
  await page.goto(`${DEFAULT_BASE}/scheme/#scheme=${id}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('dialog.scheme-dialog svg.diagram', { timeout: 10000 });
  const total = await stepCount(page);

  let worst = { right: 0, bottom: 0, step: -1 };
  for (let i = 0; i < total; i++) {
    await page.evaluate((n) => window.__schemeCtl.gotoStep(n), i);
    await page.waitForTimeout(60);
    const m = await page.evaluate(() => {
      const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
      const ov = document.querySelector('.narration-overlay');
      if (!svg || !ov) return null;
      const sb = svg.getBoundingClientRect();
      const ob = ov.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      // xMidYMid meet: one uniform scale, letterboxed on the slack axis.
      const scale = Math.min(sb.width / vb.width, sb.height / vb.height);
      const offX = sb.left + (sb.width - vb.width * scale) / 2;
      const offY = sb.top + (sb.height - vb.height * scale) / 2;
      return {
        right: (ob.right - offX) / scale + vb.x,
        bottom: (ob.bottom - offY) / scale + vb.y,
      };
    });
    if (!m) continue;
    if (m.bottom > worst.bottom) worst = { ...m, step: i };
  }
  console.log(`${id.padEnd(38)} steps=${String(total).padStart(2)}  overlay right=${worst.right.toFixed(0).padStart(4)}  bottom=${worst.bottom.toFixed(0).padStart(4)}  (worst at step ${worst.step})`);
}

await browser.close();
