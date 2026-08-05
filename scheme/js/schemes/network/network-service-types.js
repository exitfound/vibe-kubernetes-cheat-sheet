import { svg, g } from '../../lib/svg.js';
import { arrowDefs, box, node, arrow, podShell } from '../../lib/primitives.js';
import { pulsePod, segmentPacket, makeInit, clearHighlights, lightBoxAt, makeRidingLabel } from './network-kit.js';
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

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'network' });

// Core-networking pod build: a shell plus an inner app/eth0 box, grouped so pulsePod animates both
// (identical shape to network-model / network-service-clusterip).
function podBlock({ x, y, label, ip }) {
  const shell = podShell({ x, y, w: POD_W, h: POD_H, label, sublabel: ip, containers: 0, role: 'network' });
  const innerBox = box({ x: x + 18, y: y + 34, w: POD_W - 36, h: 50, label: 'app', sublabel: 'eth0', role: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Kubernetes Service types at a glance: ClusterIP is the internal base, NodePort and LoadBalancer build on it to expose backends externally, while ExternalName and Headless skip the proxy and work purely through DNS',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const ci = box({ x: TYPE_X, y: Y_CI, w: TYPE_W, h: ROW_H, label: 'ClusterIP', sublabel: '10.96.0.20 · in-cluster VIP', role: 'network' });
    const np = box({ x: TYPE_X, y: Y_NP, w: TYPE_W, h: ROW_H, label: 'NodePort', sublabel: ':31000 on every Node', role: 'network' });
    const lb = box({ x: TYPE_X, y: Y_LB, w: TYPE_W, h: ROW_H, label: 'LoadBalancer', sublabel: '203.0.113.7 · cloud VIP', role: 'network' });
    const en = box({ x: TYPE_X, y: Y_EN, w: TYPE_W, h: ROW_H, label: 'ExternalName', sublabel: 'CNAME, no selector', role: 'network' });
    const hl = box({ x: TYPE_X, y: Y_HL, w: TYPE_W, h: ROW_H, label: 'Headless', sublabel: 'clusterIP: None', role: 'network' });

    // Shared backend node for the three proxy types, spanning their three rows. Two Pods inside,
    // centred and symmetric about the node centre.
    const backends = node({ x: TGT_X, y: NODE_Y, w: TGT_W, h: NODE_H, label: '' });
    const podTop = podBlock({ x: POD_X, y: POD_TOP_Y, label: 'Pod web', ip: '10.244.2.7' });
    const podBot = podBlock({ x: POD_X, y: POD_BOT_Y, label: 'Pod web', ip: '10.244.3.9' });

    // The two non-proxy targets, each centred on its own row.
    const extHost = box({ x: TGT_X, y: Y_EN, w: TGT_W, h: ROW_H, label: 'api.example.com', sublabel: 'external host', role: 'network' });
    const podIps = box({ x: TGT_X, y: Y_HL, w: TGT_W, h: ROW_H, label: 'Pod IPs', sublabel: 'direct, no proxy', role: 'network' });

    const aCI = arrow({ x1: TYPE_EDGE, y1: cy(Y_CI), x2: TGT_X, y2: cy(Y_CI), dashed: true, dim: true, role: 'network' });
    const aNP = arrow({ x1: TYPE_EDGE, y1: cy(Y_NP), x2: TGT_X, y2: cy(Y_NP), dashed: true, dim: true, role: 'network' });
    const aLB = arrow({ x1: TYPE_EDGE, y1: cy(Y_LB), x2: TGT_X, y2: cy(Y_LB), dashed: true, dim: true, role: 'network' });
    const aEN = arrow({ x1: TYPE_EDGE, y1: cy(Y_EN), x2: TGT_X, y2: cy(Y_EN), dashed: true, dim: true, role: 'network' });
    const aHL = arrow({ x1: TYPE_EDGE, y1: cy(Y_HL), x2: TGT_X, y2: cy(Y_HL), dashed: true, dim: true, role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: backend node, then type boxes + targets + pods, then arrows ABOVE, then packets on top.
    root.appendChild(backends);
    [ci, np, lb, en, hl, podTop.group, podBot.group, extHost, podIps].forEach(el => root.appendChild(el));
    [aCI, aNP, aLB, aEN, aHL].forEach(el => root.appendChild(el));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, ci, np, lb, en, hl, backends, extHost, podIps,
      podTop: podTop.group, podTopBox: podTop.innerBox,
      podBot: podBot.group, podBotBox: podBot.innerBox,
      packetLayer, wires: {},
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['ci', 'np', 'lb', 'en', 'hl', 'backends', 'extHost', 'podIps', 'podTopBox', 'podBotBox'],
    [s.refs.podTop, s.refs.podBot]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
    },
  },
  {
    id: 'clusterip',
    duration: 2300,
    narration: 'ClusterIP is the base. It hands the Service a stable virtual IP that only works inside the cluster, and kube-proxy load-balances it across the backend Pods. Every other proxy type is built on top of this one.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.ci.classList.add('highlight');
      if (ctx.reduced) { s.refs.backends.classList.add('highlight'); s.refs.podTopBox.classList.add('highlight'); return; }
      // Down-arrow: the Service forwards to a backend, so the packet goes first, the backend node
      // lights and a Pod pulses on arrival. The tag names the mechanism (kube-proxy).
      const from = [TYPE_EDGE, cy(Y_CI)], to = [TGT_X, cy(Y_CI)];
      const hop = segmentPacket(s, ctx, { from, to, role: 'network' });
      ridingLabel(s, ctx, 'via kube-proxy', [from, to], { easing: 'linear' });
      lightBoxAt(s.refs.backends, ctx, hop.arrivalMs);
      pulsePod(s.refs.podTop, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'nodeport',
    duration: 2400,
    narration: 'NodePort builds straight on ClusterIP. It keeps that internal VIP and also opens the same high port on every Node, so a client outside the cluster can hit any Node on that port and still land on a backing Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.np.classList.add('highlight');
      s.refs.ci.classList.add('highlight');   // it still contains a ClusterIP
      if (ctx.reduced) { s.refs.backends.classList.add('highlight'); s.refs.podTopBox.classList.add('highlight'); return; }
      const from = [TYPE_EDGE, cy(Y_NP)], to = [TGT_X, cy(Y_NP)];
      const hop = segmentPacket(s, ctx, { from, to, role: 'network' });
      ridingLabel(s, ctx, 'via kube-proxy', [from, to], { easing: 'linear' });
      lightBoxAt(s.refs.backends, ctx, hop.arrivalMs);
      pulsePod(s.refs.podTop, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'loadbalancer',
    duration: 2400,
    narration: 'LoadBalancer builds on NodePort. It gets an external load balancer provisioned by the cloud-controller-manager, with those Node ports as its targets, so clients get one stable public address instead of a list of Nodes. It is ClusterIP plus NodePort plus a cloud VIP.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.lb.classList.add('highlight');
      s.refs.np.classList.add('highlight');   // the whole stack underneath
      s.refs.ci.classList.add('highlight');
      if (ctx.reduced) { s.refs.backends.classList.add('highlight'); s.refs.podBotBox.classList.add('highlight'); return; }
      const from = [TYPE_EDGE, cy(Y_LB)], to = [TGT_X, cy(Y_LB)];
      const hop = segmentPacket(s, ctx, { from, to, role: 'network' });
      ridingLabel(s, ctx, 'via kube-proxy', [from, to], { easing: 'linear' });
      lightBoxAt(s.refs.backends, ctx, hop.arrivalMs);
      pulsePod(s.refs.podBot, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'externalname',
    duration: 2300,
    narration: 'ExternalName is the odd one out. It has no selector, no Pods and no proxy. A lookup of the Service name simply returns a CNAME that points at an external host, so the Service is just a stable in-cluster alias for something living outside.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.en.classList.add('highlight');
      if (ctx.reduced) { s.refs.extHost.classList.add('highlight'); return; }
      // A packet rides the CNAME alias out to the external host. No Pod, so no pulse: the arrival
      // ripple plus the external host lighting are the only motion at the target.
      const from = [TYPE_EDGE, cy(Y_EN)], to = [TGT_X, cy(Y_EN)];
      const hop = segmentPacket(s, ctx, { from, to, role: 'network' });
      ridingLabel(s, ctx, 'CNAME', [from, to], { easing: 'linear' });
      lightBoxAt(s.refs.extHost, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'headless',
    duration: 2400,
    narration: 'Headless is set with clusterIP None. There is no virtual IP and kube-proxy does nothing, instead DNS returns the Pod IPs directly and the client connects to a Pod itself. This is how a StatefulSet gives each Pod a stable, individually addressable name.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.hl.classList.add('highlight');
      if (ctx.reduced) { s.refs.podIps.classList.add('highlight'); return; }
      // DNS returns the Pod IPs directly, so the client goes straight to a Pod with no proxy. The
      // target here is a box of IPs, not a Pod, so no pulse: ripple plus the box lighting only.
      const from = [TYPE_EDGE, cy(Y_HL)], to = [TGT_X, cy(Y_HL)];
      const hop = segmentPacket(s, ctx, { from, to, role: 'network' });
      ridingLabel(s, ctx, 'Pod IP direct', [from, to], { easing: 'linear' });
      lightBoxAt(s.refs.podIps, ctx, hop.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
