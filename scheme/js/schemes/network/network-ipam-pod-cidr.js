import { P, F, defineCard } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-ipam-pod-cidr


// Geometry. Panel measured 2026-07-27: right <= 397, bottom <= 255. The three Node frames span
// 80..1120 and are centred on the canvas, the control-plane column stands on their common centre.
const NODE_Y = 312, NODE_W = 300, NODE_H = 290;
const NODE_X = [80, 450, 820];
const NODE_CX = NODE_X.map(x => x + NODE_W / 2);            // 230, 600, 970
const SPINE_X = NODE_CX[1];                                 // 600: controller column and Node-2 drop

const CFG_X = 460, CFG_W = 280, CFG_Y = 44, CFG_H = 64;     // the cluster pod CIDR pool
const KCM_Y = 150, KCM_H = 72;
const KCM_BOTTOM = KCM_Y + KCM_H;                           // 222: where every allocation leaves

const SLICE_W = 260, SLICE_H = 34, SLICE_Y = 350;
const SLICE_X = NODE_X.map(x => x + (NODE_W - SLICE_W) / 2);// 100, 470, 840
const SLICE_BOTTOM = SLICE_Y + SLICE_H;                     // 384: where the IPAM hands an IP down

const POD_Y = 442, POD_W = 200, POD_H = 130;
const POD_X = NODE_CX.map(cx => cx - POD_W / 2);            // 130, 500, 870

const BRANCH_Y = 264;                                       // the bus the flanking allocations turn on
// controller -> a Node slice: straight down the spine for Node-2, down and out along the bus for the
// flanking two. Wire and ball come from the same array.
const allocTo = (cx) => [[SPINE_X, KCM_BOTTOM], [SPINE_X, BRANCH_Y], [cx, BRANCH_Y], [cx, SLICE_Y]];
const ALLOC1 = allocTo(NODE_CX[0]);
const ALLOC3 = allocTo(NODE_CX[2]);
const ALLOC2 = [[SPINE_X, KCM_BOTTOM], [SPINE_X, SLICE_Y]];        // Node-2 sits on the spine
const CFG_DROP = [[SPINE_X, CFG_Y + CFG_H], [SPINE_X, KCM_Y]];     // the pool the controller reads
const IPAM1 = [[NODE_CX[0], SLICE_BOTTOM], [NODE_CX[0], POD_Y]];   // Node-1 IPAM -> its Pod
const IPAM2 = [[SPINE_X, SLICE_BOTTOM], [SPINE_X, POD_Y]];         // Node-2 IPAM -> its Pod

// The three allocation balls share ONE travel time so they land together: routeDur is length-based
// and would land the short centre path first.
const dur = 1100;

// The six wires predate the kit binding and carry NO role, so the arrowhead stays the neutral dim
// one. Omitting `role: ''` here would stamp the category role and swap the marker.
const WIRE = { dashed: true, dim: true, role: '' };

// A Pod that comes into existence mid-card: born hidden, revealed by its own 350ms fade.
const REVEAL = { keyframes: [{ opacity: 0 }, { opacity: 1 }], options: { duration: 350, fill: 'forwards', easing: 'ease-out' } };

// One Pod: a translucent shell wrapping an eth0 container box, grouped so the pulse animates both
// rects together.
const POD = {
  w: POD_W, h: POD_H, label: 'Pod', sublabel: 'IP pending',
  inner: { dx: 20, dy: 37, w: POD_W - 40, h: 56, label: 'app', sublabel: 'eth0' },
};

