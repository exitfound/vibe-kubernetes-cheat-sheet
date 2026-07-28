#!/usr/bin/env node
// check-terms.mjs: terminology and casing lint over PROSE (SCHEMES[].desc + every narration
// string). No browser. Dictionary lives in terms.json, rationale for the two classes is there.
// node check-terms.mjs [<id> ...]   ids => that subset; none => whole catalog
// TERMS_VERBOSE=1 also prints the soft-term distribution table.
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { sentences, sentenceStarts, termRegex, termIssues } from './prose.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMES_DIR = join(__dirname, '..', 'js', 'schemes');

const dict = JSON.parse(await readFile(join(__dirname, 'terms.json'), 'utf8'));
const { SCHEMES } = await import(pathToFileURL(join(__dirname, '..', 'js', 'data.js')).href);

const argIds = new Set(process.argv.slice(2).filter(a => !a.startsWith('--')));
const wanted = id => argIds.size === 0 || argIds.has(id);

// ---- collect prose ----
// Each entry: { id, where, line, text }. `where` is desc or narration so a finding says which
// string to open, and `line` points into the file that holds it.
const prose = [];
{
  const dataSrc = await readFile(join(__dirname, '..', 'js', 'data.js'), 'utf8');
  for (const s of SCHEMES) {
    if (!wanted(s.id)) continue;
    const at = dataSrc.indexOf(s.desc);
    prose.push({ id: s.id, where: 'desc', file: 'js/data.js', line: at < 0 ? 0 : dataSrc.slice(0, at).split('\n').length, text: s.desc });
  }
}
for (const f of (await readdir(SCHEMES_DIR)).filter(n => n.endsWith('.js')).sort()) {
  const id = f.replace(/\.js$/, '');
  if (!wanted(id)) continue;
  const src = await readFile(join(SCHEMES_DIR, f), 'utf8');
  for (const m of src.matchAll(/narration:\s*'([^']*)'/g)) {
    prose.push({ id, where: 'narration', file: `js/schemes/${f}`, line: src.slice(0, m.index).split('\n').length, text: m[1] });
  }
  // The aria-label is the diagram read aloud, so it is prose and a screen reader is its reader.
  // It was outside every check until now, and the B3 re-read found four cards whose aria-label
  // still asserted what the pass had just corrected in their narration.
  for (const m of src.matchAll(/'aria-label':\s*'([^']*)'/g)) {
    prose.push({ id, where: 'aria-label', file: `js/schemes/${f}`, line: src.slice(0, m.index).split('\n').length, text: m[1] });
  }
}
if (!prose.length) { console.error('no prose collected (bad ids?)'); process.exit(2); }

// Matching, exceptions and the command-context carve-out all live in prose.mjs, shared with
// fix-terms.mjs so the reporter and the fixer cannot disagree about what a defect is.

const findings = [];   // hard defects
const rewords = [];    // lowercase-canonical term used to open a sentence: reword, do not capitalize
const lowStart = [];   // a sentence opening with a lowercase letter
const softCount = new Map();   // term -> Map(form -> [{id, where, line}])

for (const p of prose) {
  const starts = new Set(sentenceStarts(p.text));

  for (const it of termIssues(dict, p.text)) {
    if (it.cls === 'reword') {
      rewords.push(`${p.id} ${p.where} ${p.file}:${p.line}  sentence opens with "${it.was}": reword so it does not start with ${it.want}`);
    } else {
      findings.push(`${p.id} ${p.where} ${p.file}:${p.line}  "${it.was}" should be "${it.want}" (${it.note})`);
    }
  }

  for (const term of Object.keys(dict.soft)) {
    const re = termRegex(term);
    let m;
    while ((m = re.exec(p.text))) {
      if (starts.has(m.index)) continue;          // sentence-initial casing carries no information
      const got = m[0];
      const core = got.length === term.length + 1 && /s$/i.test(got) ? got.slice(0, -1) : got;
      if (!softCount.has(term)) softCount.set(term, new Map());
      const forms = softCount.get(term);
      if (!forms.has(core)) forms.set(core, []);
      forms.get(core).push(`${p.id} ${p.where} ${p.file}:${p.line}`);
    }
  }

  // An aria-label is a label read aloud, not a sentence, so opening it with hostNetwork or
  // emptyDir is correct and the only rewrite OPEN would allow is Hostnetwork, which is wrong.
  if (p.where !== 'aria-label') for (const part of sentences(p.text)) {
    const t = part.trim();
    if (t && /^[a-z]/.test(t)) lowStart.push(`${p.id} ${p.where} ${p.file}:${p.line}  sentence opens lowercase: "${t.slice(0, 60)}"`);
  }
}

// ---- report ----
const say = (title, list) => {
  if (!list.length) return;
  console.log(`\n${title} (${list.length}):`);
  for (const l of list) console.log('  ' + l);
};

say('CASE   wrong form for a term with one correct spelling', findings);
say('REWORD sentence opens with a term that must stay lowercase', rewords);
say('OPEN   sentence opens with a lowercase word', lowStart);

// Soft terms are a distribution, not a verdict: printing the minority form is the useful half,
// because that is the list a reader has to judge. The majority is shown for the ratio only.
const softIssues = [];
for (const [term, forms] of [...softCount].sort()) {
  const ranked = [...forms].sort((a, b) => b[1].length - a[1].length);
  if (ranked.length < 2) continue;
  const total = ranked.reduce((n, [, v]) => n + v.length, 0);
  softIssues.push({ term, ranked, total });
}
if (softIssues.length) {
  console.log(`\nSOFT   ambiguous terms, minority form listed for judgement (${softIssues.length} term(s)):`);
  for (const { term, ranked, total } of softIssues) {
    console.log(`  ${term.padEnd(12)} ${ranked.map(([f, v]) => `${f} ${v.length}`).join(' | ')}   (${total} total)`);
    if (process.env.TERMS_VERBOSE) {
      for (const [f, v] of ranked.slice(1)) for (const site of v) console.log(`      ${f}  ${site}`);
    }
  }
}

const hard = findings.length + rewords.length + lowStart.length;
const nCards = new Set(prose.map(p => p.id)).size;
console.log(`\nterms check: ${prose.length} prose strings over ${nCards} card${nCards === 1 ? '' : 's'}, ${hard} hard finding(s)`);
process.exit(hard ? 1 : 0);
