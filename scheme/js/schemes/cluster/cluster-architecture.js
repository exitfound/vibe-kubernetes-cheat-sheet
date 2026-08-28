import { P, F, defineCard, laneY, midX, shade, OPACITY } from './cluster-kit.js';

// Two dashed frames of the same width, a control plane over Node-1, each holding its own tiers.
// Design notes for this card: ./CARDS/cluster-architecture.md
const BOX_W = 220, BOX_H = 80;
const CX = 600;

// Both frames span 150..1050 with 20 of padding on each wall, so every block lives inside 170..1030
// and the two bands read as one column. The rows are cluster-object-create-path's, to the unit.
const FRAME_X = 150, FRAME_W = 900;
const CP_Y = 90, CP_H = 350;                             // 90..440, the create-path frame exactly
const NODE_Y = 475, NODE_H = 153;                        // 475..628, 12 of canvas floor under it

const API_Y = 140, API_BOTTOM = API_Y + BOX_H;           // 140 / 220
const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;     // 490..710
const API_CY = API_Y + BOX_H / 2;                        // 180
const ETCD_W = 130, ETCD_X = 900;                        // 900..1030, right edge on the Scheduler below
const LANE_DY = 10;
const { out: ETCD_OUT, back: ETCD_IN } = laneY(API_CY, LANE_DY);  // 170 / 190

const T2_Y = 328;                                        // controller-manager, cloud-controller-manager, Scheduler
const CM_X = 170, CM_CX = CM_X + BOX_W / 2;              // 170..390, 280
const CCM_X = CX - BOX_W / 2;                            // 490..710, straight under the API
const SCHED_X = 810, SCHED_CX = SCHED_X + BOX_W / 2;     // 810..1030, 920

const T2_BELOW = T2_Y + BOX_H + 20;                      // 428, one wire label under each tier-2 box,
                                                         // 12 clear of the frame floor

const T3_Y = NODE_Y + 41;                                // 516, Runtime, Kubelet, kube-proxy.
// 41 rather than 47, so the two watch labels under it get tier 2's 20 unit gap.
// cluster-object-create-path holds the same offset, so the two share the row.
const RT_X = 170, KUBE_X = CX - BOX_W / 2, KP_X = 810;
const KUBE_CX = KUBE_X + BOX_W / 2, KP_CX = KP_X + BOX_W / 2;    // 600 / 920
const T3_CY = T3_Y + BOX_H / 2;                          // 556
const T3_BELOW = T3_Y + BOX_H + 20;                      // 616, tier 2's rhythm inside the Node
// frame, gap included: +20 here lands the label on the y the tier-2 rhythm gives.

// Each control-plane exchange is a lane PAIR straddling the flow line, so no endpoint sits alone.
// The two Node-bound lanes are single and therefore leave the API on a face MIDPOINT instead.
const D10 = 10;
const BAND_CY = midX(API_BOTTOM, T2_Y);                  // 274, the middle of the band
const { out: JOG_DOWN, back: JOG_UP } = laneY(BAND_CY, D10);  // 264 / 284, centred in the 108 unit band
// L_CORR / R_CORR are the midpoints of the corridors flanking the tier-2 centre column, BAND_Y the
// free band between the frames: the two Node-bound lanes turn there and cross no block.
const L_CORR = 440, R_CORR = 760, BAND_Y = 457;          // 457 is the middle of the 440..475 band
const API_TO_ETCD = [[API_R, ETCD_OUT], [ETCD_X, ETCD_OUT]];
const ETCD_TO_API = [[ETCD_X, ETCD_IN], [API_R, ETCD_IN]];
const TO_CM    = [[API_X + 50, API_BOTTOM], [API_X + 50, JOG_DOWN], [CM_CX - D10, JOG_DOWN], [CM_CX - D10, T2_Y]];
const FROM_CM  = [[CM_CX + D10, T2_Y], [CM_CX + D10, JOG_UP], [API_X + 70, JOG_UP], [API_X + 70, API_BOTTOM]];
const TO_CCM   = [[CX - D10, API_BOTTOM], [CX - D10, T2_Y]];
const FROM_CCM = [[CX + D10, T2_Y], [CX + D10, API_BOTTOM]];
const TO_SCHED = [[API_R - 50, API_BOTTOM], [API_R - 50, JOG_DOWN], [SCHED_CX + D10, JOG_DOWN], [SCHED_CX + D10, T2_Y]];
const FROM_SCHED = [[SCHED_CX - D10, T2_Y], [SCHED_CX - D10, JOG_UP], [API_R - 70, JOG_UP], [API_R - 70, API_BOTTOM]];
const API_TO_KUBELET = [[API_X, API_CY], [L_CORR, API_CY], [L_CORR, BAND_Y], [KUBE_CX, BAND_Y], [KUBE_CX, T3_Y]];
const API_TO_KPROXY  = [[API_R, API_CY], [R_CORR, API_CY], [R_CORR, BAND_Y], [KP_CX, BAND_Y], [KP_CX, T3_Y]];
// CRI, and it runs Kubelet to Runtime because that is the direction the last step narrates.
const KUBELET_TO_RUNTIME = [[KUBE_X, T3_CY], [RT_X + BOX_W, T3_CY]];

