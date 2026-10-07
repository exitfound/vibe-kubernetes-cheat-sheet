import { LANE_DY, P, F, defineCard, OPACITY, BEAT, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-pv-lifecycle-phases.md


// One pitch drives the phase row, and the row stands right of the panel wall so the controller band
// can span all four phases above it: every write lane is then a straight drop onto a box top.
const PITCH = 196;
const ST_W = 150, GAP = PITCH - ST_W;
const ROW_X = 400;
const AVAIL_CX = ROW_X + ST_W / 2, BOUND_CX = AVAIL_CX + PITCH;
const RELEASED_CX = BOUND_CX + PITCH, FAILED_CX = RELEASED_CX + PITCH;
const ROW_RIGHT = ROW_X + 4 * ST_W + 3 * GAP;
const stX = cx => cx - ST_W / 2;
const ROW_Y = 300, ST_H = 72, ROW_BOTTOM = ROW_Y + ST_H, ROW_MID = ROW_Y + ST_H / 2;

// Every actor is 80 tall (NET.L-01). The controller band is sized BY the row it writes to, and its
// centre is the row centre, so the four write lanes sit at mirrored offsets on its floor (L-12).
const BOX_H = 80, GAP_Y = 40;
const SLOT_Y = 30, SLOT_BOTTOM = SLOT_Y + BOX_H;  // the actor sending an event
const BAND_Y = SLOT_BOTTOM + GAP_Y, BAND_BOTTOM = BAND_Y + BOX_H;
const BAND_X = ROW_X, BAND_W = ROW_RIGHT - ROW_X, BAND_CX = BAND_X + BAND_W / 2;
// The slot is centred on the band, one actor per step.
const SLOT_W = 232, SLOT_X = BAND_CX - SLOT_W / 2;

// The way back runs UNDER the row, from the Released floor to the Available floor.
const BACK_Y = ROW_BOTTOM + 48, WIRE_LBL_Y = ROW_BOTTOM + 20, BACK_LBL_Y = BACK_Y + 18;
// The Delete caption sits ABOVE the row, right of the Released write lane: under the row it would
// lie across the provisioner lane and the way back, which both leave the Released floor.
const DELETE_LBL_X = RELEASED_CX + LANE_DY, DELETE_LBL_Y = ROW_Y - 18;
// The Failed caption starts at the Released centre, clear of the way-back line.
const FAIL_LBL_X = RELEASED_CX;

// The external-provisioner stands under Failed (NET.L-01) and reaches Released from the side.
const PROV_W = 232, PROV_X = FAILED_CX - PROV_W / 2, PROV_Y = 450;
const PROV_MID = PROV_Y + BOX_H / 2;

// The PV object as a column of its own fields, bottom left, where the full width is free below the
// panel, placed so it balances the row.
const COL_X = 80, COL_W = 260, CHIP_H = 34, CHIP_GAP = 8, COL_Y = 440;
const chipY = i => COL_Y + i * (CHIP_H + CHIP_GAP);

const W_EVENT = [[BAND_CX, SLOT_BOTTOM], [BAND_CX, BAND_Y]];
const write = cx => [[cx, BAND_BOTTOM], [cx, ROW_Y]];
const W_AVAIL = write(AVAIL_CX), W_BOUND = write(BOUND_CX), W_RELEASED = write(RELEASED_CX), W_FAILED = write(FAILED_CX);
const W_PROV = [[PROV_X, PROV_MID], [RELEASED_CX + LANE_DY, PROV_MID], [RELEASED_CX + LANE_DY, ROW_BOTTOM]];
// The transitions are the SHAPE of the machine and nothing travels them, so they are relations
// (A-06): what travels is the controller writing a phase, down its own lane.
const edge = (fromCx, toCx) => [[fromCx + ST_W / 2, ROW_MID], [toCx - ST_W / 2, ROW_MID]];
const R_BACK = [[RELEASED_CX - LANE_DY, ROW_BOTTOM], [RELEASED_CX - LANE_DY, BACK_Y], [AVAIL_CX, BACK_Y], [AVAIL_CX, ROW_BOTTOM]];
const gapMid = cx => cx + ST_W / 2 + GAP / 2;

// Every vertical hop leaves a box floor, so a tag riding above its ball is born inside the sender:
// it fades in once clear of it instead.
const gapTag = makeRidingLabel({ role: 'storage', emergeMode: true });
const GAP_TAG = { fn: gapTag, emerge: 400 };
// DeleteVolume rises into the Released floor, so its tag rides under the ball and right of the rise,
// landing in the gap under the row.
const DELETE_TAG = { ...GAP_TAG, dx: 50, dy: 16 };
const REMOVE_MS = 500;

const lane = (points, key) => P.lane({ key, points, dashed: true, dim: true });
const relation = (points, key) => P.relation({ key, points, dash: '5 5' });

export const SCENE = {
  'aria-label': 'The phase of a PersistentVolume as a status field on a row of four places, Available, Bound, Released and Failed, written by one PV controller in response to events. A new claim makes it write Bound, deleting the claim makes it write Released. Under Delete the external-provisioner removes a CSI volume and there is no phase left to write. A hand-made NFS volume set to Delete has no plugin to delete it, so the controller writes Failed. Apart from the deprecated Recycle policy, the way back is an administrator removing the stale claimRef, after which the controller writes Available with the old data still on the volume.',
  parts: [
    P.defs(),
    // Each phase carries the claimRef condition that defines it, because the name alone does not say
    // why Released refuses to rebind and Available does not.
    P.box({ key: 'stAvail', x: stX(AVAIL_CX), y: ROW_Y, w: ST_W, h: ST_H, label: 'Available', sublabel: 'not bound' }),
    P.box({ key: 'stBound', x: stX(BOUND_CX), y: ROW_Y, w: ST_W, h: ST_H, label: 'Bound', sublabel: 'claimRef set' }),
    P.box({ key: 'stReleased', x: stX(RELEASED_CX), y: ROW_Y, w: ST_W, h: ST_H, label: 'Released', sublabel: 'claimRef stale' }),
    P.box({ key: 'stFailed', x: stX(FAILED_CX), y: ROW_Y, w: ST_W, h: ST_H, label: 'Failed', sublabel: 'no way to reclaim' }),
    P.box({ key: 'band', x: BAND_X, y: BAND_Y, w: BAND_W, h: BOX_H, label: 'PV controller', sublabel: 'kube-controller-manager, writes status.phase' }),
    // One slot, two actors on different steps: each is its own block, born invisible.
    P.box({ key: 'pvc', x: SLOT_X, y: SLOT_Y, w: SLOT_W, h: BOX_H, label: 'PVC default/data', sublabel: 'the claim', opacity: 0 }),
    P.box({ key: 'admin', x: SLOT_X, y: SLOT_Y, w: SLOT_W, h: BOX_H, label: 'Administrator', sublabel: 'kubectl patch pv', opacity: 0 }),
    P.box({ key: 'prov', x: PROV_X, y: PROV_Y, w: PROV_W, h: BOX_H, label: 'External-provisioner', sublabel: 'CSI sidecar', opacity: 0 }),
    relation(edge(AVAIL_CX, BOUND_CX), 'rAvBo'),
    relation(edge(BOUND_CX, RELEASED_CX), 'rBoRe'),
    relation(edge(RELEASED_CX, FAILED_CX), 'rReFa'),
    relation(R_BACK, 'rBack'),
    // One write lane per phase, drawn on every step: the controller chooses among them (A-04).
    lane(W_AVAIL, 'lAvail'),
    lane(W_BOUND, 'lBound'),
    lane(W_RELEASED, 'lReleased'),
    lane(W_FAILED, 'lFailed'),
    lane(W_EVENT, 'lEvent'),
    lane(W_PROV, 'lProv'),
    // Event names under each transition, and the counterfactual captions of the two branches (T-35),
    // blank at build and written per step.
    P.wire({ key: 'wBind', x: gapMid(AVAIL_CX), y: WIRE_LBL_Y }),
    P.wire({ key: 'wRelease', x: gapMid(BOUND_CX), y: WIRE_LBL_Y }),
    P.wire({ key: 'wDelete', x: DELETE_LBL_X, y: DELETE_LBL_Y, anchor: 'start' }),
    P.wire({ key: 'wFail', x: FAIL_LBL_X, y: WIRE_LBL_Y, anchor: 'start' }),
    P.wire({ key: 'wBack', x: (AVAIL_CX + RELEASED_CX) / 2, y: BACK_LBL_Y }),
    P.tag({ key: 'colTitle', x: COL_X + COL_W / 2, y: COL_Y - 12, text: 'PV pv-data, its fields' }),
    P.chip({ key: 'phaseChip', x: COL_X, y: chipY(0), w: COL_W, h: CHIP_H, name: 'status.phase', value: 'Available' }),
    P.chip({ key: 'claimRefChip', x: COL_X, y: chipY(1), w: COL_W, h: CHIP_H, name: 'claimRef', value: 'none' }),
    P.chip({ key: 'policyChip', x: COL_X, y: chipY(2), w: COL_W, h: CHIP_H, name: 'reclaim', value: 'Retain' }),
    P.chip({ key: 'eventChip', x: COL_X, y: chipY(3), w: COL_W, h: CHIP_H, name: 'event', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['stAvail', 'stBound', 'stReleased', 'stFailed', 'band', 'pvc', 'admin', 'prov',
      'phaseChip', 'claimRefChip', 'policyChip', 'eventChip'],
  },
};

const chips = (phase, claimRef, policy, event) =>
  ({ phaseChip: phase, claimRefChip: claimRef, policyChip: policy, eventChip: event });

// STO.S-01 as a field: every step pins every opacity any step changes, and a lane follows its actor.
// The board is the four phase boxes with every line that ends on one, and it dims only when the PV
// object itself is gone: a lane is as present as its fainter end (A-13).
const BOARD = ['stAvail', 'stBound', 'stReleased', 'stFailed',
  'lAvail', 'lBound', 'lReleased', 'lFailed', 'rAvBo', 'rBoRe', 'rReFa', 'rBack'];
const stage = ({ pvc = 0, admin = 0, prov = 0, board = 1 } = {}) => ({
  pvc, admin, prov, lEvent: Math.max(pvc, admin), lProv: Math.min(prov, board),
  ...Object.fromEntries(BOARD.map(k => [k, board])),
});
const BLANK = { wBind: '', wRelease: '', wDelete: '', wFail: '', wBack: '' };

// The phase the controller writes waits for the write to land, like the sublabel of a box would.
const writeLands = (at, phase, extra = {}) => F.set({ at, chipsCued: { phaseChip: phase, ...extra } });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('Available', 'none', 'Retain', 'none'),
    wires: BLANK,
    opacity: stage(),
  },
  {
    id: 'bind',
    duration: 3400,
    narration: 'A new claim asks for storage. The PV controller finds this volume, writes the claim into its claimRef and sets the phase to Bound. The claim itself writes nothing: every phase on this row is written by the controller, in response to events like this one.',
    chipsCued: chips('Bound', 'default/data', 'Retain', 'none'),
    wires: { ...BLANK, wBind: 'claim bound' },
    opacity: stage({ pvc: 1 }),
    lit: ['pvc'],
    rewind: { chips: { phaseChip: 'Available', claimRefChip: 'none' }, wires: { wBind: '' } },
    flow: [
      F.route({ points: W_EVENT, delay: BEAT.lead, name: 'ev', tag: { text: 'new claim', ...GAP_TAG } }),
      F.light({ targets: ['band'], at: 'ev' }),
      F.route({ points: W_BOUND, after: 'ev', name: 'w', tag: { text: 'Bound', ...GAP_TAG } }),
      F.light({ targets: ['stBound'], at: 'w' }),
      writeLands('w', 'Bound', { claimRefChip: 'default/data' }),
      F.set({ at: 'w', wires: { wBind: 'claim bound' } }),
    ],
  },
  {
    id: 'release',
    duration: 3400,
    narration: 'The claim is deleted. Its claimRef now names a claim that no longer exists, so the controller writes Released, not Available. That stale reference stays on the PV, and it is exactly what stops any other claim from binding. What happens next depends on the reclaim policy.',
    chipsCued: chips('Released', 'default/data stale', 'Retain', 'none'),
    wires: { ...BLANK, wRelease: 'claim deleted' },
    // The claim is gone by the end of the step, so its absence is the static end state.
    opacity: stage(),
    // The claim sends, so it is lit, but only on the animated path: it ends the step at zero, and a
    // block that is gone carries no stroke on the static one.
    rewind: {
      lit: ['pvc'],
      opacity: { pvc: 1, lEvent: 1 },
      chips: { phaseChip: 'Bound', claimRefChip: 'default/data' },
      wires: { wRelease: '' },
    },
    flow: [
      F.route({ points: W_EVENT, delay: BEAT.lead, name: 'ev', tag: { text: 'claim deleted', ...GAP_TAG } }),
      F.light({ targets: ['band'], at: 'ev' }),
      F.fade({ target: 'pvc', to: 0, dur: REMOVE_MS, at: 'ev', fill: 'forwards', unlight: ['pvc'] }),
      F.fade({ target: 'lEvent', to: 0, dur: REMOVE_MS, at: 'ev', fill: 'forwards' }),
      F.route({ points: W_RELEASED, after: 'ev', name: 'w', tag: { text: 'Released', ...GAP_TAG } }),
      F.light({ targets: ['stReleased'], at: 'w' }),
      writeLands('w', 'Released', { claimRefChip: 'default/data stale' }),
      F.set({ at: 'w', wires: { wRelease: 'claim deleted' } }),
    ],
  },
  {
    id: 'delete',
    duration: 3200,
    narration: 'If the policy is Delete, the PV controller does not delete a CSI volume. The external-provisioner does: it calls DeleteVolume on the driver and then deletes the PV object itself. There is no final phase to write, because the volume leaves this row altogether.',
    chipsCued: chips('none, PV deleted', 'gone with the PV', 'Delete', 'none'),
    wires: { ...BLANK, wDelete: 'if the policy is Delete' },
    // The PV object is gone, so the board it was a phase of ends dimmed: no phase is current.
    opacity: stage({ prov: 1, board: OPACITY.notready }),
    lit: ['prov'],
    rewind: {
      opacity: { ...Object.fromEntries(BOARD.map(k => [k, 1])), lProv: 1 },
      chips: { phaseChip: 'Released', claimRefChip: 'default/data stale' },
    },
    // Released takes the call through an F.set, not `lights`: the dim below takes the stroke off
    // again, and the static path must not show a lit phase on a board with no PV behind it.
    flow: [
      F.route({ points: W_PROV, delay: BEAT.lead, name: 'del', tag: { text: 'DeleteVolume', ...DELETE_TAG } }),
      F.set({ on: 'stReleased', lit: ['stReleased'], at: 'del' }),
      writeLands('del', 'none, PV deleted', { claimRefChip: 'gone with the PV' }),
      ...[...BOARD, 'lProv'].map(target => F.fade({ target, to: OPACITY.notready, dur: REMOVE_MS, at: 'del', plus: 400, fill: 'forwards', unlight: [target] })),
    ],
  },
  {
    id: 'failed',
    duration: 3600,
    narration: 'If instead the volume is a hand-made NFS PV set to Delete, no plugin can delete it. The controller finds no deleter and writes Failed, with a VolumeFailedDelete event. A CSI volume set to Delete does not land here: its failed DeleteVolume is retried while it stays Released.',
    chipsCued: chips('Failed', 'default/data stale', 'Delete', 'VolumeFailedDelete'),
    wires: { ...BLANK, wFail: 'if instead no plugin can delete it' },
    opacity: stage(),
    // The controller acts on its own here: it looks at the released volume, then writes the verdict.
    lit: ['band'],
    rewind: { chips: { phaseChip: 'Released', eventChip: 'none' } },
    flow: [
      F.route({ points: W_RELEASED, delay: BEAT.lead, name: 'look', tag: { text: 'no deleter', ...GAP_TAG } }),
      F.light({ targets: ['stReleased'], at: 'look' }),
      F.route({ points: W_FAILED, after: 'look', name: 'w', tag: { text: 'Failed', ...GAP_TAG } }),
      F.light({ targets: ['stFailed'], at: 'w' }),
      writeLands('w', 'Failed', { eventChip: 'VolumeFailedDelete' }),
    ],
  },
  {
    id: 'recover',
    duration: 3600,
    narration: 'Short of the deprecated Recycle policy, which scrubs a volume and frees it on its own, the way back is by hand. An administrator removes the stale claimRef, and the controller writes Available, from Released or from Failed alike. A matching claim can now bind it, with the previous data still on it.',
    chipsCued: chips('Available', 'cleared', 'Retain', 'none'),
    wires: { ...BLANK, wBack: 'claimRef cleared by hand' },
    opacity: stage({ admin: 1 }),
    lit: ['admin'],
    rewind: { chips: { phaseChip: 'Released', claimRefChip: 'default/data stale' }, wires: { wBack: '' } },
    flow: [
      F.route({ points: W_EVENT, delay: BEAT.lead, name: 'ev', tag: { text: 'claimRef: null', ...GAP_TAG } }),
      F.light({ targets: ['band'], at: 'ev' }),
      F.set({ at: 'ev', chipsCued: { claimRefChip: 'cleared' } }),
      F.route({ points: W_AVAIL, after: 'ev', name: 'w', tag: { text: 'Available', ...GAP_TAG } }),
      F.light({ targets: ['stAvail'], at: 'w' }),
      writeLands('w', 'Available'),
      F.set({ at: 'w', wires: { wBack: 'claimRef cleared by hand' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
