import { P, F, defineCard, makeRidingLabel, laneY, midX, shade, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-hostnetwork-hostport


const NODE_X = 40, NODE_Y = 305, NODE_W = 1120, NODE_H = 265;

const COL1_CX = 240, COL2_CX = 600, COL3_CX = 960;

const CLIENT_X = 450, CLIENT_Y = 56, CLIENT_W = 300, CLIENT_H = 74;
const CLIENT_BOTTOM = CLIENT_Y + CLIENT_H;     // 130

// Row 1: the Node NIC and the rule that sits on its ingress path, both on one baseline.
const R1_Y = 330, R1_H = 64;
const R1_CY = R1_Y + R1_H / 2;                 // 362
const R1_BOTTOM = R1_Y + R1_H;                 // 394

const ETH_W = 240;
const ETH_X = COL2_CX - ETH_W / 2;             // 480
const ETH_RIGHT = ETH_X + ETH_W;               // 720

const PM_W = 260;
const PM_X = COL1_CX - PM_W / 2;               // 110
const PM_RIGHT = PM_X + PM_W;                  // 370

// Row 2: the two Pods and the bridge between them, all centred on one line.
const R2_Y = 440, POD_H = 110, POD_W = 210;
const POD_CY = R2_Y + POD_H / 2;               // 495
const APP_X = COL1_CX - POD_W / 2;             // 135
const APP_RIGHT = APP_X + POD_W;               // 345
const AGENT_X = COL3_CX - POD_W / 2;           // 855

const BR_W = 200, BR_H = 60;
const BR_X = COL2_CX - BR_W / 2;               // 500
const BR_TOP = POD_CY - BR_H / 2;              // 465
// Two routes reach the bridge from above, and they land as a MIRRORED PAIR either side of its
// midpoint rather than one on it and one beside it.
const BR_IN_DX = 20;
const { out: BR_IN_PM, back: BR_IN_ORD } = laneY(COL2_CX, BR_IN_DX);   // 580 portmap, 620 ordinary

const BUS_Y = (R1_BOTTOM + R2_Y) / 2;          // 417, the lane between the two rows
const VETH_MID_X = midX(BR_X, APP_RIGHT);      // 422.5, the label sits over the middle of its wire
const CHIP_Y = 590, CHIP_H = 34;
const SCHEME_LEFT = NODE_X;                    // 40
const SCHEME_RIGHT = NODE_X + NODE_W;          // 1160


// Each static wire and the ball that rides it share the same points array. The three NIC exits are one
// per direction, and the rule rejoins the ordinary path on the bus between the rows.
const ENTRY = [[COL2_CX, CLIENT_BOTTOM], [COL2_CX, R1_Y]];               // LAN client -> the Node NIC
const TO_PM = [[ETH_X, R1_CY], [PM_RIGHT, R1_CY]];                       // NIC -> the portmap rule
const TO_AGENT = [[ETH_RIGHT, R1_CY], [COL3_CX, R1_CY], [COL3_CX, R2_Y]];// NIC -> the hostNetwork Pod
const TO_BRIDGE = [[BR_IN_ORD, R1_BOTTOM], [BR_IN_ORD, BR_TOP]];         // NIC -> the bridge, ordinary route
const PM_TO_BRIDGE = [[COL1_CX, R1_BOTTOM], [COL1_CX, BUS_Y], [BR_IN_PM, BUS_Y], [BR_IN_PM, BR_TOP]];
const VETH = [[BR_X, POD_CY], [APP_RIGHT, POD_CY]];                      // bridge -> Pod app, the veth pair

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy, so the
// factory is built once and handed to every F.tag as `fn`.
const ridingLabel = makeRidingLabel({ role: 'network', outMs: 170, hold: 0, emergeMode: true });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });

const POD_INNER = { dx: 20, dy: 30, w: POD_W - 40, h: 48, label: 'app', sublabel: 'eth0' };

