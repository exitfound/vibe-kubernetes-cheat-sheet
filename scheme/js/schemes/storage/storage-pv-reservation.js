import { LANE_DY, P, F, defineCard, OPACITY, BEAT, STO, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-pv-reservation.md


const CX = STO.CX;                                    // the PV stands on it

// Two body bands: the writers above, the two objects the reservation pairs below. Actor blocks take
// the catalog size (NET.L-01).
const BOX_W = 232, BOX_H = 80;
const UP_Y = 90, UP_BOTTOM = UP_Y + BOX_H, UP_MID = UP_Y + BOX_H / 2;
const LOW_Y = 400, LOW_BOTTOM = LOW_Y + BOX_H, LOW_MID = LOW_Y + BOX_H / 2;

// The lock: PV and claim face each other across one gap wide enough for its two captions.
const LOCK_GAP = 144;
const PV_X = CX - BOX_W / 2, PV_RIGHT = PV_X + BOX_W;
const RES_X = PV_RIGHT + LOCK_GAP, RES_CX = RES_X + BOX_W / 2;
const LOCK_CX = PV_RIGHT + LOCK_GAP / 2;
// The administrator stands left of the PV, below the panel, one 128 lane off its face.
const ADM_X = PV_X - 128 - BOX_W, ADM_RIGHT = ADM_X + BOX_W;
// The PV spec line sits 14 under the name cylinder() prints at h/2 + 5 (STO.L-02).
const SPEC_Y = LOW_Y + BOX_H / 2 + 19;

// Upper band, right of the panel wall: the rival at 420, the controller one 128 lane to its right,
// the same length as the admin lane below it.
const SCR_X = 420, SCR_RIGHT = SCR_X + BOX_W;
const CTRL_X = SCR_RIGHT + 128, CTRL_CX = CTRL_X + BOX_W / 2;
const FORK_Y = (UP_BOTTOM + LOW_Y) / 2;                           // where the two arms part

const W_ADMIN = [[ADM_RIGHT, LOW_MID], [PV_X, LOW_MID]];
const W_ARM_PV = [[CTRL_CX - LANE_DY, UP_BOTTOM], [CTRL_CX - LANE_DY, FORK_Y], [CX, FORK_Y], [CX, LOW_Y]];
const W_ARM_RES = [[CTRL_CX + LANE_DY, UP_BOTTOM], [CTRL_CX + LANE_DY, FORK_Y], [RES_CX, FORK_Y], [RES_CX, LOW_Y]];
const W_SCRATCH = [[CTRL_X, UP_MID], [SCR_RIGHT, UP_MID]];
// The two references are fields, not traffic, so they are relations (A-06): nothing rides them.
const R_CLAIMREF = [[PV_RIGHT, LOW_MID - LANE_DY], [RES_X, LOW_MID - LANE_DY]];
const R_VOLNAME = [[RES_X, LOW_MID + LANE_DY], [PV_RIGHT, LOW_MID + LANE_DY]];

// The field grid: three rows under each of the two objects the reservation pairs.
const CHIP_H = STO.CHIP_H, CHIP_GAP = 8, CHIP_Y = LOW_BOTTOM + 20;
const chipY = i => CHIP_Y + i * (CHIP_H + CHIP_GAP);

// Each tag emerges once clear of the box it leaves.
const TAG = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0, emergeMode: true });
const LEG = { fn: TAG, emerge: 300 };
// The two 128 lanes ride a readable 1200 rather than the 700 floor, where their tags retire unread.
const LEG_DUR = 1200;

