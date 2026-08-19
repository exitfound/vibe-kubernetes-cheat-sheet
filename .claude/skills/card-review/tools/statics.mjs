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
const kindOf = new Map();
for (const m of body.matchAll(/P\.(\w+)\(\{([\s\S]{0,400}?)\}\)/g)) {
  const k = m[2].match(/key:\s*'([\w-]+)'/);
  if (k) kindOf.set(k[1], m[1]);
}
const partKeys = [...body.matchAll(/key:\s*'([\w-]+)'/g)].map(m => m[1]);
const wireKeys = partKeys.filter(k => kindOf.get(k) === 'wire');
// A wire and a box may SHARE a name: they land in refs.wires and refs, two buckets. Only a clash
// inside one bucket overwrites a ref.
const bucketed = partKeys.filter(k => kindOf.get(k) !== 'wire');
const dupes = bucketed.filter((k, i) => bucketed.indexOf(k) !== i);
if (dupes.length) say('DUP-KEY', `${rel}  key used twice in one bucket: ${[...new Set(dupes)].join(', ')} (last one wins)`);

const STATIC_KINDS = new Set(['node', 'defs', 'packets', 'tag']);
for (const k of new Set(partKeys)) {
  if (kindOf.get(k) === 'wire') continue;                       // BLANK-WIRE covers those
  if ((body.match(new RegExp(`'${k}'`, 'g')) || []).length > 1) continue;
  const tag = STATIC_KINDS.has(kindOf.get(k)) ? 'STATIC-KEY' : 'UNREAD-KEY';
  const why = tag === 'STATIC-KEY'
    ? 'nothing addresses it, which is ordinary for a frame or a caption: drop the key if nothing ever will'
    : 'built and never addressed by a step, reset or flow';
  say(tag, `${rel}  ${kindOf.get(k) || 'part'} key '${k}' ${why}`);
}

// A wire whose text is never written renders a blank string forever (T-30 is the reverse case).
const written = new Set();
for (const m of body.matchAll(/wires:\s*\{([\s\S]*?)\}/g)) {
  for (const w of m[1].matchAll(/(?:'([\w-]+)'|([A-Za-z_$][\w$]*))\s*:/g)) written.add(w[1] || w[2]);
}
for (const m of body.matchAll(/setWire\(\s*\w+\s*,\s*'([\w-]+)'/g)) written.add(m[1]);
for (const k of wireKeys) if (!written.has(k)) say('BLANK-WIRE', `${rel}  P.wire '${k}' is drawn and no step ever writes its text`);
for (const k of written) if (!wireKeys.includes(k)) say('GHOST-WIRE', `${rel}  a step writes wire '${k}' and no P.wire declares it (silent no-op)`);

// ---- keys addressed by a step that no part declares -------------------------------------------
const addressed = new Set();
for (const m of body.matchAll(/(?:lit|lights|keys):\s*\[([^\]]*)\]/g)) {
  for (const k of m[1].matchAll(/'([\w-]+)'/g)) addressed.add(k[1]);
}
for (const m of body.matchAll(/opacity:\s*\{([\s\S]*?)\n\s*\}/g)) {
  for (const k of m[1].matchAll(/(?:'([\w-]+)'|([A-Za-z_$][\w$]*))\s*:/g)) addressed.add(k[1] || k[2]);
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
const cardsMd = readFileSync(join(SCHEMES, category, 'CARDS.md'), 'utf8');
if (!cardsMd.includes(`\n## ${id}\n`)) say('RECORD', `${category}/CARDS.md has no "## ${id}" section`);
else {
  const section = cardsMd.split(`\n## ${id}\n`)[1].split('\n## ')[0];
  for (const a of section.matchAll(/^### before `(.+)`$/gm)) {
    if (!src.includes(a[1])) say('ANCHOR', `${category}/CARDS.md anchor no longer occurs in the card: ${a[1].slice(0, 70)}`);
  }
  for (const label of ['WHAT']) if (!section.includes(label)) say('RECORD', `the ${id} record has no ${label} block`);
}
const appJs = readFileSync(join(ROOT, 'scheme/js/app.js'), 'utf8');
const aliases = [...appJs.matchAll(/'([\w-]+)':\s*'([\w-]+)'/g)].filter(m => m[2] === id).map(m => m[1]);
if (aliases.length) say('ALIASES', `old hashes forwarding here: ${aliases.join(', ')} (keep them, and check they still resolve)`);

console.log(out.length ? out.join('\n') : 'nothing found by the static sweep.');
console.log(`\n${out.length} heuristic finding(s). Confirm each one in the source before you act on it.`);
