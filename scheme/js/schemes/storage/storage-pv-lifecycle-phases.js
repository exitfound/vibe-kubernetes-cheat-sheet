import { P, F, defineCard, BEAT, chipStrip } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-pv-lifecycle-phases


const PITCH = 224;
const ST_W = 164, GAP = PITCH - ST_W;                          // 164 / 60
const AVAIL_CX = 264, BOUND_CX = AVAIL_CX + PITCH;             // 264 / 488
const RELEASED_CX = BOUND_CX + PITCH, FAILED_CX = RELEASED_CX + PITCH;  // 712 / 936
const stX = cx => cx - ST_W / 2;                               // 182 / 406 / 630 / 854

const ACT_Y = 60, ACT_H = 68, ACT_BOTTOM = ACT_Y + ACT_H;      // 60 / 128
const TRANSIT_Y = 214;
const RECOVER_LBL_Y = 238;                                     // names the backward edge, under its run
const ROW_Y = 300, ST_H = 72;
const ROW_BOTTOM = ROW_Y + ST_H, ROW_MID = ROW_Y + ST_H / 2;   // 372 / 336
const WIRE_LBL_Y = 392;                                        // event names, under the row
const ADMIN_Y = 440, ADMIN_H = 68;                             // 440 / 508
const CHIP_Y = 548, CHIP_H = 34;                               // strip ends at 582

const ACT_W = 176;
const PVC_X = BOUND_CX - ACT_W / 2, CTRL_X = RELEASED_CX - ACT_W / 2;   // 400 / 624
const ADMIN_W = 176, ADMIN_X = RELEASED_CX - ADMIN_W / 2;              // 624

// The family formula with this card's own width and gap. 252 buys air, not fit: the worst pair here
// is `claimRef` + `default/data stale`, 26 characters, which needs 203 against STO.CHIP_W 232.
const CHIPS = chipStrip({ w: 252, gap: 24 });                  // 60 / 336 / 612 / 888

// The forward lanes sit in the gaps between phases, so each is exactly GAP long and the same points
// array feeds both the drawn lane and the ball. Gap centers carry the event name.
const gapMid = cx => cx + ST_W / 2 + GAP / 2;
const W_AV_BO = [[stX(AVAIL_CX) + ST_W, ROW_MID], [stX(BOUND_CX), ROW_MID]];
const W_BO_RE = [[stX(BOUND_CX) + ST_W, ROW_MID], [stX(RELEASED_CX), ROW_MID]];
const W_RE_FA = [[stX(RELEASED_CX) + ST_W, ROW_MID], [stX(FAILED_CX), ROW_MID]];

// The claim reaches over to whichever phase the volume is in NOW, which on the binding step is
// Available, and the volume then travels the row to Bound and ends up directly under the claim.
const W_BIND = [[BOUND_CX, ACT_BOTTOM], [BOUND_CX, TRANSIT_Y], [AVAIL_CX, TRANSIT_Y], [AVAIL_CX, ROW_Y]];
// The controller only ever acts on Released, which it sits directly above: a straight drop.
const W_RECLAIM = [[RELEASED_CX, ACT_BOTTOM], [RELEASED_CX, ROW_Y]];
const W_RECOVER = [[RELEASED_CX, ROW_Y], [RELEASED_CX, TRANSIT_Y], [AVAIL_CX, TRANSIT_Y], [AVAIL_CX, ROW_Y]];
const W_ADMIN = [[RELEASED_CX, ADMIN_Y], [RELEASED_CX, ROW_BOTTOM]];

// Every lane in this card is a ROUTE: something travels all of them, including the backward arc, so
// they are all dashed with a head and all built from the same points array as their ball.
const lane = (points, p = {}) => P.lane({ points, dashed: true, dim: true, ...p });

