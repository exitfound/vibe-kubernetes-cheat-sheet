import { P, F, defineCard, routeDur, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS/network-loadbalancer-without-cloud.md

// Two sources on the top row, the clients over a LOW router and the MetalLB controller over the fields
// it writes. Each Node reaches the router by its own lane pair, traffic down and announcements up.
const DIAGRAM_L = 80, DIAGRAM_R = 1120;  // content edges, mirrored about x 600

// Node row: three equal frames spanning DIAGRAM_L..DIAGRAM_R, each with a speaker chip and a Pod.
const NODE_W = 300, NODE_H = 188, NODE_Y = 436;                            // bottom mirrors the top
const NODE_GAP = (DIAGRAM_R - DIAGRAM_L - 3 * NODE_W) / 2;
const NODE_X = [0, 1, 2].map(i => DIAGRAM_L + i * (NODE_W + NODE_GAP));
const NODE_CX = NODE_X.map(x => x + NODE_W / 2);
const CHIP_W = 232, CHIP_H = 34;
const SPK_Y = NODE_Y + 34, SPK_H = CHIP_H;                               // the 34 label band over it
const POD_W = 200, POD_H = 96, POD_Y = SPK_Y + SPK_H + 12;                // 12 over the frame floor

// Actor tier, every block NET.L-01 232 wide and 80 tall.
const ACTOR_W = 232, ACTOR_H = 80;
const TOP_Y = 16;
const ROUTER_X = 600 - ACTOR_W / 2, ROUTER_Y = 300;                       // over the Node row
const ROUTER_R = ROUTER_X + ACTOR_W, ROUTER_B = ROUTER_Y + ACTOR_H;
const ROUTER_CY = ROUTER_Y + ACTOR_H / 2;
const CTRL_X = NODE_CX[2] - ACTOR_W / 2, CTRL_CX = NODE_CX[2];            // over Node-3
const CTRL_B = TOP_Y + ACTOR_H;
// What MetalLB holds for Service web hangs under the controller, loadBalancer first.
const SVC_Y = [0, 1, 2].map(i => CTRL_B + 40 + i * (CHIP_H + 10));

// Lane pairs (L-12) at the section half-gap of 12, the LANE_DY of every paired request and reply:
// FACE on the router side faces, TOP on the router bottom and on every Node top face.
const FACE = 12, TOP = 12;
const UPPER = ROUTER_CY - FACE, LOWER = ROUTER_CY + FACE;
const CTRL_WRITE = [[CTRL_CX, CTRL_B], [CTRL_CX, SVC_Y[0]]];
const C_LANE = [[600, TOP_Y + ACTOR_H], [600, ROUTER_Y]];
// Down legs enter each Node at NODE_CX - TOP, announcements leave at NODE_CX + TOP. The outer
// elbow runs on the upper rail and the inner one on the lower rail, so no two lanes cross.
const DOWN = [
  [[ROUTER_X, UPPER], [NODE_CX[0] - TOP, UPPER], [NODE_CX[0] - TOP, NODE_Y]],
  [[600 - TOP, ROUTER_B], [600 - TOP, NODE_Y]],
  [[ROUTER_R, LOWER], [NODE_CX[2] - TOP, LOWER], [NODE_CX[2] - TOP, NODE_Y]],
];
const UP = [
  [[NODE_CX[0] + TOP, NODE_Y], [NODE_CX[0] + TOP, LOWER], [ROUTER_X, LOWER]],
  [[600 + TOP, NODE_Y], [600 + TOP, ROUTER_B]],
  [[NODE_CX[2] + TOP, NODE_Y], [NODE_CX[2] + TOP, UPPER], [ROUTER_R, UPPER]],
];

// A tagged ball on a long leg rides near the catalog median speed so its tag is readable (M-12,
// PACING in motion.test). The short drops and the client lane keep routeDur.
const LEG_DUR = 1400;
// Every ball carries its tag from departure. A tag stands level beside a straight drop, and on an
// elbow it keeps to the side of the vertical no other lane runs on, clear of the rail pair: over the
// upper rail on the outer legs, under the lower rail where a leg runs on it.
const TAG_CHAR = 6.2;
const beside = (text, dir, dy) => ({ text, dx: dir * (10 + (text.length * TAG_CHAR) / 2), dy });
const onDrop = (text, dir) => beside(text, dir, 4);
const UNDER_LOWER = 16, OVER_UPPER = -8;
const UPDATE = 'BGP UPDATE';

const speaker = (i) => P.chip({
  key: `spk${i + 1}`, x: NODE_CX[i] - CHIP_W / 2, y: SPK_Y, w: CHIP_W, h: SPK_H, name: 'speaker', value: 'idle',
});
const pod = (i, ip) => P.pod({
  key: `pod${i + 1}`, innerKey: `pod${i + 1}Box`, x: NODE_CX[i] - POD_W / 2, y: POD_Y, w: POD_W, h: POD_H,
  label: 'Pod web', sublabel: ip, inner: { dx: 20, dy: 24, w: POD_W - 40, h: 44, label: 'app', sublabel: 'eth0' },
});

// The list order IS the append order, which is the z-order: Node frames, speakers and Pods in back,
// then the actor tier, then the lanes, then the chip column and the packets.
export const SCENE = {
  'aria-label': 'LoadBalancer without a cloud: the MetalLB controller allocates 203.0.113.9 from an IPAddressPool the operator declared and writes it into the Service status, then the MetalLB speakers on the Nodes announce it up to the upstream router before client traffic comes down. In layer 2 mode the speaker on the one Node that owns the address answers ARP, and when that Node fails the speaker on another Node takes over with gratuitous ARPs. In BGP mode every speaker advertises the address and the router hashes connections across all three Nodes over equal-cost routes',
  parts: [
    P.defs(),
    P.node({ key: 'node1', x: NODE_X[0], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'node2', x: NODE_X[1], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' }),
    P.node({ key: 'node3', x: NODE_X[2], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-3' }),
    // How the other speakers see a failed Node, on the frame label row, right-aligned inside the frame.
    P.wire({ key: 'n1state', x: NODE_X[0] + NODE_W - 12, y: NODE_Y + 18, anchor: 'end' }),
    speaker(0), speaker(1), speaker(2),
    pod(0, '10.244.1.5'), pod(1, '10.244.2.7'), pod(2, '10.244.3.9'),
    P.box({ key: 'client', x: ROUTER_X, y: TOP_Y, w: ACTOR_W, h: ACTOR_H, label: 'Clients', sublabel: 'internet' }),
    P.box({ key: 'ctrl', x: CTRL_X, y: TOP_Y, w: ACTOR_W, h: ACTOR_H, label: 'MetalLB controller', sublabel: 'allocates addresses' }),
    P.box({ key: 'router', x: ROUTER_X, y: ROUTER_Y, w: ACTOR_W, h: ACTOR_H, label: 'Upstream router', sublabel: 'no entry' }),
    P.arrow({ from: CTRL_WRITE[0], to: CTRL_WRITE[1], dashed: true, dim: true }),
    P.arrow({ from: C_LANE[0], to: C_LANE[1], dashed: true, dim: true }),
    P.lane({ points: DOWN[0], dashed: true, dim: true }),
    P.arrow({ from: DOWN[1][0], to: DOWN[1][1], dashed: true, dim: true }),
    P.lane({ points: DOWN[2], dashed: true, dim: true }),
    P.lane({ points: UP[0], dashed: true, dim: true }),
    P.arrow({ from: UP[1][0], to: UP[1][1], dashed: true, dim: true }),
    P.lane({ points: UP[2], dashed: true, dim: true }),
    P.tag({ x: CTRL_X, y: SVC_Y[0] - 10, text: 'for Service web', anchor: 'start' }),
    P.chip({ key: 'lbChip', x: CTRL_X, y: SVC_Y[0], w: CHIP_W, h: CHIP_H, name: 'loadBalancer', value: 'pending' }),
    P.chip({ key: 'poolChip', x: CTRL_X, y: SVC_Y[1], w: CHIP_W, h: CHIP_H, name: 'address pool', value: 'none' }),
    P.chip({ key: 'modeChip', x: CTRL_X, y: SVC_Y[2], w: CHIP_W, h: CHIP_H, name: 'announce mode', value: 'none' }),
    P.packets(),
  ],
  // The inner app boxes are keys, not pod groups: the pod-group list only resets inline pulse strokes.
  reset: {
    keys: ['client', 'ctrl', 'router', 'lbChip', 'poolChip', 'modeChip', 'spk1', 'spk2', 'spk3', 'pod1Box', 'pod2Box', 'pod3Box'],
    pods: ['pod1', 'pod2', 'pod3'],
  },
};

const LB_IP = '203.0.113.9', POOL = '203.0.113.0/24', CLIENT_DST = `dst ${LB_IP}`;
const AT_N1 = `${LB_IP} at Node-1`, AT_N2 = `${LB_IP} at Node-2`;
// The Service and the three speakers, stated whole on every step.
const fields = (lb, mode, s1, s2, s3) => ({ lbChip: lb, poolChip: POOL, modeChip: mode, spk1: s1, spk2: s2, spk3: s3 });
// Node-1 is the one that fails. Down, its frame, speaker and Pod stand at pending with the reason
// written on the frame, while every lane stays at full like every lane in the section.
const node1 = (down) => ({
  opacity: { node1: down ? OPACITY.pending : 1, spk1: down ? OPACITY.pending : 1, pod1: down ? OPACITY.pending : 1 },
  wires: { n1state: down ? 'unreachable' : '' },
});

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: fields('pending', 'none', 'idle', 'idle', 'idle'),
    sublabels: { router: 'no entry' },
    ...node1(false),
  },
  {
    id: 'pool',
    duration: 4200,
    narration: 'On bare metal no cloud provider implements load balancers, so a Service of type LoadBalancer stays pending. MetalLB does that job in-cluster. Its controller takes a free address from the IPAddressPool the operator declared, 203.0.113.0/24, and writes 203.0.113.9 into status.loadBalancer.ingress. No router knows where that address lives yet, so it is allocated but not reachable.',
    chips: fields(LB_IP, 'none', 'idle', 'idle', 'idle'),
    sublabels: { router: 'no entry' },
    ...node1(false),
    lit: ['ctrl', 'poolChip'],
    // status.loadBalancer exists only once the write lands, so it is wound back and turns over there.
    rewind: { chips: { lbChip: 'pending' } },
    flow: [
      F.segment({ from: CTRL_WRITE[0], to: CTRL_WRITE[1], delay: BEAT.lead, lights: ['lbChip'], name: 'alloc', tag: onDrop(LB_IP, 1) }),
      F.set({ at: 'alloc', chips: { lbChip: LB_IP } }),
    ],
  },
  {
    id: 'l2',
    duration: 6900,
    narration: 'In layer 2 mode every speaker sorts the eligible Nodes by a hash of Node and address, and the first Node owns 203.0.113.9. Only the speaker on Node-1 answers ARP for it, so the router sends every packet for the address to Node-1. From there kube-proxy, under the default Cluster policy, spreads connections across all ready Pods of the Service, this one to the local Pod. No router configuration is needed.',
    chips: fields(LB_IP, 'L2 (ARP)', 'answers ARP', 'idle', 'idle'),
    sublabels: { router: AT_N1 },
    ...node1(false),
    lit: ['spk1', 'client', 'modeChip'],
    // The animated path says the Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['pod1Box'],
    rewind: { sublabels: { router: 'no entry' } },
    flow: [
      F.route({ points: UP[0], delay: BEAT.lead, dur: LEG_DUR, name: 'arp', lights: ['router'], tag: beside('ARP reply', 1, UNDER_LOWER) }),
      F.set({ at: 'arp', sublabels: { router: AT_N1 } }),
      F.segment({ from: C_LANE[0], to: C_LANE[1], after: 'arp', name: 'inb', tag: onDrop(CLIENT_DST, 1) }),
      F.route({ points: DOWN[0], after: 'inb', dur: LEG_DUR, tag: beside(CLIENT_DST, -1, OVER_UPPER), pulse: 'pod1' }),
    ],
  },
  {
    id: 'failover',
    duration: 5500,
    narration: 'Node-1 fails. The other speakers detect it through memberlist and drop it from the candidates, so Node-2 comes first now and its speaker sends gratuitous ARPs for the router to rewrite its entry. Failover usually takes a few seconds, and connections that went through Node-1 are lost. Even with every Node healthy, one owner of the address limits the ingress bandwidth of the Service to that of a single Node.',
    chips: fields(LB_IP, 'L2 (ARP)', 'down', 'answers ARP', 'idle'),
    sublabels: { router: AT_N2 },
    ...node1(true),
    // The failed speaker is cued too (P-05): its chip turned to down, at pending like its Node.
    lit: ['spk1', 'spk2', 'client'],
    // The animated path says the Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['pod2Box'],
    // Until the gratuitous ARP lands the router still points at the Node that failed.
    rewind: { sublabels: { router: AT_N1 } },
    flow: [
      F.segment({ from: UP[1][0], to: UP[1][1], delay: BEAT.lead, name: 'garp', lights: ['router'], tag: onDrop('gratuitous ARP', 1) }),
      F.set({ at: 'garp', sublabels: { router: AT_N2 } }),
      F.segment({ from: C_LANE[0], to: C_LANE[1], after: 'garp', name: 'inb', tag: onDrop(CLIENT_DST, 1) }),
      F.segment({ from: DOWN[1][0], to: DOWN[1][1], after: 'inb', tag: onDrop(CLIENT_DST, -1), pulse: 'pod2' }),
    ],
  },
  {
    id: 'bgp',
    duration: 7300,
    narration: 'In BGP mode the speaker on every Node peers with the router and advertises 203.0.113.9, so a router with multipath on installs three equal-cost next hops for it and typically hashes each connection onto one Node. Incoming traffic spreads across Nodes, but router hashes are usually not stable: when a Node goes, most active connections are likely to break. Resilient ECMP helps, and the router has to speak BGP.',
    chips: fields(LB_IP, 'BGP (ECMP)', 'BGP session', 'BGP session', 'BGP session'),
    sublabels: { router: 'ECMP: 3 next hops' },
    ...node1(false),
    lit: ['spk1', 'spk2', 'spk3', 'client', 'modeChip'],
    // The animated path says each Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['pod1Box', 'pod2Box', 'pod3Box'],
    rewind: { sublabels: { router: 'no route' } },
    // The three UPDATEs land on one beat, the short Node-2 drop leaving late by the difference, so
    // the one light on the router is every arrival's cue.
    flow: [
      F.route({ points: UP[0], delay: BEAT.lead, dur: LEG_DUR, name: 'u1', lights: ['router'], tag: beside(UPDATE, 1, UNDER_LOWER) }),
      F.segment({ from: UP[1][0], to: UP[1][1], delay: BEAT.lead + LEG_DUR - routeDur(UP[1]), name: 'u2', tag: onDrop(UPDATE, 1) }),
      F.route({ points: UP[2], delay: BEAT.lead, dur: LEG_DUR, name: 'u3', tag: beside(UPDATE, 1, OVER_UPPER) }),
      F.set({ at: 'u3', sublabels: { router: 'ECMP: 3 next hops' } }),
      F.segment({ from: C_LANE[0], to: C_LANE[1], after: 'u3', name: 'inb1', tag: onDrop('conn 1', 1) }),
      F.route({ points: DOWN[0], after: 'inb1', dur: LEG_DUR, tag: beside('conn 1', -1, OVER_UPPER), pulse: 'pod1' }),
      F.segment({ from: C_LANE[0], to: C_LANE[1], after: 'u3', plus: 180, name: 'inb2', tag: onDrop('conn 2', 1) }),
      F.segment({ from: DOWN[1][0], to: DOWN[1][1], after: 'inb2', tag: onDrop('conn 2', -1), pulse: 'pod2' }),
      F.segment({ from: C_LANE[0], to: C_LANE[1], after: 'u3', plus: 360, name: 'inb3', tag: onDrop('conn 3', 1) }),
      F.route({ points: DOWN[2], after: 'inb3', dur: LEG_DUR, tag: beside('conn 3', -1, UNDER_LOWER), pulse: 'pod3' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
