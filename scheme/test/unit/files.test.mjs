// Rules whose subject is a file: card source text (S-34 comment runs, S-36 record pointer, L-18), the
// three stylesheets as declarations (C-20, C-24), and the shipping exclusion lists (S-41). Comments are
// stripped by a small scanner first, because several state the very rule a grep would report broken.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, cards, census, recordPointer } from '../fixtures/catalog.mjs';
import { importAll } from '../fixtures/module.mjs';
import { walkParts } from '../fixtures/spec.mjs';

const REPO = join(ROOT, '..');

const catalogued = await cards();
const CARD_COUNT = catalogued.length;

// An independent floor: `walked === catalogued.length` compares one list with itself.
const CATALOG_FLOOR = (await cards()).length;
const SOURCE = new Map(catalogued.map(c => [c.id, readFileSync(c.path, 'utf8')]));
const modules = await importAll();

const listing = (items, cap = 8) =>
  items.slice(0, cap).join('\n  ') + (items.length > cap ? `\n  ... and ${items.length - cap} more` : '');

// Returns the source with comments blanked (lines preserved) plus every comment as runs of
// consecutive comment-only lines. A trailing comment never joins a run.
function scan(src) {
  const chars = [...src];
  const code = chars.slice();
  let i = 0;
  let blockLines = 0;
  const blank = (from, to) => { for (let k = from; k < to; k++) if (code[k] !== '\n') code[k] = ' '; };
  while (i < chars.length) {
    const c = chars[i], n = chars[i + 1];
    if (c === '/' && n === '/') {
      let j = i; while (j < chars.length && chars[j] !== '\n') j++;
      blank(i, j); i = j; continue;
    }
    if (c === '/' && n === '*') {
      let j = i + 2; while (j < chars.length && !(chars[j] === '*' && chars[j + 1] === '/')) j++;
      blockLines += chars.slice(i, j).filter(x => x === '\n').length + 1;
      blank(i, Math.min(j + 2, chars.length)); i = j + 2; continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      let j = i + 1;
      while (j < chars.length && chars[j] !== c) { if (chars[j] === '\\') j++; j++; }
      i = j + 1; continue;
    }
    i++;
  }
  const codeText = code.join('');
  const srcLines = src.split('\n');
  const codeLines = codeText.split('\n');
  const runs = [];
  let run = null;
  srcLines.forEach((line, idx) => {
    const isComment = line.trim() !== '' && codeLines[idx].trim() === '';
    if (isComment) {
      if (!run) { run = { line: idx + 1, lines: 0, text: [] }; runs.push(run); }
      run.lines++; run.text.push(line.trim());
    } else run = null;
  });
  return { code: codeText, codeLines, srcLines, runs, blockLines };
}

const SCANS = new Map([...SOURCE].map(([id, src]) => [id, scan(src)]));

