import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, BEAT, lightBoxAt, makeRidingLabel } from '../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-nodeport-loadbalancer


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
function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, role: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 30, w: w - 40, h: 48, label: 'app', sublabel: 'eth0', role: 'network' });
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
      'aria-label': 'NodePort and LoadBalancer: a NodePort opens the same port on every Node and DNATs to a backing Pod, while a LoadBalancer has the cloud-controller-manager provision an external load balancer targeting those Node ports',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = box({ x: CX - CLIENT_W / 2, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H, label: 'External client', sublabel: '', role: 'network' });
    const lb     = box({ x: CX - LB_W / 2, y: LB_Y, w: LB_W, h: LB_H, label: 'Cloud LoadBalancer', sublabel: 'VIP 203.0.113.7', role: 'network' });
    const ccm    = box({ x: CCM_X, y: CCM_Y, w: CCM_W, h: CCM_H, label: 'cloud-controller-manager', sublabel: 'provisions the LB', role: 'network' });

    const cWire = arrow({ x1: C_TO_LB[0][0], y1: C_TO_LB[0][1], x2: C_TO_LB[1][0], y2: C_TO_LB[1][1], dashed: true, dim: true, role: 'network' });
    const provWire = arrow({ x1: PROVISION[0][0], y1: PROVISION[0][1], x2: PROVISION[1][0], y2: PROVISION[1][1], dashed: true, dim: true, role: 'network' });
    const fan1 = pathArrow({ points: TO_N1, dashed: true, dim: true, role: 'network' });
    const fan2 = pathArrow({ points: TO_N2, dashed: true, dim: true, role: 'network' });
    const fan3 = pathArrow({ points: TO_N3, dashed: true, dim: true, role: 'network' });
    const dnatWire = arrow({ x1: NP_TO_POD[0][0], y1: NP_TO_POD[0][1], x2: NP_TO_POD[1][0], y2: NP_TO_POD[1][1], dashed: true, dim: true, role: 'network' });
    const cWireLabel = text({ class: 'scheme-label code dim', x: CX + 60, y: LB_Y - 12, 'text-anchor': 'middle' }, [' ']);

    const node1 = node({ x: NODE_X[0], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });
    const node2 = node({ x: NODE_X[1], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' });
    const node3 = node({ x: NODE_X[2], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-3' });

    const np = (i) => valChip({ x: NODE_CX[i] - NP_W / 2, y: NP_Y, w: NP_W, h: NP_H, name: 'nodePort', value: ':31000', role: 'network' });
    const np1 = np(0), np2 = np(1), np3 = np(2);

    // Backends sit on the two outer Nodes, so the middle Node is the one that opens the port with no
    // Pod behind it, which is what the nodePort step narrates.
    const p1 = podBlock({ x: NODE_CX[0] - POD_W / 2, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.1.5' });
    const p2 = podBlock({ x: NODE_CX[2] - POD_W / 2, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.3.9' });

    const chip = (i, name, value) => valChip({ x: NODE_CX[i] - CHIP_W / 2, y: CHIP_Y, w: CHIP_W, h: CHIP_H, name, value, role: 'network' });
    const rangeChip = chip(0, 'port range', '30000-32767');
    const vipChip   = chip(1, 'status.loadBalancer', 'pending');
    const chainChip = chip(2, 'chain', 'KUBE-NODEPORTS');

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
    [cWire, provWire, fan1, fan2, fan3, dnatWire, cWireLabel].forEach(el => root.appendChild(el));
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
  // pod1Box is a key, not a pod group: the pod-group list only resets inline pulse strokes, so the
  // .highlight the client-hit step puts on the container never came off.
  clearHighlights(s, ['client', 'lb', 'ccm', 'np1', 'np2', 'np3', 'pod1Box', 'rangeChip', 'vipChip', 'chainChip'], [s.refs.pod1, s.refs.pod2]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
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
    narration: 'A NodePort Service reserves the same high port, here 31000 out of the 30000 to 32767 range, on every Node in the cluster. The kube-proxy adds a KUBE-NODEPORTS rule so a packet arriving on that port at any Node is treated as Service traffic, even on Nodes that run no backend Pod.',
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
      const prov = segmentPacket(s, ctx, { from: PROVISION[0], to: PROVISION[1], role: 'network' });
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
      s.refs.client.classList.add('highlight');
      // The client dials, so only the client is lit at entry. The balancer and the nodePort each
      // light as the connection reaches them, which is what makes the two hops read as one path.
      if (ctx.reduced) { s.refs.lb.classList.add('highlight'); s.refs.np1.classList.add('highlight'); return; }
      const toLb = segmentPacket(s, ctx, { from: C_TO_LB[0], to: C_TO_LB[1], role: 'network' });
      ridingLabel(s, ctx, 'to 203.0.113.7', C_TO_LB, { easing: 'linear' });
      lightBoxAt(s.refs.lb, ctx, toLb.arrivalMs);
      const fanDelay = toLb.arrivalMs + BEAT.afterHop;
      const toNode = routePacket(s, ctx, TO_N1, { delay: fanDelay, role: 'network' });
      ridingLabel(s, ctx, 'to node-1:31000', TO_N1, { delay: fanDelay, emerge: 150 });
      lightBoxAt(s.refs.np1, ctx, toNode.arrivalMs);
    },
  },
  {
    id: 'dnat',
    duration: 2400,
    narration: 'On the Node that received it, the nodePort rule DNATs the packet to a backend Pod IP. That Pod can sit on this same Node, as here, or on another Node reached across the cluster network, since kube-proxy load-balances across every backend. A single external address has now reached a private Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.np1.classList.add('highlight');
      if (ctx.reduced) { s.refs.pod1Box.classList.add('highlight'); return; }
      // nodePort DNATs to the local backend Pod (one hop), which pulses on arrival.
      const toPod = segmentPacket(s, ctx, { from: NP_TO_POD[0], to: NP_TO_POD[1], role: 'network' });
      pulsePod(s.refs.pod1, ctx, toPod.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
