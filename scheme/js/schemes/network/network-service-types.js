import { P, F, defineCard, BEAT, OPACITY, makeRidingLabel } from './network-kit.js';

// Design notes for this card: ./CARDS/network-service-types.md

// Three columns. The proxy stack stands on CX and descends into the Node, its outside clients stand
// right of it, and the in-cluster client with CoreDNS and the external host stands left of it.
const CX = 600;
const BOX_W = 232, BOX_H = 80;                     // every actor box, the kubelet block of network-model
const STACK_X = CX - BOX_W / 2;                    // 484
const RIGHT_X = 908;                               // outside clients and the chip column
const LEFT_X = 60;                                 // CoreDNS, client Pod, external host
const STEP_Y = 140;                                // one layer to the next, a 60 unit lane between
const Y_LB = 40, Y_NP = Y_LB + STEP_Y, Y_CI = Y_NP + STEP_Y;   // 40, 180, 320
const cy = (y) => y + BOX_H / 2;                   // 80, 220, 360

// The Node frame under the stack, holding the two backend Pods either side of the spine.
const NODE_X = 350, NODE_W = 500, NODE_Y = 470, NODE_H = 624 - NODE_Y;
const POD_W = 210, POD_H = 104, POD_Y = NODE_Y + 26;
const POD_A_X = NODE_X + 20, POD_B_X = NODE_X + NODE_W - 20 - POD_W;
const POD_INNER = { dx: 20, dy: 34, w: POD_W - 40, h: 50, label: 'app', sublabel: 'eth0' };
const POD_A_CY = POD_Y + POD_H / 2;

// Left column: CoreDNS above the client Pod, the external host below it. Panel bottom measured
// 125.11 / 150.17 / 180.12 at 1600x1000 / 1280x860 / 1100x800, so CoreDNS at 190 clears it.
const DNS_Y = 190, DNS_H = BOX_H;
const CLIENT_Y = 320, CLIENT_H = 110, CLIENT_CY = CLIENT_Y + CLIENT_H / 2;   // 375
const HOST_Y = 540;
const LEFT_R = LEFT_X + BOX_W;                     // 292
const LEFT_CX = LEFT_X + BOX_W / 2;                // 176
const Q_X = LEFT_CX - 16, A_X = LEFT_CX + 16;      // query and answer lanes, an L-12 pair
const PAIR_DY = 15;                                // ClusterIP and headless leave the client as a pair

// Every hop is one points array, shared by its wire, its ball and its tag.
const HOP_CLIENT_CI = [[LEFT_R, CLIENT_CY - PAIR_DY], [STACK_X, CLIENT_CY - PAIR_DY]];
const HOP_CI_NODE = [[CX, Y_CI + BOX_H], [CX, NODE_Y]];
const HOP_NP_CI = [[CX, Y_NP + BOX_H], [CX, Y_CI]];
const HOP_LB_NP = [[CX, Y_LB + BOX_H], [CX, Y_NP]];
const HOP_OUT_NP = [[RIGHT_X, cy(Y_NP)], [STACK_X + BOX_W, cy(Y_NP)]];
const HOP_NET_LB = [[RIGHT_X, cy(Y_LB)], [STACK_X + BOX_W, cy(Y_LB)]];
const HOP_QUERY = [[Q_X, CLIENT_Y], [Q_X, DNS_Y + DNS_H]];
const HOP_ANSWER = [[A_X, DNS_Y + DNS_H], [A_X, CLIENT_Y]];
const HOP_HOST = [[LEFT_CX, CLIENT_Y + CLIENT_H], [LEFT_CX, HOST_Y]];
const HL_X = 320, HL_Y = CLIENT_CY + PAIR_DY;
const HOP_HEADLESS = [[LEFT_R, HL_Y], [HL_X, HL_Y], [HL_X, POD_A_CY], [NODE_X, POD_A_CY]];

