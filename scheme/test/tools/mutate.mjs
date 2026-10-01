#!/usr/bin/env node
// mutate.mjs: prove the checks FIRE. Breaks a real card one known defect at a time and requires the
// named check to go red on it. A fourth kind of thing in this directory: `settled-dump`, `buildframe`
// and `canon` are probes that print, this one ASSERTS, and what it asserts is not a card but the
// suite.
//
//   cd scheme/test
//   npm run selftest                      every mutation
//   node tools/mutate.mjs --list          what they are, no card touched
//   node tools/mutate.mjs offedge         one of them
//   node tools/mutate.mjs --base=http://localhost:9000
//
// ===========================================================================================
// WHY THIS EXISTS
// ===========================================================================================
// Every test file in this tree carries a header saying what it is BLIND to, and that discipline is
// worth more than this file is. But a documented blind spot is a hole somebody THOUGHT OF. Nothing
// anywhere covers the other kind: a check that is supposed to see something, is cited by a rule as
// seeing it, and quietly does not.
//
// That is not hypothetical here and it has a date. `R-08a` (a poster carries no chevron) tested
// `<polygon>` alone, so a `<polyline>` V and a closed `<path>` triangle both walked past it. On
// 2026-09-05 that was five of the six chevrons in the catalog, and because the check had been
// silent about them the comment beside its allowlist asserted that only one poster drew one. A
// green run had been read as evidence for the opposite of the truth, for as long as nobody looked.
//
// 160 of the 253 rules in ../../CANON.md name a machine. How many of those machines are in the
// position `R-08a` was in is, without this file, unknown and unknowable from a green run: a check
// that sees nothing and a check that finds nothing print the same thing.
//
// ===========================================================================================
// WHAT A MUTATION HAS TO BE
// ===========================================================================================
// MINIMAL. It breaks ONE rule. A mutation that will not parse makes every file red and proves
// nothing: the run would be measuring `node --check`, not the rule.
//
// REAL. It is the defect the rule describes, written the way a person would write it by accident,
// not a synthetic string the check happens to grep for. `wire-text` moves a `wires:` write from the
// static block into `flow`, which is precisely how the nine cards that had the defect came to have
// it.
//
// NAMED. The run passes only when the target file goes red AND its output carries the axis. A red
// run for another reason is a false pass, and it is the failure mode this file is most exposed to:
// break enough of a card and something always turns red.
//
// PRE-CHECKED. Every target is run CLEAN first. A check that is already failing would credit this
// file with a detection it did not make.
//
// ===========================================================================================
// SAFETY
// ===========================================================================================
// This edits a real card in the working tree, so the original is held in memory and written back in
// a `finally`, and again from an `exit` handler and on SIGINT/SIGTERM. It is never restored with
// `git checkout --`: that restores from the INDEX and would silently discard staged-but-uncommitted
// work on the card, which is a rule this repo learned the expensive way.
//
// It also OVERWRITES `.snapshot/panel.json` with a subset walk, the same as any `SCHEME_IDS` run.
// Nothing caches that file: `npm test`, `npm run report` and `npm run all` each take a fresh walk
// as their first pipeline stage, so the next real run replaces it before reading it.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TEST_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCHEMES = join(TEST_ROOT, '..', 'js', 'schemes');

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, v = 'true'] = a.slice(2).split('='); return [k, v];
}));
const wanted = args.filter(a => !a.startsWith('--'));
const BASE = flags.base || process.env.BASE || 'http://localhost:8888';

// A card id names its folder: `network-dns-coredns` -> `network/network-dns-coredns.js` (`D-02`).
const cardPath = (id) => join(SCHEMES, id.split('-')[0], `${id}.js`);

// `replace` over `indexOf` everywhere below, and each mutation asserts its own bite: a `find` string
// that stops matching after an unrelated edit to the card would otherwise leave the source untouched
// and the run would report the check as firing on nothing.
function cut(src, find) {
  const at = src.indexOf(find);
  if (at < 0) throw new Error(`the anchor is gone from the card:\n    ${find.trim().slice(0, 90)}`);
  if (src.indexOf(find, at + 1) >= 0) throw new Error(`the anchor is not unique:\n    ${find.trim().slice(0, 90)}`);
  return at;
}
const swap = (src, find, to) => { cut(src, find); return src.replace(find, to); };
const drop = (src, find) => swap(src, find, '');

