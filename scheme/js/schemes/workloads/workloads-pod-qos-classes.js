import { P, F, defineCard, ladder, strip, midX, WL, LAYOUT, FADE, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-pod-qos-classes.md

// Layout C: the panel leaves no column under it, so the pipeline keeps the right band and the
// chips form a two-across bottom strip.

// Kubelet leads the row centred on CX, so every lane to the Node leaves its bottom midpoint (WL.L-07).
const TOP1_W = 232, TOP1_X = WL.CX - TOP1_W / 2;
const TOP2_W = 232, TOP2_X = WL.R - TOP2_W;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
// One lane, not the WL.A-01 pair: nothing goes Kubelet to API on this card, and a relation for
// an exchange the boxes never make is the arrow-into-nothing family (A-06).
const ANSWER_Y = TOP_CY;
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);

// LAYOUT.C: the ladder takes the right column, because C has no free column.
const LAD_X = LAYOUT.C.ladder.x, LAD_W = LAYOUT.C.ladder.w;
const LAD_Y = 150;

// Chips two across (LAYOUT.C.strip.two): four across and every name ran into its value.
const CHIP_COLS = 2, CHIP_GAP = 16, CHIP_VGAP = 8;
const CHIPS = strip({ from: WL.L, to: WL.R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIPS_Y = 548;
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: WL.CHIP_H, gap: CHIP_VGAP });
const CHIP_X = i => CHIPS.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

const NODE_Y = 404, NODE_H = 128;
const POD_W = 300, POD_H = 82, POD_Y = NODE_Y + 34;
const POD_PAD = 24;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 24, h: 46 };
const POD_XS = [0, 1, 2].map(i => WL.L + POD_PAD + i * ((WL.W - POD_PAD * 2 - POD_W) / 2));
const POD_CX = i => POD_XS[i] + POD_W / 2;

// Every travelling step writes to all three Pods, so the lane drops to a bus and taps down.
const BUS_Y = NODE_Y - 20;
const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y]];
const BUS = [[POD_CX(0), BUS_Y], [POD_CX(POD_XS.length - 1), BUS_Y]];
// A tap stops on the Node frame and never inside it (WL.A-03).
const TAP_END = NODE_Y;
const TAP = i => [[POD_CX(i), BUS_Y], [POD_CX(i), TAP_END]];
const LANE = i => (POD_CX(i) === WL.CX
  ? [[WL.CX, WL.TOP_BOTTOM], [WL.CX, TAP_END]]
  : [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y], [POD_CX(i), BUS_Y], [POD_CX(i), TAP_END]]);

// Trunk and bus carry every fan ball, so they are lanes, with the head on the tap alone.
const trunkPath = (key, points) => P.lane({
  key, points, dim: true, dashed: true, role: 'cluster',
  tune: (el) => el.removeAttribute('marker-end'),
});

const POD_NAMES = ['Pod A', 'Pod B', 'Pod C'];
const POD_SUBS = ['no requests · no limits', 'req only · 500m / 256Mi', 'req == limits · 1 / 1Gi'];

// List order is z-order: the taps and balls follow the 70% opaque Node fill, ladder and Pods above.
export const SCENE = {
  'aria-label': 'Pod QoS classes: API derives qosClass from requests vs limits at admission, Kubelet applies cgroup config and oom_score_adj by tier, and under memory pressure evicts the Pods that are over their requests first',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP2_X, y1: ANSWER_Y, x2: TOP1_X + TOP1_W, y2: ANSWER_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits above the actor row.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    P.chip({ key: 'pod1Chip', x: CHIP_X(0), y: CHIP_Y(0), w: CHIPS.w, h: WL.CHIP_H, name: 'Pod A · qosClass', value: 'pending' }),
    P.chip({ key: 'pod2Chip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIPS.w, h: WL.CHIP_H, name: 'Pod B · qosClass', value: 'pending' }),
    P.chip({ key: 'pod3Chip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIPS.w, h: WL.CHIP_H, name: 'Pod C · qosClass', value: 'pending' }),
    P.chip({ key: 'focusChip', x: CHIP_X(3), y: CHIP_Y(3), w: CHIPS.w, h: WL.CHIP_H, name: 'focus', value: 'none' }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    trunkPath('trunk', TRUNK),
    trunkPath('bus', BUS),
    ...POD_XS.map((_, i) => P.lane({ key: `tap${i + 1}`, points: TAP(i), dim: true, dashed: true, role: 'cluster' })),
    P.packets(),
    // Appended after the packet layer, so the ball runs under it.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. rule      ·  requests vs limits decides the class',
        '2. classify  ·  API derives qosClass at admission',
        '3. schedule  ·  bins by requests, not by class',
        '4. cgroups   ·  Kubelet sets memory.max + oom_score_adj',
        '5. evict     ·  over request first, then Priority',
      ],
    }),
    ...POD_XS.map((px, i) => P.pod({
      key: `pod${i + 1}`, id: `pod${i + 1}`, innerKey: `pod${i + 1}Box`,
      x: px, y: POD_Y, w: POD_W, h: POD_H, label: POD_NAMES[i], sublabel: '', containers: 0,
      // No build-time opacity: every step pins all three Pods, and the poster frame is `idle`.
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: POD_SUBS[i] },
    })),
    // Kubelet is the node-facing actor, so it sits where the Node connector is anchored.
    P.box({ key: 'kubelet', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'cgroups + eviction', role: 'cluster' }),
    P.box({ key: 'apiserver', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'admission · qosClass · binding', role: 'cluster' }),
  ],
  reset: {
    keys: ['apiserver', 'kubelet', 'pod1Chip', 'pod2Chip', 'pod3Chip', 'focusChip', 'pod1Box', 'pod2Box', 'pod3Box'],
    pods: ['pod1', 'pod2', 'pod3'],
  },
};

