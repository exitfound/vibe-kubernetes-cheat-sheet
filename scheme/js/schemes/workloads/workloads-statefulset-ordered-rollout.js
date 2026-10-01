import { P, F, defineCard, laneY, midX, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-statefulset-ordered-rollout.md

// Three ordinal COLUMNS across the full width, each one a Pod over its own disk on an ownership
// spine, with a gate relation bridging the gap to the next column. No LAYOUT preset: A / B / C
// choose which column holds a ladder and which the chips, and this card carries neither.
// Panel measured at x<=396.55 and y<=279.51, both at 1100x800 (worst of 1600/1280/1100).
const PANEL_B = 280, PANEL_GAP = 21;
const BAND_Y = PANEL_B + PANEL_GAP;                      // 301, the first line under the panel

// The actor row, the same PAIR `workloads-replicaset` draws: 232 wide, the left box centred on
// WL.CX so the trunk leaves a face midpoint (WL.L-07), the right box right-aligned on WL.R where
// the third column also ends.
const TOP1_W = 232, TOP1_X = WL.CX - TOP1_W / 2;         // 484..716, centred on CX for the trunk
const TOP2_W = 232, TOP2_X = WL.R - TOP2_W;              // 908..1140, right edge on WL.R
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);

// The three columns: 300 wide on a pitch of 390, so they span WL.L..WL.R exactly and leave a
// 90 unit gap for each gate. Column 1 centres on WL.CX, and column 2 ends on WL.R under the API.
const COL_W = 300, COL_PITCH = 390;
const COL_X = [0, 1, 2].map(i => WL.L + i * COL_PITCH);  // 60 / 450 / 840
const COL_CX = i => COL_X[i] + COL_W / 2;                // 210 / 600 / 990

const BUS_Y = BAND_Y + 6;
const POD_Y = BAND_Y + 62, POD_H = 82;
const POD_INNER = { dx: 30, dy: 24, w: COL_W - 60, h: 46 };
const GATE_Y = POD_Y + POD_H / 2;                        // the gate runs on the Pod midline
const GATE_LABEL_Y = POD_Y - 12;                         // above the Pods, below the bus
const DISK_W = 150, DISK_H = 76;
const DISK_Y = POD_Y + POD_H + 46;
const DISK_X = i => COL_CX(i) - DISK_W / 2;
const CHIP_Y = DISK_Y + DISK_H + 23;
const CHIP_X = i => COL_X[i];

// The delivery path: trunk down the spine, a bus split at the centre column, one tap per ordinal.
// Wires and balls share these points (A-02).
const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y]];
const BUS_L = [[COL_CX(0), BUS_Y], [WL.CX, BUS_Y]];
const BUS_R = [[WL.CX, BUS_Y], [COL_CX(2), BUS_Y]];
const TAP = i => [[COL_CX(i), BUS_Y], [COL_CX(i), POD_Y]];
const LANE = i => (COL_CX(i) === WL.CX
  ? [[WL.CX, WL.TOP_BOTTOM], [WL.CX, POD_Y]]
  : [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y], [COL_CX(i), BUS_Y], [COL_CX(i), POD_Y]]);
// Ownership, Pod down to its own disk. Nothing travels it, so it carries no head (A-05).
const SPINE = i => [[COL_CX(i), POD_Y + POD_H], [COL_CX(i), DISK_Y]];
// The gate: ordinal N+1 depends on ordinal N. A finer stipple than the trunk, because it is a
// boundary rather than a channel, and no ball ever rides it.
const GATE = i => [[COL_X[i] + COL_W, GATE_Y], [COL_X[i + 1], GATE_Y]];

// A trunk segment carries the ball but is not its destination, so it is a LANE with the marker
// taken off (A-06, the `workloads-replicaset` form): the arrowhead belongs on the tap that lands
// on a Pod. As a relation it paints at stroke-opacity 0.45 and the ball rides a dark line into a
// bright tap, which is the one thing the delivery path must not do.
const trunkPath = (key, points) => P.lane({
  key, points, dim: true, dashed: true, role: 'cluster',
  tune: (el) => el.removeAttribute('marker-end'),
});

