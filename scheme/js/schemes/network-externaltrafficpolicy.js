import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// externalTrafficPolicy Cluster vs Local (viewBox 1200x640). Client above the LB, the LB fans down
// to two Nodes; Node-1 has a local backend, Node-2 has none. In Cluster mode the packet that lands
// on Node-2 is SNAT-ed and forwarded across the underlay lane to the Pod on Node-1; in Local mode
// the Node-1 path is straight. Standard contract: Pod is shell + inner box; only the Pod pulses;
// value chips never flash; packets ride wires and the underlay, stopping at edges.
const TO_N1 = [[600, 204], [600, 235], [300, 235], [300, 250]];
const TO_N2 = [[600, 204], [600, 235], [870, 235], [870, 250]];
const CROSS = [[870, 450], [870, 490], [300, 490], [300, 438]]; // Node-2 -> underlay -> Pod on Node-1

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 32, w: w - 40, h: 52, label: 'app', sublabel: 'eth0', cat: 'network' });
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
      'aria-label': 'ExternalTrafficPolicy Cluster versus Local: Cluster forwards to a backend on any node but SNATs away the client IP, while Local keeps the client IP and avoids the extra hop at the cost of dropping traffic on nodes with no local backend',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = box({ x: 480, y: 50, w: 240, h: 58, label: 'external client', sublabel: 'src 198.51.100.9', cat: 'network' });
    const lb     = box({ x: 450, y: 132, w: 300, h: 74, label: 'LoadBalancer', sublabel: 'targets node ports', cat: 'network' });

    const cWire = arrow({ x1: 600, y1: 108, x2: 600, y2: 132, dashed: true, dim: true, color: 'network' });
    const fan1 = pathArrow({ points: TO_N1, dashed: true, dim: true, color: 'network' });
    const fan2 = pathArrow({ points: TO_N2, dashed: true, dim: true, color: 'network' });
    const crossWire = pathArrow({ points: CROSS, dashed: true, dim: true, color: 'network' });
    const wireLabel = text({ class: 'scheme-label code dim', x: 600, y: 124, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    const node1 = node({ x: 110, y: 250, w: 440, h: 200, label: 'Node-1   ·   has local backend' });
    const node2 = node({ x: 650, y: 250, w: 440, h: 200, label: 'Node-2   ·   no local backend' });
    const podW = podBlock({ x: 180, y: 312, w: 240, h: 126, label: 'Pod web', ip: '10.244.1.5' });
    const node2Note = text({ class: 'scheme-label code dim', x: 870, y: 360, 'text-anchor': 'middle', 'font-size': 11 }, [' ']);

    const modeChip = valChip({ x: 80,  y: 548, w: 300, h: 34, name: 'externalTrafficPolicy', value: 'Cluster', cat: 'network' });
    const srcChip  = valChip({ x: 400, y: 548, w: 280, h: 34, name: 'client src IP', value: 'lost (SNAT)', cat: 'network' });
    const hopChip  = valChip({ x: 700, y: 548, w: 180, h: 34, name: 'extra hop', value: 'yes', cat: 'network' });
    const hcChip   = valChip({ x: 900, y: 548, w: 220, h: 34, name: 'healthCheck', value: 'unused', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    root.appendChild(node1);
    root.appendChild(node2);
    root.appendChild(podW.group);
    root.appendChild(client);
    root.appendChild(lb);
    [cWire, fan1, fan2, crossWire, wireLabel, node2Note].forEach(el => root.appendChild(el));
    [modeChip, srcChip, hopChip, hcChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, client, lb, node1, node2, podW: podW.group, podWBox: podW.innerBox,
      modeChip, srcChip, hopChip, hcChip,
      packetLayer, wires: { w: wireLabel, n2: node2Note },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['client', 'lb', 'modeChip', 'srcChip', 'hopChip', 'hcChip'], [s.refs.podW]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A LoadBalancer sends external traffic to Node ports, but the backing Pods are not evenly spread: Node-1 runs one, Node-2 runs none. How the Node handles that gap is decided by the Service externalTrafficPolicy.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.modeChip, 'Cluster');
      setVal(s.refs.srcChip, 'lost (SNAT)');
      setVal(s.refs.hopChip, 'yes');
      setVal(s.refs.hcChip, 'unused');
    },
  },
  {
    id: 'cluster',
    duration: 2700,
    narration: 'With the default policy Cluster, every Node accepts the traffic even with no local Pod. The balancer happens to pick Node-2, which has no backend, so the Node SNATs the packet and forwards it across the cluster network to the Pod on Node-1. Load spreads evenly across all Nodes.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'w', 'src 198.51.100.9');
      setVal(s.refs.modeChip, 'Cluster');
      s.refs.lb.classList.add('highlight');
      s.refs.modeChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.podWBox.classList.add('highlight'); return; }
      // LB -> Node-2 (no backend), then SNAT and forward across the underlay to the Pod on Node-1,
      // which pulses on arrival. The ball is hidden inside Node-2 between the two legs.
      const toN2 = routePacket(s, ctx, TO_N2, { cat: 'network' });
      const hop = routePacket(s, ctx, CROSS, { delay: toN2.arrivalMs + BEAT.afterHop, cat: 'network' });
      pulsePod(s.refs.podW, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'cluster-cost',
    duration: 2300,
    narration: 'That convenience has a cost. The extra Node-to-Node hop adds latency, and because Node-2 had to SNAT, the Pod sees the packet as coming from the Node, not from 198.51.100.9. The real client IP is gone, which breaks source-IP allowlists and access logs.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.srcChip, 'lost (SNAT)');
      setVal(s.refs.hopChip, 'yes');
      s.refs.srcChip.classList.add('highlight');
      s.refs.hopChip.classList.add('highlight');
      // Reflective beat: the cost chips just light, no flash.
    },
  },
  {
    id: 'local',
    duration: 2500,
    narration: 'Switching to externalTrafficPolicy Local changes the rules. A Node only serves the request from its own local Pods, never forwarding to another Node. The balancer sends to Node-1, the packet goes straight to its Pod with no SNAT, so the Pod sees the true client IP 198.51.100.9 and there is no extra hop.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'w', 'src 198.51.100.9 preserved');
      setVal(s.refs.modeChip, 'Local');
      setVal(s.refs.srcChip, 'preserved');
      setVal(s.refs.hopChip, 'no');
      s.refs.lb.classList.add('highlight');
      s.refs.modeChip.classList.add('highlight');
      s.refs.srcChip.classList.add('highlight');
      s.refs.hopChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.podWBox.classList.add('highlight'); return; }
      // LB -> Node-1 (right-angle fan), then straight down into the local Pod, which pulses.
      const toN1 = routePacket(s, ctx, TO_N1, { cat: 'network' });
      const toPod = segmentPacket(s, ctx, { from: [300, 250], to: [300, 312], delay: toN1.arrivalMs + BEAT.afterHop, cat: 'network' });
      pulsePod(s.refs.podW, ctx, toPod.arrivalMs);
    },
  },
  {
    id: 'healthcheck',
    duration: 2500,
    narration: 'But Local would silently drop traffic that lands on Node-2, which has no Pod to serve it. To avoid that, Local exposes a healthCheckNodePort that reports healthy only on Nodes with a local backend, so the load balancer stops sending to Node-2 and targets only Node-1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'n2', 'health: 0 local pods');
      setVal(s.refs.hcChip, 'used');
      setVal(s.refs.modeChip, 'Local');
      s.refs.hcChip.classList.add('highlight');
      s.refs.lb.classList.add('highlight');
      if (ctx.reduced) { s.refs.podWBox.classList.add('highlight'); return; }
      // The health check excludes Node-2, so the LB steers only to Node-1 and its local Pod pulses.
      const toN1 = routePacket(s, ctx, TO_N1, { cat: 'network' });
      const toPod = segmentPacket(s, ctx, { from: [300, 250], to: [300, 312], delay: toN1.arrivalMs + BEAT.afterHop, cat: 'network' });
      pulsePod(s.refs.podW, ctx, toPod.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
