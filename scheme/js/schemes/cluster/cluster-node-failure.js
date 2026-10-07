import { P, F, defineCard, ladder, strip, midX, BEAT, CLU, LAYOUT, FADE, OPACITY, laneOf } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-node-failure.md

// Layout C: the ladder stays right and the chips take a two-row bottom strip.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;
const CX = midX(CONTENT_L, CONTENT_R);

const TOP_Y = CLU.TOP_Y, TOP_H = CLU.BOX_H, TOP_BOTTOM = TOP_Y + TOP_H;
const CTRL_W = CLU.BOX_W, LEASE_W = 130, TOP_GAP = 104;  // the Lease keeps cluster-node-registration's x
const CTRL_X = CX - CTRL_W / 2, CTRL_R = CTRL_X + CTRL_W;
const LEASE_X = CTRL_R + TOP_GAP;
const LEASE_CX = midX(LEASE_X, LEASE_X + LEASE_W);
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
const WIRE_X = midX(CTRL_R, LEASE_X);
const WIRE_Y = TOP_Y - 14;                               // above the row: the lanes own below it

const LADDER_X = LAYOUT.C.ladder.x, LADDER_W = LAYOUT.C.ladder.w;
const LADDER_Y = 152, ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;

// Each Node anchored on its outer edge, leaving the reschedule lane a real corridor run.
// 16 of label padding, not the family 34, or the chip rows end off the canvas.
const NODE_W = 442, POD_DY = 16, NODE_H = POD_DY + CLU.NODE.POD_H + 12;
const NODE_Y = 406, NODE_BOTTOM = NODE_Y + NODE_H;
const NODE_A_X = CONTENT_L;
const NODE_B_X = CONTENT_R - NODE_W;
const POD_W = 300, POD_H = CLU.NODE.POD_H, POD_Y = NODE_Y + POD_DY;
const POD_A_X = NODE_A_X + (NODE_W - POD_W) / 2;
const POD_B_X = NODE_B_X + (NODE_W - POD_W) / 2;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };
// Frame midpoints: every lane starts and ends on one.
const NODE_A_CX = midX(NODE_A_X, NODE_A_X + NODE_W);
const NODE_CY = midX(NODE_Y, NODE_BOTTOM);

// Three per row, since the taint string does not fit five across. Row 1 is liveness, row 2 eviction.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 14, CHIP_VGAP = 8, CHIP_COLS = 3;
const CHIPS_Y = NODE_BOTTOM + 14;
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The index wraps across the three columns and steps down every third.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// Every lane ends on a Node frame face, never on a Pod (A-21): the pulse names the Pod.
const LANE_DX = 12;                                      // the two lanes share the Node-1 top face
// Far enough from the reschedule drop that the two do not read as one LANE_DX pair.
const GUTTER_X = LADDER_X - 20;
const UNDER_TOP_Y = TOP_BOTTOM + 16;
const EV_JOG_Y = NODE_Y - 66;                            // outbound lane of the corridor
const HB_JOG_Y = NODE_Y - 44;                            // return lane
// Anchored on its riser rather than centred, or the long string reaches past the corridor.
const HB_WIRE_X = NODE_A_CX + LANE_DX + 10;
const HB_WIRE_Y = HB_JOG_Y + 18;

const HEARTBEAT_CONNECTOR = [[NODE_A_CX + LANE_DX, NODE_Y], [NODE_A_CX + LANE_DX, HB_JOG_Y], [GUTTER_X, HB_JOG_Y], [GUTTER_X, UNDER_TOP_Y], [LEASE_CX, UNDER_TOP_Y], [LEASE_CX, TOP_BOTTOM]];
// Not a mirrored pair: Node-2's top face is under the ladder, so the reschedule enters its side.
const RS_X = CX;
const EV_X = CX - LANE_DX * 2;
const WRITE_CONNECTOR     = [[EV_X, TOP_BOTTOM], [EV_X, EV_JOG_Y], [NODE_A_CX - LANE_DX, EV_JOG_Y], [NODE_A_CX - LANE_DX, NODE_Y]];
const RESCHED_CONNECTOR   = [[RS_X, TOP_BOTTOM], [RS_X, NODE_CY], [NODE_B_X, NODE_CY]];

