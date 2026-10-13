// The one sentence splitter and term matcher for user-visible prose (desc, narration, aria-label).
// Reads strings, never card source.

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Rationale per entry lives in the terms file itself.
export async function loadTerms() {
  return JSON.parse(await readFile(join(__dirname, 'terms.json'), 'utf8'));
}

// Guards: a version number is not a sentence break, an abbreviation does not open a sentence.
// A trailing-dot FQDN is not guarded: write a comma after it.
const ABBREV = ['e\\.g', 'i\\.e', 'etc', 'vs', 'cf', 'approx'];

const SENTENCE_SPLIT = new RegExp(
  `(?<=(?<![0-9])[.!?])(?<!\\b(?:${ABBREV.join('|')})\\.)\\s+`
);

export function sentences(text) {
  return text.split(SENTENCE_SPLIT).filter(s => s.trim());
}

export function sentenceStarts(text) {
  const starts = [0];
  const re = new RegExp(SENTENCE_SPLIT.source, 'g');
  let m;
  while ((m = re.exec(text))) starts.push(m.index + m[0].length);
  return starts;
}

const esc = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// A segment of a dotted or slashed identifier is a literal, not a term. `\.\w` keeps a sentence-final period working.
export const termRegex = t => new RegExp(`(?<![\\w-]|\\w\\.|\\/)${esc(t)}s?(?![\\w-]|\\.\\w|\\/)`, 'gi');

// A term right after a kubectl verb is part of a command. Anchored to the text just before the hit.
const COMMAND_TAIL = /[Kk]ubectl\s+[a-z-]+(?:\s+[a-z-]+)?\s+$/;

function exceptionRanges(dict, term, text) {
  const pats = (dict.exceptions || {})[term];
  if (!pats) return [];
  const out = [];
  for (const p of pats) for (const m of text.matchAll(new RegExp(p, 'g'))) out.push([m.index, m.index + m[0].length]);
  return out;
}

// `cls` is 'case' for a substitution, 'reword' for a lowercase-only name opening a sentence.
export function termIssues(dict, text) {
  const starts = new Set(sentenceStarts(text));
  const out = [];
  for (const [cls, table] of [['hard', dict.hard], ['hardLower', dict.hardLower]]) {
    for (const term of Object.keys(table)) {
      const re = termRegex(term);
      const exc = exceptionRanges(dict, term, text);
      let m;
      while ((m = re.exec(text))) {
        const got = m[0];
        const plural = got.length === term.length + 1 && /s$/i.test(got);
        const core = plural ? got.slice(0, -1) : got;
        if (core === term) continue;
        if (exc.some(([a, b]) => m.index >= a && m.index < b)) continue;
        if (COMMAND_TAIL.test(text.slice(0, m.index))) continue;
        const reword = cls === 'hardLower' && starts.has(m.index) && core.toLowerCase() === term;
        out.push({
          index: m.index, len: got.length, was: core, want: term,
          replacement: term + (plural ? got.slice(-1) : ''),
          cls: reword ? 'reword' : 'case',
          note: table[term],
        });
      }
    }
  }
  return out.sort((a, b) => a.index - b.index);
}