// The three resource shapes are written in one place so no step leaves one stale.
const shapes = (a, b, c) => ({ pod1Box: a, pod2Box: b, pod3Box: c });
// A tap is as faint as the Pod it points at (A-13). Trunk and bus end on the rail, so they stay
// at 1 (A-16).
const RAIL = { trunk: 1, bus: 1 };
const taps = (shade) => ({ tap1: shade, tap2: shade, tap3: shade });
const ALL_LIVE = { pod1: 1, pod2: 1, pod3: 1, ...RAIL, ...taps(1) };
// The qosClass is written before any Node holds the Pods, so they rest at OPACITY.pending (C-06, C-14).
const ALL_PENDING = { pod1: OPACITY.pending, pod2: OPACITY.pending, pod3: OPACITY.pending, ...RAIL, ...taps(OPACITY.pending) };
// The trunk and bus stay full: they still feed tap3, and C survives.
const EVICTED = {
  ...ALL_LIVE,
  pod1: OPACITY.terminating, pod2: OPACITY.terminating,
  tap1: OPACITY.terminating, tap2: OPACITY.terminating,
};
// One ball per tap, each Pod pulsing on its own landing.
const fanToPods = (when = {}) => [0, 1, 2].flatMap(i => [
  F.route({ points: LANE(i), ...when, name: `fan${i}`, pulse: `pod${i + 1}` }),
]);

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { pod1Chip: 'pending', pod2Chip: 'pending', pod3Chip: 'pending', focusChip: 'none' },
    sublabels: shapes(...POD_SUBS),
    opacity: { ...ALL_PENDING },
    chain: -1,
  },
  {
    id: 'spec',
    duration: 2400,
    narration: 'The classification rule has three outcomes. BestEffort: no container sets a CPU or memory request or limit. Guaranteed: every container has CPU and memory requests and limits set above zero, with requests equal to limits. Burstable: anything in between (at least one resource declared, but the Pod does not match the Guaranteed pattern).',
    chips: { pod1Chip: 'pending', pod2Chip: 'pending', pod3Chip: 'pending', focusChip: '3 shapes inspected' },
    wires: { req: 'rule: empty → BestEffort · req==lim → Guaranteed · else Burstable' },
    sublabels: shapes(...POD_SUBS),
    opacity: { ...ALL_PENDING },
    // The rule is read inside the API, nothing travels: info chips do not pulse.
    lit: ['apiserver', 'focusChip'],
    chain: 0,
  },
  {
    id: 'classify',
    duration: 2400,
    narration: 'The API server applies the rule and tags each Pod with its class on status.qosClass. Pod A becomes BestEffort (empty resources). Pod B becomes Burstable (requests only, no limits). Pod C becomes Guaranteed (requests equal limits everywhere). This tag is set once at creation and never changes for the rest of the Pod life.',
    chips: { pod1Chip: 'BestEffort', pod2Chip: 'Burstable', pod3Chip: 'Guaranteed', focusChip: 'status.qosClass written' },
    wires: { req: 'status.qosClass · A=BestEffort · B=Burstable · C=Guaranteed' },
    sublabels: shapes('BestEffort', 'Burstable', 'Guaranteed'),
    opacity: { ...ALL_PENDING },
    lit: ['apiserver', 'pod1Chip', 'pod2Chip', 'pod3Chip', 'focusChip'],
    chain: 1,
    flow: [
      // The Pods are still unplaced, so the blink needs the dim pulse (M-07).
      F.pulse({ pod: 'pod1', dim: true }),
      F.pulse({ pod: 'pod2', dim: true }),
      F.pulse({ pod: 'pod3', dim: true }),
    ],
  },
  {
    id: 'schedule',
    duration: 3400,
    narration: 'Each Pod is now placed on a Node. The resource fit looks only at requests, ignoring both limits and the QoS class. Pod A asks for nothing and fits anywhere. Pod B competes for 500m CPU and 256Mi memory. Pod C competes for 1 CPU and 1Gi memory. Once a Node passes the checks, the Pod is bound to it via POST .../pods/{name}/binding.',
    chips: { pod1Chip: 'BestEffort', pod2Chip: 'Burstable', pod3Chip: 'Guaranteed', focusChip: 'requests only, not the class' },
    wires: { req: 'POST .../pods/{name}/binding · requests only, not limits' },
    sublabels: shapes('BestEffort · no requests', 'Burstable · 500m / 256Mi', 'Guaranteed · 1 / 1Gi'),
    opacity: { ...ALL_LIVE },
    lit: ['apiserver', 'focusChip'],
    chain: 2,
    // The rewind puts the whole Pod row back at OPACITY.pending, wiring included (A-13, A-16).
    rewind: { opacity: { ...ALL_PENDING } },
    flow: [
      // The Kubelet lights when the binding reaches it: placing the Pods is its answer.
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: ANSWER_Y, name: 'bind', lights: ['kubelet'] }),
      // Taps rise on the binding, before their balls leave (A-13, A-15).
      ...Object.keys(taps(1)).map(k => F.fade({ target: k, from: OPACITY.pending, to: 1, dur: FADE.in, at: 'bind', fill: 'both', easing: 'ease-out' })),
      ...fanToPods({ after: 'bind' }),
      // Each Pod rises on its own tap arrival: the outer lanes take longer, which is the point (M-24).
      ...[0, 1, 2].map(i => F.fade({ target: `pod${i + 1}`, from: OPACITY.pending, to: 1, dur: FADE.in, at: `fan${i}`, fill: 'both', easing: 'ease-out' })),
    ],
  },
  {
    id: 'cgroups',
    duration: 4000,
    narration: 'Kubelet on the chosen Node writes the Linux cgroup config for each Pod. The container memory cap (memory.max) and CPU cap (cpu.max) come from limits. Neither Pod A nor Pod B sets any, so neither gets a cap at all. Kubelet also writes oom_score_adj per container process, the kernel ranking for which one to kill first under memory pressure. BestEffort gets 1000 and Guaranteed gets -997, with node-critical Pods on -997 whatever their class, and Burstable in between, scaled by its memory request via 1000 - 1000*(request/capacity) and clamped to 3..999.',
    chips: { pod1Chip: 'BestEffort', pod2Chip: 'Burstable', pod3Chip: 'Guaranteed', focusChip: 'memory.max · oom_score_adj' },
    wires: { req: 'cgroup v2 · memory.max + cpu.max + oom_score_adj' },
    sublabels: shapes('BestEffort · oom_score_adj=1000', 'Burstable · oom_score_adj~scaled', 'Guaranteed · oom_score_adj=-997'),
    opacity: { ...ALL_LIVE },
    lit: ['kubelet', 'focusChip'],
    chain: 3,
    flow: fanToPods(),
  },
  {
    id: 'tiers',
    duration: 4200,
    narration: 'When the Node runs low on memory, Kubelet ranks Pods by whether each is using more than it requested, then by Pod Priority, then by how far over the request it sits. Pod A declared no request at all, so it is over the moment it allocates anything and goes first. Pod B is over its own request and goes next. Pod C requests exactly what it is allowed to use, so it never exceeds its request and is evicted last, ranked by Priority, if system daemons overrun what the Node reserved for them. QoS class does not decide this order, it only predicts it, and it is separate from priority-based preemption.',
    chips: { pod1Chip: 'BestEffort', pod2Chip: 'Burstable', pod3Chip: 'Guaranteed', focusChip: 'over request, then Priority' },
    wires: { req: 'evicted first: over its request, then by Priority' },
    sublabels: shapes('BestEffort · evicted 1st', 'Burstable · evicted 2nd', 'Guaranteed · evicted last'),
    // A and B dim, C survives. Pinned on the static path so a cancel cannot leave a half fade.
    opacity: { ...EVICTED },
    // No chip cue: the qosClass values are unchanged, the order is in sublabels and focus (P-04, P-09a).
    lit: ['kubelet', 'focusChip'],
    chain: 4,
    flow: [
      // The order is the content, so the evictions are sequenced rather than fanned: sent together,
      // the shorter lane would land `evicted 2nd` first. C gets no ball because it survives.
      F.route({ points: LANE(0), name: 'evictA', pulse: 'pod1' }),
      F.fade({ target: 'pod1', from: 1, to: OPACITY.terminating, dur: FADE.out, at: 'evictA', fill: 'both', easing: 'ease-in' }),
      // The tap sinks only after its ball lands (A-15).
      F.fade({ target: 'tap1', from: 1, to: OPACITY.terminating, dur: FADE.out, at: 'evictA', fill: 'both', easing: 'ease-in' }),
      F.route({ points: LANE(1), after: 'evictA', name: 'evictB', pulse: 'pod2' }),
      F.fade({ target: 'pod2', from: 1, to: OPACITY.terminating, dur: FADE.out, at: 'evictB', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'tap2', from: 1, to: OPACITY.terminating, dur: FADE.out, at: 'evictB', fill: 'both', easing: 'ease-in' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
