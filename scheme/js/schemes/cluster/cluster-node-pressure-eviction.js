import { P, F, defineCard, ladder, spread, midX, shade, CLU, LAYOUT, BEAT, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-node-pressure-eviction.md

// Layout B: chips left under the panel, ladder right, Node frame full width.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;
const CX = midX(CONTENT_L, CONTENT_R);

const KUBE_W = CLU.BOX_W, KUBE_H = CLU.BOX_H;
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + KUBE_H;
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
const SPINE_X = CX;
const KUBE_X = SPINE_X - KUBE_W / 2;
const KUBE_R = KUBE_X + KUBE_W;

// One lane to the API, one direction: no step names anything coming back.
const API_W = CLU.BOX_W, API_X = CONTENT_R - API_W;

// Slower than FADE.out so the Pod outlives its own pulse. Ends on OPACITY.terminated, not 0.
const VICTIM_FADE = 1200;
// The longest wire string overhangs the gap, so the label sits above the row.
const WIRE_X = midX(KUBE_R, API_X);
const WIRE_Y = TOP_Y - 14;

const COL_BOTTOM = 456;                                  // both columns end here, 16 above the frame
const LADDER_X = LAYOUT.B.ladder.x, LADDER_W = LAYOUT.B.ladder.w;
const ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP, LADDER_ROWS = 5;
const LADDER_Y = COL_BOTTOM - (LADDER_ROWS * ROW_H + (LADDER_ROWS - 1) * ROW_GAP);

const CHIP_H = CLU.CHIP_H, CHIP_VGAP = 8, CHIP_COUNT = 4;
const CHIP_X = LAYOUT.B.chips.x, CHIP_W = LAYOUT.B.chips.w;
const CHIPS_Y = COL_BOTTOM - (CHIP_COUNT * CHIP_H + (CHIP_COUNT - 1) * CHIP_VGAP);
const CHIP_Y = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;
const NODE_H = CLU.NODE.H, NODE_BOTTOM = 624, NODE_Y = NODE_BOTTOM - NODE_H;
const POD_W = 300, POD_H = CLU.NODE.POD_H, POD_Y = NODE_Y + CLU.NODE.POD_DY;
const POD_PAD = 24;
const POD_X = spread({ from: NODE_X + POD_PAD, to: CONTENT_R - POD_PAD, count: 3, w: POD_W }).x;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// Addressed to the Node frame, not a Pod: the pulse says which Pod the kill lands on.
const CONNECTOR = [[SPINE_X, TOP_BOTTOM], [SPINE_X, NODE_Y]];

// A relation, not a lane: the Kubelet owns every ladder row, so the ladder is no destination.
// Offset by LANE_DY off the face midpoint the kill lane takes.
const TIE_X = SPINE_X + CLU.LANE_DY;
const TIE_LAND_X = midX(LADDER_X, LADDER_X + LADDER_W);
const TIE_JOG_Y = midX(TOP_BOTTOM, LADDER_Y);
const KUBE_TO_CHAIN = [[TIE_X, TOP_BOTTOM], [TIE_X, TIE_JOG_Y], [TIE_LAND_X, TIE_JOG_Y], [TIE_LAND_X, LADDER_Y]];

const QOS_LABELS = ['BestEffort', 'Burstable', 'Guaranteed'];

// Parts order is z-order: packets under the ladder and the Node, the top row last.
export const SCENE = {
  'aria-label': 'Node-pressure eviction: detect, condition, rank, evict, relieve',
  parts: [
    P.defs(),
    P.arrow({ x1: KUBE_R, y1: TOP_CY, x2: API_X, y2: TOP_CY, dim: true, dashed: true }),
    P.wire({ key: 'api', x: WIRE_X, y: WIRE_Y }),
    P.chip({ key: 'memChip',       x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'memory.available', value: '4Gi' }),
    P.chip({ key: 'thresholdChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: '--eviction-hard',  value: 'memory.available<1Gi' }),
    P.chip({ key: 'pressureChip',  x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'MemoryPressure',   value: 'False' }),
    P.chip({ key: 'victimChip',    x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'victim',           value: 'none' }),
    P.lane({ points: CONNECTOR, dim: true, dashed: true }),
    P.relation({ points: KUBE_TO_CHAIN }),
    P.packets(),
    P.chain({
      key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. detect    ·  cAdvisor stats vs threshold',
        '2. condition ·  set MemoryPressure on Node',
        '3. rank      ·  over request, then priority',
        '4. evict     ·  SIGKILL victim, grace 0',
        '5. relieve   ·  pressure clears, reset',
      ],
    }),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    // The id is what the fade and the opacity pins address.
    ...QOS_LABELS.map((qos, i) => P.pod({
      key: `pod${i + 1}`, id: `pod${i + 1}`, innerKey: `pod${i + 1}Box`,
      x: POD_X(i), y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'app', sublabel: qos },
    })),
    P.box({ key: 'kubelet', x: KUBE_X, y: TOP_Y, w: KUBE_W, h: KUBE_H, label: 'Kubelet', sublabel: 'eviction manager + cAdvisor' }),
    P.box({ key: 'api',     x: API_X,  y: TOP_Y, w: API_W,  h: KUBE_H, label: 'API',     sublabel: 'Node and Pod status' }),
  ],
  reset: {
    keys: ['kubelet', 'api', 'memChip', 'thresholdChip', 'pressureChip', 'victimChip', 'pod1Box', 'pod2Box', 'pod3Box'],
    pods: ['pod1', 'pod2', 'pod3'],
  },
};

const THRESHOLD = 'memory.available<1Gi';
// Every step writes every chip: a step cut short mid-flight drops any pending F.set.
const LIVE = shade(['pod1', 'pod2', 'pod3'], 1);
const GONE = OPACITY.terminated;

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { memChip: '4Gi', thresholdChip: THRESHOLD, pressureChip: 'False', victimChip: 'none' },
    opacity: LIVE,
    chain: -1,
  },
  {
    id: 'detect',
    duration: 2000,
    narration: 'The cAdvisor stats report memory.available has dropped to 500Mi. Eviction manager polls these stats every 10s and compares against the --eviction-hard signals. The threshold is breached.',
    chips: { memChip: '500Mi', thresholdChip: THRESHOLD, pressureChip: 'False', victimChip: 'none' },
    opacity: LIVE,
    lit: ['kubelet', 'memChip', 'thresholdChip'],
    chain: 0,
  },
  {
    id: 'condition',
    duration: 3700,
    narration: 'Kubelet PATCHes Node.status.conditions: MemoryPressure flips from False to True. The node controller translates this into a NoSchedule taint (node.kubernetes.io/memory-pressure), so Pods that do not tolerate it can no longer be scheduled here. By default only BestEffort workloads carry no such toleration, the control plane adds it to every Pod in the Burstable or Guaranteed class.',
    chips: { memChip: '500Mi', thresholdChip: THRESHOLD, pressureChip: 'True', victimChip: 'none' },
    wires: { api: 'PATCH Node.status.conditions · MemoryPressure=True' },
    opacity: LIVE,
    lit: ['kubelet', 'pressureChip'],
    chain: 1,
    // The Node carries MemoryPressure only once the PATCH reaches the API.
    rewind: { chips: { pressureChip: 'False' } },
    flow: [
      F.top({ from: KUBE_R, to: API_X, y: TOP_CY, name: 'patch', lights: ['api'] }),
      F.set({ at: 'patch', chips: { pressureChip: 'True' } }),
    ],
  },
  {
    id: 'rank',
    duration: 3600,
    narration: 'Eviction manager ranks running Pods by three things in order: whether each is using more of the starved resource than it requested, then Pod Priority, then how far over the request it sits. QoS class does not decide that order, it only estimates it, because a class derived from CPU and memory says nothing about the resource under pressure. See the Pod QoS Classes card.',
    chips: { memChip: '500Mi', thresholdChip: THRESHOLD, pressureChip: 'True', victimChip: 'BestEffort Pod selected' },
    opacity: LIVE,
    lit: ['kubelet', 'victimChip'],
    chain: 2,
    reducedLit: ['pod1Box'],
    flow: [F.pulse({ pod: 'pod1', delay: BEAT.lead })],
  },
  {
    id: 'evict',
    duration: 2700,
    narration: 'Kubelet evicts the BestEffort Pod itself, not through the Eviction API, so no PodDisruptionBudget is consulted and the spec terminationGracePeriodSeconds is ignored. For hard thresholds the grace period is forced to 0, an immediate SIGKILL, where normal termination waits the 30s default after SIGTERM. The Pod phase is set to Failed with reason Evicted and reported to the API.',
    chips: { memChip: '500Mi', thresholdChip: THRESHOLD, pressureChip: 'True', victimChip: 'BestEffort Pod evicted' },
    wires: { api: 'PATCH Pod status · phase=Failed reason=Evicted' },
    // The victim stays as a ghost at the terminated shade, not a hole in the Pod row.
    opacity: { ...LIVE, pod1: GONE },
    lit: ['kubelet', 'victimChip'],
    chain: 3,
    rewind: { chips: { victimChip: 'BestEffort Pod selected' } },
    flow: [
      // No delay, so the ball starts visible: routePacket fades in only on a delay above 0.
      F.route({ points: CONNECTOR, name: 'kill' }),
      F.set({ at: 'kill', chips: { victimChip: 'BestEffort Pod evicted' } }),
      F.pulse({ pod: 'pod1', at: 'kill' }),
      F.fade({ target: 'pod1', to: GONE, dur: VICTIM_FADE, at: 'kill' }),
      // The status report can only leave once the Pod is dead.
      F.top({ from: KUBE_R, to: API_X, y: TOP_CY, after: 'kill', name: 'report', lights: ['api'] }),
    ],
  },
  {
    id: 'relieve',
    duration: 2200,
    narration: 'Memory frees up, and cAdvisor reports memory.available back above the threshold. After --eviction-pressure-transition-period (default 5m) of staying clear, Kubelet flips MemoryPressure back to False. Scheduling resumes for new Pods.',
    chips: { memChip: '3.5Gi', thresholdChip: THRESHOLD, pressureChip: 'False', victimChip: 'none' },
    wires: { api: 'PATCH Node.status.conditions · MemoryPressure=False' },
    opacity: { ...LIVE, pod1: GONE },
    lit: ['kubelet', 'memChip', 'pressureChip', 'victimChip'],
    chain: 4,
    // Ladder row 5 is one event, so both chips turn over on the same beat.
    rewind: { chips: { pressureChip: 'True', victimChip: 'BestEffort Pod evicted' } },
    // Up-arrow order: survivors pulse first, then the condition flips back.
    flow: [
      F.pulse({ pod: 'pod2' }),
      F.pulse({ pod: 'pod3' }),
      F.top({ from: KUBE_R, to: API_X, y: TOP_CY, delay: BEAT.afterPulse, name: 'clear', lights: ['api'] }),
      F.set({ at: 'clear', chips: { pressureChip: 'False', victimChip: 'none' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
