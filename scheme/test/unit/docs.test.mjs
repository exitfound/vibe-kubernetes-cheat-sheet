// docs.test.mjs: do the four records and the rulebook still describe the code, and each other?
//
// Successor of tools/check-notes.mjs (anchors, sections, orphans, misfiled) and of the whole of
// tools/check-canonrows.mjs: duplicate ids and numbering in group C, and the `Check` column itself
// in group E. Plus two things nothing had ever checked: the CANON.md category index against the
// four <cat>/CLAUDE.md, and the `Source` column in C4.
//
// ===========================================================================================
// WHY GROUP E EXISTS, AND WHAT IT INHERITS
// ===========================================================================================
// The `Check` column says whether a rule has a machine behind it. Nothing verified it until
// check-canonrows, and check-canonrows only ever read the TOOL half of a value: its regex was
// /\| (gate|report):([a-z][a-z-]*)/, so `gate:check-opacity PHASE` was checked as far as
// "check-opacity.mjs exists and the chain runs it" and the word PHASE was never looked at. An axis
// could be renamed or deleted inside a check and the rulebook would keep pointing at it.
//
// Group E reads the whole value. It is the successor of TOOL (the file exists), NOTGATED (a `test:`
// value names a file `npm test` really runs, and a report/ file is never claimed as mandatory
// because it cannot fail) and ORPHAN (a test file no rule cites is a test whose subject is written
// down nowhere), and it adds the half that was missing: the NAME has to occur in the file.
//
// WHAT A NAME IS, AND WHY OCCURRENCE IS THE RIGHT TEST. A test file names the rules it carries in
// its own header, and it prints an axis label on every finding it reports. Those two are the same
// vocabulary, so "the name occurs in the file" is the question, and it is deliberately not "the
// name is a test() title": most axes are labels inside a per-card subtest (the geometry file has
// 108 subtests, one per card, and DIAGONAL / THROUGH / OFFEDGE are the labels of its findings).
// What this catches is the real drift: a rule pointing at a file that says nothing about it.
//
// ===========================================================================================
// WHY THE INDEX GROUP EXISTS
// ===========================================================================================
// A category rule lives in its folder. CANON.md indexes it: id plus a SUBJECT LABEL, never a second
// copy of the rule text. That was not always so, and nothing watched it: by 2026-08-07 six ids named
// DIFFERENT rules in the two files (CLU.S-01, WL.L-03, WL.L-04, WL.L-05, STO.S-02, STO.S-03), five
// more disagreed on how much the rule said, six ids the index carried did not exist in any folder,
// and three the folders carried were missing from the index. Every one of those was invisible to the
// gate, because check-canonrows reads CANON.md alone and never opens a folder.
//
// So the three assertions below are: the id sets are a bijection, each id has exactly ONE declaration
// site, and an index label does not restate the rule it points at. The last one is measured rather
// than guessed: today the longest verbatim run an index label shares with its folder file is 35
// characters (WL.S-01, "there is no shared connector helper"), and the longest label is 73. A second
// copy of a rule would share hundreds. The ceilings below sit above the measurement with room, and a
// change that pushes past them is a rule being restated, which is the thing this group is for.
//
// ===========================================================================================
// WHY C4 READS THE SOURCE COLUMN
// ===========================================================================================
// `Source` is the rulebook's other citation column: where the long form, the measurement or the
// implementation of a rule lives. Nothing read it until C4, and it went stale twice, once on line
// numbers that had drifted 9 to 12 rows into a comment, once naming files under a scheme/tools/
// that had been deleted. It stands at ZERO dead citations today, which is exactly when the check is
// cheap: holding zero costs the parse below, recovering it after the next rename costs a pass over
// every rule row.
//
// WHAT COUNTS AS A PATH, AND WHY THE COLUMN IS NOT ALL PATHS. A cell may cite a helper (`valChip`),
// a token (`BEAT`), a CSS selector, a card id, a date or a measurement, and forcing those into
// filenames would be a check that is wrong rather than strict. Measured over all 236 cells today:
// 202 backticked path tokens against 34 distinct non-path ones, and the two separate cleanly on one
// question, "does it hold a slash, or a stem plus a 2 to 4 character extension". The bases below
// are the ones cells are actually written against, and a citation resolves against any of them:
// 43 land on the repo root, 92 on scheme/, 64 on scheme/js/, 3 in a category folder.
//
// ===========================================================================================
// NOTHING HERE SKIPS
// ===========================================================================================
// check-notes walked a second record with `if (!existsSync(md)) continue;`, which is how 61 of its
// anchors stopped being checked at exit 0 and the printed anchor count fell from 185 to 124 with
// nothing said. That is the surviving lesson of S-46, and readDoc below is where this file obeys
// it: a record it cannot open is a failure, never a shorter run.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, cards, catalog, categories } from '../fixtures/catalog.mjs';

