import { P, F, defineCard, ladder, strip, spread, midX, laneOf, CLU, BEAT, FADE, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-node-conditions.md

// One actor in the top row and two lanes leaving it. Panel x<=397 y<=255, and the actor sits at
// 450, far right of it, so the reserved corner costs the composition nothing.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140

const TOP_Y = CLU.TOP_Y, TOP_H = CLU.BOX_H, TOP_BOTTOM = TOP_Y + TOP_H;   // 40 / 80 / 120

// The CLU.L-01 family untouched: 34 of label padding, a 106 Pod row, 12 of floor.
const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;
const NODE_Y = 340, NODE_H = CLU.NODE.H;                 // 340..492
const POD_W = 300, POD_H = CLU.NODE.POD_H;
const POD_Y = NODE_Y + CLU.NODE.POD_DY, POD_PAD = 24;    // 374..480
// Fixed WIDTH, derived gap: three 300-wide Pods inset by POD_PAD leave 66 between them.
const POD_X = spread({ from: NODE_X + POD_PAD, to: CONTENT_R - POD_PAD, count: 3, w: POD_W }).x;  // 84/450/816
const POD_CX = (i) => midX(POD_X(i), POD_X(i) + POD_W); // 234 / 600 / 966
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// The control plane stands in web-0's column, so its NoExecute drop is a straight vertical on the
// card's centre axis. The refused Pod stands in web-1's column, outside the frame it never enters.
const CP_X = POD_X(1), CP_W = POD_W;                     // 450..750, mid 600
const GHOST_X = POD_X(2), GHOST_Y = 190;                 // 816..1116, 190..296

// THE WHOLE CARD IS THESE TWO LANES, and both leave the block that writes a taint. A taint is a
// field on the NODE, so NoExecute stops on the frame face and the Pods inside react (NET.A-02).
const NE_LANE = [[POD_CX(1), TOP_BOTTOM], [POD_CX(1), NODE_Y]];
const NS_LANE = [[CP_X + CP_W, TOP_Y + TOP_H / 2], [POD_CX(2), TOP_Y + TOP_H / 2], [POD_CX(2), GHOST_Y]];

// The NoExecute caption is anchored END on the free left side of its drop, centred in the band
// its own panel leaves free: 285 is the midpoint of the worst panel bottom and the frame top.
const WIRE_NE_X = POD_CX(1) - 12, WIRE_NE_Y = 285;       // 588 / 285
// The NoSchedule caption sits ABOVE its horizontal leg, anchored START 12 past the actor it
// leaves, which is the only x where a string above that leg does not print on the actor.
const WIRE_NS_X = CP_X + CP_W + 12, WIRE_NS_Y = 66;      // 762 / 66

// Chips as a bottom strip, TWO per row: the widest value pair runs 54 characters and the 350.67
// three-across column cannot hold it. Three rows, read as a table of one condition each.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = NODE_Y + NODE_H + 16;                    // 508, third row ends on 626
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;                               // 532, which is LAYOUT.C.strip.two
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is read as a GRID: the index wraps across the two columns and steps down every second.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

const PENDING = OPACITY.pending;                         // declared, waiting for a Node to take it

// The list order IS the append order, so it is the z-order: lanes, captions, chips, the frame and
// its Pods, the refused Pod, the actor, then the packet layer LAST, a ball travelling in the frame.
export const SCENE = {
  'aria-label': 'Node conditions and the taints they create: five conditions read off Node-1, and one control plane block writing two kinds of taint, the four pressure and network conditions each becoming a NoSchedule taint whose lane turns aside into a Pod that stays Pending and never enters the Node, Ready False or Unknown becoming a NoExecute taint whose lane lands on the Node frame itself, after which both running Pods without a toleration blink and fade away, and the DaemonSet Pod that tolerates both kinds staying where it is',
  parts: [
    P.defs(),
    P.lane({ key: 'neLane', points: NE_LANE, dim: true, dashed: true }),
    P.lane({ key: 'nsLane', points: NS_LANE, dim: true, dashed: true }),
    P.wire({ key: 'wNE', x: WIRE_NE_X, y: WIRE_NE_Y, anchor: 'end' }),
    P.wire({ key: 'wNS', x: WIRE_NS_X, y: WIRE_NS_Y, anchor: 'start' }),
    // The Conditions table as kubectl prints it, one row per condition, with the effect the last
    // chip carries. Ready reads True when healthy and the other four read False: that is the row.
    P.chip({ key: 'readyChip',  x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'Ready',              value: 'none' }),
    P.chip({ key: 'memChip',    x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'MemoryPressure',     value: 'none' }),
    P.chip({ key: 'diskChip',   x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'DiskPressure',       value: 'none' }),
    P.chip({ key: 'pidChip',    x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'PIDPressure',        value: 'none' }),
    P.chip({ key: 'netChip',    x: CHIP_X(4), y: CHIP_Y(4), w: CHIP_W, h: CHIP_H, name: 'NetworkUnavailable', value: 'none' }),
    P.chip({ key: 'effectChip', x: CHIP_X(5), y: CHIP_Y(5), w: CHIP_W, h: CHIP_H, name: 'effect on Pods',     value: 'none' }),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    // Left to right: the Pod that rides everything out, then the two the NoExecute taint takes.
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
    // The Pod a NoSchedule taint keeps out. It rests at OPACITY.pending rather than being cut out,
    // so the lane that stops in it has something to point at from the poster onward (C-14, M-24).
    P.pod({
      key: 'ghostPod', id: 'ghostPod', innerKey: 'ghostBox', opacity: PENDING,
      x: GHOST_X, y: GHOST_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'web-2', sublabel: 'Pending · BestEffort' },
    }),
    // The one block that acts. Both lanes leave it, one from the bottom face and one from the
    // right, so the two effects differ in the shape of their path and not only in a caption.
    P.box({ key: 'cpBox', x: CP_X, y: TOP_Y, w: CP_W, h: TOP_H, label: 'Control Plane', sublabel: 'creates taints by condition' }),
    P.packets(),
  ],
  reset: {
    keys: ['cpBox', 'dsPodBox', 'podABox', 'podBBox', 'readyChip', 'memChip', 'diskChip', 'pidChip', 'netChip', 'effectChip'],
    pods: ['dsPod', 'podA', 'podB', 'ghostPod'],
  },
};

