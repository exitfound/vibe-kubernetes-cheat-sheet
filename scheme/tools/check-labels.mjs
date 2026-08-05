#!/usr/bin/env node
// check-labels.mjs: B7 content, the half check-inline cannot see. It asks whether the catalog
// spells ONE object ONE way, which is the rule already written in scheme/CLAUDE.md ("nodefs" on
// one card and "Node FS" on the next). Strings are only ever compared inside the same position
// class, because a heading and a chip name are SUPPOSED to differ: "Conntrack" over a block and
// "conntrack" in a chip is system A working, not drift.
// node check-labels.mjs [--verbose] [<id> ...]
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractInline, extractIndirect } from './prose.mjs';
import { cards, census } from './catalog.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dict = JSON.parse(await readFile(join(__dirname, 'terms.json'), 'utf8'));
const HOMOGRAPHS = new Set((dict.inline.homographs || []).map(s => s.toLowerCase()));

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const only = new Set(args.filter(a => !a.startsWith('--')));

const ALL = await cards();
const files = ALL.filter(c => !only.size || only.has(c.id));
census('labels check', files.length, ALL.length, { subset: only.size > 0 });

// key -> surface form -> [{card, kind}]
const add = (map, key, surface, card, kind) => {
  if (!map.has(key)) map.set(key, new Map());
  const forms = map.get(key);
  if (!forms.has(surface)) forms.set(surface, []);
  forms.get(surface).push({ card, kind });
};

// Every drawn string once, so the same list can be indexed with and without the report-only
// class. `indirect` is a chip value that reaches the canvas through a card-local wrapper and
// that no INLINE_SITE can see (see prose.mjs); it never enters the enforced pass.
const hits = [];
for (const { id: card, path } of files) {
  const src = await readFile(path, 'utf8');
  for (const h of extractInline(src)) hits.push({ card, s: h.text.trim(), want: h.want, kind: h.kind, indirect: false });
  // `.values` only: the resolver's unresolved writes are printed by check-inline, which runs in the
  // same gate, and saying it twice per run buys nothing.
  for (const h of extractIndirect(src).values) hits.push({ card, s: h.text.trim(), want: h.want, kind: `indirect ${h.via}`, indirect: true });
}
const index = (list) => {
  const bc = new Map(), bs = new Map();
  for (const h of list) {
    if (!h.s) continue;
    // The position class is part of the key: heading against heading, body against body.
    add(bc, `${h.want}\t${h.s.toLowerCase()}`, h.s, h.card, h.kind);
    add(bs, `${h.want}\t${h.s.toLowerCase().replace(/[\s.\-_]/g, '')}`, h.s, h.card, h.kind);
  }
  return [bc, bs];
};
const total = hits.filter(h => !h.indirect && h.s).length;
const indirectTotal = hits.filter(h => h.indirect && h.s).length;
const [byCase, byShape] = index(hits.filter(h => !h.indirect));
const [allCase, allShape] = index(hits);

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
const tag = (rows, t) => rows.map(r => ({ ...r, tag: t }));
const rows = [...tag(collect(byCase, false), 'case'), ...tag(collect(byShape, true), 'shape')];
const hard = rows.filter(r => r.want === 'title');
const soft = rows.filter(r => r.want === 'lower');

print(hard, 'DRIFT, one object labelled two ways');
print(soft, 'AMBIGUOUS values, an API literal and an English word look alike, a human judges');

// REPORT-ONLY, never in the exit code: the drift rows that only appear once the indirect class
// joins the index. A row already reported above is dropped, and so is one no indirect string
// takes part in, so what is left is exactly what the literal scan could not have found.
const seen = new Set(rows.map(r => `${r.tag}\t${r.want}\t${r.norm}`));
const extra = [...tag(collect(allCase, false), 'case'), ...tag(collect(allShape, true), 'shape')]
  .filter(r => !seen.has(`${r.tag}\t${r.want}\t${r.norm}`))
  .filter(r => [...r.forms.values()].some(uses => uses.some(u => u.kind.startsWith('indirect '))));
print(extra, 'REPORT-ONLY, not in the exit code: drift involving a string drawn through a card-local wrapper');

console.log(`\nlabels check: ${files.length} cards, ${total} drawn strings, ${hard.length} drift + ${soft.length} ambiguous`);
if (!verbose && rows.length) console.log('  --verbose lists which cards use which form');
console.log(`  report-only (indirect): ${indirectTotal} strings, ${extra.length} finding(s), NOT enforced`);
process.exit(hard.length ? 1 : 0);
