// text.test.mjs: the half of the T block of ../../CANON.md that a test can read WITHOUT a browser.
// Successor of tools/check-terms.mjs over `desc`, and of the R-dash sweep that tools/check-canon.mjs
// ran over a FILE TREE rather than over catalog strings.
//
// ===========================================================================================
// WHY THE T BLOCK IS SPLIT ACROSS TWO FILES, and it is not a preference
// ===========================================================================================
// A card exports exactly one symbol, `init`. `narration`, the step `id` and the diagram's
// `aria-label` are arguments to makeInit and live inside its closure, so nothing here can reach
// them (fixtures/module.mjs says the same thing at length). They are read by RENDER, in
// ../render/inline.test.mjs, together with every string that is DRAWN on the canvas.
//
// What is statically readable, and therefore lives here:
//   - `desc`, which is declared in each category's cards.js and imports cleanly;
//   - the SOURCE TEXT of every file the dash rule covers, prose and code and comments alike.
//
// The dash sweep is the reason this file exists at all. unit/catalog.test.mjs deliberately scans
// only the strings the CATALOG owns (title, desc, source labels, posters). That leaves the card
// modules themselves, the four kits, the four manifests, the four poster maps, js/lib, the CSS,
// the three page shells and the named cli files with no dash coverage whatsoever, and a dash in a
// COMMENT is exactly the kind that survives review. tools/check-canon.mjs covered them by walking
// the tree, and the walk is carried over here unchanged in spirit: T-05 names the area, and a
// directory is WALKED rather than listed, because twice during one refactor a file moved into
// these folders and silently left the scan behind.
//
// Two deliberate differences from the predecessor:
//   1. A target that cannot be read is a FINDING here. check-canon.mjs:468 swallowed it
//      (`catch (_) { continue; }`), so a renamed file left the sweep quietly smaller.
//   2. The counts below are asserted, not printed. Coverage can collapse at zero findings.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT, cards, categories, folderFiles, folderModules, census, schemes } from '../fixtures/catalog.mjs';
import { loadTerms, sentences, sentenceStarts, termIssues, termRegex } from '../fixtures/prose.mjs';

// The repo root, one level above scheme/. index.html, README.md and the cli/ files live there.
const REPO = join(ROOT, '..');

// The catalog as it stood when this suite was written. Fewer than this is a broken walk, not a
// smaller catalog, and it must be red.
const CARD_TOTAL = 108;

// Measured 2026-08-07 by walking the tree below: 108 cards + 12 category modules (four folders x
// kit, cards.js, posters.js) + 11 js/lib modules + 3 stylesheets + the 8 named files. A floor
// rather than an equality, because a new card or a new lib module legitimately raises it, and the
// failure this guards against is the sweep getting SMALLER.
const DASH_TARGET_FLOOR = 142;

// terms.json is DATA and it is the source of truth for T-06. Its section sizes are asserted so a
// dictionary that silently loses half its entries cannot turn every rule below green.
const DICT_SIZES = { hard: 70, hardLower: 13, exceptions: 11, soft: 8 };
const INLINE_SIZES = { names: 32, apiWords: 105, components: 29, homographs: 3 };

// Built from code points, so this file does not itself contain the characters it bans.
const EM_DASH = String.fromCharCode(0x2014);
const EN_DASH = String.fromCharCode(0x2013);
const DASH_RE = new RegExp(`[${EM_DASH}${EN_DASH}]`, 'g');
const DASH_NAME = { [EM_DASH]: 'em-dash', [EN_DASH]: 'en-dash' };
const APOSTROPHE_RE = new RegExp(`['${String.fromCharCode(0x2019)}]`);

const dict = await loadTerms();
const SCHEMES = await schemes();
const CARDS = await cards();
const CATS = await categories();

// ---------------------------------------------------------------------------------------------
// The dash area (T-04, T-05)
// ---------------------------------------------------------------------------------------------

// Paths relative to the REPO root. Three walked groups and one named list, mirroring
// tools/check-canon.mjs `dashTargets`. The four CARDS.md and INTERNALS.md stay outside the area on
// purpose (T-05): a design record quotes what a card must not do.
async function dashTargets() {
  const out = [];
  for (const c of CARDS) out.push(join('scheme', c.rel));
  // Everything in a category folder that is NOT a card: the kit, the manifest that holds that
  // category's descriptions, the poster map. Walked, never listed: when the kits left js/lib and
  // when the 108 descriptions left js/data.js, a listed set would have kept passing over an area
  // that no longer contained them.
  for (const cat of CATS) {
    const allowed = folderModules(cat);
    for (const n of await folderFiles(cat)) {
      if (allowed.has(n)) out.push(join('scheme', 'js', 'schemes', cat, n));
    }
  }
  return out;
}

