import { P, F, defineCard, BEAT } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-csi-attach-mount


const M = 60, GUTTER = 48;
const COL_W = (1200 - 2 * M - GUTTER) / 2;               // 516: solved, see above

const LAD_X = M, LAD_W = COL_W, LAD_Y = 388, LAD_ROW = 40, LAD_GAP = 10;

// ---- left column: the controller side, under the narration panel's floor (230 on this card) ----
// Controller side left, Node side right is the division the four calls are about.
const CTRL_W = 252, CTRL_H = 64;
const CTRL_X = M, CTRL_Y = 268;                          // 60..312 / 268..332
const CTRL_RIGHT = CTRL_X + CTRL_W;                      // 312
const CTRL_CY = CTRL_Y + CTRL_H / 2;                     // 300

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
const ND_X = IN_X, ND_Y = 220, ND_W = 250, ND_H = 58;

const STG_X = IN_X, STG_Y = 350, STG_W = IN_W, STG_H = 58;
const STG_TOP = STG_Y, STG_BOTTOM = STG_Y + STG_H;        // 350 / 408

const POD_W = 226;
const POD_GAP = IN_W - 2 * POD_W;                         // 32
const POD_Y = 454, POD_H = 110;
const PODA_X = IN_X, PODB_X = IN_X + POD_W + POD_GAP;     // 640 / 898
const PODA_CX = PODA_X + POD_W / 2, PODB_CX = PODB_X + POD_W / 2;  // 753 / 1011, midpoint 882 = NODE_CX

const CHIPS_Y = 596, CHIP_H = 32, CHIP_GAP = 16, CHIP_COUNT = 4;
const CHIPS_W = 2 * COL_W + GUTTER;                       // 1080: exactly the content width
const CHIP_W = (CHIPS_W - CHIP_GAP * (CHIP_COUNT - 1)) / CHIP_COUNT;   // 258
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) => M + i * (CHIP_W + CHIP_GAP));

const STG_LBL_Y = 434;

const STAGE_ELBOW_Y  = (DEV_BOTTOM + STG_TOP) / 2;        // 327, centred in the 46 unit device gap
// The staging mount takes two lanes on its top face: the node driver owns it and the staged device
// feeds it. They are a mirrored pair about the face midpoint rather than one lane out on its own.
const OWNS_X = ND_X + ND_W / 2;                           // 765
const STAGE_IN_X = 2 * NODE_CX - OWNS_X;                  // 999
// CreateVolume crosses from the controller column to the cloud disk in the free band above the Node
// frame, turning up out of the panel's reach first.
const CREATE_TURN_X = 520;

const W_CREATE  = [[CTRL_RIGHT, CTRL_CY], [CREATE_TURN_X, CTRL_CY], [CREATE_TURN_X, CDISK_FACE_CY], [DISK_X, CDISK_FACE_CY]];
const W_ATTACH  = [[DISK_CX, CDISK_BOTTOM], [DISK_CX, DEV_TOP]];
const W_STAGE   = [[DISK_CX, DEV_BOTTOM], [DISK_CX, STAGE_ELBOW_Y], [STAGE_IN_X, STAGE_ELBOW_Y], [STAGE_IN_X, STG_TOP]];
const W_PUB_A   = [[PODA_CX, STG_BOTTOM], [PODA_CX, POD_Y]];
const W_PUB_B   = [[PODB_CX, STG_BOTTOM], [PODB_CX, POD_Y]];
const W_OWNS = `M ${OWNS_X} ${ND_Y + ND_H} L ${OWNS_X} ${STG_TOP}`;


// The two Pods differ only in x and name: same shell, same sublabel, same container box.
const podBlock = ({ key, innerKey, x, label }) => P.pod({
  key, innerKey, x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel: 'private bind mount', containers: 0,
  inner: { dx: 24, dy: 40, w: POD_W - 48, h: 46, label: 'app', sublabel: '/data writable' },
  opacity: 0,
});

