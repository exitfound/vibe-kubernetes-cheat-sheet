import { P, F, defineCard, BEAT, STO } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-recursive-readonly.md

// Two columns, one per tree level: the directory left, its submount right. The container view is the
// upper row, the host tree the Node frame below it. The tree centres on 630 to stay clear of the panel.
const BOX_W = 232, BOX_H = 80;
const TREE_CX = 630;
const TOP_CX = TREE_CX - 160, SUB_CX = TREE_CX + 160;              // the two tree columns
const TOP_X = TOP_CX - BOX_W / 2, SUB_X = SUB_CX - BOX_W / 2;

// The catalog Pod (NET.L-01), centred between the two columns so each write lane runs before it turns.
const POD_W = 232, POD_H = 104, POD_Y = 56;
const POD_X = TREE_CX - POD_W / 2;
const POD_MY = POD_Y + POD_H / 2;
const APP_W = 192, APP_H = 44, APP_DY = 26;
const VIEW_Y = 288, VIEW_B = VIEW_Y + BOX_H;                       // under the panel floor

// The Node frame holds the host tree on the same two columns, 24 of padding each side, the catalog 34
// label band and 12 floor.
const NODE_X = TOP_X - 24, NODE_Y = 424, NODE_W = SUB_X + BOX_W + 24 - NODE_X, NODE_H = 34 + BOX_H + 12;
const HOST_Y = NODE_Y + 34, HOST_MY = HOST_Y + BOX_H / 2;

// The requirements ladder under the panel on the left. The two chips stand beside the Pod whose spec
// and status they are, mirrored to the ladder about 600.
const LADDER_X = 40, LADDER_Y = 346, LADDER_W = 256, ROW_GAP = 8;
const CHIP_X = 1200 - LADDER_X - STO.CHIP_W;
const SPEC_Y = POD_MY - 6 - STO.CHIP_H, STATUS_Y = POD_MY + 6;     // centred on the Pod
const BRANCH_Y = NODE_Y + NODE_H + 28;                             // step 5 counterfactual (T-35)

// Each static wire and its ball share one array. The Pod sends by its side faces, so both write
// lanes are a mirrored L into the top face of their view. The drops end on the Node frame face (A-21).
const W_TOP = [[POD_X, POD_MY], [TOP_CX, POD_MY], [TOP_CX, VIEW_Y]];
const W_SUB = [[POD_X + POD_W, POD_MY], [SUB_CX, POD_MY], [SUB_CX, VIEW_Y]];
const W_DOWN = [[SUB_CX, VIEW_B], [SUB_CX, NODE_Y]];
const BIND = [[TOP_CX, VIEW_B], [TOP_CX, NODE_Y]];
const UNDER = [[TOP_X + BOX_W, HOST_MY], [SUB_X, HOST_MY]];

// A tagged write rides LEG_DUR, not routeDur. The tag trails on the side away from the Pod, so it stops
// over the view roof.
const LEG_DUR = 1500;
const TOP_TAG = { dx: -30, dy: -14 };
const SUB_TAG = { dx: 30, dy: -14 };