// js/lib and css are read straight off disk, because neither is a catalog projection: a new module
// there has to join the sweep the day it lands.
async function walkedDirs() {
  const out = [];
  for (const dir of [join('scheme', 'js', 'lib'), join('scheme', 'css')]) {
    for (const n of (await readdir(join(REPO, dir))).sort()) {
      if (/\.(js|css)$/.test(n)) out.push(join(dir, n));
    }
  }
  return out;
}

// The files that belong to no walk: the three page shells, the barrels, and the cli modules whose
// prose reaches the same reader. Same list tools/check-canon.mjs carried.
const NAMED_TARGETS = [
  join('scheme', 'js', 'data.js'),
  join('scheme', 'js', 'app.js'),
  join('scheme', 'js', 'posters.js'),
  join('scheme', 'js', 'contacts.js'),
  join('scheme', 'index.html'),
  // CANON.md is in scope where the design records are not: a record describes one decision, the
  // canon states the rules, and a rule that quotes a dash teaches the dash.
  join('scheme', 'CANON.md'),
  join('cli', 'js', 'data.js'),
  join('cli', 'js', 'app.js'),
  join('cli', 'css', 'styles.css'),
  'index.html',
  'README.md',
];

async function allDashTargets() {
  const set = new Set([...(await dashTargets()), ...(await walkedDirs()), ...NAMED_TARGETS]);
  return [...set].sort();
}

// ---------------------------------------------------------------------------------------------
// The prose this file owns: one entry per `desc`, tagged with the manifest that declares it.
// ---------------------------------------------------------------------------------------------
const prose = SCHEMES.map(s => ({
  id: s.id,
  where: 'desc',
  file: join('js', 'schemes', s.category, 'cards.js'),
  text: s.desc,
}));

// ---------------------------------------------------------------------------------------------
// Census first. Every rule below walks one of these two lists.
// ---------------------------------------------------------------------------------------------

test(`the prose census is whole (${CARD_TOTAL} desc strings)`, () => {
  assert.equal(prose.length, CARD_TOTAL,
    `collected ${prose.length} desc strings, the catalog lists ${CARD_TOTAL}. A rule that scans nothing reports nothing.`);
  census('text desc walk', new Set(prose.map(p => p.id)).size, CARD_TOTAL);
  const empty = prose.filter(p => !p.text.trim()).map(p => p.id);
  assert.deepEqual(empty, [], `${empty.length} desc(s) are blank, so every term rule below passes over nothing`);
});

test(`terms.json declares ${DICT_SIZES.hard} hard terms and ${DICT_SIZES.hardLower} that must stay lowercase (T-06)`, () => {
  for (const [section, n] of Object.entries(DICT_SIZES)) {
    assert.equal(Object.keys(dict[section]).length, n,
      `terms.json ${section} holds ${Object.keys(dict[section]).length} entries, the recorded size is ${n}. ` +
      'The dictionary is the input to every terminology rule: a smaller one turns them all green.');
  }
  for (const [section, n] of Object.entries(INLINE_SIZES)) {
    const v = dict.inline[section];
    const size = Array.isArray(v) ? v.length : Object.keys(v).length;
    assert.equal(size, n, `terms.json inline.${section} holds ${size} entries, the recorded size is ${n}`);
  }
  // T-07: two decisions that are deliberately not the upstream ones, pinned so a dictionary sweep
  // cannot quietly reverse them.
  for (const t of ['Node', 'Pod', 'Service', 'Kubelet', 'ETCD']) {
    assert.ok(t in dict.hard, `${t} left terms.json hard: it is always capitalised in this catalog`);
  }
  assert.ok('kubectl' in dict.hardLower, 'kubectl left terms.json hardLower: it is always lowercase');
});

// ---------------------------------------------------------------------------------------------
// T-04 / T-05: no em-dash and no en-dash, anywhere in the area
// ---------------------------------------------------------------------------------------------

