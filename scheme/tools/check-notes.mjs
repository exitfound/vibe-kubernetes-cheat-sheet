#!/usr/bin/env node
// check-notes.mjs: does every design note still point at code that exists? A record anchors each note
// to the line it sat above (`### before `<code>``), so a rename, a codemod or a relayout would
// otherwise turn a geometry record into a note about a line that is gone.
// No browser, no server. node check-notes.mjs [--verbose]
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cards } from './catalog.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const verbose = process.argv.includes('--verbose');

// Where each card's source lives, from the catalog rather than from a directory listing. A card-record
// section is keyed by card id and never names a path, so this map is the only thing that has to
// know one. It used to be a readdir, which meant that the day cards moved into subfolders `known`
// would have become the four DIRECTORY names: every "## <id>" section would report ORPHAN, and the
// "no note" pass would have compared 108 sections against 4 names and silently found nothing wrong.
// cards() has already refused to return a catalogue with a missing file, so every path here exists.
const CARD = new Map((await cards()).map(c => [c.id, c.path]));

// One entry per markdown, so notes on the shared files are checked the same way as card notes.
// A record lives in the folder it describes: each category's card notes in its own CARDS.md, and
// everything that is not one card in scheme/INTERNALS.md. `cat` lets the census below assert a
// section is filed under the right category rather than merely existing somewhere.
const CATALOGUE = await cards();
const CATEGORIES = [...new Set(CATALOGUE.map(c => c.category))].sort();
const DOCS = [
  ...CATEGORIES.map(cat => ({
    md: join(ROOT, 'js/schemes', cat, 'CARDS.md'),
    cat,
    resolve: id => CARD.get(id) || join(ROOT, 'js/schemes', cat, `${id}.js`),
  })),
  { md: join(ROOT, 'INTERNALS.md'), resolve: id => join(ROOT, id.replace(/^scheme\//, '')) },
];

const known = new Set(CARD.keys());
const CAT_OF = new Map(CATALOGUE.map(c => [c.id, c.category]));
let anchors = 0, stale = 0, orphanSections = 0, missingSections = 0, misfiled = 0;
const have = new Set();          // every card id that has a section, across all four card files
const perFile = new Map();       // file -> how many sections it holds

for (const { md, resolve, cat } of DOCS) {
  if (!existsSync(md)) continue;
  const name = md.slice(ROOT.length + 1);
  const lines = readFileSync(md, 'utf8').split('\n');
  let section = null, srcPath = null, src = null;

  for (let i = 0; i < lines.length; i++) {
    const h2 = /^## (.+)$/.exec(lines[i]);
    if (h2) {
      section = h2[1].trim();
      if (cat) {
        have.add(section);
        perFile.set(name, (perFile.get(name) || 0) + 1);
        // A section in the wrong category's file resolves to nothing and would be reported as an
        // ORPHAN, which says the file is missing rather than that the note is misfiled. Name it.
        const real = CAT_OF.get(section);
        if (real && real !== cat) { misfiled++; console.log(`MISFILED ${name}:${i + 1}  ## ${section}  belongs in js/schemes/${real}/CARDS.md`); }
      }
      srcPath = resolve(section);
      src = existsSync(srcPath) ? readFileSync(srcPath, 'utf8') : null;
      if (!src) { orphanSections++; console.log(`ORPHAN   ${name}:${i + 1}  ## ${section}  (no such file: ${srcPath.slice(ROOT.length + 1)})`); }
      continue;
    }
    const a = /^### before `(.*)`$/.exec(lines[i]);
    if (!a) continue;
    anchors++;
    if (!src) continue;                       // already reported as an orphan section
    if (src.includes(a[1])) { if (verbose) console.log(`ok       ${section}  ${a[1].slice(0, 60)}`); continue; }
    stale++;
    console.log(`STALE    ${name}:${i + 1}  [${section}]  ${a[1].slice(0, 90)}`);
  }
}

// Every card should have a section: a card with no design record is how a measurement gets lost.
// `have` is the union across all four card files, not one of them: reading a single file would
// declare 87 of the 108 cards undocumented.
for (const id of [...known].sort()) {
  if (!have.has(id)) { missingSections++; console.log(`NO NOTE  ${id}  (no "## ${id}" section in js/schemes/${CAT_OF.get(id)}/CARDS.md)`); }
}

const bad = stale + orphanSections + misfiled;
const census = [...perFile].sort().map(([f, n]) => `${f.replace('js/schemes/', '').replace('/CARDS.md', '')} ${n}`).join(', ');
console.log(`\nnotes check: ${anchors} anchors, ${stale} stale, ${orphanSections} orphan section(s), ${missingSections} card(s) with no note`);
console.log(`  sections per category file: ${census} (${[...perFile.values()].reduce((a, b) => a + b, 0)} of ${known.size})`);
if (bad) { console.error(`notes check FAILED: ${bad} anchor/section problem(s)`); process.exit(1); }
console.log('notes check OK: every design note points at code that still exists');
