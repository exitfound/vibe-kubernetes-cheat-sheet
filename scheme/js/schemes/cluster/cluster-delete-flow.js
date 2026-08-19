import { P, F, defineCard, laneY, midX, CLU, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS.md#cluster-delete-flow

// Every row centred on CX and symmetric about it, cluster-object-create-path's grammar. Panel x<=397 on
// every step, bottom 282 on gc-cascade. The occlusion that buys the centring is under TOP_Y.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = midX(CONTENT_L, CONTENT_R);                   // 600
// Reserved narration corner: 397 x 282, measured rather than assumed. Nothing derives from it, and
// worst case per viewport is in the header note above.

// 110 is as low as the row can go: band 1, tier 2, band 2 and the Node frame are all below it and
// tier 2 cannot rise. kubectl is COVERED by the panel as a result, a recorded author decision.
const TOP_Y = 110, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;// 110 / 190
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);                  // 150
const LANE_DY = 10;
const { out: OUT_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);  // 140 / 160
// The API is pinned to the canvas centre and ETCD DERIVES from it through GAP, so the right of the
// row cannot drift.
const KCTL_W = 160, API_W = 220, ETCD_W = 130;
const GAP = 190;
const API_X = CX - API_W / 2, API_R = API_X + API_W, API_CX = CX;   // 490..710
// The ONE block not derived from GAP: left edge pinned at 170, growing RIGHT only. 160 is near the
// ceiling, because the gap must keep holding `HTTP 202 Accepted` at 113 units, 23.5 a side.
const KCTL_X = 170, KCTL_R = KCTL_X + KCTL_W;            // 170..330
const ETCD_X = API_R + GAP;                              // 900..1030

// Mirrored about CX, so every row shares one axis. T2_D is SOLVED: whatever puts the tier-2 outer
// edges NODE_PAD inside the Node frame, so four things line up on each side by construction.
const T2_Y = 300, T2_H = 80, T2_W = 240;                 // 300..380, wholly below the panel
const T2_D = CX - (110 + M) - T2_W / 2;                  // 310
const CM_CX = CX - T2_D, CM_X = CM_CX - T2_W / 2;        // 290, 170..410
const GC_CX = CX + T2_D, GC_X = GC_CX - T2_W / 2;        // 910, 790..1030

// The frame and its contents are cluster-object-create-path's to the unit. NODE_PAD applies to BOTH walls,
// so the insets are equal by construction rather than by hand.
const NODE_X = 110, NODE_W = 980, NODE_Y = 440, NODE_H = 150;   // 110..1090, 440..590
const NODE_PAD = M;                                      // 60, left and right alike
const NODE_CX = midX(NODE_X, NODE_X + NODE_W);           // 600, the frame's top-face midpoint
const KUBELET_W = 220, KUBELET_X = NODE_X + NODE_PAD;    // 170..390
const KUBELET_Y = NODE_Y + 41, KUBELET_H = 80;           // 481..561
const KUBELET_R = KUBELET_X + KUBELET_W;                 // 390
const POD_W = 216, POD_X = NODE_X + NODE_W - NODE_PAD - POD_W;   // 814..1030
const POD_Y = NODE_Y + 28, POD_H = 106;                  // 468..574
const POD_INNER = { dx: 30, dy: 28, w: POD_W - 60, h: 52 };
const LANE_Y = KUBELET_Y + KUBELET_H / 2;                // 521, the Pod shares it

// Each lane pair is pinned to its band's own centre, so a lane can never glue itself to the row it
// left. The 110/60 gaps are deliberately unequal: the two bands carry different loads.
const BAND1_CY = midX(TOP_BOTTOM, T2_Y);                 // 245
const BAND2_CY = midX(T2_Y + T2_H, NODE_Y);              // 410
const LANE_HALF = 8;
const { out: LANE1_OUT, back: LANE1_BACK } = laneY(BAND1_CY, LANE_HALF);   // 237 / 253
// TWO registers: a label for OUT traffic sits above the out lane, one for BACK traffic below the
// return lane. A label on a lane names the traffic on THAT lane.
const WIRE_T2_OUT_Y = LANE1_OUT - 8;                     // 229, above the out lane
const WIRE_T2_BACK_Y = LANE1_BACK + 14;                  // 267, below the return lane

