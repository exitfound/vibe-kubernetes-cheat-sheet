import { P, F, defineCard, BEAT, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-access-modes


const LEFT_X = 400;                                      // leftmost the NODE ROW may go, all viewports

const POD_Y = 82, POD_W = 128, POD_H = 126;
const POD_BOTTOM = POD_Y + POD_H;                        // 208
const NODE_PAD = 16;                                     // node border to the Pod inside it
const POD_GAP = 16;                                      // between the two Pods on node-1
const NODE_GAP = 30;                                     // between the two nodes
const NODE_Y = 55, NODE_H = 186;

const NODE_1_X = LEFT_X;
const NODE_1_W = NODE_PAD * 2 + POD_W * 2 + POD_GAP;     // 304
const NODE_2_X = NODE_1_X + NODE_1_W + NODE_GAP;         // 734
const NODE_2_W = NODE_PAD * 2 + POD_W;                   // 160

const CONTENT_W = NODE_1_W + NODE_GAP + NODE_2_W;        // 494
const RIGHT_END = LEFT_X + CONTENT_W;                    // 894

// The node row sits in the panel's y band, so it starts at 400 and centres on 647. Everything BELOW
// the panel floor centres on the CANVAS instead: the band takes the width it gains on the left.
const CANVAS_CX = 600;

const P1_X = NODE_1_X + NODE_PAD;                        // 416, node-1 first Pod
const P2_X = P1_X + POD_W + POD_GAP;                     // 560, node-1 second Pod
const P3_X = NODE_2_X + NODE_PAD;                        // 750, node-2 only Pod
const P1_CX = P1_X + POD_W / 2, P2_CX = P2_X + POD_W / 2, P3_CX = P3_X + POD_W / 2;

const DRV_X = 2 * CANVAS_CX - RIGHT_END, DRV_Y = 305;    // 306, mirroring the right edge about CX
const DRV_W = RIGHT_END - DRV_X, DRV_H = 70;             // 588
const DRV_TOP = DRV_Y, DRV_BOTTOM = DRV_Y + DRV_H;       // 305 / 375
const DRV_CX = CANVAS_CX;                                // 600 by construction

// The two disks sit symmetrically about the driver band, each roughly under the node that uses it.
const PV_Y = 450, PV_H = 100, PV_TOP = PV_Y;             // 450
const PV_W = 215;
const PV_SPREAD = 148;                                   // half-distance between the two disk centers
const BLOCK_CX = DRV_CX - PV_SPREAD;                     // 452
const NFS_CX = DRV_CX + PV_SPREAD;                       // 748
const SPEC_GAP = 14;
const SPEC_Y = PV_Y + PV_H / 2 + 5 + SPEC_GAP;           // 519
const VERDICT_Y = 566;
const CHIPS_Y = 585;

const CHIP_W = 232;
const CHIP_GAP = 16;
const CHIP_COUNT = 4;                  // accessModes / attached to / sharing / enforced by
const CHIPS_W = CHIP_W * CHIP_COUNT + CHIP_GAP * (CHIP_COUNT - 1);   // 976
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CANVAS_CX - CHIPS_W / 2 + i * (CHIP_W + CHIP_GAP));


// Each Pod drops onto a shared bus and the three enter the band on its centre line: dropping
// straight down lands three arrows across the band's face, because the two rows have different centres.
const BUS_Y = 260;                                       // clear of the panel bottom (230) and the band
const podReq = cx => [[cx, POD_BOTTOM], [cx, BUS_Y], [DRV_CX, BUS_Y], [DRV_CX, DRV_TOP]];
const W_P1_DRV = podReq(P1_CX);
const W_P2_DRV = podReq(P2_CX);
const W_P3_DRV = podReq(P3_CX);
// driver -> disk, the ball re-emerging at the disk column. The three shared-filesystem attaches fan
// out INSIDE the PV nfs column, not off the band, so every lane leaves on a face midpoint.
const W_DRV_BLOCK = [[BLOCK_CX, DRV_BOTTOM], [BLOCK_CX, PV_TOP]];
const NFS_LANE = 16;
const NFS_FAN_Y = (DRV_BOTTOM + PV_TOP) / 2 - 20;        // 392, above the driver caption at 408
const nfsAttach = dx => [[NFS_CX, DRV_BOTTOM], [NFS_CX, NFS_FAN_Y], [NFS_CX + dx, NFS_FAN_Y], [NFS_CX + dx, PV_TOP]];
const W_DRV_NFS_1 = nfsAttach(-NFS_LANE);   // app-1 on node-1
const W_DRV_NFS_2 = [[NFS_CX, DRV_BOTTOM], [NFS_CX, PV_TOP]];   // app-2 on node-1
const W_DRV_NFS_3 = nfsAttach(NFS_LANE);    // app-3 on node-2

