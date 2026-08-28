import { P, F, defineCard, laneY, ladder, strip, midX, CLU, OPACITY, REVEAL_MS } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-resource-quota.md

// A budget that ACCUMULATES: one bar whose width IS spec.hard, slots filling left to right, and the
// refused request drawn past the edge. Scale exact at 720 units per CPU. CEILING 460 characters.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
// Reserved narration corner: 397 x 255, the worst of the three viewports. Nothing derives from it,
// and the per-viewport measurement is in ./CARDS/cluster-resource-quota.md.

// ONE grid for the whole card, three equal columns over the content band, shared top to bottom.
// Column 0 is the panel's column above and the first slot of the budget below, so nothing floats.
const COLS = 3;
const COL = strip({ from: CONTENT_L, to: CONTENT_R, count: COLS, gap: 0 });
const COL_W = COL.w;                                     // 360, at 60 / 420 / 780
const COL_CX = i => COL.x(i) + COL_W / 2;                // 240 / 600 / 960

// TWO actors at the family 232 with the family 56 between them, taken as a PAIR and pushed as far
// toward the canvas centre as L-03 allows. The LimitRange is not an actor and sits under the pair.
const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;              // 232 / 80
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;     // 40 / 120
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);                  // 80
const PAIR_GAP = 56;
// The gap straddles the canvas centre, so each block stands PAIR_GAP / 2 + BOX_W from x 600.
const RS_R = CLU.CX - PAIR_GAP / 2, RS_X = RS_R - BOX_W; // 340..572
const API_X = CLU.CX + PAIR_GAP / 2, API_R = API_X + BOX_W;   // 628..860
const LANE_DY = CLU.LANE_DY;
const { out: OUT_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);   // 68 / 92

// No gap this row can take holds a wire label between the two blocks, so the request takes a
// register above the row and the answer one below it, both centred on the gap they describe.
const WIRE_REQ_Y = TOP_Y - 14;                           // 26
const WIRE_ACK_Y = TOP_BOTTOM + 20;                      // 140, ink centred in the 120..152 corridor
const WIRE_RA_X = midX(RS_R, API_X);                     // 600, the canvas centre the gap straddles

const RS_TO_API = [[RS_R, OUT_Y], [API_X, OUT_Y]];
const API_TO_RS = [[API_X, BACK_Y], [RS_R, BACK_Y]];

// The pair no longer stands over the pipeline, so the tie leaves the API's right FACE and turns 90
// degrees onto the ladder's top centre. No ball rides it: the five stages ARE the API.
const LADDER_X = COL.x(2), LADDER_W = COL_W;             // 780..1140
const LADDER_CX = COL_CX(2);                             // 960
const ROWS = 5, ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;
const LADDER_Y = 152;
const LADDER_BOTTOM = LADDER_Y + ROWS * ROW_H + (ROWS - 1) * ROW_GAP;   // 352
const LADDER_CY = midX(LADDER_Y, LADDER_BOTTOM);         // 252
const API_TO_CHAIN = [[API_R, TOP_CY], [LADDER_CX, TOP_CY], [LADDER_CX, LADDER_Y]];

// A curly brace, not a lane: it GROUPS the rows the way a bracket does, so the LimitRange points at
// a drawn thing. The nose sits at mid height and both ends turn in towards the rows.
const braceD = (x, y1, y2, q) =>
  `M ${x} ${y1} q ${-q} 0 ${-q} ${q} v ${(y2 - y1) / 2 - q * 2} q 0 ${q} ${-q} ${q}` +
  ` q ${q} 0 ${q} ${q} v ${(y2 - y1) / 2 - q * 2} q 0 ${q} ${q} ${q}`;
const BRACE_Q = 30, BRACE_R = LADDER_X - 12;             // ends 768, 12 clear of the rows
const BRACE_TIP = BRACE_R - BRACE_Q * 2;                 // 708, the nose at y 252

// The LimitRange is an OBJECT the pipeline reads. It takes the L-03 floor rather than the actor
// rail, the family height, and the ladder's own mid line, so it stands against the brace nose.
const LR_X = 420, LR_W = BOX_W;                          // 420..652
const LR_H = BOX_H;                                      // 80, the family
const LR_CY = LADDER_CY;                                 // 252
const LR_Y = LR_CY - LR_H / 2;                           // 212..292
// Nothing travels here, so the stub takes no arrowhead: a face midpoint to the brace nose, 56 apart.
const LR_TO_BRACE = [[LR_X + LR_W, LR_CY], [BRACE_TIP, LR_CY]];

// The budget. One column IS the 500m every Pod in this example asks for, so the bar is two columns
// wide and the refused request is the third: the drawing and the arithmetic cannot disagree.
const CPU_W = COL_W * 2, REQ_W = COL_W;                  // 720 / 360
const BAR_X = COL.x(0), BAR_W = CPU_W;                   // 60..780, spec.hard requests.cpu 1
const BAR_Y = 406, BAR_H = 64;                           // 406..470
const BAR_R = BAR_X + BAR_W;                             // 780, the hard edge
const SLOT_X = i => COL.x(i);                            // 60 / 420
const OVER_X = COL.x(2), OVER_W = REQ_W;                 // 780..1140, past the ceiling
const CAP_Y = BAR_Y - 10;                                // 396

