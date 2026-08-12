import { P, F, defineCard, chipStrip } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-volume-expansion


const CX = 600;

// Three tiers on ONE 162 pitch, measured between block MIDPOINTS: 108, 270, 432. Same pitch and
// same footprints as storage-pvc-protection, which is what makes the pair read as one family.
const POD_W = 240, POD_H = 104, POD_X = CX - POD_W / 2, POD_Y = 56;
const POD_BOTTOM = POD_Y + POD_H;                              // 160

const PVC_W = 240, PVC_H = 68, PVC_X = CX - PVC_W / 2, PVC_Y = 236;
const PVC_BOTTOM = PVC_Y + PVC_H, PVC_MID = PVC_Y + PVC_H / 2, PVC_RIGHT = PVC_X + PVC_W; // 304 / 270 / 720

const DISK_W = 230, DISK_H = 86, DISK_Y = 389;
const DISK_TOP = DISK_Y, DISK_MID = DISK_Y + DISK_H / 2;       // 389 / 432
const DISK_LEFT = CX - DISK_W / 2, DISK_RIGHT = CX + DISK_W / 2;  // 485 / 715

// One actor footprint for all four, and the left column is the exact mirror of the right about CX.
const ACT_W = 220, ACT_H = 72;
const ACT_R_X = 850, ACT_R_CX = ACT_R_X + ACT_W / 2;           // 850 / 960
const ACT_L_X = 1200 - ACT_R_X - ACT_W, ACT_L_RIGHT = ACT_L_X + ACT_W;  // 130 / 350
const SLOT_A_Y = POD_Y + POD_H / 2 - ACT_H / 2;                // 72, centered on the Pod tier
const SLOT_A_BOTTOM = SLOT_A_Y + ACT_H;                        // 144
const BOTTOM_ACT_Y = DISK_MID - ACT_H / 2;                     // 396

const MOUNT_LBL_X = CX + 16, MOUNT_LBL_Y = 204;
const VERDICT_LBL_X = PVC_X - 16, VERDICT_LBL_Y = PVC_MID + 4; // 464 / 274, anchored end
// cylinder() draws its own name on the baseline h/2+5, so the capacity line goes 14 below it.
const CAP_LBL_Y = DISK_Y + DISK_H / 2 + 5 + 14;                // 451
const CHIP_Y = 545, CHIP_H = 34;                               // strip ends at 579

const CHIP_W = 252, CHIP_GAP = 24;
const STRIP = chipStrip({ cx: CX, w: CHIP_W, gap: CHIP_GAP });  // 60 / 336 / 612 / 888

// Each lane and its ball share one points array. Every endpoint sits on a block edge, and every lane
// is either a straight run or a single right angle. Nothing turns twice.
const W_MOUNT_LOW  = [[CX, DISK_TOP], [CX, PVC_BOTTOM]];       // disk -> claim, upward
const W_MOUNT_HIGH = [[CX, PVC_Y], [CX, POD_BOTTOM]];          // claim -> Pod, upward
// Slot A to the claim: one turn, landing dead center on the claim's right edge.
const W_TO_PVC = [[ACT_R_CX, SLOT_A_BOTTOM], [ACT_R_CX, PVC_MID], [PVC_RIGHT, PVC_MID]];
// The two phases, straight in from opposite sides at the disk's own midline.
const W_CTRL_EXP = [[ACT_R_X, DISK_MID], [DISK_RIGHT, DISK_MID]];
const W_NODE_EXP = [[ACT_L_RIGHT, DISK_MID], [DISK_LEFT, DISK_MID]];

