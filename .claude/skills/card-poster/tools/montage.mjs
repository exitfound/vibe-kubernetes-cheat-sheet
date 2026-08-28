#!/usr/bin/env node
// montage.mjs: a poster is judged NEXT TO ITS SIBLINGS and at the size a reader sees it (R-05,
// R-06). Nothing else in this repository renders a poster, which is why posters keep shipping with
// defects that are invisible in the source and obvious on the grid.
//
//   node .claude/skills/card-poster/tools/montage.mjs <card-id> [--out=DIR] [--base=URL]
//   node .claude/skills/card-poster/tools/montage.mjs --ids=a,b,c [--out=DIR]
//   node .claude/skills/card-poster/tools/montage.mjs --sheet=<category> [--out=DIR]
//
// Writes two images per run, and BOTH are the point:
//   <name>-actual.png    device scale 1: the poster at the size the grid actually paints it, about
//                        200px wide. A speck, a track dimmed under its siblings and a quarter of
//                        the canvas left as empty air only show up here.
//   <name>-montage.png   device scale 3: the same layout with enough pixels to judge composition,
//                        which is the reading R-05 asks for.
//
// Both are CLIPPED to the cards themselves, so the sheet holds posters and nothing else. Runs from
// any directory. Needs a server at the base URL and Playwright from scheme/test.
import { mkdir } from 'node:fs/promises';
import { launch, DEFAULT_BASE } from '../../../../scheme/test/fixtures/render.mjs';

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, v = 'true'] = a.slice(2).split('='); return [k, v];
}));
const id = args.find(a => !a.startsWith('--'));
if (!id && !flags.sheet && !flags.ids) {
  console.error('Usage: montage.mjs <card-id> | --ids=a,b,c | --sheet=<category>');
  process.exit(1);
}

const base = (flags.base || DEFAULT_BASE).replace(/\/$/, '');
const out = flags.out || '/tmp/card-poster';
const name = id || flags.sheet || 'selection';
await mkdir(out, { recursive: true });

async function shoot(scale, file) {
  const browser = await launch();
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: flags.sheet ? 2600 : 1000 },
    deviceScaleFactor: scale,
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/scheme/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('article.card');
  await page.evaluate(() => document.fonts.ready.then(() => true));

  const picked = await page.evaluate(({ cardId, sheet, idList }) => {
    const cards = [...document.querySelectorAll('article.card')];
    const idOf = c => c.dataset.id || c.getAttribute('data-id');
    let keep;
    if (idList) keep = cards.filter(c => idList.split(',').includes(idOf(c)));
    else if (sheet) keep = cards.filter(c => idOf(c).startsWith(sheet + '-'));
    else {
      // The card plus a neighbour on each side. Catalog order IS the editorial order, so those are
      // the posters a reader's eye actually lands next to.
      const i = cards.findIndex(c => idOf(c) === cardId);
      if (i < 0) return null;
      keep = cards.slice(Math.max(0, i - 1), i + 2);
    }
    if (!keep.length) return null;
    // Hide everything else, including the section headers, so the clip below holds posters only.
    for (const c of cards) if (!keep.includes(c)) c.remove();
    for (const h of document.querySelectorAll('.section-head, .cat-head, h2, h3')) h.remove();
    return keep.map(idOf);
  }, { cardId: id, sheet: flags.sheet, idList: flags.ids });

  if (!picked) { await browser.close(); throw new Error(`no card matched: ${id || flags.sheet || flags.ids}`); }

  const box = await page.evaluate(() => {
    const rs = [...document.querySelectorAll('article.card')].map(c => c.getBoundingClientRect());
    const x = Math.min(...rs.map(r => r.left)) + scrollX, y = Math.min(...rs.map(r => r.top)) + scrollY;
    return {
      x: Math.max(0, x - 10), y: Math.max(0, y - 10),
      width: Math.max(...rs.map(r => r.right)) + scrollX - x + 20,
      height: Math.max(...rs.map(r => r.bottom)) + scrollY - y + 20,
    };
  });

  await page.screenshot({ path: `${out}/${file}`, clip: box, fullPage: true });
  await browser.close();
  return picked;
}

const picked = await shoot(1, `${name}-actual.png`);
await shoot(3, `${name}-montage.png`);
console.log(`${picked.length} poster(s): ${picked.join(', ')}`);
console.log(`${out}/${name}-actual.png    true size, where a speck or a dim track shows`);
console.log(`${out}/${name}-montage.png   3x, where composition shows`);
console.log('Open BOTH. A poster that reads well only in the montage is a poster nobody can read.');
