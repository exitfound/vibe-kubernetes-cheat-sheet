#!/usr/bin/env node
// inline-dump.mjs: a card as TEXT, for reading the drawn layer for truth rather than for casing.
// A chip's name is declared 200 lines above the values it takes, so this prints them together.
// Chip values are RESOLVED through the card's own setChips/setChip wrappers, not just literal-scanned.
// node inline-dump.mjs <id> [<id> ...]
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
// The chip-value resolver lives in prose.mjs, next to INLINE_SITES, so this reader and the two
// checks that now report on the same strings cannot disagree about what a drawn string is.
import { chipDecls, chipValues } from './prose.mjs';

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
  const chipName = chipDecls(src);                       // ref -> { name, values, how, unresolved }
  const chipNotes = chipValues(src, chipName);
  if (chipName.size) {
    console.log('\nCHIPS   name -> every value it takes    (via = resolved through a card-local wrapper)');
    for (const c of chipName.values()) {
      const tail = [...c.how].join(', ') + (c.unresolved.length ? `  UNRESOLVED: ${c.unresolved.join(' ; ')}` : '');
      console.log(`  ${JSON.stringify(c.name).padEnd(26)} ${c.values.map(v => JSON.stringify(v)).join('  |  ')}${tail.trim() ? `   <- ${tail}` : ''}`);
    }
    if (chipNotes.length) {
      console.log(`  INCOMPLETE: ${chipNotes.length} write(s) could not be read off the source, so a chip above may take values this list does not show:`);
      for (const n of [...new Set(chipNotes)]) console.log(`    ${n}`);
    }
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
  // Ids first, then each step's OWN narration, searched only within that step's own text (from its
  // id up to the next step's id). One regex spanning both cannot do this: since step 0 lost its
  // narration in 2026-07-29, a lazy `[\s\S]*?` walked out of the idle step into step 1 and printed
  // step 1's text under `[idle]`, swallowing step 1's id entirely. It was wrong on 102 of 108 cards.
  // A step with no narration of its own prints empty and NEVER borrows the next one's. The search
  // is still over the whole step, not over three consecutive lines: a comment between id and
  // narration (several cards carry a `// Motion:` note there) used to drop the step silently.
  const stepIds = [...src.matchAll(/^ {4}id: '([^']+)',/gm)];
  for (let i = 0; i < stepIds.length; i++) {
    const from = stepIds[i].index + stepIds[i][0].length;
    const to = i + 1 < stepIds.length ? stepIds[i + 1].index : src.length;
    const n = /^ {4}narration: '([^']*)'/m.exec(src.slice(from, to));
    console.log(`  [${stepIds[i][1]}] ${n ? n[1] : ''}`);
  }
}