// The ORDER across the API bottom face is FORCED: every lane but the Node pair turns horizontally
// through band 1, so it must leave OUTSIDE the pair. The Node pair takes the two innermost slots.
const D20 = 20, D30 = 30, D60 = 60;
const TO_CM       = [[API_CX - D60, TOP_BOTTOM], [API_CX - D60, LANE1_OUT], [CM_CX, LANE1_OUT], [CM_CX, T2_Y]];
const TO_GC       = [[API_CX + D60, TOP_BOTTOM], [API_CX + D60, LANE1_OUT], [GC_CX + D20, LANE1_OUT], [GC_CX + D20, T2_Y]];
const FROM_GC     = [[GC_CX - D20, T2_Y], [GC_CX - D20, LANE1_BACK], [API_CX + D30, LANE1_BACK], [API_CX + D30, TOP_BOTTOM]];
// Addressed to the NODE, not the Kubelet: a watch stream arrives at a Node and a status report
// leaves one. The API, the frame and the canvas share one centre, so the pair is vertical at BOTH ends.
const TO_NODE     = [[API_CX - LANE_DY, TOP_BOTTOM], [NODE_CX - LANE_DY, NODE_Y]];
const FROM_NODE   = [[NODE_CX + LANE_DY, NODE_Y], [API_CX + LANE_DY, TOP_BOTTOM]];
const DELETE      = [[KCTL_R, OUT_Y], [API_X, OUT_Y]];
const DELETE_ACK  = [[API_X, BACK_Y], [KCTL_R, BACK_Y]];
const PERSIST     = [[API_R, OUT_Y], [ETCD_X, OUT_Y]];
const PERSIST_ACK = [[ETCD_X, BACK_Y], [API_R, BACK_Y]];
const STOP_POD    = [[KUBELET_R, LANE_Y], [POD_X, LANE_Y]];
// Two registers, SPLIT by what fits: acks go between the blocks (115 against a 190 gap), requests
// cannot (287 and 213) and ride ABOVE the row.
const WIRE_REQ_Y = TOP_Y - 20;                           // 90, above the row
const WIRE_ACK_Y = BACK_Y + 18;                          // 178, between the blocks
const KCTL_GAP_CX = midX(KCTL_R, API_X);                 // 410, follows the widened block
const ETCD_GAP_CX = midX(API_R, ETCD_X);                 // 805

