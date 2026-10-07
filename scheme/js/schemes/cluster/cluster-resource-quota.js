import { LANE_DY, P, F, defineCard, laneY, ladder, strip, midX, CLU, OPACITY, REVEAL_MS } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-resource-quota.md

// One bar whose width IS spec.hard (720 units per CPU), slots filling left to right, the refused
// request drawn past the edge.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;

// One three-column grid shared top to bottom. One column is the 500m every Pod asks for.
const COLS = 3;
const COL = strip({ from: CONTENT_L, to: CONTENT_R, count: COLS, gap: 0 });
const COL_W = COL.w;
const COL_CX = i => COL.x(i) + COL_W / 2;

// The actor pair straddles the canvas centre.
const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
const PAIR_GAP = 56;
const RS_R = CLU.CX - PAIR_GAP / 2, RS_X = RS_R - BOX_W;
const API_X = CLU.CX + PAIR_GAP / 2, API_R = API_X + BOX_W;
const { out: OUT_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);

// The gap is too narrow for a label: the request wire sits above the row, the answer below.
const WIRE_REQ_Y = TOP_Y - 14;
const WIRE_ACK_Y = TOP_BOTTOM + 20;
const WIRE_RA_X = midX(RS_R, API_X);

const RS_TO_API = [[RS_R, OUT_Y], [API_X, OUT_Y]];
const API_TO_RS = [[API_X, BACK_Y], [RS_R, BACK_Y]];

// No ball rides the API-to-ladder tie: the five stages ARE the API.
const LADDER_X = COL.x(2), LADDER_W = COL_W;
const LADDER_CX = COL_CX(2);
const ROWS = 5, ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;
const LADDER_Y = 152;
const LADDER_BOTTOM = LADDER_Y + ROWS * ROW_H + (ROWS - 1) * ROW_GAP;
const LADDER_CY = midX(LADDER_Y, LADDER_BOTTOM);
const API_TO_CHAIN = [[API_R, TOP_CY], [LADDER_CX, TOP_CY], [LADDER_CX, LADDER_Y]];

// A curly brace grouping the two LimitRanger rows, nose at mid height.
const braceD = (x, y1, y2, q) =>
  `M ${x} ${y1} q ${-q} 0 ${-q} ${q} v ${(y2 - y1) / 2 - q * 2} q 0 ${q} ${-q} ${q}` +
  ` q ${q} 0 ${q} ${q} v ${(y2 - y1) / 2 - q * 2} q 0 ${q} ${q} ${q}`;
const BRACE_Q = 30, BRACE_R = LADDER_X - 12;
const BRACE_TIP = BRACE_R - BRACE_Q * 2;

// An object the pipeline reads, not an actor: it stands on the ladder mid line against the brace nose.
const LR_X = 420, LR_W = BOX_W;
const LR_H = BOX_H;
const LR_CY = LADDER_CY;
const LR_Y = LR_CY - LR_H / 2;
const LR_TO_BRACE = [[LR_X + LR_W, LR_CY], [BRACE_TIP, LR_CY]];

// The bar is two columns (spec.hard 1) and the refused request the third, so drawing and arithmetic agree.
const CPU_W = COL_W * 2, REQ_W = COL_W;
const BAR_X = COL.x(0), BAR_W = CPU_W;
const BAR_Y = 406, BAR_H = 64;
const BAR_R = BAR_X + BAR_W;                             // the hard edge
const SLOT_X = i => COL.x(i);
const OVER_X = COL.x(2), OVER_W = REQ_W;                 // past the ceiling
const CAP_Y = BAR_Y - 10;

const CHIP_H = CLU.CHIP_H, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = 548;                                     // second row ends on 624

// One status cell under each request, so a column reads as one Pod.
const CELL_GAP = 12;
const CELL_W = COL_W - CELL_GAP, CELL_H = 34;
const CELL_X = i => COL_CX(i) - CELL_W / 2;
const CELL_Y = BAR_Y + BAR_H + CHIP_VGAP;
// The refusal reason sits under the refused column's cell.
const OVER_Y = CELL_Y + CELL_H + 20;
const OVER_CX = COL_CX(2);
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is read as a GRID: the index wraps across the two columns and steps down every second.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

const REQ_500 = 'requests.cpu 500m';
const HARD = 'requests.cpu 1';
const POST_WEB2 = 'POST pod web-2 · requests.cpu 500m';
const OVER_WHY = 'used 1 plus 500m is over hard 1';
const FORBIDDEN = 'HTTP 403 Forbidden · exceeded quota';

