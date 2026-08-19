import { chip } from '../../lib/primitives.js';
import { P, F, defineCard, laneY, ladder, strip, midX, laneOf, CLU, OPACITY, REVEAL_MS } from './cluster-kit.js';

// Design notes for this card: ./CARDS.md#cluster-resource-quota

// A budget that ACCUMULATES: one bar whose width IS spec.hard, slots filling left to right, and the
// refused request drawn past the edge. Scale exact at 480 units per CPU. CEILING 460 characters.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140

// TWO actors, both at the family 232. The LimitRange is not an actor, so it sits beside the two
// ladder rows that read it.
const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;              // 232 / 80
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;     // 40 / 120
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);                  // 80
const RS_X = 420, RS_R = RS_X + BOX_W;                   // 420..652, left edge on the bar rail
const LADDER_W = 400;
// The API sits where its own ladder ends on the content right edge, so the gap to the ReplicaSet
// is 172 rather than the family 56. Both numbers are under the packet floor, see ./CARDS.md.
const API_CX = CONTENT_R - LADDER_W / 2;                 // 940
const API_X = API_CX - BOX_W / 2;  // 824..1056
const LANE_DY = CLU.LANE_DY;
const { out: OUT_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);   // 68 / 92

// No gap this row can take holds a wire label between the two blocks, so the request takes a
// register above the row and the answer one below it, both centred on the gap they describe.
const WIRE_REQ_Y = TOP_Y - 14;                           // 26
const WIRE_ACK_Y = TOP_BOTTOM + 20;                      // 140, ink centred in the 120..152 corridor
const WIRE_RA_X = midX(RS_R, API_X);                     // 738

const RS_TO_API = [[RS_R, OUT_Y], [API_X, OUT_Y]];
const API_TO_RS = [[API_X, BACK_Y], [RS_R, BACK_Y]];

// The pipeline hangs under the API and is centred on it, so the tie is one straight drop onto a
// face midpoint. The five stages ARE the API, so no ball rides down there either.
const LADDER_X = API_CX - LADDER_W / 2;                  // 740..1140
const LADDER_Y = 152, ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;   // 5 rows -> 152..352
const API_TO_CHAIN = [[API_CX, TOP_BOTTOM], [API_CX, LADDER_Y]];

// The LimitRange is an OBJECT the LimitRanger plugin reads, so it stands beside the two rows that
// plugin occupies and is exactly as tall as the pair, in the same column as the ReplicaSet.
const LR_X = RS_X, LR_W = BOX_W;                         // 420..652
const LR_Y = LADDER_Y, LR_H = ROW_H * 2 + ROW_GAP;       // 152..226, rows 1 and 2 exactly
const LR_CY = LR_Y + LR_H / 2;                           // 189, the seam between the two rows
// Nothing travels here, so the line takes no arrowhead and its LimitRange end is a face midpoint.
const LR_TO_CHAIN = [[LR_X + LR_W, LR_CY], [LADDER_X, LR_CY]];

// The budget. CPU_W is one whole CPU, REQ_W is the 500m every Pod in this example asks for, and
// the bar is exactly spec.hard wide, so the drawing and the arithmetic cannot disagree.
const CPU_W = 480, REQ_W = CPU_W / 2;                    // 480 / 240
const BAR_X = 420, BAR_W = CPU_W;                        // 420..900, spec.hard requests.cpu 1
const BAR_Y = 386, BAR_H = 64;                           // 386..450
const BAR_R = BAR_X + BAR_W;                             // 900, the hard edge
const SLOT_X = i => BAR_X + i * REQ_W;                   // 420 / 660
const OVER_X = BAR_R, OVER_W = REQ_W;                    // 900..1140, past the ceiling
const CAP_Y = BAR_Y - 10;                                // 376
const OVER_CX = OVER_X + OVER_W / 2;                     // 1020
const OVER_WIRE_Y = BAR_Y + BAR_H + 18;                  // 468
// The counterfactual caption sits in the one empty band the branch has, between the LimitRange and
// the quota tag, and starts on the 420 rail the LimitRange, the bar and that tag all share.
const WIRE_IF_Y = midX(LR_Y + LR_H, CAP_Y);              // 301, ink centred in the 226..376 band

