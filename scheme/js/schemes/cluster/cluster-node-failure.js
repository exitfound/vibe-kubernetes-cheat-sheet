import { P, F, defineCard, ladder, strip, midX, CLU, LAYOUT, FADE, OPACITY, laneOf } from './cluster-kit.js';

// Design notes for this card: ./CARDS.md#cluster-node-failure

// Layout C: six ladder rows plus two Node frames plus six chips do not leave room for a left
// column, so the ladder stays right and the chips take a two-row bottom strip. Panel x<=397, y<=280.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = midX(CONTENT_L, CONTENT_R);                   // 600, the canvas centre by construction
// Reserved narration corner: 400 x 280, measured. Nothing derives from it, so it stays a note
// rather than a constant nobody reads.

const TOP_Y = CLU.TOP_Y, TOP_H = CLU.BOX_H, TOP_BOTTOM = TOP_Y + TOP_H;   // 40 / 120
const CTRL_W = 300, LEASE_W = 130, TOP_GAP = 70;
const CTRL_X = CX - CTRL_W / 2, CTRL_R = CTRL_X + CTRL_W;// 450..750, centred so its spine is on CX
const LEASE_X = CTRL_R + TOP_GAP;                        // 820..950
const LEASE_CX = midX(LEASE_X, LEASE_X + LEASE_W);       // 885
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);                  // 80
const WIRE_X = midX(CTRL_R, LEASE_X);                    // 785
const WIRE_Y = TOP_Y - 14;                               // 26, above the row: the lanes own below it

const LADDER_X = LAYOUT.C.ladder.x, LADDER_W = LAYOUT.C.ladder.w;    // 660..1140
const LADDER_Y = 152, ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;      // 6 rows -> 152..394

// Two Nodes centred on CX, each anchored on its OUTER edge and shrinking inwards, so the corridor
// between them is 196 and the reschedule lane gets a real 98 unit run into Node-2.
const NODE_W = 442, NODE_H = 132;                        // 520 shrunk 15% from the inner edge
const NODE_Y = 406, NODE_BOTTOM = NODE_Y + NODE_H;       // 406..538
const NODE_A_X = CONTENT_L;  // 60..502
const NODE_B_X = CONTENT_R - NODE_W;                     // 698..1140
const POD_W = 300, POD_H = CLU.NODE.POD_H, POD_Y = NODE_Y + 16;      // 422..528
const POD_A_X = NODE_A_X + (NODE_W - POD_W) / 2;         // 131..431
const POD_B_X = NODE_B_X + (NODE_W - POD_W) / 2;         // 769..1069
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };
// Frame midpoints, which is where every lane on this card now starts and ends.
const NODE_A_CX = midX(NODE_A_X, NODE_A_X + NODE_W);     // 281
const NODE_CY = midX(NODE_Y, NODE_BOTTOM);               // 472

// THREE per row: five across leaves 206 units and the taint value alone needs 335. Six chips, so
// row 1 is "is the Node alive" and row 2 is "what happens to its Pods".
const CHIP_H = 32, CHIP_GAP = 14, CHIP_VGAP = 8, CHIP_COLS = 3;
const CHIPS_Y = NODE_BOTTOM + 14;                        // 552, second row ends on 624
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;                               // 350.67, which is LAYOUT.C.strip.three
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is read as a GRID: the index wraps across the three columns and steps down every third.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// The heartbeat leaves the Node-1 FRAME, because no Pod renews a Lease and the Kubelet on the Node
// does. The eviction DELETE lands on the Pod OBJECT it names: ./CARDS.md#cluster-node-failure.
const LANE_DX = 12;                                      // both lanes sit 12 off the Node-1 midpoint
// The heartbeat riser and the reschedule drop share the 502..660 band, so 640 keeps 20 off the
// ladder and 40 off the drop: wide enough that the two do not read as one LANE_DX pair.
const GUTTER_X = LADDER_X - 20;                          // 640, between the drop and the ladder
const UNDER_TOP_Y = TOP_BOTTOM + 16;                     // 136, below the top row, above the ladder
const EV_JOG_Y = NODE_Y - 66;                            // 340, the outbound lane of the corridor
const HB_JOG_Y = NODE_Y - 44;                            // 362, the return lane, 22 below it
// The heartbeat caption rides the leg it names, not the top row. Anchored on the riser it leaves
// rather than centred, because the string measures 282.5 at 1600x1000 and a centred box reaches 607.
const HB_WIRE_X = NODE_A_CX + LANE_DX + 10;              // 303, 10 clear of the riser
const HB_WIRE_Y = HB_JOG_Y + 18;                         // 380, the below-a-lane offset of the catalog

