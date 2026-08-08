import { P, F, defineCard, laneY, ladder, spread, midX, LAYOUT, FADE, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS.md#cluster-scheduler-decision

// Layout A, the Cluster exemplar: actor row clear of the panel, ladder left, chips right, candidate
// Nodes full width at the bottom. Panel x<=397 y<=180, and JOG_Y sits on that line.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
// Reserved narration corner: 400 x 180. Nothing on this card derives from it, and the measured
// worst case per viewport is in the header note above.

const TOP_Y = 60, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;    // 60 / 140
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);                  // 100
const LANE_DY = 15;
const { out: OUT_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);  // 85 / 115
const SCHED_W = 190, API_W = 300, ETCD_W = 130, TOP_GAP = 50;
const SCHED_X = 420, SCHED_R = SCHED_X + SCHED_W;        // 420..610
const API_X = SCHED_R + TOP_GAP, API_R = API_X + API_W;  // 660..960
const API_CX = midX(API_X, API_R);                       // 810
const ETCD_X = API_R + TOP_GAP;                          // 1010..1140
const WIRE_SA_X = midX(SCHED_R, API_X);                  // 635
const WIRE_AE_X = midX(API_R, ETCD_X);                   // 985

const ROW_H = 32, ROW_GAP = 12;
// LAYOUT.A of the kit, which this card is the exemplar of: ladder in the left column, state chips
// in the right, both 480 wide.
const LADDER_X = LAYOUT.A.ladder.x, LADDER_W = LAYOUT.A.ladder.w;      // 60..540
const LADDER_Y = 220, LADDER_CX = midX(LADDER_X, LADDER_X + LADDER_W); // 220, 300
const CHIP_X = LAYOUT.A.chips.x, CHIP_W = LAYOUT.A.chips.w;            // 480, 660..1140
const CHIP_Y = ladder({ y: LADDER_Y, rowH: ROW_H, gap: ROW_GAP });     // chips share the ladder rhythm

// A relationship, not a route: the API owns the Pod objects the cycle below reads. Face midpoint to
// face midpoint, turn halfway between them rather than hugging the ladder.
const JOG_Y = midX(TOP_BOTTOM, LADDER_Y);    // 180
const API_TO_CHAIN = [[API_CX, TOP_BOTTOM], [API_CX, JOG_Y], [LADDER_CX, JOG_Y], [LADDER_CX, LADDER_Y]];
// Centred in the band between the top row and that dashed jog, not pinned under the boxes: the +4
// puts the glyph MIDDLE on the band centre, where y=158 sat 7 under the row and 19 clear of the jog.
const WIRE_RESP_Y = midX(TOP_BOTTOM, JOG_Y) + 4;         // 164, visual centre 160.1 against 160

const NODE_Y = 410, NODE_H = 130, NODE_W = 240;
// Fixed WIDTH, derived gap: four 240-wide Nodes spanning the content band leave 40 between them.
const NODE_X = spread({ from: CONTENT_L, to: CONTENT_R, count: 4, w: NODE_W }).x;   // 60/340/620/900
const VERDICT_Y = 552, VERDICT_H = 32;
const PLACED_X = 912, PLACED_Y = 422, PLACED_W = 216, PLACED_H = 106;
const PLACED_INNER = { dx: 10, dy: 28, w: 196, h: 52 };