export const SCENE = {
  'aria-label': 'Reserving a PersistentVolume. PV pv-data is Released, its claimRef still naming the deleted claim app/data with that claim UID, so no claim can bind it. An administrator patches the claimRef to name app/restore with no UID, and the PV controller writes Available: the volume is reserved for that one claim, which does not exist yet. For a rival claim app/scratch that would otherwise fit, the binder skips pv-data, and the rival gets FailedBinding. Then app/restore is created naming pv-data in volumeName with storageClassName set to an empty string, and the binder writes its UID into the claimRef and both turn Bound. The alternative, if instead the claimRef had only been cleared: volumeName alone reserves nothing, a volumeName bind is checked for class, access modes and size but not node affinity, and a rival matched first takes the volume, so app/scratch ends Bound to pv-data and app/restore Pending with FailedBinding.',
  parts: [
    P.defs(),
    P.box({ key: 'scratch', x: SCR_X, y: UP_Y, w: BOX_W, h: BOX_H, label: 'PVC app/scratch', sublabel: 'not created yet', opacity: 0 }),
    P.box({ key: 'ctrl', x: CTRL_X, y: UP_Y, w: BOX_W, h: BOX_H, label: 'PV controller', sublabel: 'binder, kube-controller-manager' }),
    P.box({ key: 'admin', x: ADM_X, y: LOW_Y, w: BOX_W, h: BOX_H, label: 'Administrator', sublabel: 'kubectl patch pv' }),
    P.cylinder({ key: 'pv', x: PV_X, y: LOW_Y, w: BOX_W, h: BOX_H, label: 'PV pv-data' }),
    P.tag({ x: CX, y: SPEC_Y, text: '10Gi RWO, Retain, old data' }),
    P.box({ key: 'restore', x: RES_X, y: LOW_Y, w: BOX_W, h: BOX_H, label: 'PVC app/restore', sublabel: 'not created yet' }),
    P.relation({ key: 'rClaimRef', points: R_CLAIMREF, opacity: 0 }),
    P.relation({ key: 'rVolName', points: R_VOLNAME, opacity: 0 }),
    P.wire({ key: 'wClaimRef', x: LOCK_CX, y: LOW_MID - LANE_DY - 8 }),
    P.wire({ key: 'wVolName', x: LOCK_CX, y: LOW_MID + LANE_DY + 17 }),
    // The counterfactual caption stands above the branch it qualifies (T-35), right of the PV drop so
    // the tag landing on the PV top clears it.
    P.wire({ key: 'wIf', x: CX + 84, y: LOW_Y - 18, anchor: 'start' }),
    P.lane({ key: 'lAdmin', points: W_ADMIN, dashed: true, dim: true }),
    P.lane({ key: 'lArmPv', points: W_ARM_PV, dashed: true, dim: true }),
    P.lane({ key: 'lArmRes', points: W_ARM_RES, dashed: true, dim: true }),
    P.lane({ key: 'lScratch', points: W_SCRATCH, dashed: true, dim: true, opacity: 0 }),
    P.chip({ key: 'crChip', x: PV_X, y: chipY(0), w: BOX_W, h: CHIP_H, name: 'claimRef', value: 'app/data' }),
    P.chip({ key: 'uidChip', x: PV_X, y: chipY(1), w: BOX_W, h: CHIP_H, name: 'claimRef.uid', value: 'of app/data' }),
    P.chip({ key: 'pvPhase', x: PV_X, y: chipY(2), w: BOX_W, h: CHIP_H, name: 'status.phase', value: 'Released' }),
    P.chip({ key: 'vnChip', x: RES_X, y: chipY(0), w: BOX_W, h: CHIP_H, name: 'volumeName', value: 'no claim yet' }),
    P.chip({ key: 'scChip', x: RES_X, y: chipY(1), w: BOX_W, h: CHIP_H, name: 'storageClassName', value: 'no claim yet' }),
    P.chip({ key: 'pvcPhase', x: RES_X, y: chipY(2), w: BOX_W, h: CHIP_H, name: 'status.phase', value: 'no claim yet' }),
    P.packets(),
  ],
  reset: {
    keys: ['scratch', 'ctrl', 'admin', 'pv', 'restore',
      'crChip', 'uidChip', 'pvPhase', 'vnChip', 'scChip', 'pvcPhase'],
  },
};

const NO_CLAIM = 'no claim yet';
const chips = (claimRef, uid, pvPhase, vn, sc, pvcPhase) =>
  ({ crChip: claimRef, uidChip: uid, pvPhase, vnChip: vn, scChip: sc, pvcPhase });
