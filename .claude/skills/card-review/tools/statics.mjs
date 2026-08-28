#!/usr/bin/env node
// statics.mjs: the source-level sweep, no browser. Dead constants, keys nothing reads, lanes drawn
// but never ridden, balls riding a path nothing draws, `lit`/`opacity`/`reset` keys that match no
// part (a silent no-op), prose mechanics, and the catalog wiring around the card.
//
//   node .claude/skills/card-review/tools/statics.mjs <card-id>
//
// EVERY LINE IS A HEURISTIC, not a verdict. It reads the card as text: confirm each hit against the
// code before acting on it, and expect a decorative part or a kit-driven key to show up here as a
// false positive. What it is good at is the opposite error, the thing no reviewer notices: a name
// that survived a refactor with nothing left reading it.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const id = process.argv[2];
if (!id) { console.error('Usage: node statics.mjs <card-id>'); process.exit(1); }

const ROOT = new URL('../../../../', import.meta.url).pathname;
const SCHEMES = join(ROOT, 'scheme/js/schemes');
let file = null, category = null;
for (const cat of readdirSync(SCHEMES)) {
  if (!statSync(join(SCHEMES, cat)).isDirectory()) continue;
  const p = join(SCHEMES, cat, `${id}.js`);
  if (existsSync(p)) { file = p; category = cat; break; }
}
if (!file) { console.error(`no card source for "${id}" under scheme/js/schemes/*/`); process.exit(1); }

const src = readFileSync(file, 'utf8');
const lines = src.split('\n');
const rel = file.slice(ROOT.length);
const out = [];
const say = (tag, msg) => out.push(`${tag.padEnd(12)} ${msg}`);

// A line index for reporting, and a body with comments blanked so a word inside a note is not read
// as a use. Strings stay: a key IS a string, and that is exactly where uses live.
const bodyLines = lines.map(l => (l.trimStart().startsWith('//') ? '' : l.replace(/\s\/\/.*$/, '')));
const body = bodyLines.join('\n');
const lineOf = (needle) => lines.findIndex(l => l.includes(needle)) + 1;
const uses = (name) => (body.match(new RegExp(`\\b${name}\\b`, 'g')) || []).length;

// A BALANCED `{...}` slice from the brace at `i`, string literals skipped. The old reader stopped at
// the first `})` within 400 characters, which a nested `inner:` or a `tune` body walks straight past.
function objectAt(src, i) {
  let depth = 0, q = null;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (q) { if (c === '\\') j++; else if (c === q) q = null; continue; }
    if (c === "'" || c === '"' || c === '`') { q = c; continue; }
    if (c === '{' || c === '[') depth++;
    else if (c === '}' || c === ']') { if (--depth === 0) return src.slice(i, j + 1); }
  }
  return src.slice(i);
}

// `key:` at depth 1 only, so a nested `inner: { ... }` cannot claim the part kind for itself.
function topKey(obj) {
  let depth = 0, q = null;
  for (let j = 0; j < obj.length; j++) {
    const c = obj[j];
    if (q) { if (c === '\\') j++; else if (c === q) q = null; continue; }
    if (c === "'" || c === '"' || c === '`') { q = c; continue; }
    if (c === '{' || c === '[') { depth++; continue; }
    if (c === '}' || c === ']') { depth--; continue; }
    if (depth === 1 && obj.startsWith('key:', j)) {
      const m = /^key:\s*'([\w-]+)'/.exec(obj.slice(j));
      if (m) return m[1];
    }
  }
  return null;
}

// Keys of an object literal with its string VALUES blanked first. Without that blanking
// `wires: { kr: 'PullImage · nginx:1.27' }` reads `nginx` as a second key and reports it as a ghost.
// A quoted string followed by a colon is a KEY, not a value, and survives: hyphenated keys need one.
const keysOf = (obj) => [...obj.replace(/'(?:[^'\\]|\\.)*'(\s*:)?/g, (m, colon) => (colon ? m : "''"))
  .matchAll(/(?:^|[{,])\s*(?:'([\w-]+)'|([A-Za-z_$][\w$]*))\s*:/g)].map(m => m[1] || m[2]);

