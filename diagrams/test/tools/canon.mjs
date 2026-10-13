#!/usr/bin/env node
// Query CANON.md rows verbatim, a probe that asserts nothing. No arguments prints the census (S-49).
// node tools/canon.mjs [--check=review|test|report|skill|hook] [--block=L,A] [--id=L-05] [--grep=x]
// [--cat=cluster] [--ids] [--json]. A row naming two Check kinds matches either.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CANON_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'CANON.md');

// Splits on unescaped pipes (C-02 carries `role \|\| null`). Drops the backslash, unlike docs.test.mjs, because it prints.
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

// Catalog rows `| id | rule | check | source |`, index rows `| id | subject |` under `### ` headings,
// which is why `sub` is tracked and cleared on every `## `.
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

// An empty cell (an index row) resolves to nothing and matches no --check.
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
  const byBlock = new Map();
  for (const r of ROWS) {
    if (r.kind !== 'rule') continue;
    if (!byBlock.has(r.block)) byBlock.set(r.block, { rows: 0, test: 0, report: 0, skill: 0, review: 0, hook: 0 });
    const o = byBlock.get(r.block);
    o.rows++;
    for (const k of kindsOf(r.check)) if (k in o) o[k]++;
  }
  const pad = (n, w) => String(n).padStart(w);
  console.log('');
  console.log(`CANON.md, ${ROWS.filter(r => r.kind === 'rule').length} rule rows and ` +
    `${ROWS.filter(r => r.kind === 'index').length} category index rows`);
  console.log('');
  console.log('  block                                    rows   test  report   skill  review    hook');
  for (const [block, o] of byBlock) {
    console.log(`  ${block.slice(0, 38).padEnd(38)} ${pad(o.rows, 6)} ${pad(o.test, 6)} ${pad(o.report, 7)} ${pad(o.skill, 7)} ${pad(o.review, 7)} ${pad(o.hook, 7)}`);
  }
  const tot = [...byBlock.values()].reduce((a, o) => ({
    rows: a.rows + o.rows, test: a.test + o.test, report: a.report + o.report,
    skill: a.skill + o.skill, review: a.review + o.review, hook: a.hook + o.hook,
  }), { rows: 0, test: 0, report: 0, skill: 0, review: 0, hook: 0 });
  console.log(`  ${'TOTAL'.padEnd(38)} ${pad(tot.rows, 6)} ${pad(tot.test, 6)} ${pad(tot.report, 7)} ${pad(tot.skill, 7)} ${pad(tot.review, 7)} ${pad(tot.hook, 7)}`);
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
    console.log('');
  }
  console.log(`${sel.length} row(s) of ${ROWS.length}\n`);
}
