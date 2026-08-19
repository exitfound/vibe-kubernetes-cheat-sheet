import { P, F, defineCard } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-service-types


const TYPE_X = 210, TYPE_W = 280;          // type column: left edge + width (right edge 490)
const TGT_X = 690, TGT_W = 300;            // target column: left edge + width (right edge 990)
const TYPE_EDGE = TYPE_X + TYPE_W;         // 490: where every arrow leaves the type box
const ROW_H = 70;
const PITCH = 88;                          // vertical gap between row tops
const ROW0 = 186;                          // top of the first row: the type column starts at x=210,
                                           // so every row has to clear the narration panel, measured
                                           // at bottom <= 181 (a longer narration invalidates that)
const Y_CI = ROW0, Y_NP = ROW0 + PITCH, Y_LB = ROW0 + 2 * PITCH;      // 186, 274, 362
const Y_EN = ROW0 + 3 * PITCH, Y_HL = ROW0 + 4 * PITCH;               // 450, 538
const cy = (y) => y + ROW_H / 2;           // row centre y: 221, 309, 397, 485, 573

// Backend node spans exactly the three proxy rows, so its vertical centre equals the NodePort row
// centre and the three horizontal entries land on it symmetric about that centre.
const NODE_Y = Y_CI;                                // 186
const NODE_H = (Y_LB + ROW_H) - Y_CI;              // 246, so node bottom = 432, centre = 309
const POD_W = 240, POD_H = 104;                     // core-networking pod proportions, scaled to fit
const POD_X = TGT_X + (TGT_W - POD_W) / 2;         // 720: pods centred inside the node
const POD_GAP = 22;
const POD_TOP_Y = NODE_Y + (NODE_H - (2 * POD_H + POD_GAP)) / 2;      // 194
const POD_BOT_Y = POD_TOP_Y + POD_H + POD_GAP;                       // 320

// Every row is one straight horizontal hop from the type edge to the target edge, and the wire and
// the ball that rides it share this points array.
const HOP = (y) => [[TYPE_EDGE, cy(y)], [TGT_X, cy(y)]];
const HOP_CI = HOP(Y_CI), HOP_NP = HOP(Y_NP), HOP_LB = HOP(Y_LB);
const HOP_EN = HOP(Y_EN), HOP_HL = HOP(Y_HL);

// Core-networking pod build: a shell plus an inner app/eth0 box, grouped so pulsePod animates both
// (identical shape to network-model / network-service-clusterip).
const POD_INNER = { dx: 18, dy: 34, w: POD_W - 36, h: 50, label: 'app', sublabel: 'eth0' };
const backend = (key, y, ip) => P.pod({
  key, innerKey: `${key}Box`, x: POD_X, y, w: POD_W, h: POD_H, label: 'Pod web', sublabel: ip,
  inner: POD_INNER,
});

