import { LANE_DY, P, F, defineCard, laneY, midX, shade, CLU, OPACITY } from './cluster-kit.js';

// Two dashed frames of the same width, a control plane over Node-1, each holding its own tiers.
// Design notes for this card: ./CARDS/cluster-architecture.md
const BOX_W = 232, BOX_H = 80;
const CX = 600;

// Both frames match cluster-object-create-path's, with 20 of padding on each wall.
const FRAME_X = 150, FRAME_W = 900;
// Each frame is fitted to what it holds (CLU.L-01), wire labels included.
const CP_Y = 96, CP_H = 344;
const NODE_Y = 475, NODE_H = 146;

const API_Y = 140, API_BOTTOM = API_Y + BOX_H;
const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;
const API_CY = API_Y + BOX_H / 2;
// Narrower than the siblings' 130 to keep the ETCD label gap (BUDGET in the record).
const ETCD_W = 124, ETCD_X = 906;                        // right edge on the Scheduler below
const { out: ETCD_OUT, back: ETCD_IN } = laneY(API_CY, LANE_DY);

const T2_Y = 328;
const CM_X = 170, CM_CX = CM_X + BOX_W / 2;
const CCM_X = CX - BOX_W / 2;                            // straight under the API
const SCHED_X = 1030 - BOX_W, SCHED_CX = SCHED_X + BOX_W / 2;

const T2_BELOW = T2_Y + BOX_H + 20;                      // wire labels under the tier-2 boxes

const T3_Y = NODE_Y + CLU.NODE.POD_DY;
const RT_X = CM_X, KUBE_X = CX - BOX_W / 2, KP_X = SCHED_X;
const KUBE_CX = KUBE_X + BOX_W / 2, KP_CX = KP_X + BOX_W / 2;
const T3_CY = T3_Y + BOX_H / 2;
const T3_BELOW = T3_Y + BOX_H + 20;                      // tier 2's label rhythm

// Control-plane exchanges are lane pairs. The single Node-bound lanes leave an API face midpoint.
const BAND_CY = midX(API_BOTTOM, T2_Y);
const { out: JOG_DOWN, back: JOG_UP } = laneY(BAND_CY, LANE_DY);
// Corridor midpoints flanking the centre column, and the band between the frames: the Node-bound
// lanes turn there and cross no block.
const L_CORR = 443, R_CORR = 757, BAND_Y = 457;
const API_L_STUB = API_X + 60, API_R_STUB = API_R - 60;
const API_TO_ETCD = [[API_R, ETCD_OUT], [ETCD_X, ETCD_OUT]];
const ETCD_TO_API = [[ETCD_X, ETCD_IN], [API_R, ETCD_IN]];
const TO_CM    = [[API_L_STUB - LANE_DY, API_BOTTOM], [API_L_STUB - LANE_DY, JOG_DOWN], [CM_CX - LANE_DY, JOG_DOWN], [CM_CX - LANE_DY, T2_Y]];
const FROM_CM  = [[CM_CX + LANE_DY, T2_Y], [CM_CX + LANE_DY, JOG_UP], [API_L_STUB + LANE_DY, JOG_UP], [API_L_STUB + LANE_DY, API_BOTTOM]];
const TO_CCM   = [[CX - LANE_DY, API_BOTTOM], [CX - LANE_DY, T2_Y]];
const FROM_CCM = [[CX + LANE_DY, T2_Y], [CX + LANE_DY, API_BOTTOM]];
const TO_SCHED = [[API_R_STUB + LANE_DY, API_BOTTOM], [API_R_STUB + LANE_DY, JOG_DOWN], [SCHED_CX + LANE_DY, JOG_DOWN], [SCHED_CX + LANE_DY, T2_Y]];
const FROM_SCHED = [[SCHED_CX - LANE_DY, T2_Y], [SCHED_CX - LANE_DY, JOG_UP], [API_R_STUB - LANE_DY, JOG_UP], [API_R_STUB - LANE_DY, API_BOTTOM]];
const API_TO_KUBELET = [[API_X, API_CY], [L_CORR, API_CY], [L_CORR, BAND_Y], [KUBE_CX, BAND_Y], [KUBE_CX, T3_Y]];
const API_TO_KPROXY  = [[API_R, API_CY], [R_CORR, API_CY], [R_CORR, BAND_Y], [KP_CX, BAND_Y], [KP_CX, T3_Y]];
// Kubelet to Runtime, the direction the narration gives the CRI call.
const KUBELET_TO_RUNTIME = [[KUBE_X, T3_CY], [RT_X + BOX_W, T3_CY]];

