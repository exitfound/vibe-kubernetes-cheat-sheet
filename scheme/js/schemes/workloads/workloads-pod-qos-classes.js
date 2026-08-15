import { P, F, defineCard, ladder, strip, laneY, midX, WL, LAYOUT, FADE, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-pod-qos-classes

// Layout C on the Workloads canon (WL): panel x<=397 y<=404 leaves no column under it, so the
// pipeline keeps the right band and the chips form a two-across bottom strip.

// Kubelet is the node-facing actor, so it leads the row and is centred on CX: every lane to the
// Node leaves its bottom midpoint and clears the pipeline column.
const TOP1_X = 420, TOP1_W = 2 * (WL.CX - 420);          // 420..780, centred on CX
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = WL.R - (TOP1_X + TOP1_W + TOP_GAP);
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
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
const BUS_Y = NODE_Y + 12;
const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y]];
const BUS = [[POD_CX(0), BUS_Y], [POD_CX(POD_XS.length - 1), BUS_Y]];
const TAP = i => [[POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]];
const LANE = i => (POD_CX(i) === WL.CX
  ? [[WL.CX, WL.TOP_BOTTOM], [WL.CX, POD_Y]]
  : [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y], [POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]]);

// A trunk segment carries the ball but is not its destination, so it is drawn without a marker:
// the arrowhead belongs on the tap that lands on a Pod.
const trunkPath = (key, points) => P.relation({ key, points, role: 'cluster', dash: '5 5' });

const POD_NAMES = ['Pod A', 'Pod B', 'Pod C'];
const POD_SUBS = ['no requests · no limits', 'req only · 500m / 256Mi', 'req == limits · 1 / 1Gi'];

