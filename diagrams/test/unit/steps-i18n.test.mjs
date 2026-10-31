// S-58: js/lang/steps/<id>.js against each card's SCENE aria sentence and STEPS_SPEC narration. Keyed
// by the English, so a reworded step is a missing key plus an orphan. Catches the writing rules, a
// lost flag or number, never a wrong meaning: that takes a reader.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from '../fixtures/catalog.mjs';
import { importAll } from '../fixtures/module.mjs';

const DIR = join(ROOT, 'js', 'lang', 'steps');
const mods = await importAll();
const english = new Map([...mods].map(([id, ns]) =>
  [id, [ns.SCENE['aria-label'], ...ns.STEPS_SPEC.map(s => s.narration)].filter(Boolean)]));
const ru = new Map();
for (const id of mods.keys()) {
  const file = join(DIR, `${id}.js`);
  if (existsSync(file)) ru.set(id, (await import(pathToFileURL(file).href)).RU);
}

// Built from code points so this file does not contain the characters it bans.
const BANNED = new RegExp(`[${String.fromCharCode(0x2014)}${String.fromCharCode(0x2013)};']`);
const FLAG_RE = /(?:^|\s|\()(--?[a-z][\w-]*)/g;
const NUM_RE = /\d+/g;
const pairs = () => [...ru].flatMap(([id, map]) => Object.entries(map).map(([en, t]) => ({ id, en, t })));

test('every card has a file, and no file outlives its card', () => {
  const files = readdirSync(DIR).filter(f => f.endsWith('.js')).map(f => f.slice(0, -3));
  assert.deepEqual([...mods.keys()].filter(id => !ru.has(id)), [], 'card(s) without a lang/steps file');
  assert.deepEqual(files.filter(id => !mods.has(id)), [], 'lang/steps file(s) for no card');
});

test('every narration and aria sentence has a Russian line, and every Russian line an English one', () => {
  const findings = [...ru].flatMap(([id, map]) => {
    const en = english.get(id);
    return [
      ...en.filter(s => !map[s]).map(s => `${id} missing: ${s.slice(0, 60)}`),
      ...Object.keys(map).filter(s => !en.includes(s)).map(s => `${id} orphan: ${s.slice(0, 60)}`),
    ];
  });
  assert.deepEqual(findings, []);
});

test('the Russian lines keep the writing rules: no em or en dash, no semicolon or apostrophe, Cyrillic text', () => {
  const findings = pairs().flatMap(({ id, en, t }) => [
    BANNED.test(t) && `${id} banned character: ${t}`,
    !/[а-яё]/i.test(t) && `${id} no Cyrillic: ${en.slice(0, 60)}`,
  ].filter(Boolean));
  assert.deepEqual(findings, []);
});

test('a flag or a number named in the English is named in the Russian', () => {
  const findings = pairs().flatMap(({ id, en, t }) => [
    ...[...en.matchAll(FLAG_RE)].map(m => m[1]).filter(f => !t.includes(f)),
    ...(en.match(NUM_RE) || []).filter(d => !(t.match(NUM_RE) || []).includes(d)),
  ].map(x => `${id} ${x} lost: ${t.slice(0, 80)}`));
  assert.deepEqual(findings, []);
});
