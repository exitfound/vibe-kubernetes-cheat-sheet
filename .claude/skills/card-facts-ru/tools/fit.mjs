#!/usr/bin/env node
// fit.mjs: rendered text lines of every /diagrams/ card desc, EN beside RU, per width. --chunk=[{ id, en, ru }] stands in for js/lang/ru.js, --try=[{ id, ru: [...] }] measures variants in place.
// usage: cd diagrams/test && node ../../.claude/skills/card-facts-ru/tools/fit.mjs [--chunk=FILE | --try=FILE [--lang=en]] [--tail=0.35] [--lines=4] [--only=id,id] [--widths=1440,1100,390] [--json]
// Band: the EN at its 3rd and 97th percentile. --tail lists an EN or RU desc whose last line fills less than that share (`row`: it alone sets its row height), --lines=N one of any other line count (D-04: --widths=1920 --lines=4 --tail=0.75).
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch, DEFAULT_BASE } from '../../../../diagrams/test/fixtures/render.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../../diagrams');
const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, v = 'true'] = a.slice(2).split('='); return [k, v];
}));
const base = (flags.base || DEFAULT_BASE).replace(/\/$/, '');
const widths = (flags.widths || '1440,1100,390').split(',').map(Number);
const only = flags.only ? new Set(flags.only.split(',')) : null;

const { RU } = await import(pathToFileURL(join(ROOT, 'js', 'lang', 'ru.js')).href);
const map = { ...RU };
if (flags.chunk) for (const e of JSON.parse(readFileSync(flags.chunk, 'utf8'))) map[e.en] = e.ru;
const module = `export const RU = ${JSON.stringify(map)};\n`;

async function lines(browser, width, lang) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  await ctx.addInitScript(l => {
    try {
      localStorage.setItem('kube-how:diagram-view:v1', 'full');
      if (l === 'ru') localStorage.setItem('kube-how:lang:v1', 'ru'); else localStorage.removeItem('kube-how:lang:v1');
    } catch (_) {}
  }, lang);
  const page = await ctx.newPage();
  await page.route('**/diagrams/js/lang/ru.js*', r => r.fulfill({ contentType: 'text/javascript', body: module }));
  await page.goto(`${base}/diagrams/`);
  await page.waitForSelector('.card-desc');
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.waitForTimeout(500);
  // The desc box is `flex: 1` and stretches to its row, so count the text lines, never the box.
  const out = await page.$$eval('.card', cards => cards.map(c => {
    const d = c.querySelector('.card-desc');
    const range = document.createRange();
    range.selectNodeContents(d);
    const rects = [...range.getClientRects()].filter(r => r.width > 0);
    const byTop = new Map();
    for (const r of rects) byTop.set(Math.round(r.top), (byTop.get(Math.round(r.top)) || 0) + r.width);
    const last = Math.max(...byTop.keys());
    return [c.dataset.id, { n: byTop.size, tail: byTop.get(last) / d.clientWidth, row: Math.round(c.getBoundingClientRect().top + scrollY) }];
  }));
  await ctx.close();
  // The tallest desc of each grid row sets the row height.
  const rowMax = new Map();
  for (const [, v] of out) rowMax.set(v.row, Math.max(rowMax.get(v.row) || 0, v.n));
  const rowCount = new Map();
  for (const [, v] of out) if (v.n === rowMax.get(v.row)) rowCount.set(v.row, (rowCount.get(v.row) || 0) + 1);
  for (const [, v] of out) v.alone = v.n === rowMax.get(v.row) && rowCount.get(v.row) === 1 && out.some(([, o]) => o.row === v.row && o.n < v.n);
  return new Map(out);
}

