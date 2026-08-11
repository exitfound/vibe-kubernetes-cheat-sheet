import { P, F, defineCard, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-pod-to-pod-cross-node


const VETH_Y = 338;       // veth links inside each node + the short packets on them
const CNI_BOTTOM = 370;   // bottom edge of each cni0 box, where the underlay path drops/rises
const UNDERLAY_Y = 495;   // physical underlay segment between the two Node IPs
const CNI1_X = 445;       // cni1 horizontal centre (drop point)
const CNI2_X = 755;       // cni2 horizontal centre (rise point), symmetric about x=600

const UNDERLAY_PATH = [[CNI1_X, CNI_BOTTOM], [CNI1_X, UNDERLAY_Y], [CNI2_X, UNDERLAY_Y], [CNI2_X, CNI_BOTTOM]];

// The list order IS the append order, which is the z-order: Node frames, then the cni0 boxes and
// the Pods, then the wires and their labels, then the chip strip, and finally the packet layer.
export const SCENE = {
  'aria-label': 'Pod-to-Pod traffic across Nodes: the source Node routes the off-subnet packet to its CNI dataplane, which in overlay mode wraps it in VXLAN over UDP and ships it across the physical underlay to the remote Node, whose kernel decapsulates and bridges it into the local Pod. A routed BGP mode is shown as the no-encapsulation alternative',
  parts: [
    P.defs(),
    P.node({ key: 'node1', x: 70, y: 220, w: 470, h: 230, label: 'Node-1   ·   10.244.1.0/24' }),
    P.node({ key: 'node2', x: 660, y: 220, w: 470, h: 230, label: 'Node-2   ·   10.244.2.0/24' }),
    P.box({ key: 'cni1', x: 370, y: 306, w: 150, h: 64, label: 'cni0', sublabel: 'Node-1 dataplane' }),
    P.box({ key: 'cni2', x: 680, y: 306, w: 150, h: 64, label: 'cni0', sublabel: 'Node-2 dataplane' }),
    // Each Pod is a translucent shell wrapping its eth0 container box, so pulsePod animates both rects.
    P.pod({
      key: 'podA', innerKey: 'podABox', x: 98, y: 280, w: 180, h: 120,
      label: 'Pod A', sublabel: '10.244.1.5',
      inner: { dx: 20, dy: 30, w: 140, h: 56, label: 'app', sublabel: 'eth0' },
    }),
    P.pod({
      key: 'podB', innerKey: 'podBBox', x: 922, y: 280, w: 180, h: 120,
      label: 'Pod B', sublabel: '10.244.2.7',
      inner: { dx: 20, dy: 30, w: 140, h: 56, label: 'app', sublabel: 'eth0' },
    }),
    // veth links inside each node (dim dashed): A -> cni1 on the left, cni2 -> B on the right.
    P.arrow({ from: [278, VETH_Y], to: [370, VETH_Y], dashed: true, dim: true }),
    P.arrow({ from: [830, VETH_Y], to: [922, VETH_Y], dashed: true, dim: true }),
    // The cni0-to-cni0 link is ONE continuous turning arrow that drops to the underlay, runs
    // across, and rises into the remote cni0. The packet rides this same UNDERLAY_PATH.
    P.lane({ points: UNDERLAY_PATH, dashed: true, dim: true }),
    P.tag({ x: 600, y: UNDERLAY_Y - 14, text: 'physical network' }),
    P.wire({ key: 'va', x: 324, y: VETH_Y - 12 }),
    P.wire({ key: 'vb', x: 876, y: VETH_Y - 12 }),
    P.wire({ key: 'encap', x: 600, y: UNDERLAY_Y + 22 }),
    // Chip strip: first chip left edge == Node-1 left (x70), last chip right edge == Node-2 right
    // (x1130). Four equal chips of 250 with 20px gaps span the full 1060 between the node edges.
    P.chip({ key: 'innerChip', x: 70, y: 538, w: 250, h: 34, name: 'inner src/dst', value: '.1.5 -> .2.7' }),
    P.chip({ key: 'outerChip', x: 340, y: 538, w: 250, h: 34, name: 'outer', value: 'node IPs' }),
    P.chip({ key: 'encapChip', x: 610, y: 538, w: 250, h: 34, name: 'encap', value: 'none' }),
    P.chip({ key: 'modeChip', x: 880, y: 538, w: 250, h: 34, name: 'mode', value: 'overlay' }),
    P.packets(),
  ],
  // The two inner Pod boxes belong in the KEY list, not in the pod list: a pod group only has its
  // inline pulse strokes reset, so a .highlight put on a container would never come off again.
  reset: {
    keys: ['cni1', 'cni2', 'podABox', 'podBBox', 'innerChip', 'outerChip', 'encapChip', 'modeChip'],
    pods: ['podA', 'podB'],
  },
};

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { innerChip: '.1.5 -> .2.7', outerChip: 'node IPs', encapChip: 'none', modeChip: 'overlay' },
  },
  {
    id: 'route',
    duration: 2200,
    narration: 'Pod A sends to 10.244.2.7 out its eth0. The frame rides the veth into the Node-1 network stack, which consults its routing table. The destination is not in the local Pod subnet, so the route points at the CNI dataplane that handles off-Node traffic rather than the local bridge path.',
    chips: { innerChip: '.1.5 -> .2.7', outerChip: 'node IPs', encapChip: 'none', modeChip: 'overlay' },
    wires: { va: 'veth · eth0' },
    lit: ['innerChip'],
    // The animated path says Pod A sent by PULSING it, which no lights list can name.
    reducedLit: ['podABox'],
    // Up-arrow: A pulses FIRST, the packet leaves only after the blink lands (BEAT.afterPulse)
    // and hops the veth to cni1, which lights on arrival.
    flow: [
      F.pulse({ pod: 'podA' }),
      F.segment({ from: [278, VETH_Y], to: [370, VETH_Y], delay: BEAT.afterPulse, lights: ['cni1'] }),
    ],
  },
  {
    id: 'encap',
    duration: 2600,
    narration: 'In overlay mode the CNI dataplane wraps the original frame inside a VXLAN header carried over UDP to the Node-2 address. The outer headers are Node IPs the physical network already knows how to route, dport 8472 for flannel, while the inner Pod IPs ride untouched. The wrapped packet crosses the underlay to Node-2.',
    chips: { innerChip: '.1.5 -> .2.7', outerChip: 'node1 -> node2', encapChip: 'VXLAN/UDP 8472', modeChip: 'overlay' },
    wires: { encap: 'VXLAN over UDP · dport 8472' },
    // The overlay device acts, infra stays lit and never pulses.
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
    narration: 'Node-2 receives the UDP packet on the VXLAN port and its kernel strips the outer headers. The bare inner frame, still addressed to 10.244.2.7, is bridged across the local cni0 and out the veth into Pod B, exactly as a same-node frame would be delivered.',
    chips: { innerChip: '.1.5 -> .2.7', outerChip: 'node1 -> node2', encapChip: 'VXLAN/UDP 8472', modeChip: 'overlay' },
    wires: { vb: 'veth · eth0', encap: 'decap · inner frame restored' },
    lit: ['cni2', 'innerChip'],
    // The animated path says Pod B was served by PULSING it, which no lights list can name.
    reducedLit: ['podBBox'],
    // Down-arrow: the decapsulated inner frame leaves cni2 and hops the veth into Pod B,
    // which pulses on arrival (the receiver).
    flow: [
      F.segment({ from: [830, VETH_Y], to: [922, VETH_Y], name: 'into' }),
      F.pulse({ pod: 'podB', at: 'into' }),
    ],
  },
  {
    id: 'routed',
    duration: 4700,
    narration: 'Not every CNI encapsulates. A routed plugin such as Calico with BGP advertises each Node Pod subnet to the network, so the packet crosses the underlay carrying its real Pod IPs with no outer headers at all. It travels Pod A to Pod B in one routed path. This drops the encapsulation cost and the MTU overhead, at the price of the network having to carry Pod routes.',
    chips: { innerChip: '.1.5 -> .2.7', outerChip: 'pod IPs routed', encapChip: 'none', modeChip: 'routed · BGP' },
    wires: { va: 'veth', vb: 'veth', encap: 'routed · no outer headers' },
    // Both dataplanes are on the path and never pulse, but each is a receiver before it forwards,
    // so both light on arrival below and the pair reads as a route rather than as a lit corridor.
    lit: ['outerChip', 'encapChip', 'modeChip'],
    // Both Pods are pulsed by the animated path, which no lights list can name.
    reducedLit: ['podABox', 'podBBox'],
    // Pod A -> cni1 (veth), cni1 -> underlay -> cni2, then cni2 -> Pod B (veth).
    flow: [
      F.pulse({ pod: 'podA' }),
      F.segment({ from: [278, VETH_Y], to: [370, VETH_Y], delay: BEAT.afterPulse, name: 'h1', lights: ['cni1'] }),
      F.route({ points: UNDERLAY_PATH, after: 'h1', name: 'h2', lights: ['cni2'] }),
      F.segment({ from: [830, VETH_Y], to: [922, VETH_Y], after: 'h2', name: 'h3' }),
      F.pulse({ pod: 'podB', at: 'h3' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
