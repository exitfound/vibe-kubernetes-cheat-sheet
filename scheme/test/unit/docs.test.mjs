// The card records, CANON.md and the card skills against the code and each other: anchors and sections (A),
// the category index (B), ids, Source paths and symbols (C), citations (D), the Check column (E),
// rule length (F) and record form (G). Counts are docs-census.test.mjs (S-49). Nothing skips (S-46).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, cards, catalog, categories, recordFiles } from '../fixtures/catalog.mjs';

const TEST_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Only the Source column reaches out of scheme/.
const REPO = join(ROOT, '..');

// Floors, not equalities, where a quantity may grow: they catch a walker that stops finding its input.
// No anchor floor on purpose: a quota on anchors is a quota on documentation.
const CATALOG_RULE_FLOOR = 235;
const INDEX_ROWS = 47;
const CANON_ROW_FLOOR = CATALOG_RULE_FLOOR + INDEX_ROWS;
const REF_FLOOR = 400;
const LABEL_MAX_CHARS = 90;
const LABEL_MAX_OVERLAP = 55;

// Rule rows naming a machine (test:, report:, skill:). A drop means rules went back to review silently.
const MACHINE_ROW_FLOOR = 160;

// A parse that stops matching resolves nothing and reports nothing dead.
const SOURCE_PATH_FLOOR = 190;

const SOURCE_SYMBOL_FLOOR = 38;

// How category rules are declared in their folders, asserted exactly so the parser cannot go quiet.
const DECLARATION_SHAPES = { row: 47, heading: 0, bullet: 0 };

const CATS = await categories();
const { CATEGORY_LABEL } = await catalog();
const CATALOGUE = await cards();
const CARD_SOURCE = new Map(CATALOGUE.map(c => [c.id, readFileSync(c.path, 'utf8')]));
const CAT_OF = new Map(CATALOGUE.map(c => [c.id, c.category]));

const readDoc = (rel) => {
  const p = join(ROOT, rel);
  // Never `continue` on a missing record (S-46).
  assert.ok(existsSync(p), `MISSING RECORD ${rel}: refusing to run a shorter walk and call it green`);
  return readFileSync(p, 'utf8');
};

// Every finding names the file and line, whether a category record is one document or many.
const CARDS_MD = new Map(CATS.map(c => [c, recordFiles(c).map(f => ({ rel: f.rel, md: readDoc(f.rel) }))]));

const recordSections = (cat) =>
  CARDS_MD.get(cat).flatMap(d => sections(d.md).map(s => ({ ...s, rel: d.rel })));
const recordAnchors = (cat) =>
  CARDS_MD.get(cat).flatMap(d => anchors(d.md).map(a => ({ ...a, rel: d.rel })));
const FOLDER_MD = new Map(CATS.map(c => [c, readDoc(join('js', 'schemes', c, 'CLAUDE.md'))]));
const CANON = readDoc('CANON.md');
const CONTRACT = readDoc('CLAUDE.md');

// The card skills cite rule ids, so every citation can rot. Read by shape, so a new skill is covered,
// and a missing directory fails (S-46).
const SKILLS_DIR = join(REPO, '.claude', 'skills');
const SKILL_DOC_FLOOR = 4;

function skillDocs() {
  assert.ok(existsSync(SKILLS_DIR), `MISSING ${SKILLS_DIR}: the card skills are part of this repo, ` +
    'and a walk that cannot open them is a failure rather than a shorter run');
  const out = [];
  const walk = (dir, rel) => {
    for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p, `${rel}/${e.name}`);
      else if (e.name.endsWith('.md')) out.push([`${rel}/${e.name}`, readFileSync(p, 'utf8')]);
    }
  };
  walk(SKILLS_DIR, '.claude/skills');
  assert.ok(out.length >= SKILL_DOC_FLOOR,
    `only ${out.length} skill document(s) found under .claude/skills/, floor ${SKILL_DOC_FLOOR}`);
  return out;
}

const SKILL_MD = skillDocs();

const relCards = (cat) => `js/schemes/${cat}/CARDS.md`;
const relFolder = (cat) => `js/schemes/${cat}/CLAUDE.md`;

function sections(md) {
  const out = [];
  md.split('\n').forEach((line, i) => {
    const m = /^## (.+)$/.exec(line);
    if (m) out.push({ id: m[1].trim(), line: i + 1 });
  });
  return out;
}

// ``### before `<line of code>` ``: the backticked text is data copied off the card, never normalised.
function anchors(md) {
  const out = [];
  let section = null;
  md.split('\n').forEach((line, i) => {
    const h2 = /^## (.+)$/.exec(line);
    if (h2) { section = h2[1].trim(); return; }
    const a = /^### before `(.*)`$/.exec(line);
    if (a) out.push({ section, code: a[1], line: i + 1 });
  });
  return out;
}

// The regex is what "a rule row" means, so the floors count the same thing.
function canonRows(md) {
  return [...md.matchAll(/^\| (`?)([A-Z]{1,3}\.?[A-Z]?-\d+[a-z]?)\1 \|(.*)$/gm)]
    .map(m => ({ id: m[2], rest: m[3] }));
}

// Splits on unescaped pipes only: C-02's rule text carries `role \|\| null`.
function cells(line) {
  const out = [];
  let cur = '';
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '\\' && line[i + 1] === '|') { cur += '\\|'; i++; continue; }
    if (line[i] === '|') { out.push(cur); cur = ''; continue; }
    cur += line[i];
  }
  out.push(cur);
  return out;
}

// Rule rows with a Check column. Index rows have fewer cells and are skipped by count.
function checkRows(md) {
  const out = [];
  md.split('\n').forEach((line, i) => {
    const m = /^\| (`?)([A-Z]{1,3}\.?[A-Z]?-\d+[a-z]?)\1 \|/.exec(line);
    if (!m) return;
    const c = cells(line);
    if (c.length !== 6) return;                          // '', id, rule, check, source, ''
    out.push({ id: m[2], rule: c[2].trim(), check: c[3].trim(), source: c[4].trim(), line: i + 1 });
  });
  return out;
}

