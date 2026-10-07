import { P, F, defineCard, ladder, strip, spread, midX, CLU, LAYOUT, BEAT, FADE, OPACITY, laneOf } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-node-registration.md

// Layout C, one full-width Node frame holding the machine, 126 tall rather than the CLU.L-01 152.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;
const CX = midX(CONTENT_L, CONTENT_R);                   // the canvas centre by construction

const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
// The API is centred on the frame, so both lanes between the two are straight drops.
const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;
const LEASE_W = 130, TOP_GAP = 104;
const LEASE_X = API_R + TOP_GAP, LEASE_R = LEASE_X + LEASE_W;
const LEASE_CX = midX(LEASE_X, LEASE_R);
const WIRE_X = midX(API_R, LEASE_X);                     // the gap midpoint
const WIRE_Y = TOP_Y - 14;                               // above the row: the lanes own below it

const LADDER_X = LAYOUT.C.ladder.x, LADDER_W = LAYOUT.C.ladder.w;   // right of the drops
const LADDER_Y = 148, ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;
// Not the CLU.L-01 Pod height: two of the three slots are plain boxes, not Pod shells.
const NODE_Y = 402, NODE_H = CLU.NODE.POD_DY + 80 + 12;
const SLOT_H = 80, SLOT_Y = NODE_Y + CLU.NODE.POD_DY;
const SLOT_W = 300, SLOT_PAD = 24;
const SLOT_X = spread({ from: NODE_X + SLOT_PAD, to: CONTENT_R - SLOT_PAD, count: 3, w: SLOT_W }).x;
const POD_INNER = { dx: 30, w: SLOT_W - 60, dy: 26, h: 44 };
// The two actors keep the catalog 232 and centre in their slots, only the Pod takes the slot width.
const ACTOR_X = i => SLOT_X(i) + (SLOT_W - BOX_W) / 2;

// Chips as a bottom strip, THREE per row: the taint value needs LAYOUT.C.strip.three.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 14, CHIP_VGAP = 8, CHIP_COLS = 3;
const CHIPS_Y = NODE_Y + NODE_H + 14;
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is read as a GRID: the index wraps across the three columns and steps down every third.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// A mirrored LANE_DX pair on BOTH faces (L-12): the Kubelet writes up, the placement write down.
const LANE_DX = CLU.LANE_DY;
const UP_X = CX - LANE_DX, DOWN_X = CX + LANE_DX;
const KUBELET_TO_API = [[UP_X, NODE_Y], [UP_X, TOP_BOTTOM]];
const API_TO_NODE = [[DOWN_X, TOP_BOTTOM], [DOWN_X, NODE_Y]];
// The Lease riser takes the one free corridor: right of the two drops, left of the ladder.
const GUTTER_X = LADDER_X - 20;
const UNDER_TOP_Y = midX(TOP_BOTTOM, LADDER_Y);          // mid-band
const NODE_TO_LEASE = [[GUTTER_X, NODE_Y], [GUTTER_X, UNDER_TOP_Y], [LEASE_CX, UNDER_TOP_Y], [LEASE_CX, TOP_BOTTOM]];
// Start-anchored right of the drop it labels: the corridor is narrow and the ladder owns the rest.
const BIND_WIRE_X = DOWN_X + 12, BIND_WIRE_Y = NODE_Y + 20;

