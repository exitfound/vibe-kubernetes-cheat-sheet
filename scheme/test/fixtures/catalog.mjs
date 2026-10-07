// The one place that knows which cards exist and where their files live, imported from data.js, never
// read off a directory listing (which goes empty once cards live in subfolders). No browser here.

import { existsSync, readdirSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const ROOT = join(__dirname, '..', '..');

const importFromRoot = (...seg) => import(pathToFileURL(join(ROOT, ...seg)).href);

// The catalog baseline, typed exactly once. Every other file derives its own counts. Changing these is
// how adding or removing a card or step is acknowledged on purpose.
export const CATALOG_BASELINE = Object.freeze({ cards: 143, steps: 911 });

// SCHEME_IDS narrows the browser walks for a single-card review, never cards(). census() returns
// instead of passing on a subset and floor() collapses to zero, so a subset cannot fake a green gate.
export const ONLY = (process.env.SCHEME_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
export const SUBSET = ONLY.length > 0;
export const floor = (n) => (SUBSET ? 0 : n);
// An exact census is skipped by name on a subset rather than zeroed.
export const FULL_ONLY = SUBSET ? { skip: 'SCHEME_IDS subset: a census needs the full walk' } : {};

// The raw catalog barrel. Everything below projects it.
export const catalog = () => importFromRoot('js', 'data.js');

// Catalog order, which is grid order.
export async function schemes() {
  const { SCHEMES } = await catalog();
  return SCHEMES;
}

// Sorted by basename, with `path` built from the convention app.js imports by.
export async function cards() {
  const list = (await schemes())
    .map(s => {
      const rel = join('js', 'schemes', s.category, `${s.id}.js`);
      return { id: s.id, category: s.category, subcategory: s.subcategory, base: `${s.id}.js`, rel, path: join(ROOT, rel) };
    })
    .sort((a, b) => (a.base < b.base ? -1 : a.base > b.base ? 1 : 0));

  // Checked here so a walker cannot start on a partial set.
  const missing = list.filter(c => !existsSync(c.path));
  if (missing.length) {
    const detail = missing.map(c => `${c.id} (data.js points at ${c.rel})`).join('\n  ');
    throw new Error(`catalog FAILED: ${missing.length} of ${list.length} catalogued card(s) have no source file.\n  ${detail}`);
  }
  return list;
}

export async function cardsByCategory() {
  const out = new Map();
  for (const c of await cards()) {
    if (!out.has(c.category)) out.set(c.category, []);
    out.get(c.category).push(c);
  }
  return out;
}

// `all` is the grid's filter pseudo-entry and owns nothing.
export async function categories() {
  const { CATEGORIES } = await catalog();
  return CATEGORIES.filter(c => c.key !== 'all').map(c => c.key);
}

export async function categoryRegistry() {
  const { CATEGORIES } = await catalog();
  return CATEGORIES;
}

// Subcategory keys are unique across categories (D-07).
export async function subcategories() {
  const { SUBCATEGORIES } = await catalog();
  return SUBCATEGORIES;
}

export async function posters() {
  const { POSTERS } = await importFromRoot('js', 'posters.js');
  return POSTERS;
}

// Card descriptions live in each category's manifest, not data.js.
export function manifest(category) {
  const rel = join('js', 'schemes', category, 'cards.js');
  return { rel, path: join(ROOT, rel) };
}

// Listed on purpose: an unlisted module beside the cards should go red.
export const folderModules = (category) => new Set([`${category}-kit.js`, 'cards.js', 'posters.js']);

// Monolith (CARDS.md) or split (CARDS/<id>.md, read off the tree). The preamble file is always
// included, and an existing but empty directory fails (S-46).
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

// The canonical S-36 pointer, derived from `recordFiles` so pointer and walk cannot drift.
export function recordPointer(card) {
  const split = recordFiles(card.category).length > 1;
  return split
    ? `// Design notes for this card: ./CARDS/${card.id}.md`
    : `// Design notes for this card: ./CARDS.md#${card.id}`;
}

// The only place a test reads the filesystem for card modules, to compare against the catalog.
export async function folderFiles(category) {
  const entries = await readdir(join(ROOT, 'js', 'schemes', category), { withFileTypes: true });
  return entries.filter(e => e.isFile() && e.name.endsWith('.js')).map(e => e.name).sort();
}

// Throws rather than exiting. Only for walks with a filter: calling it with one number on both sides
// cannot fail.
export function census(label, collected, total, { subset = false } = {}) {
  if (subset || SUBSET) return;                 // SCHEME_IDS: a subset walk has nothing to census
  if (collected !== total) {
    throw new Error(
      `${label} CENSUS FAILED: collected ${collected} card(s), data.js lists ${total}.\n` +
      '  A check that scans nothing reports nothing. Refusing to pass.');
  }
}