// The two ETCD labels share one centre line in the 190 unit gap between the API and the cylinder:
// the write above its lane, the read below its own. The gap is the BUDGET: see ./CARDS/cluster-architecture.md.
const ETCD_LABEL_X = midX(API_R, ETCD_X);                // 805, and 27 characters is the ceiling

const lane = (key, points) => P.lane({ key, points, dim: true, dashed: true });

// The list order IS the append order, so it is the z-order: the two frames behind everything they
// hold, the three tiers, the lanes, the wire labels, and the packet layer last.
export const SCENE = {
  'aria-label': 'Kubernetes cluster architecture: the API, ETCD, the controller-manager, the cloud-controller-manager and the Scheduler inside the control plane, with the Kubelet and kube-proxy on Node-1 each watching the API for itself, and the Kubelet driving the Runtime over CRI',
  parts: [
    P.defs(),
    // Both frame labels sit on the LEFT top corner node() gives them, CONTROL PLANE at (162, 108)
    // and NODE-1 at (162, 493). What the first one costs is in ./CARDS/cluster-architecture.md.
    P.node({ key: 'cpEl', x: FRAME_X, y: CP_Y, w: FRAME_W, h: CP_H, label: 'Control plane' }),
    P.node({ key: 'nodeEl', x: FRAME_X, y: NODE_Y, w: FRAME_W, h: NODE_H, label: 'Node-1' }),
    // Tier 1: API (centre) + ETCD (top-right). All component boxes use the
    // workloads standard size (w:220 h:80) so every block reads at one scale.
    P.box({ key: 'apisrv', x: API_X, y: API_Y, w: BOX_W, h: BOX_H, label: 'API' }),
    P.cylinder({ key: 'etcdC', x: ETCD_X, y: API_Y - 10, w: ETCD_W, h: BOX_H + 30, label: 'ETCD' }),
    // Tier 2: the three loop runners. Each column stands over its tier-3 neighbour,
    // and the cloud-controller-manager sits straight under the API it watches.
    P.box({ key: 'ctrlMgr', x: CM_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'controller-manager' }),
    // The sublabel is the doc's own qualifier: Components lists it as cloud-controller-manager
    // (optional) and an on-premises cluster runs none. Without it the centre slot reads as core.
    P.box({ key: 'ccm', x: CCM_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'cloud-controller-manager', sublabel: 'optional' }),
    P.box({ key: 'sched', x: SCHED_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'Scheduler' }),
    // Tier 3, inside the Node frame: Runtime (left), Kubelet (centre), kube-proxy (right).
    P.box({ key: 'runtime', x: RT_X, y: T3_Y, w: BOX_W, h: BOX_H, label: 'Runtime' }),
    P.box({ key: 'kubelet', x: KUBE_X, y: T3_Y, w: BOX_W, h: BOX_H, label: 'Kubelet' }),
    P.box({ key: 'kproxy', x: KP_X, y: T3_Y, w: BOX_W, h: BOX_H, label: 'kube-proxy' }),
    // The lanes are two NAMED GROUPS, not one flat list, because the card shows one half of the
    // diagram at a time: ten lanes on screen at once is more than a reader can follow.
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
    // The last step NAMES the CRI call, so this is a ROUTE with a ball, running Kubelet to Runtime,
    // the direction the narration gives it. It belongs to the Node half and mutes with it.
    lane('laneCri', KUBELET_TO_RUNTIME),
    P.wire({ key: 'etcd-write', x: ETCD_LABEL_X, y: ETCD_OUT - 12 }),
    P.wire({ key: 'etcd-read', x: ETCD_LABEL_X, y: ETCD_IN + 22 }),
    P.wire({ key: 'controllers', x: CM_CX, y: T2_BELOW }),
    P.wire({ key: 'cloud', x: CX, y: T2_BELOW }),
    P.wire({ key: 'scheduler', x: SCHED_CX, y: T2_BELOW }),
    // The three Node lane labels sit UNDER the block they describe, as each tier-2 label does: a
    // watch label belongs beside the component watching, not out in the band.
    P.wire({ key: 'cri', x: RT_X + BOX_W / 2, y: T3_BELOW }),      // the CRI route carries a ball too
    P.wire({ key: 'kubelet', x: KUBE_CX, y: T3_BELOW }),
    P.wire({ key: 'kproxy', x: KP_CX, y: T3_BELOW }),
    P.packets(),
  ],
  reset: { keys: ['apisrv', 'etcdC', 'ctrlMgr', 'ccm', 'sched', 'kubelet', 'runtime', 'kproxy'] },
};

