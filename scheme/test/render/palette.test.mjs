// palette.test.mjs: the colour half of the gate, successor of tools/check-palette.mjs.
// One tuple (category, element class, role, state, paint property) must resolve to exactly ONE
// colour across the whole catalog (C-03), every data-role must be one of the four real ones, and a
// role that is set must actually resolve to a paint (C-01, C-02).
//
// Baseline-free by construction: it compares cards against each other, never against a recorded
// file. Runs under reducedMotion so a filled pulse does not read back as a resting stroke, which is
// the same reason the original set reducedMotion on its context.
//
// WHAT IT DOES NOT SEE, twice over:
//   1. A role that was the wrong one to ask for. Colour is a function of the role, so a kubelet box
//      relabelled from cluster to storage simply paints storage and stays self-consistent. C-03
//      says this in as many words. Only the arrow classes and inline strokes can put two colours
//      under one tuple, and those are what SPREAD really guards.
//   2. Any colour that appears in the MIDDLE of a card's story. This test samples the card as it
//      opens and nothing else, exactly as the original did (it contained no gotoStep and no
//      enterStep at all). Packets and ripples live only on the played path, so they are absent from
//      this sampling entirely. The step walk is measured in ../report/palette-steps.test.mjs and is
//      deliberately report-level until its findings have been triaged.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census } from '../fixtures/catalog.mjs';
import { DEFAULT_BASE, launch, setInspect, discoverIds, openCard } from '../fixtures/render.mjs';

// The four real palette slots. `role` is a palette slot and NOT the card's category (C-01): a
// workloads card writes role 'cluster' on its kubelet box on purpose.
export const ROLES = ['cluster', 'workloads', 'network', 'storage'];

// Element class -> the descendant that actually carries the paint (null = the element itself).
// `.scheme-arrow` was added to the original list on 2026-07-29 as a regression guard: arrows were
// absent from it entirely, which is why `dim: true` painting like a live lane on 315 calls was
// invisible to every check.
export const PAINTED = [
  ['.scheme-pod', '.scheme-pod-rect'],
  ['.scheme-box', '.scheme-box-rect'],
  ['.scheme-chip', '.scheme-chip-rect'],
  ['.scheme-cylinder', '.scheme-cylinder-body'],
  ['.scheme-packet', null],
  ['.scheme-ripple', null],
  ['.scheme-arrow', null],
];

// Runs IN THE PAGE. Every painted element carrying a data-role, with the colour it resolves to.
// No free variables: it is serialised across the CDP boundary, so it can close over nothing.
export function probePaint(painted) {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;
  const out = [];
  for (const [sel, childSel] of painted) {
    for (const el of svg.querySelectorAll(`${sel}[data-role]`)) {
      const paint = childSel ? el.querySelector(childSel) : el;
      if (!paint) continue;
      const cs = getComputedStyle(paint);
      // State matters. `.highlight` repaints to the bright stop, so a lit chip and a resting one
      // legitimately differ, and `scheme-arrow-dim` is a weight rather than a variant: a dim lane
      // and a live one of the same role are MEANT to differ. Without both in the key the check
      // would report its own blindness as a card defect.
      const state = ['highlight', 'scheme-arrow-dim']
        .filter(c => el.classList.contains(c)).join('+') || 'rest';
      out.push({
        cls: sel.slice(1),
        role: el.getAttribute('data-role'),
        state,
        stroke: cs.stroke,
        fill: cs.fill,
        // A packet paints with fill, everything else with stroke.
        paintProp: sel === '.scheme-packet' ? 'fill' : 'stroke',
      });
    }
  }
  return out;
}

export const UNPAINTED_RE = /^rgba\(\s*0,\s*0,\s*0,\s*0\s*\)$/;

// Fold one card's rows into the shared tuple map. Exported so the report test walks steps with the
// same accounting rather than a second private copy of it.
export function foldRows(id, rows, { spread, unknown, unpainted }) {
  const category = id.split('-')[0];
  let seen = 0;
  for (const r of rows) {
    seen++;
    if (!ROLES.includes(r.role)) { unknown.push(`${id}  ${r.cls} role="${r.role}"`); continue; }
    const colour = r.paintProp === 'fill' ? r.fill : r.stroke;
    if (!colour || colour === 'none' || UNPAINTED_RE.test(colour)) {
      unpainted.push(`${id}  ${r.cls}[data-role="${r.role}"] ${r.paintProp}=${colour}`);
      continue;
    }
    const key = `${category}|${r.cls}|${r.role}|${r.state}|${r.paintProp}`;
    if (!spread.has(key)) spread.set(key, new Map());
    const byColour = spread.get(key);
    if (!byColour.has(colour)) byColour.set(colour, []);
    const cards = byColour.get(colour);
    if (!cards.includes(id)) cards.push(id);
  }
  return seen;
}

