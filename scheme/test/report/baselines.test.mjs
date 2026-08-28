// baselines.test.mjs: the CATALOG-WIDE numbers a card record keeps quoting, computed in one place
// so no record has to carry a copy of them.
//
// ===========================================================================================
// WHY THIS FILE EXISTS
// ===========================================================================================
// A card record is written to explain ONE card: why a width is what it is, which alternative was
// measured and fails, what a number is floored by. Alongside those, records grew a second kind of
// number: the population a measurement was ranked against, and the catalog median it was compared
// to. `9.60 ms per character` belongs to the card and stays true until that card's narration is
// edited. `rank 235 of 590` belongs to the CATALOG and stops being true the moment anybody adds a
// card anywhere, including in another category.
//
// That second kind is O(n) coupling written into prose. One card landing in `cluster/` in August
// invalidated 37 numbers across 15 cluster records, and the same card moved every population in the
// other three records too. The repository already has the rule that answers this, in the root
// `CLAUDE.md`: A COUNT THAT HAS ONE EXECUTING HOME IS STATED ONLY THERE. The number of checks the
// suite runs is read out of `package.json` and no document repeats it. This file is that home for
// the pacing and motion baselines, and `js/schemes/cluster/CARDS.md` is the first record to stop
// repeating them.
//
// ===========================================================================================
// WHAT IT PRINTS, AND WHERE EACH NUMBER IS MEASURED
// ===========================================================================================
// Section 1  THE READING-PACE BASELINE. Population, median, tenth and seventy-fifth percentile of
//            `duration / narration.length`, over every narrated step in the catalog, plus the same
//            median per category. Read off the SOURCES with the identical regex
//            `.claude/skills/card-review/tools/timing.mjs` uses, so a rank quoted from that probe
//            and a population quoted from here are the same population by construction.
// Section 2  THE LONG-NARRATION COHORT, steps of 290 characters or more. A long narration is read
//            faster per character, so the catalog median is the wrong yardstick for a long step and
//            this cohort is the right one. Size, median, p75.
// Section 3  DURATION SHAPE PER CATEGORY: still and moving averages, and the whole-run median and
//            mean. A card picks its holds against its OWN category, so this is the yardstick its
//            record needs, and a catalog figure is dominated by whichever category is largest.
// Section 4  THE STILL-TIME POPULATION. Only the population is computed here, off the specs.
//            THE MEDIANS ARE NOT: still time is a WAAPI span, so it needs a browser, and
//            `.claude/skills/card-review/tools/deadair.mjs` is the home for the still-time median
//            and the percent-of-step median. Printing a second copy here would be the exact defect
//            this file exists to remove.
// Section 5  STEPS THAT REGISTER NO ANIMATION, the `M-27` population, computed off `flow`.
// Section 6  THE BIBLIOGRAPHY, unique hrefs over the four `cards.js`.
// Section 7  THE SCAN. Which record lines still quote a catalog-wide population, median or rank.
//
// BALL SPEED IS DELIBERATELY ABSENT. The ball population, the ball median and the floor-bound count
// are printed by `.claude/skills/card-review/tools/pace.mjs`, and they cannot be computed here: a
// lane length is the rendered path length, which needs a browser. `pace.mjs` is their one home, and
// a record that needs a ball rank sends the reader there rather than storing the answer.
//
// ===========================================================================================
// WHAT THIS FILE IS BLIND TO
// ===========================================================================================
//   - Anything needing a browser: still-time medians, ball speeds, panel extents, poster bbox
//     coverage. Their homes are `deadair.mjs`, `pace.mjs`, `report/overlay.test.mjs` and
//     `.claude/skills/card-poster/tools/poster-lint.mjs`.
//   - A step whose `duration` and `narration` are not written as adjacent literals. The regex is
//     the timing probe's regex, and a card that computed either would be invisible to BOTH. No card
//     does today, and `unit/spec-steps.test.mjs` reads the real step count off the data, so a
//     divergence between that count and section 1 is what would say so.
//   - WHETHER A QUOTED NUMBER IS RIGHT. Section 7 finds lines that SPELL a catalog-wide quantity.
//     It cannot tell a stale 575 from a fresh 580, and it is not trying to: the point is that a
//     record should carry neither.
//   - Prose that states a population in words with no digits.
//
// ===========================================================================================
// WHAT FAILS HERE
// ===========================================================================================
// The census, and nothing else. A report that walked half the catalog prints half the population
// and looks exactly like a smaller catalog, so the walk is asserted against `CATALOG_BASELINE`
// (`S-46`). No finding in section 7 ever fails: a record that still quotes these numbers is a
// queue, not a defect, and the output names it as a queue.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, CATALOG_BASELINE, cards, schemes, recordFiles } from '../fixtures/catalog.mjs';
import { importAll } from '../fixtures/module.mjs';

