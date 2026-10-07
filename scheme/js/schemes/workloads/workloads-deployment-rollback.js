import { P, F, defineCard, spread, WL, LAYOUT, BEAT, FADE, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-deployment-rollback.md

// Two registers of one set: the ReplicaSets that exist, in creation order, and the list
// kubectl rollout history prints, in revision order. The connectors braid after the rollback.
const PANEL_B = 230;

// Centred on WL.SPINE_X so the trunk leaves a face midpoint (WL.L-07).
const DEP_W = 232, DEP_X = WL.CX - DEP_W / 2;

// Every write lands on a ReplicaSet, so the rail feeds the shelf and never the register.
const RAIL_Y = PANEL_B + 42;
const SLOT_N = 4;
const RS_W = 232, RS_Y = 330, RS_H = 80;
// Fixed tile width, derived gap: spread, not strip.
const SLOT = spread({ from: WL.L, to: WL.R, count: SLOT_N, w: RS_W });
const SLOT_CX = i => SLOT.x(i) + RS_W / 2;

// A cell is centred on its slot, so while the orders agree every connector is a plain vertical.
// Smaller than an object so the list does not read as a second shelf.
const REG_W = 150, REG_Y = 528, REG_H = 42;
const REG_CX = i => SLOT_CX(i);
const REG_X = i => REG_CX(i) - REG_W / 2;
const CAP_Y = REG_Y - 12;

const TRUNK = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, RAIL_Y]];
const BUS = [[SLOT_CX(0), RAIL_Y], [SLOT_CX(3), RAIL_Y]];
const TAP = i => [[SLOT_CX(i), RAIL_Y], [SLOT_CX(i), RS_Y]];
// The same points feed the drawn lanes and the ball (A-02).
const LANE = i => [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, RAIL_Y], [SLOT_CX(i), RAIL_Y], [SLOT_CX(i), RS_Y]];

// The one ascending route: `undo` reads a frozen template into the Deployment, on a lane of its
// own (A-03) entering the owner's left face. Shown on `undo` alone.
const READ_X = 425;
const READ_CY = WL.TOP_Y + WL.BOX_H / 2;
const READ = [[READ_X, RS_Y], [READ_X, READ_CY], [DEP_X, READ_CY]];

// Connectors are relations, not lanes (A-06). A crossing is an elbow through `mid` (L-09) and steps
// off centre left at the object, right at the cell, so two descents in one column never coincide.
const DX_OUT = -24, DX_IN = 18;
const CONN = [
  { cell: 0, slot: 0 },
  { cell: 1, slot: 1 },
  { cell: 2, slot: 2 },
  { cell: 3, slot: 3 },
  { cell: 1, slot: 2, mid: 462 },
  { cell: 2, slot: 3, mid: 486 },
  { cell: 3, slot: 1, mid: 438 },
];
const connKey = c => `k${c.cell + 1}${c.slot + 1}`;
const connPts = (c) => {
  const cross = c.mid !== undefined;
  const top = [SLOT_CX(c.slot) + (cross ? DX_OUT : 0), RS_Y + RS_H];
  const bot = [REG_CX(c.cell) + (cross ? DX_IN : 0), REG_Y];
  return cross ? [top, [top[0], c.mid], [bot[0], c.mid], bot] : [top, bot];
};

// Bottom chip strip (WL.L-05), LAYOUT.C read for the strip width only.
const CHIP_W = LAYOUT.C.strip.two, CHIP_GAP = 16;
const CHIP_X = i => WL.L + i * (CHIP_W + CHIP_GAP);
const CHIP_Y = 590;

// Trunk and bus carry balls, so they are lanes, but the one arrowhead per run belongs on the tap.
const busPath = (key, points) => P.lane({
  key, points, dim: true, dashed: true, role: 'cluster',
  tune: (el) => el.removeAttribute('marker-end'),
});

// A ReplicaSet is named by its pod-template-hash. The revision lives only in the register,
// as it is an annotation in the API.
const BORN = [
  { name: 'web-7bd5', image: 'app:v1.0' },
  { name: 'web-5f2j', image: 'app:v1.4' },
  { name: 'web-6b8d', image: 'app:v2.0' },
  { name: 'web-9f2k', image: 'app:v3.0' },
];

const LIMIT = '2 on this Deployment, 10 by default';
// What the cleanup on `prune` waits for, not Available.
const COMPLETE = 'Progressing=True · NewReplicaSetAvailable';

// Keys are positions, never revision numbers: the numbers move.
const slotKey = i => 'slot' + (i + 1);
const rsKey = i => 'rs' + (i + 1);
const regKey = i => 'reg' + (i + 1);
const CONN_BY = Object.fromEntries(CONN.map(c => [c.cell + ':' + c.slot, connKey(c)]));