// Every tuple holding more than one colour, formatted the way the original printed it.
export function describeSpread(spread) {
  return [...spread.entries()]
    .filter(([, byColour]) => byColour.size > 1)
    .map(([key, byColour]) => {
      const lines = [...byColour.entries()].map(([colour, ids]) =>
        `      ${colour.padEnd(22)} ${ids.length} card(s): ${ids.slice(0, 4).join(', ')}${ids.length > 4 ? ' ...' : ''}`);
      return `  ${key}\n${lines.join('\n')}`;
    });
}

// ---------------------------------------------------------------------------------------------

// The numbers a green run produces on the current catalog. They are the acceptance criterion, not
// decoration: a check whose coverage silently collapses still reports zero findings and exits 0.
// Either number moving means the CATALOG moved (a card added, an element added or a role changed),
// and the right response is to look at the diff and then update the constant, never the reverse.
// 1897 since 2026-08-11: network-dns-records gave the category role to its four answer lanes, which
// carry a ball exactly like the two client lanes that already had it (+4), and network-headless-service
// took it off the three endpoint fans, which carry nothing, per the rule the card states itself (-3).
const EXPECTED_PAINTED = 1897;
const EXPECTED_COMBINATIONS = 29;

const catalogued = await cards();

const browser = await launch();
// reducedMotion: a pulse mid-flight repaints the stroke, and sampling one would turn a motion
// magnitude into a colour finding.
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, reducedMotion: 'reduce' });
const page = await context.newPage();
await page.addInitScript(setInspect, 'expose');
const ids = await discoverIds(page, DEFAULT_BASE);

after(() => browser.close());

const spread = new Map();
const unknown = [];
const unpainted = [];
let seen = 0;
let walked = 0;

// Two independent answers to "how many cards are there": the rendered grid and data.js. A palette
// walk over a subset is green by construction, so this has to be the first thing that runs.
test(`the grid renders the whole catalog (${catalogued.length} cards)`, () => {
  assert.ok(ids.length > 0, `NO CARDS RENDERED at ${DEFAULT_BASE}/scheme/ : posters or grid broken`);
  census('palette grid', ids.length, catalogued.length);
});

for (const id of ids) {
  test(id, async () => {
    walked++;                       // counted before the assertions, so this stays a census of
                                    // COVERAGE and a broken card is reported once, as itself.
    await openCard(page, id);
    const rows = await page.evaluate(probePaint, PAINTED);
    assert.ok(rows, 'no svg.diagram: the dialog never opened');

    const unknownBefore = unknown.length;
    const unpaintedBefore = unpainted.length;
    seen += foldRows(id, rows, { spread, unknown, unpainted });

    const mine = unknown.slice(unknownBefore);
    assert.equal(mine.length, 0,
      `UNKNOWN role (not one of ${ROLES.join('/')}): ${mine.length}\n  ${mine.join('\n  ')}`);

    const blank = unpainted.slice(unpaintedBefore);
    assert.equal(blank.length, 0,
      `UNPAINTED (a role is set but nothing resolved a colour): ${blank.length}\n  ${blank.join('\n  ')}`);
  });
}

test('every catalogued card was sampled', () => {
  census('palette walked', walked, catalogued.length);
});

test('SPREAD: one category+class+role+state resolves to one colour', () => {
  const bad = describeSpread(spread);
  assert.equal(bad.length, 0,
    `SPREAD (one category+class+role+state resolving to more than one colour): ${bad.length}\n${bad.join('\n')}`);
});

test(`${EXPECTED_PAINTED} painted elements carry a role`, () => {
  assert.equal(seen, EXPECTED_PAINTED,
    `painted-element census moved: ${seen} now, ${EXPECTED_PAINTED} at the last green run.\n` +
    '  Zero findings over a shrunken set is not a pass. Read the catalog diff before touching this number.');
});

test(`${EXPECTED_COMBINATIONS} category+class+role+state combinations`, () => {
  assert.equal(spread.size, EXPECTED_COMBINATIONS,
    `combination census moved: ${spread.size} now, ${EXPECTED_COMBINATIONS} at the last green run.\n` +
    `  Combinations present:\n    ${[...spread.keys()].sort().join('\n    ')}`);
});
