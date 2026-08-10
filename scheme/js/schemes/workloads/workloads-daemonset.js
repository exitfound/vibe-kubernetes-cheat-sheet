import { P, F, defineCard, ladder, laneY, midX, strip, WL, LAYOUT, FADE, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-daemonset

// Layout B of the Workloads canon (WL): chips left, pipeline right, a bus tapping every Pod.
// Panel x<=397 y<=230; a longer narration invalidates that measurement.
const PANEL_B = 230;
const TOP1_X = 420, TOP1_W = 220;
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = 220;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(TOP1_X + TOP1_W, TOP2_X);
const WIRE_Y = WL.TOP_Y - 12;                            // above the actor row, off the spine

// LAYOUT.B of the kit, which this card is on: chips in the LEFT column, pipeline in the RIGHT.
// WL.L-06 picks A / B / C against THIS card's measured panel bottom, and B is the one that fits.
const LAD_X = LAYOUT.B.ladder.x, LAD_W = LAYOUT.B.ladder.w;    // 660..1140, the pipeline
const LAD_Y = 160;                                       // 5 rows -> 160..360

// Chips as a column in the left band, which only opens below the panel.
const CHIP_GAP = 8;
const CHIPS_TOP = PANEL_B + 20;                          // 250
const CHIP_X = LAYOUT.B.chips.x, CHIP_W = LAYOUT.B.chips.w;    // 60..540
const CHIP_Y = ladder({ y: CHIPS_TOP, rowH: WL.CHIP_H, gap: CHIP_GAP });   // 250..376

const NODE_H = 140, CANVAS_B = 624;
const NODE_Y = CANVAS_B - NODE_H;                        // 484..624, the frames rest on the floor
const POD_H = 106, POD_Y = NODE_Y + 22;                  // 506..612
const POD_INNER = { dy: 28, h: 52 };

// Four Node frames laid across the content width, so the row centres on CX by construction.
const NODE_N = 4, NODE_GAP = 24;
const NODES = strip({ from: WL.L, to: WL.R, count: NODE_N, gap: NODE_GAP });
const N_W = NODES.w, N_X = NODES.x;                      // 252 wide, at 60 / 336 / 612 / 888
const N_POD_DX = 12, N_INNER_DX = 22;                    // Pod and container insets in the frame
const N_POD_W = N_W - N_POD_DX * 2, N_INNER_W = N_W - N_INNER_DX * 2;
const POD_CX = i => N_X(i) + N_W / 2;                    // 186 / 462 / 738 / 1014

// The trunk leaves the actor on its own midpoint, steps into the central corridor and drops to a bus
// above the Pod row. One tap per Pod, so every lane ends ON a Pod, not on the frame edge above it.
const TOP1_CX = TOP1_X + TOP1_W / 2;                     // 530
const JOG_Y = WL.TOP_BOTTOM + 20;                        // 140, below the boxes, above the ladder
const BUS_Y = NODE_Y - 24;                               // 460, clear of the chip column
const TRUNK = [[TOP1_CX, WL.TOP_BOTTOM], [TOP1_CX, JOG_Y], [WL.SPINE_X, JOG_Y], [WL.SPINE_X, BUS_Y]];
const LANE = i => [...TRUNK, [POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]];

const NODE_JOIN_DELAY = 200;                             // Node-4 fades in a beat before its Pod

// The list order IS the append order, so it is the z-order: the two top arrows, the wire label and
// the chip column first, then the four lanes and the packet layer, and chain / Nodes / Pods / actor
// row above the ball.
export const SCENE = {
  'aria-label': 'DaemonSet controller: keeps exactly one Pod on every matching Node, adds a Pod when a Node joins and removes one when a Node leaves',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WIRE_Y }),
    // State chips in the left band.
    P.chip({ key: 'desiredChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'desiredNumberScheduled', value: '3' }),
    P.chip({ key: 'currentChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'currentNumberScheduled', value: '0' }),
    P.chip({ key: 'readyChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'numberReady', value: '0' }),
    P.chip({ key: 'focusChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'focus', value: 'selector: app=fluentd' }),
    // One drawn lane per Pod. They share the trunk and the bus, so the four paths coincide
    // there and read as a single wiring tree with four arrowheads. Lane 3 starts pinned out:
    // Node-4 has not joined yet.
    ...[0, 1, 2, 3].map(i => P.lane({ key: `lane${i}`, points: LANE(i), dim: true, dashed: true, role: 'cluster', opacity: i === 3 ? 0 : undefined })),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. spec      ·  one Pod per node, selector + tolerations',
        '2. place     ·  create a Pod on every matching node',
        '3. node join ·  new node, desiredNumberScheduled++, add Pod',
        '4. update    ·  RollingUpdate maxUnavailable=1, one by one',
        '5. drain     ·  node gone, its Pod deleted, not rescheduled',
      ],
    }),
    // Four node slots across the bottom band. Node-4 starts hidden and joins in step 3.
    P.node({ key: 'node1El', x: N_X(0), y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'node2El', x: N_X(1), y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-2' }),
    P.node({ key: 'node3El', x: N_X(2), y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-3' }),
    P.node({ key: 'node4El', x: N_X(3), y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-4', opacity: 0 }),
    // Born invisible: every step pins all four Pods, and step 2 is the one that creates the first three.
    ...[0, 1, 2, 3].map(i => P.pod({
      key: `pod${i + 1}`, id: `pod${i + 1}`, innerKey: `pod${i + 1}Box`,
      x: N_X(i) + N_POD_DX, y: POD_Y, w: N_POD_W, h: POD_H, label: 'fluentd', sublabel: '', containers: 0,
      opacity: 0,
      inner: { dx: N_INNER_DX - N_POD_DX, dy: POD_INNER.dy, w: N_INNER_W, h: POD_INNER.h, label: 'fluentd', sublabel: 'log agent' },
    })),
    P.box({ key: 'apiserver', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'watch Nodes · Pod CRUD', role: 'cluster' }),
    P.box({ key: 'daemonset', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'DaemonSet', sublabel: '', role: 'cluster' }),
  ],
  reset: {
    keys: ['daemonset', 'apiserver', 'desiredChip', 'currentChip', 'readyChip', 'focusChip', 'pod1Box', 'pod2Box', 'pod3Box', 'pod4Box'],
    pods: ['pod1', 'pod2', 'pod3', 'pod4'],
  },
};

// setLanes and the four Pod pins as FIELDS: the whole node row is written in ONE place, so no step
// can leave a lane pointing into a Node that is not in the cluster, or a Pod on a Node that is.
// Key order is the order the imperative writers used: Pods first, then their lanes.
const row = (pods, lanes) => ({
  ...Object.fromEntries(pods.map((v, i) => [`pod${i + 1}`, v])),
  ...Object.fromEntries(lanes.map((v, i) => [`lane${i}`, v])),
});

// One create per matching Node, each riding its own tap off the bus, so every Pod that materializes
// has a ball that actually reached it. The two counters climb PER ARRIVAL, and the rank each landing
// writes is a LITERAL because `routeDur` is length-based and so the arrival order is fixed geometry:
// taps 1 and 2 sit 138 units off the spine (594 units of lane, 1320ms) and land together, tap 0 sits
// 414 off (870 units, 1933ms) and lands last. Registration order breaks the tie, so the three
// landings are ranked 1, 2, 3 in the order tap-1, tap-2, tap-0.
const create = (i, rank) => [
  F.route({ points: LANE(i), after: 'req', name: `create${i}` }),
  F.fade({ target: `pod${i + 1}`, from: 0, to: 1, dur: FADE.in, at: `create${i}`, fill: 'both', easing: 'ease-out' }),
  F.pulse({ pod: `pod${i + 1}`, at: `create${i}` }),
  F.set({ at: `create${i}`, chips: { currentChip: rank, readyChip: rank } }),
];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { desiredChip: '3', currentChip: '0', readyChip: '0', focusChip: 'selector: app=fluentd' },
    opacity: { ...row([0, 0, 0, 0], [1, 1, 1, 0]), node2El: 1, node4El: 0 },
    chain: 0,
  },
  {
    id: 'place',
    duration: 3800,
    narration: 'The controller sees three matching Nodes and zero Pods, so it creates one Pod on each through the API and the local Kubelet starts it. A DaemonSet places exactly one Pod per Node, never a second, so the count follows the Nodes themselves rather than a fixed replica number you set.',
    // The step starts from what it narrates, three matching Nodes and ZERO Pods, so both counts
    // are 0 here and are raised one at a time as the creates land.
    chips: { desiredChip: '3', currentChip: '0', readyChip: '0', focusChip: 'one Pod per matching node' },
    wires: { req: 'create one Pod per matching node' },
    // Pin final opacities so a step change does not revert the Pods to the built 0.
    opacity: { ...row([1, 1, 1, 0], [1, 1, 1, 0]), node4El: 0 },
    lit: ['focusChip', 'daemonset', 'currentChip', 'readyChip'],
    // The animated path says the three creates arrived by PULSING their Pods, which no `lights`
    // list can name: the static path has to say it with the inner boxes instead.
    reducedLit: ['pod1Box', 'pod2Box', 'pod3Box'],
    chain: 1,
    flow: [
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'req', lights: ['apiserver'] }),
      ...create(0, '3'),
      ...create(1, '1'),
      ...create(2, '2'),
    ],
  },
  {
    id: 'node-join',
    // Motion: Node-4 fades in (200 + 600), the Node watch event reaches the controller (700), the
    // create goes out (700), the Pod rides its lane and pulses on arrival, ending at 5233.
    duration: 5400,
    narration: 'A new worker Node-4 joins the cluster and turns Ready. The DaemonSet controller watches Node objects, recomputes desiredNumberScheduled to four, and creates a Pod on Node-4 alone. No other Node is disturbed. Automatic per-node placement is the whole reason a DaemonSet exists.',
    chips: { desiredChip: '4', currentChip: '4', readyChip: '4', focusChip: 'Node-4 joined, Pod added' },
    wires: { req: 'watch Node added · desiredNumberScheduled 3 to 4' },
    // Pin final: the three existing Pods plus Node-4 and its new Pod are present.
    opacity: { ...row([1, 1, 1, 1], [1, 1, 1, 1]), node4El: 1 },
    lit: ['readyChip', 'focusChip', 'desiredChip', 'currentChip'],
    // pod4 appears on arrival and the animated path pulses it there, so the static path says it here.
    reducedLit: ['pod4Box'],
    chain: 2,
    // The node joins FIRST, and the controller learns of it by watching Node objects, so it stays
    // dark until that event lands. Only then does the create go out.
    rewind: { opacity: { node4El: 0, pod4: 0, lane3: 0 } },
    flow: [
      F.fade({ target: 'node4El', from: 0, to: 1, dur: FADE.in, delay: NODE_JOIN_DELAY, fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'lane3', from: 0, to: 1, dur: FADE.in, delay: NODE_JOIN_DELAY, fill: 'both', easing: 'ease-out' }),
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, delay: NODE_JOIN_DELAY + FADE.in, name: 'watch', lights: ['daemonset'] }),
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, after: 'watch', name: 'req', lights: ['apiserver'] }),
      F.route({ points: LANE(3), after: 'req', name: 'create' }),
      F.fade({ target: 'pod4', from: 0, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'pod4', at: 'create' }),
    ],
  },
  {
    id: 'update',
    duration: 3800,
    narration: 'The image is bumped from fluentd v1 to v2. The RollingUpdate strategy with maxUnavailable=1 deletes and recreates the Pods one Node at a time, never taking more than one down at once, so log collection keeps running on the rest. The OnDelete strategy would instead wait until you delete each Pod by hand.',
    chips: { desiredChip: '4', currentChip: '4', readyChip: '3 / 4 updating', focusChip: 'RollingUpdate · maxUnavailable=1' },
    wires: { req: 'RollingUpdate · maxUnavailable=1 · v1 to v2' },
    // maxUnavailable=1 means exactly ONE Pod is down at a time, which the chip counts. The one
    // being recreated holds the notready shade while its Node stays present.
    opacity: { ...row([OPACITY.notready, 1, 1, 1], [1, 1, 1, 1]), node4El: 1 },
    lit: ['daemonset', 'readyChip', 'focusChip'],
    reducedLit: ['pod1Box'],
    chain: 3,
    // It is at full strength until the delete reaches it, then it drops: the ball is what takes it
    // down, so the shade must not be there before the ball arrives.
    rewind: { opacity: { pod1: 1 } },
    flow: [
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'req' }),
      F.route({ points: LANE(0), after: 'req', name: 'update' }),
      F.pulse({ pod: 'pod1', at: 'update' }),
      F.fade({ target: 'pod1', from: 1, to: OPACITY.notready, dur: FADE.out, at: 'update', fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'drain',
    duration: 2400,
    narration: 'Node-2 is drained and leaves the cluster. Its DaemonSet Pod is deleted and, unlike a Deployment replica, it is not recreated on another Node. A DaemonSet keeps exactly one Pod per Node and every surviving Node already has one, so desiredNumberScheduled simply drops back to three.',
    chips: { desiredChip: '3', currentChip: '3', readyChip: '3', focusChip: 'Node-2 gone, Pod not rescheduled' },
    wires: { req: 'Node-2 removed · delete its Pod · no reschedule' },
    // Pin final: Node-2 and its Pod are gone, the other three Pods and Node-4 remain. A lane into a
    // Node that is not in the cluster points at nothing, so lane 1 goes with it.
    opacity: { ...row([1, 0, 1, 1], [1, 0, 1, 1]), node4El: 1, node2El: OPACITY.terminated },
    lit: ['currentChip', 'readyChip', 'focusChip', 'daemonset', 'desiredChip'],
    chain: 4,
    // The delete reaches Node-2 down its own tap. pod2 pulses then fades out, Node-2 dims
    // as it leaves the cluster, and the lane into it goes with it.
    rewind: { opacity: { pod2: 1, node2El: 1, lane1: 1 } },
    flow: [
      F.route({ points: LANE(1), name: 'del' }),
      F.pulse({ pod: 'pod2', at: 'del' }),
      F.fade({ target: 'pod2', from: 1, to: 0, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'node2El', from: 1, to: OPACITY.terminated, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'lane1', from: 1, to: 0, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