// A path has a slash, or a stem plus a 2 to 4 character extension (keeps `.narration-overlay` and `NET.A-01` out).
const PATH_WITH_SLASH = /^[\w.<>/-]*\/[\w.<>/-]*$/;
const BARE_FILENAME = /^[\w<>-]+\.[a-z0-9]{2,4}$/;
const looksLikePath = (tok) => PATH_WITH_SLASH.test(tok) || BARE_FILENAME.test(tok);

// Tried in order. The repo root goes first so a bare `CLAUDE.md` resolves at the root, not scheme/.
const SOURCE_BASES = [
  ['<repo root>', REPO],
  ['scheme/', ROOT],
  ['scheme/js/', join(ROOT, 'js')],
  ...CATS.map(c => [`js/schemes/${c}/`, join(ROOT, 'js', 'schemes', c)]),
];

// `<cat>` names one file per category, so all four must exist.
const expand = (tok) => (tok.includes('<cat>') ? CATS.map(c => tok.replace('<cat>', c)) : [tok]);

function resolveSource(tok) {
  const want = expand(tok);
  for (const [name, base] of SOURCE_BASES) {
    if (want.every(w => existsSync(join(base, w)))) return name;
  }
  return null;
}

function sourcePaths(rows) {
  const out = [];
  for (const { id, source, line } of rows) {
    for (const m of source.matchAll(/`([^`]+)`/g)) {
      if (looksLikePath(m[1])) out.push({ id, line, token: m[1] });
    }
  }
  return out;
}

// Identifier or dotted member expression. Rule ids, card ids, selectors and measurements are left out.
const SYMBOL = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/;

function sourceSymbols(rows) {
  const out = [];
  for (const { id, source, line } of rows) {
    for (const m of source.matchAll(/`([^`]+)`/g)) {
      if (!looksLikePath(m[1]) && SYMBOL.test(m[1])) out.push({ id, line, token: m[1] });
    }
  }
  return out;
}

// C5 asks only whether a symbol occurs somewhere under scheme/, test/ included.
function treeSources(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) treeSources(p, out);
    else if (/\.(js|mjs|css|html|json)$/.test(e.name)) out.push([p, readFileSync(p, 'utf8')]);
  }
  return out;
}