const POD_NAMES = ['web-0', 'web-1', 'web-2'];
const POD_PVCS = ['data-web-0', 'data-web-1', 'data-web-2'];
// Declared by the spec and not yet created. Every Pod and every disk is drawn from the first
// frame at this shade so no arrowhead ever points at blank canvas (M-24). It applies to BODIES
// only: the lines are at full from the first frame, see `ordinals` below.
const OFF = OPACITY.pending;

// Z-order: disks, spines and lanes, then the wire labels and chips over them, then the packet
// layer, then the Pods and the actor row, which the ball runs under.
export const SCENE = {
  'aria-label': 'StatefulSet ordered rollout: three ordinal columns, each a Pod over its own claim, created strictly in order because OrderedReady blocks ordinal N plus 1 until ordinal N is Running and Ready, and removed in reverse order on scale-down with the claims left behind',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    // The answer lane is ridden on the gate step, where the controller reads the new status off
    // its watch, so it is an arrow with a head rather than a relationship (A-06).
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    ...COL_X.map((_, i) => P.cylinder({ key: `disk${i}`, x: DISK_X(i), y: DISK_Y, w: DISK_W, h: DISK_H, label: 'PVC ' + POD_PVCS[i], labelY: DISK_H / 2 + 10, opacity: OFF })),
    // Plain relations, the A-08 wash kept: a line with no arrowhead reads as a standing
    // relationship and must not paint like a route. `workloads-pod-lifecycle-phases` is the model.
    ...COL_X.map((_, i) => P.relation({ key: `spine${i}`, points: SPINE(i), role: 'cluster', dash: '5 5' })),
    ...[0, 1].map(i => P.relation({ key: `gate${i}${i + 1}`, points: GATE(i), role: 'cluster', dash: '4 4' })),
    trunkPath('trunk', TRUNK),
    trunkPath('busL', BUS_L),
    trunkPath('busR', BUS_R),
    ...COL_X.map((_, i) => P.lane({ key: `tap${i}`, points: TAP(i), dim: true, dashed: true, role: 'cluster' })),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    P.wire({ key: 'gate01', x: midX(COL_X[0] + COL_W, COL_X[1]), y: GATE_LABEL_Y }),
    P.wire({ key: 'gate12', x: midX(COL_X[1] + COL_W, COL_X[2]), y: GATE_LABEL_Y }),
    // One chip per column, footing the ordinal it reports on. No focus chip: what this card is
    // about is three states, and a fourth chip would break the column alignment to say less.
    ...COL_X.map((_, i) => P.chip({ key: `web${i}Chip`, x: CHIP_X(i), y: CHIP_Y, w: COL_W, h: WL.CHIP_H, name: POD_NAMES[i], value: 'not created' })),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    ...COL_X.map((_, i) => P.pod({
      key: `pod${i}`, id: `pod${i}`, innerKey: `pod${i}Box`,
      x: COL_X[i], y: POD_Y, w: COL_W, h: POD_H, label: POD_NAMES[i], sublabel: '', containers: 0,
      opacity: OFF,
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'mounts /data' },
    })),
    P.box({ key: 'apiserver', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'Pod and PVC objects', role: 'cluster' }),
    P.box({ key: 'controller', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'StatefulSet web', sublabel: 'replicas 3, OrderedReady', role: 'cluster' }),
  ],
  reset: {
    keys: [
      'controller', 'apiserver',
      'disk0', 'disk1', 'disk2', 'web0Chip', 'web1Chip', 'web2Chip',
      'pod0Box', 'pod1Box', 'pod2Box',
    ],
    pods: ['pod0', 'pod1', 'pod2'],
  },
};

// One call pins the BODIES of an ordinal, the Pod and the disk it owns: those two have a
// lifecycle, declared and waiting at OPACITY.pending then running at full. NO LINE IS IN HERE.
// Every lane, spine and gate is at full on every step, exactly like the actor-row arrows, and the
// only thing that takes one down is the far end being GONE (A-14), once, on `scale-down`. Pinning
// a lane to its sink is the A-13 default, overruled here: with three ordinals arriving one at a
// time it washes out two thirds of the drawing on every step but the last. Record: LANES.
const ordinals = (o0, o1, o2) => ({
  pod0: o0, disk0: o0,
  pod1: o1, disk1: o1,
  pod2: o2, disk2: o2,
});

