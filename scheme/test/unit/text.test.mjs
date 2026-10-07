// The browser-free half of the T block: terminology, casing and characters over `desc`, and the T-04/T-05
// dash sweep over a walked file tree (narration and drawn strings are ../render/inline.test.mjs).
// An unreadable target is a finding, and the coverage counts are asserted.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT, cards, categories, folderFiles, folderModules, census, schemes } from '../fixtures/catalog.mjs';
import { loadTerms, sentences, sentenceStarts, termIssues, termRegex } from '../fixtures/prose.mjs';

const REPO = join(ROOT, '..');

const CARD_TOTAL = (await cards()).length;

// A floor: new cards and modules raise it, a shrinking sweep must go red.
const DASH_TARGET_FLOOR = 142;

// Section sizes asserted so a dictionary that loses entries cannot turn every rule green.
const DICT_SIZES = { hard: 71, hardLower: 13, exceptions: 11, soft: 8 };
const INLINE_SIZES = { names: 32, apiWords: 105, components: 29, homographs: 3 };

// Built from code points so this file does not contain the characters it bans.
const EM_DASH = String.fromCharCode(0x2014);
const EN_DASH = String.fromCharCode(0x2013);
const DASH_RE = new RegExp(`[${EM_DASH}${EN_DASH}]`, 'g');
const DASH_NAME = { [EM_DASH]: 'em-dash', [EN_DASH]: 'en-dash' };
const APOSTROPHE_RE = new RegExp(`['${String.fromCharCode(0x2019)}]`);

const dict = await loadTerms();
const SCHEMES = await schemes();
const CARDS = await cards();
const CATS = await categories();

// The CARDS.md records stay outside the area on purpose (T-05).
async function dashTargets() {
  const out = [];
  for (const c of CARDS) out.push(join('scheme', c.rel));
  // Walked, never listed, so a moved module is still covered.
  for (const cat of CATS) {
    const allowed = folderModules(cat);
    for (const n of await folderFiles(cat)) {
      if (allowed.has(n)) out.push(join('scheme', 'js', 'schemes', cat, n));
    }
  }
  return out;
}

// Read off disk, so a new module joins the sweep the day it lands.
async function walkedDirs() {
  const out = [];
  for (const dir of [join('scheme', 'js', 'lib'), join('scheme', 'css')]) {
    for (const n of (await readdir(join(REPO, dir))).sort()) {
      if (/\.(js|css)$/.test(n)) out.push(join(dir, n));
    }
  }
  return out;
}

// Files that belong to no walk.
const NAMED_TARGETS = [
  join('scheme', 'js', 'data.js'),
  join('scheme', 'js', 'app.js'),
  join('scheme', 'js', 'posters.js'),
  join('scheme', 'js', 'contacts.js'),
  join('scheme', 'index.html'),
  // A rule that quotes a dash teaches the dash.
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

const prose = SCHEMES.map(s => ({
  id: s.id,
  where: 'desc',
  file: join('js', 'schemes', s.category, 'cards.js'),
  text: s.desc,
}));

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
  // T-07: two decisions that differ from upstream, pinned against a dictionary sweep.
  for (const t of ['Node', 'Pod', 'Service', 'Kubelet', 'ETCD']) {
    assert.ok(t in dict.hard, `${t} left terms.json hard: it is always capitalised in this catalog`);
  }
  assert.ok('kubectl' in dict.hardLower, 'kubectl left terms.json hardLower: it is always lowercase');
});

test(`T-04 no em-dash or en-dash in any of the ${DASH_TARGET_FLOOR}+ files the rule covers`, async () => {
  const targets = await allDashTargets();
  assert.ok(targets.length >= DASH_TARGET_FLOOR,
    `the dash sweep collected ${targets.length} files, fewer than the recorded ${DASH_TARGET_FLOOR}. ` +
    'A file that leaves the walk leaves the rule, which is how the four kits and every card description ' +
    'once slipped out of it at zero findings.');

  const bad = [];
  const unreadable = [];
  let scanned = 0;
  for (const rel of targets) {
    let src;
    try {
      src = await readFile(join(REPO, rel), 'utf8');
    } catch (e) {
      // Never swallowed: a silent catch shrinks the sweep on the next rename.
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
  assert.deepEqual(bad, [],
    `${bad.length} dash(es) in the covered tree (project rule: never, anywhere, prose and comments alike)`);
});

test('T-05 the dash area covers the card modules, the four kits, the manifests and the page shells', async () => {
  const targets = new Set(await allDashTargets());
  // Each half of the area named explicitly.
  for (const c of CARDS) {
    assert.ok(targets.has(join('scheme', c.rel)), `${c.id} is outside the dash sweep`);
  }
  for (const cat of CATS) {
    for (const n of folderModules(cat)) {
      assert.ok(targets.has(join('scheme', 'js', 'schemes', cat, n)), `scheme/js/schemes/${cat}/${n} is outside the dash sweep`);
    }
  }
  for (const rel of NAMED_TARGETS) assert.ok(targets.has(rel), `${rel} is outside the dash sweep`);
  // T-05: a design record may quote what a card must not write.
  const records = [...targets].filter(t => /CARDS\.md$/.test(t));
  assert.deepEqual(records, [], 'a design record joined the dash sweep, and T-05 puts it deliberately outside');
});

// One matcher for both classes. `reword` is a lowercase-only name opening a sentence.
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
  // kubectl is never Kubectl: the sentence gets reworded.
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
  // Fewer than two sentences per card means the splitter collapsed.
  assert.ok(seen >= CARD_TOTAL * 2, `split ${seen} sentences out of ${CARD_TOTAL} descriptions`);
  // A trailing-dot FQDN reads as a sentence end: write a comma after it.
  assert.deepEqual(bad, [], `${bad.length} sentence(s) open with a lowercase word`);
});

test('T-01 no apostrophe in any desc: cards.js declares them single-quoted', () => {
  const bad = prose.filter(p => APOSTROPHE_RE.test(p.text)).map(p => `${p.id} (${p.file})`);
  // An apostrophe ends the single-quoted desc early and takes the whole category off the grid.
  assert.deepEqual(bad, [], `${bad.length} desc(s) carry an apostrophe`);
});

test('T-03 no semicolon in any desc: a comma, or a period and a capital', () => {
  const bad = prose.filter(p => p.text.includes(';')).map(p => `${p.id} (${p.file})`);
  assert.deepEqual(bad, [], `${bad.length} desc(s) carry a semicolon`);
});

// T-19, reporting only: an absolute is true or false only in its sentence, so the list is for a reader.

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

// SOFT terms, reporting only: ordinary English words that are also Kubernetes objects.

test('SOFT ambiguous terms across the descriptions, minority form listed (reporting)', (t) => {
  const forms = new Map();
  for (const p of prose) {
    const starts = new Set(sentenceStarts(p.text));
    for (const term of Object.keys(dict.soft)) {
      const re = termRegex(term);
      let m;
      while ((m = re.exec(p.text))) {
        // Sentence-initial casing carries no information.
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
  assert.ok(forms.size > 0, 'no soft term matched anywhere in the card descriptions: the matcher collapsed');
});
