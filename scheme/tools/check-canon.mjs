#!/usr/bin/env node
// check-canon.mjs: source lint for the packet-motion canon over all four card families.
// Rules, what each catches and why, are documented in scheme/CLAUDE.md (Dev tools).
// node check-canon.mjs        CANON_VERBOSE=1 lists every report-only finding
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMES = join(__dirname, '..', 'js', 'schemes');

// Cards allowed an explicit dur on a route wrapper. One line of reason each, so every
// exception stays reviewable in one place.
const ALLOW_EXPLICIT_DUR = new Set([
  // Three slices in one reconcile pass land together: shared dur, centre just moves slower.
  'network-ipam-pod-cidr.js:routePacket',
  // Three report balls into one CSINode box: flanks run 136 units against 48, shared dur lands them together.
  'storage-volume-attach-limits.js:routePacket',
  // Fan slowed by routeDur * FAN_SLOW so the src-IP tag stays legible. Still distance-normalized.
  'network-traffic-distribution.js:routePacket',
  // The deliver hop is slowed to DELIVER_DUR so the src-IP tag riding the ball stays legible. The
  // riding label uses the same dur so it stays locked to the packet.
  'network-ebpf-dataplane.js:routePacket',
  // The opening range-split is slowed to SPLIT_DUR and both packets share it, so the divide into a
  // static and a dynamic band is easy to follow and the two bands light up together.
  'network-service-cidr.js:routePacket',
  // All packets at routeDur * SLOWMO (10% slower) so the IP tags on both round trips stay legible.
  'network-service-clusterip.js:routePacket',
  // decide -> Pod pulse -> bind paced by DECIDE_DUR / BIND_DUR so the pulse fits between the balls.
  'storage-csi-capacity-tracking.js:routePacket',
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

// Categories on the shared kit and thus held to the canon: currently the whole
// catalog. Add a new category here once its cards are on the kit.
const COVERED = /^(workloads|cluster|network|storage)-.*\.js$/;
const files = (await readdir(SCHEMES))
  .filter(f => COVERED.test(f))
  .sort();

// ---- report-only rules ----
// A new rule prints but does not fail, so the gate stays a signal while its queue drains.
// Move its id into ENFORCED once that list is empty.
const ENFORCED = new Set([
  // Empty queue on arrival: no card imports pulse from primitives, they all go through
  // the kit's pulsePod. Enforced immediately so it can only ever be a regression.
  'R-rawpulse',
  // Queue drained: matching a tag to its ball by their shared points array cut 33 findings to 0.
  'R-ridinglabel',
  // Empty on arrival: all four kits re-export the same 26 names today.
  'R-kitparity',
]);
const advisories = [];
const violations = [];
const report = (rule, msg) => (ENFORCED.has(rule) ? violations : advisories).push(`[${rule}] ${msg}`);

// The two dash characters are built from their code points on purpose: writing either
// one literally would make this file a violation of the rule it enforces.
const EM_DASH = String.fromCharCode(0x2014);
const EN_DASH = String.fromCharCode(0x2013);
const DASH_RE = new RegExp(`[${EM_DASH}${EN_DASH}]`, 'g');
const DASH_NAME = { [EM_DASH]: 'em-dash', [EN_DASH]: 'en-dash' };
const OPACITY_VOCAB = new Set(['1', '0.8', '0.55', '0.4', '0.35', '0.3']);
const CANON_VIEWBOX = '0 0 1200 640';

// Blank comments out, keeping byte offsets so line numbers stay right. Load-bearing: this
// project's prose names the very things the rules hunt for. Strings are kept, labels live there.
function stripComments(src) {
  let out = '';
  // 0 code, 1 line comment, 2 block comment, 3 single quote, 4 double quote, 5 template, 6 regex
  let mode = 0;
  // A regex literal can hold `//` (a URL pattern), which read as a comment start and blanked the
  // rest of that line for every code rule. `prev` tells a literal from a division operator.
  let prev = '';
  for (let i = 0; i < src.length;) {
    const c = src[i], c2 = src[i + 1];
    if (mode === 0) {
      if (c === '/' && c2 === '/') { mode = 1; out += '  '; i += 2; continue; }
      if (c === '/' && c2 === '*') { mode = 2; out += '  '; i += 2; continue; }
      if (c === '/' && !'})]'.includes(prev) && !/[\w$]/.test(prev)) { mode = 6; out += c; i++; continue; }
      if (c === "'") mode = 3; else if (c === '"') mode = 4; else if (c === '`') mode = 5;
      if (!/\s/.test(c)) prev = c;
      out += c; i++; continue;
    }
    if (mode === 6) {
      if (c === '\\') { out += c + (c2 === undefined ? '' : c2); i += 2; continue; }
      if (c === '/') { mode = 0; prev = c; }
      if (c === '\n') mode = 0;                 // unterminated: bail rather than eat the file
      out += c; i++; continue;
    }
    if (mode === 1) { if (c === '\n') { mode = 0; out += c; } else out += ' '; i++; continue; }
    if (mode === 2) {
      if (c === '*' && c2 === '/') { mode = 0; out += '  '; i += 2; continue; }
      out += (c === '\n' ? c : ' '); i++; continue;
    }
    if (c === '\\') { out += c + (c2 === undefined ? '' : c2); i += 2; continue; }
    if ((mode === 3 && c === "'") || (mode === 4 && c === '"') || (mode === 5 && c === '`')) mode = 0;
    out += c; i++;
  }
  return out;
}

for (const f of files) {
  const src = await readFile(join(SCHEMES, f), 'utf8');
  // Rules about CODE read `code`; rules about the whole file (R-dash) read `src`.
  const code = stripComments(src);
  const lineAt = idx => src.slice(0, idx).split('\n').length;

  // 1. explicit dur on route wrappers
  for (const w of ROUTE_WRAPPERS) {
    const re = new RegExp(`\\b${w}\\s*\\(`, 'g');
    let m;
    while ((m = re.exec(code))) {
      const args = callArgs(code, m.index + m[0].length - 1);
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
    while ((m = re.exec(code))) violations.push(`${f}:${lineAt(m.index)}  removed symbol "${b}"`);
  }
  // per-call ripple option (ripple is unconditional now)
  const rip = /\bripple\s*:/g;
  let r;
  while ((r = rip.exec(code))) violations.push(`${f}:${lineAt(r.index)}  per-call "ripple:" option (ripple is unconditional now)`);

  // 3. no em-dash or en-dash. Project-wide writing rule, and in a value string it also
  //    reaches the canvas: a chip reading "-" is a rendered em-dash, not a comment.
  let d;
  while ((d = DASH_RE.exec(src))) {
    report('R-dash', `${f}:${lineAt(d.index)}  ${DASH_NAME[d[0]]} (project rule: never, anywhere)`);
  }

  // 4. canonical viewBox. A shifted camera is how an off-centre composition gets hidden
  //    instead of fixed, and it silently rescales the card against its siblings.
  const vb = code.match(/viewBox:\s*'([^']+)'/);
  if (vb && vb[1] !== CANON_VIEWBOX) {
    report('R-viewbox', `${f}:${lineAt(vb.index)}  viewBox '${vb[1]}' (canon is '${CANON_VIEWBOX}'; re-centre the content, do not move the camera)`);
  }

  // 5. a tag must ride with its ball's easing. Tag and ball share one points array, so look that
  //    array up among the packet calls and read whether THAT ball is linear.
  {
    const bind = code.match(/makeRidingLabel\s*\(/);
    const boundLinear = bind
      ? /easing:\s*'linear'/.test(callArgs(code, bind.index + bind[0].length - 1))
      : false;

    // points identifier -> 'linear' | 'eased', from every packet call on the card.
    const flavour = new Map();
    // segmentPacket(s, ctx, { from: PTS[0], to: PTS[1], ... }) is linear by definition.
    for (const m2 of code.matchAll(/\bsegmentPacket\s*\(([\s\S]{0,200}?)\)/g)) {
      const id = m2[1].match(/from:\s*([A-Za-z_$][\w$]*)\s*\[/);
      if (id) flavour.set(id[1], 'linear');
    }
    // routePacket(s, ctx, PTS, ...) and the connector wrappers are eased.
    for (const m2 of code.matchAll(/\b(?:routePacket|connectorPacket|connectorPacketDir)\s*\(\s*s\s*,\s*ctx\s*,\s*([A-Za-z_$][\w$]*)/g)) {
      if (!flavour.has(m2[1])) flavour.set(m2[1], 'eased');
    }

    for (const m2 of code.matchAll(/\bridingLabel\s*\(\s*s\s*,\s*ctx\s*,[\s\S]{0,160}?,\s*([A-Za-z_$][\w$]*)\s*[,)]/g)) {
      const pts = m2[1];
      const args = callArgs(code, code.indexOf('(', m2.index));
      if (/\beasing\b/.test(args) || boundLinear) continue;
      if (flavour.get(pts) !== 'linear') continue;      // eased ball, or no ball found: nothing to name
      report('R-ridinglabel', `${f}:${lineAt(m2.index)}  ridingLabel() on ${pts} rides the LINEAR segmentPacket built from the same array, with no easing named at the call or at the makeRidingLabel binding: the tag drifts off its ball mid-flight`);
    }
  }

  // 6. no direct pulse() from primitives in a card: only pods pulse, and they pulse
  //    through the kit's pulsePod. \bpulse\b does not match pulsePod / pulsePodDim.
  const rp = /\bpulse\s*\(/g;
  let m3;
  while ((m3 = rp.exec(code))) {
    report('R-rawpulse', `${f}:${lineAt(m3.index)}  direct pulse() (blocks never pulse; pods pulse via the kit's pulsePod)`);
  }

  // 7. element opacity must come from the OPACITY vocabulary. Report-only until the fade-phase
  //    vocabulary is settled: the off-vocabulary values are the evidence for what it needs.
  const op = /(?<![-\w])opacity\s*[:=]\s*'?(0?\.\d+|0|1)'?/g;
  let m4;
  while ((m4 = op.exec(code))) {
    const v = String(parseFloat(m4[1]));
    if (v !== '0' && !OPACITY_VOCAB.has(v)) {
      report('R-opacity', `${f}:${lineAt(m4.index)}  literal opacity ${v} outside the OPACITY vocabulary`);
    }
  }
}

// ---- R-kitparity ----
// The four kits re-export the same list on purpose (it documents the boundary), so it must not
// drift. Why not `export *`: scheme/CLAUDE.md, Card construction standard.
{
  const KITS = ['workloads-kit.js', 'cluster-kit.js', 'network-kit.js', 'storage-kit.js'];
  const LIB = join(__dirname, '..', 'js', 'lib');
  const sets = new Map();
  for (const k of KITS) {
    let src;
    try { src = await readFile(join(LIB, k), 'utf8'); }
    catch (_) { report('R-kitparity', `${k}: missing`); continue; }
    const m = stripComments(src).match(/export \{([^}]*)\} from '\.\/scheme-kit\.js';/);
    if (!m) { report('R-kitparity', `${k}: no re-export block from scheme-kit.js`); continue; }
    sets.set(k, new Set(m[1].split(',').map(n => n.trim()).filter(Boolean)));
  }
  const [ref, refNames] = [...sets.entries()][0] || [];
  for (const [k, names] of sets) {
    if (k === ref) continue;
    const extra = [...names].filter(n => !refNames.has(n)).sort();
    const missing = [...refNames].filter(n => !names.has(n)).sort();
    if (extra.length || missing.length) {
      report('R-kitparity', `${k} re-exports a different set than ${ref}` +
        (missing.length ? `, missing: ${missing.join(', ')}` : '') +
        (extra.length ? `, extra: ${extra.join(', ')}` : ''));
    }
  }
}

// ---- R-dash beyond the cards ----
// Scope agreed with the author: scheme/ plus the cli/ and root files listed below, nothing else.
const ROOT = join(__dirname, '..', '..');
const dashTargets = [
  'scheme/js/data.js', 'scheme/js/app.js', 'scheme/js/posters.js', 'scheme/js/contacts.js',
  'scheme/index.html',
  'cli/js/data.js', 'cli/js/app.js', 'cli/css/styles.css',
  'index.html', 'README.md',
];
for (const dir of ['scheme/js/lib', 'scheme/css']) {
  for (const n of await readdir(join(ROOT, dir))) {
    if (/\.(js|css)$/.test(n)) dashTargets.push(`${dir}/${n}`);
  }
}
for (const rel of dashTargets.sort()) {
  let src;
  try { src = await readFile(join(ROOT, rel), 'utf8'); } catch (_) { continue; }
  const lineAt = idx => src.slice(0, idx).split('\n').length;
  DASH_RE.lastIndex = 0;
  let d;
  while ((d = DASH_RE.exec(src))) report('R-dash', `${rel}:${lineAt(d.index)}  ${DASH_NAME[d[0]]} (project rule: never, anywhere)`);
}

if (advisories.length) {
  const byRule = new Map();
  for (const a of advisories) {
    const rule = a.slice(1, a.indexOf(']'));
    byRule.set(rule, (byRule.get(rule) || 0) + 1);
  }
  console.log(`canon advisories (report-only, ${advisories.length} finding(s) across ${byRule.size} rule(s)):`);
  for (const [rule, n] of [...byRule].sort((a, b) => b[1] - a[1])) console.log(`  ${rule.padEnd(16)} ${n}`);
  console.log('  (CANON_VERBOSE=1 lists every finding; a rule moves into ENFORCED once its list is empty)');
  if (process.env.CANON_VERBOSE) for (const a of advisories) console.log('    ' + a);
}

if (violations.length) {
  console.error(`canon check FAILED: ${violations.length} violation(s):`);
  for (const v of violations) console.error('  ' + v);
  process.exit(1);
}
console.log(`canon check OK: ${files.length} workloads+cluster+network+storage cards clean`);