// The list order IS the append order, which is the z-order: Node frames, their slice chips and their
// Pods, then the control-plane column, then the dim wires above the blocks, then the packets.
export const SCENE = {
  'aria-label': 'IPAM and Pod CIDR allocation: the controller-manager carves a non-overlapping slice of the cluster pod CIDR for each Node, and every Pod IP on a Node is drawn by the CNI IPAM out of that slice',
  parts: [
    P.defs(),
    P.node({ key: 'node1', x: NODE_X[0], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'node2', x: NODE_X[1], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' }),
    P.node({ key: 'node3', x: NODE_X[2], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-3' }),
    P.chip({ key: 'slice1', x: SLICE_X[0], y: SLICE_Y, w: SLICE_W, h: SLICE_H, name: 'node.spec.podCIDR', value: 'pending' }),
    P.chip({ key: 'slice2', x: SLICE_X[1], y: SLICE_Y, w: SLICE_W, h: SLICE_H, name: 'node.spec.podCIDR', value: 'pending' }),
    P.chip({ key: 'slice3', x: SLICE_X[2], y: SLICE_Y, w: SLICE_W, h: SLICE_H, name: 'node.spec.podCIDR', value: 'pending' }),
    P.pod({ key: 'podA', innerKey: 'podABox', x: POD_X[0], y: POD_Y, ...POD }),
    // The Node-2 pod proves uniqueness on the final step, so it stays hidden until then.
    P.pod({ key: 'podB', innerKey: 'podBBox', x: POD_X[1], y: POD_Y, ...POD, opacity: 0 }),
    P.box({ key: 'clusterBox', x: CFG_X, y: CFG_Y, w: CFG_W, h: CFG_H, label: 'Cluster Pod CIDR', sublabel: '10.244.0.0/16' }),
    P.box({ key: 'kcm', x: CFG_X, y: KCM_Y, w: CFG_W, h: KCM_H, label: 'controller-manager' }),
    P.arrow({ from: CFG_DROP[0], to: CFG_DROP[1], ...WIRE }),
    P.lane({ points: ALLOC1, ...WIRE }),
    P.arrow({ from: ALLOC2[0], to: ALLOC2[1], ...WIRE }),
    P.lane({ points: ALLOC3, ...WIRE }),
    P.arrow({ from: IPAM1[0], to: IPAM1[1], ...WIRE }),
    P.arrow({ key: 'ipam2Arrow', from: IPAM2[0], to: IPAM2[1], ...WIRE, opacity: 0 }),
    P.packets(),
  ],
  reset: {
    keys: ['clusterBox', 'kcm', 'slice1', 'slice2', 'slice3', 'podABox', 'podBBox'],
    pods: ['podA', 'podB'],
  },
};

// The three slices are one fact per step, so one object states all three and no step can leave a
// stale block behind on a Node it is not talking about.
const PENDING = { slice1: 'pending', slice2: 'pending', slice3: 'pending' };
const CARVED = { slice1: '10.244.1.0/24', slice2: '10.244.2.0/24', slice3: '10.244.3.0/24' };
// The Node-2 Pod and its IPAM arrow are revealed only on the final uniqueness step.
const LATER_HIDDEN = { podB: 0, ipam2Arrow: 0 };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: PENDING,
    podSublabels: { podA: 'IP pending' },
    opacity: LATER_HIDDEN,
  },
  {
    id: 'cluster-cidr',
    duration: 2000,
    narration: 'The cluster pod CIDR is configured once, on the controller-manager, with the --cluster-cidr flag. It is the single pool every Pod IP in the cluster will eventually come from, and on its own it belongs to no Node yet.',
    chips: PENDING,
    podSublabels: { podA: 'IP pending' },
    opacity: LATER_HIDDEN,
    lit: ['clusterBox'],
    // The pool registers into the controller-manager, which lights when the drop lands on it.
    flow: [
      F.segment({ from: CFG_DROP[0], to: CFG_DROP[1], dur: 450, lights: ['kcm'] }),
    ],
  },
  {
    id: 'allocate',
    duration: 2600,
    narration: 'With --allocate-node-cidrs set, the controller-manager carves a smaller, non-overlapping block out of the pool for every Node and writes it into node.spec.podCIDR. Here each Node gets its own /24, so Node-1 owns 10.244.1.0/24, Node-2 owns 10.244.2.0/24 and Node-3 owns 10.244.3.0/24.',
    chips: CARVED,
    podSublabels: { podA: 'IP pending' },
    opacity: LATER_HIDDEN,
    lit: ['kcm', 'slice1', 'slice2', 'slice3'],
    // The three slices hold `pending` until the allocations land, or the carve arrives at chips
    // already showing its result.
    rewind: { chips: PENDING },
    flow: [
      F.route({ points: ALLOC2, dur, fadeIn: true, name: 'a2' }),
      F.route({ points: ALLOC1, dur, fadeIn: true }),
      F.route({ points: ALLOC3, dur, fadeIn: true }),
      F.set({ at: 'a2', chips: CARVED }),
    ],
  },
  {
    id: 'ipam',
    duration: 2400,
    narration: 'When a Pod is scheduled to Node-1, its address is drawn by the CNI IPAM strictly out of that Node slice, 10.244.1.0/24, so the Pod gets 10.244.1.5. Allocation never reaches outside the block a Node owns, which is exactly what stops two Nodes from colliding.',
    chips: CARVED,
    podSublabels: { podA: 'IP 10.244.1.5' },
    opacity: LATER_HIDDEN,
    lit: ['slice1'],
    // The animated path says the Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['podABox'],
    // IPAM hands an address from the slice down to the Pod (packet first, then the Pod pulses on
    // arrival: it is the receiver, so no blink-first here).
    flow: [
      F.segment({ from: IPAM1[0], to: IPAM1[1], dur: 550, name: 'give' }),
      F.pulse({ pod: 'podA', at: 'give' }),
    ],
  },
  {
    id: 'unique',
    duration: 2600,
    narration: 'Every other Node assigns the same way, out of its own slice. A Pod scheduled to Node-2 gets 10.244.2.8 from 10.244.2.0/24, a different /24 that can never overlap the addresses on Node-1. So every Pod IP is unique across the whole cluster, which is what lets any Pod be reached directly while routing only has to track which Node owns which /24.',
    chips: CARVED,
    podSublabels: { podA: 'IP 10.244.1.5', podB: 'IP 10.244.2.8' },
    // The Node-2 Pod and its arrow end the step present, which is what the static path shows. The
    // animated path winds them back to hidden so their own fades can bring them in.
    opacity: { podB: 1, ipam2Arrow: 1 },
    lit: ['slice1', 'slice2', 'slice3'],
    // The animated path says the second Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['podBBox'],
    rewind: { opacity: LATER_HIDDEN },
    // After the pod appears, Node-2 IPAM hands its address down (packet first, then the pod pulses
    // on arrival, the receiver).
    flow: [
      F.anim({ target: 'podB', ...REVEAL }),
      F.anim({ target: 'ipam2Arrow', ...REVEAL }),
      F.segment({ from: IPAM2[0], to: IPAM2[1], delay: 420, dur: 550, name: 'give' }),
      F.pulse({ pod: 'podB', at: 'give' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
