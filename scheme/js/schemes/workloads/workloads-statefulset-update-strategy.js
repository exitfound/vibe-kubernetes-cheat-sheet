import { P, F, defineCard, laneY, midX, strip, routeDur, WL, FADE, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-statefulset-update-strategy.md

// A WORKLIST on the right and an UPDATE WINDOW on the left. The four ordinals are chain rows rather
// than columns, because nothing here is owned per ordinal: what the card tracks is which ordinals
// carry the update revision and how far down the walk is allowed to go. The two Pod slots are the
// window, and how many of them hold a Pod is maxUnavailable.
// Panel measured at x<=396.55 and y<=229.82, both at 1100x800 (worst of 1600/1280/1100).
const PANEL_B = 230, PANEL_GAP = 21;
const BAND_Y = PANEL_B + PANEL_GAP;                      // 251, the first line under the panel

// The actor row, the same PAIR `workloads-statefulset-ordered-rollout` draws: 232 wide, the left
// box centred on WL.CX so the trunk leaves a face midpoint (WL.L-07), the right box on WL.R.
const TOP1_W = 232, TOP1_X = WL.CX - TOP1_W / 2;         // 484..716, centred on CX for the trunk
const TOP2_W = 232, TOP2_X = WL.R - TOP2_W;              // 908..1140, right edge on WL.R
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);

const BUS_Y = BAND_Y + 6;                                // 257
const CHAIN_Y = BAND_Y + 45;                             // 296, the top of the worklist

// The worklist: the set in the order the controller walks it, largest ordinal at the top. The rows
// are the house ladder pitch, WL.ROW_H on WL.ROW_GAP, so the four read as ONE list the way every
// other workloads ladder does. The single exception is the gap the partition rule falls in: that
// one is opened to PART_GAP, because the rule has to read as a cut through the list and a 10 unit
// gap with a dashed line in it reads as a row border. Record: SIZES.
const CHAIN_X = WL.COL_R.x, CHAIN_W = WL.COL_R.w;        // 660..1140
const CHAIN_ROW_H = WL.ROW_H, CHAIN_GAP = WL.ROW_GAP;    // 32 / 10
const PART_GAP = 22;                                     // the one wide gap, between web-2 and web-1
const CHAIN_PITCH = CHAIN_ROW_H + CHAIN_GAP;             // 42
const PART_EXTRA = PART_GAP - CHAIN_GAP;                 // 12, what rows 2 and 3 drop by
// `chainList` lays every row on one pitch, so the split is a `tune` that pushes the two rows below
// the rule down by PART_EXTRA rather than a second chain: `chain:` in a step is one index list.
const CHAIN_SPLIT = 2;                                   // the first row BELOW the rule
const chainRowY = i => CHAIN_Y + i * CHAIN_PITCH + (i >= CHAIN_SPLIT ? PART_EXTRA : 0);
                                                         // 296 / 338 / 392 / 434
const CHAIN_BOTTOM = chainRowY(3) + CHAIN_ROW_H;         // 466
const splitRows = (el) => el.querySelectorAll('.scheme-chip').forEach((row, i) => {
  if (i >= CHAIN_SPLIT) row.setAttribute('transform', `translate(0, ${i * CHAIN_PITCH + PART_EXTRA})`);
});

// partition 2 leaves every ordinal BELOW 2 alone, so the rule sits in the gap between the web-2 row
// and the web-1 row. It starts left of the chain so its caption has canvas to stand on, and it
// starts exactly UNDER that caption: the label inks 532.1..607.9 at its widest (1600x1000), so 532
// puts the left end of the rule on the `p` of partition and the line runs nowhere the caption does
// not. Record: SIZES.
const PART_Y = chainRowY(1) + CHAIN_ROW_H + PART_GAP / 2;       // 381
const PART_X0 = 532;
const PART_LABEL_X = 570, PART_LABEL_Y = PART_Y - 12;

