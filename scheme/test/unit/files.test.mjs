// files.test.mjs: the rules whose subject is a FILE rather than a card's data. Three groups, and
// what they share is that the spec cannot answer any of them: a card's own source TEXT (its comments
// and the pointer to its record), the three stylesheets, and the three shipping exclusion lists.
//
// Every rule here stands at ZERO findings, which is what makes it assertable and exactly when a
// check is cheap: holding zero costs the parse below, recovering it after the next rename costs a
// pass over the whole catalog. That is the same argument unit/docs.test.mjs C4 makes for the Source column,
// and it is why these sit in the mandatory set with no report/ queue in front of them.
//
// ===========================================================================================
// WHY A SCANNER AND NOT A GREP
// ===========================================================================================
// Two of the three groups are about text that LOOKS like a finding in a comment. `styles.css` says
// "`color-mix` would say the same in one step and is deliberately unused" inside the tinted-dialog
// note, so a grep for color-mix over that file reports one hit and the rule it reports broken is the
// rule that comment is stating. Two cards likewise carry "do not add a `font-size` attribute" as a
// warning to the next author. So the CSS is read as declarations with its comments stripped, and a
// card is read through a scanner that knows where a string and a comment begin and end.
//
// The scanner is deliberately small, and its simplification is measured rather than assumed: no card
// in the catalogue contains a regex literal or a block comment today. A `/* */` block is counted as a
// comment of its whole line span rather than parsed into runs, so the first one to appear in a card
// is a finding on S-34 instead of a silent mis-parse. A template literal is treated as one string to
// its closing backtick, so a backtick inside a `${}` substitution would confuse it; there is none.
//
// ===========================================================================================
// WHAT THIS FILE IS BLIND TO
// ===========================================================================================
//   - Whether a comment is TRUE, or whether it belongs in the record instead. S-34 is a ceiling on
//     LINES; S-35, which says where anything longer goes, is a human's call and stays `review`.
//   - Whether the record section a pointer names says anything. `unit/docs.test.mjs` group A resolves
//     the `## <id>` heading and its anchors; S-36 here is only the pointer's own shape and place.
//   - Whether a `font-size` in `diagrams.css` is the RIGHT size. L-18 is about the presentation
//     attribute that never renders, not about the class rule that does. `js/lib/inspector.js` sets
//     one on the `?inspect=1` grid legend and is deliberately out of the population: it draws no
//     label of any card and never ships inside a diagram.
//   - Everything a stylesheet does that is not a declaration value: a selector, an @rule, a keyframe
//     name. C-20 and C-24 are both statements about values.
//   - Whether the three exclusion lists WORK. They are compared with each other, which is what S-41
//     asks for; that an excluded path really 404s is a curl against the container, and the root
//     CLAUDE.md says so. The two workflows are ALLOWLISTS, so a root-level document they never copy
//     needs no entry there and only `.dockerignore` has to learn it: that asymmetry is why only the
//     tree-wide `**/` entries of `.dockerignore` are compared.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, cards, census, recordPointer } from '../fixtures/catalog.mjs';
import { importAll } from '../fixtures/module.mjs';
import { walkParts } from '../fixtures/spec.mjs';

// The repo root, one level above scheme/: the two workflows and .dockerignore live there.
const REPO = join(ROOT, '..');

const catalogued = await cards();
const CARD_COUNT = catalogued.length;

// The census of this file, and it is NOT `walked === catalogued.length`: both sides of that come off
// the same list, so a reader that quietly walks a subset compares 40 against 40 and passes. Proved
// by mutation: with the catalogue sliced to 40, only the test carrying an independent number went
// red. So every walk below asserts against this FLOOR as well. A floor, because the catalog grows.
// The walk baseline, DERIVED rather than typed: the catalog it walks and the specs it reads are
// what say how big a whole walk is (CATALOG_BASELINE in ../fixtures/catalog.mjs).
const CATALOG_FLOOR = (await cards()).length;
const SOURCE = new Map(catalogued.map(c => [c.id, readFileSync(c.path, 'utf8')]));
const modules = await importAll();

const listing = (items, cap = 8) =>
  items.slice(0, cap).join('\n  ') + (items.length > cap ? `\n  ... and ${items.length - cap} more` : '');