const CHIP_H = CLU.CHIP_H, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = 548;                                     // second row ends on 624

// One cell under the request that produced it, so a column reads as one Pod, standing on the budget
// row at the CHIP_VGAP the chip rows use, so the pair reads as one stack rather than as two rows.
const CELL_GAP = 12;
const CELL_W = COL_W - CELL_GAP, CELL_H = 34;            // 348 / 34
const CELL_X = i => COL_CX(i) - CELL_W / 2;              // 66 / 426 / 786
const CELL_Y = BAR_Y + BAR_H + CHIP_VGAP;                // 478..512
// The refusal reason is a footnote to the column it explains, so it sits UNDER that column's cell
// on the same +20 register the ack wire takes under the actor row.
const OVER_Y = CELL_Y + CELL_H + 20;                     // 532
const OVER_CX = COL_CX(2);                               // 960
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;                               // 532
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is read as a GRID: the index wraps across the two columns and steps down every second.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

const REQ_500 = 'requests.cpu 500m';
const HARD = 'requests.cpu 1';
const POST_WEB2 = 'POST pod web-2 · requests.cpu 500m';
const OVER_WHY = 'used 1 plus 500m is over hard 1';
const FORBIDDEN = 'HTTP 403 Forbidden · exceeded quota';

// The three request blocks carry STROKES only, fill overridden so the soft box fill does not double
// up over the bar, and the refused one is dashed because it never became an object.
const budgetFill = (dashed) => (el) => {
  const r = el.querySelector('.scheme-box-rect');
  if (!r) return;
  r.style.fill = 'transparent';
  if (dashed) r.style.strokeDasharray = '5 5';
};
// Every block takes the bar's own rx 6, so a slot has the same corner wherever it stands and none
// borrows a rounded end off the bar behind it.
const budgetBlock = ({ key, x, w, label, dashed = false }) => P.box({
  key, x, y: BAR_Y, w, h: BAR_H, rx: 6, label, sublabel: REQ_500, opacity: 0, tune: budgetFill(dashed),
});

