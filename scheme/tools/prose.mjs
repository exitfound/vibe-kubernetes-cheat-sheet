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

// ---- indirect drawn strings: chip values that reach the canvas through a card-local wrapper ----
// INLINE_SITES only see a string written literally AT the site. The chip rule asks every enter()
// to write every chip through one setChips(s, {...}) helper, so on a card that obeys it the value
// is a call-site property two hops away and no site matches. This resolver, written for
// inline-dump.mjs and moved here so the reader and the two checks cannot disagree, walks those
// hops. Full reasoning in ./README.md, and the rule it serves is ../CANON.md P-01.

// Blank comments out, keeping byte offsets so the enclosing-function lookup stays right and, in
// check-canon.mjs, so line numbers stay right. THE one copy: check-canon.mjs imports it from here.
// It used to keep a private fork without mode 6, which meant a regex literal holding `//` (a URL
// pattern) read as a comment start and blanked the rest of that line for every rule that read the
// stripped source, and a pattern like /['a]/ desynchronised the quote state.
export function stripComments(src) {
  let out = '', mode = 0;                       // 0 code, 1 line, 2 block, 3 ' 4 " 5 ` 6 regex
  // `prev` (last non-space code character) tells a regex literal from a division operator.
  let prev = '';
  for (let i = 0; i < src.length;) {
    const c = src[i], c2 = src[i + 1];
    if (mode === 0) {
      if (c === '/' && c2 === '/') { mode = 1; out += '  '; i += 2; continue; }
      if (c === '/' && c2 === '*') { mode = 2; out += '  '; i += 2; continue; }
      if (c === '/' && !'})]'.includes(prev) && !/[\w$]/.test(prev)) { mode = 6; out += c; i++; continue; }
      if (c === "'") mode = 3; else if (c === '"') mode = 4; else if (c === '`') mode = 5;
      if (!/\s/.test(c)) prev = c;
      out += c; i++; continue;
    }
    if (mode === 6) {
      if (c === '\\') { out += c + (c2 === undefined ? '' : c2); i += 2; continue; }
      if (c === '/') { mode = 0; prev = c; }
      if (c === '\n') mode = 0;                 // unterminated: bail rather than eat the file
      out += c; i++; continue;
    }
    if (mode === 1) { if (c === '\n') { mode = 0; out += c; } else out += ' '; i++; continue; }
    if (mode === 2) { if (c === '*' && c2 === '/') { mode = 0; out += '  '; i += 2; continue; } out += (c === '\n' ? c : ' '); i++; continue; }
    if (c === '\\') { out += c + (c2 === undefined ? '' : c2); i += 2; continue; }
    if ((mode === 3 && c === "'") || (mode === 4 && c === '"') || (mode === 5 && c === '`')) mode = 0;
    out += c; i++;
  }
  return out;
}

const OPENERS = { '(': ')', '{': '}', '[': ']' };
const endOfString = (t, j) => { const q = t[j]; for (j++; j < t.length; j++) { if (t[j] === '\\') j++; else if (t[j] === q) return j + 1; } return j; };
// Index just past the bracket that matches the one at `i`. Skips string literals, because a wire
// label like 'PATCH .../pods/{name}/status' otherwise unbalances the count.
export function matchBracket(t, i) {
  let depth = 0, j = i;
  for (; j < t.length; j++) {
    const c = t[j];
    if (c === "'" || c === '"' || c === '`') { j = endOfString(t, j) - 1; continue; }
    if (OPENERS[c]) depth++;
    else if (c === ')' || c === '}' || c === ']') { depth--; if (!depth) return j + 1; }
  }
  return j;
}
export function splitTop(t) {
  const out = []; let depth = 0, start = 0;
  for (let j = 0; j < t.length; j++) {
    const c = t[j];
    if (c === "'" || c === '"' || c === '`') { j = endOfString(t, j) - 1; continue; }
    if (OPENERS[c]) depth++;
    else if (c === ')' || c === '}' || c === ']') depth--;
    else if (c === ',' && depth === 0) { out.push(t.slice(start, j)); start = j + 1; }
  }
  out.push(t.slice(start));
  return out.map(x => x.trim()).filter(x => x !== '');
}

// Every call of `name` with its arguments already split, skipping the declaration itself.
export function callsOf(code, name) {
  const out = [];
  for (const m of code.matchAll(new RegExp(`\\b${name}\\s*\\(`, 'g'))) {
    if (/\bfunction\s+$/.test(code.slice(Math.max(0, m.index - 12), m.index))) continue;
    const open = m.index + m[0].length - 1, end = matchBracket(code, open);
    out.push({ at: m.index, args: splitTop(code.slice(open + 1, end - 1)) });
  }
  return out;
}

