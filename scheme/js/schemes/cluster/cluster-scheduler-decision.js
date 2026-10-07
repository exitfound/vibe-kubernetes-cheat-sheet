import { LANE_DY, P, F, defineCard, laneY, ladder, spread, midX, CLU, LAYOUT, FADE, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-scheduler-decision.md

// Layout A, the Cluster exemplar: actor row clear of the panel, ladder left, chips right, candidate
// Nodes full width at the bottom.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;

const TOP_Y = 60, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
const { out: OUT_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);
const SCHED_W = 232, API_W = 232, ETCD_W = 130, TOP_GAP = 63;
const SCHED_X = 420, SCHED_R = SCHED_X + SCHED_W;
const API_X = SCHED_R + TOP_GAP, API_R = API_X + API_W;
const API_CX = midX(API_X, API_R);
const ETCD_X = API_R + TOP_GAP;
const WIRE_SA_X = midX(SCHED_R, API_X);
const WIRE_AE_X = midX(API_R, ETCD_X);

const ROW_H = 32, ROW_GAP = 12;
// LAYOUT.A of the kit, except CHIP_W.
const LADDER_X = LAYOUT.A.ladder.x, LADDER_W = LAYOUT.A.ladder.w;
const LADDER_Y = 220, LADDER_CX = midX(LADDER_X, LADDER_X + LADDER_W);
// Narrower than the preset: the rest of that column is the only channel down to the Node band,
// and the kubelet lane needs it.
const CHIP_X = LAYOUT.A.chips.x, CHIP_W = 270;
const CHIP_ROW = ladder({ y: LADDER_Y, rowH: ROW_H, gap: ROW_GAP });   // chips share the ladder rhythm
// Each chip centres on its rung.
const CHIP_H = CLU.CHIP_H, CHIP_Y = i => CHIP_ROW(i) - (CHIP_H - ROW_H) / 2;

// The two lanes leaving the API bottom face are a mirrored pair at +-LANE_DX (L-12).
const LANE_DX = 30;
// Below the band midpoint so the left horizontal leg clears the narration panel on every viewport.
const JOG_Y = 190;
const REL_X = API_CX - LANE_DX, WATCH_X = API_CX + LANE_DX;
// A relationship, not a route: the API owns the Pod objects the cycle below reads.
const API_TO_CHAIN = [[REL_X, TOP_BOTTOM], [REL_X, JOG_Y], [LADDER_CX, JOG_Y], [LADDER_CX, LADDER_Y]];
// Centred in the band between the top row and the jog, +4 puts the glyph middle on it. Shared by both labels.
const WIRE_RESP_Y = midX(TOP_BOTTOM, JOG_Y) + 4;

const NODE_Y = 410, NODE_H = 130, NODE_W = 240;
// Fixed width, derived gap.
const NODE_X = spread({ from: CONTENT_L, to: CONTENT_R, count: 4, w: NODE_W }).x;
const VERDICT_Y = 552, VERDICT_H = CHIP_H;

// The Kubelet sits in the channel the narrowed chips open, centred on its Node so both its lanes
// are straight drops. ETCD_W wide so it reads as a top-row peer and not a chip.
const KUBELET_W = ETCD_W, KUBELET_H = TOP_H;
// Centred on the three-chip band.
const KUBELET_Y = midX(CHIP_Y(0), CHIP_Y(2) + CHIP_H) - KUBELET_H / 2;
const NODE4_CX = midX(NODE_X(3), NODE_X(3) + NODE_W);
const KUBELET_X = NODE4_CX - KUBELET_W / 2;
const KUBELET_BOTTOM = KUBELET_Y + KUBELET_H;
const API_TO_KUBELET = [[WATCH_X, TOP_BOTTOM], [WATCH_X, JOG_Y], [NODE4_CX, JOG_Y], [NODE4_CX, KUBELET_Y]];
const KUBELET_TO_NODE = [[NODE4_CX, KUBELET_BOTTOM], [NODE4_CX, NODE_Y]];
// Start-anchored right of the drop: centred, the string runs back over the WATCH_X drop.
const WIRE_WATCH_X = WATCH_X + 14;
const PLACED_X = 912, PLACED_Y = 422, PLACED_W = 216, PLACED_H = 106;
const PLACED_INNER = { dx: 10, dy: 28, w: 196, h: 52 };

// List order is z-order: chips, lanes and Nodes first, the packet layer under the chain, top row last.
export const SCENE = {
  'aria-label': 'Scheduler decision cycle: a Pod taken off the queue, four candidate Nodes filtered and then scored, the winning choice written back through the API into ETCD, and the Kubelet on Node-4 picking the Pod up and running it',
  parts: [
    P.defs(),
    P.chip({ key: 'queueChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'queued pod', value: 'none' }),
    P.chip({ key: 'candChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'candidates', value: 'none' }),
    P.chip({ key: 'winnerChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'winner', value: 'none' }),
    P.arrow({ x1: SCHED_R, y1: OUT_Y, x2: API_X, y2: OUT_Y, dim: true, dashed: true }),
    P.arrow({ x1: API_X, y1: BACK_Y, x2: SCHED_R, y2: BACK_Y, dim: true, dashed: true }),
    P.arrow({ x1: API_R, y1: OUT_Y, x2: ETCD_X, y2: OUT_Y, dim: true, dashed: true }),
    P.arrow({ x1: ETCD_X, y1: BACK_Y, x2: API_R, y2: BACK_Y, dim: true, dashed: true }),
    // A relationship: no arrowhead, no ball.
    P.relation({ points: API_TO_CHAIN }),
    // No key: the routes ride the SAME arrays these are drawn from (A-02).
    P.lane({ points: API_TO_KUBELET, dim: true, dashed: true }),
    P.lane({ points: KUBELET_TO_NODE, dim: true, dashed: true }),
    P.wire({ key: 'req', x: WIRE_SA_X, y: 46 }),
    P.wire({ key: 'resp', x: WIRE_SA_X, y: WIRE_RESP_Y }),
    P.wire({ key: 'persist', x: WIRE_AE_X, y: 46 }),
    P.wire({ key: 'watch', x: WIRE_WATCH_X, y: WIRE_RESP_Y, anchor: 'start' }),
    P.box({ key: 'n1', x: NODE_X(0), y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1', sublabel: 'taint dedicated=db:NoSchedule' }),
    P.box({ key: 'n2', x: NODE_X(1), y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2', sublabel: 'mem unreserved 200Mi (req 800Mi)' }),
    P.box({ key: 'n3', x: NODE_X(2), y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-3', sublabel: 'cpu 40% / mem 60%' }),
    // tune() only captures the two refs the last step hides behind the Pod.
    P.box({
      key: 'n4', x: NODE_X(3), y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-4', sublabel: 'cpu 25% / mem 35%',
      tune: (el, refs) => {
        refs.n4Label = el.querySelector('.scheme-box-label');
        refs.n4Sub = el.querySelector('.scheme-box-sublabel');
      },
    }),
    P.chip({ key: 'v1', x: NODE_X(0), y: VERDICT_Y, w: NODE_W, h: VERDICT_H, name: 'verdict', value: 'none' }),
    P.chip({ key: 'v2', x: NODE_X(1), y: VERDICT_Y, w: NODE_W, h: VERDICT_H, name: 'verdict', value: 'none' }),
    P.chip({ key: 'v3', x: NODE_X(2), y: VERDICT_Y, w: NODE_W, h: VERDICT_H, name: 'verdict', value: 'none' }),
    P.chip({ key: 'v4', x: NODE_X(3), y: VERDICT_Y, w: NODE_W, h: VERDICT_H, name: 'verdict', value: 'none' }),
    // The one actor outside the control plane, above the Node it runs on.
    P.box({
      key: 'kubelet', x: KUBELET_X, y: KUBELET_Y, w: KUBELET_W, h: KUBELET_H,
      label: 'Kubelet', sublabel: 'on Node-4',
    }),
    P.pod({
      key: 'placedPod', id: 'placedPod', innerKey: 'placedPodBox', opacity: 0,
      x: PLACED_X, y: PLACED_Y, w: PLACED_W, h: PLACED_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...PLACED_INNER, label: 'my-app-7d4-abc', sublabel: 'nginx:1.27' },
    }),
    P.packets(),
    // Chain after the packet layer so it renders on top of it.
    P.chain({
      key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. queue   ·  Pod dequeued from SchedulingQueue',
        '2. filter  ·  plugins drop Nodes that fail predicates',
        '3. score   ·  plugins rank survivors 0 to 100',
        '4. bind    ·  POST .../pods/{name}/binding',
      ],
    }),
    P.box({ key: 'sched', x: SCHED_X, y: TOP_Y, w: SCHED_W, h: TOP_H, label: 'Scheduler', sublabel: 'watch unscheduled Pods' }),
    P.box({ key: 'api', x: API_X, y: TOP_Y, w: API_W, h: TOP_H, label: 'API', sublabel: 'pods + binding subresource' }),
    // labelY centres the cylinder label optically under the cap.
    P.cylinder({ key: 'etcdC', x: ETCD_X, y: TOP_Y - 10, w: ETCD_W, h: TOP_H + 20, label: 'ETCD', labelY: 60 }),
  ],
  // placedPod is deliberately NOT in a `pods` list: a clearPodHighlight would wipe inline styles
  // the pulsed picture depends on.
  reset: { keys: ['sched', 'api', 'etcdC', 'kubelet', 'queueChip', 'candChip', 'winnerChip', 'n1', 'n2', 'n3', 'n4', 'v1', 'v2', 'v3', 'v4', 'placedPodBox'] },
};

const POD = 'my-app-7d4-abc';
const SURVIVORS = '2 of 4', WINNER = 'Node-4 · 92';
const DROPPED = OPACITY.notready;
// Long enough to clear Node-4 strings before the Pod fade is legible, so the labels never overlap.
const HANDOVER_MS = 200;
// P-01: a step that does not change a verdict still writes it.
const FILTERED = { v1: 'filtered · taint', v2: 'filtered · resources' };
const SCORED = { ...FILTERED, v3: 'score 78', v4: 'score 92' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { queueChip: 'none', candChip: 'none', winnerChip: 'none', v1: 'none', v2: 'none', v3: 'none', v4: 'none' },
    opacity: { n1: 1, n2: 1, n3: 1, n4: 1, placedPod: 0 },
  },
  {
    id: 'queue',
    duration: 2800,
    narration: 'A new Pod my-app-7d4-abc reaches the Scheduler on its watch with spec.nodeName empty. Until that field is set, no Kubelet will start it. The Scheduler pops it off the active queue and runs one scheduling cycle.',
    chips: { queueChip: POD, candChip: '4 of 4', winnerChip: 'none', v1: 'none', v2: 'none', v3: 'none', v4: 'none' },
    wires: { resp: 'watch ADDED · spec.nodeName=""' },
    opacity: { n1: 1, n2: 1, n3: 1, n4: 1 },
    lit: ['candChip', 'api', 'queueChip'],
    chain: 0,
    rewind: { chips: { queueChip: 'none', candChip: 'none' } },
    // The queue and the stages below are the Scheduler's own work, so nothing travels to the ladder.
    flow: [
      F.segment({ from: [API_X, BACK_Y], to: [SCHED_R, BACK_Y], name: 'watch', lights: ['sched'] }),
      F.set({ at: 'watch', chips: { queueChip: POD, candChip: '4 of 4' } }),
    ],
  },
  {
    id: 'filter',
    duration: 2300,
    narration: 'Filter plugins test each Node against the Pod requirements, and in a large cluster they stop once enough Nodes fit. Node-1 carries a NoSchedule taint without a matching toleration, Node-2 lacks the requested memory. Both are dropped before scoring.',
    chips: { queueChip: POD, candChip: SURVIVORS, winnerChip: 'none', ...FILTERED, v3: 'none', v4: 'none' },
    opacity: { n1: DROPPED, n2: DROPPED, n3: 1, n4: 1 },
    // Filtering is the Scheduler's own work, so the Scheduler lights.
    lit: ['sched', 'candChip', 'v1', 'v2'],
    chain: 1,
    flow: [
      F.fade({ target: 'n1', to: DROPPED, dur: FADE.out, fill: 'forwards' }),
      F.fade({ target: 'n2', to: DROPPED, dur: FADE.out, fill: 'forwards' }),
    ],
  },
  {
    id: 'score',
    // No motion: reading time sets this.
    duration: 2200,
    narration: 'Surviving Nodes are ranked by score plugins like NodeResourcesFit, NodeAffinity and PodTopologySpread. Each returns 0 to 100 per Node and the weighted sum of all of them ranks the Nodes: Node-3 78, Node-4 92. See the Pod Priority and Preemption card.',
    chips: { queueChip: POD, candChip: SURVIVORS, winnerChip: 'none', ...SCORED },
    opacity: { n1: DROPPED, n2: DROPPED },
    // Computed inside the Scheduler: nothing travels, nothing pulses.
    lit: ['n3', 'n4', 'v3', 'v4', 'sched'],
    chain: 2,
  },
  {
    id: 'bind',
    duration: 3000,
    narration: 'Highest score wins, ties broken at random. The Scheduler assumes the placement so the next Pod sees Node-4 as taken. It POSTs a Binding to the binding subresource, not a Pod patch, and the API writes it into ETCD, which acks the Raft commit.',
    chips: { queueChip: POD, candChip: SURVIVORS, winnerChip: WINNER, ...SCORED },
    wires: { req: 'POST .../pods/my-app-7d4-abc/binding', persist: 'spec.nodeName=Node-4 · rv=903' },
    opacity: { n1: DROPPED, n2: DROPPED },
    // v4 follows the Node above it: going dark here reads as the winner being un-chosen.
    lit: ['sched', 'winnerChip', 'n4', 'v4'],
    chain: 3,
    // The API is mid-chain, so it lights on arrival like ETCD.
    flow: [
      F.segment({ from: [SCHED_R, OUT_Y], to: [API_X, OUT_Y], name: 'post', lights: ['api'] }),
      F.segment({ from: [API_R, OUT_Y], to: [ETCD_X, OUT_Y], after: 'post', name: 'persist', lights: ['etcdC'] }),
      F.segment({ from: [ETCD_X, BACK_Y], to: [API_R, BACK_Y], after: 'persist' }),
    ],
  },
  {
    id: 'placed',
    duration: 2800,
    narration: 'The Kubelet on Node-4 watches /api/v1/pods?fieldSelector=spec.nodeName=Node-4, so the write arrives there as an ADDED event. It pulls the image and starts the containers, and the Pod goes from Pending to Running.',
    chips: { queueChip: POD, candChip: SURVIVORS, winnerChip: WINNER, ...SCORED },
    wires: { watch: 'watch ADDED · spec.nodeName=Node-4' },
    // Node-4 own text hides so the inner box reads cleanly inside the slot.
    opacity: { n1: DROPPED, n2: DROPPED, n4Label: 0, n4Sub: 0, placedPod: 1 },
    // The API streams the event, so it stays lit. v4 takes the Node highlight or the winning column
    // ends shaded like a filtered one.
    lit: ['api', 'n4', 'v4', 'placedPodBox'],
    flow: [
      F.route({ points: API_TO_KUBELET, name: 'watch', lights: ['kubelet'] }),
      F.route({ points: KUBELET_TO_NODE, after: 'watch', name: 'start' }),
      // Node-4 text clears on arrival so the frame is never empty and never doubled.
      F.fade({ target: 'n4Label', from: 1, to: 0, dur: HANDOVER_MS, at: 'start', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'n4Sub', from: 1, to: 0, dur: HANDOVER_MS, at: 'start', fill: 'both', easing: 'ease-in' }),
      // Fade and pulse share a delay, the pod-pulse canon.
      F.fade({ target: 'placedPod', from: 0, to: 1, dur: FADE.in, at: 'start', plus: HANDOVER_MS, fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'placedPod', at: 'start', plus: HANDOVER_MS }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
