import { P, F, defineCard, ladder, strip, spread, midX, laneOf, CLU, BEAT, FADE, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-node-conditions.md

// One actor in the top row and the two lanes leaving it.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;

const TOP_Y = CLU.TOP_Y, TOP_H = CLU.BOX_H, TOP_BOTTOM = TOP_Y + TOP_H;

// The CLU.L-01 Node frame family, untouched.
const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;
const NODE_Y = 340, NODE_H = CLU.NODE.H;
const POD_W = 300, POD_H = CLU.NODE.POD_H;
const POD_Y = NODE_Y + CLU.NODE.POD_DY, POD_PAD = 24;
const POD_X = spread({ from: NODE_X + POD_PAD, to: CONTENT_R - POD_PAD, count: 3, w: POD_W }).x;
const POD_CX = (i) => midX(POD_X(i), POD_X(i) + POD_W);
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// The control plane stands in web-0's column, so its NoExecute drop is straight. The refused Pod
// stands in web-1's column, outside the frame it never enters.
const CP_W = CLU.BOX_W, CP_X = POD_CX(1) - CP_W / 2;
// GHOST_Y sits between the actor and the frame: the refused Pod never touches the frame it stays out of.
const GHOST_X = POD_X(2), GHOST_Y = 190;

// THE WHOLE CARD IS THESE TWO LANES. A taint is a field on the NODE, so NoExecute stops on the
// frame face (NET.A-02).
const NE_LANE = [[POD_CX(1), TOP_BOTTOM], [POD_CX(1), NODE_Y]];
const NS_LANE = [[CP_X + CP_W, TOP_Y + TOP_H / 2], [POD_CX(2), TOP_Y + TOP_H / 2], [POD_CX(2), GHOST_Y]];

// End-anchored on the free left side of its drop, between the panel and the frame top.
const WIRE_NE_X = POD_CX(1) - 12, WIRE_NE_Y = 285;
// Above its horizontal leg, start-anchored past the actor, the only x that does not print on it.
const WIRE_NS_X = CP_X + CP_W + 12, WIRE_NS_Y = 66;

// Chips as a bottom strip, TWO per row: the widest value pair does not fit three across.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = NODE_Y + NODE_H + 16;
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;                               // LAYOUT.C.strip.two
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is read as a GRID: the index wraps across the two columns and steps down every second.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

const PENDING = OPACITY.pending;                         // declared, waiting for a Node to take it

// List order is z-order: lanes, captions, chips, frame and Pods, the actor, then the packet layer LAST.
export const SCENE = {
  'aria-label': 'Node conditions and the taints they create: five conditions read off Node-1, and one control plane block writing two kinds of taint, the four pressure and network conditions each becoming a NoSchedule taint whose lane turns aside into a Pod that stays Pending and never enters the Node, Ready False or Unknown becoming a NoExecute taint whose lane lands on the Node frame itself, after which both web Pods blink and fade away once their default 300 second toleration runs out, and the DaemonSet Pod that tolerates both kinds staying where it is',
  parts: [
    P.defs(),
    P.lane({ key: 'neLane', points: NE_LANE, dim: true, dashed: true }),
    P.lane({ key: 'nsLane', points: NS_LANE, dim: true, dashed: true }),
    P.wire({ key: 'wNE', x: WIRE_NE_X, y: WIRE_NE_Y, anchor: 'end' }),
    P.wire({ key: 'wNS', x: WIRE_NS_X, y: WIRE_NS_Y, anchor: 'start' }),
    // The Conditions table as kubectl prints it. Ready is healthy at True, the other four at False.
    P.chip({ key: 'readyChip',  x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'Ready',              value: 'none' }),
    P.chip({ key: 'memChip',    x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'MemoryPressure',     value: 'none' }),
    P.chip({ key: 'diskChip',   x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'DiskPressure',       value: 'none' }),
    P.chip({ key: 'pidChip',    x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'PIDPressure',        value: 'none' }),
    P.chip({ key: 'netChip',    x: CHIP_X(4), y: CHIP_Y(4), w: CHIP_W, h: CHIP_H, name: 'NetworkUnavailable', value: 'none' }),
    P.chip({ key: 'effectChip', x: CHIP_X(5), y: CHIP_Y(5), w: CHIP_W, h: CHIP_H, name: 'effect on Pods',     value: 'none' }),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'dsPod', id: 'dsPod', innerKey: 'dsPodBox',
      x: POD_X(0), y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'node-exporter-x9k', sublabel: 'DaemonSet · hostNetwork' },
    }),
    P.pod({
      key: 'podA', id: 'podA', innerKey: 'podABox',
      x: POD_X(1), y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'web-0', sublabel: 'nginx:1.27' },
    }),
    P.pod({
      key: 'podB', id: 'podB', innerKey: 'podBBox',
      x: POD_X(2), y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'web-1', sublabel: 'nginx:1.27' },
    }),
    // The Pod a NoSchedule taint keeps out rests at pending, so its lane has a target (C-14, M-24).
    P.pod({
      key: 'ghostPod', id: 'ghostPod', innerKey: 'ghostBox', opacity: PENDING,
      x: GHOST_X, y: GHOST_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'web-2', sublabel: 'Pending · BestEffort' },
    }),
    // Both lanes leave the one acting block, from different faces, so the two effects differ in path shape.
    P.box({ key: 'cpBox', x: CP_X, y: TOP_Y, w: CP_W, h: TOP_H, label: 'Control Plane', sublabel: 'creates taints by condition' }),
    P.packets(),
  ],
  reset: {
    keys: ['cpBox', 'dsPodBox', 'podABox', 'podBBox', 'readyChip', 'memChip', 'diskChip', 'pidChip', 'netChip', 'effectChip'],
    pods: ['dsPod', 'podA', 'podB', 'ghostPod'],
  },
};