// Stroke only, so the box fill does not double over the bar. Dashed: a request that never became an object.
const budgetFill = (dashed) => (el) => {
  const r = el.querySelector('.scheme-box-rect');
  if (!r) return;
  r.style.fill = 'transparent';
  if (dashed) r.style.strokeDasharray = '5 5';
};
const budgetBlock = ({ key, x, w, label, dashed = false }) => P.box({
  key, x, y: BAR_Y, w, h: BAR_H, rx: 6, label, sublabel: REQ_500, opacity: 0, tune: budgetFill(dashed),
});

// Parts order is z-order: ladder and LimitRange above the packet layer, the actors last.
export const SCENE = {
  'aria-label': 'ResourceQuota and LimitRange: four admission rows and a write, where LimitRanger injects the cpu request the Pod template never named and ResourceQuota then checks the running sum against spec.hard, so the third Pod is refused past the ceiling of a budget bar and the 403 lands on the ReplicaSet that asked for it',
  parts: [
    P.defs(),
    P.relation({ points: API_TO_CHAIN }),
    P.relation({ key: 'lrLine', points: LR_TO_BRACE }),
    P.relation({ key: 'lrBrace', d: braceD(BRACE_R, LADDER_Y, LADDER_BOTTOM, BRACE_Q) }),
    P.box({ key: 'bar', x: BAR_X, y: BAR_Y, w: BAR_W, h: BAR_H, rx: 6 }),
    P.tag({ x: BAR_X, y: CAP_Y, anchor: 'start', text: 'ResourceQuota team-quota · namespace team-a' }),
    P.tag({ x: BAR_R, y: CAP_Y, text: 'spec.hard 1' }),
    budgetBlock({ key: 'slot0', x: SLOT_X(0), w: REQ_W, label: 'web-1' }),
    budgetBlock({ key: 'slot1', x: SLOT_X(1), w: REQ_W, label: 'web-2' }),
    budgetBlock({ key: 'over', x: OVER_X, w: OVER_W, label: 'web-3', dashed: true }),
    P.wire({ key: 'over', x: OVER_CX, y: OVER_Y }),
    // Status only: the Pod name is on the block above.
    ...[0, 1, 2].map(i =>
      P.box({ key: `list${i}`, x: CELL_X(i), y: CELL_Y, w: CELL_W, h: CELL_H, label: 'Not created yet' })),
    ...[RS_TO_API, API_TO_RS].map(p => P.arrow({ from: p[0], to: p[1], dim: true, dashed: true })),
    P.wire({ key: 'req', x: WIRE_RA_X, y: WIRE_REQ_Y }),
    P.wire({ key: 'ack', x: WIRE_RA_X, y: WIRE_ACK_Y }),
    P.chip({ key: 'hardChip',  x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'spec.hard',      value: 'requests.cpu 1' }),
    P.chip({ key: 'usedChip',  x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'status.used',    value: 'requests.cpu 0' }),
    P.chip({ key: 'admitChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'last admission', value: 'none' }),
    P.chip({ key: 'rsChip',    x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'ReplicaSet web', value: '3 desired · 0 created' }),
    P.packets(),
    P.chain({
      key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. mutating    ·  LimitRanger sets defaultRequest',
        '2. validating  ·  LimitRanger checks min and max',
        '3. validating  ·  webhooks and policies get a say',
        '4. validating  ·  ResourceQuota runs after them all',
        '5. persist     ·  the Pod object is written to ETCD',
      ],
    }),
    P.box({ key: 'lr', x: LR_X, y: LR_Y, w: LR_W, h: LR_H, label: 'LimitRange', sublabel: 'defaultRequest.cpu 500m' }),
    P.box({ key: 'rs',  x: RS_X,  y: TOP_Y, w: BOX_W, h: BOX_H, label: 'ReplicaSet web', sublabel: 'spec.replicas 3' }),
    P.box({ key: 'api', x: API_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API',            sublabel: 'admission pipeline' }),
  ],
  reset: {
    keys: [
      'rs', 'api', 'lr', 'bar', 'slot0', 'slot1', 'over',
      'list0', 'list1', 'list2',
      'hardChip', 'usedChip', 'admitChip', 'rsChip',
    ],
  },
};

// Every step writes every chip (P-01).
const chipsOf = (used, admission, rs) => ({ hardChip: HARD, usedChip: used, admitChip: admission, rsChip: rs });

// One helper pins the budget blocks and the LimitRange with its lanes, one place per shade (A-16).
const budget = ({ slot0 = null, slot1 = null, over = null }) => {
  const labels = {}, sublabels = {}, opacity = {};
  for (const [key, spec] of [['slot0', slot0], ['slot1', slot1], ['over', over]]) {
    if (!spec) { opacity[key] = 0; continue; }
    labels[key] = spec.label;
    sublabels[key] = spec.sublabel;
    opacity[key] = spec.opacity === undefined ? 1 : spec.opacity;
  }
  opacity.lr = 1;
  opacity.lrLine = 1;
  opacity.lrBrace = 1;
  return { labels, sublabels, opacity };
};
const EMPTY_BAR = budget({});
const SLOT_A = { label: 'web-1', sublabel: REQ_500 }, SLOT_B = { label: 'web-2', sublabel: REQ_500 };
const REFUSED = budget({ slot0: SLOT_A, slot1: SLOT_B, over: { label: 'web-3', sublabel: REQ_500, opacity: OPACITY.pending } });

const PENDING_CELL = { label: 'Not created yet', opacity: OPACITY.pending };
const PENDING_POD_CELL = { label: 'Pending',      opacity: 1 };
const ABSENT_CELL  = { label: 'No Pod object',   opacity: OPACITY.terminated };

// One cell per desired replica, every cell written on every step.
const listing = (cells) => ({
  labels: Object.fromEntries(cells.map((c, i) => [`list${i}`, c.label])),
  opacity: Object.fromEntries(cells.map((c, i) => [`list${i}`, c.opacity])),
});
const NONE_YET = listing([PENDING_CELL, PENDING_CELL, PENDING_CELL]);
const THIRD_MISSING = listing([PENDING_POD_CELL, PENDING_POD_CELL, ABSENT_CELL]);

const stateOf = (bar, list) => ({
  labels: { ...bar.labels, ...list.labels },
  sublabels: bar.sublabels,
  opacity: { ...bar.opacity, ...list.opacity },
});
const IDLE = stateOf(EMPTY_BAR, NONE_YET);
// The quota is charged at admission (row 4), the cells are what persist leaves (row 5).
const CHARGED = stateOf(REFUSED, NONE_YET);
const WRITTEN = stateOf(REFUSED, THIRD_MISSING);

const INJECTED = 'mutating · requests.cpu 500m injected';
const WITHIN = 'validating · within min and max';
const NO_OBJECTION = 'validating · no policy objected';
const ADMIT_BOTH = 'admitted · web-1 and web-2';
const REFUSED_403 = '403 · exceeded quota';
const NOT_CREATED = '3 desired · 0 created';
const POST_WEB3 = 'POST pod web-3 · requests.cpu 500m';

// Step N lights ladder row N.
export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: chipsOf('requests.cpu 0', 'none', NOT_CREATED),
    ...IDLE,
    chain: -1,
  },
  {
    id: 'mutating',
    duration: 3200,
    narration: 'The Pod template names no cpu at all, so LimitRanger rewrites it here, in the one phase where the object can still be changed, and sets defaultRequest.cpu 500m. That injection is structural rather than convenient: once a quota constrains requests.cpu, a Pod naming neither requests nor limits is a Pod the quota cannot count.',
    chips: chipsOf('requests.cpu 0', INJECTED, NOT_CREATED),
    ...IDLE,
    wires: { req: 'POST pod web-1 · no cpu named' },
    lit: ['rs', 'lr', 'admitChip'],
    chain: [0],
    rewind: { chips: { admitChip: 'none' } },
    flow: [
      F.segment({ from: RS_TO_API[0], to: RS_TO_API[1], name: 'req', lights: ['api'] }),
      F.set({ at: 'req', chips: { admitChip: INJECTED } }),
    ],
  },
  {
    id: 'limits',
    duration: 2600,
    narration: 'LimitRanger is back in the validating phase, and this time it may only refuse. It checks the request it just injected against min, max and maxLimitRequestRatio, so one plugin sits at two positions in the chain and does a different job at each.',
    chips: chipsOf('requests.cpu 0', WITHIN, NOT_CREATED),
    ...IDLE,
    lit: ['lr', 'admitChip'],
    chain: [1],
  },
  {
    id: 'policies',
    duration: 2600,
    narration: 'Validating webhooks and ValidatingAdmissionPolicy get their say next, calling out over HTTPS or running in process. None of them may mutate the object any more, and a single deny ends the request before the quota is ever consulted. The Admission Chain card owns this stage.',
    chips: chipsOf('requests.cpu 0', NO_OBJECTION, NOT_CREATED),
    ...IDLE,
    lit: ['api', 'admitChip'],
    chain: [2],
  },
  {
    id: 'quota',
    duration: 5600,
    narration: 'ResourceQuota runs after all of them. The field spec.hard is the ceiling and status.used is the running sum, so web-1 fits because 0 plus 500m is inside requests.cpu 1, and admission itself adds that 500m to used. Pod web-2 lands the sum exactly on the ceiling. Pod web-3 would take it to 1.5, so admission answers 403 with exceeded quota.',
    chips: chipsOf('requests.cpu 1', REFUSED_403, NOT_CREATED),
    ...CHARGED,
    wires: { req: POST_WEB3, over: OVER_WHY },
    lit: ['rs', 'bar', 'slot0', 'slot1', 'over', 'hardChip', 'usedChip', 'admitChip'],
    chain: [3],
    rewind: {
      chips: { usedChip: 'requests.cpu 0', admitChip: NO_OBJECTION },
      wires: { req: ' ', over: ' ' },
      opacity: { slot1: 0, over: 0 },
    },
    flow: [
      F.reveal({ target: 'slot0' }),
      F.set({
        delay: REVEAL_MS,
        chips: { usedChip: REQ_500, admitChip: 'admitted · web-1' },
        wires: { req: POST_WEB2 },
      }),
      F.segment({ from: RS_TO_API[0], to: RS_TO_API[1], delay: REVEAL_MS, name: 'two', lights: ['api'] }),
      F.reveal({ target: 'slot1', at: 'two' }),
      F.set({ at: 'two', chips: { usedChip: HARD, admitChip: ADMIT_BOTH }, wires: { req: POST_WEB3 } }),
      F.segment({ from: RS_TO_API[0], to: RS_TO_API[1], after: 'two', name: 'three', lights: ['api'] }),
      // A fade, not F.reveal: reveal always lands on 1 and this block lands on the pending shade.
      F.fade({ target: 'over', from: 0, to: OPACITY.pending, dur: REVEAL_MS, at: 'three', fill: 'forwards', easing: 'ease-out' }),
      F.set({ at: 'three', chips: { admitChip: REFUSED_403 }, wires: { over: OVER_WHY } }),
    ],
  },
  {
    id: 'persist',
    duration: 4200,
    narration: 'Only what admission passed is written. Two Pod objects reach ETCD and kubectl get pods -n team-a lists them, and there is no third object to list or to describe. The ReplicaSet asked for it, so the ReplicaSet is what hears the refusal, as a FailedCreate event and a ReplicaFailure condition.',
    chips: chipsOf('requests.cpu 1', REFUSED_403, 'ReplicaFailure · FailedCreate'),
    ...WRITTEN,
    wires: { req: POST_WEB3, over: OVER_WHY, ack: FORBIDDEN },
    lit: ['api', 'bar', 'slot0', 'slot1', 'over', 'usedChip', 'rsChip'],
    chain: [4],
    rewind: {
      chips: { rsChip: NOT_CREATED },
      wires: { ack: ' ' },
      labels: { list0: PENDING_CELL.label, list1: PENDING_CELL.label, list2: PENDING_CELL.label },
      opacity: { list0: OPACITY.pending, list1: OPACITY.pending, list2: OPACITY.pending },
    },
    flow: [
      F.set({
        labels: { list0: PENDING_POD_CELL.label, list1: PENDING_POD_CELL.label },
        opacity: { list0: PENDING_POD_CELL.opacity, list1: PENDING_POD_CELL.opacity },
        chips: { rsChip: '3 desired · 2 created' },
      }),
      F.set({
        delay: REVEAL_MS,
        labels: { list2: ABSENT_CELL.label },
        opacity: { list2: ABSENT_CELL.opacity },
      }),
      F.segment({ from: API_TO_RS[0], to: API_TO_RS[1], delay: REVEAL_MS, name: 'ack', lights: ['rs'] }),
      F.set({ at: 'ack', chips: { rsChip: 'ReplicaFailure · FailedCreate' }, wires: { ack: FORBIDDEN } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
