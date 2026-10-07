import { P, F, defineCard, makeRidingLabel, laneY, midX, shade, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS/network-hostnetwork-hostport.md

// NODE_Y puts the frame just under the panel, which is what lets the client sit at x >= 450.
// Raising the frame puts its top-left corner and the portmap box under the overlay.
const NODE_X = 40, NODE_Y = 305, NODE_W = 1120;

const COL1_CX = 240, COL2_CX = 600, COL3_CX = 960;

// The client takes the catalog object width (NET.L-01), centred on COL2_CX.
const CLIENT_W = 232, CLIENT_H = 80, CLIENT_Y = 56;
const CLIENT_X = COL2_CX - CLIENT_W / 2;
const CLIENT_BOTTOM = CLIENT_Y + CLIENT_H;

// Row 1: the Node NIC and the rule on its ingress path, on one baseline under the frame label band.
const R1_Y = NODE_Y + 34, R1_H = 64;
const R1_CY = R1_Y + R1_H / 2;
const R1_BOTTOM = R1_Y + R1_H;

const ETH_W = 240;
const ETH_X = COL2_CX - ETH_W / 2;
const ETH_RIGHT = ETH_X + ETH_W;

const PM_W = 260;
const PM_X = COL1_CX - PM_W / 2;
const PM_RIGHT = PM_X + PM_W;

// Row 2: the two Pods and the bridge between them, centred on one line.
const R2_Y = R1_Y + 110, POD_H = 110, POD_W = 210;
const POD_CY = R2_Y + POD_H / 2;
const NODE_H = R2_Y + POD_H + 12 - NODE_Y;
const APP_X = COL1_CX - POD_W / 2;
const APP_RIGHT = APP_X + POD_W;
const AGENT_X = COL3_CX - POD_W / 2;

const BR_W = 200, BR_H = 60;
const BR_X = COL2_CX - BR_W / 2;
const BR_TOP = POD_CY - BR_H / 2;
// Two routes reach the bridge from above, and they land as a MIRRORED PAIR either side of its
// midpoint rather than one on it and one beside it.
const BR_IN_DX = 20;
const { out: BR_IN_PM, back: BR_IN_ORD } = laneY(COL2_CX, BR_IN_DX);   // portmap, ordinary

const BUS_Y = (R1_BOTTOM + R2_Y) / 2;          // the lane between the two rows
const VETH_MID_X = midX(BR_X, APP_RIGHT);      // the label sits over the middle of its wire
const CHIP_Y = 590, CHIP_H = 34;
const SCHEME_LEFT = NODE_X;
const SCHEME_RIGHT = NODE_X + NODE_W;

// The rule rejoins the ordinary path on the bus between the rows. NET.A-02: the LAN entry stops on
// the frame top face, and the NIC lights on arrival.
const ENTRY = [[COL2_CX, CLIENT_BOTTOM], [COL2_CX, NODE_Y]];             // LAN client -> the Node frame
const TO_PM = [[ETH_X, R1_CY], [PM_RIGHT, R1_CY]];                       // NIC -> the portmap rule
const TO_AGENT = [[ETH_RIGHT, R1_CY], [COL3_CX, R1_CY], [COL3_CX, R2_Y]];// NIC -> the hostNetwork Pod
const TO_BRIDGE = [[BR_IN_ORD, R1_BOTTOM], [BR_IN_ORD, BR_TOP]];         // NIC -> the bridge, ordinary route
const PM_TO_BRIDGE = [[COL1_CX, R1_BOTTOM], [COL1_CX, BUS_Y], [BR_IN_PM, BUS_Y], [BR_IN_PM, BR_TOP]];
const VETH = [[BR_X, POD_CY], [APP_RIGHT, POD_CY]];                      // bridge -> Pod app, the veth pair

// Only the DNAT-ed address emerges, out of the portmap rule: at departure it prints over the rule
// sublabel.
const emergeLabel = makeRidingLabel({ role: 'network', emergeMode: true });
const tag = (p) => F.tag({ ...p });
// The hostNetwork tag rides level with the frame caption, between the frame top and the NIC row:
// at the default it strikes Node eth0, and any dx stops reading as the address of its own ball.
const AGENT_TAG_DY = -40;

const POD_INNER = { dx: 20, dy: 30, w: POD_W - 40, h: 48, label: 'app', sublabel: 'eth0' };
// The hostNetwork container has no interface of its own to name, so its inner box names the one it
// binds, which is the Node NIC drawn above it. `eth0` there would draw the veth the card denies.
const AGENT_INNER = { ...POD_INNER, sublabel: 'Node eth0' };

// The list order IS the append order, which is the z-order: the Node frame in back, then the blocks
// inside and above it, then wires + the veth label, then chips, then the packet layer on top.
export const SCENE = {
  'aria-label': 'hostNetwork and hostPort: an ordinary Pod has its own network namespace, its own Pod IP and a veth pair into the bridge. A Pod with hostNetwork true has no namespace of its own at all, so it has no veth and no Pod IP of its own, it runs in the Node namespace and binds straight to the Node address, at the cost of the Node port space and its own isolation. A Pod with a hostPort keeps everything it had, and the CNI portmap plugin only adds a port mapping on the Node that rewrites the Node address and host port to the Pod IP and container port.',
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
      label: 'Pod node-agent', sublabel: 'hostNetwork: true', inner: AGENT_INNER,
    }),
    // The entry hop is the one lane whose two ends are lit on every step, so it alone needs no key.
    P.arrow({ from: ENTRY[0], to: ENTRY[1], dashed: true, dim: true }),
    P.arrow({ key: 'wToPm', from: TO_PM[0], to: TO_PM[1], dashed: true, dim: true }),
    // The ordinary route is a relationship, not a route: no ball ever rides it on any step, so it
    // carries no arrowhead. An arrowhead with no traffic under it reads as traffic.
    P.relation({ key: 'wOrdinary', points: TO_BRIDGE, dash: '5 5' }),
    P.arrow({ key: 'wVeth', from: VETH[0], to: VETH[1], dashed: true, dim: true }),
    P.lane({ key: 'wToAgent', points: TO_AGENT, dashed: true, dim: true }),
    P.lane({ key: 'wPmToBridge', points: PM_TO_BRIDGE, dashed: true, dim: true }),
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
const ALL_UP = {
  podApp: 1, podAgent: 1, portmap: 1, bridge: 1,
  wToPm: 1, wOrdinary: 1, wVeth: 1, wPmToBridge: 1, wToAgent: 1,
};
// Each list is a case AND its lanes: a lane takes the shade of the dimmer of its two ends (A-13),
// so an arrowhead never lands at full strength on a ghost the step says is not in the path.
const ORDINARY_PATH = ['podApp', 'bridge', 'portmap', 'wToPm', 'wOrdinary', 'wVeth', 'wPmToBridge'];
const HOSTNET_PATH = ['podAgent', 'wToAgent'];
const only = (which) => ({
  opacity: { ...ALL_UP, ...shade(which === 'hostnet' ? ORDINARY_PATH : HOSTNET_PATH, OPACITY.notready) },
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
    duration: 3800,
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
      F.route({ points: TO_AGENT, after: 'inb', tag: { text: 'dst 192.168.1.20:80', dy: AGENT_TAG_DY }, pulse: 'podAgent' }),
    ],
  },
  {
    id: 'hostnetwork-cost',
    duration: 3300,
    narration: 'The price is the Node port space and the isolation. The container listens on the Node itself, so a second Pod that wants the same port cannot run here, and the Pod sees every Node interface with nothing of its own between it and the host. That is a privilege for the agents that must see the Node, not for applications.',
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
    duration: 4400,
    narration: 'The hostPort field is the smaller hammer. The Pod keeps its own namespace, its Pod IP and its veth, and the CNI portmap plugin only adds a port mapping on the Node: anything arriving at 192.168.1.20:8080 is DNAT-ed to 10.244.1.5:80 and then delivered down the ordinary bridge and veth. The Pod is reachable from the LAN and its socket still only ever sees its own address and port.',
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
      F.tag({ fn: emergeLabel, text: 'dst 10.244.1.5:80', points: PM_TO_BRIDGE, after: 'toPm', emerge: 150 }),
      F.light({ targets: ['bridge'], at: 'toBr' }),
      F.segment({ from: VETH[0], to: VETH[1], after: 'toBr', pulse: 'podApp' }),
    ],
  },
  {
    id: 'tradeoff',
    duration: 4300,
    narration: 'Both fields spend the same scarce thing, a port on the Node, so the Scheduler counts a hostPort as a Node resource and only one replica of that Pod can land here. The difference is what you give up: hostNetwork hands the Node namespace to the container and suits the agents that must see it, while hostPort keeps the Pod isolated and punches a single port through to it. Everything else belongs behind a Service.',
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
