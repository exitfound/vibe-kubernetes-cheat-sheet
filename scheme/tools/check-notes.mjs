#!/usr/bin/env node
// check-notes.mjs: does every design note still point at code that exists? `scheme/docs/CARDS.md`
// anchors each note to the line it sat above (`### before `<code>``), and nothing has ever verified
// those anchors, so a rename, a codemod or a relayout silently turns a geometry record into a note
// about a line that is gone. Found 19+ stale anchors on its first run.
// No browser, no server. node check-notes.mjs [--verbose]
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const verbose = process.argv.includes('--verbose');

// One entry per markdown, so notes on the shared files are checked the same way as card notes.
const DOCS = [
  { md: join(ROOT, 'docs/CARDS.md'), resolve: id => join(ROOT, 'js/schemes', `${id}.js`) },
  { md: join(ROOT, 'docs/INTERNALS.md'), resolve: id => join(ROOT, id.replace(/^scheme\//, '')) },
];

const known = new Set(readdirSync(join(ROOT, 'js/schemes')).map(f => f.replace(/\.js$/, '')));
let anchors = 0, stale = 0, orphanSections = 0, missingSections = 0;

for (const { md, resolve } of DOCS) {
  if (!existsSync(md)) continue;
  const name = md.slice(ROOT.length + 1);
  const lines = readFileSync(md, 'utf8').split('\n');
  let section = null, srcPath = null, src = null;

  for (let i = 0; i < lines.length; i++) {
    const h2 = /^## (.+)$/.exec(lines[i]);
    if (h2) {
      section = h2[1].trim();
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
if (existsSync(DOCS[0].md)) {
  const have = new Set([...readFileSync(DOCS[0].md, 'utf8').matchAll(/^## (.+)$/gm)].map(m => m[1].trim()));
  for (const id of [...known].sort()) if (!have.has(id)) { missingSections++; console.log(`NO NOTE  ${id}  (no "## ${id}" section in docs/CARDS.md)`); }
}

const bad = stale + orphanSections;
console.log(`\nnotes check: ${anchors} anchors, ${stale} stale, ${orphanSections} orphan section(s), ${missingSections} card(s) with no note`);
if (bad) { console.error(`notes check FAILED: ${bad} anchor/section problem(s)`); process.exit(1); }
console.log('notes check OK: every design note points at code that still exists');