// Z-order (bottom -> top): the phase boxes and the actors, then every lane above them, then the
// event labels, then the chip strip, then the packet layer so every ball rides above everything.
export const SCENE = {
  'aria-label': 'The phase field of a PersistentVolume as a state machine with four places. A fresh volume is Available, writing a claimRef makes it Bound, and deleting that claim moves it to Released, because the stale claimRef stays behind. From Released the reclaim policy decides: Delete removes disk and object, a failed Delete parks it in Failed, and Retain leaves it parked. The one backward edge is manual, an administrator clearing the stale claimRef so the volume returns to Available.',
  parts: [
    P.defs(),
    // The four phases. Each carries the claimRef condition that defines it as a sublabel, because the
    // phase name on its own does not explain why Released refuses to rebind and Available does not.
    P.box({ key: 'stAvail', x: stX(AVAIL_CX), y: ROW_Y, w: ST_W, h: ST_H, label: 'Available', sublabel: 'no claimRef' }),
    P.box({ key: 'stBound', x: stX(BOUND_CX), y: ROW_Y, w: ST_W, h: ST_H, label: 'Bound', sublabel: 'claimRef set' }),
    P.box({ key: 'stReleased', x: stX(RELEASED_CX), y: ROW_Y, w: ST_W, h: ST_H, label: 'Released', sublabel: 'claimRef stale' }),
    P.box({ key: 'stFailed', x: stX(FAILED_CX), y: ROW_Y, w: ST_W, h: ST_H, label: 'Failed', sublabel: 'reclaim errored' }),
    P.box({ key: 'pvc', x: PVC_X, y: ACT_Y, w: ACT_W, h: ACT_H, label: 'PVC default/data', sublabel: 'the claim', opacity: 0 }),
    // Delete and Retain only, never Recycle: the Recycle reclaim policy is deprecated in the upstream
    // docs, so this sublabel must not advertise it as a live option.
    P.box({ key: 'ctrl', x: CTRL_X, y: ACT_Y, w: ACT_W, h: ACT_H, label: 'PV controller', sublabel: 'reads reclaim policy', opacity: 0 }),
    P.box({ key: 'admin', x: ADMIN_X, y: ADMIN_Y, w: ADMIN_W, h: ADMIN_H, label: 'Administrator', sublabel: 'kubectl patch pv', opacity: 0 }),
    // The three forward lanes are drawn on every step: the shape of the machine is true whether or
    // not this step travels it, so they carry no key and nothing ever writes their opacity.
    lane(W_AV_BO),
    lane(W_BO_RE),
    lane(W_RE_FA),
    lane(W_BIND, { key: 'lBind', opacity: 0 }),
    lane(W_RECLAIM, { key: 'lReclaim', opacity: 0 }),
    lane(W_ADMIN, { key: 'lAdmin', opacity: 0 }),
    lane(W_RECOVER, { key: 'lRecover', opacity: 0 }),
    // Event names under each forward gap, blank at build and filled per step by the wires field.
    P.wire({ key: 'bind', x: gapMid(AVAIL_CX), y: WIRE_LBL_Y }),
    P.wire({ key: 'rel', x: gapMid(BOUND_CX), y: WIRE_LBL_Y }),
    P.wire({ key: 'fail', x: gapMid(RELEASED_CX), y: WIRE_LBL_Y }),
    P.wire({ key: 'verdict', x: RELEASED_CX, y: WIRE_LBL_Y }),
    P.wire({ key: 'recover', x: (AVAIL_CX + RELEASED_CX) / 2, y: RECOVER_LBL_Y }),
    P.chip({ key: 'phaseChip', x: CHIPS.x(0), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'phase', value: 'Available' }),
    P.chip({ key: 'claimRefChip', x: CHIPS.x(1), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'claimRef', value: 'none' }),
    P.chip({ key: 'policyChip', x: CHIPS.x(2), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'reclaim', value: 'Delete' }),
    P.chip({ key: 'objChip', x: CHIPS.x(3), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'PV object', value: 'exists' }),
    P.packets(),
  ],
  reset: {
    keys: ['stAvail', 'stBound', 'stReleased', 'stFailed', 'pvc', 'ctrl', 'admin',
      'phaseChip', 'claimRefChip', 'policyChip', 'objChip'],
  },
};

// All four chips go through setChip, so all four are chipsCued. Argument order is the helper's:
// phase, claimRef, reclaim policy, the PV object itself.
const chips = (phase, claimRef, policy, obj) =>
  ({ phaseChip: phase, claimRefChip: claimRef, policyChip: policy, objChip: obj });

