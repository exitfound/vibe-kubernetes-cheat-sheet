import { P, F, defineCard, OPACITY, makeRidingLabel, chipStrip } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-pvc-binding.md


// The identity column Pod -> PVC -> PV shares this one line, because binding fuses the three into one chain.
const CX = 600;

// Actor blocks take the catalog size (NET.L-01).
const POD_W = 232, POD_H = 104, POD_X = CX - POD_W / 2, POD_Y = 56;
const APP_W = 192, APP_H = 44, APP_DY = 26;
const POD_BOTTOM = POD_Y + POD_H;

const PVC_W = 232, PVC_H = 80, PVC_X = CX - PVC_W / 2, PVC_Y = 230;
const PVC_RIGHT = PVC_X + PVC_W, PVC_BOTTOM = PVC_Y + PVC_H;
const PVC_MID = PVC_Y + PVC_H / 2;

// The controller centres on PVC_MID so the watch and bind hops stay straight horizontals.
const CTRL_W = 232, CTRL_H = 80, CTRL_X = 850, CTRL_Y = PVC_MID - CTRL_H / 2;
const CTRL_LEFT = CTRL_X, CTRL_RIGHT = CTRL_X + CTRL_W;
const CTRL_CX = CTRL_X + CTRL_W / 2, CTRL_MID = CTRL_Y + CTRL_H / 2;

// The second claim sits above the controller, denied by a short straight hop up, long enough for
// its riding tag to stay under the claim it denies.
const DENY_LEN = 66;
const PVCB_W = 232, PVCB_H = 80, PVCB_X = CTRL_CX - PVCB_W / 2, PVCB_Y = CTRL_Y - DENY_LEN - PVCB_H;
const PVCB_CX = PVCB_X + PVCB_W / 2, PVCB_BOTTOM = PVCB_Y + PVCB_H;

// The controller scans the PVs from BELOW, so their tops carry only the mount lane.
const PV_Y = 384, PV_H = 86;
const PV_TOP = PV_Y, PV_BOTTOM = PV_Y + PV_H;
const SMALL_CX = 280, MATCH_CX = CX, SLOW_CX = 920;

const MOUNT_X = CX;     // the ONE spine lane: the mount ascent
const DROP_X = 1120;    // the probe wraps down here, clear of PV b22
const BUS_Y = 520;      // the scan bus runs BELOW the shelf
const LANE = 12;        // half-gap between the two horizontal PVC<->controller lanes
const SPEC_Y = PV_Y + 62;   // inside the cylinder, a line under its name
const VERDICT_Y = 544;  // per-disk verdict, below the scan bus
const CHIPS_Y = 572;
const CHIP = chipStrip();


const W_PVC_TO_CTRL = [[PVC_RIGHT, PVC_MID - LANE], [CTRL_LEFT, PVC_MID - LANE]];   // watch, straight
const W_CTRL_TO_PVC = [[CTRL_LEFT, PVC_MID + LANE], [PVC_RIGHT, PVC_MID + LANE]];   // bind write, straight
const W_SCAN_SMALL  = [[CTRL_RIGHT, CTRL_MID], [DROP_X, CTRL_MID], [DROP_X, BUS_Y], [SMALL_CX, BUS_Y], [SMALL_CX, PV_BOTTOM]];
const W_SCAN_MATCH  = [[CTRL_RIGHT, CTRL_MID], [DROP_X, CTRL_MID], [DROP_X, BUS_Y], [MATCH_CX, BUS_Y], [MATCH_CX, PV_BOTTOM]];
const W_SCAN_SLOW   = [[CTRL_RIGHT, CTRL_MID], [DROP_X, CTRL_MID], [DROP_X, BUS_Y], [SLOW_CX, BUS_Y], [SLOW_CX, PV_BOTTOM]];
const W_CTRL_TO_PVCB = [[PVCB_CX, CTRL_Y], [PVCB_CX, PVCB_BOTTOM]];   // deny, straight up
const W_MOUNT_LOW   = [[MOUNT_X, PV_TOP], [MOUNT_X, PVC_BOTTOM]];   // PV -> PVC, upward
const W_MOUNT_HIGH  = [[MOUNT_X, PVC_Y], [MOUNT_X, POD_BOTTOM]];    // PVC -> Pod, upward