// Prefix-to-category mapping is read from the index headings, category taken from the path.
function categoryIndex(md) {
  const block = /\n## Category-scoped rules\n([\s\S]*?)(?=\n## )/.exec(md);
  assert.ok(block, 'CANON.md has no "## Category-scoped rules" block: the index is gone');
  const out = [];
  for (const part of block[1].split(/\n### /).slice(1)) {
    const head = /^`([A-Z]{2,3})\.\*` ([A-Za-z]+), `js\/schemes\/([a-z]+)\/CLAUDE\.md`/.exec(part);
    assert.ok(head, `a category index heading does not name a prefix, a category and a folder: ${part.split('\n')[0]}`);
    const rows = [...part.matchAll(/^\| `([A-Z]{2,3}\.[A-Z]-\d+[a-z]?)` \| (.*?) \|$/gm)]
      .map(m => ({ id: m[1], label: m[2] }));
    out.push({ prefix: head[1], label: head[2], category: head[3], rows });
  }
  return out;
}

// Declared means a table row, a heading or a bullet carrying the id. A bare prose mention is not.
function declarationSites(md, id) {
  const esc = id.replace(/\./g, '\\.');
  const row = new RegExp('^\\| `' + esc + '` \\|');
  const head = new RegExp('^#{2,4} .*\\(`' + esc + '`\\)\\s*$');
  const tail = new RegExp('\\(`' + esc + '`\\)\\s*$');
  const out = [];
  md.split('\n').forEach((line, i) => {
    if (row.test(line)) out.push({ kind: 'row', line: i + 1, text: line.split('|')[2] ?? '' });
    else if (head.test(line)) out.push({ kind: 'heading', line: i + 1, text: line.replace(/^#+ /, '') });
    else if (tail.test(line)) out.push({ kind: 'bullet', line: i + 1, text: line.trim() });
  });
  return out;
}

// Case-insensitive longest shared run: the measure of "a second copy of the rule".
function longestShared(a, b) {
  const x = a.toLowerCase(), y = b.toLowerCase();
  const prev = new Array(y.length + 1).fill(0);
  let best = 0, at = 0;
  for (let i = 1; i <= x.length; i++) {
    let diag = 0;
    for (let j = 1; j <= y.length; j++) {
      const keep = prev[j];
      prev[j] = x[i - 1] === y[j - 1] ? diag + 1 : 0;
      if (prev[j] > best) { best = prev[j]; at = i; }
      diag = keep;
    }
  }
  return { len: best, run: a.slice(at - best, at) };
}

const INDEX = categoryIndex(CANON);
const ROWS = canonRows(CANON);
const CHECK_ROWS = checkRows(CANON);

// Read from package.json, where the suite executes, so a directory that stops running stops being mandatory.
const PKG = JSON.parse(readFileSync(join(TEST_ROOT, 'package.json'), 'utf8'));
const dirsOf = (script) => [...(PKG.scripts[script] || '').matchAll(/'([a-z-]+)\/\*\*\/\*\.test\.mjs'/g)].map(m => m[1]);
const MANDATORY_DIRS = dirsOf('test');
const REPORT_DIRS = dirsOf('report');

// Basenames are unique across the three directories so a Check value can name a file without a path.
const TEST_FILES = new Map();
const dupBasenames = [];
for (const dir of [...MANDATORY_DIRS, ...REPORT_DIRS]) {
  for (const f of readdirSync(join(TEST_ROOT, dir)).sort()) {
    if (!f.endsWith('.test.mjs')) continue;
    const base = f.slice(0, -'.test.mjs'.length);
    if (TEST_FILES.has(base)) { dupBasenames.push(`${base} is both ${TEST_FILES.get(base).rel} and ${dir}/${f}`); continue; }
    TEST_FILES.set(base, {
      dir,
      rel: `${dir}/${f}`,
      mandatory: MANDATORY_DIRS.includes(dir),
      src: readFileSync(join(TEST_ROOT, dir, f), 'utf8'),
    });
  }
}

// Skill tools, the `skill:` namespace. A separate map because they never fail a run and collide with
// test basenames (`motion`). Unique among themselves only.
const SKILL_TOOL_FLOOR = 8;

function skillTools() {
  const out = new Map();
  const dups = [];
  for (const skill of readdirSync(SKILLS_DIR, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (!skill.isDirectory()) continue;
    const dir = join(SKILLS_DIR, skill.name, 'tools');
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).sort()) {
      if (!f.endsWith('.mjs')) continue;
      const base = f.slice(0, -'.mjs'.length);
      const rel = `.claude/skills/${skill.name}/tools/${f}`;
      if (out.has(base)) { dups.push(`${base} is both ${out.get(base).rel} and ${rel}`); continue; }
      out.set(base, { rel, src: readFileSync(join(dir, f), 'utf8') });
    }
  }
  return { tools: out, dups };
}

const { tools: SKILL_TOOLS, dups: dupToolNames } = skillTools();

const VALUE = /^(test|report|skill):([a-z][a-z0-9-]*)(?:\/([^\s,]+))?$/;
const parseCheck = (cell) => cell.split(',').map(s => s.trim()).filter(Boolean);

// `-` is excluded from both boundaries so `L-05` does not match inside `L-05a`.
const nameOccurs = (src, name) => {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![A-Za-z0-9_-])${esc}(?![A-Za-z0-9_-])`).test(src);
};

test('A1 the record walk finds its input, and the anchors it finds are counted', (t) => {
  const per = {};
  let total = 0;
  for (const cat of CATS) {
    per[cat] = recordAnchors(cat).length;
    total += per[cat];
    // A category reading zero record documents is a broken reader. Anchor counts are not asserted.
    assert.ok(CARDS_MD.get(cat).length > 0,
      `the ${cat} record walk read 0 document(s). A walker that stops finding its input reports ` +
      'no finding and passes, which is the failure this line exists for');
  }
  t.diagnostic(`ANCHORS: ${total} catalog-wide, ${JSON.stringify(per)}`);
});

test('A2 every anchor still occurs in the card it was taken from (an anchor is DATA, never reworded)', (t) => {
  const stale = [];
  const seenIn = new Map();
  let checked = 0;
  for (const cat of CATS) {
    for (const a of recordAnchors(cat)) {
      if (!seenIn.has(a.code)) seenIn.set(a.code, []);
      seenIn.get(a.code).push(`${cat}/${a.section}`);
      const src = CARD_SOURCE.get(a.section);
      if (!src) continue;                       // reported by A4 as an orphan section
      checked++;
      if (!src.includes(a.code)) {
        stale.push(`${a.rel}:${a.line}  [${a.section}]  ${a.code.slice(0, 90)}`);
      }
    }
  }

  // A census: anchors resolve within their own section, so repeats across sections are legal (S-38).
  const dup = [...seenIn.entries()].filter(([, at]) => at.length > 1).sort((a, b) => b[1].length - a[1].length);
  t.diagnostic(`ANCHORS: ${seenIn.size} distinct text(s) over ${checked} anchor(s), ${dup.length} duplicated`);
  for (const [code, at] of dup) {
    t.diagnostic(`  ${String(at.length).padStart(2)}x  ${code.slice(0, 60).padEnd(60)}  ${at.slice(0, 4).join(', ')}${at.length > 4 ? ' ...' : ''}`);
  }
  assert.deepEqual(stale, [], `${stale.length} of ${checked} anchor(s) point at a line that is gone:\n  ${stale.join('\n  ')}`);
});

test('A3 every catalogued card has a "## <id>" section, in its own category record', () => {
  const have = new Map();
  for (const cat of CATS) for (const s of recordSections(cat)) have.set(s.id, cat);
  const missing = CATALOGUE.filter(c => !have.has(c.id))
    .map(c => `${c.id} (no "## ${c.id}" in ${relCards(c.category)})`);
  assert.deepEqual(missing, [], `${missing.length} card(s) with no design record:\n  ${missing.join('\n  ')}`);
  assert.equal(have.size, CATALOGUE.length,
    `${have.size} section(s) for ${CATALOGUE.length} card(s)`);
});

test('A4 no orphan section: every "## <id>" names a card the catalog lists', () => {
  const orphans = [];
  for (const cat of CATS) {
    for (const s of recordSections(cat)) {
      if (!CAT_OF.has(s.id)) orphans.push(`${s.rel}:${s.line}  ## ${s.id}  (no such card in data.js)`);
    }
  }
  assert.deepEqual(orphans, [], `${orphans.length} orphan section(s):\n  ${orphans.join('\n  ')}`);
});

test('A5 no misfiled section: a record sits in its own category file', () => {
  const misfiled = [];
  for (const cat of CATS) {
    for (const s of recordSections(cat)) {
      const real = CAT_OF.get(s.id);
      if (real && real !== cat) {
        misfiled.push(`${s.rel}:${s.line}  ## ${s.id}  belongs in the ${real} record`);
      }
    }
  }
  assert.deepEqual(misfiled, [], `${misfiled.length} misfiled section(s):\n  ${misfiled.join('\n  ')}`);
});

test('A6 no card is described twice, and the per-file census matches the catalog', () => {
  const dup = [];
  const census = {};
  const expected = {};
  for (const c of CATALOGUE) expected[c.category] = (expected[c.category] || 0) + 1;
  for (const cat of CATS) {
    const seen = new Set();
    for (const s of recordSections(cat)) {
      if (seen.has(s.id)) dup.push(`${s.rel}:${s.line}  ## ${s.id} appears twice`);
      seen.add(s.id);
    }
    census[cat] = seen.size;
  }
  assert.deepEqual(dup, [], `${dup.length} duplicated section heading(s):\n  ${dup.join('\n  ')}`);
  assert.deepEqual(census, expected,
    `sections per record do not match the catalog: ${JSON.stringify(census)} against ${JSON.stringify(expected)}`);
});

