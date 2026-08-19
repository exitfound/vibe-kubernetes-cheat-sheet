// inline.test.mjs: the half of the T block of ../../CANON.md that only a RENDER can read.
// Successor of tools/check-inline.mjs, tools/check-labels.mjs, tools/check-figures.mjs, and of the
// narration and aria-label halves of tools/check-terms.mjs.
//
// ===========================================================================================
// WHY THIS IS A RENDER TEST AND NOT A UNIT TEST
// ===========================================================================================
// A card exports exactly one symbol, `init`. `narration` and the diagram's `aria-label` are
// arguments to makeInit and live inside its closure, so no import reaches them. The strings DRAWN
// on the canvas are worse than unreachable: half of them are built at run time from an array, a
// loop index or a card-local helper, which is why the four predecessors scraped the source with
// thirteen regexes and then had to carry a hardcoded COVERAGE FLOOR to notice when the scraping
// went quiet.
//
// Here the input is the DOM. Narration comes off window.__schemeCtl._timeline.steps (the path
// tools/check-duration.mjs already used), the drawn strings come off the <text> elements of the
// diagram, one static walk per step. That is the whole reason two of the sixty inherited rules are
// NOT carried over:
//
//   COVERAGE FLOOR (321 indirect strings) and UNREAD CEILING (8 unresolvable writes) exist only
//   because a regex over the source can stop matching. A string read off the canvas either is
//   drawn or is not, there is no resolver to go quiet, and there is nothing left to insure. What
//   replaces them is a CENSUS: the counts below are the numbers this suite measured on a green
//   tree, and a run that sees materially fewer is red. Same discipline, honest mechanism.
//
// The census is wider than the predecessors, and it costs findings. Reading the canvas finds
// strings no INLINE_SITE could match: a block label written through setBoxLabel(el, parts[i][0]),
// a chainList row taken from an array literal, a node frame label built by ['node-1', ...].map().
// Those carry 8 casing findings and 3 drift findings that no check has ever seen. They are NOT
// fixed here and they are NOT hidden: they are frozen below, one line each, and the assertion is
// EQUALITY, so a new one is red and a repaired one is red too. That is the project's own
// report-then-enforce discipline, applied to a coverage extension rather than to a rule.
//
// What this cannot do: judge meaning. A sentence can match its diagram and still be false.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census, floor, SUBSET, FULL_ONLY, CATALOG_BASELINE } from '../fixtures/catalog.mjs';
import { loadTerms, sentences, sentenceStarts, termIssues, termRegex } from '../fixtures/prose.mjs';
import {
  collectPageErrors, DEFAULT_BASE, DIAGRAM, discoverIds, gotoStep, launch, openCard,
  SELECTOR_TIMEOUT_MS, initPage, stepCount, stepMeta,
} from '../fixtures/render.mjs';

// ---------------------------------------------------------------------------------------------
// The census. Measured 2026-08-07 on a green tree, at 108 cards and 650 steps.
// ---------------------------------------------------------------------------------------------
const CARD_TOTAL = CATALOG_BASELINE.cards;

// Prose reachable only through the running controller: one narration per step that has one (the
// poster step of each card has none), plus one aria-label per card.
const NARRATION_FLOOR = floor(542);
const ARIA_TOTAL = (await cards()).length;

// Distinct (card, text class, string) triples over a static walk of every step. Counted once per
// card even when a string is redrawn on six steps, because the question is which strings exist,
// not how often they are painted. The predecessors counted OCCURRENCES IN THE SOURCE and reported
// 3093 (check-inline) and 3041 (check-labels), so these numbers are not comparable to those: a
// different mechanism counting a different thing, deliberately.
const DRAWN_FLOOR = floor(3509);
const CASE_ELIGIBLE_FLOOR = floor(3420);   // the same set minus the node frame labels, see T-12 below

// Strings a diagram BLOCK owns: its own label and sublabel texts, nested frames excluded. This is
// the input to the two figure rules. tools/check-figures.mjs anchored a string to the nearest
// preceding label in the FILE and counted 1251; ownership here is structural, which is both the
// stronger claim and a different count.
const ANCHORED_FLOOR = floor(1599);

