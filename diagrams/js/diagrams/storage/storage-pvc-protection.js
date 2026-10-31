import { P, F, defineCard, BEAT, OPACITY, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-pvc-protection.md


// The identity spine and TIER, the one vertical pitch. storage-volume-expansion reuses both so the
// two cards read as one family.
const CX = 600;                                                // canvas and identity-spine centre
const TIER = 162;

// Every actor is 232 by 80 and the Pod 232 by 104 around a 192 by 44 app box (STO.L-05).
const BOX_W = 232, BOX_H = 80;
const POD_W = BOX_W, POD_H = 104, POD_X = CX - POD_W / 2, POD_Y = 56;
const POD_BOTTOM = POD_Y + POD_H, POD_MID = POD_Y + POD_H / 2, POD_RIGHT = POD_X + POD_W;
const APP_W = 192, APP_H = 44, APP_DY = 26;

const PVC_W = BOX_W, PVC_H = BOX_H, PVC_X = CX - PVC_W / 2, PVC_Y = POD_MID + TIER - PVC_H / 2;
const PVC_BOTTOM = PVC_Y + PVC_H, PVC_MID = PVC_Y + PVC_H / 2, PVC_RIGHT = PVC_X + PVC_W;

const DISK_W = 230, DISK_H = 86, DISK_Y = 389;
const DISK_TOP = DISK_Y;

// Two actors of one footprint, mirrored about CX one each side of the identity spine, both at or
// below the claim tier, which clears the panel floor.
const ACT_W = BOX_W, ACT_H = BOX_H;
const ACT_R_X = 850, ACT_R_CX = ACT_R_X + ACT_W / 2;
const ACT_L_X = 2 * CX - ACT_R_X - ACT_W, ACT_L_CX = ACT_L_X + ACT_W / 2;
const KUBECTL_Y = PVC_MID - ACT_H / 2;
const CTRL_MID = PVC_MID + TIER, CTRL_Y = CTRL_MID - ACT_H / 2;

const MOUNT_LBL_X = CX + 16, MOUNT_LBL_Y = 204;
// Under the claim rather than beside it, where the controller lane runs into the claim left face.
const VERDICT_LBL_X = PVC_X - 16, VERDICT_LBL_Y = PVC_BOTTOM + 20;  // anchored end
// cylinder() draws its own name on the baseline h/2+5, so the spec line goes 14 below it.
const SPEC_Y = DISK_Y + DISK_H / 2 + 5 + 14;
const CHIP_Y = 545, CHIP_H = 34;

// Four chips over the card width and not one width: the first carries both the longest name and
// the longest value.
const CHIP_GAP = 24, CHIP_WS = [312, 232, 244, 220];
const chipX = i => 60 + CHIP_WS.slice(0, i).reduce((a, w) => a + w + CHIP_GAP, 0);


// Each lane and its ball share one points array, and every endpoint sits on a block edge.
const W_MOUNT_LOW  = [[CX, DISK_TOP], [CX, PVC_BOTTOM]];       // disk -> claim, upward
const W_MOUNT_HIGH = [[CX, PVC_Y], [CX, POD_BOTTOM]];          // claim -> Pod, upward
// kubectl deletes the claim it is level with: straight horizontal, no turn. Deleting the Pod climbs
// its own column first, so the two requests never share a lane.
const W_DEL_PVC = [[ACT_R_X, PVC_MID], [PVC_RIGHT, PVC_MID]];
const W_DEL_POD = [[ACT_R_CX, KUBECTL_Y], [ACT_R_CX, POD_MID], [POD_RIGHT, POD_MID]];
// The controller reaches the claim from the other side, so a delete request and a finalizer removal
// are never drawn on the same run of canvas.
const W_RM_FINAL = [[ACT_L_CX, CTRL_Y], [ACT_L_CX, PVC_MID], [PVC_X, PVC_MID]];

// Both requests travel at PVC_MID, the middle of the boxes at their ends, so each tag rides half a
// box height plus 4 up to clear the box tops.
const DEL_TAG_DY = -(BOX_H / 2) - 4, RM_TAG_DY = DEL_TAG_DY;
// The mount ascent is too short for a tag between two boxes, so the tag trails just under the ball,
// left of the lane: clear of the claim label at departure, of the Pod sublabel at landing and of
// the mount caption right of the lane.
const beside = (side, dy) => (text) => ({ text, dx: side * (16 + 3 * text.length), dy });
const mountTag = beside(-1, 10);
// The Pod delete ends on the Pod right face, so its tag rides beside the ball, right of the climb,
// clear of its own lane and short of the Pod.
const DEL_POD_TAG_DX = 57;
// Each request ball leaves at t=0, where a route ball does not fade in, so its tag shows at once.
const rideTag = makeRidingLabel({ role: 'storage', inMs: 0, outMs: 200, hold: 0 });

// Every lane here is a route: dashed, headed, and built from the same points array as its ball.
const lane = (key, points, opacity) => P.lane({ key, points, dashed: true, dim: true, opacity });

// Z-order: the blocks and the disk, the lanes and their captions, the Pod, the disk caption, the
// chip strip, then the packet layer.
export const SCENE = {
  'aria-label': 'Why a deleted PersistentVolumeClaim sits in Terminating. Because of the pvc-protection finalizer on PVC data-claim, a delete only writes a deletionTimestamp, so the object stays and Pod web-0 keeps its mount. The status phase reads Bound the whole time, and Terminating is only a display derived from the deletionTimestamp. Once the last consuming Pod is gone the controller removes the finalizer, and only then does the API server take the object out of ETCD.',
  parts: [
    P.defs(),
    P.box({ key: 'pvc', x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-claim', sublabel: 'phase Bound' }),
    // Both actors appear only on the steps they act on, so no lane crosses the card for an absent actor.
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
    // A Pod is a shell plus an inner box wrapped in a g, so pulsePod reaches both (querySelectorAll
    // matches descendants only).
    P.pod({
      key: 'web', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'volumes: data-claim', containers: 0,
      inner: { dx: (POD_W - APP_W) / 2, dy: APP_DY, w: APP_W, h: APP_H, label: 'app', sublabel: 'writes to /data' }, innerKey: 'app',
    }),
    P.tag({ x: CX, y: SPEC_Y, text: 'the backing disk' }),
    P.chip({ key: 'tsChip', x: chipX(0), y: CHIP_Y, w: CHIP_WS[0], h: CHIP_H, name: 'deletionTimestamp', value: 'none' }),
    P.chip({ key: 'shownChip', x: chipX(1), y: CHIP_Y, w: CHIP_WS[1], h: CHIP_H, name: 'kubectl shows', value: 'Bound' }),
    P.chip({ key: 'finalChip', x: chipX(2), y: CHIP_Y, w: CHIP_WS[2], h: CHIP_H, name: 'finalizers', value: 'pvc-protection' }),
    P.chip({ key: 'usersChip', x: chipX(3), y: CHIP_Y, w: CHIP_WS[3], h: CHIP_H, name: 'consumers', value: '1 Pod' }),
    P.packets(),
  ],
  reset: {
    keys: ['pvc', 'kubectl', 'ctrl', 'disk',
      'tsChip', 'shownChip', 'finalChip', 'usersChip'],
    pods: ['web'],
  },
};

// All four chips go through setChip, so all four are chipsCued.
const chips = (ts, shown, finalizers, users) =>
  ({ tsChip: ts, shownChip: shown, finalChip: finalizers, usersChip: users });

// STO.S-01: every step pins every opacity any step can change, so a cancel mid-flight lands on
// this step's own end state.
const stage = ({ web, pvc, kubectl, ctrl, mountLow, mountHigh, delPvc, delPod, rmFinal }) => ({
  web, pvc, kubectl, ctrl,
  lMountLow: mountLow, lMountHigh: mountHigh, lDelPvc: delPvc, lDelPod: delPod, lRmFinal: rmFinal,
});

// The claim standing whole with the disk under it and the Pod on top: every step before the delete
// lands, plus the two that watch the delete fail to land.
const STACK = stage({ web: 1, pvc: 1, kubectl: 0, ctrl: 0, mountLow: 1, mountHigh: 1, delPvc: 0, delPod: 0, rmFinal: 0 });

const PROT = 'pvc-protection', TERMINATING = 'Terminating', DELETING = 'phase Bound, deleting';

// Fades an object out when the delete that removes it lands. The `unlight` is defensive.
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
    narration: 'The claim is a handle, and the volume behind it is what stores the bytes. Kubelet resolved data-claim to data-vol and mounted it at /data, so the app writes through the claim into the disk. The finalizer guards the claim for as long as this Pod object exists.',
    chipsCued: chips('none', 'Bound', PROT, '1 Pod'),
    sublabels: { pvc: 'phase Bound' },
    wires: { mount: 'mounted at /data', verdict: 'Bound to data-vol' },
    opacity: STACK,
    // Only the disk is lit at entry, because only the disk sends a ball. The claim earns its light at
    // its own arrival, and the Pod answers its arrival with a pulse and no light (STO.C-02).
    lit: ['disk'],
    flow: [
      F.route({ points: W_MOUNT_LOW, name: 'hop1', lights: ['pvc'] }),
      F.route({ points: W_MOUNT_HIGH, after: 'hop1', tag: mountTag('/data'), pulse: 'web' }),
    ],
  },
  {
    id: 'delete-request',
    duration: 3700,
    narration: 'You run kubectl delete pvc data-claim. The API accepts it and writes a deletionTimestamp onto the object. With finalizers present, that is all a delete does. It is a request, recorded on the object, and nothing has been removed yet. Your terminal prints deleted anyway and then hangs, because kubectl waits for finalizers by default.',
    chipsCued: chips('set', TERMINATING, PROT, '1 Pod'),
    sublabels: { pvc: DELETING },
    wires: { mount: 'mount still live', verdict: 'marked for deletion' },
    opacity: stage({ web: 1, pvc: 1, kubectl: 1, ctrl: 0, mountLow: 1, mountHigh: 1, delPvc: 1, delPod: 0, rmFinal: 0 }),
    // kubectl sends the ball, so kubectl alone is lit at entry and the claim waits for it to land.
    lit: ['kubectl'],
    flow: [
      F.route({ points: W_DEL_PVC, name: 'del', tag: { text: 'deletionTimestamp set', dy: DEL_TAG_DY, fn: rideTag } }),
      F.light({ targets: ['pvc'], at: 'del' }),
    ],
  },
  {
    id: 'finalizer-holds',
    duration: 3500,
    narration: 'The delete stops there. The finalizers list still holds kubernetes.io/pvc-protection, so the API server does not complete it and the object stays where it was, shown as Terminating. The Pod has noticed nothing: the volume is still mounted and the app is still writing to it, straight through a claim you already deleted.',
    chipsCued: chips('set', TERMINATING, PROT, '1 Pod'),
    sublabels: { pvc: DELETING },
    wires: { mount: 'still mounted', verdict: 'finalizer blocks removal' },
    opacity: STACK,
    lit: ['pvc'],
    flow: [
      // The write leaves at t=0 like a request ball, so its tag takes rideTag and shows at once.
      F.route({ points: W_MOUNT_HIGH, tag: { ...mountTag('writes continue'), fn: rideTag }, pulse: 'web' }),
    ],
  },
  {
    id: 'why',
    duration: 3400,
    narration: 'The protection is deliberate. Taking the claim away under a running Pod would pull the mount out from beneath it and could lose writes that are still in flight. Deletion also closes the claim to new users: a new Pod that names it is left unschedulable and stays Pending, without ever holding the claim.',
    chipsCued: chips('set', TERMINATING, PROT, '1 Pod'),
    sublabels: { pvc: DELETING },
    wires: { mount: 'held open by web-0', verdict: 'pinned while in use' },
    opacity: STACK,
    lit: ['pvc'],
    // The Pod IS the reason the claim is pinned, so it is the one thing that moves here.
    flow: [
      F.pulse({ pod: 'web' }),
    ],
  },
  {
    id: 'pod-gone',
    duration: 3400,
    narration: 'So the reason has to go. The Pod is deleted, or it finishes and its Pod object is removed, and as it goes Kubelet unmounts the volume and the claim loses its last consumer, the event the protection controller has been waiting for.',
    chipsCued: chips('set', TERMINATING, PROT, '0 Pods'),
    sublabels: { pvc: DELETING },
    wires: { verdict: 'last consumer gone' },
    // The Pod and its half of the axis both end this step gone.
    opacity: stage({ web: OPACITY.terminated, pvc: 1, kubectl: 1, ctrl: 0, mountLow: 1, mountHigh: 0, delPvc: 0, delPod: 1, rmFinal: 0 }),
    lit: ['kubectl'],
    // The Pod is alive until the delete lands on it, so the fade carries it down to the pinned
    // OPACITY.terminated, the consumer count with it (P-03).
    rewind: {
      opacity: stage({ web: 1, pvc: 1, kubectl: 1, ctrl: 0, mountLow: 1, mountHigh: 1, delPvc: 0, delPod: 1, rmFinal: 0 }),
      chips: { usersChip: '1 Pod' },
    },
    flow: [
      F.route({ points: W_DEL_POD, name: 'del', tag: { text: 'delete pod web-0', dx: DEL_POD_TAG_DX, fn: rideTag }, pulse: 'web' }),
      removeAt('web', OPACITY.terminated, { at: 'del', plus: BEAT.afterPulse, name: 'gone' }),
      // The mount lane leaves with the Pod rather than pointing at a ghost.
      removeAt('lMountHigh', 0, { at: 'del', plus: BEAT.afterPulse }),
      // The last consumer is gone when the Pod has finished fading, not when the delete lands on it.
      F.set({ at: 'gone', chipsCued: { usersChip: '0 Pods' } }),
    ],
  },
  {
    id: 'finalizer-removed',
    duration: 3500,
    narration: 'The pvc-protection controller checks whether any Pod still uses the claim, finds none, and removes the finalizer from the object, which it could not do while web-0 existed. The finalizers list is now empty, and that was the last thing holding the outstanding delete, so the kubectl command hanging since step 2 is about to return.',
    chipsCued: chips('set', TERMINATING, 'none', '0 Pods'),
    sublabels: { pvc: DELETING },
    wires: { verdict: 'nothing holds it now' },
    opacity: stage({ web: OPACITY.terminated, pvc: 1, kubectl: 0, ctrl: 1, mountLow: 1, mountHigh: 0, delPvc: 0, delPod: 0, rmFinal: 1 }),
    // The controller sends the ball, so the claim waits for the patch to land before it lights.
    lit: ['ctrl'],
    flow: [
      F.route({ points: W_RM_FINAL, name: 'rm', tag: { text: 'finalizers: []', dy: RM_TAG_DY, fn: rideTag } }),
      F.light({ targets: ['pvc'], at: 'rm' }),
    ],
  },
  {
    id: 'gone',
    duration: 3900,
    narration: 'The moment the finalizers list is empty, the API server completes the delete it accepted five steps ago and the record leaves ETCD. The disk itself is a separate question, settled by the reclaim policy on the volume. So for a stuck Terminating claim, the thing to look for is the Pod object that still names it, finished or not: kubectl describe pvc lists it under Used By.',
    chipsCued: chips('gone with object', 'not found', 'none', '0 Pods'),
    wires: { verdict: 'object removed from ETCD' },
    // The claim and the rest of the axis end this step gone. The disk stays: it outlives the claim.
    opacity: stage({ web: OPACITY.terminated, pvc: OPACITY.terminated, kubectl: 0, ctrl: 0, mountLow: 0, mountHigh: 0, delPvc: 0, delPod: 0, rmFinal: 0 }),
    // The claim fades and takes its half of the axis with it, so nothing here needs a flash.
    rewind: { opacity: stage({ web: OPACITY.terminated, pvc: 1, kubectl: 0, ctrl: 0, mountLow: 1, mountHigh: 0, delPvc: 0, delPod: 0, rmFinal: 0 }) },
    flow: [
      removeAt('pvc', OPACITY.terminated, { delay: 200 }),
      removeAt('lMountLow', 0, { delay: 200 }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