// STO.S-01 as a field: every step pins EVERY opacity that any step can change, so a step can never
// inherit a stale one and a cancel mid-flight always lands on this step's own end state.
const stage = (on = {}) => ({ pvc: 0, ctrl: 0, admin: 0, lBind: 0, lReclaim: 0, lAdmin: 0, lRecover: 0, ...on });
const BARE = stage();
const CLAIM_UP = stage({ pvc: 1, lBind: 1 });
const CTRL_UP = stage({ ctrl: 1, lReclaim: 1 });
const ADMIN_UP = stage({ admin: 1, lAdmin: 1, lRecover: 1 });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('Available', 'none', 'Delete', 'exists'),
    opacity: BARE,
    lit: ['stAvail'],
  },
  {
    id: 'bind',
    duration: 3200,
    narration: 'A matching claim asks for the volume. That claim is written into the claimRef field of the PV, and the phase moves to Bound. From here the volume is reserved for exactly one claim and no other claim can take it.',
    chipsCued: chips('Bound', 'default/data', 'Delete', 'exists'),
    wires: { bind: 'claimRef written' },
    opacity: CLAIM_UP,
    // Only the claim, the box the ball departs from, is lit from entry. Both phase boxes are cued by
    // an arrival instead, which flowLights also hands the reduced path, so all three end up lit.
    lit: ['pvc'],
    flow: [
      F.route({ points: W_BIND, name: 'write' }),
      F.tag({ text: 'claimRef: default/data', points: W_BIND }),
      // Its own entry, not `lights` on the route: the cue stood AFTER the tag and that order is
      // observable. The flip below carries no tag, so its cue can ride the packet.
      F.light({ targets: ['stAvail'], at: 'write' }),
      F.route({ points: W_AV_BO, after: 'write', lights: ['stBound'] }),
    ],
  },
  {
    id: 'release',
    duration: 3000,
    narration: 'The claim is deleted. The volume does not go back to Available: it moves to Released. The claimRef is still on the PV and now names a claim that no longer exists, and that stale reference is precisely what stops any other claim from binding.',
    chipsCued: chips('Released', 'default/data stale', 'Delete', 'exists'),
    wires: { rel: 'claim deleted' },
    opacity: BARE,
    lit: ['stBound'],
    // The claim starts alive and is killed on this step, so its absence is the static end state and
    // the rewind puts it back for the fade below to take away.
    rewind: { opacity: { pvc: 1 } },
    // The phase flip is caused by the deletion, so it may not overlap it and waits for the fade out.
    // `unlight` takes the lit stroke off with the block, so a box that has gone dark cannot glow.
    flow: [
      F.fade({ target: 'pvc', to: 0, dur: 500, delay: 120, fill: 'forwards', unlight: ['pvc'] }),
      F.route({ points: W_BO_RE, delay: 620 + BEAT.afterHop, lights: ['stReleased'] }),
    ],
  },
  {
    id: 'reclaim-delete',
    duration: 3600,
    narration: 'Now the PV controller reads the reclaim policy on the released volume. Under Delete, the default for anything dynamically provisioned, it calls DeleteVolume on the driver, and on success both the storage asset and the PersistentVolume object itself are removed. Released is where this volume ends its life rather than a phase it passes through.',
    chipsCued: chips('none, object gone', 'gone with the PV', 'Delete', 'deleted'),
    wires: { verdict: 'PV object removed' },
    opacity: CTRL_UP,
    // The controller sends the ball, so only the controller is lit to begin with. Released is the
    // destination and waits for the call to land on it.
    lit: ['ctrl'],
    flow: [
      F.route({ points: W_RECLAIM, name: 'call' }),
      F.tag({ text: 'DeleteVolume', points: W_RECLAIM }),
      F.light({ targets: ['stReleased'], at: 'call' }),
    ],
  },
  {
    id: 'reclaim-failed',
    duration: 3600,
    narration: 'Take that same call and let the backend reject it. The volume has failed its automated reclamation, so it moves to Failed. This is where automatic cleanup gives up, and the volume sits in Failed until a person works out what went wrong and sorts it out by hand.',
    chipsCued: chips('Failed', 'default/data stale', 'Delete', 'exists'),
    wires: { fail: 'reclaim error' },
    opacity: CTRL_UP,
    lit: ['ctrl'],
    flow: [
      F.route({ points: W_RECLAIM, name: 'call' }),
      F.tag({ text: 'DeleteVolume rejected', points: W_RECLAIM }),
      F.light({ targets: ['stReleased'], at: 'call' }),
      F.route({ points: W_RE_FA, after: 'call', lights: ['stFailed'] }),
    ],
  },
  {
    id: 'retain-parked',
    duration: 3200,
    narration: 'Set the policy to Retain, the default for a volume you create by hand, and the controller makes no call at all. Nothing errors, so nothing moves: the volume parks in Released holding the stale claimRef, and every fresh claim that asks for it is skipped. The data is intact and completely out of reach.',
    chipsCued: chips('Released', 'default/data stale', 'Retain', 'exists'),
    wires: { verdict: 'no DeleteVolume call' },
    opacity: CTRL_UP,
    lit: ['ctrl'],
    // The policy read still happens, and it is the SECOND act that never comes: the lane on to
    // Failed is drawn and stays empty, which is Retain shown as an absence rather than as a gap.
    flow: [
      F.route({ points: W_RECLAIM, name: 'call' }),
      F.tag({ text: 'policy: Retain', points: W_RECLAIM }),
      F.light({ targets: ['stReleased'], at: 'call' }),
    ],
  },
  {
    id: 'recover',
    duration: 3400,
    narration: 'The only edge that leads back is manual. An administrator patches the PV and removes the stale claimRef, and with no reference left the volume returns to Available and can be bound again. Every other transition here happens on its own, this is the one that needs a person.',
    chipsCued: chips('Available', 'cleared', 'Retain', 'exists'),
    wires: { recover: 'claimRef cleared, Available again' },
    opacity: ADMIN_UP,
    lit: ['admin'],
    // Both cues stand after their tag, so neither can be written as `lights` on its route.
    flow: [
      F.route({ points: W_ADMIN, name: 'patch' }),
      F.tag({ text: 'claimRef: null', points: W_ADMIN }),
      F.light({ targets: ['stReleased'], at: 'patch' }),
      F.route({ points: W_RECOVER, after: 'patch', name: 'back' }),
      F.tag({ text: 'back to Available', points: W_RECOVER, after: 'patch' }),
      F.light({ targets: ['stAvail'], at: 'back' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
