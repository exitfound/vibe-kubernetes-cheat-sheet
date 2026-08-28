// docs.test.mjs: do the four records and the rulebook still describe the code, and each other?
//
// What it reads: the four card records against the code in group A (anchors, sections, orphans,
// misfiled), CANON.md about itself in group C (duplicate ids and numbering, and the category index
// against the four <cat>/CLAUDE.md), the `Source` column in C4, the citations of every document
// that cites a rule in group D, INCLUDING the card skills at <repo root>/.claude/skills/, and the
// `Check` column in group E. Nothing else in the suite reads the index, the Source column or the
// skills. The COUNTS those same documents state are a different question and a different file,
// ./docs-census.test.mjs (`S-49`).
//
// ===========================================================================================
// WHY GROUP E EXISTS, AND WHAT IT READS
// ===========================================================================================
// The `Check` column says whether a rule has a machine behind it, and a value has TWO halves: the
// FILE and the AXIS inside it, as in `report:overlay/L-02`. A reader that matches the file half
// only gets as far as "overlay.test.mjs exists and the suite runs it" and never looks at L-02, so
// an axis can be renamed or deleted inside a check and the rulebook goes on pointing at it, with
// every value still parsing.
//
// Group E reads the whole value, on four axes: TOOL (the file exists), NOTGATED (a `test:` value
// names a file `npm test` really runs, and a report/ file is never claimed as mandatory because it
// cannot fail), ORPHAN (a test file no rule cites is a test whose subject is written down nowhere)
// and NAME (the axis name has to occur in the file).
//
// WHAT A NAME IS, AND WHY OCCURRENCE IS THE RIGHT TEST. A test file names the rules it carries in
// its own header, and it prints an axis label on every finding it reports. Those two are the same
// vocabulary, so "the name occurs in the file" is the question, and it is deliberately not "the
// name is a test() title": most axes are labels inside a per-card subtest (the geometry file has
// one subtest per card, and DIAGONAL / THROUGH / OFFEDGE are the labels of its findings).
// What this catches is the real drift: a rule pointing at a file that says nothing about it.
//
// ===========================================================================================
// WHY THE INDEX GROUP EXISTS
// ===========================================================================================
// A category rule lives in its folder. CANON.md indexes it: id plus a SUBJECT LABEL, never a second
// copy of the rule text. Nothing else watches this: a check that reads CANON.md alone and never
// opens a folder cannot see an id naming DIFFERENT rules in the two files, an index label that
// disagrees with the folder about how much the rule says, an id the index carries and no folder
// declares, or an id a folder carries and the index leaves out. A rule id must resolve to one copy
// of the rule text.
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
// implementation of a rule lives. C4 is the only reader of it, and the two ways it goes stale are
// line numbers that drift rows into a comment and cells naming files under a directory that has
// been deleted. The column stands at ZERO dead citations, which is exactly when the check is cheap:
// holding zero costs the parse below, recovering it after the next rename costs a pass over every
// rule row.
//
// WHAT COUNTS AS A PATH, AND WHY THE COLUMN IS NOT ALL PATHS. A cell may cite a helper (`valChip`),
// a token (`BEAT`), a CSS selector, a card id, a date or a measurement, and forcing those into
// filenames would be a check that is wrong rather than strict. Measured over all 236 cells today:
// 202 backticked path tokens against 34 distinct non-path ones, and the two separate cleanly on one
// question, "does it hold a slash, or a stem plus a 2 to 4 character extension". The bases below
// are the ones cells are actually written against, and a citation resolves against any of them:
// 43 land on the repo root, 92 on scheme/, 64 on scheme/js/, 3 in a category folder.
//
// AND WHY C5 READS THE OTHER HALF OF THE SAME COLUMN. C4 resolves the 207 path tokens and stops,
// so the 57 tokens that are not paths are C5's subject. Most of them are SYMBOLS: a helper, a
// token, a field. That half goes stale in exactly the way the path half does, and worse, because a
// symbol citation names the thing a reader is told to go call: a rule telling the reader to end a
// Pod factory with `return wrapPod(shell, innerBox);` sends them after a helper the tree no longer
// holds. C5 resolves every identifier-shaped token by OCCURRENCE anywhere under scheme/, which is
// the same test E2 applies to an axis name and for the same reason: a symbol the tree does not
// contain is a citation the reader cannot follow. 31 distinct today, all resolving. What it does
// NOT ask is where the occurrence sits: `setConnectorDir` is in no kit and survives in four
// workloads cards as a comment, and that counts as resolving here. The rule is "a reader can find
// it", not "it is still callable", and the second question needs a parser rather than a scan.
//
// ===========================================================================================
// NOTHING HERE SKIPS
// ===========================================================================================
// A walk that skips a record it cannot open (`if (!existsSync(md)) continue;`) stops checking that
// record's anchors at exit 0, with no finding and no error: 61 anchors leaving the run take a
// printed count from 185 to 124 and say nothing. That is the surviving lesson of S-46, and readDoc
// below is where this file obeys it: a record it cannot open is a failure, never a shorter run.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, cards, catalog, categories, recordFiles } from '../fixtures/catalog.mjs';

