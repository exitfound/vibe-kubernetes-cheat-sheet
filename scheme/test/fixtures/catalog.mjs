// catalog.mjs: the one place that knows which cards exist and where their files live. The list
// comes from data.js by IMPORT, never from a directory listing.
//
// Why not a readdir. Every filesystem check used to open the card directory itself with
// `(await readdir(DIR)).filter(n => n.endsWith('.js'))`. That filter reports ZERO files the moment
// cards live in subdirectories, because a directory name does not end in '.js', and five of the six
// browser-free checks would then scan nothing, find nothing and exit 0. A green run over an empty
// set is worse than a red one, so the list comes from the catalog and every walker asserts with
// census() that it collected all of it.
//
// No browser here on purpose: the unit tests must not pull in playwright.

import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// scheme/, two levels up from scheme/test/fixtures/.
export const ROOT = join(__dirname, '..', '..');

const importFromRoot = (...seg) => import(pathToFileURL(join(ROOT, ...seg)).href);

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

// Every card with the path of its module, sorted by basename (the order readdir().sort() used to
// give, so output stays comparable with the old checks).
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
  // This is the guarantee a directory listing used to give away for free and that data.js alone
  // cannot: data.js will happily point at a path nobody created. Reading a missing file would throw
  // anyway, but only midway through a run, after half the assertions had already passed.
  const missing = list.filter(c => !existsSync(c.path));
  if (missing.length) {
    const detail = missing.map(c => `${c.id} (data.js points at ${c.rel})`).join('\n  ');
    throw new Error(`catalog FAILED: ${missing.length} of ${list.length} catalogued card(s) have no source file.\n  ${detail}`);
  }
  return list;
}

// The cards of one category, in catalog order.
export async function cardsIn(category) {
  return (await cards()).filter(c => c.category === category);
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
  if (subset) return;
  if (collected !== total) {
    throw new Error(
      `${label} CENSUS FAILED: collected ${collected} card(s), data.js lists ${total}.\n` +
      '  A check that scans nothing reports nothing. Refusing to pass.');
  }
}
