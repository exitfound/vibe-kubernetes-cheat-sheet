import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// NodePort and LoadBalancer (viewBox 1200x640). External client sits above the LB (top-left is the
// narration zone), the LB fans down to every Node through a right-angle bus, and the chosen Node
// DNATs to a backing Pod. Standard contract: Pods are shell + inner box; only Pods pulse; value
// chips never flash; a packet-less pod-less step gets one box flash. Packets stop at block edges.
const FAN_BUS_Y = 286;
const TO_N1 = [[600, 230], [600, FAN_BUS_Y], [230, FAN_BUS_Y], [230, 320]];
const TO_N2 = [[600, 230], [600, 320]];
const TO_N3 = [[600, 230], [600, FAN_BUS_Y], [970, FAN_BUS_Y], [970, 320]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}
function flashBox(s, ctx, key) {
  if (ctx.reduced) return;
  const el = s.refs[key];
  if (!el) return;
  ctx.register(el.animate(
    [{ filter: 'brightness(1)' }, { filter: 'brightness(1.5)' }, { filter: 'brightness(1)' }],
    { duration: 600, easing: 'ease-out' }
  ));
}
function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 30, w: w - 40, h: 48, label: 'app', sublabel: 'eth0', cat: 'network' });
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
      'aria-label': 'NodePort and LoadBalancer: a NodePort opens the same port on every node and DNATs to a backing Pod, while a LoadBalancer has the cloud-controller-manager provision an external load balancer targeting those node ports',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = box({ x: 480, y: 56, w: 240, h: 64, label: 'external client', sublabel: '', cat: 'network' });
    const lb     = box({ x: 450, y: 150, w: 300, h: 80, label: 'cloud LoadBalancer', sublabel: 'VIP 203.0.113.7', cat: 'network' });
    const ccm    = box({ x: 800, y: 152, w: 290, h: 76, label: 'cloud-controller-mgr', sublabel: 'provisions the LB', cat: 'network' });

    const cWire = arrow({ x1: 600, y1: 120, x2: 600, y2: 150, dashed: true, dim: true, color: 'network' });
    const provWire = arrow({ x1: 800, y1: 190, x2: 750, y2: 190, dashed: true, dim: true, color: 'network' });
    const fan1 = pathArrow({ points: TO_N1, dashed: true, dim: true, color: 'network' });
    const fan2 = pathArrow({ points: TO_N2, dashed: true, dim: true, color: 'network' });
    const fan3 = pathArrow({ points: TO_N3, dashed: true, dim: true, color: 'network' });
    const cWireLabel = text({ class: 'scheme-label code dim', x: 660, y: 138, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    const node1 = node({ x: 80,  y: 320, w: 300, h: 232, label: 'Node-1' });
    const node2 = node({ x: 450, y: 320, w: 300, h: 232, label: 'Node-2' });
    const node3 = node({ x: 820, y: 320, w: 300, h: 232, label: 'Node-3' });

    const np1 = valChip({ x: 100, y: 352, w: 260, h: 32, name: 'nodePort', value: ':31000', cat: 'network' });
    const np2 = valChip({ x: 470, y: 352, w: 260, h: 32, name: 'nodePort', value: ':31000', cat: 'network' });
    const np3 = valChip({ x: 840, y: 352, w: 260, h: 32, name: 'nodePort', value: ':31000', cat: 'network' });

    const p1 = podBlock({ x: 130, y: 410, w: 200, h: 118, label: 'Pod web', ip: '10.244.1.5' });
    const p2 = podBlock({ x: 500, y: 410, w: 200, h: 118, label: 'Pod web', ip: '10.244.2.7' });

    const rangeChip = valChip({ x: 80,  y: 570, w: 320, h: 34, name: 'port range', value: '30000-32767', cat: 'network' });
    const vipChip   = valChip({ x: 420, y: 570, w: 320, h: 34, name: 'status.loadBalancer', value: 'pending', cat: 'network' });
    const chainChip = valChip({ x: 760, y: 570, w: 360, h: 34, name: 'chain', value: 'KUBE-NODEPORTS', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    root.appendChild(node1);
    root.appendChild(node2);
    root.appendChild(node3);
    [np1, np2, np3].forEach(c => root.appendChild(c));
    root.appendChild(p1.group);
    root.appendChild(p2.group);
    root.appendChild(client);
    root.appendChild(lb);
    root.appendChild(ccm);
    [cWire, provWire, fan1, fan2, fan3, cWireLabel].forEach(el => root.appendChild(el));
    [rangeChip, vipChip, chainChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, client, lb, ccm, node1, node2, node3,
      np1, np2, np3, pod1: p1.group, pod1Box: p1.innerBox, pod2: p2.group, pod2Box: p2.innerBox,
      rangeChip, vipChip, chainChip,
      packetLayer, wires: { c: cWireLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['client', 'lb', 'ccm', 'np1', 'np2', 'np3', 'rangeChip', 'vipChip', 'chainChip'], [s.refs.pod1, s.refs.pod2]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Pods live on a private cluster network, so traffic from outside cannot reach them directly. NodePort and LoadBalancer are the two built-in Service types that open a path in from the world, and LoadBalancer is really NodePort with a cloud front-end on top.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.vipChip, 'pending');
    },
  },
  {
    id: 'nodeport',
    duration: 2300,
    narration: 'A NodePort Service reserves the same high port, here 31000 out of the 30000 to 32767 range, on every Node in the cluster. kube-proxy adds a KUBE-NODEPORTS rule so a packet arriving on that port at any Node is treated as Service traffic, even on Nodes that run no backend Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.np1.classList.add('highlight');
      s.refs.np2.classList.add('highlight');
      s.refs.np3.classList.add('highlight');
      s.refs.chainChip.classList.add('highlight');
      // The same port opens on every Node; the chips just light, they never flash.
    },
  },
  {
    id: 'lb-provision',
    duration: 2400,
    narration: 'Asking for type LoadBalancer makes the cloud-controller-manager provision an external load balancer in the cloud, with its backends set to every Node on the nodePort. When the balancer is ready its address is written back into status.loadBalancer.ingress, giving clients one stable VIP.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.ccm.classList.add('highlight');
      s.refs.vipChip.classList.add('highlight');
      setVal(s.refs.vipChip, '203.0.113.7');
      if (ctx.reduced) { s.refs.lb.classList.add('highlight'); return; }
      // ccm provisions the LB: one clean hop, the LB lights on arrival.
      const prov = segmentPacket(s, ctx, { from: [800, 190], to: [750, 190], cat: 'network' });
      lightBoxAt(s.refs.lb, ctx, prov.arrivalMs);
    },
  },
  {
    id: 'client-hit',
    duration: 2400,
    narration: 'An external client connects to the load balancer VIP. The balancer forwards the connection to one of its Node targets on port 31000, spreading load across the Nodes without knowing or caring which of them actually hosts a backend Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'c', 'to 203.0.113.7');
      s.refs.client.classList.add('highlight');
      s.refs.lb.classList.add('highlight');
      s.refs.np1.classList.add('highlight');
      if (ctx.reduced) return;
      // client -> LB (down), then LB picks Node-1 along the right-angle fan; the nodePort lights.
      const toLb = segmentPacket(s, ctx, { from: [600, 120], to: [600, 150], cat: 'network' });
      const toNode = routePacket(s, ctx, TO_N1, { delay: toLb.arrivalMs + BEAT.afterHop, cat: 'network' });
      lightBoxAt(s.refs.np1, ctx, toNode.arrivalMs);
    },
  },
  {
    id: 'dnat',
    duration: 2400,
    narration: 'On the Node that received it, the nodePort rule DNATs the packet to a backend Pod IP, which may be on that same Node or, as here, reached through the cluster network on another Node. The Pod serves the request, and a single external address has reached a private Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'c', 'DNAT -> 10.244.1.5');
      s.refs.np1.classList.add('highlight');
      if (ctx.reduced) { s.refs.pod1Box.classList.add('highlight'); return; }
      // nodePort DNATs to the local backend Pod (one hop), which pulses on arrival.
      const toPod = segmentPacket(s, ctx, { from: [230, 384], to: [230, 410], cat: 'network' });
      pulsePod(s.refs.pod1, ctx, toPod.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
