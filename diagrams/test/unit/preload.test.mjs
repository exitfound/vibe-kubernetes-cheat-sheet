// D-17: index.html modulepreloads every module a card reaches through its static imports (its kit
// and the lib under it), so opening a card fetches one file instead of a four-deep chain. Each
// preload is still imported by something. Blind to computed imports and to the preload order.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, normalize, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');
const CAT_DIR = join(ROOT, 'js', 'diagrams');
const IMPORT_RE = /^\s*(?:import|export)\b[^;'"]*?from\s*(['"])(\.{1,2}\/[^'"]+)\1/gm;

function closure(entries) {
  const seen = new Set();
  const visit = (file) => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const m of readFileSync(file, 'utf8').matchAll(IMPORT_RE)) visit(normalize(join(dirname(file), m[2])));
  };
  entries.forEach(visit);
  return seen;
}

const cardFiles = readdirSync(CAT_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .flatMap(d => readdirSync(join(CAT_DIR, d.name))
    .filter(f => f.startsWith(`${d.name}-`) && f.endsWith('.js') && f !== `${d.name}-kit.js`)
    .map(f => join(CAT_DIR, d.name, f)));
const cards = new Set(cardFiles);
const rel = (f) => relative(ROOT, f).split('\\').join('/');
const cardDeps = [...closure(cardFiles)].filter(f => !cards.has(f)).map(rel);
const appDeps = new Set([...closure([join(ROOT, 'js', 'app.js')])].map(rel));
const preloads = [...readFileSync(join(ROOT, 'index.html'), 'utf8')
  .matchAll(/<link rel="modulepreload" href="([^"]+)">/g)].map(m => m[1]);

test('D-17 every module a card imports is modulepreloaded by index.html', () => {
  assert.ok(cardFiles.length > 100, `found only ${cardFiles.length} card modules under js/diagrams/`);
  assert.ok(cardDeps.length >= 10, `card imports reach only ${cardDeps.length} modules: the import pattern stopped matching`);
  const missing = cardDeps.filter(f => !preloads.includes(f));
  assert.deepEqual(missing, [], 'opening a card would wait on these one round trip each: add a <link rel="modulepreload"> to index.html');
});

test('D-17 every modulepreload in index.html is imported by the grid or by a card', () => {
  const stale = preloads.filter(f => !appDeps.has(f) && !cardDeps.includes(f));
  assert.deepEqual(stale, [], 'these preloads are fetched on every visit and imported by nothing');
});
