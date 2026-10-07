import { P, F, defineCard, BEAT, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-attach-mount-chain.md


// COL_W is solved from the margin and the gutter, so both columns and the ladder re-size together.
const M = 60, GUTTER = 48;
const COL_W = (1200 - 2 * M - GUTTER) / 2;

// The catalog ladder rhythm, its foot 2 above the node frame floor.
const LAD_ROW = 32, LAD_GAP = 10;

// Controller side left, Node side right is the division the four calls are about.
// The staging band is not an actor (NET.L-01): it is sized by the node inner width.
const BLOCK_W = 232, BLOCK_H = 80;
const CTRL_W = BLOCK_W, CTRL_H = BLOCK_H;
const CTRL_X = M, CTRL_Y = 268;
const CTRL_RIGHT = CTRL_X + CTRL_W;
const CTRL_CY = CTRL_Y + CTRL_H / 2;

const NF_X = M + COL_W + GUTTER, NF_W = COL_W;
const NODE_PAD = 16;
const NODE_CX = NF_X + NF_W / 2;                          // every tier below is symmetric on this
const IN_X = NF_X + NODE_PAD, IN_W = NF_W - NODE_PAD * 2;

const DISK_W = 150;
const DISK_X = IN_X + IN_W - DISK_W;
const DISK_CX = DISK_X + DISK_W / 2;                      // shared by the cloud disk and the device
const CDISK_Y = 44, CDISK_H = 104;
const CDISK_BOTTOM = CDISK_Y + CDISK_H;
const CDISK_FACE_CY = CDISK_Y + CDISK_H / 2;

const DEV_Y = 212, DEV_H = 92;
const DEV_TOP = DEV_Y, DEV_BOTTOM = DEV_Y + DEV_H;

// The node plugin sits apart from the controller: the two node calls run in a different process.
const ND_X = IN_X, ND_Y = 220, ND_W = BLOCK_W, ND_H = BLOCK_H;

const STG_X = IN_X, STG_Y = 350, STG_W = IN_W, STG_H = 58;
const STG_TOP = STG_Y, STG_BOTTOM = STG_Y + STG_H;

const POD_W = BLOCK_W, POD_H = 104;
const APP_W = 192, APP_H = 44, APP_DY = 26;
const POD_Y = 454;
const PODA_X = NODE_CX - POD_W / 2;
const PODA_CX = NODE_CX;

// The catalog frame padding, 34 over the device and 12 under the Pod. The ladder and chips follow it.
const NF_Y = DEV_Y - 34;
const NF_BOTTOM = POD_Y + POD_H + 12;
const NF_H = NF_BOTTOM - NF_Y;
const LAD_X = M, LAD_W = COL_W, LAD_Y = NF_BOTTOM - 2 - 4 * LAD_ROW - 3 * LAD_GAP;

const CHIPS_Y = NF_BOTTOM + 16, CHIP_H = 34, CHIP_GAP = 16, CHIP_COUNT = 4;
const CHIPS_W = 2 * COL_W + GUTTER;
const CHIP_W = (CHIPS_W - CHIP_GAP * (CHIP_COUNT - 1)) / CHIP_COUNT;
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) => M + i * (CHIP_W + CHIP_GAP));

// The publish lane drops down NODE_CX, so the band caption starts just right of it.
const STG_LBL_X = NODE_CX + 14, STG_LBL_Y = 434;

const STAGE_ELBOW_Y  = (DEV_BOTTOM + STG_TOP) / 2;
// The staging mount top face takes a mirrored lane pair: the node driver owns it, the device feeds it.
const OWNS_X = ND_X + ND_W / 2;
const STAGE_IN_X = 2 * NODE_CX - OWNS_X;
// CreateVolume turns up out of the panel reach and crosses above the Node frame.
const CREATE_TURN_X = 520;

const W_CREATE  = [[CTRL_RIGHT, CTRL_CY], [CREATE_TURN_X, CTRL_CY], [CREATE_TURN_X, CDISK_FACE_CY], [DISK_X, CDISK_FACE_CY]];
const W_ATTACH  = [[DISK_CX, CDISK_BOTTOM], [DISK_CX, DEV_TOP]];
const W_STAGE   = [[DISK_CX, DEV_BOTTOM], [DISK_CX, STAGE_ELBOW_Y], [STAGE_IN_X, STAGE_ELBOW_Y], [STAGE_IN_X, STG_TOP]];
const W_PUB_A   = [[PODA_CX, STG_BOTTOM], [PODA_CX, POD_Y]];
const W_OWNS = `M ${OWNS_X} ${ND_Y + ND_H} L ${OWNS_X} ${STG_TOP}`;

// The publish tag rides left of its lane, clear of the band sublabel and caption.
const tag = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0 });
const PUB_TAG = { fn: tag, dx: -48, dy: -4 };


