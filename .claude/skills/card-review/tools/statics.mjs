#!/usr/bin/env node
// statics.mjs: the source-level sweep of one card, no browser: dead constants, unread keys, unridden lanes, no-op addressing, prose, wiring.
// usage: node .claude/skills/card-review/tools/statics.mjs <card-id>
// Every line is a heuristic read off the text: confirm each hit in the code, and expect decorative parts as false positives.
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

// A balanced `{...}` slice from the brace at `i`, string literals skipped.
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

// Keys of an object literal with its string values blanked first, so a value is not read as a key.
// A quoted string followed by a colon is a key and survives: hyphenated keys need one.
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
// Reads `key:` literals only, so keys minted by a card-local helper are invisible here.
// A wire and a box may share a name in two buckets, so a name maps to a SET of kinds.
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
  // No kind at all means the key was minted through a card-local factory no text scan follows.
  // DEAD-CONST covers the container it lives in.
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
// A key minted from a template (`${p.key}Box`) becomes a shape: the literal text around every `${...}`,
// with the substitutions as wildcards.
const minted = [...body.matchAll(/(?:shellKey|innerKey|key|id):\s*`([^`]*\$\{[^`]*)`/g)].map((m) => {
  const shape = m[1].split(/\$\{[^}]*\}/).map(lit => lit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\w-]+');
  return { src: m[1], re: new RegExp(`^${shape}$`) };
});
for (const k of addressed) {
  if (declared.has(k) || /^(?:\.\.\.|OPACITY|STANDING)/.test(k) || uses(k) > 2 || body.includes(`${k}:`)) continue;
  const by = minted.find(t => t.re.test(k));
  if (by) { notByKey.push(`'${k}': minted from the template \`${by.src}\`, which no source sweep resolves`); continue; }
  say('NO-SUCH-KEY', `${rel}  a step names '${k}' and no part declares it`);
}

// ---- a lane nobody rides, a ball on a path nobody draws ---------------------------------------
// A hit that is neither a recognisable draw nor ride (cards wrap the kit in local helpers) is UNKNOWN
// and reported as nothing, so silence here is not a clean bill.
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
// The ceiling also lives in unit/files.test.mjs and the canon row, so it is named once here.
const S34_CEILING = 6;
let run = 0, runStart = 0;
lines.forEach((l, i) => {
  if (l.trimStart().startsWith('//')) { if (!run) runStart = i + 1; run++; }
  else { if (run > S34_CEILING) say('S-34', `${rel}:${runStart}  comment run of ${run} lines, ceiling is ${S34_CEILING}`); run = 0; }
});
if (run > S34_CEILING) say('S-34', `${rel}:${runStart}  comment run of ${run} lines, ceiling is ${S34_CEILING}`);

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
  // One record SHAPE in all four categories: a single `### layout` block of labelled notes (`S-51`),
  // so any second heading, a per-line anchor or a poster note included, is itself the finding.
  for (const a of section.matchAll(/^### before `(.+)`$/gm)) {
    say('RECORD', `${recordRel} carries an anchor, and a ${category} record is one "### layout" block: ${a[1].slice(0, 70)}`);
  }
  if (section.includes('### poster')) say('RECORD', `${recordRel} carries a "### poster" note, which a ${category} record does not (R-12)`);
  for (const label of ['WHAT']) if (!section.includes(label)) say('RECORD', `the ${id} record has no ${label} block`);
}
console.log(out.length ? out.join('\n') : 'nothing found by the static sweep.');
if (notByKey.length) {
  console.log(`\nnot reported, these kinds are not addressed by key:\n  ${notByKey.join('\n  ')}`);
}
console.log(`\n${out.length} heuristic finding(s). Confirm each one in the source before you act on it.`);
