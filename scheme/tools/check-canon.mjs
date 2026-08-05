#!/usr/bin/env node
// check-canon.mjs: source lint for the packet-motion canon over all four card families.
// Rules, what each catches and why, are documented in scheme/CLAUDE.md (Dev tools).
// node check-canon.mjs        CANON_VERBOSE=1 lists every report-only finding
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
// stripComments comes from prose.mjs, the same place `sentences` does. It used to be a second copy
// here, and prose.mjs's was that copy minus the regex-literal mode, which silently shrank the input
// of every check that reads a stripped source. One copy cannot drift from itself.
import { sentences, stripComments } from './prose.mjs';
import { cards, folderModules } from './catalog.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

// Read the expression an `opacity:` / `opacity =` is set to, stopping at the comma, semicolon or
// closing bracket that ends it AT DEPTH ZERO. A flat scan to the next comma or paren truncates
// `lanes.includes(k) ? '1' : '0'` into `lanes.includes(k`, which is how the first version of the
// rule reported seven ternaries that resolve to 0 and 1.
function opExpr(src, i) {
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) { if (depth === 0) return src.slice(i, j).trim(); depth--; }
    else if (depth === 0 && (c === ',' || c === ';' || c === '\n')) return src.slice(i, j).trim();
  }
  return src.slice(i).trim();
}

// The whole catalog is on the shared kit, so the whole catalog is held to the canon. The list
// comes from data.js rather than a name regex over a directory listing: a regex of the shape
// /^(workloads|cluster|network|storage)-.*\.js$/ matches nothing once cards sit in subfolders
// (a directory name has no '.js'), and it would also start matching a kit that moved in beside
// them. `base` stays the bare filename because every message below and every ALLOW_EXPLICIT_DUR
// key is written in terms of it. cards() itself refuses to return a partial catalog.
const files = await cards();

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
  // Queue drained by the B2 text pass, and the band was widened on 2026-07-26 to 400-470.
  'R-desc',
  // Queue drained: 44 dashes replaced across the agreed lint area (scheme/ plus the named cli/
  // and root files). the design records (`CARDS.md`, `INTERNALS.md`) are deliberately outside that area, see the note below.
  'R-dash',
  'R-srclabel',
  'R-srcdup',
  // Queue drained by the R4 fade-phase pass, and the rule was rewritten to judge the EXPRESSION
  // rather than the number, so a named constant can no longer smuggle a shade past it.
  'R-opacity',
  // Queue drained by the R5 cluster rebuild: all 108 cards are on '0 0 1200 640' now, so a
  // shifted camera can only ever be a regression.
  'R-viewbox',
  // Enforced on arrival: it states the convention that replaced data.js's `module` field, and it
  // was clean the moment the field was deleted. Anything it finds is a card the browser cannot
  // import or a file nothing reads.
  'R-modulepath',
  // Enforced on arrival: 108 cards, 108 posters, an exact bijection the day the map was split.
  'R-poster',
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
const CANON_VIEWBOX = '0 0 1200 640';

// stripComments (imported above) blanks comments keeping byte offsets, so line numbers stay right.
// Load-bearing: this project's prose names the very things the rules hunt for. Strings are kept,
// labels live there.