// The window: two slots side by side, and how many of them hold a Pod is maxUnavailable. The second
// one stands empty on every update step but one, which is what the default of 1 looks like.
// The pair is CENTRED on the worklist: the two columns are one reading, and a window top-aligned to
// a list of four rows reads as the first two of them. Record: SIZES.
const SLOT_W = 140, SLOT_H = 96, SLOT_GAP = 20;
const SLOT_X = [WL.L, WL.L + SLOT_W + SLOT_GAP];         // 60 / 220
const SLOT_CX = i => SLOT_X[i] + SLOT_W / 2;             // 130 / 290
const SLOT_Y = (CHAIN_Y + CHAIN_BOTTOM) / 2 - SLOT_H / 2;       // 333, centred on the chain
const SLOT_INNER = { dx: 20, dy: 22, w: SLOT_W - 40, h: 52 };
// A Pod carries its name in a label no field can write, so the ordinal in hand is a per-step wire
// UNDER the slot instead, and the Pod itself is left unlabelled. It goes under rather than over
// because a caption on SLOT_Y - 12 at the slot centre lands on the tap that drops into it.
// Record: SIZES.
const NAME_Y = SLOT_Y + SLOT_H + 16;                     // 445
// The standing caption clears both taps: centred on 210 it inks between them, never across one.
const WINDOW_TAG_Y = SLOT_Y - 12;                        // 321

// The partition chip reads 0 and never `not set`: SetDefaults_StatefulSet in
// pkg/apis/apps/v1/defaults.go writes 0 into an empty Partition, so 0 is the value a reader gets
// back off the object. maxUnavailable defaults the same way, to 1. Record: CONTENT.
const CHIP_Y = 556;
const CHIPS = strip({ from: WL.L, to: WL.R, count: 3, gap: 14 });

// The delivery path: trunk down the spine, a bus west to the window, one tap per slot.
// Wires and balls share these points (A-02).
const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y]];
const BUS = [[SLOT_CX(0), BUS_Y], [WL.CX, BUS_Y]];
const TAP = i => [[SLOT_CX(i), BUS_Y], [SLOT_CX(i), SLOT_Y]];
const LANE = i => [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y], [SLOT_CX(i), BUS_Y], [SLOT_CX(i), SLOT_Y]];

// A trunk segment carries the ball but is not its destination, so it is a LANE with the marker
// taken off (A-06, the `workloads-replicaset` form): the arrowhead belongs on the tap that lands on
// a Pod. As a relation it would paint at stroke-opacity 0.45 and the ball would ride a dark line
// into a bright tap, which is the one thing the delivery path must not do.
const trunkPath = (key, points) => P.lane({
  key, points, dim: true, dashed: true, role: 'cluster',
  tune: (el) => el.removeAttribute('marker-end'),
});

// The rows follow the house ladder idiom, `name . clause` with SINGLE spaces around the separator,
// because SVG collapses a run of whitespace and the padded columns a source types never arrive.
// Every clause is true on every step: a row cannot carry state, so nothing here names a field the
// card only sets halfway through.
const ORDINALS = [
  'web-3 · the largest ordinal, where the walk opens',
  'web-2 · goes once web-3 is Running and Ready',
  'web-1 · goes once web-2 is Running and Ready',
  'web-0 · the smallest ordinal, where the walk closes',
];
// A slot is empty until a Pod is in hand. Both are drawn from the first frame at this shade so no
// arrowhead ever points at blank canvas (M-24). It is `terminating` and not `pending`: a slot is
// EMPTIED here rather than waiting to start, and at OPACITY.pending an empty slot sat close enough
// to a full one that the window read as two Pods on every step. Record: SIZES.
const OFF = OPACITY.terminating;

