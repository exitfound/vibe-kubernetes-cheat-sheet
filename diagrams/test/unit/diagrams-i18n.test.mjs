// S-57: diagrams/js/lang/ru.js against the card descriptions in js/data.js. Keyed by the English, so
// a reworded desc is a missing key plus an orphan. Catches the writing rules and a lost flag, never a
// wrong meaning: that takes a reader.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from '../fixtures/catalog.mjs';

const { DIAGRAMS, DESC_CHARS, descCap } = await import(pathToFileURL(join(ROOT, 'js', 'data.js')).href);
const { RU } = await import(pathToFileURL(join(ROOT, 'js', 'lang', 'ru.js')).href);

const english = new Set(DIAGRAMS.map(d => d.desc));

// Built from code points so this file does not contain the characters it bans.
const BANNED = new RegExp(`[${String.fromCharCode(0x2014)}${String.fromCharCode(0x2013)};']`);
const FLAG_RE = /(?:^|\s|\()(--?[a-z][\w-]*)/g;

test('every card description has a Russian line, and every Russian line an English one', () => {
  const missing = DIAGRAMS.filter(d => !RU[d.desc]).map(d => d.id);
  const orphans = Object.keys(RU).filter(en => !english.has(en)).map(en => en.slice(0, 60));
  assert.deepEqual(missing, [], `${missing.length} card(s) without a translation`);
  assert.deepEqual(orphans, [], `${orphans.length} translation(s) whose English is gone from the cards`);
});

test('the Russian lines keep the writing rules: no em or en dash, no semicolon or apostrophe, Cyrillic text', () => {
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

// S-59: the Russian desc reads as the owner writes. DESC_CHARS is the length to aim for (four lines at
// 1920, measured by fit.mjs in the card-facts-ru skill): a desc outside it is reported, never failed.
// Only a desc past 1.5 times the mean Russian desc fails.
const { min: RU_DESC_MIN, max: RU_DESC_MAX } = DESC_CHARS;
const RU_DESC_CAP = descCap(Object.values(RU));

test(`S-59 a Russian desc aims for ${RU_DESC_MIN} to ${RU_DESC_MAX} characters (reported, not enforced)`, (t) => {
  for (const ru of Object.values(RU))
    if (ru.length < RU_DESC_MIN || ru.length > RU_DESC_MAX) t.diagnostic(`${ru.length}: ${ru.slice(0, 70)}`);
});

test(`S-59 no Russian desc runs past 1.5 times the mean length (${RU_DESC_CAP} characters)`, () => {
  const findings = Object.values(RU)
    .filter(ru => ru.length > RU_DESC_CAP)
    .map(ru => `${ru.length}: ${ru.slice(0, 70)}`);
  assert.deepEqual(findings, []);
});

test('S-59 every Russian sentence starts with a capital letter', () => {
  const findings = Object.values(RU).flatMap(ru =>
    [...ru.matchAll(/(?:^|[.?!]\s+)([a-zа-яё][\w.\/-]*)/g)].map(m => `${m[1]}: ${ru.slice(0, 60)}`));
  assert.deepEqual(findings, []);
});

// A camelCase field, a dotted or slashed path and a number are verbatim on both sides.
const VERBATIM = /(?<![\w.\/-])([a-z]+[A-Z][\w]*|[A-Za-z][\w-]*[.\/][\w.\/-]*\w|\d[\w.]*)(?![\w\/-])/g;

test('S-59 every field, path and number of the English is in the Russian', () => {
  const findings = Object.entries(RU).flatMap(([en, ru]) =>
    [...new Set([...en.matchAll(VERBATIM)].map(m => m[1]))]
      .map(t => t.replace(/\.+$/, ''))
      .filter(t => !ru.includes(t))
      .map(t => `${t} lost: ${ru.slice(0, 60)}`));
  assert.deepEqual(findings, []);
});