const HEARTBEAT_CONNECTOR = [[NODE_A_CX + LANE_DX, NODE_Y], [NODE_A_CX + LANE_DX, HB_JOG_Y], [GUTTER_X, HB_JOG_Y], [GUTTER_X, UNDER_TOP_Y], [LEASE_CX, UNDER_TOP_Y], [LEASE_CX, TOP_BOTTOM]];
// Both leave the controller, the actor both steps name. NOT a mirrored pair: Node-2's top face is
// unreachable under the ladder, so the reschedule takes the corridor and the midpoint outright.
const RS_X = CX;                                         // 600, corridor centre and face midpoint
const EV_X = CX - LANE_DX * 2;                           // 576, clear of it by 24
const EVICT_CONNECTOR     = [[EV_X, TOP_BOTTOM], [EV_X, EV_JOG_Y], [NODE_A_CX - LANE_DX, EV_JOG_Y], [NODE_A_CX - LANE_DX, POD_Y]];
const RESCHED_CONNECTOR   = [[RS_X, TOP_BOTTOM], [RS_X, NODE_CY], [NODE_B_X, NODE_CY]];

// The list order IS the append order, so it is the z-order: the ladder, the two frames and their Pods
// sit above the packet layer, and the two top-row blocks go absolute last.
export const SCENE = {
  'aria-label': 'Node failure and eviction: lease heartbeat loss, Ready flips to Unknown, NoExecute taint, taint-eviction delete, reschedule',
  parts: [
    P.defs(),
    // One relationship line, not a pair of arrows: the status flip is COMPUTED on the controller
    // from an expired Lease, so nothing travels between them on any step.
    P.relation({ points: [[CTRL_R, TOP_CY], [LEASE_X, TOP_CY]] }),
    // Heartbeat connector: Node-1 top centre up and over into the Lease bottom centre.
    P.lane({ key: 'hbLane', points: HEARTBEAT_CONNECTOR, dim: true, dashed: true }),
    // Two controller-sourced lanes into the Node band: the eviction DELETE drops through the Node-1
    // frame onto its Pod, and the creation of the replacement turns into the Node-2 frame.
    P.lane({ key: 'evictLane', points: EVICT_CONNECTOR, dim: true, dashed: true }),
    P.lane({ key: 'reschedLane', points: RESCHED_CONNECTOR, dim: true, dashed: true }),
    // Two registers: `ctrl` captions what the controller writes, `hb` rides the heartbeat leg,
    // because the Kubelet PUT is the one string on this card that has a lane of its own.
    P.wire({ key: 'ctrl', x: WIRE_X, y: WIRE_Y }),
    P.wire({ key: 'hb', x: HB_WIRE_X, y: HB_WIRE_Y, anchor: 'start' }),
    // Row 1, the detection trio. The grace period is the THRESHOLD the Lease age is measured
    // against: it is what makes 30s of staleness harmless and 52s fatal.
    P.chip({ key: 'readyChip', x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'Ready',      value: 'True' }),
    P.chip({ key: 'leaseChip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'Lease age',  value: '2s · Fresh' }),
    P.chip({ key: 'graceChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'grace period', value: '50s · not reached' }),
    // Row 2, the eviction trio.
    P.chip({ key: 'taintChip', x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'Taint',          value: 'none' }),
    P.chip({ key: 'tolerChip', x: CHIP_X(4), y: CHIP_Y(4), w: CHIP_W, h: CHIP_H, name: 'Toleration',     value: 'none' }),
    P.chip({ key: 'evictChip', x: CHIP_X(5), y: CHIP_Y(5), w: CHIP_W, h: CHIP_H, name: 'eviction timer', value: 'none' }),
    P.packets(),
    P.chain({
      key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. heartbeat   ·  Lease renewed every 10s, Ready=True',
        '2. missed      ·  Kubelet stops renewing',
        '3. NotReady    ·  Ready flips to Unknown after grace',
        '4. tainted     ·  Controller adds NoExecute taint',
        '5. evicted     ·  Toleration expires, Pod terminating',
        '6. rescheduled ·  Scheduler binds replacement',
      ],
    }),
    // Bottom row: two worker nodes side-by-side. Node-1 is the failing one, Node-2 the target.
    P.node({ key: 'nodeA', x: NODE_A_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'nodeB', x: NODE_B_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' }),
    // Failing node hosts the running Pod that gets evicted.
    P.pod({
      key: 'podA', id: 'podA', innerKey: 'podABox',
      x: POD_A_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: ' ', containers: 0,
      inner: { ...POD_INNER, label: 'app-pod', sublabel: 'nginx:1.27' },
    }),
    // Target node receives the rescheduled replacement Pod (hidden until reschedule).
    P.pod({
      key: 'podB', id: 'podB', innerKey: 'podBBox', opacity: 0,
      x: POD_B_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: ' ', containers: 0,
      inner: { ...POD_INNER, label: 'app-pod', sublabel: 'nginx:1.27' },
    }),
    // The sublabel names BOTH: since 1.29 they are independent components and this card makes them
    // do different things one step apart, so naming one denies the actor the next step names.
    P.box({ key: 'ctrl', x: CTRL_X, y: TOP_Y, w: CTRL_W, h: TOP_H, label: 'controller-manager', sublabel: 'node-lifecycle + taint-eviction' }),
    // The heartbeat lane climbs into the Lease on its bottom midpoint, LEASE_CX.
    P.cylinder({ key: 'lease', x: LEASE_X, y: TOP_Y, w: LEASE_W, h: TOP_H, label: 'Lease' }),
  ],
  reset: {
    keys: ['ctrl', 'lease', 'readyChip', 'leaseChip', 'graceChip', 'taintChip', 'tolerChip', 'evictChip'],
    pods: ['podA', 'podB'],
  },
};

// Every step writes the whole set. The heartbeat ends on the Node-1 FRAME and takes its shade, the
// eviction ends on the POD and takes the dimmer of that Pod and the frame it crosses to reach it.
const shades = ({ nodeA = 1, podA = 1, podB = 0, resched = 0 } = {}) => ({
  nodeA, nodeB: 1, podA, podB,
  hbLane: laneOf(nodeA, OPACITY.running),
  evictLane: laneOf(podA, nodeA),
  reschedLane: resched,
});

const DOWN = OPACITY.notready, DYING = OPACITY.terminating;
// Every step writes EVERY chip, the poster step included, or the last step counts an eviction timer
// down on a Pod its own narration has replaced.
const FRESH = { readyChip: 'True', leaseChip: '2s · Fresh', graceChip: '50s · not reached', taintChip: 'none', tolerChip: 'none', evictChip: 'none' };
const EXPIRED = { readyChip: 'Unknown · unreachable', leaseChip: '52s · Expired', graceChip: '50s · exceeded' };
const TAINTED = { taintChip: 'node.kubernetes.io/unreachable:NoExecute', tolerChip: 'NoExecute · 300s' };

export const STEPS_SPEC = [
  {
    id: 'healthy',
    duration: 1500,
    chips: FRESH,
    opacity: shades(),
    // Idle baseline: nothing is happening yet, no chain row highlighted.
    chain: -1,
  },
  {
    id: 'heartbeat',
    duration: 2600,
    narration: 'Kubelet on Node-1 proves liveness with two heartbeats. It renews its Lease in kube-node-lease every 10s and PATCHes Node.status every 5 min. The Node-lifecycle-controller treats the fast Lease renewal as its primary liveness signal.',
    chips: { ...FRESH, leaseChip: '2s · Fresh · renewed' },
    wires: { hb: 'Kubelet · PUT lease renewTime · every 10s' },
    opacity: shades(),
    lit: ['leaseChip'],
    chain: 0,
    flow: [F.route({ points: HEARTBEAT_CONNECTOR, lights: ['lease'] })],
  },
  {
    id: 'kubelet-stops',
    duration: 2000,
    narration: 'The Kubelet on Node-1 stops renewing (kernel panic, network partition, or Kubelet crash). The Lease grows stale, but Pods on the Node keep running for now.',
    // The threshold is the whole reason this step changes nothing else: 30s of staleness is
    // under 50s, so Ready is still True and no Pod has been touched.
    chips: { ...FRESH, readyChip: 'True (Stale Lease)', leaseChip: '30s · Stale' },
    // Pin opacity inline so cancel between steps does not flash to default. The two lanes that end
    // on the frame take its new shade with it, here and on every step after this one.
    opacity: shades({ nodeA: DOWN }),
    lit: ['readyChip', 'leaseChip', 'graceChip'],
    chain: 1,
    flow: [
      F.fade({ target: 'nodeA', to: DOWN, dur: FADE.out, fill: 'forwards' }),
      F.fade({ target: 'hbLane', to: DOWN, dur: FADE.out, fill: 'forwards' }),
      F.fade({ target: 'evictLane', to: DOWN, dur: FADE.out, fill: 'forwards' }),
    ],
  },
  {
    id: 'not-ready',
    duration: 2000,
    narration: 'After --node-monitor-grace-period (default 50s), the Node-lifecycle-controller flips Ready from True to Unknown: it cannot tell whether Node-1 died or is just unreachable. Pods are still on the Node, and eviction has not started.',
    chips: { ...FRESH, ...EXPIRED },
    wires: { ctrl: 'PATCH /api/v1/nodes/Node-1/status' },
    opacity: shades({ nodeA: DOWN }),
    lit: ['leaseChip', 'readyChip', 'graceChip', 'ctrl'],
    chain: 2,
    // The status flip is computed on the controller from the expired Lease:
    // nothing travels and no block flashes, the changed Ready value carries it.
  },
  {
    id: 'taint-applied',
    duration: 2100,
    narration: 'The node-lifecycle-controller adds the taint node.kubernetes.io/unreachable:NoExecute. Kubernetes had already given this Pod a 300s toleration for it, which it does for any Pod that does not set one itself. DaemonSet Pods set theirs with no tolerationSeconds, so this never evicts them. The 300s now ticks down.',
    chips: { ...FRESH, ...EXPIRED, ...TAINTED, evictChip: '300s · Counting down' },
    wires: { ctrl: 'PATCH /api/v1/nodes/Node-1 · spec.taints' },
    opacity: shades({ nodeA: DOWN }),
    lit: ['taintChip', 'tolerChip', 'evictChip', 'ctrl'],
    chain: 3,
    // The taint lands as a field write on the controller: nothing travels and
    // no block flashes, the new taint and toleration timer carry the step.
  },
  {
    id: 'evict',
    duration: 2400,
    narration: 'Toleration expires. The taint-eviction-controller deletes the Pod with a plain DELETE that bypasses PodDisruptionBudgets (unlike kubectl drain, which uses the PDB-aware Eviction API). The Pod gets a deletionTimestamp and sits in Terminating, because the API can only finish the delete once the Kubelet confirms it, and the unreachable Node-1 still holds the orphaned container.',
    chips: { ...FRESH, ...EXPIRED, ...TAINTED, leaseChip: 'over 350s · Expired', evictChip: '0s · Terminating' },
    wires: { ctrl: 'DELETE /api/v1/.../pods/{name} · taint-eviction' },
    // Terminating is a phase, not an absence, so the Pod stays drawn at that shade. The eviction lane
    // ends ON that Pod and follows it down, the heartbeat ends on the frame and keeps the frame shade.
    opacity: shades({ nodeA: DOWN, podA: DYING }),
    lit: ['leaseChip', 'evictChip', 'ctrl'],
    chain: 4,
    // The DELETE travels from the controller down the left margin to the Pod on
    // Node-1; the Pod flinches and sinks to Terminating when the packet reaches it.
    flow: [
      F.route({ points: EVICT_CONNECTOR, name: 'del' }),
      F.pulse({ pod: 'podA', at: 'del' }),
      F.fade({ target: 'podA', to: DYING, dur: FADE.out, at: 'del' }),
      // The lane sinks with the Pod it ends on, same beat and same 700: it holds 0.4 for the whole
      // 1353 of the flight (A-15) and matches its fainter end from the moment the ball lands.
      F.fade({ target: 'evictLane', from: DOWN, to: DYING, dur: FADE.out, at: 'del' }),
    ],
  },
  {
    id: 'reschedule',
    duration: 2600,
    narration: 'The owning controller (Deployment via its ReplicaSet) sees the missing replica and creates a replacement Pod. Scheduler picks the healthy Node-2 and Kubelet there starts it. End-to-end recovery takes about 50s plus 300s by default, the grace period plus the toleration.',
    chips: { ...FRESH, ...EXPIRED, ...TAINTED, leaseChip: 'over 350s · Expired', evictChip: 'none · Node-2 has no taint' },
    wires: { ctrl: 'Deployment recreates replica · Scheduler binds Node-2' },
    // Pin the final state inline: the old Pod is still Terminating, not gone, so its own lane stays
    // at that shade. The reschedule lane comes on now, the first step anything travels it.
    opacity: shades({ nodeA: DOWN, podA: DYING, podB: 1, resched: 1 }),
    // The eviction timer is the one chip that moves here, and it has nothing left to count: the
    // Lease age reached the 50s plus 300s the narration adds up one step ago, with the toleration.
    lit: ['evictChip', 'ctrl'],
    chain: 5,
    // Nothing moves from the dying Pod: the controller CREATES a replacement, so the ball leaves
    // the controller and the new Pod materialises and pulses only when it arrives on Node-2.
    flow: [
      F.route({ points: RESCHED_CONNECTOR, name: 'bind' }),
      F.fade({ target: 'podB', from: 0, to: 1, dur: FADE.in, at: 'bind', easing: 'ease-out' }),
      F.pulse({ pod: 'podB', at: 'bind' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
