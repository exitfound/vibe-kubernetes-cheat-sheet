import { P, F, defineCard, BEAT, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-csi-attach-mount.md


// COL_W is solved from the margin and the gutter (516), so the two columns and the ladder inside the
// left one re-size together. The chips are solved the same way: 4*CHIP_W + 3*16 = 1080.
const M = 60, GUTTER = 48;
const COL_W = (1200 - 2 * M - GUTTER) / 2;               // 516: solved, see above

// The ladder rows keep the catalog 32 + 10 rhythm (CLU/WL ROW_H, ROW_GAP), bottom level with the node frame.
const LAD_ROW = 32, LAD_GAP = 10;
const LAD_X = M, LAD_W = COL_W, LAD_Y = 578 - 4 * LAD_ROW - 3 * LAD_GAP;   // 420..578

// ---- left column: the controller side, under the narration panel's floor (230 on this card) ----
// Controller side left, Node side right is the division the four calls are about.
// Every actor block is the catalog 232 by 80 and the Pod 232 by 104 around a 192 by 44 app box
// (NET.L-01). The staging band is not an actor: it is sized BY the node's inner width.
const BLOCK_W = 232, BLOCK_H = 80;
const CTRL_W = BLOCK_W, CTRL_H = BLOCK_H;
const CTRL_X = M, CTRL_Y = 268;                          // 60..292 / 268..348
const CTRL_RIGHT = CTRL_X + CTRL_W;                      // 292
const CTRL_CY = CTRL_Y + CTRL_H / 2;                     // 308

// ---- right column: node-1 and the two blocks above it ----
const NF_X = M + COL_W + GUTTER, NF_Y = 192, NF_W = COL_W, NF_H = 388;   // 624..1140 / 192..580
const NODE_PAD = 16;
const NODE_CX = NF_X + NF_W / 2;                          // 882: every tier below is symmetric on this
const IN_X = NF_X + NODE_PAD, IN_W = NF_W - NODE_PAD * 2; // 640 / 484: the usable inner width

const DISK_W = 150;
const DISK_X = IN_X + IN_W - DISK_W;                      // 974: right-aligned to the node inner edge
const DISK_CX = DISK_X + DISK_W / 2;                      // 1049, shared by the cloud disk and the device
const CDISK_Y = 44, CDISK_H = 104;
const CDISK_BOTTOM = CDISK_Y + CDISK_H;                   // 148
const CDISK_FACE_CY = CDISK_Y + CDISK_H / 2;              // 96

const DEV_Y = 212, DEV_H = 92;
const DEV_TOP = DEV_Y, DEV_BOTTOM = DEV_Y + DEV_H;        // 212 / 304

// The node plugin sits under the controller, left-aligned in the node, so the reader can see that the
// two node calls are run by a different process than the two controller calls above it.
const ND_X = IN_X, ND_Y = 220, ND_W = BLOCK_W, ND_H = BLOCK_H;   // 640..872 / 220..300

const STG_X = IN_X, STG_Y = 350, STG_W = IN_W, STG_H = 58;
const STG_TOP = STG_Y, STG_BOTTOM = STG_Y + STG_H;        // 350 / 408

const POD_W = BLOCK_W, POD_H = 104;
const APP_W = 192, APP_H = 44, APP_DY = 26;               // 26 under the Pod label, as network-gateway-api
const POD_Y = 454;                                        // 454..558, 22 above the node frame foot
const PODA_X = NODE_CX - POD_W / 2;                       // 766: the one Pod sits on the node centre line
const PODA_CX = NODE_CX;                                  // 882

const CHIPS_Y = 596, CHIP_H = 32, CHIP_GAP = 16, CHIP_COUNT = 4;
const CHIPS_W = 2 * COL_W + GUTTER;                       // 1080: exactly the content width
const CHIP_W = (CHIPS_W - CHIP_GAP * (CHIP_COUNT - 1)) / CHIP_COUNT;   // 258
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) => M + i * (CHIP_W + CHIP_GAP));

// The publish lane drops down NODE_CX, so the band caption starts just right of it.
const STG_LBL_X = NODE_CX + 14, STG_LBL_Y = 434;

const STAGE_ELBOW_Y  = (DEV_BOTTOM + STG_TOP) / 2;        // 327, centred in the 46 unit device gap
// The staging mount takes two lanes on its top face: the node driver owns it and the staged device
// feeds it. They are a mirrored pair about the face midpoint rather than one lane out on its own.
const OWNS_X = ND_X + ND_W / 2;                           // 756
const STAGE_IN_X = 2 * NODE_CX - OWNS_X;                  // 1008
// CreateVolume crosses from the controller column to the cloud disk in the free band above the Node
// frame, turning up out of the panel's reach first.
const CREATE_TURN_X = 520;

const W_CREATE  = [[CTRL_RIGHT, CTRL_CY], [CREATE_TURN_X, CTRL_CY], [CREATE_TURN_X, CDISK_FACE_CY], [DISK_X, CDISK_FACE_CY]];
const W_ATTACH  = [[DISK_CX, CDISK_BOTTOM], [DISK_CX, DEV_TOP]];
const W_STAGE   = [[DISK_CX, DEV_BOTTOM], [DISK_CX, STAGE_ELBOW_Y], [STAGE_IN_X, STAGE_ELBOW_Y], [STAGE_IN_X, STG_TOP]];
const W_PUB_A   = [[PODA_CX, STG_BOTTOM], [PODA_CX, POD_Y]];
const W_OWNS = `M ${OWNS_X} ${ND_Y + ND_H} L ${OWNS_X} ${STG_TOP}`;