test('B1 the index covers the four real categories, one block each, naming the folder it points at', () => {
  assert.equal(INDEX.length, CATS.length,
    `the index has ${INDEX.length} block(s) for ${CATS.length} categories`);
  for (const blk of INDEX) {
    assert.ok(CATS.includes(blk.category),
      `index block \`${blk.prefix}.*\` points at js/schemes/${blk.category}/, which data.js does not list as a category`);
    assert.equal(blk.label.toLowerCase(), CATEGORY_LABEL[blk.category].toLowerCase(),
      `index block \`${blk.prefix}.*\` calls js/schemes/${blk.category}/ "${blk.label}", and data.js labels it "${CATEGORY_LABEL[blk.category]}"`);
    assert.ok(blk.rows.length > 0, `index block \`${blk.prefix}.*\` lists no ids`);
  }
  const covered = INDEX.map(b => b.category).sort();
  assert.deepEqual(covered, [...CATS].sort(), 'the index does not cover exactly the four categories');
  const prefixes = INDEX.map(b => b.prefix);
  assert.equal(new Set(prefixes).size, prefixes.length, `two index blocks share a prefix: ${prefixes.join(', ')}`);
});

test('B2 every id the index claims exists in that folder', () => {
  const missing = [];
  let checked = 0;
  for (const blk of INDEX) {
    const md = FOLDER_MD.get(blk.category);
    for (const { id } of blk.rows) {
      checked++;
      if (!md.includes('`' + id + '`')) missing.push(`CANON.md indexes ${id}, and ${relFolder(blk.category)} does not carry it`);
    }
  }
  assert.equal(checked, INDEX_ROWS, `the index lists ${checked} category rule(s), recorded ${INDEX_ROWS}`);
  assert.deepEqual(missing, [], `${missing.length} indexed id(s) do not exist:\n  ${missing.join('\n  ')}`);
});

test('B3 every <CAT>.* id a folder carries is indexed, and no folder carries another category id', () => {
  const unindexed = [], foreign = [];
  for (const blk of INDEX) {
    const indexed = new Set(blk.rows.map(r => r.id));
    const md = FOLDER_MD.get(blk.category);
    const mentioned = new Set([...md.matchAll(/`([A-Z]{2,3}\.[A-Z]-\d+[a-z]?)`/g)].map(m => m[1]));
    for (const id of mentioned) {
      if (!id.startsWith(blk.prefix + '.')) { foreign.push(`${relFolder(blk.category)} cites ${id}, which is another category rule`); continue; }
      if (!indexed.has(id)) unindexed.push(`${relFolder(blk.category)} carries ${id}, and the CANON.md index does not list it`);
    }
  }
  assert.deepEqual(unindexed, [], `${unindexed.length} unindexed rule(s):\n  ${unindexed.join('\n  ')}`);
  assert.deepEqual(foreign, [], `${foreign.length} cross-category citation(s):\n  ${foreign.join('\n  ')}`);
});

test('B4 each category id is declared exactly once, in its folder', () => {
  const bad = [];
  const kinds = { row: 0, heading: 0, bullet: 0 };
  for (const blk of INDEX) {
    for (const { id } of blk.rows) {
      const sites = declarationSites(FOLDER_MD.get(blk.category), id);
      if (sites.length !== 1) {
        bad.push(`${id}: ${sites.length} declaration site(s) in ${relFolder(blk.category)}` +
          (sites.length ? ` (lines ${sites.map(s => s.line).join(', ')})` : ''));
        continue;
      }
      kinds[sites[0].kind]++;
      // The same id declared in a second folder would mean two rules.
      for (const other of CATS.filter(c => c !== blk.category)) {
        if (declarationSites(FOLDER_MD.get(other), id).length) {
          bad.push(`${id} is declared in both ${relFolder(blk.category)} and ${relFolder(other)}`);
        }
      }
    }
  }
  assert.deepEqual(bad, [], `${bad.length} declaration problem(s):\n  ${bad.join('\n  ')}`);
  assert.deepEqual(kinds, DECLARATION_SHAPES,
    `declaration sites by shape moved: ${JSON.stringify(kinds)} against ${JSON.stringify(DECLARATION_SHAPES)}`);
  assert.equal(Object.values(DECLARATION_SHAPES).reduce((a, b) => a + b, 0), INDEX_ROWS,
    'the recorded shape split no longer adds up to the recorded number of category rules');
});

test('B5 an index row carries a SUBJECT LABEL, never a second copy of the rule', () => {
  const bad = [];
  let longestLabel = 0, longestOverlap = 0, worst = '';
  for (const blk of INDEX) {
    const md = FOLDER_MD.get(blk.category);
    for (const { id, label } of blk.rows) {
      longestLabel = Math.max(longestLabel, label.length);
      if (label.length > LABEL_MAX_CHARS) bad.push(`${id}: label is ${label.length} chars, ceiling ${LABEL_MAX_CHARS}. That is a rule, not a label`);
      if (label.includes('**')) bad.push(`${id}: label carries bold emphasis, so it is stating a requirement rather than naming a subject`);
      if (/\.\s/.test(label) || /[.!?]$/.test(label)) bad.push(`${id}: label is a sentence, so it is stating the rule: "${label}"`);
      const { len, run } = longestShared(label, md);
      if (len > longestOverlap) { longestOverlap = len; worst = `${id} "${run}"`; }
      if (len > LABEL_MAX_OVERLAP) {
        bad.push(`${id}: index label repeats ${len} characters of ${relFolder(blk.category)} verbatim ` +
          `("${run.slice(0, 70)}"), ceiling ${LABEL_MAX_OVERLAP}. The rule text lives in the folder and only there`);
      }
    }
  }
  assert.deepEqual(bad, [], `${bad.length} index row(s) restate their rule:\n  ${bad.join('\n  ')}`);
  assert.ok(longestLabel > 0 && longestOverlap > 0,
    `measured nothing (longest label ${longestLabel}, longest shared run ${longestOverlap}): the index parse found no text`);
});

