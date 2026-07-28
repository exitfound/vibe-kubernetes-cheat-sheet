#!/usr/bin/env node
// inline-dump.mjs: a card as TEXT, for reading the drawn layer for truth rather than for casing.
// check-inline and check-labels answer "is this spelled right"; nothing answered "is this true".
// Reading the .js for that is hard because a chip's name is declared 200 lines above the values it
// takes, so this prints them together, with each step's narration beside the strings it sets.
// node inline-dump.mjs <id> [<id> ...]
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, '..', 'js', 'schemes');
const only = new Set(process.argv.slice(2).filter(a => !a.startsWith('--')));
// The catalog entry is printed with the card because the question "does this description describe
// THIS card" cannot be asked while the two live in different files.
const { SCHEMES } = await import(pathToFileURL(join(__dirname, '..', 'js', 'data.js')).href);
const META = new Map(SCHEMES.map(s => [s.id, s]));

const files = (await readdir(DIR)).filter(n => n.endsWith('.js')).sort()
  .filter(n => !only.size || only.has(n.replace(/\.js$/, '')));

const first = (re, s) => { const m = re.exec(s); return m ? m[1] : ''; };

for (const f of files) {
  const src = await readFile(join(DIR, f), 'utf8');
  console.log(`\n${'='.repeat(78)}\n== ${f.replace(/\.js$/, '')}`);

  const meta = META.get(f.replace(/\.js$/, ''));
  if (meta) {
    console.log(`\nTITLE       ${meta.title}   (${meta.category} / ${meta.subcategory}, k8s ${meta.k8sVersion})`);
    console.log(`DESC (${String(meta.desc.length).padStart(3)}) ${meta.desc}`);
    console.log(`SOURCES     ${meta.sources.map(x => x.label).join(' | ')}`);
  }

  const aria = first(/'aria-label':\s*'([^']*)'/, src);
  if (aria) console.log(`\nARIA-LABEL\n  ${aria}`);

  // Blocks: a label with the sublabel written in the same call.
  const blocks = [];
  for (const m of src.matchAll(/label:\s*'([^']*)'((?:[^;{}]|\n)*?)(?:sublabel|ip|sub):\s*'([^']*)'/g)) {
    if (m[2].includes('label:')) continue;               // the sublabel belongs to a later block
    blocks.push([m[1], m[3]]);
  }
  const bare = [...src.matchAll(/label:\s*'([^']*)'/g)].map(m => m[1]);
  const withSub = new Set(blocks.map(b => b[0]));
  console.log('\nBLOCKS  label -> sublabel');
  for (const [l, s] of blocks) console.log(`  ${JSON.stringify(l).padEnd(30)} ${JSON.stringify(s)}`);
  for (const l of bare) if (!withSub.has(l)) console.log(`  ${JSON.stringify(l)}`);

  // Chips: the name, then every value it is ever given. A chip must mean what its name says.
  const chipName = new Map();                            // ref -> name
  for (const m of src.matchAll(/\b(\w+)\s*=\s*valChip\(\{[^}]*?name:\s*'([^']*)'[^}]*?value:\s*'([^']*)'/g)) {
    chipName.set(m[1], { name: m[2], values: [m[3]] });
  }
  for (const m of src.matchAll(/setVal\(\s*s\.refs\.(\w+)\s*,\s*'([^']*)'/g)) {
    const c = chipName.get(m[1]);
    if (c && !c.values.includes(m[2])) c.values.push(m[2]);
  }
  if (chipName.size) {
    console.log('\nCHIPS   name -> every value it takes');
    for (const c of chipName.values()) console.log(`  ${JSON.stringify(c.name).padEnd(26)} ${c.values.map(v => JSON.stringify(v)).join('  |  ')}`);
  }

  const wires = [...src.matchAll(/setWire\(\s*s\s*,\s*'([^']*)'\s*,\s*'([^']*)'/g)];
  if (wires.length) {
    console.log('\nWIRE LABELS  lane -> text');
    for (const w of wires) console.log(`  ${w[1].padEnd(14)} ${JSON.stringify(w[2])}`);
  }

  const chain = [...src.matchAll(/'(\d+\.\s+[^']*)'/g)].map(m => m[1]);
  if (chain.length) { console.log('\nCHAIN ROWS'); for (const c of chain) console.log(`  ${c}`); }

  const tags = [...src.matchAll(/\btag:\s*'([^']*)'/g)].map(m => m[1]);
  if (tags.length) console.log(`\nRIDING TAGS\n  ${tags.map(t => JSON.stringify(t)).join(', ')}`);

  console.log('\nSTEPS');
  // Anchored on the step-object indentation, and NOT requiring id/duration/narration on three
  // consecutive lines: a comment between them (several cards carry a `// Motion:` note there) used
  // to drop the step from this listing silently, on 19 cards, worst case 1 step of 4.
  for (const m of src.matchAll(/^ {4}id: '([^']+)',[\s\S]*?^\s*narration: '([^']*)'/gm)) {
    console.log(`  [${m[1]}] ${m[2]}`);
  }
}
