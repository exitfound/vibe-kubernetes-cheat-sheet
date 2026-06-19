import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, arrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. One left to
// right lane along y360 chains the whole north-south path: external client -> cloud load balancer
// -> Node (NodePort) -> kube-proxy DNAT -> backend Pod. The DNAT happens INSIDE kube-proxy. The
// client, LB and kube-proxy are infrastructure (they light, never pulse); only the backend Pod
// pulses. The reply retraces the same lane.
const LANE_Y = 360;
const CLIENT_EDGE = 250;
const LB_LEFT = 320, LB_RIGHT = 500;
const KP_LEFT = 600, KP_RIGHT = 780;
const POD_LEFT = 860;

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 34, w: w - 40, h: 52, label: 'app', sublabel: 'eth0', cat: 'network' });
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
      'aria-label': 'North-south request path: an external client reaches the cloud load balancer at its public IP, the LB forwards to a Node on the service NodePort, kube-proxy on that Node DNATs the packet to a backing Pod IP and conntrack pins the flow, the Pod serves the request, and the reply retraces the same path',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = box({ x: 70, y: 328, w: 180, h: 64, label: 'external client', sublabel: 'internet', cat: 'network' });
    const lb = box({ x: 320, y: 328, w: 180, h: 64, label: 'cloud LB', sublabel: '203.0.113.9', cat: 'network' });
    const theNode = node({ x: 560, y: 248, w: 620, h: 300, label: 'Node   ·   192.168.1.20' });
    const kproxy = box({ x: 600, y: 328, w: 180, h: 64, label: 'kube-proxy', sublabel: 'NodePort 31000', cat: 'network' });
    const podX = podBlock({ x: 860, y: 300, w: 220, h: 120, label: 'Pod web', ip: '10.244.2.7:8080' });

    const cWire = arrow({ x1: CLIENT_EDGE, y1: LANE_Y, x2: LB_LEFT, y2: LANE_Y, dashed: true, dim: true, color: 'network' });
    const lWire = arrow({ x1: LB_RIGHT, y1: LANE_Y, x2: KP_LEFT, y2: LANE_Y, dashed: true, dim: true, color: 'network' });
    const kWire = arrow({ x1: KP_RIGHT, y1: LANE_Y, x2: POD_LEFT, y2: LANE_Y, dashed: true, dim: true, color: 'network' });
    const cLabel = text({ class: 'scheme-label code dim', x: 285, y: LANE_Y - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const lLabel = text({ class: 'scheme-label code dim', x: 550, y: LANE_Y - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const kLabel = text({ class: 'scheme-label code dim', x: 820, y: LANE_Y - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    const stageChip = valChip({ x: 80,  y: 566, w: 250, h: 34, name: 'stage', value: 'idle', cat: 'network' });
    const dstChip   = valChip({ x: 350, y: 566, w: 250, h: 34, name: 'dst', value: '203.0.113.9:443', cat: 'network' });
    const dnatChip  = valChip({ x: 620, y: 566, w: 250, h: 34, name: 'DNAT', value: 'none', cat: 'network' });
    const backChip  = valChip({ x: 890, y: 566, w: 230, h: 34, name: 'backend', value: 'none', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: Node background, then client + LB + kube-proxy + Pod, then wires + labels above,
    // then chips, then the packet layer on top.
    root.appendChild(theNode);
    root.appendChild(client);
    root.appendChild(lb);
    root.appendChild(kproxy);
    root.appendChild(podX.group);
    [cWire, lWire, kWire, cLabel, lLabel, kLabel].forEach(el => root.appendChild(el));
    [stageChip, dstChip, dnatChip, backChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, client, lb, theNode, kproxy, podX: podX.group, podXBox: podX.innerBox,
      stageChip, dstChip, dnatChip, backChip,
      packetLayer, wires: { c: cLabel, l: lLabel, k: kLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['client', 'lb', 'kproxy', 'stageChip', 'dstChip', 'dnatChip', 'backChip'], [s.refs.podX]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A request from the public internet does not reach a Pod in one jump. It crosses a chain of hops, each doing one job, until kube-proxy finally hands it to a backend. This is the full north-south path that a LoadBalancer Service sets up.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.stageChip, 'idle');
      setVal(s.refs.dstChip, '203.0.113.9:443');
      setVal(s.refs.dnatChip, 'none');
      setVal(s.refs.backChip, 'none');
    },
  },
  {
    id: 'lb',
    duration: 2300,
    narration: 'The client connects to the public IP, which belongs to a cloud load balancer provisioned for the LoadBalancer Service. The LB is the only address exposed to the internet, and it picks one healthy Node to forward the connection to.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'c', 'dst 203.0.113.9:443');
      s.refs.lb.classList.add('highlight');
      s.refs.dstChip.classList.add('highlight');
      setVal(s.refs.stageChip, 'load balancer');
      setVal(s.refs.dstChip, '203.0.113.9:443');
      if (ctx.reduced) { s.refs.client.classList.add('highlight'); return; }
      const hop = segmentPacket(s, ctx, { from: [CLIENT_EDGE, LANE_Y], to: [LB_LEFT, LANE_Y], cat: 'network' });
      lightBoxAt(s.refs.lb, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'nodeport',
    duration: 2400,
    narration: 'The load balancer forwards to the chosen Node on the service NodePort, a high port opened on every Node. kube-proxy is the thing listening there, so the packet lands in its lap with the destination still the Node IP and that port.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'l', 'dst 192.168.1.20:31000');
      s.refs.kproxy.classList.add('highlight');
      s.refs.dstChip.classList.add('highlight');
      setVal(s.refs.stageChip, 'NodePort');
      setVal(s.refs.dstChip, 'node:31000');
      if (ctx.reduced) { s.refs.lb.classList.add('highlight'); return; }
      const hop = segmentPacket(s, ctx, { from: [LB_RIGHT, LANE_Y], to: [KP_LEFT, LANE_Y], cat: 'network' });
      lightBoxAt(s.refs.kproxy, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'dnat',
    duration: 2600,
    narration: 'kube-proxy applies the Service rules: it DNATs the destination to a backing Pod IP and conntrack pins the flow so every later packet takes the same backend. The rewritten packet is delivered to the Pod, which serves the request on its real port.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'k', 'dst 10.244.2.7:8080');
      s.refs.kproxy.classList.add('highlight');
      s.refs.dnatChip.classList.add('highlight');
      s.refs.backChip.classList.add('highlight');
      setVal(s.refs.stageChip, 'DNAT');
      setVal(s.refs.dnatChip, '-> 10.244.2.7:8080');
      setVal(s.refs.backChip, '10.244.2.7');
      if (ctx.reduced) { s.refs.podXBox.classList.add('highlight'); return; }
      // The DNAT-ed packet emerges from kube-proxy (rewrite happened inside) and is delivered to
      // the backend Pod, which pulses on arrival.
      const give = segmentPacket(s, ctx, { from: [KP_RIGHT, LANE_Y], to: [POD_LEFT, LANE_Y], cat: 'network' });
      pulsePod(s.refs.podX, ctx, give.arrivalMs);
    },
  },
  {
    id: 'reply',
    duration: 3000,
    narration: 'The Pod replies and the response retraces the chain in reverse: conntrack on the Node undoes the DNAT, the load balancer forwards it back, and the client sees a reply that appears to come straight from the public IP it dialed. Every hop the request crossed is unwound on the way out.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'c', 'src 203.0.113.9:443');
      s.refs.kproxy.classList.add('highlight');
      s.refs.lb.classList.add('highlight');
      s.refs.backChip.classList.add('highlight');
      setVal(s.refs.stageChip, 'reply retraces');
      setVal(s.refs.dnatChip, 'reverse NAT');
      if (ctx.reduced) { s.refs.client.classList.add('highlight'); return; }
      // Reply retraces Pod -> kube-proxy (reverse NAT inside) -> LB -> client, each hop chained off
      // the previous arrival. The client is infra, so it lights on the final arrival.
      const h1 = segmentPacket(s, ctx, { from: [POD_LEFT, LANE_Y], to: [KP_RIGHT, LANE_Y], cat: 'network' });
      const h2 = segmentPacket(s, ctx, { from: [KP_LEFT, LANE_Y], to: [LB_RIGHT, LANE_Y], delay: h1.arrivalMs + BEAT.afterHop, cat: 'network' });
      const h3 = segmentPacket(s, ctx, { from: [LB_LEFT, LANE_Y], to: [CLIENT_EDGE, LANE_Y], delay: h2.arrivalMs + BEAT.afterHop, cat: 'network' });
      lightBoxAt(s.refs.client, ctx, h3.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
