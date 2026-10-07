#!/usr/bin/env node
// Dumps the build frame (before any step, D-14): every element with an inline opacity other than 1.
// node tools/buildframe.mjs <id> | --all --out=DIR [--base=URL]
// Pauses the controller first so the poster auto-play cannot race the read, then reads twice.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { launch, initPage, openCard, discoverIds, DEFAULT_BASE, DIAGRAM } from '../fixtures/render.mjs';

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, v = 'true'] = a.slice(2).split('='); return [k, v];
}));
const positional = args.filter(a => !a.startsWith('--'));
const base = (flags.base || DEFAULT_BASE).replace(/\/$/, '');
const outDir = typeof flags.out === 'string' ? flags.out : null;

if (!positional[0] && !flags.all) {
  console.error('Usage: node tools/buildframe.mjs <id> [--base=URL]');
  console.error('       node tools/buildframe.mjs --all --out=DIR [--base=URL]');
  process.exit(1);
}
if (flags.all && !outDir) {
  console.error('--all needs --out=DIR (a dump per card does not belong on stdout).');
  process.exit(1);
}

const readFrame = (page) => page.evaluate((sel) => {
  const svg = document.querySelector(sel);
  if (!svg) return ['(no diagram)'];
  const out = [];
  [...svg.querySelectorAll('*')].forEach((el, i) => {
    const own = el.style.opacity;
    if (own === '' || own === '1') return;
    const txt = (el.textContent || '').trim().slice(0, 40);
    out.push(`${String(i).padStart(4, '0')} <${el.tagName}> class="${el.getAttribute('class') || ''}" opacity=${own} :: ${txt}`);
  });
  return out;
}, DIAGRAM);

async function dump(ctx, id) {
  const page = await ctx.newPage();
  try {
    await openCard(page, id, base);
    await page.evaluate(() => { const c = window.__schemeCtl; if (c && c.pause) c.pause(); });
    const first = await readFrame(page);
    const second = await readFrame(page);
    const body = first.join('\n') || '(no element carries a non-1 inline opacity)';
    if (first.join('\n') !== second.join('\n')) {
      return `=== ${id} === UNSTABLE: two reads of one frame disagree, the auto-play won the race\n${body}`;
    }
    return `=== ${id} ===\n${body}`;
  } finally {
    await page.close();
  }
}

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
await ctx.addInitScript(initPage, 'expose');
try {
  if (!flags.all) {
    console.log(await dump(ctx, positional[0]));
  } else {
    const page = await ctx.newPage();
    const ids = await discoverIds(page, base);
    await page.close();
    await mkdir(outDir, { recursive: true });
    let unstable = 0;
    for (const id of ids) {
      const text = await dump(ctx, id);
      if (text.includes('UNSTABLE')) unstable++;
      await writeFile(join(outDir, `${id}.txt`), `${text}\n`);
    }
    console.log(`${ids.length} build frames written to ${outDir}${unstable ? `, ${unstable} UNSTABLE` : ''}`);
  }
} finally {
  await browser.close();
}
