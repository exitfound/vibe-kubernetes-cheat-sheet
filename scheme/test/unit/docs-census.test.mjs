// docs-census.test.mjs: is every COUNT a document states still the count the tree holds?
//
// What it reads: the numeric claims in `scheme/CANON.md`, `scheme/CLAUDE.md`, the four
// `js/schemes/<cat>/CLAUDE.md`, the card skills at `<repo root>/.claude/skills/` and the root
// `README.md`, against a census computed here off the imported specs and off the four `CARDS.md`.
// `S-49` is the rule, and this file is the whole of the machine behind it.
//
// The skill block is one of two parts reaching OUTSIDE `scheme/`, and it is there because a skill is
// the least guarded prose in the repository: nothing under `scheme/` opens one, so a count typed
// into a skill has no reader at all. It is deliberately short. A skill states a count only where
// the count is the substance, and names the tool that prints it everywhere else.
//
// The root `README.md` is the other, and it is the worse case of the same thing. It reaches nobody
// through the site (neither shipping mechanism copies it) and everybody through GitHub, no
// `CLAUDE.md` links to it, and until these rows the only test that opened it was the em-dash sweep
// in `unit/text.test.mjs`, which does not read a number. The repo contract already names it as the
// one document that goes stale without anything noticing. Half its counts are about `cli/`, which
// has no harness of its own, so the census below imports `cli/js/data.js` and counts them: guarding
// the diagram count and leaving the command count unread would leave the document exactly as
// stale-prone as it was, in the half nobody would think to check.
//
// ===========================================================================================
// WHY THIS FILE EXISTS
// ===========================================================================================
// The contract and the four folder files are written in ABSOLUTES: so many steps carry `chips` and
// so many carry `chipsCued`, so many hooks in all, so many OPEN findings, so many cards fully
// declarative. Every one of them was true when it was typed and every one is a hand count. Before
// this file existed, `report/skeleton-census.test.mjs` already COMPUTED most of them and printed
// them, and nothing compared the two: the printer and the prose could disagree for months with the
// suite green, because printing is not asserting.
//
// They had. `scheme/CLAUDE.md` said storage carried a hook on 14 of its 31 cards where the tree
// held 15 and `js/schemes/storage/CLAUDE.md` said 15 in the same tree, which is the exact failure
// shape this guards: two documents, one number, no reader.
//
// ===========================================================================================
// THE TWO RULES THIS FILE IS BUILT ON
// ===========================================================================================
// 1. A CLAIM'S EXPECTED VALUE IS COMPUTED, NEVER TYPED. Every `want` below is a function of CENSUS.
//    A literal here would only move the hand count from a document into a test, where it would go
//    stale the same way and be believed harder.
// 2. A CLAIM THAT NO LONGER MATCHES IS A FAILURE, NOT A SKIP. If a sentence is reworded so its
//    pattern stops matching, the claim reports MISSING and the run goes red. A checker that quietly
//    matches nothing is the one failure mode that makes every other assertion here worthless, and
//    it is the same lesson `S-46` records for the record walk.
//
// ===========================================================================================
// WHAT IT IS BLIND TO
// ===========================================================================================
//   - Any number no claim below names. This is a registry, not a scan: a new absolute typed into a
//     document is unguarded until someone adds a row. `unit/docs.test.mjs` group E has the same
//     shape and the same limit.
//   - Anything needing a browser. The soft geometry population (`scheme/CLAUDE.md` says 10: CENTRE 3,
//     CENTRE-LOW 5, OCCLUDED 2) is measured by `report/geometry-soft.test.mjs` against a rendered
//     frame, so it cannot be computed here and no claim below names it.
//   - Whether a number is the RIGHT thing to state. A claim can be accurate and pointless.
//   - Prose that states a count in words with no digits at all, unless the pattern spells the word
//     out. `NUMWORD` below covers one to twenty, which is every word-number the documents use.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, cards, categories, recordFiles, subcategories } from '../fixtures/catalog.mjs';
import { cardForm, importAll } from '../fixtures/module.mjs';
import { walkParts } from '../fixtures/spec.mjs';

const CATS = await categories();
const SUBS = await subcategories();
const CATALOGUE = await cards();
const MODULES = await importAll();

// The `cli/` catalogue, for the README rows only. Imported rather than grepped, the same way the
// scheme census reads `data.js`: `SECTIONS[].groups[].cmds[]` is the shape the page renders from,
// so a command that exists is a command that is counted, and `sub` is the eight-way grouping the
// nav shows. A missing file is a FAILURE and not a shorter run, for the reason below.
const CLI_DATA = join(ROOT, '..', 'cli', 'js', 'data.js');
assert.ok(existsSync(CLI_DATA), `MISSING ${CLI_DATA}: the README states counts about cli/, and a ` +
  'walk that cannot open it would pass by finding nothing to compare');
const { SECTIONS: CLI_SECTIONS } = await import(pathToFileURL(CLI_DATA).href);
const CLI = {
  commands: CLI_SECTIONS.reduce((n, s) => n + (s.groups || []).reduce((m, g) => m + (g.cmds || []).length, 0), 0),
  sections: CLI_SECTIONS.length,
  subs: new Set(CLI_SECTIONS.map(s => s.sub)).size,
};
assert.ok(CLI.commands > 0, 'the cli walk counted zero commands, which is a broken walk and not an empty catalogue');

// Deliberately not `if (!existsSync) return`: a document this cannot open is a failure, never a
// shorter run. Same reason as `readDoc` in docs.test.mjs, and the same rule (`S-46`).
const readDoc = (rel) => {
  const p = join(ROOT, rel);
  assert.ok(existsSync(p), `MISSING DOCUMENT ${rel}: refusing to run a shorter walk and call it green`);
  return readFileSync(p, 'utf8');
};

