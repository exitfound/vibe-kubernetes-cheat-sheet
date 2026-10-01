import { P, F, defineCard, BEAT, FADE } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-volume-mode.md


// Two rows, one per claim, each running left to right from its disk into Node-1 and on to its Pod.
// The Filesystem row passes two stations and the Block row passes none: the gap is the subject.
const ROW_FS = 364, ROW_BLK = 514;                       // row centres, 150 apart

// A disk left of the panel wall has to sit under the panel bottom (L-03): its top is ROW_FS - 48.
const DISK_W = 150, DISK_H = 96;
const DISK_X = 40;                                       // mirrors the frame right edge 1160 about 600
const DISK_R = DISK_X + DISK_W;                          // 190
const DISK_CX = DISK_X + DISK_W / 2;                     // 115

// The frame starts left of the panel wall, which is legal because its top sits under the panel.
// Every lane from a disk stops on its left face, and the Node carries the story on from there.
const NODE_X = 300, NODE_R = 1160, NODE_PAD = 24, NODE_HEAD = 27;
const ST_W = 160, ST_H = 80, ST_GAP = 70;                // 160, not 232: see SIZES in the record
const POD_W = 232, POD_H = 104;                          // NET.L-01, 192 by 44 app box
const APP_W = 192, APP_H = 44, APP_DY = 26;
const POD_X = NODE_R - NODE_PAD - POD_W;                 // 904
const MNT_X = POD_X - ST_GAP - ST_W;                     // 674
const FMT_X = MNT_X - ST_GAP - ST_W;                     // 444
const NODE_W = NODE_R - NODE_X;                          // 860
const NODE_Y = ROW_FS - POD_H / 2 - NODE_HEAD;           // 285
// Foot = header, so the two rows sit +-75 about the left face midpoint 439, a mirrored pair (L-12).
const NODE_H = ROW_BLK + POD_H / 2 + NODE_HEAD - NODE_Y; // 308, bottom 593

// The four chips run along the top of the frame, one row exactly as wide as it, 16 above it.
const CHIP_H = 34, CHIP_GAP = 16, CHIP_COUNT = 4;
const CHIP_W = (NODE_W - CHIP_GAP * (CHIP_COUNT - 1)) / CHIP_COUNT;              // 203
const CHIPS_Y = NODE_Y - 16 - CHIP_H;                                            // 235
const chipX = (i) => NODE_X + i * (CHIP_W + CHIP_GAP);

// Captions ride 14 over a lane, and the mode captions hang 22 under each disk.
const CAP_DY = 14, MODE_DY = 22;
const GAP_CX = (DISK_R + NODE_X) / 2;                    // 245, the corridor between disk and frame
const SKIP_CX = (FMT_X + MNT_X + ST_W) / 2;              // 639, under the two stations

const run = (x1, x2, y) => [[x1, y], [x2, y]];
const W_FS_IN = run(DISK_R, NODE_X, ROW_FS);             // the blank device reaches Node-1
const W_FMT = run(NODE_X, FMT_X, ROW_FS);                // inside, on to the formatter
const W_MNT = run(FMT_X + ST_W, MNT_X, ROW_FS);          // the new filesystem goes to be mounted
const W_PUB = run(MNT_X + ST_W, POD_X, ROW_FS);          // bind mounted into web-0
const W_BLK_IN = run(DISK_R, NODE_X, ROW_BLK);           // the raw device reaches Node-1
const W_DEV = run(NODE_X, POD_X, ROW_BLK);               // Block: straight on, nothing between

const disk = (key, cy, label) => P.cylinder({
  key, x: DISK_X, y: cy - DISK_H / 2, w: DISK_W, h: DISK_H, label, labelY: DISK_H / 2 + 10,
});
const station = (key, x, label, sublabel) => P.box({
  key, x, y: ROW_FS - ST_H / 2, w: ST_W, h: ST_H, label, sublabel,
});
const pod = ({ key, innerKey, cy, label, sublabel, ctr, ctrSub }) => P.pod({
  key, innerKey, x: POD_X, y: cy - POD_H / 2, w: POD_W, h: POD_H, label, sublabel, containers: 0,
  inner: { dx: (POD_W - APP_W) / 2, dy: APP_DY, w: APP_W, h: APP_H, label: ctr, sublabel: ctrSub },
});
const chip = (i, key, name, value) => P.chip({ key, x: chipX(i), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name, value });

