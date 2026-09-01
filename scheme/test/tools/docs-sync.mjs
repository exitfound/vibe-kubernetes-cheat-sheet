// docs-sync.mjs: write the numbers `S-49` computes into the documents that state them.
//
// WHY THIS EXISTS. Every `want` in the claim registry is a function of the tree, so a single run
// already KNOWS every correct number. Until this file, it only printed them, and a human or an agent
// retyped each one by hand and then paid a whole gate to find out whether the retyping was right.
// Measured over nine sessions of transcripts: twenty `sed` commands against stated counts, each one
// bundled with a full `npm test` to check it, and several of them the second or third attempt at the
// same number. That loop is arithmetic, and arithmetic is not a judgement call.
//
// WHAT IT WILL NOT DO, and this is the whole of its safety:
//
//   It never edits prose. A claim's regex captures NUMBERS in groups, and this tool rewrites the
//   captured groups and nothing else, in place, by their offsets. A sentence cannot be reworded, a
//   row cannot be reordered and a word cannot be dropped by a run of this file.
//
//   It never invents a claim. A claim whose pattern no longer MATCHES its document is left alone and
//   reported as unmatched. That is the case where a human reworded the sentence, and the answer is
//   either to restore the shape or to update the pattern in `fixtures/census.mjs` on purpose. A
//   writer that repaired those would be papering over the one failure that means something.
//
//   It is not the check. `unit/docs-census.test.mjs` still asserts, and asserting is a different act
//   from writing: a run of this tool that silently did nothing has to be caught by the test, so the
//   test is what a deliverable quotes and this is only how the numbers get there.
//
// Usage:
//   node tools/docs-sync.mjs           write, and print one line per number changed
//   node tools/docs-sync.mjs --dry-run print what it would change and touch nothing
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../fixtures/catalog.mjs';
import { CLAIMS, DOCS, NUMWORD, asNumber, flat } from '../fixtures/census.mjs';

const DRY = process.argv.includes('--dry-run');

// A document under `scheme/`, or above it when the claim names one (`../README.md`,
// `../.claude/skills/...`). Same join `readDoc` uses, kept here rather than imported so the write
// path and the read path cannot end up pointing at two different files.
const docPath = (rel) => join(ROOT, rel);

// -------------------------------------------------------------------------------------------
// THE ONE HARD PART: a claim's regex is written against the document with its whitespace COLLAPSED
// (`flat`), because most claims run across a line break. A match against the flat string carries no
// offsets into the real file, so it cannot be written back. Rather than keep a second set of
// patterns, the flat pattern is widened: every literal space becomes `\s+`, which is exactly what
// `flat` erased. Spaces inside a character class are left alone, where a space is a member of a set
// and not a separator.
// -------------------------------------------------------------------------------------------
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

// `d` for group offsets, `s` so a `.` in a pattern still spans the line break `flat` had removed.
const rawRe = (re) => new RegExp(rawSource(re.source), re.flags.replace(/[ds]/g, '') + 'ds');

// A document that spells a number as a word keeps spelling it as a word. Writing `4` where the
// sentence reads `three` is a correct number in a sentence that has stopped reading as English.
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

  // It disagrees. Find the same sentence in the RAW file to get real offsets.
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
