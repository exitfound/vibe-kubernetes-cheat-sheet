import { P, F, defineCard, makeRidingLabel } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-nodeport-loadbalancer


const CX = 600;                        // canvas centre: the client, the LB and the fan origin sit on it
const SCHEME_L = 80, SCHEME_R = 1120;  // content edges, mirrored about CX

// Node row: three equal frames spanning SCHEME_L..SCHEME_R.
const NODE_W = 300, NODE_H = 232, NODE_Y = 320;
const NODE_GAP = (SCHEME_R - SCHEME_L - 3 * NODE_W) / 2;   // 70
const NODE_X = [0, 1, 2].map(i => SCHEME_L + i * (NODE_W + NODE_GAP));   // 80, 450, 820
const NODE_CX = NODE_X.map(x => x + NODE_W / 2);                          // 230, 600, 970

const NP_Y = 352, NP_W = 260, NP_H = 32;          // per-Node nodePort chip
const NP_BOTTOM = NP_Y + NP_H;                    // 384
const POD_Y = 410, POD_W = 200, POD_H = 118;      // backend Pods, centred in their Node
const CHIP_Y = 570, CHIP_W = 300, CHIP_H = 34;    // bottom info strip, one chip per Node column

const CLIENT_Y = 36, CLIENT_W = 240, CLIENT_H = 64;
const CLIENT_BOTTOM = CLIENT_Y + CLIENT_H;        // 100
const LB_Y = 150, LB_W = 300, LB_H = 80;
const LB_BOTTOM = LB_Y + LB_H;                    // 230: the fan origin
const LB_RIGHT = CX + LB_W / 2;                   // 750
const CCM_X = 800, CCM_Y = 152, CCM_W = 290, CCM_H = 76;
const PROV_Y = CCM_Y + CCM_H / 2;                 // 190: ccm and LB share this centre line

const FAN_BUS_Y = 286;
const C_TO_LB = [[CX, CLIENT_BOTTOM], [CX, LB_Y]];
const PROVISION = [[CCM_X, PROV_Y], [LB_RIGHT, PROV_Y]];
const TO_N1 = [[CX, LB_BOTTOM], [CX, FAN_BUS_Y], [NODE_CX[0], FAN_BUS_Y], [NODE_CX[0], NODE_Y]];
const TO_N2 = [[CX, LB_BOTTOM], [CX, NODE_Y]];
const TO_N3 = [[CX, LB_BOTTOM], [CX, FAN_BUS_Y], [NODE_CX[2], FAN_BUS_Y], [NODE_CX[2], NODE_Y]];
// The nodePort rule DNATs down into the local backend Pod on Node-1.
const NP_TO_POD = [[NODE_CX[0], NP_BOTTOM], [NODE_CX[0], POD_Y]];

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'network', outMs: 170, hold: 0, emergeMode: true });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });

// The list order IS the append order, which is the z-order: Node frames, their nodePort chips and the
// backend Pods in back, then the upper tier, then the wires, then the bottom strip and the packets.
export const SCENE = {
  'aria-label': 'NodePort and LoadBalancer: a NodePort opens the same port on every Node and DNATs to a backing Pod, while a LoadBalancer has the cloud-controller-manager provision an external load balancer targeting those Node ports',
  parts: [
    P.defs(),
    P.node({ key: 'node1', x: NODE_X[0], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'node2', x: NODE_X[1], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' }),
    P.node({ key: 'node3', x: NODE_X[2], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-3' }),
    P.chip({ key: 'np1', x: NODE_CX[0] - NP_W / 2, y: NP_Y, w: NP_W, h: NP_H, name: 'nodePort', value: ':31000' }),
    P.chip({ key: 'np2', x: NODE_CX[1] - NP_W / 2, y: NP_Y, w: NP_W, h: NP_H, name: 'nodePort', value: ':31000' }),
    P.chip({ key: 'np3', x: NODE_CX[2] - NP_W / 2, y: NP_Y, w: NP_W, h: NP_H, name: 'nodePort', value: ':31000' }),
    // Backends sit on the two outer Nodes, so the middle Node is the one that opens the port with no
    // Pod behind it, which is what the nodePort step narrates.
    P.pod({
      key: 'pod1', innerKey: 'pod1Box', x: NODE_CX[0] - POD_W / 2, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.1.5',
      inner: { dx: 20, dy: 30, w: POD_W - 40, h: 48, label: 'app', sublabel: 'eth0' },
    }),
    P.pod({
      key: 'pod2', innerKey: 'pod2Box', x: NODE_CX[2] - POD_W / 2, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.3.9',
      inner: { dx: 20, dy: 30, w: POD_W - 40, h: 48, label: 'app', sublabel: 'eth0' },
    }),
    P.box({ key: 'client', x: CX - CLIENT_W / 2, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H, label: 'External client', sublabel: '' }),
    P.box({ key: 'lb', x: CX - LB_W / 2, y: LB_Y, w: LB_W, h: LB_H, label: 'Cloud LoadBalancer', sublabel: 'VIP 203.0.113.7' }),
    P.box({ key: 'ccm', x: CCM_X, y: CCM_Y, w: CCM_W, h: CCM_H, label: 'cloud-controller-manager', sublabel: 'provisions the LB' }),
    P.arrow({ from: C_TO_LB[0], to: C_TO_LB[1], dashed: true, dim: true }),
    P.arrow({ from: PROVISION[0], to: PROVISION[1], dashed: true, dim: true }),
    // All three fan legs are drawn even though a step rides one: a NodePort opens the same port on
    // every Node, so the reader has to see the alternatives the balancer chose among (NET.A-03).
    P.lane({ points: TO_N1, dashed: true, dim: true }),
    P.lane({ points: TO_N2, dashed: true, dim: true }),
    P.lane({ points: TO_N3, dashed: true, dim: true }),
    P.arrow({ from: NP_TO_POD[0], to: NP_TO_POD[1], dashed: true, dim: true }),
    P.wire({ key: 'c', x: CX + 60, y: LB_Y - 12 }),
    // The bottom strip, one chip per Node column.
    P.chip({ key: 'rangeChip', x: NODE_CX[0] - CHIP_W / 2, y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'port range', value: '30000-32767' }),
    P.chip({ key: 'vipChip', x: NODE_CX[1] - CHIP_W / 2, y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'status.loadBalancer', value: 'pending' }),
    P.chip({ key: 'chainChip', x: NODE_CX[2] - CHIP_W / 2, y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'chain', value: 'KUBE-NODEPORTS' }),
    P.packets(),
  ],
  // pod1Box is a key, not a pod group: the pod-group list only resets inline pulse strokes, so the
  // .highlight the client-hit step puts on the container never came off.
  reset: {
    keys: ['client', 'lb', 'ccm', 'np1', 'np2', 'np3', 'pod1Box', 'rangeChip', 'vipChip', 'chainChip'],
    pods: ['pod1', 'pod2'],
  },
};

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { vipChip: 'pending' },
  },
  {
    id: 'nodeport',
    duration: 2300,
    narration: 'A NodePort Service reserves the same high port, here 31000 out of the 30000 to 32767 range, on every Node in the cluster. The kube-proxy adds a KUBE-NODEPORTS rule so a packet arriving on that port at any Node is treated as Service traffic, even on Nodes that run no backend Pod.',
    chips: { vipChip: 'pending' },
    // The same port opens on every Node; the chips just light, they never flash.
    lit: ['np1', 'np2', 'np3', 'chainChip'],
  },
  {
    id: 'lb-provision',
    duration: 2400,
    narration: 'Asking for type LoadBalancer makes the cloud-controller-manager provision an external load balancer in the cloud, with its backends set to every Node on the nodePort. When the balancer is ready its address is written back into status.loadBalancer.ingress, giving clients one stable VIP.',
    chips: { vipChip: '203.0.113.7' },
    lit: ['ccm', 'vipChip'],
    // ccm provisions the LB: one clean hop, the LB lights on arrival.
    flow: [
      F.segment({ from: PROVISION[0], to: PROVISION[1], lights: ['lb'] }),
    ],
  },
  {
    id: 'client-hit',
    duration: 2400,
    narration: 'An external client connects to the load balancer VIP. The balancer forwards the connection to one of its Node targets on port 31000, spreading load across the Nodes without knowing or caring which of them actually hosts a backend Pod.',
    chips: { vipChip: '203.0.113.7' },
    // The client dials, so only the client is lit at entry. The balancer and the nodePort each
    // light as the connection reaches them, which is what makes the two hops read as one path.
    lit: ['client'],
    // Each cue is its own entry because the tag rides between the packet and the box it lights, and
    // the emission order is observable.
    flow: [
      F.segment({ from: C_TO_LB[0], to: C_TO_LB[1], name: 'toLb' }),
      tag({ text: 'to 203.0.113.7', points: C_TO_LB, easing: 'linear' }),
      F.light({ targets: ['lb'], at: 'toLb' }),
      F.route({ points: TO_N1, after: 'toLb', name: 'toNode' }),
      tag({ text: 'to node-1:31000', points: TO_N1, after: 'toLb', emerge: 150 }),
      F.light({ targets: ['np1'], at: 'toNode' }),
    ],
  },
  {
    id: 'dnat',
    duration: 2400,
    narration: 'On the Node that received it, the nodePort rule DNATs the packet to a backend Pod IP. That Pod can sit on this same Node, as here, or on another Node reached across the cluster network, since kube-proxy load-balances across every backend. A single external address has now reached a private Pod.',
    chips: { vipChip: '203.0.113.7' },
    lit: ['np1'],
    // The animated path says the Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['pod1Box'],
    // nodePort DNATs to the local backend Pod (one hop), which pulses on arrival.
    flow: [
      F.segment({ from: NP_TO_POD[0], to: NP_TO_POD[1], name: 'toPod' }),
      F.pulse({ pod: 'pod1', at: 'toPod' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