// scheme/test/, the directory this file lives two levels inside of.
const TEST_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// The repo root, one level above scheme/. Only the Source column reaches out of scheme/, for root
// `CLAUDE.md`, `sitemap.xml` and `.claude/hooks/check-js.sh`.
const REPO = join(ROOT, '..');

// --------------------------------------------------------------------------------------------
// Recorded on the green run of 2026-08-07, the numbers stage 0.2a of REFACTOR-PLAN.md pinned.
// FLOORS, not equalities, wherever the quantity is allowed to GROW: a record gains notes and the
// rulebook gains rules, and an equality there would go red on healthy work and be edited away. What
// a floor still catches is the failure that actually happened here twice: a walker that stops
// finding its input, reports nothing and exits green.
// --------------------------------------------------------------------------------------------
const ANCHOR_FLOOR = { cluster: 15, workloads: 24, network: 41, storage: 44 };   // 124 total
const CATALOG_RULE_FLOOR = 235;                                                  // the L A M C T P D R S blocks
const INDEX_ROWS = 39;                                                           // CLU 5, WL 12, NET 9, STO 13
const CANON_ROW_FLOOR = CATALOG_RULE_FLOOR + INDEX_ROWS;                         // 274, the figure check-canonrows prints
const REF_FLOOR = 400;                                                           // measured 469 id-shaped tokens
const LABEL_MAX_CHARS = 90;                                                      // measured max 73 (NET.C-01)
const LABEL_MAX_OVERLAP = 55;                                                    // measured max 35 (WL.S-01)

// Rule ROWS carrying at least one test: or report: value, as against `review` or `hook` alone.
// A FLOOR, because draining `review` is the direction of travel and a DROP means rules quietly
// went back to being a human's job, which is a change to make deliberately rather than discover.
// Measured 2026-08-07 right after the column was rewritten: 122 rows of 235 (130 values in all,
// since a row may name two), against 112 `review` and 2 `hook`.
const MACHINE_ROW_FLOOR = 122;

// Backticked PATH tokens across every Source cell. A FLOOR, and the reason is the failure this
// group is built against: a parse that stops matching resolves nothing and reports nothing dead.
const SOURCE_PATH_FLOOR = 190;                                                   // measured 202

// How each of the 39 category rules is written down in its folder. Three shapes are in use and the
// split is asserted rather than counted loosely, because "declared" and "merely cited" are the
// distinction this whole group turns on, and a parser that stopped telling them apart would go
// quiet, not red.
const DECLARATION_SHAPES = { row: 27, heading: 10, bullet: 2 };

const CATS = await categories();
const { CATEGORY_LABEL } = await catalog();
const CATALOGUE = await cards();
const CARD_SOURCE = new Map(CATALOGUE.map(c => [c.id, readFileSync(c.path, 'utf8')]));
const CAT_OF = new Map(CATALOGUE.map(c => [c.id, c.category]));

const readDoc = (rel) => {
  const p = join(ROOT, rel);
  // Deliberately not `if (!existsSync) continue`. See the header.
  assert.ok(existsSync(p), `MISSING RECORD ${rel}: refusing to run a shorter walk and call it green`);
  return readFileSync(p, 'utf8');
};

const CARDS_MD = new Map(CATS.map(c => [c, readDoc(join('js', 'schemes', c, 'CARDS.md'))]));
const FOLDER_MD = new Map(CATS.map(c => [c, readDoc(join('js', 'schemes', c, 'CLAUDE.md'))]));
const CANON = readDoc('CANON.md');
const CONTRACT = readDoc('CLAUDE.md');

const relCards = (cat) => `js/schemes/${cat}/CARDS.md`;
const relFolder = (cat) => `js/schemes/${cat}/CLAUDE.md`;