const STALE = chips('app/data', 'of app/data', 'Released', NO_CLAIM, NO_CLAIM, NO_CLAIM);
const RESERVED = chips('app/restore', 'none', 'Available', NO_CLAIM, NO_CLAIM, NO_CLAIM);
const BOUND = chips('app/restore', 'of app/restore', 'Bound', 'pv-data', '""', 'Bound');
const TAKEN = chips('app/scratch', 'of app/scratch', 'Bound', 'pv-data', '""', 'Pending');

// STO.S-01 as a field: every step pins the two claims born mid-story, the rival lane with its box,
// and the two references. A claim not created yet stands at pending (C-14).
const stage = ({ scratch = 0, restore = OPACITY.pending, claimRef = 0, volName = 0 } = {}) => ({
  scratch, lScratch: scratch, restore, rClaimRef: claimRef, rVolName: volName,
  lAdmin: 1, lArmPv: 1, lArmRes: 1,
});
const BLANK = { wClaimRef: '', wVolName: '', wIf: '' };
const NOT_YET = 'not created yet';
const subs = (scratch, restore) => ({ scratch, restore });
// A claim is stored the moment it is created: it comes up on the beat that makes it.
const born = (target, from) => F.fade({ target, from, to: 1, dur: 500, fill: 'forwards', easing: 'ease-out', delay: 0 });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: STALE,
    sublabels: subs(NOT_YET, NOT_YET),
    wires: BLANK,
    opacity: stage(),
  },
  {
    id: 'reserve',
    duration: 4200,
    narration: 'PV pv-data is Released: its claimRef still names the deleted claim app/data, UID included, so no claim can bind it. An administrator patches the claimRef to name app/restore, with no UID. A claimRef without a UID is a reservation, so the PV controller writes Available, for that one claim, which does not even exist yet.',
    chipsCued: RESERVED,
    sublabels: subs(NOT_YET, NOT_YET),
    wires: { ...BLANK, wClaimRef: 'claimRef' },
    opacity: stage({ claimRef: 1 }),
    lit: ['admin'],
    rewind: { chips: { crChip: 'app/data', uidChip: 'of app/data', pvPhase: 'Released' }, opacity: { rClaimRef: 0 }, wires: { wClaimRef: '' } },
    flow: [
      F.route({ points: W_ADMIN, delay: BEAT.lead, dur: LEG_DUR, name: 'patch', lights: ['pv'], tag: { text: 'claimRef: app/restore', ...LEG } }),
      F.set({ at: 'patch', chipsCued: { crChip: 'app/restore', uidChip: 'none' }, wires: { wClaimRef: 'claimRef' } }),
      F.fade({ target: 'rClaimRef', from: 0, to: 1, dur: 500, at: 'patch', fill: 'forwards', easing: 'ease-out' }),
      F.light({ targets: ['ctrl'], at: 'patch' }),
      F.route({ points: W_ARM_PV, after: 'patch', name: 'avail', tag: { text: 'Available', ...LEG } }),
      F.set({ at: 'avail', chipsCued: { pvPhase: 'Available' } }),
    ],
  },
  {
    id: 'rival',
    duration: 4200,
    narration: 'PVC app/scratch arrives asking for 10Gi with no class, a fit for pv-data in every other way. The binder skips any volume whose claimRef names another claim, so pv-data is not even a candidate. The rival gets a FailedBinding event and stays Pending, while the reserved volume keeps waiting for app/restore.',
    chipsCued: RESERVED,
    sublabels: subs('Pending, FailedBinding', NOT_YET),
    wires: { ...BLANK, wClaimRef: 'claimRef' },
    opacity: stage({ scratch: 1, claimRef: 1 }),
    lit: ['ctrl'],
    rewind: { sublabels: { scratch: 'Pending' }, opacity: { scratch: 0, lScratch: 0 } },
    flow: [
      born('scratch', 0),
      born('lScratch', 0),
      F.route({ points: W_ARM_PV, delay: BEAT.lead, name: 'look', lights: ['pv'], tag: { text: 'reserved: skip', ...LEG } }),
      F.route({ points: W_SCRATCH, after: 'look', dur: LEG_DUR, name: 'fail', lights: ['scratch'], tag: { text: 'FailedBinding', ...LEG } }),
      F.set({ at: 'fail', sublabels: { scratch: 'Pending, FailedBinding' } }),
    ],
  },
  {
    id: 'bind',
    duration: 4400,
    narration: 'Now app/restore is created with volumeName: pv-data and storageClassName set to an empty string, because left unset the default StorageClass would be written in. Claim and volume name each other, so the binder binds them: it writes the claim UID into the claimRef, and both turn Bound, the old data still on the disk.',
    chipsCued: BOUND,
    sublabels: subs('Pending, FailedBinding', 'reuses the old data'),
    wires: { ...BLANK, wClaimRef: 'claimRef', wVolName: 'volumeName' },
    opacity: stage({ scratch: 1, restore: 1, claimRef: 1, volName: 1 }),
    lit: ['ctrl'],
    rewind: {
      chips: { vnChip: NO_CLAIM, scChip: NO_CLAIM, pvcPhase: NO_CLAIM, uidChip: 'none', pvPhase: 'Available' },
      sublabels: { restore: NOT_YET },
      opacity: { restore: OPACITY.pending, rVolName: 0 },
      wires: { wVolName: '' },
    },
    flow: [
      born('restore', OPACITY.pending),
      born('rVolName', 0),
      F.set({ delay: 0, chipsCued: { vnChip: 'pv-data', scChip: '""', pvcPhase: 'Pending' }, sublabels: { restore: 'reuses the old data' }, wires: { wVolName: 'volumeName' } }),
      F.route({ points: W_ARM_PV, delay: BEAT.lead, name: 'uid', lights: ['pv'], tag: { text: 'claimRef.uid', ...LEG } }),
      F.set({ at: 'uid', chipsCued: { uidChip: 'of app/restore', pvPhase: 'Bound' } }),
      F.route({ points: W_ARM_RES, after: 'uid', name: 'bound', lights: ['restore'], tag: { text: 'Bound', ...LEG } }),
      F.set({ at: 'bound', chipsCued: { pvcPhase: 'Bound' } }),
    ],
  },
  {
    id: 'named-only',
    duration: 4400,
    narration: 'If instead the administrator had only cleared the claimRef, pv-data would be Available to any claim that fits it, and volumeName alone reserves nothing. A named volume is checked for class, access modes and size, though not node affinity, but a rival matched first takes it: app/scratch binds, and app/restore gets FailedBinding.',
    chipsCued: TAKEN,
    sublabels: subs('Bound to pv-data', 'Pending, FailedBinding'),
    wires: { ...BLANK, wVolName: 'volumeName', wIf: 'if instead claimRef were only cleared' },
    opacity: stage({ scratch: 1, restore: 1, claimRef: 0, volName: 1 }),
    lit: ['ctrl'],
    rewind: {
      chips: { crChip: 'none', uidChip: 'none', pvPhase: 'Available', pvcPhase: 'Pending' },
      sublabels: { scratch: 'Pending', restore: 'Pending' },
    },
    flow: [
      F.route({ points: W_ARM_PV, delay: BEAT.lead, name: 'take', lights: ['pv', 'pvPhase'], tag: { text: 'claimRef: app/scratch', ...LEG } }),
      F.set({ at: 'take', chipsCued: { crChip: 'app/scratch', uidChip: 'of app/scratch', pvPhase: 'Bound' } }),
      F.route({ points: W_SCRATCH, after: 'take', dur: LEG_DUR, name: 'won', lights: ['scratch'], tag: { text: 'Bound', ...LEG } }),
      F.set({ at: 'won', sublabels: { scratch: 'Bound to pv-data' } }),
      F.route({ points: W_ARM_RES, after: 'take', name: 'lost', lights: ['restore', 'pvcPhase'], tag: { text: 'FailedBinding', ...LEG } }),
      F.set({ at: 'lost', sublabels: { restore: 'Pending, FailedBinding' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