// Z-order: lanes, connectors, wires and chips, then the packet layer, then the boxes above the ball.
export const SCENE = {
  'aria-label': 'Deployment rollback and revision history, drawn as two registers of one set: a row of ReplicaSets named by their pod-template-hash in creation order, and under it the list kubectl rollout history prints in revision order, joined by one connector per live revision. A bad rollout adds revision 4, an undo to revision 2 copies that stored template back into the Deployment, and the matching ReplicaSet is reused and annotated revision 5 instead of a new one being created, so the connectors cross and the newest revision points at an object created long before it. The controller then deletes the oldest ReplicaSet to get back under revisionHistoryLimit, 2 on this Deployment and 10 by default, and revision 1 leaves the list with the object',
  parts: [
    P.defs(),
    busPath('trunk', TRUNK),
    busPath('bus', BUS),
    ...[0, 1, 2, 3].map(i => P.lane({ key: 'tap' + (i + 1), points: TAP(i), dim: true, dashed: true, role: 'cluster' })),
    P.lane({ key: 'read', points: READ, dim: true, dashed: true, role: 'cluster' }),
    ...CONN.map(c => P.relation({ key: connKey(c), points: connPts(c), role: 'cluster' })),
    P.wire({ key: 'act', x: WL.SPINE_X + 16, y: 208, anchor: 'start' }),
    // A deleted slot alone reads as dim, not gone: this wire is its positive mark.
    P.wire({ key: 'gone', x: REG_CX(0), y: REG_Y + REG_H / 2 + 4 }),
    P.chip({ key: 'limitChip', x: CHIP_X(0), y: CHIP_Y, w: CHIP_W, h: WL.CHIP_H, name: 'revisionHistoryLimit', value: LIMIT }),
    P.chip({ key: 'condChip', x: CHIP_X(1), y: CHIP_Y, w: CHIP_W, h: WL.CHIP_H, name: 'condition', value: 'Available=True' }),
    P.packets(),
    // The shelf axis is creation order, never `older`/`newer`, which would read as revision order.
    P.tag({ x: SLOT.x(0) + 52, y: RAIL_Y + 4, text: 'created first' }),
    P.tag({ x: SLOT.x(3) + RS_W - 52, y: RAIL_Y + 4, text: 'created last' }),
    P.tag({ x: WL.CX, y: CAP_Y, text: 'kubectl rollout history' }),
    ...BORN.map((b, i) => P.group({
      key: slotKey(i),
      parts: [P.box({ key: rsKey(i), x: SLOT.x(i), y: RS_Y, w: RS_W, h: RS_H, label: b.name, sublabel: 'replicas 0 · ' + b.image, role: 'cluster' })],
    })),
    ...[0, 1, 2, 3].map(i => P.box({ key: regKey(i), x: REG_X(i), y: REG_Y, w: REG_W, h: REG_H, label: 'Revision ' + (i + 1), role: 'cluster' })),
    P.box({ key: 'dep', x: DEP_X, y: WL.TOP_Y, w: DEP_W, h: WL.BOX_H, label: 'Deployment web', sublabel: 'template app:v2.0 · hash 6b8d', role: 'cluster' }),
  ],
  reset: {
    keys: ['dep', 'rs1', 'rs2', 'rs3', 'rs4', 'reg1', 'reg2', 'reg3', 'reg4', 'limitChip', 'condChip'],
    pods: [],
  },
};

// A tap or connector follows its object only below `notready`, where it is gone (A-13, A-14).
const laneOp = op => (op < OPACITY.notready ? op : 1);

// One writer for registers and connectors so they cannot disagree. `slots` in creation order,
// `rows` in revision order (null past the list end). `read` lives here because an `opacity`
// written beside the spread is overwritten by it.
const board = (depTpl, slots, rows, read) => {
  const labels = {}, sublabels = { dep: depTpl }, opacity = { read: read ? 1 : 0 };
  slots.forEach((st, i) => {
    labels[rsKey(i)] = BORN[i].name;
    sublabels[rsKey(i)] = (st.sub || 'replicas ' + st.replicas) + ' · ' + BORN[i].image;
    opacity[slotKey(i)] = st.op;
    opacity['tap' + (i + 1)] = laneOp(st.op);
  });
  for (const c of CONN) opacity[connKey(c)] = 0;
  rows.forEach((row, i) => {
    opacity[regKey(i)] = row ? 1 : 0;
    if (!row) return;
    labels[regKey(i)] = 'Revision ' + row.rev;
    opacity[CONN_BY[i + ':' + row.slot]] = laneOp(slots[row.slot].op);
  });
  return { labels, sublabels, opacity };
};

