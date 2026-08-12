import { P, F, defineCard, BEAT, laneY } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-volume-mode


const LEFT_X = 400;

const NODE_Y = 55, NODE_H = 186;
const NODE_PAD = 16;
const POD_Y = 82, POD_W = 164, POD_H = 126;
const POD_BOTTOM = POD_Y + POD_H;                        // 208
const POD_GAP = 40;

const NODE_X = LEFT_X;
const NODE_W = NODE_PAD * 2 + POD_W * 2 + POD_GAP;       // 400
const CONTENT_CX = NODE_X + NODE_W / 2;                  // 600: canvas center, and every tier uses it

const P1_X = NODE_X + NODE_PAD;                          // 416, the Filesystem column
const P2_X = P1_X + POD_W + POD_GAP;                     // 620, the Block column
const FS_CX = P1_X + POD_W / 2;                          // 498
const BLK_CX = P2_X + POD_W / 2;                         // 702, and (498 + 702) / 2 == CONTENT_CX

const BAND_X = LEFT_X, BAND_Y = 305, BAND_W = NODE_W, BAND_H = 70;
const BAND_TOP = BAND_Y, BAND_BOTTOM = BAND_Y + BAND_H;  // 305 / 375
const BAND_LBL_Y = 408;

const PV_Y = 442, PV_H = 96, PV_W = 176;
const PV_TOP = PV_Y;                                     // 442
const DISK_LBL_Y = 566;
const CHIPS_Y = 590;

const CHIP_W = 232;
const CHIP_GAP = 16;
const CHIP_COUNT = 4;                  // volumeMode / node does / container / fsGroup
const CHIPS_W = CHIP_W * CHIP_COUNT + CHIP_GAP * (CHIP_COUNT - 1);   // 976
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CONTENT_CX - CHIPS_W / 2 + i * (CHIP_W + CHIP_GAP));

// Each column's two lanes are a mirrored pair about the column centre: `out` carries the descending
// run, `back` the ascending one, so a mount rising never re-uses the arrow the request came down on.
const LANE = 12;
const FS = laneY(FS_CX, LANE);                           // 486 / 510
const BLK = laneY(BLK_CX, LANE);                         // 690 / 714
const run = (x, y1, y2) => [[x, y1], [x, y2]];

const W_FS_ASK   = run(FS.out,  POD_BOTTOM,  BAND_TOP);  // Pod states what it wants
const W_FS_PUB   = run(FS.back, BAND_TOP,    POD_BOTTOM);// node service hands it back
const W_FS_STAGE = run(FS.out,  BAND_BOTTOM, PV_TOP);    // stage: mkfs then mount
const W_FS_DEV   = run(FS.back, PV_TOP,      BAND_BOTTOM);// the disk answers
const W_BLK_ASK   = run(BLK.out,  POD_BOTTOM,  BAND_TOP);
const W_BLK_PUB   = run(BLK.back, BAND_TOP,    POD_BOTTOM);
const W_BLK_STAGE = run(BLK.out,  BAND_BOTTOM, PV_TOP);
const W_BLK_DEV   = run(BLK.back, PV_TOP,      BAND_BOTTOM);

// The two Pods differ only in x, name and what they consume the volume under.
const podBlock = ({ key, innerKey, x, label, sublabel, ctr, ctrSub }) => P.pod({
  key, innerKey, x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel, containers: 0,
  inner: { dx: 14, dy: 44, w: POD_W - 28, h: 52, label: ctr, sublabel: ctrSub },
});

