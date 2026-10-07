import { P, F, defineCard, laneY, midX, strip, routeDur, WL, FADE, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-statefulset-update-strategy.md

// A worklist on the right and an update window on the left: how many slots hold a Pod is maxUnavailable.
const PANEL_B = 230, PANEL_GAP = 21;
const BAND_Y = PANEL_B + PANEL_GAP;                      // the first line under the panel

// Left box centred on WL.CX so the trunk leaves a face midpoint (WL.L-07).
const TOP1_W = 232, TOP1_X = WL.CX - TOP1_W / 2;
const TOP2_W = 232, TOP2_X = WL.R - TOP2_W;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);

const BUS_Y = BAND_Y + 6;
const CHAIN_Y = BAND_Y + 45;                             // the top of the worklist

// Largest ordinal at the top, on the house ladder pitch. Only the gap the partition rule falls in
// is wider, so the rule reads as a cut through the list rather than a row border.
const CHAIN_X = WL.COL_R.x, CHAIN_W = WL.COL_R.w;
const CHAIN_ROW_H = WL.ROW_H, CHAIN_GAP = WL.ROW_GAP;
const PART_GAP = 22;                                     // the one wide gap, between web-2 and web-1
const CHAIN_PITCH = CHAIN_ROW_H + CHAIN_GAP;
const PART_EXTRA = PART_GAP - CHAIN_GAP;
// A `tune` pushes the rows below the rule down, not a second chain: `chain:` is one index list.
const CHAIN_SPLIT = 2;                                   // the first row BELOW the rule
const chainRowY = i => CHAIN_Y + i * CHAIN_PITCH + (i >= CHAIN_SPLIT ? PART_EXTRA : 0);
const CHAIN_BOTTOM = chainRowY(3) + CHAIN_ROW_H;
const splitRows = (el) => el.querySelectorAll('.scheme-chip').forEach((row, i) => {
  if (i >= CHAIN_SPLIT) row.setAttribute('transform', `translate(0, ${i * CHAIN_PITCH + PART_EXTRA})`);
});

// The rule starts left of the chain, exactly under the first letter of its caption.
const PART_Y = chainRowY(1) + CHAIN_ROW_H + PART_GAP / 2;
const PART_X0 = 532;
const PART_LABEL_X = 570, PART_LABEL_Y = PART_Y - 12;

// Centred on the worklist: top-aligned, the window would read as its first two rows.
const SLOT_W = 140, SLOT_H = 96, SLOT_GAP = 20;
const SLOT_X = [WL.L, WL.L + SLOT_W + SLOT_GAP];
const SLOT_CX = i => SLOT_X[i] + SLOT_W / 2;
const SLOT_Y = (CHAIN_Y + CHAIN_BOTTOM) / 2 - SLOT_H / 2;
const SLOT_INNER = { dx: 20, dy: 22, w: SLOT_W - 40, h: 52 };
// The ordinal in hand is a wire under the slot: over it, the caption would land on the tap.
const NAME_Y = SLOT_Y + SLOT_H + 16;
// Centred between the two taps, never across one.
const WINDOW_TAG_Y = SLOT_Y - 12;

// partition reads 0, never `not set`: SetDefaults_StatefulSet writes 0, and maxUnavailable 1.
const CHIP_Y = 556;
const CHIPS = strip({ from: WL.L, to: WL.R, count: 3, gap: 14 });

// The delivery path: trunk down the spine, a bus west to the window, one tap per slot.
// Wires and balls share these points (A-02).
const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y]];
const BUS = [[SLOT_CX(0), BUS_Y], [WL.CX, BUS_Y]];
const TAP = i => [[SLOT_CX(i), BUS_Y], [SLOT_CX(i), SLOT_Y]];
const LANE = i => [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y], [SLOT_CX(i), BUS_Y], [SLOT_CX(i), SLOT_Y]];

// A lane with the marker taken off, not a relation: the ball must not ride a dimmer line (A-06).
const trunkPath = (key, points) => P.lane({
  key, points, dim: true, dashed: true, role: 'cluster',
  tune: (el) => el.removeAttribute('marker-end'),
});

