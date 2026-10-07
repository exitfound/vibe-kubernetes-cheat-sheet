#!/usr/bin/env node
// timing.mjs: per step, the animated span against the declared duration, the real hold, and narration ms per character ranked catalog-wide.
// usage: cd scheme/test && node ../../.claude/skills/card-review/tools/timing.mjs <card-id> [--base=URL]
// It never subtracts span from duration: run deadair.mjs (`M-19a`) beside it, or the pace reads as an all-clear.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  launch, initPage, openCard, enterStep, stepCount, stepSpan, stepMeta, DEFAULT_BASE,
} from '../../../../scheme/test/fixtures/render.mjs';

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, v = 'true'] = a.slice(2).split('='); return [k, v];
}));
const id = args.find(a => !a.startsWith('--'));
if (!id) { console.error('Usage: node timing.mjs <card-id>'); process.exit(1); }

// The catalog baseline off the sources: every `duration:` immediately followed by a `narration:`.
const SCHEMES = new URL('../../../../scheme/js/schemes/', import.meta.url).pathname;
const rows = [];
for (const cat of readdirSync(SCHEMES)) {
  const dir = join(SCHEMES, cat);
  if (!statSync(dir).isDirectory()) continue;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.js') || f.includes('kit') || f === 'cards.js' || f === 'posters.js') continue;
    const src = readFileSync(join(dir, f), 'utf8');
    const re = /duration:\s*(\d+),\s*\n\s*narration:\s*'((?:[^'\\]|\\.)*)'/g;
    let m;
    while ((m = re.exec(src))) rows.push({ card: f.replace(/\.js$/, ''), ms: +m[1], len: m[2].length });
  }
}
rows.sort((a, b) => a.ms / a.len - b.ms / b.len);
const rankOf = (ms, len) => rows.findIndex(r => r.ms / r.len >= ms / len) + 1;
const median = rows[Math.floor(rows.length / 2)];

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
await ctx.addInitScript(initPage, 'expose');
const page = await ctx.newPage();
await openCard(page, id, (flags.base || DEFAULT_BASE).replace(/\/$/, ''));
const meta = await stepMeta(page);
const n = await stepCount(page);
console.log('idx  id                 span  duration    hold  chars  ms/char  catalog rank');
for (let i = 0; i < n; i++) {
  await enterStep(page, i);
  const span = await stepSpan(page);
  const d = meta[i]?.duration ?? 0;
  const text = meta[i]?.narration || '';
  const hold = Math.max(d, span ? span + 60 : 0);
  const pace = text.length ? (d / text.length) : 0;
  const rank = text.length ? `${rankOf(d, text.length)} of ${rows.length}` : '-';
  const over = span > d ? '  <-- M-19 SPAN>DURATION' : '';
  console.log(
    String(i).padStart(3), (meta[i]?.id || '').padEnd(18),
    String(span).padStart(5), String(d).padStart(9), String(hold).padStart(7),
    String(text.length).padStart(6), pace ? pace.toFixed(2).padStart(8) : '       -',
    ' ', rank, over,
  );
}
console.log(`\ncatalog median ${(median.ms / median.len).toFixed(2)} ms/char over ${rows.length} steps.`);
console.log('Rank 1 is the most hurried step in the catalog. A step with no motion holds exactly its duration.');
await browser.close();
