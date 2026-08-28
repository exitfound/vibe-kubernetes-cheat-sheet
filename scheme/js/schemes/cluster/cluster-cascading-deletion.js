import { P, F, defineCard, laneY, midX, BEAT, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-cascading-deletion.md

// One grid with cluster-object-create-path: the same two frames, the same columns and the same rows.
// The client is the only block outside the frame, so its lanes address the FRAME rather than a block.
const FRAME_X = 150, FRAME_W = 900, FRAME_R = FRAME_X + FRAME_W;   // 150..1050, architecture's
const PAD = 20;                                          // one inset, used on every wall
const IN_L = FRAME_X + PAD, IN_R = FRAME_X + FRAME_W - PAD;   // 170 / 1030
const CX = midX(FRAME_X, FRAME_R);                       // 600
const BOX_W = 220, BOX_H = 80;                           // architecture's block, catalog standard

// Columns and rows are shared with cluster-object-create-path, so the two read as one family in
// both axes. Why the stack sits this low is in ./CARDS/cluster-cascading-deletion.md.
const CP_Y = 90, CP_H = 350, CP_CY = midX(CP_Y, CP_Y + CP_H);    // 90..440, wall midpoint 265
const NODE_Y = 475, NODE_H = 153;                        // 475..628, 12 of canvas floor under it

// Top row: the API on the centre, ETCD on the right wall, architecture's own slot. The left slot
// is empty, which is what keeps the Node pair straight down the middle.
const TOP_Y = 140, TOP_BOTTOM = TOP_Y + BOX_H;           // 140 / 220, 50 under the frame top
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);                  // 180
const LANE_DY = 10;
const { out: OUT_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);   // 170 / 190
const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;     // 490..710
const FLANK_W = 130;
const ETCD_X = IN_R - FLANK_W;                           // 900..1030, architecture's own slot
const ETCD_OVER = 30;                                    // cylinder overhang, architecture's
// The client stands in the 150 unit band the frame leaves on the right, centred on that wall, 10
// clear of each side. 130 is the band minus the margins and is also ETCD's width.
const KCTL_W = FLANK_W, KCTL_X = FRAME_R + 10;           // 1060..1190
const KCTL_Y = CP_CY - BOX_H / 2;                        // 225..305, centred on the wall
const KCTL_CX = midX(KCTL_X, KCTL_X + KCTL_W);           // 1125

// Tier 2: architecture's two outer columns. Its centre column is empty here, which is what keeps
// the Node pair two straight verticals.
const T2_Y = 328;                                        // 328..408, 108 under the top row
const CM_X = IN_L, CM_CX = midX(CM_X, CM_X + BOX_W);     // 170..390, 280
const GC_X = IN_R - BOX_W, GC_CX = midX(GC_X, GC_X + BOX_W);   // 810..1030, 920
const T2_BELOW = T2_Y + BOX_H + 20;                      // 428, architecture's label register:
// one wire label under each tier-2 box, inside the frame whose floor is 440.

// Architecture's tier-3 slots: the Kubelet left, the Pod right. The Pod is 106 tall rather than
// 80, so it centres on the Kubelet's own line and the two share LANE_Y by construction.
const KUBELET_X = IN_L, KUBELET_R = KUBELET_X + BOX_W;   // 170..390
const KUBELET_Y = NODE_Y + 41;                           // 516..596, architecture's row exactly
const LANE_Y = midX(KUBELET_Y, KUBELET_Y + BOX_H);       // 556, and the Pod shares it
const POD_W = BOX_W, POD_X = IN_R - POD_W;               // 810..1030
const POD_H = 106, POD_Y = LANE_Y - POD_H / 2;           // 503..609, 28 under the frame top
const POD_INNER = { dx: 30, dy: 28, w: POD_W - 60, h: 52 };