// ---- dead constants -------------------------------------------------------------------------
for (const m of body.matchAll(/^const\s+([A-Za-z_$][\w$]*)\s*=/gm)) {
  if (uses(m[1]) <= 1) say('DEAD-CONST', `${rel}:${lineOf(`const ${m[1]}`)}  ${m[1]} is declared and never read`);
}
for (const m of body.matchAll(/^const\s*\{([^}]*)\}\s*=/gm)) {
  for (const raw of m[1].split(',')) {
    const name = raw.split(':').pop().trim();
    if (name && uses(name) <= 1) say('DEAD-CONST', `${rel}  destructured ${name} is never read`);
  }
}

// ---- part keys, and the fields that address them ----------------------------------------------
// Keys minted by a CARD-LOCAL helper (`lane('laneEtcdOut', POINTS)`) are invisible here: this reads
// `key:` literals only. That is a known hole, not a claim that such a card has no keys.
// A wire and a box may SHARE a name: they land in refs.wires and refs, two buckets. So a name maps
// to a SET of kinds, and a single-kind map loses the wire half of `key: 'kernel'` twice over.
const partCalls = [];
const kindsOf = new Map();
for (const m of body.matchAll(/P\.(\w+)\(\{/g)) {
  const k = topKey(objectAt(body, m.index + m[0].length - 1));
  if (!k) continue;
  partCalls.push({ name: k, kind: m[1] });
  if (!kindsOf.has(k)) kindsOf.set(k, new Set());
  kindsOf.get(k).add(m[1]);
}
const isKind = (k, kind) => kindsOf.get(k)?.has(kind) === true;
const partKeys = [...body.matchAll(/key:\s*'([\w-]+)'/g)].map(m => m[1]);
const wireKeys = partKeys.filter(k => isKind(k, 'wire'));
// Only a clash INSIDE one bucket overwrites a ref, so the two buckets are counted apart.
const inWires = partCalls.filter(p => p.kind === 'wire').map(p => p.name);
const inRefs = partCalls.filter(p => p.kind !== 'wire').map(p => p.name);
const dupes = [...inRefs.filter((k, i) => inRefs.indexOf(k) !== i),
               ...inWires.filter((k, i) => inWires.indexOf(k) !== i)];
if (dupes.length) say('DUP-KEY', `${rel}  key used twice in one bucket: ${[...new Set(dupes)].join(', ')} (last one wins)`);

// Being addressed BY KEY is the norm for a chip, a box, a Pod, and an unaddressed one is a name
// that outlived its use. It is NOT the norm for these kinds, each of which has its own reader below.
const NOT_BY_KEY = new Map([
  ['chain',    'a step addresses a chain by ROW INDEX (`chain: 2`): IDLE-CHAIN reads that'],
  ['lane',     'a lane is addressed by its POINTS array: DEAD-PATH and IDLE-LANE read that'],
  ['relation', 'addressed by its points array, same as a lane'],
  ['arrow',    'addressed by its endpoints, same as a lane'],
  ['node',     'a frame is scenery, and the occlusion rule excludes it'],
  ['tag',      'a caption is scenery'],
  ['defs',     'no key of its own to address'],
  ['packets',  'no key of its own to address'],
]);
const notByKey = [];
for (const k of new Set(partKeys)) {
  if (isKind(k, 'wire')) continue;                              // BLANK-WIRE covers those
  if ((body.match(new RegExp(`'${k}'`, 'g')) || []).length > 1) continue;
  const kinds = [...(kindsOf.get(k) || [])];
  // No kind at all means the key never sat at depth 1 of a `P.<kind>({`: it was minted through a
  // CARD-LOCAL factory (a data array walked by .map, a `disk({key})` wrapper), which no text scan
  // follows. DEAD-CONST is what covers the container it lives in.
  if (!kinds.length) { notByKey.push(`'${k}': minted through a card-local factory, not a P.<kind> call`); continue; }
  if (kinds.every(kind => NOT_BY_KEY.has(kind))) {
    notByKey.push(`${kinds.join('/')} '${k}': ${NOT_BY_KEY.get(kinds[0])}`);
    continue;
  }
  say('UNREAD-KEY', `${rel}  ${kinds[0]} key '${k}' built and never addressed by a step, reset or flow`);
}
// The chain's real question, since its key never carries it: a ladder no step ever advances. The row
// index takes three shapes, a number, an array of them and the string 'all', and all three count.
if (partKeys.some(k => isKind(k, 'chain')) && !/\bchain:\s*(?:-?\d|\[|')/.test(body)) {
  say('IDLE-CHAIN', `${rel}  a chain is drawn and no step carries a chain: row index`);
}

// A wire whose text is never written renders a blank string forever (T-30 is the reverse case).
const written = new Set();
for (const m of body.matchAll(/\bwires:\s*\{/g)) {
  for (const w of keysOf(objectAt(body, m.index + m[0].length - 1))) written.add(w);
}
for (const m of body.matchAll(/setWire\(\s*\w+\s*,\s*'([\w-]+)'/g)) written.add(m[1]);
for (const k of wireKeys) if (!written.has(k)) say('BLANK-WIRE', `${rel}  P.wire '${k}' is drawn and no step ever writes its text`);
for (const k of written) if (!wireKeys.includes(k)) say('GHOST-WIRE', `${rel}  a step writes wire '${k}' and no P.wire declares it (silent no-op)`);

// ---- keys addressed by a step that no part declares -------------------------------------------
const addressed = new Set();
for (const m of body.matchAll(/(?:lit|lights|keys):\s*\[([^\]]*)\]/g)) {
  for (const k of m[1].matchAll(/'([\w-]+)'/g)) addressed.add(k[1]);
}
for (const m of body.matchAll(/\bopacity:\s*\{/g)) {
  for (const k of keysOf(objectAt(body, m.index + m[0].length - 1))) addressed.add(k);
}
const declared = new Set([...partKeys, ...[...body.matchAll(/(?:shellKey|innerKey|id):\s*'([\w-]+)'/g)].map(m => m[1])]);
for (const k of addressed) {
  if (!declared.has(k) && !/^(?:\.\.\.|OPACITY|STANDING)/.test(k) && uses(k) <= 2 && !body.includes(`${k}:`)) {
    say('NO-SUCH-KEY', `${rel}  a step names '${k}' and no part declares it`);
  }
}

// ---- a lane nobody rides, a ball on a path nobody draws ---------------------------------------
// Cards wrap the kit in local helpers (`trunkPath('trunk', TRUNK)`), so a hit that is neither a
// recognisable draw nor a recognisable ride is treated as UNKNOWN and reported as nothing. Silence
// here is not a clean bill: it means the tool could not tell, and the frames have to.
const RIDE = /(F\.\w+|packetAlong|topPacket|segmentPacket|animateAlong|routeDur)/;
const DRAW = /(P\.lane|P\.relation|P\.arrow|lane\(|relationPath)/;
for (const m of body.matchAll(/^const\s+([A-Z][A-Z0-9_]*)\s*=\s*\[\[/gm)) {
  const name = m[1];
  const hits = bodyLines.filter(l => new RegExp(`\\b${name}\\b`).test(l) && !new RegExp(`^const\\s+${name}\\b`).test(l));
  if (!hits.length) { say('DEAD-PATH', `${rel}  ${name} is a points array nothing reads`); continue; }
  const spread = hits.some(l => l.includes(`...${name}`));       // consumed into another path
  const drawn = hits.some(l => DRAW.test(l));
  const ridden = hits.some(l => RIDE.test(l));
  const helper = hits.some(l => new RegExp(`[A-Za-z_$][\\w$]*\\(([^)]*\\b${name}\\b)`).test(l));
  if (spread) continue;
  if (drawn && !ridden && !helper) {
    say('IDLE-LANE', `${rel}  ${name} is drawn and never ridden (correct if the card shows one half at a time: check)`);
  } else if (ridden && !drawn && !helper) {
    say('INVISIBLE-RIDE', `${rel}  ${name} carries a ball along a path no lane draws`);
  }
}

// ---- prose mechanics --------------------------------------------------------------------------
const strings = [...src.matchAll(/(?:narration|wires?|chain|label|sublabel|aria-label|'aria-label'):\s*'((?:[^'\\]|\\.)*)'/g)].map(m => m[1]);
for (const s of strings) {
  if (s.includes(';')) say('PROSE', `semicolon in a drawn string: "${s.slice(0, 60)}"`);
  if (/[—–]/.test(s)) say('PROSE', `em or en dash in a drawn string: "${s.slice(0, 60)}"`);
  if (/\b(\w+)\s+\1\b/i.test(s)) say('PROSE', `word repeated: "${s.match(/\b(\w+)\s+\1\b/i)[0]}" in "${s.slice(0, 60)}"`);
  if (/\s{2,}/.test(s.trim())) say('PROSE', `double space in "${s.slice(0, 60)}"`);
}
if (/[—]/.test(src)) say('PROSE', `${rel} contains an em-dash somewhere in the file`);

// ---- comment runs (S-34) ----------------------------------------------------------------------
let run = 0, runStart = 0;
lines.forEach((l, i) => {
  if (l.trimStart().startsWith('//')) { if (!run) runStart = i + 1; run++; }
  else { if (run > 2) say('S-34', `${rel}:${runStart}  comment run of ${run} lines, ceiling is 2`); run = 0; }
});
if (run > 2) say('S-34', `${rel}:${runStart}  comment run of ${run} lines, ceiling is 2`);

// ---- the catalog wiring around the card --------------------------------------------------------
const cardsJs = readFileSync(join(SCHEMES, category, 'cards.js'), 'utf8');
if (!cardsJs.includes(`id: '${id}'`)) say('CATALOG', `${id} has no entry in ${category}/cards.js`);
const entry = cardsJs.split(/\{\s*\n/).find(b => b.includes(`id: '${id}'`)) || '';
for (const field of ['title', 'category', 'subcategory', 'desc', 'k8sVersion', 'sources']) {
  if (!entry.includes(`${field}:`)) say('CATALOG', `${id} entry is missing ${field}`);
}
const posters = join(SCHEMES, category, 'posters.js');
if (existsSync(posters) && !readFileSync(posters, 'utf8').includes(`'${id}'`)) {
  say('CATALOG', `${id} has no poster in ${category}/posters.js`);
}
// Two shapes of record: one `CARDS.md` per category, or a `CARDS/<id>.md` per card beside it. The
// per-card file wins when it exists, and the section is parsed the same way out of either.
const perCard = join(SCHEMES, category, 'CARDS', `${id}.md`);
const recordRel = existsSync(perCard) ? `${category}/CARDS/${id}.md` : `${category}/CARDS.md`;
const recordMd = existsSync(perCard)
  ? readFileSync(perCard, 'utf8')
  : readFileSync(join(SCHEMES, category, 'CARDS.md'), 'utf8');
if (!recordMd.includes(`## ${id}\n`)) say('RECORD', `${recordRel} has no "## ${id}" section`);
else {
  const section = recordMd.split(`## ${id}\n`)[1].split('\n## ')[0];
  for (const a of section.matchAll(/^### before `(.+)`$/gm)) {
    if (!src.includes(a[1])) say('ANCHOR', `${recordRel} anchor no longer occurs in the card: ${a[1].slice(0, 70)}`);
  }
  for (const label of ['WHAT']) if (!section.includes(label)) say('RECORD', `the ${id} record has no ${label} block`);
}
const appJs = readFileSync(join(ROOT, 'scheme/js/app.js'), 'utf8');
const aliases = [...appJs.matchAll(/'([\w-]+)':\s*'([\w-]+)'/g)].filter(m => m[2] === id).map(m => m[1]);
if (aliases.length) say('ALIASES', `old hashes forwarding here: ${aliases.join(', ')} (keep them, and check they still resolve)`);

console.log(out.length ? out.join('\n') : 'nothing found by the static sweep.');
if (notByKey.length) {
  console.log(`\nnot reported, these kinds are not addressed by key:\n  ${notByKey.join('\n  ')}`);
}
console.log(`\n${out.length} heuristic finding(s). Confirm each one in the source before you act on it.`);
