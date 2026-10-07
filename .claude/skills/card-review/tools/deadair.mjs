#!/usr/bin/env node
// deadair.mjs: how long each step stands still after its own motion ends, ranked against the catalog, beside its reading load.
// usage: cd scheme/test && node ../../.claude/skills/card-review/tools/deadair.mjs <card-id> [--base=URL]
// The rank is spec against spec (understates span), quote milliseconds from the `real` column. Blind to motion inside step.motion or F.run.
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SCHEME = new URL('../../../../scheme/', import.meta.url).pathname;
const { BEAT, routeDur, REVEAL_MS } = await import(`${SCHEME}js/lib/scheme-kit.js`);
const { timelineOf } = await import(`${SCHEME}test/fixtures/spec.mjs`);

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, v = 'true'] = a.slice(2).split('='); return [k, v];
}));
const id = args.find(a => !a.startsWith('--'));
if (!id) { console.error('Usage: node deadair.mjs <card-id> [--base=URL] [--no-browser]'); process.exit(1); }

const kit = { BEAT, routeDur, REVEAL_MS };
// The static span of one step: the latest arrival plus the longest tail, a pulse ringing PULSE_MS after its delay.
const PULSE_MS = 900;
function specSpan(spec) {
  const rows = timelineOf(spec.flow, kit);
  if (!rows) return null;
  let end = 0;
  for (const r of rows) {
    const tail = (r.verb === 'pulse' || r.verb === 'flash') ? PULSE_MS : 0;
    end = Math.max(end, r.arrival + tail);
  }
  return Math.round(end);
}

// The catalog baseline: every narrated step of every card, as { card, step, dur, span, dead, pct }.
const rows = [];
for (const cat of readdirSync(`${SCHEME}js/schemes`)) {
  const dir = join(`${SCHEME}js/schemes`, cat);
  if (!statSync(dir).isDirectory()) continue;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.js') || f.includes('kit') || f === 'cards.js' || f === 'posters.js') continue;
    const mod = await import(join(dir, f));
    for (const spec of mod.STEPS_SPEC || []) {
      if (!spec.narration) continue;                 // the poster holds by design (D-14, S-09)
      const span = specSpan(spec);
      if (span === null) continue;
      const dur = spec.duration || 0;
      rows.push({
        card: f.replace(/\.js$/, ''), step: spec.id, dur, span,
        dead: dur - span, pct: dur ? (dur - span) / dur : 0,
        chars: spec.narration.length, pace: spec.narration.length ? dur / spec.narration.length : 0,
      });
    }
  }
}

const byDead = [...rows].sort((a, b) => a.dead - b.dead);
const byPct = [...rows].sort((a, b) => a.pct - b.pct);
const med = (arr, k) => arr[Math.floor(arr.length / 2)][k];
const rankDead = (v) => byDead.findIndex(r => r.dead >= v) + 1;
const rankPct = (v) => byPct.findIndex(r => r.pct >= v) + 1;
const medPace = [...rows].sort((a, b) => a.pace - b.pace)[Math.floor(rows.length / 2)].pace;

// The live reading, target card only.
let real = null;
if (flags['no-browser'] !== 'true') {
  const {
    launch, initPage, openCard, enterStep, stepCount, stepSpan, stepMeta, DEFAULT_BASE,
  } = await import(`${SCHEME}test/fixtures/render.mjs`);
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  await ctx.addInitScript(initPage, 'expose');
  const page = await ctx.newPage();
  await openCard(page, id, (flags.base || DEFAULT_BASE).replace(/\/$/, ''));
  const meta = await stepMeta(page);
  const n = await stepCount(page);
  real = [];
  for (let i = 0; i < n; i++) {
    await enterStep(page, i);
    real.push({ id: meta[i]?.id || '', span: await stepSpan(page), dur: meta[i]?.duration ?? 0 });
  }
  await browser.close();
}

const mine = rows.filter(r => r.card === id);
if (!mine.length) { console.error(`no narrated steps found for ${id}`); process.exit(1); }

console.log(`=== ${id} === still time after the motion ends\n`);
console.log('step                dur   span  spanR   DEAD  DEADr   %still  rank(ms)  chars  ms/char  pace rank');
for (const r of mine) {
  const live = real && real.find(x => x.id === r.step);
  const deadR = live ? live.dur - live.span : null;
  const pace = r.pace;
  const paceRank = [...rows].sort((a, b) => a.pace - b.pace).findIndex(x => x.pace >= pace) + 1;
  console.log(
    r.step.padEnd(18),
    String(r.dur).padStart(5), String(r.span).padStart(6),
    String(live ? live.span : '-').padStart(6),
    String(r.dead).padStart(6), String(deadR == null ? '-' : deadR).padStart(6),
    `${(r.pct * 100).toFixed(0)}%`.padStart(8),
    `${rankDead(r.dead)} of ${rows.length}`.padStart(10),
    String(r.chars).padStart(6), pace.toFixed(2).padStart(8),
    `  ${paceRank} of ${rows.length}`,
  );
}

console.log(`\ncatalog: ${rows.length} narrated steps on ${new Set(rows.map(r => r.card)).size} cards.`);
console.log(`         median still time ${med(byDead, 'dead')}ms, median ${(med(byPct, 'pct') * 100).toFixed(0)}% of the step.`);
console.log(`         median reading pace ${medPace.toFixed(2)} ms per character.`);
console.log(`         rank 1 is the LEAST still step in the catalog, ${rows.length} the most.`);
console.log(`\nspan is the SPEC lower bound (no ripple, no packet fade, no pulse tail past ${PULSE_MS}ms),`);
console.log('spanR the live WAAPI reading. Rank is spec against spec. Quote DEADr in a finding.');
console.log('\nA HIGH rank is not a defect by itself: still time is the price of a long narration.');
console.log('It is a finding when the step is high HERE and also slow on ms/char, which means the');
console.log('hold is not buying reading time either. Then the fix is the NARRATION or the motion,');
console.log('never the duration alone (M-19 still has to hold).');
