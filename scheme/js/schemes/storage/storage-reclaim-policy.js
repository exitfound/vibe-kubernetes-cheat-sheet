import { P, F, defineCard, OPACITY } from './storage-kit.js';
import { line } from '../../lib/svg.js';
// Design notes for this card: ./CARDS.md#storage-reclaim-policy


const PVC_Y = 30, PVC_H = 68, PVC_BOTTOM = PVC_Y + PVC_H;      // 98
const PV_Y = 152, PV_H = 72, PV_TOP = PV_Y, PV_BOTTOM = PV_Y + PV_H;  // 152 / 224
const BAND_Y = 278, BAND_H = 58, BAND_TOP = BAND_Y, BAND_BOTTOM = BAND_Y + BAND_H;  // 278 / 336
const DISK_Y = 390, DISK_H = 100, DISK_TOP = DISK_Y;           // 390, shelf ends at 490
const COL_W = 176;

const LEFT_X = 400, STACK_W = 400;                             // 400..800, so the center is 600
const COL_GAP = STACK_W - COL_W * 2;                           // 48
const DEL_X = LEFT_X, RET_X = LEFT_X + COL_W + COL_GAP;        // 400 / 624
const DEL_CX = DEL_X + COL_W / 2, RET_CX = RET_X + COL_W / 2;  // 488 / 712
const BAND_X = LEFT_X, BAND_W = STACK_W;
const RET_RIGHT = RET_X + COL_W;                               // 800

const ADMIN_W = 160, ADMIN_H = 68, ADMIN_X = 850, ADMIN_Y = PVC_Y;
const ADMIN_CX = ADMIN_X + ADMIN_W / 2;                        // 930

const SPEC_GAP = 14;
const SPEC_Y = DISK_Y + DISK_H / 2 + 5 + SPEC_GAP;             // 485
const VERDICT_Y = DISK_Y + DISK_H + 28;                        // 518

const CHIP_W = COL_W;                        // each chip is exactly as wide as the column above it
const CHIP_H = 34;
const CHIP_ROW_1 = VERDICT_Y + 18;           // 536: the volumes
const CHIP_ROW_2 = CHIP_ROW_1 + CHIP_H + 8;  // 578: their disks, strip ends at 612


// Reclaim hops, both columns. The same points arrays feed the static lanes and the balls, so the two
// cannot drift apart.
const W_DEL_POLICY = [[DEL_CX, PV_BOTTOM], [DEL_CX, BAND_TOP]];
const W_DEL_WIPE   = [[DEL_CX, BAND_BOTTOM], [DEL_CX, DISK_TOP]];
const W_RET_POLICY = [[RET_CX, PV_BOTTOM], [RET_CX, BAND_TOP]];
const W_RET_WIPE   = [[RET_CX, BAND_BOTTOM], [RET_CX, DISK_TOP]];  // drawn, never travelled: that is Retain
// A fresh claim reaching down for the Released volume, and the admin reaching in from the side.
const W_RET_BIND = [[RET_CX, PVC_BOTTOM], [RET_CX, PV_TOP]];
const W_ADMIN_PV = [[ADMIN_CX, ADMIN_Y + ADMIN_H], [ADMIN_CX, PV_Y + PV_H / 2], [RET_RIGHT, PV_Y + PV_H / 2]];

// Shorter than FADE.out because these land ON a beat inside a step: the wipe has to read as caused
// by the ball that just arrived. The Bound cross-fade shares it so its two halves swap at one rate.
const REMOVE_MS = 500;

// A block, its caption or its lane taken away exactly when the ball reaches it, dropping the
// highlight that same ball left on it: a faded block never keeps a lit stroke.
const removeAt = (target, at, plus = 0, to = OPACITY.terminated) => F.fade({
  target, to, dur: REMOVE_MS, at, plus, fill: 'forwards', unlight: [target],
});

// A bare <line>, solid and arrowhead-free, because a bound relation carries no traffic: P.arrow
// emits a marked <path> and P.relation adds the relation class and a data-role on top.
const boundLink = (cx) => () => line({ class: 'scheme-arrow scheme-arrow-storage', x1: cx, y1: PVC_BOTTOM, x2: cx, y2: PV_TOP, fill: 'none' });

// The reclaim lanes: always drawn, in both columns, so the Retain side visibly HAS the lane the
// Delete side uses and simply never sends anything down it.
const lane = (points, key) => P.lane({ key, points, dashed: true, dim: true });

const spec = (cx, key) => P.tag({ key, x: cx, y: SPEC_Y, text: 'real disk, EBS' });