// Z-order: the LADDER is last so its lit rung stays crisp under a passing ball.
export const SCENE = {
  'aria-label': 'The CSI attach and mount chain: up to four gRPC calls take a volume from nowhere to a writable path. CreateVolume makes the disk in the cloud backend, ControllerPublishVolume, on a driver that requires attach, attaches it to the Node as a raw block device, NodeStageVolume, on a driver that stages, formats it if still blank and mounts it once at a global staging path Kubelet creates for it, and NodePublishVolume mounts that staged filesystem into the Pod directory, usually as a bind mount. Deleting the Pod runs the last three calls back in reverse, unpublish, unstage with its staging path removed, then detach, and leaves the disk itself in place.',
  parts: [
    P.defs(),
    P.node({ x: NF_X, y: NF_Y, w: NF_W, h: NF_H, label: 'Node-1' }),
    P.box({ key: 'ctrl', x: CTRL_X, y: CTRL_Y, w: CTRL_W, h: CTRL_H, label: 'CSI controller', sublabel: 'attacher + provisioner' }),
    P.cylinder({ key: 'cdisk', x: DISK_X, y: CDISK_Y, w: DISK_W, h: CDISK_H, label: 'Cloud Disk vol-1' }),
    P.cylinder({ key: 'dev', x: DISK_X, y: DEV_Y, w: DISK_W, h: DEV_H, label: '/dev/nvme1n1', opacity: 0 }),
    P.box({ key: 'nd', x: ND_X, y: ND_Y, w: ND_W, h: ND_H, label: 'CSI node driver', sublabel: 'node plugin' }),
    P.box({ key: 'stg', x: STG_X, y: STG_Y, w: STG_W, h: STG_H, label: 'Global staging path', sublabel: '.../globalmount', opacity: 0 }),
    P.pod({
      key: 'podA', innerKey: 'podABox', x: PODA_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod A', sublabel: 'private bind mount', containers: 0,
      inner: { dx: (POD_W - APP_W) / 2, dy: APP_DY, w: APP_W, h: APP_H, label: 'app', sublabel: '/data writable' },
      opacity: 0,
    }),
    // W_OWNS is ownership, not traffic, so it is a markerless relation and never carries a ball.
    P.relation({ key: 'wOwns', d: W_OWNS, dash: '5 5', opacity: 0 }),
    // The controller to cloud lane and its disk stand from idle. Node-side things born mid-story start hidden.
    P.lane({ key: 'wCreate', points: W_CREATE, dashed: true, dim: true }),
    P.lane({ key: 'wAttach', points: W_ATTACH, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wStage', points: W_STAGE, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wPubA', points: W_PUB_A, dashed: true, dim: true, opacity: 0 }),
    P.wire({ key: 'stage', x: STG_LBL_X, y: STG_LBL_Y, anchor: 'start' }),
    P.chip({ key: 'diskChip', x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'disk', value: 'none' }),
    P.chip({ key: 'devChip', x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'device on node', value: 'none' }),
    P.chip({ key: 'stageChip', x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'staging mount', value: 'none' }),
    P.chip({ key: 'bindChip', x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'bind mounts', value: 'none' }),
    P.packets(),
    P.chain({
      key: 'chain',
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: LAD_ROW, gap: LAD_GAP,
      items: [
        '1. CreateVolume  ·  the disk now exists',
        '2. ControllerPublishVolume  ·  attached to the node',
        '3. NodeStageVolume  ·  formatted if blank, mounted once',
        '4. NodePublishVolume  ·  mounted into the Pod directory',
      ],
    }),
  ],
  reset: {
    keys: ['ctrl', 'cdisk', 'dev', 'nd', 'stg', 'podABox',
      'diskChip', 'devChip', 'stageChip', 'bindChip'],
    pods: ['podA'],
  },
};

// Every step writes EVERY chip, or a stale value carries over from the step before.
const chips = (disk, device, staging, binds) => ({ diskChip: disk, devChip: device, stageChip: staging, bindChip: binds });

