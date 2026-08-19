import { P, F, defineCard, laneY, midX } from './cluster-kit.js';

// Design notes for this card: ./CARDS.md#cluster-object-create-path

// One grid with cluster-architecture, minus the cloud-controller-manager. The client is the only
// block outside the frame, so its lanes address the FRAME rather than a block.
const FRAME_X = 150, FRAME_W = 900, FRAME_R = FRAME_X + FRAME_W;   // 150..1050, architecture's
const PAD = 20;                                          // one inset, used on every wall
const IN_L = FRAME_X + PAD, IN_R = FRAME_X + FRAME_W - PAD;   // 170 / 1030
const CX = midX(FRAME_X, FRAME_R);                       // 600
const BOX_W = 220, BOX_H = 80;                           // architecture's block, catalog standard

// Columns and rows are shared with cluster-architecture, so the two read as one family in both
// axes. Why the stack sits this low is in ./CARDS.md.
const CP_Y = 90, CP_H = 350, CP_CY = midX(CP_Y, CP_Y + CP_H);    // 90..440, wall midpoint 265
const NODE_Y = 475, NODE_H = 153;                        // 475..628, 12 of canvas floor under it

// Top row: the API on the centre, ETCD on the right wall, architecture's own slot. The 190 unit
// gap is what the label needs, write Deployment my-app measures 158.5. The left slot is empty.
const TOP_Y = 140, TOP_BOTTOM = TOP_Y + BOX_H;           // 140 / 220, 50 under the frame top
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);                  // 180
const LANE_DY = 10;
const { out: OUT_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);   // 170 / 190
const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;     // 490..710
const FLANK_W = 130;
const ETCD_X = IN_R - FLANK_W;  // 900..1030, architecture's own slot
const ETCD_OVER = 30;                                    // cylinder overhang, architecture's
// The client stands in the 150 unit band the frame leaves on the right, centred on that wall, 10
// clear of each side. 130 is the band minus the margins and is also ETCD's width.
const KCTL_W = 130, KCTL_X = FRAME_R + 10;  // 1060..1190
const KCTL_Y = CP_CY - BOX_H / 2;                        // 225..305, centred on the wall
const KCTL_CX = midX(KCTL_X, KCTL_X + KCTL_W);           // 1125

// Tier 2: architecture's two outer columns. Its centre column holds the cloud-controller-manager,
// which this card lacks, and that empty slot is what keeps the Node lane one straight line.
const T2_Y = 328;                                        // 328..408, 108 under the top row
const CM_X = IN_L, CM_CX = midX(CM_X, CM_X + BOX_W);     // 170..390, 280
const SCHED_X = IN_R - BOX_W, SCHED_CX = midX(SCHED_X, SCHED_X + BOX_W);   // 810..1030, 920
const T2_BELOW = T2_Y + BOX_H + 20;                      // 428, architecture's label register:
// one wire label under each tier-2 box, inside the frame whose floor is 440.

// Architecture's tier-3 slots: the Kubelet left, the Pod right. The Pod is 106 tall rather than
// 80, so it centres on the Kubelet's own line and the two share LANE_Y by construction.
const KUBELET_X = IN_L, KUBELET_R = KUBELET_X + BOX_W;   // 170..390
const KUBELET_Y = NODE_Y + 41;                           // 516..596, architecture's row exactly:
// that card moved its Node row up by 6 so its two watch labels could take tier 2's 20 unit gap,
// and this row follows it rather than sitting 6 off the sister card it shares its rows with.
const LANE_Y = midX(KUBELET_Y, KUBELET_Y + BOX_H);       // 556, and the Pod shares it
const POD_W = BOX_W, POD_X = IN_R - POD_W;               // 810..1030
const POD_H = 106, POD_Y = LANE_Y - POD_H / 2;           // 503..609, 28 under the frame top
// The Runtime takes architecture's centre Node column, so the row reads Kubelet, Runtime, Pod on
// one line. The last step NAMES the runtime as the actor, so it has to be on the card.
const RT_X = CX - BOX_W / 2, RT_R = RT_X + BOX_W;        // 490..710