test('C1 the rulebook states at least as many rules as it did, and no id is used twice', () => {
  assert.ok(ROWS.length >= CANON_ROW_FLOOR,
    `CANON.md states ${ROWS.length} rule(s), floor is ${CANON_ROW_FLOOR}`);
  const seen = new Map();
  const dup = [];
  for (const r of ROWS) {
    if (seen.has(r.id)) dup.push(`${r.id} appears twice`);
    seen.set(r.id, r.rest);
  }
  assert.deepEqual(dup, [], `${dup.length} duplicated id(s):\n  ${dup.join('\n  ')}`);
  assert.equal(seen.size, ROWS.length, `${ROWS.length} rows carry ${seen.size} distinct ids`);
});

test('C2 ids run 01..n inside each prefix, with no gap and no repeat', () => {
  const byPrefix = new Map();
  let suffixed = 0;
  for (const { id } of ROWS) {
    const m = /^([A-Z]{1,3}\.?[A-Z]?-)(\d+)([a-z]?)$/.exec(id);
    assert.ok(m, `${id} does not parse as <prefix>-<nn>[letter]`);
    if (m[3]) { suffixed++; continue; }         // T-02a and friends are deliberate insertions
    if (!byPrefix.has(m[1])) byPrefix.set(m[1], []);
    byPrefix.get(m[1]).push(Number(m[2]));
  }
  const seq = [];
  for (const [prefix, nums] of [...byPrefix].sort()) {
    nums.sort((a, b) => a - b);
    if (nums[0] !== 1) seq.push(`${prefix} starts at ${nums[0]}, not 1`);
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] === nums[i - 1]) seq.push(`${prefix}${nums[i]} is used twice`);
      else if (nums[i] !== nums[i - 1] + 1) seq.push(`${prefix} jumps ${nums[i - 1]} to ${nums[i]}`);
    }
  }
  assert.deepEqual(seq, [], `${seq.length} numbering problem(s):\n  ${seq.join('\n  ')}`);
  assert.ok(byPrefix.size >= 28, `${byPrefix.size} id prefixes, recorded 28`);
  assert.ok(suffixed >= 10, `${suffixed} suffixed id(s), recorded 10`);
});

test('C3 the catalog-wide blocks and the category index share no id and no prefix shape', () => {
  // A catalog-wide id never carries a dot and a category id always does, so `S-01` and `CLU.S-01` differ.
  const wide = ROWS.filter(r => !r.id.includes('.')).map(r => r.id);
  const scoped = ROWS.filter(r => r.id.includes('.')).map(r => r.id);
  assert.equal(wide.length + scoped.length, ROWS.length);
  assert.equal(scoped.length, INDEX_ROWS, `${scoped.length} category-scoped row(s) in CANON.md, recorded ${INDEX_ROWS}`);
  assert.ok(wide.length >= CATALOG_RULE_FLOOR, `${wide.length} catalog-wide rule(s), floor ${CATALOG_RULE_FLOOR}`);
  const misshapen = [
    ...wide.filter(id => !/^[A-Z]{1,3}-\d+[a-z]?$/.test(id)),
    ...scoped.filter(id => !/^[A-Z]{2,3}\.[A-Z]-\d+[a-z]?$/.test(id)),
  ];
  assert.deepEqual(misshapen, [], `${misshapen.length} id(s) belong to neither namespace: ${misshapen.join(', ')}`);

  // A category-scoped row outside the index is a second home for the rule.
  const indexed = new Set(INDEX.flatMap(b => b.rows.map(r => r.id)));
  const stray = scoped.filter(id => !indexed.has(id));
  assert.deepEqual(stray, [], `${stray.length} category rule(s) stated in CANON.md outside the index: ${stray.join(', ')}`);
});

test('C4 every repo path a Source cell cites resolves to a file that exists', (t) => {
  const paths = sourcePaths(CHECK_ROWS);
  assert.ok(paths.length >= SOURCE_PATH_FLOOR,
    `only ${paths.length} path(s) parsed out of the Source column, floor is ${SOURCE_PATH_FLOOR}. ` +
    'A parse that stops matching finds no dead citation and passes, which is how this column went ' +
    'stale twice while every check stayed green.');

  const dead = [];
  const byBase = {};
  for (const { id, line, token } of paths) {
    const base = resolveSource(token);
    if (base) { byBase[base] = (byBase[base] || 0) + 1; continue; }
    dead.push(`SOURCE    CANON.md:${line}  ${id}  cites \`${token}\`, and it resolves under none of ` +
      SOURCE_BASES.map(([n]) => n).join(', '));
  }
  assert.deepEqual(dead, [], `${dead.length} dead Source citation(s):\n  ${dead.join('\n  ')}`);
  t.diagnostic(`SOURCE: ${paths.length} path citation(s) over ${CHECK_ROWS.length} rule rows, all resolve ` +
    `(${Object.entries(byBase).map(([n, c]) => `${n} ${c}`).join(', ')})`);
});

test('C5 every symbol a Source cell cites still occurs somewhere under scheme/', (t) => {
  const symbols = sourceSymbols(CHECK_ROWS);
  assert.ok(symbols.length >= SOURCE_SYMBOL_FLOOR,
    `only ${symbols.length} symbol(s) parsed out of the Source column, floor is ${SOURCE_SYMBOL_FLOOR}. ` +
    'The same argument as C4: a parse that stops matching resolves nothing and finds nothing dead.');

  const tree = treeSources(ROOT);
  assert.ok(tree.length >= 100, `${tree.length} source file(s) read under scheme/, which cannot be the whole tree`);

  const dead = [];
  const where = new Map();
  for (const { id, line, token } of symbols) {
    if (where.has(token)) continue;
    const esc = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?<![A-Za-z0-9_$])${esc}(?![A-Za-z0-9_$])`);
    const hit = tree.find(([, src]) => re.test(src));
    if (hit) { where.set(token, hit[0]); continue; }
    where.set(token, null);
    dead.push(`SYMBOL    CANON.md:${line}  ${id}  cites \`${token}\`, and no file under scheme/ contains it. ` +
      'A citation naming a helper that was deleted tells the reader to call it: S-08a said to end a ' +
      'Pod factory with wrapPod() for months after wrapPod was removed.');
  }
  assert.deepEqual(dead, [], `${dead.length} dead Source symbol(s):\n  ${dead.join('\n  ')}`);
  t.diagnostic(`SYMBOL: ${symbols.length} symbol citation(s) naming ${where.size} distinct symbols, all resolving ` +
    `over ${tree.length} files under scheme/`);
});