// The list order IS the append order, so it is the z-order: the six blocks and the Node frame, the
// Pod inside it, then every lane, the wire labels and the packet layer last.
export const SCENE = {
  'aria-label': 'How a cascading delete unwinds through finalizers, from the client through the control plane to the Kubelet on a Node',
  parts: [
    P.defs(),
    P.box({ key: 'client', x: KCTL_X, y: TOP_Y, w: KCTL_W, h: TOP_H, label: 'kubectl' }),
    P.box({ key: 'apisrv', x: API_X, y: TOP_Y, w: API_W, h: TOP_H, label: 'API' }),
    P.cylinder({ key: 'etcd', x: ETCD_X, y: TOP_Y - 10, w: ETCD_W, h: TOP_H + 20, label: 'ETCD' }),
    // controller-manager and Garbage collector, mirrored about CX at +/- T2_D. See the constants.
    P.box({ key: 'cm', x: CM_X, y: T2_Y, w: T2_W, h: T2_H, label: 'controller-manager' }),
    // The sublabel is load-bearing: without it, two same-size boxes on one tier assert the Garbage
    // collector is a PEER of the controller-manager. It is a controller inside it.
    P.box({ key: 'gc', x: GC_X, y: T2_Y, w: T2_W, h: T2_H, label: 'Garbage collector', sublabel: 'in controller-manager' }),
    P.node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.box({ key: 'kubelet', x: KUBELET_X, y: KUBELET_Y, w: KUBELET_W, h: KUBELET_H, label: 'Kubelet' }),
    P.pod({
      key: 'placedPod', id: 'placedPod', innerKey: 'placedPodBox',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'my-app-7d4-abc', sublabel: 'nginx:1.27' },
    }),
    P.lane({ key: 'kubeletPodArrow', points: STOP_POD, dashed: true }),
    // Top-row lanes straddle the Api/Kubectl/ETCD centre line (y=150): request out at y=140,
    // response back at y=160. Each is drawn from the SAME array that carries its ball.
    P.lane({ points: DELETE,      dim: true, dashed: true }),
    P.lane({ points: DELETE_ACK,  dim: true, dashed: true }),
    P.lane({ points: PERSIST,     dim: true, dashed: true }),
    P.lane({ points: PERSIST_ACK, dim: true, dashed: true }),
    // API to controller-manager and API to Garbage collector, plus the Garbage collector's return.
    P.lane({ points: TO_CM, dim: true, dashed: true }),
    P.lane({ points: TO_GC, dim: true, dashed: true }),
    P.lane({ points: FROM_GC, dim: true, dashed: true }),
    // The Node pair: the watch event down, the terminated report back up, mirrored on the frame's
    // top face so neither endpoint stands alone off its midpoint.
    P.lane({ points: TO_NODE, dim: true, dashed: true }),
    P.lane({ points: FROM_NODE, dim: true, dashed: true }),
    // Requests above the row, acks below it. Neither register touches a block.
    P.wire({ key: 'delete', x: KCTL_GAP_CX, y: WIRE_REQ_Y }),
    P.wire({ key: 'persist', x: ETCD_GAP_CX, y: WIRE_REQ_Y }),
    P.wire({ key: 'etcd-ack', x: ETCD_GAP_CX, y: WIRE_ACK_Y }),
    P.wire({ key: 'api-ack', x: KCTL_GAP_CX, y: WIRE_ACK_Y }),
    // Band 1 carries one label per side, each centred on the horizontal run it names and sitting 8
    // above the OUT level. The Garbage collector label names the BACK lane from over its own pair.
    P.wire({ key: 'controller', x: midX(API_CX - D60, CM_CX), y: WIRE_T2_OUT_Y }),
    P.wire({ key: 'gc', x: midX(API_CX + D30, GC_CX - D20), y: WIRE_T2_BACK_Y }),
    // Band 2. Its lane is a straight VERTICAL, and a horizontal string centred on a vertical lane is
    // cut in half by it, so this one is right-anchored just left of the lane, on the band's centre.
    P.wire({ key: 'kubelet-watch', x: NODE_CX - LANE_DY - 14, y: BAND2_CY + 4, anchor: 'end' }),
    P.wire({ key: 'stop-pod', x: midX(KUBELET_R, POD_X), y: LANE_Y - 12 }),
    P.packets(),
  ],
  // placedPod is deliberately NOT in a `pods` list: the card pulses it and never clears the pulse,
  // and a clearPodHighlight here would wipe four inline styles the picture depends on.
  reset: { keys: ['client', 'apisrv', 'etcd', 'cm', 'gc', 'kubelet', 'placedPodBox'] },
};