// Every class a drawn string can carry. Asserted as a closed set, and this is the real successor
// of COVERAGE FLOOR: a new primitive that draws text under a class nobody listed would fall
// outside every rule below at zero findings, which is exactly the failure the floor was invented
// for. A count cannot catch that. A closed inventory can.
const TITLE_CLASSES = ['scheme-box-label', 'scheme-pod-label', 'scheme-cylinder-label'];
// T-12: a node frame label is uppercased catalog-wide by .scheme-node-label in css/diagrams.css,
// so the casing of the SOURCE string is invisible to the reader and correcting it changes nothing
// on screen. It is counted, and it is excluded from the casing and drift rules for that reason:
// including it turns three pairs of node-1 / Node-1 into findings no one can see.
const NODE_CLASS = 'scheme-node-label';
const LOWER_CLASSES = ['scheme-box-sublabel', 'scheme-pod-sublabel', 'scheme-chip-text', 'scheme-label'];
const ALL_TEXT_CLASSES = [...TITLE_CLASSES, NODE_CLASS, ...LOWER_CLASSES].sort();

// ---------------------------------------------------------------------------------------------
// Findings carried OPEN, frozen as data. Each is a string the source-scraping predecessors could
// not see. Equality, not a threshold: a tenth one is red, and so is a ninth that disappeared,
// because a stale exception is an exception nobody re-reads.
// ---------------------------------------------------------------------------------------------

// System A (T-09): a block label is a heading and takes a capital, everything else on the canvas
// is body text and stays lowercase.
const KNOWN_CASING = [
  // Four DNS and mount names drawn as block labels. Lowercase is the literal being named
  // (a DNS subdomain, a projected volume key), so capitalising it would print something that
  // does not exist.
  'network-dns-records         scheme-box-label   UP    "default"',
  'network-dns-records         scheme-box-label   UP    "svc"',
  'network-service-ports       scheme-box-label   UP    "http"',
  'storage-projected-volume    scheme-box-label   UP    "labels"',
  'storage-projected-volume    scheme-box-label   UP    "password"',
  'storage-projected-volume    scheme-box-label   UP    "token"',
  // Two body strings opening with a capital. Both open with an API word used as a heading inside
  // a value, which is the case System A has no way to spell.
  'network-dns-records         scheme-chip-text   DOWN  "Headless A: -> .2.7 .3.4 .1.9"',
  'storage-configmap-secret-mount scheme-label    DOWN  "Volume /etc/config"',
].sort();

// T-13: one object, one label, compared only inside the same position class.
const KNOWN_DRIFT = [
  // "pod" here is the DNS subdomain under the cluster domain, not the object. terms.json carries a
  // `homographs` list for exactly this, and it has no entry for it. Adding one is a fixture edit,
  // which is out of scope for this file.
  'pod: "Pod" x21 vs "pod" x1',
  'podc: "Pod C" x3 vs "pod-c" x1',
].sort();

// T-03 bans the semicolon in narration prose, and an aria-label is the diagram read aloud, so the
// rule reaches it too. The list is empty because the one that stood here, on
// network-pod-to-pod-cross-node, was read and repaired into a full stop. Empty is the correct
// resting state: a new entry belongs here only after a human has read it and decided to carry it.
const KNOWN_SEMICOLONS = [];

// Built from code points so this file does not contain the characters it bans.
const EM_DASH = String.fromCharCode(0x2014);
const EN_DASH = String.fromCharCode(0x2013);
const DASH_RE = new RegExp(`[${EM_DASH}${EN_DASH}]`);
const DASH_NAME = { [EM_DASH]: 'em-dash', [EN_DASH]: 'en-dash' };
const APOSTROPHE_RE = new RegExp(`['${String.fromCharCode(0x2019)}]`);

// ---------------------------------------------------------------------------------------------
// The classifier, carried over from tools/check-inline.mjs unchanged. Report and verdict share it
// so they cannot disagree about what a defect is.
// ---------------------------------------------------------------------------------------------
const dict = await loadTerms();
const NAMES = new Set([...dict.inline.names, ...Object.keys(dict.hardLower)]);
const API = new Set(dict.inline.apiWords);
const COMPONENTS = dict.inline.components;
const HOMOGRAPHS = new Set((dict.inline.homographs || []).map(s => s.toLowerCase()));

