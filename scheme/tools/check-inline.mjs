#!/usr/bin/env node
// check-inline.mjs: B7, the casing of strings drawn ON the diagram (not the narration, that is
// check-terms.mjs). System A, agreed with the author: a BLOCK LABEL is a heading and takes a
// capital, everything else on the canvas is body text and stays lowercase.
// Report and fix share one classifier, so they cannot disagree about what a defect is.
// node check-inline.mjs [--fix] [<id> ...]
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractInline, extractIndirect } from './prose.mjs';
import { cards, census } from './catalog.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dict = JSON.parse(await readFile(join(__dirname, 'terms.json'), 'utf8'));
// A binary name that prose may never capitalise may never be capitalised on the canvas either,
// so the inline list is seeded from hardLower rather than repeating it. Without this, moving a
// label from Containerd to the correct containerd made the casing rule demand it back.
const NAMES = new Set([...dict.inline.names, ...Object.keys(dict.hardLower)]);
const API = new Set(dict.inline.apiWords);
const COMPONENTS = dict.inline.components;

const args = process.argv.slice(2);
const fix = args.includes('--fix');
// --audit prints what the classifier decided to LEAVE ALONE, with the reason. An exception list
// hides real defects when it is wrong, and nothing else ever shows what it is hiding.
const audit = args.includes('--audit');
const only = new Set(args.filter(a => !a.startsWith('--')));

// The list of drawn-string sites lives in prose.mjs, shared with check-labels.
// The rule is about the first character, so only the first token can decide it.
const firstToken = s => s.trim().split(/[\s·:,+|]+/)[0].replace(/[.,;]$/, '');
// A token whose casing belongs to Kubernetes, Linux or a protocol, not to this project.
const isIdentifier = t =>
  /[0-9]/.test(t) ||            // eth0, v2, 10.96.0.1
  /[-.\/:=_]/.test(t) ||        // kube-proxy, status.phase, /var/lib, app=web
  /^[a-z]+[A-Z]/.test(t) ||     // restartPolicy
  /^[A-Z]{2,}/.test(t) ||       // POST, CRI, TLS
  /^[A-Z][a-z]+[A-Z]/.test(t) ||  // RunPodSandbox, ReadWriteOnce
  /^[A-Z][?!]?$/.test(t);       // a lone capital is a type letter: DNS record A, A?
// Returns the reason the string is left alone, or null when the casing rule applies to it.
// Note the order: this runs BEFORE verdict() reads `want`, so an apiWords or names entry exempts a
// block LABEL (want 'title') as much as body text, and a common word here gives up the capitalise
// rule for every future label opening with it. Per-entry reasoning in terms.json _apiWordsDoc.
const untouchable = (s) => {
  const t = firstToken(s);
  if (!t) return 'empty';
  if (isIdentifier(t)) return 'identifier';
  const lc = t.toLowerCase();
  if (API.has(lc)) return 'apiWord';
  if (NAMES.has(lc)) return 'name';
  return null;
};

// The second half of B7, and the casing rule is blind to it by construction: Api, Kubectl and
// ControllerManager open with a capital, so they were "correct" on 23 cards. This asks whether
// the NAME is the real one. Tokens, so Api never matches inside another word.
const TOKENS = s => s.split(/[\s·:,;/()[\]{}<>|]+/).filter(Boolean);
function componentIssues(text) {
  const out = [];
  for (const t of TOKENS(text)) {
    const right = COMPONENTS[t];
    if (right) out.push({ from: t, to: right });
  }
  return out;
}

// The defect, or null. Only the first character ever moves: the rest of the string is the
// author's wording and none of this tool's business.
function verdict(text, want) {
  const s = text.trim();
  if (!s || untouchable(s)) return null;
  const c = s[0];
  // Several capitalised words in a row is Title Case, and lowering only the first character
  // would leave "root Filesystem". Those need a human sentence, so they are reported, not fixed.
  if (want === 'lower' && /^[A-Z][a-z]+ [A-Z][a-z]/.test(s)) return { want, manual: true };
  if (want === 'title' && /[a-z]/.test(c)) return { want, from: c, to: c.toUpperCase() };
  if (want === 'lower' && /[A-Z]/.test(c)) return { want, from: c, to: c.toLowerCase() };
  return null;
}

const ALL = await cards();
const files = ALL.filter(c => !only.size || only.has(c.id));
census('inline check', files.length, ALL.length, { subset: only.size > 0 });

