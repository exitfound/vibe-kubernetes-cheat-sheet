// Colour gate (C-01 to C-03): each (category, class, role, state, property) tuple resolves to one
// colour catalog-wide, every data-role is real and resolves to a paint. Samples the opening frame
// only, so mid-story colours (packets, ripples) and a wrong-but-consistent role go unseen.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census, FULL_ONLY } from '../fixtures/catalog.mjs';
import { readSnapshot } from '../fixtures/snapshot.mjs';
import { ROLES, classify } from '../fixtures/palette.mjs';

// The judgement is shared in ../fixtures/palette.mjs. Only this walk's bookkeeping lives here.
function foldRows(id, rows, { spread, unknown, unpainted }) {
  let seen = 0;
  for (const r of rows) {
    seen++;
    const v = classify(id, r);
    if (v.verdict === 'unknown') { unknown.push(`${id}  ${r.cls} role="${r.role}"`); continue; }
    if (v.verdict === 'unpainted') {
      unpainted.push(`${id}  ${r.cls}[data-role="${r.role}"] ${r.paintProp}=${v.colour}`);
      continue;
    }
    if (!spread.has(v.key)) spread.set(v.key, new Map());
    const byColour = spread.get(v.key);
    if (!byColour.has(v.colour)) byColour.set(v.colour, []);
    const cards = byColour.get(v.colour);
    if (!cards.includes(id)) cards.push(id);
  }
  return seen;
}

function describeSpread(spread) {
  return [...spread.entries()]
    .filter(([, byColour]) => byColour.size > 1)
    .map(([key, byColour]) => {
      const lines = [...byColour.entries()].map(([colour, ids]) =>
        `      ${colour.padEnd(22)} ${ids.length} card(s): ${ids.slice(0, 4).join(', ')}${ids.length > 4 ? ' ...' : ''}`);
      return `  ${key}\n${lines.join('\n')}`;
    });
}

// Coverage floors: zero findings over a collapsed walk still exits 0. When one moves, read the
// catalog diff first, then update the number.
const EXPECTED_PAINTED = 2820;
// A `workloads|scheme-arrow|workloads|` row appearing means a lane lost its role and fell to the dim token.
const EXPECTED_COMBINATIONS = 28;

const catalogued = await cards();

// Read from the walk's reduced-motion pass, so a mid-flight pulse cannot become a colour finding.
const snap = readSnapshot();
const ids = snap.ids;

const spread = new Map();
const unknown = [];
const unpainted = [];
let seen = 0;
let walked = 0;

// Grid count against data.js: a palette walk over a subset is green by construction.
test(`the grid renders the whole catalog (${catalogued.length} cards)`, () => {
  assert.ok(ids.length > 0, `NO CARDS RENDERED at ${snap.base}/scheme/ : posters or grid broken`);
  census('palette grid', ids.length, catalogued.length);
});

for (const id of ids) {
  test(id, async () => {
    walked++;                       // counted before the assertions, so a broken card is reported once, as itself
    const card = snap.cards[id];
    const rows = card.paint && card.paint.open;
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

test(`${EXPECTED_PAINTED} painted elements carry a role`, FULL_ONLY, () => {
  assert.equal(seen, EXPECTED_PAINTED,
    `painted-element census moved: ${seen} now, ${EXPECTED_PAINTED} at the last green run.\n` +
    '  Zero findings over a shrunken set is not a pass. Read the catalog diff before touching this number.');
});

test(`${EXPECTED_COMBINATIONS} category+class+role+state combinations`, FULL_ONLY, () => {
  assert.equal(spread.size, EXPECTED_COMBINATIONS,
    `combination census moved: ${spread.size} now, ${EXPECTED_COMBINATIONS} at the last green run.\n` +
    `  Combinations present:\n    ${[...spread.keys()].sort().join('\n    ')}`);
});
