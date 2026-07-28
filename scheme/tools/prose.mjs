// prose.mjs: the one sentence splitter, shared by check-terms.mjs (the OPEN rule) and
// check-canon.mjs (R-desc counts sentences). Two copies would drift and then the two tools would
// disagree about how many sentences a description has. No dependencies, so check-canon stays
// browser-free and fast.
//
// Two guards, both paid for by a false finding:
//   (?<![0-9])   a version number ("Kubernetes 1.31 added") is not a sentence break.
//   abbreviation "e.g. kube-proxy" is not a sentence opening lowercase.
// NOT guarded on purpose: a fully qualified name with its trailing dot
// (api.ns.svc.cluster.local.) really is indistinguishable from a sentence end here. Write a comma
// straight after it instead. Widening the splitter for that case would blind the OPEN rule, whose
// entire job is telling a real lowercase opening from a false one.
const ABBREV = ['e\\.g', 'i\\.e', 'etc', 'vs', 'cf', 'approx'];

export const SENTENCE_SPLIT = new RegExp(
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

// ---- term matching, shared by check-terms.mjs (report) and fix-terms.mjs (apply) ----
// One engine, so the fixer cannot disagree with the linter about what counts as a defect.

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
export function exceptionRanges(dict, term, text) {
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

// Where a string that gets DRAWN on the diagram is written, and which way its first character
// must go under system A (`title` = block heading, `lower` = body text on the canvas).
// Shared by check-inline (casing, component names) and check-labels (vocabulary drift) so the
// two cannot disagree about what counts as a drawn string. The last three are card-local block
// helpers: 53 cards define one, and it forwards these to a sublabel or a riding label.
export const INLINE_SITES = [
  { re: /\blabel:\s*'([^']*)'/g,                          want: 'title', kind: 'label' },
  { re: /\bsetBoxLabel\([^,]+,\s*'([^']*)'/g,             want: 'title', kind: 'setBoxLabel' },
  { re: /\bsublabel:\s*'([^']*)'/g,                       want: 'lower', kind: 'sublabel' },
  { re: /\bname:\s*'([^']*)'/g,                           want: 'lower', kind: 'name' },
  { re: /\bvalue:\s*'([^']*)'/g,                          want: 'lower', kind: 'value' },
  { re: /\bsetVal\([^,]+,\s*'([^']*)'/g,                  want: 'lower', kind: 'setVal' },
  { re: /\bset(?:Box|Pod)Sublabel\([^,]+,\s*'([^']*)'/g,  want: 'lower', kind: 'setSublabel' },
  { re: /\bsetWire\(\s*s\s*,\s*'[^']*'\s*,\s*'([^']*)'/g, want: 'lower', kind: 'wire' },
  { re: /\bip:\s*'([^']*)'/g,                             want: 'lower', kind: 'ip' },
  { re: /\bsub:\s*'([^']*)'/g,                            want: 'lower', kind: 'sub' },
  { re: /\btag:\s*'([^']*)'/g,                            want: 'lower', kind: 'tag' },
  { re: /\bwire:\s*'([^']*)'/g,                           want: 'lower', kind: 'wireArg' },
  // A chainList row. These are drawn as prominently as any label, and were invisible to every
  // check in the project: check-terms reads prose, check-inline read the sites above, and neither
  // list included them. Four rows were rendering Api and Kubectl next to boxes correctly labelled
  // API and kubectl. The leading number makes them identifiers, so the casing rule stays out and
  // only the component-name dictionary applies, which is exactly the gap they fell through.
  { re: /'(\d+\.\s+[^']*)'/g,                             want: 'lower', kind: 'chain' },
];

export function extractInline(src) {
  const out = [];
  for (const site of INLINE_SITES) {
    const re = new RegExp(site.re.source, 'g');
    let m;
    while ((m = re.exec(src))) {
      const at = m.index + m[0].lastIndexOf(m[1]) + (m[1].length - m[1].trimStart().length);
      out.push({ text: m[1], kind: site.kind, want: site.want, at });
    }
  }
  return out.sort((a, b) => a.at - b.at);
}