// The rule is about the first character, so only the first token can decide it.
const firstToken = s => s.trim().split(/[\s·:,+|]+/)[0].replace(/[.,;]$/, '');
// A token whose casing belongs to Kubernetes, Linux or a protocol, not to this project.
const isIdentifier = t =>
  /[0-9]/.test(t) ||              // eth0, v2, 10.96.0.1
  /[-.\/:=_]/.test(t) ||          // kube-proxy, status.phase, /var/lib, app=web
  /^[a-z]+[A-Z]/.test(t) ||       // restartPolicy
  /^[A-Z]{2,}/.test(t) ||         // POST, CRI, TLS
  /^[A-Z][a-z]+[A-Z]/.test(t) ||  // RunPodSandbox, ReadWriteOnce
  /^[A-Z][?!]?$/.test(t);         // a lone capital is a type letter: DNS record A, A?
const untouchable = (s) => {
  const t = firstToken(s);
  if (!t) return 'empty';
  if (isIdentifier(t)) return 'identifier';
  const lc = t.toLowerCase();
  if (API.has(lc)) return 'apiWord';
  if (NAMES.has(lc)) return 'name';
  return null;
};
const TOKENS = s => s.split(/[\s·:,;/()[\]{}<>|]+/).filter(Boolean);
const componentIssues = text => TOKENS(text).filter(t => COMPONENTS[t]).map(t => ({ from: t, to: COMPONENTS[t] }));

function verdict(text, want) {
  const s = text.trim();
  if (!s || untouchable(s)) return null;
  const c = s[0];
  // Several capitalised words in a row is Title Case, and lowering only the first character would
  // leave "root Filesystem". Those need a human sentence, so they are reported, not fixed.
  if (want === 'lower' && /^[A-Z][a-z]+ [A-Z][a-z]/.test(s)) return 'MANUAL';
  if (want === 'title' && /[a-z]/.test(c)) return 'UP';
  if (want === 'lower' && /[A-Z]/.test(c)) return 'DOWN';
  return null;
}

// ---------------------------------------------------------------------------------------------
// Gather: one browser, one page, one static walk of every step of every card.
// ---------------------------------------------------------------------------------------------
const catalogued = await cards();

const browser = await launch();
// Registered on the line after the launch, before the page setup below: node:test runs an
// `after` hook whatever happens to the tests, but a throw in the setup itself (a context, an
// init script, a grid that never renders) happens BEFORE the hook exists, and that browser is
// then nobody's to close for the rest of the run.
after(() => browser.close());

// reducedMotion is not set: gotoStep already replays a step the way prev and reset do, which is
// the deterministic path. The PLAYED path is deliberately not walked here, because it is not
// reproducible between runs (measured while porting check-palette) and every string it adds is a
// riding label that a static frame also carries at its destination.
const context = await browser.newContext();
const page = await context.newPage();
await page.addInitScript(initPage, 'expose');

const ids = await discoverIds(page, DEFAULT_BASE);

// card id -> { aria, steps: [{id, narration}], drawn: [{cls, text}], frames: [{key, kind, labels, texts}] }
const collected = new Map();
// Cards whose module never loaded, whose controller never appeared, or that threw on the way in.
// An apostrophe in a narration string ends it early and the module stops parsing, so this list is
// where T-01 lands: the browser refuses the file, app.js logs "Failed to load scheme" and the
// diagram is never built.
const broken = [];

