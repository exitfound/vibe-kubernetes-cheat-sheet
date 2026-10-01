#!/usr/bin/env node
// mine.mjs: reference/patterns.md is a SNAPSHOT and nothing used to re-mine it. Every redraw that
// lands a poster in a different family silently falsifies the "Open these" column, and the only
// thing that caught it was a grep sweep somebody had to remember to run.
//
// This reads the catalog back and reports four things the library cannot know about itself:
//   1. rot        a row cites a card id that no longer exists, or one whose comment now names a
//                 DIFFERENT family
//   2. unlisted   a poster names a family the library has no section for
//   3. silent     a poster whose comment names no family at all
//   4. coverage   which families are in use, by how many posters, and which have gone empty
//
// It reports and never writes. The library is the user's to extend, and a machine that rewrites
// prose is how the wording gets broken while the counts stay green.
//
//   node .claude/skills/card-poster/tools/mine.mjs [--verbose]
//
// A family is read off the COMMENT above each poster in posters.js. SKILL.md step 5 has always
// asked for that comment to name the family and the accent, so this tool is the first thing that
// checks it: measured 2026-09-11 a large share of the catalog predates the convention and names no
// family at all, which is what `silent` counts. That number is a debt, not a bug, and it shrinks one
// poster at a time as cards are redrawn. What it buys is that `rot` becomes checkable at all.
//
// The `Open these` column is NOT a census and this tool does not try to regenerate it: it is a human
// pick of the two or three posters worth opening for that family, and a machine cannot make that
// choice. What a machine can do is notice when the pick has stopped being true.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../../../', import.meta.url).pathname;
const SCHEMES = join(ROOT, 'scheme/js/schemes');
const LIB = join(ROOT, '.claude/skills/card-poster/reference/patterns.md');
const verbose = process.argv.includes('--verbose');

// The families the library defines, in its own words: every `## ` heading between the table and the
// closing `## Choosing`. Reading the headings rather than a hardcoded list is what keeps this tool
// from becoming a second snapshot that also rots.
const lib = readFileSync(LIB, 'utf8');
const SKIP = new Set(['Choosing', 'Combinations that already failed here', 'Glyph vocabulary']);
const families = [...lib.matchAll(/^## (.+)$/gm)].map(m => m[1].trim()).filter(f => !SKIP.has(f));

// What the library CLAIMS: every card id inside a backtick in the FAMILY table, per row. The file
// carries a second table now (the glyph vocabulary), so the scan is bounded to the first one rather
// than to every three-column row in the file.
const familyTable = lib.slice(lib.indexOf('| Family |'), lib.indexOf('\n---\n', lib.indexOf('| Family |')));
const claimed = new Map();          // family -> Set(card id)
for (const row of familyTable.matchAll(/^\| ([^|]+?) \| [^|]+ \| ([^|]+) \|$/gm)) {
  const family = row[1].trim();
  if (family === 'Family' || family.startsWith('-')) continue;
  claimed.set(family, new Set([...row[2].matchAll(/`([\w-]+)`/g)].map(m => m[1])));
}

// Matching a comment to a family: the heading's distinctive words, not the whole phrase, because a
// comment writes "Chain of stages that forks" and "Ghost zone to solid" for "Ghost zone to solid
// zone". Two or more content words of the heading present in order is a match.
const STOP = new Set(['of', 'a', 'the', 'and', 'into', 'one', 'to', 'in', 'on', 'at']);
const keyOf = f => [...new Set(f.toLowerCase().replace(/,.*$/, '').split(/\s+/).filter(w => !STOP.has(w)))];
// Only the OPENING of the comment counts. The convention is that the comment names the family
// first and then describes the drawing, and matching the whole body turns any prose that happens to
// use the words "ghost", "zone" and "solid" into a family claim.
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
  // EVERY poster, comment or not. Collected separately because the scan below only sees the ones
  // that carry a comment block, and a citation to a poster with no comment is not a dead citation.
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

// 1. rot. A cited card whose comment names no family is NOT rot: the library's pick predates the
// naming convention, and the pick may still be the right one to open. Rot is a citation that is
// demonstrably wrong: the card is gone, or its comment now names a different family.
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

// 3. the convention debt. Reported as one line rather than as N findings, because it is a backlog
// that predates the rule and listing it every run would drown the two findings that are actionable.
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