// STO.S-01: every element born mid-story, and every lane, is pinned on EVERY step.
const born = (device, staging, podA) => ({
  cdisk: 1, wCreate: 1,
  dev: device, wAttach: device,
  stg: staging, wOwns: staging, wStage: staging,
  podA, wPubA: podA,
});

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('none', 'none', 'none', 'none'),
    opacity: born(0, 0, 0),
    chain: -1,
  },
  {
    id: 'create',
    duration: 3600,
    narration: 'CreateVolume runs first, on the controller side, for a dynamically provisioned claim. The provisioner asks the driver to carve a real disk out of the cloud backend. When it returns, a disk called vol-1 exists somewhere in the provider, but it is not near any Node yet and nothing can read a byte of it.',
    chipsCued: chips('vol-1 in the cloud', 'none', 'none', 'none'),
    opacity: born(0, 0, 0),
    lit: ['ctrl'],
    chain: 0,
    // Infra to infra: the source lit at entry, the disk lights on arrival.
    flow: [
      F.route({ points: W_CREATE, delay: BEAT.lead, name: 'create', tag: { text: 'CreateVolume', fn: tag } }),
      F.light({ targets: ['cdisk'], at: 'create' }),
    ],
  },
  {
    id: 'attach',
    duration: 3100,
    narration: 'ControllerPublishVolume runs next, still on the controller side, if the driver requires attach. The external-attacher asks the driver to attach vol-1 to the Node the Pod was scheduled on. Here that is a cloud API call, and the disk shows up on the Node as a raw block device, /dev/nvme1n1, still unformatted.',
    chipsCued: chips('attached to node-1', '/dev/nvme1n1', 'none', 'none'),
    // The device exists by the END of this step, so visible is the end state and the reveals only stage it.
    opacity: born(1, 0, 0),
    lit: ['ctrl', 'cdisk'],
    chain: 1,
    // The device and its lane finish materialising BEFORE the call leaves (REVEAL_MS under BEAT.lead).
    flow: [
      F.reveal({ target: 'dev' }),
      F.reveal({ target: 'wAttach' }),
      F.route({ points: W_ATTACH, delay: BEAT.lead, name: 'attach', tag: { text: 'ControllerPublish', fn: tag } }),
      F.light({ targets: ['dev'], at: 'attach' }),
    ],
  },
  {
    id: 'stage',
    duration: 3000,
    narration: 'NodeStageVolume is the first Node call, on a driver that stages. The node plugin formats the raw device if still blank and mounts it once, at a global staging path Kubelet has just created. This happens once per Node no matter how many Pods use the volume, which is the whole reason stage and publish are two calls.',
    chipsCued: chips('attached to node-1', '/dev/nvme1n1', 'mounted once', 'none'),
    wires: { stage: 'mount once per node' },
    opacity: born(1, 1, 0),
    lit: ['dev', 'nd'],
    chain: 2,
    // Kubelet creates globalmount just before NodeStageVolume, so the band and its lanes appear first.
    flow: [
      F.reveal({ target: 'stg' }),
      F.reveal({ target: 'wOwns' }),
      F.reveal({ target: 'wStage' }),
      F.route({ points: W_STAGE, delay: BEAT.lead, name: 'stage', tag: { text: 'NodeStage', fn: tag } }),
      F.light({ targets: ['stg'], at: 'stage' }),
    ],
  },
  {
    id: 'publish',
    duration: 3200,
    narration: 'NodePublishVolume is the last call, once per Pod. It usually does not mount the disk again: it bind-mounts the staged filesystem into this Pod private directory, which the runtime binds into the container as /data. Only now does Pod A start and begin writing.',
    chipsCued: chips('attached to node-1', '/dev/nvme1n1', 'mounted once', '1 (Pod A)'),
    wires: { stage: 'bind-mount, no remount' },
    // Pod A starts on this step, so it and its lane are present by the end of it.
    opacity: born(1, 1, 1),
    // The node plugin runs this call too, so it stays lit alongside the mount it is bind-mounting.
    lit: ['nd', 'stg'],
    chain: 3,
    // Infra reaching a Pod: DOWN-ARROW order, ball first and the Pod pulses on arrival.
    flow: [
      F.reveal({ target: 'podA' }),
      F.reveal({ target: 'wPubA' }),
      F.route({ points: W_PUB_A, delay: BEAT.lead, tag: { text: 'NodePublish', ...PUB_TAG }, pulse: 'podA' }),
    ],
  },
  {
    id: 'unwind',
    duration: 3800,
    narration: 'Delete Pod A and the calls unwind in reverse. NodeUnpublishVolume removes its bind mount, then, with no Pod on the Node still using it, NodeUnstageVolume unmounts the staging path and Kubelet deletes it. Only then does ControllerUnpublishVolume detach the disk. The disk survives: deleting it is up to the reclaim policy.',
    chipsCued: chips('detached, disk kept', 'none', 'unmounted', 'none'),
    wires: { stage: 'unpublish, unstage, detach' },
    // The end state is the idle topology. The animated path tears down bottom-up, one construction per call.
    opacity: born(0, 0, 0),
    rewind: { opacity: born(1, 1, 1) },
    // The three rungs being undone end lit, CreateVolume does not: nothing deletes the disk.
    lit: ['nd', 'ctrl'],
    chain: [1, 2, 3],
    // No ball: going back up would need return lanes (A-03). The beat is the teardown itself.
    flow: [
      F.set({ chain: [] }),
      F.set({ chain: [3], delay: 400 }),
      F.set({ chain: [2, 3], delay: 1400 }),
      F.set({ chain: [1, 2, 3], delay: 2400 }),
      F.fade({ target: 'podA', to: 0, dur: 600, delay: 400, fill: 'forwards' }),
      F.fade({ target: 'wPubA', to: 0, dur: 600, delay: 400, fill: 'forwards' }),
      F.fade({ target: 'wStage', to: 0, dur: 600, delay: 1400, fill: 'forwards' }),
      F.fade({ target: 'stg', to: 0, dur: 600, delay: 1400, fill: 'forwards' }),
      F.fade({ target: 'wOwns', to: 0, dur: 600, delay: 1400, fill: 'forwards' }),
      F.fade({ target: 'dev', to: 0, dur: 600, delay: 2400, fill: 'forwards' }),
      F.fade({ target: 'wAttach', to: 0, dur: 600, delay: 2400, fill: 'forwards' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
