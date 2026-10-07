#!/usr/bin/env node
// pace.mjs: how fast every ball on a card moves (units per ms), ranked against the catalog and same-length siblings.
// usage: cd scheme/test && node ../../.claude/skills/card-review/tools/pace.mjs <card-id>
// Short lanes clamp to PKT_DUR_MIN and crawl (`M-13`), so read the siblings column first. Blind to motion inside step.motion or F.run.
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SCHEME = new URL('../../../../scheme/', import.meta.url).pathname;
const { BEAT, routeDur, routeLength, REVEAL_MS } = await import(`${SCHEME}js/lib/scheme-kit.js`);
const { timelineOf } = await import(`${SCHEME}test/fixtures/spec.mjs`);

const id = process.argv.slice(2).find(a => !a.startsWith('--'));
if (!id) { console.error('Usage: node pace.mjs <card-id>'); process.exit(1); }

const CANON_SPEED = 0.45;                 // PKT_SPEED, lib/scheme-kit.js
const kit = { BEAT, routeDur, REVEAL_MS };

// Every ball in the catalog. `top` is included because topPacket's fixed HOP_MS hits the same floor.
const rows = [];
for (const cat of readdirSync(`${SCHEME}js/schemes`)) {
  const dir = join(`${SCHEME}js/schemes`, cat);
  if (!statSync(dir).isDirectory()) continue;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.js') || f.includes('kit') || f === 'cards.js' || f === 'posters.js') continue;
    const mod = await import(join(dir, f));
    for (const spec of mod.STEPS_SPEC || []) {
      const timeline = timelineOf(spec.flow, kit);
      if (!timeline) continue;
      for (const r of timeline) {
        const p = r.p;
        let points = null;
        if (r.verb === 'route') points = p.points;
        else if (r.verb === 'segment') points = [p.from, p.to];
        else if (r.verb === 'top') points = [[p.from, p.y || 0], [p.to, p.y || 0]];
        if (!points) continue;
        const len = routeLength(points);
        const dur = p.dur != null ? p.dur : (r.verb === 'top' ? 700 : routeDur(points));
        rows.push({
          card: f.replace(/\.js$/, ''), step: spec.id, verb: r.verb, name: p.name || '',
          len: +len.toFixed(1), dur, speed: len / dur, explicit: p.dur != null,
        });
      }
    }
  }
}

const bySpeed = [...rows].sort((a, b) => a.speed - b.speed);
const median = bySpeed[Math.floor(bySpeed.length / 2)].speed;
const bound = rows.filter(r => !r.explicit && r.len / CANON_SPEED < r.dur);
const cardsBound = new Set(bound.map(r => r.card)).size;
const mine = rows.filter(r => r.card === id);
if (!mine.length) { console.error(`no balls found on ${id} (or its flow is built in an escape hook)`); }

console.log(`=== ${id} === ball speed against the catalog\n`);
console.log('step             name    length   dur   u/ms   rank      siblings at this length');
for (const r of mine) {
  const rank = bySpeed.findIndex(x => x === r) + 1;
  const same = [...new Set(rows.filter(x => x.card !== id && Math.abs(x.len - r.len) < 0.5).map(x => x.card))];
  const sib = same.length ? `${same.length} card(s): ${same.slice(0, 3).join(', ')}${same.length > 3 ? ' ...' : ''}` : 'NONE, this length is unique';
  console.log(
    `${r.step.padEnd(16)} ${r.name.padEnd(6)} ${String(r.len).padStart(6)} ${String(r.dur).padStart(5)}` +
    ` ${r.speed.toFixed(3).padStart(6)}${r.explicit ? '*' : ' '} ${String(rank + ' of ' + rows.length).padEnd(10)}${sib}`);
}

console.log(`\ncatalog: ${rows.length} balls, median ${median.toFixed(3)} u/ms, canon PKT_SPEED ${CANON_SPEED}.`);
console.log(`         ${bound.length} of them are FLOOR-BOUND on ${cardsBound} of the cards: the length would`);
console.log(`         finish under the 700ms PKT_DUR_MIN, so routeDur clamps and the ball slows (M-13).`);
console.log(`         slowest in the catalog ${bySpeed[0].speed.toFixed(3)} (${bySpeed[0].card} / ${bySpeed[0].step}).`);
console.log('         * marks an explicit dur, which M-12 allows with a justification at the call site.');
console.log('\nRank 1 is the slowest ball in the catalog. READ THE SIBLINGS COLUMN BEFORE FILING ANYTHING:');
console.log('a length other cards also run is the house reading and the answer is M-13, catalog-wide.');
console.log('A length NOTHING else runs, near the bottom of the ranking, is this card on its own.');