export const SCENE = {
  'aria-label': 'Node failure and eviction: lease heartbeat loss, Ready flips to Unknown, NoExecute taint, taint-eviction delete, reschedule',
  parts: [
    P.defs(),
    // A relation, not arrows: the status flip is computed from the expired Lease, nothing travels.
    P.relation({ points: [[CTRL_R, TOP_CY], [LEASE_X, TOP_CY]] }),
    P.lane({ key: 'hbLane', points: HEARTBEAT_CONNECTOR, dim: true, dashed: true }),
    P.lane({ key: 'writeLane', points: WRITE_CONNECTOR, dim: true, dashed: true }),
    P.lane({ key: 'reschedLane', points: RESCHED_CONNECTOR, dim: true, dashed: true }),
    // `ctrl` captions what the controller writes, `hb` rides the heartbeat leg.
    P.wire({ key: 'ctrl', x: WIRE_X, y: WIRE_Y }),
    P.wire({ key: 'hb', x: HB_WIRE_X, y: HB_WIRE_Y, anchor: 'start' }),
    // Row 1, detection: the grace period is the threshold the Lease age is measured against.
    P.chip({ key: 'readyChip', x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'Ready',      value: 'True' }),
    P.chip({ key: 'leaseChip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'Lease age',  value: '2s · Fresh' }),
    P.chip({ key: 'graceChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'grace period', value: '50s · not reached' }),
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
    P.node({ key: 'nodeA', x: NODE_A_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'nodeB', x: NODE_B_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' }),
    P.pod({
      key: 'podA', id: 'podA', innerKey: 'podABox',
      x: POD_A_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: ' ', containers: 0,
      inner: { ...POD_INNER, label: 'app-pod', sublabel: 'nginx:1.27' },
    }),
    P.pod({
      key: 'podB', id: 'podB', innerKey: 'podBBox', opacity: 0,
      x: POD_B_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: ' ', containers: 0,
      inner: { ...POD_INNER, label: 'app-pod', sublabel: 'nginx:1.27' },
    }),
    // Names both controllers: they are separate components and act one step apart.
    P.box({ key: 'ctrl', x: CTRL_X, y: TOP_Y, w: CTRL_W, h: TOP_H, label: 'controller-manager', sublabel: 'node-lifecycle + taint-eviction' }),
    P.cylinder({ key: 'lease', x: LEASE_X, y: TOP_Y, w: LEASE_W, h: TOP_H, label: 'Lease' }),
  ],
  reset: {
    keys: ['ctrl', 'lease', 'readyChip', 'leaseChip', 'graceChip', 'taintChip', 'tolerChip', 'evictChip'],
    pods: ['podA', 'podB'],
  },
};

// Both Node-1 lanes end on that frame, so both take its shade.
const shades = ({ nodeA = 1, podA = 1, podB = 0, resched = 0 } = {}) => ({
  nodeA, nodeB: 1, podA, podB,
  hbLane: laneOf(nodeA, OPACITY.running),
  writeLane: laneOf(nodeA, OPACITY.running),
  reschedLane: resched,
});

const DOWN = OPACITY.notready, DYING = OPACITY.terminating;
// Shorter than FADE.out, so the Node-1 fade lands before the reschedule ball leaves (M-12).
const HANDOVER_MS = 300;
const FRESH = { readyChip: 'True', leaseChip: '2s · Fresh', graceChip: '50s · not reached', taintChip: 'none', tolerChip: 'none', evictChip: 'none' };
const EXPIRED = { readyChip: 'Unknown · unreachable', leaseChip: '52s · Expired', graceChip: '50s · exceeded' };
const TAINTED = { taintChip: 'node.kubernetes.io/unreachable:NoExecute', tolerChip: 'NoExecute · 300s' };

export const STEPS_SPEC = [
  {
    id: 'healthy',
    duration: 1500,
    chips: FRESH,
    opacity: shades(),
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
    // The renewal turns over when the heartbeat lands on the Lease.
    rewind: { chips: { leaseChip: FRESH.leaseChip } },
    flow: [
      F.route({ points: HEARTBEAT_CONNECTOR, name: 'hb', lights: ['lease'] }),
      F.set({ at: 'hb', chips: { leaseChip: '2s · Fresh · renewed' } }),
    ],
  },
  {
    id: 'kubelet-stops',
    duration: 2000,
    narration: 'The Kubelet on Node-1 stops renewing (kernel panic, network partition, or Kubelet crash). The Lease grows stale, but Pods on the Node keep running for now.',
    // 30s of staleness is under the 50s grace, so Ready is still True.
    chips: { ...FRESH, readyChip: 'True (Stale Lease)', leaseChip: '30s · Stale' },
    opacity: shades(),
    lit: ['readyChip', 'leaseChip', 'graceChip'],
    chain: 1,
  },
  {
    id: 'not-ready',
    duration: 2000,
    narration: 'After --node-monitor-grace-period (default 50s), the Node-lifecycle-controller flips Ready from True to Unknown: it cannot tell whether Node-1 died or is just unreachable. Pods are still on the Node, and eviction has not started.',
    chips: { ...FRESH, ...EXPIRED },
    wires: { ctrl: 'PUT /api/v1/nodes/node-1/status' },
    opacity: shades(),
    lit: ['leaseChip', 'readyChip', 'graceChip', 'ctrl'],
    chain: 2,
    // Computed from the expired Lease: nothing travels, the changed Ready value carries it.
  },
  {
    id: 'taint-applied',
    duration: 3100,
    narration: 'The node-lifecycle-controller adds the taint node.kubernetes.io/unreachable:NoExecute. Kubernetes had already given this Pod a 300s toleration for it, which it does for any Pod that does not set one itself. DaemonSet Pods set theirs with no tolerationSeconds, so this never evicts them. The 300s now ticks down.',
    chips: { ...FRESH, ...EXPIRED, ...TAINTED, evictChip: '300s · Counting down' },
    wires: { ctrl: 'PATCH /api/v1/nodes/node-1 · spec.taints' },
    opacity: shades(),
    lit: ['taintChip', 'tolerChip', 'evictChip', 'ctrl'],
    chain: 3,
    // S-13: the static block states the end, so the taint chips wind back until the PATCH lands.
    rewind: { chips: { taintChip: 'none', tolerChip: 'none', evictChip: 'none' } },
    // A self-initiated decision waits BEAT.lead. The DELETE next step fires at once off its timer.
    flow: [
      F.route({ points: WRITE_CONNECTOR, delay: BEAT.lead, name: 'patch' }),
      F.set({ at: 'patch', chips: { ...TAINTED, evictChip: '300s · Counting down' } }),
    ],
  },
  {
    id: 'evict',
    duration: 3800,
    narration: 'Toleration expires. The taint-eviction-controller deletes the Pod with a plain DELETE that bypasses PodDisruptionBudgets (unlike kubectl drain, which uses the PDB-aware Eviction API). The Pod gets a deletionTimestamp and sits in Terminating: the unreachable Node-1 still holds the orphaned container, and the entry clears only when the Kubelet answers, the Node object is deleted, or someone forces it.',
    chips: { ...FRESH, ...EXPIRED, ...TAINTED, leaseChip: 'over 350s · Expired', evictChip: '0s · Terminating' },
    wires: { ctrl: 'DELETE /api/v1/.../pods/{name} · taint-eviction' },
    // Terminating is a phase, not an absence, so the Pod stays drawn at that shade.
    opacity: shades({ podA: DYING }),
    lit: ['leaseChip', 'evictChip', 'ctrl'],
    chain: 4,
    rewind: { chips: { evictChip: '0s · Expired' } },
    flow: [
      F.route({ points: WRITE_CONNECTOR, name: 'del' }),
      F.set({ at: 'del', chips: { evictChip: '0s · Terminating' } }),
      F.pulse({ pod: 'podA', at: 'del' }),
      F.fade({ target: 'podA', to: DYING, dur: FADE.out, at: 'del' }),
    ],
  },
  {
    id: 'reschedule',
    duration: 2600,
    narration: 'The owning controller (Deployment via its ReplicaSet) sees the missing replica and creates a replacement Pod. Scheduler picks the healthy Node-2 and Kubelet there starts it. End-to-end recovery takes about 50s plus 300s by default, the grace period plus the toleration.',
    chips: { ...FRESH, ...EXPIRED, ...TAINTED, leaseChip: 'over 350s · Expired', evictChip: 'none · Node-2 has no taint' },
    wires: { ctrl: 'Deployment recreates replica · Scheduler binds Node-2' },
    opacity: shades({ nodeA: DOWN, podA: DYING, podB: 1, resched: 1 }),
    lit: ['evictChip', 'ctrl'],
    chain: 5,
    rewind: { chips: { evictChip: '0s · Terminating' } },
    // The controller creates a replacement, so the ball leaves the controller, not the dying Pod.
    flow: [
      // Beat one: Node-1 and its lanes go out before the ball leaves.
      F.fade({ target: 'nodeA', to: DOWN, dur: HANDOVER_MS, fill: 'forwards' }),
      F.fade({ target: 'hbLane', to: DOWN, dur: HANDOVER_MS, fill: 'forwards' }),
      F.fade({ target: 'writeLane', to: DOWN, dur: HANDOVER_MS, fill: 'forwards' }),
      // Beat two: the bind. The +200 covers the ball's fade-in, so it shows only after the fade.
      F.route({ points: RESCHED_CONNECTOR, name: 'bind', delay: HANDOVER_MS + 200 }),
      F.set({ at: 'bind', chips: { evictChip: 'none · Node-2 has no taint' } }),
      F.fade({ target: 'podB', from: 0, to: 1, dur: FADE.in, at: 'bind', easing: 'ease-out' }),
      F.pulse({ pod: 'podB', at: 'bind' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