const GONE = OPACITY.terminating;                        // evicted, deletionTimestamp set
// A-16: one factory states blocks and lanes. `neLane` takes the frame's shade (A-13), `nsLane`
// stays full because it carries a ball (A-15).
const stage = ({ nodeEl = 1, web = 1 } = {}) => ({
  nodeEl, dsPod: 1, podA: web, podB: web, ghostPod: PENDING,
  neLane: laneOf(nodeEl, OPACITY.running),
  nsLane: OPACITY.running,
});

// P-01: every step states every chip. The taint key omits its node.kubernetes.io/ prefix.
const CLEAR = 'False · no taint';
const HEALTHY = { readyChip: 'True · no taint', memChip: CLEAR, diskChip: CLEAR, pidChip: CLEAR, netChip: CLEAR, effectChip: 'none' };
const PRESSED = {
  memChip:  'True · memory-pressure:NoSchedule',
  diskChip: 'True · disk-pressure:NoSchedule',
  pidChip:  'True · pid-pressure:NoSchedule',
  netChip:  'True · network-unavailable:NoSchedule',
};
const E_OUT = 'new Pods kept out';
const E_BOTH = 'new Pods kept out, running Pods evicted after toleration';
const R_FALSE = 'False · not-ready:NoExecute';
const R_UNKNOWN = 'Unknown · unreachable:NoExecute';
const TAINTED = { ...HEALTHY, ...PRESSED, effectChip: E_OUT };
const CONDITION_CHIPS = ['readyChip', 'memChip', 'diskChip', 'pidChip', 'netChip'];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: HEALTHY,
    opacity: stage(),
  },
  {
    id: 'conditions',
    duration: 3300,
    narration: 'Under Conditions, kubectl describe node prints rows like these five, and they decide whether Pods may run here. Ready says the machine is healthy. MemoryPressure, DiskPressure and PIDPressure say it is short of memory, disk or process IDs, and NetworkUnavailable, which not every Node carries, says its network is not set up correctly. Ready is healthy at True, the other four at False.',
    chips: HEALTHY,
    opacity: stage(),
    // Nothing travels and no chip moves (P-09a): the beat is the five condition rows lighting.
    flow: [F.light({ targets: CONDITION_CHIPS, delay: BEAT.lead })],
  },
  {
    id: 'pressure',
    duration: 3500,
    narration: 'MemoryPressure, DiskPressure, PIDPressure and NetworkUnavailable all go True here at once, and the control plane writes a NoSchedule taint for each onto the Node, such as node.kubernetes.io/memory-pressure. The taint spares running Pods (what the Kubelet evicts under pressure is the Node-pressure Eviction card) and holds web-2 out, which memory-pressure does only to a BestEffort Pod like this one.',
    chips: TAINTED,
    wires: { wNS: 'NoSchedule · no matching toleration' },
    opacity: stage(),
    lit: ['cpBox', 'memChip', 'diskChip', 'pidChip', 'netChip', 'effectChip'],
    // S-13, P-03: the five values are wound back and turn over when the taint lands.
    rewind: { chips: { memChip: CLEAR, diskChip: CLEAR, pidChip: CLEAR, netChip: CLEAR, effectChip: 'none' } },
    // Self-initiated, so BEAT.lead (M-18). It lands in a DIM Pod, hence the opacity lift (M-07, M-16).
    flow: [
      F.route({ points: NS_LANE, delay: BEAT.lead, name: 'taint', pulse: { pod: 'ghostPod', dim: true } }),
      F.set({ at: 'taint', chips: { ...PRESSED, effectChip: E_OUT } }),
    ],
  },
  {
    id: 'not-ready',
    duration: 3400,
    narration: 'Ready False is the one condition whose taint reaches a Pod already there. The control plane writes node.kubernetes.io/not-ready, and it carries NoExecute. Every Pod is given a 300 second toleration for it unless it sets its own, so web-0 and web-1 go when that runs out, drawn here at once. The Node Failure and Pod Recovery card times it.',
    chips: { ...TAINTED, readyChip: R_FALSE, effectChip: E_BOTH },
    wires: { wNE: 'node.kubernetes.io/not-ready:NoExecute' },
    opacity: stage({ web: GONE }),
    lit: ['cpBox', 'readyChip', 'effectChip'],
    rewind: { chips: { readyChip: HEALTHY.readyChip, effectChip: E_OUT } },
    // M-16, M-08, NET.A-02: the ball lands on the FRAME and both Pods blink on its arrival.
    flow: [
      F.route({ points: NE_LANE, delay: BEAT.lead, name: 'taint', pulse: 'podA' }),
      F.pulse({ pod: 'podB', at: 'taint' }),
      F.fade({ target: 'podA', to: GONE, dur: FADE.out, at: 'taint' }),
      F.fade({ target: 'podB', to: GONE, dur: FADE.out, at: 'taint' }),
      F.set({ at: 'taint', chips: { readyChip: R_FALSE, effectChip: E_BOTH } }),
    ],
  },
  {
    id: 'unreachable',
    duration: 3300,
    narration: 'Ready has a third value. When nothing has been heard from the Node for --node-monitor-grace-period, 50 seconds by default, Ready reads Unknown and the taint is node.kubernetes.io/unreachable instead. It carries NoExecute too, so False and Unknown differ in what went wrong and not in what it costs a Pod.',
    chips: { ...TAINTED, readyChip: R_UNKNOWN, effectChip: E_BOTH },
    wires: { wNE: 'node.kubernetes.io/unreachable:NoExecute' },
    opacity: stage({ web: GONE }),
    lit: ['cpBox', 'readyChip'],
    rewind: { chips: { readyChip: R_FALSE } },
    // The ball lands on the frame and every Pod on it blinks (M-16), the GONE ones with the lift (M-07).
    flow: [
      F.route({ points: NE_LANE, delay: BEAT.lead, name: 'taint', pulse: 'dsPod' }),
      F.pulse({ pod: 'podA', dim: true, from: GONE, at: 'taint' }),
      F.pulse({ pod: 'podB', dim: true, from: GONE, at: 'taint' }),
      F.set({ at: 'taint', chips: { readyChip: R_UNKNOWN } }),
    ],
  },
  {
    id: 'daemonset',
    duration: 3000,
    narration: 'The node-exporter Pod is still there. DaemonSet Pods are created with NoExecute tolerations for not-ready and unreachable, so they are never evicted for those two, and NoSchedule tolerations are added for memory, disk and PID pressure, plus network-unavailable on a hostNetwork Pod like this one.',
    chips: { ...TAINTED, readyChip: R_UNKNOWN, effectChip: E_BOTH },
    opacity: stage({ web: GONE }),
    // The effect chip does not move and takes no cue (P-09a).
    flow: [F.pulse({ pod: 'dsPod', delay: BEAT.lead })],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