// One field writes BOTH groups, so they cannot drift. The treatments differ DELIBERATELY: a
// control-plane lane out of play dims, a Node-bound lane is not drawn at all.
const CP_LANES = ['laneEtcdOut', 'laneEtcdBack', 'laneCmIn', 'laneCmOut', 'laneCcmIn', 'laneCcmOut', 'laneSchedIn', 'laneSchedOut'];
const NODE_LANES = ['laneKubelet', 'laneKproxy', 'laneCri'];
// Slot 0 takes the control-plane shape rather than a third state, so the poster shows the control
// plane whole and the Node band quiet.
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
    // Watch event in on the upper lane, reconcile write-back out on the lower one. The
    // controller-manager is dark until the watch lands: it acts on what it receives.
    flow: [
      F.route({ points: TO_CM, name: 'watch', lights: ['ctrlMgr'] }),
      F.route({ points: FROM_CM, after: 'watch' }),
    ],
  },
  {
    id: 'cloud-controllers',
    duration: 2400,
    narration: 'The cloud-controller-manager runs the loops that talk to a cloud provider: Node lifecycle, cloud routes and Service load balancers. It is optional and a cluster on your own hardware has none. It writes what it learns back to the API, and it is split out so provider code lives outside the core.',
    // The lane pair runs API to CCM and back, so the label names what rides it. The call to the
    // provider is in the narration, because no provider is drawn and no ball goes to one.
    wires: { cloud: 'watch Nodes and Services · write status back' },
    opacity: CONTROL_HALF,
    lit: ['apisrv'],
    // Same beat as the controller-manager beside it: watch in, write-back out.
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
    // Watch Pods in on the upper lane, the Binding posted back on the lower one.
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
    // The Node half takes over: the lanes into the Node band are DRAWN for the first time
    // here, at full strength, and the control-plane exchanges mute behind them.
    opacity: NODE_HALF,
    lit: ['apisrv'],
    // Two independent lanes off the API: kube-proxy is not fed by the Kubelet. The CRI call leaves
    // AFTER the watch lands, so the Runtime lights on the Kubelet driving it rather than with it.
    flow: [
      F.route({ points: API_TO_KUBELET, name: 'toKubelet', lights: ['kubelet'] }),
      F.route({ points: API_TO_KPROXY, lights: ['kproxy'] }),
      F.route({ points: KUBELET_TO_RUNTIME, after: 'toKubelet', lights: ['runtime'] }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
