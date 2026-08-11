import { P, F, defineCard, makeRidingLabel, shade, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-loadbalancer-bare-metal


const MID_X = 600;

const CLIENT_W = 240, CLIENT_H = 58, CLIENT_Y = 40;
const ROUTER_W = 300, ROUTER_H = 74, ROUTER_Y = 134;
const NODE_W = 340, NODE_H = 190, NODE_Y = 310;
const POD_W = 210, POD_H = 110;
const CHIP_Y = 560, CHIP_H = 34;

const CLIENT_X = MID_X - CLIENT_W / 2;               // 480
const CLIENT_BOTTOM = CLIENT_Y + CLIENT_H;           // 98
const ROUTER_X = MID_X - ROUTER_W / 2;               // 450
const ROUTER_BOTTOM = ROUTER_Y + ROUTER_H;           // 208

const NODE_GAP = 40;
const N1_X = MID_X - NODE_W / 2 - NODE_GAP - NODE_W; // 50
const N2_X = MID_X - NODE_W / 2;                     // 430
const N3_X = MID_X + NODE_W / 2 + NODE_GAP;          // 810
const N1_CX = N1_X + NODE_W / 2;                     // 220
const N2_CX = N2_X + NODE_W / 2;                     // 600
const N3_CX = N3_X + NODE_W / 2;                     // 980

// Each Pod is centred BOTH ways inside its Node, so every fan leg drops straight down the Pod axis.
const POD_Y = NODE_Y + (NODE_H - POD_H) / 2;         // 350
const POD1_X = N1_CX - POD_W / 2;                    // 115
const POD2_X = N2_CX - POD_W / 2;                    // 495
const POD3_X = N3_CX - POD_W / 2;                    // 875

const BUS_Y = (ROUTER_BOTTOM + NODE_Y) / 2;          // 259, the bus the fan splits on
const SCHEME_LEFT = N1_X;                            // 50
const SCHEME_RIGHT = N3_X + NODE_W;                  // 1150

// Each static wire and the ball that rides it share the same points array.
const C_WIRE = [[MID_X, CLIENT_BOTTOM], [MID_X, ROUTER_Y]];
const TO_N1 = [[MID_X, ROUTER_BOTTOM], [MID_X, BUS_Y], [N1_CX, BUS_Y], [N1_CX, NODE_Y]];
const TO_N2 = [[MID_X, ROUTER_BOTTOM], [MID_X, NODE_Y]];
const TO_N3 = [[MID_X, ROUTER_BOTTOM], [MID_X, BUS_Y], [N3_CX, BUS_Y], [N3_CX, NODE_Y]];


// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy, so the
// factory is built once and handed to every F.tag as `fn`.
const ridingLabel = makeRidingLabel({ role: 'network', outMs: 170, hold: 0, emergeMode: true });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });

const POD_INNER = { dx: 20, dy: 30, w: POD_W - 40, h: 48, label: 'app', sublabel: 'eth0' };