for (const id of ids) {
  const collector = collectPageErrors(page);
  try {
    await openCard(page, id, DEFAULT_BASE);
  } catch (e) {
    broken.push(`${id}: the diagram never appeared (${String(e.message).split('\n')[0]}). ` +
      `Page said: ${collector.errors.slice(0, 2).join(' | ') || 'nothing'}`);
    collector.stop();
    continue;
  }
  const total = await stepCount(page);
  const meta = await stepMeta(page);
  if (!total || !meta) {
    // stepMeta() returning null means the debug handle is absent, and a caller that treats that as
    // "no findings" has written a check that cannot fail.
    broken.push(`${id}: stepCount ${total}, stepMeta ${meta ? 'present' : 'MISSING'}`);
    collector.stop();
    continue;
  }
  const drawn = new Map();     // `${cls}\t${text}` -> {cls, text}
  const frames = new Map();    // `${kind}@${transform}` -> {kind, labels:Set, texts:Set}
  for (let i = 0; i < total; i++) {
    await gotoStep(page, i);
    const shot = await page.evaluate((sel) => {
      const svg = document.querySelector(sel);
      if (!svg) return null;
      const FRAME = '.scheme-box, .scheme-pod, .scheme-node, .scheme-cylinder';
      const texts = [...svg.querySelectorAll('text')].map(t => ({
        cls: (t.getAttribute('class') || '').split(/\s+/)[0],
        text: t.textContent || '',
      }));
      // A frame owns the text elements whose NEAREST enclosing frame is itself, so a Pod does not
      // inherit the strings of the box drawn inside it. Identity is the frame's POSITION, because
      // one card draws two distinct Pods under one label and keying on the text would merge them
      // and hide a shared address.
      const frames = [...svg.querySelectorAll(FRAME)].map(f => ({
        kind: (f.getAttribute('class') || '').split(/\s+/)[0],
        tf: f.getAttribute('transform') || '',
        own: [...f.querySelectorAll('text')]
          .filter(t => t.parentElement.closest(FRAME) === f)
          .map(t => ({ cls: (t.getAttribute('class') || '').split(/\s+/)[0], text: t.textContent || '' })),
      }));
      return { texts, frames };
    }, DIAGRAM);
    if (!shot) { broken.push(`${id}: the diagram vanished at step ${i}`); break; }
    for (const t of shot.texts) drawn.set(`${t.cls}\t${t.text}`, t);
    for (const f of shot.frames) {
      const key = `${f.kind}@${f.tf}`;
      if (!frames.has(key)) frames.set(key, { key, kind: f.kind, labels: new Set(), texts: new Set() });
      const e = frames.get(key);
      for (const t of f.own) {
        if (!t.text.trim()) continue;
        e.texts.add(t.text);
        if (/-label$/.test(t.cls)) e.labels.add(t.text);
      }
    }
  }
  collector.stop();
  collected.set(id, { aria: await page.$eval(DIAGRAM, s => s.getAttribute('aria-label') || ''), steps: meta, drawn: [...drawn.values()], frames: [...frames.values()] });
}

// ---- the two flat views every rule below reads ----

// Prose: one narration per step that carries one, plus one aria-label per card.
const prose = [];
for (const [id, rec] of collected) {
  if (rec.aria) prose.push({ id, where: 'aria-label', text: rec.aria });
  for (const s of rec.steps) if (s.narration) prose.push({ id, where: `narration:${s.id || '?'}`, text: s.narration });
}

// Drawn strings, with the position class System A judges them in.
const wantOf = cls => (TITLE_CLASSES.includes(cls) ? 'title' : LOWER_CLASSES.includes(cls) ? 'lower' : null);
const drawn = [];
for (const [id, rec] of collected) {
  for (const d of rec.drawn) drawn.push({ id, cls: d.cls, text: d.text, want: wantOf(d.cls) });
}
// The casing and drift rules see everything but the node frame labels (T-12).
const eligible = drawn.filter(d => d.want !== null);

// ---------------------------------------------------------------------------------------------
// The census. Every rule below walks one of the lists it counts.
// ---------------------------------------------------------------------------------------------

test(`the grid renders the whole catalog (${CARD_TOTAL} cards)`, () => {
  assert.ok(ids.length > 0, `NO CARDS RENDERED at ${DEFAULT_BASE}/scheme/ : posters or grid broken`);
  census('inline grid', ids.length, catalogued.length);
  assert.equal(catalogued.length, CARD_TOTAL,
    `data.js lists ${catalogued.length} cards, the baseline is ${CARD_TOTAL}`);
});

test('every card loaded, built and handed over its step list (T-01, T-02)', () => {
  // The module-load rule lands here. A narration string is single-quoted JS: an apostrophe inside
  // it closes the string early, the browser refuses the module, and the card that renders nothing
  // is the only symptom. The .claude/hooks/check-js.sh write hook catches the syntax error as the
  // file is saved, this catches the class it does not.
  assert.deepEqual(broken, [], `${broken.length} card(s) did not render:\n  ${broken.join('\n  ')}`);
  census('inline walked', collected.size, CARD_TOTAL);
});