// scheme/test/, the directory this file lives two levels inside of.
const TEST_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// The repo root, one level above scheme/. Only the Source column reaches out of scheme/, for root
// `CLAUDE.md`, `sitemap.xml` and `.claude/hooks/check-js.sh`.
const REPO = join(ROOT, '..');

// --------------------------------------------------------------------------------------------
// The recorded counts, re-measured on any green run.
// FLOORS, not equalities, wherever the quantity is allowed to GROW: a record gains notes and the
// rulebook gains rules, and an equality there would go red on healthy work and be edited away. What
// a floor still catches is the failure that actually happened here twice: a walker that stops
// finding its input, reports nothing and exits green.
// --------------------------------------------------------------------------------------------
const ANCHOR_FLOOR = { cluster: 15, workloads: 24, network: 41, storage: 44 };   // 124 total
const CATALOG_RULE_FLOOR = 235;                                                  // the L A M C T P D R S blocks
const INDEX_ROWS = 40;                                                           // CLU 6, WL 12, NET 9, STO 13
const CANON_ROW_FLOOR = CATALOG_RULE_FLOOR + INDEX_ROWS;                         // 274 rule rows in CANON.md
const REF_FLOOR = 400;                                                           // measured 469 id-shaped tokens
const LABEL_MAX_CHARS = 90;                                                      // measured max 73 (NET.C-01)
const LABEL_MAX_OVERLAP = 55;                                                    // measured max 35 (WL.S-01)

// Rule ROWS carrying at least one test: or report: value, as against `review` or `hook` alone.
// A FLOOR, because draining `review` is the direction of travel and a DROP means rules quietly
// went back to being a human's job, which is a change to make deliberately rather than discover.
// Measured 2026-08-15: 144 rows of 235 name a machine (a row may name two), against 95 `review`.
// The floor moves with the measurement, or a rule could go back to being a human's job with
// nothing red.
const MACHINE_ROW_FLOOR = 140;

// Backticked PATH tokens across every Source cell. A FLOOR, and the reason is the failure this
// group is built against: a parse that stops matching resolves nothing and reports nothing dead.
const SOURCE_PATH_FLOOR = 190;                                                   // measured 207

// The other half of the same cells: backticked tokens shaped like a SYMBOL rather than a path.
// Measured 2026-08-15: 46 citations naming 31 distinct symbols, all of them resolving.
const SOURCE_SYMBOL_FLOOR = 38;

// How each of the 40 category rules is written down in its folder. Three shapes are in use and the
// split is asserted rather than counted loosely, because "declared" and "merely cited" are the
// distinction this whole group turns on, and a parser that stopped telling them apart would go
// quiet, not red.
const DECLARATION_SHAPES = { row: 28, heading: 10, bullet: 2 };

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

// A category's record is one document or many, and group A walks the flattened set either way, so
// every finding names the FILE it sits in and the line inside that file. `recordFiles` decides the
// shape off the tree; `readDoc` still refuses to run a shorter walk over a document it cannot open.
const CARDS_MD = new Map(CATS.map(c => [c, recordFiles(c).map(f => ({ rel: f.rel, md: readDoc(f.rel) }))]));

// Every `## <card id>` in a category, carrying the file and the line it was found at.
const recordSections = (cat) =>
  CARDS_MD.get(cat).flatMap(d => sections(d.md).map(s => ({ ...s, rel: d.rel })));
const recordAnchors = (cat) =>
  CARDS_MD.get(cat).flatMap(d => anchors(d.md).map(a => ({ ...a, rel: d.rel })));
const FOLDER_MD = new Map(CATS.map(c => [c, readDoc(join('js', 'schemes', c, 'CLAUDE.md'))]));
const CANON = readDoc('CANON.md');
const CONTRACT = readDoc('CLAUDE.md');