// ---------------------------------------------------------------------------------------------
// The scanner. Returns the source with every comment blanked out (line structure preserved, so a
// finding can still name a line) plus every comment it removed, as runs of consecutive lines.
//
// A comment RUN is what S-34 counts: consecutive lines whose own content is a comment. A comment
// trailing a line of code is one line by construction and does not join the run below it, because
// the code between them is what makes it a note on that line rather than a paragraph.
// ---------------------------------------------------------------------------------------------
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
  // A line is a COMMENT LINE when it holds text and its code half holds none.
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

// ---------------------------------------------------------------------------------------------
describe('a card as source text', () => {
  // S-34. The ceiling is TWO lines, and it is a ceiling on the run, not on the sentence: three
  // consecutive `//` lines are a paragraph, and S-35 names the four places a paragraph goes instead.
  test('S-34: no comment in a card runs past two lines', (t) => {
    const findings = [];
    let walked = 0, comments = 0, lines = 0, longest = 0, longestAt = '';
    for (const c of catalogued) {
      walked++;
      const s = SCANS.get(c.id);
      // A block comment is not parsed as a run above, it is counted whole. None in the catalogue,
      // and this is the guard that keeps a JSDoc paragraph in a card from arriving unseen.
      if (s.blockLines > 0) {
        findings.push(`${c.rel}  carries a /* */ block comment of ${s.blockLines} line(s). A card takes ` +
          'line comments of at most two lines (S-34); a JSDoc block belongs beside lib/ code, not here');
      }
      for (const r of s.runs) {
        comments++; lines += r.lines;
        if (r.lines > longest) { longest = r.lines; longestAt = `${c.id}:${r.line}`; }
        if (r.lines > 2) {
          findings.push(`${c.rel}:${r.line}  a comment of ${r.lines} lines: "${r.text[0].slice(0, 60)}..." ` +
            'A card comment says WHAT the line beside it does. Anything longer goes to CARDS.md, ' +
            'the folder CLAUDE.md or the canon (S-35)');
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

  // S-36. One pointer, in the canonical wording, naming this card's own record section, sitting
  // between the last import and the first line of code. The wording is what a reader greps for and
  // the reason it is fixed: a card that rewords it is a card whose record cannot be found by shape.
  test('S-36: exactly one pointer comment, under the imports, naming this card', (t) => {
    const findings = [];
    let walked = 0, placed = 0;
    for (const c of catalogued) {
      walked++;
      const s = SCANS.get(c.id);
      // Two shapes of record, one pointer each, and the shape is read off the tree by
      // `recordPointer`: `./CARDS.md#<id>` while a category keeps one file, `./CARDS/<id>.md` once
      // it splits. The WORDING up to the path is fixed either way, which is what a reader greps.
      const want = recordPointer(c);
      const hits = s.srcLines.map((l, i) => ({ text: l.trim(), line: i + 1 })).filter(o => o.text === want);
      // A near miss is the defect this test was written for: cluster-leader-election carried
      // "// Design notes, including what this costs vertically: ./CARDS.md#..." and the anchor
      // resolved, so nothing anywhere could see it.
      const near = s.srcLines.map((l, i) => ({ text: l.trim(), line: i + 1 }))
        .filter(o => o.text !== want && /^\/\/.*Design notes.*CARDS(\.md#|\/)/.test(o.text));
      if (hits.length !== 1) {
        findings.push(`${c.rel}  carries ${hits.length} pointer(s) of the canonical form. Expected exactly one: ${want}`);
      }
      for (const o of near) {
        findings.push(`${c.rel}:${o.line}  "${o.text.slice(0, 80)}" is a REWORDED pointer. The wording is fixed: ${want}`);
      }
      // Under the imports: after the last one, before anything that executes.
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

  // L-18. A `font-size` presentation attribute on a label has specificity 0 and loses to the
  // `.scheme-label.code` class rule, so the value never renders and any clearance budget sized off it
  // is wrong by 10 to 22 percent. Read off the comment-stripped code and off the part tree, because
  // the two cards that mention the string at all mention it in a comment saying not to.
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
      // The same thing said as data, which a scan of the text would miss if the attribute name were
      // ever composed rather than written out.
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

// ---------------------------------------------------------------------------------------------
// The three stylesheets, read as DECLARATIONS. Comments are stripped first: see the header.
// ---------------------------------------------------------------------------------------------
const SHEETS = ['tokens.css', 'styles.css', 'diagrams.css'];

// prop -> value pairs, with the line each sits on. Not a real CSS parser and does not need to be:
// both rules below are statements about a VALUE, and a value cannot span a `;` or a brace.
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
    // The census for this group: a parse that stops matching resolves nothing, finds nothing and
    // passes, which is the failure every walker in this harness is built against.
    assert.equal(SHEETS.length, 3, 'scheme/css holds three stylesheets: tokens, styles, diagrams');
    assert.ok(DECLS.length >= 1000, `only ${DECLS.length} declaration(s) parsed, measured 1130 on 2026-08-15`);
    const perFile = {};
    for (const d of DECLS) perFile[d.rel] = (perFile[d.rel] || 0) + 1;
    for (const f of SHEETS) assert.ok(perFile[`css/${f}`] > 0, `css/${f} parsed to 0 declarations`);
    t.diagnostic(Object.entries(perFile).map(([f, n]) => `${f} ${n}`).join(', '));
  });

  // C-20. Colour resolution stays fully deterministic, so no shade is computed by the browser out of
  // two others. The tinted dialog derives every alpha shade from four channel lists instead.
  test('C-20: color-mix is used by no declaration', (t) => {
    const found = DECLS.filter(d => /color-mix/i.test(d.value))
      .map(d => `${d.rel}:${d.line}  ${d.prop}: ${d.value.slice(0, 60)}`);
    assert.deepEqual(found, [], `${found.length} declaration(s) use color-mix:\n  ${listing(found)}`);
    const inComments = SHEETS.reduce((n, f) => n + (readFileSync(join(ROOT, 'css', f), 'utf8').match(/color-mix/gi) || []).length, 0);
    t.diagnostic(`0 declarations, against ${inComments} mention(s) in the raw text: the tinted-dialog note ` +
      'says color-mix is deliberately unused, and a grep reports that sentence as the finding');
  });

  // C-24. The Lifecycle category was dissolved and its coral is reserved NOWHERE in scheme/. The one
  // live #ff668c in the repo is --ts-tools-color in cli/css/styles.css, an unrelated slot.
  test('C-24: the retired Lifecycle coral #ff668c is reserved by no declaration', () => {
    const found = DECLS.filter(d => /#ff668c/i.test(d.value))
      .map(d => `${d.rel}:${d.line}  ${d.prop}: ${d.value}`);
    assert.deepEqual(found, [], `${found.length} declaration(s) carry the retired coral:\n  ${listing(found)}`);
  });
});

// ---------------------------------------------------------------------------------------------
// S-41. Internal markdown never ships, and the exclusion is BY NAME in three places that have to
// agree. The three are not symmetric: the two workflows are allowlists and only ever have to name
// what sits INSIDE a directory they copy, while `.dockerignore` also carries the root-level
// documents, because the Dockerfile is a blanket `COPY . .`. So the comparison is over the entries
// `.dockerignore` marks as tree-wide with `**/`, which is the same population the workflows name.
// ---------------------------------------------------------------------------------------------
const DOCKERIGNORE = readFileSync(join(REPO, '.dockerignore'), 'utf8');
const DEPLOY = readFileSync(join(REPO, '.github', 'workflows', 'deploy.yml'), 'utf8');
const RELEASE = readFileSync(join(REPO, '.github', 'workflows', 'release.yml'), 'utf8');

// `**/CANON.md` -> CANON.md, and `scheme/test` -> a path. A bare `README.md` is root-only and is
// not in the comparison, by the argument above.
//
// A tree-wide DIRECTORY is a name too, not a path: `**/CARDS/` excludes the per-card record folder
// wherever a category grows one, exactly the way `**/CARDS.md` excludes the monolith. Filing it as
// a path would compare it against `scheme/test`, which is one fixed place, and the two lists would
// then disagree for a reason that is only about syntax.
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

// `find _site \( -name CLAUDE.md -o ... -o -name CARDS -type d \) -exec rm -rf {} +` and
// `rm -rf _site/scheme/tools _site/scheme/test`.
//
// The find TAIL is matched loosely on purpose. It was `-delete` while every entry was a file, and a
// directory cannot be `-delete`d with children in it, so the day the record folder arrived the tail
// became `-exec rm -rf {} +`. A parser pinned to one tail goes quiet on that edit and reports an
// empty list, which is the failure the census below exists to make loud rather than green.
function deployLists() {
  const find = /find\s+_site\s[^\n]*\)\s*-(?:delete|exec)[^\n]*/.exec(DEPLOY);
  const rm = /rm -rf([^\n]*)/.exec(DEPLOY);
  return {
    names: new Set([...(find ? find[0].matchAll(/-name\s+([\w.-]+)/g) : [])].map(m => m[1])),
    paths: new Set([...(rm ? rm[1].matchAll(/_site\/([\w./-]+)/g) : [])].map(m => m[1].replace(/\/$/, ''))),
  };
}

// `-x "scheme/tools/*" "scheme/test/*" "*CLAUDE.md" ... "*/CARDS/*"`
function releaseLists() {
  const x = /-x ([^\n]*)/.exec(RELEASE);
  const names = new Set(), paths = new Set();
  for (const m of (x ? x[1].matchAll(/"([^"]+)"/g) : [])) {
    const name = /^\*([\w.-]+\.md)$/.exec(m[1]);
    if (name) { names.add(name[1]); continue; }
    // `*/CARDS/*` is the zip spelling of a tree-wide directory, the same entry `**/CARDS/` is.
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

    // The census of this group: three parses that each found the list they were written against. A
    // regex that stops matching returns an empty set, and three empty sets agree with each other.
    for (const [where, got] of [['.dockerignore', dock.names], ['deploy.yml', deploy.names], ['release.yml', release.names]]) {
      assert.ok(got.size >= 4,
        `${where} parsed to ${got.size} internal filename(s). Three empty lists agree with each other, ` +
        'so a parse that has gone quiet has to be a failure here rather than a pass.');
    }
    // The live three, so the comparison is anchored to what the rule is actually about and cannot be
    // satisfied by three lists that agree on the wrong thing.
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

    // scheme/test/ carries the whole harness and is excluded as a PATH rather than by name.
    assert.ok(dock.paths.has('scheme/test') && deploy.paths.has('scheme/test') && release.paths.has('scheme/test'),
      'scheme/test is not excluded in all three places: the harness would ship. ' +
      `.dockerignore ${sorted(dock.paths)}, deploy ${sorted(deploy.paths)}, release ${sorted(release.paths)}`);

    // ASSERTED, not reported. A path the two workflows exclude and .dockerignore does not is the
    // asymmetry S-41 exists to catch, and it is a miss rather than a decision: the root CLAUDE.md
    // keeps retired paths on purpose ("they guard the paths if anyone recreates them"). A path on
    // two of the three ships through the third exactly as a name does.
    const pathGap = [...new Set([...deploy.paths, ...release.paths])].filter(p => !dock.paths.has(p));
    assert.deepEqual(pathGap, [],
      `the workflows exclude ${pathGap.join(', ')} and .dockerignore does not, so the local ` +
      'container would carry it: Dockerfile is a blanket COPY . . while the workflows are allowlists.');
    t.diagnostic(`${dock.names.size} internal filenames excluded in all three (${sorted(dock.names).join(', ')}), ` +
      `${dock.rootOnly.length} root-only entries in .dockerignore alone (${dock.rootOnly.join(', ')})` +
      (pathGap.length ? `. PATH GAP: the workflows also exclude ${pathGap.join(', ')} and .dockerignore does not` : ''));
  });

  // -------------------------------------------------------------------------------------------
  // The CONTAINER's own two files, which no allowlist has an opinion about because neither
  // workflow copies them. Found by opening the running container rather than by reading a list:
  // `curl http://localhost:8080/configs/nginx.conf` answered 200, and so did `/.dockerignore`.
  //
  // Nothing on kube.how is affected: deploy.yml stages `_site` by name and neither is on it. What
  // is affected is every person who runs the image from the release zip, which ships `configs/`
  // deliberately so the container can be built at all. The nginx config holds no secret, but an
  // internal file served from the web root is the thing S-41 is about, and the two mechanisms that
  // close it are asymmetric, which is exactly why they need asserting:
  //
  //   .dockerignore  can exclude ITSELF, and does. It is read before the context is assembled.
  //   configs/       cannot be excluded: `COPY configs/nginx.conf` needs it IN the context, and an
  //                  ignore rule applies to the whole context whatever the COPY order. So the
  //                  Dockerfile removes it from the web root after the blanket copy.
  //
  // The blanket `COPY . .` is asserted too, and it is not a detail: it is what makes this container
  // the cheapest detector of a file the two allowlists would have shipped by accident. A selective
  // copy here would pass every assertion in this file and quietly retire that property.
  // -------------------------------------------------------------------------------------------
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
