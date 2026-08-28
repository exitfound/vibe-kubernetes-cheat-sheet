#!/usr/bin/env node
// canon.mjs: query CANON.md instead of re-reading it. A PROBE, not a check: it asserts nothing and
// fails on nothing. Never shipped (`S-41`).
//
// ===========================================================================================
// WHAT IT IS FOR
// ===========================================================================================
// The rulebook's most useful column is `Check`, because it says whether a rule has a machine behind
// it. A card review's whole value is the rows where it says `review`: everything a `test:` row
// names is what `npm test` already did before the reviewer opened the card. Until this file existed
// there was no way to ASK for that subset, so every review re-read a 500-row document to rediscover
// it, and no review could say what fraction of it had actually been walked. No count is written
// down here on purpose: run it with no arguments and it prints the census (`S-49`).
//
// It is deliberately a query and not a second rulebook. It holds no rule text of its own, prints
// what CANON.md says verbatim, and goes empty the day the file it reads moves. A rule's text has
// one home (`S-35`) and this is not it.
//
// ===========================================================================================
// USAGE, from scheme/test/
// ===========================================================================================
//   node tools/canon.mjs                          the census: rows per block, split by Check kind
//   node tools/canon.mjs --check=review           every rule no machine covers, in block order
//   node tools/canon.mjs --check=review --block=L,A     the same, geometry blocks only
//   node tools/canon.mjs --block=M                one block whole
//   node tools/canon.mjs --id=L-05,A-13           named rules, with the long form behind each
//   node tools/canon.mjs --grep=panel             rows whose text matches, case insensitive
//   node tools/canon.mjs --cat=cluster            that category's index rows, and where they live
//   node tools/canon.mjs --check=review --ids     ids only, one per line, for a checklist
//   node tools/canon.mjs --json                   the selected rows as JSON, for a script
//
// `--check=` takes `review`, `test`, `report` or `hook`, comma separated. A row naming two values
// matches either, which is the honest reading: `report:motion/M-12` is measured and printed, and a
// row carrying both a `test:` and a `report:` value is covered for the half the test names only.
//
// ===========================================================================================
// WHAT IT IS BLIND TO
// ===========================================================================================
//   - Whether a rule is TRUE, or still has a subject. `unit/docs.test.mjs` groups C and E are what
//     resolve the Source and Check columns; this only reads them.
//   - The category rules themselves. `--cat` prints the INDEX rows, which carry a subject label and
//     never the rule text: the text is in the folder's own CLAUDE.md and this will not copy it here.
//   - Anything outside the tables. The prose sections (the record vocabulary, the deliberate
//     exceptions, how to read a row) are not rows and are not selected.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CANON_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'CANON.md');

// A markdown row split on its UNESCAPED pipes. C-02's rule text carries `role \|\| null`, so a plain
// split('|') tears that row in half and reads its Check column out of the wrong cell. The same
// reason as `cells` in unit/docs.test.mjs, with one deliberate difference: that one keeps the
// backslash because it compares text, and this one drops it because it PRINTS text to a reader.
function cells(line) {
  const out = [];
  let cur = '';
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '\\' && line[i + 1] === '|') { cur += '||'; i++; continue; }
    if (line[i] === '|') { out.push(cur); cur = ''; continue; }
    cur += line[i];
  }
  out.push(cur);
  return out;
}

// The `## The long form` section, as id -> the argument behind that rule. A row states the rule and
// its long form carries the measurement, so `--id=` prints the two together and nothing else has to
// go looking. `unit/docs.test.mjs` group F is what keeps a block attached to a rule that exists.
function longForms(md) {
  const at = md.indexOf('\n## The long form\n');
  if (at === -1) return new Map();
  const out = new Map();
  let id = null;
  for (const line of md.slice(at).split('\n')) {
    const h3 = /^### ([A-Z]{1,3}\.?[A-Z]?-\d+[a-z]?)\s*$/.exec(line);
    if (h3) { id = h3[1]; out.set(id, []); continue; }
    if (id) out.get(id).push(line);
  }
  for (const [k, v] of out) out.set(k, v.join('\n').trim());
  return out;
}