// -------------------------------------------------------------------------------------------
// THE MUTATIONS. `tier` picks what has to run: `unit` is bare Node and takes about two seconds,
// `render` needs the server and takes a walk of the one card first.
// -------------------------------------------------------------------------------------------
const MUTATIONS = [
  {
    id: 'offedge',
    rule: 'L-11',
    tier: 'unit',
    target: 'unit/spec-scene.test.mjs',
    axis: 'OFFEDGE',
    card: 'cluster-cascading-deletion',
    what: 'slides the Kubelet-to-Pod lane 22 units off the face midpoints at both of its ends',
    // 22 clears all three exemptions the check grants, and the mutation is only honest if it does:
    // TOL (6 units), FACE_FRAC (18% of the face it lands on, so 14.4 on the 80-tall Kubelet and
    // 19.1 on the 106-tall Pod) and L-12 (a MIRRORED pair, which two offsets of the same sign are
    // not). An earlier aim at +9 sat inside FACE_FRAC and read as a blind check rather than as a
    // tolerance working, which is the false positive this file has to be written against.
    apply: (s) => swap(s,
      'const STOP_POD    = [[KUBELET_R, LANE_Y], [POD_X, LANE_Y]];',
      'const STOP_POD    = [[KUBELET_R, LANE_Y + 22], [POD_X, LANE_Y + 22]];'),
  },
  {
    id: 'carried',
    rule: 'A-05',
    tier: 'unit',
    target: 'unit/lane-shared.test.mjs',
    axis: 'A05-CARRIED',
    card: 'cluster-cascading-deletion',
    what: 'sends the SIGTERM ball down a lane it does not belong to, leaving the drawn one with a marker and no traffic',
    apply: (s) => swap(s,
      "F.route({ points: STOP_POD, name: 'sigterm' }),",
      "F.route({ points: FROM_NODE, name: 'sigterm' }),"),
  },
  {
    id: 'wire-text',
    rule: 'T-30',
    tier: 'render',
    target: 'render/reduced.test.mjs',
    axis: 'WIRE-TEXT',
    card: 'network-dns-coredns',
    what: 'moves the answer wire label out of the static block into flow, so prev and reset draw a blank lane',
    apply: (s) => {
      let out = drop(s, "\n    wires: { a: 'A 10.96.0.20' },");
      return swap(out,
        "      F.segment({ from: ANSWER[0], to: ANSWER[1], name: 'a' }),",
        "      F.set({ delay: 300, wires: { a: 'A 10.96.0.20' } }),\n" +
        "      F.segment({ from: ANSWER[0], to: ANSWER[1], name: 'a' }),");
    },
  },
  {
    id: 'phase',
    rule: 'C-04',
    tier: 'render',
    target: 'render/opacity.test.mjs',
    axis: 'PHASE',
    card: 'cluster-cascading-deletion',
    what: 'pins the Pod at a hand-typed 0.35, a shade the opacity vocabulary does not hold',
    // Aimed at a step that PINS and does not animate the Pod, so the mutation breaks the vocabulary
    // rule and nothing else. The two later steps pin the same key beside an F.fade, and a shade
    // typed there would redden reduced.test.mjs as well and stop being one defect.
    apply: (s) => swap(s,
      'opacity: { placedPod: 1, kubeletPodArrow: 1 },',
      'opacity: { placedPod: 0.35, kubeletPodArrow: 1 },'),
  },
  {
    id: 'opacity-own',
    rule: 'S-15',
    tier: 'render',
    target: 'render/reduced.test.mjs',
    axis: 'OPACITY-OWN',
    card: 'cluster-cascading-deletion',
    what: 'animates the Pod away without pinning it above the reduced guard, so prev and reset leave it standing',
    apply: (s) => swap(s,
      'opacity: { placedPod: 0, kubeletPodArrow: 0 },',
      'opacity: { kubeletPodArrow: 0 },'),
  },
];

// -------------------------------------------------------------------------------------------
const run = (cmd, argv, env) => spawnSync(cmd, argv, {
  cwd: TEST_ROOT,
  encoding: 'utf8',
  env: { ...process.env, BASE, ...env },
});