// What a reader can actually observe, in the corner the panel frees once its text ends. Three
// rows, one per desired replica, because the whole point of the card is that the third is absent.
const LIST_X = CONTENT_L, LIST_W = 340;                  // 60..400
const LIST_Y = BAR_Y, LIST_H = 40, LIST_GAP = 12;        // 386..426 / 438..478 / 490..530
const LIST_ROW_Y = ladder({ y: LIST_Y, rowH: LIST_H, gap: LIST_GAP });

const CHIP_H = CLU.CHIP_H, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = 548;                                     // second row ends on 624
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;                               // 532
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is read as a GRID: the index wraps across the two columns and steps down every second.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// The command is a chip, not a floating caption, so the three rows read as one answer. It takes the
// row width exactly and stands off by more than the row gap: the question above the answer.
const LIST_CX = LIST_X + LIST_W / 2;                     // 230
const CMD_W = LIST_W, CMD_H = CHIP_H;                    // 340 x 34, the width of the row below it
const CMD_X = LIST_X;                                    // 60..400, flush with the listing
const CMD_GAP = 32;                                      // deliberately wider than the 12 row gap
const CMD_Y = LIST_Y - CMD_GAP - CMD_H;                  // 320..354
// Every tie spans exactly the row gap, so the column keeps one rhythm from the command down to
// web-3, and every endpoint is a face midpoint.
const CMD_TIE = [[LIST_CX, CMD_Y + CMD_H], [LIST_CX, LIST_Y]];
const ROW_TIE = i => [[LIST_CX, LIST_ROW_Y(i) + LIST_H], [LIST_CX, LIST_ROW_Y(i + 1)]];

const REQ_500 = 'requests.cpu 500m';
const HARD = 'requests.cpu 1';

// The three request blocks carry STROKES only, fill overridden so the soft box fill does not double
// up over the bar, and the refused one is dashed because it never became an object.
const budgetFill = (dashed) => (el) => {
  const r = el.querySelector('.scheme-box-rect');
  if (!r) return;
  r.style.fill = 'transparent';
  if (dashed) r.style.strokeDasharray = '5 5';
};
// rx is 0 on the slots and 6 on the bar: two rounded rects side by side read as two blocks rather
// than as one bar filling.
const budgetBlock = ({ key, x, w, label, dashed = false }) => P.box({
  key, x, y: BAR_Y, w, h: BAR_H, rx: 0, label, sublabel: REQ_500, opacity: 0, tune: budgetFill(dashed),
});

