import { svg, g } from '../lib/svg.js';
import { arrowDefs, box, pod, node, arrow } from '../lib/primitives.js';
import { pulsePod, segmentPacket, makeInit, clearHighlights } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): this is a MAP card, not a traffic flow. The top-left band
// (x<=380, y<=300) is left empty for the narration overlay, so the whole map lives at x>=400.
// Five Service-type rows on the left point to their targets on the right. ClusterIP, NodePort
// and LoadBalancer all proxy to the same backend Pods (they stack: each builds on the one above),
// while ExternalName and Headless are the odd ones out (no proxy, no selector).
// Standard contract: only Pods pulse, boxes light via .highlight, packets ride the arrows and
// the static arrow endpoints match the packet endpoints.
const TYPE_X = 400, TYPE_W = 280;          // type box left edge + width
const TGT_X = 860;                         // targets start here
const Y_CI = 120, Y_NP = 214, Y_LB = 308, Y_EN = 402, Y_HL = 496;   // row top y for each type
const ROW_H = 70;
const cy = (y) => y + ROW_H / 2;           // row centre y

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

    const ci = box({ x: TYPE_X, y: Y_CI, w: TYPE_W, h: ROW_H, label: 'ClusterIP', sublabel: '10.96.0.10 . in-cluster VIP', cat: 'network' });
    const np = box({ x: TYPE_X, y: Y_NP, w: TYPE_W, h: ROW_H, label: 'NodePort', sublabel: ':31000 on every Node', cat: 'network' });
    const lb = box({ x: TYPE_X, y: Y_LB, w: TYPE_W, h: ROW_H, label: 'LoadBalancer', sublabel: '203.0.113.7 . cloud VIP', cat: 'network' });
    const en = box({ x: TYPE_X, y: Y_EN, w: TYPE_W, h: ROW_H, label: 'ExternalName', sublabel: 'CNAME, no selector', cat: 'network' });
    const hl = box({ x: TYPE_X, y: Y_HL, w: TYPE_W, h: ROW_H, label: 'Headless', sublabel: 'clusterIP: None', cat: 'network' });

    // Shared backend block for the three proxy types. Two Pods inside.
    const backends = node({ x: TGT_X, y: 120, w: 300, h: 250, label: 'Service backends' });
    const podTop = podBlock({ x: TGT_X + 35, y: 162, label: 'Pod web', ip: '10.244.2.7' });
    const podBot = podBlock({ x: TGT_X + 35, y: 262, label: 'Pod web', ip: '10.244.3.9' });

    // The two non-proxy targets.
    const extHost = box({ x: TGT_X, y: 410, w: 300, h: 64, label: 'api.example.com', sublabel: 'external host', cat: 'network' });
    const podIps = box({ x: TGT_X, y: 500, w: 300, h: 64, label: 'Pod IPs', sublabel: 'direct, no proxy', cat: 'network' });

    // Dim dashed arrows, each from a type box to its target. Endpoints match the packet routes.
    const aCI = arrow({ x1: TYPE_X + TYPE_W, y1: cy(Y_CI), x2: TGT_X + 30, y2: 200, dashed: true, dim: true });
    const aNP = arrow({ x1: TYPE_X + TYPE_W, y1: cy(Y_NP), x2: TGT_X + 30, y2: 245, dashed: true, dim: true });
    const aLB = arrow({ x1: TYPE_X + TYPE_W, y1: cy(Y_LB), x2: TGT_X + 30, y2: 300, dashed: true, dim: true });
    const aEN = arrow({ x1: TYPE_X + TYPE_W, y1: cy(Y_EN), x2: TGT_X, y2: cy(Y_EN), dashed: true, dim: true });
    const aHL = arrow({ x1: TYPE_X + TYPE_W, y1: cy(Y_HL), x2: TGT_X, y2: cy(Y_HL), dashed: true, dim: true });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: backend node, then type boxes + targets, then arrows ABOVE, then packets on top.
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

function podBlock({ x, y, label, ip }) {
  const shell = pod({ x, y, w: 230, h: 74, label, sublabel: ip, containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 150, y: y + 20, w: 64, h: 36, label: 'eth0', cat: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function clearHL(s) {
  clearHighlights(s, ['ci', 'np', 'lb', 'en', 'hl', 'backends', 'extHost', 'podIps', 'podTopBox', 'podBotBox'],
    [s.refs.podTop, s.refs.podBot]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'There are five Service types, but they are not five unrelated things. Three of them stack, each building on the one above, and two of them skip the proxy entirely and work through DNS alone.',
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
      s.refs.backends.classList.add('highlight');
      if (ctx.reduced) { s.refs.podTopBox.classList.add('highlight'); return; }
      // Down-arrow: the Service forwards to a backend, so the packet goes first and the Pod
      // pulses on arrival.
      const hop = segmentPacket(s, ctx, { from: [TYPE_X + TYPE_W, cy(Y_CI)], to: [TGT_X + 30, 200], cat: 'network' });
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
      s.refs.backends.classList.add('highlight');
      if (ctx.reduced) { s.refs.podTopBox.classList.add('highlight'); return; }
      const hop = segmentPacket(s, ctx, { from: [TYPE_X + TYPE_W, cy(Y_NP)], to: [TGT_X + 30, 245], cat: 'network' });
      pulsePod(s.refs.podTop, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'loadbalancer',
    duration: 2400,
    narration: 'LoadBalancer builds on NodePort. The cloud-controller-manager provisions an external load balancer whose targets are those Node ports, so clients get one stable public address instead of a list of Nodes. It is ClusterIP plus NodePort plus a cloud VIP.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.lb.classList.add('highlight');
      s.refs.np.classList.add('highlight');   // the whole stack underneath
      s.refs.ci.classList.add('highlight');
      s.refs.backends.classList.add('highlight');
      if (ctx.reduced) { s.refs.podBotBox.classList.add('highlight'); return; }
      const hop = segmentPacket(s, ctx, { from: [TYPE_X + TYPE_W, cy(Y_LB)], to: [TGT_X + 30, 300], cat: 'network' });
      pulsePod(s.refs.podBot, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'externalname',
    duration: 2300,
    narration: 'ExternalName is the odd one out. It has no selector, no Pods and no proxy. CoreDNS simply returns a CNAME that points the name at an external host, so the Service is just a stable in-cluster alias for something living outside.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.en.classList.add('highlight');
      s.refs.extHost.classList.add('highlight');
      if (ctx.reduced) return;
      // A packet rides the alias out to the external host. No Pod, no pulse, the arrival ripple
      // is the only motion at the target.
      segmentPacket(s, ctx, { from: [TYPE_X + TYPE_W, cy(Y_EN)], to: [TGT_X, cy(Y_EN)], cat: 'network' });
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
      s.refs.podIps.classList.add('highlight');
      if (ctx.reduced) return;
      segmentPacket(s, ctx, { from: [TYPE_X + TYPE_W, cy(Y_HL)], to: [TGT_X, cy(Y_HL)], cat: 'network' });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