// Every tag fades in the moment its ball leaves, so each one is placed where no block ever is.
// Tag ink spans baseline-10..baseline+2 and a character advances about 6.2 units.
const TAG_CHAR = 6.2;
// A horizontal tag rides centred over its ball, lifted above both rows it runs between.
const liftOver = (top, laneY) => top - laneY - 6;
// A vertical tag rides with its left end 8 past the right edge of the column the lane runs through.
const besideRight = (edgeX, laneX, txt) => edgeX + 8 + (txt.length * TAG_CHAR) / 2 - laneX;
const SIDE_DY = -4;                                // clears the Node frame top at the end of the spine
const STACK_R = STACK_X + BOX_W;                   // 716
// The host hop has the headless lane at x 320 on its right and the frame past it, so its tag rides
// beside the lane and LEADS the ball, fading out before it reaches the host box.
const HOST_TAG_DX = 90, LEAD_DOWN = 14;
const HL_TAG_DX = -36;                             // left of the headless lane, clears the host box at the end
const tag = makeRidingLabel({ role: 'network', outMs: 170, hold: 0, emergeMode: true });
const leadTag = makeRidingLabel({ role: 'network', outMs: 170, hold: -280, emergeMode: true });
const spineTag = (text, points, when) =>
  F.tag({ fn: tag, text, points, ...when, easing: 'linear', dx: besideRight(STACK_R, CX, text), dy: SIDE_DY });
const dnsTag = (text, points, when) =>
  F.tag({ fn: tag, text, points, ...when, easing: 'linear', dx: besideRight(LEFT_R, points[0][0], text), dy: SIDE_DY });

const CHIP_H = 34, CHIP_GAP = 10;
const chipY = (i) => Y_CI + i * (CHIP_H + CHIP_GAP);

const backend = (key, x, ip) => P.pod({
  key, innerKey: `${key}Box`, x, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web', sublabel: ip, inner: POD_INNER,
});