// Z-order (bottom -> top): the Node frame, the Pod, the views and the host boxes, the relations
// and lanes, the captions, the ladder, the chips, then the packet layer.
export const SCENE = {
  'aria-label': 'Recursive read-only mounts: Pod rro mounts the Node directory /mnt at /data with readOnly true, and the Node has a tmpfs mounted read-write at /mnt/tmpfs, which the container sees at /data/tmpfs. A write to /data is refused, but a write to /data/tmpfs succeeds and lands in the tmpfs on the Node, because a read-only mount is not recursively read-only by default. With recursiveReadOnly Enabled the same write is refused, which needs readOnly true, mountPropagation None or unset, a Linux kernel 5.12 or later and CRI and OCI runtime support. IfPossible falls back to Disabled when the kernel or runtime lacks support, and the status field reports which one applied.',
  parts: [
    P.defs(),
    P.node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'pod', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod rro', sublabel: 'volume mnt: hostPath /mnt', containers: 0,
      inner: { dx: (POD_W - APP_W) / 2, dy: APP_DY, w: APP_W, h: APP_H, label: 'app', sublabel: 'container' }, innerKey: 'appBox',
    }),
    P.box({ key: 'viewTop', x: TOP_X, y: VIEW_Y, w: BOX_W, h: BOX_H, label: '/data', sublabel: 'readOnly: true' }),
    P.box({ key: 'viewSub', x: SUB_X, y: VIEW_Y, w: BOX_W, h: BOX_H, label: '/data/tmpfs', sublabel: 'tmpfs submount' }),
    P.box({ key: 'hostDir', x: TOP_X, y: HOST_Y, w: BOX_W, h: BOX_H, label: '/mnt', sublabel: 'hostPath directory' }),
    P.box({ key: 'hostTmp', x: SUB_X, y: HOST_Y, w: BOX_W, h: BOX_H, label: '/mnt/tmpfs', sublabel: 'tmpfs, read-write' }),
    // No write ever reaches the Node through the directory itself, so its bind is a relationship.
    P.relation({ key: 'bindRel', points: BIND }),
    P.relation({ key: 'underRel', points: UNDER }),
    P.lane({ key: 'wTop', points: W_TOP, dashed: true, dim: true }),
    P.lane({ key: 'wSub', points: W_SUB, dashed: true, dim: true }),
    P.lane({ key: 'wDown', points: W_DOWN, dashed: true, dim: true }),
    P.tag({ x: TOP_CX + 12, y: (VIEW_B + NODE_Y) / 2 + 4, anchor: 'start', text: 'bind mount' }),
    P.tag({ x: LADDER_X, y: LADDER_Y - 12, anchor: 'start', text: 'recursiveReadOnly: Enabled needs all five' }),
    P.chain({
      key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: STO.CHIP_H, gap: ROW_GAP,
      items: [
        '1. readOnly: true',
        '2. mountPropagation: None or unset',
        '3. Linux kernel 5.12 or later',
        '4. CRI runtime supports it',
        '5. OCI runtime supports it',
      ],
    }),
    P.wire({ key: 'branch', x: TREE_CX, y: BRANCH_Y, anchor: 'middle' }),
    P.chip({ key: 'specChip', x: CHIP_X, y: SPEC_Y, w: STO.CHIP_W, h: STO.CHIP_H, name: 'recursiveReadOnly', value: 'Disabled' }),
    P.chip({ key: 'statusChip', x: CHIP_X, y: STATUS_Y, w: STO.CHIP_W, h: STO.CHIP_H, name: 'status', value: 'Disabled' }),
    P.packets(),
  ],
  reset: {
    keys: ['viewTop', 'viewSub', 'hostDir', 'hostTmp', 'specChip', 'statusChip'],
    pods: ['pod'],
  },
};

