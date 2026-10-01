import { P, F, defineCard, midX, strip, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS/network-pod-to-pod-cross-node.md


// The card is one mirrored pair: every block on the right is the reflection of its twin on the
// left about the canvas centre, so a Node, a dataplane or a Pod cannot be moved on one side
// alone. mirror() is what makes that a fact of the code rather than a promise in this comment.
const CX = 600;
const mirror = (x) => 2 * CX - x;

// The two Node frames. NODE_L and NODE_R are the outer edges the chip strip spans exactly.
// NODE_Y is a measured literal and not a derivation: the panel is deepest at 1100x800, reading
// 254.66 on `routed`, and both frames open left of x=420, so `L-03` pins this edge. The frame
// label prints at NODE_Y + 18 and inks from NODE_Y + 7, which clears that reading by 7.34.
const NODE_Y = 255, NODE_W = 470, NODE_H = 230;
const NODE1_X = 70, NODE2_X = mirror(NODE1_X + NODE_W);   // 70 / 660
const NODE_L = NODE1_X, NODE_R = NODE2_X + NODE_W;        // 70 / 1130

// The two CNI dataplanes. The underlay leaves and re-enters on their bottom EDGE, which is what
// keeps the ball out from under a box, and turns at each box centre.
const CNI_Y = 341, CNI_W = 150, CNI_H = 64;
const CNI1_L = 370, CNI2_L = mirror(CNI1_L + CNI_W);      // 370 / 680
const CNI2_R = CNI2_L + CNI_W;                            // 830: where the veth leaves cni2
const CNI_BOTTOM = CNI_Y + CNI_H;                         // 405
const CNI1_X = CNI1_L + CNI_W / 2;                        // 445: drop point
const CNI2_X = CNI2_L + CNI_W / 2;                        // 755: rise point, the mirror of 445

// The two Pods, each a translucent shell around its eth0 box, so pulsePod animates both rects.
const POD_Y = 315, POD_W = 180, POD_H = 120;
const PODA_X = 98, PODB_X = mirror(PODA_X + POD_W);       // 98 / 922
const PODA_R = PODA_X + POD_W;                            // 278: where the veth leaves Pod A
const POD_INNER = { dx: 20, dy: 30, w: POD_W - 40, h: 56, label: 'app', sublabel: 'eth0' };

// The veth links and the short packets on them share this y, so both Nodes read as one row, and
// the underlay leg hangs at UNDERLAY_Y below the frames. Each leg is ONE array feeding both the
// static wire and the ball that rides it, so the two cannot drift apart (A-02).
const VETH_Y = 373;
const UNDERLAY_Y = 530;                                   // physical underlay between the two Node IPs
const VETH_A = [[PODA_R, VETH_Y], [CNI1_L, VETH_Y]];      // Pod A -> cni1
const VETH_B = [[CNI2_R, VETH_Y], [PODB_X, VETH_Y]];      // cni2  -> Pod B
const UNDERLAY_PATH = [[CNI1_X, CNI_BOTTOM], [CNI1_X, UNDERLAY_Y], [CNI2_X, UNDERLAY_Y], [CNI2_X, CNI_BOTTOM]];

// Four equal chips spanning the Node frames edge to edge, so the strip and the picture share
// both outer verticals. strip fixes the gap and derives the width: 1060 less three 20s over 4.
const CHIP_Y = 573, CHIP_H = 34;
const CHIPS = strip({ from: NODE_L, to: NODE_R, count: 4, gap: 20 });   // w 250, x 70/340/610/880

// The list order IS the append order, which is the z-order: Node frames, then the dataplane boxes
// and the Pods, then the wires and their labels, then the chip strip, and finally the packet layer.
export const SCENE = {
  'aria-label': 'Pod-to-Pod traffic across Nodes: the source Node routes the off-subnet packet to its CNI dataplane, which in overlay mode wraps it in VXLAN over UDP and ships it across the physical underlay to the remote Node, whose kernel decapsulates and bridges it into the local Pod. A routed BGP mode is shown as the no-encapsulation alternative',
  parts: [
    P.defs(),
    P.node({ key: 'node1', x: NODE1_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1   ·   10.244.1.0/24' }),
    P.node({ key: 'node2', x: NODE2_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2   ·   10.244.2.0/24' }),
    // The block is the node CNI DATAPLANE and not the cni0 bridge: `cni0` is the L2 bridge the
    // bridge plugin creates for containers on one host, and a bridge neither encapsulates nor
    // reaches another Node. What wraps the frame is the kernel overlay device the plugin adds
    // beside it, and in routed mode nothing wraps it at all, so one box carries both.
    P.box({ key: 'cni1', x: CNI1_L, y: CNI_Y, w: CNI_W, h: CNI_H, label: 'CNI dataplane', sublabel: 'Node-1' }),
    P.box({ key: 'cni2', x: CNI2_L, y: CNI_Y, w: CNI_W, h: CNI_H, label: 'CNI dataplane', sublabel: 'Node-2' }),
    P.pod({
      key: 'podA', innerKey: 'podABox', x: PODA_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod A', sublabel: '10.244.1.5', inner: POD_INNER,
    }),
    P.pod({
      key: 'podB', innerKey: 'podBBox', x: PODB_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod B', sublabel: '10.244.2.7', inner: POD_INNER,
    }),
    // veth links inside each node (dim dashed): A -> cni1 on the left, cni2 -> B on the right.
    P.arrow({ from: VETH_A[0], to: VETH_A[1], dashed: true, dim: true }),
    P.arrow({ from: VETH_B[0], to: VETH_B[1], dashed: true, dim: true }),
    // The dataplane-to-dataplane link is ONE continuous turning arrow that drops to the underlay,
    // runs across, and rises into the remote box. The packet rides this same UNDERLAY_PATH.
    P.lane({ points: UNDERLAY_PATH, dashed: true, dim: true }),
    P.tag({ x: CX, y: UNDERLAY_Y - 14, text: 'physical network' }),
    P.wire({ key: 'va', x: midX(PODA_R, CNI1_L), y: VETH_Y - 12 }),   // 324
    P.wire({ key: 'vb', x: midX(CNI2_R, PODB_X), y: VETH_Y - 12 }),   // 876
    P.wire({ key: 'encap', x: CX, y: UNDERLAY_Y + 22 }),
    P.chip({ key: 'innerChip', x: CHIPS.x(0), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'inner src/dst', value: '.1.5 -> .2.7' }),
    P.chip({ key: 'outerChip', x: CHIPS.x(1), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'outer', value: 'none' }),
    P.chip({ key: 'encapChip', x: CHIPS.x(2), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'encap', value: 'none' }),
    P.chip({ key: 'modeChip', x: CHIPS.x(3), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'mode', value: 'overlay' }),
    P.packets(),
  ],
  // The two inner Pod boxes belong in the KEY list, not in the pod list: a pod group only has its
  // inline pulse strokes reset, so a .highlight put on a container would never come off again.
  reset: {
    keys: ['cni1', 'cni2', 'podABox', 'podBBox', 'innerChip', 'outerChip', 'encapChip', 'modeChip'],
    pods: ['podA', 'podB'],
  },
};

// The two veth lanes are drawn on every step, so both name themselves on every step: a lane
// labelled on two steps of five reads as a lane that stops being a veth on the other three.
const VETH = 'veth · eth0';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { innerChip: '.1.5 -> .2.7', outerChip: 'none', encapChip: 'none', modeChip: 'overlay' },
    wires: { va: VETH, vb: VETH },
  },
  {
    id: 'route',
    duration: 2900,
    narration: 'Pod A sends to 10.244.2.7 out its eth0. The frame rides the veth into the Node-1 network stack, which consults its routing table. The destination is not in the local Pod subnet, so the route hands the frame to the CNI dataplane that carries off-Node traffic instead of to a local Pod.',
    chips: { innerChip: '.1.5 -> .2.7', outerChip: 'none', encapChip: 'none', modeChip: 'overlay' },
    wires: { va: VETH, vb: VETH },
    // No chip is cued: nothing the strip reports has moved yet. The frame is still bare, which is
    // what `outer` and `encap` both reading none already say from the poster.
    lit: [],
    // The animated path says Pod A sent by PULSING it, which no lights list can name.
    reducedLit: ['podABox'],
    // Up-arrow: A pulses FIRST, the packet leaves only after the blink lands (BEAT.afterPulse)
    // and hops the veth to cni1, which lights on arrival.
    flow: [
      F.pulse({ pod: 'podA' }),
      F.segment({ from: VETH_A[0], to: VETH_A[1], delay: BEAT.afterPulse, lights: ['cni1'] }),
    ],
  },
  {
    id: 'encap',
    duration: 3200,
    narration: 'In overlay mode the CNI dataplane wraps the original frame inside a VXLAN header carried over UDP to the Node-2 address. The outer headers are Node IPs the physical network already knows how to route, dport 8472 for flannel, while the inner Pod IPs ride untouched. The wrapped packet crosses the underlay to Node-2.',
    chips: { innerChip: '.1.5 -> .2.7', outerChip: 'Node-1 -> Node-2', encapChip: 'VXLAN/UDP 8472', modeChip: 'overlay' },
    wires: { va: VETH, vb: VETH, encap: 'VXLAN over UDP · dport 8472' },
    // The overlay device acts, infra stays lit and never pulses. The two chips the wrap writes are
    // cued and `inner src/dst` is not: it reports the one thing the wrap leaves alone.
    lit: ['cni1', 'outerChip', 'encapChip'],
    // The wrapped packet glides as ONE continuous motion: cni1 -> down -> across -> up to cni2,
    // which lights on arrival.
    flow: [
      F.route({ points: UNDERLAY_PATH, lights: ['cni2'] }),
    ],
  },
  {
    id: 'decap',
    duration: 2400,
    narration: 'Node-2 receives the UDP packet on the VXLAN port and its kernel strips the outer headers. The bare inner frame, still addressed to 10.244.2.7, is bridged out of the local dataplane and over the veth into Pod B, the same last hop a same-node frame takes.',
    chips: { innerChip: '.1.5 -> .2.7', outerChip: 'stripped', encapChip: 'none', modeChip: 'overlay' },
    wires: { va: VETH, vb: VETH, encap: 'decap · inner frame restored' },
    // The two chips the decap turns over are the two it cues. `inner src/dst` reads the same
    // string it has read since the poster, which is the point, so it takes no cue (P-09a).
    lit: ['cni2', 'outerChip', 'encapChip'],
    // The animated path says Pod B was served by PULSING it, which no lights list can name.
    reducedLit: ['podBBox'],
    // Down-arrow: the decapsulated inner frame leaves cni2 and hops the veth into Pod B,
    // which pulses on arrival (the receiver).
    flow: [
      F.segment({ from: VETH_B[0], to: VETH_B[1], name: 'into' }),
      F.pulse({ pod: 'podB', at: 'into' }),
    ],
  },
  {
    id: 'routed',
    duration: 4700,
    narration: 'Not every CNI encapsulates. A routed plugin such as Calico with BGP advertises the Pod subnet of each Node to the network, so the packet crosses the underlay carrying its real Pod IPs with no outer headers at all. It travels Pod A to Pod B in one routed path. This drops the encapsulation cost and the MTU overhead, at the price of the network having to carry Pod routes.',
    chips: { innerChip: '.1.5 -> .2.7', outerChip: 'none', encapChip: 'none', modeChip: 'routed · BGP' },
    wires: { va: VETH, vb: VETH, encap: 'routed · no outer headers' },
    // Both dataplanes are on the path and never pulse, but each is a receiver before it forwards,
    // so both light on arrival below and the pair reads as a route rather than as a lit corridor.
    // `outer` returns to none and is cued, because none here is a different fact from the
    // `stripped` before it: no wrap was ever made. `encap` read none already and takes no cue.
    lit: ['outerChip', 'modeChip'],
    // Both Pods are pulsed by the animated path, which no lights list can name.
    reducedLit: ['podABox', 'podBBox'],
    // Pod A -> cni1 (veth), cni1 -> underlay -> cni2, then cni2 -> Pod B (veth).
    flow: [
      F.pulse({ pod: 'podA' }),
      F.segment({ from: VETH_A[0], to: VETH_A[1], delay: BEAT.afterPulse, name: 'h1', lights: ['cni1'] }),
      F.route({ points: UNDERLAY_PATH, after: 'h1', name: 'h2', lights: ['cni2'] }),
      F.segment({ from: VETH_B[0], to: VETH_B[1], after: 'h2', name: 'h3' }),
      F.pulse({ pod: 'podB', at: 'h3' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
