#!/usr/bin/env node
// check-canon.mjs: static guard for the workloads + control + network packet-motion canon.
//
// smoke-all runs the cards under reduced motion (no console errors), but neither it
// nor any runtime check catches a card drifting BACK to the patterns the 2026-06-11
// harmonization removed. This is a pure source lint over
// scheme/js/schemes/{workloads,control,network}-*.js, all of which are on the shared
// kit. It intentionally does NOT touch storage/scaling/security/volume:
// those cards are dead and will be rebuilt from scratch onto the kit, at which point
// add them to the COVERED regex below.
//
// Fails (exit 1) if a card:
//   1. passes an explicit dur to a MULTI-POINT route wrapper (routePacket /
//      connectorPacket / connectorPacketDir), written either as `dur:` or as the
//      `{ dur }` shorthand the network cards use. Routes must omit dur so routeDur
//      sets one speed everywhere. A deliberate narrative-pacing exception must be
//      added to ALLOW below (with a reason), so exceptions stay visible.
//   2. references a removed symbol: arrowPacket, wirePacket, pulseActiveBlocks, or a
//      per-call `ripple:` option (ripple is now unconditional).
//
// Usage: node check-canon.mjs
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMES = join(__dirname, '..', 'js', 'schemes');

// Registered narrative-pacing exceptions: "<file>:<routeWrapper>" entries allowed to
// carry an explicit dur. Add here (with a comment) when a card legitimately needs one,
// so every exception is reviewable in one place.
const ALLOW_EXPLICIT_DUR = new Set([
  // The allocate step fires three slices in one reconcile pass: a shared dur makes the
  // short centre path and the long side paths all land on their node.spec.podCIDR at the
  // same instant (the centre just moves slower). Synchronized arrival, by design.
  'network-ipam-pod-cidr.js:routePacket',
]);

const ROUTE_WRAPPERS = ['routePacket', 'connectorPacket', 'connectorPacketDir'];
const BANNED = ['arrowPacket', 'wirePacket', 'pulseActiveBlocks'];

// Grab the balanced (...) argument text of a call starting at `open` (index of "(").
function callArgs(src, open) {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (c === '(') depth++;
    else if (c === ')') { depth--; if (depth === 0) return src.slice(open + 1, i); }
  }
  return src.slice(open + 1);
}

// Categories on the shared kit and thus held to the canon. storage/scaling/security/
// volume are deliberately absent (dead cards, pending a full rebuild); add them here
// once rebuilt.
const COVERED = /^(workloads|control|network)-.*\.js$/;
const files = (await readdir(SCHEMES))
  .filter(f => COVERED.test(f))
  .sort();

const violations = [];
for (const f of files) {
  const src = await readFile(join(SCHEMES, f), 'utf8');
  const lineAt = idx => src.slice(0, idx).split('\n').length;

  // 1. explicit dur on route wrappers
  for (const w of ROUTE_WRAPPERS) {
    const re = new RegExp(`\\b${w}\\s*\\(`, 'g');
    let m;
    while ((m = re.exec(src))) {
      const args = callArgs(src, m.index + m[0].length - 1);
      // Matches both `dur: 700` and the `{ dur }` / `{ dur, ... }` shorthand. `\bdur\b`
      // will not match `duration` or `during` (no word boundary after `dur` there).
      if (/\bdur\b/.test(args) && !ALLOW_EXPLICIT_DUR.has(`${f}:${w}`)) {
        violations.push(`${f}:${lineAt(m.index)}  explicit dur on ${w}() (routes must omit dur; register an exception in ALLOW_EXPLICIT_DUR if intentional)`);
      }
    }
  }

  // 2. removed symbols
  for (const b of BANNED) {
    const re = new RegExp(`\\b${b}\\b`, 'g');
    let m;
    while ((m = re.exec(src))) violations.push(`${f}:${lineAt(m.index)}  removed symbol "${b}"`);
  }
  // per-call ripple option (ripple is unconditional now)
  const rip = /\bripple\s*:/g;
  let r;
  while ((r = rip.exec(src))) violations.push(`${f}:${lineAt(r.index)}  per-call "ripple:" option (ripple is unconditional now)`);
}

if (violations.length) {
  console.error(`canon check FAILED: ${violations.length} violation(s):`);
  for (const v of violations) console.error('  ' + v);
  process.exit(1);
}
console.log(`canon check OK: ${files.length} workloads+control+network cards clean`);
