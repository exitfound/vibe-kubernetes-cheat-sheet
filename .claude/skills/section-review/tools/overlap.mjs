#!/usr/bin/env node
// overlap.mjs: the three questions about a section that need the WHOLE catalog to answer, no
// browser. What this section teaches that somewhere else also teaches, what it leans on and never
// teaches anywhere, and which card outside it reads more like a member than like its own neighbours.
//
//   node .claude/skills/section-review/tools/overlap.mjs <category>/<section>
//     --min=3     how many cards must lean on a term before it counts as implicit (default 3)
//     --json      the same data as one object
//
// Runs from anywhere. Reads every card in the catalog, so it takes a few seconds rather than one.
//
// WHY THIS EXISTS. A gap found by reading one section is a gap you already suspected. The two
// findings that only a catalog-wide read produces are the DUPLICATE, where two sections cite the
// same upstream page because they teach the same thing twice, and the IMPLICIT TOPIC, where six
// cards say `finalizer` in passing and nothing in the catalog ever explains one. Neither is visible
// from inside the section, and neither needs the network.
//
// WHAT IT IS BLIND TO, and section 3 is the weakest of the three by a wide margin. A signature
// centroid is ONE number on ONE axis: two cards can share a centre and have nothing else in common,
// and a card is reported here as a CANDIDATE for a human to open, never as a misplacement. Section 1
// cannot tell a shared page that means duplication from one that means two cards correctly citing
// the same reference. Section 2 defines "teaches a term" as "carries it in the TITLE", which misses
// a card that teaches a thing under another name. All three are leads, not verdicts.
import { schemes, subcategories, ROOT } from '../../../../scheme/test/fixtures/catalog.mjs';
import { walkStrings, signature, centre, sourcePath, NOT_A_TOPIC } from './bands.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, v = 'true'] = a.slice(2).split('='); return [k, v];
}));
const target = args.find(a => !a.startsWith('--'));
if (!target || !target.includes('/')) {
  console.error('Usage: node overlap.mjs <category>/<section> [--min=3] [--json]');
  process.exit(1);
}
const MIN = Number(flags.min || 3);

// How much nearer this section a card must sit before it is worth naming. The axis is one coarse
// number, so a small margin reports a third of the catalog: at 0.4 control-plane drew seven
// candidates and every one of them was a false lead. 0.9 is most of a band.
const DRIFT_MARGIN = Number(flags.margin || 0.9);

const [cat, sec] = target.split('/');
const SUBS = await subcategories();
if (!SUBS[cat]) { console.error(`unknown category "${cat}". Known: ${Object.keys(SUBS).join(', ')}`); process.exit(1); }
if (!SUBS[cat].some(s => s.key === sec)) {
  console.error(`unknown section "${sec}" in ${cat}. Known: ${SUBS[cat].map(s => s.key).join(', ')}`);
  process.exit(1);
}

const ALL = await schemes();
const label = (k) => Object.values(SUBS).flat().find(s => s.key === k)?.label || k;

// The curated domain vocabulary, taken from the harness rather than invented: `terms.json` is the
// dictionary `T-06` holds narration to, so its keys are exactly the words this project has decided
// are technical terms. Nothing here needs a second list.
const TERMS = JSON.parse(readFileSync(join(ROOT, 'test', 'fixtures', 'terms.json'), 'utf8'));
const VOCAB = [...Object.keys(TERMS.hard || {}), ...Object.keys(TERMS.hardLower || {}), ...Object.keys(TERMS.soft || {})]
  .filter(t => !NOT_A_TOPIC.has(t));

const esc = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rx = t => new RegExp(`(?<![\\w-])${esc(t)}s?(?![\\w-])`, 'i');

// Every card read once. Everything below is a projection of this list.
const cards = [];
for (const e of ALL) {
  const rel = join('js', 'schemes', e.category, `${e.id}.js`);
  const ns = await import(pathToFileURL(join(ROOT, rel)).href);
  const steps = Array.isArray(ns.STEPS_SPEC) ? ns.STEPS_SPEC : [];
  const text = [e.desc, ...steps.flatMap(s => walkStrings(s)), ...walkStrings(ns.SCENE || {})].join('\n');
  const sig = signature(text);
  cards.push({
    id: e.id, title: e.title, category: e.category, subcategory: e.subcategory,
    sources: (e.sources || []).map(s => sourcePath(s.href)),
    text, centre: centre(sig),
  });
}

const mine = cards.filter(c => c.subcategory === sec);
const others = cards.filter(c => c.subcategory !== sec);
const out = { section: `${cat}/${sec}`, count: mine.length, shared: [], implicit: [], drift: [] };