// Each tier-2 box takes a mirrored pair on its top face, the watch turning at JOG_DOWN and the
// write back at JOG_UP, centred in the 108 unit band so the two never cross.
const BAND_CY = midX(TOP_BOTTOM, T2_Y);                  // 274, the middle of the band
const D10 = 10;
const { out: JOG_DOWN, back: JOG_UP } = laneY(BAND_CY, D10);   // 264 / 284
const TO_CM      = [[API_X + 50, TOP_BOTTOM], [API_X + 50, JOG_DOWN], [CM_CX - D10, JOG_DOWN], [CM_CX - D10, T2_Y]];
const FROM_CM    = [[CM_CX + D10, T2_Y], [CM_CX + D10, JOG_UP], [API_X + 70, JOG_UP], [API_X + 70, TOP_BOTTOM]];
const TO_SCHED   = [[API_R - 50, TOP_BOTTOM], [API_R - 50, JOG_DOWN], [SCHED_CX + D10, JOG_DOWN], [SCHED_CX + D10, T2_Y]];
const FROM_SCHED = [[SCHED_CX - D10, T2_Y], [SCHED_CX - D10, JOG_UP], [API_R - 70, JOG_UP], [API_R - 70, TOP_BOTTOM]];
// The Node lane is ONE straight vertical, the API bottom midpoint to the Node frame TOP midpoint,
// both on 600. It is addressed to the Node, not the Kubelet, and 600 is the empty tier-2 column.
const TO_KUBELET = [[CX, TOP_BOTTOM], [CX, NODE_Y]];
// ETCD holds the right flank, so the write leaves the API right face and the ack comes back into
// it. Both pairs straddle their own face midpoint, so no endpoint stands alone.
const KCTL_LANE_DX = 10;
const BAND_OUT_Y = 50, BAND_BACK_Y = 70;                 // the two levels in the 0..90 band
// Which side of each face a lane takes is NOT free: the out lane runs on the upper level, so it
// takes the OUTER slot at the client and the inner one at the frame. Any other pairing tangles.
const POST     = [[KCTL_CX + KCTL_LANE_DX, KCTL_Y], [KCTL_CX + KCTL_LANE_DX, BAND_OUT_Y], [CX - KCTL_LANE_DX, BAND_OUT_Y], [CX - KCTL_LANE_DX, CP_Y]];
const POST_ACK = [[CX + KCTL_LANE_DX, CP_Y], [CX + KCTL_LANE_DX, BAND_BACK_Y], [KCTL_CX - KCTL_LANE_DX, BAND_BACK_Y], [KCTL_CX - KCTL_LANE_DX, KCTL_Y]];
const PERSIST    = [[API_R, OUT_Y], [ETCD_X, OUT_Y]];
const PERSIST_ACK= [[ETCD_X, BACK_Y], [API_R, BACK_Y]];
const CRI        = [[KUBELET_R, LANE_Y], [RT_X, LANE_Y]];
const START      = [[RT_R, LANE_Y], [POD_X, LANE_Y]];
// The two ETCD labels sit BETWEEN their blocks, the request just above its out lane and the ack
// just below its return lane, both centred on the 190 unit gap.
const WIRE_REQ_Y = OUT_Y - 12, WIRE_ACK_Y = BACK_Y + 18;     // 158 / 208
const ETCD_GAP_CX = midX(API_R, ETCD_X);                 // 805
// ONE register for both client labels: they never share a step, the POST is step 1 and the 201 is
// step 3, and the band below the return lane is 20 units, not enough for a second register.
const KCTL_LABEL_CX = midX(CX, KCTL_CX);                 // 862, the middle of the level run
const KCTL_LABEL_Y = BAND_OUT_Y - 16;                    // 34, over the out lane
// The Node watch label is end-anchored just left of the spine: a horizontal string centred on a
// vertical lane is cut in half by it. +7 puts the baseline on the middle of the 440..475 band.
const WIRE_KUBELET_X = CX - 14;                          // 586, end-anchored
const WIRE_KUBELET_Y = midX(CP_Y + CP_H, NODE_Y) + 7;    // 464, centred in the band

const lane = (points) => P.lane({ points, dim: true, dashed: true });