// --------------------------------------------------------------------------------------------
// Parsing. One shape per thing, written out rather than inferred, because every one of these is a
// convention a human types by hand.
// --------------------------------------------------------------------------------------------

// A record section: `## <card id>`. Same regex check-notes uses.
function sections(md) {
  const out = [];
  md.split('\n').forEach((line, i) => {
    const m = /^## (.+)$/.exec(line);
    if (m) out.push({ id: m[1].trim(), line: i + 1 });
  });
  return out;
}

// An anchor: ``### before `<line of code>` ``. The backticked text is DATA, copied off a line of the
// card. Rewording one is the defect this group exists to catch, so nothing here normalises it.
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

// Every row CANON.md states a rule on, by the same regex check-canonrows counts with, so the two
// agree on what a rule row is. `| ID | ... |`, id optionally backticked.
function canonRows(md) {
  return [...md.matchAll(/^\| (`?)([A-Z]{1,3}\.?[A-Z]?-\d+[a-z]?)\1 \|(.*)$/gm)]
    .map(m => ({ id: m[2], rest: m[3] }));
}

// A markdown table row split on its UNESCAPED pipes. C-02's rule text carries `role \|\| null`, so
// a plain split('|') tears that row in half and reads its Check column out of the wrong cell.
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

// Every rule row that HAS a Check column: `| id | rule | check | source |`. The category index rows
// are `| id | subject |` and are skipped here by their cell count, which is the same distinction
// group C draws by id shape. Line numbers are carried so a finding names one.
function checkRows(md) {
  const out = [];
  md.split('\n').forEach((line, i) => {
    const m = /^\| (`?)([A-Z]{1,3}\.?[A-Z]?-\d+[a-z]?)\1 \|/.exec(line);
    if (!m) return;
    const c = cells(line);
    if (c.length !== 6) return;                          // '', id, rule, check, source, ''
    out.push({ id: m[2], check: c[3].trim(), source: c[4].trim(), line: i + 1 });
  });
  return out;
}

// Is a backticked token from a Source cell a REPO PATH? Two shapes, and between them they take all
// 202 paths and none of the 34 helper names, tokens, selectors, ids and dates beside them.
//
// A slash makes it a path outright (`test/render/geometry.test.mjs`, `scheme/css/`, `lib/tokens.js`).
// Without one it needs a STEM and a short extension, which is what keeps `.narration-overlay` and
// `NET.A-01` out while letting the bare `CARDS.md`, `cards.js` and `sitemap.xml` in.
const PATH_WITH_SLASH = /^[\w.<>/-]*\/[\w.<>/-]*$/;
const BARE_FILENAME = /^[\w<>-]+\.[a-z0-9]{2,4}$/;
const looksLikePath = (tok) => PATH_WITH_SLASH.test(tok) || BARE_FILENAME.test(tok);

// The bases a cell is written against, tried in order. Measured over the 202: the repo root 43,
// scheme/ 92, scheme/js/ 64, a category folder 3 (the bare `CARDS.md` and `cards.js`, which a row
// names as a set of four). The repo root goes first so the six bare `CLAUDE.md` land where the rows
// say they do, at the root, rather than on scheme/CLAUDE.md, which exists too.
const SOURCE_BASES = [
  ['<repo root>', REPO],
  ['scheme/', ROOT],
  ['scheme/js/', join(ROOT, 'js')],
  ...CATS.map(c => [`js/schemes/${c}/`, join(ROOT, 'js', 'schemes', c)]),
];

// `js/schemes/<cat>/cards.js` names one file per category, so all four have to exist: the token is a
// convention, and a convention half the folders keep is the thing worth finding.
const expand = (tok) => (tok.includes('<cat>') ? CATS.map(c => tok.replace('<cat>', c)) : [tok]);

// The base a token resolves against, or null. Order only decides which name a diagnostic prints.
function resolveSource(tok) {
  const want = expand(tok);
  for (const [name, base] of SOURCE_BASES) {
    if (want.every(w => existsSync(join(base, w)))) return name;
  }
  return null;
}

