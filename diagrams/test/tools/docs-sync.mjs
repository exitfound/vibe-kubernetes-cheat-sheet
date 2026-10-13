// Writes the numbers S-49 computes into the documents that state them. Rewrites only captured number
// groups, never prose, and skips a claim whose pattern no longer matches. docs-census.test.mjs is the check.
// node tools/docs-sync.mjs [--dry-run]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../fixtures/catalog.mjs';
import { CLAIMS, DOCS, NUMWORD, asNumber, flat } from '../fixtures/census.mjs';

const DRY = process.argv.includes('--dry-run');

// Same join `readDoc` uses, kept local so write and read paths cannot diverge.
const docPath = (rel) => join(ROOT, rel);

// Claims match the whitespace-collapsed document, so each literal space is widened to `\s+` to get
// real offsets. Spaces inside a character class stay.
function rawSource(src) {
  let out = '', inClass = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === '\\') { out += c + (src[i + 1] ?? ''); i++; continue; }
    if (c === '[') inClass = true;
    else if (c === ']') inClass = false;
    if (c === ' ' && !inClass) { out += '\\s+'; continue; }
    out += c;
  }
  return out;
}

// `d` for group offsets, `s` so `.` spans the line breaks `flat` removed.
const rawRe = (re) => new RegExp(rawSource(re.source), re.flags.replace(/[ds]/g, '') + 'ds');

// A number spelled as a word stays a word.
const WORD_OF = Object.fromEntries(Object.entries(NUMWORD).map(([w, n]) => [n, w]));
const render = (was, n) => (/^\d+$/.test(was) ? String(n) : (WORD_OF[n] ?? String(n)));

const changed = [], unmatched = [], unwritable = [];
const edits = new Map();          // rel -> [{ start, end, text }]

for (const claim of CLAIMS) {
  const m = claim.re.exec(flat(DOCS.get(claim.doc)));
  if (!m) { unmatched.push(`${claim.doc}  ${claim.label}`); continue; }
  const got = m.slice(1).map(asNumber);
  const want = claim.want();
  if (got.length === want.length && got.every((n, i) => n === want[i])) continue;

  const raw = readFileSync(docPath(claim.doc), 'utf8');
  const rm = rawRe(claim.re).exec(raw);
  if (!rm || rm.indices.length !== m.length) {
    unwritable.push(`${claim.doc}  ${claim.label}  (widened pattern did not match the raw file)`);
    continue;
  }
  const list = edits.get(claim.doc) || [];
  for (let g = 1; g < rm.length; g++) {
    if (asNumber(rm[g]) === want[g - 1]) continue;
    const [start, end] = rm.indices[g];
    list.push({ start, end, text: render(rm[g], want[g - 1]) });
    changed.push(`${claim.doc}  ${claim.label}: ${rm[g]} -> ${render(rm[g], want[g - 1])}`);
  }
  edits.set(claim.doc, list);
}

for (const [rel, list] of edits) {
  if (!list.length) continue;
  let raw = readFileSync(docPath(rel), 'utf8');
  // Back to front, so an earlier edit cannot move a later offset.
  for (const e of list.sort((a, b) => b.start - a.start)) {
    raw = raw.slice(0, e.start) + e.text + raw.slice(e.end);
  }
  if (!DRY) writeFileSync(docPath(rel), raw);
}

const say = (label, rows) => {
  if (!rows.length) return;
  console.log(`${label} (${rows.length}):`);
  for (const r of rows) console.log(`  ${r}`);
};
say(DRY ? 'would write' : 'wrote', changed);
say('UNMATCHED, left alone: a reworded sentence is a human decision', unmatched);
say('UNWRITABLE, left alone: report this, the widening rule needs a case', unwritable);
if (!changed.length && !unmatched.length && !unwritable.length) {
  console.log(`every one of the ${CLAIMS.length} claims already states what the tree holds`);
}
process.exit(unwritable.length ? 1 : 0);