// The list order IS the append order, which is the z-order: the Node frame in back, then the blocks
// inside and above it, then wires + the veth label, then chips, then the packet layer on top.
export const SCENE = {
  'aria-label': 'hostNetwork and hostPort: an ordinary Pod has its own network namespace, its own Pod IP and a veth pair into the bridge. A Pod with hostNetwork true has no namespace of its own at all, so it has no veth and no Pod IP, it runs in the Node namespace and binds straight to the Node address, at the cost of the Node port space and its own isolation. A Pod with a hostPort keeps everything it had, and the CNI portmap plugin only adds a DNAT rule on the Node that rewrites the Node address and host port to the Pod IP and container port.',
  parts: [
    P.defs(),
    P.node({ key: 'theNode', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.box({ key: 'client', x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H, label: 'Client on the LAN', sublabel: '' }),
    P.box({ key: 'eth', x: ETH_X, y: R1_Y, w: ETH_W, h: R1_H, label: 'Node eth0', sublabel: '192.168.1.20' }),
    P.box({ key: 'portmap', x: PM_X, y: R1_Y, w: PM_W, h: R1_H, label: 'Portmap rule', sublabel: 'none' }),
    P.box({ key: 'bridge', x: BR_X, y: BR_TOP, w: BR_W, h: BR_H, label: 'cni0 bridge', sublabel: '10.244.1.1' }),
    P.pod({
      key: 'podApp', innerKey: 'podAppBox', x: APP_X, y: R2_Y, w: POD_W, h: POD_H,
      label: 'Pod app', sublabel: '10.244.1.5', inner: POD_INNER,
    }),
    P.pod({
      key: 'podAgent', innerKey: 'podAgentBox', x: AGENT_X, y: R2_Y, w: POD_W, h: POD_H,
      label: 'Pod node-agent', sublabel: 'hostNetwork: true', inner: POD_INNER,
    }),
    P.arrow({ from: ENTRY[0], to: ENTRY[1], dashed: true, dim: true }),
    P.arrow({ from: TO_PM[0], to: TO_PM[1], dashed: true, dim: true }),
    // The ordinary route is a relationship, not a route: no ball ever rides it on any step, so it
    // carries no arrowhead. An arrowhead with no traffic under it reads as traffic.
    P.relation({ points: TO_BRIDGE, dash: '5 5' }),
    P.arrow({ from: VETH[0], to: VETH[1], dashed: true, dim: true }),
    P.lane({ points: TO_AGENT, dashed: true, dim: true }),
    P.lane({ points: PM_TO_BRIDGE, dashed: true, dim: true }),
    // The veth is the thing the two Pods differ by, so the wire that carries it is the one wire that is
    // named. Everything else a step needs to say rides the chips or the Pod sublabels.
    P.wire({ key: 'veth', x: VETH_MID_X, y: POD_CY - 12 }),
    P.chip({ key: 'nsChip', x: SCHEME_LEFT, y: CHIP_Y, w: 260, h: CHIP_H, name: 'netns', value: 'own' }),
    P.chip({ key: 'ipChip', x: 320, y: CHIP_Y, w: 300, h: CHIP_H, name: 'Pod IP', value: '10.244.1.5' }),
    P.chip({ key: 'vethChip', x: 640, y: CHIP_Y, w: 170, h: CHIP_H, name: 'veth', value: 'yes' }),
    P.chip({ key: 'portChip', x: 830, y: CHIP_Y, w: SCHEME_RIGHT - 830, h: CHIP_H, name: 'reachable at', value: 'Pod IP only' }),
    P.packets(),
  ],
  reset: {
    keys: ['client', 'eth', 'portmap', 'bridge', 'nsChip', 'ipChip', 'vethChip', 'portChip', 'podAppBox', 'podAgentBox'],
    pods: ['podApp', 'podAgent'],
  },
};

// The ordinary wiring (bridge, veth Pod, and the portmap rule that exists only for hostPort) is not what a
// hostNetwork Pod uses, so those blocks dim while that case is on screen, and the other way round.
const ALL_UP = { podApp: 1, podAgent: 1, portmap: 1, bridge: 1 };
const only = (which) => ({
  opacity: { ...ALL_UP, ...shade(which === 'hostnet' ? ['podApp', 'bridge', 'portmap'] : ['podAgent'], OPACITY.notready) },
});

const PM_MAPPED = 'nodeIP:8080 -> pod:80';
const APP_HOSTPORT = '10.244.1.5 · hostPort 8080';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { nsChip: 'own', ipChip: '10.244.1.5', vethChip: 'yes', portChip: 'Pod IP only' },
    wires: { veth: 'veth pair' },
    sublabels: { portmap: 'none' },
    podSublabels: { podApp: '10.244.1.5' },
    opacity: ALL_UP,
  },
  {
    id: 'hostnetwork',
    // Motion: entry(700) + hop beat(100) + lane(700) = 1500, then the Pod pulse (900) ends at 2400.
    duration: 3000,
    narration: 'With hostNetwork true the Pod gets no namespace of its own at all. It runs inside the Node namespace, so there is no veth, no Pod IP and no bridge in the path: the container binds straight to the Node interfaces. A client that dials 192.168.1.20:80 is served by the Pod with no NAT anywhere, which is exactly how kube-proxy, the CNI agent and node-exporter run.',
    chips: { nsChip: 'the Node one', ipChip: '192.168.1.20 (Node)', vethChip: 'none', portChip: 'Node IP :80' },
    sublabels: { portmap: 'none' },
    podSublabels: { podApp: '10.244.1.5' },
    ...only('hostnet'),
    lit: ['portChip', 'client', 'nsChip', 'ipChip', 'vethChip'],
    // The animated path says the agent Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['podAgentBox'],
    // Down-arrow all the way: the request lands on the Node NIC, which lights on arrival, and goes on to
    // the Pod with no rewrite of any kind, so the same Node address rides the ball the whole way.
    flow: [
      F.segment({ from: ENTRY[0], to: ENTRY[1], name: 'inb' }),
      tag({ text: 'dst 192.168.1.20:80', points: ENTRY, easing: 'linear' }),
      F.light({ targets: ['eth'], at: 'inb' }),
      F.route({ points: TO_AGENT, after: 'inb', name: 'out' }),
      tag({ text: 'dst 192.168.1.20:80', points: TO_AGENT, after: 'inb' }),
      F.pulse({ pod: 'podAgent', at: 'out' }),
    ],
  },
  {
    id: 'hostnetwork-cost',
    duration: 2400,
    narration: 'The price is the Node port space and the isolation. The container listens on the Node itself, so a second Pod that wants the same port cannot be scheduled here at all, and the Pod sees every Node interface with nothing of its own between it and the host. That is a privilege for the agents that must see the Node, not for applications.',
    chips: { nsChip: 'the Node one', ipChip: '192.168.1.20 (Node)', vethChip: 'none', portChip: 'Node IP :80' },
    sublabels: { portmap: 'none' },
    podSublabels: { podApp: '10.244.1.5' },
    ...only('hostnet'),
    // Reflective beat: nothing travels, so nothing moves. The chips and the NIC the Pod now shares
    // simply light, exactly as the cost step of the External Traffic card does.
    lit: ['eth', 'nsChip', 'portChip'],
  },
  {
    id: 'hostport',
    // Motion: entry(700) + beat + rule hop(700) + beat + rewrite route(700) + beat + veth(700) = 3100,
    // then the Pod pulse (900) ends at 4000. The floor leaves a settle.
    duration: 4400,
    narration: 'The hostPort field is the smaller hammer. The Pod keeps its own namespace, its Pod IP and its veth, and the CNI portmap plugin only adds one DNAT rule on the Node: anything arriving at 192.168.1.20:8080 is rewritten to 10.244.1.5:80 and then delivered down the ordinary bridge and veth. The Pod is reachable from the LAN and still never learns that it was.',
    chips: { nsChip: 'own', ipChip: '10.244.1.5', vethChip: 'yes', portChip: 'Node IP :8080' },
    wires: { veth: 'veth pair' },
    sublabels: { portmap: PM_MAPPED },
    podSublabels: { podApp: APP_HOSTPORT },
    ...only('hostport'),
    lit: ['nsChip', 'ipChip', 'client', 'portChip', 'vethChip'],
    // The animated path says the app Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['podAppBox'],
    flow: [
      F.segment({ from: ENTRY[0], to: ENTRY[1], name: 'inb' }),
      tag({ text: 'dst 192.168.1.20:8080', points: ENTRY, easing: 'linear' }),
      F.light({ targets: ['eth'], at: 'inb' }),
      F.segment({ from: TO_PM[0], to: TO_PM[1], after: 'inb', name: 'toPm', lights: ['portmap'] }),
      F.route({ points: PM_TO_BRIDGE, after: 'toPm', name: 'toBr' }),
      tag({ text: 'dst 10.244.1.5:80', points: PM_TO_BRIDGE, after: 'toPm', emerge: 150 }),
      F.light({ targets: ['bridge'], at: 'toBr' }),
      F.segment({ from: VETH[0], to: VETH[1], after: 'toBr', name: 'toPod' }),
      F.pulse({ pod: 'podApp', at: 'toPod' }),
    ],
  },
  {
    id: 'tradeoff',
    duration: 2600,
    narration: 'Both fields spend the same scarce thing, a port on the Node, so the scheduler counts a hostPort as a Node resource and only one replica of that Pod can land here. The difference is what you give up: hostNetwork hands the Node namespace to the container and suits the agents that must see it, while hostPort keeps the Pod isolated and punches a single port through to it. Everything else belongs behind a Service.',
    chips: { nsChip: 'own or the Node one', ipChip: 'Pod IP or Node IP', vethChip: 'yes or none', portChip: 'one per Node either way' },
    wires: { veth: 'veth pair' },
    sublabels: { portmap: PM_MAPPED },
    podSublabels: { podApp: APP_HOSTPORT },
    // Both cases are on screen side by side for the comparison, so nothing is dimmed here.
    opacity: ALL_UP,
    // Reflective beat, same as the other cost step: the chips carry the comparison, nothing travels.
    lit: ['ipChip', 'vethChip', 'nsChip', 'portChip'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
