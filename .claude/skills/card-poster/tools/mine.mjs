#!/usr/bin/env node
// mine.mjs: checks reference/patterns.md against the posters.js comments for rot, unlisted families, silent posters and coverage.
// usage: node .claude/skills/card-poster/tools/mine.mjs [--verbose]
// Reports and never writes. The family is read off the comment above each poster, and the "Open these" pick stays human.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../../../', import.meta.url).pathname;
const SCHEMES = join(ROOT, 'scheme/js/schemes');
const LIB = join(ROOT, '.claude/skills/card-poster/reference/patterns.md');
const verbose = process.argv.includes('--verbose');

// The families the library defines: every `## ` heading between the table and the closing `## Choosing`.
const lib = readFileSync(LIB, 'utf8');
const SKIP = new Set(['Choosing', 'Combinations that already failed here', 'Glyph vocabulary']);
const families = [...lib.matchAll(/^## (.+)$/gm)].map(m => m[1].trim()).filter(f => !SKIP.has(f));

// Card ids cited in the FAMILY table, per row, bounded to the first table (the second is the glyph vocabulary).
const familyTable = lib.slice(lib.indexOf('| Family |'), lib.indexOf('\n---\n', lib.indexOf('| Family |')));
const claimed = new Map();          // family -> Set(card id)
for (const row of familyTable.matchAll(/^\| ([^|]+?) \| [^|]+ \| ([^|]+) \|$/gm)) {
  const family = row[1].trim();
  if (family === 'Family' || family.startsWith('-')) continue;
  claimed.set(family, new Set([...row[2].matchAll(/`([\w-]+)`/g)].map(m => m[1])));
}

// A comment matches a family when two or more content words of the heading appear in order.
const STOP = new Set(['of', 'a', 'the', 'and', 'into', 'one', 'to', 'in', 'on', 'at']);
const keyOf = f => [...new Set(f.toLowerCase().replace(/,.*$/, '').split(/\s+/).filter(w => !STOP.has(w)))];
// Only the opening of the comment counts, because the comment names the family first and then describes the drawing.
const matches = (comment, family) => {
  const words = keyOf(family);
  const hay = comment.toLowerCase().slice(0, 120);
  let at = 0, hit = 0;
  for (const w of words) {
    const i = hay.indexOf(w, at);
    if (i < 0) continue;
    at = i + w.length; hit++;
  }
  return hit >= Math.min(2, words.length) && hit === words.length;
};

const found = new Map();            // family -> [card id]
const silent = [], unlisted = [];
const allIds = new Set(), commented = new Set();
for (const cat of readdirSync(SCHEMES)) {
  const file = join(SCHEMES, cat, 'posters.js');
  if (!existsSync(file)) continue;
  const src = readFileSync(file, 'utf8');
  // Every poster, comment or not: a citation to a poster with no comment is not a dead citation.
  for (const m of src.matchAll(/^  '([\w-]+)':\s*`/gm)) allIds.add(m[1]);
  // the comment block immediately above each poster key
  for (const m of src.matchAll(/((?:^ {2}\/\/.*\n)+)  '([\w-]+)':\s*`/gm)) {
    const comment = m[1].replace(/^\s*\/\/ ?/gm, ' ');
    const id = m[2];
    commented.add(id);
    const hits = families.filter(f => matches(comment, f));
    if (!hits.length) { silent.push({ id, cat, head: comment.trim().slice(0, 70) }); continue; }
    for (const f of hits) (found.get(f) ?? found.set(f, []).get(f)).push(id);
  }
}

let findings = 0;
const line = (label, xs) => { if (xs.length) { console.log(`\n${label} (${xs.length})`); xs.forEach(x => console.log('  ' + x)); findings += xs.length; } };

// 1. rot: the cited card is gone or its comment now names a different family (a comment naming none is not rot).
const rot = [];
for (const [family, ids] of claimed) {
  if (!families.includes(family)) { rot.push(`row "${family}" has no section of its own in the file`); continue; }
  for (const id of ids) {
    if (!allIds.has(id)) { rot.push(`${family} -> ${id}: no poster with that id`); continue; }
    if ((found.get(family) || []).includes(id)) continue;
    const actually = [...found].filter(([, v]) => v.includes(id)).map(([f]) => f);
    if (actually.length) rot.push(`${family} -> ${id}: its comment now names ${actually.join(' + ')}`);
  }
}
line('ROT: the table cites something the catalog moved away from', rot);

// 2. a family in use that the file has no section for. This is the user's call, not the tool's.
line('UNLISTED: named in a poster comment, no section in patterns.md', unlisted);

// 3. silent posters, reported as one line because it is a backlog, not N findings.
console.log(`\nSILENT: ${silent.length} of ${allIds.size} posters name no family in their comment (${allIds.size - commented.size} carry no comment at all),`);
console.log('so the library cannot track them.');
console.log('SKILL.md step 5 asks every new comment to name one. --verbose lists them.');
if (verbose) silent.forEach(u => console.log(`  ${u.id.padEnd(42)} ${u.head}`));

// 4. coverage, which is the half that is not a finding.
console.log('\nCOVERAGE: families by posters in use');
for (const f of families) {
  const ids = found.get(f) || [];
  const mark = ids.length === 0 ? '   <- EMPTY, nothing uses it' : '';
  console.log(`  ${f.padEnd(30)} ${String(ids.length).padStart(3)}${mark}`);
  if (verbose && ids.length) console.log(`      ${ids.join(', ')}`);
}
console.log(`\n${findings} finding(s). COVERAGE and SILENT are not findings: an empty family may be a`);
console.log('shape worth keeping in the vocabulary rather than one to delete. --verbose lists the ids.');
