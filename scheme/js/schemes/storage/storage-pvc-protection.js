import { P, F, defineCard, BEAT, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-pvc-protection


const CX = 600;                                                // canvas + identity-spine center
const TIER = 162;                                              // the one vertical pitch

const POD_W = 240, POD_H = 104, POD_X = CX - POD_W / 2, POD_Y = 56;
const POD_BOTTOM = POD_Y + POD_H, POD_MID = POD_Y + POD_H / 2, POD_RIGHT = POD_X + POD_W; // 160 / 108 / 720

const PVC_W = 240, PVC_H = 68, PVC_X = CX - PVC_W / 2, PVC_Y = 236;
const PVC_BOTTOM = PVC_Y + PVC_H, PVC_MID = PVC_Y + PVC_H / 2, PVC_RIGHT = PVC_X + PVC_W; // 304 / 270 / 720

const DISK_W = 230, DISK_H = 86, DISK_Y = 389;
const DISK_TOP = DISK_Y;  // 389

// Two actors of one footprint, one each side of the identity spine so the card is not a stack
// hanging off its right. Both at or below the claim tier, which clears the panel floor at 230.
const ACT_W = 220, ACT_H = 72;
const ACT_R_X = 850, ACT_R_CX = ACT_R_X + ACT_W / 2;           // 850..1070 / 960
const ACT_L_X = 130, ACT_L_CX = ACT_L_X + ACT_W / 2;           // 130..350 / 240
const KUBECTL_Y = PVC_MID - ACT_H / 2;                         // 234
const CTRL_MID = PVC_MID + TIER, CTRL_Y = CTRL_MID - ACT_H / 2;             // 432 / 396

const MOUNT_LBL_X = CX + 16, MOUNT_LBL_Y = 204;
// Under the claim rather than beside it: the controller lane now runs into the claim's left face.
const VERDICT_LBL_X = PVC_X - 16, VERDICT_LBL_Y = PVC_BOTTOM + 20;  // 464 / 324, anchored end
// cylinder() draws its own name on the baseline h/2+5, so the spec line goes 14 below it.
const SPEC_Y = DISK_Y + DISK_H / 2 + 5 + 14;                   // 451
const CHIP_Y = 545, CHIP_H = 34;                               // strip ends at 579

// Four chips over the card's own width, and NOT one width: the first carries both the longest
// name and the longest value, and at a shared 252 the two strings meet with one unit to spare.
const CHIP_GAP = 24, CHIP_WS = [312, 232, 244, 220];   // 1008 + 3 gaps = the full 60..1140 strip
const chipX = i => 60 + CHIP_WS.slice(0, i).reduce((a, w) => a + w + CHIP_GAP, 0);   // 60 / 396 / 652 / 920


// Each lane and its ball share one points array, so the two cannot drift apart, and every endpoint
// sits on a block edge so no ball ever travels underneath a box.
const W_MOUNT_LOW  = [[CX, DISK_TOP], [CX, PVC_BOTTOM]];       // disk -> claim, upward
const W_MOUNT_HIGH = [[CX, PVC_Y], [CX, POD_BOTTOM]];          // claim -> Pod, upward
// kubectl deletes the claim it is level with: straight horizontal, no turn. Deleting the Pod climbs
// its own column first, so the two requests never share a lane.
const W_DEL_PVC = [[ACT_R_X, PVC_MID], [PVC_RIGHT, PVC_MID]];
const W_DEL_POD = [[ACT_R_CX, KUBECTL_Y], [ACT_R_CX, POD_MID], [POD_RIGHT, POD_MID]];
// The controller reaches the claim from the other side, so a delete request and a finalizer removal
// are never drawn on the same run of canvas.
const W_RM_FINAL = [[ACT_L_CX, CTRL_Y], [ACT_L_CX, PVC_MID], [PVC_X, PVC_MID]];

// Every lane in this card is a ROUTE: something travels all of them, so they are all dashed, all
// carry a head, and all are built from the same points array as their ball.
const lane = (key, points, opacity) => P.lane({ key, points, dashed: true, dim: true, opacity });

// Z-order: the blocks and the disk, then the lanes and their captions, then the Pod above its own
// half of the axis, then the disk caption, then the chip strip, then the packet layer.
export const SCENE = {
  'aria-label': 'Why a deleted PersistentVolumeClaim sits in Terminating. The StorageObjectInUseProtection admission plugin puts the kubernetes.io slash pvc-protection finalizer on every claim when it is created. Deleting the claim only sets a deletionTimestamp on it, and because the finalizers list is not empty the API server will not complete the delete, so the object stays and the Pod keeps its mount. Its status phase is still Bound the whole time and only kubectl prints the word Terminating. Once the last consuming Pod is gone the controller removes the finalizer, the list empties, and only then does the API server take the object out of ETCD.',
  parts: [
    P.defs(),
    P.box({ key: 'pvc', x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-claim', sublabel: 'phase Bound' }),
    // Both actors appear only on the steps they act on, so the card is never crossed by a lane
    // belonging to somebody who is not on stage.
    P.box({ key: 'kubectl', x: ACT_R_X, y: KUBECTL_Y, w: ACT_W, h: ACT_H, label: 'kubectl delete', sublabel: 'issues the request', opacity: 0 }),
    P.box({ key: 'ctrl', x: ACT_L_X, y: CTRL_Y, w: ACT_W, h: ACT_H, label: 'PVC protection', sublabel: 'the controller', opacity: 0 }),
    P.cylinder({ key: 'disk', x: CX - DISK_W / 2, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'PV data-vol' }),
    lane('lMountLow', W_MOUNT_LOW),
    lane('lMountHigh', W_MOUNT_HIGH),
    // A lane is never on stage without the block on the end of it (STO.S-02).
    lane('lDelPvc', W_DEL_PVC, 0),
    lane('lDelPod', W_DEL_POD, 0),
    lane('lRmFinal', W_RM_FINAL, 0),
    P.wire({ key: 'mount', x: MOUNT_LBL_X, y: MOUNT_LBL_Y, anchor: 'start' }),
    P.wire({ key: 'verdict', x: VERDICT_LBL_X, y: VERDICT_LBL_Y, anchor: 'end' }),
    // A Pod is a shell plus an inner box, wrapped in a g so pulsePod reaches BOTH. querySelectorAll
    // matches descendants only, so pulsing a bare shell would fire at half strength.
    P.pod({
      key: 'web', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'volumes: data-claim', containers: 0,
      inner: { dx: 20, dy: (POD_H - 52) / 2, w: POD_W - 40, h: 52, label: 'app', sublabel: 'writes to /data' }, innerKey: 'app',
    }),
    P.tag({ x: CX, y: SPEC_Y, text: 'the backing disk' }),
    P.chip({ key: 'tsChip', x: chipX(0), y: CHIP_Y, w: CHIP_WS[0], h: CHIP_H, name: 'deletionTimestamp', value: 'none' }),
    P.chip({ key: 'shownChip', x: chipX(1), y: CHIP_Y, w: CHIP_WS[1], h: CHIP_H, name: 'kubectl shows', value: 'Bound' }),
    P.chip({ key: 'finalChip', x: chipX(2), y: CHIP_Y, w: CHIP_WS[2], h: CHIP_H, name: 'finalizers', value: 'pvc-protection' }),
    P.chip({ key: 'usersChip', x: chipX(3), y: CHIP_Y, w: CHIP_WS[3], h: CHIP_H, name: 'consumers', value: '1 Pod' }),
    P.packets(),
  ],
  // app is listed so its .highlight is cleared every step: without it a highlight set during a
  // reduced replay would leak forward, since replay never runs the motion path that would re-clear it.
  reset: {
    keys: ['pvc', 'kubectl', 'ctrl', 'disk', 'app',
      'tsChip', 'shownChip', 'finalChip', 'usersChip'],
    pods: ['web'],
  },
};

// All four chips go through setChip, so all four are chipsCued. Argument order is the old helper's.
const chips = (ts, shown, finalizers, users) =>
  ({ tsChip: ts, shownChip: shown, finalChip: finalizers, usersChip: users });

// STO.S-01 as a field: every step pins EVERY opacity that any step can change, so a step can never
// inherit a stale one and a cancel mid-flight always lands on this step's own end state.
const stage = ({ web, pvc, kubectl, ctrl, mountLow, mountHigh, delPvc, delPod, rmFinal }) => ({
  web, pvc, kubectl, ctrl,
  lMountLow: mountLow, lMountHigh: mountHigh, lDelPvc: delPvc, lDelPod: delPod, lRmFinal: rmFinal,
});

// The claim standing whole with the disk under it and the Pod on top: every step before the delete
// lands, plus the two that watch the delete fail to land.
const STACK = stage({ web: 1, pvc: 1, kubectl: 0, ctrl: 0, mountLow: 1, mountHigh: 1, delPvc: 0, delPod: 0, rmFinal: 0 });

const PROT = 'pvc-protection', TERMINATING = 'Terminating', DELETING = 'phase Bound, deleting';

// Fades an object out of existence when the delete that removes it lands, and takes its lit stroke
// with it: a block that has gone dark must not keep glowing, or it reads as deleted-but-still-live.
// `from` 1 and `easing` ease-in are F.fade's own defaults, which are what the hand-rolled copy used.
// The fade a dying element takes. `unlight` is dead on all four targets (none is lit when it
// fades) and is kept because the hand-written removeAt registered the same handler: anim-dump
// records onfinish as a boolean, so dropping it is an observable change, not a cleanup.
const removeAt = (target, to, when) => F.fade({ target, to, dur: 500, fill: 'forwards', unlight: [target], ...when });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('none', 'Bound', PROT, '1 Pod'),
    sublabels: { pvc: 'phase Bound' },
    opacity: STACK,
  },
  {
    id: 'in-use',
    duration: 3400,
    narration: 'The claim is a handle, and the volume behind it is what stores the bytes. Kubelet resolved data-claim to data-vol and mounted it at slash data, so the app writes through the claim into the disk. That live mount is the thing the finalizer is guarding.',
    chipsCued: chips('none', 'Bound', PROT, '1 Pod'),
    sublabels: { pvc: 'phase Bound' },
    wires: { mount: 'mounted at /data', verdict: 'Bound to data-vol' },
    opacity: STACK,
    // Only the disk is lit to begin with, because only the disk sends a ball. The claim and the
    // container are destinations and each earns its light at its own arrival, which is what the
    // reduced path derives from the two cues below.
    lit: ['disk'],
    flow: [
      F.route({ points: W_MOUNT_LOW, name: 'hop1', lights: ['pvc'] }),
      F.route({ points: W_MOUNT_HIGH, after: 'hop1', name: 'hop2' }),
      F.tag({ text: '/data', points: W_MOUNT_HIGH, after: 'hop1' }),
      F.light({ targets: ['app'], at: 'hop2' }),
      F.pulse({ pod: 'web', at: 'hop2' }),
    ],
  },
  {
    id: 'delete-request',
    duration: 3200,
    narration: 'You run kubectl delete pvc data-claim. The API accepts it and writes a deletionTimestamp onto the object. That is all a delete does when finalizers are present: it is a request, recorded on the object, and nothing has been removed yet.',
    chipsCued: chips('set', TERMINATING, PROT, '1 Pod'),
    sublabels: { pvc: DELETING },
    wires: { mount: 'mount still live', verdict: 'marked for deletion' },
    opacity: stage({ web: 1, pvc: 1, kubectl: 1, ctrl: 0, mountLow: 1, mountHigh: 1, delPvc: 1, delPod: 0, rmFinal: 0 }),
    // kubectl sends the ball, so kubectl alone is lit at entry and the claim waits for it to land.
    lit: ['kubectl'],
    flow: [
      F.route({ points: W_DEL_PVC, name: 'del' }),
      F.tag({ text: 'deletionTimestamp set', points: W_DEL_PVC }),
      F.light({ targets: ['pvc'], at: 'del' }),
    ],
  },
  {
    id: 'finalizer-holds',
    duration: 3200,
    narration: 'Now watch what does not happen. The finalizers list is not empty, so the API server refuses to complete the delete and the object stays exactly where it was. The Pod never noticed: the volume is still mounted and the app is still writing to it, straight through a claim you already deleted.',
    chipsCued: chips('set', TERMINATING, PROT, '1 Pod'),
    sublabels: { pvc: DELETING },
    wires: { mount: 'still mounted', verdict: 'finalizer blocks removal' },
    opacity: STACK,
    lit: ['pvc'],
    flow: [
      F.route({ points: W_MOUNT_HIGH, name: 'write' }),
      F.tag({ text: 'writes continue', points: W_MOUNT_HIGH }),
      F.light({ targets: ['app'], at: 'write' }),
      F.pulse({ pod: 'web', at: 'write' }),
    ],
  },
  {
    id: 'why',
    duration: 3000,
    narration: 'The protection is deliberate. Taking the claim away under a running Pod would pull the mount out from beneath it and could lose writes that are still in flight. The same rule works forwards too: a new Pod that asks for a claim with a deletionTimestamp on it is refused and will not start.',
    chipsCued: chips('set', TERMINATING, PROT, '1 Pod'),
    sublabels: { pvc: DELETING },
    wires: { mount: 'held open by web-0', verdict: 'pinned while in use' },
    opacity: STACK,
    lit: ['pvc', 'app'],
    // The Pod IS the reason the claim is pinned, so it is the one thing that moves here.
    flow: [
      F.pulse({ pod: 'web' }),
    ],
  },
  {
    id: 'pod-gone',
    duration: 3400,
    narration: 'So remove the reason. The Pod is deleted, or it finishes and is cleaned up, and as it goes Kubelet unmounts the volume and the claim loses its last consumer. This is the event the protection controller has been waiting for the whole time.',
    chipsCued: chips('set', TERMINATING, PROT, '0 Pods'),
    sublabels: { pvc: DELETING },
    wires: { verdict: 'last consumer gone' },
    // The Pod and its half of the axis both end this step gone.
    opacity: stage({ web: OPACITY.terminated, pvc: 1, kubectl: 1, ctrl: 0, mountLow: 1, mountHigh: 0, delPvc: 0, delPod: 1, rmFinal: 0 }),
    lit: ['kubectl'],
    // The Pod is alive until the delete lands on it, so the motion path restores it and the fade
    // carries it back down to the OPACITY.terminated pinned above.
    rewind: { opacity: stage({ web: 1, pvc: 1, kubectl: 1, ctrl: 0, mountLow: 1, mountHigh: 1, delPvc: 0, delPod: 1, rmFinal: 0 }) },
    flow: [
      F.route({ points: W_DEL_POD, name: 'del' }),
      F.tag({ text: 'delete pod web-0', points: W_DEL_POD }),
      F.pulse({ pod: 'web', at: 'del' }),
      removeAt('web', OPACITY.terminated, { at: 'del', plus: BEAT.afterPulse }),
      // The mount goes with the Pod, so the upper lane leaves on the same beat rather than lingering
      // as an arrow pointing at a ghost.
      removeAt('lMountHigh', 0, { at: 'del', plus: BEAT.afterPulse }),
    ],
  },
  {
    id: 'finalizer-removed',
    duration: 3400,
    narration: 'The pvc-protection controller checks whether any Pod still uses the claim, finds none, and does its one job: it patches the finalizer off the object. The finalizers list is now empty and nothing is holding the outstanding delete back any more.',
    chipsCued: chips('set', TERMINATING, 'none', '0 Pods'),
    sublabels: { pvc: DELETING },
    wires: { verdict: 'nothing holds it now' },
    opacity: stage({ web: OPACITY.terminated, pvc: 1, kubectl: 0, ctrl: 1, mountLow: 1, mountHigh: 0, delPvc: 0, delPod: 0, rmFinal: 1 }),
    // The controller sends the ball, so the claim waits for the patch to land before it lights.
    lit: ['ctrl'],
    flow: [
      F.route({ points: W_RM_FINAL, name: 'rm' }),
      F.tag({ text: 'finalizers: []', points: W_RM_FINAL }),
      F.light({ targets: ['pvc'], at: 'rm' }),
    ],
  },
  {
    id: 'gone',
    duration: 3000,
    narration: 'With a deletionTimestamp set and an empty finalizers list, the API server completes the delete it accepted five steps ago and the record leaves ETCD. The disk itself is a separate question, settled by the reclaim policy on the volume. The lesson of a stuck Terminating claim is short: go and find the Pod that is still mounting it.',
    chipsCued: chips('gone with object', 'not found', 'none', '0 Pods'),
    wires: { verdict: 'object removed from etcd' },
    // The claim and the rest of the axis end this step gone. The disk stays: it outlives the claim.
    opacity: stage({ web: OPACITY.terminated, pvc: OPACITY.terminated, kubectl: 0, ctrl: 0, mountLow: 0, mountHigh: 0, delPvc: 0, delPod: 0, rmFinal: 0 }),
    // The removal is the motion of this step: the claim fades and takes its half of the axis with
    // it, so nothing here needs a flash to look alive.
    rewind: { opacity: stage({ web: OPACITY.terminated, pvc: 1, kubectl: 0, ctrl: 0, mountLow: 1, mountHigh: 0, delPvc: 0, delPod: 0, rmFinal: 0 }) },
    flow: [
      removeAt('pvc', OPACITY.terminated, { delay: 200 }),
      removeAt('lMountLow', 0, { delay: 200 }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