// The list order IS the append order, so it is the z-order: chips, lanes and the Node row first, the
// packet layer under the chain, and the three top-row blocks absolute last.
export const SCENE = {
  'aria-label': 'Scheduler decision cycle: queue, filter, score, bind',
  parts: [
    P.defs(),
    // State chips in the right column, one per ladder row so the two columns share a rhythm.
    P.chip({ key: 'queueChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: ROW_H, name: 'queued pod', value: 'none' }),
    P.chip({ key: 'candChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: ROW_H, name: 'candidates', value: 'none' }),
    P.chip({ key: 'winnerChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: ROW_H, name: 'winner', value: 'none' }),
    // Top-row arrows (out at y=85, return at y=115), all dashed.
    P.arrow({ x1: SCHED_R, y1: OUT_Y, x2: API_X, y2: OUT_Y, dim: true, dashed: true }),
    P.arrow({ x1: API_X, y1: BACK_Y, x2: SCHED_R, y2: BACK_Y, dim: true, dashed: true }),
    P.arrow({ x1: API_R, y1: OUT_Y, x2: ETCD_X, y2: OUT_Y, dim: true, dashed: true }),
    P.arrow({ x1: ETCD_X, y1: BACK_Y, x2: API_R, y2: BACK_Y, dim: true, dashed: true }),
    // Api.bottom -> pipeline.top. No arrowhead and no ball: it states that the cycle below works on
    // the Pod objects the API holds, it does not carry traffic.
    P.relation({ points: API_TO_CHAIN }),
    // Wire labels at fixed positions, populated per step.
    P.wire({ key: 'req', x: WIRE_SA_X, y: 46 }),
    P.wire({ key: 'resp', x: WIRE_SA_X, y: WIRE_RESP_Y }),
    P.wire({ key: 'persist', x: WIRE_AE_X, y: 46 }),
    // Bottom row: 4 candidate Nodes side-by-side on the derived spread.
    P.box({ key: 'n1', x: NODE_X(0), y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1', sublabel: 'taint dedicated=db:NoSchedule' }),
    P.box({ key: 'n2', x: NODE_X(1), y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2', sublabel: 'mem free 200Mi (req 800Mi)' }),
    P.box({ key: 'n3', x: NODE_X(2), y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-3', sublabel: 'cpu 40% / mem 60%' }),
    // Node-4 is the one whose own text has to stay reachable: `placed` hides it behind the Pod.
    // tune() only CAPTURES two refs here, it changes nothing the builder made.
    P.box({
      key: 'n4', x: NODE_X(3), y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-4', sublabel: 'cpu 25% / mem 35%',
      tune: (el, refs) => {
        refs.n4Label = el.querySelector('.scheme-box-label');
        refs.n4Sub = el.querySelector('.scheme-box-sublabel');
      },
    }),
    // A verdict chip below each Node. P-15 asked for a literal per chip because prose.mjs seeded on
    // one. A spec is read by import now, so these four are written out for their refs, not for that.
    P.chip({ key: 'v1', x: NODE_X(0), y: VERDICT_Y, w: NODE_W, h: VERDICT_H, name: 'verdict', value: 'none' }),
    P.chip({ key: 'v2', x: NODE_X(1), y: VERDICT_Y, w: NODE_W, h: VERDICT_H, name: 'verdict', value: 'none' }),
    P.chip({ key: 'v3', x: NODE_X(2), y: VERDICT_Y, w: NODE_W, h: VERDICT_H, name: 'verdict', value: 'none' }),
    P.chip({ key: 'v4', x: NODE_X(3), y: VERDICT_Y, w: NODE_W, h: VERDICT_H, name: 'verdict', value: 'none' }),
    // The Pod the cycle places, hidden until the last step. Inner box matches the workloads canon
    // for a 216-wide shell: 10px side insets (w=196).
    P.pod({
      key: 'placedPod', id: 'placedPod', innerKey: 'placedPodBox', opacity: 0,
      x: PLACED_X, y: PLACED_Y, w: PLACED_W, h: PLACED_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...PLACED_INNER, label: 'my-app-7d4-abc', sublabel: 'nginx:1.27' },
    }),
    P.packets(),
    // Chain LAST among middle blocks so it renders on top of packetLayer.
    P.chain({
      key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. queue   ·  Pod dequeued from SchedulingQueue',
        '2. filter  ·  plugins drop Nodes that fail predicates',
        '3. score   ·  plugins rank survivors 0 to 100',
        '4. bind    ·  POST .../pods/{name}/binding',
      ],
    }),
    // Top-row blocks ABSOLUTE LAST.
    P.box({ key: 'sched', x: SCHED_X, y: TOP_Y, w: SCHED_W, h: TOP_H, label: 'Scheduler', sublabel: 'watch unscheduled Pods' }),
    P.box({ key: 'api', x: API_X, y: TOP_Y, w: API_W, h: TOP_H, label: 'API', sublabel: 'pods + binding subresource' }),
    // labelY centres the cylinder label optically: the default h/2 baseline reads high under the cap,
    // and a full nudge to the body-below-cap centre reads low. y=60 (glyph centre ~106) balances both.
    P.cylinder({ key: 'etcdC', x: ETCD_X, y: TOP_Y - 10, w: ETCD_W, h: TOP_H + 20, label: 'ETCD', labelY: 60 }),
  ],
  // placedPod is deliberately NOT in a `pods` list: the card pulses it and never clears the pulse,
  // and a clearPodHighlight here would wipe four inline styles the picture depends on.
  reset: { keys: ['sched', 'api', 'etcdC', 'queueChip', 'candChip', 'winnerChip', 'n1', 'n2', 'n3', 'n4', 'v1', 'v2', 'v3', 'v4', 'placedPodBox'] },
};

const POD = 'my-app-7d4-abc';
const SURVIVORS = '2 of 4', WINNER = 'Node-4 · 92';
const DROPPED = OPACITY.notready;
// P-01: a step that does not CHANGE a verdict still writes it. Nothing resets a scene between two
// forward steps, so these are the values already on the four chips, restated rather than inherited.
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
    // Watch event flows Api -> Scheduler on the return lane at y=115. The queue and the three
    // stages below it are the Scheduler's own work, so nothing travels down to the ladder.
    flow: [F.segment({ from: [API_X, BACK_Y], to: [SCHED_R, BACK_Y], lights: ['sched'] })],
  },
  {
    id: 'filter',
    duration: 2300,
    narration: 'Filter plugins test each Node against the Pod requirements, and in a large cluster they stop once enough Nodes fit. Node-1 carries a NoSchedule taint without a matching toleration, Node-2 lacks the requested memory. Both are dropped before scoring.',
    chips: { queueChip: POD, candChip: SURVIVORS, winnerChip: 'none', ...FILTERED, v3: 'none', v4: 'none' },
    // Pin final opacity inline so cancel between steps does not flash to default.
    opacity: { n1: DROPPED, n2: DROPPED, n3: 1, n4: 1 },
    // Filtering is the Scheduler's own work (the Api is not involved), so the Scheduler lights up.
    lit: ['sched', 'candChip', 'v1', 'v2'],
    chain: 1,
    flow: [
      F.fade({ target: 'n1', to: DROPPED, dur: FADE.out, fill: 'forwards' }),
      F.fade({ target: 'n2', to: DROPPED, dur: FADE.out, fill: 'forwards' }),
    ],
  },
  {
    id: 'score',
    // 1400ms was the shortest step on the card and it carries the densest text with no motion at
    // all, so nothing but reading time sets it: 2200 matches the packet-less pace of the siblings.
    duration: 2200,
    narration: 'Surviving Nodes are ranked by score plugins like NodeResourcesFit, NodeAffinity and PodTopologySpread. Each returns 0 to 100 for a Node and the weighted sum is the final score: Node-3 gets 78, Node-4 gets 92. See the Pod Priority and Preemption card.',
    chips: { queueChip: POD, candChip: SURVIVORS, winnerChip: 'none', ...SCORED },
    opacity: { n1: DROPPED, n2: DROPPED },
    // Computed inside the Scheduler, so nothing travels and nothing pulses: the verdicts settle
    // via the static highlight. The Scheduler lights because the step is its own work.
    lit: ['n3', 'n4', 'v3', 'v4', 'sched'],
    chain: 2,
  },
  {
    id: 'bind',
    // Three hops now, span 2860: 2400 would have cut the commit ack off mid-flight.
    duration: 3000,
    narration: 'Highest score wins, ties broken at random. The Scheduler assumes the placement so the next Pod sees Node-4 as taken. It POSTs a Binding to the binding subresource, not a Pod patch, and the API writes it into ETCD, which acks the Raft commit.',
    chips: { queueChip: POD, candChip: SURVIVORS, winnerChip: WINNER, ...SCORED },
    wires: { req: 'POST .../pods/my-app-7d4-abc/binding', persist: 'spec.nodeName=Node-4 · rv=903' },
    opacity: { n1: DROPPED, n2: DROPPED },
    // v4 is lit on score and lit on placed, so it stays lit here: the verdict chip follows the Node
    // above it, and going dark for one step in the middle read as the winner being un-chosen.
    lit: ['sched', 'winnerChip', 'n4', 'v4'],
    chain: 3,
    // Three hops: binding POST, persist, then the commit ack home. The Api is MID-CHAIN, so it
    // lights on arrival like ETCD. The ack is what rv=903 on the persist wire is.
    flow: [
      F.segment({ from: [SCHED_R, OUT_Y], to: [API_X, OUT_Y], name: 'post', lights: ['api'] }),
      F.segment({ from: [API_R, OUT_Y], to: [ETCD_X, OUT_Y], after: 'post', name: 'persist', lights: ['etcdC'] }),
      F.segment({ from: [ETCD_X, BACK_Y], to: [API_R, BACK_Y], after: 'persist' }),
    ],
  },
  {
    id: 'placed',
    duration: 2200,
    narration: 'The Kubelet on Node-4 watches /api/v1/pods?fieldSelector=spec.nodeName=Node-4, so the write arrives there as an ADDED event. It pulls the image and starts the containers, and the Pod goes from Pending to Running.',
    chips: { queueChip: POD, candChip: SURVIVORS, winnerChip: WINNER, ...SCORED },
    // Hide node-4's own label and sublabel so the inner box reads cleanly inside the slot, and pin
    // the placed Pod's final state inline so cancel returns to the right value, not default.
    opacity: { n1: DROPPED, n2: DROPPED, n4Label: 0, n4Sub: 0, placedPod: 1 },
    // The verdict chip belongs to the Node above it, so it takes the same highlight: without it
    // the winning column ended with a lit frame over a chip shaded like the two filtered ones.
    lit: ['n4', 'v4', 'placedPodBox'],
    flow: [
      // The placed Pod fades in and pulses together (shared delay), matching the
      // workloads pod-pulse canon, instead of pulsing a beat after the fade.
      F.fade({ target: 'placedPod', from: 0, to: 1, dur: FADE.in, fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'placedPod' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
