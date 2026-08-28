import { P, F, defineCard, ladder, strip, spread, midX, CLU, LAYOUT, BEAT, FADE, OPACITY, laneOf } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-node-registration.md

// Layout C at the folder ladder pitch, one full-width Node frame holding the machine, 126 rather
// than the CLU.L-01 152: SIZES in the record. Panel x<=397 y<=255, frame top 402.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = midX(CONTENT_L, CONTENT_R);                   // 600, the canvas centre by construction

const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;              // 232 / 80
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;     // 40 / 120
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);                  // 80
// The API is centred on the frame, so both lanes between the two are straight drops.
const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;     // 484..716
const LEASE_W = 130, TOP_GAP = 104;
const LEASE_X = API_R + TOP_GAP, LEASE_R = LEASE_X + LEASE_W;   // 820..950
const LEASE_CX = midX(LEASE_X, LEASE_R);                 // 885
const WIRE_X = midX(API_R, LEASE_X);                     // 768, the gap midpoint
const WIRE_Y = TOP_Y - 14;                               // 26, above the row: the lanes own below it

const LADDER_X = LAYOUT.C.ladder.x, LADDER_W = LAYOUT.C.ladder.w;   // 660..1140, right of the drops
const LADDER_Y = 148, ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;     // 6 rows, 148..390

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
// 34 of label padding and 12 of floor are the CLU.L-01 family, the 80 between them is not: two of
// the three slots are plain boxes, and a 106 Pod shell around a label pair is 60 units of nothing.
const NODE_Y = 402, NODE_H = CLU.NODE.POD_DY + 80 + 12;  // 402..528, clear of the ladder by 12
const SLOT_H = 80, SLOT_Y = NODE_Y + CLU.NODE.POD_DY;    // 436..516
const SLOT_W = 300, SLOT_PAD = 24;
// Fixed WIDTH, derived gap: three 300-wide slots inset by SLOT_PAD leave 66 between them.
const SLOT_X = spread({ from: NODE_X + SLOT_PAD, to: CONTENT_R - SLOT_PAD, count: 3, w: SLOT_W }).x;  // 84/450/816
const POD_INNER = { dx: 30, w: SLOT_W - 60, dy: 26, h: 44 };

// Chips as a bottom strip, THREE per row: the taint value alone measures 269 and needs the 350.67
// LAYOUT.C.strip.three gives. Two rows, and the grid fills in the order the steps write it.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 14, CHIP_VGAP = 8, CHIP_COLS = 3;
const CHIPS_Y = NODE_Y + NODE_H + 14;                    // 542, second row ends on 618
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;                               // 350.67, which is LAYOUT.C.strip.three
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is read as a GRID: the index wraps across the three columns and steps down every third.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// Both lanes between the API and the frame are a mirrored LANE_DX pair on BOTH faces (L-12): the
// Kubelet writes going up, the placement write coming down.
const LANE_DX = CLU.LANE_DY;                             // 12
const UP_X = CX - LANE_DX, DOWN_X = CX + LANE_DX;        // 588 / 612
const KUBELET_TO_API = [[UP_X, NODE_Y], [UP_X, TOP_BOTTOM]];
const API_TO_NODE = [[DOWN_X, TOP_BOTTOM], [DOWN_X, NODE_Y]];
// The Lease riser takes the one free corridor: right of the two drops, left of the ladder, and
// across the 28 unit band between the top row and the ladder.
const GUTTER_X = LADDER_X - 20;                          // 640, 28 clear of the down drop
const UNDER_TOP_Y = midX(TOP_BOTTOM, LADDER_Y);          // 134, mid-band
const NODE_TO_LEASE = [[GUTTER_X, NODE_Y], [GUTTER_X, UNDER_TOP_Y], [LEASE_CX, UNDER_TOP_Y], [LEASE_CX, TOP_BOTTOM]];
// Anchored START just right of the drop it labels, inside the frame label band: the corridor beside
// the drop is 28 wide and the ladder owns everything past 660.
const BIND_WIRE_X = DOWN_X + 12, BIND_WIRE_Y = NODE_Y + 20;         // 624 / 422