// The list order IS the append order, so it is the z-order: the ladder and the LimitRange sit above
// the packet layer, and the two actors go absolute last.
export const SCENE = {
  'aria-label': 'ResourceQuota and LimitRange: four admission rows and a write, where LimitRanger injects the cpu request the Pod template never named and ResourceQuota then checks the running sum against spec.hard, so the third Pod is refused past the ceiling of a budget bar and the 403 lands on the ReplicaSet that asked for it',
  parts: [
    P.defs(),
    P.relation({ points: API_TO_CHAIN }),
    // A lane is only as present as the fainter of its ends, so both dim with the LimitRange.
    P.relation({ key: 'lrLine', points: LR_TO_BRACE }),
    P.relation({ key: 'lrBrace', d: braceD(BRACE_R, LADDER_Y, LADDER_BOTTOM, BRACE_Q) }),
    // The whole ceiling, undivided. The slots below carve it and carry strokes only, so the fill
    // never doubles up where a slot sits on the bar.
    P.box({ key: 'bar', x: BAR_X, y: BAR_Y, w: BAR_W, h: BAR_H, rx: 6 }),
    P.tag({ x: BAR_X, y: CAP_Y, anchor: 'start', text: 'ResourceQuota team-quota · namespace team-a' }),
    P.tag({ x: BAR_R, y: CAP_Y, text: 'spec.hard 1' }),
    budgetBlock({ key: 'slot0', x: SLOT_X(0), w: REQ_W, label: 'web-1' }),
    budgetBlock({ key: 'slot1', x: SLOT_X(1), w: REQ_W, label: 'web-2' }),
    // Past the bar edge and dashed, because it is a request that never became an object.
    budgetBlock({ key: 'over', x: OVER_X, w: OVER_W, label: 'web-3', dashed: true }),
    P.wire({ key: 'over', x: OVER_CX, y: OVER_Y }),
    // The Pod NAME is on the block above, never here: a cell carries the STATUS column alone, so no
    // column ever prints one name twice and the refused block keeps its own identity.
    ...[0, 1, 2].map(i =>
      P.box({ key: `list${i}`, x: CELL_X(i), y: CELL_Y, w: CELL_W, h: CELL_H, label: 'Not created yet' })),
    // Wire and ball are built from the SAME points array, so the two cannot drift apart.
    ...[RS_TO_API, API_TO_RS].map(p => P.arrow({ from: p[0], to: p[1], dim: true, dashed: true })),
    P.wire({ key: 'req', x: WIRE_RA_X, y: WIRE_REQ_Y }),
    P.wire({ key: 'ack', x: WIRE_RA_X, y: WIRE_ACK_Y }),
    P.chip({ key: 'hardChip',  x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'spec.hard',      value: 'requests.cpu 1' }),
    P.chip({ key: 'usedChip',  x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'status.used',    value: 'requests.cpu 0' }),
    P.chip({ key: 'admitChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'last admission', value: 'none' }),
    P.chip({ key: 'rsChip',    x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'ReplicaSet web', value: '3 desired · 0 created' }),
    P.packets(),
    // Ladder above the packet layer, so no ball rides over its rows.
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
    // The object the first two rows read, on the ladder band and above the packet layer with them.
    P.box({ key: 'lr', x: LR_X, y: LR_Y, w: LR_W, h: LR_H, label: 'LimitRange', sublabel: 'defaultRequest.cpu 500m' }),
    // Top-row blocks last, so a ball passes behind them rather than over their labels.
    P.box({ key: 'rs',  x: RS_X,  y: TOP_Y, w: BOX_W, h: BOX_H, label: 'ReplicaSet web', sublabel: 'spec.replicas 3' }),
    P.box({ key: 'api', x: API_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API',            sublabel: 'admission pipeline' }),
  ],
  // No pods on this card, so no pods list: nothing here is ever pulsed.
  reset: {
    keys: [
      'rs', 'api', 'lr', 'bar', 'slot0', 'slot1', 'over',
      'list0', 'list1', 'list2',
      'hardChip', 'usedChip', 'admitChip', 'rsChip',
    ],
  },
};

// Every step writes every chip. A chip left alone keeps the previous step's reading, and on this
// card that would let status.used claim a total the admission it names has not reached yet.
const chipsOf = (used, admission, rs) => ({ hardChip: HARD, usedChip: used, admitChip: admission, rsChip: rs });

// ONE helper for the three budget blocks and the LimitRange, so a step cannot pin three of four and
// drift on the fourth. A block and its lane leave here together: A-16 wants one place per shade.
const budget = ({ slot0 = null, slot1 = null, over = null }) => {
  const labels = {}, sublabels = {}, opacity = {};
  for (const [key, spec] of [['slot0', slot0], ['slot1', slot1], ['over', over]]) {
    if (!spec) { opacity[key] = 0; continue; }
    labels[key] = spec.label;
    sublabels[key] = spec.sublabel;
    opacity[key] = spec.opacity === undefined ? 1 : spec.opacity;
  }
  // The LimitRange stands on every step, and A-16 wants its shade and its two lanes stated in ONE
  // place, so all three are pinned here rather than left to be inherited.
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

// The observable row, one cell per desired replica. A cell left alone would keep the previous
// step's status, and the third cell is the payload of the whole card.
const listing = (cells) => ({
  labels: Object.fromEntries(cells.map((c, i) => [`list${i}`, c.label])),
  opacity: Object.fromEntries(cells.map((c, i) => [`list${i}`, c.opacity])),
});
const NONE_YET = listing([PENDING_CELL, PENDING_CELL, PENDING_CELL]);
const THIRD_MISSING = listing([PENDING_POD_CELL, PENDING_POD_CELL, ABSENT_CELL]);

// One state of the whole picture: the budget blocks, the LimitRange and the row write the same
// three fields, so they are merged once here rather than spread at every step.
const stateOf = (bar, list) => ({
  labels: { ...bar.labels, ...list.labels },
  sublabels: bar.sublabels,
  opacity: { ...bar.opacity, ...list.opacity },
});
const IDLE = stateOf(EMPTY_BAR, NONE_YET);
// The budget is charged at ADMISSION and the row is what PERSIST leaves behind, so the two states
// differ only in the cells: row 4 spends the quota, row 5 decides which objects exist.
const CHARGED = stateOf(REFUSED, NONE_YET);
const WRITTEN = stateOf(REFUSED, THIRD_MISSING);

const INJECTED = 'mutating · requests.cpu 500m injected';
const WITHIN = 'validating · within min and max';
const NO_OBJECTION = 'validating · no policy objected';
const ADMIT_BOTH = 'admitted · web-1 and web-2';
const REFUSED_403 = '403 · exceeded quota';
const NOT_CREATED = '3 desired · 0 created';
const POST_WEB3 = 'POST pod web-3 · requests.cpu 500m';

// Five steps over five ladder rows, in the pipeline's own order: step N lights row N. The card
// follows ONE request down the chain and the bar fills as the quota stage spends it.
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
    // The chip holds what admission DID, so it turns over when the request reaches admission.
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
    // No packet and no Pod on this step, so the highlights carry the beat on their own.
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
    lit: ['bar', 'slot0', 'slot1', 'over', 'hardChip', 'usedChip', 'admitChip'],
    chain: [3],
    // The sum IS the step, so nothing may stand before the admission that earns it: each slot and
    // the two chips turn over on their own Pod's beat, and the refusal on the third arrival.
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
      // A reveal always lands on 1, and this block must land on the shade of a thing that was never
      // created, so it is a fade with its own ceiling rather than a wrong call to the shared verb.
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
    lit: ['bar', 'slot0', 'slot1', 'over', 'usedChip', 'rsChip'],
    chain: [4],
    // The two writes land first and the row kubectl loses is the same beat as the refused block
    // going dark. Only the 403 and the condition wait for the answer to reach the ReplicaSet.
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
