// The T block of CANON.md that only a render can read: terminology, banned characters, System A
// casing, label drift and Pod-address arithmetic over narration, aria-labels and drawn strings.
// Known findings are frozen by equality. Cannot judge meaning.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census, floor, FULL_ONLY, CATALOG_BASELINE } from '../fixtures/catalog.mjs';
import { loadTerms, sentences, sentenceStarts, termIssues, termRegex } from '../fixtures/prose.mjs';
import { readSnapshot } from '../fixtures/snapshot.mjs';
import { vpName, VIEWPORTS } from '../tools/walk.mjs';

const VP = vpName(VIEWPORTS[0]);

// Census floors: a run that reads materially fewer strings is red.
const CARD_TOTAL = CATALOG_BASELINE.cards;

// One narration per non-poster step plus one aria-label per card.
const NARRATION_FLOOR = floor(555);
const ARIA_TOTAL = (await cards()).length;

// Distinct (card, text class, string) triples over a static walk of every step.
const DRAWN_FLOOR = floor(4012);
const CASE_ELIGIBLE_FLOOR = floor(3911);   // the same set minus the node frame labels (T-12)

// Strings a block owns (label, sublabel, nested frames excluded), counted once per card.
const ANCHORED_FLOOR = floor(1818);

// Closed set of text classes: a new primitive drawing text under an unlisted class would escape every rule.
const TITLE_CLASSES = ['scheme-box-label', 'scheme-pod-label', 'scheme-cylinder-label'];
// T-12: CSS uppercases node frame labels, so their source casing is invisible and excluded from casing and drift.
const NODE_CLASS = 'scheme-node-label';
const LOWER_CLASSES = ['scheme-box-sublabel', 'scheme-pod-sublabel', 'scheme-chip-text', 'scheme-label'];
const ALL_TEXT_CLASSES = [...TITLE_CLASSES, NODE_CLASS, ...LOWER_CLASSES].sort();

// Findings carried open, by equality: a new one is red and so is a repaired one.

// System A (T-09): a block label is a heading and takes a capital, all other canvas text is lowercase.
const KNOWN_CASING = [
  // Lowercase literals: a DNS subdomain, a projected file name.
  'network-dns-coredns         scheme-box-label   UP    "forward"',
  'network-dns-records         scheme-box-label   UP    "default"',
  'network-dns-records         scheme-box-label   UP    "svc"',
  'storage-projected-volume    scheme-box-label   UP    "token"',
  // An API word used as a heading inside a value.
  'network-dns-records         scheme-chip-text   DOWN  "Headless A: -> .2.7 .3.4 .1.9"',
  // The API enum as the Pod spec spells it.
  'network-dns-pod-policy      scheme-chip-text   DOWN  "Default"',
  // Enum values as the API spells them.
  'storage-csidriver           scheme-chip-text   DOWN  "File"',
  'storage-hostpath            scheme-chip-text   DOWN  "Directory"',
  'storage-recursive-readonly  scheme-chip-text   DOWN  "Disabled"',
  'storage-recursive-readonly  scheme-chip-text   DOWN  "Enabled"',
  // Container names as the Pod spec has them.
  'storage-subpath             scheme-box-label   UP    "proxy"',
  'storage-volume-model        scheme-box-label   UP    "seed"',
  'storage-image-volume        scheme-box-label   UP    "llm:v1"',
  // overlayfs roles, lowercase as in the narration.
  'storage-container-filesystem scheme-box-label  UP    "lowerdir: app layer"',
  'storage-container-filesystem scheme-box-label  UP    "lowerdir: base layer"',
  'storage-container-filesystem scheme-box-label  UP    "merged"',
  'storage-container-filesystem scheme-box-label  UP    "upperdir"',
  // Pod labels as metadata.labels holds them, row for row with the file they become.
  'storage-downward-api-volume scheme-box-label   UP    "rack: r22"',
  'storage-downward-api-volume scheme-box-label   UP    "zone: east"',
  'storage-downward-api-volume scheme-box-label   UP    "zone: west"',
].sort();

const KNOWN_DRIFT = [
  // "pod" here is the DNS subdomain, not the object. The pair is frozen, not the count.
  'pod: "Pod" x27 vs "pod" x1',
].sort();