// ---- 1. pages this section shares with another section ---------------------------------------
const bySource = new Map();
for (const c of cards) for (const p of c.sources) {
  if (!bySource.has(p)) bySource.set(p, []);
  bySource.get(p).push(c);
}
for (const [page, list] of bySource) {
  const here = list.filter(c => c.subcategory === sec);
  const away = list.filter(c => c.subcategory !== sec);
  if (here.length && away.length) {
    out.shared.push({ page, here: here.map(c => c.id), away: away.map(c => `${c.id} (${c.subcategory})`) });
  }
}
out.shared.sort((a, b) => (b.here.length + b.away.length) - (a.here.length + a.away.length));

// ---- 2. terms this section leans on that no card anywhere owns --------------------------------
// "Owns" means the term is in a card TITLE. A card whose title carries the word is the card a
// reader lands on when they want to know what it is, which is the whole question being asked.
for (const term of VOCAB) {
  const re = rx(term);
  const leaners = mine.filter(c => re.test(c.text));
  if (leaners.length < MIN) continue;
  const owner = cards.find(c => re.test(c.title));
  if (owner) continue;
  out.implicit.push({ term, cards: leaners.length, ids: leaners.map(c => c.id) });
}
out.implicit.sort((a, b) => b.cards - a.cards);

// ---- 3. cards elsewhere whose centre sits nearer this section than their own ------------------
// ONE number on ONE axis, and the weakest signal in this file. It is here because it costs nothing
// and because the one thing it is good at, a card sitting a whole band away from its neighbours,
// is exactly the thing a reader of one section cannot see.
const mean = (list) => {
  const vals = list.map(c => c.centre).filter(v => v !== null);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
};
const myMean = mean(mine);
const meanBySec = new Map();
for (const c of cards) {
  if (!meanBySec.has(c.subcategory)) meanBySec.set(c.subcategory, mean(cards.filter(x => x.subcategory === c.subcategory)));
}
if (myMean !== null) {
  for (const c of others) {
    if (c.centre === null) continue;
    const own = meanBySec.get(c.subcategory);
    if (own === null) continue;
    const dHere = Math.abs(c.centre - myMean);
    const dOwn = Math.abs(c.centre - own);
    if (dHere + DRIFT_MARGIN < dOwn) out.drift.push({ id: c.id, from: c.subcategory, centre: c.centre, dHere, dOwn });
  }
}
out.drift.sort((a, b) => (a.dOwn - a.dHere) - (b.dOwn - b.dHere)).reverse();

if (flags.json) { console.log(JSON.stringify(out, null, 2)); process.exit(0); }

const pad = (v, n) => String(v).padEnd(n);
console.log(`\n${cat}/${sec}  "${label(sec)}"  ${mine.length} cards, read against all ${cards.length}`);

console.log(`\n1. UPSTREAM PAGES THIS SECTION SHARES WITH ANOTHER  (${out.shared.length})`);
console.log('   A shared page is a lead. Two cards may cite one reference honestly, or teach it twice.');
if (!out.shared.length) console.log('   none');
for (const s of out.shared) {
  console.log(`   ${s.page}`);
  console.log(`     here: ${s.here.join(', ')}`);
  console.log(`     away: ${s.away.join(', ')}`);
}

console.log(`\n2. TERMS ${MIN} OR MORE CARDS HERE LEAN ON, AND NO CARD TITLE OWNS  (${out.implicit.length})`);
console.log('   Each is a candidate topic. Some are correctly assumed knowledge: say which and why.');
if (!out.implicit.length) console.log('   none');
for (const t of out.implicit) console.log(`   ${pad(t.term, 26)}${String(t.cards).padStart(2)} cards   ${t.ids.slice(0, 4).join(', ')}${t.ids.length > 4 ? ', ...' : ''}`);

console.log(`\n3. CARDS ELSEWHERE WHOSE SIGNATURE SITS NEARER THIS SECTION  (${out.drift.length})`);
console.log(`   Section centre ${myMean === null ? 'n/a' : myMean.toFixed(2)}. One number on one axis: open each before believing it.`);
if (!out.drift.length) console.log('   none');
for (const d of out.drift) {
  console.log(`   ${pad(d.id, 42)}${d.centre.toFixed(1)}  here ${d.dHere.toFixed(2)} vs own ${d.dOwn.toFixed(2)}  (${d.from})`);
}
console.log('\nAll three sections are leads for a human to open, never verdicts.');