// The list order IS the append order, so it is the z-order: the ladder and the LimitRange sit above
// the packet layer, and the two actors go absolute last.
export const SCENE = {
  'aria-label': 'ResourceQuota and LimitRange: a quota caps what one namespace may request in total and is checked at admission, so the Pod that does not fit is never created and the 403 lands on the ReplicaSet that asked for it',
  parts: [
    P.defs(),
    P.relation({ points: API_TO_CHAIN }),
    // A lane is only as present as the fainter of its ends, so this one dims with the LimitRange.
    P.relation({ key: 'lrLine', points: LR_TO_CHAIN }),
    // The whole ceiling, undivided. The slots below carve it and carry strokes only, so the fill
    // never doubles up where a slot sits on the bar.
    P.box({ key: 'bar', x: BAR_X, y: BAR_Y, w: BAR_W, h: BAR_H, rx: 6 }),
    P.tag({ x: BAR_X, y: CAP_Y, anchor: 'start', text: 'ResourceQuota team-quota · namespace team-a' }),
    P.tag({ x: BAR_R, y: CAP_Y, text: 'spec.hard 1' }),
    // T-35: the sign that a step draws a HYPOTHESIS rather than state that happened. The reset
    // prologue blanks every wire, so this one is a caption for the one step that writes it.
    P.wire({ key: 'branch', x: BAR_X, y: WIRE_IF_Y, anchor: 'start' }),
    budgetBlock({ key: 'slot0', x: SLOT_X(0), w: REQ_W, label: 'web-1' }),
    budgetBlock({ key: 'slot1', x: SLOT_X(1), w: REQ_W, label: 'web-2' }),
    // Past the bar edge and dashed, because it is a request that never became an object.
    budgetBlock({ key: 'over', x: OVER_X, w: OVER_W, label: 'web-3', dashed: true }),
    P.wire({ key: 'over', x: OVER_CX, y: OVER_WIRE_Y }),
    // Ties under the rows they join, so a row edge covers the join rather than the line crossing it.
    P.relation({ key: 'laneCmd', points: CMD_TIE }),
    P.relation({ key: 'lane01', points: ROW_TIE(0) }),
    P.relation({ key: 'lane12', points: ROW_TIE(1) }),
    // The one plain chip on the card: a command, not a name and value pair, so no P kind builds it.
    P.raw({
      key: 'cmdChip',
      make: () => chip({ x: CMD_X, y: CMD_Y, w: CMD_W, h: CMD_H, label: 'kubectl get pods -n team-a', role: 'cluster' }),
    }),
    ...['web-1', 'web-2', 'web-3'].map((n, i) =>
      P.box({ key: `list${i}`, x: LIST_X, y: LIST_ROW_Y(i), w: LIST_W, h: LIST_H, label: n, sublabel: 'not created yet' })),
    // Wire and ball are built from the SAME points array, so the two cannot drift apart.
    ...[RS_TO_API, API_TO_RS].map(p => P.arrow({ from: p[0], to: p[1], dim: true, dashed: true })),
    P.wire({ key: 'req', x: WIRE_RA_X, y: WIRE_REQ_Y }),
    P.wire({ key: 'ack', x: WIRE_RA_X, y: WIRE_ACK_Y }),
    P.chip({ key: 'hardChip',  x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'spec.hard',      value: 'requests.cpu 1' }),
    P.chip({ key: 'usedChip',  x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'status.used',    value: 'requests.cpu 0' }),
    P.chip({ key: 'admitChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'last admission', value: 'none' }),
    P.chip({ key: 'rsChip',    x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'ReplicaSet web', value: '3 desired · 0 ready' }),
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
    P.box({ key: 'lr', x: LR_X, y: LR_Y, w: LR_W, h: LR_H, label: 'LimitRange', sublabel: 'defaultRequest cpu 500m' }),
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
const budget = ({ slot0 = null, slot1 = null, over = null, limitRange = 1 }) => {
  const labels = {}, sublabels = {}, opacity = {};
  for (const [key, spec] of [['slot0', slot0], ['slot1', slot1], ['over', over]]) {
    if (!spec) { opacity[key] = 0; continue; }
    labels[key] = spec.label;
    sublabels[key] = spec.sublabel;
    opacity[key] = spec.opacity === undefined ? 1 : spec.opacity;
  }
  // A lane is only as present as the fainter of its ends, so this one dims with the LimitRange.
  opacity.lr = limitRange;
  opacity.lrLine = limitRange;
  return { labels, sublabels, opacity };
};
const EMPTY_BAR = budget({});
const SLOT_A = { label: 'web-1', sublabel: REQ_500 }, SLOT_B = { label: 'web-2', sublabel: REQ_500 };
const TWO_IN = budget({ slot0: SLOT_A, slot1: SLOT_B });
const REFUSED = budget({ slot0: SLOT_A, slot1: SLOT_B, over: { label: 'web-3', sublabel: REQ_500, opacity: OPACITY.pending } });
// The counterfactual: with no LimitRange nothing was ever admitted, so the first request sits
// outside the bar, refused for being uncountable rather than for being too big.
const UNCOUNTED = budget({
  over: { label: 'web-1', sublabel: 'no requests.cpu', opacity: OPACITY.pending },
  limitRange: OPACITY.terminated,
});

const PENDING_ROW = { sublabel: 'not created yet', opacity: OPACITY.pending };
const RUNNING_ROW = { sublabel: 'Running',         opacity: 1 };
const ABSENT_ROW  = { sublabel: 'no Pod object',   opacity: OPACITY.terminated };

// The observable listing, one row per desired replica. A row left alone would keep the previous
// step's status, and the third row is the payload of the whole card.
const listing = (rows) => ({
  sublabels: Object.fromEntries(rows.map((r, i) => [`list${i}`, r.sublabel])),
  opacity: {
    ...Object.fromEntries(rows.map((r, i) => [`list${i}`, r.opacity])),
    // A tie is only as present as the fainter of its ends. The command is on screen whatever the
    // listing says, so the head tie takes the shade of the one row it points at.
    laneCmd: rows[0].opacity,
    lane01: laneOf(rows[0].opacity, rows[1].opacity),
    lane12: laneOf(rows[1].opacity, rows[2].opacity),
  },
});
const NONE_YET = listing([PENDING_ROW, PENDING_ROW, PENDING_ROW]);
const TWO_UP = listing([RUNNING_ROW, RUNNING_ROW, PENDING_ROW]);
const THIRD_MISSING = listing([RUNNING_ROW, RUNNING_ROW, ABSENT_ROW]);
const NONE_AT_ALL = listing([ABSENT_ROW, ABSENT_ROW, ABSENT_ROW]);

// One state of the whole picture: the budget blocks, the LimitRange and the listing write the same
// three fields, so they are merged once here rather than spread at every step.
const stateOf = (bar, list) => ({
  labels: bar.labels,
  sublabels: { ...bar.sublabels, ...list.sublabels },
  opacity: { ...bar.opacity, ...list.opacity },
});
const IDLE = stateOf(EMPTY_BAR, NONE_YET);
const ADMITTED = stateOf(TWO_IN, TWO_UP);
const REJECTED = stateOf(REFUSED, THIRD_MISSING);
const NO_LIMITRANGE = stateOf(UNCOUNTED, NONE_AT_ALL);

const INJECTED = 'mutating · requests.cpu 500m injected';
const ADMIT_BOTH = 'admitted · web-1 and web-2';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: chipsOf('requests.cpu 0', 'none', '3 desired · 0 ready'),
    ...IDLE,
    chain: -1,
  },
  {
    id: 'quota',
    duration: 2600,
    narration: 'A ResourceQuota caps what one namespace may request in total. The field spec.hard is the ceiling and status.used is the running sum, and this one allows requests.cpu 1 across the namespace team-a. A quota can count objects as well, like count/pods 10 or count/deployments.apps 5.',
    chips: chipsOf('requests.cpu 0', 'none', '3 desired · 0 ready'),
    ...IDLE,
    // No packet and no Pod on this step, so the highlights carry the beat on their own.
    lit: ['bar', 'hardChip', 'usedChip'],
    chain: 3,
  },
  {
    id: 'limitrange',
    duration: 2600,
    narration: 'The Pod template names no cpu at all, so the LimitRange in this namespace supplies one. LimitRanger runs in both phases: it injects defaultRequest.cpu 500m while the object can still be rewritten, then checks min, max and maxLimitRequestRatio once it cannot.',
    chips: chipsOf('requests.cpu 0', INJECTED, '3 desired · 0 ready'),
    ...IDLE,
    wires: { req: 'POST pod web-1 · no cpu named' },
    lit: ['rs', 'lr', 'admitChip'],
    // Both LimitRanger rows, because the point of the step is that one plugin sits in two phases.
    chain: [0, 1],
    // The chip holds what admission DID, so it turns over when the request reaches admission.
    rewind: { chips: { admitChip: 'none' } },
    flow: [
      F.segment({ from: RS_TO_API[0], to: RS_TO_API[1], name: 'req', lights: ['api'] }),
      F.set({ at: 'req', chips: { admitChip: INJECTED } }),
    ],
  },
  {
    id: 'admit',
    duration: 3400,
    narration: 'ResourceQuota runs after every other validating plugin, and it admits web-1 because 0 plus 500m is inside the ceiling. Admission itself adds that 500m to status.used, so the count is not a controller catching up afterwards. Pod web-2 follows the same way and takes used to 1.',
    chips: chipsOf('requests.cpu 1', ADMIT_BOTH, '3 desired · 2 ready'),
    ...ADMITTED,
    wires: { req: 'POST pod web-2 · requests.cpu 500m' },
    lit: ['bar', 'slot0', 'slot1', 'usedChip', 'admitChip', 'rsChip'],
    chain: 3,
    // The sum IS the step, so each slot appears on its own beat: web-1 lands first, then web-2
    // rides the wire and its slot appears where the request arrives.
    rewind: {
      chips: { usedChip: 'requests.cpu 0', admitChip: 'none', rsChip: '3 desired · 0 ready' },
      opacity: { slot1: 0 },
    },
    flow: [
      F.reveal({ target: 'slot0' }),
      F.set({ delay: REVEAL_MS, chips: { usedChip: REQ_500, admitChip: 'admitted · web-1', rsChip: '3 desired · 1 ready' } }),
      F.segment({ from: RS_TO_API[0], to: RS_TO_API[1], delay: REVEAL_MS, name: 'req', lights: ['api'] }),
      F.reveal({ target: 'slot1', at: 'req' }),
      F.set({ at: 'req', chips: { usedChip: 'requests.cpu 1', admitChip: ADMIT_BOTH, rsChip: '3 desired · 2 ready' } }),
    ],
  },
  {
    id: 'reject',
    duration: 4000,
    narration: 'Pod web-3 would take used to 1.5 against a ceiling of 1, so admission answers 403 with exceeded quota and no Pod object is ever written. The ReplicaSet asked for it, so the ReplicaSet is what hears the refusal, as a FailedCreate event and a ReplicaFailure condition. There is no third Pod for kubectl get pods to list and none to describe.',
    chips: chipsOf('requests.cpu 1', '403 · exceeded quota', 'ReplicaFailure · FailedCreate'),
    ...REJECTED,
    wires: {
      req: 'POST pod web-3 · requests.cpu 500m',
      ack: 'HTTP 403 Forbidden · exceeded quota',
      over: 'used 1 plus 500m is over hard 1',
    },
    lit: ['bar', 'over', 'usedChip', 'admitChip', 'rsChip'],
    // Row 5 stays dark on purpose: the request never reaches persist, so nothing is written.
    chain: 3,
    // Out, refused, back. The ReplicaSet is the receiver of the 403, so it lights on arrival
    // rather than at entry, and its condition chip turns over on that same beat.
    rewind: {
      chips: { admitChip: ADMIT_BOTH, rsChip: '3 desired · 2 ready' },
      opacity: { over: 0 },
    },
    flow: [
      F.segment({ from: RS_TO_API[0], to: RS_TO_API[1], name: 'req', lights: ['api'] }),
      // A reveal always lands on 1, and this block must land on the shade of a thing that was never
      // created, so it is a fade with its own ceiling rather than a wrong call to the shared verb.
      F.fade({ target: 'over', from: 0, to: OPACITY.pending, dur: REVEAL_MS, at: 'req', fill: 'forwards', easing: 'ease-out' }),
      F.set({ at: 'req', chips: { admitChip: '403 · exceeded quota' } }),
      F.segment({ from: API_TO_RS[0], to: API_TO_RS[1], after: 'req', name: 'ack', lights: ['rs'] }),
      F.set({ at: 'ack', chips: { rsChip: 'ReplicaFailure · FailedCreate' } }),
    ],
  },
  {
    id: 'no-request',
    duration: 3000,
    narration: 'Take the LimitRange away and web-1 would not have got in either. Once a quota constrains requests.cpu, every new Pod in that namespace must name requests.cpu or limits.cpu, because a Pod carrying neither is a Pod the quota cannot count. That is what makes a LimitRange structural here rather than a convenience.',
    chips: chipsOf('requests.cpu 0', '403 · no requests.cpu on the Pod', '3 desired · 0 ready'),
    ...NO_LIMITRANGE,
    wires: {
      branch: 'if instead no LimitRange existed',
      over: 'nothing here for the quota to count',
    },
    lit: ['bar', 'over', 'hardChip', 'usedChip', 'admitChip', 'rsChip'],
    chain: 3,
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
