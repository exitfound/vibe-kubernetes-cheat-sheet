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

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census, FULL_ONLY } from '../fixtures/catalog.mjs';
import { readSnapshot } from '../fixtures/snapshot.mjs';
import { ROLES, classify } from '../fixtures/palette.mjs';

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
// 2064: workloads-pod-startup-conditions joins the catalog (+17): two actor boxes, four chips,
// the five chain rows, two corridor lanes and two top-row arrows, and one Pod as a shell plus
// its inner box. The Node frame and the wire label carry no role.
// 2063: workloads-pod-qos-classes drops the arrowless Kubelet -> API relation (-1). No step of it
// named traffic that way, and the write it stood for is the Scheduler's, which the card never draws.
// 2113: re-read over 121 cards where 2063 was read over 117, so the move is not one card's.
// workloads-pod-scheduling-gates contributes 13 of it, counted off its own scene: four boxes,
// four chips, four lanes and one Pod, which is a bare shell here and therefore one element and
// not two. The Node frame it does not draw and its one wire label carry no role.
// 2114: workloads-effective-pod-requests adds one arrowless relation joining its Scheduler and its
// Kubelet, which read one number and exchange nothing, so it is a relationship and not a lane.
// It is the only painted element that card gained.
// 2140: workloads-ephemeral-containers contributes twenty one, counted off its own scene: kubectl
// and three door boxes, eight chips, a trunk, a bus, three taps and the spine, and a Pod carrying
// two inner container boxes inside its shell, which is three painted elements. The namespace
// region inside the Pod is a naked rect with no role and no painted class, so it is not walked.
// 2145: workloads-termination-order adds fifteen: two actor boxes, four chips, two top-row arrows,
// one corridor lane, and a Pod whose shell carries five container boxes, which is six. Its gate is
// a raw dashed rule and a caption, and its two zone captions are raw text: P.raw carries no role
// by construction, so probePaint walks none of the three.
// 2147: workloads-pod-lifecycle-phases is rebuilt as a state machine and trades its ladder and its
// one corridor (14) for sixteen: four state boxes, the CrashLoopBackOff box inside Running, the
// Kubelet box, three chips, three lanes, two relations, and a Pod as a shell plus its inner box.
// 2135: workloads-crashloopbackoff is rebuilt as an instrument and loses twelve: its six chain rows
// and its six rung chips, all roled. The nine bars, the axis and the ceiling that replace them are
// naked rects with no role and no painted class, which probePaint never walks. The two lanes, four
// chips, Kubelet box and Pod pair it keeps count the same nine either way.
// 2143: workloads-pod-scheduling-gates gains the Controller that owns its gates (+3): one actor box
// and the top-row request and answer arrows between it and the API. Its four chips, four lanes,
// two gates, Scheduler, API and bare Pod count the same thirteen they did at 2113.
// 2145: workloads-pod-pending-init-states trades the one inner box of its Pod for three peer
// container boxes appended through `tune` (+2): the two init containers the STATUS counter counts
// and the app they gate. Everything else on it counts as it did.
// 2148: workloads-probes is rebuilt as three parallel probe lanes and nets +3. It LOSES its five
// chain rows and one chip (-6) and GAINS the EndpointSlice actor box, two probe lanes, the spine
// pair every single-ball step rides, the top-row lane to the EndpointSlice, and FOUR relations
// (+9). The relations are drawn only where something is true and nothing moves: three probes on
// the poster frame, and the Kubelet-to-slice relationship on the step where the endpoint changes
// with no ball. A version carrying five was cut back, because a relation drawn beside an arrowhead
// reads as two things happening where one is. Its Kubelet box, four remaining chips and
// Pod-plus-inner-box count the same six either way, and the Node frame and the wire label carry
// no role.
// 2140: the workloads-poststart-prestop-hooks redesign traded a six-row chain, a Node frame and
// two chips for a raw rail whose bars and ticks carry no role, so eight painted elements left the
// catalog with it.
// 2137: the workloads-graceful-shutdown redesign nets -3. It LOSES two actor boxes, a six-row
// chain, five chips, two top-row arrows and two corridor lanes (-17) and GAINS the API box, the
// ETCD cylinder, the controller and kube-proxy boxes, the Kubelet inside the frame, two chips, the
// store lane, the link and the traffic arrows, the in-frame signal arrow, and the two fork lanes
// plus the report lane (+14). Its Pod-plus-inner-box counts the same two either way.
// 2133: the workloads-force-deletion redesign nets -4. It LOSES a five-row chain, the two top-row
// arrows and one of the two corridor lanes (-8) and GAINS the record slot box, the stored object
// box, the top-row lane and the acknowledgement relation (+4). The break mark is a raw <path> with
// no role, so it is not painted for this census, and the two Node frames and two Pods are unmoved.
// 2134: +1, the kubectl to API arrow on workloads-force-deletion. The 2133 line above credits that
// card with a top-row lane it never actually drew: both write steps ran an F.top over blank canvas,
// which is the A-01 defect. The arrow now declares the same CALL endpoints the hop takes (A-02).
// 2157: +23, the whole of workloads-pod-garbage-collection. Two actor boxes, four Pod shells, four
// rule rows, two chips, the top-row lane pair, the trunk, four bus segments and four taps.
// 2161: +4, the state block inside each of that card's four Pods. It is buildPod's own `inner`, so
// each is a painted scheme-box carrying the Pod's role, and the four Pod shells are unmoved.
// 2136: -25, the whole of workloads-pvc-stickiness, deleted from the catalog: two actor boxes, the
// PV cylinder, four chips, a five-row chain, two Pods with their inner state boxes, the top-row
// arrow pair, the trunk and its two bus segments, the two Node connectors, the PV mount relation
// and the PV lane. Its two Node frames and its wire label carry no role and were never counted.
// 2155: +19, the whole of workloads-controller-kinds. Six kind boxes, four Pod shells, three chips
// and six lanes. Its two standing captions are text and carry no role, so neither is counted.
// 2173: +18, the whole of workloads-finished-job-cleanup. Three boxes (API, controller, Job pi),
// two Pod shells with their inner app boxes, six chips, the top-row arrow pair and the three
// corridor lanes. Its Node frame and its wire label carry no role, so neither is counted.
// 2184: +11, the whole of workloads-deployment-strategy as it stood then: six boxes, two lanes and
// three chips.
// 2196: +9, the workloads-deployment-strategy redesign, measured at 20 painted against the 11 the
// line above credits it with. It LOSES the two run boxes and the three window cells (-5) and GAINS
// four Pods (+8, a shell and an `inner` apiece: two per strategy track), the four order tiles (+4)
// and two lanes, the trunk SPLIT at the first tap standing beside the two taps where the old card
// drew two lanes flat (+2), against the Deployment box and the three chips, which are unmoved. Its
// void mark is a naked rect plus a caption in a role-less group, and its two standing tags and two
// wire labels are text, so none of those is counted.
// 2188: +4, the held-value block inside each of the four Pods of workloads-controller-kinds. It is
// buildPod's own `inner`, so each is a painted scheme-box carrying the Pod's role, and the four Pod
// shells above are unmoved.
// 2187: -1, the workloads-replicaset redesign. Its six-row chain went (-6, one painted row each,
// which is what the arithmetic here pins down) and so did a fourth chip (-1), against three added
// Pods (+6, a shell and an `inner` apiece: the replacement and the two that cross the unowned
// band). Its two band regions, the count mark and the mark caption are role-less, so none counts.
// 2185: -11 over the three Deployment cards rebuilt together, measured card by card against what
// the lines above credit each with. workloads-rolling-update nets -7, 28 to 21: it LOSES its
// six-row chain (-6), all four value chips (-4, its captions are `P.wire` now and a wire carries no
// role) and one lane (-1), and GAINS two Pods (+2) and the two inner boxes that come with them
// (+2). workloads-deployment-rollback nets -4, 23 to 19: it LOSES four Pod shells and their four
// inner boxes (-8), its six-row chain (-6) and one of its two actor boxes (-1, only the Deployment
// survives), and GAINS the four ReplicaSet boxes of the shelf and the four templates hung under
// them (+8) plus three lanes (+3, the trunk and bus stay and four taps stand where one lane did).
// Its four value chips are unmoved, and its two shelf tags, its two wire labels and the four
// `P.group` wrappers round the slots carry no role, so none of those is counted.
// workloads-deployment-strategy is UNMOVED at the 20 the line above measured it at, so the three
// deltas sum to the whole of the -11 and nothing else in the catalog moved.
// 2189: +4, the workloads-rolling-update relaid actor row and its two compressed cycles, 21 to 25.
// Its bus is SPLIT at every addressed slot centre rather than once at the trunk, four segments
// where two stood (+2), and two more drops reach the RS-v2 slots those cycles fill (+2). The trunk
// stops being a `relation` and becomes a `lane` with the marker dropped, which changes what it
// PAINTS and not whether it is counted. Its six Pods and their six inner boxes, its two actor
// boxes and its two actor arrows are unmoved, and its four wire captions and its standing tag
// carry no role, so none of those is counted.
// 2195: +6, the workloads-rolling-update owner regions and dials, 25 to 31. The bus is split at
// every slot centre rather than at the addressed ones, six segments where four stood (+2), every
// slot now takes a ball so all six drops are drawn (+2), and the standing law tag becomes two
// dial chips (+2, a tag carries no role and a chip does). The two regions are naked dashed rects
// with no role, like the bands of `workloads-replicaset`, so neither is counted.
// 2200: +5, the workloads-deployment-strategy respine, 20 to 25. Each track now plays BOTH of its
// orders, so the trunk forks into a second bus on the right: four bus segments where two stood
// (+2, the trunk itself is unmoved) and four taps where two stood (+2), one per order tile, plus
// the trunk split at the jog rather than at the first tap (+1). Its void mark shrinks to one Pod
// slot and stays role-less, and its two wire captions and two standing tags carry no role.
// 2182: -18 over the three workloads/controllers redesigns run together, which now hold 57 painted
// elements between them: statefulset-ordered-rollout 27 (three Pods, five boxes, three chips,
// three cylinders and thirteen arrows), daemonset 20 (four Pods, six boxes, four chips and six
// arrows), job-parallelism 10 (three Pods, four boxes and three arrows). All three drop the chain
// they carried, and job-parallelism is the bulk of the move on its own: rebuilt as an instrument
// panel, it trades five chips, a Node frame and a chain for nine `P.raw` meters, which carry no
// role by construction and so are never walked, the same trade the 2135 crashloopbackoff line
// above records. The per-card BEFORE split is NOT recorded. The assertion is FULL_ONLY, so the
// filtered run each card took skips it and no per-card figure was measured before the rebuild,
// and inventing one would be worse than this line. What IS measured is the whole move: the run
// opened with this census green at 2200 over the same otherwise-unchanged tree, so all eighteen
// belong to these three cards and to nothing else.
// 2187: +5 over the workloads-deployment-rollback redesign, and the arithmetic is the whole move.
// It loses four template sub-boxes and two value chips (-6) and gains four register cells and
// seven connectors (+11). Every connector is a `P.relation` written with `role: 'cluster'` like the
// lanes beside it: the kit binding would have filled `workloads`, which has no
// `.scheme-arrow-workloads` rule, and the combination census above is what caught the first build
// painting all seven at the generic dim token instead of the category blue.
// 2172: -15, the workloads-cronjob redesign from an actor strip over a Node floor to a timeline,
// 31 to 16, and every one of the fifteen is a chip or a box this card stopped drawing. It LOSES the
// six-row pipeline chain (-6, one painted row each, the same shape the replicaset line above pins
// down), the six tick chips of the left band under the panel (-6) and two of its five value chips
// (-2, three survive), and its second actor box (-1, only the CronJob survives). Its four Job Pod
// shells, the four `inner` boxes inside them and its four lanes are unmoved. What REPLACES the
// fourteen chips is `P.raw`: the time axis with its seven graduations, the seven slot cells and the
// four verdict marks all carry no role by construction, so none of them is walked, which is the
// same trade the 2182 job-parallelism line above records. Attributed by rebuilding the tree as it
// stood before the redesign (git archive HEAD plus the working copy taken at the start of the run),
// serving it on a second port and walking it: that tree reads 2187 exactly, and `workloads-cronjob`
// is the ONLY id whose count differs between the two walks. Three sibling modules were written by
// another session during the same window and none of them moved this census.
// 2173: +1, the single ascending lane `read` added to `workloads-deployment-rollback` to close the
// dead-air finding on its `undo` step, which stood 100 percent still for all 3200ms. The card goes
// 24 to 25 painted elements and nothing else about it moves: one `P.lane` carrying the same
// `role: 'cluster'` as the six lanes beside it, drawn on `undo` alone. Attributed by counting THIS
// card before and after inside the same run, 24 then 25, while the whole-tree walk moved 2172 to
// 2173, so the delta is one lane on one card and nothing else in the tree.
// 2179: +6, the second wave of workers on `workloads-job-parallelism`, 10 to 16. A Pod that has
// succeeded is never restarted or reused, which that card narrates, so the three replacements
// `refill` creates are their own elements stacked in the same three slots rather than the first
// three relabelled back to Running: three Pod shells and the three `inner` boxes inside them, the
// same grammar and the same arithmetic as the `repl` Pod of `workloads-replicaset`. Nothing else on
// the card moves: the three slots, the three lanes, the nine role-less `P.raw` meters and the Job
// box are unmoved, and only three of the six Pods are ever visible at once. Attributed by walking
// this card alone before and after the change, 10 then 16, while the assertion below is FULL_ONLY.
// 2228: +49 over two new Controllers cards, attributed by walking each one alone in the same run.
// `workloads-statefulset-update-strategy` is 20: 2 Pod shells and their 2 inner boxes, the API and
// the controller box, 3 value chips PLUS the 4 rows of its `P.chain` (a chain row is a
// `scheme-chip` carrying the kit role, which is why a four-row worklist costs four painted
// elements and not one), and 7 arrows, the actor-row pair, the partition relation, the trunk, the
// bus and 2 taps. `workloads-pod-replacement-guarantees` is 29: 5 Pod shells and their 5 inner
// boxes, 5 owner boxes and the API, and 13 arrows, the trunk, both bus halves, 5 taps, 4 ownership
// lanes and the CronJob relation. It carries NO value chip at all, which is why 29 painted elements
// buy an eleven-block board. Nothing else in the tree moves: 2179 + 20 + 29 = 2228.
const EXPECTED_PAINTED = 2228;
// 29: no card draws a `workloads|scheme-arrow|workloads|` combination, because every lane in that
// category carries `role: 'cluster'`. A role-less lane does not paint the category blue: there is
// no `.scheme-arrow-workloads` rule in diagrams.css, so it falls to the generic dim token at
// rgb(63, 93, 138) against the rgb(91, 184, 255) of the lanes beside it. A `workloads|scheme-arrow|
// workloads|` row APPEARING in the printed list means a lane somewhere lost its role and is now the
// faintest thing on its own card, which is what to read before moving the number below.
// This walk samples each card AS IT OPENS, so it sees the POSTER frame and nothing else, and a
// `scheme-box|<role>|highlight` row therefore means a poster step that lights a block. 120 of the
// 123 poster steps light nothing (S-09), which is why no workloads box contributes one:
// workloads-pod-lifecycle-phases held the only such row in this category and gave it up when its
// poster stopped highlighting `pending`. A `workloads|scheme-box|cluster|highlight` row coming back
// is a poster that draws a cue, not a colour fault.
// 30: `workloads|scheme-cylinder|cluster|rest` is ETCD on workloads-graceful-shutdown, the one
// cylinder a workloads card paints in the control-plane violet. A second card drawing a store
// keeps the count where it stands.
// 27: -3, workloads-pvc-stickiness was deleted and took every `workloads|<class>|storage|` row with
// it. Its three jade chips, its PV cylinder and its two storage lanes were the only jade a
// workloads card drew, so the whole storage half of that category's CROSS_ROLE went with the card.
const EXPECTED_COMBINATIONS = 27;