// Z-order: the partition rule and the lanes, then the captions, the worklist and the chips over
// them, then the packet layer, then the Pods and the actor row, which the ball runs under.
export const SCENE = {
  'aria-label': 'StatefulSet update strategy: a template change becomes a new revision, and under RollingUpdate the controller deletes and recreates one Pod at a time from the largest ordinal to the smallest, waiting for each to be Running and Ready, with partition freezing every ordinal below it, maxUnavailable widening the window and OnDelete handing the trigger back to you',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    // The answer lane is ridden where the controller reads a Pod turning Running and Ready off its
    // watch, which is the one thing on this card that travels API to controller, so it is an arrow
    // with a head rather than a relationship (A-06). Every other hop here is a controller WRITE and
    // rides the request lane above it, revision and ondelete included.
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // The partition is a BOUNDARY and nothing rides it, so it is a plain relation with no head
    // (A-05). It is born invisible because the field is unset until the step that sets it.
    P.relation({ key: 'partition', points: [[PART_X0, PART_Y], [WL.R, PART_Y]], role: 'cluster', dash: '4 4', opacity: 0 }),
    trunkPath('trunk', TRUNK),
    trunkPath('bus', BUS),
    ...SLOT_X.map((_, i) => P.lane({ key: `tap${i}`, points: TAP(i), dim: true, dashed: true, role: 'cluster' })),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    P.wire({ key: 'partLabel', x: PART_LABEL_X, y: PART_LABEL_Y }),
    P.wire({ key: 'name0', x: SLOT_CX(0), y: NAME_Y }),
    P.wire({ key: 'name1', x: SLOT_CX(1), y: NAME_Y }),
    // A standing caption, because the two slots are one instrument and the empty one is a reading
    // rather than a gap. It never changes, so it is a tag and not a wire.
    P.tag({ x: midX(SLOT_X[0], SLOT_X[1] + SLOT_W), y: WINDOW_TAG_Y, text: 'unavailable at once' }),
    P.wire({ key: 'progress', x: CHAIN_X + CHAIN_W / 2, y: CHAIN_Y - 12 }),
    // The set in the order the controller walks it. A lit row is an ordinal carrying the update
    // revision, which is a STATE and not a destination, so no lane ever lands here.
    P.chain({ key: 'chain', x: CHAIN_X, y: CHAIN_Y, w: CHAIN_W, rowH: CHAIN_ROW_H, gap: CHAIN_GAP, items: ORDINALS, tune: splitRows }),
    ...[0, 1, 2].map(i => P.chip({ key: `chip${i}`, x: CHIPS.x(i), y: CHIP_Y, w: CHIPS.w, h: WL.CHIP_H, name: ['updateStrategy', 'partition', 'maxUnavailable'][i], value: '' })),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    ...SLOT_X.map((_, i) => P.pod({
      key: `slot${i}`, id: `slot${i}`, innerKey: `slot${i}Box`,
      x: SLOT_X[i], y: SLOT_Y, w: SLOT_W, h: SLOT_H, label: '', sublabel: '', containers: 0,
      opacity: OFF,
      inner: { dx: SLOT_INNER.dx, dy: SLOT_INNER.dy, w: SLOT_INNER.w, h: SLOT_INNER.h, label: 'app' },
    })),
    P.box({ key: 'apiserver', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'ControllerRevisions', role: 'cluster' }),
    P.box({ key: 'controller', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'StatefulSet web', sublabel: 'replicas 4', role: 'cluster' }),
  ],
  reset: {
    keys: ['controller', 'apiserver', 'chip0', 'chip1', 'chip2', 'slot0Box', 'slot1Box'],
    pods: ['slot0', 'slot1'],
  },
};

// One call states BOTH slots, because the pair is one instrument: how many of them hold a Pod is
// the whole reading, and stating them apart is how the two drift. NO LINE IS IN HERE. Every lane is
// at full on every step, exactly like the actor-row arrows: A-13 would pin each tap to a slot that
// is empty on four steps of seven and wash out the delivery path on all of them. Record: LANES.
const window2 = (a, b) => ({ slot0: a, slot1: b });