// Z-order (bottom -> top): blocks, then the lanes and their labels above them, then the chip
// strip, then the packet layer so every ball rides above everything.
export const SCENE = {
  'aria-label': 'Reclaim policy decides what happens to a PersistentVolume and its real disk once the claim is deleted. Both volumes go to the Released phase, and then the same PV controller reads the reclaim policy on each one. Under Delete it calls DeleteVolume on the CSI driver, the disk is wiped and the PV object is removed. Under Retain it makes no call at all, so the disk and its data survive, but the volume stays Released carrying a stale claimRef, and a new claim asking for it is skipped and left Pending until an administrator clears that reference by hand and lets the volume bind again.',
  parts: [
    P.defs(),
    P.box({ key: 'delPvc', x: DEL_X, y: PVC_Y, w: COL_W, h: PVC_H, label: 'PVC data-a', sublabel: 'Bound' }),
    P.box({ key: 'delPv', x: DEL_X, y: PV_Y, w: COL_W, h: PV_H, label: 'PV del', sublabel: 'reclaim: Delete' }),
    P.cylinder({ key: 'delDisk', x: DEL_CX - COL_W / 2, y: DISK_Y, w: COL_W, h: DISK_H, label: 'vol-aaa' }),
    P.box({ key: 'retPvc', x: RET_X, y: PVC_Y, w: COL_W, h: PVC_H, label: 'PVC data-b', sublabel: 'Bound' }),
    // The claim that arrives after the first is deleted is its OWN box, born invisible.
    P.box({ key: 'retPvc2', x: RET_X, y: PVC_Y, w: COL_W, h: PVC_H, label: 'PVC data-c', sublabel: 'Pending', opacity: 0 }),
    P.box({ key: 'retPv', x: RET_X, y: PV_Y, w: COL_W, h: PV_H, label: 'PV ret', sublabel: 'reclaim: Retain' }),
    P.cylinder({ key: 'retDisk', x: RET_CX - COL_W / 2, y: DISK_Y, w: COL_W, h: DISK_H, label: 'vol-bbb' }),
    // One controller for both columns: the reclaim policy is a field it reads, not two machines.
    P.box({ key: 'band', x: BAND_X, y: BAND_Y, w: BAND_W, h: BAND_H, label: 'PV controller and CSI driver', sublabel: 'reads the reclaim policy on each released volume' }),
    P.box({ key: 'admin', x: ADMIN_X, y: ADMIN_Y, w: ADMIN_W, h: ADMIN_H, label: 'Administrator', sublabel: 'kubectl patch pv', opacity: 0 }),
    P.raw({ key: 'delBound', make: boundLink(DEL_CX) }),
    P.raw({ key: 'retBound', make: boundLink(RET_CX) }),
    // The Delete column reclaims, so its two lanes have to fade with the objects they join and are
    // named. The Retain pair never moves off full, because nothing on that side is ever taken away.
    lane(W_DEL_POLICY, 'lDelPolicy'),
    lane(W_DEL_WIPE, 'lDelWipe'),
    lane(W_RET_POLICY),
    lane(W_RET_WIPE),
    P.lane({ key: 'wRetBind', points: W_RET_BIND, dashed: true, dim: true, opacity: 0 }),
    P.lane({ key: 'wAdminPv', points: W_ADMIN_PV, dashed: true, dim: true, opacity: 0 }),
    P.wire({ key: 'del', x: DEL_CX, y: VERDICT_Y }),
    P.wire({ key: 'ret', x: RET_CX, y: VERDICT_Y }),
    spec(DEL_CX, 'delSpec'),
    spec(RET_CX, 'retSpec'),
    P.chip({ key: 'delChip', x: DEL_X, y: CHIP_ROW_1, w: CHIP_W, h: CHIP_H, name: 'PV del', value: 'Bound' }),
    P.chip({ key: 'delDiskChip', x: DEL_X, y: CHIP_ROW_2, w: CHIP_W, h: CHIP_H, name: 'vol-aaa', value: 'exists' }),
    P.chip({ key: 'retChip', x: RET_X, y: CHIP_ROW_1, w: CHIP_W, h: CHIP_H, name: 'PV ret', value: 'Bound' }),
    P.chip({ key: 'retDiskChip', x: RET_X, y: CHIP_ROW_2, w: CHIP_W, h: CHIP_H, name: 'vol-bbb', value: 'exists' }),
    P.packets(),
  ],
  reset: {
    keys: ['delPvc', 'delPv', 'delDisk', 'retPvc', 'retPvc2', 'retPv', 'retDisk', 'band', 'admin',
      'delChip', 'delDiskChip', 'retChip', 'retDiskChip'],
  },
};

const chips = (del, delDisk, ret, retDisk) => ({ delChip: del, delDiskChip: delDisk, retChip: ret, retDiskChip: retDisk });