test(`the prose census holds (${NARRATION_FLOOR}+ narration, ${ARIA_TOTAL} aria-label)`, FULL_ONLY, () => {
  const narration = prose.filter(p => p.where.startsWith('narration')).length;
  const aria = prose.filter(p => p.where === 'aria-label').length;
  // A floor, not an equality: a new card raises it. A run that reads FEWER strings has lost a path
  // into the controller, and every terminology rule below would then pass over less than it did.
  assert.ok(narration >= NARRATION_FLOOR,
    `read ${narration} narration strings off the controller, the baseline is ${NARRATION_FLOOR}. ` +
    'window.__schemeCtl._timeline.steps is the only way in: if it changed shape, every rule here went quiet.');
  assert.equal(aria, ARIA_TOTAL, `${aria} cards carry an aria-label, ${CARD_TOTAL} must (T-28)`);
  const missing = [...collected].filter(([, r]) => !r.aria).map(([id]) => id);
  assert.deepEqual(missing, [], `${missing.length} card(s) draw a diagram with no aria-label`);
});

test(`the drawn-string census holds (${DRAWN_FLOOR}+ strings over ${CARD_TOTAL} cards)`, () => {
  assert.ok(drawn.length >= DRAWN_FLOOR,
    `read ${drawn.length} drawn strings off the canvas, the baseline is ${DRAWN_FLOOR}. ` +
    'This replaces the inherited COVERAGE FLOOR: there is no resolver left to go quiet, but a walk ' +
    'that stops early still reports nothing and passes.');
  assert.ok(eligible.length >= CASE_ELIGIBLE_FLOOR,
    `${eligible.length} of them carry a position class, the baseline is ${CASE_ELIGIBLE_FLOOR}`);
  census('inline drawn walk', new Set(drawn.map(d => d.id)).size, CARD_TOTAL);
});

test('every drawn string carries a known text class, and no primitive draws outside them', FULL_ONLY, () => {
  // The other half of the census, and the sharper half. A count cannot see a NEW class: a new
  // primitive drawing text under .scheme-badge-label would add strings, raise the count and be
  // judged by nothing. This closes the set instead.
  const seen = [...new Set(drawn.map(d => d.cls))].sort();
  assert.deepEqual(seen, ALL_TEXT_CLASSES,
    `the diagram draws text under ${seen.join(', ')}. The rules below classify ${ALL_TEXT_CLASSES.join(', ')}, ` +
    'so anything unlisted is drawn on the canvas and read by nothing.');
});

// ---------------------------------------------------------------------------------------------
// T-06 / T-07 / T-08: terminology over narration and aria-label
// ---------------------------------------------------------------------------------------------

function issuesOf(p) {
  const out = { case: [], reword: [] };
  for (const it of termIssues(dict, p.text)) {
    const line = `${p.id} ${p.where}  "${it.was}" should be "${it.want}"  ${it.note}`;
    out[it.cls === 'reword' ? 'reword' : 'case'].push(line);
  }
  return out;
}

test('T-06 every narration and aria-label spells a dictionary term the one correct way (CASE)', () => {
  const bad = [];
  for (const p of prose) bad.push(...issuesOf(p).case);
  assert.ok(prose.length >= NARRATION_FLOOR + floor(ARIA_TOTAL), `the walk saw ${prose.length} prose strings`);
  assert.deepEqual(bad, [], `${bad.length} terminology defect(s) in narration or aria-label`);
});

test('T-07 no narration opens a sentence with a term that must stay lowercase (REWORD)', () => {
  const bad = [];
  for (const p of prose) bad.push(...issuesOf(p).reword);
  assert.deepEqual(bad, [], `${bad.length} sentence(s) open with a name that may not take a capital: reword, do not capitalise`);
});

test('every sentence of every narration opens with a capital (OPEN)', () => {
  const bad = [];
  let split = 0;
  for (const p of prose) {
    // An aria-label is a label read aloud, not a sentence, so opening it with hostNetwork or
    // emptyDir is correct and the only rewrite this rule would allow is Hostnetwork.
    if (p.where === 'aria-label') continue;
    for (const part of sentences(p.text)) {
      split++;
      const t = part.trim();
      if (t && /^[a-z]/.test(t)) bad.push(`${p.id} ${p.where}  "${t.slice(0, 60)}"`);
    }
  }
  assert.ok(split >= NARRATION_FLOOR, `split ${split} sentences out of ${NARRATION_FLOOR}+ narration strings`);
  assert.deepEqual(bad, [], `${bad.length} sentence(s) open with a lowercase word`);
});