// Every backticked path token of every Source cell, with the row it sits in.
function sourcePaths(rows) {
  const out = [];
  for (const { id, source, line } of rows) {
    for (const m of source.matchAll(/`([^`]+)`/g)) {
      if (looksLikePath(m[1])) out.push({ id, line, token: m[1] });
    }
  }
  return out;
}

// The category index: the `## Category-scoped rules` block, split into its four `### <PFX>.*` parts.
// A heading names the prefix, the category by LABEL, and the folder it points at, so the whole
// prefix-to-category mapping is READ here rather than hardcoded: it is a documentation convention
// and this heading is where it is written down. `category` is taken from the PATH, because that is
// the key data.js uses, and the label beside it is checked against data.js separately.
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

// Where a `<CAT>.*` id is DECLARED inside its folder, as opposed to merely mentioned. Three shapes
// are in use and all three are load bearing: a table row, a section heading that carries the id in
// parentheses, and a bullet that ends the same way. A bare mention in prose (the preambles all cite
// the ids that once drifted) is NOT a declaration, and telling the two apart is the whole job here.
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

// Longest run of characters two strings share, case insensitive. The measure of "is this a second
// copy of the rule". Cheap enough: a label is at most 90 characters against a 4 KB file.
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

// --------------------------------------------------------------------------------------------
// The test suite, read the way check-canonrows read the gate chain: out of the package.json where
// it EXECUTES, never restated. `npm test` runs unit/ and render/; `npm run report` runs report/.
// A directory that stops being run stops being a mandatory home, and this picks that up for free.
// --------------------------------------------------------------------------------------------
const PKG = JSON.parse(readFileSync(join(TEST_ROOT, 'package.json'), 'utf8'));
const dirsOf = (script) => [...(PKG.scripts[script] || '').matchAll(/'([a-z-]+)\/\*\*\/\*\.test\.mjs'/g)].map(m => m[1]);
const MANDATORY_DIRS = dirsOf('test');
const REPORT_DIRS = dirsOf('report');

// basename without `.test.mjs` -> where it lives and what it says. The basenames are unique across
// the three directories on purpose: that is what lets a Check value name a file without a path.
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

// `test:geometry/DIAGONAL`, `report:overlay/L-02`, `test:palette`, `hook`, `review`.
const VALUE = /^(test|report):([a-z][a-z0-9-]*)(?:\/([^\s,]+))?$/;
const parseCheck = (cell) => cell.split(',').map(s => s.trim()).filter(Boolean);

// Whole word, where a word may contain `-` (CENTRE-LOW, L-05a, R2-ENTRY). Excluding `-` from both
// boundaries is what stops `L-05` matching inside `L-05a` and `CENTRE` inside `CENTRE-LOW`.
const nameOccurs = (src, name) => {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![A-Za-z0-9_-])${esc}(?![A-Za-z0-9_-])`).test(src);
};

// --------------------------------------------------------------------------------------------
// GROUP A: the card records against the code. Heir of check-notes.
// --------------------------------------------------------------------------------------------

test('A1 every card record is anchored, and no walk collapses to nothing', () => {
  const per = {};
  let total = 0;
  for (const cat of CATS) {
    per[cat] = anchors(CARDS_MD.get(cat)).length;
    total += per[cat];
    assert.ok(per[cat] >= ANCHOR_FLOOR[cat],
      `${relCards(cat)} holds ${per[cat]} anchor(s), floor is ${ANCHOR_FLOOR[cat]}. ` +
      'An anchor is a measurement someone took with a browser: losing one is losing that.');
  }
  const floor = Object.values(ANCHOR_FLOOR).reduce((a, b) => a + b, 0);
  assert.ok(total >= floor, `${total} anchors catalog-wide, floor is ${floor}: ${JSON.stringify(per)}`);
});

test('A2 every anchor still occurs in the card it was taken from (an anchor is DATA, never reworded)', (t) => {
  const stale = [];
  const seenIn = new Map();
  let checked = 0;
  for (const cat of CATS) {
    for (const a of anchors(CARDS_MD.get(cat))) {
      if (!seenIn.has(a.code)) seenIn.set(a.code, []);
      seenIn.get(a.code).push(`${cat}/${a.section}`);
      const src = CARD_SOURCE.get(a.section);
      if (!src) continue;                       // reported by A4 as an orphan section
      checked++;
      if (!src.includes(a.code)) {
        stale.push(`${relCards(cat)}:${a.line}  [${a.section}]  ${a.code.slice(0, 90)}`);
      }
    }
  }

  // A CENSUS, never an assertion: an anchor is resolved inside its own `## <card id>` section, so a
  // text repeated across sections is legal and duplicates are the normal shape of shared geometry.
  // What it costs is a MOVE: carry a note to another card and the old text resolves against that
  // card's code or vanishes, with nothing red (S-38).
  const dup = [...seenIn.entries()].filter(([, at]) => at.length > 1).sort((a, b) => b[1].length - a[1].length);
  t.diagnostic(`ANCHORS: ${seenIn.size} distinct text(s) over ${checked} anchor(s), ${dup.length} duplicated`);
  for (const [code, at] of dup) {
    t.diagnostic(`  ${String(at.length).padStart(2)}x  ${code.slice(0, 60).padEnd(60)}  ${at.slice(0, 4).join(', ')}${at.length > 4 ? ' ...' : ''}`);
  }
  assert.ok(checked >= 124, `only ${checked} anchor(s) were resolved against a card source, expected at least 124`);
  assert.deepEqual(stale, [], `${stale.length} of ${checked} anchor(s) point at a line that is gone:\n  ${stale.join('\n  ')}`);
});