// The list order IS the append order, so it is the z-order: both frames first so each band sits
// behind everything it holds, then the blocks, the lanes, the wire labels and the packet layer.
export const SCENE = {
  'aria-label': 'The object create path: a manifest travels from the client through the control plane to the Kubelet on a Node, which calls the Runtime to start the container',
  parts: [
    P.defs(),
    // The two frames share one span, so the control plane and the Node read as one column, and
    // every block on the card sits in one.
    P.node({ x: FRAME_X, y: CP_Y, w: FRAME_W, h: CP_H, label: 'Control plane' }),
    P.node({ x: FRAME_X, y: NODE_Y, w: FRAME_W, h: NODE_H, label: 'Node-1' }),
    // Top row: the API on the centre and ETCD on the right wall. kubectl is not part of it: it
    // stands outside the frame, on the midpoint of its right wall.
    P.box({ key: 'client', x: KCTL_X, y: KCTL_Y, w: KCTL_W, h: BOX_H, label: 'kubectl' }),
    P.box({ key: 'apisrv', x: API_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API' }),
    P.cylinder({ key: 'etcd', x: ETCD_X, y: TOP_Y - 10, w: FLANK_W, h: BOX_H + ETCD_OVER, label: 'ETCD' }),
    // Middle row: the controller-manager and the Scheduler on the same two walls, with
    // architecture's centre column left empty between them.
    P.box({ key: 'cm', x: CM_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'controller-manager' }),
    P.box({ key: 'sched', x: SCHED_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'Scheduler' }),
    P.box({ key: 'kubelet', x: KUBELET_X, y: KUBELET_Y, w: BOX_W, h: BOX_H, label: 'Kubelet' }),
    P.box({ key: 'runtime', x: RT_X, y: KUBELET_Y, w: BOX_W, h: BOX_H, label: 'Runtime' }),
    // The placed Pod (violet workloads tint) appears inside the node once the Kubelet starts it.
    P.pod({
      key: 'placedPod', id: 'placedPod', innerKey: 'placedPodBox', opacity: 0,
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { dx: 30, dy: 28, w: POD_W - 60, h: 52, label: 'my-app-7d4-abc', sublabel: 'nginx:1.27' },
    }),
    // dim like every other lane: without it these two draw at stroke-width 1.6 against the 1.4 the
    // helper gives the other nine, and the Node band reads heavier than the control plane.
    P.lane({ key: 'kubeletCriArrow', points: CRI, dim: true, dashed: true, opacity: 0 }),
    P.lane({ key: 'kubeletPodArrow', points: START, dim: true, dashed: true, opacity: 0 }),
    // Top-row lanes straddle the Api centre (OUT_Y out, BACK_Y back) on both sides.
    // Each top-row lane is drawn from the SAME array that carries its ball.
    lane(POST),
    lane(POST_ACK),
    lane(PERSIST),
    lane(PERSIST_ACK),
    // ControllerManager and Scheduler each get a watch lane out and a write lane back, and the
    // two pairs are mirrored about the spine.
    lane(TO_CM),
    lane(FROM_CM),
    lane(TO_SCHED),
    lane(FROM_SCHED),
    // Api -> Kubelet: straight down the spine, then into the Kubelet inside the node.
    lane(TO_KUBELET),
    P.wire({ key: 'post', x: KCTL_LABEL_CX, y: KCTL_LABEL_Y }),
    P.wire({ key: 'api-ack', x: KCTL_LABEL_CX, y: KCTL_LABEL_Y }),
    P.wire({ key: 'persist', x: ETCD_GAP_CX, y: WIRE_REQ_Y }),
    P.wire({ key: 'etcd-ack', x: ETCD_GAP_CX, y: WIRE_ACK_Y }),
    // Both tier-2 labels sit UNDER their own box, on architecture's register: the band above the
    // row carries two lane pairs and their jogs, and a label in it would sit on a lane.
    P.wire({ key: 'controller', x: CM_CX, y: T2_BELOW }),
    P.wire({ key: 'schedule', x: SCHED_CX, y: T2_BELOW }),
    // Beside the spine, not centred on it: see WIRE_KUBELET_X.
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
    // 3000 rather than 1700: the client lanes climb over the frame, so the POST rides 760 units
    // against the 360 a flat top row would give it, and the PATCH sentence has to be read.
    id: 'post',
    duration: 3000,
    narration: 'You run kubectl apply -f deploy.yaml. The client serializes the manifest as JSON and POSTs it to /apis/apps/v1/namespaces/default/deployments on the API. On an object that already exists the client sends a three-way merge PATCH instead, and Server-side Apply is the same PATCH under its own content type.',
    // Elided to fit between the blocks, the card's own idiom (step 5 writes POST .../binding).
    // Nothing is lost: the step narration spells the full path out.
    wires: { post: 'POST .../deployments' },
    lit: ['client'],
    flow: [F.route({ points: POST, lights: ['apisrv'] })],
  },
  {
    id: 'persist',
    duration: 2200,
    narration: 'The API authenticates the caller from your kubeconfig, checks RBAC, runs admission and schema validation, then writes the new Deployment my-app to ETCD. ETCD commits the write via Raft quorum at rv=842.',
    // The REQUEST, not its outcome: this register sits above the OUTBOUND lane. The commit is
    // what step 3 brings back, on the ack register, as ack · rv=842.
    wires: { persist: 'write Deployment my-app' },
    lit: ['apisrv'],
    flow: [F.route({ points: PERSIST, lights: ['etcd'] })],
  },
  {
    // 3000 rather than 2200: this step chains the ETCD ack into the client ack, and the second
    // half of that chain is the same 760 unit climb the POST takes.
    id: 'etcd-response',
    duration: 3000,
    narration: 'ETCD acks the committed write back to the API at rv=842, and the API returns HTTP 201 Created to the kubectl client. The Deployment now exists in cluster state, but no Pods have been created yet.',
    wires: { 'etcd-ack': 'ack · rv=842', 'api-ack': 'HTTP 201 Created' },
    lit: ['etcd'],
    // ETCD sends the ack, so it is lit from entry. The Api is mid-chain: it takes the ack before
    // it answers the client, so it lights on arrival, and the client lights one hop later.
    flow: [
      F.route({ points: PERSIST_ACK, name: 'ack', lights: ['apisrv'] }),
      F.route({ points: POST_ACK, after: 'ack', lights: ['client'] }),
    ],
  },
  {
    id: 'controller',
    // 4400: this step is TWO watch-and-write cycles, not one, so it carries four balls.
    duration: 4400,
    narration: 'The Deployment controller, inside the controller-manager, sees my-app via its watch on the API and creates a ReplicaSet (my-app-7d4). The ReplicaSet controller sees THAT on a watch of its own and creates a Pod (my-app-7d4-abc) with no nodeName yet. Nobody calls anybody.',
    // End value above the guard, the second watch, because that is where the step lands.
    wires: { controller: 'watch ADDED ReplicaSet my-app-7d4' },
    lit: ['apisrv'],
    rewind: { wires: { controller: 'watch ADDED Deployment my-app' } },
    // Each handoff is a component reacting to its OWN watch, so both cycles ride: watch the
    // Deployment, create the ReplicaSet, watch the ReplicaSet, create the Pod.
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
    // 2900, not 2200: widening the tier-2 lane band took the span to 2211, and the auto-advance
    // would have cut the Binding off mid-flight. The rest is reading time for the ETCD sentence.
    duration: 2900,
    narration: 'The Scheduler picks up my-app-7d4-abc, filters candidate Nodes (taints, resources, affinity), scores the survivors on free resources and topology spread, then posts a Binding that pins the Pod to Node-1. That write goes through the API into ETCD like the first one.',
    wires: { schedule: 'POST .../binding · node=Node-1' },
    lit: ['apisrv'],
    // Watch in, Binding back out on the return lane. It lights when the watch reaches it:
    // everything it does here is a reaction to that event.
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
    // 3300: two hops now, the CRI call and the container starting, not one.
    duration: 3300,
    narration: 'The Kubelet drives the Runtime over CRI, one call at a time: first a Pod sandbox, which gets the Pod its network namespace and IP, then the nginx:1.27 image, then the container starting inside that sandbox. The Pod my-app-7d4-abc is Running on Node-1.',
    // Pin the arrows/pod visible so cancel returns cleanly. The Pod appears in its
    // normal (thin) outline, pulses once on arrival, then eases back to it.
    opacity: { kubeletCriArrow: 1, kubeletPodArrow: 1, placedPod: 1 },
    lit: ['kubelet'],
    // Static end-state: the animated path pulses the placedPod WRAPPER and lights no inner block,
    // so the inner box is what the reduced path says instead, and flowLights cannot derive it.
    reducedLit: ['placedPodBox'],
    // The Kubelet calls the Runtime, the Runtime brings the container up. Two hops, because two
    // actors: the Kubelet never touches a container itself.
    flow: [
      F.fade({ target: 'kubeletCriArrow', from: 0, to: 1, dur: 400, fill: 'forwards', easing: 'ease-out' }),
      F.fade({ target: 'kubeletPodArrow', from: 0, to: 1, dur: 400, fill: 'forwards', easing: 'ease-out' }),
      F.fade({ target: 'placedPod', from: 0, to: 1, dur: 400, fill: 'forwards', easing: 'ease-out' }),
      F.route({ points: CRI, name: 'cri', lights: ['runtime'] }),
      F.route({ points: START, after: 'cri', name: 'start' }),
      F.pulse({ pod: 'placedPod', at: 'start' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