// ---------------------------------------------------------------------------------------------
// T-01 / T-03 / T-04: the three characters user-visible text may not carry
// ---------------------------------------------------------------------------------------------

test('T-04 no em-dash or en-dash in narration, aria-label or any drawn string', () => {
  const bad = [];
  for (const p of prose) {
    const m = DASH_RE.exec(p.text);
    if (m) bad.push(`${p.id} ${p.where}: ${DASH_NAME[m[0]]}`);
  }
  for (const d of drawn) {
    const m = DASH_RE.exec(d.text);
    if (m) bad.push(`${d.id} ${d.cls}: ${DASH_NAME[m[0]]} in ${JSON.stringify(d.text)}`);
  }
  assert.deepEqual(bad, [], `${bad.length} dash(es) in text the reader sees`);
});

test('T-01 no apostrophe survives in any narration, aria-label or drawn string', () => {
  // Belt and braces to the load rule above. A card whose narration carries an apostrophe usually
  // fails to parse, but not always: the string simply ends early and what follows may still be
  // valid JS, in which case the card renders and the SENTENCE is wrong. That is the case this
  // catches, and only a render can.
  const bad = [];
  for (const p of prose) if (APOSTROPHE_RE.test(p.text)) bad.push(`${p.id} ${p.where}`);
  for (const d of drawn) if (APOSTROPHE_RE.test(d.text)) bad.push(`${d.id} ${d.cls}: ${JSON.stringify(d.text)}`);
  assert.deepEqual(bad, [], `${bad.length} apostrophe(s) reached the screen`);
});

test('T-03 no semicolon in narration prose, and the one known aria-label is still the only one', () => {
  const found = [];
  for (const p of prose) if (p.text.includes(';')) found.push(`${p.id} ${p.where}`);
  const narration = found.filter(f => f.includes('narration'));
  assert.deepEqual(narration, [], `${narration.length} narration string(s) carry a semicolon: use a comma, or a period and a capital`);
  // Equality, so a second one is red and the recorded one being repaired is red too. A stale
  // exception is an exception nobody re-reads.
  assert.deepEqual(found.sort(), [...KNOWN_SEMICOLONS].sort(),
    'the recorded semicolon findings changed. Add the new one here only after reading it, and drop a repaired one.');
});

// ---------------------------------------------------------------------------------------------
// T-09 / T-10 / T-11: System A, the casing of strings drawn ON the diagram
// ---------------------------------------------------------------------------------------------

test(`T-09 System A over ${CASE_ELIGIBLE_FLOOR}+ drawn strings, with ${KNOWN_CASING.length} carried open`, FULL_ONLY, () => {
  const found = [];
  for (const d of eligible) {
    const v = verdict(d.text, d.want);
    if (v) found.push(`${d.id.padEnd(27)} ${d.cls.padEnd(18)} ${v.padEnd(6)} ${JSON.stringify(d.text)}`.replace(/\s+$/, ''));
  }
  // Normalised so the frozen list can be written readably: the columns above are padded, and a
  // finding must compare by content, not by how wide a card id happens to be.
  const norm = s => s.replace(/\s+/g, ' ').trim();
  assert.deepEqual(found.map(norm).sort(), KNOWN_CASING.map(norm).sort(),
    `System A findings changed.\n  now:\n    ${found.map(norm).sort().join('\n    ')}\n` +
    '  Every entry in the frozen list is a string the source-scraping predecessors could not see, ' +
    'left open on purpose. A NEW one is a defect; a MISSING one means the frozen list needs the ' +
    'repaired line deleted.');
});

test('T-09 no drawn string misspells a component name (NAME)', () => {
  // The half the casing rule is blind to by construction: Api, Kubectl and ControllerManager all
  // open with a capital, so they were "correct" on 23 cards until this dictionary was written.
  const bad = [];
  for (const d of eligible) {
    for (const n of componentIssues(d.text)) bad.push(`${d.id} ${d.cls} ${JSON.stringify(d.text)}  ${n.from} -> ${n.to}`);
  }
  assert.deepEqual(bad, [], `${bad.length} component name(s) drawn the wrong way`);
});