const browser = await launch();
// --try=FILE takes [{ id, ru: [variant, ...] }] and measures each variant in place, one page per width (--lang=en: English font).
if (flags.try) {
  const tries = JSON.parse(readFileSync(flags.try, 'utf8'));
  const rows = tries.flatMap(t => t.ru.map((v, i) => ({ id: t.id, i, len: v.length, at: {} })));
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    await ctx.addInitScript(l => { try { localStorage.setItem('kube-how:diagram-view:v1', 'full'); if (l === 'ru') localStorage.setItem('kube-how:lang:v1', 'ru'); } catch (_) {} }, flags.lang || 'ru');
    const page = await ctx.newPage();
    await page.goto(`${base}/diagrams/`);
    await page.waitForSelector('.card-desc');
    await page.evaluate(() => document.fonts.ready.then(() => true));
    const got = await page.evaluate(ts => ts.flatMap(t => t.ru.map(v => {
      const d = document.querySelector(`.card[data-id="${t.id}"] .card-desc`);
      d.textContent = v;
      const range = document.createRange();
      range.selectNodeContents(d);
      const byTop = new Map();
      for (const r of [...range.getClientRects()].filter(r => r.width > 0)) byTop.set(Math.round(r.top), (byTop.get(Math.round(r.top)) || 0) + r.width);
      return { n: byTop.size, tail: Math.round(byTop.get(Math.max(...byTop.keys())) / d.clientWidth * 100) };
    })), tries);
    got.forEach((g, k) => { rows[k].at[w] = g; });
    await ctx.close();
  }
  await browser.close();
  for (const r of rows) console.log(`${r.id} #${r.i} (${r.len})  ` + widths.map(w => `${w}: ${r.at[w].n} lines, last ${r.at[w].tail}%`).join('  |  '));
  process.exit(0);
}
const report = [];
for (const w of widths) {
  const enFull = await lines(browser, w, 'en');
  const ruFull = await lines(browser, w, 'ru');
  const en = new Map([...enFull].map(([id, v]) => [id, v.n]));
  const ru = new Map([...ruFull].map(([id, v]) => [id, v.n]));
  const tails = flags.tail ? [['EN', enFull], ['RU', ruFull]].flatMap(([lang, full]) => [...full]
    .filter(([id, v]) => (!only || only.has(id)) && v.tail < Number(flags.tail))
    .map(([id, v]) => ({ lang, id, lines: v.n, tail: Math.round(v.tail * 100), alone: v.alone }))) : [];
  const wrong = flags.lines ? [['EN', en], ['RU', ru]].flatMap(([lang, m]) => [...m]
    .filter(([id, n]) => (!only || only.has(id)) && n !== Number(flags.lines)).map(([id, n]) => ({ lang, id, n }))) : [];
  const enVals = [...en.values()].sort((a, b) => a - b);
  const ceiling = enVals[Math.floor(enVals.length * 0.97)], floor = enVals[Math.floor(enVals.length * 0.03)];
  const hist = m => Object.entries([...m.values()].reduce((h, n) => ({ ...h, [n]: (h[n] || 0) + 1 }), {}))
    .map(([n, c]) => `${n}:${c}`).join(' ');
  const over = [], under = [];
  for (const [id, n] of ru) {
    if (only && !only.has(id)) continue;
    if (n > ceiling) over.push({ id, en: en.get(id), ru: n });
    else if (n < floor) under.push({ id, en: en.get(id), ru: n });
  }
  report.push({ width: w, ceiling, floor, en: hist(en), ru: hist(ru), over, under, tails, wrong,
    cards: only ? [...ru].filter(([id]) => only.has(id)).map(([id, n]) => ({ id, en: en.get(id), ru: n })) : undefined });
}
await browser.close();

if (flags.json) { console.log(JSON.stringify(report, null, 2)); process.exit(0); }
let bad = 0;
for (const r of report) {
  console.log(`${r.width}px  EN lines ${r.en}  |  RU lines ${r.ru}  |  band ${r.floor}..${r.ceiling}`);
  for (const c of r.cards || []) console.log(`    ${c.id}  EN ${c.en}  RU ${c.ru}`);
  for (const o of r.over) console.log(`  OVER   ${o.id}  EN ${o.en}  RU ${o.ru}`);
  for (const u of r.under) console.log(`  under  ${u.id}  EN ${u.en}  RU ${u.ru}`);
  for (const t of r.tails) console.log(`  tail   ${t.lang} ${t.id}  ${t.lines} lines, last ${t.tail}%${t.alone ? '  row' : ''}`);
  for (const x of r.wrong) console.log(`  LINES  ${x.lang} ${x.id}  ${x.n} lines, want ${flags.lines}`);
  bad += r.over.length + r.wrong.length;
}
console.log(bad ? `\n${bad} description(s) taller than the English band or off --lines` : '\nevery Russian description fits the English band');
process.exitCode = bad ? 1 : 0;