// Each tier-2 box takes a mirrored pair on its top face, the watch turning at JOG_DOWN and the
// write back at JOG_UP, centred in the 108 unit band so the two never cross.
const BAND_CY = midX(TOP_BOTTOM, T2_Y);                  // 274, the middle of the band
const D10 = 10;
const { out: JOG_DOWN, back: JOG_UP } = laneY(BAND_CY, D10);   // 264 / 284
const D30 = 30, D60 = 60;
const TO_CM   = [[CX - D60, TOP_BOTTOM], [CX - D60, JOG_DOWN], [CM_CX - D10, JOG_DOWN], [CM_CX - D10, T2_Y]];
const TO_GC   = [[CX + D60, TOP_BOTTOM], [CX + D60, JOG_DOWN], [GC_CX + D10, JOG_DOWN], [GC_CX + D10, T2_Y]];
// The lone return takes the exempt slot rather than a mirror: 30 is 13.6% of a 220 face, inside
// OFFEDGE's reach, and the two mirrored pairs already hold 540 / 660 and 590 / 610.
const FROM_GC = [[GC_CX - D10, T2_Y], [GC_CX - D10, JOG_UP], [CX + D30, JOG_UP], [CX + D30, TOP_BOTTOM]];
// Addressed to the NODE, not the Kubelet: a watch stream arrives at a Node and a status report
// leaves one. The API, both frames and the canvas share one centre, so the pair is vertical at BOTH ends.
const TO_NODE   = [[CX - LANE_DY, TOP_BOTTOM], [CX - LANE_DY, NODE_Y]];
const FROM_NODE = [[CX + LANE_DY, NODE_Y], [CX + LANE_DY, TOP_BOTTOM]];
// ETCD holds the right flank, so the write leaves the API right face and the ack comes back into
// it. Both pairs straddle their own face midpoint, so no endpoint stands alone.
const KCTL_LANE_DX = 10;
const BAND_OUT_Y = 50, BAND_BACK_Y = 70;                 // the two levels in the 0..90 band
// Which side of each face a lane takes is NOT free: the out lane runs on the upper level, so it
// takes the OUTER slot at the client and the inner one at the frame. Any other pairing tangles.
const DELETE     = [[KCTL_CX + KCTL_LANE_DX, KCTL_Y], [KCTL_CX + KCTL_LANE_DX, BAND_OUT_Y], [CX - KCTL_LANE_DX, BAND_OUT_Y], [CX - KCTL_LANE_DX, CP_Y]];
const DELETE_ACK = [[CX + KCTL_LANE_DX, CP_Y], [CX + KCTL_LANE_DX, BAND_BACK_Y], [KCTL_CX - KCTL_LANE_DX, BAND_BACK_Y], [KCTL_CX - KCTL_LANE_DX, KCTL_Y]];
const PERSIST     = [[API_R, OUT_Y], [ETCD_X, OUT_Y]];
const PERSIST_ACK = [[ETCD_X, BACK_Y], [API_R, BACK_Y]];
const STOP_POD    = [[KUBELET_R, LANE_Y], [POD_X, LANE_Y]];
// The two ETCD labels sit BETWEEN their blocks, the request just above its out lane and the ack
// just below its return lane, both centred on the 190 unit gap.
const WIRE_REQ_Y = OUT_Y - 12, WIRE_ACK_Y = BACK_Y + 18;     // 158 / 208
const ETCD_GAP_CX = midX(API_R, ETCD_X);                 // 805
// ONE register for both client labels: they never share a step, the DELETE is step 1 and the 202
// is step 3, and the band below the return lane is 20 units, not enough for a second register.
const KCTL_LABEL_CX = midX(CX, KCTL_CX);                 // 862, the middle of the level run
const KCTL_LABEL_Y = BAND_OUT_Y - 16;                    // 34, over the out lane
// The Garbage collector RETURN cannot share T2_BELOW with its own watch label, so it sits 14 below
// the JOG_UP lane it names, centred on that run. A label on a lane names the traffic on THAT lane.
const WIRE_GC_BACK_Y = JOG_UP + 14;                      // 298
// The Node watch label is end-anchored just left of the spine: a horizontal string centred on a
// vertical lane is cut in half by it. +7 puts the baseline on the middle of the 440..475 band.
const WIRE_KUBELET_X = CX - LANE_DY - 14;                // 576, end-anchored
const WIRE_KUBELET_Y = midX(CP_Y + CP_H, NODE_Y) + 7;    // 464, centred in the band

const lane = (points) => P.lane({ points, dim: true, dashed: true });

