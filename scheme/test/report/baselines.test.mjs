// Catalog-wide baselines card records would otherwise quote (reading pace, long-narration cohort,
// duration shape, still-step population, bibliography), plus a scan of record lines still quoting one.
// Fails only on the census (S-46). Browser-only baselines live in the card-review tools.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, CATALOG_BASELINE, cards, schemes, recordFiles } from '../fixtures/catalog.mjs';
import { importAll } from '../fixtures/module.mjs';

const CATS = ['cluster', 'workloads', 'network', 'storage'];
const SCHEMES = join(ROOT, 'js', 'schemes');

// Copied from card-review/tools/timing.mjs on purpose, so a rank there and a median here share one population.
const PACE_RE = /duration:\s*(\d+),\s*\n\s*narration:\s*'((?:[^'\\]|\\.)*)'/g;

const paceRows = [];
for (const cat of readdirSync(SCHEMES)) {
  const dir = join(SCHEMES, cat);
  if (!statSync(dir).isDirectory()) continue;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.js') || f.includes('kit') || f === 'cards.js' || f === 'posters.js') continue;
    const src = readFileSync(join(dir, f), 'utf8');
    let m;
    PACE_RE.lastIndex = 0;
    while ((m = PACE_RE.exec(src))) {
      paceRows.push({ card: f.replace(/\.js$/, ''), cat, ms: +m[1], len: m[2].length });
    }
  }
}

const pace = (r) => r.ms / r.len;
const quantile = (sorted, q) => (sorted.length ? pace(sorted[Math.floor(sorted.length * q)]) : 0);
const byPace = [...paceRows].sort((a, b) => pace(a) - pace(b));

const modules = await importAll();
const catalogued = await cards();

// A step with no flow entry registers no animation (M-27).
let narrated = 0;
let noFlow = 0;
for (const ns of modules.values()) {
  for (const s of ns.STEPS_SPEC || []) {
    if (!s.narration) continue;
    narrated++;
    if (!(s.flow && s.flow.length)) noFlow++;
  }
}

// Durations split by whether the step moves, per category. Whole run includes the poster step.
const shape = new Map(CATS.map(c => [c, { still: [], moving: [], runs: [] }]));
for (const [id, ns] of modules) {
  const cat = CATS.find(c => id.startsWith(`${c}-`));
  if (!cat) continue;
  let run = 0;
  for (const s of ns.STEPS_SPEC || []) {
    run += s.duration || 0;
    if (!s.narration) continue;
    (s.flow && s.flow.length ? shape.get(cat).moving : shape.get(cat).still).push(s.duration || 0);
  }
  shape.get(cat).runs.push({ id, run });
}
const mean = (a) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0);
const mid = (a) => (a.length ? [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] : 0);

const hrefs = new Set();
for (const s of await schemes()) for (const src of s.sources || []) hrefs.add(src.href);

// The scan: a catalog noun or word beside DIGITS. A pointer to the home carries no number and never
// matches, and a card measuring its own box does not either.
const NUM = String.raw`\d[\d.,]*`;
const CLASSES = [
  ['population', new RegExp(String.raw`\b(?:of|over)\s+(?:the\s+|all\s+|that\s+)?\d{3}\s+(?:narrated\s+)?(?:steps|balls|cards|card scenes)\b|\bcatalogue's\s+\d{3}\b|\b(?:of|over)\s+that\s+\d{3}\b`)],
  ['rank', /\brank(?:s|ed)?\s+(?:about\s+)?\d+(?:\s*(?:to|and)\s*\d+)?\b|\b\d+(?:st|nd|rd|th)\s+of\s+(?:the\s+)?\d{3}\b/],
  ['median', new RegExp(
    String.raw`\b(?:catalog|catalogue|category|cluster|control-plane)\s+(?:median|maximum|minimum|average)[^.]{0,30}?${NUM}` + '|' +
    String.raw`\bmedian\s+(?:ball|still|reading|first)[^.]{0,30}?${NUM}` + '|' +
    String.raw`\bagainst\s+a\s+(?:catalog(?:ue)?\s+)?median\s+of\s+${NUM}` + '|' +
    String.raw`\ba\s+median\s+of\s+${NUM}`)],
  ['percentile', new RegExp(String.raw`\bpercentile[^.]{0,30}?${NUM}|\b\d+(?:st|nd|rd|th)\s+percentile\b`)],
  ['floor-bound share', /\b\d{3}\s+of\s+(?:the\s+)?\d{3}\s+balls\b|\bfloor-bound,?\s+on\s+\d+\s+(?:of\s+the\s+)?cards\b/],
];