// Z-order is the list order: the frame, the disks, the two stations, the Pods, the lanes and their
// captions, the chip row, then the packet layer.
export const SCENE = {
  'aria-label': 'volumeMode decides what a Pod is handed. Two claims ask for the same size from the same StorageClass and differ only in volumeMode. Under Filesystem, the default, the CSI node service formats the blank device with mkfs, mounts it at a staging path on the Node and bind mounts it into the Pod, so the container finds a directory at the mountPath given under volumeMounts, where files, permissions, subPath and fsGroup have something to act on. Under Block neither step happens, and the device itself is published into the container at the devicePath given under volumeDevices, with no filesystem on it. The field cannot change once the claim exists and must match on the PersistentVolume and the claim.',
  parts: [
    P.defs(),
    P.node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1: CSI node service' }),
    disk('pvFs', ROW_FS, 'PV web 20Gi'),
    disk('pvBlk', ROW_BLK, 'PV db 20Gi'),
    station('fmt', FMT_X, 'Format', 'mkfs, only if blank'),
    station('mnt', MNT_X, 'Mount', 'at a staging path'),
    pod({
      key: 'podFs', innerKey: 'ctrFs', cy: ROW_FS,
      label: 'Pod web-0', sublabel: 'mountPath /data', ctr: 'app', ctrSub: 'volumeMounts',
    }),
    pod({
      key: 'podBlk', innerKey: 'ctrBlk', cy: ROW_BLK,
      label: 'Pod db-0', sublabel: 'devicePath /dev/xvda', ctr: 'DB', ctrSub: 'volumeDevices',
    }),
    ...[W_FS_IN, W_FMT, W_MNT, W_PUB, W_BLK_IN, W_DEV].map(points => P.lane({ points, dashed: true, dim: true })),
    // The one field the card is about never changes, so it is drawn from the poster frame on.
    P.tag({ x: DISK_CX, y: ROW_FS + DISK_H / 2 + MODE_DY, text: 'volumeMode: Filesystem' }),
    P.tag({ x: DISK_CX, y: ROW_BLK + DISK_H / 2 + MODE_DY, text: 'volumeMode: Block' }),
    P.wire({ key: 'fsLane', x: GAP_CX, y: ROW_FS - CAP_DY }),
    P.wire({ key: 'blkLane', x: GAP_CX, y: ROW_BLK - CAP_DY }),
    // Not a wire: it has to appear the moment the Block ball enters Node-1, and a wire takes no opacity.
    P.tag({ key: 'skipTag', x: SKIP_CX, y: ROW_BLK - CAP_DY, text: 'no mkfs, no mount', opacity: 0 }),
    chip(0, 'mkfsChip', 'mkfs ran on', 'not yet'),
    chip(1, 'webChip', 'web-0 sees', 'nothing yet'),
    chip(2, 'dbChip', 'db-0 sees', 'nothing yet'),
    chip(3, 'fsgChip', 'fsGroup, subPath', 'no files'),
    P.packets(),
  ],
  reset: {
    keys: ['pvFs', 'pvBlk', 'fmt', 'mnt', 'ctrFs', 'ctrBlk', 'mkfsChip', 'webChip', 'dbChip', 'fsgChip'],
    pods: ['podFs', 'podBlk'],
  },
};