// Every clause is true on every step: a row cannot carry state.
const ORDINALS = [
  'web-3 · the largest ordinal, where the walk opens',
  'web-2 · goes once web-3 is Running and Ready',
  'web-1 · goes once web-2 is Running and Ready',
  'web-0 · the smallest ordinal, where the walk closes',
];
// Empty slots stay drawn so no arrowhead points at blank canvas (M-24). `terminating`, not
// `pending`: at pending an empty slot reads as a Pod.
const OFF = OPACITY.terminating;

// The list order is the z-order: Pods and the actor row sit above the packet layer.
export const SCENE = {
  'aria-label': 'StatefulSet update strategy: a template change becomes a new revision, and under RollingUpdate the controller deletes and recreates one Pod at a time from the largest ordinal to the smallest, waiting for each to be Running and Ready, with partition freezing every ordinal below it, maxUnavailable widening the window and OnDelete handing the trigger back to you',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    // Ridden by whatever reaches the controller off its watch, so it carries a head (A-06).
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // A boundary nothing rides, so no head (A-05).
    P.relation({ key: 'partition', points: [[PART_X0, PART_Y], [WL.R, PART_Y]], role: 'cluster', dash: '4 4', opacity: 0 }),
    trunkPath('trunk', TRUNK),
    trunkPath('bus', BUS),
    ...SLOT_X.map((_, i) => P.lane({ key: `tap${i}`, points: TAP(i), dim: true, dashed: true, role: 'cluster' })),
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    P.wire({ key: 'partLabel', x: PART_LABEL_X, y: PART_LABEL_Y }),
    P.wire({ key: 'name0', x: SLOT_CX(0), y: NAME_Y }),
    P.wire({ key: 'name1', x: SLOT_CX(1), y: NAME_Y }),
    // A standing caption: the empty slot is a reading, not a gap.
    P.tag({ x: midX(SLOT_X[0], SLOT_X[1] + SLOT_W), y: WINDOW_TAG_Y, text: 'unavailable at once' }),
    P.wire({ key: 'progress', x: CHAIN_X + CHAIN_W / 2, y: CHAIN_Y - 12 }),
    // A lit row is an ordinal on the update revision, a state and not a destination: no lane lands here.
    P.chain({ key: 'chain', x: CHAIN_X, y: CHAIN_Y, w: CHAIN_W, rowH: CHAIN_ROW_H, gap: CHAIN_GAP, items: ORDINALS, tune: splitRows }),
    ...[0, 1, 2].map(i => P.chip({ key: `chip${i}`, x: CHIPS.x(i), y: CHIP_Y, w: CHIPS.w, h: WL.CHIP_H, name: ['updateStrategy', 'partition', 'maxUnavailable'][i], value: '' })),
    P.packets(),
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

// Both slots in one call. No lane is in here on purpose: every lane stays at full on every step.
const window2 = (a, b) => ({ slot0: a, slot1: b });

// One duration for the max-unavailable pair, the longer lane's, so the two Pods land together (M-13).
const PAIR_DUR = routeDur(LANE(0));

// The controller asks the API, then the replacement rides the trunk into a slot.
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
    // The edit arrives off the watch, then the controller writes the revision (M-18a).
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
    // A pulse cannot be named by `lights`, so the static path lights the inner box instead.
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
    // The window is empty at entry, so the name under it is too.
    rewind: { chain: [0], wires: { progress: 'on rev 3: 1 of 4', name0: '' } },
    flow: [
      // web-3 turning Ready, seen off the watch, releases the predecessor.
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
    // Nothing in hand: the walk reached the line and stopped.
    opacity: { ...window2(OFF, OFF), partition: 1 },
    chain: [0, 1],
    // You patch the field and the controller reads it off its watch.
    lit: ['apiserver'],
    // A changed fact is cued (P-05, P-04). `reducedLit` covers the static path, where the entry
    // write leaves no diff for `setChip` to find.
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
    wires: { req: 'delete web-1 and web-0, recreate from rev 3', progress: 'on rev 3: 4 of 4', partLabel: '', name0: 'web-1', name1: 'web-0' },
    opacity: { ...window2(1, 1), partition: 0 },
    chain: 'all',
    // Your patch arrives off the watch, then the controller deletes. Chips turn over on the patch.
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
      // One delay and one duration: the pair leaves and lands together (M-12).
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
    opacity: { ...window2(OFF, OFF), partition: 0 },
    chain: -1,
    // OnDelete changes what the controller does next, not who records the revision.
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