for (const { base: f, path } of files) {
  const src = await readFile(path, 'utf8');
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

  // 7. element opacity reads the EXPRESSION, not the number. A card writes a bare 0 or 1 (an
  //    element is drawn or it is not) and takes every shade in between from OPACITY. Judging the
  //    number was the old rule's flaw: it blessed a value that happened to match while staying
  //    blind to `const GONE = 0.1`, which is where most of the drift lived.
  //    What it still does NOT catch: the bare-identifier guard below skips ANY name as an assumed
  //    helper parameter, so a module-level `const GONE = 0.1; ... opacity: GONE` passes silently,
  //    and so does any shade reaching an element through a parameter. Only check-opacity, which
  //    resolves both in the browser, closes that. Do not read a green R-opacity as a clean card.
  const op = /(?<![-\w])opacity\s*[:=]\s*/g;
  let m4;
  while ((m4 = op.exec(code))) {
    const expr = opExpr(code, m4.index + m4[0].length);
    if (/^'?[01](\.0+)?'?$/.test(expr)) continue;        // 0 and 1 are "not drawn" / "drawn"
    if (/\bOPACITY\./.test(expr)) continue;             // straight out of the vocabulary
    if (/^[A-Za-z_$][\w$.[\]]*$/.test(expr) && !/^'/.test(expr)) continue;  // a parameter: check-opacity resolves it
    if (/^String\([A-Za-z_$][\w$.[\]()]*\)$/.test(expr)) continue;   // same, wrapped
    if (!/\d*\.\d+/.test(expr)) continue;              // no shade in it at all: 0 / 1 / a ternary over them
    report('R-opacity', `${f}:${lineAt(m4.index)}  opacity ${expr} is neither 0, 1, nor an OPACITY.* shade`);
  }
}

// ---- R-kitparity ----
// The four kits re-export the same list on purpose (it documents the boundary), so it must not
// drift. Why not `export *`: scheme/CLAUDE.md, Card construction standard.
{
  // Each kit lives beside the cards it serves, so the path carries its category. The specifier in
  // the match below is left open ('[^']*scheme-kit.js') rather than pinned to './scheme-kit.js':
  // pinning it means the rule stops finding the re-export block the moment a kit changes depth,
  // and reports "no re-export block" for all four, which reads as drift rather than as a moved file.
  const CATS = ['workloads', 'cluster', 'network', 'storage'];
  const sets = new Map();
  for (const c of CATS) {
    const k = `${c}-kit.js`;
    let src;
    try { src = await readFile(join(__dirname, '..', 'js', 'schemes', c, k), 'utf8'); }
    catch (_) { report('R-kitparity', `${k}: missing`); continue; }
    const m = stripComments(src).match(/export \{([^}]*)\} from '[^']*scheme-kit\.js';/);
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

// ---- R-modulepath ----
// data.js no longer stores a path. app.js imports `./schemes/${category}/${id}.js` and catalog.mjs
// builds the same string for every linter, so the convention IS the wiring and has to be checked
// rather than assumed. Two halves, and only the first one is obvious:
//   catalog -> disk  every catalogued card resolves to a file whose id starts with its category.
//                    The id prefix is not decoration: it is the folder name. This can genuinely
//                    break, and once did, when workloads-pod-priority-preemption became
//                    cluster-pod-priority-preemption.
//   disk -> catalog  no .js under a category folder that the catalog does not claim. This half
//                    used to come free: every check walked the directory, so a stray card was
//                    linted like any other and check-notes said NO NOTE about it. Now that the
//                    walkers read data.js, a file nobody lists is a file nobody reads, and the
//                    grid never renders it either. Without this line it would be invisible.
// The non-card modules a category folder may hold are named by folderModules in catalog.mjs.
{
  const { SCHEMES } = await import(pathToFileURL(join(__dirname, '..', 'js', 'data.js')).href);
  const SCHEMES_DIR = join(__dirname, '..', 'js', 'schemes');
  const claimed = new Set();
  for (const s of SCHEMES) {
    // A leftover `module` field means this data.js predates the convention, which in practice means
    // a revert or a bad merge put an old copy back. Worth a line of its own because the field is
    // now read by nobody: app.js derives the path and so does catalog.mjs, so the whole catalog
    // can quietly regain a dead field and every check in this gate stays green over it. That is
    // not hypothetical, it happened once during the refactor that removed the field.
    if (s.module !== undefined) report('R-modulepath', `${s.id}  still carries a module field ("${s.module}"), which nothing reads: the path is derived from category + id`);
    const prefix = s.id.split('-')[0];
    if (prefix !== s.category) {
      report('R-modulepath', `${s.id}  id starts with "${prefix}" but category is "${s.category}", so app.js would import js/schemes/${s.category}/${s.id}.js`);
      continue;
    }
    claimed.add(`${s.category}/${s.id}.js`);
  }
  for (const c of [...new Set(SCHEMES.map(s => s.category))].sort()) {
    const allowed = folderModules(c);
    let entries;
    try { entries = await readdir(join(SCHEMES_DIR, c)); }
    catch (_) { report('R-modulepath', `${c}: no such folder, but ${SCHEMES.filter(s => s.category === c).length} card(s) claim it`); continue; }
    for (const n of entries) {
      if (!n.endsWith('.js') || allowed.has(n)) continue;
      if (!claimed.has(`${c}/${n}`)) report('R-modulepath', `js/schemes/${c}/${n}  is on disk but no SCHEMES entry claims it (nothing lints it and the grid never shows it)`);
    }
  }
}

// ---- R-poster ----
// Every card has a poster and every poster has a card. Cheap, and nothing else covers it:
// renderPoster resolves `POSTERS[scheme.id] || FALLBACK_POSTER`, so a card whose poster went
// missing draws the generic placeholder instead of failing. The grid still renders 108 cards,
// smoke-all still passes, and both oracles look inside the DIALOG, never at the grid thumbnail.
// A dropped key is invisible end to end, which is precisely the shape of defect worth a rule.
{
  const { SCHEMES } = await import(pathToFileURL(join(__dirname, '..', 'js', 'data.js')).href);
  const { POSTERS } = await import(pathToFileURL(join(__dirname, '..', 'js', 'posters.js')).href);
  const ids = new Set(SCHEMES.map(s => s.id));
  for (const s of SCHEMES) if (!(s.id in POSTERS)) report('R-poster', `${s.id}  has no poster, so the grid draws FALLBACK_POSTER for it`);
  for (const k of Object.keys(POSTERS)) if (!ids.has(k)) report('R-poster', `${k}  is a poster with no card, so nothing ever renders it`);
}

// ---- R-desc ----
// One catalog-wide band for the card description. Target 410-460 characters, with 10 characters of
// slack either side when a description genuinely will not fit, so the hard range is 400-470.
// Widened from 400-420 on 2026-07-26: that ceiling was forcing qualifiers out of descriptions and
// was directly responsible for 29 technical defects, because a dropped condition leaves an absolute
// standing. Sentences stay at 3 with a tolerance of one.
{
  const { SCHEMES } = await import(pathToFileURL(join(__dirname, '..', 'js', 'data.js')).href);
  for (const s of SCHEMES) {
    const len = s.desc.length;
    const n = sentences(s.desc).length;
    if (len < 400 || len > 470) report('R-desc', `${s.id}  desc is ${len} chars (hard range is 400-470, target 410-460)`);
    if (n < 2 || n > 4) report('R-desc', `${s.id}  desc is ${n} sentences (3, tolerance one)`);
  }
}

// ---- R-srclabel / R-srcdup ----
// Two invariants of the sources layer, both read only data.js so they stay deterministic and can
// live in the gate. Written after a hand pass found four defects the label-vs-heading heuristic
// could never state: that heuristic gave 66 findings out of 194 and is a report, these are rules.
//   R-srclabel  one URL carries one label across the whole catalog. It caught
//               pod-lifecycle/#pod-termination spelled three ways, one of them naming the page
//               while pointing into a section.
//   R-srcdup    no card may show two sources under the same label, which would render as
//               `Sources: Gateway API - Gateway API` in the dialog footer.
{
  const { SCHEMES } = await import(pathToFileURL(join(__dirname, '..', 'js', 'data.js')).href);
  const byHref = new Map();
  for (const sc of SCHEMES) {
    const seen = new Set();
    for (const src of sc.sources || []) {
      if (seen.has(src.label)) report('R-srcdup', `${sc.id}  two sources share the label "${src.label}"`);
      seen.add(src.label);
      if (!byHref.has(src.href)) byHref.set(src.href, new Map());
      byHref.get(src.href).set(src.label, sc.id);
    }
  }
  for (const [href, labels] of byHref) {
    if (labels.size < 2) continue;
    const shown = [...labels].map(([l, id]) => `"${l}" (${id})`).join(' vs ');
    report('R-srclabel', `${href}  is labelled ${labels.size} ways: ${shown}`);
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
// Everything in a category folder that is NOT a card: the kit, and the manifest holding that
// category's descriptions. Cards themselves are dash-checked in the main loop above, so they are
// excluded here rather than scanned twice.
//
// Walked rather than listed, and that is the whole point. Twice during one refactor a file moved
// into these folders and silently left the dash scan behind: first the four kits when they left
// js/lib, then all 108 card descriptions when they left js/data.js for the per-category manifests.
// Neither produced a finding or an error, because this list is built from whatever a directory
// happens to hold, and the read below swallows a path that does not resolve. A walk cannot forget.
{
  const cardBases = new Set(files.map(f => f.base));
  for (const c of [...new Set(files.map(f => f.category))].sort()) {
    for (const n of await readdir(join(ROOT, 'scheme/js/schemes', c))) {
      if (/\.js$/.test(n) && !cardBases.has(n)) dashTargets.push(`scheme/js/schemes/${c}/${n}`);
    }
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