const CATS = ['cluster', 'workloads', 'network', 'storage'];
const SCHEMES = join(ROOT, 'js', 'schemes');

// The timing probe's own regex, copied deliberately rather than shared: the probe is a skill tool
// outside the harness, and a record quoting one of its ranks has to be able to trust that the
// population under the rank and the population under this median were read the same way. If the two
// ever diverge, the divergence is the finding.
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

// Narrated steps and the M-27 population, off the DATA rather than off the source text. A step with
// no `flow` entry registers no animation at all, which is what `M-27` allows and what a record
// means when it calls a step still by construction.
let narrated = 0;
let noFlow = 0;
for (const ns of modules.values()) {
  for (const s of ns.STEPS_SPEC || []) {
    if (!s.narration) continue;
    narrated++;
    if (!(s.flow && s.flow.length)) noFlow++;
  }
}

// `cards()` is the file view and carries no `sources`, so the bibliography comes off the catalog
// entries themselves.
// Per-category duration shape. A card's durations are picked against what its OWN category runs at,
// not against the catalog: `cluster-pod-priority-preemption` aligns step by step to the cluster
// averages and its record says why. Split by whether the step MOVES, because the two populations
// sit hundreds of ms apart and averaging across them describes neither.
// Whole run is the sum of every step's duration, the poster step included, which is what a reader
// actually sits through.
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

// ---------------------------------------------------------------------------------------------
// SECTION 6: what still quotes a catalog-wide quantity.
//
// Each pattern names ONE class of coupling, so the output can say which class a line belongs to
// rather than just that it matched something. A line may hit more than one; it is reported once,
// under the first class that claims it, and the classes are ordered most specific first.
// ---------------------------------------------------------------------------------------------
// THE DIGITS ARE THE FINDING, and that single rule is what keeps this queue honest in both
// directions.
//
// A line that NAMES a catalog quantity without a number is pointing at its home, which is the whole
// repair: `under the catalog median (report/baselines.test.mjs prints it)` carries no debt, because
// nothing in it can go stale. A line that SPELLS the number has taken a copy, and the copy dies the
// next time a card lands anywhere. So every pattern below requires digits beside the catalog word,
// and a pointer never matches. `cluster-pod-sandbox-cri` wrote that pointer form before this file
// existed, and it is the shape the rest of the record is converted to.
//
// The patterns are narrow for the other direction too. `157 of the 300 the container box is wide`
// is a card measuring its own box, so a bare number pair is not enough: a CATALOG NOUN (`steps`,
// `balls`, `cards`, `card scenes`) or a catalog WORD (`catalog median`, `percentile`) has to stand
// beside the digits. A queue that fills with a card's own measurements stops being read, and then
// the real entries drown.
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
  // A record is one document or many (`recordFiles`), and the scan has to cover every one of them:
  // reading only `CARDS.md` in a split category would report a clean zero over a preamble.
  for (const f of recordFiles(c)) {
    const lines = readFileSync(join(ROOT, f.rel), 'utf8').split('\n');
    // A hit before the first `## <card-id>` is in the record's own preamble, which is a real place
    // for one: the shared how-to-read block is written once per record and quotes the catalog too.
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

  // The walk, and nothing else. A file that read one category prints a small population and looks
  // exactly like a small catalog, which is the failure `S-46` names.
  assert.equal(catalogued.length, CATALOG_BASELINE.cards,
    `read ${catalogued.length} card(s), the baseline is ${CATALOG_BASELINE.cards}`);
  assert.ok(byPace.length > 0 && narrated > 0,
    `read ${byPace.length} paced step(s) and ${narrated} narrated step(s): a baseline over nothing ` +
    'is a clean-looking page that measured no catalog at all.');
  assert.equal(scan.size, CATS.length,
    `scanned ${scan.size} record(s), expected ${CATS.length}`);
});
