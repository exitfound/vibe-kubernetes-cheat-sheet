#!/usr/bin/env node
// check-labels.mjs: B7 content, the half check-inline cannot see. It asks whether the catalog
// spells ONE object ONE way, which is the rule already written in scheme/CLAUDE.md ("nodefs" on
// one card and "Node FS" on the next). Strings are only ever compared inside the same position
// class, because a heading and a chip name are SUPPOSED to differ: "Conntrack" over a block and
// "conntrack" in a chip is system A working, not drift.
// node check-labels.mjs [--verbose] [<id> ...]
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractInline } from './prose.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, '..', 'js', 'schemes');
const dict = JSON.parse(await readFile(join(__dirname, 'terms.json'), 'utf8'));
const HOMOGRAPHS = new Set((dict.inline.homographs || []).map(s => s.toLowerCase()));

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const only = new Set(args.filter(a => !a.startsWith('--')));

const files = (await readdir(DIR)).filter(n => n.endsWith('.js')).sort()
  .filter(n => !only.size || only.has(n.replace(/\.js$/, '')));

// key -> surface form -> [{card, kind}]
const byCase = new Map(), byShape = new Map();
const add = (map, key, surface, card, kind) => {
  if (!map.has(key)) map.set(key, new Map());
  const forms = map.get(key);
  if (!forms.has(surface)) forms.set(surface, []);
  forms.get(surface).push({ card, kind });
};

let total = 0;
for (const f of files) {
  const card = f.replace(/\.js$/, '');
  for (const hit of extractInline(await readFile(join(DIR, f), 'utf8'))) {
    const s = hit.text.trim();
    if (!s) continue;
    total++;
    // The position class is part of the key: heading against heading, body against body.
    add(byCase, `${hit.want}\t${s.toLowerCase()}`, s, card, hit.kind);
    add(byShape, `${hit.want}\t${s.toLowerCase().replace(/[\s.\-_]/g, '')}`, s, card, hit.kind);
  }
}

function collect(map, skipIfSameCase) {
  const rows = [];
  for (const [key, forms] of map) {
    if (forms.size < 2) continue;
    const [want, norm] = key.split('\t');
    if (HOMOGRAPHS.has(norm)) continue;
    // A shape clash that is only a case clash is already reported by the case pass.
    if (skipIfSameCase && new Set([...forms.keys()].map(s => s.toLowerCase())).size < 2) continue;
    rows.push({ want, norm, forms });
  }
  return rows;
}

function print(rows, title) {
  if (!rows.length) return;
  console.log(`\n${title} (${rows.length})`);
  for (const r of rows.sort((a, b) => b.forms.size - a.forms.size)) {
    const parts = [...r.forms].sort((a, b) => b[1].length - a[1].length)
      .map(([s, uses]) => `${JSON.stringify(s)} x${uses.length}`);
    console.log(`  ${parts.join('  vs  ')}`);
    if (verbose) for (const [s, uses] of r.forms) console.log(`      ${JSON.stringify(s)}: ${uses.map(u => `${u.card}(${u.kind})`).join(', ')}`);
  }
}

// A block LABEL names an object, so two spellings of one object is a defect a machine can call.
// A chip VALUE is where an API literal and an ordinary English word wear the same letters:
// MemoryPressure False is a Node condition and cordon false is a boolean, Terminated is a
// container state and terminated is what TLS did. Nothing here can tell those apart, so the value
// class is printed for a human exactly like the SOFT block of check-terms and never fails.
const rows = [...collect(byCase, false), ...collect(byShape, true)];
const hard = rows.filter(r => r.want === 'title');
const soft = rows.filter(r => r.want === 'lower');

print(hard, 'DRIFT, one object labelled two ways');
print(soft, 'AMBIGUOUS values, an API literal and an English word look alike, a human judges');

console.log(`\nlabels check: ${files.length} cards, ${total} drawn strings, ${hard.length} drift + ${soft.length} ambiguous`);
if (!verbose && rows.length) console.log('  --verbose lists which cards use which form');
process.exit(hard.length ? 1 : 0);