test('D1 every id a document cites resolves to a declared rule', () => {
  const known = new Set(ROWS.map(r => r.id));
  for (const blk of INDEX) for (const { id } of blk.rows) known.add(id);

  const docs = [
    ['CANON.md', CANON],
    ['CLAUDE.md', CONTRACT],
    ...CATS.map(c => [relFolder(c), FOLDER_MD.get(c)]),
    ...CATS.flatMap(c => CARDS_MD.get(c).map(d => [d.rel, d.md])),
    ...SKILL_MD,
  ];
  // The lookarounds keep arithmetic out: `NODE_Y-24` is not a citation of Y-24.
  const CITE = /(?<![A-Za-z0-9_`\-])(?:\*\*|`)?([A-Z]{1,3}(?:\.[A-Z])?-\d+[a-z]?)(?:\*\*|`)?(?![A-Za-z0-9_])/g;
  const dangling = [];
  let seen = 0;
  for (const [name, text] of docs) {
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      for (const m of line.matchAll(CITE)) {
        seen++;
        if (!known.has(m[1])) dangling.push(`${name}:${i + 1}  cites ${m[1]}, which no rule declares  |  ${line.trim().slice(0, 90)}`);
      }
    });
  }
  assert.ok(seen >= REF_FLOOR,
    `only ${seen} id citation(s) found across ${docs.length} documents, floor ${REF_FLOOR}. ` +
    'A scan that stops matching reports no dangling citations and passes.');
  assert.deepEqual(dangling, [], `${dangling.length} dangling citation(s):\n  ${dangling.join('\n  ')}`);
});

test('E1 every Check value is one of the five shapes and names a file that exists', () => {
  assert.deepEqual(dupBasenames, [],
    `${dupBasenames.length} test file basename(s) are not unique, so a Check value cannot name a ` +
    `file without a path:\n  ${dupBasenames.join('\n  ')}`);
  assert.deepEqual(dupToolNames, [],
    `${dupToolNames.length} skill tool basename(s) are not unique, so a skill: value cannot name a ` +
    `tool without a path:\n  ${dupToolNames.join('\n  ')}`);
  assert.ok(MANDATORY_DIRS.length > 0 && REPORT_DIRS.length > 0,
    `read ${MANDATORY_DIRS.length} mandatory and ${REPORT_DIRS.length} report director(ies) out of ` +
    'test/package.json. The scripts changed shape and this whole group is now judging nothing.');
  assert.ok(TEST_FILES.size >= 22, `found ${TEST_FILES.size} test file(s), 22 at the last green run`);
  assert.ok(SKILL_TOOLS.size >= SKILL_TOOL_FLOOR,
    `found ${SKILL_TOOLS.size} skill tool(s) under .claude/skills/*/tools/, floor ${SKILL_TOOL_FLOOR}. ` +
    'A walk that finds nothing resolves nothing and passes, which is the failure this group exists ' +
    'against.');

  const bad = [];
  let machine = 0;
  for (const { id, check, line } of CHECK_ROWS) {
    const values = parseCheck(check);
    if (!values.length) { bad.push(`CANON.md:${line}  ${id}  has an EMPTY Check cell`); continue; }
    if (values.some(v => v !== 'review' && v !== 'hook')) machine++;
    for (const v of values) {
      if (v === 'review' || v === 'hook') continue;
      const m = VALUE.exec(v);
      if (!m) {
        bad.push(`CANON.md:${line}  ${id}  Check value "${v}" is none of test:<file>[/<name>], ` +
          'report:<file>[/<name>], skill:<tool>[/<name>], hook, review');
        continue;
      }
      const [, kind, file] = m;
      // The kind picks the map, so a `skill:` value never resolves among the test files.
      if (kind === 'skill') {
        if (!SKILL_TOOLS.has(file)) {
          bad.push(`TOOL      CANON.md:${line}  ${id}  cites skill:${file}, and no ${file}.mjs ` +
            'exists under .claude/skills/*/tools/');
        }
        continue;
      }
      const f = TEST_FILES.get(file);
      if (!f) {
        bad.push(`TOOL      CANON.md:${line}  ${id}  cites ${kind}:${file}, and no ${file}.test.mjs ` +
          `exists under ${[...MANDATORY_DIRS, ...REPORT_DIRS].join('/, ')}/`);
        continue;
      }
      // A `test:` value promises `npm test` goes red, so it may not name a report/ file.
      if (kind === 'test' && !f.mandatory) {
        bad.push(`NOTGATED  CANON.md:${line}  ${id}  claims test:${file}, and ${f.rel} is a report ` +
          'file: it prints findings and never fails, so nothing about this rule can go red');
      }
    }
  }
  assert.deepEqual(bad, [], `${bad.length} Check value problem(s):\n  ${bad.join('\n  ')}`);
  assert.ok(machine >= MACHINE_ROW_FLOOR,
    `${machine} rule(s) name a test, floor is ${MACHINE_ROW_FLOOR}. A drop means rules lost their ` +
    'machine and went back to being a human\'s job, which is a change to record deliberately, ' +
    'not one to discover from a green run.');
});

