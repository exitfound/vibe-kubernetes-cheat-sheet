// catalog.mjs: the one place that knows which cards exist and where their files live. The list
// comes from data.js by IMPORT, never from a directory listing.
//
// Why not a readdir. A check that opens the card directory itself with
// `(await readdir(DIR)).filter(n => n.endsWith('.js'))` reports ZERO files the moment cards live in
// subdirectories, because a directory name does not end in '.js', and every browser-free check
// would then scan nothing, find nothing and exit 0. A green run over an empty set is worse than a
// red one, so the list comes from the catalog and every walker asserts with census() that it
// collected all of it. data.js is the only listing: a module nobody lists is invisible, which is
// what CATALOG asserts.
//
// No browser here on purpose: the unit tests must not pull in playwright.

import { existsSync, readdirSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// scheme/, two levels up from scheme/test/fixtures/.
export const ROOT = join(__dirname, '..', '..');

const importFromRoot = (...seg) => import(pathToFileURL(join(ROOT, ...seg)).href);

// ---------------------------------------------------------------------------------------------
// THE CATALOG BASELINE: the two numbers the harness is calibrated against, TYPED EXACTLY ONCE.
//
// Every other file derives its own baseline from what it actually reads: a card count from
// `(await cards()).length`, a step count from `stepTotal()` in ./module.mjs. A floor written
// as a literal weakens the moment the catalog grows past it: with 110 cards a walk that silently
// skips one still clears `>= 109` and reports a clean catalog. `S-49` says a count a DOCUMENT
// states is measured rather than typed, and the harness owes itself the same.
//
// So what is left here is a baseline rather than a floor, and it has one job: notice that the
// catalog itself changed. One assertion per half holds it against the tree:
//   cards  `unit/catalog.test.mjs`, against the length of SCHEMES in data.js
//   steps  `unit/spec-steps.test.mjs`, against the sum of every card's STEPS_SPEC
// A render file that states which catalog it was calibrated against reads the same constant
// rather than typing one, which is the whole point: there is one number to change, not sixteen.
// Changing a number here is how a card being added or removed is acknowledged on purpose. If you
// are about to edit one of these to make a run go green, read what the run is telling you first.
// ---------------------------------------------------------------------------------------------
export const CATALOG_BASELINE = Object.freeze({ cards: 116, steps: 704 });

// ---------------------------------------------------------------------------------------------
// SCHEME_IDS=a,b restricts the BROWSER walks to those cards, the way OVERLAY_IDS already restricts
// the panel report. It exists for one workflow: reviewing a single card, where the render suite
// spends 70 seconds walking the whole catalog to reach a second of work on the one being reviewed.
//
// IT MUST NOT BE ABLE TO FAKE A GREEN GATE. Two things enforce that. `census()` below refuses to
// compare a subset against the catalog and returns instead of passing quietly, and `floor()`
// collapses a catalog-scale baseline to zero, because a floor is a statement about a FULL walk and
// a subset run was never given the input to make it. The run announces itself on stdout as well, so
// a scrollback cannot be mistaken for the real thing. The gate before a commit is the unfiltered
// run, always.
//
// The filter deliberately does NOT touch cards(): the browser-free unit tests read the whole
// catalog in 1.7 seconds and have nothing to gain from a subset.
// ---------------------------------------------------------------------------------------------
export const ONLY = (process.env.SCHEME_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
export const SUBSET = ONLY.length > 0;
export const floor = (n) => (SUBSET ? 0 : n);
// For a test that asserts an EXACT catalog census rather than a floor: zeroing the number would
// only make it wrong in the other direction, so the test is skipped by name on a subset run.
export const FULL_ONLY = SUBSET ? { skip: 'SCHEME_IDS subset: a census needs the full walk' } : {};

// The raw catalog barrel: CATEGORIES, CATEGORY_LABEL, CATEGORY_ICONS, CATEGORY_TAGLINE, SCHEMES,
// SUBCATEGORIES. Everything below is a projection of this, so a test that needs a field nobody
// wrapped yet can reach it without a second import path appearing.
export const catalog = () => importFromRoot('js', 'data.js');

// Every SCHEMES entry as data.js declares it: id, title, category, subcategory, desc, k8sVersion,
// tinted, sources. Catalog ORDER, which is the order the grid renders in.
export async function schemes() {
  const { SCHEMES } = await catalog();
  return SCHEMES;
}

// Every card with the path of its module, sorted by basename.
//
// `path` is built from the convention app.js imports by, js/schemes/<cat>/<id>.js, so a test reads
// exactly what the browser loads. The convention itself is not assumed: asserting both halves of it
// (that an id starts with its category, and that a folder holds no file the catalog does not claim)
// is a test of its own.
export async function cards() {
  const list = (await schemes())
    .map(s => {
      const rel = join('js', 'schemes', s.category, `${s.id}.js`);
      return { id: s.id, category: s.category, subcategory: s.subcategory, base: `${s.id}.js`, rel, path: join(ROOT, rel) };
    })
    .sort((a, b) => (a.base < b.base ? -1 : a.base > b.base ? 1 : 0));

  // Every catalogued card must have a file, checked HERE so a walker cannot start on a partial set.
  // data.js has to guarantee that every entry it lists has a file behind it, and it cannot do that
  // on its own: it will happily point at a path nobody created. Reading a missing file would throw
  // anyway, but only midway through a run, after half the assertions had already passed.
  const missing = list.filter(c => !existsSync(c.path));
  if (missing.length) {
    const detail = missing.map(c => `${c.id} (data.js points at ${c.rel})`).join('\n  ');
    throw new Error(`catalog FAILED: ${missing.length} of ${list.length} catalogued card(s) have no source file.\n  ${detail}`);
  }
  return list;
}

// category key -> its cards. Built from the same list, so the two views cannot disagree.
export async function cardsByCategory() {
  const out = new Map();
  for (const c of await cards()) {
    if (!out.has(c.category)) out.set(c.category, []);
    out.get(c.category).push(c);
  }
  return out;
}

// The four real category keys. `all` is dropped: it is the grid's filter pseudo-entry, it owns no
// folder, no cards and no tint, and every walk over "the categories" means these four.
export async function categories() {
  const { CATEGORIES } = await catalog();
  return CATEGORIES.filter(c => c.key !== 'all').map(c => c.key);
}

// The full CATEGORIES registry rows, `all` included, for the tests that check its shape.
export async function categoryRegistry() {
  const { CATEGORIES } = await catalog();
  return CATEGORIES;
}

// category key -> { subcategory key: label }. Subcategory keys are unique across categories
// (D-07), which is what lets a `subcategory` value be read without also reading `category`.
export async function subcategories() {
  const { SUBCATEGORIES } = await catalog();
  return SUBCATEGORIES;
}

// card id -> poster markup. Keyed by card id, so this is catalog metadata and belongs here rather
// than with the card modules.
export async function posters() {
  const { POSTERS } = await importFromRoot('js', 'posters.js');
  return POSTERS;
}

// Where a category's card entries are declared. A finding about a `desc` has to name the file that
// holds it, and since the split that is no longer data.js.
export function manifest(category) {
  const rel = join('js', 'schemes', category, 'cards.js');
  return { rel, path: join(ROOT, rel) };
}

// What a category folder may hold besides its cards: the kit it paints with, the manifest declaring
// its entries, and its poster map. Listed rather than inferred on purpose: a module nobody imports
// and nobody lists, sitting next to the cards, is exactly the thing worth a red run. Adding a name
// here is a deliberate widening of the folder contract.
export const folderModules = (category) => new Set([`${category}-kit.js`, 'cards.js', 'posters.js']);

// THE TWO SHAPES OF A CARD RECORD, read off the tree rather than off a list of category names.
//
//   monolith  js/schemes/<cat>/CARDS.md          every `## <card id>` section in one file
//   split     js/schemes/<cat>/CARDS/<id>.md     one file per card, CARDS.md keeping the preamble
//
// A category is in the split shape when the directory exists, so a fifth category picking either
// one is covered the day it does, and no reader carries a list of which category is in which shape.
// The preamble file is ALWAYS in the returned list, both shapes: it holds no `## ` heading of its
// own, so including it costs a walk nothing and catches a section left behind after a split.
//
// A directory that exists and reads empty is a FAILURE, not a shorter walk. That is the whole of
// S-46 applied here: 28 files leaving the run silently would take every anchor with them.
export function recordFiles(category) {
  const dir = join(ROOT, 'js', 'schemes', category, 'CARDS');
  const one = (rel) => ({ rel, path: join(ROOT, rel) });
  const out = [one(join('js', 'schemes', category, 'CARDS.md'))];
  if (!existsSync(dir)) return out;
  const md = readdirSync(dir).filter(n => n.endsWith('.md')).sort();
  if (!md.length) {
    throw new Error(`RECORD WALK FAILED: js/schemes/${category}/CARDS/ exists and holds no .md file.\n` +
      '  A check that scans nothing reports nothing. Refusing to pass.');
  }
  for (const n of md) out.push(one(join('js', 'schemes', category, 'CARDS', n)));
  return out;
}

// The ONE canonical S-36 pointer for a card, which depends on the shape its category is in. Derived
// here rather than typed in the check, so the pointer a card carries and the file a walk opens can
// never drift apart: both come off `recordFiles`.
export function recordPointer(card) {
  const split = recordFiles(card.category).length > 1;
  return split
    ? `// Design notes for this card: ./CARDS/${card.id}.md`
    : `// Design notes for this card: ./CARDS.md#${card.id}`;
}

// The .js files actually on disk in a category folder. The one place a test is allowed to read the
// filesystem for card modules, and only to compare it against the catalog.
export async function folderFiles(category) {
  const entries = await readdir(join(ROOT, 'js', 'schemes', category), { withFileTypes: true });
  return entries.filter(e => e.isFile() && e.name.endsWith('.js')).map(e => e.name).sort();
}

// Assert a walk collected the whole catalog AFTER its own filter. Throws rather than exiting,
// because process.exit(2) inside a test runner kills the run without a finding attached to it.
//
// Only for a walk that HAS a filter (an id subset, a grid the browser rendered). A walk that goes
// straight through cards() is already covered by the existence guard above, and calling this with
// the same number on both sides would be an assertion that cannot fail, which reads as protection
// and is not. Skipped when the caller was handed an explicit subset, the one legitimate way to
// scan fewer.
export function census(label, collected, total, { subset = false } = {}) {
  if (subset || SUBSET) return;                 // SCHEME_IDS: a subset walk has nothing to census
  if (collected !== total) {
    throw new Error(
      `${label} CENSUS FAILED: collected ${collected} card(s), data.js lists ${total}.\n` +
      '  A check that scans nothing reports nothing. Refusing to pass.');
  }
}
