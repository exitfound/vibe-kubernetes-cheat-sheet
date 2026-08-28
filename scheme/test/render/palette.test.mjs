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
import { cards, census, floor, SUBSET, FULL_ONLY } from '../fixtures/catalog.mjs';
import { DEFAULT_BASE, launch, initPage, discoverIds, openCard } from '../fixtures/render.mjs';
import { PAINTED, ROLES, classify, probePaint } from '../fixtures/palette.mjs';

// Fold one card's rows into the shared tuple map. The JUDGEMENT is ../fixtures/palette.mjs, shared
// with report/palette-steps.test.mjs, which cannot import this file: importing a test file registers
// its tests. What stays here is this walk's bookkeeping, cards per colour.
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

// Every tuple holding more than one colour, formatted the way the original printed it.
function describeSpread(spread) {
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
// 1897: cluster-scheduler-decision draws the Kubelet that picks the Pod up (+1) and the two lanes
// the placement write travels to reach it (+2). Before them the Pod materialised on the Node with
// nothing arriving, which no rule in this suite can see.
// 1896: cluster-pod-priority-preemption went from two lanes to one (-1). The two coincided over 664
// of their units and both ended on one Pod, so the second was drawing the first a second time.
// 1895: the same card dropped its top-row ANSWER lane (-1). No step names anything returning from
// the API, so the relation drew a direction the card never uses. It now runs one lane on TOP_CY.
// 1911: cluster-pod-disruption-budget joins the catalog (+16): two top lanes, one drop, three
// wire labels, four chips, the ledger box, two standing captions and three Pods.
// 1929: cluster-taints-tolerations joins the catalog (+18): one top lane, one elbow and one drop,
// six chips, three blocks plus the three inner app boxes, and three Pods. Wire labels carry no role.
// 1948: cluster-rbac joined the catalog (+19): seven chips, seven blocks, the two request lanes and
// the three roleRef relations. Recorded here after the fact, because that pass moved the constant
// and wrote no line for it.
// 1929: cluster-rbac leaves the catalog again (-19), the same nineteen. The card is the anchor of
// the planned security category and was never published from this one.
// 1966: the two Node Runtime cards join the catalog (+37). cluster-pod-cgroup-hierarchy +20: nine
// blocks (the five tiers, its three children and the top row), three chips, six lanes and the
// two parentage relations. cluster-pod-resize +17: five blocks, four chips, two top arrows, two
// lanes, the two branch relations and the Pod with its inner box. The Node frame and the wire
// labels carry no role.
// 1987: cluster-image-container-gc joins the catalog (+21): six chips, five blocks (the two
// actors and three of the dead-container slots that are not the two collected ends), the Node
// frame, four standing tags, three lanes and the two naked ruler rects. The move of
// cluster-pod-resize to workloads changed the category on its 17, not the count.
// 2030: cluster-node-registration and cluster-node-restart join the catalog (+43 between them).
// The split per card is NOT recorded, because the assertion is FULL_ONLY and a SCHEME_IDS run
// skips it, so no per-card figure was measured and inventing one would be worse than this line.
// 2046: cluster-node-eviction-rate joins the catalog (+16): five blocks (the controller and the
// four Node slots), four chips, two lanes and the five chain rows. The two zone frames and the
// three wire labels carry no role.
// 2062: cluster-node-conditions joins the catalog (+16): six chips, two taint blocks, two lanes
// and three Pods with their inner boxes. The Node frame and the two wire labels carry no role.
// 2046: cluster-pod-disruption-budget LEAVES the catalog (-16), giving back exactly what the
// 1911 line above records it brought: two top lanes, one drop, three wire labels, four chips, the
// ledger box, two standing captions and three Pods.
// 2047: cluster-node-conditions trades its two taint boxes for one actor box and gains a fourth
// Pod (+1), a Pod being a shell plus its inner box where a box is one painted element.
const EXPECTED_PAINTED = 2047;
const EXPECTED_COMBINATIONS = 29;

const catalogued = await cards();

const browser = await launch();
// Registered on the line after the launch, before the page setup below: node:test runs an
// `after` hook whatever happens to the tests, but a throw in the setup itself (a context, an
// init script, a grid that never renders) happens BEFORE the hook exists, and that browser is
// then nobody's to close for the rest of the run.
after(() => browser.close());

// reducedMotion: a pulse mid-flight repaints the stroke, and sampling one would turn a motion
// magnitude into a colour finding.
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, reducedMotion: 'reduce' });
const page = await context.newPage();
await page.addInitScript(initPage, 'expose');
const ids = await discoverIds(page, DEFAULT_BASE);

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