// Every step pins EVERY opacity that any step can change, so a step can never inherit a stale one
// and a cancel mid-flight always lands on this step's own end state.
const stage = ({ delPvc, delPv, delDisk, retPvc, retPvc2, admin, delBound, retBound, retBindLane, adminLane }) => ({
  delPvc, delPv, delDisk,
  delSpec: delDisk,   // the caption dies with the disk it describes
  // A lane is only as present as its fainter end, and the policy band is drawn on every step, so
  // each Delete lane follows its object.
  lDelPolicy: delPv,
  lDelWipe: delDisk,
  retPvc, retPvc2, admin, delBound, retBound,
  wRetBind: retBindLane,
  wAdminPv: adminLane,
});

const T = OPACITY.terminated;

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('Bound', 'exists', 'Bound', 'exists'),
    sublabels: { delPvc: 'Bound', retPvc: 'Bound', retPvc2: 'Pending' },
    opacity: stage({ delPvc: 1, delPv: 1, delDisk: 1, retPvc: 1, retPvc2: 0, admin: 0, delBound: 1, retBound: 1, retBindLane: 0, adminLane: 0 }),
  },
  {
    id: 'delete-pvc',
    duration: 2400,
    // Packet-less and Pod-less, and no block flashes: the two claims going to the terminating
    // shade under a Released chip IS the movement, so a flash would compete with it.
    narration: 'You delete both claims with kubectl delete pvc. The Bound links break and both volumes move to the Released phase, which means only that the claim they belonged to is gone. Nothing has touched the disks yet. What happens next is decided entirely by the reclaim policy.',
    chipsCued: chips('Released', 'exists', 'Released', 'exists'),
    sublabels: { delPvc: 'Terminating', retPvc: 'Terminating' },
    // The claims are on their way out, so they end this step faded but still readable.
    opacity: stage({ delPvc: OPACITY.terminating, delPv: 1, delDisk: 1, retPvc: OPACITY.terminating, retPvc2: 0, admin: 0, delBound: 0, retBound: 0, retBindLane: 0, adminLane: 0 }),
    lit: ['delPv', 'retPv'],
  },
  {
    id: 'delete-branch',
    duration: 3400,
    narration: 'The controller reads Delete on the left volume and cleans everything up. It calls DeleteVolume on the CSI driver, the real disk is wiped, and then the PV object itself is removed. Convenient for scratch data and unforgiving for anything you meant to keep, because the disk is gone for good.',
    chipsCued: chips('removed', 'wiped, gone', 'Released', 'exists'),
    sublabels: { delPvc: 'deleted', retPvc: 'deleted' },
    wires: { del: 'disk wiped, PV removed' },
    // End-state: the band has acted, and the PV and its disk are gone on the Delete side.
    opacity: stage({ delPvc: T, delPv: T, delDisk: T, retPvc: OPACITY.terminating, retPvc2: 0, admin: 0, delBound: 0, retBound: 0, retBindLane: 0, adminLane: 0 }),
    // `band` is absent from lit: F.light cues it on the arrival instead, and flowLights re-derives it
    // for the reduced path. rewind revives the objects and lanes the balls then ride and kill.
    rewind: {
      opacity: { delPv: 1, delDisk: 1, delSpec: 1, lDelPolicy: 1, lDelWipe: 1 },
      lit: ['delPv'],
    },
    flow: [
      F.route({ points: W_DEL_POLICY, name: 'policy' }),
      F.tag({ text: 'policy: Delete', points: W_DEL_POLICY }),
      F.light({ targets: ['band'], at: 'policy' }),
      F.route({ points: W_DEL_WIPE, after: 'policy', name: 'wipe' }),
      F.tag({ text: 'DeleteVolume', points: W_DEL_WIPE, after: 'policy' }),
      // An F.set on the disk, NOT `lights`: the fade below takes the class off again, and the reduced
      // path returned before any of this, so it must not show the light at all.
      F.set({ on: 'delDisk', lit: ['delDisk'], at: 'wipe' }),
      removeAt('delDisk', 'wipe', 180),
      removeAt('delSpec', 'wipe', 180),
      removeAt('lDelWipe', 'wipe', 180),
      removeAt('delPv', 'wipe', 580),
      removeAt('lDelPolicy', 'wipe', 580),
    ],
  },
  {
    id: 'retain-branch',
    duration: 3000,
    narration: 'The same controller reads Retain on the right volume and deliberately does nothing. No call ever reaches the driver, so the disk and every byte on it survive. The volume stays parked in Released, still carrying the claimRef of a claim that no longer exists.',
    chipsCued: chips('removed', 'wiped, gone', 'Released', 'data intact'),
    wires: { ret: 'nothing touched, data kept' },
    opacity: stage({ delPvc: T, delPv: T, delDisk: T, retPvc: T, retPvc2: 0, admin: 0, delBound: 0, retBound: 0, retBindLane: 0, adminLane: 0 }),
    // Static end state, which the reduced replay also snaps to. The disk is NOT lit: surviving
    // intact reads off the full opacity it keeps beside a Delete column at the terminated shade.
    lit: ['retPv'],
    // The policy hop is made on this side too, and it is the SECOND hop that never happens: the
    // lane down to the disk is drawn and stays empty. Retain shown as an absence, not as a gap.
    flow: [
      F.route({ points: W_RET_POLICY, name: 'policy' }),
      F.tag({ text: 'policy: Retain', points: W_RET_POLICY }),
      F.light({ targets: ['band'], at: 'policy' }),
    ],
  },
  {
    id: 'retain-stuck',
    duration: 3000,
    narration: 'A brand new claim asks for the same storage and cannot have it. The binding controller sees the leftover claimRef, decides the volume is already spoken for, and skips it. The new claim stays Pending: the disk is sitting right there, full of data, and nothing can reach it.',
    chipsCued: chips('removed', 'wiped, gone', 'Released', 'unusable'),
    sublabels: { retPvc2: 'Pending' },
    wires: { ret: 'skipped: stale claimRef' },
    // The refused claim sits dim at OPACITY.pending, not faded out: it exists and is simply refused.
    // It gets NO lit stroke, or it would read refused and live at once. The ball leaving it says it asks.
    opacity: stage({ delPvc: T, delPv: T, delDisk: T, retPvc: 0, retPvc2: OPACITY.pending, admin: 0, delBound: 0, retBound: 0, retBindLane: 1, adminLane: 0 }),
    // The request lands on the PV and the PV lights, because it was looked at. Nothing below it
    // lights and no Bound link appears, which is what tells the request apart from an accepted one.
    flow: [
      F.route({ points: W_RET_BIND, name: 'tryBind' }),
      F.tag({ text: 'bind me', points: W_RET_BIND }),
      F.light({ targets: ['retPv'], at: 'tryBind' }),
    ],
  },
  {
    id: 'admin-clears',
    duration: 3200,
    narration: 'Only a human breaks the deadlock. An administrator patches the PV and removes the stale claimRef by hand. With the reference cleared the volume goes back to Available, which is the first moment anything is allowed to bind to it again.',
    chipsCued: chips('removed', 'wiped, gone', 'Available', 'reusable'),
    sublabels: { retPvc2: 'Pending' },
    wires: { ret: 'claimRef cleared, Available' },
    opacity: stage({ delPvc: T, delPv: T, delDisk: T, retPvc: 0, retPvc2: OPACITY.pending, admin: 1, delBound: 0, retBound: 0, retBindLane: 0, adminLane: 1 }),
    // The human is the actor on this step, so the human lights.
    lit: ['admin'],
    flow: [
      F.route({ points: W_ADMIN_PV, name: 'patch' }),
      F.tag({ text: 'claimRef: null', points: W_ADMIN_PV }),
      F.light({ targets: ['retPv'], at: 'patch' }),
    ],
  },
  {
    id: 'rebind',
    duration: 3000,
    narration: 'Now the waiting claim binds, and the data that survived the whole story is reachable again. That is the trade Retain makes: it never loses your data, and it never hands it back on its own, so reuse is always a deliberate manual act.',
    chipsCued: chips('removed', 'wiped, gone', 'Bound', 'in use again'),
    sublabels: { retPvc2: 'Bound' },
    wires: { ret: 'bound to PVC data-c' },
    // This is the step where the claim DOES bind, so the Bound link is the thing that has to appear:
    // retain-stuck taught the reader that a refused request leaves it absent.
    opacity: stage({ delPvc: T, delPv: T, delDisk: T, retPvc: 0, retPvc2: 1, admin: 0, delBound: 0, retBound: 1, retBindLane: 0, adminLane: 0 }),
    lit: ['retPvc2'],
    // retDisk is absent from lit for the delete-branch reason: the animated path re-earns it on
    // arrival. Lane and Bound link share a segment, so the dashed one HANDS OVER to the solid one.
    rewind: { opacity: { wRetBind: 1, retBound: 0 } },
    flow: [
      F.route({ points: W_RET_BIND, name: 'bind' }),
      F.tag({ text: 'bound', points: W_RET_BIND }),
      F.light({ targets: ['retPv', 'retDisk'], at: 'bind' }),
      removeAt('wRetBind', 'bind', 0, 0),
      F.fade({ target: 'retBound', from: 0, to: 1, dur: REMOVE_MS, at: 'bind', fill: 'forwards', easing: 'ease-out' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