// Every lane in this card is a ROUTE: something travels all of them, so they are all dashed, all
// carry a head, and all are built from the same points array as their ball.
// The list order IS the append order, which is the z-order: blocks and the disk, then the lanes and
// their captions above them, then the Pod, then the chip strip, then the packet layer.
export const SCENE = {
  'aria-label': 'Growing a volume while the Pod keeps running is a two phase operation. You raise the storage request on the claim, and the API server accepts that edit only because the StorageClass behind it has allowVolumeExpansion set to true. Then the external-resizer calls ControllerExpandVolume and the backend grows the real block device, which is phase one. Then Kubelet calls NodeExpandVolume on the Node where the Pod runs and the filesystem grows to fill the bigger device, which is phase two. Only after both does the extra space appear inside the container, with no restart. Going the other way is refused: a request below the size already provisioned is rejected.',
  parts: [
    P.defs(),
    P.box({ key: 'pvc', x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-claim', sublabel: 'requests 5Gi' }),
    // Slot A holds whoever acts on the claim this step. The two never share a step, so they share the
    // slot and the lane out of it.
    P.box({ key: 'kubectl', x: ACT_R_X, y: SLOT_A_Y, w: ACT_W, h: ACT_H, label: 'kubectl patch', sublabel: 'raises the request', opacity: 0 }),
    P.box({ key: 'klass', x: ACT_R_X, y: SLOT_A_Y, w: ACT_W, h: ACT_H, label: 'StorageClass gp3', sublabel: 'allowVolumeExpansion', opacity: 0 }),
    P.box({ key: 'resizer', x: ACT_R_X, y: BOTTOM_ACT_Y, w: ACT_W, h: ACT_H, label: 'External-resizer', sublabel: 'ControllerExpandVolume', opacity: 0 }),
    P.box({ key: 'kubelet', x: ACT_L_X, y: BOTTOM_ACT_Y, w: ACT_W, h: ACT_H, label: 'Kubelet', sublabel: 'NodeExpandVolume', opacity: 0 }),
    P.cylinder({ key: 'disk', x: DISK_LEFT, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'PV data-vol' }),
    P.lane({ key: 'lMountLow', points: W_MOUNT_LOW, dashed: true, dim: true }),
    P.lane({ key: 'lMountHigh', points: W_MOUNT_HIGH, dashed: true, dim: true }),
    P.lane({ key: 'lToPvc', points: W_TO_PVC, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'lCtrlExp', points: W_CTRL_EXP, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'lNodeExp', points: W_NODE_EXP, dashed: true, dim: true, opacity: 0 }),
    P.wire({ key: 'mount', x: MOUNT_LBL_X, y: MOUNT_LBL_Y, anchor: 'start' }),
    P.wire({ key: 'verdict', x: VERDICT_LBL_X, y: VERDICT_LBL_Y, anchor: 'end' }),
    P.wire({ key: 'cap', x: CX, y: CAP_LBL_Y }),
    // The group IS the pulse target: pulsing a bare shell would fire at half strength, since
    // querySelectorAll matches descendants only and the inner box is a sibling of the shell.
    P.pod({
      key: 'web', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'df reads the mount', containers: 0,
      inner: { dx: 20, dy: (POD_H - 52) / 2, w: POD_W - 40, h: 52, label: 'app', sublabel: 'writes to /data' }, innerKey: 'app',
    }),
    P.chip({ key: 'reqChip', x: STRIP.x(0), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'requests', value: '5Gi' }),
    P.chip({ key: 'diskChip', x: STRIP.x(1), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'real disk', value: '5Gi' }),
    P.chip({ key: 'fsChip', x: STRIP.x(2), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'filesystem', value: '5Gi' }),
    P.chip({ key: 'seesChip', x: STRIP.x(3), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'Pod sees', value: '5Gi' }),
    P.packets(),
  ],
  // app is listed on purpose: a highlight set during a reduced replay would leak forward, since
  // replay never runs the motion path that would re-clear it.
  reset: {
    keys: ['pvc', 'kubectl', 'klass', 'resizer', 'kubelet', 'disk', 'app',
      'reqChip', 'diskChip', 'fsChip', 'seesChip'],
    pods: ['web'],
  },
};

const chips = (req, disk, fs, sees) => ({ reqChip: req, diskChip: disk, fsChip: fs, seesChip: sees });

// STO.S-01 as a field: every step pins EVERY opacity that any step can change, so a step can never
// inherit a stale one and a cancel mid-flight always lands on this step's own end state.
const OFF = { kubectl: 0, klass: 0, resizer: 0, kubelet: 0, lToPvc: 0, lCtrlExp: 0, lNodeExp: 0 };
const EDIT_ON = { ...OFF, kubectl: 1, lToPvc: 1 };
const GATE_ON = { ...OFF, klass: 1, lToPvc: 1 };
const CTRL_ON = { ...OFF, resizer: 1, lCtrlExp: 1 };
const NODE_ON = { ...OFF, kubelet: 1, lNodeExp: 1 };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('5Gi', '5Gi', '5Gi', '5Gi'),
    wires: { cap: 'capacity 5Gi' },
    sublabels: { pvc: 'requests 5Gi' },
    opacity: OFF,
  },
  {
    id: 'edit',
    duration: 3200,
    narration: 'You raise spec.resources.requests.storage on the claim from 5Gi to 20Gi. That single field is the only thing anybody changes by hand in this whole card. The request now says 20Gi and nothing physical has moved: the device and the filesystem are both still 5Gi.',
    chipsCued: chips('20Gi', '5Gi', '5Gi', '5Gi'),
    wires: { cap: 'capacity 5Gi', verdict: 'request raised, nothing moved' },
    sublabels: { pvc: 'requests 20Gi' },
    opacity: EDIT_ON,
    // Kubectl sends the ball, so only kubectl is lit at entry and the claim waits for it to land.
    // The claim's cue is its OWN entry because the tag stands between it and the packet.
    lit: ['kubectl'],
    flow: [
      F.route({ points: W_TO_PVC, name: 'edit' }),
      F.tag({ text: 'requests: 20Gi', points: W_TO_PVC }),
      F.light({ targets: ['pvc'], at: 'edit' }),
    ],
  },
  {
    id: 'gate',
    duration: 3200,
    narration: 'That edit was accepted only because of one field on the StorageClass the claim was provisioned from: allowVolumeExpansion is true. The check runs at admission, on the API server, so with the flag false or absent the edit itself is rejected and no resizer ever hears about it. The gate is on the way in, not further down.',
    chipsCued: chips('20Gi', '5Gi', '5Gi', '5Gi'),
    wires: { cap: 'capacity 5Gi', verdict: 'expansion allowed' },
    sublabels: { pvc: 'requests 20Gi' },
    opacity: GATE_ON,
    lit: ['klass'],
    flow: [
      F.route({ points: W_TO_PVC, name: 'gate' }),
      F.tag({ text: 'allowVolumeExpansion: true', points: W_TO_PVC }),
      F.light({ targets: ['pvc'], at: 'gate' }),
    ],
  },
  {
    id: 'controller-expand',
    duration: 3200,
    narration: 'Phase one runs on the control plane side. The external-resizer sees the accepted request and calls ControllerExpandVolume on the driver, which tells the backend to grow the real block device from 5Gi to 20Gi. The device is now bigger and the PV capacity follows it. The filesystem sitting on that device has no idea and is still 5Gi.',
    chipsCued: chips('20Gi', '20Gi', '5Gi', '5Gi'),
    wires: { cap: 'capacity 20Gi', verdict: 'device grown, fs pending' },
    sublabels: { pvc: 'FileSystemResizePending' },
    opacity: CTRL_ON,
    // The resizer sends the ball, so the disk earns its light when the call lands on it.
    lit: ['resizer'],
    flow: [
      F.route({ points: W_CTRL_EXP, name: 'exp' }),
      F.tag({ text: 'ControllerExpandVolume', points: W_CTRL_EXP }),
      F.light({ targets: ['disk'], at: 'exp' }),
    ],
  },
  {
    id: 'node-expand',
    duration: 3200,
    narration: 'Phase two runs on the Node. Kubelet calls NodeExpandVolume, which grows the filesystem on the mounted device until it fills the larger disk. This half can only happen where the Pod actually is, because a filesystem is only growable where it is mounted. A raw block volume has no filesystem at all, so it skips this phase entirely.',
    chipsCued: chips('20Gi', '20Gi', '20Gi', '5Gi'),
    wires: { cap: 'capacity 20Gi', verdict: 'filesystem grown' },
    sublabels: { pvc: 'filesystem resized' },
    opacity: NODE_ON,
    lit: ['kubelet'],
    flow: [
      F.route({ points: W_NODE_EXP, name: 'exp' }),
      F.tag({ text: 'NodeExpandVolume', points: W_NODE_EXP }),
      F.light({ targets: ['disk'], at: 'exp' }),
    ],
  },
  {
    id: 'pod-sees',
    duration: 3400,
    narration: 'Only now does the space reach the workload. The device grew, then the filesystem grew, and the extra room shows up inside the running container with no restart, so df in web-0 finally reads 20Gi. The order is the whole point: a filesystem can never grow past the device underneath it.',
    chipsCued: chips('20Gi', '20Gi', '20Gi', '20Gi'),
    wires: { cap: 'capacity 20Gi', mount: 'now 20Gi at /data', verdict: 'Bound, 20Gi' },
    sublabels: { pvc: 'Bound, 20Gi' },
    opacity: OFF,
    lit: ['disk'],
    // The new room rises the same axis the volume always did: disk to claim, claim to Pod. The claim
    // is cued straight off its own hop, the Pod block and its pulse off the second one.
    flow: [
      F.route({ points: W_MOUNT_LOW, name: 'hop1', lights: ['pvc'] }),
      F.route({ points: W_MOUNT_HIGH, after: 'hop1', name: 'hop2' }),
      F.tag({ text: 'now 20Gi', points: W_MOUNT_HIGH, after: 'hop1' }),
      F.light({ targets: ['app'], at: 'hop2' }),
      F.pulse({ pod: 'web', at: 'hop2' }),
    ],
  },
  {
    id: 'no-shrink',
    duration: 3200,
    narration: 'Growing works, going back does not. Ask for less than the volume already has and the API refuses the edit, because there is no safe general way to shrink a filesystem with live data on it. Walking a request back down while an expansion is still pending is a different thing: that cancels a grow that has not happened, it does not make any volume smaller.',
    chipsCued: chips('20Gi', '20Gi', '20Gi', '20Gi'),
    wires: { cap: 'capacity 20Gi', verdict: 'request stays 20Gi' },
    sublabels: { pvc: 'shrink refused' },
    opacity: EDIT_ON,
    lit: ['kubectl'],
    flow: [
      F.route({ points: W_TO_PVC, name: 'shrink' }),
      F.tag({ text: 'requests: 5Gi rejected', points: W_TO_PVC }),
      F.light({ targets: ['pvc'], at: 'shrink' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
