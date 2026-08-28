// docs-census.test.mjs: is every COUNT a document states still the count the tree holds?
//
// What it reads: the numeric claims in `scheme/CANON.md`, `scheme/CLAUDE.md` and the four
// `js/schemes/<cat>/CLAUDE.md`, against a census computed here off the imported specs and off the
// four `CARDS.md`. `S-49` is the rule, and this file is the whole of the machine behind it.
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
import { ROOT, cards, categories, recordFiles } from '../fixtures/catalog.mjs';
import { cardForm, importAll } from '../fixtures/module.mjs';
import { walkParts } from '../fixtures/spec.mjs';

const CATS = await categories();
const CATALOGUE = await cards();
const MODULES = await importAll();

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

function census() {
  const zeroKinds = () => new Map(HOOK_KINDS.map(k => [k, 0]));
  const perCat = new Map(CATS.map(c => [c, {
    cards: 0, hooked: new Set(), sites: zeroKinds(), kindCards: new Map(HOOK_KINDS.map(k => [k, new Set()])),
    reducedLitSteps: 0, reducedLitCards: new Set(), steps: 0,
  }]));
  const sites = zeroKinds();
  const hooked = new Set();
  let steps = 0, migrated = 0, legacy = 0, chips = 0, chipsCued = 0, runDelay0 = 0, runDelayed = 0;

  const bump = (m, k) => m.set(k, m.get(k) + 1);

  for (const c of CATALOGUE) {
    const o = perCat.get(c.category);
    o.cards++;
    const ns = MODULES.get(c.id);
    if (cardForm(ns) !== 'migrated') { legacy++; continue; }
    migrated++;

    const hit = (kind) => {
      bump(sites, kind); bump(o.sites, kind);
      hooked.add(c.id); o.hooked.add(c.id); o.kindCards.get(kind).add(c.id);
    };

    walkParts(ns.SCENE.parts, (part) => {
      if (!part) return;
      if (typeof (part.p || {}).tune === 'function') hit('part.tune');
      if (part.kind === 'raw') hit('part.raw');
    });
    if (typeof (ns.SCENE.reset || {}).extra === 'function') hit('SCENE.reset.extra');

    steps += ns.STEPS_SPEC.length;
    o.steps += ns.STEPS_SPEC.length;
    for (const step of ns.STEPS_SPEC) {
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
  const anchors = new Map(CATS.map(c => [c, 0]));
  const anchorSections = new Map();          // anchor text -> the `<cat>/<card id>` sections holding it
  // A record is one document or many (`recordFiles`), and both shapes are counted the same way:
  // the split is a storage decision and a census that saw fewer notes because of it would be lying.
  for (const c of CATS) {
    const md = recordFiles(c).map(f => readDoc(f.rel)).join('\n');
    open.set(c, (md.match(/^OPEN\b/gm) || []).length);
    let section = null;
    for (const line of md.split('\n')) {
      const h2 = /^## (.+)$/.exec(line);
      if (h2) { section = h2[1].trim(); continue; }
      const a = /^### before `(.*)`$/.exec(line);
      if (!a) continue;
      anchors.set(c, anchors.get(c) + 1);
      if (!anchorSections.has(a[1])) anchorSections.set(a[1], new Set());
      anchorSections.get(a[1]).add(`${c}/${section}`);
    }
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

  const total = (m) => [...m.values()].reduce((a, b) => a + b, 0);
  return {
    cards: CATALOGUE.length, steps, migrated, legacy, chips, chipsCued,
    sites, hookSites: total(sites), hooked: hooked.size, clean: CATALOGUE.length - hooked.size,
    runDelay0, runDelayed, runTotal: runDelay0 + runDelayed,
    perCat, open, openTotal: total(open), anchors, dupAnchors, dupWidth,
    skillCitations: skillIds.size,
  };
}

const CENSUS = census();
const cat = (c) => CENSUS.perCat.get(c);

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
