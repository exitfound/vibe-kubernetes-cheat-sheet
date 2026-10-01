import { P, F, defineCard, ladder, strip, midX, WL, LAYOUT, FADE, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-pod-qos-classes.md

// Layout C on the Workloads canon (WL): panel x<=397 y<=404 leaves no column under it, so the
// pipeline keeps the right band and the chips form a two-across bottom strip.

// Kubelet is the node-facing actor, so it leads the row and is centred on CX: every lane to the
// Node leaves its bottom midpoint and clears the pipeline column.
// Both boxes take the 232 `workloads-pod-startup-conditions` draws its pair at, in that card's
// arrangement: the left one centred on CX, which WL.L-07 needs for the spine, and the right one
// right-aligned on WL.R, where the ladder and the chip strip below it also end.
const TOP1_W = 232, TOP1_X = WL.CX - TOP1_W / 2;         // 484..716, centred on CX
const TOP2_W = 232, TOP2_X = WL.R - TOP2_W;              // 908..1140, right edge on WL.R
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
// One lane, not the WL.A-01 pair: no step names anything going Kubelet -> API, since the only such
// write the card narrates is the binding POST, which the Scheduler makes and this card does not
// draw. So a single dim dashed answer lane rides the face midline rather than sitting 12 below it
// with nothing above. No arrowless relation stands in for the missing half either: a relation for
// an exchange two boxes never make, on behalf of an actor the diagram does not contain, is the
// arrow-into-nothing family with an extra step (A-06).
const ANSWER_Y = TOP_CY;
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);

// LAYOUT.C of the kit: the ladder takes the RIGHT column, because C has no free column at all.
const LAD_X = LAYOUT.C.ladder.x, LAD_W = LAYOUT.C.ladder.w;    // 660..1140, the pipeline
const LAD_Y = 150;                                       // 5 rows -> 150..350

// Chips two across, 532 wide (LAYOUT.C.strip.two): four across was 258 and every name ran into
// its own value. The strip spans WL.L..WL.R exactly, so the gap is fixed and the width derives.
const CHIP_COLS = 2, CHIP_GAP = 16, CHIP_VGAP = 8;
const CHIPS = strip({ from: WL.L, to: WL.R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIPS_Y = 548;                                     // 2 rows -> 548..582 / 590..624
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: WL.CHIP_H, gap: CHIP_VGAP });
const CHIP_X = i => CHIPS.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

const NODE_Y = 404, NODE_H = 128;                        // 404..532, clear of the panel
const POD_W = 300, POD_H = 82, POD_Y = NODE_Y + 34;      // 438..520
const POD_PAD = 24;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 24, h: 46 };
const POD_XS = [0, 1, 2].map(i => WL.L + POD_PAD + i * ((WL.W - POD_PAD * 2 - POD_W) / 2));
const POD_CX = i => POD_XS[i] + POD_W / 2;               // 234 / 600 / 966

// Every step that travels writes to all three Pods at once, so the lane drops to a bus above the
// Pod row and taps down into each. One ball per tap, wire and ball from the same points.
const BUS_Y = NODE_Y - 20;                               // 384, above the frame: see the record
const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y]];
const BUS = [[POD_CX(0), BUS_Y], [POD_CX(POD_XS.length - 1), BUS_Y]];
// A tap stops ON the Node frame and never inside it (WL.A-03): the head meets the top border from
// outside, the way it used to meet the Pod, so the Kubelet acts on the Node rather than through it.
const TAP_END = NODE_Y;                                  // 404, the frame top border
const TAP = i => [[POD_CX(i), BUS_Y], [POD_CX(i), TAP_END]];
const LANE = i => (POD_CX(i) === WL.CX
  ? [[WL.CX, WL.TOP_BOTTOM], [WL.CX, TAP_END]]
  : [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y], [POD_CX(i), BUS_Y], [POD_CX(i), TAP_END]]);