// The watch lane runs at the blocks' mid height, so the tag lifts past the box top to clear both edges.
const WATCH_TAG_DY = -(PVC_H / 2 - LANE) - 6;
// The watch ball leaves at t=0, where a route ball does not fade in, so its tag shows at once.
const WATCH_TAG = makeRidingLabel({ role: 'storage', inMs: 0 });
// The bind write runs one lane lower, so its tag goes under the box floors instead, on the far side
// of its own lane from the watch tag.
const WRITE_TAG_DY = (PVC_H / 2 - LANE) + 13;
// The claimRef tag rides under and left of its ball, clear of the spec line and the verdicts, and
// emerges once the ball is past the PV b22 top.
const REF_TAG = makeRidingLabel({ role: 'storage', emergeMode: true });
const REF_EMERGE = 620;
const REF_TAG_DX = -80, REF_TAG_DY = 40;
// The mount and deny tags trail their 1500 legs (the catalog tagged pace) under the ball, emerging
// once clear of the box the ball leaves. Registered in PACING, render/motion.test.mjs.
const LEG_DUR = 1500;
const TRAILING = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0, emergeMode: true });
const MOUNT_TAG = { dy: 20, dx: -24, dur: LEG_DUR, emerge: 600, fn: TRAILING };
const DENY_TAG = { dy: 14, dx: -92, dur: LEG_DUR, emerge: 540, fn: TRAILING };

// Disk and spec are grouped so dimming a rejected volume fades its spec too. Only the winner keys its
// cylinder: .highlight must sit on .scheme-cylinder, never the wrapper.
const disk = ({ key, cylKey, cx, w, label, spec }) => P.group({
  key,
  parts: [
    P.cylinder({ key: cylKey, x: cx - w / 2, y: PV_Y, w, h: PV_H, label }),
    P.tag({ x: cx, y: SPEC_Y, text: spec }),
  ],
});

