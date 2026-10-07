import { LANE_DY, P, F, defineCard, laneY, midX, CLU } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-object-create-path.md

// Same grid as cluster-architecture minus the cloud-controller-manager. The client is the only
// block outside the frame, so its lanes address the FRAME rather than a block.
const FRAME_X = 150, FRAME_W = 900, FRAME_R = FRAME_X + FRAME_W;  // architecture's frame
const PAD = 20;                                          // one inset, used on every wall
const IN_L = FRAME_X + PAD, IN_R = FRAME_X + FRAME_W - PAD;
const CX = midX(FRAME_X, FRAME_R);
const BOX_W = 232, BOX_H = 80;

// Each frame is fitted to what it holds (CLU.L-01): 34 over its topmost block, 12 under its lowest content.
const CP_Y = 96, CP_H = 344, CP_CY = midX(CP_Y, CP_Y + CP_H);
const NODE_Y = 475, NODE_H = CLU.NODE.H;

// The ETCD gap is sized for its widest wire label. The left slot of the top row is empty.
const TOP_Y = 140, TOP_BOTTOM = TOP_Y + BOX_H;
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
const { out: OUT_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);
const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;
const FLANK_W = 130;
const ETCD_X = IN_R - FLANK_W;
const ETCD_OVER = 30;  // cylinder overhang
// The client stands in the band right of the frame, ETCD's width. KCTL_Y derives from CP_CY so it
// stays centred on the wall its lanes address: do not hardcode it.
const KCTL_W = 130, KCTL_X = FRAME_R + 10;
const KCTL_Y = CP_CY - BOX_H / 2;
const KCTL_CX = midX(KCTL_X, KCTL_X + KCTL_W);

// Tier 2 leaves architecture's centre column empty, which keeps the Node lane one straight line.
const T2_Y = 328;
const CM_X = IN_L, CM_CX = midX(CM_X, CM_X + BOX_W);
const SCHED_X = IN_R - BOX_W, SCHED_CX = midX(SCHED_X, SCHED_X + BOX_W);
const T2_BELOW = T2_Y + BOX_H + 20;  // one wire label under each tier-2 box

// The Pod is the topmost block on the family's 34, and the Kubelet centres on its line.
const KUBELET_X = IN_L, KUBELET_R = KUBELET_X + BOX_W;
const POD_W = BOX_W, POD_X = IN_R - POD_W;
const POD_H = CLU.NODE.POD_H, POD_Y = NODE_Y + CLU.NODE.POD_DY;
const LANE_Y = midX(POD_Y, POD_Y + POD_H);
const KUBELET_Y = LANE_Y - BOX_H / 2;
// The last step names the Runtime as the actor, so it takes the centre Node column.
const RT_X = CX - BOX_W / 2, RT_R = RT_X + BOX_W;

// Each tier-2 box takes a mirrored pair: watch turns at JOG_DOWN, write back at JOG_UP, so they never cross.
const BAND_CY = midX(TOP_BOTTOM, T2_Y);
const { out: JOG_DOWN, back: JOG_UP } = laneY(BAND_CY, LANE_DY);
// Each API-side pair straddles a stub 60 in from its corner, as on architecture.
const API_L_STUB = API_X + 60, API_R_STUB = API_R - 60;
const TO_CM      = [[API_L_STUB - LANE_DY, TOP_BOTTOM], [API_L_STUB - LANE_DY, JOG_DOWN], [CM_CX - LANE_DY, JOG_DOWN], [CM_CX - LANE_DY, T2_Y]];
const FROM_CM    = [[CM_CX + LANE_DY, T2_Y], [CM_CX + LANE_DY, JOG_UP], [API_L_STUB + LANE_DY, JOG_UP], [API_L_STUB + LANE_DY, TOP_BOTTOM]];
const TO_SCHED   = [[API_R_STUB + LANE_DY, TOP_BOTTOM], [API_R_STUB + LANE_DY, JOG_DOWN], [SCHED_CX + LANE_DY, JOG_DOWN], [SCHED_CX + LANE_DY, T2_Y]];
const FROM_SCHED = [[SCHED_CX - LANE_DY, T2_Y], [SCHED_CX - LANE_DY, JOG_UP], [API_R_STUB - LANE_DY, JOG_UP], [API_R_STUB - LANE_DY, TOP_BOTTOM]];
// The Node lane addresses the Node frame, not the Kubelet, down the empty tier-2 column.
const TO_KUBELET = [[CX, TOP_BOTTOM], [CX, NODE_Y]];
// Each pair straddles its own face midpoint, so no endpoint stands alone.
const KCTL_LANE_DX = LANE_DY;
const { out: BAND_OUT_Y, back: BAND_BACK_Y } = laneY(60, LANE_DY);
// The out lane runs on the upper level, so it takes the OUTER slot at the client and the inner one
// at the frame. Any other pairing tangles.
const POST     = [[KCTL_CX + KCTL_LANE_DX, KCTL_Y], [KCTL_CX + KCTL_LANE_DX, BAND_OUT_Y], [CX - KCTL_LANE_DX, BAND_OUT_Y], [CX - KCTL_LANE_DX, CP_Y]];
const POST_ACK = [[CX + KCTL_LANE_DX, CP_Y], [CX + KCTL_LANE_DX, BAND_BACK_Y], [KCTL_CX - KCTL_LANE_DX, BAND_BACK_Y], [KCTL_CX - KCTL_LANE_DX, KCTL_Y]];
const PERSIST    = [[API_R, OUT_Y], [ETCD_X, OUT_Y]];
const PERSIST_ACK= [[ETCD_X, BACK_Y], [API_R, BACK_Y]];
const CRI        = [[KUBELET_R, LANE_Y], [RT_X, LANE_Y]];
const START      = [[RT_R, LANE_Y], [POD_X, LANE_Y]];
const WIRE_REQ_Y = OUT_Y - 12, WIRE_ACK_Y = BACK_Y + 18;
const ETCD_GAP_CX = midX(API_R, ETCD_X);
// One register for both client labels: they never share a step.
const KCTL_LABEL_CX = midX(CX, KCTL_CX);
const KCTL_LABEL_Y = BAND_OUT_Y - 16;
// End-anchored beside the spine: a string centred on a vertical lane is cut in half by it.
const WIRE_KUBELET_X = CX - 14;
const WIRE_KUBELET_Y = midX(CP_Y + CP_H, NODE_Y) + 7;