// The trunk and the bus CARRY every fan ball, so they are route wires: relationPath is for a line
// no ball rides and sinks to stroke-opacity 0.45, which drew the first half of each run at half the
// weight of the tap it ends on. Same lane as a tap, minus the head, which belongs on the tap alone.
const trunkPath = (key, points) => P.lane({
  key, points, dim: true, dashed: true, role: 'cluster',
  tune: (el) => el.removeAttribute('marker-end'),
});

const POD_NAMES = ['Pod A', 'Pod B', 'Pod C'];
const POD_SUBS = ['no requests · no limits', 'req only · 500m / 256Mi', 'req == limits · 1 / 1Gi'];

// The list order IS the append order, so it is the z-order: the Node frame is a 70% opaque fill,
// so the taps crossing it and the balls that ride them follow it, and ladder / Pods sit above.
export const SCENE = {
  'aria-label': 'Pod QoS classes: API derives qosClass from requests vs limits at admission, Kubelet applies cgroup config and oom_score_adj by tier, and under memory pressure evicts the Pods that are over their requests first',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP2_X, y1: ANSWER_Y, x2: TOP1_X + TOP1_W, y2: ANSWER_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
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
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
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
    // Kubelet is the node-facing actor (it places Pods after binding, writes cgroups and evicts),
    // so it sits on the left where the connector to the Node is anchored, matching the other
    // controller cards: left actor -> node, Api on the right. Every connector packet leaves it.
    P.box({ key: 'kubelet', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'cgroups + eviction', role: 'cluster' }),
    P.box({ key: 'apiserver', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'admission · qosClass · binding', role: 'cluster' }),
  ],
  reset: {
    keys: ['apiserver', 'kubelet', 'pod1Chip', 'pod2Chip', 'pod3Chip', 'focusChip', 'pod1Box', 'pod2Box', 'pod3Box'],
    pods: ['pod1', 'pod2', 'pod3'],
  },
};