test('E2 every name a Check value carries occurs in the file it names', () => {
  const bad = [];
  let named = 0, bare = 0;
  for (const { id, check, line } of CHECK_ROWS) {
    for (const v of parseCheck(check)) {
      const m = VALUE.exec(v);
      if (!m) continue;                                   // already a finding in E1
      const [, kind, file, name] = m;
      const f = kind === 'skill' ? SKILL_TOOLS.get(file) : TEST_FILES.get(file);
      if (!f) continue;                                   // already a finding in E1
      if (!name) { bare++; continue; }                    // the whole file is the answer
      named++;
      if (!nameOccurs(f.src, name)) {
        bad.push(`NAME      CANON.md:${line}  ${id}  cites ${v}, and "${name}" does not occur in ` +
          `${f.rel}. Either the axis was renamed inside the ${kind === 'skill' ? 'tool' : 'test'}, ` +
          'or the rule is pointing at a file that says nothing about it.');
      }
    }
  }
  assert.deepEqual(bad, [], `${bad.length} unresolvable name(s):\n  ${bad.join('\n  ')}`);
  assert.ok(named >= 100,
    `only ${named} Check value(s) carry a name (${bare} name a file alone). The parse has gone ` +
    'quiet: a run that resolves nothing reports nothing and passes.');
});

test('E3 every test file is cited by at least one rule', () => {
  // A test nothing cites has its subject written down nowhere. Skill tools are excluded: they run only
  // when invoked and several only print.
  const cited = new Set();
  for (const { check } of CHECK_ROWS) {
    for (const v of parseCheck(check)) {
      const m = VALUE.exec(v);
      if (m && m[1] !== 'skill') cited.add(m[2]);
    }
  }
  const orphans = [...TEST_FILES.entries()]
    .filter(([base]) => !cited.has(base))
    .map(([, f]) => `${f.rel} runs and no rule in CANON.md names it, so what it enforces is written down nowhere`);
  assert.deepEqual(orphans, [], `${orphans.length} orphan test file(s):\n  ${orphans.join('\n  ')}`);
  assert.equal(cited.size, TEST_FILES.size,
    `${cited.size} file(s) cited against ${TEST_FILES.size} on disk`);
});

// Group F: a rule cell stays one skimmable line. A longer argument goes to the record or the code.

const RULE_MAX_CHARS = 240;

test('F2 no rule cell outgrows one line', (t) => {
  const over = CHECK_ROWS
    .filter(r => r.rule.length > RULE_MAX_CHARS)
    .map(r => `CANON.md:${r.line}  ${r.id} is ${r.rule.length} chars: ${r.rule.slice(0, 90)}...`);
  const lens = CHECK_ROWS.map(r => r.rule.length).sort((a, b) => a - b);
  t.diagnostic(`RULE CELL: ${CHECK_ROWS.length} rows, median ${lens[Math.floor(lens.length / 2)]}, ` +
    `worst ${lens[lens.length - 1]}, ceiling ${RULE_MAX_CHARS}`);
  assert.deepEqual(over, [], `${over.length} rule cell(s) past the ceiling. The row keeps the RULE, ` +
    'and the argument belongs in the card record or a comment beside the code.\n  ' + over.join('\n  '));
});

// Group G: record form. One `### layout` block, labels from CANON.md's vocabulary in its order (S-51),
// each once, prose at column 9 (which tells `WIRE LABELS` and capitalised sentences apart).
// Blind to whether a block is true or in the present tense (S-48).

// Sections off the form per category: a ceiling that may only fall.
const RECORD_SHAPE_CEILING = { cluster: 0, workloads: 0, network: 0, storage: 0 };
const RECORD_LABEL_CEILING = { cluster: 0, workloads: 0, network: 0, storage: 0 };

const LABEL_COL = 9;

// The order is the rule, so the parse keeps it and never sorts.
function recordVocabulary(md) {
  const at = md.indexOf('\n## The record vocabulary\n');
  assert.ok(at !== -1, 'CANON.md has no "## The record vocabulary" section: the label list every ' +
    'record is held to lives there, and a walk that cannot find it checks nothing and passes');
  const rest = md.slice(at);
  const end = rest.indexOf('\nStructural rules for a record file');
  assert.ok(end !== -1, 'CANON.md: "The record vocabulary" runs to the end of the file. The parse ' +
    'stops at "Structural rules for a record file" and that heading is gone');
  return [...rest.slice(0, end).matchAll(/^\| `([A-Z][A-Z ]*)` \|/gm)].map(m => m[1]);
}

const VOCAB = recordVocabulary(CANON);
const VOCAB_RANK = new Map(VOCAB.map((v, i) => [v, i]));

function sectionBodies(md, rel) {
  const out = [];
  let cur = null;
  md.split('\n').forEach((line, i) => {
    const h2 = /^## (.+)$/.exec(line);
    if (h2) { if (cur) out.push(cur); cur = { id: h2[1].trim(), rel, line: i + 1, body: [] }; return; }
    if (cur) cur.body.push(line);
  });
  if (cur) out.push(cur);
  return out;
}

const recordBodies = (cat) =>
  CARDS_MD.get(cat).flatMap(d => sectionBodies(d.md, d.rel));

function labelOn(line) {
  for (const v of VOCAB) {
    if (line === v) return v;                                // WIRE LABELS, NOT A DEFECT
    if (!line.startsWith(v) || line[v.length] !== ' ') continue;
    const prose = line.length - line.slice(v.length).replace(/^ +/, '').length;
    if (prose === LABEL_COL) return v;
  }
  return null;
}

// Unrecognised column-0 lines are returned too: dropping them is what let an invented label through.
function layoutLabels(body) {
  const m = /^### layout\n\n```\n([\s\S]*?)\n```/m.exec(body.join('\n'));
  if (!m) return null;                                       // no layout block at all, G1 reports it
  const lines = m[1].split('\n');
  return {
    labels: lines.map(labelOn).filter(Boolean),
    strangers: lines.filter(l => l && !l.startsWith(' ') && labelOn(l) === null),
  };
}

