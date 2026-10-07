import { P, F, defineCard, chipStrip, makeRidingLabel } from './storage-kit.js';
import { g, rect } from '../../lib/svg.js';
// Design notes for this card: ./CARDS/storage-volume-expansion.md

// Pod, claim and disk sit on this axis, and the four actors are placed so no lane turns more than once.
const CX = 600;

// Three tiers on one pitch between block midpoints, the same pitch and footprints as
// storage-pvc-protection so the pair reads as one family. Catalog blocks and Pod (NET.L-01).
const BOX_W = 232, BOX_H = 80;
const POD_W = BOX_W, POD_H = 104, POD_X = CX - POD_W / 2, POD_Y = 56;
const POD_BOTTOM = POD_Y + POD_H;
const APP_W = 192, APP_H = 44, APP_DY = 26;

const PVC_W = BOX_W, PVC_H = BOX_H, PVC_X = CX - PVC_W / 2, PVC_Y = 270 - PVC_H / 2;
const PVC_BOTTOM = PVC_Y + PVC_H, PVC_MID = PVC_Y + PVC_H / 2, PVC_RIGHT = PVC_X + PVC_W;

const DISK_W = 230, DISK_H = 86, DISK_Y = 389;
const DISK_TOP = DISK_Y, DISK_MID = DISK_Y + DISK_H / 2;
const DISK_LEFT = CX - DISK_W / 2, DISK_RIGHT = CX + DISK_W / 2;

// One actor footprint for all four, and the left column is the exact mirror of the right about CX.
const ACT_W = BOX_W, ACT_H = BOX_H;
const ACT_R_X = 850, ACT_R_CX = ACT_R_X + ACT_W / 2;
const ACT_L_X = 1200 - ACT_R_X - ACT_W, ACT_L_RIGHT = ACT_L_X + ACT_W;
const SLOT_A_Y = POD_Y + POD_H / 2 - ACT_H / 2;                // centred on the Pod tier
const SLOT_A_BOTTOM = SLOT_A_Y + ACT_H;
const BOTTOM_ACT_Y = DISK_MID - ACT_H / 2;

const MOUNT_LBL_X = CX + 16, MOUNT_LBL_Y = 204;
const VERDICT_LBL_X = PVC_X - 16, VERDICT_LBL_Y = PVC_MID + 4; // anchored end
// cylinder() draws its own name on the baseline h/2+5, so the capacity line goes 14 below it.
const CAP_LBL_Y = DISK_Y + DISK_H / 2 + 5 + 14;
const CHIP_Y = 545, CHIP_H = 34;

// Four chips that start equal and change one at a time, so the staggered highlight walking left to
// right is the two-phase story.
const CHIP_W = 252, CHIP_GAP = 24;
const STRIP = chipStrip({ cx: CX, w: CHIP_W, gap: CHIP_GAP });

// The subject drawn: four 5Gi cells under the disk, so 20Gi is a length. The device wash and the
// filesystem core are two layers on one axis, and the gap between them is phase one.
const GAUGE_X = DISK_LEFT, GAUGE_W = DISK_W;
const GAUGE_Y = DISK_Y + DISK_H + 13, GAUGE_H = 28;
const CELL_N = 4, CELL_GAP = 6;
const CELL_W = (GAUGE_W - CELL_GAP * (CELL_N - 1)) / CELL_N;   // one cell per 5Gi
// Three insets, so no two layers share a bbox: superimposed rects are one key to every DOM probe.
const DEV_INSET = 1, FS_INSET = 4;

// Inline style like the slot gauge on storage-volume-attach-limits: no field writes a fill, and a class
// would mean a diagrams.css rule owned by one card.
const GAUGE_FILL = Object.freeze({
  track: 'rgba(255, 255, 255, 0.04)',
  device: 'rgba(94, 202, 148, 0.34)',
  fs: 'rgba(94, 202, 148, 0.72)',
});
const GAUGE_STROKE = 'rgba(94, 202, 148, 0.35)';

// ONE raw part for the whole gauge: no part kind emits a bare rect. The six cells that move are
// filed by hand, which is what lets `opacity` and F.reveal reach them by name.
function gauge(refs) {
  const grp = g({});
  const cell = (i, fill, inset) => {
    const r = rect({
      x: GAUGE_X + i * (CELL_W + CELL_GAP) + inset, y: GAUGE_Y + inset,
      width: CELL_W - inset * 2, height: GAUGE_H - inset * 2, rx: 3,
    });
    r.style.fill = fill;
    grp.appendChild(r);
    return r;
  };
  for (let i = 0; i < CELL_N; i++) {
    const r = cell(i, GAUGE_FILL.track, 0);
    r.style.stroke = GAUGE_STROKE;
    r.style.strokeWidth = '1';
  }
  // Cell 0 is the original 5Gi and is on from the start. The rest are born mid-story, the way the
  // four actor boxes are, so they carry the same opacity 0 at build.
  const layer = (fill, inset) => [0, 1, 2, 3].map((i) => {
    const r = cell(i, fill, inset);
    if (i > 0) r.style.opacity = '0';
    return r;
  });
  const dev = layer(GAUGE_FILL.device, DEV_INSET);
  const fs = layer(GAUGE_FILL.fs, FS_INSET);
  refs.dev1 = dev[1]; refs.dev2 = dev[2]; refs.dev3 = dev[3];
  refs.fs1 = fs[1]; refs.fs2 = fs[2]; refs.fs3 = fs[3];
  return grp;
}

