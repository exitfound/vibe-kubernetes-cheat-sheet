// S-56: cli/js/lang/ru.js against cli/js/data.js. The table is keyed by the English, so a reworded
// description is a missing key plus an orphan. Catches the writing rules and a lost flag, never a
// wrong meaning: that takes a reader.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from '../fixtures/catalog.mjs';

const CLI = join(ROOT, '..', 'cli', 'js');
const { SECTIONS } = await import(pathToFileURL(join(CLI, 'data.js')).href);
const { RU } = await import(pathToFileURL(join(CLI, 'lang', 'ru.js')).href);

const english = new Set(SECTIONS.flatMap(s => s.groups.flatMap(g => [g.desc, ...g.cmds.map(c => c.desc)])));

// Built from code points so this file does not contain the characters it bans.
const BANNED = new RegExp(`[${String.fromCharCode(0x2014)}${String.fromCharCode(0x2013)};]`);
const FLAG_RE = /(?:^|\s|\()(--?[a-z][\w-]*)/g;

test('every /cli/ description has a Russian line, and every Russian line an English one', () => {
  const missing = [...english].filter(en => !RU[en]);
  const orphans = Object.keys(RU).filter(en => !english.has(en));
  assert.deepEqual(missing, [], `${missing.length} description(s) without a translation`);
  assert.deepEqual(orphans, [], `${orphans.length} translation(s) whose English is gone from data.js`);
});

test('the Russian lines keep the writing rules: no em or en dash, no semicolon, Cyrillic text', () => {
  const findings = Object.entries(RU).flatMap(([en, ru]) => [
    BANNED.test(ru) && `banned character: ${ru}`,
    !/[а-яё]/i.test(ru) && `no Cyrillic: ${en}`,
  ].filter(Boolean));
  assert.deepEqual(findings, []);
});

test('a flag named in the English is named in the Russian', () => {
  const findings = Object.entries(RU).flatMap(([en, ru]) =>
    [...en.matchAll(FLAG_RE)].map(m => m[1]).filter(f => !ru.includes(f)).map(f => `${f} lost: ${ru}`));
  assert.deepEqual(findings, []);
});

// The static-text swap is pasted into the four pages with a header, so the copies are held equal here,
// and its font URL to the one lang.js loads (a mismatch loads Onest twice).
test('the four pages carry one copy of the language swap snippet, with the lang.js font', async () => {
  const { readFileSync } = await import('node:fs');
  const { CYRILLIC_CSS } = await import(pathToFileURL(join(CLI, 'lib', 'lang.js')).href);
  const pages = ['index.html', 'cli/index.html', 'diagrams/index.html', '404.html'];
  const snippet = (p) => {
    const html = readFileSync(join(ROOT, '..', p), 'utf8');
    const m = html.match(/\(function \(\) \{\n\s+const PARTS = [\s\S]*?\n\s+\}\)\(\);/);
    assert.ok(m, `${p} has no language swap snippet`);
    return m[0].replace(/^\s+/gm, '');
  };
  const [first, ...rest] = pages.map(snippet);
  rest.forEach((s, i) => assert.equal(s, first, `${pages[i + 1]} differs from ${pages[0]}`));
  assert.ok(first.includes(`'${CYRILLIC_CSS}'`), 'the snippet font is not CYRILLIC_CSS of lang.js');
});