test(`T-04 no em-dash or en-dash in any of the ${DASH_TARGET_FLOOR}+ files the rule covers`, async () => {
  const targets = await allDashTargets();
  assert.ok(targets.length >= DASH_TARGET_FLOOR,
    `the dash sweep collected ${targets.length} files, fewer than the recorded ${DASH_TARGET_FLOOR}. ` +
    'A file that leaves the walk leaves the rule, which is how the four kits and all 108 descriptions ' +
    'once slipped out of it at zero findings.');

  const bad = [];
  const unreadable = [];
  let scanned = 0;
  for (const rel of targets) {
    let src;
    try {
      src = await readFile(join(REPO, rel), 'utf8');
    } catch (e) {
      // A predecessor swallowed this, so a renamed file made the sweep smaller without a word.
      unreadable.push(`${rel} (${e.code || e.message})`);
      continue;
    }
    scanned++;
    DASH_RE.lastIndex = 0;
    let m;
    while ((m = DASH_RE.exec(src))) {
      const line = src.slice(0, m.index).split('\n').length;
      bad.push(`${rel}:${line}  ${DASH_NAME[m[0]]}`);
    }
  }
  assert.deepEqual(unreadable, [], `${unreadable.length} dash target(s) could not be read, so they were not scanned`);
  assert.equal(scanned, targets.length);
  // Named so the finding says which file and which line, the two things a fixer needs.
  assert.deepEqual(bad, [],
    `${bad.length} dash(es) in the covered tree (project rule: never, anywhere, prose and comments alike)`);
});

test('T-05 the dash area covers the card modules, the four kits, the manifests and the page shells', async () => {
  const targets = new Set(await allDashTargets());
  // Each half of the area named explicitly, because "the walk found some files" is not the claim.
  for (const c of CARDS) {
    assert.ok(targets.has(join('scheme', c.rel)), `${c.id} is outside the dash sweep`);
  }
  for (const cat of CATS) {
    for (const n of folderModules(cat)) {
      assert.ok(targets.has(join('scheme', 'js', 'schemes', cat, n)), `scheme/js/schemes/${cat}/${n} is outside the dash sweep`);
    }
  }
  for (const rel of NAMED_TARGETS) assert.ok(targets.has(rel), `${rel} is outside the dash sweep`);
  // T-05 states the exclusion as flatly as the inclusion: a design record may quote what a card
  // must not write, so the four CARDS.md and INTERNALS.md stay out.
  const records = [...targets].filter(t => /CARDS\.md$|INTERNALS\.md$/.test(t));
  assert.deepEqual(records, [], 'a design record joined the dash sweep, and T-05 puts it deliberately outside');
});

// ---------------------------------------------------------------------------------------------
// T-06 / T-07: terminology and casing over `desc`
// ---------------------------------------------------------------------------------------------

// Both classes come out of one matcher, so the CASE rule and the REWORD rule cannot disagree about
// what a defect is. `reword` is a lowercase-only NAME opening a sentence: two rules that cannot
// hold at once, so a human rephrases rather than a tool capitalising.
function issuesOf(p) {
  const out = { case: [], reword: [] };
  for (const it of termIssues(dict, p.text)) {
    const line = `${p.id} ${p.where} (${p.file})  "${it.was}" should be "${it.want}"  ${it.note}`;
    out[it.cls === 'reword' ? 'reword' : 'case'].push(line);
  }
  return out;
}

test('T-06 every desc spells a dictionary term the one correct way (CASE)', () => {
  const bad = [];
  let seen = 0;
  for (const p of prose) {
    seen++;
    bad.push(...issuesOf(p).case);
  }
  census('desc CASE walk', seen, CARD_TOTAL);
  assert.deepEqual(bad, [], `${bad.length} terminology defect(s) in card descriptions`);
});

test('T-07 no desc opens a sentence with a term that must stay lowercase (REWORD)', () => {
  const bad = [];
  let seen = 0;
  for (const p of prose) {
    seen++;
    bad.push(...issuesOf(p).reword);
  }
  census('desc REWORD walk', seen, CARD_TOTAL);
  // Capitalising is the wrong fix: kubectl is never Kubectl. The sentence gets reworded instead.
  assert.deepEqual(bad, [], `${bad.length} sentence(s) open with a name that may not take a capital`);
});

test('every sentence of every desc opens with a capital (OPEN)', () => {
  const bad = [];
  let seen = 0;
  for (const p of prose) {
    for (const part of sentences(p.text)) {
      seen++;
      const t = part.trim();
      if (t && /^[a-z]/.test(t)) bad.push(`${p.id} ${p.where}  "${t.slice(0, 60)}"`);
    }
  }
  // 3 sentences per desc is the target, so a walk that found fewer than two per card collapsed.
  assert.ok(seen >= CARD_TOTAL * 2, `split ${seen} sentences out of ${CARD_TOTAL} descriptions`);
  // Blind spot carried over knowingly: a fully qualified name with its trailing dot
  // (api.ns.svc.cluster.local.) is indistinguishable from a sentence end here, and widening the
  // splitter would blind this rule, whose whole job is telling a real lowercase opening from a
  // false one. Write a comma straight after the name instead.
  assert.deepEqual(bad, [], `${bad.length} sentence(s) open with a lowercase word`);
});