// List order is z-order: lanes and labels, chips, the frame and its contents, packets, top row last.
export const SCENE = {
  'aria-label': 'Node registration: a Kubelet self-registering its machine as a Node object, the status it publishes, the not-ready taint that gates Pods while Ready is False, the first Pod placed once Ready turns True, and the Lease heartbeat',
  parts: [
    P.defs(),
    // A relationship, not a route: nothing travels between the API and the Lease.
    P.relation({ points: [[API_R, TOP_CY], [LEASE_X, TOP_CY]] }),
    P.lane({ key: 'regLane', points: KUBELET_TO_API, dim: true, dashed: true }),
    P.lane({ key: 'bindLane', points: API_TO_NODE, dim: true, dashed: true }),
    P.lane({ key: 'leaseLane', points: NODE_TO_LEASE, dim: true, dashed: true }),
    // `call` captions the Kubelet calls above the top row, `bind` rides the drop it did not make.
    P.wire({ key: 'call', x: WIRE_X, y: WIRE_Y }),
    P.wire({ key: 'bind', x: BIND_WIRE_X, y: BIND_WIRE_Y, anchor: 'start' }),
    // The grid fills left to right as the steps write it.
    P.chip({ key: 'nameChip',  x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'metadata.name',    value: 'not registered' }),
    P.chip({ key: 'addrChip',  x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'status.addresses', value: 'none' }),
    P.chip({ key: 'capChip',   x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'status.capacity',  value: 'none' }),
    P.chip({ key: 'infoChip',  x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'status.nodeInfo',  value: 'none' }),
    P.chip({ key: 'readyChip', x: CHIP_X(4), y: CHIP_Y(4), w: CHIP_W, h: CHIP_H, name: 'Ready',            value: 'none' }),
    P.chip({ key: 'taintChip', x: CHIP_X(5), y: CHIP_Y(5), w: CHIP_W, h: CHIP_H, name: 'Taint',            value: 'none' }),
    P.packets(),
    P.chain({
      key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. boot       ·  Kubelet starts with --register-node true',
        '2. register   ·  Kubelet creates the Node object itself',
        '3. status     ·  addresses, capacity, nodeInfo, own labels',
        '4. NotReady   ·  Ready False, the not-ready taint gates Pods',
        '5. Ready      ·  runtime up, taint gone, first Pod bound',
        '6. heartbeat  ·  Lease renewed in kube-node-lease',
      ],
    }),
    // The frame is the MACHINE, dim until the object exists (C-14).
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.box({
      key: 'runtime', x: ACTOR_X(0), y: SLOT_Y, w: BOX_W, h: SLOT_H,
      label: 'Container runtime', sublabel: 'CRI · starting',
    }),
    P.box({
      key: 'kubelet', x: ACTOR_X(1), y: SLOT_Y, w: BOX_W, h: SLOT_H,
      label: 'Kubelet', sublabel: '--register-node true',
    }),
    P.pod({
      key: 'firstPod', id: 'firstPod', innerKey: 'firstPodBox', opacity: 0,
      x: SLOT_X(2), y: SLOT_Y, w: SLOT_W, h: SLOT_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'web-0', sublabel: 'nginx:1.27' },
    }),
    P.box({ key: 'api', x: API_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API', sublabel: 'nodes + nodes/status' }),
    P.cylinder({ key: 'lease', x: LEASE_X, y: TOP_Y, w: LEASE_W, h: BOX_H, label: 'Lease' }),
  ],
  reset: {
    keys: ['api', 'lease', 'kubelet', 'runtime', 'nameChip', 'addrChip', 'capChip', 'infoChip', 'readyChip', 'taintChip'],
    pods: ['firstPod'],
  },
};

const UNSEEN = OPACITY.notready;
// All three lanes end on the frame, so none is brighter than it (A-13).
const shades = ({ nodeEl = 1, kubelet = 1, runtime = UNSEEN, firstPod = 0 } = {}) => ({
  nodeEl, kubelet, runtime, firstPod,
  regLane: laneOf(nodeEl, OPACITY.running),
  bindLane: laneOf(nodeEl, OPACITY.running),
  leaseLane: laneOf(nodeEl, OPACITY.running),
});