// The pair on `max-unavailable` is given ONE duration, the longer lane's. At the canon speed the two
// lengths (683 into slot 0, 523 into slot 1) put the arrivals 356ms apart, and two Pods landing a
// third of a second apart draws the one-at-a-time default the field just replaced. The explicit
// `dur` is the justification M-13 asks for at the call site: the shorter ball glides at 0.345 u/ms
// against the canon 0.450, so it is the slower of the two and nothing here moves faster than canon.
// Record: MOTION.
const PAIR_DUR = routeDur(LANE(0));                             // 1518

// An ordinal is replaced the same way every time: the controller asks the API, the replacement
// rides the trunk into a slot, and the worklist row turns over on that arrival.
const replace = (slot, after) => [
  F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: `req${slot}`, after, lights: ['apiserver'] }),
  F.route({ points: LANE(slot), after: `req${slot}`, name: `land${slot}` }),
  F.fade({ target: `slot${slot}`, from: OFF, to: 1, dur: FADE.in, at: `land${slot}`, fill: 'both', easing: 'ease-out' }),
  F.pulse({ pod: `slot${slot}`, at: `land${slot}` }),
];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { chip0: 'RollingUpdate', chip1: '0', chip2: '1' },
    wires: { progress: 'on rev 3: none of 4', partLabel: '', name0: '', name1: '' },
    opacity: { ...window2(OFF, OFF), partition: 0 },
    chain: -1,
  },
  {
    id: 'revision',
    duration: 3400,
    narration: 'Your edit to spec.template reaches the controller off its watch, and it stores that template as a ControllerRevision with the next revision number. Nothing has moved: all four replicas still run the revision before it. The default spec.updateStrategy.type is RollingUpdate, and that is what turns a new revision into a rollout.',
    chips: { chip0: 'RollingUpdate', chip1: '0', chip2: '1' },
    wires: { req: 'create ControllerRevision, rev 3', progress: 'on rev 3: none of 4', partLabel: '', name0: '', name1: '' },
    opacity: { ...window2(OFF, OFF), partition: 0 },
    chain: -1,
    // Two hops in the order the sentence puts them, the `one-at-a-time` shape: the edit reaches the
    // controller off its watch, then the controller STORES the template, which is a WRITE and rides
    // the request lane. The API is the sender cued at entry (M-18a) and each hop lights the block it
    // lands on. The answer hop rides unlabelled because the top row carries one wire string, which
    // is what `one-at-a-time` does too. Record: MOTION.
    lit: ['apiserver'],
    flow: [
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, name: 'watch', lights: ['controller'] }),
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'rev', after: 'watch', lights: ['apiserver'] }),
    ],
  },
  {
    id: 'largest-first',
    duration: 3900,
    narration: 'A RollingUpdate deletes and recreates each Pod, and it proceeds in the same order as termination, from the largest ordinal to the smallest. So the walk opens at web-3 and never at web-0. The Pod comes back built from rev 3, and it is the only member of the set that is unavailable while it does.',
    chips: { chip0: 'RollingUpdate', chip1: '0', chip2: '1' },
    wires: { req: 'delete Pod web-3, recreate from rev 3', progress: 'on rev 3: 1 of 4', partLabel: '', name0: 'web-3', name1: '' },
    opacity: { ...window2(1, OFF), partition: 0 },
    chain: [0],
    lit: ['controller'],
    // The animated path says the Pod landed by PULSING it, which no `lights` list can name: the
    // static path has to say it with the inner box instead.
    reducedLit: ['slot0Box'],
    rewind: { chain: -1, wires: { progress: 'on rev 3: none of 4', name0: '' } },
    flow: [
      ...replace(0),
      F.set({ at: 'land0', chain: [0], wires: { progress: 'on rev 3: 1 of 4', name0: 'web-3' } }),
    ],
  },
  {
    id: 'one-at-a-time',
    duration: 4200,
    narration: 'The control plane waits until the updated Pod is Running and Ready before it touches the predecessor, and where spec.minReadySeconds is set it waits that long again after the Pod turns ready. Only then does web-2 go. The second slot stays empty throughout, because maxUnavailable defaults to 1.',
    chips: { chip0: 'RollingUpdate', chip1: '0', chip2: '1' },
    wires: { req: 'delete Pod web-2, recreate from rev 3', progress: 'on rev 3: 2 of 4', partLabel: '', name0: 'web-2', name1: '' },
    opacity: { ...window2(1, OFF), partition: 0 },
    chain: [0, 1],
    lit: ['apiserver'],
    reducedLit: ['slot0Box'],
    // The window is EMPTY at entry, so the caption under it is too: the slot back-fills to OFF for
    // the whole delay window, and `web-3` under a ghost says the budget is holding a Pod it is not.
    // The card's own `largest-first` winds the same pair back the same way.
    rewind: { chain: [0], wires: { progress: 'on rev 3: 1 of 4', name0: '' } },
    flow: [
      // web-3 turning Running and Ready is what releases the predecessor, and the controller learns
      // it off its watch, so the answer lane runs before anything is asked for.
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, name: 'ready', lights: ['controller'] }),
      ...replace(0, 'ready'),
      F.set({ at: 'land0', chain: [0, 1], wires: { progress: 'on rev 3: 2 of 4', name0: 'web-2' } }),
    ],
  },
  {
    id: 'partition',
    duration: 3400,
    narration: 'Setting spec.updateStrategy.rollingUpdate.partition to 2 draws a line through the set. Every ordinal at or above 2 is updated and every ordinal below it is left alone, and a Pod under the line is recreated at the previous revision even if you delete it. That is how a canary or a phased rollout is staged.',
    chips: { chip0: 'RollingUpdate', chip1: '2', chip2: '1' },
    wires: { req: 'watch: partition 2', progress: 'on rev 3: 2 of 4', partLabel: 'partition 2', name0: '', name1: '' },
    // Nothing is in hand: the walk reached the line and stopped, which is the picture this step
    // exists to draw.
    opacity: { ...window2(OFF, OFF), partition: 1 },
    chain: [0, 1],
    // YOU patch the field and the controller reads it off its watch, so the ball runs API to
    // controller. A controller does not PATCH its own spec, and the narration says who does.
    lit: ['apiserver'],
    // A chip is CUED and not written bare wherever the value is a fact the step changes (P-05), and
    // all four such chips on this card are cued rather than a subset (P-04). `chipsCued` carries the
    // animated path, where `rewind` has put the old value back and `setChip` finds the change on the
    // arrival that earns it, and `reducedLit` carries the static one, where the entry write already
    // holds the new value and no diff is left for `setChip` to find.
    reducedLit: ['chip1'],
    rewind: { chips: { chip1: '0' }, wires: { partLabel: '', name0: 'web-2' } },
    flow: [
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, name: 'patch', lights: ['controller'] }),
      F.fade({ target: 'partition', from: 0, to: 1, dur: FADE.in, at: 'patch', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'slot0', from: 1, to: OFF, dur: FADE.out, at: 'patch', fill: 'both' }),
      F.set({ at: 'patch', chipsCued: { chip1: '2' }, wires: { partLabel: 'partition 2', name0: '' } }),
    ],
  },
  {
    id: 'max-unavailable',
    duration: 4800,
    narration: 'Put the partition back to 0 and set spec.updateStrategy.rollingUpdate.maxUnavailable to 2, and the last two ordinals go together instead of one after the other. The field is Beta since 1.35, but a regression turned its gate off by default in 1.35.4. It defaults to 1 and cannot be 0. Every replica now runs rev 3.',
    chips: { chip0: 'RollingUpdate', chip1: '0', chip2: '2' },
    // The hop carries the PATCH as well as the delete: two chips turn over on its arrival, and a
    // cued chip the wire does not name is the P-04 asymmetry read from the other side. `partition`
    // labels its own patch one step earlier, so the same lane cannot go silent here.
    wires: { req: 'delete web-1 and web-0, recreate from rev 3', progress: 'on rev 3: 4 of 4', partLabel: '', name0: 'web-1', name1: 'web-0' },
    opacity: { ...window2(1, 1), partition: 0 },
    chain: 'all',
    // Two hops, the `revision` shape: YOUR patch arrives off the watch and the controller then
    // deletes. The chips and the rule turn over on the PATCH arrival, which is what changes them,
    // and the wire labels the second hop, which is the only controller traffic on the row.
    lit: ['apiserver'],
    reducedLit: ['slot0Box', 'slot1Box', 'chip1', 'chip2'],
    rewind: {
      chain: [0, 1], chips: { chip1: '2', chip2: '1' },
      wires: { partLabel: 'partition 2', progress: 'on rev 3: 2 of 4', name0: '', name1: '' },
    },
    flow: [
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, name: 'patch', lights: ['controller'] }),
      F.set({ at: 'patch', chipsCued: { chip1: '0', chip2: '2' }, wires: { partLabel: '' } }),
      F.fade({ target: 'partition', from: 1, to: 0, dur: FADE.out, at: 'patch', fill: 'both' }),
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'req', after: 'patch', lights: ['apiserver'] }),
      // Two routes at ONE delay AND one duration, because that is what the field buys: the pair
      // leaves together and lands together. PAIR_DUR is why, and M-12 registers the deviation.
      F.route({ points: LANE(0), after: 'req', name: 'landA', dur: PAIR_DUR }),
      F.route({ points: LANE(1), after: 'req', name: 'landB', dur: PAIR_DUR }),
      F.fade({ target: 'slot0', from: OFF, to: 1, dur: FADE.in, at: 'landA', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'slot1', from: OFF, to: 1, dur: FADE.in, at: 'landB', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'slot0', at: 'landA' }),
      F.pulse({ pod: 'slot1', at: 'landB' }),
      F.set({ at: 'landB', chain: 'all', wires: { progress: 'on rev 3: 4 of 4', name0: 'web-1', name1: 'web-0' } }),
    ],
  },
  {
    id: 'ondelete',
    duration: 4400,
    narration: 'The other strategy hands the trigger back. With spec.updateStrategy.type set to OnDelete a further edit to spec.template still records rev 4, but the controller updates nothing by itself, so every replica stays on the revision it has until you delete a Pod yourself. Your deletions become the rollout.',
    chips: { chip0: 'OnDelete', chip1: '0', chip2: '2' },
    wires: { req: 'create ControllerRevision, rev 4', progress: 'on rev 4: none of 4', partLabel: '', name0: '', name1: '' },
    // The window is empty because the controller opens it for nobody, which is the whole step.
    opacity: { ...window2(OFF, OFF), partition: 0 },
    chain: -1,
    // Two hops, the `revision` shape: your edit arrives off the watch and the controller writes the
    // revision back. OnDelete changes what the controller does NEXT, not who records the revision,
    // and a type change alone records nothing: the revision patch is spec.template only.
    lit: ['apiserver'],
    reducedLit: ['chip0'],
    rewind: { chain: 'all', chips: { chip0: 'RollingUpdate' }, wires: { progress: 'on rev 3: 4 of 4', name0: 'web-1', name1: 'web-0' } },
    flow: [
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, name: 'edit', lights: ['controller'] }),
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'rev4', after: 'edit', lights: ['apiserver'] }),
      F.fade({ target: 'slot0', from: 1, to: OFF, dur: FADE.out, at: 'rev4', fill: 'both' }),
      F.fade({ target: 'slot1', from: 1, to: OFF, dur: FADE.out, at: 'rev4', fill: 'both' }),
      F.set({ at: 'rev4', chipsCued: { chip0: 'OnDelete' }, chain: -1, wires: { progress: 'on rev 4: none of 4', name0: '', name1: '' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
