#!/usr/bin/env node
// fix-terms.mjs: apply the CASE class of check-terms.mjs in place. Same terms.json, same regex,
// same exception ranges, so the fixer cannot disagree with the linter about what a defect is.
// Only CASE is automated. REWORD (a name that must stay lowercase opening a sentence) and OPEN
// (a sentence opening lowercase) both need a human sentence, never a substitution.
// node fix-terms.mjs [--dry] [<id> ...]
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { termIssues } from './prose.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMES_DIR = join(__dirname, '..', 'js', 'schemes');
const DATA = join(__dirname, '..', 'js', 'data.js');

const dict = JSON.parse(await readFile(join(__dirname, 'terms.json'), 'utf8'));
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const only = new Set(args.filter(a => !a.startsWith('--')));
const wanted = id => only.size === 0 || only.has(id);

// Rewrite one prose string. Returns [newText, changes[]].
function fixString(text) {
  const edits = termIssues(dict, text).filter(i => i.cls === 'case');
  if (!edits.length) return [text, []];
  // Splice from the end so earlier offsets stay valid.
  let out = text;
  for (const e of [...edits].reverse()) out = out.slice(0, e.index) + e.replacement + out.slice(e.index + e.len);
  return [out, edits.map(e => `${e.was} -> ${e.want}`)];
}

// Rewrite every `key: '...'` string in a source file.
function fixFile(src, key) {
  const re = new RegExp(`${key}:\\s*'([^']*)'`, 'g');
  const changes = [];
  const out = src.replace(re, (whole, inner) => {
    const [fixed, ch] = fixString(inner);
    if (!ch.length) return whole;
    changes.push(...ch);
    return whole.replace(`'${inner}'`, `'${fixed}'`);
  });
  return [out, changes];
}

let files = 0, total = 0;
const tally = new Map();
const bump = ch => ch.forEach(c => tally.set(c, (tally.get(c) || 0) + 1));

for (const f of (await readdir(SCHEMES_DIR)).filter(n => n.endsWith('.js')).sort()) {
  if (!wanted(f.replace(/\.js$/, ''))) continue;
  const src = await readFile(join(SCHEMES_DIR, f), 'utf8');
  let [out, changes] = fixFile(src, 'narration');
  const [out2, changes2] = fixFile(out, "'aria-label'");
  out = out2; changes = [...changes, ...changes2];
  if (!changes.length) continue;
  files++; total += changes.length; bump(changes);
  if (!dry) await writeFile(join(SCHEMES_DIR, f), out);
}
{
  const src = await readFile(DATA, 'utf8');
  const [out, changes] = fixFile(src, 'desc');
  if (changes.length) {
    files++; total += changes.length; bump(changes);
    if (!dry) await writeFile(DATA, out);
  }
}

console.log(`${dry ? '[dry] ' : ''}${total} substitution(s) in ${files} file(s)`);
for (const [k, v] of [...tally].sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`);