// The list order IS the append order, so it is the z-order: both frames first so each band sits
// behind everything it holds, then the blocks, the lanes, the wire labels and the packet layer.
export const SCENE = {
  'aria-label': 'How a cascading delete unwinds through finalizers: the object is stamped rather than removed, the Garbage collector walks ownerReferences down to the Pod on a Node, and the finalizers clear back up the chain before the records leave ETCD',
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
    // Middle row: the controller-manager and the Garbage collector on the same two walls, with
    // architecture's centre column left empty between them.
    P.box({ key: 'cm', x: CM_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'controller-manager' }),
    // The sublabel is load-bearing: without it, two same-size boxes on one tier assert the Garbage
    // collector is a PEER of the controller-manager. It is a controller inside it.
    P.box({ key: 'gc', x: GC_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'Garbage collector', sublabel: 'in controller-manager' }),
    P.box({ key: 'kubelet', x: KUBELET_X, y: KUBELET_Y, w: BOX_W, h: BOX_H, label: 'Kubelet' }),
    P.pod({
      key: 'placedPod', id: 'placedPod', innerKey: 'placedPodBox',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'my-app-7d4-abc', sublabel: 'nginx:1.27' },
    }),
    P.lane({ key: 'kubeletPodArrow', points: STOP_POD, dashed: true }),
    // The client pair climbs over the frame, the ETCD pair straddles the API centre line. Each is
    // drawn from the SAME array that carries its ball.
    lane(DELETE),
    lane(DELETE_ACK),
    lane(PERSIST),
    lane(PERSIST_ACK),
    // The controller-manager takes a watch in, the Garbage collector a watch in and a write back,
    // and the two out lanes are mirrored about the spine.
    lane(TO_CM),
    lane(TO_GC),
    lane(FROM_GC),
    // The Node pair: the watch event down, the terminated report back up, mirrored on the spine so
    // neither endpoint stands alone off a face midpoint.
    lane(TO_NODE),
    lane(FROM_NODE),
    P.wire({ key: 'delete', x: KCTL_LABEL_CX, y: KCTL_LABEL_Y }),
    P.wire({ key: 'api-ack', x: KCTL_LABEL_CX, y: KCTL_LABEL_Y }),
    P.wire({ key: 'persist', x: ETCD_GAP_CX, y: WIRE_REQ_Y }),
    P.wire({ key: 'etcd-ack', x: ETCD_GAP_CX, y: WIRE_ACK_Y }),
    // One watch label under each tier-2 box, on architecture's register: the same event reaches
    // both watchers, so the pair carries one string twice rather than naming a broadcast once.
    P.wire({ key: 'controller', x: CM_CX, y: T2_BELOW }),
    P.wire({ key: 'gc-watch', x: GC_CX, y: T2_BELOW }),
    // Beside the JOG_UP run, not under the box: see WIRE_GC_BACK_Y.
    P.wire({ key: 'gc', x: midX(CX + D30, GC_CX - D10), y: WIRE_GC_BACK_Y }),
    // Beside the spine, not centred on it: see WIRE_KUBELET_X.
    P.wire({ key: 'kubelet-watch', x: WIRE_KUBELET_X, y: WIRE_KUBELET_Y, anchor: 'end' }),
    P.wire({ key: 'stop-pod', x: midX(KUBELET_R, POD_X), y: LANE_Y - 12 }),
    P.packets(),
  ],
  // placedPod is deliberately NOT in a `pods` list: the card pulses it and never clears the pulse,
  // and a clearPodHighlight here would wipe four inline styles the picture depends on.
  reset: { keys: ['client', 'apisrv', 'etcd', 'cm', 'gc', 'kubelet'] },
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
    // 3000, cluster-object-create-path's own: the client lane climbs over the frame, so the ball
    // rides 760 units against the 360 a flat top row would give it.
    duration: 3000,
    narration: 'You run "kubectl delete deployment my-app --cascade=foreground". The client sends an HTTP DELETE to /apis/apps/v1/namespaces/default/deployments/my-app on the API with propagationPolicy=Foreground in the request body.',
    wires: { delete: 'DELETE /apis/apps/v1/.../deployments/my-app' },
    lit: ['client'],
    flow: [F.route({ points: DELETE, lights: ['apisrv'] })],
  },
  {
    id: 'mark-deletion',
    duration: 2500,
    narration: 'The API does not remove the object. It patches metadata.deletionTimestamp and adds the foregroundDeletion finalizer, then commits the change to ETCD via Raft at rv=843. The Deployment is now marked for deletion but still exists in cluster state.',
    // The REQUEST, not its outcome: this register sits between the blocks and holds 190 units.
    // The commit is what step 3 brings back, on the ack register, as ack . rv=843.
    wires: { persist: 'patch deletionTimestamp' },
    lit: ['apisrv'],
    flow: [F.route({ points: PERSIST, lights: ['etcd'] })],
  },
  {
    id: 'ack-response',
    // 3000: this step chains the ETCD ack into the client ack, and the second half of that chain
    // is the same 680 unit climb.
    duration: 3000,
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
    duration: 4000,
    narration: 'The API broadcasts a MODIFIED event for the Deployment to its watchers. The Deployment controller sees the deletionTimestamp and stops issuing rollouts. The Garbage collector walks the ownerReferences and DELETEs ReplicaSet my-app-7d4 in foreground, then Pod my-app-7d4-abc under it, each stamped with a deletionTimestamp rather than removed from ETCD yet.',
    wires: {
      controller: 'watch MODIFIED · Deployment',
      'gc-watch': 'watch MODIFIED · Deployment',
      gc: 'DELETE replicasets · pods',
    },
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
    narration: 'The terminationGracePeriodSeconds budget (30s by default) has been counting down since the Pod was stamped, and inside it the container gets SIGTERM and then SIGKILL only if it outlives the timer. The Kubelet then reports the terminated Pod up to the API. What the budget is spent on is covered in the Graceful Pod Shutdown card.',
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
      // The Kubelet reports the terminated Pod up on the return lane, one beat after the blink so
      // the two do not read as one event.
      F.route({ points: FROM_NODE, at: 'sigterm', plus: BEAT.afterPulse, lights: ['apisrv'] }),
    ],
  },
  {
    id: 'purge',
    duration: 3200,
    narration: 'With the Pod terminated, the Garbage collector clears the foregroundDeletion finalizer off the ReplicaSet and then the Deployment. With each list empty the API completes the delete it accepted five steps ago, and the records leave ETCD at rv=856, Pod then ReplicaSet then Deployment. Watchers receive DELETED events.',
    wires: { gc: 'clear finalizer', persist: 'finalizers=[] · removed' },
    // Pin final state inline so cancel returns to the right value, not default.
    opacity: { placedPod: 0, kubeletPodArrow: 0 },
    // The animated path enters holding step 6 state: both fades below fill forwards from `del`, so
    // without this wind-back the pin hides the Pod on entry and the fades pop it back mid-step.
    rewind: { opacity: { placedPod: OPACITY.terminating, kubeletPodArrow: 1 } },
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