// Every step writes every chip (P-01). A chip a ball earns starts from its old value on the played
// path and turns over on that ball's arrival (P-03).
const chips = (mkfs, web, db, fsg) => ({ mkfsChip: mkfs, webChip: web, dbChip: db, fsgChip: fsg });
// The skip caption is pinned on every step (STO.S-01): hidden until the Block ball enters Node-1.
const SKIP_OFF = { skipTag: 0 }, SKIP_ON = { skipTag: 1 };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('not yet', 'nothing yet', 'nothing yet', 'no files'),
    opacity: SKIP_OFF,
  },
  {
    id: 'claims',
    duration: 2600,
    narration: 'Two claims ask for the same 20Gi from the same StorageClass, and each binds its own blank disk. Only one field differs: volumeMode is Filesystem for web-0, which is also what an absent field means, and Block for db-0.',
    chipsCued: chips('not yet', 'nothing yet', 'nothing yet', 'no files'),
    opacity: SKIP_OFF,
    // Nothing travels yet: the two disks are the whole statement, so they light and hold.
    lit: ['pvFs', 'pvBlk'],
  },
  {
    id: 'format',
    duration: 3000,
    narration: 'Pod web-0 is scheduled to Node-1, and the CSI node service stages its volume first. The device has no filesystem yet, so mkfs runs here and creates one, of the fsType set on the volume, often ext4. A disk that already holds a filesystem is left as it is.',
    chipsCued: chips('web-0 disk', 'nothing yet', 'nothing yet', 'no files'),
    wires: { fsLane: 'blank device' },
    opacity: SKIP_OFF,
    rewind: { chips: { mkfsChip: 'not yet' } },
    // The disk sends, so it is lit from entry (M-18a). The ball stops on the Node, then carries on
    // inside it to the formatter, which lights on arrival.
    lit: ['pvFs'],
    flow: [
      F.route({ points: W_FS_IN, delay: BEAT.lead, name: 'in' }),
      F.route({ points: W_FMT, after: 'in', name: 'fmt' }),
      F.light({ targets: ['fmt'], at: 'fmt' }),
      F.set({ at: 'fmt', chipsCued: { mkfsChip: 'web-0 disk' } }),
    ],
  },
  {
    id: 'mount',
    duration: 2600,
    narration: 'Still staging, the CSI node service mounts the new filesystem at a staging path on Node-1, once for the whole Node. Every Pod there that uses this volume is served from that one mount.',
    chipsCued: chips('web-0 disk', 'nothing yet', 'nothing yet', 'no files'),
    wires: { fsLane: 'ext4 on disk' },
    opacity: SKIP_OFF,
    lit: ['fmt'],
    flow: [
      F.route({ points: W_MNT, delay: BEAT.lead, name: 'mnt' }),
      F.light({ targets: ['mnt'], at: 'mnt' }),
    ],
  },
  {
    id: 'publish-dir',
    duration: 3000,
    narration: 'Then it publishes the volume into Pod web-0 with a bind mount, and the container finds an ordinary directory at the mountPath from its volumeMounts, /data. Files, permissions, subPath and the fsGroup ownership change all have something to act on here, because there is a filesystem.',
    chipsCued: chips('web-0 disk', 'directory /data', 'nothing yet', 'on web-0'),
    wires: { fsLane: 'ext4 on disk' },
    opacity: SKIP_OFF,
    rewind: { chips: { webChip: 'nothing yet', fsgChip: 'no files' } },
    // Infra reaching a Pod, so DOWN-ARROW ordering: the ball flies first, the Pod pulses on arrival.
    lit: ['mnt'],
    flow: [
      F.route({ points: W_PUB, delay: BEAT.lead, name: 'pub' }),
      F.pulse({ pod: 'podFs', at: 'pub' }),
      F.set({ at: 'pub', chipsCued: { webChip: 'directory /data', fsgChip: 'on web-0' } }),
    ],
  },
  {
    id: 'publish-device',
    duration: 4400,
    narration: 'Pod db-0 lands on the same Node and meets the same CSI node service, but Block skips both of those steps: no mkfs and no mount. The device itself is published into the container at the devicePath from volumeDevices, /dev/xvda, exactly as the backend delivered it.',
    chipsCued: chips('web-0 disk', 'directory /data', 'device /dev/xvda', 'on web-0'),
    wires: { fsLane: 'ext4 on disk', blkLane: 'raw device' },
    opacity: SKIP_ON,
    rewind: { chips: { dbChip: 'nothing yet' } },
    // The ball enters Node-1 and the skip caption comes up on that arrival. Then one long hop under
    // the two stations it never enters: routeDur puts the 604 unit lane at about 1340ms.
    lit: ['pvBlk'],
    flow: [
      F.route({ points: W_BLK_IN, delay: BEAT.lead, name: 'in' }),
      F.fade({ target: 'skipTag', from: 0, to: 1, dur: FADE.in, at: 'in', fill: 'both', easing: 'ease-out' }),
      F.route({ points: W_DEV, after: 'in', name: 'dev' }),
      F.pulse({ pod: 'podBlk', at: 'dev' }),
      F.set({ at: 'dev', chipsCued: { dbChip: 'device /dev/xvda' } }),
    ],
  },
  {
    id: 'trade',
    duration: 3000,
    narration: 'That is the trade. Pod db-0 gets the bare device and manages its own layout, while fsGroup and subPath have nothing to act on and there are no files inside it to set permissions on. The volumeMode field is fixed once the claim exists and must match the volume, so it is chosen up front.',
    chipsCued: chips('web-0 disk', 'directory /data', 'device /dev/xvda', 'on web-0'),
    wires: { fsLane: 'ext4 on disk', blkLane: 'raw device' },
    opacity: SKIP_ON,
    // A closing step to sit on: the two layers Block goes without light and hold, with no motion.
    lit: ['fmt', 'mnt'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