// The list order IS the append order, which is the z-order: the shared backend node in back, then
// the type boxes + targets + Pods, then the arrows ABOVE them, then the packet layer on top.
export const SCENE = {
  'aria-label': 'Kubernetes Service types at a glance: ClusterIP is the internal base, NodePort and LoadBalancer build on it to expose backends externally, while ExternalName and the headless variant skip the proxy and work purely through DNS',
  parts: [
    P.defs(),
    // Shared backend node for the three proxy types, spanning their three rows. Two Pods inside,
    // centred and symmetric about the node centre.
    P.node({ key: 'backends', x: TGT_X, y: NODE_Y, w: TGT_W, h: NODE_H, label: '' }),
    P.box({ key: 'ci', x: TYPE_X, y: Y_CI, w: TYPE_W, h: ROW_H, label: 'ClusterIP', sublabel: '10.96.0.20 · in-cluster VIP' }),
    P.box({ key: 'np', x: TYPE_X, y: Y_NP, w: TYPE_W, h: ROW_H, label: 'NodePort', sublabel: ':31000 on every Node' }),
    P.box({ key: 'lb', x: TYPE_X, y: Y_LB, w: TYPE_W, h: ROW_H, label: 'LoadBalancer', sublabel: '203.0.113.7 · cloud VIP' }),
    P.box({ key: 'en', x: TYPE_X, y: Y_EN, w: TYPE_W, h: ROW_H, label: 'ExternalName', sublabel: 'CNAME, no selector' }),
    P.box({ key: 'hl', x: TYPE_X, y: Y_HL, w: TYPE_W, h: ROW_H, label: 'Headless', sublabel: 'clusterIP: None' }),
    backend('podTop', POD_TOP_Y, '10.244.2.7'),
    backend('podBot', POD_BOT_Y, '10.244.3.9'),
    // The two non-proxy targets, each centred on its own row.
    P.box({ key: 'extHost', x: TGT_X, y: Y_EN, w: TGT_W, h: ROW_H, label: 'api.example.com', sublabel: 'external host' }),
    P.box({ key: 'podIps', x: TGT_X, y: Y_HL, w: TGT_W, h: ROW_H, label: 'Pod IPs', sublabel: 'direct, no proxy' }),
    P.arrow({ from: HOP_CI[0], to: HOP_CI[1], dashed: true, dim: true }),
    P.arrow({ from: HOP_NP[0], to: HOP_NP[1], dashed: true, dim: true }),
    P.arrow({ from: HOP_LB[0], to: HOP_LB[1], dashed: true, dim: true }),
    P.arrow({ from: HOP_EN[0], to: HOP_EN[1], dashed: true, dim: true }),
    P.arrow({ from: HOP_HL[0], to: HOP_HL[1], dashed: true, dim: true }),
    P.packets(),
  ],
  reset: {
    keys: ['ci', 'np', 'lb', 'en', 'hl', 'backends', 'extHost', 'podIps', 'podTopBox', 'podBotBox'],
    pods: ['podTop', 'podBot'],
  },
};

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
  },
  {
    id: 'clusterip',
    duration: 2300,
    narration: 'ClusterIP is the base. It hands the Service a stable virtual IP that only works inside the cluster, and kube-proxy load-balances it across the backend Pods. Every other proxy type is built on top of this one.',
    lit: ['ci'],
    // The animated path says a backend Pod was served by PULSING it, which no lights list names.
    reducedLit: ['podTopBox'],
    // Down-arrow: the Service forwards to a backend, so the packet goes first, the backend node
    // lights and a Pod pulses on arrival. The tag names the mechanism (kube-proxy).
    flow: [
      F.segment({ from: HOP_CI[0], to: HOP_CI[1], name: 'hop' }),
      F.tag({ text: 'via kube-proxy', points: HOP_CI, easing: 'linear' }),
      F.light({ targets: ['backends'], at: 'hop' }),
      F.pulse({ pod: 'podTop', at: 'hop' }),
    ],
  },
  {
    id: 'nodeport',
    duration: 2400,
    narration: 'NodePort builds straight on ClusterIP. It keeps that internal VIP and also opens the same high port on every Node, so a client outside the cluster can hit any Node on that port and still land on a backing Pod.',
    // np first, then ci: a NodePort still contains a ClusterIP.
    lit: ['np', 'ci'],
    reducedLit: ['podTopBox'],
    flow: [
      F.segment({ from: HOP_NP[0], to: HOP_NP[1], name: 'hop' }),
      F.tag({ text: 'via kube-proxy', points: HOP_NP, easing: 'linear' }),
      F.light({ targets: ['backends'], at: 'hop' }),
      F.pulse({ pod: 'podTop', at: 'hop' }),
    ],
  },
  {
    id: 'loadbalancer',
    duration: 2400,
    narration: 'LoadBalancer builds on NodePort. It gets an external load balancer provisioned by the cloud-controller-manager, with those Node ports as its targets, so clients get one stable public address instead of a list of Nodes. It is ClusterIP plus NodePort plus a cloud VIP.',
    // The whole stack underneath lights with it.
    lit: ['lb', 'np', 'ci'],
    reducedLit: ['podBotBox'],
    flow: [
      F.segment({ from: HOP_LB[0], to: HOP_LB[1], name: 'hop' }),
      F.tag({ text: 'via kube-proxy', points: HOP_LB, easing: 'linear' }),
      F.light({ targets: ['backends'], at: 'hop' }),
      F.pulse({ pod: 'podBot', at: 'hop' }),
    ],
  },
  {
    id: 'externalname',
    duration: 2300,
    narration: 'ExternalName is the odd one out. It has no selector, no Pods and no proxy. A lookup of the Service name simply returns a CNAME that points at an external host, so the Service is just a stable in-cluster alias for something living outside.',
    lit: ['en'],
    // A packet rides the CNAME alias out to the external host. No Pod, so no pulse: the arrival
    // ripple plus the external host lighting are the only motion at the target.
    flow: [
      F.segment({ from: HOP_EN[0], to: HOP_EN[1], name: 'hop' }),
      F.tag({ text: 'CNAME', points: HOP_EN, easing: 'linear' }),
      F.light({ targets: ['extHost'], at: 'hop' }),
    ],
  },
  {
    id: 'headless',
    duration: 2400,
    narration: 'Headless is set with clusterIP None. There is no virtual IP and kube-proxy does nothing, instead DNS returns the Pod IPs directly and the client connects to a Pod itself. This is how a StatefulSet gives each Pod a stable, individually addressable name.',
    lit: ['hl'],
    // DNS returns the Pod IPs directly, so the client goes straight to a Pod with no proxy. The
    // target here is a box of IPs, not a Pod, so no pulse: ripple plus the box lighting only.
    flow: [
      F.segment({ from: HOP_HL[0], to: HOP_HL[1], name: 'hop' }),
      F.tag({ text: 'Pod IP direct', points: HOP_HL, easing: 'linear' }),
      F.light({ targets: ['podIps'], at: 'hop' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
