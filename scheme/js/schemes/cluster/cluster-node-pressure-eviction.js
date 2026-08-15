import { P, F, defineCard, ladder, spread, midX, shade, CLU, LAYOUT, BEAT, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS.md#cluster-node-pressure-eviction

// Layout B: chips left under the panel, ladder right, Node frame full width. Panel x<=397 y<=280
// against a chip column at 296, so 16 units of headroom. CEILING 383 characters. Re-measure.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = midX(CONTENT_L, CONTENT_R);                   // 600, the canvas centre by construction

const KUBE_W = 320, KUBE_H = CLU.BOX_H;                  // 320 / 80
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + KUBE_H;    // 40 / 120
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);                  // 80, both top faces share it
const SPINE_X = CX;                                      // 600, between the two columns
const KUBE_X = SPINE_X - KUBE_W / 2;                     // 440..760
const KUBE_R = KUBE_X + KUBE_W;                          // 760

// Three steps say the Kubelet writes to the API, so the API is drawn. It right-aligns on CONTENT_R,
// leaving the Kubelet on the spine. ONE lane, one direction: no step names anything coming back.
const API_W = CLU.BOX_W, API_X = CONTENT_R - API_W;      // 232 wide, 908..1140

// Slower than FADE.out 700, where the Pod is gone 200ms before its own pulse ends and the kill
// reads as a cut. Ends on OPACITY.terminated, not 0, or it leaves a hole in the Node frame.
const VICTIM_FADE = 1200;
// 834 is the gap midpoint, but the label is NOT contained by that gap: the longest string measures
// 351 against 148, so it overhangs by 102 either side. WIRE_Y sits ABOVE the row for that reason.
const WIRE_X = midX(KUBE_R, API_X);                      // 834, the gap midpoint
const WIRE_Y = TOP_Y - 14;                               // 26, above the row

const COL_BOTTOM = 456;                                  // both columns end here, 16 above the frame
const LADDER_X = LAYOUT.B.ladder.x, LADDER_W = LAYOUT.B.ladder.w;    // 660..1140
const ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP, LADDER_ROWS = 5;
const LADDER_Y = COL_BOTTOM - (LADDER_ROWS * ROW_H + (LADDER_ROWS - 1) * ROW_GAP);   // 256..456

// Chips as a left column, 480 wide: four across the bottom left 258 units and the names
// overlapped their own values.
const CHIP_H = CLU.CHIP_H, CHIP_VGAP = 8, CHIP_COUNT = 4;
const CHIP_X = LAYOUT.B.chips.x, CHIP_W = LAYOUT.B.chips.w;          // 60..540, clear of the spine
const CHIPS_Y = COL_BOTTOM - (CHIP_COUNT * CHIP_H + (CHIP_COUNT - 1) * CHIP_VGAP);   // 296..456
const CHIP_Y = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
// node() draws its own label at NODE_Y + 18, so the Pod row needs the family's 34 of top padding or
// the label lands inside the first Pod. 34 + 106 + 12 is the family 152.
const NODE_H = CLU.NODE.H, NODE_BOTTOM = 624, NODE_Y = NODE_BOTTOM - NODE_H;   // 472..624
const POD_W = 300, POD_H = CLU.NODE.POD_H, POD_Y = NODE_Y + CLU.NODE.POD_DY;   // 506..612
const POD_PAD = 24;
// Fixed WIDTH, derived gap: three 300-wide Pods inset by POD_PAD leave 66 between them.
const POD_X = spread({ from: NODE_X + POD_PAD, to: CONTENT_R - POD_PAD, count: 3, w: POD_W }).x;   // 84/450/816
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// The one lane, addressed to the NODE rather than a Pod inside it. Which Pod the kill lands on is
// carried by the pulse, not by a tap into the Pod row.
const CONNECTOR = [[SPINE_X, TOP_BOTTOM], [SPINE_X, NODE_Y]];

// The Kubelet owns EVERY ladder row, so the tie is a RELATIONSHIP: no ball, no arrowhead, or the
// ladder becomes a destination. Face midpoint to face midpoint, turn halfway between them.
const TIE_X = SPINE_X;                                   // 600
const TIE_LAND_X = midX(LADDER_X, LADDER_X + LADDER_W);  // 900
const TIE_JOG_Y = midX(TOP_BOTTOM, LADDER_Y);            // 188
const KUBE_TO_CHAIN = [[TIE_X, TOP_BOTTOM], [TIE_X, TIE_JOG_Y], [TIE_LAND_X, TIE_JOG_Y], [TIE_LAND_X, LADDER_Y]];

const QOS_LABELS = ['BestEffort', 'Burstable', 'Guaranteed'];

