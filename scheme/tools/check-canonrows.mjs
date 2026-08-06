#!/usr/bin/env node
// check-canonrows.mjs: does CANON.md tell the truth about itself? The rulebook's most useful column
// is Check, because it says whether a rule has a machine behind it or only a reader. Nothing verified
// that column, which is the failure X1 was: a number restated in six places and wrong in all six.
//   TOOL      a row cites gate:<check> or report:<check> naming no such tool
//   NOTGATED  a row claims gate:<check> for a check the chain does not run
//   ORPHAN    a check exists and runs in the gate but no rule cites it, so its rules are unwritten
//   DUPID     two rows carry the same id
//   SEQ       an id block skips or repeats a number
// No browser, no server. node check-canonrows.mjs [--verbose]
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const verbose = process.argv.includes('--verbose');

const canon = await readFile(join(ROOT, 'CANON.md'), 'utf8');
const pkg = JSON.parse(await readFile(join(__dirname, 'package.json'), 'utf8'));

// The chain is defined in package.json, where it executes, and read from there rather than restated.
const inGate = new Set([...pkg.scripts.gate.matchAll(/node (check-[a-z]+|smoke-all)\.mjs/g)].map(m => m[1]));

const findings = [];
const report = (kind, msg) => findings.push(`${kind.padEnd(9)} ${msg}`);

// `overlay-measure` is a reader, not a check, and rows cite it on purpose: it is how a panel number
// is taken. It has no exit code to be in the gate with.
const READERS = new Set(['overlay-measure', 'anim-dump', 'frame-strip', 'inline-dump']);

const rows = [...canon.matchAll(/^\| (`?)([A-Z]{1,3}\.?[A-Z]?-\d+[a-z]?)\1 \|(.*)$/gm)];
const ids = new Map();
for (const [, , id, rest] of rows) {
  if (ids.has(id)) report('DUPID', `${id} appears twice`);
  ids.set(id, rest);
}

const cited = new Set();
for (const m of canon.matchAll(/\| (gate|report):([a-z][a-z-]*)/g)) {
  const [, kind, name] = m;
  cited.add(name);
  if (READERS.has(name)) {
    if (kind === 'gate') report('NOTGATED', `a row claims gate:${name}, but that is a reader with no exit code`);
    continue;
  }
  if (!existsSync(join(__dirname, `${name}.mjs`))) { report('TOOL', `a row cites ${kind}:${name}, and scheme/tools/${name}.mjs does not exist`); continue; }
  if (kind === 'gate' && !inGate.has(name)) report('NOTGATED', `a row claims gate:${name}, and the chain in package.json does not run it`);
}
for (const name of inGate) {
  if (!cited.has(name)) report('ORPHAN', `${name} runs in the gate and no rule in CANON.md names it, so what it enforces is written down nowhere`);
}

// Ids run 01..n inside each prefix. A gap is usually a row deleted without a note; a repeat is a
// copy-paste. Suffixed ids (T-02a) are deliberate insertions and are not counted in the sequence.
const byPrefix = new Map();
for (const id of ids.keys()) {
  const m = /^([A-Z]{1,3}\.?[A-Z]?-)(\d+)([a-z]?)$/.exec(id);
  if (!m || m[3]) continue;
  if (!byPrefix.has(m[1])) byPrefix.set(m[1], []);
  byPrefix.get(m[1]).push(Number(m[2]));
}
for (const [prefix, nums] of [...byPrefix].sort()) {
  nums.sort((a, b) => a - b);
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === nums[i - 1]) report('SEQ', `${prefix}${nums[i]} is used twice`);
    else if (nums[i] !== nums[i - 1] + 1) report('SEQ', `${prefix} jumps ${nums[i - 1]} to ${nums[i]}`);
  }
}

const prefixCensus = [...byPrefix].sort().map(([p, n]) => `${p}${n.length}`).join(', ');
console.log(`canonrows check: ${ids.size} rules, ${cited.size} check(s) cited, ${inGate.size} in the gate`);
console.log(`  per prefix: ${prefixCensus}`);
if (verbose) for (const [id, rest] of ids) console.log(`  ${id.padEnd(10)} ${rest.slice(0, 90)}`);
if (findings.length) {
  for (const f of findings) console.log(f);
  console.error(`\ncanonrows check FAILED: ${findings.length} row(s) do not match the harness`);
  process.exit(1);
}
console.log('canonrows check OK: every rule that claims a check names one the gate really runs');