// STO.S-01 as a field: nothing is born or removed, so every lane and relation is pinned at full.
const STAGE = { pod: 1, bindRel: 1, underRel: 1, wTop: 1, wSub: 1, wDown: 1 };
// The chips and the ladder turn over when the recreated Pod starts, so they are written by setVal
// and cued by F.light on that beat: a cued write in the static block would light them at entry.
const OFF = { specChip: 'Disabled', statusChip: 'Disabled' };
const ON = { specChip: 'Enabled', statusChip: 'Enabled' };
const FELL_BACK = { specChip: 'IfPossible', statusChip: 'Disabled' };
const SUB_IDLE = { viewTop: 'readOnly: true', viewSub: 'tmpfs submount', hostTmp: 'tmpfs, read-write' };
const HOLDS_X = { viewTop: 'readOnly: true', hostTmp: 'holds x' };
// When the submount pair lights on the mount step, as its sentence begins.
const SUBMOUNT_AT = 2000;
// On the two recreate steps the write leaves one beat after the verdict it tests.
const WRITE_AT = BEAT.afterPulse + BEAT.lead;

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: OFF,
    sublabels: SUB_IDLE,
    opacity: STAGE,
    chain: -1,
  },
  {
    id: 'mount',
    duration: 4200,
    narration: 'A volume is mounted readOnly, so why can a container still write under it? Pod rro mounts the Node directory /mnt at /data with readOnly: true. The Node also has a tmpfs mounted read-write at /mnt/tmpfs, and the container sees it at /data/tmpfs. The recursiveReadOnly field is not set, so it is Disabled, the default, and none of the five checks apply.',
    chips: OFF,
    sublabels: SUB_IDLE,
    opacity: STAGE,
    chain: -1,
    // The Pod blinks, then each mount lights as the narration names it: the directory pair, then
    // the submount pair on its own sentence.
    flow: [
      F.pulse({ pod: 'pod' }),
      F.light({ targets: ['viewTop', 'hostDir'], delay: BEAT.afterPulse }),
      F.light({ targets: ['viewSub', 'hostTmp'], delay: SUBMOUNT_AT }),
    ],
  },
  {
    id: 'top',
    duration: 4000,
    narration: 'The app writes /data/a. That path is on the read-only mount itself, so the write is refused as a read-only file system and nothing reaches the Node.',
    chips: OFF,
    sublabels: { ...SUB_IDLE, viewTop: 'write refused' },
    rewind: { sublabels: { viewTop: 'readOnly: true' } },
    opacity: STAGE,
    chain: -1,
    flow: [
      F.pulse({ pod: 'pod' }),
      F.route({ points: W_TOP, delay: BEAT.afterPulse, dur: LEG_DUR, name: 'write', lights: ['viewTop'], tag: { text: 'write a', ...TOP_TAG } }),
      F.set({ at: 'write', sublabels: { viewTop: 'write refused' } }),
    ],
  },
  {
    id: 'below',
    duration: 4800,
    narration: 'The app writes /data/tmpfs/x and it succeeds. On Linux a read-only mount is not recursively read-only by default, so the tmpfs mounted read-write below it stays writable, and x lands in the tmpfs on the Node.',
    chips: OFF,
    sublabels: { ...HOLDS_X, viewSub: 'write accepted', hostTmp: 'x written here' },
    rewind: { sublabels: SUB_IDLE },
    opacity: STAGE,
    chain: -1,
    flow: [
      F.pulse({ pod: 'pod' }),
      F.route({ points: W_SUB, delay: BEAT.afterPulse, dur: LEG_DUR, name: 'write', lights: ['viewSub'], tag: { text: 'write x', ...SUB_TAG } }),
      F.set({ at: 'write', sublabels: { viewSub: 'write accepted' } }),
      F.route({ points: W_DOWN, after: 'write', name: 'land', lights: ['hostTmp'] }),
      F.set({ at: 'land', sublabels: { hostTmp: 'x written here' } }),
    ],
  },
  {
    id: 'enabled',
    duration: 5000,
    narration: 'A Pod cannot change its volumeMounts, so the Pod is recreated with recursiveReadOnly: Enabled next to readOnly: true, and mountPropagation left unset. All five checks hold on this Node, so the whole tree under /data is read-only. The same write to /data/tmpfs/x is refused, and the status reports Enabled.',
    chips: ON,
    sublabels: { ...HOLDS_X, viewSub: 'write refused' },
    chain: 'all',
    rewind: { chips: OFF, sublabels: { viewSub: 'tmpfs submount' }, chain: -1 },
    opacity: STAGE,
    flow: [
      F.pulse({ pod: 'pod' }),
      F.set({ delay: BEAT.afterPulse, name: 'start', chips: ON, chain: 'all' }),
      F.light({ targets: ['specChip', 'statusChip'], at: 'start' }),
      F.route({ points: W_SUB, delay: WRITE_AT, dur: LEG_DUR, name: 'write', lights: ['viewSub'], tag: { text: 'write x', ...SUB_TAG } }),
      F.set({ at: 'write', sublabels: { viewSub: 'write refused' } }),
    ],
  },
  {
    id: 'ifpossible',
    duration: 5600,
    narration: 'Enabled is strict: if instead Node-1 had a kernel older than 5.12, or a CRI or OCI runtime without support, the container would not start. IfPossible falls back to Disabled there. Checks 1 and 2 hold but not all of 3 to 5, so the write to /data/tmpfs/x is accepted and lands in the Node tmpfs again, and the status, Disabled, is the only sign on the Pod.',
    chips: FELL_BACK,
    sublabels: { ...HOLDS_X, viewSub: 'write accepted', hostTmp: 'x written here' },
    wires: { branch: 'if instead Node-1 lacks kernel or runtime support' },
    chain: [0, 1],
    rewind: { chips: ON, sublabels: { viewSub: 'tmpfs submount', hostTmp: 'holds x' }, chain: 'all' },
    opacity: STAGE,
    flow: [
      F.pulse({ pod: 'pod' }),
      F.set({ delay: BEAT.afterPulse, name: 'start', chips: FELL_BACK, chain: [0, 1] }),
      F.light({ targets: ['specChip', 'statusChip'], at: 'start' }),
      F.route({ points: W_SUB, delay: WRITE_AT, dur: LEG_DUR, name: 'write', lights: ['viewSub'], tag: { text: 'write x', ...SUB_TAG } }),
      F.set({ at: 'write', sublabels: { viewSub: 'write accepted' } }),
      F.route({ points: W_DOWN, after: 'write', name: 'land', lights: ['hostTmp'] }),
      F.set({ at: 'land', sublabels: { hostTmp: 'x written here' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