// Z-order, bottom to top: the node frame, then the blocks and disks and Pods inside it, then the
// lanes and the band caption above them, then the chip strip, then the packet layer, and the LADDER
// last of all so its lit rung stays crisp when a ball passes over it.
export const SCENE = {
  'aria-label': 'The CSI attach and mount chain: four gRPC calls take a volume from nowhere to a writable path. CreateVolume makes the disk in the cloud backend, ControllerPublishVolume attaches it to the Node as a raw block device, NodeStageVolume formats it if needed and mounts it once at a global staging path, and NodePublishVolume bind-mounts that one staged filesystem into each Pod, which is how two Pods on one Node share a single attached disk.',
  parts: [
    P.defs(),
    P.node({ x: NF_X, y: NF_Y, w: NF_W, h: NF_H, label: 'Node-1' }),
    P.box({ key: 'ctrl', x: CTRL_X, y: CTRL_Y, w: CTRL_W, h: CTRL_H, label: 'CSI controller', sublabel: 'attacher + provisioner' }),
    P.cylinder({ key: 'cdisk', x: DISK_X, y: CDISK_Y, w: DISK_W, h: CDISK_H, label: 'Cloud Disk vol-1' }),
    P.cylinder({ key: 'dev', x: DISK_X, y: DEV_Y, w: DISK_W, h: DEV_H, label: '/dev/nvme1n1', opacity: 0 }),
    P.box({ key: 'nd', x: ND_X, y: ND_Y, w: ND_W, h: ND_H, label: 'CSI node driver', sublabel: 'node plugin' }),
    P.box({ key: 'stg', x: STG_X, y: STG_Y, w: STG_W, h: STG_H, label: 'Global staging mount', sublabel: '.../csi/vol-1/globalmount' }),
    podBlock({ key: 'podA', innerKey: 'podABox', x: PODA_X, label: 'Pod A' }),
    podBlock({ key: 'podB', innerKey: 'podBBox', x: PODB_X, label: 'Pod B' }),
    // W_OWNS is ownership, not traffic, so it is a markerless relation and never carries a ball.
    P.relation({ d: W_OWNS, dash: '5 5' }),
    P.lane({ points: W_CREATE, dashed: true, dim: true }),
    // A block and its lanes are ONE construction: everything born mid-story starts hidden together.
    P.lane({ key: 'wAttach', points: W_ATTACH, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wStage', points: W_STAGE, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wPubA', points: W_PUB_A, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wPubB', points: W_PUB_B, dashed: true, dim: true, opacity: 0 }),
    P.wire({ key: 'stage', x: NODE_CX, y: STG_LBL_Y }),
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
        '3. NodeStageVolume  ·  formatted, mounted once',
        '4. NodePublishVolume  ·  bind-mounted into the Pod',
      ],
    }),
  ],
  reset: {
    keys: ['ctrl', 'cdisk', 'dev', 'nd', 'stg', 'podABox', 'podBBox',
      'diskChip', 'devChip', 'stageChip', 'bindChip'],
    pods: ['podA', 'podB'],
  },
};

// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how this
// card once showed a staging mount on the step that was explaining the disk did not exist yet.
const chips = (disk, device, staging, binds) => ({ diskChip: disk, devChip: device, stageChip: staging, bindChip: binds });

