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
// `path` follows data.js's own `module` field rather than rebuilding the path from a convention:
// whatever the browser loads is what the linters read, and a card that moves cannot leave them
// behind. When `module` goes away, this is the single line that has to learn the convention.
export async function cards() {
  const { SCHEMES } = await import(pathToFileURL(join(ROOT, 'js', 'data.js')).href);
  const list = SCHEMES
    .map(s => {
      const rel = join('js', s.module);              // './schemes/x.js' -> 'js/schemes/x.js'
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