const lane = (points) => P.lane({ points, dim: true, dashed: true });

// List order is z-order: frames first, then blocks, lanes, wire labels and the packet layer.
export const SCENE = {
  'aria-label': 'The object create path: a manifest travels from the client through the control plane to the Kubelet on a Node, which calls the Runtime to start the container',
  parts: [
    P.defs(),
    P.node({ x: FRAME_X, y: CP_Y, w: FRAME_W, h: CP_H, label: 'Control plane' }),
    P.node({ x: FRAME_X, y: NODE_Y, w: FRAME_W, h: NODE_H, label: 'Node-1' }),
    P.box({ key: 'client', x: KCTL_X, y: KCTL_Y, w: KCTL_W, h: BOX_H, label: 'kubectl' }),
    P.box({ key: 'apisrv', x: API_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API' }),
    P.cylinder({ key: 'etcd', x: ETCD_X, y: TOP_Y - 10, w: FLANK_W, h: BOX_H + ETCD_OVER, label: 'ETCD' }),
    P.box({ key: 'cm', x: CM_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'controller-manager' }),
    P.box({ key: 'sched', x: SCHED_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'Scheduler' }),
    P.box({ key: 'kubelet', x: KUBELET_X, y: KUBELET_Y, w: BOX_W, h: BOX_H, label: 'Kubelet' }),
    P.box({ key: 'runtime', x: RT_X, y: KUBELET_Y, w: BOX_W, h: BOX_H, label: 'Runtime' }),
    P.pod({
      key: 'placedPod', id: 'placedPod', innerKey: 'placedPodBox', opacity: 0,
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { dx: 30, dy: 28, w: POD_W - 60, h: 52, label: 'my-app-7d4-abc', sublabel: 'nginx:1.27' },
    }),
    // dim like every other lane, or the Node band reads heavier than the control plane.
    P.lane({ key: 'kubeletCriArrow', points: CRI, dim: true, dashed: true, opacity: 0 }),
    P.lane({ key: 'kubeletPodArrow', points: START, dim: true, dashed: true, opacity: 0 }),
    // Each lane is drawn from the SAME array that carries its ball.
    lane(POST),
    lane(POST_ACK),
    lane(PERSIST),
    lane(PERSIST_ACK),
    lane(TO_CM),
    lane(FROM_CM),
    lane(TO_SCHED),
    lane(FROM_SCHED),
    lane(TO_KUBELET),
    P.wire({ key: 'post', x: KCTL_LABEL_CX, y: KCTL_LABEL_Y }),
    P.wire({ key: 'api-ack', x: KCTL_LABEL_CX, y: KCTL_LABEL_Y }),
    P.wire({ key: 'persist', x: ETCD_GAP_CX, y: WIRE_REQ_Y }),
    P.wire({ key: 'etcd-ack', x: ETCD_GAP_CX, y: WIRE_ACK_Y }),
    // Under their own box: the band above the row carries two lane pairs.
    P.wire({ key: 'controller', x: CM_CX, y: T2_BELOW }),
    P.wire({ key: 'schedule', x: SCHED_CX, y: T2_BELOW }),
    P.wire({ key: 'kubelet-watch', x: WIRE_KUBELET_X, y: WIRE_KUBELET_Y, anchor: 'end' }),
    P.packets(),
  ],
  reset: { keys: ['client', 'apisrv', 'etcd', 'cm', 'sched', 'kubelet', 'runtime', 'placedPodBox'] },
};

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    opacity: { placedPod: 0, kubeletCriArrow: 0, kubeletPodArrow: 0 },
  },
  {
    // Long because the client lanes climb over the frame.
    id: 'post',
    duration: 3000,
    narration: 'You run kubectl apply -f deploy.yaml. The client serializes the manifest as JSON and POSTs it to /apis/apps/v1/namespaces/default/deployments on the API. On an object that already exists the client sends a three-way merge PATCH instead, and Server-side Apply is the same PATCH under its own content type.',
    // Elided to fit, the narration spells the full path out.
    wires: { post: 'POST .../deployments' },
    lit: ['client'],
    flow: [F.route({ points: POST, lights: ['apisrv'] })],
  },
  {
    id: 'persist',
    duration: 2200,
    narration: 'The API authenticates the caller from your kubeconfig, checks RBAC, runs admission and schema validation, then writes the new Deployment my-app to ETCD. ETCD commits the write via Raft quorum at rv=842.',
    // The request, not its outcome: the commit comes back on the ack register in step 3.
    wires: { persist: 'write Deployment my-app' },
    lit: ['apisrv'],
    flow: [F.route({ points: PERSIST, lights: ['etcd'] })],
  },
  {
    id: 'etcd-response',
    duration: 3000,
    narration: 'ETCD acks the committed write back to the API at rv=842, and the API returns HTTP 201 Created to the kubectl client. The Deployment now exists in cluster state, but no Pods have been created yet.',
    wires: { 'etcd-ack': 'ack · rv=842', 'api-ack': 'HTTP 201 Created' },
    lit: ['etcd'],
    // The API takes the ack before it answers the client, so it lights on arrival.
    flow: [
      F.route({ points: PERSIST_ACK, name: 'ack', lights: ['apisrv'] }),
      F.route({ points: POST_ACK, after: 'ack', lights: ['client'] }),
    ],
  },
  {
    id: 'controller',
    // Two watch-and-write cycles, four balls.
    duration: 4400,
    narration: 'The Deployment controller, inside the controller-manager, sees my-app via its watch on the API and creates a ReplicaSet (my-app-7d4). The ReplicaSet controller sees THAT on a watch of its own and creates a Pod (my-app-7d4-abc) with no nodeName yet. Nobody calls anybody.',
    // End value: the second watch, where the step lands.
    wires: { controller: 'watch ADDED ReplicaSet my-app-7d4' },
    lit: ['apisrv'],
    rewind: { wires: { controller: 'watch ADDED Deployment my-app' } },
    flow: [
      F.route({ points: TO_CM, name: 'watchDeploy', lights: ['cm'] }),
      F.route({ points: FROM_CM, after: 'watchDeploy', name: 'makeRs' }),
      F.route({ points: TO_CM, after: 'makeRs', name: 'watchRs' }),
      F.set({ after: 'makeRs', wires: { controller: 'watch ADDED ReplicaSet my-app-7d4' } }),
      F.route({ points: FROM_CM, after: 'watchRs' }),
    ],
  },
  {
    id: 'schedule',
    // Long enough that auto-advance does not cut the Binding off mid-flight.
    duration: 2900,
    narration: 'The Scheduler picks up my-app-7d4-abc, filters candidate Nodes (taints, resources, affinity), scores the survivors on free resources and topology spread, then posts a Binding that pins the Pod to Node-1. That write goes through the API into ETCD like the first one.',
    wires: { schedule: 'POST .../binding · node=Node-1' },
    lit: ['apisrv'],
    flow: [
      F.route({ points: TO_SCHED, name: 'pickup', lights: ['sched'] }),
      F.route({ points: FROM_SCHED, after: 'pickup' }),
    ],
  },
  {
    id: 'kubelet-watch',
    duration: 2400,
    narration: 'The Kubelet on Node-1 has a filtered watch on /api/v1/pods?fieldSelector=spec.nodeName=Node-1. The API streams my-app-7d4-abc down that watch to Node-1, where the Kubelet picks it up.',
    wires: { 'kubelet-watch': 'watch ADDED my-app-7d4-abc' },
    lit: ['apisrv'],
    flow: [F.route({ points: TO_KUBELET, lights: ['kubelet'] })],
  },
  {
    id: 'create-pod',
    duration: 3300,
    narration: 'The Kubelet drives the Runtime over CRI, one call at a time: first a Pod sandbox, which gets the Pod its network namespace and IP, then the nginx:1.27 image, then the container starting inside that sandbox. The Pod my-app-7d4-abc is Running on Node-1.',
    // Pinned visible so cancel returns cleanly.
    opacity: { kubeletCriArrow: 1, kubeletPodArrow: 1, placedPod: 1 },
    lit: ['kubelet'],
    // The animated path pulses the Pod wrapper and lights no inner block, so flowLights cannot derive this.
    reducedLit: ['placedPodBox'],
    // Two hops because two actors: the Kubelet never touches a container itself.
    flow: [
      F.fade({ target: 'kubeletCriArrow', from: 0, to: 1, dur: 400, fill: 'forwards', easing: 'ease-out' }),
      F.fade({ target: 'kubeletPodArrow', from: 0, to: 1, dur: 400, fill: 'forwards', easing: 'ease-out' }),
      F.fade({ target: 'placedPod', from: 0, to: 1, dur: 400, fill: 'forwards', easing: 'ease-out' }),
      F.route({ points: CRI, name: 'cri', lights: ['runtime'] }),
      F.route({ points: START, after: 'cri', pulse: 'placedPod' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
