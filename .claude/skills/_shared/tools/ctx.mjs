#!/usr/bin/env node
// ctx.mjs: the whole phase-1 read set of ONE card (catalog entry, record, source, poster, named siblings) in one run.
// usage: node .claude/skills/_shared/tools/ctx.mjs <card-id> [--siblings=all|full|none] [--no-source] [--no-record] [--json]
// Blind to rendered frames, and sibling resolution is a string match, so unresolved "... card" phrases are printed.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, schemes, cards, recordFiles, recordPointer, subcategories } from '../../../../scheme/test/fixtures/catalog.mjs';

const REPO = join(ROOT, '..');
const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, v = 'true'] = a.slice(2).split('='); return [k, v];
}));
const target = args.find(a => !a.startsWith('--'));
if (!target) {
  console.error('Usage: node .claude/skills/_shared/tools/ctx.mjs <card-id> [--siblings=full|none] [--no-source] [--no-record] [--json]');
  process.exit(1);
}

const P = (s = '') => process.stdout.write(`${s}\n`);
const rel = (abs) => relative(REPO, abs);
const read = (abs) => readFileSync(abs, 'utf8');
const lines = (s) => s.split('\n');
const mtime = (abs) => statSync(abs).mtime.toISOString().replace('T', ' ').slice(0, 19);
const rule = (n) => {
  const bar = '-'.repeat(Math.max(4, 96 - n.length - 5));
  return `--- ${n} ${bar}`;
};

// ---------------------------------------------------------------------------------------------
// Resolve the card. An id, or a title, because both are what a person types.
// ---------------------------------------------------------------------------------------------
const all = await schemes();
const files = await cards();
const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();
const entry = all.find(s => s.id === target)
  || all.find(s => norm(s.title) === norm(target))
  || all.find(s => s.id.endsWith(`-${target}`));
if (!entry) {
  console.error(`ctx: no card with id or title "${target}" in the catalog.`);
  const near = all.filter(s => norm(s.title).includes(norm(target)) || s.id.includes(target)).slice(0, 8);
  if (near.length) { console.error('Did you mean:'); for (const s of near) console.error(`  ${s.id}  "${s.title}"`); }
  process.exit(1);
}
const card = files.find(c => c.id === entry.id);
const CAT = entry.category;
const catDir = join(ROOT, 'js', 'schemes', CAT);

// Slice a named entry by brace matching, walked BACK to the object opener because the id is never the first key.
function sliceEntry(text, idRe, { open = '{', close = '}' } = {}) {
  const src = lines(text);
  const at = src.findIndex(l => idRe.test(l));
  if (at < 0) return null;
  let start = at;
  while (start > 0 && !src[start].trimEnd().endsWith(open)) start--;
  let depth = 0, end = start;
  for (let i = start; i < src.length; i++) {
    for (const ch of src[i]) {
      if (ch === open) depth++;
      else if (ch === close) depth--;
    }
    if (depth <= 0 && i > start) { end = i; break; }
    end = i;
  }
  return { from: start + 1, to: end + 1, text: src.slice(start, end + 1).join('\n') };
}