let found = 0, changed = 0, nameFound = 0, scanned = 0;
// ENFORCED since 2026-08-04: a chip value that reaches the canvas only as a property of a
// card-local wrapper call, which no INLINE_SITE can see. It landed report-only, its queue drained
// to zero the same day, and it joined the exit code as a regression guard. See scheme/CLAUDE.md.
let indirectScanned = 0;
const indirect = [];
// Writes the resolver could not read. NOT findings and NOT in the exit code: they are the part of
// the input this check did not see, and a run that hides them reports "0 finding(s), enforced" over
// a set it never read. Printed loudly and counted on the summary line every run instead.
const unread = [];
const byKind = new Map();
const byReason = new Map();
for (const { id: card, path } of files) {
  const src = await readFile(path, 'utf8');
  const edits = [], names = [];
  const ind = extractIndirect(src);
  // Identical notes are folded into one line with a count, because three write sites spelled the
  // same way print the same sentence. The COUNT stays the number of writes, not of lines.
  const seen = new Map();
  for (const n of ind.unresolved) seen.set(n, (seen.get(n) || 0) + 1);
  for (const [note, n] of seen) unread.push({ card, note, n });
  for (const hit of ind.values) {
    indirectScanned++;
    const nm = componentIssues(hit.text), v = verdict(hit.text, hit.want);
    if (v || nm.length) indirect.push({ card, hit, v, nm });
  }
  for (const hit of extractInline(src)) {
    scanned++;
    for (const c of componentIssues(hit.text)) names.push({ kind: hit.kind, text: hit.text, ...c });
    const v = verdict(hit.text, hit.want);
    if (!v) {
      if (audit) {
        const why = untouchable(hit.text.trim()) || 'already correct';
        byReason.set(why, (byReason.get(why) || 0) + 1);
        console.log(`  ${why.padEnd(12)} ${hit.kind.padEnd(10)} ${JSON.stringify(hit.text)}`);
      }
      continue;
    }
    edits.push({ at: hit.at, ...v, kind: hit.kind, text: hit.text });
  }
  if (names.length) {
    nameFound += names.length;
    console.log(`\n${card}`);
    // Never auto-fixed: a name change alters the drawn width, which is a picture change.
    for (const n of names) console.log(`  ${n.kind.padEnd(12)} NAME    ${JSON.stringify(n.text)}  ${n.from} -> ${n.to}`);
  }
  if (!edits.length) continue;
  found += edits.length;
  for (const e of edits) byKind.set(e.kind, (byKind.get(e.kind) || 0) + 1);
  if (fix) {
    let out = src;
    for (const e of [...edits].filter(x => !x.manual).sort((a, b) => b.at - a.at)) out = out.slice(0, e.at) + e.to + out.slice(e.at + 1);
    await writeFile(path, out);
    changed += edits.filter(e => !e.manual).length;
  } else {
    console.log(`\n${card}`);
    for (const e of edits) console.log(`  ${e.kind.padEnd(12)} ${e.manual ? 'MANUAL' : e.want === 'title' ? 'UP    ' : 'DOWN  '}  ${JSON.stringify(e.text)}`);
  }
}

if (indirect.length) {
  // Never auto-fixed even under --fix: the string sits at a wrapper call site, not at an INLINE_SITE,
  // so there is no offset to rewrite and the edit is a judgement about which chip owns the value.
  console.log(`\n--- strings drawn through a card-local wrapper (${indirect.length}), fix by hand ---`);
  for (const r of indirect) {
    const tag = r.v ? (r.v.manual ? 'MANUAL' : r.v.want === 'title' ? 'UP    ' : 'DOWN  ') : 'NAME  ';
    const fixes = r.nm.map(n => `  ${n.from} -> ${n.to}`).join('');
    console.log(`  ${r.card.padEnd(38)} ${tag}  ${JSON.stringify(r.hit.text).padEnd(28)} chip ${JSON.stringify(r.hit.chip)} <- ${r.hit.via}${fixes}`);
  }
}

const unreadWrites = unread.reduce((a, u) => a + u.n, 0);
if (unread.length) {
  console.log(`\n--- COULD NOT RESOLVE (${unreadWrites} write(s) on ${new Set(unread.map(u => u.card)).size} card(s)) ---`);
  console.log('These are NOT findings. They are chip writes this check could not read off the source,');
  console.log('so a value they put on the canvas was never classified. Read them by hand.');
  for (const u of unread) console.log(`  ${u.card.padEnd(34)} ${u.note}${u.n > 1 ? `  (x${u.n})` : ''}`);
}

console.log(`\ninline check: ${files.length} cards, ${scanned} strings, ${found} casing + ${nameFound} name finding(s)${fix ? `, ${changed} fixed` : ''}`);
if (byKind.size) console.log('  ' + [...byKind].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', '));
if (audit) console.log('  left alone: ' + [...byReason].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', '));
console.log(`  indirect (through a wrapper): ${indirectScanned} strings, ${indirect.length} finding(s), enforced`);
// Unresolved writes are printed and counted but stay OUT of the exit code: 18 exist on 2026-08-04,
// so failing on them would get the check switched off rather than the writes read. The count on
// this line is the guard, it is in every run and a rise in it is visible.
console.log(`  could not resolve: ${unreadWrites} write(s), reported only, not in the exit code`);
process.exit(!fix && (found || nameFound || indirect.length) ? 1 : 0);
