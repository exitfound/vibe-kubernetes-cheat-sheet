#!/usr/bin/env node
// Proves the checks fire: breaks a real card one known defect at a time and requires the named check
// to go red on its axis, after a clean pre-check. Restores the card from memory, never git checkout.
// npm run selftest | node tools/mutate.mjs [--list] [name] [--base=URL]
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

// A card id names its folder (D-02).
const cardPath = (id) => join(SCHEMES, id.split('-')[0], `${id}.js`);

// Each mutation asserts its own bite, so a stale `find` cannot report a check firing on nothing.
function cut(src, find) {
  const at = src.indexOf(find);
  if (at < 0) throw new Error(`the anchor is gone from the card:\n    ${find.trim().slice(0, 90)}`);
  if (src.indexOf(find, at + 1) >= 0) throw new Error(`the anchor is not unique:\n    ${find.trim().slice(0, 90)}`);
  return at;
}
const swap = (src, find, to) => { cut(src, find); return src.replace(find, to); };
const drop = (src, find) => swap(src, find, '');

// `unit` is bare Node, `render` needs the server and walks the one card first.
const MUTATIONS = [
  {
    id: 'offedge',
    rule: 'L-11',
    tier: 'unit',
    target: 'unit/spec-scene.test.mjs',
    axis: 'OFFEDGE',
    card: 'cluster-cascading-deletion',
    what: 'slides the Kubelet-to-Pod lane 22 units off the face midpoints at both of its ends',
    // 22 clears all three exemptions: TOL, FACE_FRAC on both faces, and L-12 (same-sign offsets are no pair).
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
        "      F.segment({ from: ANSWER[0], to: ANSWER[1], name: 'a', pulse: 'client' }),",
        "      F.set({ delay: 300, wires: { a: 'A 10.96.0.20' } }),\n" +
        "      F.segment({ from: ANSWER[0], to: ANSWER[1], name: 'a', pulse: 'client' }),");
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
    // A step that pins without animating the Pod, so only the vocabulary rule breaks.
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

const run = (cmd, argv, env) => spawnSync(cmd, argv, {
  cwd: TEST_ROOT,
  encoding: 'utf8',
  env: { ...process.env, BASE, ...env },
});

// Every command must exit 0 clean. Only the last one's failure counts, so a dying walk is not read as the rule firing.
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
    // A target already red would credit the mutation with somebody else's failure.
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