// T-03 reaches aria-labels. Empty: an entry needs a human ruling first.
const KNOWN_SEMICOLONS = [];

// Built from code points so this file does not contain the characters it bans.
const EM_DASH = String.fromCharCode(0x2014);
const EN_DASH = String.fromCharCode(0x2013);
const DASH_RE = new RegExp(`[${EM_DASH}${EN_DASH}]`);
const DASH_NAME = { [EM_DASH]: 'em-dash', [EN_DASH]: 'en-dash' };
const APOSTROPHE_RE = new RegExp(`['${String.fromCharCode(0x2019)}]`);

// The classifier the report and the verdict share.
const dict = await loadTerms();
const NAMES = new Set([...dict.inline.names, ...Object.keys(dict.hardLower)]);
const API = new Set(dict.inline.apiWords);
const COMPONENTS = dict.inline.components;
const HOMOGRAPHS = new Set((dict.inline.homographs || []).map(s => s.toLowerCase()));

const firstToken = s => s.trim().split(/[\s·:,+|]+/)[0].replace(/[.,;]$/, '');
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
  // Title Case needs a human sentence, so it is reported, not auto-fixed.
  if (want === 'lower' && /^[A-Z][a-z]+ [A-Z][a-z]/.test(s)) return 'MANUAL';
  if (want === 'title' && /[a-z]/.test(c)) return 'UP';
  if (want === 'lower' && /[A-Z]/.test(c)) return 'DOWN';
  return null;
}

const catalogued = await cards();

// The probe is inlineProbe in fixtures/probes.mjs on the walk's static pass: the played path is not
// reproducible and adds only riding labels a static frame also carries.
const snap = readSnapshot();
const ids = snap.ids;

const collected = new Map();
// An apostrophe in narration breaks the module, so T-01 lands here as a card that never built.
const broken = [];

for (const id of ids) {
  const card = snap.cards[id];
  if (card.openError) {
    broken.push(`${id}: the diagram never appeared (${card.openError}). ` +
      `Page said: ${card.errors.slice(0, 2).join(' | ') || 'nothing'}`);
    continue;
  }
  const total = card.steps;
  const meta = card.meta;
  if (!total || !meta) {
    // A null stepMeta means the debug handle is absent, never "no findings".
    broken.push(`${id}: stepCount ${total}, stepMeta ${meta ? 'present' : 'MISSING'}`);
    continue;
  }
  const drawn = new Map();     // `${cls}\t${text}` -> {cls, text}
  const frames = new Map();    // `${kind}@${transform}` -> {kind, labels:Set, texts:Set}
  for (let i = 0; i < total; i++) {
    const shot = card.byVp[VP][i].inline;
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
  collected.set(id, { aria: card.aria, steps: meta, drawn: [...drawn.values()], frames: [...frames.values()] });
}

const prose = [];
for (const [id, rec] of collected) {
  if (rec.aria) prose.push({ id, where: 'aria-label', text: rec.aria });
  for (const s of rec.steps) if (s.narration) prose.push({ id, where: `narration:${s.id || '?'}`, text: s.narration });
}

const wantOf = cls => (TITLE_CLASSES.includes(cls) ? 'title' : LOWER_CLASSES.includes(cls) ? 'lower' : null);
const drawn = [];
for (const [id, rec] of collected) {
  for (const d of rec.drawn) drawn.push({ id, cls: d.cls, text: d.text, want: wantOf(d.cls) });
}
// Everything but the node frame labels (T-12).
const eligible = drawn.filter(d => d.want !== null);

test(`the grid renders the whole catalog (${CARD_TOTAL} cards)`, () => {
  assert.ok(ids.length > 0, `NO CARDS RENDERED at ${snap.base}/scheme/ : posters or grid broken`);
  census('inline grid', ids.length, catalogued.length);
  assert.equal(catalogued.length, CARD_TOTAL,
    `data.js lists ${catalogued.length} cards, the baseline is ${CARD_TOTAL}`);
});

test('every card loaded, built and handed over its step list (T-01, T-02)', () => {
  // T-01: the write hook catches a syntax error on save, this catches the card that renders nothing.
  assert.deepEqual(broken, [], `${broken.length} card(s) did not render:\n  ${broken.join('\n  ')}`);
  census('inline walked', collected.size, CARD_TOTAL);
});

test(`the prose census holds (${NARRATION_FLOOR}+ narration, ${ARIA_TOTAL} aria-label)`, FULL_ONLY, () => {
  const narration = prose.filter(p => p.where.startsWith('narration')).length;
  const aria = prose.filter(p => p.where === 'aria-label').length;
  // A floor: fewer strings means a lost path into the controller.
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
  // A count cannot see a new class, so the set is closed.
  const seen = [...new Set(drawn.map(d => d.cls))].sort();
  assert.deepEqual(seen, ALL_TEXT_CLASSES,
    `the diagram draws text under ${seen.join(', ')}. The rules below classify ${ALL_TEXT_CLASSES.join(', ')}, ` +
    'so anything unlisted is drawn on the canvas and read by nothing.');
});

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
    // An aria-label is a label read aloud, not a sentence, so it may open with hostNetwork.
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
  // An apostrophe that ends a string early can leave valid JS and a wrong sentence, which only a render sees.
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
  // Equality: a stale exception is one nobody re-reads.
  assert.deepEqual(found.sort(), [...KNOWN_SEMICOLONS].sort(),
    'the recorded semicolon findings changed. Add the new one here only after reading it, and drop a repaired one.');
});