const GONE = OPACITY.terminating;                        // evicted, deletionTimestamp set
const QUIET = OPACITY.notready;                          // alive, not being heard from
// A-16: one factory states the blocks AND their lanes. `neLane` ends on the FRAME, so it takes the
// frame's shade (A-13). `nsLane` stays full: it carries a ball and A-15 outranks its sink's phase.
const stage = ({ nodeEl = 1, web = 1 } = {}) => ({
  nodeEl, dsPod: 1, podA: web, podB: web, ghostPod: PENDING,
  neLane: laneOf(nodeEl, OPACITY.running),
  nsLane: OPACITY.running,
});

// P-01: every step states every chip, the poster included. The taint key is written without its
// node.kubernetes.io/ prefix, which the wire captions and the narrations carry in full.
const CLEAR = 'False · no taint';
const HEALTHY = { readyChip: 'True · no taint', memChip: CLEAR, diskChip: CLEAR, pidChip: CLEAR, netChip: CLEAR, effectChip: 'none' };
const PRESSED = {
  memChip:  'True · memory-pressure:NoSchedule',
  diskChip: 'True · disk-pressure:NoSchedule',
  pidChip:  'True · pid-pressure:NoSchedule',
  netChip:  'True · network-unavailable:NoSchedule',
};
const E_OUT = 'new Pods kept out';
const E_BOTH = 'new Pods kept out, running Pods evicted';
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
    duration: 3000,
    narration: 'The Conditions table that kubectl describe node prints these five rows, and they decide whether Pods may run here. Ready says the machine is healthy. MemoryPressure, DiskPressure and PIDPressure say it is short of memory, disk or process IDs, and NetworkUnavailable says its network is not set up correctly. Ready is healthy at True, the other four at False.',
    chips: HEALTHY,
    opacity: stage(),
    // Nothing travels and no chip MOVES (P-09a): the poster is the same healthy reading. The beat
    // is the five condition rows lighting, which is what the sentence is about.
    flow: [F.light({ targets: CONDITION_CHIPS, delay: BEAT.lead })],
  },
  {
    id: 'pressure',
    duration: 3300,
    narration: 'MemoryPressure goes True, and the control plane writes the matching taint onto the Node: node.kubernetes.io/memory-pressure, with the NoSchedule effect. DiskPressure, PIDPressure and NetworkUnavailable each become their own NoSchedule taint the same way. NoSchedule leaves the running Pods alone and holds web-2 out, which memory-pressure does only to a BestEffort Pod like this one.',
    chips: TAINTED,
    wires: { wNS: 'NoSchedule · no matching toleration' },
    opacity: stage(),
    lit: ['cpBox', 'memChip', 'diskChip', 'pidChip', 'netChip', 'effectChip'],
    // S-13 and P-03: the static block states the END, so the five values it moves are wound back
    // to the healthy reading and turn over when the taint lands.
    rewind: { chips: { memChip: CLEAR, diskChip: CLEAR, pidChip: CLEAR, netChip: CLEAR, effectChip: 'none' } },
    // Self-initiated with no preceding hop, so the ball waits BEAT.lead (M-18). It lands in a DIM
    // Pod, so the blink needs the opacity lift pulsePodDim carries (M-07, M-16).
    flow: [
      F.route({ points: NS_LANE, delay: BEAT.lead, name: 'taint' }),
      F.pulse({ pod: 'ghostPod', dim: true, at: 'taint' }),
      F.set({ at: 'taint', chips: { ...PRESSED, effectChip: E_OUT } }),
    ],
  },
  {
    id: 'not-ready',
    duration: 3400,
    narration: 'Ready False is the one condition that reaches a Pod already there. The control plane writes node.kubernetes.io/not-ready, and it carries NoExecute. Every Pod is given a 300 second toleration for it unless it sets its own, so web-0 and web-1 go when that runs out. The Node Failure and Pod Recovery card times it.',
    chips: { ...TAINTED, readyChip: R_FALSE, effectChip: E_BOTH },
    wires: { wNE: 'node.kubernetes.io/not-ready:NoExecute' },
    opacity: stage({ web: GONE }),
    lit: ['cpBox', 'readyChip', 'effectChip'],
    rewind: { chips: { readyChip: HEALTHY.readyChip, effectChip: E_OUT } },
    // M-16 and M-08: the ball lands on the FRAME, both Pods blink on its arrival, and the fade
    // shares the same delay so the pulse is never behind it. NET.A-02 is the shape of this step.
    flow: [
      F.route({ points: NE_LANE, delay: BEAT.lead, name: 'taint' }),
      F.pulse({ pod: 'podA', at: 'taint' }),
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
    opacity: stage({ web: GONE, nodeEl: QUIET }),
    lit: ['cpBox', 'readyChip'],
    rewind: { chips: { readyChip: R_FALSE } },
    // A-15: the lane the ball rides carries its final shade above the guard and is animated down
    // FROM full, so the ball flies over a lit lane and the Node goes quiet behind it.
    flow: [
      F.route({ points: NE_LANE, delay: BEAT.lead, name: 'taint' }),
      F.fade({ target: 'nodeEl', from: 1, to: QUIET, dur: FADE.out, at: 'taint' }),
      F.fade({ target: 'neLane', from: 1, to: QUIET, dur: FADE.out, at: 'taint' }),
      F.set({ at: 'taint', chips: { readyChip: R_UNKNOWN } }),
    ],
  },
  {
    id: 'daemonset',
    duration: 3000,
    narration: 'The node-exporter Pod is still there. DaemonSet Pods are created with NoExecute tolerations for not-ready and unreachable, so they are never evicted for those two, and NoSchedule tolerations are added for memory, disk and PID pressure, plus network-unavailable on a hostNetwork Pod like this one.',
    chips: { ...TAINTED, readyChip: R_UNKNOWN, effectChip: E_BOTH },
    opacity: stage({ web: GONE, nodeEl: QUIET }),
    // The effect chip does not move here and takes no cue (P-09a): what changed is which Pod the
    // effect reaches, and the Pod that never faded is what says it.
    flow: [F.pulse({ pod: 'dsPod', delay: BEAT.lead })],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
