// catalog.mjs: the one place that knows which cards exist and where their files live.
//
// Why this is not a readdir. Every filesystem check used to open the card directory itself:
//
//   const files = (await readdir(DIR)).filter(n => n.endsWith('.js')).sort();
//
// That filter reports ZERO files the moment cards live in subdirectories, because a directory
// name does not end in '.js'. Five of the six checks in the gate would then scan nothing, find
// nothing, and EXIT 0. A green gate over an empty set is worse than a red one, so the card list
// now comes from data.js, which is the catalog, and each check asserts it collected all of it.
//
// No browser here on purpose: the six filesystem checks must not pull in playwright.

import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dirname, '..');

// Every card, sorted the way readdir().sort() used to sort them (by basename, so output byte-for-byte
// matches what these checks printed before). Each entry carries the id, so no caller has to derive
// one by stripping '.js' off a filename.
//
// `path` is built from the same convention app.js uses to import a card, js/schemes/<cat>/<id>.js,
// so the linters read exactly what the browser loads. The convention itself is not assumed here:
// R-modulepath in check-canon asserts both halves of it, that every id starts with its category
// and that the folders hold no file the catalog does not claim.
export async function cards() {
  const { SCHEMES } = await import(pathToFileURL(join(ROOT, 'js', 'data.js')).href);
  const list = SCHEMES
    .map(s => {
      const rel = join('js', 'schemes', s.category, `${s.id}.js`);
      return { id: s.id, category: s.category, base: `${s.id}.js`, rel, path: join(ROOT, rel) };
    })
    .sort((a, b) => (a.base < b.base ? -1 : a.base > b.base ? 1 : 0));

  // Every catalogued card must have a file, checked HERE so a walker cannot start on a partial
  // set. This is the guarantee a directory listing used to give away for free and that data.js
  // alone cannot: data.js will happily point at a path nobody created. Reading a missing file
  // would throw anyway, but only midway through a run, after half the findings were printed.
  const missing = list.filter(c => !existsSync(c.path));
  if (missing.length) {
    for (const c of missing) console.error(`NO FILE  ${c.id}  (data.js points at ${c.rel})`);
    console.error(`catalog FAILED: ${missing.length} of ${list.length} catalogued card(s) have no source file.`);
    process.exit(2);
  }
  return list;
}

// What a category folder is allowed to hold besides its cards: the kit it paints with, the
// manifest declaring its entries, and its poster map. Listed rather than inferred on purpose.
// R-modulepath reports every other .js in the folder as unclaimed, and that is the right
// behaviour: a module nobody imports and nobody lists, sitting next to the cards, is exactly the
// thing worth a red gate. Adding a name here is a deliberate widening of the folder contract.
export const folderModules = (category) => new Set([`${category}-kit.js`, 'cards.js', 'posters.js']);

// Where a category's card entries are declared. A finding about a `desc` has to name the file that
// holds it, and since the split that is no longer data.js.
export function manifest(category) {
  const rel = join('js', 'schemes', category, 'cards.js');
  return { rel, path: join(ROOT, rel) };
}

// Assert a check collected the whole catalog AFTER its own filter. Only for the checks that have
// one (an id subset from argv); a check that walks `cards()` straight through is already covered
// by the existence guard above, and calling this with the same number on both sides would be an
// assertion that cannot fail, which reads as protection and is not.
// Skipped when the caller was given an explicit id subset, the one legitimate way to scan fewer.
export function census(label, collected, total, { subset = false } = {}) {
  if (subset) return;
  if (collected !== total) {
    console.error(`${label} CENSUS FAILED: collected ${collected} card file(s), data.js lists ${total}.`);
    console.error('  A check that scans nothing reports nothing. Refusing to pass.');
    process.exit(2);
  }
}
