import { P, F, defineCard, makeRidingLabel, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS/network-nodeport-loadbalancer.md

// Two entries into ONE Node row. The client sits in the wedge between the balancer legs to Node-2
// and Node-3, the only place its lane reaches Node-2 without crossing a leg. The Service fields are
// a row of their own under the Nodes, so they read as one object and not per Node.
const SCHEME_L = 80, SCHEME_R = 1120;  // content edges, mirrored about x 600

// Node row: three equal frames spanning SCHEME_L..SCHEME_R, Pods on the OUTER two.
const NODE_W = 300, NODE_H = 228, NODE_Y = 320;   // label band, chip, hop, Pod, floor
const NODE_GAP = (SCHEME_R - SCHEME_L - 3 * NODE_W) / 2;
const NODE_X = [0, 1, 2].map(i => SCHEME_L + i * (NODE_W + NODE_GAP));
const NODE_CX = NODE_X.map(x => x + NODE_W / 2);
const NODE_CY = NODE_Y + NODE_H / 2;                                      // the cross-Node lane

const NP_W = 280, NP_H = 34, NP_Y = NODE_Y + 34;  // per-Node rule chip, under the 34 label band
const NP_BOTTOM = NP_Y + NP_H;
// Close under the rule chip: the DNAT hop is the shortest lane on the card.
const POD_W = 200, POD_H = 112, POD_Y = NP_BOTTOM + 36;

// Actor tier, every block NET.L-01 232 wide and 80 tall, right of the panel wall at x 420.
const ACTOR_W = 232, ACTOR_H = 80;
const CCM_Y = 16;                                 // straight above the balancer it provisions
const CCM_BOTTOM = CCM_Y + ACTOR_H;
const LB_X = 420, LB_Y = CCM_BOTTOM + 40;
const LB_CX = LB_X + ACTOR_W / 2;                 // the trunk drops on it into Node-2
const LB_CY = LB_Y + ACTOR_H / 2;
const LB_RIGHT = LB_X + ACTOR_W;
const LB_BOTTOM = LB_Y + ACTOR_H;
// The balancer right face carries two lanes (L-12): the Node-3 leg out above, the client lane in below.
const FACE_PAIR = 30;
// The client centres on its lane, FACE_PAIR under the balancer.
const CLIENT_X = 700;
const CLIENT_CY = LB_CY + FACE_PAIR;
const CLIENT_Y = CLIENT_CY - ACTOR_H / 2;
const CLIENT_CX = CLIENT_X + ACTOR_W / 2;
const CLIENT_BOTTOM = CLIENT_Y + ACTOR_H;
// Node-2 top face takes the trunk and the direct lane as a mirrored pair about its midpoint (L-12).
const N2_DIRECT_X = 2 * NODE_CX[1] - LB_CX;
const BUS_Y = 276;

const PROVISION = [[LB_CX, CCM_BOTTOM], [LB_CX, LB_Y]];
const C_TO_LB = [[CLIENT_X, CLIENT_CY], [LB_RIGHT, CLIENT_CY]];
const TO_N1 = [[LB_CX, LB_BOTTOM], [LB_CX, BUS_Y], [NODE_CX[0], BUS_Y], [NODE_CX[0], NODE_Y]];
const TO_N2 = [[LB_CX, LB_BOTTOM], [LB_CX, NODE_Y]];
const TO_N3 = [[LB_RIGHT, LB_CY - FACE_PAIR], [NODE_CX[2], LB_CY - FACE_PAIR], [NODE_CX[2], NODE_Y]];
const DIRECT = [[CLIENT_CX, CLIENT_BOTTOM], [CLIENT_CX, BUS_Y], [N2_DIRECT_X, BUS_Y], [N2_DIRECT_X, NODE_Y]];
// Node-2 forwards frame edge to frame edge across the gap, into Node-3.
const CROSS = [[NODE_X[1] + NODE_W, NODE_CY], [NODE_X[2], NODE_CY]];
// The nodePort rule DNATs down into the local backend Pod on Node-1.
const NP_TO_POD = [[NODE_CX[0], NP_BOTTOM], [NODE_CX[0], POD_Y]];

// Service row: five equal chips spanning the Node row, so the strip centres on x 600 (L-13).
const SVC_Y = 590, SVC_H = 34, SVC_GAP = 10;     // bottom mirrors the ccm top
const SVC_W = (SCHEME_R - SCHEME_L - 4 * SVC_GAP) / 5;   // `loadBalancer 203.0.113.7` is the widest pair
const SVC_X = [0, 1, 2, 3, 4].map(i => SCHEME_L + i * (SVC_W + SVC_GAP));
const svcChip = (i, key, name, value) => P.chip({ key, x: SVC_X[i], y: SVC_Y, w: SVC_W, h: SVC_H, name, value });

// Tags ride left of the lane so no vertical leg runs through the text, emerging once clear of the
// block the ball leaves.
const ridingLabel = makeRidingLabel({ role: 'network', emergeMode: true });
const tag = (p) => F.tag({ fn: ridingLabel, dx: -54, emerge: 180, ...p });
// The short Node-1 leg rides the catalog median speed so its tag is readable (M-12, PACING in motion.test).
const LEG_DUR = 1500;

// The list order IS the append order, which is the z-order: Node frames, their rule chips and the
// backend Pods in back, then the actor tier, then the wires, then the Service row and the packets.
export const SCENE = {
  'aria-label': 'NodePort and LoadBalancer: a NodePort Service opens the same port on every Node, so a client can dial any Node directly, even Node-2 which runs no backend and by default forwards the connection to the Pod on Node-3, while a LoadBalancer has the cloud-controller-manager provision an external balancer that typically targets that Node port on every Node, giving clients one address in front of them',
  parts: [
    P.defs(),
    P.node({ key: 'node1', x: NODE_X[0], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'node2', x: NODE_X[1], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' }),
    P.node({ key: 'node3', x: NODE_X[2], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-3' }),
    P.chip({ key: 'np1', x: NODE_CX[0] - NP_W / 2, y: NP_Y, w: NP_W, h: NP_H, name: 'chain KUBE-NODEPORTS', value: 'none' }),
    P.chip({ key: 'np2', x: NODE_CX[1] - NP_W / 2, y: NP_Y, w: NP_W, h: NP_H, name: 'chain KUBE-NODEPORTS', value: 'none' }),
    P.chip({ key: 'np3', x: NODE_CX[2] - NP_W / 2, y: NP_Y, w: NP_W, h: NP_H, name: 'chain KUBE-NODEPORTS', value: 'none' }),
    P.pod({
      key: 'pod1', innerKey: 'pod1Box', x: NODE_CX[0] - POD_W / 2, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.1.5',
      inner: { dx: 20, dy: 28, w: POD_W - 40, h: 46, label: 'app', sublabel: 'eth0' },
    }),
    P.pod({
      key: 'pod2', innerKey: 'pod2Box', x: NODE_CX[2] - POD_W / 2, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.3.9',
      inner: { dx: 20, dy: 28, w: POD_W - 40, h: 46, label: 'app', sublabel: 'eth0' },
    }),
    P.box({ key: 'ccm', x: LB_X, y: CCM_Y, w: ACTOR_W, h: ACTOR_H, label: 'cloud-controller-manager', sublabel: 'provisions the LB' }),
    P.box({ key: 'lb', x: LB_X, y: LB_Y, w: ACTOR_W, h: ACTOR_H, label: 'Cloud LoadBalancer', sublabel: 'not provisioned' }),
    P.box({ key: 'client', x: CLIENT_X, y: CLIENT_Y, w: ACTOR_W, h: ACTOR_H, label: 'External client', sublabel: '' }),
    P.arrow({ from: PROVISION[0], to: PROVISION[1], dashed: true, dim: true }),
    P.arrow({ from: C_TO_LB[0], to: C_TO_LB[1], dashed: true, dim: true }),
    // All three balancer legs are drawn though a step rides one: the balancer targets the node port on
    // EVERY Node, so the reader sees the Node it picked among drawn alternatives (NET.A-03).
    P.lane({ points: TO_N1, dashed: true, dim: true }),
    P.lane({ points: TO_N2, dashed: true, dim: true }),
    P.lane({ points: TO_N3, dashed: true, dim: true }),
    P.lane({ points: DIRECT, dashed: true, dim: true }),
    P.arrow({ from: CROSS[0], to: CROSS[1], dashed: true, dim: true }),
    P.arrow({ from: NP_TO_POD[0], to: NP_TO_POD[1], dashed: true, dim: true }),
    P.tag({ x: SVC_X[0], y: SVC_Y - 10, text: 'Service web', anchor: 'start' }),
    svcChip(0, 'typeChip', 'type', 'ClusterIP'),
    svcChip(1, 'portChip', 'port', '80'),
    svcChip(2, 'nodePortChip', 'nodePort', 'none'),
    svcChip(3, 'targetChip', 'targetPort', '8080'),
    svcChip(4, 'lbChip', 'loadBalancer', 'none'),
    P.packets(),
  ],
  // The inner app boxes are keys, not pod groups: the pod-group list only resets inline pulse strokes.
  reset: {
    keys: ['client', 'lb', 'ccm', 'np1', 'np2', 'np3', 'pod1Box', 'pod2Box', 'typeChip', 'portChip', 'nodePortChip', 'targetChip', 'lbChip'],
    pods: ['pod1', 'pod2'],
  },
};

const PORT = ':31000', NONE = 'none', LB_IP = '203.0.113.7';
// One Service, stated whole on every step. `open` is the node port reservation, which lands in five
// places at once: the Service field and the rule on each Node.
const service = (type, open, lb) => ({
  typeChip: type, portChip: '80', nodePortChip: open ? '31000' : NONE, targetChip: '8080', lbChip: lb,
  np1: open ? PORT : NONE, np2: open ? PORT : NONE, np3: open ? PORT : NONE,
});
// Until lb-provision the balancer is requested but not there: the box stands at pending with that
// sublabel, while its lanes stay at full like every lane in the section. Provisioned, it names its address.
const balancer = (up) => ({
  opacity: { lb: up ? 1 : OPACITY.pending },
  sublabels: { lb: up ? `${LB_IP}:80` : 'not provisioned' },
});

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: service('ClusterIP', false, NONE),
    ...balancer(false),
  },
  {
    id: 'nodeport',
    duration: 3350,
    narration: 'Setting type NodePort on Service web makes the control plane allocate one port from the Node port range, here 31000, and every Node proxies that same port into the Service. In its default iptables mode kube-proxy writes a KUBE-NODEPORTS rule for 31000 on each Node, Node-2 included, although it runs no backend Pod.',
    chips: service('NodePort', true, NONE),
    ...balancer(false),
    // A packet-less step: the reservation lands with the step and the highlight is its beat (M-27).
    lit: ['typeChip', 'nodePortChip', 'np1', 'np2', 'np3'],
  },
  {
    id: 'direct',
    duration: 3450,
    narration: 'No balancer is needed to use it. A client that can reach a Node dials Node-2 on port 31000 directly. Node-2 has no backend, so under the default externalTrafficPolicy Cluster its rule DNATs the connection to a ready Pod, here 10.244.3.9 on port 8080, and forwards it across the cluster network to Node-3. Node-2 SNATs it as well.',
    chips: service('NodePort', true, NONE),
    ...balancer(false),
    lit: ['client'],
    // The animated path says the Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['pod2Box'],
    flow: [
      F.route({ points: DIRECT, delay: BEAT.lead, name: 'toN2', lights: ['np2'] }),
      tag({ text: 'to Node-2:31000', points: DIRECT, delay: BEAT.lead, emerge: 420 }),
      F.segment({ from: CROSS[0], to: CROSS[1], after: 'toN2', pulse: 'pod2' }),
    ],
  },
  {
    id: 'lb-provision',
    duration: 3300,
    narration: 'Switching the type to LoadBalancer keeps that Node port by default. The cloud-controller-manager provisions an external load balancer, typically pointed at port 31000 on every Node. Creation happens asynchronously, so status.loadBalancer stays empty until 203.0.113.7 is published in status.loadBalancer.ingress.',
    chips: service('LoadBalancer', true, LB_IP),
    ...balancer(true),
    lit: ['ccm', 'typeChip'],
    // The balancer and status.loadBalancer both exist only once the provisioning hop lands, so both
    // are wound back and turn over on that arrival.
    rewind: { chips: { lbChip: NONE }, ...balancer(false) },
    flow: [
      F.segment({ from: PROVISION[0], to: PROVISION[1], delay: BEAT.lead, lights: ['lb', 'lbChip'], name: 'prov' }),
      F.set({ at: 'prov', chips: { lbChip: LB_IP }, ...balancer(true) }),
    ],
  },
  {
    id: 'client-hit',
    duration: 3900,
    narration: 'An external client now dials 203.0.113.7 on port 80 and the balancer picks a Node. A balancer that targets Node ports sends the connection to Node-1 on 31000, as drawn. One that preserves the destination, which ipMode VIP declares, would deliver it still addressed to 203.0.113.7:80, and kube-proxy catches that with its load balancer IP rule.',
    chips: service('LoadBalancer', true, LB_IP),
    ...balancer(true),
    lit: ['client'],
    flow: [
      F.segment({ from: C_TO_LB[0], to: C_TO_LB[1], delay: BEAT.lead, name: 'toLb', lights: ['lb'] }),
      F.route({ points: TO_N1, after: 'toLb', dur: LEG_DUR, name: 'toNode', lights: ['np1'] }),
      tag({ text: 'to Node-1:31000', points: TO_N1, after: 'toLb', dur: LEG_DUR }),
    ],
  },
  {
    id: 'dnat',
    duration: 3100,
    narration: 'On Node-1 the KUBE-NODEPORTS rule for 31000 DNATs the connection to the local Pod 10.244.1.5:8080. The balancer only chose the Node: under the default Cluster policy the rule picks from every ready Pod, so it could as well have picked 10.244.3.9. One external address has reached a private Pod.',
    chips: service('LoadBalancer', true, LB_IP),
    ...balancer(true),
    lit: ['np1'],
    // The animated path says the Pod was served by PULSING it, which no lights list can name.
    reducedLit: ['pod1Box'],
    flow: [
      F.segment({ from: NP_TO_POD[0], to: NP_TO_POD[1], delay: BEAT.lead, pulse: 'pod1' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