// ---------------------------------------------------------------------------------------------
// THE CENSUS. Every quantity a claim below can be written against, computed once off the imported
// specs. The six hook kinds are the same set `report/skeleton-census.test.mjs` counts, read the same
// way: off the DATA, so a card building four hooks in one factory is counted as four sites and not
// as the one `tune:` a grep would find.
// ---------------------------------------------------------------------------------------------
const HOOK_KINDS = ['SCENE.reset.extra', 'part.tune', 'part.raw', 'step.enter', 'step.motion', 'F.run fn'];

// CODE, with every comment blanked. Two readings below are of the SOURCE rather than of the spec
// (which preset a card takes, and which lib a card imports past its kit), and both are exactly the
// reading a grep gets wrong: three cluster cards name `LAYOUT.C` in a comment explaining a literal
// they wrote themselves, and counting those as preset users overstated the split by three. Block
// comments go first, then a line comment, and `//` is only a comment when it is not the `://` of a
// URL, which is what keeps an href inside a comment from eating the rest of the file.
const codeOnly = (src) => src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1');

function census() {
  const zeroKinds = () => new Map(HOOK_KINDS.map(k => [k, 0]));
  const perCat = new Map(CATS.map(c => [c, {
    cards: 0, hooked: new Set(), sites: zeroKinds(), kindCards: new Map(HOOK_KINDS.map(k => [k, new Set()])),
    reducedLitSteps: 0, reducedLitCards: new Set(), steps: 0,
  }]));
  const sites = zeroKinds();
  const hooked = new Set();
  // Cards per subcategory, keyed `<category>/<key>`: the count each folder contract tables.
  const subCards = new Map();
  // Which `LAYOUT` preset a card takes IN CODE. `mentionOnly` is the card that cites a preset in a
  // comment and writes the number itself, which is a legal shape (`S-34`) and not a preset user.
  const presets = new Map(CATS.map(c => [c, { A: 0, B: 0, C: 0, taken: 0, mentionOnly: 0, none: 0 }]));
  // The Node frame family: for every card, the distinct `NODE_H/POD_H/POD_Y - NODE_Y` shapes of a
  // Pod part fully inside a node part. Read off the spec, where the geometry actually is.
  const frames = new Map(CATS.map(c => [c, new Map()]));
  // Every `F.pulse` naming a `pod:` target, and whether that step shows anything on the STATIC path
  // for it: a `reducedLit`, or a `lights`/`light` list naming the target or the Pod's inner box.
  const pulses = new Map(CATS.map(c => [c, { steps: 0, sites: 0, bare: 0 }]));
  // What a card imports past its own kit (`S-21`).
  const imports = new Map(CATS.map(c => [c, { kit: 0, svg: 0, primitives: 0 }]));
  // Source lines per card, for the one place a document names an exemplar by its length.
  const cardLines = new Map();
  let steps = 0, migrated = 0, legacy = 0, chips = 0, chipsCued = 0, runDelay0 = 0, runDelayed = 0;

  const bump = (m, k) => m.set(k, m.get(k) + 1);

  for (const c of CATALOGUE) {
    const o = perCat.get(c.category);
    o.cards++;
    subCards.set(`${c.category}/${c.subcategory}`, (subCards.get(`${c.category}/${c.subcategory}`) || 0) + 1);

    // The two SOURCE readings, taken before the migrated guard so a legacy card would still be
    // counted in them: they are about the file, not about the form the card is written in.
    const src = readFileSync(c.path, 'utf8');
    cardLines.set(c.id, src.split('\n').length - 1);
    const code = codeOnly(src);
    const im = imports.get(c.category);
    if (code.includes(`./${c.category}-kit.js`)) im.kit++;
    if (code.includes('../../lib/svg.js')) im.svg++;
    if (code.includes('../../lib/primitives.js')) im.primitives++;
    const pre = presets.get(c.category);
    const taken = new Set([...code.matchAll(/\bLAYOUT\.([ABC])\b/g)].map(m => m[1]));
    const named = new Set([...src.matchAll(/\bLAYOUT\.([ABC])\b/g)].map(m => m[1]));
    if (taken.size) { pre.taken++; for (const k of taken) pre[k]++; }
    else if (named.size) pre.mentionOnly++;
    else pre.none++;

    const ns = MODULES.get(c.id);
    if (cardForm(ns) !== 'migrated') { legacy++; continue; }
    migrated++;

    const hit = (kind) => {
      bump(sites, kind); bump(o.sites, kind);
      hooked.add(c.id); o.hooked.add(c.id); o.kindCards.get(kind).add(c.id);
    };

    const nodeBoxes = [], podBoxes = [], podKeys = new Set(), innerOf = new Map();
    walkParts(ns.SCENE.parts, (part) => {
      if (!part) return;
      if (typeof (part.p || {}).tune === 'function') hit('part.tune');
      if (part.kind === 'raw') hit('part.raw');
      if (part.kind === 'node') nodeBoxes.push(part.p);
      if (part.kind === 'pod') {
        podBoxes.push(part.p);
        const k = part.key || part.p.shellKey;
        if (k) { podKeys.add(k); if (part.p.innerKey) innerOf.set(k, part.p.innerKey); }
        if (part.p.shellKey) podKeys.add(part.p.shellKey);
      }
    });
    // A Pod is INSIDE a frame when its box is wholly within the frame's, which is the only reading
    // that survives a card drawing two frames side by side.
    for (const pod of podBoxes) {
      for (const n of nodeBoxes) {
        const inside = pod.x >= n.x && pod.x + pod.w <= n.x + n.w && pod.y >= n.y && pod.y + pod.h <= n.y + n.h;
        if (!inside) continue;
        const shape = `${n.h}/${pod.h}/${pod.y - n.y}`;
        const byShape = frames.get(c.category);
        if (!byShape.has(shape)) byShape.set(shape, new Set());
        byShape.get(shape).add(c.id);
      }
    }
    if (typeof (ns.SCENE.reset || {}).extra === 'function') hit('SCENE.reset.extra');

    steps += ns.STEPS_SPEC.length;
    o.steps += ns.STEPS_SPEC.length;
    const pu = pulses.get(c.category);
    for (const step of ns.STEPS_SPEC) {
      const podTargets = (step.flow || []).filter(e => e.verb === 'pulse' && (e.p || {}).pod).map(e => e.p.pod);
      if (podTargets.length) {
        pu.steps++;
        pu.sites += podTargets.length;
        // A name an escape hook creates counts as a Pod here: `cluster-pod-sandbox-cri` pulses
        // `appGroup`, built by a `tune` and by no `key:`, and it is a Pod pulse either way.
        const lit = new Set(step.reducedLit || []);
        for (const e of step.flow || []) {
          for (const k of (e.verb === 'light' ? (e.p.targets || []) : (e.p.lights || []))) lit.add(k);
        }
        if (!podTargets.some(t => lit.has(t) || lit.has(innerOf.get(t)))) pu.bare++;
      }
      if (step.chips) chips++;
      if (step.chipsCued) chipsCued++;
      if (step.enter) hit('step.enter');
      if (step.motion) hit('step.motion');
      if (step.reducedLit) { o.reducedLitSteps++; o.reducedLitCards.add(c.id); }
      for (const e of step.flow || []) {
        if (e.verb !== 'run' || typeof (e.p || {}).fn !== 'function') continue;
        hit('F.run fn');
        // The delay-0 form is an imperative beat standing in flow order rather than a timer:
        // `at()` short-circuits on `delay <= 0`. An entry cued off another entry's arrival
        // (`after`/`at`) lands at a real time whatever its literal delay says, so it is not one.
        const literal = (e.p || {}).delay ?? e.delay ?? 0;
        const cued = e.after !== undefined || e.at !== undefined;
        if (!cued && typeof literal === 'number' && literal <= 0) runDelay0++; else runDelayed++;
      }
    }
  }

  // The four records, read for what a reader counts in them: `OPEN` findings, and the note anchors
  // `unit/docs.test.mjs` group A resolves. The anchor shape is the same regex that file parses with,
  // and it stays a literal here rather than an import because the two ask different questions of it:
  // A2 resolves an anchor against a card, this only counts them.
  const open = new Map(CATS.map(c => [c, 0]));
  // A `PANEL` block is a measurement someone took with a browser, and a `### poster` block is the
  // one thing every record in the tree carries. Counted because two folder contracts state both.
  const panelBlocks = new Map(CATS.map(c => [c, 0]));
  const posterBlocks = new Map(CATS.map(c => [c, 0]));
  const anchors = new Map(CATS.map(c => [c, 0]));
  const anchorSections = new Map();          // anchor text -> the `<cat>/<card id>` sections holding it
  // A record's LENGTH, measured per `## <id>` SECTION rather than per file, so the two record
  // shapes are read the same way: a monolith's preamble is not charged to its first card, and a
  // split record measures the same whether or not the walk opens its preamble first. `CLU.S-03`
  // states this band for cluster and the per-card figure for the other three, and it went six
  // months stale before anything read it, which is the failure this whole file exists for.
  const recordLines = new Map(CATS.map(c => [c, []]));
  // A record is one document or many (`recordFiles`), and both shapes are counted the same way:
  // the split is a storage decision and a census that saw fewer notes because of it would be lying.
  // Walked FILE BY FILE rather than over one joined string, because a section length is charged to
  // its own section: joining puts each file's trailing newline inside the last section of the file
  // before it, which reads as one extra line per record file and nowhere else.
  for (const c of CATS) {
    let section = null, span = null;
    const closeSection = () => { if (span !== null) recordLines.get(c).push(span); span = null; };
    for (const f of recordFiles(c)) {
      const md = readDoc(f.rel);
      open.set(c, open.get(c) + (md.match(/^OPEN\b/gm) || []).length);
      panelBlocks.set(c, panelBlocks.get(c) + (md.match(/^PANEL /gm) || []).length);
      posterBlocks.set(c, posterBlocks.get(c) + (md.match(/^### poster/gm) || []).length);
      for (const line of md.split('\n')) {
        const h2 = /^## (.+)$/.exec(line);
        // The heading opens its own section and counts as its first line, so the increment below
        // must not also charge it to the section that just ended.
        if (h2) { closeSection(); section = h2[1].trim(); span = 1; continue; }
        if (span !== null) span++;
        const a = /^### before `(.*)`$/.exec(line);
        if (!a) continue;
        anchors.set(c, anchors.get(c) + 1);
        if (!anchorSections.has(a[1])) anchorSections.set(a[1], new Set());
        anchorSections.get(a[1]).add(`${c}/${section}`);
      }
    }
    closeSection();
  }
  // An anchor is unique only WITHIN its section (`S-38`), so a text in two sections is legal and
  // gets counted rather than reported. Catalog-wide, which is what the rule states.
  const dupAnchors = [...anchorSections].filter(([, s]) => s.size > 1).map(([t]) => t);
  const dupWidth = (text) => (anchorSections.get(text) || new Set()).size;

  // The card skills, which cite rule ids and restate no rule (`S-50`). DISTINCT ids across every
  // `.md` under `.claude/skills/`, which is a union and not a sum: three skills naming `R-01` name
  // one id, and summing the three per-file sets reads 33 where the union is 30. `unit/docs.test.mjs`
  // group D1 is what resolves them; this only counts.
  const CITE = /(?<![A-Za-z0-9_`-])(?:\*\*|`)?([A-Z]{1,3}(?:\.[A-Z])?-\d+[a-z]?)(?:\*\*|`)?(?![A-Za-z0-9_])/g;
  const skillIds = new Set();
  const walkSkills = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walkSkills(p);
      else if (e.name.endsWith('.md')) for (const m of readFileSync(p, 'utf8').matchAll(CITE)) skillIds.add(m[1]);
    }
  };
  const skillsDir = join(ROOT, '..', '.claude', 'skills');
  assert.ok(existsSync(skillsDir), `MISSING ${skillsDir}: refusing to count zero citations and call it green`);
  walkSkills(skillsDir);

  // The quantities the SKILL documents state about the tree. They are the least guarded prose in
  // the repository: nothing under `scheme/` opens a skill, so a count typed into one drifts with no
  // reader at all, which is how a skill came to send a reviewer after six `SCOPE` blocks in a tree
  // holding nineteen. A skill states a count only where the count is the substance; everywhere else
  // it names the tool that prints it, which is `S-49` read one directory out.
  const podless = CATALOGUE.filter((c) => {
    const ns = MODULES.get(c.id);
    if (cardForm(ns) !== 'migrated') return false;
    let pods = 0;
    walkParts(ns.SCENE.parts, (part) => { if (part && part.kind === 'pod') pods++; });
    return pods === 0;
  }).length;
  // The anchors of the depth rubric: one backticked card id per cell of its L1..L5 table.
  const depthDoc = readFileSync(join(skillsDir, 'section-review', 'reference', 'depth-scale.md'), 'utf8');
  const depthAnchors = new Set();
  for (const line of depthDoc.split('\n')) {
    if (!/^\| L[1-5] \|/.test(line)) continue;
    for (const m of line.matchAll(/`((?:cluster|workloads|network|storage)-[a-z0-9-]+)`/g)) depthAnchors.add(m[1]);
  }
  // The tests that skip themselves under SCHEME_IDS: a census needs the full walk, so each one
  // carries FULL_ONLY as its test option. Counted where they execute, in the two gated directories.
  let fullOnly = 0;
  for (const dir of ['unit', 'render']) {
    const d = join(ROOT, 'test', dir);
    for (const f of readdirSync(d)) {
      if (!f.endsWith('.test.mjs')) continue;
      for (const line of readFileSync(join(d, f), 'utf8').split('\n')) {
        // Anchored, or this very line counts itself: a scan for its own pattern is the oldest way
        // to be off by exactly one.
        if (/^test\(/.test(line) && line.includes('FULL_ONLY')) fullOnly++;
      }
    }
  }

  // The band a category's records occupy. Every figure is ROUNDED here rather than in the prose,
  // so a document states an integer and the check computes the same integer: a quartile landing on
  // .5 is otherwise a claim no sentence can spell. The ceiling is `CLU.S-03`'s 300 and lives here
  // as the count of sections past it, because that count is the half of the rule that moves.
  const band = (c) => {
    const s = [...recordLines.get(c)].sort((a, b) => a - b), n = s.length;
    assert.ok(n > 0, `RECORD BAND: ${c} has no \`## \` section, so its length band measures nothing`);
    const q = (p) => { const i = (n - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
    const totalLines = s.reduce((a, b) => a + b, 0);
    return {
      sections: n, lines: totalLines, min: s[0], max: s[n - 1],
      median: Math.round(q(0.5)), q1: Math.round(q(0.25)), q3: Math.round(q(0.75)),
      perCard: Math.round(totalLines / n), over300: s.filter(v => v > 300).length,
    };
  };
  const bands = new Map(CATS.map(c => [c, band(c)]));

  const total = (m) => [...m.values()].reduce((a, b) => a + b, 0);
  return {
    cards: CATALOGUE.length, steps, migrated, legacy, chips, chipsCued,
    sites, hookSites: total(sites), hooked: hooked.size, clean: CATALOGUE.length - hooked.size,
    runDelay0, runDelayed, runTotal: runDelay0 + runDelayed,
    perCat, open, openTotal: total(open), anchors, dupAnchors, dupWidth,
    skillCitations: skillIds.size,
    podless, depthAnchors: depthAnchors.size, fullOnly, bands,
    subCards, presets, frames, pulses, imports, cardLines, panelBlocks, posterBlocks,
    sections: CATS.reduce((n, c) => n + (SUBS[c] || []).length, 0),
  };
}

const CENSUS = census();
const cat = (c) => CENSUS.perCat.get(c);
// The Node frame family, read as `NODE_H/POD_H/POD_Y - NODE_Y`. `shape` gives one back as three
// numbers so a document can spell it either way round, and `frameCards` counts the cards on it.
const shape = (c, s) => s.split('/').map(Number).concat(CENSUS.frames.get(c).has(s) ? [] : [NaN]);
const frameCards = (c, s) => (CENSUS.frames.get(c).get(s) || new Set()).size;
const framedCards = (c) => new Set([...CENSUS.frames.get(c).values()].flatMap(v => [...v])).size;

// ---------------------------------------------------------------------------------------------
// THE CLAIMS. One row per sentence a document states a number in. `re` matches against the document
// with its whitespace collapsed, so a claim may run across a line break, which most of them do.
// `want` is a FUNCTION of the census and never a literal: see rule 1 in the header.
// ---------------------------------------------------------------------------------------------
const NUMWORD = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20,
};
const asNumber = (tok) => (/^\d+$/.test(tok) ? Number(tok) : NUMWORD[tok.toLowerCase()]);

// A category's own contract file, and the shared shape its hook section opens with.
const folder = (c) => `js/schemes/${c}/CLAUDE.md`;
const DECLARATIVE_OPENER =
  /All (\d+) cards are in the declarative form\. \*\*(\d+) are fully declarative\*\*; ([a-z]+|\d+) carry a hook/;

// A per-kind row of a category's hook table: `| \`part.tune\` | 6 cards, 11 sites |`. The label may
// carry an unbackticked qualifier (storage writes `` `F.run` at delay 0 ``) and the count may be
// singular (cluster writes `1 card, 5 sites`), so both halves are matched loosely and only the two
// numbers are captured.
const hookRow = (label) =>
  new RegExp('\\| `' + label.replace(/\./g, '\\.') + '`[^|]*\\| (\\d+) cards?, (\\d+) sites \\|');

const CLAIMS = [
  // -- CANON.md ------------------------------------------------------------------------------
  {
    doc: 'CANON.md', label: 'the headline the whole rulebook is written against',
    re: /(\d+) cards: cluster (\d+), workloads (\d+), network (\d+), storage (\d+)\. (\d+) steps\./,
    want: () => [CENSUS.cards, cat('cluster').cards, cat('workloads').cards, cat('network').cards,
      cat('storage').cards, CENSUS.steps],
  },

  {
    doc: 'CANON.md', label: 'S-38: note anchors, total and per record',
    re: /\*\*(\d+) anchors today\*\*, all four records \(cluster (\d+), workloads (\d+), network (\d+), storage (\d+)\)/,
    want: () => [CATS.reduce((n, c) => n + CENSUS.anchors.get(c), 0), CENSUS.anchors.get('cluster'),
      CENSUS.anchors.get('workloads'), CENSUS.anchors.get('network'), CENSUS.anchors.get('storage')],
  },
  {
    // The SPLIT beside these three (`network 5, storage 8`) is deliberately not guarded: it
    // apportions the catalog-wide 13, and a text appearing in both records is counted once, so the
    // two halves are an attribution rather than a per-record count. The three totals are exact.
    doc: 'CANON.md', label: 'S-38: duplicated anchor texts, and the two worst',
    re: /(\d+) anchor texts are duplicated today \([^)]*\), worst ``const CX = 600;`` in (\d+) sections catalog-wide and ``const LEFT_X = 400;`` in (\d+)/,
    want: () => [CENSUS.dupAnchors.length, CENSUS.dupWidth('const CX = 600;'), CENSUS.dupWidth('const LEFT_X = 400;')],
  },

  {
    doc: 'CANON.md', label: 'S-50: the distinct rule ids the card skills cite',
    re: /[Tt]hey name (\d+) distinct ids between them/, want: () => [CENSUS.skillCitations],
  },

  // -- the card skills at <repo root>/.claude/skills/ ----------------------------------------
  // The fifth reader of the rulebook, and until these rows the only one whose COUNTS nobody read.
  // `readDoc` joins against `scheme/`, so a skill document is named from there and the coverage
  // test below resolves the same path. A skill states a count only where the count is the
  // substance: everywhere else it names the tool that prints it, which is why this block is short
  // and is meant to stay short.
  {
    doc: '../.claude/skills/section-review/SKILL.md', label: 'section-review: the section keys section.mjs lists',
    re: /`--list` for the (\d+) keys/, want: () => [CENSUS.sections],
  },
  {
    doc: '../.claude/skills/section-review/SKILL.md', label: 'section-review: the depth anchors the rubric names',
    re: /calibrated against ([a-z]+) named shipped cards/, want: () => [CENSUS.depthAnchors],
  },
  {
    doc: '../.claude/skills/_shared/card-verify.md', label: 'card-verify: the tests that skip themselves under SCHEME_IDS',
    re: /([A-Za-z]+) tests skip themselves under it/, want: () => [CENSUS.fullOnly],
  },
  {
    doc: '../.claude/skills/card-new/reference/compositions.md', label: 'card-new: the cards drawing no Pod',
    re: /(\d+) cards in the catalog carry no Pod at all/, want: () => [CENSUS.podless],
  },

  // -- the root README.md --------------------------------------------------------------------
  // The USER-facing document, and the only one here that describes both sub-apps, so two of its
  // four counts come off `cli/js/data.js` and two off the scheme catalogue. Each number is stated
  // TWICE, once in the summary table and once in the section below it, and both are guarded: a
  // count corrected in one place and left in the other is the drift this whole file exists for.
  {
    doc: '../README.md', label: 'README: the cli command count, summary table',
    re: /cheat sheet, (\d+) commands, copy \+ star/, want: () => [CLI.commands],
  },
  {
    doc: '../README.md', label: 'README: the cli command count and its category split',
    re: /(\d+) commands across ([a-z]+|\d+) categories/, want: () => [CLI.commands, CLI.subs],
  },
  {
    doc: '../README.md', label: 'README: the diagram count, summary table',
    re: /Grid of (\d+) animated SVG diagrams/, want: () => [CENSUS.cards],
  },
  {
    doc: '../README.md', label: 'README: the diagram count, Schemes section',
    re: /(\d+) animated diagrams of how Kubernetes/, want: () => [CENSUS.cards],
  },

  // -- scheme/CLAUDE.md ----------------------------------------------------------------------
  {
    doc: 'CLAUDE.md', label: 'the catalog size data.js exports',
    re: /exports `SCHEMES` \((\d+) entries\)/, want: () => [CENSUS.cards],
  },
  {
    doc: 'CLAUDE.md', label: 'the migrated / legacy split module.test.mjs prints',
    re: /\*\*(\d+) migrated, (\d+) legacy\*\*/, want: () => [CENSUS.migrated, CENSUS.legacy],
  },
  {
    doc: 'CLAUDE.md', label: 'reducedLit, total and per category',
    re: /declared on \*\*(\d+) steps\*\* \(network (\d+), workloads (\d+), cluster (\d+), storage (\d+)\)/,
    want: () => [
      CATS.reduce((n, c) => n + cat(c).reducedLitSteps, 0),
      cat('network').reducedLitSteps, cat('workloads').reducedLitSteps,
      cat('cluster').reducedLitSteps, cat('storage').reducedLitSteps,
    ],
  },
  {
    doc: 'CLAUDE.md', label: 'the two chip writers, counted in steps',
    re: /\*\*(\d+) steps carry `chips` and (\d+) carry `chipsCued`\*\*/,
    want: () => [CENSUS.chips, CENSUS.chipsCued],
  },
  {
    doc: 'CLAUDE.md', label: 'the escapes: clean cards, hooked cards, and sites by kind',
    re: /\*\*(\d+) of the (\d+) cards are fully declarative\*\*; (\d+) carry at least one hook, \*\*(\d+) hooks in all\*\* \(`part\.raw` (\d+), `step\.enter` (\d+), `part\.tune` (\d+), `F\.run` (\d+), `reset\.extra` (\d+), `step\.motion` (\d+)\)/,
    want: () => [
      CENSUS.clean, CENSUS.cards, CENSUS.hooked, CENSUS.hookSites,
      CENSUS.sites.get('part.raw'), CENSUS.sites.get('step.enter'), CENSUS.sites.get('part.tune'),
      CENSUS.sites.get('F.run fn'), CENSUS.sites.get('SCENE.reset.extra'), CENSUS.sites.get('step.motion'),
    ],
  },
  {
    doc: 'CLAUDE.md', label: 'part.tune sites, restated where the array refs are counted',
    re: /Three of its (\d+) sites accumulate an ARRAY ref/, want: () => [CENSUS.sites.get('part.tune')],
  },
  {
    doc: 'CLAUDE.md', label: 'the F.run split, delay-0 against deferred',
    re: /([A-Za-z]+) of the ([a-z]+) `F\.run` are that delay-0 form/,
    want: () => [CENSUS.runDelay0, CENSUS.runTotal],
  },
  {
    doc: 'CLAUDE.md', label: 'the category carrying the highest hook share',
    re: /Storage carries the highest share, (\d+) of (\d+)/,
    want: () => [cat('storage').hooked.size, cat('storage').cards],
  },
  {
    doc: 'CLAUDE.md', label: 'the OPEN findings across the four records',
    re: /\*\*(\d+)\*\* today \(cluster (\d+), storage (\d+), workloads (\d+), network (\d+)\)/,
    want: () => [CENSUS.openTotal, CENSUS.open.get('cluster'), CENSUS.open.get('storage'),
      CENSUS.open.get('workloads'), CENSUS.open.get('network')],
  },
  // The two tables. Both state a per-category card count, in different columns.
  ...CATS.map(c => ({
    doc: 'CLAUDE.md', label: `the folder table's card count for ${c}`,
    re: new RegExp('\\| `' + c + '/` \\| (\\d+) \\|'), want: () => [cat(c).cards],
  })),
  ...CATS.map(c => ({
    doc: 'CLAUDE.md', label: `the catalog table's card count for ${c}`,
    re: new RegExp('\\| `' + c + '` \\| `#[0-9a-f]{6}` [a-z ]+ \\| (\\d+) \\|'), want: () => [cat(c).cards],
  })),

  // -- the four folder contracts -------------------------------------------------------------
  ...CATS.map(c => ({
    doc: folder(c), label: `${c}: cards, fully declarative, and cards carrying a hook`,
    re: DECLARATIVE_OPENER,
    want: () => [cat(c).cards, cat(c).cards - cat(c).hooked.size, cat(c).hooked.size],
  })),
  {
    doc: folder('cluster'), label: 'cluster: the catalog line, cards and steps and subcategories',
    re: /(\d+) cards, (\d+) declared steps, ([a-z]+|\d+) subcategories/,
    want: () => [cat('cluster').cards, cat('cluster').steps, (SUBS.cluster || []).length],
  },
  // One row per subcategory, so a card moving between two of them reddens the table rather than
  // leaving one column high and the next low with the total still right.
  ...(SUBS.cluster || []).map(sub => ({
    doc: folder('cluster'), label: `cluster: the subcategory table's count for ${sub.key}`,
    re: new RegExp('\\| `' + sub.key + '` \\| ' + sub.label + ' \\| (\\d+) \\|'),
    want: () => [CENSUS.subCards.get(`cluster/${sub.key}`) || 0],
  })),
  {
    doc: folder('cluster'), label: 'cluster: which cards take a LAYOUT preset, in code',
    re: /(\d+) of the (\d+) cards take a preset in code \(A on (\d+), B on (\d+), C on (\d+)\); (\d+) more name one only in a comment[^;]*; the remaining (\d+)/,
    want: () => {
      const p = CENSUS.presets.get('cluster');
      return [p.taken, cat('cluster').cards, p.A, p.B, p.C, p.mentionOnly, p.none];
    },
  },
  {
    doc: folder('cluster'), label: 'cluster: what a card imports past its kit',
    re: /all (\d+) import the kit, (\d+) also import `lib\/svg\.js` and (\d+) `lib\/primitives\.js`/,
    want: () => {
      const i = CENSUS.imports.get('cluster');
      return [i.kit, i.svg, i.primitives];
    },
  },
  {
    doc: folder('cluster'), label: 'cluster: cards drawing a Node frame around a Pod',
    re: /(\d+) of the (\d+) cards draw a Node frame around a Pod/,
    want: () => [framedCards('cluster'), cat('cluster').cards],
  },
  // CLU.L-01's geometry, in four claims over the one row. Every figure is read off the SPEC, where
  // the frame and the Pod carry their own x/y/w/h, so a constant moving in a card reddens the rule
  // that describes it. This row was six months stale in every other number it stated.
  {
    doc: folder('cluster'), label: 'CLU.L-01: the family shape and how many cards are on it',
    re: /is `NODE_H (\d+)`, `POD_H (\d+)`, `POD_Y = NODE_Y \+ (\d+)`/,
    want: () => shape('cluster', '152/106/34'),
  },
  {
    doc: folder('cluster'), label: 'CLU.L-01: the family population against the framed cards',
    re: /(\d+) of the (\d+) cluster cards that draw a frame around Pods/,
    want: () => [frameCards('cluster', '152/106/34'), framedCards('cluster')],
  },
  {
    doc: folder('cluster'), label: 'CLU.L-01: the second family of two',
    re: /both measure (\d+)\/(\d+)\/(\d+) because they share one grid/,
    want: () => shape('cluster', '153/106/28'),
  },
  {
    doc: folder('cluster'), label: 'CLU.L-01: the four cards on a shape of their own',
    re: /`node-failure` (\d+)\/(\d+)\/(\d+), `node-registration` (\d+)\/(\d+)\/(\d+), `oom-kill` (\d+)\/(\d+)\/(\d+) and `pod-sandbox-cri` (\d+)\/(\d+)\/(\d+)/,
    want: () => [...shape('cluster', '132/106/16'), ...shape('cluster', '126/80/34'),
      ...shape('cluster', '144/110/20'), ...shape('cluster', '158/116/22')],
  },
  {
    doc: folder('cluster'), label: 'cluster: the Pod pulse census, and how much of it is bare',
    re: /(\d+) cluster steps pulse a Pod over (\d+) pulse sites, and on (\d+) of those steps/,
    want: () => {
      const p = CENSUS.pulses.get('cluster');
      return [p.steps, p.sites, p.bare];
    },
  },
  {
    doc: folder('cluster'), label: 'cluster: the exemplar, by length',
    re: /`cluster-scheduler-decision\.js`, (\d+) lines/,
    want: () => [CENSUS.cardLines.get('cluster-scheduler-decision')],
  },
  {
    doc: folder('cluster'), label: 'cluster: the record length band CLU.S-03 states',
    re: /(\d+) sections, (\d+) lines, (\d+) at the shortest and (\d+) at the longest, median (\d+), quartiles (\d+) and (\d+), (\d+) lines per card/,
    want: () => {
      const b = CENSUS.bands.get('cluster');
      return [b.sections, b.lines, b.min, b.max, b.median, b.q1, b.q3, b.perCard];
    },
  },
  {
    doc: folder('cluster'), label: 'cluster: the sisters, per card, in the same measure',
    re: /sisters run (\d+) \(workloads\), (\d+) \(storage\) and (\d+) \(network\)/,
    want: () => ['workloads', 'storage', 'network'].map(c => CENSUS.bands.get(c).perCard),
  },
  {
    doc: folder('cluster'), label: 'cluster: records standing past the CLU.S-03 ceiling',
    re: /([A-Za-z]+|\d+) records stand past the ceiling today/,
    want: () => [CENSUS.bands.get('cluster').over300],
  },
  {
    doc: folder('cluster'), label: 'cluster: hook sites in all',
    re: /\*\*(\d+) sites in all\*\*/,
    want: () => [[...cat('cluster').sites.values()].reduce((a, b) => a + b, 0)],
  },
  {
    doc: folder('cluster'), label: 'cluster: reducedLit here, and the three other categories',
    re: /`reducedLit` is declared on (\d+) steps here\*\*, .*? against (\d+) in network, (\d+) in workloads and (\d+) in storage/,
    want: () => [cat('cluster').reducedLitSteps, cat('network').reducedLitSteps,
      cat('workloads').reducedLitSteps, cat('storage').reducedLitSteps],
  },
  {
    doc: folder('workloads'), label: 'workloads: what a card imports past its kit',
    re: /all (\d+) import the kit, (\d+) also import `lib\/svg\.js` and (\d+) `lib\/primitives\.js`/,
    want: () => {
      const i = CENSUS.imports.get('workloads');
      return [i.kit, i.svg, i.primitives];
    },
  },
  {
    doc: folder('workloads'), label: 'WL.S-02: the exemplar, by length',
    re: /`workloads-probes\.js`, (\d+) lines/,
    want: () => [CENSUS.cardLines.get('workloads-probes')],
  },
  {
    doc: folder('workloads'), label: 'WL.S-03: the record length band',
    re: /(\d+) sections, (\d+) lines, (\d+) at the shortest and (\d+) at the longest, median (\d+), (\d+) lines per card/,
    want: () => {
      const b = CENSUS.bands.get('workloads');
      return [b.sections, b.lines, b.min, b.max, b.median, b.perCard];
    },
  },
  {
    doc: folder('workloads'), label: 'WL.S-03: PANEL blocks, and the records without one',
    re: /(\d+) of the (\d+) carry one, .*?The other (\d+) are instruments/,
    want: () => {
      const p = CENSUS.panelBlocks.get('workloads'), n = cat('workloads').cards;
      return [p, n, n - p];
    },
  },
  {
    doc: folder('workloads'), label: 'WL.S-03: every record carries a poster block',
    re: /a `### poster` block, (\d+) of (\d+)/,
    want: () => [CENSUS.posterBlocks.get('workloads'), cat('workloads').cards],
  },
  {
    doc: folder('network'), label: 'network: reducedLit cards and steps',
    re: /declared on \*\*(\d+) of the (\d+) cards over (\d+) steps\*\*/,
    want: () => [cat('network').reducedLitCards.size, cat('network').cards, cat('network').reducedLitSteps],
  },
  {
    doc: folder('workloads'), label: 'workloads: reducedLit cards and steps',
    re: /declared on \*\*(\d+) cards over (\d+) steps\*\*/,
    want: () => [cat('workloads').reducedLitCards.size, cat('workloads').reducedLitSteps],
  },
  // The per-kind hook tables. `P.raw` and `F.run at delay 0` are how two folders spell the kind in
  // the first column, so the row label is per claim rather than derived from HOOK_KINDS.
  { doc: folder('cluster'), label: 'cluster: part.tune row', re: hookRow('part.tune'), kind: 'part.tune', cat: 'cluster' },
  { doc: folder('cluster'), label: 'cluster: P.raw row', re: hookRow('P.raw'), kind: 'part.raw', cat: 'cluster' },
  { doc: folder('cluster'), label: 'cluster: step.enter row', re: hookRow('step.enter'), kind: 'step.enter', cat: 'cluster' },
  { doc: folder('cluster'), label: 'cluster: F.run row', re: hookRow('F.run'), kind: 'F.run fn', cat: 'cluster' },
  { doc: folder('storage'), label: 'storage: part.tune row', re: hookRow('part.tune'), kind: 'part.tune', cat: 'storage' },
  { doc: folder('storage'), label: 'storage: P.raw row', re: hookRow('P.raw'), kind: 'part.raw', cat: 'storage' },
  { doc: folder('storage'), label: 'storage: step.enter row', re: hookRow('step.enter'), kind: 'step.enter', cat: 'storage' },
  { doc: folder('storage'), label: 'storage: F.run row', re: hookRow('F.run'), kind: 'F.run fn', cat: 'storage' },
].map(c => (c.kind
  // A hook-table row states cards then sites, and both come off the census for that category.
  ? { ...c, want: () => [cat(c.cat).kindCards.get(c.kind).size, cat(c.cat).sites.get(c.kind)] }
  : c));

// A claim's floor: a registry that stops holding claims is a check that stops checking. A FLOOR,
// because the registry is meant to grow, and the live count is in the assertion message below.
const CLAIM_FLOOR = 25;

const DOCS = new Map();
for (const { doc } of CLAIMS) if (!DOCS.has(doc)) DOCS.set(doc, readDoc(doc));
const flat = (s) => s.replace(/\s+/g, ' ');

test('CENSUS every count a document states is the count the tree holds', () => {
  assert.ok(CLAIMS.length >= CLAIM_FLOOR,
    `only ${CLAIMS.length} claim(s) in the registry, floor ${CLAIM_FLOOR}. A registry that stops ` +
    'holding claims passes by finding nothing to check.');

  const missing = [];
  const wrong = [];
  for (const claim of CLAIMS) {
    const text = flat(DOCS.get(claim.doc));
    const m = claim.re.exec(text);
    if (!m) {
      missing.push(`${claim.doc}  ${claim.label}\n      pattern: ${claim.re}`);
      continue;
    }
    const got = m.slice(1).map(asNumber);
    const want = claim.want();
    if (got.length !== want.length || got.some((n, i) => n !== want[i])) {
      wrong.push(
        `${claim.doc}  ${claim.label}\n` +
        `      document says: [${got.join(', ')}]\n` +
        `      the tree holds: [${want.join(', ')}]\n` +
        `      sentence: ${m[0].slice(0, 150)}`);
    }
  }

  assert.deepEqual(missing, [],
    `${missing.length} claim(s) no longer match the document they guard. A reworded sentence is not ` +
    'a passing claim: either restore the shape or update the pattern here.\n  ' + missing.join('\n  '));
  assert.deepEqual(wrong, [],
    `${wrong.length} stated count(s) disagree with the tree:\n  ` + wrong.join('\n  '));
});

test('CENSUS the registry covers every document that states a guarded count', () => {
  // A document with claims against it must be one the tree actually holds under `scheme/`, and the
  // four folder contracts must all be represented: a category whose counts nobody guards is how the
  // 14-of-31 drift lived. This is the cheap structural half of the same question.
  const want = new Set(['CANON.md', 'CLAUDE.md', ...CATS.map(folder)]);
  const have = new Set(CLAIMS.map(c => c.doc));
  assert.deepEqual([...want].filter(d => !have.has(d)), [],
    'a document the registry is supposed to cover carries no claim');
  for (const doc of have) assert.ok(existsSync(join(ROOT, doc)), `claim names a missing document: ${doc}`);
});