// Every row of CANON.md that states a rule, tagged with the `## ` block it sits under. Two shapes:
// a catalog rule is `| id | rule | check | source |` and a category index row is `| id | subject |`.
// The category index sits under ONE `## ` block and splits into four `### ` headings, so a `### ` is
// tracked as well: without it every index row reads as one undifferentiated block and `--cat` can
// select nothing. A `### ` inside a catalog block is not a heading a row belongs to, which is why
// `sub` is cleared on every `## `.
function parse(md) {
  const rows = [];
  let block = '(preamble)';
  let sub = '';
  md.split('\n').forEach((line, i) => {
    const h2 = /^## (.+)$/.exec(line);
    if (h2) { block = h2[1].trim(); sub = ''; return; }
    const h3 = /^### (.+)$/.exec(line);
    if (h3) { sub = h3[1].trim(); return; }
    const m = /^\| (`?)([A-Z]{1,3}\.?[A-Z]?-\d+[a-z]?)\1 \|/.exec(line);
    if (!m) return;
    const c = cells(line).map(s => s.trim());
    const id = m[2];
    const prefix = id.split('-')[0];
    const where = { id, prefix, block, sub, line: i + 1 };
    if (c.length === 6) rows.push({ ...where, rule: c[2], check: c[3], source: c[4], kind: 'rule' });
    else if (c.length === 4) rows.push({ ...where, subject: c[2], check: '', source: '', kind: 'index' });
  });
  return rows;
}

// `test:geometry/DIAGONAL, report:overlay/L-02` -> ['test', 'report']. A `review` or `hook` cell is
// its own single value. An empty cell (an index row) resolves to nothing and matches no --check.
const kindsOf = (check) => [...new Set(check.split(',').map(s => s.trim().split(':')[0]).filter(Boolean))];

const ARGS = new Map();
for (const a of process.argv.slice(2)) {
  const m = /^--([a-z]+)(?:=(.*))?$/.exec(a);
  if (!m) { console.error(`unknown argument: ${a}. Run with no arguments for the census.`); process.exit(2); }
  ARGS.set(m[1], m[2] ?? '');
}
const list = (name) => (ARGS.has(name) ? ARGS.get(name).split(',').map(s => s.trim()).filter(Boolean) : null);

const CANON_MD = readFileSync(CANON_PATH, 'utf8');
const ROWS = parse(CANON_MD);
const LONG = longForms(CANON_MD);
if (!ROWS.length) {
  console.error(`no rule rows parsed out of ${CANON_PATH}. The file moved or its table shape changed:`);
  console.error('this probe prints nothing rather than guessing, and unit/docs.test.mjs is what fails on it.');
  process.exit(1);
}

const wantChecks = list('check');
const wantBlocks = list('block');
const wantIds = list('id');
const wantCats = list('cat');
const grep = ARGS.get('grep');

let sel = ROWS;
if (wantIds) sel = sel.filter(r => wantIds.includes(r.id));
if (wantBlocks) sel = sel.filter(r => wantBlocks.some(b => r.prefix === b || r.block.startsWith(`${b}:`)));
if (wantChecks) sel = sel.filter(r => kindsOf(r.check).some(k => wantChecks.includes(k)));
if (wantCats) sel = sel.filter(r => r.kind === 'index'
  && wantCats.some(c => `${r.sub} ${r.prefix}`.toLowerCase().includes(c.toLowerCase())));
if (grep) {
  const re = new RegExp(grep, 'i');
  sel = sel.filter(r => re.test(r.rule || r.subject || ''));
}

// ---------------------------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------------------------
const wrap = (text, width, indent) => {
  const out = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && line.length + 1 + word.length > width) { out.push(line); line = ''; }
    line = line ? `${line} ${word}` : word;
  }
  if (line) out.push(line);
  return out.map((l, i) => (i ? indent + l : l)).join('\n');
};

if (ARGS.has('json')) {
  console.log(JSON.stringify(sel, null, 2));
} else if (ARGS.has('ids')) {
  for (const r of sel) console.log(r.id);
} else if (!wantChecks && !wantBlocks && !wantIds && !wantCats && !grep) {
  // The census: what the rulebook holds, and how much of it a machine covers.
  const byBlock = new Map();
  for (const r of ROWS) {
    if (r.kind !== 'rule') continue;
    if (!byBlock.has(r.block)) byBlock.set(r.block, { rows: 0, test: 0, report: 0, review: 0, hook: 0 });
    const o = byBlock.get(r.block);
    o.rows++;
    for (const k of kindsOf(r.check)) if (k in o) o[k]++;
  }
  const pad = (n, w) => String(n).padStart(w);
  console.log('');
  console.log(`CANON.md, ${ROWS.filter(r => r.kind === 'rule').length} rule rows and ` +
    `${ROWS.filter(r => r.kind === 'index').length} category index rows`);
  console.log('');
  console.log('  block                                    rows   test  report  review    hook');
  for (const [block, o] of byBlock) {
    console.log(`  ${block.slice(0, 38).padEnd(38)} ${pad(o.rows, 6)} ${pad(o.test, 6)} ${pad(o.report, 7)} ${pad(o.review, 7)} ${pad(o.hook, 7)}`);
  }
  const tot = [...byBlock.values()].reduce((a, o) => ({
    rows: a.rows + o.rows, test: a.test + o.test, report: a.report + o.report,
    review: a.review + o.review, hook: a.hook + o.hook,
  }), { rows: 0, test: 0, report: 0, review: 0, hook: 0 });
  console.log(`  ${'TOTAL'.padEnd(38)} ${pad(tot.rows, 6)} ${pad(tot.test, 6)} ${pad(tot.report, 7)} ${pad(tot.review, 7)} ${pad(tot.hook, 7)}`);
  console.log('');
  console.log(`  The ${tot.review} review rows are the ones a card review is FOR: no machine anywhere`);
  console.log('  stands between them and a defect. Ask for them with --check=review.');
  console.log('');
} else {
  let block = null;
  for (const r of sel) {
    const heading = r.kind === 'index' && r.sub ? `${r.block} / ${r.sub}` : r.block;
    if (heading !== block) { block = heading; console.log(`\n=== ${block}\n`); }
    const body = r.kind === 'rule' ? r.rule : `(index) ${r.subject}`;
    console.log(`${r.id.padEnd(9)} ${wrap(body, 96, ' '.repeat(10))}`);
    const tail = [r.check && `check: ${r.check}`, r.source && `source: ${r.source}`].filter(Boolean).join('   ');
    if (tail) console.log(`${' '.repeat(10)}${tail}`);
    // The long form only on --id, where the reader asked for ONE rule. Printing it on a filtered
    // listing would put the essay back into the column this file exists to keep scannable.
    if (wantIds && LONG.has(r.id)) {
      console.log('');
      for (const line of LONG.get(r.id).split('\n')) console.log(line ? `${' '.repeat(10)}${line}` : '');
    }
    console.log('');
  }
  console.log(`${sel.length} row(s) of ${ROWS.length}\n`);
}