export const SCENE = {
  'aria-label': 'Kubernetes Service types as a stack: ClusterIP puts a virtual IP and Service rules in front of the backend Pods, NodePort adds a port on every Node that feeds those same rules, and LoadBalancer adds a cloud load balancer that typically feeds the Node port, while ExternalName and a headless Service skip the stack: CoreDNS answers with a CNAME or with the Pod IPs, and the client connects by itself',
  parts: [
    P.defs(),
    P.node({ key: 'node', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node' }),
    backend('podA', POD_A_X, '10.244.2.7'),
    backend('podB', POD_B_X, '10.244.2.8'),
    P.box({ key: 'dns', x: LEFT_X, y: DNS_Y, w: BOX_W, h: DNS_H, label: 'CoreDNS', sublabel: 'cluster DNS' }),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: LEFT_X, y: CLIENT_Y, w: BOX_W, h: CLIENT_H,
      label: 'Client Pod', sublabel: '10.244.1.5', inner: { dx: 20, dy: 34, w: BOX_W - 40, h: 50, label: 'app', sublabel: 'eth0' },
    }),
    P.box({ key: 'host', x: LEFT_X, y: HOST_Y, w: BOX_W, h: BOX_H, label: 'api.example.com', sublabel: 'outside the cluster' }),
    P.arrow({ key: 'queryLane', from: HOP_QUERY[0], to: HOP_QUERY[1], dashed: true, dim: true }),
    P.arrow({ key: 'answerLane', from: HOP_ANSWER[0], to: HOP_ANSWER[1], dashed: true, dim: true }),
    P.arrow({ key: 'hostLane', from: HOP_HOST[0], to: HOP_HOST[1], dashed: true, dim: true }),
    P.lane({ key: 'hlLane', points: HOP_HEADLESS, dashed: true, dim: true }),
    // The three layers, outermost last. Each group is one layer with the lanes that feed and leave
    // it, so a layer the step does not use recedes as one piece.
    P.group({
      key: 'ciLayer',
      parts: [
        P.box({ key: 'ci', x: STACK_X, y: Y_CI, w: BOX_W, h: BOX_H, label: 'ClusterIP', sublabel: 'virtual IP · Service rules' }),
        P.arrow({ from: HOP_CLIENT_CI[0], to: HOP_CLIENT_CI[1], dashed: true, dim: true }),
        P.arrow({ from: HOP_CI_NODE[0], to: HOP_CI_NODE[1], dashed: true, dim: true }),
      ],
    }),
    P.group({
      key: 'npLayer',
      parts: [
        P.box({ key: 'np', x: STACK_X, y: Y_NP, w: BOX_W, h: BOX_H, label: 'NodePort', sublabel: 'port on every Node' }),
        P.box({ key: 'outside', x: RIGHT_X, y: Y_NP, w: BOX_W, h: BOX_H, label: 'Client', sublabel: 'outside the cluster' }),
        P.arrow({ from: HOP_OUT_NP[0], to: HOP_OUT_NP[1], dashed: true, dim: true }),
        P.arrow({ from: HOP_NP_CI[0], to: HOP_NP_CI[1], dashed: true, dim: true }),
      ],
    }),
    P.group({
      key: 'lbLayer',
      parts: [
        P.box({ key: 'lb', x: STACK_X, y: Y_LB, w: BOX_W, h: BOX_H, label: 'LoadBalancer', sublabel: 'cloud load balancer' }),
        P.box({ key: 'internet', x: RIGHT_X, y: Y_LB, w: BOX_W, h: BOX_H, label: 'Internet client', sublabel: 'public address only' }),
        P.arrow({ from: HOP_NET_LB[0], to: HOP_NET_LB[1], dashed: true, dim: true }),
        P.arrow({ from: HOP_LB_NP[0], to: HOP_LB_NP[1], dashed: true, dim: true }),
      ],
    }),
    P.chip({ key: 'typeChip', x: RIGHT_X, y: chipY(0), w: BOX_W, h: CHIP_H, name: 'type', value: 'not set' }),
    P.chip({ key: 'ciChip', x: RIGHT_X, y: chipY(1), w: BOX_W, h: CHIP_H, name: 'clusterIP', value: 'not set' }),
    P.chip({ key: 'npChip', x: RIGHT_X, y: chipY(2), w: BOX_W, h: CHIP_H, name: 'nodePort', value: 'not set' }),
    P.chip({ key: 'lbChip', x: RIGHT_X, y: chipY(3), w: BOX_W, h: CHIP_H, name: 'LB ingress', value: 'not set' }),
    P.packets(),
  ],
  reset: {
    keys: ['dns', 'host', 'ci', 'np', 'lb', 'outside', 'internet', 'typeChip', 'ciChip', 'npChip', 'lbChip', 'clientBox', 'podABox', 'podBBox'],
    pods: ['client', 'podA', 'podB'],
  },
};

// Which layers a step uses, as one field: a layer outside this path recedes with its lanes, and so
// does whatever the left column and the backends play no part in.
const N = OPACITY.notready;
const SIDE = {
  all: { dns: 1, host: 1, queryLane: 1, answerLane: 1, hostLane: 1, hlLane: 1, podA: 1, podB: 1 },
  stack: { dns: N, host: N, queryLane: N, answerLane: N, hostLane: N, hlLane: N, podA: 1, podB: 1 },
  ext: { dns: 1, host: 1, queryLane: 1, answerLane: 1, hostLane: 1, hlLane: N, podA: N, podB: N },
  hl: { dns: 1, host: N, queryLane: 1, answerLane: 1, hostLane: N, hlLane: 1, podA: 1, podB: 1 },
};
const layers = (lb, np, ci, side) => ({ opacity: { lbLayer: lb, npLayer: np, ciLayer: ci, ...SIDE[side] } });