// Each lane and its ball share one points array. Every endpoint sits on a block edge, and no lane turns twice.
const W_MOUNT_LOW  = [[CX, DISK_TOP], [CX, PVC_BOTTOM]];       // disk -> claim, upward
const W_MOUNT_HIGH = [[CX, PVC_Y], [CX, POD_BOTTOM]];          // claim -> Pod, upward
// Slot A to the claim: one turn, landing dead center on the claim's right edge.
const W_TO_PVC = [[ACT_R_CX, SLOT_A_BOTTOM], [ACT_R_CX, PVC_MID], [PVC_RIGHT, PVC_MID]];
// The same run reversed: on gate the edit reads the class, so the head lands on slot A.
const W_TO_CLASS = [...W_TO_PVC].reverse();
// The two phases, straight in from opposite sides at the disk's own midline.
const W_CTRL_EXP = [[ACT_R_X, DISK_MID], [DISK_RIGHT, DISK_MID]];
const W_NODE_EXP = [[ACT_L_RIGHT, DISK_MID], [DISK_LEFT, DISK_MID]];

// Each of these lanes ends midway up a block edge, so a tag riding on the lane would print over the block.
const CLAIM_TAG_DY = PVC_BOTTOM - PVC_MID + 12;   // below the claim, clear of the slot above
const DISK_TAG_DY = DISK_TOP - DISK_MID - 7;      // in the band between the claim and the disk
// Every ball here leaves at t=0, where a route ball does not fade in, so its tag shows at once (inMs 0).
const rideTag = makeRidingLabel({ role: 'storage', inMs: 0, outMs: 200, hold: 0 });
const CLAIM_TAG = { dy: CLAIM_TAG_DY, fn: rideTag };
const DISK_TAG = { dy: DISK_TAG_DY, fn: rideTag };
// Right of the vertical leg it climbs, so at rest under slot A the lane does not cut the glyphs.
const CLASS_TAG = { ...CLAIM_TAG, dx: 64 };