// A poster fragment is a template literal, not an object, so it is delimited by its backticks.
function slicePoster(text, id) {
  const src = lines(text);
  const at = src.findIndex(l => l.includes(`'${id}'`) && l.includes('`'));
  if (at < 0) return null;
  let start = at;
  while (start > 0 && /^\s*\/\//.test(src[start - 1])) start--;   // keep the comment that explains it
  let end = at;
  while (end < src.length - 1 && !/`\s*,?\s*$/.test(src[end + 1])) end++;
  end++;
  return { from: start + 1, to: end + 1, text: src.slice(start, end + 1).join('\n') };
}

// The card's prose off the imported module rather than the file text, so a string built by a helper is still read.
const PROSE_KEYS = new Set(['narration', 'aria-label', 'aria', 'label', 'sub', 'name', 'value', 'text', 'title', 'chain']);
function proseOf(value, out = []) {
  if (!value || typeof value !== 'object') return out;
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === 'string' && (PROSE_KEYS.has(k) || k === 'wires')) out.push(v);
    else if (typeof v === 'object') {
      if (k === 'wires') for (const w of Object.values(v)) { if (typeof w === 'string') out.push(w); }
      proseOf(v, out);
    }
  }
  return out;
}

async function moduleOf(c) {
  try { return await import(pathToFileURL(c.path).href); }
  catch (e) { return { __error: e.message }; }
}

const mod = await moduleOf(card);
const SPEC = mod.STEPS_SPEC || [];
const SCENE = mod.SCENE || null;

// The record: one CARDS/<id>.md file in the split shape, one `## <id>` section in the monolith.
function recordOf(c) {
  const rf = recordFiles(c.category);
  const split = rf.find(f => f.rel.endsWith(join('CARDS', `${c.id}.md`)));
  if (split && existsSync(split.path)) {
    return { shape: 'split', rel: join('scheme', split.rel), path: split.path, from: 1, text: read(split.path) };
  }
  const mono = rf[0];
  if (!existsSync(mono.path)) return null;
  const src = lines(read(mono.path));
  const at = src.findIndex(l => l.trim() === `## ${c.id}`);
  if (at < 0) return { shape: 'monolith', rel: join('scheme', mono.rel), path: mono.path, from: 0, text: null };
  let end = at + 1;
  while (end < src.length && !/^## /.test(src[end])) end++;
  return { shape: 'monolith', rel: `${join('scheme', mono.rel)}:${at + 1}-${end}`, path: mono.path, from: at + 1, to: end, text: src.slice(at, end).join('\n') };
}

// ---------------------------------------------------------------------------------------------
// SIBLINGS. Which other cards this one NAMES, by id or by title, anywhere a reader would see it.
// ---------------------------------------------------------------------------------------------
const record = recordOf(card);
const haystacks = [
  ['desc', entry.desc || ''],
  ['aria-label', (SCENE && SCENE['aria-label']) || ''],
  ...SPEC.map((s, i) => [`step ${String(i).padStart(2, '0')} (${s.id})`, [s.narration || '', ...proseOf(s)].join(' ')]),
  ['scene text', SCENE ? proseOf(SCENE).join(' ') : ''],
  ['record', record && record.text ? record.text : ''],
];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const found = new Map();                                        // sibling id -> Set of where
for (const other of all) {
  if (other.id === card.id) continue;
  const byId = new RegExp(`(?<![\\w-])${esc(other.id)}(?![\\w-])`);
  const byTitle = new RegExp(`(?<![\\w-])${esc(other.title)}(?![\\w-])`, 'i');
  for (const [where, text] of haystacks) {
    if (!text) continue;
    if (byId.test(text) || byTitle.test(text)) {
      if (!found.has(other.id)) found.set(other.id, new Set());
      found.get(other.id).add(where);
    }
  }
}

// Every "<Something> card" phrase, so an oblique reference is reported rather than dropped.
const titles = new Set(all.map(s => norm(s.title)));
const resolvedTitles = [...found.keys()].map(id => norm(all.find(s => s.id === id).title));
// Words that make a phrase point at the card in hand rather than at another one.
const DEICTIC = new Set(['this', 'the', 'that', 'a', 'an', 'its', 'our', 'one', 'same', 'other', 'every', 'each',
  'first', 'second', 'third', 'fourth', 'fifth', 'next', 'previous', 'last', 'whole', 'per', 'scope', 'what', 'layout', 'content',
  'so', 'and', 'but', 'then', 'here', 'there', 'only', 'also', 'now', 'still', 'both', 'which', 'when', 'while', 'if', 'no', 'not']);
const seen = new Set();
const unresolved = [];
for (const [where, text] of haystacks) {
  if (!text) continue;
  for (const m of text.matchAll(/\b((?:[A-Z][\w-]*\s+){1,6})card\b/g)) {
    const phrase = m[1].trim();
    if (titles.has(norm(phrase))) continue;                     // an exact title, resolved above
// A tail of an already resolved title matches the regex twice, so read the window ending at the phrase,
// which is where the full title sits.
    const window = norm(text.slice(Math.max(0, m.index - 90), m.index + m[0].length));
    if (resolvedTitles.some(t => window.includes(t))) continue;
    if (phrase.split(/\s+/).every(w => DEICTIC.has(w.toLowerCase()) || /^[A-Z]{2,}$/.test(w))) continue;
    const key = `${where}|${norm(phrase)}`;
    if (seen.has(key)) continue;
    seen.add(key);
// A phrase that is part of a longer real title: name the candidate, never treat the guess as the answer.
    const hint = all.filter(x => x.id !== card.id && norm(x.title).includes(norm(phrase)))
      .map(x => `${x.id} "${x.title}"`);
    unresolved.push({ where, phrase: `${phrase} card`, hint });
  }
}

// ---------------------------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------------------------
const SUBS = await subcategories();
const subLabel = (SUBS[CAT] && SUBS[CAT][entry.subcategory]) || entry.subcategory;
const manifestPath = join(catDir, 'cards.js');
const postersPath = join(catDir, 'posters.js');
const folderMd = join(catDir, 'CLAUDE.md');
const srcText = read(card.path);
const entrySlice = sliceEntry(read(manifestPath), new RegExp(`id:\\s*'${esc(card.id)}'`));
const posterSlice = existsSync(postersPath) ? slicePoster(read(postersPath), card.id) : null;

if (flags.json) {
  P(JSON.stringify({
    id: card.id, title: entry.title, category: CAT, subcategory: entry.subcategory,
    k8sVersion: entry.k8sVersion, tinted: !!entry.tinted, desc: entry.desc, sources: entry.sources || [],
    steps: SPEC.map(s => ({ id: s.id, duration: s.duration, narration: s.narration || null })),
    record: record ? { shape: record.shape, rel: record.rel } : null,
    siblings: [...found].map(([id, where]) => ({ id, title: all.find(s => s.id === id).title, where: [...where] })),
    unresolved,
  }, null, 2));
  process.exit(0);
}

P('='.repeat(96));
P(`ctx  ${card.id}   "${entry.title}"`);
P('='.repeat(96));
P(`CATEGORY    ${CAT} / ${entry.subcategory} (${subLabel})`);
P(`VERSION     k8s ${entry.k8sVersion || '?'}${entry.tinted ? '  ·  tinted' : ''}`);
P(`SOURCE      ${rel(card.path)}   ${lines(srcText).length} lines   mtime ${mtime(card.path)}`);
if (record) P(`RECORD      ${record.rel}   ${record.shape}${record.text ? '' : '   NO SECTION FOR THIS CARD'}   mtime ${mtime(record.path)}`);
else P('RECORD      NONE FOUND, which is itself a finding');
P(`POINTER     ${recordPointer(card)}`);
P(`STEPS       ${SPEC.length}  ${SPEC.map(s => `${s.id}:${s.duration || '?'}`).join('  ')}`);
if (mod.__error) P(`MODULE      IMPORT FAILED: ${mod.__error}`);
P(`SOURCES     ${(entry.sources || []).map(s => `${s.label} ${s.href}`).join('\n            ') || 'none declared'}`);
P();

P(rule(`1. CATALOG ENTRY   ${rel(manifestPath)}${entrySlice ? `:${entrySlice.from}-${entrySlice.to}` : ''}`));
P(entrySlice ? entrySlice.text : `NOT FOUND: no id: '${card.id}' in ${rel(manifestPath)}`);
P();

if (!flags['no-record']) {
  P(rule(`2. RECORD   ${record ? record.rel : 'none'}`));
  P(record && record.text ? record.text : 'NO RECORD SECTION. S-36 wants one, and its absence is a finding to report.');
  P();
}

if (!flags['no-source']) {
  P(rule(`3. SOURCE   ${rel(card.path)}`));
  lines(srcText).forEach((l, i) => P(`${String(i + 1).padStart(6)}\t${l}`));
  P();
}

P(rule(`4. POSTER FRAGMENT   ${rel(postersPath)}${posterSlice ? `:${posterSlice.from}-${posterSlice.to}` : ''}`));
P(posterSlice ? posterSlice.text : `NOT FOUND: no '${card.id}' key in ${rel(postersPath)}`);
P();

P(rule(`5. CATEGORY CONTRACT   ${rel(folderMd)}`));
P(existsSync(folderMd) ? read(folderMd) : 'MISSING');
P();

if (flags.siblings !== 'none') {
  P(rule(`6. SIBLINGS THIS CARD NAMES   ${found.size} resolved, ${unresolved.length} unresolved mention(s)`));
  if (!found.size) P('None. A card that names no sibling is ordinary, and it removes the cheapest contradiction check.');
// Tiered on where the name appears: desc, aria-label or narration is a user-visible claim and prints whole,
// a record-only mention prints one line unless --siblings=all.
  const prosey = (where) => [...where].some(w => w !== 'record');
  for (const [id, where] of found) {
    const s = all.find(x => x.id === id);
    const f = files.find(x => x.id === id);
    const deep = flags.siblings === 'all' || flags.siblings === 'full' || prosey(where);
    P(`  ${id}   "${s.title}"   [${s.category}/${s.subcategory}]   named in: ${[...where].join(', ')}`);
    P(`      file  ${rel(f.path)}`);
    if (!deep) { P('      record-only mention. --siblings=all prints its prose'); P(); continue; }
    P(`      desc  ${s.desc}`);
    if (flags.siblings === 'full') {
      P(`      ---- source ----`);
      lines(read(f.path)).forEach((l, i) => P(`      ${String(i + 1).padStart(5)}\t${l}`));
    } else {
      const sm = await moduleOf(f);
      if (sm.SCENE && sm.SCENE['aria-label']) P(`      aria  ${sm.SCENE['aria-label']}`);
      for (const [i, st] of (sm.STEPS_SPEC || []).entries()) {
        if (st.narration) P(`      s${String(i).padStart(2, '0')} ${st.id}: ${st.narration}`);
        if (st.wires) for (const [k, v] of Object.entries(st.wires)) P(`           wire ${k}: ${v}`);
      }
    }
    P();
  }
  if (unresolved.length) {
    P('  UNRESOLVED mentions, which no match can close. Read them by hand:');
    for (const u of unresolved) {
      P(`    "${u.phrase}"   in ${u.where}`);
      for (const h of u.hint || []) P(`        possibly  ${h}`);
    }
    P();
  }
}

P(rule('7. WHAT THIS DUMP DID NOT READ'));
P('  scheme/CLAUDE.md        the sub-app contract. Once per session, not once per card');
P('  scheme/CANON.md         the rulebook. `cd scheme/test && node tools/canon.mjs --check=review`');
P(`  js/schemes/${CAT}/${CAT}-kit.js${' '.repeat(Math.max(1, 12 - CAT.length * 2))}the kit this card paints with`);
P('  the sibling SOURCES     only their prose is above. --siblings=full prints them');
P('  the composition census  `node .claude/skills/card-new/tools/kin.mjs --id=' + card.id + '`');
P('  THE RENDERED FRAMES     nothing here is evidence about geometry, motion or timing.');
P('                          frames.mjs and motion.mjs are, and they are not optional.');