const VIP = '10.96.0.20';
const NODE_PORT = '31000';
const LB_IP = '203.0.113.7';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { typeChip: 'not set', ciChip: 'not set', npChip: 'not set', lbChip: 'not set' },
    ...layers(1, 1, 1, 'all'),
  },
  {
    id: 'clusterip',
    duration: 3600,
    narration: 'ClusterIP is the base layer. The Service gets a virtual IP that works only inside the cluster, and the Service rules on every Node send traffic for it to a backend Pod. Every other proxy type is built on top of this one.',
    chips: { typeChip: 'ClusterIP', ciChip: VIP, npChip: 'not set', lbChip: 'not set' },
    ...layers(N, N, 1, 'stack'),
    lit: ['typeChip', 'ciChip'],
    reducedLit: ['clientBox', 'podABox'],
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: HOP_CLIENT_CI[0], to: HOP_CLIENT_CI[1], delay: BEAT.afterPulse, name: 'vip', lights: ['ci'] }),
      F.tag({ fn: tag, text: `${VIP}:80`, points: HOP_CLIENT_CI, delay: BEAT.afterPulse, easing: 'linear', dy: liftOver(CLIENT_Y, HOP_CLIENT_CI[0][1]) }),
      F.segment({ from: HOP_CI_NODE[0], to: HOP_CI_NODE[1], after: 'vip', name: 'dnat' }),
      spineTag('DNAT 10.244.2.7', HOP_CI_NODE, { after: 'vip' }),
      F.pulse({ pod: 'podA', at: 'dnat' }),
    ],
  },
  {
    id: 'nodeport',
    duration: 4400,
    narration: `NodePort adds a layer on top. The Service keeps its ClusterIP and also opens port ${NODE_PORT} on every Node, so a client outside the cluster can reach any Node on that port. The Node port feeds the same Service rules, which pick a backend Pod.`,
    chips: { typeChip: 'NodePort', ciChip: VIP, npChip: NODE_PORT, lbChip: 'not set' },
    ...layers(N, 1, 1, 'stack'),
    lit: ['outside', 'typeChip', 'npChip'],
    reducedLit: ['podBBox'],
    flow: [
      F.segment({ from: HOP_OUT_NP[0], to: HOP_OUT_NP[1], delay: BEAT.lead, name: 'np', lights: ['np'] }),
      F.tag({ fn: tag, text: `NodeIP:${NODE_PORT}`, points: HOP_OUT_NP, delay: BEAT.lead, easing: 'linear', dy: liftOver(Y_NP, cy(Y_NP)) }),
      F.segment({ from: HOP_NP_CI[0], to: HOP_NP_CI[1], after: 'np', name: 'rules', lights: ['ci'] }),
      spineTag('same Service rules', HOP_NP_CI, { after: 'np' }),
      F.segment({ from: HOP_CI_NODE[0], to: HOP_CI_NODE[1], after: 'rules', name: 'dnat' }),
      spineTag('DNAT 10.244.2.8', HOP_CI_NODE, { after: 'rules' }),
      F.pulse({ pod: 'podB', at: 'dnat' }),
    ],
  },
  {
    id: 'loadbalancer',
    duration: 5200,
    narration: `LoadBalancer adds one more layer. A cloud balancer gets the public address ${LB_IP} and typically forwards to Node port ${NODE_PORT}, into the same Service rules. Only a balancer that sends straight to Pods should turn that Node port off.`,
    chips: { typeChip: 'LoadBalancer', ciChip: VIP, npChip: NODE_PORT, lbChip: LB_IP },
    ...layers(1, 1, 1, 'stack'),
    lit: ['internet', 'typeChip', 'lbChip'],
    reducedLit: ['podABox'],
    flow: [
      F.segment({ from: HOP_NET_LB[0], to: HOP_NET_LB[1], delay: BEAT.lead, name: 'lb', lights: ['lb'] }),
      F.tag({ fn: tag, text: `${LB_IP}:80`, points: HOP_NET_LB, delay: BEAT.lead, easing: 'linear', dy: liftOver(Y_LB, cy(Y_LB)) }),
      F.segment({ from: HOP_LB_NP[0], to: HOP_LB_NP[1], after: 'lb', name: 'np', lights: ['np'] }),
      spineTag(`NodeIP:${NODE_PORT}`, HOP_LB_NP, { after: 'lb' }),
      F.segment({ from: HOP_NP_CI[0], to: HOP_NP_CI[1], after: 'np', name: 'rules', lights: ['ci'] }),
      spineTag('same Service rules', HOP_NP_CI, { after: 'np' }),
      F.segment({ from: HOP_CI_NODE[0], to: HOP_CI_NODE[1], after: 'rules', name: 'dnat' }),
      spineTag('DNAT 10.244.2.7', HOP_CI_NODE, { after: 'rules' }),
      F.pulse({ pod: 'podA', at: 'dnat' }),
    ],
  },
  {
    id: 'externalname',
    duration: 4800,
    narration: 'ExternalName skips the whole stack. It has no selector, no ClusterIP and no proxy. The client looks up the Service name, CoreDNS answers with a CNAME to api.example.com, and the client then connects to that external host by itself.',
    chips: { typeChip: 'ExternalName', ciChip: 'not set', npChip: 'not set', lbChip: 'not set' },
    ...layers(N, N, N, 'ext'),
    lit: ['typeChip', 'ciChip', 'npChip', 'lbChip'],
    reducedLit: ['clientBox'],
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: HOP_QUERY[0], to: HOP_QUERY[1], delay: BEAT.afterPulse, name: 'q', lights: ['dns'] }),
      dnsTag('ext.default.svc', HOP_QUERY, { delay: BEAT.afterPulse }),
      F.segment({ from: HOP_ANSWER[0], to: HOP_ANSWER[1], after: 'q', name: 'ans' }),
      dnsTag('CNAME api.example.com', HOP_ANSWER, { after: 'q' }),
      F.pulse({ pod: 'client', at: 'ans' }),
      F.segment({ from: HOP_HOST[0], to: HOP_HOST[1], at: 'ans', plus: BEAT.afterPulse, name: 'conn', lights: ['host'] }),
      F.tag({ fn: leadTag, text: 'api.example.com', points: HOP_HOST, at: 'ans', plus: BEAT.afterPulse, easing: 'linear', dx: HOST_TAG_DX, dy: LEAD_DOWN }),
    ],
  },
  {
    id: 'headless',
    duration: 5100,
    narration: 'Headless also skips the stack. With clusterIP set to None there is no virtual IP and no Service rules for it. CoreDNS answers with the Pod IPs themselves, and the client connects straight to one of the same backend Pods.',
    chips: { typeChip: 'ClusterIP', ciChip: 'None', npChip: 'not set', lbChip: 'not set' },
    ...layers(N, N, N, 'hl'),
    lit: ['typeChip', 'ciChip'],
    reducedLit: ['clientBox', 'podABox'],
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: HOP_QUERY[0], to: HOP_QUERY[1], delay: BEAT.afterPulse, name: 'q', lights: ['dns'] }),
      dnsTag('web-hl.default.svc', HOP_QUERY, { delay: BEAT.afterPulse }),
      F.segment({ from: HOP_ANSWER[0], to: HOP_ANSWER[1], after: 'q', name: 'ans' }),
      dnsTag('A 10.244.2.7, 10.244.2.8', HOP_ANSWER, { after: 'q' }),
      F.pulse({ pod: 'client', at: 'ans' }),
      F.route({ points: HOP_HEADLESS, at: 'ans', plus: BEAT.afterPulse, name: 'direct' }),
      F.tag({ fn: tag, text: '10.244.2.7', points: HOP_HEADLESS, at: 'ans', plus: BEAT.afterPulse, dx: HL_TAG_DX }),
      F.pulse({ pod: 'podA', at: 'direct' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