// The list order IS the append order, so it is the z-order: the packet layer sits under the ladder,
// the Node frame and its Pods above it, and the two top-row blocks absolute last.
export const SCENE = {
  'aria-label': 'Node-pressure eviction: detect, condition, rank, evict, relieve',
  parts: [
    P.defs(),
    // Top row: the Kubelet reports to the API on ONE lane at the shared face midpoint y=80.
    P.arrow({ x1: KUBE_R, y1: TOP_CY, x2: API_X, y2: TOP_CY, dim: true, dashed: true }),
    P.wire({ key: 'api', x: WIRE_X, y: WIRE_Y }),
    // State chips, one column in the free band left of the spine and below the panel.
    P.chip({ key: 'memChip',       x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'memory.available', value: '4Gi' }),
    P.chip({ key: 'thresholdChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: '--eviction-hard',  value: 'memory.available<1Gi' }),
    P.chip({ key: 'pressureChip',  x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'MemoryPressure',   value: 'False' }),
    P.chip({ key: 'victimChip',    x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'victim',           value: 'none' }),
    P.lane({ points: CONNECTOR, dim: true, dashed: true }),
    // Kubelet.bottom -> ladder.top: the eviction loop below belongs to this box. See KUBE_TO_CHAIN.
    P.relation({ points: KUBE_TO_CHAIN }),
    P.packets(),
    // Pipeline chain, right of the spine.
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
    // Bottom row: Node-1 container with three Pods of different QoS classes.
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    // Bare `g` wrappers with no class of their own: the id is what tells one Pod's shell and inner
    // box from the next one's, and it is what the fade and the opacity pins address.
    ...QOS_LABELS.map((qos, i) => P.pod({
      key: `pod${i + 1}`, id: `pod${i + 1}`, innerKey: `pod${i + 1}Box`,
      x: POD_X(i), y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'app', sublabel: qos },
    })),
    // Top-row blocks ABSOLUTE LAST.
    P.box({ key: 'kubelet', x: KUBE_X, y: TOP_Y, w: KUBE_W, h: KUBE_H, label: 'Kubelet', sublabel: 'eviction manager + cAdvisor' }),
    P.box({ key: 'api',     x: API_X,  y: TOP_Y, w: API_W,  h: KUBE_H, label: 'API',     sublabel: 'Node and Pod status' }),
  ],
  // All three Pods go to clearHighlights: the card pulses pod1 on rank and pod2/pod3 on relieve,
  // and every one of those pulses has to be taken back off between steps.
  reset: {
    keys: ['kubelet', 'api', 'memChip', 'thresholdChip', 'pressureChip', 'victimChip', 'pod1Box', 'pod2Box', 'pod3Box'],
    pods: ['pod1', 'pod2', 'pod3'],
  },
};

// The lane ends on the Node frame, which is on screen for the whole card, so it is not pinned to the
// presence of any Pod: nothing it points at can go away under it.

const THRESHOLD = 'memory.available<1Gi';
// Every step writes EVERY chip, which is what makes the deferred turnovers safe: Timeline fires
// oncancel and never onfinish, so clicking Next mid-flight loses whatever an F.set was holding.
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
    narration: 'The cAdvisor stats report memory.available has dropped to 500Mi. Eviction manager polls these stats every 10s in its own synchronize loop (separate from cAdvisor housekeeping) and compares against the --eviction-hard signals. The threshold is breached.',
    chips: { memChip: '500Mi', thresholdChip: THRESHOLD, pressureChip: 'False', victimChip: 'none' },
    opacity: LIVE,
    // Local stats comparison: nothing travels and no block flashes, the
    // changed memory.available reading and lit threshold carry the step.
    lit: ['kubelet', 'memChip', 'thresholdChip'],
    chain: 0,
  },
  {
    id: 'condition',
    duration: 2000,
    narration: 'Kubelet PATCHes Node.status.conditions: MemoryPressure flips from False to True. The node controller translates this into a NoSchedule taint (node.kubernetes.io/memory-pressure), so Pods that do not tolerate it can no longer be scheduled here. By default only BestEffort workloads carry no such toleration, the control plane adds it to every Pod in the Burstable or Guaranteed class.',
    chips: { memChip: '500Mi', thresholdChip: THRESHOLD, pressureChip: 'True', victimChip: 'none' },
    wires: { api: 'PATCH Node.status.conditions · MemoryPressure=True' },
    opacity: LIVE,
    lit: ['kubelet', 'pressureChip'],
    chain: 1,
    // The condition flip IS a PATCH, so it rides the lane and the chip waits for it to land: the
    // Node does not carry MemoryPressure until the write reaches the API that stores it.
    rewind: { chips: { pressureChip: 'False' } },
    flow: [
      F.top({ from: KUBE_R, to: API_X, y: TOP_CY, name: 'patch', lights: ['api'] }),
      F.set({ at: 'patch', chips: { pressureChip: 'True' } }),
    ],
  },
  {
    id: 'rank',
    duration: 2200,
    narration: 'Eviction manager ranks running Pods by three things in order: whether each is using more of the starved resource than it requested, then Pod Priority, then how far over the request it sits. QoS class does not decide that order, it only estimates it, because a class derived from CPU and memory says nothing about the resource under pressure. See the Pod QoS Classes card.',
    chips: { memChip: '500Mi', thresholdChip: THRESHOLD, pressureChip: 'True', victimChip: 'BestEffort Pod selected' },
    opacity: LIVE,
    lit: ['kubelet', 'victimChip'],
    chain: 2,
    // The ranking lands on the BestEffort Pod: mark the victim with a pulse. The reduced path has no
    // pulse to show, so it stands the inner box highlight in for it instead.
    reducedLit: ['pod1Box'],
    flow: [F.pulse({ pod: 'pod1', delay: 400 })],
  },
  {
    id: 'evict',
    duration: 2700,
    narration: 'Kubelet evicts the BestEffort Pod itself rather than through the Eviction API, so no PodDisruptionBudget is consulted and the terminationGracePeriodSeconds in the spec is ignored. For hard thresholds the grace period is forced to 0, an immediate SIGKILL, where normal termination gives 30s after SIGTERM. The Pod phase is set to Failed with reason Evicted and reported to the API.',
    chips: { memChip: '500Mi', thresholdChip: THRESHOLD, pressureChip: 'True', victimChip: 'BestEffort Pod evicted' },
    wires: { api: 'PATCH Pod status · phase=Failed reason=Evicted' },
    // Pin final state so cancel does not snap back to opacity 1. The victim stays on screen as a
    // ghost at the terminated shade rather than leaving a hole in the Pod row.
    opacity: { ...LIVE, pod1: GONE },
    lit: ['kubelet', 'victimChip'],
    chain: 3,
    // The chip reads what the step STARTS from, which is what rank left, and turns over on the
    // same beat the Pod dies: evicted is a fact about the kill, not about the SIGKILL leaving.
    rewind: { chips: { victimChip: 'BestEffort Pod selected' } },
    flow: [
      // SIGKILL travels to the node, the victim reacts only on arrival. No delay, so the ball
      // starts visible: routePacket gates its fade-in on a delay above 0.
      F.route({ points: CONNECTOR, name: 'kill' }),
      F.set({ at: 'kill', chips: { victimChip: 'BestEffort Pod evicted' } }),
      F.pulse({ pod: 'pod1', at: 'kill' }),
      F.fade({ target: 'pod1', to: GONE, dur: VICTIM_FADE, at: 'kill' }),
      // The status report is the LAST thing the sentence says, and it can only be sent once the Pod
      // is actually dead, so it leaves after the kill lands rather than alongside it.
      F.top({ from: KUBE_R, to: API_X, y: TOP_CY, after: 'kill', name: 'report', lights: ['api'] }),
    ],
  },
  {
    id: 'relieve',
    duration: 2200,
    narration: 'Memory frees up, and cAdvisor reports memory.available back above the threshold. After --eviction-pressure-transition-period (default 5min) of staying clear, Kubelet flips MemoryPressure back to False. Scheduling resumes for new Pods.',
    chips: { memChip: '3.5Gi', thresholdChip: THRESHOLD, pressureChip: 'False', victimChip: 'none' },
    wires: { api: 'PATCH Node.status.conditions · MemoryPressure=False' },
    // The evicted Pod is still drawn, at the terminated shade: gone from the Node, not a hole.
    opacity: { ...LIVE, pod1: GONE },
    // The victim record clears here too, which is half of what "reset" in ladder row 5 means. It is
    // lit so the drop from "BestEffort Pod evicted" to "none" is not left with nothing marking it.
    lit: ['kubelet', 'memChip', 'pressureChip', 'victimChip'],
    chain: 4,
    // Ladder row 5 is one event, "pressure clears, reset", so both chips hold what evict left and
    // turn over on the same beat: clearing the record before the condition reverses that order.
    rewind: { chips: { pressureChip: 'True', victimChip: 'BestEffort Pod evicted' } },
    // Survivors pulse first, and only THEN does the condition flip back: the up-arrow order, and
    // also the sentence order. Firing both at once gives the eye two places to look.
    flow: [
      F.pulse({ pod: 'pod2' }),
      F.pulse({ pod: 'pod3' }),
      F.top({ from: KUBE_R, to: API_X, y: TOP_CY, delay: BEAT.afterPulse, name: 'clear', lights: ['api'] }),
      F.set({ at: 'clear', chips: { pressureChip: 'False', victimChip: 'none' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
