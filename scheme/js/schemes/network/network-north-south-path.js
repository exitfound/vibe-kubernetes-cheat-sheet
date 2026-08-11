import { P, F, defineCard, makeRidingLabel, laneY, strip, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-north-south-path


const FLOW_Y = 356;                 // spine: client, cloud LB, kube-proxy and the Pod are centred on it
const LANE_DY = 20;                 // half-gap between the forward and return lanes
const { out: FWD_Y, back: RET_Y } = laneY(FLOW_Y, LANE_DY);   // 336 request lane above, 376 reply lane below

const CLIENT_X = 40, CLIENT_W = 170, CLIENT_H = 74;
const CLIENT_RIGHT = CLIENT_X + CLIENT_W;      // 210
const LB_X = 290, LB_W = 180, LB_H = 74;
const LB_RIGHT = LB_X + LB_W;                  // 470

const REGION_TOP = 264, REGION_BOT = 488;
const REGION_H = REGION_BOT - REGION_TOP;      // 224
const EXT_X = 22, EXT_W = 470;                 // outside-the-cluster region: 22..492, wraps client + LB
const EXT_RIGHT = EXT_X + EXT_W;               // 492

const NODE_X = 540, NODE_W = 636;              // Node region: 540..1176, wraps kube-proxy, conntrack, Pod
const KP_X = 580, KP_W = 210, KP_H = 80;
const KP_RIGHT = KP_X + KP_W;                  // 790
const KP_CX = KP_X + KP_W / 2;                 // 685
const KP_BOTTOM = FLOW_Y + KP_H / 2;           // 396
const POD_X = 930, POD_W = 210, POD_H = 100;
const CT_X = 580, CT_Y = 418, CT_W = 560, CT_H = 54;            // conntrack table, under kube-proxy
const CT_CX = CT_X + CT_W / 2;                 // 860: where the ownership marker meets the table
// Ownership marker: kube-proxy bottom-centre, a step across the gap between the rows, then down onto
// the conntrack table's own top-edge centre. Both ends sit on a face midpoint.
const CT_LINK = [[KP_CX, KP_BOTTOM], [KP_CX, (KP_BOTTOM + CT_Y) / 2], [CT_CX, (KP_BOTTOM + CT_Y) / 2], [CT_CX, CT_Y]];

const CHIP_Y = 500;

// Info-chip strip: four equal-width cells with equal gaps, spanning the full framed width (outside
// region left edge .. Node region right edge). Equal size + equal gap keeps the row symmetric.
const CHIP_STRIP_X = EXT_X;                                             // 22
const CHIP_STRIP_RIGHT = NODE_X + NODE_W;                              // 1176
const CHIP_GAP = 22;
const CHIP_H = 34;
const { w: CHIP_W, x: chipX } = strip({ from: CHIP_STRIP_X, to: CHIP_STRIP_RIGHT, count: 4, gap: CHIP_GAP });   // 272 each

// Each static wire and the ball that rides it share the same endpoints. Forward lane runs left to
// right, return lane right to left, and every arrowhead points the way its ball travels.
const C2LB = [[CLIENT_RIGHT, FWD_Y], [LB_X, FWD_Y]];
const LB2KP = [[LB_RIGHT, FWD_Y], [KP_X, FWD_Y]];               // the hop that crosses the gap
const KP2POD = [[KP_RIGHT, FWD_Y], [POD_X, FWD_Y]];
const POD2KP = [[POD_X, RET_Y], [KP_RIGHT, RET_Y]];
const KP2LB = [[KP_X, RET_Y], [LB_RIGHT, RET_Y]];               // crosses the gap on the way back
const LB2C = [[LB_X, RET_Y], [CLIENT_RIGHT, RET_Y]];

// The tag that rides a ball here. Every ball on this card is a linear segmentPacket, so the tag
// rides LINEAR too: the eased default drifts up to 11 units ahead of its ball mid-flight.
const ridingLabel = makeRidingLabel({ role: 'network', easing: 'linear' });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });

// The list order IS the append order, which is the z-order: the two framing regions in back, then
// the blocks, then wires + labels above them, then chips, then the packet layer with its tags on top.
export const SCENE = {
  'aria-label': 'North-south request path: an external client reaches a cloud load balancer at its public IP, the load balancer crosses the cluster boundary and forwards to a Node on the Service NodePort, kube-proxy rules DNAT the packet to a backing Pod IP while conntrack pins the flow, the Pod serves the request, and the reply travels a separate return lane where conntrack unwinds every rewrite so the client sees an answer from the public IP it dialed',
  parts: [
    P.defs(),
    P.node({ x: EXT_X, y: REGION_TOP, w: EXT_W, h: REGION_H, label: '' }),
    // The outside region is titled by a right-anchored caption instead of node()'s own top-left
    // label, so the narration overlay never hides it.
    P.tag({ cls: 'scheme-node-label', x: EXT_RIGHT - 12, y: REGION_TOP + 18, anchor: 'end', text: 'internet   ·   outside cluster' }),
    P.node({ key: 'theNode', x: NODE_X, y: REGION_TOP, w: NODE_W, h: REGION_H, label: 'Node   ·   192.168.1.20' }),
    P.box({ key: 'client', x: CLIENT_X, y: FLOW_Y - CLIENT_H / 2, w: CLIENT_W, h: CLIENT_H, label: 'Client', sublabel: 'internet' }),
    P.box({ key: 'lb', x: LB_X, y: FLOW_Y - LB_H / 2, w: LB_W, h: LB_H, label: 'Cloud LB', sublabel: '203.0.113.9:443' }),
    P.box({ key: 'kproxy', x: KP_X, y: FLOW_Y - KP_H / 2, w: KP_W, h: KP_H, label: 'kube-proxy rules', sublabel: 'NodePort 31000' }),
    P.box({ key: 'conntrack', x: CT_X, y: CT_Y, w: CT_W, h: CT_H, label: 'Conntrack', sublabel: 'no flow yet' }),
    P.pod({
      key: 'podX', innerKey: 'podXBox', x: POD_X, y: FLOW_Y - POD_H / 2, w: POD_W, h: POD_H, label: 'Pod web',
      inner: { dx: 20, dy: 34, w: POD_W - 40, h: 52, label: 'app', sublabel: 'eth0' },
    }),
    P.arrow({ x1: C2LB[0][0], y1: C2LB[0][1], x2: C2LB[1][0], y2: C2LB[1][1], dashed: true, dim: true }),
    P.arrow({ x1: LB2KP[0][0], y1: LB2KP[0][1], x2: LB2KP[1][0], y2: LB2KP[1][1], dashed: true, dim: true }),
    P.arrow({ x1: KP2POD[0][0], y1: KP2POD[0][1], x2: KP2POD[1][0], y2: KP2POD[1][1], dashed: true, dim: true }),
    P.arrow({ x1: POD2KP[0][0], y1: POD2KP[0][1], x2: POD2KP[1][0], y2: POD2KP[1][1], dashed: true, dim: true }),
    P.arrow({ x1: KP2LB[0][0], y1: KP2LB[0][1], x2: KP2LB[1][0], y2: KP2LB[1][1], dashed: true, dim: true }),
    P.arrow({ x1: LB2C[0][0], y1: LB2C[0][1], x2: LB2C[1][0], y2: LB2C[1][1], dashed: true, dim: true }),
    // Ownership marker, NOT a traffic path: the rules and the flow table are two halves of one
    // dataplane. No packet ever travels it, so it is a plain dashed line with no arrowhead.
    P.relation({ points: CT_LINK, dash: '5 5' }),
    // Four equal cells, equal gaps, spanning the full framed width.
    P.chip({ key: 'stageChip', x: chipX(0), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'stage', value: 'idle' }),
    P.chip({ key: 'svcChip', x: chipX(1), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'Service', value: 'type: LoadBalancer' }),
    P.chip({ key: 'dnatChip', x: chipX(2), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'DNAT', value: 'none' }),
    P.chip({ key: 'backChip', x: chipX(3), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'backend', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['client', 'lb', 'kproxy', 'conntrack', 'podXBox', 'stageChip', 'svcChip', 'dnatChip', 'backChip'],
    pods: ['podX'],
  },
};

const NO_FLOW = 'no flow yet';
const PINNED = '192.168.1.20:31000 -> 10.244.2.7:8080  pinned';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { stageChip: 'idle', dnatChip: 'none', backChip: 'none' },
    sublabels: { conntrack: NO_FLOW },
  },
  {
    id: 'lb',
    duration: 2200,
    narration: 'The client connects to the public IP, which belongs to a cloud load balancer provisioned for the LoadBalancer Service. The LB is the only address exposed to the internet, and it is still outside the cluster. It picks one healthy Node to forward the connection to.',
    chips: { stageChip: 'cloud LB', dnatChip: 'none', backChip: 'none' },
    sublabels: { conntrack: NO_FLOW },
    lit: ['client', 'stageChip', 'svcChip'],
    // The packet carries the public IP as its destination, and the tag rides with it.
    flow: [
      F.segment({ from: C2LB[0], to: C2LB[1], name: 'hop' }),
      tag({ text: 'dst 203.0.113.9:443', points: C2LB }),
      F.light({ targets: ['lb'], at: 'hop' }),
    ],
  },
  {
    id: 'nodeport',
    duration: 2400,
    narration: 'The load balancer rewrites the destination to a Node and the Service NodePort, a high port opened on every Node, and the packet crosses the cluster edge. The kube-proxy programmed the rules that catch that port, so the packet is matched on arrival with the destination still the Node IP and that port.',
    chips: { stageChip: 'NodePort', dnatChip: 'none', backChip: 'none' },
    sublabels: { conntrack: NO_FLOW },
    lit: ['lb', 'stageChip', 'svcChip'],
    // The only hop that crosses the region gap on the way in: the destination is now a Node, not the LB.
    flow: [
      F.segment({ from: LB2KP[0], to: LB2KP[1], name: 'hop' }),
      tag({ text: 'dst 192.168.1.20:31000', points: LB2KP }),
      F.light({ targets: ['kproxy'], at: 'hop' }),
    ],
  },
  {
    id: 'dnat',
    duration: 2800,
    narration: 'The Service rules DNAT the destination to a backing Pod IP, and conntrack records the flow so every later packet of this connection takes the same backend and the reply can be unwound. The rewritten packet is delivered to the Pod, which serves the request on its real port.',
    chips: { stageChip: 'DNAT', dnatChip: '-> 10.244.2.7:8080', backChip: '10.244.2.7:8080' },
    sublabels: { conntrack: PINNED },
    lit: ['kproxy', 'conntrack', 'stageChip', 'svcChip', 'dnatChip', 'backChip'],
    // The animated path says the Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['podXBox'],
    // The rewrite happens INSIDE kube-proxy, so the ball re-emerges at its right edge already
    // carrying the Pod address. Down-arrow: packet first, the Pod pulses on arrival.
    flow: [
      F.segment({ from: KP2POD[0], to: KP2POD[1], name: 'give' }),
      tag({ text: 'dst 10.244.2.7:8080', points: KP2POD }),
      F.pulse({ pod: 'podX', at: 'give' }),
    ],
  },
  {
    id: 'reply',
    // Pod pulse (900) at 0, then three 700ms hops chained on BEAT: the last lands at 3100 and its
    // ripple + tag fade run to ~3660, so the step holds a touch longer than that before auto-advancing.
    duration: 3700,
    narration: 'The Pod replies, and the answer retraces the same chain in reverse, drawn here as its own lane. The conntrack table matches the reply to the flow it pinned and undoes the DNAT, so the source becomes the Node and its NodePort again, then the load balancer rewrites it once more and the client sees an answer from the public IP it dialed. The client never learns the Pod address, and every rewrite the request crossed is unwound on the way out.',
    chips: { stageChip: 'reply unwinds', dnatChip: 'reverse NAT', backChip: '10.244.2.7:8080' },
    sublabels: { conntrack: PINNED },
    lit: ['conntrack', 'stageChip', 'dnatChip', 'backChip'],
    // Up-arrow: the Pod is the sender, so it pulses FIRST and the reply leaves at BEAT.afterPulse.
    // Each hop unwinds one rewrite, and its tag says which source address the packet now carries.
    flow: [
      F.pulse({ pod: 'podX' }),
      F.segment({ from: POD2KP[0], to: POD2KP[1], delay: BEAT.afterPulse, name: 'h1' }),
      tag({ text: 'src 10.244.2.7:8080', points: POD2KP, delay: BEAT.afterPulse, dy: 24 }),
      F.light({ targets: ['kproxy'], at: 'h1' }),
      F.segment({ from: KP2LB[0], to: KP2LB[1], after: 'h1', name: 'h2' }),
      tag({ text: 'src 192.168.1.20:31000', points: KP2LB, after: 'h1', dy: 24 }),
      F.light({ targets: ['lb'], at: 'h2' }),
      F.segment({ from: LB2C[0], to: LB2C[1], after: 'h2', name: 'h3' }),
      tag({ text: 'src 203.0.113.9:443', points: LB2C, after: 'h2', dy: 24 }),
      F.light({ targets: ['client'], at: 'h3' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
