import { P, F, defineCard, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-pvc-binding


const CX = 600;                                     // canvas + identity-spine center

const POD_W = 240, POD_H = 104, POD_X = CX - POD_W / 2, POD_Y = 56;
const POD_BOTTOM = POD_Y + POD_H;                   // 160

const PVC_W = 240, PVC_H = 68, PVC_X = CX - PVC_W / 2, PVC_Y = 236;
const PVC_RIGHT = PVC_X + PVC_W, PVC_BOTTOM = PVC_Y + PVC_H; // 720 / 304
const PVC_MID = PVC_Y + PVC_H / 2;                  // 270

// Standard controller box, same footprint as kube-proxy in the networking cards (220 x 72). Its
// vertical center sits on PVC_MID so the watch and bind hops stay straight horizontals.
const CTRL_W = 220, CTRL_H = 72, CTRL_X = 850, CTRL_Y = PVC_MID - CTRL_H / 2;
const CTRL_LEFT = CTRL_X, CTRL_RIGHT = CTRL_X + CTRL_W;  // 850 / 1070
const CTRL_CX = CTRL_X + CTRL_W / 2, CTRL_MID = CTRL_Y + CTRL_H / 2;                    // 960 / 270

// The second claim (exclusive step) sits above the controller, denied by a short straight hop up.
const PVCB_W = 200, PVCB_H = 68, PVCB_X = CTRL_CX - PVCB_W / 2, PVCB_Y = 100;
const PVCB_CX = PVCB_X + PVCB_W / 2, PVCB_BOTTOM = PVCB_Y + PVCB_H; // 990 / 168

// The disk shelf: three PVs spread symmetrically around the spine. The controller scans them from
// BELOW, so their tops carry only the mount lane and their bottoms receive the probe.
const PV_Y = 384, PV_H = 86;
const PV_TOP = PV_Y, PV_BOTTOM = PV_Y + PV_H;       // 384 / 470
const SMALL_CX = 280, MATCH_CX = CX, SLOW_CX = 920; // 280 / 600 / 920

const MOUNT_X = CX;     // the ONE spine lane: the mount ascent, arrowheaded, dead center
const DROP_X = 1120;    // the probe exits the controller's right side and wraps down here, clear of PV b22
const BUS_Y = 520;      // the scan bus runs BELOW the shelf, a generous gap under the cylinder bottoms
const LANE = 12;        // half-gap between the two horizontal PVC<->controller lanes
const SPEC_Y = PV_Y + 62;   // inside the cylinder, a line under its name
const VERDICT_Y = 544;  // per-disk verdict, below the scan bus
const CHIPS_Y = 572;


const W_PVC_TO_CTRL = [[PVC_RIGHT, PVC_MID - LANE], [CTRL_LEFT, PVC_MID - LANE]];   // watch, straight
const W_CTRL_TO_PVC = [[CTRL_LEFT, PVC_MID + LANE], [PVC_RIGHT, PVC_MID + LANE]];   // bind write, straight
const W_SCAN_SMALL  = [[CTRL_RIGHT, CTRL_MID], [DROP_X, CTRL_MID], [DROP_X, BUS_Y], [SMALL_CX, BUS_Y], [SMALL_CX, PV_BOTTOM]];
const W_SCAN_MATCH  = [[CTRL_RIGHT, CTRL_MID], [DROP_X, CTRL_MID], [DROP_X, BUS_Y], [MATCH_CX, BUS_Y], [MATCH_CX, PV_BOTTOM]];
const W_SCAN_SLOW   = [[CTRL_RIGHT, CTRL_MID], [DROP_X, CTRL_MID], [DROP_X, BUS_Y], [SLOW_CX, BUS_Y], [SLOW_CX, PV_BOTTOM]];
const W_CTRL_TO_PVCB = [[PVCB_CX, CTRL_Y], [PVCB_CX, PVCB_BOTTOM]];   // deny, straight up
const W_MOUNT_LOW   = [[MOUNT_X, PV_TOP], [MOUNT_X, PVC_BOTTOM]];   // PV -> PVC, upward
const W_MOUNT_HIGH  = [[MOUNT_X, PVC_Y], [MOUNT_X, POD_BOTTOM]];    // PVC -> Pod, upward

// The watch lane runs between the claim and the controller at their own mid height, so at the default
// -14 the tag is cut by both box edges for 800 ms. -28 clears their tops on all four viewports.
const WATCH_TAG_DY = -28;

// A disk is a cylinder plus its spec line, grouped so dimming a rejected volume fades the spec WITH
// it. Only the winner keys its cylinder: .highlight must sit on .scheme-cylinder, never the wrapper.
const disk = ({ key, cylKey, cx, w, label, spec }) => P.group({
  key,
  parts: [
    P.cylinder({ key: cylKey, x: cx - w / 2, y: PV_Y, w, h: PV_H, label }),
    P.tag({ x: cx, y: SPEC_Y, text: spec }),
  ],
});

// Family z-order: blocks and disks, then the wires and their labels ABOVE them so a connector that
// crosses a block stays visible, then the chip strip, then the packet layer.
export const SCENE = {
  'aria-label': 'PersistentVolumeClaim to PersistentVolume binding: a claim states the capacity, access mode and class it needs, the binding controller scans the available volumes and rejects the ones that do not fit, pairs the claim with the one that does by writing the link both ways, and only then can Kubelet mount the volume into the Pod',
  parts: [
    P.defs(),
    P.box({ key: 'ctrl', x: CTRL_X, y: CTRL_Y, w: CTRL_W, h: CTRL_H, label: 'PV binding controller', sublabel: 'kube-controller-manager' }),
    P.box({ key: 'pvc', x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-claim', sublabel: 'wants 5Gi, RWO, local-ssd' }),
    P.box({ key: 'pvcB', x: PVCB_X, y: PVCB_Y, w: PVCB_W, h: PVCB_H, label: 'PVC data-claim-2', sublabel: 'wants 5Gi, RWO, local-ssd', opacity: 0 }),
    // The group IS the pulse target: pulsing a bare shell would fire at half strength, since
    // querySelectorAll matches descendants only and the inner box is a sibling of the shell.
    P.pod({
      key: 'appPod', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'volumes: data-claim', containers: 0,
      inner: { dx: 20, dy: (POD_H - 52) / 2, w: POD_W - 40, h: 52, label: 'app', sublabel: 'writes to /data' }, innerKey: 'appBox',
    }),
    // Each disk states all THREE things the claim is matched on, so the verdict can be checked
    // rather than taken on trust. Access mode is identical on all three on purpose.
    disk({ key: 'pvSmall', cx: SMALL_CX, w: 200, label: 'PV a01', spec: '2Gi, RWO, local-ssd' }),
    disk({ key: 'pvMatch', cylKey: 'pvMatchCyl', cx: MATCH_CX, w: 230, label: 'PV x73a', spec: '5Gi, RWO, local-ssd' }),
    disk({ key: 'pvSlow', cx: SLOW_CX, w: 200, label: 'PV b22', spec: '5Gi, RWO, local-hdd' }),
    P.lane({ points: W_PVC_TO_CTRL, dashed: true, dim: true }),
    P.lane({ points: W_CTRL_TO_PVC, dashed: true, dim: true }),
    // The two probes into the rejected disks are keyed: a lane dies with the disk it ends on, or the
    // shelf carries two full-strength arrowheads into ghosts (A-13).
    P.lane({ key: 'wScanSmall', points: W_SCAN_SMALL, dashed: true, dim: true }),
    P.lane({ points: W_SCAN_MATCH, dashed: true, dim: true }),
    P.lane({ key: 'wScanSlow', points: W_SCAN_SLOW, dashed: true, dim: true }),
    P.lane({ points: W_MOUNT_LOW, dashed: true, dim: true }),
    P.lane({ points: W_MOUNT_HIGH, dashed: true, dim: true }),
    // The deny lane arrives with the claim it denies: a lane is never visible without its block.
    P.lane({ key: 'wCtrlToPvcB', points: W_CTRL_TO_PVCB, dashed: true, dim: true, opacity: 0 }),
    P.wire({ key: 'mount', x: MOUNT_X + 16, y: 200, anchor: 'start' }),
    P.wire({ key: 'small', x: SMALL_CX, y: VERDICT_Y }),
    P.wire({ key: 'match', x: MATCH_CX, y: VERDICT_Y }),
    P.wire({ key: 'slow', x: SLOW_CX, y: VERDICT_Y }),
    P.chip({ key: 'pvcChip', x: 105, y: CHIPS_Y, w: 200, h: 34, name: 'PVC', value: 'Pending' }),
    // Named for the ONE volume it tracks. A bare 'PV' would be a lie from the bind step on, since
    // PV a01 and PV b22 stay Available after PV x73a goes Bound.
    P.chip({ key: 'pvChip', x: 325, y: CHIPS_Y, w: 200, h: 34, name: 'PV x73a', value: 'Available' }),
    P.chip({ key: 'bindChip', x: 545, y: CHIPS_Y, w: 330, h: 34, name: 'binding', value: 'none' }),
    P.chip({ key: 'mountChip', x: 895, y: CHIPS_Y, w: 200, h: 34, name: 'mount', value: 'none' }),
    P.packets(),
  ],
  // appBox is named here on purpose: a highlight set during a reduced replay leaks forward, because
  // replay never runs the motion path that would re-clear it.
  reset: {
    keys: ['ctrl', 'pvc', 'pvcB', 'pvSmall', 'pvMatchCyl', 'pvSlow', 'appBox',
      'pvcChip', 'pvChip', 'bindChip', 'mountChip'],
    pods: ['appPod'],
  },
};

const BOUND = 'data-claim <-> PV x73a';
const MATCH_OK = '5Gi, RWO, local-ssd OK';
const chips = (pvc, pv, bind, mount) => ({ pvcChip: pvc, pvChip: pv, bindChip: bind, mountChip: mount });

// STO.S-01 as fields: the two late-appearing elements and the two rejected disks WITH THEIR PROBES
// are pinned on EVERY step, since the reduced replay walks 0..n and reset clears classes, not styles.
const CLAIM2_OFF = { pvcB: 0, wCtrlToPvcB: 0 };
const CLAIM2_ON = { pvcB: 1, wCtrlToPvcB: 1 };
// A disk and its probe move as one pair (A-13). The shared trunk stays lit because the winning
// probe draws over it, so only the branch that ends on a ghost goes dim.
const SHELF_UP = { pvSmall: 1, wScanSmall: 1, pvSlow: 1, wScanSlow: 1 };
const SHELF_DIM = {
  pvSmall: OPACITY.notready, wScanSmall: OPACITY.notready,
  pvSlow: OPACITY.notready, wScanSlow: OPACITY.notready,
};
const VERDICTS = { small: 'too small', slow: 'wrong class' };
// The rejection fade: to notready, forwards, fired when the probe that rejected the disk lands.
const dimAt = (target, at) => F.fade({ target, to: OPACITY.notready, dur: 400, fill: 'forwards', easing: 'ease-out', at });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('Pending', 'Available', 'none', 'none'),
    opacity: { appPod: OPACITY.pending, ...CLAIM2_OFF, ...SHELF_UP },
  },
  {
    id: 'claim',
    duration: 2000,
    narration: 'A PersistentVolumeClaim is a request, not storage. It states only what the workload needs: at least 5Gi, ReadWriteOnce access, and the local-ssd StorageClass. The scheduler will not place the Pod while the claim it references is still unbound.',
    chipsCued: chips('Pending', 'Available', 'none', 'none'),
    opacity: { appPod: OPACITY.pending, ...CLAIM2_OFF, ...SHELF_UP },
    // Deliberately motionless. The claim is a statement of need, nothing acts: the Pod is the
    // subject being blocked rather than an actor, so it does not pulse and no block flashes.
    lit: ['pvc'],
  },
  {
    id: 'watch',
    duration: 2100,
    narration: 'The binding controller watches every claim in the cluster. It picks this one up because it is Pending, and reads the three things it has to satisfy: capacity, access mode and StorageClass.',
    chipsCued: chips('Pending', 'Available', 'none', 'none'),
    opacity: { appPod: OPACITY.pending, ...CLAIM2_OFF, ...SHELF_UP },
    lit: ['pvc'],
    // Infra to infra: no pod is involved, so there is no pulse to lead with. The claim rides along.
    flow: [
      F.route({ points: W_PVC_TO_CTRL, name: 'watch' }),
      F.tag({ text: '5Gi, RWO, local-ssd', points: W_PVC_TO_CTRL, dy: WATCH_TAG_DY }),
      F.light({ targets: ['ctrl'], at: 'watch' }),
    ],
  },
  {
    id: 'match',
    duration: 3400,
    narration: 'The controller checks every Available volume in one sweep. PV a01 is only 2Gi, which is under what the claim asks for, and PV b22 is the local-hdd class rather than local-ssd. Only PV x73a satisfies all three conditions, so it is the candidate.',
    chipsCued: chips('Pending', 'Available', 'candidate PV x73a', 'none'),
    wires: { small: VERDICTS.small, match: MATCH_OK, slow: VERDICTS.slow },
    opacity: { appPod: OPACITY.pending, ...CLAIM2_OFF, ...SHELF_DIM },
    lit: ['ctrl'],
    // The candidate is a VERDICT of the sweep, so the animated path starts from what the watch step
    // left it at, and the shelf starts undimmed so the probes are what dim it.
    rewind: { chips: { bindChip: 'none' }, wires: { small: '', match: '', slow: '' }, opacity: SHELF_UP },
    // All three probes leave the controller TOGETHER: the scan is one sweep, not a queue. They land
    // 1.4s apart because routeDur normalizes speed, so each verdict lands with its OWN probe.
    flow: [
      F.route({ points: W_SCAN_SMALL, name: 'small' }),
      F.route({ points: W_SCAN_MATCH, name: 'match' }),
      F.route({ points: W_SCAN_SLOW, name: 'slow' }),
      // Each probe dims its own lane WITH its disk, on its own arrival, so the lane is at full
      // strength for the whole flight (A-15) and down to the disk shade once the verdict is in.
      dimAt('pvSmall', 'small'),
      dimAt('wScanSmall', 'small'),
      dimAt('pvSlow', 'slow'),
      dimAt('wScanSlow', 'slow'),
      F.light({ targets: ['pvMatchCyl'], at: 'match' }),
      F.set({ wires: { small: VERDICTS.small }, at: 'small' }),
      F.set({ wires: { match: MATCH_OK }, chipsCued: { bindChip: 'candidate PV x73a' }, at: 'match' }),
      F.set({ wires: { slow: VERDICTS.slow }, at: 'slow' }),
    ],
  },
  {
    id: 'bind',
    duration: 2800,
    narration: 'Binding is written on both objects. The claim gets a volumeName pointing at PV x73a, and the volume gets a claimRef pointing back at data-claim. Both turn Bound, and because the volume now names its claim, no other claim can ever take it.',
    chipsCued: chips('Bound', 'Bound', BOUND, 'none'),
    wires: VERDICTS,
    opacity: { appPod: OPACITY.pending, ...CLAIM2_OFF, ...SHELF_DIM },
    lit: ['ctrl'],
    // Each side turns Bound when ITS OWN write lands, and the pair is only a pair once the second
    // one has, so all three hold what the match step left until the ball that earns them arrives.
    rewind: { chips: { pvcChip: 'Pending', pvChip: 'Available', bindChip: 'candidate PV x73a' } },
    // Two writes leave the controller at once: one down to the claim, one down to the volume.
    flow: [
      F.route({ points: W_CTRL_TO_PVC, name: 'toClaim', lights: ['pvc'] }),
      F.tag({ text: 'volumeName: x73a', points: W_CTRL_TO_PVC }),
      F.route({ points: W_SCAN_MATCH, name: 'toVolume', lights: ['pvMatchCyl'] }),
      F.tag({ text: 'claimRef: data-claim', points: W_SCAN_MATCH }),
      F.set({ at: 'toClaim', chipsCued: { pvcChip: 'Bound' } }),
      F.set({ at: 'toVolume', chipsCued: { pvChip: 'Bound', bindChip: BOUND } }),
    ],
  },
  {
    id: 'mount',
    duration: 3400,
    narration: 'Only now can the volume be used. Kubelet resolves the claim to the volume it is bound to, mounts it at /data inside the container, and the Pod finally starts. The claim is the handle the Pod holds, and the volume behind it is what actually stores the bytes.',
    chipsCued: chips('Bound', 'Bound', BOUND, 'mounted at /data'),
    wires: { ...VERDICTS, mount: 'kubelet mount' },
    // The Pod is running by the end of this step, so full opacity is the static end-state.
    opacity: { appPod: 1, ...CLAIM2_OFF, ...SHELF_DIM },
    lit: ['pvMatchCyl'],
    // Without the re-dim the Pod sits at full opacity and snaps BACK the instant the fade goes active.
    rewind: { opacity: { appPod: OPACITY.pending } },
    // The volume rises PV -> PVC -> Pod: the claim is what the mount resolves THROUGH, so it lights
    // on arrival, and the ball arrives AT the Pod, so the Pod pulses then rather than before.
    flow: [
      F.route({ points: W_MOUNT_LOW, name: 'hop1', lights: ['pvc'] }),
      F.route({ points: W_MOUNT_HIGH, after: 'hop1', name: 'hop2' }),
      F.tag({ text: '/data', points: W_MOUNT_HIGH, after: 'hop1' }),
      F.fade({ target: 'appPod', from: OPACITY.pending, to: 1, dur: 500, fill: 'forwards', easing: 'ease-out', at: 'hop2' }),
      F.pulse({ pod: 'appPod', at: 'hop2' }),
      F.light({ targets: ['appBox'], at: 'hop2' }),
    ],
  },
  {
    id: 'exclusive',
    duration: 2600,
    narration: 'Binding is one to one and it is permanent. A second claim asking for exactly the same thing finds PV x73a already carrying a claimRef, so that volume is no longer Available to anyone. These volumes were pre-created by an administrator and the class has no provisioner behind it, so nothing builds a new one. The second claim just stays Pending.',
    chipsCued: chips('Bound', 'Bound', BOUND, 'mounted at /data'),
    wires: VERDICTS,
    sublabels: { pvcB: 'Pending, no volume' },
    opacity: { appPod: 1, ...CLAIM2_ON, ...SHELF_DIM },
    lit: ['ctrl', 'pvMatchCyl'],
    flow: [
      F.route({ points: W_CTRL_TO_PVCB, name: 'deny' }),
      F.tag({ text: 'no volume available', points: W_CTRL_TO_PVCB }),
      F.light({ targets: ['pvcB'], at: 'deny' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