test(`T-09 System A over ${CASE_ELIGIBLE_FLOOR}+ drawn strings, with ${KNOWN_CASING.length} carried open`, FULL_ONLY, () => {
  const found = [];
  for (const d of eligible) {
    const v = verdict(d.text, d.want);
    if (v) found.push(`${d.id.padEnd(27)} ${d.cls.padEnd(18)} ${v.padEnd(6)} ${JSON.stringify(d.text)}`.replace(/\s+$/, ''));
  }
  // Normalised so the frozen list can be column-padded.
  const norm = s => s.replace(/\s+/g, ' ').trim();
  assert.deepEqual(found.map(norm).sort(), KNOWN_CASING.map(norm).sort(),
    `System A findings changed.\n  now:\n    ${found.map(norm).sort().join('\n    ')}\n` +
    '  Every entry in the frozen list is a string the source-scraping predecessors could not see, ' +
    'left open on purpose. A NEW one is a defect; a MISSING one means the frozen list needs the ' +
    'repaired line deleted.');
});

test('T-09 no drawn string misspells a component name (NAME)', () => {
  // The half the casing rule cannot see: Api, Kubectl and ControllerManager all open with a capital.
  const bad = [];
  for (const d of eligible) {
    for (const n of componentIssues(d.text)) bad.push(`${d.id} ${d.cls} ${JSON.stringify(d.text)}  ${n.from} -> ${n.to}`);
  }
  assert.deepEqual(bad, [], `${bad.length} component name(s) drawn the wrong way`);
});

// Exact lowercase and "shape" (spaces, dots, hyphens, underscores dropped), keyed by position class:
// "Conntrack" on a block and "conntrack" in a chip is System A working.
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
      // A pure case clash is already reported by the case pass.
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
  // Never a verdict: MemoryPressure False and cordon false are different things.
  const rows = driftRows(eligible).filter(r => r.want === 'lower').map(rowText).sort();
  t.diagnostic(`T-14 ambiguous value pairs: ${rows.length}`);
  for (const r of rows) t.diagnostic('  ' + r);
  assert.ok(eligible.length >= CASE_ELIGIBLE_FLOOR, 'the reporting walk must still see the whole canvas');
});

// T-18: the arithmetic a reader does across one diagram.

const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
// Cluster IPs and gateways are shared by construction, so only Pod-range addresses are compared.
const POD_RANGE = /^10\.244\./;
// A Pod and its eth0 box share an address by definition, so only frames labelled as Pods compare.
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

// SOFT terms, reporting only (the other half of ../unit/text.test.mjs).

// A one-card walk matches no soft term and would read as a matcher collapse.
test('SOFT ambiguous terms across narration and aria-label, minority form listed (reporting)', FULL_ONLY, (t) => {
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
  assert.ok(forms.size > 0, 'no soft term matched anywhere in the prose strings: the matcher collapsed');
});