// Shell plus inner box in one wrapper, so pulsePod reaches BOTH (querySelectorAll matches
// descendants only). Inset 14 gives a 100-wide inner box: 'read/write' is 59 units, ~20 of air a side.
const podBlock = ({ key, innerKey, x, label }) => P.pod({
  key, innerKey, x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel: 'mounts /data', containers: 0,
  inner: { dx: 14, dy: 46, w: POD_W - 28, h: 52, label: 'ctr', sublabel: 'read/write' },
});

// List order IS append order, which is z-order: node frames, the driver band and the disks, then the
// Pods above their own frame, then lanes and captions, then the chip strip, then the packet layer.
export const SCENE = {
  'aria-label': 'Access modes decide who can mount a volume at once: ReadWriteOnce attaches a volume to a single Node, so two Pods on that same Node can both use it but a Pod on another Node cannot, ReadWriteOncePod narrows that to one single Pod, and ReadWriteMany needs a shared filesystem because a plain block disk cannot be attached to many Nodes at all. The access mode is mostly a request that the CSI driver has to honour rather than a rule Kubernetes enforces on its own, the one exception being ReadWriteOncePod.',
  parts: [
    P.defs(),
    P.node({ x: NODE_1_X, y: NODE_Y, w: NODE_1_W, h: NODE_H, label: 'Node-1' }),
    P.node({ x: NODE_2_X, y: NODE_Y, w: NODE_2_W, h: NODE_H, label: 'Node-2' }),
    P.box({ key: 'driver', x: DRV_X, y: DRV_Y, w: DRV_W, h: DRV_H, label: 'CSI driver and attach controller', sublabel: 'grants or refuses each attach' }),
    P.cylinder({ key: 'pvBlock', x: BLOCK_CX - PV_W / 2, y: PV_Y, w: PV_W, h: PV_H, label: 'PV block' }),
    P.cylinder({ key: 'pvNfs', x: NFS_CX - PV_W / 2, y: PV_Y, w: PV_W, h: PV_H, label: 'PV nfs' }),
    podBlock({ key: 'podA1', innerKey: 'appA1', x: P1_X, label: 'Pod app-1' }),
    podBlock({ key: 'podA2', innerKey: 'appA2', x: P2_X, label: 'Pod app-2' }),
    podBlock({ key: 'podB1', innerKey: 'appB1', x: P3_X, label: 'Pod app-3' }),
    P.lane({ points: W_P1_DRV, dashed: true, dim: true }),
    P.lane({ points: W_P2_DRV, dashed: true, dim: true }),
    P.lane({ points: W_P3_DRV, dashed: true, dim: true }),
    P.lane({ points: W_DRV_BLOCK, dashed: true, dim: true }),
    P.lane({ points: W_DRV_NFS_1, dashed: true, dim: true }),
    P.lane({ points: W_DRV_NFS_2, dashed: true, dim: true }),
    P.lane({ points: W_DRV_NFS_3, dashed: true, dim: true }),
    P.wire({ key: 'block', x: BLOCK_CX, y: VERDICT_Y }),
    P.wire({ key: 'nfs', x: NFS_CX, y: VERDICT_Y }),
    // Centered on the driver band it captions, so the caption tracks the band and not a literal x.
    P.wire({ key: 'drv', x: DRV_X + DRV_W / 2, y: 408 }),
    P.tag({ x: BLOCK_CX, y: SPEC_Y, text: 'block disk, single attach' }),
    P.tag({ x: NFS_CX, y: SPEC_Y, text: 'shared filesystem' }),
    P.chip({ key: 'modeChip', x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'accessModes', value: 'ReadWriteOnce' }),
    P.chip({ key: 'attachChip', x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'attached to', value: 'none' }),
    P.chip({ key: 'shareChip', x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'sharing', value: 'none' }),
    P.chip({ key: 'driverChip', x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'enforced by', value: 'CSI driver' }),
    P.packets(),
  ],
  reset: {
    keys: ['driver', 'pvBlock', 'pvNfs', 'appA1', 'appA2', 'appB1',
      'modeChip', 'attachChip', 'shareChip', 'driverChip'],
    pods: ['podA1', 'podA2', 'podB1'],
  },
};