// The list order IS the append order, which is the z-order: Nodes and their Pods, then the client and
// router above them, then wires + notes, then chips, then the packet layer with its riding tags on top.
export const SCENE = {
  'aria-label': 'LoadBalancer on bare metal: with no cloud-controller-manager a LoadBalancer Service stays pending, so an in-cluster implementation such as MetalLB allocates an address from an operator-declared pool and then announces it, either in layer 2 mode where a single elected Node answers ARP for the address and takes all inbound traffic, or in BGP mode where every Node advertises the address to the router, which installs an ECMP route and hashes flows across all of them',
  parts: [
    P.defs(),
    P.node({ key: 'node1', x: N1_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'node2', x: N2_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' }),
    P.node({ key: 'node3', x: N3_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-3' }),
    P.pod({
      key: 'pod1', innerKey: 'pod1Box', x: POD1_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.1.5', inner: POD_INNER,
    }),
    P.pod({
      key: 'pod2', innerKey: 'pod2Box', x: POD2_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.2.7', inner: POD_INNER,
    }),
    P.pod({
      key: 'pod3', innerKey: 'pod3Box', x: POD3_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.3.9', inner: POD_INNER,
    }),
    P.box({ key: 'client', x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H, label: 'Clients', sublabel: 'internet' }),
    P.box({ key: 'router', x: ROUTER_X, y: ROUTER_Y, w: ROUTER_W, h: ROUTER_H, label: 'Upstream router', sublabel: 'route to 203.0.113.9' }),
    P.arrow({ from: C_WIRE[0], to: C_WIRE[1], dashed: true, dim: true }),
    P.lane({ key: 'fan1', points: TO_N1, dashed: true, dim: true }),
    P.lane({ key: 'fan2', points: TO_N2, dashed: true, dim: true }),
    P.lane({ key: 'fan3', points: TO_N3, dashed: true, dim: true }),
    // What each Node announces for the address. All three sit on the same baseline so they read as a
    // row, low enough to clear the Pod above (its bottom edge is 460) and to stay inside the Node.
    P.wire({ key: 'n1', x: N1_CX, y: 482 }),
    P.wire({ key: 'n2', x: N2_CX, y: 482 }),
    P.wire({ key: 'n3', x: N3_CX, y: 482 }),
    P.chip({ key: 'statusChip', x: SCHEME_LEFT, y: CHIP_Y, w: 300, h: CHIP_H, name: 'status.loadBalancer', value: 'pending' }),
    P.chip({ key: 'poolChip', x: 370, y: CHIP_Y, w: 260, h: CHIP_H, name: 'address pool', value: 'none' }),
    P.chip({ key: 'modeChip', x: 650, y: CHIP_Y, w: 250, h: CHIP_H, name: 'announce mode', value: 'none' }),
    P.chip({ key: 'pathChip', x: 920, y: CHIP_Y, w: SCHEME_RIGHT - 920, h: CHIP_H, name: 'ingress path', value: 'none' }),
    P.packets(),
  ],
  // The inner app boxes are listed BY KEY so a .highlight set on the reduced path cannot leak into a
  // later step: clearPodHighlight only resets inline strokes.
  reset: {
    keys: ['client', 'router', 'statusChip', 'poolChip', 'modeChip', 'pathChip', 'pod1Box', 'pod2Box', 'pod3Box'],
    pods: ['pod1', 'pod2', 'pod3'],
  },
};

// A Node, the Pod inside it and the fan lane reaching it are ONE thing for presence, so one entry
// pins all three: separately, a full-strength fan arrow points into a Node dimmed out of the path.
const ALL_UP = { node1: 1, pod1: 1, fan1: 1, node2: 1, pod2: 1, fan2: 1, node3: 1, pod3: 1, fan3: 1 };
const triple = (i) => [`node${i}`, `pod${i}`, `fan${i}`];
const onlyNode = (i) => ({ opacity: { ...ALL_UP, ...shade([1, 2, 3].filter(n => n !== i).flatMap(triple), OPACITY.notready) } });

const LB_IP = '203.0.113.9';
const POOL = '203.0.113.0/24';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { statusChip: 'pending', poolChip: 'none', modeChip: 'none', pathChip: 'none' },
    opacity: ALL_UP,
  },
  {
    id: 'pool',
    duration: 2400,
    narration: 'On bare metal there is no cloud-controller-manager, so nothing answers a Service of type LoadBalancer and it sits pending. That gap is filled in-cluster instead, by an implementation such as MetalLB. The cluster operator declares an address pool, and an address out of it is written into status.loadBalancer.ingress, so the Service finally has 203.0.113.9. An allocated address is not a reachable one: something still has to tell the network where to send it.',
    chips: { statusChip: LB_IP, poolChip: POOL, modeChip: 'none', pathChip: 'none' },
    opacity: ALL_UP,
    // An address is allocated by a WRITE, not by a packet, so this step moves nothing: the two chips
    // it wrote simply light.
    lit: ['statusChip', 'poolChip'],
  },
  {
    id: 'l2',
    // Motion runs entry(700) + hop beat(100) + fan(1071) = 1871, then the Pod pulse (900) lands at 2771.
    // The floor leaves a settle rather than snapping straight on to the next step.
    duration: 3300,
    narration: 'In layer 2 mode one Node is elected to own the address and answers ARP for it, so as far as the router is concerned 203.0.113.9 simply lives on Node-1. Every packet for the address goes there, and kube-proxy spreads them onward from that Node. No router configuration at all, which is why this is the usual place to start.',
    chips: { statusChip: LB_IP, poolChip: POOL, modeChip: 'L2 (ARP)', pathChip: 'one Node' },
    wires: { n1: 'ARP: 203.0.113.9 is mine' },
    // Only Node-1 announces, so the other two take no traffic at all in this mode, and neither do
    // the fan lanes that reach them.
    ...onlyNode(1),
    lit: ['client', 'modeChip', 'pathChip'],
    // The animated path says the Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['pod1Box'],
    // Down-arrow all the way: the request reaches the router, which lights on arrival, then rides the
    // fan to the one Node that claimed the address, and the Pod inside it pulses as it is served.
    flow: [
      F.segment({ from: C_WIRE[0], to: C_WIRE[1], name: 'inb', lights: ['router'] }),
      F.route({ points: TO_N1, after: 'inb', name: 'toN1' }),
      tag({ text: 'dst 203.0.113.9', points: TO_N1, after: 'inb', emerge: 150 }),
      F.pulse({ pod: 'pod1', at: 'toN1' }),
    ],
  },
  {
    id: 'failover',
    // Motion runs entry(700) + hop beat(100) + fan(700) = 1500, then the Pod pulse (900) lands at 2400.
    duration: 2900,
    narration: 'That single owner is also the ceiling. All inbound traffic funnels through Node-1, so the ingress bandwidth of the whole Service is the bandwidth of one Node, and that Node is a single point of failure. When it goes away another Node claims the address and sends a gratuitous ARP so the router updates its table. The address comes back within seconds, but every connection that was riding the old Node is gone.',
    chips: { statusChip: LB_IP, poolChip: POOL, modeChip: 'L2 (ARP)', pathChip: 'one Node' },
    wires: { n2: 'gratuitous ARP: mine now' },
    // Node-1 is the one that failed, and Node-3 still announces nothing: only the new owner is live.
    ...onlyNode(2),
    lit: ['modeChip', 'pathChip'],
    // The animated path says the Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['pod2Box'],
    // Same down-arrow as before, but the fan now lands on the Node that took the address over, and its
    // local Pod pulses as it serves the request.
    flow: [
      F.segment({ from: C_WIRE[0], to: C_WIRE[1], name: 'inb', lights: ['router'] }),
      F.route({ points: TO_N2, after: 'inb', name: 'toN2' }),
      tag({ text: 'dst 203.0.113.9', points: TO_N2, after: 'inb', emerge: 150 }),
      F.pulse({ pod: 'pod2', at: 'toN2' }),
    ],
  },
  {
    id: 'bgp',
    // Three flows staggered 180ms apart. The last one leaves at 360, reaches the router at 1060, and its
    // fan lands at 2231, so its Pod pulse ends at 3131. The floor leaves a settle after that.
    duration: 3700,
    narration: 'BGP mode changes the shape. Every Node peers with the router and advertises the same address, so the router installs an equal-cost route and hashes each new flow across all of them. Ingress is no longer one Node wide, and router hashes are rarely stable, so losing a Node breaks most active connections and not only the ones it was carrying. The price is a router that speaks BGP with the cluster, and a change in the Node set can rehash live flows onto a different Node.',
    chips: { statusChip: LB_IP, poolChip: POOL, modeChip: 'BGP (ECMP)', pathChip: 'every Node' },
    wires: { n1: 'BGP: advertise /32', n2: 'BGP: advertise /32', n3: 'BGP: advertise /32' },
    // Every Node advertises here, so all three stay at full strength.
    opacity: ALL_UP,
    lit: ['client', 'modeChip', 'pathChip'],
    // The animated path says each Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['pod1Box', 'pod2Box', 'pod3Box'],
    // Three separate client flows staggered so they read as three, each hashed onto its own Node. Only
    // the first lights the router: three cues on one block would read as three arrivals it did not get.
    flow: [
      F.segment({ from: C_WIRE[0], to: C_WIRE[1], name: 'inb1', lights: ['router'] }),
      F.route({ points: TO_N1, after: 'inb1', name: 'out1' }),
      F.pulse({ pod: 'pod1', at: 'out1' }),
      F.segment({ from: C_WIRE[0], to: C_WIRE[1], delay: 180, name: 'inb2' }),
      F.route({ points: TO_N2, after: 'inb2', name: 'out2' }),
      F.pulse({ pod: 'pod2', at: 'out2' }),
      F.segment({ from: C_WIRE[0], to: C_WIRE[1], delay: 360, name: 'inb3' }),
      F.route({ points: TO_N3, after: 'inb3', name: 'out3' }),
      F.pulse({ pod: 'pod3', at: 'out3' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