// Z-order: blocks and disks, then wires and labels above them, then the chip strip, then packets.
export const SCENE = {
  'aria-label': 'PersistentVolumeClaim to PersistentVolume binding: a claim states the capacity, access mode and class it needs, the binding controller scans the available volumes and rejects the ones that do not fit, binds the claim to the one that does by writing the link on the volume first and then on the claim, only then can Kubelet mount the volume into the Pod, and a second claim asking for the same thing stays Pending',
  parts: [
    P.defs(),
    P.box({ key: 'ctrl', x: CTRL_X, y: CTRL_Y, w: CTRL_W, h: CTRL_H, label: 'PV binding controller', sublabel: 'kube-controller-manager' }),
    P.box({ key: 'pvc', x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-claim', sublabel: 'wants 5Gi, RWO, fast' }),
    P.box({ key: 'pvcB', x: PVCB_X, y: PVCB_Y, w: PVCB_W, h: PVCB_H, label: 'PVC data-claim-2', sublabel: 'wants 5Gi, RWO, fast', opacity: 0 }),
    // The group IS the pulse target: the inner box is a sibling of the shell, not a descendant.
    P.pod({
      key: 'appPod', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'volumes: data-claim', containers: 0,
      inner: { dx: (POD_W - APP_W) / 2, dy: APP_DY, w: APP_W, h: APP_H, label: 'app', sublabel: 'writes to /data' }, innerKey: 'appBox',
    }),
    // Each disk states all three matched fields. Access mode is identical on all three on purpose.
    disk({ key: 'pvSmall', cx: SMALL_CX, w: 200, label: 'PV a01', spec: '2Gi, RWO, fast' }),
    disk({ key: 'pvMatch', cylKey: 'pvMatchCyl', cx: MATCH_CX, w: 230, label: 'PV x73a', spec: '5Gi, RWO, fast' }),
    disk({ key: 'pvSlow', cx: SLOW_CX, w: 200, label: 'PV b22', spec: '5Gi, RWO, slow' }),
    P.lane({ points: W_PVC_TO_CTRL, dashed: true, dim: true }),
    P.lane({ points: W_CTRL_TO_PVC, dashed: true, dim: true }),
    // Probes into rejected disks are keyed: a lane dies with the disk it ends on (A-13).
    P.lane({ key: 'wScanSmall', points: W_SCAN_SMALL, dashed: true, dim: true }),
    P.lane({ points: W_SCAN_MATCH, dashed: true, dim: true }),
    P.lane({ key: 'wScanSlow', points: W_SCAN_SLOW, dashed: true, dim: true }),
    P.lane({ points: W_MOUNT_LOW, dashed: true, dim: true }),
    P.lane({ points: W_MOUNT_HIGH, dashed: true, dim: true }),
    // The deny lane arrives with the claim it denies.
    P.lane({ key: 'wCtrlToPvcB', points: W_CTRL_TO_PVCB, dashed: true, dim: true, opacity: 0 }),
    P.wire({ key: 'mount', x: MOUNT_X + 16, y: 200, anchor: 'start' }),
    P.wire({ key: 'small', x: SMALL_CX, y: VERDICT_Y }),
    P.wire({ key: 'match', x: MATCH_CX, y: VERDICT_Y }),
    P.wire({ key: 'slow', x: SLOW_CX, y: VERDICT_Y }),
    P.chip({ key: 'pvcChip', x: CHIP.x(0), y: CHIPS_Y, w: CHIP.w, h: 34, name: 'PVC', value: 'Pending' }),
    // Named for the ONE volume it tracks: PV a01 and PV b22 stay Available after PV x73a binds.
    P.chip({ key: 'pvChip', x: CHIP.x(1), y: CHIPS_Y, w: CHIP.w, h: 34, name: 'PV x73a', value: 'Available' }),
    P.chip({ key: 'bindChip', x: CHIP.x(2), y: CHIPS_Y, w: CHIP.w, h: 34, name: 'binding', value: 'none' }),
    P.chip({ key: 'mountChip', x: CHIP.x(3), y: CHIPS_Y, w: CHIP.w, h: 34, name: 'mount', value: 'none' }),
    P.packets(),
  ],
  // appBox is named here on purpose: replay never runs the motion path that would re-clear it.
  reset: {
    keys: ['ctrl', 'pvc', 'pvcB', 'pvSmall', 'pvMatchCyl', 'pvSlow', 'appBox',
      'pvcChip', 'pvChip', 'bindChip', 'mountChip'],
    pods: ['appPod'],
  },
};

const BOUND = 'data-claim <-> PV x73a';
const MATCH_OK = '5Gi, RWO, fast OK';
const chips = (pvc, pv, bind, mount) => ({ pvcChip: pvc, pvChip: pv, bindChip: bind, mountChip: mount });

// Late elements and the rejected disks WITH THEIR PROBES are pinned on EVERY step (STO.S-01).
const CLAIM2_OFF = { pvcB: 0, wCtrlToPvcB: 0 };
const CLAIM2_ON = { pvcB: 1, wCtrlToPvcB: 1 };
// A disk and its probe move as one pair (A-13). The shared trunk stays lit under the winning probe.
const SHELF_UP = { pvSmall: 1, wScanSmall: 1, pvSlow: 1, wScanSlow: 1 };
const SHELF_DIM = {
  pvSmall: OPACITY.notready, wScanSmall: OPACITY.notready,
  pvSlow: OPACITY.notready, wScanSlow: OPACITY.notready,
};
const VERDICTS = { small: 'too small', match: MATCH_OK, slow: 'wrong class' };
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
    duration: 2400,
    narration: 'A PersistentVolumeClaim is a request, not storage. It states only what the workload needs: at least 5Gi, ReadWriteOnce access, and the fast StorageClass. Under the default Immediate binding mode, the Scheduler will not place the Pod while the claim it references is still unbound.',
    chipsCued: chips('Pending', 'Available', 'none', 'none'),
    opacity: { appPod: OPACITY.pending, ...CLAIM2_OFF, ...SHELF_UP },
    // Deliberately motionless: the Pod is the subject being blocked, not an actor.
    lit: ['pvc'],
  },
  {
    id: 'watch',
    duration: 2100,
    narration: 'The binding controller watches every claim in the cluster. It picks this one up because it is Pending, and reads the three things this claim asks for: capacity, access mode and StorageClass.',
    chipsCued: chips('Pending', 'Available', 'none', 'none'),
    opacity: { appPod: OPACITY.pending, ...CLAIM2_OFF, ...SHELF_UP },
    lit: ['pvc'],
    // Infra to infra: no Pod, so no pulse to lead with.
    flow: [
      F.route({ points: W_PVC_TO_CTRL, name: 'watch', tag: { text: '5Gi, RWO, fast', dy: WATCH_TAG_DY, fn: WATCH_TAG } }),
      F.light({ targets: ['ctrl'], at: 'watch' }),
    ],
  },
  {
    id: 'match',
    duration: 3400,
    narration: 'The controller checks every Available volume in one sweep. PV a01 is only 2Gi, which is under what the claim asks for, and PV b22 belongs to the slow class rather than fast. Only PV x73a satisfies all three conditions, so it is the candidate.',
    chipsCued: chips('Pending', 'Available', 'candidate PV x73a', 'none'),
    wires: VERDICTS,
    opacity: { appPod: OPACITY.pending, ...CLAIM2_OFF, ...SHELF_DIM },
    lit: ['ctrl'],
    // The candidate is a verdict of the sweep, so the shelf starts undimmed and the probes dim it.
    rewind: { chips: { bindChip: 'none' }, wires: { small: '', match: '', slow: '' }, opacity: SHELF_UP },
    // All three probes leave TOGETHER, one sweep, and land apart, each verdict with its own probe.
    flow: [
      F.route({ points: W_SCAN_SMALL, name: 'small' }),
      F.route({ points: W_SCAN_MATCH, name: 'match' }),
      F.route({ points: W_SCAN_SLOW, name: 'slow' }),
      // Each lane dims with its disk on its own arrival, at full for the whole flight (A-15).
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
    duration: 3600,
    narration: 'Binding is written volume first. PV x73a gets a claimRef pointing at data-claim and turns Bound, so no other claim can take it. Only then does the claim get a volumeName pointing back at PV x73a and turn Bound as well, and each object now names the other.',
    chipsCued: chips('Bound', 'Bound', BOUND, 'none'),
    wires: VERDICTS,
    opacity: { appPod: OPACITY.pending, ...CLAIM2_OFF, ...SHELF_DIM },
    lit: ['ctrl'],
    // Each side turns Bound when its own write lands.
    rewind: { chips: { pvcChip: 'Pending', pvChip: 'Available', bindChip: 'candidate PV x73a' } },
    // The volume is saved first (bind in pv_controller.go), so the claim write waits for it to land.
    flow: [
      F.route({ points: W_SCAN_MATCH, name: 'toVolume', lights: ['pvMatchCyl'] }),
      F.tag({ text: 'claimRef: data-claim', points: W_SCAN_MATCH, fn: REF_TAG, emerge: REF_EMERGE, dx: REF_TAG_DX, dy: REF_TAG_DY }),
      F.route({ points: W_CTRL_TO_PVC, after: 'toVolume', name: 'toClaim', lights: ['pvc'], tag: { text: 'volumeName: x73a', dy: WRITE_TAG_DY } }),
      F.set({ at: 'toVolume', chipsCued: { pvChip: 'Bound' } }),
      F.set({ at: 'toClaim', chipsCued: { pvcChip: 'Bound', bindChip: BOUND } }),
    ],
  },
  {
    id: 'mount',
    duration: 3400,
    narration: 'Only now can the Pod run. The Scheduler places it on a Node, Kubelet there resolves the claim to the volume it is bound to and mounts it for the Pod, and the container starts with it at /data. The claim is the handle the Pod holds, and the volume behind it is what actually stores the bytes.',
    chipsCued: chips('Bound', 'Bound', BOUND, 'mounted at /data'),
    wires: { ...VERDICTS, mount: 'kubelet mount' },
    opacity: { appPod: 1, ...CLAIM2_OFF, ...SHELF_DIM },
    lit: ['pvMatchCyl'],
    // Without the re-dim the Pod snaps back to full the instant the fade goes active.
    rewind: { opacity: { appPod: OPACITY.pending } },
    // The claim lights on arrival, the Pod pulses as the ball reaches it.
    flow: [
      F.route({ points: W_MOUNT_LOW, name: 'hop1', lights: ['pvc'] }),
      F.route({ points: W_MOUNT_HIGH, after: 'hop1', dur: LEG_DUR, name: 'hop2' }),
      F.tag({ text: '/data', points: W_MOUNT_HIGH, after: 'hop1', ...MOUNT_TAG }),
      F.fade({ target: 'appPod', from: OPACITY.pending, to: 1, dur: 500, fill: 'forwards', easing: 'ease-out', at: 'hop2' }),
      F.pulse({ pod: 'appPod', at: 'hop2' }),
      F.light({ targets: ['appBox'], at: 'hop2' }),
    ],
  },
  {
    id: 'exclusive',
    duration: 2600,
    narration: 'Binding is one to one, and once made it is exclusive. A second claim asking for exactly the same thing cannot have PV x73a, which already carries a claimRef. These volumes were pre-created by an administrator and the class has no dynamic provisioner, so nothing builds a new one. The controller records a ProvisioningFailed event and the claim stays Pending.',
    chipsCued: chips('Bound', 'Bound', BOUND, 'mounted at /data'),
    wires: VERDICTS,
    sublabels: { pvcB: 'Pending, no volume' },
    opacity: { appPod: 1, ...CLAIM2_ON, ...SHELF_DIM },
    lit: ['ctrl', 'pvMatchCyl'],
    flow: [
      F.route({ points: W_CTRL_TO_PVCB, dur: LEG_DUR, name: 'deny' }),
      F.tag({ text: 'event: ProvisioningFailed', points: W_CTRL_TO_PVCB, ...DENY_TAG }),
      F.light({ targets: ['pvcB'], at: 'deny' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