// setSublabels as FIELDS: the three resource shapes are written in one place, so no step can state
// two of them and leave the third carrying the previous step's text.
const shapes = (a, b, c) => ({ pod1Box: a, pod2Box: b, pod3Box: c });
// A tap ENDS on a Pod, so it is as faint as the Pod it points at (A-13). The trunk and the bus
// end on the rail and not on any Pod, so they stand at 1 on every step, which is what `tiers`
// already does when two of the three Pods go. One value per step, stated here alone (A-16).
const RAIL = { trunk: 1, bus: 1 };
const taps = (shade) => ({ tap1: shade, tap2: shade, tap3: shade });
// The three Pods alive at full opacity, which is every step from the binding on.
const ALL_LIVE = { pod1: 1, pod2: 1, pod3: 1, ...RAIL, ...taps(1) };
// Declared but not placed: the qosClass is written on an object no Node holds yet, so the three
// Pods and their taps rest at OPACITY.pending until `schedule` binds them (C-06, C-14).
const ALL_PENDING = { pod1: OPACITY.pending, pod2: OPACITY.pending, pod3: OPACITY.pending, ...RAIL, ...taps(OPACITY.pending) };
// The eviction sinks A and B, and a tap is as faint as the Pod it points at (A-13), so tap1 and
// tap2 sink with them. The trunk and the bus stay full: they still feed tap3, and C survives.
const EVICTED = {
  ...ALL_LIVE,
  pod1: OPACITY.terminating, pod2: OPACITY.terminating,
  tap1: OPACITY.terminating, tap2: OPACITY.terminating,
};
// One ball per tap. The outer lanes are longer, so each Pod pulses on its own ball landing.
const fanToPods = (when = {}) => [0, 1, 2].flatMap(i => [
  F.route({ points: LANE(i), ...when, name: `fan${i}` }),
  F.pulse({ pod: `pod${i + 1}`, at: `fan${i}` }),
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
    // The rule is read inside the Api, nothing travels: the focus chip takes the
    // static highlight only, no flash (info chips do not pulse).
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
      // Api tags all three Pods with their qosClass at once: they pulse together. The three are
      // still unplaced, so the blink needs the dim pulse to be seen against 0.55 (M-07).
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
    // The three Pods are unplaced until this step: the static block pins them placed, the rewind
    // puts the whole Pod row back at OPACITY.pending, wiring included (A-13, A-16).
    rewind: { opacity: { ...ALL_PENDING } },
    flow: [
      // Api writes the binding, the Kubelet observes it and places each Pod. The Kubelet lights when
      // the binding REACHES it, since placing the Pods is its answer to it.
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: ANSWER_Y, name: 'bind', lights: ['kubelet'] }),
      // The taps rise on the binding that releases the fan, so no tap is ever brighter than the
      // Pod it points at, and every lane is lit before its ball leaves (A-13, A-15).
      ...Object.keys(taps(1)).map(k => F.fade({ target: k, from: OPACITY.pending, to: 1, dur: FADE.in, at: 'bind', fill: 'both', easing: 'ease-out' })),
      ...fanToPods({ after: 'bind' }),
      // The placement is what raises each Pod out of pending, so it rides its OWN tap: the outer
      // lanes are 813ms longer, and the difference is the point (M-24, the lane already points at it).
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
    // Kubelet pushes cgroup config down to the node, each Pod pulses as it is written.
    flow: fanToPods(),
  },
  {
    id: 'tiers',
    // Motion: Pod A is reached at 1444, Pod B a beat later at 2244, and the second fade ends at
    // 2944. Sequencing the two evictions costs 800ms over a simultaneous fan, and buys the order.
    duration: 4200,
    narration: 'When the Node runs low on memory, Kubelet ranks Pods by whether each is using more than it requested, then by Pod Priority, then by how far over the request it sits. Pod A declared no request at all, so it is over the moment it allocates anything and goes first. Pod B is over its own request and goes next. Pod C requests exactly what it is allowed to use, so it never exceeds its request and is evicted last, ranked by Priority, if system daemons overrun what the Node reserved for them. QoS class does not decide this order, it only predicts it, and it is separate from priority-based preemption.',
    chips: { pod1Chip: 'BestEffort', pod2Chip: 'Burstable', pod3Chip: 'Guaranteed', focusChip: 'over request, then Priority' },
    wires: { req: 'evicted first: over its request, then by Priority' },
    sublabels: shapes('BestEffort · evicted 1st', 'Burstable · evicted 2nd', 'Guaranteed · evicted last'),
    // A and B are evicted and dim together, C survives at full opacity. The final state is pinned
    // on the static path too, so a cancelled step cannot leave a Pod half faded.
    opacity: { ...EVICTED },
    // No chip cue: the three qosClass values are unchanged since `classify`, and the eviction
    // order is carried by the sublabels and the focus chip (P-04, P-09a).
    lit: ['kubelet', 'focusChip'],
    chain: 4,
    flow: [
      // The ORDER is the content here, so explicit delays rather than the shared fan: the lanes are
      // 684 and 318 units, so sending together lands `evicted 2nd` 800ms before `evicted 1st`, and
      // a drawing that asserts the opposite of its own labels is worse than one that stays quiet.
      // C gets no ball because it survives. Span 3227 against the 2600 a shared fan would take.
      F.route({ points: LANE(0), name: 'evictA' }),
      F.pulse({ pod: 'pod1', at: 'evictA' }),
      F.fade({ target: 'pod1', from: 1, to: OPACITY.terminating, dur: FADE.out, at: 'evictA', fill: 'both', easing: 'ease-in' }),
      // The tap is pinned full above the reduced guard and only sinks AFTER its ball lands (A-15),
      // so the lane is lit for the whole flight and dark once there is nothing left to point at.
      F.fade({ target: 'tap1', from: 1, to: OPACITY.terminating, dur: FADE.out, at: 'evictA', fill: 'both', easing: 'ease-in' }),
      F.route({ points: LANE(1), after: 'evictA', name: 'evictB' }),
      F.pulse({ pod: 'pod2', at: 'evictB' }),
      F.fade({ target: 'pod2', from: 1, to: OPACITY.terminating, dur: FADE.out, at: 'evictB', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'tap2', from: 1, to: OPACITY.terminating, dur: FADE.out, at: 'evictB', fill: 'both', easing: 'ease-in' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