test('G0 the label vocabulary parses off CANON.md, in the order it is printed in', (t) => {
  assert.ok(VOCAB.length >= 4,
    `only ${VOCAB.length} label(s) parsed out of "The record vocabulary". A parse that stops ` +
    'matching accepts every label as unknown and every order as wrong, which reads as a broken ' +
    'record rather than as a broken parse');
  assert.equal(VOCAB[0], 'WHAT', `the vocabulary opens on ${VOCAB[0]}, not WHAT`);
  assert.equal(new Set(VOCAB).size, VOCAB.length, `the vocabulary lists a label twice: ${VOCAB.join(', ')}`);
  t.diagnostic(`VOCABULARY: ${VOCAB.length} labels, ${VOCAB.join(' ')}`);
});

test('G1 a record section is ONE "### layout" heading and nothing else', (t) => {
  const findings = [];
  const per = {};
  for (const cat of CATS) {
    const bad = [];
    for (const s of recordBodies(cat)) {
      const heads = s.body.filter(l => l.startsWith('### ')).map(l => l.trim());
      const layout = heads.filter(h => h === '### layout').length;
      const other = heads.filter(h => h !== '### layout');
      if (layout === 1 && !other.length) continue;
      const why = layout !== 1
        ? `${layout} "### layout" heading(s)`
        : `${other.length} heading(s) that are not "### layout": ${[...new Set(other.map(h => h.split('`')[0].trim()))].join(', ')}`;
      bad.push(`${s.rel}:${s.line}  ## ${s.id}  ${why}`);
    }
    per[cat] = bad.length;
    if (bad.length > RECORD_SHAPE_CEILING[cat]) findings.push(...bad);
  }
  t.diagnostic(`RECORD SHAPE: sections off the form ${JSON.stringify(per)}, ` +
    `ceiling ${JSON.stringify(RECORD_SHAPE_CEILING)}`);

  const over = CATS.filter(c => per[c] > RECORD_SHAPE_CEILING[c])
    .map(c => `${c} ${per[c]} against a ceiling of ${RECORD_SHAPE_CEILING[c]}`);
  assert.deepEqual(over, [],
    `${over.length} category(ies) past the record-shape ceiling: ${over.join(', ')}.\n  ` +
    'A record is one "### layout" block: no poster note, no per-line anchor, no heading of its ' +
    'own. Where a note used to take an anchor it goes under the label it belongs to.\n  ' +
    findings.join('\n  '));

  const stale = CATS.filter(c => per[c] < RECORD_SHAPE_CEILING[c])
    .map(c => `${c} is at ${per[c]} against a recorded ${RECORD_SHAPE_CEILING[c]}`);
  for (const s of stale) t.diagnostic(`  LOWER THE CEILING: ${s}`);
});

test('G2 the labels of a record run in the canon order, each once, and open on WHAT', (t) => {
  const findings = [];
  const per = {};
  for (const cat of CATS) {
    const bad = [];
    for (const s of recordBodies(cat)) {
      const read = layoutLabels(s.body);
      if (read === null) continue;                           // G1 owns a section with no layout block
      const labs = read.labels;
      const at = `${s.rel}:${s.line}  ## ${s.id}`;
      const why = [];
      if (!labs.length) why.push('no label at all');
      else if (labs[0] !== 'WHAT') why.push(`opens on ${labs[0]}, not WHAT`);
      const twice = [...new Set(labs.filter((v, i) => labs.indexOf(v) !== i))];
      if (twice.length) why.push(`uses ${twice.join(', ')} more than once`);
      const rank = labs.map(v => VOCAB_RANK.get(v));
      const jump = rank.findIndex((v, i) => i && v <= rank[i - 1]);
      if (jump > 0) why.push(`runs ${labs[jump - 1]} before ${labs[jump]}, against the canon order`);
      if (why.length) bad.push(`${at}  ${why.join('; ')}`);
    }
    per[cat] = bad.length;
    if (bad.length > RECORD_LABEL_CEILING[cat]) findings.push(...bad);
  }
  t.diagnostic(`RECORD LABELS: sections off the vocabulary or the order ${JSON.stringify(per)}, ` +
    `ceiling ${JSON.stringify(RECORD_LABEL_CEILING)}`);

  const over = CATS.filter(c => per[c] > RECORD_LABEL_CEILING[c])
    .map(c => `${c} ${per[c]} against a ceiling of ${RECORD_LABEL_CEILING[c]}`);
  assert.deepEqual(over, [],
    `${over.length} category(ies) past the record-label ceiling: ${over.join(', ')}.\n  ` +
    `The vocabulary is ${VOCAB.join(' ')}, in that order, each label at most once, WHAT first. ` +
    'A label outside it is not a label: a note that fits none of them does not belong in the record.\n  ' +
    findings.join('\n  '));

  const stale = CATS.filter(c => per[c] < RECORD_LABEL_CEILING[c])
    .map(c => `${c} is at ${per[c]} against a recorded ${RECORD_LABEL_CEILING[c]}`);
  for (const s of stale) t.diagnostic(`  LOWER THE CEILING: ${s}`);
});

test('G3 a line in the label column carries a label from the vocabulary and no other word', (t) => {
  const findings = [];
  const per = {};
  for (const cat of CATS) {
    const bad = [];
    for (const s of recordBodies(cat)) {
      const read = layoutLabels(s.body);
      if (read === null) continue;                           // G1 owns a section with no layout block
      for (const line of read.strangers) {
        bad.push(`${s.rel}:${s.line}  ## ${s.id}  ${JSON.stringify(line.slice(0, 60))}`);
      }
    }
    per[cat] = bad.length;
    findings.push(...bad);
  }
  t.diagnostic(`RECORD LABEL COLUMN: unrecognised column-0 line(s) ${JSON.stringify(per)}, on a ` +
    'vocabulary of ' + VOCAB.length);

  // No ceiling: an invented label is a finding wherever it lands, and G2 cannot rank a word it does not know.
  assert.deepEqual(findings, [],
    `${findings.length} line(s) sit in the label column carrying no label from the vocabulary.\n  ` +
    `The vocabulary is ${VOCAB.join(' ')} and nothing else (S-52). A note that fits none of them ` +
    'does not belong in the record. If the line is prose rather than a label, indent it to the column at 9.\n  ' +
    findings.join('\n  '));
});