const ABSENT = { op: 0, replicas: 0 };
const KEPT = { op: OPACITY.notready, replicas: 0 };      // scaled to zero, kept for rollback
// The rollback target stands full strength with no Pods: a highlight on a dimmed block argues.
const SELECTED = { op: 1, replicas: 0 };
const SERVING = { op: 1, replicas: 3 };
const SURGED = { op: 1, replicas: 1 };
const STALLED = { op: OPACITY.notready, replicas: 1 };   // never Ready
// A deleted object has no replica count, so `sub` replaces it.
const DELETED = { op: OPACITY.terminated, replicas: 0, sub: 'deleted' };
const ZEROED = { op: OPACITY.notready, replicas: 0 };

// One entry per cell: `slot` is the position of the object carrying that revision.
const r = (rev, slot) => ({ rev, slot });
const HIST_BEFORE = [r(1, 0), r(2, 1), r(3, 2), null];
const HIST_ROLLED = [r(1, 0), r(2, 1), r(3, 2), r(4, 3)];
const HIST_AFTER = [r(1, 0), r(3, 2), r(4, 3), r(5, 1)];
const HIST_PRUNED = [null, r(3, 2), r(4, 3), r(5, 1)];

const TPL_V2 = 'template app:v2.0 · hash 6b8d';
const TPL_V3 = 'template app:v3.0 · hash 9f2k';
const TPL_V14 = 'template app:v1.4 · hash 5f2j';
const GONE = 'revision 1 unreachable';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { limitChip: LIMIT, condChip: 'Available=True' },
    ...board(TPL_V2, [KEPT, KEPT, SERVING, ABSENT], HIST_BEFORE),
  },
  {
    id: 'roll',
    duration: 2800,
    narration: 'A revision is not a snapshot the Deployment keeps, it is one of these ReplicaSets. You run kubectl set image, the template hash changes, and no ReplicaSet carries that hash, so the controller creates one and annotates it revision 4. A fourth row joins rollout history, pointing at the object that carries the number.',
    chips: { limitChip: LIMIT, condChip: 'Progressing=True' },
    wires: { act: 'create ReplicaSet · annotate revision 4' },
    ...board(TPL_V3, [KEPT, KEPT, SERVING, SURGED], HIST_ROLLED),
    lit: ['dep', 'condChip'],
    // Slot and row rise on the create arrival. The tap is not wound back: it carries the ball.
    rewind: { opacity: { slot4: 0, reg4: 0, k44: 0 } },
    flow: [
      F.route({ points: LANE(3), name: 'create', lights: ['rs4', 'reg4'] }),
      F.fade({ target: 'slot4', from: 0, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'reg4', from: 0, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'k44', from: 0, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
    ],
  },
  {
    id: 'bad',
    duration: 2700,
    narration: 'Revision 4 is broken. Its ReplicaSet never reaches its Ready count, so the rollout makes no progress, and once progressDeadlineSeconds has elapsed the Deployment reports Progressing=False with the reason ProgressDeadlineExceeded. The ReplicaSet holding app:v2.0 is still the one serving.',
    chips: { limitChip: LIMIT, condChip: 'Progressing=False · ProgressDeadlineExceeded' },
    ...board(TPL_V3, [KEPT, KEPT, SERVING, STALLED], HIST_ROLLED),
    // An object is always lit with its register row.
    lit: ['condChip', 'rs3', 'reg3'],
    // Nothing travels: the deadline lapses. The tap and connector stay, a stalled RS still exists.
    rewind: { opacity: { slot4: 1 } },
    flow: [
      F.fade({ target: 'slot4', from: 1, to: OPACITY.notready, dur: FADE.out, delay: 600, fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'undo',
    duration: 3200,
    narration: 'Running kubectl rollout undo steps back one revision by default, and --to-revision names any revision still in the list. Here it takes revision 2, which copies the template that ReplicaSet froze back into .spec.template. Nothing is created or deleted, and the history has not moved yet.',
    chips: { limitChip: LIMIT, condChip: 'Progressing=False · ProgressDeadlineExceeded' },
    wires: { act: 'rollout undo · patch .spec.template' },
    ...board(TPL_V14, [KEPT, SELECTED, SERVING, STALLED], HIST_ROLLED, true),
    // The sender is lit at entry (M-18a).
    lit: ['rs2', 'reg2'],
    // The template changes on the read arrival, not at step entry.
    rewind: { sublabels: { dep: TPL_V3 } },
    flow: [
      // BEAT.lead: the M-18 wait for a block that acts first.
      F.route({ points: READ, name: 'read', delay: BEAT.lead, lights: ['dep'] }),
      F.set({ at: 'read', sublabels: { dep: TPL_V14 } }),
    ],
  },
  {
    id: 'reuse',
    duration: 3600,
    narration: 'The restored hash matches a ReplicaSet already on the shelf, so no fifth one is made. The controller annotates that object revision 5, scales it up and the two newer ones to zero. Revision 2 leaves the list, revision 5 joins the end, and the connectors cross: the newest revision points at an object created long before it.',
    chips: { limitChip: LIMIT, condChip: 'Progressing=True' },
    wires: { act: 'scale writes · annotate revision 5' },
    ...board(TPL_V14, [KEPT, SERVING, ZEROED, ZEROED], HIST_AFTER),
    lit: ['dep', 'condChip'],
    // Wound back to what `undo` left so the renumber lands. Taps carry balls and stay (A-15).
    rewind: {
      // slot 2 is not wound back: `undo` left it bright, and a dip here blinks.
      opacity: {
        slot3: 1,
        k22: 1, k33: 1, k44: 1, k23: 0, k34: 0, k42: 0,
      },
      labels: { reg2: 'Revision 2', reg3: 'Revision 3', reg4: 'Revision 4' },
      sublabels: { rs2: 'replicas 0 · app:v1.4', rs3: 'replicas 3 · app:v2.0', rs4: 'replicas 1 · app:v3.0' },
    },
    flow: [
      // Three scale writes drawn as one act, not one controller sync (see the record before editing).
      // Every arrival marks its receiver, dim or not.
      F.route({ points: LANE(1), name: 'up', lights: ['rs2', 'reg4'] }),
      // Each object is lit with the row it carries after the renumber.
      F.route({ points: LANE(2), name: 'zero3', lights: ['rs3', 'reg2'] }),
      F.route({ points: LANE(3), name: 'zero4', lights: ['rs4', 'reg3'] }),
      // The renumber is one beat: the annotation and the scale-up are the same write.
      F.set({ at: 'up', sublabels: { rs2: 'replicas 3 · app:v1.4' }, labels: { reg2: 'Revision 3', reg3: 'Revision 4', reg4: 'Revision 5' } }),
      F.set({ at: 'zero3', sublabels: { rs3: 'replicas 0 · app:v2.0' } }),
      F.set({ at: 'zero4', sublabels: { rs4: 'replicas 0 · app:v3.0' } }),
      F.fade({ target: 'slot3', from: 1, to: OPACITY.notready, dur: FADE.out, at: 'zero3', fill: 'both', easing: 'ease-in' }),
      // The braid swaps on the renumber beat, as one event.
      F.fade({ target: 'k22', from: 1, to: 0, dur: FADE.out, at: 'up', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'k33', from: 1, to: 0, dur: FADE.out, at: 'up', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'k44', from: 1, to: 0, dur: FADE.out, at: 'up', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'k23', from: 0, to: 1, dur: FADE.in, at: 'up', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'k34', from: 0, to: 1, dur: FADE.in, at: 'up', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'k42', from: 0, to: 1, dur: FADE.in, at: 'up', fill: 'both', easing: 'ease-out' }),
    ],
  },
  {
    id: 'prune',
    duration: 2800,
    narration: 'Three old ReplicaSets now sit at zero, one more than revisionHistoryLimit allows. It is 2 on this Deployment and 10 by default, and once the rollout completes the controller deletes the oldest. The object goes and its row leaves the list with it, so revision 1 can no longer be reached.',
    chips: { limitChip: LIMIT, condChip: COMPLETE },
    wires: { act: 'delete the oldest ReplicaSet', gone: GONE },
    ...board(TPL_V14, [DELETED, SERVING, ZEROED, ZEROED], HIST_PRUNED),
    lit: ['dep', 'limitChip', 'condChip'],
    // Nothing reads deleted until the delete ball lands (A-14).
    rewind: {
      opacity: { slot1: OPACITY.notready, tap1: 1, reg1: 1, k11: 1 },
      sublabels: { rs1: 'replicas 0 · app:v1.0' },
      wires: { gone: '' },
    },
    flow: [
      F.route({ points: LANE(0), name: 'del', lights: ['rs1'] }),
      F.set({ at: 'del', sublabels: { rs1: 'deleted · app:v1.0' }, wires: { gone: GONE } }),
      F.fade({ target: 'slot1', from: OPACITY.notready, to: OPACITY.terminated, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'tap1', from: 1, to: OPACITY.terminated, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
      // The history row goes with the object: an entry is the object being there.
      F.fade({ target: 'reg1', from: 1, to: 0, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'k11', from: 1, to: 0, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