const chips = (mode, attach, share, enforcer = 'CSI driver') =>
  ({ modeChip: mode, attachChip: attach, shareChip: share, driverChip: enforcer });

// STO.S-01 as a field: a refused Pod is dimmed and a granted one is not, so all three are stated on
// every step and nothing is inherited from the step before it.
const pods = (a1, a2, b1) => ({ podA1: a1, podA2: a2, podB1: b1 });

// One attach that succeeds: the Pod blinks first (it is the actor), the request rises to the driver,
// then the granted attach drops to the disk. The driver and the disk each light on arrival.
const grantMount = ({ name, pod, reqPts, attachPts, tag, disk, lead = 0 }) => [
  F.pulse({ pod, delay: lead }),
  F.route({ points: reqPts, delay: lead + BEAT.afterPulse, name: `${name}Req`, lights: ['driver'] }),
  F.route({ points: attachPts, after: `${name}Req`, name: `${name}Att` }),
  F.tag({ text: tag, points: attachPts, after: `${name}Req` }),
  F.light({ targets: [disk], at: `${name}Att` }),
];

// A refused attach reaches the gate and stops there, and no disk lights. The Pod still blinks first,
// in the dim variant with an opacity lift so the blink reads against the faded shade.
const denyMount = ({ name, pod, reqPts, tag, lead = 0 }) => [
  F.pulse({ pod, dim: true, delay: lead, from: OPACITY.pending, peak: 0.95 }),
  F.route({ points: reqPts, delay: lead + BEAT.afterPulse, name: `${name}Req` }),
  F.tag({ text: tag, points: reqPts, delay: lead + BEAT.afterPulse }),
  F.light({ targets: ['driver'], at: `${name}Req` }),
];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('ReadWriteOnce', 'none', 'none'),
    opacity: pods(1, 1, 1),          // idle: nobody is refused anything yet
  },
  {
    id: 'rwo-first',
    duration: 3100,
    narration: 'Pod app-1 mounts the volume. ReadWriteOnce attaches the disk to one Node, Node-1, and lets a Pod there read and write it. So far this looks exactly like a per-Pod lock, but that is not what ReadWriteOnce actually means.',
    chipsCued: chips('ReadWriteOnce', 'node-1', 'app-1'),
    wires: { block: 'attached: node-1' },
    opacity: pods(1, 1, 1),          // app-2 and app-3 are healthy, just not shown mounting
    flow: grantMount({ name: 'a1', pod: 'podA1', reqPts: W_P1_DRV, attachPts: W_DRV_BLOCK, tag: 'mount rw', disk: 'pvBlock' }),
  },
  {
    id: 'rwo-samenode',
    duration: 3100,
    narration: 'Pod app-2 sits on the same Node and it can mount the volume too. ReadWriteOnce is per Node, not per Pod. Once the disk is attached to Node-1, any number of Pods scheduled onto Node-1 can share it.',
    chipsCued: chips('ReadWriteOnce', 'node-1', 'app-1, app-2'),
    wires: { block: 'attached: node-1' },
    opacity: pods(1, 1, 1),          // app-3 is not refused until the next step
    flow: grantMount({ name: 'a2', pod: 'podA2', reqPts: W_P2_DRV, attachPts: W_DRV_BLOCK, tag: 'shares rw', disk: 'pvBlock' }),
  },
  {
    id: 'rwo-othernode',
    duration: 2600,
    narration: 'Pod app-3 lives on Node-2 and asks for the same volume. This one is refused. The disk is already attached to Node-1, and a block disk can be attached to only one Node at a time, so app-3 gets a Multi-Attach error and never starts.',
    chipsCued: chips('ReadWriteOnce', 'node-1', 'app-1, app-2'),
    wires: { block: 'attached: node-1', drv: 'held by node-1' },
    opacity: pods(1, 1, OPACITY.pending),        // app-3 refused: Multi-Attach
    // The block disk stays LIT on both paths: it is still attached to node-1 and it is the REASON
    // app-3 is refused, so leaving it unlit contradicts the wire label and the narration.
    lit: ['pvBlock'],
    flow: denyMount({ name: 'b1', pod: 'podB1', reqPts: W_P3_DRV, tag: 'Multi-Attach denied' }),
  },
  {
    id: 'rwop',
    duration: 2600,
    narration: 'ReadWriteOncePod is the strict one. Now even app-2 on the same Node is refused, because the volume is bound to a single Pod and nothing else. It is also the one mode Kubernetes enforces itself rather than leaving to the driver, and it is what you reach for when two Pods writing the same files would corrupt each other.',
    chipsCued: chips('ReadWriteOncePod', 'node-1', 'app-1 only', 'Kubernetes'),
    wires: { block: 'held by app-1', drv: 'one Pod only' },
    opacity: pods(1, OPACITY.pending, OPACITY.pending),      // RWOP refuses everyone but app-1
    lit: ['pvBlock'],
    flow: denyMount({ name: 'a2', pod: 'podA2', reqPts: W_P2_DRV, tag: 'RWOP refused' }),
  },
  {
    id: 'rwx-block',
    duration: 2600,
    narration: 'ReadWriteMany asks for the volume on many Nodes at once. On the block disk that request cannot be honoured at all: a raw block device simply cannot attach to more than one Node. Kubernetes will accept the access mode on the object, but the driver is where it fails.',
    // attach is 'none', not 'node-1': the narration says this request cannot be honoured at all, so
    // leaving the previous step's node-1 in the chip would have the strip contradict the sentence.
    chipsCued: chips('ReadWriteMany', 'none', 'none'),
    wires: { block: 'RWX unsupported', drv: 'block disk, no RWX' },
    opacity: pods(OPACITY.pending, OPACITY.pending, OPACITY.pending),    // RWX on a block disk: nobody gets it
    // BOTH nodes ask, because asking from many nodes at once is what ReadWriteMany means and what
    // this disk cannot do. A single request could not show the thing the step is about.
    flow: [
      ...denyMount({ name: 'a1', pod: 'podA1', reqPts: W_P1_DRV, tag: 'RWX unsupported' }),
      ...denyMount({ name: 'b1', pod: 'podB1', reqPts: W_P3_DRV, tag: 'RWX unsupported', lead: 220 }),
    ],
  },
  {
    id: 'rwx-nfs',
    duration: 3800,
    narration: 'Point the claim at a shared filesystem instead, PV nfs on NFS or CephFS, and ReadWriteMany works. The driver attaches it to both Nodes, and all three Pods mount it at once, on either Node, with nobody refused. The mode was always allowed by Kubernetes, what changed is a backend that can deliver it.',
    chipsCued: chips('ReadWriteMany', 'node-1, node-2', 'app-1, app-2, app-3'),
    wires: { nfs: 'attached: both nodes' },
    // Every Pod is at full opacity here: ReadWriteMany on a shared filesystem excludes nobody, so
    // there is no Pod left in the not-holding-it state that OPACITY.pending exists to mark.
    opacity: pods(1, 1, 1),
    flow: [
      ...grantMount({ name: 'a1', pod: 'podA1', reqPts: W_P1_DRV, attachPts: W_DRV_NFS_1, tag: 'mount rwx', disk: 'pvNfs' }),
      ...grantMount({ name: 'a2', pod: 'podA2', reqPts: W_P2_DRV, attachPts: W_DRV_NFS_2, tag: 'mount rwx', disk: 'pvNfs', lead: 200 }),
      ...grantMount({ name: 'b1', pod: 'podB1', reqPts: W_P3_DRV, attachPts: W_DRV_NFS_3, tag: 'mount rwx', disk: 'pvNfs', lead: 400 }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
