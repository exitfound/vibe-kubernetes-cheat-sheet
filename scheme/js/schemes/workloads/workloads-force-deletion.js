import { P, F, defineCard, ladder, laneY, midX, WL, LAYOUT, FADE, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-force-deletion

// Layout B of the Workloads canon (WL): chips left, pipeline right, one trunk, one tap per Node.
// Panel worst case x<=397, y<=280; a longer narration invalidates that measurement.
const PANEL_B = 280;
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
const CHIPS_TOP = PANEL_B + 20;                          // 300
const CHIP_X = LAYOUT.B.chips.x, CHIP_W = LAYOUT.B.chips.w;    // 60..540
const CHIP_Y = ladder({ y: CHIPS_TOP, rowH: WL.CHIP_H, gap: CHIP_GAP });   // 300..460

const NODE_H = 134, CANVAS_B = 624;
const NODE_Y = CANVAS_B - NODE_H;                        // 490..624, the frames rest on the floor
const POD_W = 300, POD_H = 106;
const POD_Y = NODE_Y + (NODE_H - POD_H) / 2;             // 504..610, centred in the frame
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// Two Node frames side by side, the pair filling the content width so it centres on CX.
const NODE_GAP = 40;
const N_W = (WL.W - NODE_GAP) / 2;                       // 520
const N_A_X = WL.L, N_B_X = WL.L + N_W + NODE_GAP;       // 60..580 / 620..1140
const P_A_X = N_A_X + (N_W - POD_W) / 2;                 // 170
const P_B_X = N_B_X + (N_W - POD_W) / 2;                 // 730
const P_A_CX = P_A_X + POD_W / 2, P_B_CX = P_B_X + POD_W / 2;   // 320 / 880, mirrored about CX

// BOTH node-band actions leave the API box. The trunk steps into the corridor, drops to a bus below
// the chip column and taps down into the Pod each step addresses.
const TOP2_CX = TOP2_X + TOP2_W / 2;                     // 810
const JOG_Y = WL.TOP_BOTTOM + 20;                        // 140, below the boxes, above the ladder
const BUS_Y = NODE_Y - 15;                               // 475, between the chip column and the frames
const TRUNK = [[TOP2_CX, WL.TOP_BOTTOM], [TOP2_CX, JOG_Y], [WL.SPINE_X, JOG_Y], [WL.SPINE_X, BUS_Y]];
const NODE1_LANE = [...TRUNK, [P_A_CX, BUS_Y], [P_A_CX, POD_Y]];
const NODE2_LANE = [...TRUNK, [P_B_CX, BUS_Y], [P_B_CX, POD_Y]];

// The list order IS the append order, so it is the z-order: the two top arrows, the wire label and
// the two lanes first, then the chip column, the packet layer, and chain / Nodes / Pods / actor row
// above the ball.
export const SCENE = {
  'aria-label': 'Force deletion and stuck Terminating Pods: an unreachable Node leaves a Pod stuck, force delete risks two live instances',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WIRE_Y }),
    // Both balls ride the lane that is actually drawn under them: same points array, no second copy.
    P.lane({ key: 'connector', points: NODE1_LANE, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'connectorRight', points: NODE2_LANE, dim: true, dashed: true, role: 'cluster' }),
    // State chips in the left band.
    P.chip({ key: 'nodeChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'node-1', value: 'Ready' }),
    P.chip({ key: 'podChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'Pod A', value: 'Running' }),
    P.chip({ key: 'replicaChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'StatefulSet', value: 'replicas 1/1' }),
    P.chip({ key: 'focusChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'focus', value: 'none' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. node lost   ·  Kubelet heartbeats stop, Node NotReady',
        '2. terminating ·  deletionTimestamp set, Kubelet cannot ack',
        '3. stuck       ·  identity held, no replacement is made',
        '4. force       ·  --grace-period=0 --force drops it from etcd',
        '5. risk        ·  partitioned node may still run the old one',
      ],
    }),
    P.node({ key: 'node1', x: N_A_X, y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'node2', x: N_B_X, y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-2' }),
    P.pod({
      key: 'podOld', id: 'podOld', innerKey: 'podOldBox',
      x: P_A_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod A', sublabel: '', containers: 0,
      // No build-time opacity: every step pins Pod A's own, and the poster frame is `idle`.
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'StatefulSet Pod' },
    }),
    P.pod({
      key: 'podNew', id: 'podNew', innerKey: 'podNewBox',
      x: P_B_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod B', sublabel: '', containers: 0,
      // Born invisible: the replacement does not exist until the identity is freed.
      opacity: 0,
      inner: { dx: POD_INNER.dx, dy: POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'recreated replica' },
    }),
    P.box({ key: 'kubectl', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'kubectl', sublabel: 'delete pod pod-a', role: 'cluster' }),
    P.box({ key: 'api', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'deletionTimestamp + etcd', role: 'cluster' }),
  ],
  reset: {
    keys: ['kubectl', 'api', 'nodeChip', 'podChip', 'replicaChip', 'focusChip', 'podOldBox', 'podNewBox'],
    pods: ['podOld', 'podNew'],
  },
};

// setPods as FIELDS: each lane is pinned together with the Pod it lands on. Only the right-hand
// pair was ever set, so the Node-1 lane kept a full-opacity arrowhead on a Pod that had already
// dimmed away. Key order is the order the helper wrote them in.
const podPair = (oldV, newV) => ({ podOld: oldV, connector: oldV, podNew: newV, connectorRight: newV });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { nodeChip: 'Ready', podChip: 'Running', replicaChip: 'replicas 1/1', focusChip: 'none' },
    opacity: podPair(1, 0),
    chain: -1,
  },
  {
    id: 'node-lost',
    duration: 3000,
    narration: 'Node-1 stops posting Kubelet heartbeats, from a kernel panic, a power loss or a network partition. After node-monitor-grace-period, 50s by default, the node controller sets the Node Ready condition to Unknown and marks Node-1 NotReady. The control plane can no longer observe what Pod A is actually doing.',
    chips: { nodeChip: 'NotReady (Unknown)', podChip: 'Running (last seen)', replicaChip: 'replicas 1/1', focusChip: 'heartbeat lost' },
    wires: { req: 'Node controller: Ready → Unknown' },
    // Node-1 is now unobservable: the Pod is alive but nothing observes it.
    opacity: podPair(OPACITY.notready, 0),
    lit: ['podChip', 'focusChip', 'api', 'nodeChip'],
    chain: 0,
    flow: [
      // The node controller reaches toward Node-1 over the connector. When the
      // packet arrives the Pod pulses and dims to its unobservable shade.
      F.route({ points: NODE1_LANE, fadeIn: true, name: 'probe' }),
      F.pulse({ pod: 'podOld', at: 'probe' }),
      F.fade({ target: 'podOld', from: 1, to: OPACITY.notready, dur: FADE.out, at: 'probe', fill: 'both', easing: 'ease-in' }),
      // The lane dims on the same beat, held at full through the delay window by fill:'both' so the
      // probe is never riding a wire fainter than itself.
      F.fade({ target: 'connector', from: 1, to: OPACITY.notready, dur: FADE.out, at: 'probe', fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'terminating',
    duration: 2200,
    narration: 'A delete is issued for Pod A, by you or by the node controller clearing Pods off the lost Node. The API stamps metadata.deletionTimestamp, so the Pod reads as Terminating. Normally the Kubelet would stop the container and let the API remove the object, but Node-1 Kubelet is unreachable and nothing acknowledges the delete.',
    chips: { nodeChip: 'NotReady (Unknown)', podChip: 'Terminating', replicaChip: 'replicas 1/1', focusChip: 'deletionTimestamp set' },
    wires: { req: 'DELETE .../pods/pod-a · deletionTimestamp' },
    opacity: podPair(OPACITY.terminating, 0),
    lit: ['focusChip', 'kubectl', 'podChip'],
    chain: 1,
    flow: [
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, lights: ['api'] }),
    ],
  },
  {
    id: 'stuck',
    duration: 2300,
    narration: 'Pod A is stuck in Terminating with no time limit, while status.phase stays Running. The StatefulSet will not create a replacement, because the sticky identity and its RWO volume are still held by the undeleted Pod A. A leftover metadata.finalizers entry causes the same stuck Terminating, cleared by removing the finalizer rather than by force.',
    chips: { nodeChip: 'NotReady (Unknown)', podChip: 'Terminating (stuck)', replicaChip: 'replacement blocked', focusChip: 'identity still held by Pod A' },
    opacity: podPair(OPACITY.terminating, 0),
    // Nothing travels while the identity is held and the Pod is untouched: the blocked
    // state shows via the static highlight only (no chip pulse).
    lit: ['focusChip', 'podChip', 'replicaChip'],
    chain: 2,
  },
  {
    id: 'force',
    duration: 2200,
    narration: 'Running kubectl delete pod pod-a --grace-period=0 --force tells the API to drop the Pod object from ETCD at once, with no wait for any Kubelet acknowledgement. The API now reports the Pod as gone, and the StatefulSet identity is free again.',
    chips: { nodeChip: 'NotReady (Unknown)', podChip: 'force-deleted', replicaChip: 'identity freed', focusChip: 'object dropped from etcd' },
    wires: { req: 'DELETE pod-a · --grace-period=0 --force' },
    opacity: podPair(OPACITY.terminated, 0),
    lit: ['replicaChip', 'focusChip', 'kubectl', 'podChip'],
    chain: 3,
    flow: [
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'req', lights: ['api'] }),
      // The answer comes straight back, which IS --force: the API reports the object gone without
      // waiting for any Kubelet. kubectl sources the round trip, so it does not light again.
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, after: 'req' }),
    ],
  },
  {
    id: 'risk',
    duration: 3500,
    narration: 'The StatefulSet immediately recreates the replica, here as Pod B on Node-2. The danger: if Node-1 was only network-partitioned, its Kubelet is alive and the original Pod A still runs there. Pod A and Pod B now share one StatefulSet identity and the same volume, which corrupts data. Force-delete only after the Node is confirmed dead, or delete the Node object so its Pods are garbage-collected cleanly.',
    chips: { nodeChip: 'partitioned, still live', podChip: 'maybe still running', replicaChip: 'identity live twice', focusChip: 'split-brain hazard' },
    wires: { req: 'StatefulSet recreates pod-b on Node-2' },
    // Each lane appears and dims with the Pod it ends on. Pod A comes UP from terminated to
    // notready here, and that rise IS the step: the API believes it gone, the chips do not.
    opacity: podPair(OPACITY.notready, 1),
    lit: ['nodeChip', 'podChip', 'replicaChip', 'focusChip'],
    // podNew appears on arrival, so the animated path pulses it then. Lighting podNewBox as a
    // static `lit` would auto-pulse it at delay 0 while the Pod is still invisible (and double
    // with the pulse), so the static path says it here instead.
    reducedLit: ['podNewBox'],
    chain: 4,
    flow: [
      F.route({ points: NODE2_LANE, fadeIn: true, name: 'recreate' }),
      F.fade({ target: 'podNew', from: 0, to: 1, dur: FADE.in, at: 'recreate', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'podNew', at: 'recreate' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