// The card skills at `<repo root>/.claude/skills/`, which are the fifth reader of the rulebook and
// the only one outside `scheme/`. They cite rule ids instead of restating rules, which is what
// keeps a skill short, and that makes every citation in them a link that can rot exactly the way a
// record's can. Nothing else in the tree opens them.
//
// Read by SHAPE rather than from a list, so a fourth skill is covered the day it is written. Every
// `.md` under a skill folder counts: `SKILL.md` and the reference pages beside it are the same kind
// of document. A missing directory is a failure and not a shorter run (`S-46`), and the floor below
// is what stops a walk that finds nothing from passing as a walk that found nothing wrong.
const SKILLS_DIR = join(REPO, '.claude', 'skills');
const SKILL_DOC_FLOOR = 4;                                   // 3 SKILL.md + card-poster's patterns.md

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

// --------------------------------------------------------------------------------------------
// Parsing. One shape per thing, written out rather than inferred, because every one of these is a
// convention a human types by hand.
// --------------------------------------------------------------------------------------------

// A record section: `## <card id>`.
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

// Every row CANON.md states a rule on, and the regex is what "a rule row" MEANS here, so the
// floors above count the same thing this returns. `| ID | ... |`, id optionally backticked.
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
    out.push({ id: m[2], rule: c[2].trim(), check: c[3].trim(), source: c[4].trim(), line: i + 1 });
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

// A SYMBOL: an identifier, or a dotted member expression of identifiers (`spec.motion`). Deliberately
// narrow, and the 11 citations it leaves behind are the ones no tree could resolve anyway: a rule id
// (`NET.A-01`, carrying a dash), a card id (`workloads-force-deletion`), a CSS selector
// (`.narration-overlay`), a measurement (`g.scheme-box 222x82`), a Check value (`report:arrival/R2`).
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

// Every source file under scheme/, node_modules excluded. Read once for C5, which asks only whether
// a symbol occurs SOMEWHERE: a citation names where a rule is implemented, not where it is declared,
// and the harness under test/ is as legitimate a home as js/ (`R2_STEP_CARRIED`, `readDoc`).
function treeSources(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) treeSources(p, out);
    else if (/\.(js|mjs|css|html|json)$/.test(e.name)) out.push([p, readFileSync(p, 'utf8')]);
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
// The test suite, read out of the package.json where it EXECUTES, never restated here. `npm test`
// runs unit/ and render/; `npm run report` runs report/. A directory that stops being run stops
// being a mandatory home, and this picks that up for free.
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
// GROUP A: the card records against the code.
// --------------------------------------------------------------------------------------------