// The list order IS the append order, which is the z-order: the node frame, then the band and the
// two disks, then the Pods above their own frame, then the lanes and their captions, then the chip
// strip, then the packet layer.
export const SCENE = {
  'aria-label': 'volumeMode decides what a Pod is handed. Under Filesystem, the default, the CSI node service formats the device with mkfs if it has no filesystem yet, mounts it, and the container finds an ordinary directory at the mountPath given under volumeMounts, where file permissions and the fsGroup ownership walk apply. Under Block nothing is formatted and nothing is mounted: the raw device is published into the container at the devicePath given under volumeDevices, and every filesystem level feature stops applying. The field is immutable and must match on the PersistentVolume and the claim.',
  parts: [
    P.defs(),
    P.node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.box({
      key: 'band', x: BAND_X, y: BAND_Y, w: BAND_W, h: BAND_H,
      label: 'Kubelet and CSI Node Service', sublabel: 'stages the volume, then publishes it',
    }),
    // Two identical disks. The label carries the size so the card never has to claim in prose that
    // they are the same: the reader can see it. The primitive centers the label on the raw bbox,
    // which reads high because the top cap ellipse is not part of the visible front face.
    P.cylinder({ key: 'pvFs', x: FS_CX - PV_W / 2, y: PV_Y, w: PV_W, h: PV_H, label: 'PV-web 20Gi', labelY: PV_H / 2 + 10 }),
    P.cylinder({ key: 'pvBlk', x: BLK_CX - PV_W / 2, y: PV_Y, w: PV_W, h: PV_H, label: 'PV-db 20Gi', labelY: PV_H / 2 + 10 }),
    podBlock({
      key: 'podFs', innerKey: 'ctrFs', x: P1_X,
      label: 'Pod web-0', sublabel: 'volumeMode: Filesystem', ctr: 'app', ctrSub: 'volumeMounts',
    }),
    podBlock({
      key: 'podBlk', innerKey: 'ctrBlk', x: P2_X,
      label: 'Pod db-0', sublabel: 'volumeMode: Block', ctr: 'DB', ctrSub: 'volumeDevices',
    }),
    ...[W_FS_ASK, W_FS_PUB, W_FS_STAGE, W_FS_DEV, W_BLK_ASK, W_BLK_PUB, W_BLK_STAGE, W_BLK_DEV]
      .map(points => P.lane({ points, dashed: true, dim: true })),
    P.wire({ key: 'fs', x: FS_CX, y: DISK_LBL_Y }),
    P.wire({ key: 'blk', x: BLK_CX, y: DISK_LBL_Y }),
    P.wire({ key: 'band', x: CONTENT_CX, y: BAND_LBL_Y }),
    P.chip({ key: 'modeChip', x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'volumeMode', value: 'Filesystem' }),
    P.chip({ key: 'nodeChip', x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'node does', value: 'nothing yet' }),
    P.chip({ key: 'ctrChip', x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'container', value: 'nothing yet' }),
    P.chip({ key: 'fsgChip', x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'fsGroup', value: 'applied' }),
    P.packets(),
  ],
  reset: {
    keys: ['band', 'pvFs', 'pvBlk', 'ctrFs', 'ctrBlk', 'modeChip', 'nodeChip', 'ctrChip', 'fsgChip'],
    pods: ['podFs', 'podBlk'],
  },
};

// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a
// card comes to display 'mkfs then mount' on the step that is explaining that Block never formats.
// All four go through setChip, so all four are chipsCued. Argument order is the old helper's.
const chips = (mode, nodeDoes, container, fsgroup) => ({
  modeChip: mode, nodeChip: nodeDoes, ctrChip: container, fsgChip: fsgroup,
});

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('Filesystem', 'nothing yet', 'nothing yet', 'applied'),
  },
  {
    id: 'fs-claim',
    duration: 2900,
    narration: 'Pod web-0 takes the default. A volumeMode of Filesystem is what you get whenever the field is absent, and it is what almost every workload wants. The Pod consumes the volume under volumeMounts, naming a mountPath, and what it expects to find at that path is a directory.',
    chipsCued: chips('Filesystem', 'nothing yet', 'nothing yet', 'applied'),
    wires: { fs: 'no filesystem yet' },
    // The Pod states what it wants: the Pod blinks first (it is the actor), then the request drops
    // to the node service, which lights on arrival. The cue is its OWN entry because it stood after
    // the tag, and that order is observable.
    flow: [
      F.pulse({ pod: 'podFs' }),
      F.route({ points: W_FS_ASK, delay: BEAT.afterPulse, name: 'ask' }),
      F.tag({ text: 'wants a path', points: W_FS_ASK, delay: BEAT.afterPulse }),
      F.light({ targets: ['band'], at: 'ask' }),
    ],
  },
  {
    id: 'fs-format',
    duration: 2900,
    narration: 'Before anything can be mounted the CSI node service stages the volume. If the device carries no filesystem yet, this is where mkfs runs and creates one, ext4 unless the StorageClass asks for something else. It happens once, on first use, and a disk that already holds data is left alone.',
    chipsCued: chips('Filesystem', 'mkfs then mount', 'nothing yet', 'applied'),
    wires: { fs: 'ext4 created', band: 'stage: mkfs then mount' },
    lit: ['band'],
    // The node service acts on the disk. No Pod is involved, so nothing pulses: the ball leaves
    // after BEAT.lead so the lit band registers before it departs, and the disk lights on arrival.
    // The disk then hands the formatted device back, as the block branch beside it already draws.
    // Without it the fs branch stages onto the disk and mounts a device it never received.
    flow: [
      F.route({ points: W_FS_STAGE, delay: BEAT.lead, name: 'staged' }),
      F.tag({ text: 'mkfs ext4', points: W_FS_STAGE, delay: BEAT.lead }),
      F.light({ targets: ['pvFs'], at: 'staged' }),
      F.route({ points: W_FS_DEV, after: 'staged', name: 'handed' }),
      F.tag({ text: 'ext4 device', points: W_FS_DEV, after: 'staged' }),
      F.light({ targets: ['band'], at: 'handed' }),
    ],
  },
  {
    id: 'fs-mount',
    duration: 3400,
    narration: 'Now the staged filesystem is mounted into the container at /data, and inside the container that is an ordinary directory. Files, directory permissions and the fsGroup ownership walk all apply here, because there is a filesystem for Kubernetes to apply them to.',
    chipsCued: chips('Filesystem', 'mounted on node', 'directory /data', 'applied'),
    wires: { fs: 'ext4', band: 'mount into the Pod' },
    lit: ['band', 'pvFs'],
    // Infra reaching a Pod, so DOWN-ARROW ordering: the ball flies first and the Pod pulses on its
    // arrival. Nothing lights, so the reduced path shows no cue here.
    flow: [
      F.route({ points: W_FS_PUB, delay: BEAT.lead, name: 'mounted' }),
      F.tag({ text: 'mount at /data', points: W_FS_PUB, delay: BEAT.lead }),
      F.pulse({ pod: 'podFs', at: 'mounted' }),
    ],
  },
  {
    id: 'block-claim',
    duration: 2900,
    narration: 'Pod db-0 asks for an identical disk with volumeMode set to Block. Nothing about the storage request changed: same size, same class, same backend. What changed is that the Pod consumes it under volumeDevices with a devicePath, instead of volumeMounts with a mountPath.',
    chipsCued: chips('Block', 'nothing yet', 'nothing yet', 'not applied'),
    wires: { blk: 'raw, unformatted' },
    flow: [
      F.pulse({ pod: 'podBlk' }),
      F.route({ points: W_BLK_ASK, delay: BEAT.afterPulse, name: 'ask' }),
      F.tag({ text: 'wants the device', points: W_BLK_ASK, delay: BEAT.afterPulse }),
      F.light({ targets: ['band'], at: 'ask' }),
    ],
  },
  {
    id: 'block-publish',
    duration: 4200,
    narration: 'No mkfs and no mount. The node service publishes the device itself into the container, so the disk arrives exactly as the backend handed it over, unformatted and untouched. The container finds a raw block device at /dev/xvda, and everything above the first byte is now its own business.',
    chipsCued: chips('Block', 'no mkfs, no mount', 'device /dev/xvda', 'not applied'),
    wires: { blk: 'raw, unformatted', band: 'publish the device' },
    // The band receives the device before it publishes it, and the cue below already lights it on
    // that arrival. Lighting it from entry too made the arrival invisible.
    lit: ['pvBlk'],
    // Two chained hops: the untouched device rises from the disk to the node service, which passes
    // it straight on into the container without doing anything to it.
    flow: [
      F.route({ points: W_BLK_DEV, delay: BEAT.lead, name: 'up' }),
      F.tag({ text: 'device as is', points: W_BLK_DEV, delay: BEAT.lead }),
      F.light({ targets: ['band'], at: 'up' }),
      F.route({ points: W_BLK_PUB, after: 'up', name: 'published' }),
      F.tag({ text: 'at /dev/xvda', points: W_BLK_PUB, after: 'up' }),
      F.pulse({ pod: 'podBlk', at: 'published' }),
    ],
  },
  {
    id: 'trade',
    duration: 3800,
    narration: 'That is the trade. A database that manages its own layout gets the device with no filesystem in the way, and in exchange every filesystem level feature stops working: fsGroup has no ownership to walk, subPath has no paths to choose from, and file permissions have no files. The volumeMode field is also immutable once the claim exists, and a claim asking for Block will never bind to a volume offering Filesystem, so this is a decision you make when you create the claim.',
    chipsCued: chips('Block', 'no mkfs, no mount', 'device /dev/xvda', 'not applied'),
    wires: { fs: 'ext4', blk: 'raw, unformatted', band: 'set once, must match' },
    // The summary compares the two columns, so BOTH disks light: static highlight only and
    // deliberately no motion, because it is a closing step the reader is meant to sit and read.
    lit: ['pvFs', 'pvBlk'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
