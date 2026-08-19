// prose.mjs: the one sentence splitter and the one term matcher, for every test that reads
// user-visible text (a card `desc`, a step `narration`, an `aria-label`). Two copies would drift
// and then two tests would disagree about how many sentences a description has. No dependencies.
//
// WHAT THIS FILE DELIBERATELY DOES NOT HOLD: any machinery that scrapes a card's SOURCE with
// regexes to guess which strings get drawn, which is an INLINE_SITES table and everything
// downstream of it (extractInline, chipDecls, chipValues, extractIndirect, matchBracket, splitTop,
// callsOf, and the stripComments only that machinery needs). A guess off source text is not what a
// test should assert: the drawn strings are read off SCENE and STEPS_SPEC, which are data. The
// matcher below needs no stripComments either, because its input is a prose string, not a source
// file.
//
// Where the input comes from: `desc` from fixtures/catalog.mjs (it lives in cards.js and imports
// cleanly), `narration` and step ids from fixtures/render.mjs stepMeta() (they live inside
// makeInit's closure and only the running controller can reach them).

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// The terminology dictionary: hard (one correct spelling), hardLower (must stay lowercase),
// exceptions (ranges where a term is a literal name), soft (a distribution to judge, not a
// verdict), inline (drawn-string vocabulary). Rationale per entry is in the file itself.
export async function loadTerms() {
  return JSON.parse(await readFile(join(__dirname, 'terms.json'), 'utf8'));
}

// Two guards, both paid for by a false finding:
//   (?<![0-9])   a version number ("Kubernetes 1.31 added") is not a sentence break.
//   abbreviation "e.g. kube-proxy" is not a sentence opening lowercase.
// NOT guarded on purpose: a fully qualified name with its trailing dot
// (api.ns.svc.cluster.local.) really is indistinguishable from a sentence end here. Write a comma
// straight after it instead. Widening the splitter for that case would blind the lowercase-opening
// rule, whose entire job is telling a real lowercase opening from a false one.
const ABBREV = ['e\\.g', 'i\\.e', 'etc', 'vs', 'cf', 'approx'];

const SENTENCE_SPLIT = new RegExp(
  `(?<=(?<![0-9])[.!?])(?<!\\b(?:${ABBREV.join('|')})\\.)\\s+`
);

export function sentences(text) {
  return text.split(SENTENCE_SPLIT).filter(s => s.trim());
}

// Byte offset of every sentence start, so a term hit can be told sentence-initial.
export function sentenceStarts(text) {
  const starts = [0];
  const re = new RegExp(SENTENCE_SPLIT.source, 'g');
  let m;
  while ((m = re.exec(text))) starts.push(m.index + m[0].length);
  return starts;
}

// ---- term matching ----

const esc = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// The boundaries reject a term that is one segment of a dotted or slashed IDENTIFIER, because those
// are literals and their casing is not ours to correct: `kubernetes.io/dockerconfigjson` is an API
// type string, `Pod.spec.restartPolicy` a field path. `\.\w` rather than `\.` so a sentence-final
// period still ends a word normally.
export const termRegex = t => new RegExp(`(?<![\\w-]|\\w\\.|\\/)${esc(t)}s?(?![\\w-]|\\.\\w|\\/)`, 'gi');

// A term standing first or second after a kubectl verb is part of a copy-pasteable command
// (kubectl delete pvc, kubectl get pods), so capitalizing it would break the command. Anchored to
// the text immediately before the hit, so `kubectl drain first cordons the Node` is not excused.
const COMMAND_TAIL = /[Kk]ubectl\s+[a-z-]+(?:\s+[a-z-]+)?\s+$/;

// Ranges in `text` where this term is a literal name rather than the term.
function exceptionRanges(dict, term, text) {
  const pats = (dict.exceptions || {})[term];
  if (!pats) return [];
  const out = [];
  for (const p of pats) for (const m of text.matchAll(new RegExp(p, 'g'))) out.push([m.index, m.index + m[0].length]);
  return out;
}

// Every casing defect in one prose string, as {index, len, was, want, cls}. `cls` is 'case' for a
// plain substitution and 'reword' for a lowercase-only NAME opening a sentence, which a human has
// to rephrase because both rules cannot hold at once.
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