test('A1 every card record is anchored, and no walk collapses to nothing', () => {
  const per = {};
  let total = 0;
  for (const cat of CATS) {
    per[cat] = recordAnchors(cat).length;
    total += per[cat];
    assert.ok(per[cat] >= ANCHOR_FLOOR[cat],
      `the ${cat} record holds ${per[cat]} anchor(s) over ${CARDS_MD.get(cat).length} document(s), ` +
      `floor is ${ANCHOR_FLOOR[cat]}. ` +
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
// GROUP C: CANON.md about itself. Everything but the `Check` column, which is group E: duplicate
// ids, the numbering, the category index against the folders, and the Source column in C4/C5.
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
    ...CATS.flatMap(c => CARDS_MD.get(c).map(d => [d.rel, d.md])),
    ...SKILL_MD,
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
// GROUP E: the `Check` column, read WHOLE: TOOL / NOTGATED / ORPHAN over the file half, and NAME
// over the axis inside the value. See the header for why the axis half is the one that rots.
// --------------------------------------------------------------------------------------------

test('E1 every Check value is one of the four shapes and names a test file that exists', () => {
  assert.deepEqual(dupBasenames, [],
    `${dupBasenames.length} test file basename(s) are not unique, so a Check value cannot name a ` +
    `file without a path:\n  ${dupBasenames.join('\n  ')}`);
  assert.ok(MANDATORY_DIRS.length > 0 && REPORT_DIRS.length > 0,
    `read ${MANDATORY_DIRS.length} mandatory and ${REPORT_DIRS.length} report director(ies) out of ` +
    'test/package.json. The scripts changed shape and this whole group is now judging nothing.');
  assert.ok(TEST_FILES.size >= 22, `found ${TEST_FILES.size} test file(s), 22 at the last green run`);

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

// --------------------------------------------------------------------------------------------
// GROUP F: the `Rule` column stays ONE line, and the argument that does not fit it lives in "The
// long form" under the same id.
//
// WHY A CEILING AT ALL. The header of CANON.md promises "one line, stated as the thing that must be
// true", and the file had drifted a long way past it: 116 of 245 rule cells ran over 200 characters
// and 39 over 400, which turns a table into paragraphs in a grid. A grid of paragraphs cannot be
// SKIMMED, and skimming is the whole reason the rules are a table: a reader looking for the rule
// about lane shading should find it by running an eye down a column, not by reading an essay about
// each of its 20 neighbours. `tools/canon.mjs` reads the same column, so an unbounded cell also
// makes every filtered listing unreadable.
//
// WHERE THE ARGUMENT WENT. Nowhere: it moved to a `### <id>` block at the end of the file. The
// measurement that fixed a number, the alternative that was tried, what a rule cost the day it was
// missed are what make a rule obeyable rather than merely known, and deleting them to fit a ceiling
// would be the ceiling doing harm. F1 is what keeps the two halves attached to each other.
// --------------------------------------------------------------------------------------------

// The measured worst cell after the split is 235. The ceiling sits just above it, so a row that
// grows an argument back into itself is caught while it is still one row.
const RULE_MAX_CHARS = 240;
const LONG_FORM_FLOOR = 80;                                  // 90 blocks today

// `## The long form` to the end of the file, split into its `### <id>` blocks.
function longForms(md) {
  const at = md.indexOf('\n## The long form\n');
  assert.ok(at !== -1, 'CANON.md has no "## The long form" section: the argument half of every ' +
    'oversized rule lived there, and a walk that cannot find it reports nothing rather than nothing wrong');
  const out = [];
  let id = null;
  for (const line of md.slice(at).split('\n')) {
    const h3 = /^### ([A-Z]{1,3}\.?[A-Z]?-\d+[a-z]?)\s*$/.exec(line);
    if (h3) { id = h3[1]; out.push({ id, body: [] }); continue; }
    if (id) out[out.length - 1].body.push(line);
  }
  return out.map(b => ({ id: b.id, body: b.body.join('\n').trim() }));
}

test('F1 every long form names a declared rule, once, and says something', () => {
  const blocks = longForms(CANON);
  const known = new Set(ROWS.map(r => r.id));
  assert.ok(blocks.length >= LONG_FORM_FLOOR,
    `only ${blocks.length} long form block(s) parsed, floor ${LONG_FORM_FLOOR}. A parse that stops ` +
    'matching finds no dangling block and passes.');

  const dangling = blocks.filter(b => !known.has(b.id)).map(b => b.id);
  assert.deepEqual(dangling, [], `long form(s) for a rule no table declares: ${dangling.join(', ')}`);

  const seen = new Map();
  for (const b of blocks) seen.set(b.id, (seen.get(b.id) || 0) + 1);
  const twice = [...seen].filter(([, n]) => n > 1).map(([id]) => id);
  assert.deepEqual(twice, [], `a rule may have ONE long form: ${twice.join(', ')}`);

  // A long form may be one sentence: `S-33`'s is the shortest at 31 characters and says the whole of
  // what the row could not hold. The floor is only there to catch a heading with NOTHING under it.
  const empty = blocks.filter(b => b.body.length < 25).map(b => b.id);
  assert.deepEqual(empty, [], `long form block(s) with nothing in them: ${empty.join(', ')}. ` +
    'An empty block is a rule whose argument was deleted rather than moved.');
});

test('F2 no rule cell outgrows one line', (t) => {
  const over = CHECK_ROWS
    .filter(r => r.rule.length > RULE_MAX_CHARS)
    .map(r => `CANON.md:${r.line}  ${r.id} is ${r.rule.length} chars: ${r.rule.slice(0, 90)}...`);
  const lens = CHECK_ROWS.map(r => r.rule.length).sort((a, b) => a - b);
  t.diagnostic(`RULE CELL: ${CHECK_ROWS.length} rows, median ${lens[Math.floor(lens.length / 2)]}, ` +
    `worst ${lens[lens.length - 1]}, ceiling ${RULE_MAX_CHARS}`);
  assert.deepEqual(over, [], `${over.length} rule cell(s) past the ceiling. The row keeps the RULE ` +
    'and the argument moves to a `### <id>` block in "The long form", where F1 will hold it to the ' +
    'rule it belongs to. Do not delete it to fit.\n  ' + over.join('\n  '));
});