// Ordinal N is created the same way every time: the controller asks the API, then the Pod rides
// the trunk down into its own column, and the Pod, its claim and the cue on both land together.
const createOrdinal = (i) => [
  F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'req', lights: ['apiserver'] }),
  // The claim is CUED on the create arrival, the instant the ball reaches the Pod, and not on the
  // request arrival a whole hop earlier: cued there, the disk lights while the ball is still in
  // flight, which reads as two unrelated things happening.
  F.route({ points: LANE(i), after: 'req', name: 'create', lights: [`disk${i}`] }),
  F.fade({ target: `pod${i}`, from: OFF, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
  F.fade({ target: `disk${i}`, from: OFF, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
  F.pulse({ pod: `pod${i}`, at: 'create' }),
  // The ordinal reads Ready when its Pod LANDS, which is the arrival the reader is watching.
  F.set({ at: 'create', chips: { [`web${i}Chip`]: 'Ready' } }),
];

const SPEC_3 = 'replicas 3, OrderedReady';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { web0Chip: 'not created', web1Chip: 'not created', web2Chip: 'not created' },
    wires: { gate01: 'waits on web-0', gate12: 'waits on web-1' },
    sublabels: { controller: SPEC_3 },
    opacity: ordinals(OFF, OFF, OFF),
  },
  {
    id: 'ordinal-0',
    duration: 4200,
    narration: 'The controller starts at ordinal 0 and requests PVC data-web-0 before the Pod. That name joins the template name to the Pod name, so the same ordinal gets that disk back on every restart. Pod web-0 follows, carrying an identity that sticks to it wherever it is rescheduled, and once it is Running and Ready the ordinal is done.',
    chips: { web0Chip: 'Ready', web1Chip: 'not created', web2Chip: 'not created' },
    wires: { req: 'create PVC data-web-0, then Pod web-0', gate01: 'waits on web-0', gate12: 'waits on web-1' },
    sublabels: { controller: SPEC_3 },
    opacity: ordinals(1, OFF, OFF),
    lit: ['controller', 'web0Chip'],
    // The animated path says the Pod arrived by PULSING it, which no `lights` list can name:
    // the static path has to say it with the inner box instead.
    reducedLit: ['pod0Box'],
    // The column is empty at entry and web-0 does not land for most of the step, so the chip
    // states what the step inherits and is turned over by the ball that earns it.
    rewind: { chips: { web0Chip: 'not created' } },
    flow: createOrdinal(0),
  },
  {
    id: 'gate',
    duration: 3400,
    narration: 'Ordinal 1 is not created while ordinal 0 is not Running and Ready. The controller reads that status off its watch on the API, and the answer is what opens the gate. This is spec.podManagementPolicy at its default of OrderedReady, where a replica that never turns Running and Ready holds up every ordinal behind it. Parallel lifts the gate, but the field is immutable.',
    chips: { web0Chip: 'Ready', web1Chip: 'next in line', web2Chip: 'not created' },
    wires: { gate01: 'open', gate12: 'waits on web-1' },
    sublabels: { controller: SPEC_3 },
    opacity: ordinals(1, OFF, OFF),
    // The API holds the status and sends it, so it is the sender cued at entry (M-18a), and the
    // controller is the receiver that lights when the answer lands.
    lit: ['apiserver', 'web1Chip'],
    rewind: { chips: { web1Chip: 'not created' }, wires: { gate01: 'waits on web-0' } },
    flow: [
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, name: 'ready', lights: ['controller'] }),
      // The gate says open in WORDS, on its caption, and not by coming up out of a shade. It is
      // drawn at full on every step the way the actor-row arrows are, and a `.highlight` on a path
      // renders nothing anyway: diagrams.css carries that rule for pods, boxes, cylinders and
      // chips only.
      F.set({ at: 'ready', chips: { web1Chip: 'next in line' }, wires: { gate01: 'open' } }),
    ],
  },
  {
    id: 'ordinal-1',
    duration: 3600,
    narration: 'With the gate open the same two calls run for ordinal 1. PVC data-web-1 is requested before Pod web-1, and web-1 mounts a claim of its own rather than sharing the one web-0 holds. Ordinal 1 becoming Running and Ready is what opens the gate in front of ordinal 2, and nothing about web-0 is touched.',
    chips: { web0Chip: 'Ready', web1Chip: 'Ready', web2Chip: 'next in line' },
    wires: { req: 'create PVC data-web-1, then Pod web-1', gate01: 'open', gate12: 'open' },
    sublabels: { controller: SPEC_3 },
    opacity: ordinals(1, 1, OFF),
    lit: ['controller', 'web1Chip', 'web2Chip'],
    reducedLit: ['pod1Box'],
    rewind: { chips: { web1Chip: 'next in line', web2Chip: 'not created' }, wires: { gate12: 'waits on web-1' } },
    flow: [
      ...createOrdinal(1),
      // web-1 reaching Ready IS what opens the next gate, so both turn over on that arrival.
      F.set({ at: 'create', chips: { web2Chip: 'next in line' }, wires: { gate12: 'open' } }),
    ],
  },
  {
    id: 'ordinal-2',
    duration: 4200,
    narration: 'Ordinal 2 clears the last gate and Pod web-2 is created with claim data-web-2. All three replicas are Running and Ready, each holding an ordinal, a name and a disk of its own, so they are not interchangeable the way Deployment replicas are. The ordering is the bootstrap order as well, because ordinal 0 was Ready before ordinal 1 existed.',
    chips: { web0Chip: 'Ready', web1Chip: 'Ready', web2Chip: 'Ready' },
    wires: { req: 'create PVC data-web-2, then Pod web-2', gate01: 'open', gate12: 'open' },
    sublabels: { controller: SPEC_3 },
    opacity: ordinals(1, 1, 1),
    lit: ['controller', 'web2Chip'],
    reducedLit: ['pod2Box'],
    rewind: { chips: { web2Chip: 'next in line' } },
    flow: createOrdinal(2),
  },
  {
    id: 'scale-down',
    duration: 4400,
    narration: 'Dropping the spec to 2 replicas reverses the order. The controller removes the highest ordinal first, so web-2 goes and web-0 stays. The claim is not deleted with the Pod, because persistentVolumeClaimRetentionPolicy.whenScaled defaults to Retain, so data-web-2 stays and scaling back up hands ordinal 2 the same disk. A scale-down reaches ordinal 0 only when the set is taken all the way down.',
    chips: { web0Chip: 'Ready', web1Chip: 'Ready', web2Chip: 'removed' },
    wires: { req: 'delete Pod web-2', gate01: 'open', gate12: '' },
    sublabels: { controller: 'replicas 2, OrderedReady' },
    // The Pod is gone at the end of the step and its tap goes with it (A-14), while the disk stays:
    // that is the whole point of the step. The gate to ordinal 2 goes too, because a gate is a
    // relation between two Pods and one of them is no longer drawn.
    opacity: { ...ordinals(1, 1, 1), pod2: 0, tap2: 0, busR: 0, spine2: 0, gate12: 0 },
    lit: ['controller', 'web2Chip'],
    rewind: { chips: { web2Chip: 'Ready' }, wires: { gate12: 'open' } },
    flow: [
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'req', lights: ['apiserver'] }),
      F.route({ points: LANE(2), after: 'req', name: 'delete' }),
      // M-08: the Pod blinks BEFORE it dissolves, or the two read as one event.
      F.pulse({ pod: 'pod2', at: 'delete' }),
      F.fade({ target: 'pod2', from: 1, to: 0, dur: FADE.out, at: 'delete', plus: BEAT.afterPulse, fill: 'both' }),
      F.fade({ target: 'tap2', from: 1, to: 0, dur: FADE.out, at: 'delete', plus: BEAT.afterPulse, fill: 'both' }),
      F.fade({ target: 'busR', from: 1, to: 0, dur: FADE.out, at: 'delete', plus: BEAT.afterPulse, fill: 'both' }),
      // The spine says the Pod owns this claim, so it goes with the Pod and the disk is left
      // standing alone, which is the whole picture this step is here to draw.
      F.fade({ target: 'spine2', from: 1, to: 0, dur: FADE.out, at: 'delete', plus: BEAT.afterPulse, fill: 'both' }),
      // The gate spans web-1 to web-2 and web-2 is going, so the line and its caption go with the
      // Pod rather than hanging off a face that is no longer there (A-14).
      F.fade({ target: 'gate12', from: 1, to: 0, dur: FADE.out, at: 'delete', plus: BEAT.afterPulse, fill: 'both' }),
      F.set({ at: 'delete', plus: BEAT.afterPulse, chips: { web2Chip: 'removed' }, wires: { gate12: '' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