// A tier is a LIST of commands, all of which have to exit 0 for a clean baseline, and the LAST of
// which is the one whose failure counts. The walk is a pipeline stage and not the check: a walk that
// dies on a mutated card would otherwise be read as the rule firing.
function execute(m) {
  const env = { SCHEME_IDS: m.card };
  const stages = m.tier === 'render'
    ? [['node', ['tools/walk.mjs']], ['node', ['--test', m.target]]]
    : [['node', ['--test', m.target]]];
  let last = null;
  for (const [cmd, argv] of stages) {
    last = run(cmd, argv, env);
    const isCheck = argv[0] === '--test';
    if (last.status !== 0 && !isCheck) {
      return { ok: false, stage: argv.join(' '), out: `${last.stdout || ''}${last.stderr || ''}` };
    }
  }
  return { ok: true, status: last.status, out: `${last.stdout || ''}${last.stderr || ''}` };
}

function selfTest(m) {
  const file = cardPath(m.card);
  const original = readFileSync(file, 'utf8');
  let restored = false;
  const restore = () => {
    if (restored) return;
    restored = true;
    writeFileSync(file, original);
  };
  process.on('exit', restore);
  process.on('SIGINT', () => { restore(); process.exit(130); });
  process.on('SIGTERM', () => { restore(); process.exit(143); });

  try {
    // CLEAN first. A target already red would credit the mutation with somebody else's failure.
    const before = execute(m);
    if (!before.ok) return { verdict: 'SETUP', why: `${before.stage} failed before the card was touched`, out: before.out };
    if (before.status !== 0) {
      return { verdict: 'DIRTY', why: `${m.target} is already red on ${m.card}, so nothing here can be attributed`, out: before.out };
    }

    let mutated;
    try { mutated = m.apply(original); } catch (e) { return { verdict: 'ANCHOR', why: e.message }; }
    if (mutated === original) return { verdict: 'ANCHOR', why: 'apply() returned the source unchanged' };
    writeFileSync(file, mutated);

    const after = execute(m);
    restore();
    if (!after.ok) return { verdict: 'SETUP', why: `${after.stage} failed on the mutated card`, out: after.out };
    if (after.status === 0) {
      return { verdict: 'BLIND', why: `${m.target} stayed GREEN over ${m.rule} broken on ${m.card}`, out: after.out };
    }
    if (!after.out.includes(m.axis)) {
      return { verdict: 'WRONG', why: `${m.target} went red and never printed "${m.axis}", so it failed for another reason`, out: after.out };
    }
    return { verdict: 'CAUGHT' };
  } finally {
    restore();
  }
}

// -------------------------------------------------------------------------------------------
if (flags.list) {
  console.log('');
  for (const m of MUTATIONS) {
    console.log(`  ${m.id.padEnd(12)} ${m.rule.padEnd(6)} ${m.target.padEnd(28)} ${m.axis}`);
    console.log(`  ${''.padEnd(12)} on ${m.card}: ${m.what}`);
    console.log('');
  }
  process.exit(0);
}

const selected = wanted.length ? MUTATIONS.filter(m => wanted.includes(m.id)) : MUTATIONS;
if (!selected.length) {
  console.error(`no mutation named ${wanted.join(', ')}. --list prints them.`);
  process.exit(2);
}

console.log('');
console.log(`mutate: ${selected.length} mutation(s), base ${BASE}`);
console.log('');

const failed = [];
for (const m of selected) {
  process.stdout.write(`  ${m.id.padEnd(12)} ${m.rule.padEnd(6)} ${m.axis.padEnd(14)} ... `);
  const r = selfTest(m);
  console.log(r.verdict);
  if (r.verdict !== 'CAUGHT') {
    failed.push({ m, r });
    console.log(`               ${r.why}`);
  }
}

console.log('');
if (!failed.length) {
  console.log(`  all ${selected.length} caught: every mutation turned its named check red, on its named axis.`);
  console.log('');
  process.exit(0);
}

for (const { m, r } of failed) {
  console.log(`  ${r.verdict}  ${m.id} (${m.rule})  ${r.why}`);
  if (r.out) console.log(r.out.split('\n').filter(l => /^not ok|Error|Cannot|failed/.test(l)).slice(0, 6).map(l => `      ${l}`).join('\n'));
}
console.log('');
console.log('  BLIND is the finding this file exists for: a rule cites a machine that does not see it.');
console.log('  WRONG means the mutation is too broad, and is a defect in THIS file, not in the suite.');
console.log('  ANCHOR means the card moved under a mutation: re-aim it, do not delete it.');
console.log('');
process.exit(1);