// The gap between API and cylinder caps an ETCD label at 27 characters.
const ETCD_LABEL_X = midX(API_R, ETCD_X);

const lane = (key, points) => P.lane({ key, points, dim: true, dashed: true });

// List order is z-order.
export const SCENE = {
  'aria-label': 'Kubernetes cluster architecture: the API, ETCD, the controller-manager, the cloud-controller-manager and the Scheduler inside the control plane, with the Kubelet and kube-proxy on Node-1 each watching the API for itself, and the Kubelet driving the Runtime over CRI',
  parts: [
    P.defs(),
    P.node({ key: 'cpEl', x: FRAME_X, y: CP_Y, w: FRAME_W, h: CP_H, label: 'Control plane' }),
    P.node({ key: 'nodeEl', x: FRAME_X, y: NODE_Y, w: FRAME_W, h: NODE_H, label: 'Node-1' }),
    P.box({ key: 'apisrv', x: API_X, y: API_Y, w: BOX_W, h: BOX_H, label: 'API' }),
    P.cylinder({ key: 'etcdC', x: ETCD_X, y: API_Y - 10, w: ETCD_W, h: BOX_H + 30, label: 'ETCD' }),
    P.box({ key: 'ctrlMgr', x: CM_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'controller-manager' }),
    // `optional` is the docs' own qualifier: without it the centre slot reads as core.
    P.box({ key: 'ccm', x: CCM_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'cloud-controller-manager', sublabel: 'optional' }),
    P.box({ key: 'sched', x: SCHED_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'Scheduler' }),
    P.box({ key: 'runtime', x: RT_X, y: T3_Y, w: BOX_W, h: BOX_H, label: 'Runtime' }),
    P.box({ key: 'kubelet', x: KUBE_X, y: T3_Y, w: BOX_W, h: BOX_H, label: 'Kubelet' }),
    P.box({ key: 'kproxy', x: KP_X, y: T3_Y, w: BOX_W, h: BOX_H, label: 'kube-proxy' }),
    // Two lane groups: the card shows one half of the diagram at a time.
    lane('laneEtcdOut', API_TO_ETCD),
    lane('laneEtcdBack', ETCD_TO_API),
    lane('laneCmIn', TO_CM),
    lane('laneCmOut', FROM_CM),
    lane('laneCcmIn', TO_CCM),
    lane('laneCcmOut', FROM_CCM),
    lane('laneSchedIn', TO_SCHED),
    lane('laneSchedOut', FROM_SCHED),
    lane('laneKubelet', API_TO_KUBELET),
    lane('laneKproxy', API_TO_KPROXY),
    lane('laneCri', KUBELET_TO_RUNTIME),
    P.wire({ key: 'etcd-write', x: ETCD_LABEL_X, y: ETCD_OUT - 12 }),
    P.wire({ key: 'etcd-read', x: ETCD_LABEL_X, y: ETCD_IN + 22 }),
    P.wire({ key: 'controllers', x: CM_CX, y: T2_BELOW }),
    P.wire({ key: 'cloud', x: CX, y: T2_BELOW }),
    P.wire({ key: 'scheduler', x: SCHED_CX, y: T2_BELOW }),
    // Node lane labels sit under the component watching, as the tier-2 ones do.
    P.wire({ key: 'cri', x: RT_X + BOX_W / 2, y: T3_BELOW }),
    P.wire({ key: 'kubelet', x: KUBE_CX, y: T3_BELOW }),
    P.wire({ key: 'kproxy', x: KP_CX, y: T3_BELOW }),
    P.packets(),
  ],
  reset: { keys: ['apisrv', 'etcdC', 'ctrlMgr', 'ccm', 'sched', 'kubelet', 'runtime', 'kproxy'] },
};