const catalogued = await cards();

// THE BROWSER IS NOT DRIVEN HERE ANY MORE. `tools/walk.mjs` takes this reading in its
// reduced-motion pass, in a context of its own because `reducedMotion` is a CONTEXT option and this
// file and report/palette-steps are the only two that want it. The reason is this file's own: a
// pulse mid-flight repaints the stroke, and sampling one would turn a motion magnitude into a
// colour finding. Same viewport, same probe (fixtures/palette.mjs probePaint), same frame: the one
// this file read straight after openCard, which the walk stores as `paint.open`.
const snap = readSnapshot();
const ids = snap.ids;

const spread = new Map();
const unknown = [];
const unpainted = [];
let seen = 0;
let walked = 0;

// Two independent answers to "how many cards are there": the rendered grid and data.js. A palette
// walk over a subset is green by construction, so this has to be the first thing that runs.
test(`the grid renders the whole catalog (${catalogued.length} cards)`, () => {
  assert.ok(ids.length > 0, `NO CARDS RENDERED at ${snap.base}/scheme/ : posters or grid broken`);
  census('palette grid', ids.length, catalogued.length);
});

for (const id of ids) {
  test(id, async () => {
    walked++;                       // counted before the assertions, so this stays a census of
                                    // COVERAGE and a broken card is reported once, as itself.
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