// M-30a: each tag lives exactly as long as its ball. The publish tag rides LEFT of its lane, level
// with the ball: centred above it, it prints over the band sublabel at departure and the caption.
const tag = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0 });
const PUB_TAG = { fn: tag, dx: -48, dy: -4 };


// Z-order, bottom to top: node frame, blocks and disks and Pods, lanes and the band caption, the chip
// strip, the packet layer, and the LADDER last so its lit rung stays crisp under a passing ball.
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
    // The controller to cloud lane and its disk stand from idle. Everything born mid-story on the
    // Node side starts hidden together with its lanes.
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

// Every step writes EVERY chip. A chip left unset keeps the value the step before it wrote, which
// here would show a staging mount on the step explaining that the disk does not exist yet.
const chips = (disk, device, staging, binds) => ({ diskChip: disk, devChip: device, stageChip: staging, bindChip: binds });

// STO.S-01 as a field: every element born mid-story, and every lane, is pinned on EVERY step. A block
// and its lanes are one construction, so they share the one number.
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
    // An infra-to-infra call: the source is lit at entry, the ball leaves after BEAT.lead, and the
    // disk lights on arrival, its OWN entry after the tag.
    flow: [
      F.route({ points: W_CREATE, delay: BEAT.lead, name: 'create' }),
      F.tag({ text: 'CreateVolume', points: W_CREATE, delay: BEAT.lead, fn: tag }),
      F.light({ targets: ['cdisk'], at: 'create' }),
    ],
  },
  {
    id: 'attach',
    duration: 3100,
    narration: 'ControllerPublishVolume runs next, still on the controller side, if the driver requires attach. The external-attacher asks the driver to attach vol-1 to the Node the Pod was scheduled on. Here that is a cloud API call, and the disk shows up on the Node as a raw block device, /dev/nvme1n1, still unformatted.',
    chipsCued: chips('attached to node-1', '/dev/nvme1n1', 'none', 'none'),
    // The device exists on the node by the END of this step, so visible is the static end-state and
    // the reveals below only stage how it gets there.
    opacity: born(1, 0, 0),
    lit: ['ctrl', 'cdisk'],
    chain: 1,
    // The device and its lane finish materialising BEFORE the call is sent (REVEAL_MS 500 against
    // BEAT.lead 800).
    flow: [
      F.reveal({ target: 'dev' }),
      F.reveal({ target: 'wAttach' }),
      F.route({ points: W_ATTACH, delay: BEAT.lead, name: 'attach' }),
      F.tag({ text: 'ControllerPublish', points: W_ATTACH, delay: BEAT.lead, fn: tag }),
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
    // Kubelet creates the globalmount directory just before it calls NodeStageVolume, so the band
    // and its two lanes materialise before the ball leaves.
    flow: [
      F.reveal({ target: 'stg' }),
      F.reveal({ target: 'wOwns' }),
      F.reveal({ target: 'wStage' }),
      F.route({ points: W_STAGE, delay: BEAT.lead, name: 'stage' }),
      F.tag({ text: 'NodeStage', points: W_STAGE, delay: BEAT.lead, fn: tag }),
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
    // A publish is infra reaching a Pod, so DOWN-ARROW ordering: the ball flies first and the Pod
    // pulses on ARRIVAL. Nothing lights, so the reduced path shows no cue here.
    flow: [
      F.reveal({ target: 'podA' }),
      F.reveal({ target: 'wPubA' }),
      F.route({ points: W_PUB_A, delay: BEAT.lead, name: 'pubA' }),
      F.tag({ text: 'NodePublish', points: W_PUB_A, delay: BEAT.lead, ...PUB_TAG }),
      F.pulse({ pod: 'podA', at: 'pubA' }),
    ],
  },
  {
    id: 'unwind',
    duration: 3800,
    narration: 'Delete Pod A and the calls unwind in reverse. NodeUnpublishVolume removes its bind mount, then, with no Pod on the Node still using it, NodeUnstageVolume unmounts the staging path and Kubelet deletes it. Only then does ControllerUnpublishVolume detach the disk. The disk survives: deleting it is up to the reclaim policy.',
    chipsCued: chips('detached, disk kept', 'none', 'unmounted', 'none'),
    wires: { stage: 'unpublish, unstage, detach' },
    // The end state is the idle topology again. The animated path winds everything back to full and
    // takes it down bottom-up, one construction per call, the reverse of the order it was built in.
    opacity: born(0, 0, 0),
    rewind: { opacity: born(1, 1, 1) },
    // Both actors run a call here: the node plugin the two Node calls, the controller the detach. The
    // three rungs being undone end lit, CreateVolume does not, because nothing deletes the disk.
    lit: ['nd', 'ctrl'],
    chain: [1, 2, 3],
    // No ball: going back up would need return lanes (A-03), and nothing is sent anywhere new. The
    // beat is the teardown itself, 1000ms per call, and each rung lights with the fade it names.
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