// The list order IS the append order, so it is the z-order: the three lanes and their labels, the
// chips, the frame and what stands on it, the packet layer, then the two top-row blocks last.
export const SCENE = {
  'aria-label': 'Node registration: a Kubelet self-registering its machine as a Node object, the status it publishes, the not-ready taint that gates Pods while Ready is False, the first Pod placed once Ready turns True, and the Lease heartbeat',
  parts: [
    P.defs(),
    // A relationship, not a route: the Lease object lives in the API like any other, and nothing
    // travels between the two on any step.
    P.relation({ points: [[API_R, TOP_CY], [LEASE_X, TOP_CY]] }),
    P.lane({ key: 'regLane', points: KUBELET_TO_API, dim: true, dashed: true }),
    P.lane({ key: 'bindLane', points: API_TO_NODE, dim: true, dashed: true }),
    P.lane({ key: 'leaseLane', points: NODE_TO_LEASE, dim: true, dashed: true }),
    // Two registers: `call` captions the call above the top row, and `bind` rides the one drop
    // whose payload is not a call the Kubelet made. `call` is not `api`, the box it sits over.
    P.wire({ key: 'call', x: WIRE_X, y: WIRE_Y }),
    P.wire({ key: 'bind', x: BIND_WIRE_X, y: BIND_WIRE_Y, anchor: 'start' }),
    // Row 1, what the Kubelet publishes. Row 2 carries the last of it and then the two registers
    // that decide whether a Pod may land: the grid fills left to right as the steps write it.
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
    // The frame is the MACHINE, and it rests dim until the object exists (C-14). What stands on it
    // is what the card is about: the Kubelet that registers, and the runtime Ready waits for.
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.box({
      key: 'runtime', x: SLOT_X(0), y: SLOT_Y, w: SLOT_W, h: SLOT_H,
      label: 'Container runtime', sublabel: 'CRI · starting',
    }),
    // Centred in the frame, under the two lanes that leave it: the reader sees WHO acts.
    P.box({
      key: 'kubelet', x: SLOT_X(1), y: SLOT_Y, w: SLOT_W, h: SLOT_H,
      label: 'Kubelet', sublabel: '--register-node true',
    }),
    P.pod({
      key: 'firstPod', id: 'firstPod', innerKey: 'firstPodBox', opacity: 0,
      x: SLOT_X(2), y: SLOT_Y, w: SLOT_W, h: SLOT_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: 'web-0', sublabel: 'nginx:1.27' },
    }),
    // Top row absolute last, so a ball passes behind the blocks rather than over their labels.
    P.box({ key: 'api', x: API_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API', sublabel: 'nodes + nodes/status' }),
    P.cylinder({ key: 'lease', x: LEASE_X, y: TOP_Y, w: LEASE_W, h: BOX_H, label: 'Lease' }),
  ],
  reset: {
    keys: ['api', 'lease', 'kubelet', 'runtime', 'nameChip', 'addrChip', 'capChip', 'infoChip', 'readyChip', 'taintChip'],
    pods: ['firstPod'],
  },
};

const UNSEEN = OPACITY.notready;
// Every step writes the whole set. All three lanes end on the frame, so all three take its shade
// and none of them is ever brighter than what it stands on (A-13).
const shades = ({ nodeEl = 1, kubelet = 1, runtime = UNSEEN, firstPod = 0 } = {}) => ({
  nodeEl, kubelet, runtime, firstPod,
  regLane: laneOf(nodeEl, OPACITY.running),
  bindLane: laneOf(nodeEl, OPACITY.running),
  leaseLane: laneOf(nodeEl, OPACITY.running),
});

// Every step writes every chip, the poster step included, or the grid reads as an object that
// carried a capacity before it had a name.
const EMPTY = { nameChip: 'not registered', addrChip: 'none', capChip: 'none', infoChip: 'none', readyChip: 'none', taintChip: 'none' };
const NAMED = { ...EMPTY, nameChip: 'Node-1' };
const FILLED = { ...NAMED, addrChip: 'InternalIP 10.0.4.17', capChip: 'cpu 4 · mem 16Gi · pods 110', infoChip: 'containerd 2.1 · Linux 6.8' };
const BLOCKED = { ...FILLED, readyChip: 'False · KubeletNotReady', taintChip: 'node.kubernetes.io/not-ready:NoSchedule' };
const OPEN = { ...FILLED, readyChip: 'True · KubeletReady', taintChip: 'none' };
// The runtime sublabel is stated by EVERY step, so no step inherits one from the build.
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
    // 2600, not 2900: the reveal is the whole motion, so the hold buys reading and 8.7 ms per
    // character is the pace `status` holds on the same card.
    duration: 2600,
    narration: 'A machine joins a cluster by running a Kubelet on it. With --register-node left at its default of true, the Kubelet registers itself with the API rather than waiting for an operator to create the object, which is how most distributions bring a Node in. Nothing in the cluster knows this machine yet.',
    chips: EMPTY,
    sublabels: { runtime: STARTING },
    // The frame stays dim: the machine is running and the cluster has no record of it.
    opacity: shades({ nodeEl: UNSEEN }),
    chain: 0,
    // Nothing travels yet, and the beat is the Kubelet coming up on a machine that has just booted.
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
    // The name only exists once the create lands, so the chip is wound back and filled on arrival.
    rewind: { chips: { nameChip: 'not registered' } },
    // The Kubelet self-initiates with nothing before it, so the ball waits BEAT.lead.
    flow: [
      F.route({ points: KUBELET_TO_API, delay: BEAT.lead, name: 'post', lights: ['api'] }),
      F.set({ at: 'post', chips: { nameChip: 'Node-1' } }),
      // The frame comes up to full on the same beat: the machine is now an object in the cluster.
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
    // The taint follows the condition rather than riding the same write, and it lands on the object
    // the write reaches, so both turn over on the one arrival.
    rewind: { chips: { readyChip: 'none', taintChip: 'none' } },
    flow: [
      F.route({ points: KUBELET_TO_API, delay: BEAT.lead, name: 'cond', lights: ['api'] }),
      F.set({ at: 'cond', chips: { readyChip: 'False · KubeletNotReady', taintChip: 'node.kubernetes.io/not-ready:NoSchedule' } }),
    ],
  },
  {
    id: 'ready',
    // Two hops, the second chained, plus the Pod fade and its pulse: span 3200.
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
      // Beat one: the runtime turns healthy, which is what the Kubelet has been waiting to report.
      F.reveal({ target: 'runtime', from: UNSEEN }),
      F.route({ points: KUBELET_TO_API, delay: BEAT.lead, name: 'ok', lights: ['api'] }),
      F.set({ at: 'ok', chips: { readyChip: 'True · KubeletReady', taintChip: 'none' } }),
      // Beat two: the first placement write takes effect on the Node, and the Pod materialises and
      // pulses together on its arrival rather than a beat behind it.
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
    // The same register the four API calls used, and the same string cluster-node-failure writes on
    // its own heartbeat lane, so the two cards caption one renewal the same way.
    wires: { call: 'PUT lease renewTime · every 10s' },
    sublabels: { runtime: READY },
    opacity: shades({ runtime: 1, firstPod: 1 }),
    chain: 5,
    flow: [F.route({ points: NODE_TO_LEASE, delay: BEAT.lead, lights: ['lease'] })],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