// Every step writes every chip, or the grid shows a capacity before a name.
const EMPTY = { nameChip: 'not registered', addrChip: 'none', capChip: 'none', infoChip: 'none', readyChip: 'none', taintChip: 'none' };
const NAMED = { ...EMPTY, nameChip: 'Node-1' };
const FILLED = { ...NAMED, addrChip: 'InternalIP 10.0.4.17', capChip: 'cpu 4 · mem 16Gi · pods 110', infoChip: 'containerd 2.1 · Linux 6.8' };
const BLOCKED = { ...FILLED, readyChip: 'False · KubeletNotReady', taintChip: 'node.kubernetes.io/not-ready:NoSchedule' };
const OPEN = { ...FILLED, readyChip: 'True · KubeletReady', taintChip: 'none' };
const STARTING = 'CRI · starting', READY = 'CRI · ready';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: EMPTY,
    sublabels: { runtime: STARTING },
    opacity: shades({ nodeEl: UNSEEN, kubelet: OPACITY.pending }),
    chain: -1,
  },
  {
    id: 'boot',
    duration: 2600,
    narration: 'A machine joins a cluster by running a Kubelet on it. With --register-node left at its default of true, the Kubelet registers itself with the API rather than waiting for an operator to create the object, which is how most distributions bring a Node in. Nothing in the cluster knows this machine yet.',
    chips: EMPTY,
    sublabels: { runtime: STARTING },
    opacity: shades({ nodeEl: UNSEEN }),
    chain: 0,
    flow: [F.reveal({ target: 'kubelet', from: OPACITY.pending, delay: BEAT.lead })],
  },
  {
    id: 'register',
    duration: 3000,
    narration: 'The Kubelet creates the Node object through the API, named after the machine. The name is what identifies a Node: two Nodes cannot carry the same name at the same time, and Kubernetes assumes a resource with the same name is the same object, with the same disk and the same network settings.',
    chips: NAMED,
    wires: { call: 'POST /api/v1/nodes · Node-1' },
    sublabels: { runtime: STARTING },
    opacity: shades(),
    lit: ['nameChip'],
    chain: 1,
    rewind: { chips: { nameChip: 'not registered' } },
    // The Kubelet self-initiates, so the ball waits BEAT.lead.
    flow: [
      F.route({ points: KUBELET_TO_API, delay: BEAT.lead, name: 'post', lights: ['api'] }),
      F.set({ at: 'post', chips: { nameChip: 'Node-1' } }),
      F.reveal({ target: 'nodeEl', from: UNSEEN, at: 'post' }),
    ],
  },
  {
    id: 'status',
    duration: 3000,
    narration: 'The Kubelet then fills in the status: the addresses of the machine, its capacity, and a nodeInfo block naming the kernel, the runtime and its own version. Its own labels sit on the object, not the status, and the NodeRestriction admission plugin holds those to a fixed list, so a Kubelet can label itself with a hostname or a zone but never with a node-role.',
    chips: FILLED,
    wires: { call: 'PATCH /api/v1/nodes/node-1/status' },
    sublabels: { runtime: STARTING },
    opacity: shades(),
    lit: ['addrChip', 'capChip', 'infoChip'],
    chain: 2,
    rewind: { chips: { addrChip: 'none', capChip: 'none', infoChip: 'none' } },
    flow: [
      F.route({ points: KUBELET_TO_API, delay: BEAT.lead, name: 'put', lights: ['api'] }),
      F.set({ at: 'put', chips: { addrChip: 'InternalIP 10.0.4.17', capChip: 'cpu 4 · mem 16Gi · pods 110', infoChip: 'containerd 2.1 · Linux 6.8' } }),
    ],
  },
  {
    id: 'not-ready',
    duration: 3100,
    narration: 'The object exists and takes no ordinary Pod yet. The Kubelet reports Ready False while the machine is not healthy, and healthy means everything a Pod needs on it is up, the runtime included. Ready False is what puts node.kubernetes.io/not-ready on the Node, and scheduling reads taints and not conditions, so only a Pod that tolerates it lands here.',
    chips: BLOCKED,
    wires: { call: 'PATCH .../nodes/node-1/status · Ready False' },
    sublabels: { runtime: STARTING },
    opacity: shades(),
    lit: ['readyChip', 'taintChip'],
    chain: 3,
    // The taint follows the condition and lands on the same object, so both turn over on one arrival.
    rewind: { chips: { readyChip: 'none', taintChip: 'none' } },
    flow: [
      F.route({ points: KUBELET_TO_API, delay: BEAT.lead, name: 'cond', lights: ['api'] }),
      F.set({ at: 'cond', chips: { readyChip: 'False · KubeletNotReady', taintChip: 'node.kubernetes.io/not-ready:NoSchedule' } }),
    ],
  },
  {
    id: 'ready',
    duration: 3600,
    narration: 'The container runtime comes up, the Kubelet flips Ready to True, and the not-ready taint is taken back off the Node. Node-1 can be chosen now: the first binding names it in spec.nodeName, and the Kubelet that registered the machine starts the containers on it.',
    chips: OPEN,
    wires: { call: 'PATCH .../nodes/node-1/status · Ready True', bind: 'spec.nodeName=node-1' },
    sublabels: { runtime: READY },
    opacity: shades({ runtime: 1, firstPod: 1 }),
    lit: ['readyChip', 'taintChip'],
    chain: 4,
    rewind: { chips: { readyChip: 'False · KubeletNotReady', taintChip: 'node.kubernetes.io/not-ready:NoSchedule' } },
    flow: [
      F.reveal({ target: 'runtime', from: UNSEEN }),
      F.route({ points: KUBELET_TO_API, delay: BEAT.lead, name: 'ok', lights: ['api'] }),
      F.set({ at: 'ok', chips: { readyChip: 'True · KubeletReady', taintChip: 'none' } }),
      // The Pod materialises and pulses on the bind arrival, not a beat behind it.
      F.route({ points: API_TO_NODE, after: 'ok', name: 'bind' }),
      F.fade({ target: 'firstPod', from: 0, to: 1, dur: FADE.in, at: 'bind', easing: 'ease-out' }),
      F.pulse({ pod: 'firstPod', at: 'bind' }),
    ],
  },
  {
    id: 'heartbeat',
    duration: 2900,
    narration: 'Alive is a separate question from Ready, and the Kubelet answers it on two clocks. It renews a Lease in the kube-node-lease namespace every 10 seconds and rewrites the whole status every 5 minutes, both of them defaults. The fast one is the signal, and the Node Failure and Pod Recovery card is about losing it.',
    chips: OPEN,
    // Same string cluster-node-failure writes on its own heartbeat lane.
    wires: { call: 'PUT lease renewTime · every 10s' },
    sublabels: { runtime: READY },
    opacity: shades({ runtime: 1, firstPod: 1 }),
    chain: 5,
    flow: [F.route({ points: NODE_TO_LEASE, delay: BEAT.lead, lights: ['lease'] })],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
