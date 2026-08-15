import { P, F, defineCard, STO, chipStrip, laneOf, BEAT, FADE, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-pvc-retention-policy


const CX = 600;

const SRC_W = 340, SRC_H = 64, SRC_X = CX - SRC_W / 2, SRC_Y = 52;   // 430..770
const SRC_BOTTOM = SRC_Y + SRC_H;                                   // 116

// The three ordinal rows. Row centres are the y midline of every block in the row, so the ownership
// and reclaim runs stay dead level and the spine segments sit in the gaps between the stacked claims.
const ROW_CY = [245, 385, 525];

const POD_W = 150, POD_H = 100;
const PVC_W = 200, PVC_H = 56;
const PV_W = 150, PV_H = 76;

// Flank offset: Pod centre and disk centre are mirror images about the spine, so the row is symmetric.
const FLANK = 295;
const POD_CX = CX - FLANK, PV_CX = CX + FLANK;                      // 305 / 895
const POD_X = POD_CX - POD_W / 2, POD_RIGHT = POD_X + POD_W;        // 230 / 380
const PVC_X = CX - PVC_W / 2, PVC_RIGHT = PVC_X + PVC_W;            // 500 / 700
const PV_X = PV_CX - PV_W / 2, PV_RIGHT = PV_X + PV_W;              // 820 / 970

const CHIPS_Y = 600;
// Family CHIP_W 232 at the family gap, four across, centred on CX: 112..1088.
const CHIPS = chipStrip();

// Straight axis runs, every array shared by the static wire and the ball that rides it, arrowheads at
// the RECEIVER: the governance into each claim top, the reclaim into the claim then into the disk.
const spineSeg = i => [[CX, i === 0 ? SRC_BOTTOM : ROW_CY[i - 1] + PVC_H / 2], [CX, ROW_CY[i] - PVC_H / 2]];
const ownPts = i => [[POD_RIGHT, ROW_CY[i]], [PVC_X, ROW_CY[i]]];        // Pod -> claim
const reclaimPts = i => [[PVC_RIGHT, ROW_CY[i]], [PV_X, ROW_CY[i]]];     // claim -> disk

// One lane per row in each of the three families, held under its own ordinal key, which is what the
// `opacity` field and the flow address.
const spineLane = i => P.lane({ key: `spine${i}`, points: spineSeg(i), dashed: true, dim: true, opacity: 0 });
const ownLane = i => P.lane({ key: `own${i}`, points: ownPts(i), dashed: true, dim: true });
const reclaimLane = i => P.lane({ key: `reclaim${i}`, points: reclaimPts(i), dashed: true, dim: true });

// Each Pod is a full window like the rest of the family, the ordinal name on top and a real
// container box on the row centre line, even though no Pod here ever pulses on arrival.
const podBlock = i => P.pod({
  key: `p${i}`, x: POD_X, y: ROW_CY[i] - POD_H / 2, w: POD_W, h: POD_H,
  label: `web-${i}`, sublabel: 'mounts /data', containers: 0,
  inner: { dx: 16, dy: POD_H / 2 - 21, w: POD_W - 32, h: 42, label: 'app', sublabel: 'read/write' },
});

// Z-order (bottom -> top): blocks, then the spine and lanes and verdict captions above them, then
// the chip strip, then the packet layer so every ball rides above everything.
export const SCENE = {
  'aria-label': 'StatefulSet persistentVolumeClaimRetentionPolicy: two independent knobs, whenScaled for what happens to a claim when a replica is scaled away and whenDeleted for when the whole StatefulSet is removed, each set to Retain or Delete, where Retain leaves the disk in place and silently leaks storage and Delete reclaims it',
  parts: [
    P.defs(),
    P.box({ key: 'src', x: SRC_X, y: SRC_Y, w: SRC_W, h: SRC_H, label: 'StatefulSet web', sublabel: 'persistentVolumeClaimRetentionPolicy' }),
    // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-centre on the face, derived from the height.
    ...ROW_CY.map((cy, i) => P.cylinder({ key: `d${i}`, x: PV_X, y: cy - PV_H / 2, w: PV_W, h: PV_H, label: `PV web-${i}`, labelY: PV_H / 2 + 10 })),
    ...ROW_CY.map((cy, i) => P.box({ key: `v${i}`, x: PVC_X, y: cy - PVC_H / 2, w: PVC_W, h: PVC_H, label: `PVC data-web-${i}`, sublabel: 'Bound' })),
    ...ROW_CY.map((_, i) => podBlock(i)),
    // The central governance spine (hidden until the policy step, exactly like the sibling's mint
    // trunk), and the two horizontal lanes per row that carry the reclaim ball. All dashed, arrowed.
    ...ROW_CY.map((_, i) => spineLane(i)),
    ...ROW_CY.map((_, i) => ownLane(i)),
    ...ROW_CY.map((_, i) => reclaimLane(i)),
    // Per-row verdict, parked in the free space to the right of the disk (the L-shaped safe zone),
    // filled per step with retained / reclaimed.
    ...ROW_CY.map((cy, i) => P.wire({ key: `g${i}`, x: PV_RIGHT + 20, y: cy + 5, anchor: 'start' })),
    P.chip({ key: 'replChip', x: CHIPS.x(0), y: CHIPS_Y, w: CHIPS.w, h: STO.CHIP_H, name: 'replicas', value: '3' }),
    P.chip({ key: 'wsChip', x: CHIPS.x(1), y: CHIPS_Y, w: CHIPS.w, h: STO.CHIP_H, name: 'whenScaled', value: 'Retain' }),
    P.chip({ key: 'wdChip', x: CHIPS.x(2), y: CHIPS_Y, w: CHIPS.w, h: STO.CHIP_H, name: 'whenDeleted', value: 'Retain' }),
    P.chip({ key: 'diskChip', x: CHIPS.x(3), y: CHIPS_Y, w: CHIPS.w, h: STO.CHIP_H, name: 'disks', value: '3 kept' }),
    P.packets(),
  ],
  reset: {
    keys: ['src', 'v0', 'v1', 'v2', 'd0', 'd1', 'd2', 'replChip', 'wsChip', 'wdChip', 'diskChip'],
    pods: ['p0', 'p1', 'p2'],
  },
};

// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a
// card comes to report the old knob setting on the step that just changed it.
const chips = (repl, ws, wd, disks) => ({ replChip: repl, wsChip: ws, wdChip: wd, diskChip: disks });

const T = OPACITY.terminated;

// STO.S-01 as a field: every Pod, claim, disk and lane is pinned on EVERY step. A lane takes the MIN
// of its two endpoints, or one end alone leaves a full-strength lane hanging off a ghost.
const stage = ({ pods = [1, 1, 1], claims = [1, 1, 1], disks = [1, 1, 1], govern = false } = {}) => ({
  p0: pods[0], p1: pods[1], p2: pods[2],
  v0: claims[0], v1: claims[1], v2: claims[2],
  d0: disks[0], d1: disks[1], d2: disks[2],
  own0: laneOf(pods[0], claims[0]), own1: laneOf(pods[1], claims[1]), own2: laneOf(pods[2], claims[2]),
  reclaim0: laneOf(claims[0], disks[0]), reclaim1: laneOf(claims[1], disks[1]), reclaim2: laneOf(claims[2], disks[2]),
  // The policy box is drawn on every step, so the governance tap only follows its claim.
  spine0: govern ? String(claims[0]) : '0',
  spine1: govern ? String(claims[1]) : '0',
  spine2: govern ? String(claims[2]) : '0',
});

// Every removal step starts the animated path with the whole stack standing, and the fades below
// are what take it away.
const FULL = stage();

const claimLabels = labels => ({ v0: labels[0], v1: labels[1], v2: labels[2] });
const BOUND = ['Bound', 'Bound', 'Bound'];

// This card's riding tag sits 16 above the ball rather than the family 14.
const TAG_DY = -16;

// A Pod being removed pulses once to mark it, then fades to a ghost. Its ownership lane fades on the
// same beat: the claim the lane points at survives the removal, the ownership does not.
const FADE_AT = BEAT.afterHop + BEAT.afterPulse;      // 900
const GONE_AT = FADE_AT + FADE.out;                   // 1600, when the Pod has fully faded
const removePod = i => [
  F.pulse({ pod: `p${i}`, delay: BEAT.afterHop }),
  F.fade({ target: `p${i}`, from: 1, to: T, dur: FADE.out, delay: FADE_AT, fill: 'forwards', easing: 'ease-in' }),
  F.fade({ target: `own${i}`, from: 1, to: T, dur: FADE.out, delay: FADE_AT, fill: 'forwards', easing: 'ease-in' }),
];

// How long a reclaimed block stays lit after the ball lands on it, before it fades: long enough to
// read the highlight, so the ball visibly REACHES the block before it is taken.
const LIGHT_HOLD = 260;

// Fades a claim, disk or lane away exactly when the reclaim reaches it, and takes back the highlight
// the ball left: a reclaimed block cannot still be the thing the step points at.
const vanish = (target, at) => F.fade({
  target, from: 1, to: T, dur: FADE.out, fill: 'forwards', easing: 'ease-in',
  at, plus: LIGHT_HOLD, unlight: [target],
});

// The cue on each block is an F.set, not `lights`, because the reduced path must not show it: the
// vanish above takes the class off again before the step settles.
const reclaimRow = (i, { delay, tag = null }) => [
  F.route({ points: ownPts(i), delay, name: `h${i}a` }),
  ...(tag ? [F.tag({ text: tag, points: ownPts(i), delay, dy: TAG_DY })] : []),
  F.set({ on: `v${i}`, lit: [`v${i}`], at: `h${i}a` }),
  vanish(`v${i}`, `h${i}a`),
  vanish(`own${i}`, `h${i}a`),
  F.route({ points: reclaimPts(i), after: `h${i}a`, name: `h${i}b` }),
  F.set({ on: `d${i}`, lit: [`d${i}`], at: `h${i}b` }),
  vanish(`d${i}`, `h${i}b`),
  vanish(`reclaim${i}`, `h${i}b`),
];

const RECLAIM_AT = GONE_AT + BEAT.afterHop;           // 1700, the sweep opens once the Pods are gone

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('3', 'Retain', 'Retain', '3 kept'),
    sublabels: claimLabels(BOUND),
    opacity: FULL,
  },
  {
    id: 'policy',
    duration: 3900,
    narration: 'One policy governs all three claims. It has two independent knobs: whenScaled decides the fate of a claim when its replica is scaled away, and whenDeleted decides it when the entire StatefulSet is deleted. Each is set to Retain or Delete on its own.',
    chipsCued: chips('3', 'Retain', 'Retain', '3 kept'),
    sublabels: claimLabels(BOUND),
    opacity: stage({ govern: true }),
    // The policy is the source of the governance signal, so it lights at step entry.
    lit: ['src'],
    // The one policy reaches every claim: a governance ball cascades down the spine and each claim
    // lights as it lands, exactly as the sibling mints each claim down the same spine.
    flow: [
      F.route({ points: spineSeg(0), delay: BEAT.lead, name: 'gov0', lights: ['v0'] }),
      F.route({ points: spineSeg(1), after: 'gov0', name: 'gov1', lights: ['v1'] }),
      F.route({ points: spineSeg(2), after: 'gov1', name: 'gov2', lights: ['v2'] }),
    ],
  },
  {
    id: 'scaled-retain',
    duration: 3000,
    narration: 'Scale down to two with whenScaled set to Retain. Pod web-2 is removed, but claim data-web-2 stays and PV web-2 keeps its data. This is what an unset field gives you and it is safe, yet every scale-down that is never cleaned up leaves a disk behind that still costs money.',
    chipsCued: chips('2', 'Retain', 'Retain', '3 kept, 1 leaks'),
    sublabels: claimLabels(['Bound', 'Bound', 'kept, no Pod']),
    wires: { g2: 'retained' },
    opacity: stage({ pods: [1, 1, T] }),
    rewind: { opacity: FULL },
    // web-2 is scaled away, the claim and disk simply stay behind. The only motion is the Pod fade.
    flow: removePod(2),
  },
  {
    id: 'scaled-delete',
    duration: 4600,
    narration: 'Flip whenScaled to Delete and scale down again. Now removing web-2 also removes claim data-web-2, and its disk is reclaimed by the storage backend. No orphan is left behind, which is what most people actually want, at the cost of that data being gone for good.',
    chipsCued: chips('2', 'Delete', 'Retain', '2 kept'),
    sublabels: claimLabels(BOUND),
    wires: { g2: 'reclaimed' },
    opacity: stage({ pods: [1, 1, T], claims: [1, 1, T], disks: [1, 1, T] }),
    rewind: { opacity: FULL },
    // web-2 pulses and is scaled away, then whenScaled=Delete sweeps its claim and disk in one run.
    flow: [
      ...removePod(2),
      ...reclaimRow(2, { delay: RECLAIM_AT, tag: 'delete data-web-2' }),
    ],
  },
  {
    id: 'deleted-retain',
    duration: 3000,
    narration: 'Now consider deleting the whole StatefulSet with whenDeleted set to Retain. All three Pods vanish, but every claim and every disk is left standing. The data outlives the workload, which is exactly what you want before a risky upgrade or a rename.',
    chipsCued: chips('0', 'Delete', 'Retain', '3 kept'),
    sublabels: claimLabels(['kept, no owner', 'kept, no owner', 'kept, no owner']),
    wires: { g0: 'retained', g1: 'retained', g2: 'retained' },
    opacity: stage({ pods: [T, T, T] }),
    rewind: { opacity: FULL },
    // The three Pods go together, on one beat: the StatefulSet was deleted once, not three times.
    flow: [...removePod(0), ...removePod(1), ...removePod(2)],
  },
  {
    id: 'deleted-delete',
    duration: 4600,
    narration: 'With whenDeleted set to Delete, removing the StatefulSet garbage-collects all three claims and every disk goes with them. This is the clean teardown, and it is also why Retain on both knobs is the conservative default: deleting data is irreversible, so Kubernetes will not do it unless you ask.',
    chipsCued: chips('0', 'Delete', 'Delete', '0 kept'),
    sublabels: claimLabels(BOUND),
    wires: { g0: 'reclaimed', g1: 'reclaimed', g2: 'reclaimed' },
    opacity: stage({ pods: [T, T, T], claims: [T, T, T], disks: [T, T, T] }),
    rewind: { opacity: FULL },
    // The whole set pulses and is deleted (all Pods on one beat), then whenDeleted=Delete sweeps
    // every row together once the Pods are gone.
    flow: [
      ...removePod(0), ...removePod(1), ...removePod(2),
      ...reclaimRow(0, { delay: RECLAIM_AT }),
      ...reclaimRow(1, { delay: RECLAIM_AT }),
      ...reclaimRow(2, { delay: RECLAIM_AT }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
