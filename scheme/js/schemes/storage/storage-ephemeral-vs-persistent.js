import { P, F, defineCard, BEAT, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-ephemeral-vs-persistent


const SPINE_X = 600;

// The Pod tier is the only one inside the narration panel's y band (panel bottom 181 on this card,
// measured over 1600/1280/1100), so it is sized and dropped to keep its area clear of it.
const POD_W = 560, POD_H = 124, POD_X = SPINE_X - POD_W / 2, POD_Y = 90; // 320..880
const POD_BOTTOM = POD_Y + POD_H;                                        // 214

const COL_D = 160;                     // each column sits COL_D from the spine, symmetric
const LEFT_CX = SPINE_X - COL_D;       // 440, emptyDir column
const RIGHT_CX = SPINE_X + COL_D;      // 760, PVC/PV column

const BLOCK_Y = 306;                   // shared top of emptyDir and PVC, so both write arrows match

const ED_W = 200, ED_H = 172, ED_X = LEFT_CX - ED_W / 2, ED_Y = BLOCK_Y; // 340..540, 306..478
const ED_TOP = ED_Y;

const PVC_W = 200, PVC_H = 64, PVC_X = RIGHT_CX - PVC_W / 2, PVC_Y = BLOCK_Y; // 660..860, 306..370
const PVC_TOP = PVC_Y, PVC_BOTTOM = PVC_Y + PVC_H;  // 306 / 370

const PV_W = 200, PV_H = 120, PV_X = RIGHT_CX - PV_W / 2, PV_Y = 420; // 660..860, 420..540
const PV_TOP = PV_Y, PV_CX = RIGHT_CX;

const DIV_X = SPINE_X;
const DIV_TOP = POD_BOTTOM + 16, DIV_BOTTOM = 548;   // the divider starts under the Pod, not inside it
const CHIPS_Y = 576, CHIP_W = 196, CHIP_GAP = 16, CHIP_H = 34;
const CHIP_X = i => 600 - (CHIP_W * 3 + CHIP_GAP * 2) / 2 + i * (CHIP_W + CHIP_GAP);   // 290 / 502 / 714

// Two lanes per column, offset LANE either side of the column centre. Writes ride the OUTER lane
// down, remounts ride the INNER lane back up, so a wire and its ball never share a direction.
const LANE = 16;
const W_L_WRITE = [[LEFT_CX - LANE, POD_BOTTOM], [LEFT_CX - LANE, ED_TOP]];       // Pod -> emptyDir
const W_L_MOUNT = [[LEFT_CX + LANE, ED_TOP], [LEFT_CX + LANE, POD_BOTTOM]];       // emptyDir -> Pod
const W_R_WRITE = [[RIGHT_CX + LANE, POD_BOTTOM], [RIGHT_CX + LANE, PVC_TOP]];    // Pod -> PVC
const W_R_MOUNT = [[RIGHT_CX - LANE, PVC_TOP], [RIGHT_CX - LANE, POD_BOTTOM]];    // PVC -> Pod

// Both remounts end on the Pod floor, where the default -14 puts the tag under the shell edge for
// 100 ms. Riding 12 BELOW the ball is the least that clears all four viewports.
const MOUNT_TAG_DY = 12;

// Raise the Pod sublabel a couple pixels off its default baseline so it sits tighter under the box.
// An ATTRIBUTE on an element the pod kind does not hand back, which is what tune is for.
const raiseSublabel = (el) => {
  const sub = el.querySelector('.scheme-pod-sublabel');
  if (sub) sub.setAttribute('y', POD_H - 12);
};

// The list order IS the append order, which is the z-order: blocks, then the divider and the bound
// link and the four lanes above them, then the chip strip, then the packet layer on top of all.
export const SCENE = {
  'aria-label': 'Ephemeral versus persistent storage: one Pod mounts both an emptyDir and a PersistentVolumeClaim and writes to each. When the Pod is deleted and rescheduled onto another Node, the emptyDir comes back empty because it was tied to the old Node, while the claim reattaches the very same disk with the data intact.',
  parts: [
    P.defs(),
    P.pod({
      key: 'pod', innerKey: 'podBox', tune: raiseSublabel,
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod api-0', sublabel: 'volumes: scratch, data', containers: 0,
      inner: { dx: 24, dy: (POD_H - 60) / 2, w: POD_W - 48, h: 60, label: 'app', sublabel: 'mounts /scratch and /data' },
    }),
    P.cylinder({ key: 'ed', x: ED_X, y: ED_Y, w: ED_W, h: ED_H, label: 'emptyDir' }),
    P.box({ key: 'pvc', x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data', sublabel: 'Bound' }),
    P.cylinder({ key: 'pv', x: PV_X, y: PV_Y, w: PV_W, h: PV_H, label: 'PV x73a' }),
    // Central ephemeral | persistent split, and the dim dashed Bound link tying the claim to its PV.
    P.relation({ points: [[DIV_X, DIV_TOP], [DIV_X, DIV_BOTTOM]], dash: '4 6' }),
    P.relation({ points: [[PV_CX, PVC_BOTTOM], [PV_CX, PV_TOP]], dash: '4 6' }),
    // Four straight arrows: a write (down) and a remount (up) lane per column.
    P.lane({ key: 'wLWrite', points: W_L_WRITE, dashed: true, dim: true }),
    P.lane({ key: 'wLMount', points: W_L_MOUNT, dashed: true, dim: true }),
    P.lane({ key: 'wRWrite', points: W_R_WRITE, dashed: true, dim: true }),
    P.lane({ key: 'wRMount', points: W_R_MOUNT, dashed: true, dim: true }),
    // Three state chips on the card's own strip (290..910), evenly spaced, no text overlap.
    P.chip({ key: 'edChip', x: CHIP_X(0), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'emptyDir', value: 'empty' }),
    P.chip({ key: 'pvcChip', x: CHIP_X(1), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'PVC', value: 'Bound' }),
    P.chip({ key: 'podChip', x: CHIP_X(2), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'Pod', value: 'on Node-1' }),
    P.packets(),
  ],
  reset: {
    keys: ['ed', 'pvc', 'pv', 'podBox', 'edChip', 'pvcChip', 'podChip'],
    pods: ['pod'],
  },
};

// Every lane has the Pod at one end, so ONE formula pins blocks and lanes together, or mount arrows
// stay at full across a Pod faded to the terminal shade. STO.S-01: every step states the stack.
const presence = ({ pod = 1, ed = 1 } = {}) => ({ pod, ed, wLWrite: pod, wLMount: pod, wRWrite: pod, wRMount: pod });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: { edChip: 'empty', pvcChip: 'Bound', podChip: 'on Node-1' },
    opacity: presence(),
  },
  {
    id: 'write',
    duration: 2800,
    narration: 'The app writes to both. A log line goes into the emptyDir on the Node, and a database row goes through the claim onto the PersistentVolume. Right now both look the same, each holds the byte it was given.',
    chipsCued: { edChip: 'log written', pvcChip: 'row written', podChip: 'on Node-1' },
    opacity: presence(),
    // Pod to both disks: an up-arrow, so the Pod pulses first and both writes descend at afterPulse.
    // Each cue is its own entry: it stands after its tag, and flow emission order is observable.
    flow: [
      F.pulse({ pod: 'pod' }),
      F.route({ points: W_L_WRITE, delay: BEAT.afterPulse, name: 'wl' }),
      F.tag({ text: 'log line', points: W_L_WRITE, delay: BEAT.afterPulse }),
      F.light({ targets: ['ed'], at: 'wl' }),
      F.route({ points: W_R_WRITE, delay: BEAT.afterPulse, name: 'wr' }),
      F.tag({ text: 'db row', points: W_R_WRITE, delay: BEAT.afterPulse }),
      F.light({ targets: ['pvc', 'pv'], at: 'wr' }),
    ],
  },
  {
    id: 'delete',
    duration: 2800,
    narration: 'The Pod is deleted off Node-1. Its emptyDir was part of the Node, so it is wiped with the Pod. The PersistentVolume is a separate object with its own disk, so it simply detaches and keeps every byte.',
    // The chip is the CLAIM, and a claim does not detach: the disk does. What the claim does here is
    // survive the Pod and stay bound, which is the whole contrast with the emptyDir beside it.
    chipsCued: { edChip: 'wiped', pvcChip: 'kept, still Bound', podChip: 'deleted' },
    // The Pod and its emptyDir are gone by the END, both at the same terminal shade, so that is what
    // the static field carries and the rewind puts the animated path back at full to travel from.
    opacity: presence({ pod: OPACITY.terminated, ed: OPACITY.terminated }),
    // The PV keeps its data, so it stays lit on both paths.
    lit: ['pv'],
    rewind: { opacity: presence() },
    // The deleted Pod blinks at full FIRST and goes at afterPulse, so the two never read as one
    // event (M-08). The lanes go with the Pod, on the Pod beat: they are the mounts it held.
    flow: [
      F.pulse({ pod: 'pod' }),
      ...['pod', 'wLWrite', 'wLMount', 'wRWrite', 'wRMount'].map(target =>
        F.fade({ target, to: OPACITY.terminated, dur: 650, delay: BEAT.afterPulse, fill: 'forwards' })),
      F.fade({ target: 'ed', to: OPACITY.terminated, dur: 650, delay: BEAT.afterPulse + 250, fill: 'forwards' }),
    ],
  },
  {
    id: 'reschedule',
    duration: 2400,
    narration: 'The controller recreates the Pod, and the Scheduler places it on Node-2. This is where the two volumes stop looking alike, because one is tied to a Node it is no longer on and the other is tied to nothing but the claim.',
    chipsCued: { edChip: 'empty again', pvcChip: 'reattaching', podChip: 'on Node-2' },
    opacity: presence(),
    lit: ['pv'],
    // The Pod comes up fresh on Node-2 and its mount lanes rise with it. The emptyDir was wiped with
    // the Pod, so it starts this step gone too: an emptyDir outliving its Pod is what the card denies.
    rewind: { opacity: presence({ pod: OPACITY.terminated, ed: OPACITY.terminated }) },
    flow: [
      ...['pod', 'wLWrite', 'wLMount', 'wRWrite', 'wRMount'].map(target =>
        F.fade({ target, from: OPACITY.terminated, to: 1, dur: 500, fill: 'forwards', easing: 'ease-out' })),
      // The mirror of the delete: the directory left 250 after the Pod and comes back 250 after it,
      // because a brand new emptyDir is made for the Pod on the Node it landed on.
      F.fade({ target: 'ed', from: OPACITY.terminated, to: 1, dur: 500, delay: 250, fill: 'forwards', easing: 'ease-out' }),
      F.pulse({ pod: 'pod', delay: 550 }),
    ],
  },
  {
    id: 'diverge',
    duration: 2800,
    narration: 'The emptyDir comes back empty. It is a brand new directory on Node-2 and knows nothing about Node-1. The claim reattaches the very same PersistentVolume, so /data still has the database row. Same Pod spec, two completely different outcomes.',
    chipsCued: { edChip: 'empty', pvcChip: 'reattached, intact', podChip: 'on Node-2' },
    opacity: presence(),
    lit: ['ed', 'pvc', 'pv'],
    // Both remount lanes are 92 units long, so the two routes clamp to the same routeDur and the
    // Pod's arrival beat is either arrival, so keying the pulse off 'ml' alone is exact.
    flow: [
      F.route({ points: W_L_MOUNT, name: 'ml' }),
      F.tag({ text: 'empty', points: W_L_MOUNT, dy: MOUNT_TAG_DY }),
      F.route({ points: W_R_MOUNT }),
      F.tag({ text: 'db row intact', points: W_R_MOUNT, dy: MOUNT_TAG_DY }),
      F.pulse({ pod: 'pod', at: 'ml' }),
    ],
  },
  {
    id: 'verdict',
    duration: 2200,
    narration: 'That is the whole distinction. Ephemeral storage is scratch that resets whenever the Pod is rescheduled, persistent storage follows the claim across Nodes and restarts. Put throwaway data in an emptyDir and anything you must not lose behind a PVC.',
    chipsCued: { edChip: 'resets on move', pvcChip: 'follows the claim', podChip: 'on Node-2' },
    opacity: presence(),
    // Verdict is a plain recap: only the Pod pulses, no block stays lit.
    flow: [F.pulse({ pod: 'pod' })],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