// ---------------------------------------------------------------------------------------------
// T-13 / T-14: one object, one label, inside one position class
// ---------------------------------------------------------------------------------------------

// Two indexes over the same list: exact lowercase, and "shape" with spaces, dots, hyphens and
// underscores thrown away. The position class is part of the key, because a heading and a chip
// value are SUPPOSED to differ: "Conntrack" over a block and "conntrack" in a chip is System A
// working, not drift.
function driftRows(list) {
  const byCase = new Map(), byShape = new Map();
  const add = (m, key, surface, id) => {
    if (!m.has(key)) m.set(key, new Map());
    const f = m.get(key);
    if (!f.has(surface)) f.set(surface, []);
    f.get(surface).push(id);
  };
  for (const h of list) {
    const s = h.text.trim();
    if (!s) continue;
    add(byCase, `${h.want}\t${s.toLowerCase()}`, s, h.id);
    add(byShape, `${h.want}\t${s.toLowerCase().replace(/[\s.\-_]/g, '')}`, s, h.id);
  }
  const collect = (map, skipIfSameCase) => {
    const rows = [];
    for (const [key, forms] of map) {
      if (forms.size < 2) continue;
      const [want, norm] = key.split('\t');
      if (HOMOGRAPHS.has(norm)) continue;
      // A shape clash that is only a case clash is already reported by the case pass.
      if (skipIfSameCase && new Set([...forms.keys()].map(s => s.toLowerCase())).size < 2) continue;
      rows.push({ want, norm, forms });
    }
    return rows;
  };
  return [...collect(byCase, false), ...collect(byShape, true)];
}

const rowText = r => `${r.norm}: ` +
  [...r.forms].sort((a, b) => b[1].length - a[1].length).map(([s, u]) => `${JSON.stringify(s)} x${u.length}`).join(' vs ');

test(`T-13 one object is labelled one way, with ${KNOWN_DRIFT.length} carried open (DRIFT)`, FULL_ONLY, () => {
  const rows = driftRows(eligible).filter(r => r.want === 'title');
  const found = rows.map(rowText).sort();
  assert.deepEqual(found, [...KNOWN_DRIFT].sort(),
    `label drift changed.\n  now:\n    ${found.join('\n    ')}\n` +
    '  Every carried entry is a pair no INLINE_SITE could see, because one half of each is ' +
    'drawn through a card-local helper or an array. A NEW pair is a defect.');
});

test('T-14 ambiguous VALUES, an API literal and an English word wearing one set of letters (reporting)', (t) => {
  // Never a verdict. MemoryPressure False is a Node condition and cordon false is a boolean,
  // Terminated is a container state and terminated is what TLS did. Nothing here tells them apart,
  // so the list is printed for a human exactly as the predecessor printed it.
  const rows = driftRows(eligible).filter(r => r.want === 'lower').map(rowText).sort();
  t.diagnostic(`T-14 ambiguous value pairs: ${rows.length}`);
  for (const r of rows) t.diagnostic('  ' + r);
  assert.ok(eligible.length >= CASE_ELIGIBLE_FLOOR, 'the reporting walk must still see the whole canvas');
});

// ---------------------------------------------------------------------------------------------
// T-18: the arithmetic a reader does across one diagram
// ---------------------------------------------------------------------------------------------

const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
// Cluster IPs and gateways are shared by construction, so only Pod-range addresses are compared.
const POD_RANGE = /^10\.244\./;
// A Pod and the eth0 box drawn inside it share an address by definition, so only frames whose
// label names a Pod are compared: "Client Pod", "Pod web-a", "pod-b", never "eth0" or "lo".
const IS_POD = s => /\bPod\b/.test(s) || /^pod-/.test(s);
const UNITS = { '': 1, k: 1e3, m: 1e-3, M: 1e6, G: 1e9, T: 1e12, Ki: 1024, Mi: 1024 ** 2, Gi: 1024 ** 3, Ti: 1024 ** 4 };
const qty = t => {
  const m = /^(\d+(?:\.\d+)?)(Ki|Mi|Gi|Ti|k|M|G|T|m)?$/.exec(t);
  return m ? Number(m[1]) * UNITS[m[2] || ''] : null;
};