// The list order IS the append order, so it is the z-order: the Node frame is a 70% opaque fill,
// so the bus inside it and the balls that ride it follow it, and ladder / Pods / actors sit above.
export const SCENE = {
  'aria-label': 'Pod QoS classes: API derives qosClass from requests vs limits at admission, Kubelet applies cgroup config and oom_score_adj by tier',
  parts: [
    P.defs(),
    // A RELATIONSHIP: the only write this card narrates Kubelet -> API is the binding POST, which
    // the Scheduler makes and this card does not draw. Nothing can ride it, so no arrowhead.
    P.relation({ points: [[TOP1_X + TOP1_W, REQ_Y], [TOP2_X, REQ_Y]], role: 'cluster' }),
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
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
        '1. spec      ·  3 Pods, different resource shapes',
        '2. classify  ·  API derives qosClass at admission',
        '3. schedule  ·  scheduler bins by requests only',
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
// The three Pods alive at full opacity, which is every step but the eviction.
const ALL_LIVE = { pod1: 1, pod2: 1, pod3: 1 };
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
    opacity: { ...ALL_LIVE },
    chain: -1,
  },
  {
    id: 'spec',
    duration: 1700,
    narration: 'The classification rule has three outcomes. BestEffort: no container has any requests or limits at all. Guaranteed: every container has CPU and memory requests and limits set, with requests equal to limits. Burstable: anything in between (at least one resource declared but does not match the Guaranteed pattern).',
    chips: { pod1Chip: 'pending', pod2Chip: 'pending', pod3Chip: 'pending', focusChip: '3 shapes inspected' },
    wires: { req: 'rule: empty → BestEffort · req==lim → Guaranteed · Else Burstable' },
    sublabels: shapes(...POD_SUBS),
    opacity: { ...ALL_LIVE },
    // The rule is read inside the Api, nothing travels: the focus chip takes the
    // static highlight only, no flash (info chips do not pulse).
    lit: ['apiserver', 'focusChip'],
    chain: 0,
  },
  {
    id: 'classify',
    duration: 2100,
    narration: 'The API server applies the rule and tags each Pod with its class on status.qosClass. Pod A becomes BestEffort (empty resources). Pod B becomes Burstable (requests only, no limits). Pod C becomes Guaranteed (requests equal limits everywhere). This tag is set once at creation and never changes for the rest of the Pod life.',
    chips: { pod1Chip: 'BestEffort', pod2Chip: 'Burstable', pod3Chip: 'Guaranteed', focusChip: 'status.qosClass written' },
    wires: { req: 'status.qosClass · A=BestEffort · B=Burstable · C=Guaranteed' },
    sublabels: shapes('BestEffort', 'Burstable', 'Guaranteed'),
    opacity: { ...ALL_LIVE },
    lit: ['apiserver', 'pod1Chip', 'pod2Chip', 'pod3Chip', 'focusChip'],
    chain: 1,
    flow: [
      // Api tags all three Pods with their qosClass at once: they pulse together.
      F.pulse({ pod: 'pod1' }),
      F.pulse({ pod: 'pod2' }),
      F.pulse({ pod: 'pod3' }),
    ],
  },
  {
    id: 'schedule',
    duration: 3400,
    narration: 'Each Pod is now placed on a Node. Scheduling looks only at requests, ignoring both limits and the QoS class. Pod A asks for nothing and fits anywhere. Pod B competes for 500m CPU and 256Mi memory. Pod C competes for 1 CPU and 1Gi memory. Once a Node passes the checks, the Pod is bound to it via POST .../pods/{name}/binding.',
    chips: { pod1Chip: 'BestEffort', pod2Chip: 'Burstable', pod3Chip: 'Guaranteed', focusChip: 'scheduler · requests only' },
    wires: { req: 'POST .../pods/{name}/binding · requests only, not limits' },
    sublabels: shapes('BestEffort', 'Burstable', 'Guaranteed'),
    opacity: { ...ALL_LIVE },
    lit: ['apiserver', 'focusChip'],
    chain: 2,
    flow: [
      // Api writes the binding, the Kubelet observes it and places each Pod. The Kubelet lights when
      // the binding REACHES it, since placing the Pods is its answer to it.
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, name: 'bind', lights: ['kubelet'] }),
      ...fanToPods({ after: 'bind' }),
    ],
  },
  {
    id: 'cgroups',
    duration: 2600,
    narration: 'Kubelet on the chosen Node writes the Linux cgroup config for each Pod. The container memory cap (memory.max) and CPU cap (cpu.max) come from limits. If limits are absent (Pod A is BestEffort) there is no cap at all. Kubelet also writes oom_score_adj for each container process, a number the kernel uses to choose which process to kill first under memory pressure. BestEffort gets 1000 (kernel picks it first). Guaranteed gets -997 (almost never picked). Burstable sits in between, scaled by its memory request via 1000 - 1000*(request/capacity), clamped to range 3..999.',
    chips: { pod1Chip: 'BestEffort', pod2Chip: 'Burstable', pod3Chip: 'Guaranteed', focusChip: 'memory.max · oom_score_adj' },
    wires: { req: 'cgroup v2 · memory.max + cpu.max + oom_score_adj' },
    sublabels: shapes('BestEffort · oom_score=1000', 'Burstable · oom_score~scaled', 'Guaranteed · oom_score=-997'),
    opacity: { ...ALL_LIVE },
    lit: ['kubelet', 'focusChip'],
    chain: 3,
    // Kubelet pushes cgroup config down to the node, each Pod pulses as it is written.
    flow: fanToPods(),
  },
  {
    id: 'tiers',
    // Motion: Pod A is reached at 1520, Pod B a beat later at 2327, and the second fade ends at
    // 3227. Sequencing the two evictions costs 627ms over a simultaneous fan, and buys the order.
    duration: 3400,
    narration: 'When the Node runs low on memory, Kubelet ranks Pods by whether each is using more than it requested, then by Pod Priority, then by how far over the request it sits. Pod A declared no request at all, so it is over the moment it allocates anything and goes first. Pod B is over its own request and goes next. Pod C requests exactly what it is allowed to use, so it never exceeds its request and is reached only by the kernel OOMKiller in extreme cases. QoS class does not decide this order, it only predicts it, and this is a separate mechanism from priority-based preemption (which is covered in its own card).',
    chips: { pod1Chip: 'BestEffort', pod2Chip: 'Burstable', pod3Chip: 'Guaranteed', focusChip: 'over request, then Priority' },
    wires: { req: 'evicted first: over its request, then by Priority' },
    sublabels: shapes('BestEffort · evicted 1st', 'Burstable · evicted 2nd', 'Guaranteed · survives'),
    // A and B are evicted and dim together, C survives at full opacity. The final state is pinned
    // on the static path too, so a cancelled step cannot leave a Pod half faded.
    opacity: { pod1: OPACITY.terminating, pod2: OPACITY.terminating, pod3: 1 },
    lit: ['kubelet', 'pod1Chip', 'focusChip'],
    chain: 4,
    flow: [
      // The ORDER is the content here, so explicit delays rather than the shared fan: the lanes are
      // 684 and 318 units, so sending together lands `evicted 2nd` 800ms before `evicted 1st`.
      F.route({ points: LANE(0), name: 'evictA' }),
      F.pulse({ pod: 'pod1', at: 'evictA' }),
      F.fade({ target: 'pod1', from: 1, to: OPACITY.terminating, dur: FADE.out, at: 'evictA', fill: 'both', easing: 'ease-in' }),
      F.route({ points: LANE(1), after: 'evictA', name: 'evictB' }),
      F.pulse({ pod: 'pod2', at: 'evictB' }),
      F.fade({ target: 'pod2', from: 1, to: OPACITY.terminating, dur: FADE.out, at: 'evictB', fill: 'both', easing: 'ease-in' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