// Every lane is a route: dashed, headed, built from its ball's points. Append order is z-order:
// blocks and disk, lanes and captions, the Pod, the chip strip, the packets.
export const SCENE = {
  'aria-label': 'Growing a volume while the Pod keeps running normally runs in two phases. Raising the request on PVC data-claim is accepted only because the StorageClass behind it sets allowVolumeExpansion, then the external-resizer grows the real device and Kubelet grows the filesystem on it, a step a driver may skip for a raw block volume, which has no filesystem to grow and may not need the Node call at all. Where that filesystem grows online the space reaches web-0 with no restart. A shrink is refused.',
  parts: [
    P.defs(),
    P.box({ key: 'pvc', x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-claim', sublabel: 'requests 5Gi' }),
    // Slot A holds kubectl or the class, never both on one step, so they share one run: kubectl sends
    // down it into the claim, the class is read up it on gate.
    P.box({ key: 'kubectl', x: ACT_R_X, y: SLOT_A_Y, w: ACT_W, h: ACT_H, label: 'kubectl patch', sublabel: 'edits the request', opacity: 0 }),
    P.box({ key: 'klass', x: ACT_R_X, y: SLOT_A_Y, w: ACT_W, h: ACT_H, label: 'StorageClass gp3', sublabel: 'allowVolumeExpansion', opacity: 0 }),
    P.box({ key: 'resizer', x: ACT_R_X, y: BOTTOM_ACT_Y, w: ACT_W, h: ACT_H, label: 'External-resizer', sublabel: 'ControllerExpandVolume', opacity: 0 }),
    P.box({ key: 'kubelet', x: ACT_L_X, y: BOTTOM_ACT_Y, w: ACT_W, h: ACT_H, label: 'Kubelet', sublabel: 'NodeExpandVolume', opacity: 0 }),
    P.cylinder({ key: 'disk', x: DISK_LEFT, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'PV data-vol' }),
    P.raw({ make: gauge }),
    P.lane({ key: 'lMountLow', points: W_MOUNT_LOW, dashed: true, dim: true }),
    P.lane({ key: 'lMountHigh', points: W_MOUNT_HIGH, dashed: true, dim: true }),
    P.lane({ key: 'lToPvc', points: W_TO_PVC, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'lToClass', points: W_TO_CLASS, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'lCtrlExp', points: W_CTRL_EXP, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'lNodeExp', points: W_NODE_EXP, dashed: true, dim: true, opacity: 0 }),
    P.wire({ key: 'mount', x: MOUNT_LBL_X, y: MOUNT_LBL_Y, anchor: 'start' }),
    P.wire({ key: 'verdict', x: VERDICT_LBL_X, y: VERDICT_LBL_Y, anchor: 'end' }),
    P.wire({ key: 'cap', x: CX, y: CAP_LBL_Y }),
    // The group is the pulse target: pulsing a bare shell fires at half strength, since the inner box is a
    // sibling of the shell, not a descendant.
    P.pod({
      key: 'web', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'df reads the mount', containers: 0,
      inner: { dx: (POD_W - APP_W) / 2, dy: APP_DY, w: APP_W, h: APP_H, label: 'app', sublabel: 'writes to /data' }, innerKey: 'app',
    }),
    P.chip({ key: 'reqChip', x: STRIP.x(0), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'requests', value: '5Gi' }),
    P.chip({ key: 'diskChip', x: STRIP.x(1), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'real disk', value: '5Gi' }),
    P.chip({ key: 'fsChip', x: STRIP.x(2), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'filesystem', value: '5Gi' }),
    P.chip({ key: 'seesChip', x: STRIP.x(3), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'Pod sees', value: '5Gi' }),
    P.packets(),
  ],
  reset: {
    keys: ['pvc', 'kubectl', 'klass', 'resizer', 'kubelet', 'disk',
      'reqChip', 'diskChip', 'fsChip', 'seesChip'],
    pods: ['web'],
  },
};

const chips = (req, disk, fs, sees) => ({ reqChip: req, diskChip: disk, fsChip: fs, seesChip: sees });

// STO.S-01 as a field: every step pins every opacity any step can change, so a cancel mid-flight lands
// on this step's own end state.
const OFF = { kubectl: 0, klass: 0, resizer: 0, kubelet: 0, lToPvc: 0, lToClass: 0, lCtrlExp: 0, lNodeExp: 0 };
const EDIT_ON = { ...OFF, kubectl: 1, lToPvc: 1 };
const GATE_ON = { ...OFF, klass: 1, lToClass: 1 };
const CTRL_ON = { ...OFF, resizer: 1, lCtrlExp: 1 };
const NODE_ON = { ...OFF, kubelet: 1, lNodeExp: 1 };

// The gauge as two extents in 5Gi cells. Cell 0 never moves, so only three of each are named.
const stage = (actors, device, fs) => ({
  ...actors,
  dev1: device > 1 ? 1 : 0, dev2: device > 2 ? 1 : 0, dev3: device > 3 ? 1 : 0,
  fs1: fs > 1 ? 1 : 0, fs2: fs > 2 ? 1 : 0, fs3: fs > 3 ? 1 : 0,
});

const GROW_BEAT = 140;   // cell to cell, so the extent walks rather than blinks

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('5Gi', '5Gi', '5Gi', '5Gi'),
    wires: { cap: 'capacity 5Gi' },
    sublabels: { pvc: 'requests 5Gi' },
    opacity: stage(OFF, 1, 1),
  },
  {
    id: 'edit',
    duration: 3200,
    narration: 'You raise spec.resources.requests.storage on the claim from 5Gi to 20Gi. That single field is the only thing anybody changes by hand in this whole card. The request now says 20Gi and nothing physical has moved: the device and the filesystem are both still 5Gi.',
    chipsCued: chips('20Gi', '5Gi', '5Gi', '5Gi'),
    wires: { cap: 'capacity 5Gi', verdict: 'request raised, nothing moved' },
    sublabels: { pvc: 'requests 20Gi' },
    opacity: stage(EDIT_ON, 1, 1),
    // Kubectl sends the ball, so only kubectl is lit at entry and the claim waits for it to land.
    // The claim's cue is its OWN entry because the tag stands between it and the packet.
    lit: ['kubectl'],
    flow: [
      F.route({ points: W_TO_PVC, name: 'edit', tag: { text: 'requests: 20Gi', ...CLAIM_TAG } }),
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
    opacity: stage(GATE_ON, 1, 1),
    // The edit under admission sends the lookup, so the claim is lit first and the class on arrival.
    lit: ['pvc'],
    flow: [
      F.route({ points: W_TO_CLASS, name: 'gate', tag: { text: 'read at admission', ...CLASS_TAG } }),
      F.light({ targets: ['klass'], at: 'gate' }),
    ],
  },
  {
    id: 'controller-expand',
    duration: 3200,
    narration: 'Phase one runs on the controller side. The external-resizer sees the accepted request and calls ControllerExpandVolume on the driver, which tells the backend to grow the real block device from 5Gi to 20Gi. The device is now bigger and the PV capacity follows it. The filesystem sitting on that device has no idea and is still 5Gi.',
    chipsCued: chips('20Gi', '20Gi', '5Gi', '5Gi'),
    wires: { cap: 'capacity 20Gi', verdict: 'device grown, fs pending' },
    sublabels: { pvc: 'FileSystemResizePending' },
    opacity: stage(CTRL_ON, 4, 1),
    // The resizer sends the ball, so the disk earns its light when the call lands on it.
    lit: ['resizer'],
    flow: [
      F.route({ points: W_CTRL_EXP, name: 'exp', tag: { text: 'device 5Gi to 20Gi', ...DISK_TAG } }),
      F.light({ targets: ['disk'], at: 'exp' }),
      // The device extent walks out one cell at a time from the call landing, and the filesystem
      // core stays one cell wide behind it. That gap is what the step is about.
      F.reveal({ target: 'dev1', at: 'exp' }),
      F.reveal({ target: 'dev2', at: 'exp', plus: GROW_BEAT }),
      F.reveal({ target: 'dev3', at: 'exp', plus: GROW_BEAT * 2 }),
    ],
  },
  {
    id: 'node-expand',
    duration: 3200,
    narration: 'Phase two runs on the Node. Kubelet calls NodeExpandVolume, which grows the filesystem on the mounted device until it fills the larger disk. This half can only happen where the Pod actually is, because a filesystem is only growable where it is mounted. A raw block volume has no filesystem to grow, so a driver may skip that work.',
    chipsCued: chips('20Gi', '20Gi', '20Gi', '5Gi'),
    wires: { cap: 'capacity 20Gi', verdict: 'filesystem grown' },
    sublabels: { pvc: 'capacity 20Gi' },
    opacity: stage(NODE_ON, 4, 4),
    lit: ['kubelet'],
    flow: [
      F.route({ points: W_NODE_EXP, name: 'exp', tag: { text: 'filesystem 5Gi to 20Gi', ...DISK_TAG } }),
      F.light({ targets: ['disk'], at: 'exp' }),
      // Phase two closes the gap phase one opened: the core fills the outline cell by cell, on the
      // same beat, so the two halves read as one motion split in two.
      F.reveal({ target: 'fs1', at: 'exp' }),
      F.reveal({ target: 'fs2', at: 'exp', plus: GROW_BEAT }),
      F.reveal({ target: 'fs3', at: 'exp', plus: GROW_BEAT * 2 }),
    ],
  },
  {
    id: 'pod-sees',
    duration: 3400,
    narration: 'Only now does the space reach the workload. The device grew, then the filesystem grew, and because this filesystem grows online the extra room shows up inside the running container with no restart, so df in web-0 finally reads 20Gi. The order is the whole point: a filesystem can never grow past the device underneath it.',
    chipsCued: chips('20Gi', '20Gi', '20Gi', '20Gi'),
    wires: { cap: 'capacity 20Gi', mount: 'now 20Gi at /data', verdict: 'nothing pending' },
    sublabels: { pvc: 'Bound, 20Gi' },
    opacity: stage(OFF, 4, 4),
    lit: ['disk'],
    // The new room rises the same axis the volume always did: disk to claim, claim to Pod. The claim
    // is cued straight off its own hop, the Pod pulse off the second one.
    flow: [
      F.route({ points: W_MOUNT_LOW, name: 'hop1', lights: ['pvc'] }),
      F.route({ points: W_MOUNT_HIGH, after: 'hop1', pulse: 'web' }),
    ],
  },
  {
    id: 'no-shrink',
    duration: 3200,
    narration: 'Growing works, going back does not. Ask for less than the volume already has and the API refuses the edit, because there is no safe general way to shrink a filesystem with live data on it. Walking a request back down while an expansion is still pending is a different thing: that retries a smaller grow, still above the current size.',
    chipsCued: chips('20Gi', '20Gi', '20Gi', '20Gi'),
    wires: { cap: 'capacity 20Gi', verdict: 'request stays 20Gi' },
    sublabels: { pvc: 'shrink refused' },
    opacity: stage(EDIT_ON, 4, 4),
    lit: ['kubectl'],
    flow: [
      F.route({ points: W_TO_PVC, name: 'shrink', tag: { text: 'requests: 5Gi rejected', ...CLAIM_TAG } }),
      F.light({ targets: ['pvc'], at: 'shrink' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
