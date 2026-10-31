import { FADE, LANE_DY, P, F, defineCard, laneY, midX, CLU, BEAT, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-cascading-deletion.md

// One grid with cluster-object-create-path. The client lanes address the FRAME, not a block.
const FRAME_X = 150, FRAME_W = 900, FRAME_R = FRAME_X + FRAME_W;
const PAD = 20;
const IN_L = FRAME_X + PAD, IN_R = FRAME_X + FRAME_W - PAD;
const CX = midX(FRAME_X, FRAME_R);
const BOX_W = 232, BOX_H = 80;

// Columns and rows shared with cluster-object-create-path. Each frame fits what it holds (CLU.L-01).
const CP_Y = 96, CP_H = 344, CP_CY = midX(CP_Y, CP_Y + CP_H);
const NODE_Y = 475, NODE_H = CLU.NODE.H;

// The left top slot stays empty so the Node pair runs straight down the middle.
const TOP_Y = 140, TOP_BOTTOM = TOP_Y + BOX_H;
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
const { out: OUT_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);
const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;
const FLANK_W = 130;
const ETCD_X = IN_R - FLANK_W;
const ETCD_OVER = 30;
// The client stands in the band right of the frame, at ETCD's width.
const KCTL_W = FLANK_W, KCTL_X = FRAME_R + 10;
const KCTL_Y = CP_CY - BOX_H / 2;
const KCTL_CX = midX(KCTL_X, KCTL_X + KCTL_W);

const T2_Y = 328;
const CM_X = IN_L, CM_CX = midX(CM_X, CM_X + BOX_W);
const GC_X = IN_R - BOX_W, GC_CX = midX(GC_X, GC_X + BOX_W);
const T2_BELOW = T2_Y + BOX_H + 20;                      // wire label register under tier 2

// The 80 tall Kubelet centres on the Pod line (LANE_Y).
const KUBELET_X = IN_L, KUBELET_R = KUBELET_X + BOX_W;
const POD_W = BOX_W, POD_X = IN_R - POD_W;
const POD_H = CLU.NODE.POD_H, POD_Y = NODE_Y + CLU.NODE.POD_DY;
const LANE_Y = midX(POD_Y, POD_Y + POD_H);
const KUBELET_Y = LANE_Y - BOX_H / 2;
const POD_INNER = { dx: 30, dy: 28, w: POD_W - 60, h: 52 };

// A mirrored watch and write pair on each tier-2 top face, so the two never cross.
const BAND_CY = midX(TOP_BOTTOM, T2_Y);
const { out: JOG_DOWN, back: JOG_UP } = laneY(BAND_CY, LANE_DY);
const D60 = 60, D36 = D60 - 2 * LANE_DY;
const TO_CM   = [[CX - D60, TOP_BOTTOM], [CX - D60, JOG_DOWN], [CM_CX - LANE_DY, JOG_DOWN], [CM_CX - LANE_DY, T2_Y]];
const TO_GC   = [[CX + D60, TOP_BOTTOM], [CX + D60, JOG_DOWN], [GC_CX + LANE_DY, JOG_DOWN], [GC_CX + LANE_DY, T2_Y]];
const FROM_GC = [[GC_CX - LANE_DY, T2_Y], [GC_CX - LANE_DY, JOG_UP], [CX + D36, JOG_UP], [CX + D36, TOP_BOTTOM]];
// Addressed to the NODE, not the Kubelet: a watch arrives at a Node and a status leaves one.
const TO_NODE   = [[CX - LANE_DY, TOP_BOTTOM], [CX - LANE_DY, NODE_Y]];
const FROM_NODE = [[CX + LANE_DY, NODE_Y], [CX + LANE_DY, TOP_BOTTOM]];
const KCTL_LANE_DX = LANE_DY;
const { out: BAND_OUT_Y, back: BAND_BACK_Y } = laneY(60, LANE_DY);
// The out lane runs on the upper level, so it takes the OUTER slot at the client and the inner
// one at the frame. Any other pairing tangles.
const DELETE     = [[KCTL_CX + KCTL_LANE_DX, KCTL_Y], [KCTL_CX + KCTL_LANE_DX, BAND_OUT_Y], [CX - KCTL_LANE_DX, BAND_OUT_Y], [CX - KCTL_LANE_DX, CP_Y]];
const DELETE_ACK = [[CX + KCTL_LANE_DX, CP_Y], [CX + KCTL_LANE_DX, BAND_BACK_Y], [KCTL_CX - KCTL_LANE_DX, BAND_BACK_Y], [KCTL_CX - KCTL_LANE_DX, KCTL_Y]];
const PERSIST     = [[API_R, OUT_Y], [ETCD_X, OUT_Y]];
const PERSIST_ACK = [[ETCD_X, BACK_Y], [API_R, BACK_Y]];
const STOP_POD    = [[KUBELET_R, LANE_Y], [POD_X, LANE_Y]];
const WIRE_REQ_Y = OUT_Y - 12, WIRE_ACK_Y = BACK_Y + 18;
const ETCD_GAP_CX = midX(API_R, ETCD_X);
// One register for both client labels: they never share a step.
const KCTL_LABEL_CX = midX(CX, KCTL_CX);
const KCTL_LABEL_Y = BAND_OUT_Y - 16;
// The GC return label names the JOG_UP lane, so it sits below that run, not under the box. In the
// watch register it would read as the API issuing the DELETEs to the Garbage collector.
const WIRE_GC_BACK_Y = JOG_UP + 14;
// End-anchored left of the spine: a horizontal label centred on a vertical lane is cut in half.
const WIRE_KUBELET_X = CX - LANE_DY - 14;
const WIRE_KUBELET_Y = midX(CP_Y + CP_H, NODE_Y) + 7;

const lane = (points) => P.lane({ points, dim: true, dashed: true });

// List order is z-order: frames first, then blocks, lanes, wire labels, packets.
export const SCENE = {
  'aria-label': 'A cascading delete through finalizers, in which the object is stamped rather than removed, the Garbage collector walks ownerReferences down to the Pod on a Node, and the finalizers clear back up the chain before the records leave ETCD',
  parts: [
    P.defs(),
    P.node({ x: FRAME_X, y: CP_Y, w: FRAME_W, h: CP_H, label: 'Control plane' }),
    P.node({ x: FRAME_X, y: NODE_Y, w: FRAME_W, h: NODE_H, label: 'Node-1' }),
    P.box({ key: 'client', x: KCTL_X, y: KCTL_Y, w: KCTL_W, h: BOX_H, label: 'kubectl' }),
    P.box({ key: 'apisrv', x: API_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API' }),
    P.cylinder({ key: 'etcd', x: ETCD_X, y: TOP_Y - 10, w: FLANK_W, h: BOX_H + ETCD_OVER, label: 'ETCD' }),
    P.box({ key: 'cm', x: CM_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'controller-manager' }),
    // Load-bearing sublabel: the Garbage collector is a controller inside the controller-manager, not a peer.
    P.box({ key: 'gc', x: GC_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'Garbage collector', sublabel: 'in controller-manager' }),
    P.box({ key: 'kubelet', x: KUBELET_X, y: KUBELET_Y, w: BOX_W, h: BOX_H, label: 'Kubelet' }),
    P.pod({
      key: 'placedPod', id: 'placedPod', innerKey: 'placedPodBox',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'my-app-7d4-x2k9p', sublabel: 'nginx:1.30' },
    }),
    P.lane({ key: 'kubeletPodArrow', points: STOP_POD, dashed: true }),
    lane(DELETE),
    lane(DELETE_ACK),
    lane(PERSIST),
    lane(PERSIST_ACK),
    lane(TO_CM),
    lane(TO_GC),
    lane(FROM_GC),
    lane(TO_NODE),
    lane(FROM_NODE),
    P.wire({ key: 'delete', x: KCTL_LABEL_CX, y: KCTL_LABEL_Y }),
    P.wire({ key: 'api-ack', x: KCTL_LABEL_CX, y: KCTL_LABEL_Y }),
    P.wire({ key: 'persist', x: ETCD_GAP_CX, y: WIRE_REQ_Y }),
    P.wire({ key: 'etcd-ack', x: ETCD_GAP_CX, y: WIRE_ACK_Y }),
    // The same event reaches both watchers, so the label appears twice.
    P.wire({ key: 'controller', x: CM_CX, y: T2_BELOW }),
    P.wire({ key: 'gc-watch', x: GC_CX, y: T2_BELOW }),
    P.wire({ key: 'gc', x: midX(CX + D36, GC_CX - LANE_DY), y: WIRE_GC_BACK_Y }),
    P.wire({ key: 'kubelet-watch', x: WIRE_KUBELET_X, y: WIRE_KUBELET_Y, anchor: 'end' }),
    P.wire({ key: 'stop-pod', x: midX(KUBELET_R, POD_X), y: LANE_Y - 12 }),
    P.packets(),
  ],
  // placedPod is deliberately NOT in a `pods` list: a clearPodHighlight would wipe its inline styles.
  reset: { keys: ['client', 'apisrv', 'etcd', 'cm', 'gc', 'kubelet'] },
};

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1400,
    opacity: { placedPod: 1, kubeletPodArrow: 1 },
  },
  {
    id: 'delete-request',
    duration: 3000,
    narration: 'You run "kubectl delete deployment my-app --cascade=foreground". The client sends an HTTP DELETE to /apis/apps/v1/.../deployments/my-app on the API with propagationPolicy=Foreground in the request body.',
    wires: { delete: 'DELETE /apis/apps/v1/.../deployments/my-app' },
    lit: ['client'],
    flow: [F.route({ points: DELETE, lights: ['apisrv'] })],
  },
  {
    id: 'mark-deletion',
    duration: 2500,
    narration: 'The API does not remove the object but sets metadata.deletionTimestamp and adds the foregroundDeletion finalizer. Then it commits this to ETCD via Raft at rv=843. The Deployment still exists in cluster state, now marked for deletion.',
    wires: { persist: 'set deletionTimestamp' },
    lit: ['apisrv'],
    flow: [F.route({ points: PERSIST, lights: ['etcd'] })],
  },
  {
    id: 'ack-response',
    duration: 3000,
    narration: 'ETCD acks the committed write back to the API, and the API returns HTTP 200 OK to kubectl with the stamped object in the body. The call has returned, but kubectl waits by default until the object is gone, and most of the deletion is still ahead.',
    wires: { 'etcd-ack': 'ack · rv=843', 'api-ack': 'HTTP 200 OK' },
    lit: ['etcd'],
    flow: [
      F.route({ points: PERSIST_ACK, name: 'ack', lights: ['apisrv'] }),
      F.route({ points: DELETE_ACK, after: 'ack', lights: ['client'] }),
    ],
  },
  {
    id: 'gc-cascade',
    duration: 4000,
    narration: 'The API broadcasts a MODIFIED event for the Deployment to its watchers. The Deployment controller sees the deletionTimestamp and stops issuing rollouts. The Garbage collector walks the ownerReferences and DELETEs ReplicaSet my-app-7d4 in foreground, then Pod my-app-7d4-x2k9p of that ReplicaSet. Each gets a deletionTimestamp but is not removed from ETCD yet.',
    wires: {
      controller: 'watch MODIFIED · Deployment',
      'gc-watch': 'watch MODIFIED · Deployment',
      gc: 'DELETE replicasets · pods',
    },
    lit: ['apisrv'],
    flow: [
      F.route({ points: TO_GC, name: 'gcEvent', lights: ['gc'] }),
      F.route({ points: TO_CM, lights: ['cm'] }),
      F.route({ points: FROM_GC, after: 'gcEvent' }),
    ],
  },
  {
    id: 'kubelet-watch',
    duration: 2500,
    narration: 'The Kubelet on Node-1 has a filtered watch for Pods bound to it. The API streams a MODIFIED event for my-app-7d4-x2k9p carrying its new deletionTimestamp down that watch to Node-1, and the Kubelet starts terminating the Pod.',
    wires: { 'kubelet-watch': 'watch MODIFIED · Pod' },
    lit: ['apisrv'],
    flow: [F.route({ points: TO_NODE, lights: ['kubelet'] })],
  },
  {
    id: 'kubelet-stops',
    duration: 4100,
    narration: 'The terminationGracePeriodSeconds budget (30s by default) started when the Pod was stamped. The container gets SIGQUIT, the STOPSIGNAL the nginx image sets, or SIGTERM otherwise. SIGKILL comes only if the container outlives the timer. Once it stops, the Kubelet sets the terminal phase and sends a DELETE with grace 0. The Graceful Pod Shutdown card covers the budget.',
    wires: { 'stop-pod': 'SIGQUIT · grace 30s' },
    // Pinned final state, so a cancel between steps does not flash the default opacity.
    opacity: { placedPod: OPACITY.terminating },
    lit: ['kubelet'],
    flow: [
      F.route({ points: STOP_POD, name: 'sigterm' }),
      // Narrative-slow fade: the grace-period drain reads as a long dim, not a snap.
      F.fade({ target: 'placedPod', to: OPACITY.terminating, dur: 1300, at: 'sigterm' }),
      F.pulse({ pod: 'placedPod', at: 'sigterm' }),
      // One beat after the blink, so the two do not read as one event.
      F.route({ points: FROM_NODE, at: 'sigterm', plus: BEAT.afterPulse, lights: ['apisrv'] }),
    ],
  },
  {
    id: 'purge',
    duration: 3900,
    narration: 'The grace 0 DELETE removes the Pod record from ETCD. With no Pod left under it, the Garbage collector clears the foregroundDeletion finalizer off the ReplicaSet, then off the Deployment, and as each list empties the API removes that record too. The Deployment goes last, at rv=856. That completes the step 1 delete by kubectl, so kubectl stops waiting.',
    wires: { gc: 'clear finalizer', persist: 'finalizers=[] · removed' },
    opacity: { placedPod: 0, kubeletPodArrow: 0 },
    // Wind back to the step 6 state, or the pin hides the Pod on entry and the fades pop it back.
    rewind: { opacity: { placedPod: OPACITY.terminating, kubeletPodArrow: 1 } },
    lit: ['gc'],
    flow: [
      // The Pod goes first: the step 6 grace 0 DELETE removed it, and only then does a finalizer clear.
      F.fade({ target: 'placedPod', from: OPACITY.terminating, to: 0, dur: FADE.out, name: 'podGone', fill: 'forwards', easing: 'ease-out' }),
      F.fade({ target: 'kubeletPodArrow', to: 0, dur: 600, fill: 'forwards', easing: 'ease-out' }),
      F.route({ points: FROM_GC, after: 'podGone', name: 'clear', lights: ['apisrv'] }),
      F.route({ points: PERSIST, after: 'clear', lights: ['etcd'] }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