const anchoredTotal = [...collected.values()].reduce((n, r) => n + r.frames.reduce((k, f) => k + f.texts.size, 0), 0);

test(`the figure rules read ${ANCHORED_FLOOR}+ block-owned strings`, () => {
  assert.ok(anchoredTotal >= ANCHORED_FLOOR,
    `${anchoredTotal} strings are owned by a diagram block, the baseline is ${ANCHORED_FLOOR}. ` +
    'Both rules below are silent over a set they did not collect.');
  const framed = [...collected.values()].filter(r => r.frames.length > 0).length;
  census('figures frames', framed, CARD_TOTAL);
});

test('T-18 two different Pods never carry the same address (DUP-IP)', () => {
  const bad = [];
  for (const [id, rec] of collected) {
    const owners = new Map();
    for (const f of rec.frames) {
      const label = [...f.labels][0] || '';
      if (!IS_POD(label)) continue;
      for (const t of f.texts) {
        for (const ip of t.match(IPV4) || []) {
          if (!POD_RANGE.test(ip)) continue;
          if (!owners.has(ip)) owners.set(ip, new Map());
          owners.get(ip).set(f.key, label);
        }
      }
    }
    for (const [ip, who] of owners) {
      if (who.size > 1) bad.push(`${id}  ${ip} labels ${who.size} blocks: ${[...who.values()].join(' / ')}`);
    }
  }
  assert.deepEqual(bad, [], `${bad.length} address(es) drawn on two different Pods`);
});

test('T-18 no block asks for more than its own limit (REQ>LIMIT)', () => {
  const bad = [];
  for (const [id, rec] of collected) {
    for (const f of rec.frames) {
      const all = [...f.texts].join(' · ');
      const req = /\b(?:req|requests?)\s+(\d+(?:\.\d+)?(?:Ki|Mi|Gi|Ti|k|M|G|T|m)?)/i.exec(all);
      const lim = /\blimits?\s+(\d+(?:\.\d+)?(?:Ki|Mi|Gi|Ti|k|M|G|T|m)?)/i.exec(all);
      if (!req || !lim) continue;
      const r = qty(req[1]), l = qty(lim[1]);
      if (r !== null && l !== null && r > l) {
        bad.push(`${id}  ${[...f.labels][0] || f.key}: req ${req[1]} above limit ${lim[1]}, the API server rejects that Pod`);
      }
    }
  }
  assert.deepEqual(bad, [], `${bad.length} block(s) draw a request above their own limit`);
});

// ---------------------------------------------------------------------------------------------
// SOFT terms over narration and aria-label. REPORTING, the other half of the split in
// ../unit/text.test.mjs.
// ---------------------------------------------------------------------------------------------

test('SOFT ambiguous terms across narration and aria-label, minority form listed (reporting)', (t) => {
  const forms = new Map();
  for (const p of prose) {
    const starts = new Set(sentenceStarts(p.text));
    for (const term of Object.keys(dict.soft)) {
      const re = termRegex(term);
      let m;
      while ((m = re.exec(p.text))) {
        if (starts.has(m.index)) continue;
        const got = m[0];
        const core = got.length === term.length + 1 && /s$/i.test(got) ? got.slice(0, -1) : got;
        if (!forms.has(term)) forms.set(term, new Map());
        const f = forms.get(term);
        if (!f.has(core)) f.set(core, []);
        f.get(core).push(`${p.id} ${p.where}`);
      }
    }
  }
  const split = [...forms].filter(([, f]) => f.size > 1).sort();
  t.diagnostic(`SOFT: ${split.length} of ${Object.keys(dict.soft).length} soft term(s) appear in more than one form`);
  for (const [term, f] of split) {
    const ranked = [...f].sort((a, b) => b[1].length - a[1].length);
    t.diagnostic(`  ${term.padEnd(12)} ${ranked.map(([form, at]) => `${form} ${at.length}`).join(' | ')}`);
    for (const [form, at] of ranked.slice(1)) t.diagnostic(`      ${form}: ${at.slice(0, 10).join(', ')}${at.length > 10 ? ' ...' : ''}`);
  }
  assert.ok(forms.size > 0, 'no soft term matched anywhere in 650 prose strings: the matcher collapsed');
});