test('A3 every catalogued card has a "## <id>" section, in its own category record', () => {
  const have = new Map();
  for (const cat of CATS) for (const s of sections(CARDS_MD.get(cat))) have.set(s.id, cat);
  const missing = CATALOGUE.filter(c => !have.has(c.id))
    .map(c => `${c.id} (no "## ${c.id}" in ${relCards(c.category)})`);
  assert.deepEqual(missing, [], `${missing.length} card(s) with no design record:\n  ${missing.join('\n  ')}`);
  assert.equal(have.size, CATALOGUE.length,
    `${have.size} section(s) for ${CATALOGUE.length} card(s)`);
});

test('A4 no orphan section: every "## <id>" names a card the catalog lists', () => {
  const orphans = [];
  for (const cat of CATS) {
    for (const s of sections(CARDS_MD.get(cat))) {
      if (!CAT_OF.has(s.id)) orphans.push(`${relCards(cat)}:${s.line}  ## ${s.id}  (no such card in data.js)`);
    }
  }
  assert.deepEqual(orphans, [], `${orphans.length} orphan section(s):\n  ${orphans.join('\n  ')}`);
});

test('A5 no misfiled section: a record sits in its own category file', () => {
  const misfiled = [];
  for (const cat of CATS) {
    for (const s of sections(CARDS_MD.get(cat))) {
      const real = CAT_OF.get(s.id);
      if (real && real !== cat) {
        misfiled.push(`${relCards(cat)}:${s.line}  ## ${s.id}  belongs in ${relCards(real)}`);
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
    for (const s of sections(CARDS_MD.get(cat))) {
      if (seen.has(s.id)) dup.push(`${relCards(cat)}:${s.line}  ## ${s.id} appears twice`);
      seen.add(s.id);
    }
    census[cat] = seen.size;
  }
  assert.deepEqual(dup, [], `${dup.length} duplicated section heading(s):\n  ${dup.join('\n  ')}`);
  assert.deepEqual(census, expected,
    `sections per record do not match the catalog: ${JSON.stringify(census)} against ${JSON.stringify(expected)}`);
});

// --------------------------------------------------------------------------------------------
// GROUP B: the CANON.md category index against the four folders. New. Nothing checked this before.
// --------------------------------------------------------------------------------------------

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
      // The same id declared in a SECOND folder would be one id meaning two rules, which is the
      // collision class this whole group is for. Prefixes make it unlikely and nothing enforced it.
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

// --------------------------------------------------------------------------------------------
// GROUP C: CANON.md about itself. The half of check-canonrows that is not the `Check` column.
// --------------------------------------------------------------------------------------------

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
  // Two namespaces, told apart by SHAPE: a catalog-wide id never carries a dot, a category id
  // always does. That is what lets `S-01` and `CLU.S-01` mean different rules without ambiguity,
  // and it is the only thing that does.
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

  // A category-scoped row anywhere in CANON.md outside the index is a second home for the rule,
  // which is what the two copies of CLU.S-01 and WL.L-03..05 were.
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

// --------------------------------------------------------------------------------------------
// GROUP D: citations. An id is the stable anchor a review, a card note and a commit message cite by,
// so a citation that resolves to nothing is a rule the reader cannot look up.
// --------------------------------------------------------------------------------------------

test('D1 every id a document cites resolves to a declared rule', () => {
  const known = new Set(ROWS.map(r => r.id));
  for (const blk of INDEX) for (const { id } of blk.rows) known.add(id);

  const docs = [
    ['CANON.md', CANON],
    ['CLAUDE.md', CONTRACT],
    ...CATS.map(c => [relFolder(c), FOLDER_MD.get(c)]),
    ...CATS.map(c => [relCards(c), CARDS_MD.get(c)]),
  ];
  // Backticked, bolded or bare. The lookarounds keep arithmetic out: `NODE_Y-24` inside a lane
  // description is not a citation of Y-24, and five of those live in the workloads record.
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

// --------------------------------------------------------------------------------------------
// GROUP E: the `Check` column. Heir of check-canonrows' TOOL / NOTGATED / ORPHAN, reading the whole
// value instead of the tool half of it. See the header for what that changes.
// --------------------------------------------------------------------------------------------

test('E1 every Check value is one of the four shapes and names a test file that exists', () => {
  assert.deepEqual(dupBasenames, [],
    `${dupBasenames.length} test file basename(s) are not unique, so a Check value cannot name a ` +
    `file without a path:\n  ${dupBasenames.join('\n  ')}`);
  assert.ok(MANDATORY_DIRS.length > 0 && REPORT_DIRS.length > 0,
    `read ${MANDATORY_DIRS.length} mandatory and ${REPORT_DIRS.length} report director(ies) out of ` +
    'test/package.json. The scripts changed shape and this whole group is now judging nothing.');
  assert.ok(TEST_FILES.size >= 18, `found ${TEST_FILES.size} test file(s), 18 at the last green run`);

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
          'report:<file>[/<name>], hook, review');
        continue;
      }
      const [, kind, file] = m;
      const f = TEST_FILES.get(file);
      if (!f) {
        bad.push(`TOOL      CANON.md:${line}  ${id}  cites ${kind}:${file}, and no ${file}.test.mjs ` +
          `exists under ${[...MANDATORY_DIRS, ...REPORT_DIRS].join('/, ')}/`);
        continue;
      }
      // NOTGATED, both directions. A `test:` value promises `npm test` goes red, so it may not name
      // a report/ file: those never fail on a finding, by construction and on purpose.
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
      const [, , file, name] = m;
      const f = TEST_FILES.get(file);
      if (!f) continue;                                   // already a finding in E1
      if (!name) { bare++; continue; }                    // the whole file is the answer
      named++;
      if (!nameOccurs(f.src, name)) {
        bad.push(`NAME      CANON.md:${line}  ${id}  cites ${v}, and "${name}" does not occur in ` +
          `${f.rel}. Either the axis was renamed inside the test, or the rule is pointing at a ` +
          'file that says nothing about it.');
      }
    }
  }
  assert.deepEqual(bad, [], `${bad.length} unresolvable name(s):\n  ${bad.join('\n  ')}`);
  assert.ok(named >= 100,
    `only ${named} Check value(s) carry a name (${bare} name a file alone). The parse has gone ` +
    'quiet: a run that resolves nothing reports nothing and passes.');
});

test('E3 every test file is cited by at least one rule', () => {
  // ORPHAN, and it means what it meant: a test nothing cites is a test whose subject is written
  // down nowhere, so a reader of the rulebook cannot find out that the rule has a machine.
  const cited = new Set();
  for (const { check } of CHECK_ROWS) {
    for (const v of parseCheck(check)) {
      const m = VALUE.exec(v);
      if (m) cited.add(m[2]);
    }
  }
  const orphans = [...TEST_FILES.entries()]
    .filter(([base]) => !cited.has(base))
    .map(([, f]) => `${f.rel} runs and no rule in CANON.md names it, so what it enforces is written down nowhere`);
  assert.deepEqual(orphans, [], `${orphans.length} orphan test file(s):\n  ${orphans.join('\n  ')}`);
  assert.equal(cited.size, TEST_FILES.size,
    `${cited.size} file(s) cited against ${TEST_FILES.size} on disk`);
});