// ---------------------------------------------------------------------------------------------
// T-01 / T-03: the two characters a narration string may not carry, applied to `desc`
// ---------------------------------------------------------------------------------------------

test('T-01 no apostrophe in any desc: cards.js declares them single-quoted', () => {
  const bad = prose.filter(p => APOSTROPHE_RE.test(p.text)).map(p => `${p.id} (${p.file})`);
  // The same rule that governs narration, on the one prose field a card does not own. An
  // apostrophe here ends the string early and the manifest stops parsing, which takes the whole
  // category off the grid rather than one card.
  assert.deepEqual(bad, [], `${bad.length} desc(s) carry an apostrophe`);
});

test('T-03 no semicolon in any desc: a comma, or a period and a capital', () => {
  const bad = prose.filter(p => p.text.includes(';')).map(p => `${p.id} (${p.file})`);
  assert.deepEqual(bad, [], `${bad.length} desc(s) carry a semicolon`);
});

// ---------------------------------------------------------------------------------------------
// T-19: absolutes in prose. REPORTING, not enforced.
// ---------------------------------------------------------------------------------------------

// T-19 says an absolute is "a defect waiting to be found" and names the words to grep for, and T-20
// says the fix is a CLAUSE rather than a rewrite. Neither is a verdict a machine can reach: "the
// only field a Pod may not change" is true, and the identical sentence about another field is not.
// So this prints the list a reader has to judge and never fails. It is here rather than nowhere
// because the grep is the part nobody remembers to run.
const ABSOLUTES = ['only', 'never', 'always', 'the whole of', 'nothing', 'every', 'all of'];

test('T-19 absolutes in card descriptions, listed for a human to judge (reporting)', (t) => {
  const hits = new Map();
  for (const p of prose) {
    for (const w of ABSOLUTES) {
      const re = new RegExp(`(?<![\\w-])${w}(?![\\w-])`, 'gi');
      const n = (p.text.match(re) || []).length;
      if (!n) continue;
      if (!hits.has(w)) hits.set(w, []);
      hits.get(w).push(p.id);
    }
  }
  const total = [...hits.values()].reduce((a, v) => a + v.length, 0);
  t.diagnostic(`T-19 absolutes over ${prose.length} descriptions: ${total} occurrence(s) across ${hits.size} word(s)`);
  for (const [w, ids] of [...hits].sort((a, b) => b[1].length - a[1].length)) {
    t.diagnostic(`  ${w.padEnd(12)} ${ids.length} card(s): ${ids.slice(0, 8).join(', ')}${ids.length > 8 ? ' ...' : ''}`);
  }
  assert.ok(prose.length === CARD_TOTAL, 'the reporting walk must still see the whole catalog');
});

// ---------------------------------------------------------------------------------------------
// SOFT terms: a distribution, never a verdict. REPORTING.
// ---------------------------------------------------------------------------------------------

// Eight dictionary entries are ordinary English words as well as Kubernetes objects (a Job, a
// Volume, a Namespace). Which form is right depends on the sentence, so the minority form is
// printed for a reader and nothing here fails. The other half of this distribution lives in
// ../render/inline.test.mjs, over narration and aria-label.
test('SOFT ambiguous terms across the descriptions, minority form listed (reporting)', (t) => {
  const forms = new Map();
  for (const p of prose) {
    const starts = new Set(sentenceStarts(p.text));
    for (const term of Object.keys(dict.soft)) {
      const re = termRegex(term);
      let m;
      while ((m = re.exec(p.text))) {
        // Sentence-initial casing carries no information: the position forced it.
        if (starts.has(m.index)) continue;
        const got = m[0];
        const core = got.length === term.length + 1 && /s$/i.test(got) ? got.slice(0, -1) : got;
        if (!forms.has(term)) forms.set(term, new Map());
        const f = forms.get(term);
        if (!f.has(core)) f.set(core, []);
        f.get(core).push(p.id);
      }
    }
  }
  const split = [...forms].filter(([, f]) => f.size > 1).sort();
  t.diagnostic(`SOFT: ${split.length} of ${Object.keys(dict.soft).length} soft term(s) appear in more than one form in a desc`);
  for (const [term, f] of split) {
    const ranked = [...f].sort((a, b) => b[1].length - a[1].length);
    t.diagnostic(`  ${term.padEnd(12)} ${ranked.map(([form, ids]) => `${form} ${ids.length}`).join(' | ')}`);
    for (const [form, ids] of ranked.slice(1)) t.diagnostic(`      ${form}: ${ids.join(', ')}`);
  }
  assert.ok(forms.size > 0, 'no soft term matched anywhere in 108 descriptions: the matcher collapsed');
});