describe('a card as source text', () => {
  // S-34: a comment is at most three lines, the tree-wide test below holds every other file to it.
  test('S-34: no comment in a card runs past three lines', (t) => {
    const findings = [];
    let walked = 0, comments = 0, lines = 0, longest = 0, longestAt = '';
    for (const c of catalogued) {
      walked++;
      const s = SCANS.get(c.id);
      // A block comment is counted whole, so a JSDoc paragraph cannot arrive unseen.
      if (s.blockLines > 0) {
        findings.push(`${c.rel}  carries a /* */ block comment of ${s.blockLines} line(s). A card takes ` +
          'line comments of at most three lines (S-34). A JSDoc block belongs beside lib/ code, not here');
      }
      for (const r of s.runs) {
        comments++; lines += r.lines;
        if (r.lines > longest) { longest = r.lines; longestAt = `${c.id}:${r.line}`; }
        if (r.lines > 3) {
          findings.push(`${c.rel}:${r.line}  a comment of ${r.lines} lines: "${r.text[0].slice(0, 60)}..." ` +
            'A card comment says WHAT the line beside it does and why the value is what it is. ' +
            'Anything longer is cut, or goes to the record as a DEVIATES line (S-35)');
        }
      }
    }
    census('files S-34', walked, CARD_COUNT);
    assert.equal(walked, CARD_COUNT, `walked ${walked} cards, the catalog lists ${CARD_COUNT}`);
    assert.ok(walked >= CATALOG_FLOOR, `walked ${walked} cards, floor is ${CATALOG_FLOOR}: a walk over a subset finds fewer defects and passes`);
    assert.ok(comments > 0, 'not one comment was found in any card, so the scanner has gone quiet');
    assert.deepEqual(findings, [], `${findings.length} over-long comment(s):\n  ${listing(findings)}`);
    t.diagnostic(`${comments} comment run(s) over ${lines} lines on ${walked} cards, longest ${longest} line(s) at ${longestAt}`);
  });

  // S-36: the wording is fixed so a reader can find the record by shape.
  test('S-36: exactly one pointer comment, under the imports, naming this card', (t) => {
    const findings = [];
    let walked = 0, placed = 0;
    for (const c of catalogued) {
      walked++;
      const s = SCANS.get(c.id);
      // `./CARDS.md#<id>` while a category keeps one file, `./CARDS/<id>.md` once it splits.
      const want = recordPointer(c);
      const hits = s.srcLines.map((l, i) => ({ text: l.trim(), line: i + 1 })).filter(o => o.text === want);
      // A reworded pointer whose anchor still resolves is the defect nothing else sees.
      const near = s.srcLines.map((l, i) => ({ text: l.trim(), line: i + 1 }))
        .filter(o => o.text !== want && /^\/\/.*Design notes.*CARDS(\.md#|\/)/.test(o.text));
      if (hits.length !== 1) {
        findings.push(`${c.rel}  carries ${hits.length} pointer(s) of the canonical form. Expected exactly one: ${want}`);
      }
      for (const o of near) {
        findings.push(`${c.rel}:${o.line}  "${o.text.slice(0, 80)}" is a REWORDED pointer. The wording is fixed: ${want}`);
      }
      const importLines = s.codeLines.map((l, i) => (/^\s*import\b/.test(l) ? i + 1 : 0)).filter(Boolean);
      const codeAt = s.codeLines.findIndex((l, i) => l.trim() !== '' && !importLines.includes(i + 1)) + 1;
      if (hits.length === 1 && importLines.length) {
        const at = hits[0].line;
        if (at < importLines[importLines.length - 1]) findings.push(`${c.rel}:${at}  the pointer sits ABOVE an import`);
        else if (codeAt && at > codeAt) findings.push(`${c.rel}:${at}  the pointer sits below the first line of code (line ${codeAt})`);
        else placed++;
      }
      if (!importLines.length) findings.push(`${c.rel}  declares no import at all, so "under its imports" cannot be judged`);
    }
    census('files S-36', walked, CARD_COUNT);
    assert.equal(walked, CARD_COUNT, `walked ${walked} cards, the catalog lists ${CARD_COUNT}`);
    assert.ok(walked >= CATALOG_FLOOR, `walked ${walked} cards, floor is ${CATALOG_FLOOR}: a walk over a subset finds fewer defects and passes`);
    assert.deepEqual(findings, [], `${findings.length} pointer problem(s):\n  ${listing(findings)}`);
    assert.equal(placed, CARD_COUNT, `${placed} of ${CARD_COUNT} pointers were located between the imports and the code`);
    t.diagnostic(`${placed} pointer comments, all canonical, all under the imports`);
  });

  // L-18: a font-size presentation attribute loses to the class rule and never renders, so a clearance
  // sized off it is wrong. Read off stripped code and the part tree.
  test('L-18: no card writes font-size as a presentation attribute', (t) => {
    const findings = [];
    let walked = 0, parts = 0, mentions = 0;
    for (const c of catalogued) {
      walked++;
      const s = SCANS.get(c.id);
      s.codeLines.forEach((line, i) => {
        if (!/font-?size/i.test(line)) return;
        findings.push(`${c.rel}:${i + 1}  ${line.trim().slice(0, 80)}. A font-size on a label never ` +
          'renders: add a class in scheme/css/diagrams.css and size the budget off that');
      });
      // As data too, in case the attribute name is ever composed.
      mentions += (SOURCE.get(c.id).match(/font-?size/gi) || []).length;
      const ns = modules.get(c.id);
      walkParts(ns.SCENE && ns.SCENE.parts, (part) => {
        if (!part) return;
        parts++;
        for (const k of Object.keys(part.p || {})) {
          if (/^font-?size$/i.test(k)) findings.push(`${c.rel}  part ${part.kind} '${part.key}' carries ${k}: ${part.p[k]}`);
        }
      });
    }
    census('files L-18', walked, CARD_COUNT);
    assert.equal(walked, CARD_COUNT, `walked ${walked} cards, the catalog lists ${CARD_COUNT}`);
    assert.ok(walked >= CATALOG_FLOOR, `walked ${walked} cards, floor is ${CATALOG_FLOOR}: a walk over a subset finds fewer defects and passes`);
    assert.ok(parts > 1000, `${parts} parts walked over ${walked} cards, which is too few to be the whole catalog`);
    assert.deepEqual(findings, [], `${findings.length} presentation-attribute finding(s):\n  ${listing(findings)}`);
    t.diagnostic(`${parts} parts and ${walked} sources clean. ${mentions} mention(s) of the string in the raw text, ` +
      'all of them comments telling the next author not to');
  });
});

const SHEETS = ['tokens.css', 'styles.css', 'diagrams.css'];

// Not a CSS parser: both rules are about values, and a value cannot span `;` or a brace.
function declarations(css, rel) {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const out = [];
  for (const m of stripped.matchAll(/([-\w]+)\s*:\s*([^;{}]+)(?=[;}])/g)) {
    out.push({ rel, prop: m[1], value: m[2].trim(), line: stripped.slice(0, m.index).split('\n').length });
  }
  return out;
}

const DECLS = SHEETS.flatMap(f => declarations(readFileSync(join(ROOT, 'css', f), 'utf8'), `css/${f}`));

describe('the stylesheets', () => {
  test(`C-20 and C-24 read ${DECLS.length} declarations off ${SHEETS.length} stylesheets`, (t) => {
    // A parse that stops matching finds nothing and passes.
    assert.equal(SHEETS.length, 3, 'scheme/css holds three stylesheets: tokens, styles, diagrams');
    assert.ok(DECLS.length >= 1000, `only ${DECLS.length} declaration(s) parsed, measured 1130 on 2026-08-15`);
    const perFile = {};
    for (const d of DECLS) perFile[d.rel] = (perFile[d.rel] || 0) + 1;
    for (const f of SHEETS) assert.ok(perFile[`css/${f}`] > 0, `css/${f} parsed to 0 declarations`);
    t.diagnostic(Object.entries(perFile).map(([f, n]) => `${f} ${n}`).join(', '));
  });

  // C-20: no colour is computed by the browser out of two others.
  test('C-20: color-mix is used by no declaration', (t) => {
    const found = DECLS.filter(d => /color-mix/i.test(d.value))
      .map(d => `${d.rel}:${d.line}  ${d.prop}: ${d.value.slice(0, 60)}`);
    assert.deepEqual(found, [], `${found.length} declaration(s) use color-mix:\n  ${listing(found)}`);
    const inComments = SHEETS.reduce((n, f) => n + (readFileSync(join(ROOT, 'css', f), 'utf8').match(/color-mix/gi) || []).length, 0);
    t.diagnostic(`0 declarations, against ${inComments} mention(s) in the raw text: the tinted-dialog note ` +
      'says color-mix is deliberately unused, and a grep reports that sentence as the finding');
  });

  // C-24: the only live #ff668c is --ts-tools-color in cli/, an unrelated slot.
  test('C-24: the retired Lifecycle coral #ff668c is reserved by no declaration', () => {
    const found = DECLS.filter(d => /#ff668c/i.test(d.value))
      .map(d => `${d.rel}:${d.line}  ${d.prop}: ${d.value}`);
    assert.deepEqual(found, [], `${found.length} declaration(s) carry the retired coral:\n  ${listing(found)}`);
  });
});

// S-41: the workflows are allowlists, so only the `**/` tree-wide entries of .dockerignore are compared.
const DOCKERIGNORE = readFileSync(join(REPO, '.dockerignore'), 'utf8');
const DEPLOY = readFileSync(join(REPO, '.github', 'workflows', 'deploy.yml'), 'utf8');
const RELEASE = readFileSync(join(REPO, '.github', 'workflows', 'release.yml'), 'utf8');

// `**/CARDS/` is a tree-wide name like `**/CARDS.md`, not a path. A bare root entry is not compared.
function dockerignoreLists() {
  const names = new Set(), paths = new Set(), rootOnly = [];
  for (const raw of DOCKERIGNORE.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const wide = /^\*\*\/(.+\.md)$/.exec(line);
    if (wide) { names.add(wide[1]); continue; }
    const wideDir = /^\*\*\/([\w.-]+)\/$/.exec(line);
    if (wideDir) { names.add(wideDir[1]); continue; }
    if (/\.md$/.test(line)) { rootOnly.push(line); continue; }
    if (line.includes('/')) paths.add(line.replace(/\/$/, ''));
  }
  return { names, paths, rootOnly };
}

// The find tail is matched loosely: a directory entry needs `-exec rm -rf {} +`, not `-delete`.
function deployLists() {
  const find = /find\s+_site\s[^\n]*\)\s*-(?:delete|exec)[^\n]*/.exec(DEPLOY);
  const rm = /rm -rf([^\n]*)/.exec(DEPLOY);
  return {
    names: new Set([...(find ? find[0].matchAll(/-name\s+([\w.-]+)/g) : [])].map(m => m[1])),
    paths: new Set([...(rm ? rm[1].matchAll(/_site\/([\w./-]+)/g) : [])].map(m => m[1].replace(/\/$/, ''))),
  };
}

function releaseLists() {
  const x = /-x ([^\n]*)/.exec(RELEASE);
  const names = new Set(), paths = new Set();
  for (const m of (x ? x[1].matchAll(/"([^"]+)"/g) : [])) {
    const name = /^\*([\w.-]+\.md)$/.exec(m[1]);
    if (name) { names.add(name[1]); continue; }
    const wideDir = /^\*\/([\w.-]+)\/\*$/.exec(m[1]);
    if (wideDir) { names.add(wideDir[1]); continue; }
    const path = /^([\w./-]+?)\/\*$/.exec(m[1]);
    if (path) paths.add(path[1]);
  }
  return { names, paths };
}

describe('what never ships', () => {
  test('S-41: the three exclusion lists name the same internal files', (t) => {
    const dock = dockerignoreLists();
    const deploy = deployLists();
    const release = releaseLists();
    const sorted = (s) => [...s].sort();

    // Three empty sets agree with each other, so each parse must find something.
    for (const [where, got] of [['.dockerignore', dock.names], ['deploy.yml', deploy.names], ['release.yml', release.names]]) {
      assert.ok(got.size >= 4,
        `${where} parsed to ${got.size} internal filename(s). Three empty lists agree with each other, ` +
        'so a parse that has gone quiet has to be a failure here rather than a pass.');
    }
    // Anchored to the live names, so three lists cannot agree on the wrong thing.
    for (const name of ['CLAUDE.md', 'CARDS.md', 'CANON.md', 'CARDS']) {
      for (const [where, got] of [['.dockerignore', dock.names], ['deploy.yml', deploy.names], ['release.yml', release.names]]) {
        assert.ok(got.has(name), `${where} does not exclude ${name}, which is an internal document that must never ship`);
      }
    }
    assert.deepEqual(sorted(deploy.names), sorted(dock.names),
      'deploy.yml and .dockerignore exclude different internal filenames. All three lists have to agree: ' +
      'a name on two of the three ships through the third.');
    assert.deepEqual(sorted(release.names), sorted(dock.names),
      'release.yml and .dockerignore exclude different internal filenames. All three lists have to agree.');

    assert.ok(dock.paths.has('scheme/test') && deploy.paths.has('scheme/test') && release.paths.has('scheme/test'),
      'scheme/test is not excluded in all three places: the harness would ship. ' +
      `.dockerignore ${sorted(dock.paths)}, deploy ${sorted(deploy.paths)}, release ${sorted(release.paths)}`);

    // A path two of the three exclude ships through the third.
    const pathGap = [...new Set([...deploy.paths, ...release.paths])].filter(p => !dock.paths.has(p));
    assert.deepEqual(pathGap, [],
      `the workflows exclude ${pathGap.join(', ')} and .dockerignore does not, so the local ` +
      'container would carry it: Dockerfile is a blanket COPY . . while the workflows are allowlists.');
    t.diagnostic(`${dock.names.size} internal filenames excluded in all three (${sorted(dock.names).join(', ')}), ` +
      `${dock.rootOnly.length} root-only entries in .dockerignore alone (${dock.rootOnly.join(', ')})` +
      (pathGap.length ? `. PATH GAP: the workflows also exclude ${pathGap.join(', ')} and .dockerignore does not` : ''));
  });

  // The container's own build files: .dockerignore excludes itself, configs/ must be in the context
  // so the Dockerfile deletes it after the blanket `COPY . .`, which is itself asserted.
  test('S-41: the container does not serve its own build files', () => {
    const dockerfile = readFileSync(join(REPO, 'Dockerfile'), 'utf8');
    const lines = dockerfile.split('\n').map(l => l.trim());

    const blanket = lines.findIndex(l => /^COPY \. \.$/.test(l));
    assert.ok(blanket !== -1,
      'the Dockerfile no longer carries a blanket `COPY . .`. That copy is what makes the local ' +
      'container catch a file the two workflow allowlists would ship by accident, so replacing it ' +
      'with a selective copy retires the detector: say so on purpose, do not let this test find it.');

    const strip = lines.findIndex(l => /^RUN rm -rf .*\bconfigs\b/.test(l));
    assert.ok(strip > blanket,
      'the Dockerfile does not remove `configs` from the web root after the blanket copy, so the ' +
      'container serves its own nginx config at /configs/nginx.conf. This cannot be fixed in ' +
      '.dockerignore: the COPY two lines up needs nginx.conf in the build context.');

    const ignored = DOCKERIGNORE.split('\n').map(l => l.trim());
    assert.ok(ignored.includes('.dockerignore'),
      '.dockerignore does not exclude itself, so the container serves it at /.dockerignore. It is ' +
      'read before the context is assembled, so excluding it there is legal and is the mechanism ' +
      'that owns exclusions doing the half it can do.');
  });
});

// S-34 everywhere else: own-line `//` runs and `/* */` blocks in every shipped and dev script.
const COMMENT_ROOTS = ['scheme/js', 'scheme/test', 'cli/js', 'tools', '.claude/skills'];
function scriptFiles(dir, out = []) {
  for (const e of readdirSync(join(REPO, dir), { withFileTypes: true })) {
    const rel = join(dir, e.name);
    if (e.isDirectory()) { if (!['node_modules', '.snapshot', 'cache'].includes(e.name)) scriptFiles(rel, out); }
    else if (/\.m?js$/.test(e.name)) out.push(rel);
  }
  return out;
}
test('S-34: no comment in any script runs past three lines', () => {
  const files = COMMENT_ROOTS.flatMap(d => scriptFiles(d));
  assert.ok(files.length > CARD_COUNT, `found only ${files.length} script(s) under ${COMMENT_ROOTS.join(', ')}`);
  const findings = [];
  for (const rel of files) {
    const lines = readFileSync(join(REPO, rel), 'utf8').split('\n');
    let run = 0, start = 0, inBlock = false, blockStart = 0;
    lines.forEach((line, i) => {
      const t = line.trim();
      if (inBlock) {
        if (t.includes('*/')) { inBlock = false; if (i - blockStart + 1 > 3) findings.push(`${rel}:${blockStart + 1}  /* */ of ${i - blockStart + 1} lines`); }
        return;
      }
      if (t.startsWith('/*') && !t.includes('*/')) { inBlock = true; blockStart = i; return; }
      if (t.startsWith('//')) { if (!run) start = i; run++; return; }
      if (run > 3) findings.push(`${rel}:${start + 1}  a comment of ${run} lines`);
      run = 0;
    });
    if (run > 3) findings.push(`${rel}:${start + 1}  a comment of ${run} lines`);
  }
  assert.deepEqual(findings, [], `${findings.length} comment(s) over three lines:\n  ${listing(findings)}`);
});
