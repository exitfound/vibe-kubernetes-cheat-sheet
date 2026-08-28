#!/usr/bin/env node
// section.mjs: one section of the catalog as data, no browser. Every card in MANIFEST ORDER, which
// is the order the grid renders and the order a reader meets them in, with the size of its prose,
// the size of its animation, the pages it cites and its five-band layer signature.
//
//   node .claude/skills/section-review/tools/section.mjs <category>/<section>
//   node .claude/skills/section-review/tools/section.mjs <category>        every section of it
//   node .claude/skills/section-review/tools/section.mjs --list            the 15 section keys
//     --json      the same data as one object, for diffing two runs
//     --markers   name the markers that fired, not just how many
//
// Runs from anywhere: it imports scheme/test/fixtures/catalog.mjs, which reaches only node
// builtins, so there is no playwright and no node_modules to be in the right directory for.
//
// WHY THIS EXISTS. The catalog carries no level, no depth and no prerequisite: `D-01` fixes the
// SCHEMES entry at eight keys and the test enforces the set. Every question this skill asks is
// therefore answered from prose, and answering it by reading 37 cards from memory is how a review
// becomes an opinion. This prints the evidence first so the rating has something to disagree with.
//
// WHAT IT IS BLIND TO, and the list is not short. It cannot see whether a card is any GOOD, whether
// its picture matches its words (`card-facts`), whether the section teaches in a sane order, or
// whether a missing topic matters. The signature is a word count over a fixed vocabulary and a card
// can be deep without using a deep word: see bands.mjs. Read this as the map, never the verdict.
import { schemes, subcategories, ROOT } from '../../../../scheme/test/fixtures/catalog.mjs';
import { sentences } from '../../../../scheme/test/fixtures/prose.mjs';
import { BANDS, BAND_KEYS, walkStrings, signature, centre, bar, sourcePath } from './bands.mjs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, v = 'true'] = a.slice(2).split('='); return [k, v];
}));
const target = args.find(a => !a.startsWith('--'));
if (!target && !flags.list) {
  console.error('Usage: node section.mjs <category>[/<section>] [--json] [--markers]');
  console.error('       node section.mjs --list');
  process.exit(1);
}

const SUBS = await subcategories();
const ALL = await schemes();

if (flags.list) {
  for (const [cat, subs] of Object.entries(SUBS)) {
    for (const s of subs) {
      const n = ALL.filter(c => c.category === cat && c.subcategory === s.key).length;
      console.log(`${`${cat}/${s.key}`.padEnd(34)} ${String(n).padStart(2)}  ${s.label}`);
    }
  }
  process.exit(0);
}

const [cat, sec] = target.split('/');
if (!SUBS[cat]) {
  console.error(`unknown category "${cat}". Known: ${Object.keys(SUBS).join(', ')}`);
  process.exit(1);
}
if (sec && !SUBS[cat].some(s => s.key === sec)) {
  console.error(`unknown section "${sec}" in ${cat}. Known: ${SUBS[cat].map(s => s.key).join(', ')}`);
  process.exit(1);
}

const wanted = sec ? SUBS[cat].filter(s => s.key === sec) : SUBS[cat];

// One card read. `desc` is catalog prose the reader sees on the grid; narration is what the card
// says while it plays; drawn is every other string in the scene and the steps, which is where the
// component names live. The signature runs over all three, because a card whose only mention of the
// Kubelet is a block label is still a Kubelet card.
async function read(entry, pos) {
  const rel = join('js', 'schemes', entry.category, `${entry.id}.js`);
  const ns = await import(pathToFileURL(join(ROOT, rel)).href);
  const steps = Array.isArray(ns.STEPS_SPEC) ? ns.STEPS_SPEC : [];
  const narration = steps.map(s => s.narration || '').filter(Boolean);
  const drawn = [...walkStrings(ns.SCENE || {}), ...steps.flatMap(s => walkStrings({ ...s, narration: null }))];
  const aria = (ns.SCENE || {})['aria-label'] || '';
  const text = [entry.desc, ...narration, ...drawn, aria].join('\n');
  const sig = signature(text);
  return {
    pos,
    id: entry.id,
    title: entry.title,
    descChars: entry.desc.length,
    descSentences: sentences(entry.desc).length,
    steps: steps.length,
    narrated: narration.length,
    narrationChars: narration.join(' ').length,
    duration: steps.reduce((n, s) => n + (s.duration || 0), 0),
    sources: (entry.sources || []).map(s => sourcePath(s.href)),
    sig,
    centre: centre(sig),
  };
}

const out = { category: cat, sections: [] };

for (const s of wanted) {
  const entries = ALL.filter(c => c.category === cat && c.subcategory === s.key);
  const rows = [];
  for (let i = 0; i < entries.length; i++) rows.push(await read(entries[i], i + 1));

  const profile = Object.fromEntries(BAND_KEYS.map(k => [k, rows.filter(r => r.centre !== null
    && Math.round(r.centre) === BAND_KEYS.indexOf(k) + 1).length]));
  out.sections.push({ key: s.key, label: s.label, count: rows.length, profile, cards: rows });
}

if (flags.json) {
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}

const pad = (v, n) => String(v).padEnd(n);
const num = (v, n) => String(v).padStart(n);

for (const s of out.sections) {
  console.log(`\n${'='.repeat(96)}`);
  console.log(`${cat}/${s.key}  "${s.label}"  ${s.count} cards`);
  console.log('='.repeat(96));
  console.log(`${pad('#', 3)}${pad('id', 42)}${num('desc', 5)}${num('sn', 3)}${num('stp', 4)}${num('narr', 6)}${num('sec', 5)}  ${pad('L1 L2 L3 L4 L5', 16)}ctr`);
  console.log('-'.repeat(96));
  for (const r of s.cards) {
    const bands = BAND_KEYS.map(k => num(r.sig[k], 2)).join(' ');
    const ctr = r.centre === null ? ' -- ' : r.centre.toFixed(1);
    console.log(`${pad(r.pos, 3)}${pad(r.id, 42)}${num(r.descChars, 5)}${num(r.descSentences, 3)}${num(r.steps, 4)}${num(r.narrationChars, 6)}${num((r.duration / 1000).toFixed(0), 5)}  ${pad(bands, 16)}${ctr}`);
  }

  console.log(`\n  signature centre, rounded, one row per band:`);
  for (const k of BAND_KEYS) {
    const n = s.profile[k];
    console.log(`    ${k} ${pad(BANDS[k].label, 26)}${num(n, 2)}  ${bar(n)}`);
  }

  const cited = new Map();
  for (const r of s.cards) for (const p of r.sources) cited.set(p, (cited.get(p) || 0) + 1);
  const shared = [...cited].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]);
  if (shared.length) {
    console.log(`\n  pages cited by more than one card in this section:`);
    for (const [p, n] of shared) console.log(`    ${num(n, 2)}x  ${p}`);
  }

  if (flags.markers) {
    console.log(`\n  markers that fired:`);
    for (const r of s.cards) {
      const line = BAND_KEYS.filter(k => r.sig.hits[k].length)
        .map(k => `${k}:${r.sig.hits[k].join(',')}`).join('  ');
      console.log(`    ${pad(r.id, 42)}${line}`);
    }
  }
}

console.log(`\n${out.sections.length} section(s), ${out.sections.reduce((n, s) => n + s.count, 0)} cards.`);
console.log('The signature is a word count over a fixed vocabulary. It is evidence for a rating, never the rating.');