// STO.S-01 as a field: every element born mid-story, and every lane, is pinned on EVERY step. A block
// and its lanes are one construction, so they share the one number.
const born = (device, podA, podB) => ({
  dev: device, wAttach: device, wStage: device,
  podA, wPubA: podA, podB, wPubB: podB,
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
    duration: 3400,
    narration: 'CreateVolume runs first, on the controller side. The provisioner asks the driver to carve a real disk out of the cloud backend. When it returns, a disk called vol-1 exists somewhere in the provider, but it is not near any Node yet and nothing can read a byte of it.',
    chipsCued: chips('vol-1 in the cloud', 'none', 'none', 'none'),
    opacity: born(0, 0, 0),
    lit: ['ctrl'],
    chain: 0,
    // An infra-to-infra call: the source is lit at entry, so the ball leaves after BEAT.lead and the
    // destination lights on arrival. The cue is its OWN entry because it stood after the tag.
    flow: [
      F.route({ points: W_CREATE, delay: BEAT.lead, name: 'create' }),
      F.tag({ text: 'CreateVolume', points: W_CREATE, delay: BEAT.lead }),
      F.light({ targets: ['cdisk'], at: 'create' }),
    ],
  },
  {
    id: 'attach',
    duration: 2800,
    narration: 'ControllerPublishVolume runs next, still on the controller side. The external-attacher asks the driver to attach vol-1 to the Node the Pod was scheduled on. This is a cloud operation: the disk shows up on the Node as a raw block device, here /dev/nvme1n1. It is still unformatted.',
    chipsCued: chips('attached to node-1', '/dev/nvme1n1', 'none', 'none'),
    // The device exists on the node by the END of this step, so visible is the static end-state and
    // the reveals below only stage how it gets there.
    opacity: born(1, 0, 0),
    lit: ['ctrl', 'cdisk'],
    chain: 1,
    // The device and both its lanes finish materialising BEFORE the call is sent (REVEAL_MS 500
    // against BEAT.lead 800).
    flow: [
      F.reveal({ target: 'dev' }),
      F.reveal({ target: 'wAttach' }),
      F.reveal({ target: 'wStage' }),
      F.route({ points: W_ATTACH, delay: BEAT.lead, name: 'attach' }),
      F.tag({ text: 'ControllerPublish', points: W_ATTACH, delay: BEAT.lead }),
      F.light({ targets: ['dev'], at: 'attach' }),
    ],
  },
  {
    id: 'stage',
    duration: 3000,
    narration: 'NodeStageVolume is the first Node call. The node plugin formats the raw device if needed and mounts it once, at a global staging path under the Kubelet directory. This happens a single time per Node no matter how many Pods will use the volume, which is the whole reason stage and publish are two calls, not one.',
    chipsCued: chips('attached to node-1', '/dev/nvme1n1', 'mounted once', 'none'),
    wires: { stage: 'mount once per node' },
    opacity: born(1, 0, 0),
    lit: ['dev', 'nd'],
    chain: 2,
    flow: [
      F.route({ points: W_STAGE, delay: BEAT.lead, name: 'stage' }),
      F.tag({ text: 'NodeStage', points: W_STAGE, delay: BEAT.lead }),
      F.light({ targets: ['stg'], at: 'stage' }),
    ],
  },
  {
    id: 'publish',
    duration: 3200,
    narration: 'NodePublishVolume is the last call, once per Pod. It does not re-mount the disk. It bind-mounts the already staged filesystem into this Pod private directory, which surfaces as /data inside the container. Only now does Pod A start and begin writing.',
    chipsCued: chips('attached to node-1', '/dev/nvme1n1', 'mounted once', '1 (Pod A)'),
    wires: { stage: 'bind-mount, no remount' },
    // Pod A starts on this step, so it and its lane are present by the end of it.
    opacity: born(1, 1, 0),
    // The node plugin runs this call too, so it stays lit alongside the mount it is bind-mounting.
    lit: ['nd', 'stg'],
    chain: 3,
    // A publish is infra reaching a Pod, so DOWN-ARROW ordering: the ball flies first and the Pod
    // pulses on ARRIVAL. Nothing lights, so the reduced path shows no cue here.
    flow: [
      F.reveal({ target: 'podA' }),
      F.reveal({ target: 'wPubA' }),
      F.route({ points: W_PUB_A, delay: BEAT.lead, name: 'pubA' }),
      F.tag({ text: 'NodePublish', points: W_PUB_A, delay: BEAT.lead }),
      F.pulse({ pod: 'podA', at: 'pubA' }),
    ],
  },
  {
    id: 'share',
    duration: 3200,
    narration: 'A second Pod lands on the same Node and asks for the same volume. The disk is already attached and already staged, so those two calls are skipped entirely. Only one more NodePublishVolume runs, a second bind-mount off the same global staging path. That is how several Pods on one Node share a single attached disk.',
    chipsCued: chips('attached to node-1', '/dev/nvme1n1', 'mounted once', '2 (Pod A + Pod B)'),
    wires: { stage: 'one mount, two bind mounts' },
    // Pod A stays exactly as step 4 left it. Pod B lands on this step, so it and its lane are present
    // by the end of it, and Pod A is re-pinned rather than inherited.
    opacity: born(1, 1, 1),
    lit: ['nd', 'stg'],
    chain: 3,
    // Pod B lands on the node with its lane, then the second bind-mount reaches it and it pulses.
    flow: [
      F.reveal({ target: 'podB' }),
      F.reveal({ target: 'wPubB' }),
      F.route({ points: W_PUB_B, delay: BEAT.lead, name: 'pubB' }),
      F.tag({ text: 'NodePublish again', points: W_PUB_B, delay: BEAT.lead }),
      F.pulse({ pod: 'podB', at: 'pubB' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