// Declared chips, ref -> { name, values, how, unresolved, origins, add }. `origins` maps each
// value to the set of provenances that produced it, `null` meaning it was also written literally
// somewhere the INLINE_SITES scan can already see. Nothing else reads it, so the reader is unchanged.
export function chipDecls(src) {
  const chips = new Map();
  for (const m of src.matchAll(/\b(\w+)\s*=\s*valChip\(\{[^}]*?name:\s*'([^']*)'[^}]*?value:\s*'([^']*)'/g)) {
    const c = { name: m[2], values: [m[3]], how: new Set(), unresolved: [], origins: new Map([[m[3], new Set([null])]]) };
    c.add = (v, how) => {
      if (!c.values.includes(v)) c.values.push(v);
      if (how) c.how.add(how);
      if (!c.origins.has(v)) c.origins.set(v, new Set());
      c.origins.get(v).add(how);
    };
    chips.set(m[1], c);
  }
  return chips;
}

// Fills each chip's value list from every setVal-equivalent write, resolving module constants and
// wrapper parameters. Returns the notes for writes it could NOT read, which the caller must print:
// a source reader that under-reports silently is worse than one that says what it cannot see.
export function chipValues(src, chips) {
  const code = stripComments(src);
  const notes = [];                                        // what could not be resolved, and why

  // Module-scope string constants, `const TERM = '4', QUORUM = '2 of 3';` included. The lookahead
  // wants the literal to BE the whole initializer, so `const A = 'a' + B;` stays unresolved.
  const consts = new Map();
  for (const line of code.split('\n')) {
    if (!/^const\s/.test(line)) continue;
    for (const m of line.matchAll(/([A-Za-z_$][\w$]*)\s*=\s*'([^']*)'\s*(?=[,;]|$)/g)) consts.set(m[1], m[2]);
  }

  // Top-level function declarations, with their parameter list and body range.
  const fns = [];
  for (const m of code.matchAll(/^function\s+([A-Za-z_$][\w$]*)\s*\(/gm)) {
    const open = m.index + m[0].length - 1, parEnd = matchBracket(code, open);
    const brace = code.indexOf('{', parEnd);
    if (brace < 0) continue;
    fns.push({ name: m[1], params: splitTop(code.slice(open + 1, parEnd - 1)), start: brace, end: matchBracket(code, brace) });
  }

  // setVal-equivalents: a function that forwards both parameters straight through is the same
  // write as far as a reader is concerned. Grown to a fixpoint below for 3-hop cards.
  //
  // The seed carries `setChip` because the fixpoint can only find CARD-LOCAL declarations, and
  // setChip is now imported from the kit rather than declared 29 times. Losing it is silent and
  // large: without this name the resolver drops from 321 resolved chip values to 114, and both
  // check-inline and check-labels keep printing "0 finding(s)" over the 207 they stopped reading.
  // Measured, not guessed. Any setter that moves out of the cards and into the kit belongs here.
  const equiv = new Set(['setVal', 'setChip']);
  for (let grew = true; grew;) {
    grew = false;
    for (const f of fns) {
      if (equiv.has(f.name)) continue;
      const [p0, p1] = f.params;
      if (!p1 || !/^[A-Za-z_$][\w$]*$/.test(p0 || '') || !/^[A-Za-z_$][\w$]*$/.test(p1)) continue;
      const body = code.slice(f.start, f.end);
      for (const e of equiv) if (new RegExp(`\\b${e}\\s*\\(\\s*${p0}\\s*,\\s*${p1}\\s*[,)]`).test(body)) { equiv.add(f.name); grew = true; break; }
    }
  }

  // The destructured object parameter of a wrapper: `function setChips(s, { mem, state })`.
  // Keyed by the LOCAL name, because a card may rename (`{ pod: podVal }`) or default (`{ cap = '8' }`).
  const destruct = new Map();
  for (const f of fns) {
    const idx = f.params.findIndex(p => p.startsWith('{'));
    if (idx < 0) continue;
    const locals = new Map();
    for (const part of splitTop(f.params[idx].slice(1, -1))) {
      const mm = /^([A-Za-z_$][\w$]*)\s*(?::\s*([A-Za-z_$][\w$]*))?\s*(?:=\s*([\s\S]+))?$/.exec(part);
      if (mm) locals.set(mm[2] || mm[1], { key: mm[1], def: mm[3] ? mm[3].trim() : null });
    }
    destruct.set(f.name, { argIndex: idx, locals, fn: f });
  }

  // An expression this cannot resolve is printed WHOLE, because a reader can usually read the
  // values straight out of it (a ternary between two literals is the common case).
  const show = e => e.replace(/\s+/g, ' ').slice(0, 120);
  const asLiteral = e => { const m = /^'([^']*)'$/.exec(e); return m ? m[1] : null; };
  const resolve = (e) => {
    const lit = asLiteral(e);
    if (lit !== null) return [{ v: lit, how: null }];
    if (/^[A-Za-z_$][\w$]*$/.test(e) && consts.has(e)) return [{ v: consts.get(e), how: `const ${e}` }];
    return null;
  };

  // Values a wrapper's parameter takes, read off every call site. Cached: a wrapper is called from
  // every step, and a 4-chip helper would otherwise re-scan the file 4 times.
  const siteCache = new Map();
  function paramValues(fnName, local) {
    const ck = `${fnName}:${local}`;
    if (siteCache.has(ck)) return siteCache.get(ck);
    const d = destruct.get(fnName);
    const { key, def } = d.locals.get(local);
    const out = { values: [], bad: [] };
    for (const call of callsOf(code, fnName)) {
      if (call.at >= d.fn.start && call.at < d.fn.end) continue;
      const arg = call.args[d.argIndex];
      if (!arg || !arg.startsWith('{')) { out.bad.push(`${fnName}(...) argument ${d.argIndex} is not an object literal`); continue; }
      const props = new Map();
      for (const part of splitTop(arg.slice(1, -1))) {
        const c = part.indexOf(':');
        if (c > 0) props.set(part.slice(0, c).trim(), part.slice(c + 1).trim());
      }
      const expr = props.has(key) ? props.get(key) : def;               // omitted => the default
      if (expr == null) { out.bad.push(`${fnName}({ ${key} }) omitted with no default`); continue; }
      const r = resolve(expr);
      if (r) out.values.push(...r.map(x => ({ v: x.v, how: `via ${fnName}{${key}}` })));
      else out.bad.push(`${fnName}({ ${key}: ${show(expr)} })`);
    }
    siteCache.set(ck, out);
    return out;
  }

  // Every write, in source order, so a card with no wrapper reads exactly as it did before.
  const list = [...equiv].join('|');
  for (const m of code.matchAll(new RegExp(`\\b(${list})\\s*\\(`, 'g'))) {
    const open = m.index + m[0].length - 1;
    const args = splitTop(code.slice(open + 1, matchBracket(code, open) - 1));
    const target = /^s\.refs\.(\w+)$/.exec(args[0] || '');
    if (!target) {
      if (/^s\.refs\[/.test(args[0] || '')) notes.push(`${m[1]}(${args[0]}, ...) writes a ref chosen at run time`);
      continue;
    }
    const chip = chips.get(target[1]);
    if (!chip) { notes.push(`${m[1]}(s.refs.${target[1]}, ...) targets a ref with no valChip declaration`); continue; }
    const expr = args[1];
    if (expr === undefined) continue;
    const direct = resolve(expr);
    if (direct) { direct.forEach(x => chip.add(x.v, x.how)); continue; }
    // A bare identifier inside a wrapper is that wrapper's parameter: go and read its call sites.
    const owner = fns.find(f => m.index >= f.start && m.index < f.end);
    const d = owner && destruct.get(owner.name);
    if (d && /^[A-Za-z_$][\w$]*$/.test(expr) && d.locals.has(expr)) {
      const got = paramValues(owner.name, expr);
      got.values.forEach(x => chip.add(x.v, x.how));
      got.bad.forEach(b => { chip.unresolved.push(b); notes.push(b); });
      continue;
    }
    const where = owner ? ` in ${owner.name}()` : '';
    const msg = `${m[1]}(s.refs.${target[1]}, ${show(expr)})${where}`;
    chip.unresolved.push(msg);
    notes.push(msg);
  }

  // A valChip whose name or value is not a literal (a listing row built in a loop) never enters the
  // list above, and a chip missing outright is worse than a chip missing a value. Say how many.
  const declared = (code.match(/\bvalChip\s*\(/g) || []).length;
  if (declared > chips.size) notes.push(`${declared - chips.size} valChip(...) call site(s) build a chip whose name or value is not a literal, so those chips are not listed at all`);
  return notes;
}

// Drawn strings that NO INLINE_SITE can see: a chip value whose every provenance is a wrapper
// parameter or a module constant. Shaped like extractInline's hits so the checks can reuse their
// own classifiers, plus `via` (the provenance) and `chip` (the chip name it lands in).
//
// Returns { values, unresolved }, NOT a bare array, and the shape is the point: it discarded
// chipValues' notes as a bare statement, so check-inline reported "0 finding(s), enforced" over an
// input it had never fully read (22 writes on 7 cards). A caller that wants only the strings has to
// say so, and the notes cannot be dropped by accident again. `unresolved` is what the resolver
// could NOT read: every one is a write that may put a string on the canvas this list does not show.
export function extractIndirect(src) {
  const chips = chipDecls(src);
  const unresolved = chipValues(src, chips);
  const values = [];
  for (const c of chips.values()) {
    for (const [v, hows] of c.origins) {
      if (hows.has(null)) continue;                 // also written literally: the literal scan has it
      values.push({ text: v, kind: 'value', want: 'lower', at: null, via: [...hows].join(' + '), chip: c.name });
    }
  }
  return { values, unresolved };
}