export const STEPS_SPEC = [
  {
    id: 'idle',
    // 1400, not the category 1500: measured on this card, the poster beat before the first request.
    duration: 1400,
    opacity: { placedPod: 1, kubeletPodArrow: 1 },
  },
  {
    id: 'delete-request',
    duration: 1700,
    narration: 'You run "kubectl delete deployment my-app --cascade=foreground". The client sends an HTTP DELETE to /apis/apps/v1/namespaces/default/deployments/my-app on the API with propagationPolicy=Foreground in the request body.',
    wires: { delete: 'DELETE /apis/apps/v1/.../deployments/my-app' },
    lit: ['client'],
    flow: [F.route({ points: DELETE, lights: ['apisrv'] })],
  },
  {
    id: 'mark-deletion',
    duration: 1900,
    narration: 'The API does not remove the object. It patches metadata.deletionTimestamp and adds the foregroundDeletion finalizer, then commits the change to ETCD via Raft at rv=843. The Deployment is now marked for deletion but still exists in cluster state.',
    wires: { persist: 'patch deletionTimestamp · rv=843' },
    lit: ['apisrv'],
    flow: [F.route({ points: PERSIST, lights: ['etcd'] })],
  },
  {
    id: 'ack-response',
    duration: 2200,
    narration: 'ETCD acks the committed write back to the API, and the API returns HTTP 202 Accepted to kubectl. From the caller perspective the call already returned, but the object lifecycle is only just beginning.',
    wires: { 'etcd-ack': 'ack · rv=843', 'api-ack': 'HTTP 202 Accepted' },
    lit: ['etcd'],
    // ETCD sends the ack and is lit from entry. The Api takes it before it answers kubectl, so
    // it lights on arrival rather than at step entry.
    flow: [
      F.route({ points: PERSIST_ACK, name: 'ack', lights: ['apisrv'] }),
      F.route({ points: DELETE_ACK, after: 'ack', lights: ['client'] }),
    ],
  },
  {
    id: 'gc-cascade',
    duration: 3200,
    narration: 'The API broadcasts a MODIFIED event for the Deployment to its watchers. The Deployment controller in the controller-manager sees the deletionTimestamp and stops issuing rollouts. The Garbage collector walks the ownerReferences, then issues foreground DELETEs for ReplicaSet my-app-7d4 and Pod my-app-7d4-abc, which only stamp a deletionTimestamp on each rather than removing it from ETCD yet.',
    wires: { controller: 'watch MODIFIED · Deployment', gc: 'DELETE replicasets · pods' },
    lit: ['apisrv'],
    // The Api broadcasts, so it is the lit source. The Garbage collector receives before it sends,
    // so it lights when the MODIFIED event LANDS, and the PATCH back leaves after that.
    flow: [
      F.route({ points: TO_GC, name: 'gcEvent', lights: ['gc'] }),
      // To CM (left), for Deployment/ReplicaSet controllers:
      F.route({ points: TO_CM, lights: ['cm'] }),
      F.route({ points: FROM_GC, after: 'gcEvent' }),
    ],
  },
  {
    id: 'kubelet-watch',
    duration: 2500,
    narration: 'The Kubelet on Node-1 has a filtered watch for Pods bound to it. The API streams a MODIFIED event for my-app-7d4-abc carrying its new deletionTimestamp down that watch to Node-1, and the Kubelet starts the termination procedure.',
    wires: { 'kubelet-watch': 'watch MODIFIED · Pod' },
    lit: ['apisrv'],
    flow: [F.route({ points: TO_NODE, lights: ['kubelet'] })],
  },
  {
    id: 'kubelet-stops',
    duration: 4100,
    narration: 'The Kubelet starts the terminationGracePeriodSeconds budget (30s by default), inside which the container gets SIGTERM and then SIGKILL only if it outlives the timer, then reports the terminated Pod up to the API. What the budget is spent on is covered in the Graceful Pod Shutdown card.',
    wires: { 'stop-pod': 'SIGTERM · grace 30s' },
    // Pin final state inline so cancel between steps doesn't flash to default opacity.
    opacity: { placedPod: OPACITY.terminating },
    lit: ['kubelet'],
    flow: [
      // SIGTERM packet flies from Kubelet to Pod first.
      F.route({ points: STOP_POD, name: 'sigterm' }),
      // Narrative-slow fade: the grace-period drain reads as a long dim, not a snap.
      F.fade({ target: 'placedPod', to: OPACITY.terminating, dur: 1300, at: 'sigterm' }),
      // The whole Pod (shell + inner box) pulses once in sync as the SIGTERM lands, then dims
      // out with the grace-period fade. Nothing is left pinned bright.
      F.pulse({ pod: 'placedPod', at: 'sigterm' }),
      // After the grace-period drain, the Kubelet reports the terminated Pod up to the Api on the
      // return lane.
      F.route({ points: FROM_NODE, at: 'sigterm', plus: 800, lights: ['apisrv'] }),
    ],
  },
  {
    id: 'purge',
    duration: 2500,
    narration: 'With the Pod terminated and dependents accounted for, the Garbage collector clears the foregroundDeletion finalizer up the chain. The API issues real DELETEs to ETCD, removing Pod, ReplicaSet, and Deployment in turn. Watchers receive DELETED events. The objects are now truly gone.',
    wires: { gc: 'clear finalizer', persist: 'DELETE · finalizers=[] · rv=856' },
    // Pin final state inline so cancel returns to the right value, not default.
    opacity: { placedPod: 0, kubeletPodArrow: 0 },
    lit: ['gc'],
    // GC clears the foregroundDeletion finalizer up to the Api, which then DELETEs to ETCD. The
    // Api is mid-chain and lights on the PATCH landing, ETCD one hop later.
    flow: [
      F.route({ points: FROM_GC, name: 'clear', lights: ['apisrv'] }),
      F.route({ points: PERSIST, after: 'clear', name: 'del', lights: ['etcd'] }),
      F.fade({ target: 'placedPod', from: OPACITY.terminating, to: 0, dur: 700, at: 'del', fill: 'forwards', easing: 'ease-out' }),
      F.fade({ target: 'kubeletPodArrow', to: 0, dur: 600, at: 'del', fill: 'forwards', easing: 'ease-out' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