// Deliberately different: an idle control-plane lane dims, an idle Node lane is not drawn.
const CP_LANES = ['laneEtcdOut', 'laneEtcdBack', 'laneCmIn', 'laneCmOut', 'laneCcmIn', 'laneCcmOut', 'laneSchedIn', 'laneSchedOut'];
const NODE_LANES = ['laneKubelet', 'laneKproxy', 'laneCri'];
// Also the poster shape.
const CONTROL_HALF = { ...shade(CP_LANES, 1), ...shade(NODE_LANES, 0) };
const NODE_HALF = { ...shade(CP_LANES, OPACITY.notready), ...shade(NODE_LANES, 1) };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    opacity: CONTROL_HALF,
  },
  {
    id: 'api',
    duration: 2800,
    narration: 'The API is the only way in for clients and controllers. Every read and every write passes through it, and a write clears authentication, authorization and admission before it is stored. Replicas are stateless and scale horizontally. The one path that skips it is a static Pod, which the Kubelet reads off the Node.',
    opacity: CONTROL_HALF,
    lit: ['apisrv'],
  },
  {
    id: 'etcd',
    duration: 2300,
    narration: 'ETCD holds the cluster state the API serves, and in a standard cluster the API is the only client it has. Every change is replicated through Raft, where a quorum of replicas must agree before the write is committed and the revision moves forward.',
    wires: { 'etcd-write': 'write · Raft quorum commit' },
    opacity: CONTROL_HALF,
    lit: ['apisrv'],
    flow: [F.route({ points: API_TO_ETCD, lights: ['etcdC'] })],
  },
  {
    id: 'etcd-response',
    duration: 2600,
    narration: 'On the way back ETCD serves reads to the API, which is a separate exchange rather than the answer to that write. A watch keeps the stream open and pushes later changes through it without another round trip. Clients watch the API, never ETCD, and it answers them from its own cache.',
    wires: { 'etcd-read': 'read · watch stream' },
    opacity: CONTROL_HALF,
    lit: ['etcdC'],
    flow: [F.route({ points: ETCD_TO_API, lights: ['apisrv'] })],
  },
  {
    id: 'controllers',
    duration: 2600,
    narration: 'The controller-manager runs the built-in control loops, roughly one per resource kind (Deployment, ReplicaSet, Job and so on), plus loops that cut across all of them like the garbage collector. Each watches the API, never ETCD, and writes back to reconcile observed state with desired state.',
    wires: { controllers: 'watch · reconcile loop' },
    opacity: CONTROL_HALF,
    lit: ['apisrv'],
    // The controller-manager stays dark until the watch lands.
    flow: [
      F.route({ points: TO_CM, name: 'watch', lights: ['ctrlMgr'] }),
      F.route({ points: FROM_CM, after: 'watch' }),
    ],
  },
  {
    id: 'cloud-controllers',
    duration: 2400,
    narration: 'The cloud-controller-manager runs the loops that talk to a cloud provider: Node lifecycle, cloud routes and Service load balancers. It is optional and a cluster on your own hardware has none. It writes what it learns back to the API, and it is split out so provider code lives outside the core.',
    // No provider is drawn, so the provider call lives only in the narration.
    wires: { cloud: 'watch Nodes and Services · write status back' },
    opacity: CONTROL_HALF,
    lit: ['apisrv'],
    flow: [
      F.route({ points: TO_CCM, name: 'watch', lights: ['ccm'] }),
      F.route({ points: FROM_CCM, after: 'watch' }),
    ],
  },
  {
    id: 'scheduler',
    duration: 2600,
    narration: 'The Scheduler watches Pods that have no Node assignment yet, filters and scores the candidates, then posts a Binding back to the API. On the ordinary path that one write is all it does, and preemption is the exception where it also deletes victims. The Kubelet on the chosen Node takes it from there.',
    wires: { scheduler: 'watch Pods · post Binding' },
    opacity: CONTROL_HALF,
    lit: ['apisrv'],
    flow: [
      F.route({ points: TO_SCHED, name: 'watch', lights: ['sched'] }),
      F.route({ points: FROM_SCHED, after: 'watch' }),
    ],
  },
  {
    id: 'node-side',
    duration: 3400,
    narration: 'The Kubelet watches the API for Pods assigned to its Node, then calls the Runtime over CRI to start their containers, and PATCHes Pod status back so the loops above have observed state to compare. Beside it kube-proxy watches the API on its own, for Services and EndpointSlices, and programs the local rules. It is optional too, and an eBPF dataplane can replace it.',
    wires: { cri: 'CRI · start containers', kubelet: 'watch Pods · spec.nodeName=Node-1', kproxy: 'watch Services · EndpointSlices' },
    opacity: NODE_HALF,
    lit: ['apisrv'],
    // kube-proxy is not fed by the Kubelet. The CRI call leaves after the watch lands.
    flow: [
      F.route({ points: API_TO_KUBELET, name: 'toKubelet', lights: ['kubelet'] }),
      F.route({ points: API_TO_KPROXY, lights: ['kproxy'] }),
      F.route({ points: KUBELET_TO_RUNTIME, after: 'toKubelet', lights: ['runtime'] }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