const scan = new Map(CATS.map(c => [c, []]));
for (const c of CATS) {
  // Every record document, so a split category is not a clean zero over a preamble.
  for (const f of recordFiles(c)) {
    const lines = readFileSync(join(ROOT, f.rel), 'utf8').split('\n');
    let card = '(record preamble)';
    lines.forEach((line, i) => {
      const h = /^## ([a-z-]+)$/.exec(line);
      if (h) { card = h[1]; return; }
      for (const [cls, re] of CLASSES) {
        if (re.test(line)) { scan.get(c).push({ card, cls, n: i + 1, text: line.trim() }); return; }
      }
    });
  }
}

test('BASELINES the catalog-wide numbers, computed once so no record has to carry them', () => {
  const out = [];
  const p = (s = '') => out.push(s);

  p('===== CATALOG BASELINES, REPORT ONLY =====');
  p('  A record explains ONE card. The population a measurement was ranked against, and the median');
  p('  it was compared to, belong to the CATALOG: they stop being true when anybody adds a card');
  p('  anywhere. This file is their one executing home. Quote it, do not copy it.');
  p();

  p('  1. READING PACE, ms per narration character');
  p(`     population   ${byPace.length} narrated steps over ${new Set(paceRows.map(r => r.card)).size} cards`);
  p(`     median       ${quantile(byPace, 0.50).toFixed(2)}`);
  p(`     p10 / p75    ${quantile(byPace, 0.10).toFixed(2)} / ${quantile(byPace, 0.75).toFixed(2)}`);
  p(`     fastest      ${pace(byPace[0]).toFixed(2)} (${byPace[0].card})`);
  p(`     slowest      ${pace(byPace[byPace.length - 1]).toFixed(2)} (${byPace[byPace.length - 1].card})`);
  p('     per category, median and population:');
  for (const c of CATS) {
    const s = byPace.filter(r => r.cat === c);
    p(`       ${c.padEnd(10)} ${quantile(s, 0.50).toFixed(2)}   over ${String(s.length).padStart(3)} steps`);
  }
  p('     Rank a step with `.claude/skills/card-review/tools/timing.mjs <card-id>`, which reads the');
  p('     same population with the same regex.');
  p();

  const long = byPace.filter(r => r.len >= 290);
  p('  2. THE LONG-NARRATION COHORT, 290 characters or more');
  p(`     population   ${long.length} steps`);
  p(`     median       ${quantile(long, 0.50).toFixed(2)}`);
  p(`     p75          ${quantile(long, 0.75).toFixed(2)}`);
  p('     A long narration is read faster per character, so a long step measured against the');
  p('     catalog median above reads as generous when it is ordinary. This is its yardstick.');
  p();

  p('  3. DURATION SHAPE PER CATEGORY, the yardstick a card picks its own holds against');
  p('     still = the step registers no animation, moving = it carries at least one `flow` entry.');
  p('     category    still avg / n     moving avg / n    whole run median / mean');
  for (const c of CATS) {
    const v = shape.get(c);
    const runs = v.runs.map(r => r.run);
    p(`       ${c.padEnd(10)} ${String(mean(v.still)).padStart(5)} / ${String(v.still.length).padStart(3)}` +
      `      ${String(mean(v.moving)).padStart(5)} / ${String(v.moving.length).padStart(3)}` +
      `        ${String(mid(runs)).padStart(6)} / ${String(mean(runs)).padStart(6)}`);
  }
  p('     A card ranked inside its own category asks this table, not the catalog median above: a');
  p('     catalog figure is dominated by whichever category is largest.');
  p();

  p('  4. STILL TIME');
  p(`     population   ${narrated} narrated steps on ${modules.size} cards`);
  p('     median still time and median percent-of-step are NOT computed here: still time is a WAAPI');
  p('     span and needs a browser. Their home is');
  p('     `.claude/skills/card-review/tools/deadair.mjs`, which prints both beside every step of a');
  p('     card. A second copy here is the defect this file exists to remove.');
  p();

  p('  5. STEPS THAT REGISTER NO ANIMATION (the `M-27` population)');
  p(`     ${noFlow} of ${narrated} narrated steps carry no \`flow\` entry at all.`);
  p();

  p('  6. BIBLIOGRAPHY');
  p(`     ${hrefs.size} unique hrefs over ${catalogued.length} cards.`);
  p();

  p('  BALL SPEED IS NOT HERE. The ball population, the ball median and the floor-bound share come');
  p('  from `.claude/skills/card-review/tools/pace.mjs`, because a lane length is a rendered path');
  p('  length and needs a browser. That probe is their one home.');
  p();

  p('  7. RECORD LINES STILL QUOTING A CATALOG-WIDE QUANTITY');
  p('     A record carrying one of these owes a maintenance debt: the number goes stale when a card');
  p('     lands in ANY category, and nothing reports it. The target is zero per record.');
  p();
  for (const c of CATS) {
    const rows = scan.get(c);
    const byClass = {};
    for (const r of rows) byClass[r.cls] = (byClass[r.cls] || 0) + 1;
    const cardsHit = new Set(rows.map(r => r.card)).size;
    const summary = Object.entries(byClass).map(([k, v]) => `${k} ${v}`).join(', ');
    p(`     ${c.padEnd(10)} ${String(rows.length).padStart(3)} line(s) on ${cardsHit} card(s)` +
      (summary ? `  (${summary})` : ''));
  }
  p();
  const clean = CATS.filter(c => scan.get(c).length === 0);
  if (clean.length) p(`     AT ZERO: ${clean.join(', ')}.`);
  const dirty = CATS.filter(c => scan.get(c).length > 0);
  if (dirty.length) {
    p(`     STILL CARRYING THEM: ${dirty.join(', ')}. THIS IS A QUEUE, NOT A DEFECT LIST. Those`);
    p('     records were written before this file existed and every number in them was true when it');
    p('     was typed. They are converted one record at a time, deliberately, because the conversion');
    p('     is a prose edit and a mass regex over prose is what the root `CLAUDE.md` records as');
    p('     having cost this project four defects in one session.');
    for (const c of dirty) {
      const rows = scan.get(c);
      const perCard = new Map();
      for (const r of rows) perCard.set(r.card, (perCard.get(r.card) || 0) + 1);
      p();
      p(`     ${c}, worst first:`);
      for (const [card, n] of [...perCard.entries()].sort((a, b) => b[1] - a[1])) {
        p(`       ${String(n).padStart(3)}  ${card}`);
      }
    }
  }
  p();
  p('===== end of report =====');

  console.log(out.join('\n'));

  // A one-category walk looks like a small catalog (S-46).
  assert.equal(catalogued.length, CATALOG_BASELINE.cards,
    `read ${catalogued.length} card(s), the baseline is ${CATALOG_BASELINE.cards}`);
  assert.ok(byPace.length > 0 && narrated > 0,
    `read ${byPace.length} paced step(s) and ${narrated} narrated step(s): a baseline over nothing ` +
    'is a clean-looking page that measured no catalog at all.');
  assert.equal(scan.size, CATS.length,
    `scanned ${scan.size} record(s), expected ${CATS.length}`);
});
